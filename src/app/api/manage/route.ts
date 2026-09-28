import { revalidatePath } from "next/cache";
import { fail, ok, readJson, rpcFail } from "@/lib/http";
import { sbRpc } from "@/lib/supabase";

// Lets an idea's author remove it, using the private link from their confirmation email.
export async function POST(req: Request) {
  const body = await readJson<{ token?: string }>(req);
  const token = String(body.token || "");
  if (!/^[a-f0-9]{36}$/.test(token)) return fail("That link is not valid.", 404);
  try {
    const removed = await sbRpc<boolean>("wbyi_manage_remove", { p_token: token });
    if (!removed) return fail("This idea can’t be removed now. If it has already won, reply to our email and we’ll help.", 409);
    revalidatePath("/ideas");
    revalidatePath("/");
    return ok();
  } catch (err) {
    return rpcFail(err);
  }
}
