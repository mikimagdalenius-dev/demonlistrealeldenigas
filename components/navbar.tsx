"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

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
        <Link href="/" className="pc-logo" aria-label="Demonlist Eldenigas, home">
          <span className="pc-logo-text">Demonlist Eldenigas</span>
          <span className="pc-code" aria-hidden="true">
            <i /><i /><i /><i /><i />
          </span>
        </Link>

        <nav className="pc-tabs" aria-label="main navigation">
          {tabs.map((tab) => {
            const active = pathname === tab.href;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`pc-tab ${active ? "is-active" : ""}`}
                aria-current={active ? "page" : undefined}
              >
                {tab.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
