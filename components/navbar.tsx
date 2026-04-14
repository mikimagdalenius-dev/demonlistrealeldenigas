"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "./theme-toggle";

const tabs = [
  { href: "/", label: "Main List" },
  { href: "/players", label: "Players" },
  { href: "/submit", label: "Submit" }
];

export function Navbar() {
  const pathname = usePathname();

  return (
    <header className="pc-topbar">
      <div className="pc-nav-wrap">
        <div className="pc-nav-main">
          <div className="pc-logo">DEMONLIST ELDENIGAS</div>
          <div className="pc-theme-wrap">
            <ThemeToggle />
          </div>
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
