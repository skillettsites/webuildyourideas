import Link from "next/link";

export default function NotFound() {
  return (
    <div className="px-5 py-28 text-center">
      <p className="text-[15px] font-semibold text-mute">404</p>
      <h1 className="display mt-2">This page isn’t built yet.</h1>
      <p className="lede mx-auto mt-5 max-w-[520px]">But if you think it should be, you know what to do.</p>
      <div className="mt-9 flex flex-col items-center justify-center gap-4 sm:flex-row">
        <Link href="/ideas/submit" className="btn btn-primary">
          Submit an idea
        </Link>
        <Link href="/" className="btn btn-secondary">
          Go home
        </Link>
      </div>
    </div>
  );
}
