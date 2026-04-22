import type { Metadata, Viewport } from "next";
import { Navbar } from "@/components/navbar";
import "./globals.css";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://demonlist-eldenigas.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Demonlist Eldenigas",
    template: "%s · Demonlist Eldenigas",
  },
  description: "Private demonlist inspired by Pointercrate",
  applicationName: "Demonlist",
  openGraph: {
    title: "Demonlist Eldenigas",
    description: "Private demonlist inspired by Pointercrate",
    url: siteUrl,
    siteName: "Demonlist Eldenigas",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Demonlist Eldenigas",
    description: "Private demonlist inspired by Pointercrate",
  },
  robots: { index: false, follow: false },
  appleWebApp: {
    capable: true,
    title: "Demonlist",
    statusBarStyle: "black-translucent",
  },
};

export const viewport: Viewport = {
  themeColor: "#1f2430",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script dangerouslySetInnerHTML={{ __html: `(function(){try{var t=localStorage.getItem('theme');if(t)document.documentElement.setAttribute('data-theme',t);}catch(e){}})();` }} />
      </head>
      <body>
        <div className="pc-page">
          <Navbar />
          <main className="pc-shell">{children}</main>
          <span className="fixed bottom-3 left-4 select-none pointer-events-none" style={{ color: "#b0b7c3", fontSize: 13 }}>
            by @miki.ls
          </span>
        </div>
      </body>
    </html>
  );
}
