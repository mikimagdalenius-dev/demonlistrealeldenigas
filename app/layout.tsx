import type { Metadata } from "next";
import { Navbar } from "@/components/navbar";
import "./globals.css";

export const metadata: Metadata = {
  title: "Private DemonList",
  description: "Private demonlist inspired by Pointercrate"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <div className="pc-side pc-side-left" aria-hidden="true" />
        <div className="pc-side pc-side-right" aria-hidden="true" />
        <div className="pc-page">
          <Navbar />
          <main className="pc-shell">{children}</main>
        </div>
      </body>
    </html>
  );
}
