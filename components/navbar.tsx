import Link from "next/link";

const links = [
  { href: "/", label: "Main List" },
  { href: "/submit", label: "Submit Record" },
  { href: "/players", label: "Players" }
];

export function Navbar() {
  return (
    <header className="pc-topbar">
      <div className="pc-nav-wrap">
        <div className="pc-nav-main">
          <div className="pc-logo">
            POINTERCRATE<span className="pc-logo-dot">.COM</span>
          </div>

          <nav className="pc-nav-links">
            {links.map((link) => (
              <Link key={link.href} href={link.href} className="pc-nav-link">
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="pc-tabs" role="tablist" aria-label="list sections">
          <div className="pc-tab">Main List</div>
          <div className="pc-tab">Extended List</div>
          <div className="pc-tab">Legacy List</div>
        </div>
      </div>
    </header>
  );
}
