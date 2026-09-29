import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { LoginForm } from "@/components/account/LoginForm";
import { currentClientId } from "@/lib/clients";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to your We Build Your Ideas account to request changes to your website and follow their progress.",
  robots: { index: false, follow: true },
};

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ expired?: string; out?: string }> }) {
  if (await currentClientId()) redirect("/account");
  const { expired, out } = await searchParams;
  const notice = expired ? "That sign-in link has expired or was already used. Enter your email for a new one." : out ? "You’re signed out." : undefined;
  return (
    <div className="bg-cloud px-5 pb-24 pt-14 md:pt-20">
      <div className="mx-auto max-w-[440px]">
        <h1 className="headline rise text-center">Sign in.</h1>
        <p className="lede rise rise-1 mt-3 text-center">Request changes to your website and see how they’re going.</p>
        <div className="rise rise-2 mt-10">
          <LoginForm notice={notice} />
        </div>
        <p className="mt-8 text-center text-[14px] text-mute">
          Not a client yet?{" "}
          <Link href="/start" className="text-link hover:underline">
            See your website in seconds
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
