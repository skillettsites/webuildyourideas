import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { SiteNav } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";
import { RevealObserver } from "@/components/RevealObserver";
import { GoogleAnalytics } from "@/components/GoogleAnalytics";
import { SITE_NAME, SITE_URL } from "@/lib/config";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });

const DESCRIPTION =
  "Share your idea for free and the community votes. Every Sunday we build the most-wanted idea, free. Or see your own website in seconds and go live from £12 a month.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "We Build Your Ideas: share an idea, we build the winner every week",
    template: `%s | ${SITE_NAME}`,
  },
  description: DESCRIPTION,
  applicationName: SITE_NAME,
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    locale: "en_GB",
    title: "Your idea. Built.",
    description: DESCRIPTION,
  },
  twitter: { card: "summary_large_image", title: "Your idea. Built.", description: DESCRIPTION },
  robots: { index: true, follow: true },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const org = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${SITE_URL}/#org`,
        name: SITE_NAME,
        url: SITE_URL,
        logo: `${SITE_URL}/icon.svg`,
        email: "hello@webuildyourideas.com",
        areaServed: "GB",
      },
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        url: SITE_URL,
        name: SITE_NAME,
        publisher: { "@id": `${SITE_URL}/#org` },
        inLanguage: "en-GB",
      },
    ],
  };
  return (
    <html lang="en-GB" className={inter.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(org) }} />
      </head>
      <body>
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-3 focus:z-[60] focus:rounded-full focus:bg-white focus:px-4 focus:py-2 focus:shadow">
          Skip to content
        </a>
        <SiteNav />
        <main id="main">{children}</main>
        <SiteFooter />
        <RevealObserver />
        <GoogleAnalytics />
      </body>
    </html>
  );
}
