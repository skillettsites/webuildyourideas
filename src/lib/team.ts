import "server-only";
import { ALLOWED_MIME, MAX_FILE_BYTES, cleanFilename, getRequest, type RequestStatus } from "./clients";
import { SITE_URL } from "./config";
import { sendRequestUpdate } from "./email";
import type { RequestSize } from "./plans";
import { sbRpc } from "./supabase";

// One place for the team side of a request, shared by /admin and the agent API.
export async function teamUpdate(input: {
  requestId: string;
  status?: RequestStatus | null;
  size?: RequestSize | null;
  message?: string | null;
  notify?: boolean;
  updateTitle?: string | null;
}): Promise<{ ok: boolean; error?: string; emailed?: boolean }> {
  const before = await getRequest(null, input.requestId);
  if (!before) return { ok: false, error: "not_found" };
  const r = before.request;
  const message = (input.message || "").trim();

  if (message) await sbRpc("wbyi_request_reply", { p_client_id: null, p_request_id: r.id, p_body: message });
  if (input.status || input.size) {
    await sbRpc("wbyi_admin_request_update", { p_request_id: r.id, p_status: input.status ?? null, p_size: input.size ?? null });
  }
  const statusChanged = Boolean(input.status && input.status !== r.status);

  // A finished request shows up in the client's "Recent updates" feed.
  if (statusChanged && input.status === "done") {
    await sbRpc("wbyi_admin_update_post", {
      p_client_id: r.client.id,
      p_site_id: r.site_id,
      p_request_id: r.id,
      p_title: (input.updateTitle || r.title).trim(),
      p_body: message || null,
      p_at: null,
    });
  }

  let emailed = false;
  if (input.notify !== false && (message || (statusChanged && input.status !== "new"))) {
    const res = await sendRequestUpdate({
      to: r.client.email,
      name: r.client.name,
      ref: r.ref,
      title: r.title,
      url: `${SITE_URL}/account/requests/${r.id}`,
      status: statusChanged ? input.status ?? undefined : undefined,
      message: message || undefined,
    });
    emailed = res.sent;
  }
  return { ok: true, emailed };
}

// Reads one uploaded file from a multipart form and stores it against a request.
export async function storeUpload(file: File, requestId: string, clientId: string | null, messageId: string | null): Promise<{ id?: string; error?: string }> {
  const mime = file.type || "application/octet-stream";
  if (!ALLOWED_MIME[mime]) return { error: "That type of file can’t be attached. Screenshots, photos, PDFs, Word, Excel and short videos are fine." };
  if (file.size > MAX_FILE_BYTES) return { error: "That file is over 4 MB. For bigger files, share a link (Google Drive, WeTransfer) in the message instead." };
  const data = Buffer.from(await file.arrayBuffer()).toString("base64");
  const id = await sbRpc<string>("wbyi_attachment_add", {
    p_client_id: clientId,
    p_request_id: requestId,
    p_message_id: messageId,
    p_filename: cleanFilename(file.name || `file.${ALLOWED_MIME[mime]}`),
    p_mime: mime,
    p_data: data,
  });
  return { id };
}

// Streams a stored file back. Images and PDFs open inline; anything else downloads.
export async function attachmentResponse(clientId: string | null, attachmentId: string): Promise<Response> {
  const rows = await sbRpc<{ out_filename: string; out_mime: string; out_data: string }[]>("wbyi_attachment_get", {
    p_client_id: clientId,
    p_attachment_id: attachmentId,
  });
  const f = rows?.[0];
  if (!f) return new Response("Not found", { status: 404 });
  const inline = /^image\/(png|jpeg|webp|gif)$|^application\/pdf$/.test(f.out_mime);
  const name = f.out_filename.replace(/"/g, "");
  return new Response(Buffer.from(f.out_data, "base64"), {
    headers: {
      "content-type": f.out_mime,
      "content-disposition": `${inline ? "inline" : "attachment"}; filename="${name}"`,
      "cache-control": "private, max-age=3600",
      "x-content-type-options": "nosniff",
      "content-security-policy": "default-src 'none'; img-src 'self' data:; style-src 'unsafe-inline'; sandbox",
    },
  });
}
