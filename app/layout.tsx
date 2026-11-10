import type { Metadata, Viewport } from "next";
import { Archivo } from "next/font/google";
import { Navbar } from "@/components/navbar";
import "./globals.css";

const archivo = Archivo({
  subsets: ["latin"],
  axes: ["wdth"],
  variable: "--font-archivo",
  display: "swap",
});

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
  themeColor: "#0a0a0a",
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
    <html lang="en" className={archivo.variable}>
      <body>
        <div className="pc-page">
          <Navbar />
          <main className="pc-shell">{children}</main>
          <footer className="pc-footer pc-caps">by @miki.ls</footer>
        </div>
      </body>
    </html>
  );
}
