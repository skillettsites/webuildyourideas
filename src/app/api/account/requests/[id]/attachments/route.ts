import { currentClientId } from "@/lib/clients";
import { fail, ok } from "@/lib/http";
import { isUuid } from "@/lib/security";
import { storeUpload } from "@/lib/team";

// One file per call: Vercel caps a request body at 4.5 MB, so the browser sends files one by one.
export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const clientId = await currentClientId();
  if (!clientId) return fail("Please sign in again.", 401);
  const { id } = await ctx.params;
  if (!isUuid(id)) return fail("We couldn’t find that request.", 404);
  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  const messageId = String(form?.get("messageId") || "");
  if (!(file instanceof File)) return fail("No file received.");
  try {
    const res = await storeUpload(file, id, clientId, isUuid(messageId) ? messageId : null);
    if (res.error) return fail(res.error);
    return ok({ id: res.id });
  } catch (err) {
    console.error("upload failed", err);
    return fail("That file didn’t upload. Please try again.", 500);
  }
}
