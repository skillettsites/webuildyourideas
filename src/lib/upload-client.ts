"use client";

const MAX = 4_000_000;

// Phone photos are often 4-8 MB. Shrink big images to 2400px JPEG before upload, which keeps
// screenshots readable and gets every photo under the 4 MB limit.
async function shrinkImage(file: File): Promise<File> {
  if (!/^image\/(jpeg|png|webp)$/.test(file.type) || file.size < 1_500_000) return file;
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, 2400 / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext("2d")?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    const blob: Blob | null = await new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.86));
    if (!blob || blob.size >= file.size) return file;
    return new File([blob], file.name.replace(/\.(png|webp|jpe?g)$/i, "") + ".jpg", { type: "image/jpeg" });
  } catch {
    return file;
  }
}

export async function uploadFiles(
  requestId: string,
  files: File[],
  messageId?: string,
  onProgress?: (done: number, total: number) => void,
): Promise<string[]> {
  const errors: string[] = [];
  let done = 0;
  for (const original of files) {
    const file = await shrinkImage(original);
    if (file.size > MAX) {
      errors.push(`${original.name} is over 4 MB. Please share a link to it instead.`);
    } else {
      const form = new FormData();
      form.set("file", file);
      if (messageId) form.set("messageId", messageId);
      try {
        const res = await fetch(`/api/account/requests/${requestId}/attachments`, { method: "POST", body: form });
        const data = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };
        if (!res.ok || !data.ok) errors.push(`${original.name}: ${data.error || "didn’t upload"}`);
      } catch {
        errors.push(`${original.name}: didn’t upload`);
      }
    }
    done++;
    onProgress?.(done, files.length);
  }
  return errors;
}

export function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${Math.round(n / 1024)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}
