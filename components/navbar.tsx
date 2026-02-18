import Link from "next/link";

const links = [
  { href: "/", label: "Demonlist" },
  { href: "/submit", label: "Submit Demon" },
  { href: "/players", label: "Players" }
];

export function Navbar() {
  return (
    <header className="border-b border-zinc-800 bg-zinc-900/70">
      <nav className="mx-auto flex max-w-5xl gap-4 px-4 py-4">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="rounded-md px-3 py-1.5 text-sm font-medium text-zinc-200 transition hover:bg-zinc-800"
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
