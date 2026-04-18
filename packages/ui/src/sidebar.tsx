import Link from "next/link";

const links = [
  { href: "/dashboard", label: "Dashboard", icon: "D" },
  { href: "/tasks", label: "Tasks", icon: "T" },
  { href: "/notes", label: "Notes", icon: "N" },
  { href: "/planner", label: "Planner", icon: "P" },
  { href: "/internships", label: "Internships", icon: "I" },
  { href: "/groups", label: "Groups", icon: "G" },
] as const;

export function Sidebar() {
  return (
    <aside className="hidden w-56 shrink-0 md:block">
      <nav className="sticky top-24 space-y-2 rounded-[1.35rem] border border-[#d9e0f4] bg-white p-3.5 shadow-sm">
        {links.map((l) => (
          <div key={l.href} className="group relative">
            <Link
              href={l.href}
              className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-[#485178] transition duration-200 hover:-translate-y-0.5 hover:bg-[#c7fff1] hover:text-[#1f2454] hover:shadow"
            >
              <span className="inline-flex h-5 w-5 items-center justify-center rounded-md border border-[#c8d0ea] bg-white text-[10px] font-semibold text-[#2b3269]">
                {l.icon}
              </span>
              {l.label}
            </Link>
            <span className="pointer-events-none absolute left-[calc(100%+10px)] top-1/2 hidden -translate-y-1/2 whitespace-nowrap rounded-lg bg-[#202654] px-2 py-1 text-xs font-medium text-white shadow-lg group-hover:block">
              Open {l.label}
            </span>
          </div>
        ))}
      </nav>
    </aside>
  );
}
