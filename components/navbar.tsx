"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "/", label: "Main List" },
  { href: "/submit", label: "Submit" },
  { href: "/players", label: "Players" }
];

export function Navbar() {
  const pathname = usePathname();

  return (
    <header className="pc-topbar">
      <div className="pc-nav-wrap">
        <div className="pc-nav-main">
          <div className="pc-logo">DEMONLIST ELDENIGAS</div>
        </div>

        <nav className="pc-tabs" aria-label="main navigation">
          {tabs.map((tab) => {
            const active = pathname === tab.href;
            return (
              <Link key={tab.href} href={tab.href} className={`pc-tab ${active ? "is-active" : ""}`}>
                {tab.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
