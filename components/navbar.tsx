import Link from "next/link";

const links = [
  { href: "/", label: "Demonlist" },
  { href: "/submit", label: "Submit" },
  { href: "/players", label: "Players" }
];

export function Navbar() {
  return (
    <header className="border-b border-zinc-800 bg-black/70 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="h-2 w-2 rounded-full bg-red-500" />
          <span className="text-lg font-black uppercase tracking-wider text-zinc-100">
            Private Pointercrate
          </span>
        </div>

        <div className="flex gap-2">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-sm border border-zinc-800 px-3 py-1.5 text-sm font-semibold uppercase tracking-wide text-zinc-300 transition hover:border-red-500/60 hover:text-red-300"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </nav>
    </header>
  );
}
