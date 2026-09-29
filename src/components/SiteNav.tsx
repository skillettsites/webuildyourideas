"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Logo } from "./Logo";

const LINKS = [
  { href: "/ideas", label: "This week" },
  { href: "/built", label: "Built" },
  { href: "/start", label: "Get a website" },
  { href: "/how-it-works", label: "How it works" },
  { href: "/pricing", label: "Pricing" },
];

export function SiteNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => setSignedIn(/(?:^|; )wbyi_in=1/.test(document.cookie)), [pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const active = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header
      className={`sticky top-0 z-50 transition-[background-color,border-color] duration-300 ${
        scrolled || open ? "glass border-b border-black/[0.08]" : "border-b border-transparent bg-white/0"
      }`}
    >
      <nav className="mx-auto flex h-[52px] max-w-[1080px] items-center justify-between px-5" aria-label="Main">
        <Link href="/" className="shrink-0" aria-label="We Build Your Ideas, home">
          <Logo />
        </Link>
        <ul className="hidden items-center gap-7 md:flex">
          {LINKS.map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                className={`text-[13px] tracking-[-0.01em] transition-colors ${active(l.href) ? "text-ink" : "text-ink/75 hover:text-ink"}`}
                aria-current={active(l.href) ? "page" : undefined}
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
        <div className="flex items-center gap-2">
          <Link
            href={signedIn ? "/account" : "/login"}
            className={`hidden px-2 text-[13px] tracking-[-0.01em] transition-colors md:inline ${active("/login") || active("/account") ? "text-ink" : "text-ink/75 hover:text-ink"}`}
          >
            {signedIn ? "Your account" : "Sign in"}
          </Link>
          <Link href="/ideas/submit" className="btn btn-primary btn-sm hidden sm:inline-flex">
            Submit an idea
          </Link>
          <button
            type="button"
            className="-mr-2 grid h-10 w-10 place-items-center md:hidden"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            <span className="relative block h-3 w-[18px]">
              <span
                className={`absolute left-0 h-[1.5px] w-full bg-ink transition-transform duration-300 ${open ? "top-[5px] rotate-45" : "top-0"}`}
              />
              <span
                className={`absolute left-0 h-[1.5px] w-full bg-ink transition-transform duration-300 ${open ? "top-[5px] -rotate-45" : "top-[10px]"}`}
              />
            </span>
          </button>
        </div>
      </nav>
      <div
        className={`fixed inset-x-0 top-[52px] bottom-0 overflow-y-auto bg-white px-8 pt-6 transition-[opacity,visibility] duration-300 md:hidden ${
          open ? "visible opacity-100" : "invisible opacity-0"
        }`}
      >
        <ul className="space-y-1">
          {[{ href: "/", label: "Home" }, ...LINKS, signedIn ? { href: "/account", label: "Your account" } : { href: "/login", label: "Sign in" }].map((l, i) => (
            <li key={l.href} style={{ transitionDelay: open ? `${i * 30}ms` : "0ms" }} className={`transition-all duration-500 ${open ? "translate-y-0 opacity-100" : "-translate-y-2 opacity-0"}`}>
              <Link href={l.href} className="block py-2.5 text-[28px] font-semibold tracking-[-0.03em] text-ink">
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
        <Link href="/ideas/submit" className="btn btn-primary mt-8 w-full">
          Submit an idea
        </Link>
      </div>
    </header>
  );
}
