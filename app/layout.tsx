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
