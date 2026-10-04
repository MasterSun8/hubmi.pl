"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// Admin sections grouped by the modules of the ROPS challenge brief.
const groups = [
  { module: "Matchmaking społeczny", items: [{ label: "Zgłoszenia", href: "/admin/zgloszenia" }] },
  {
    module: "Zasobnik wiedzy",
    items: [
      { label: "Biblioteka innowacji", href: "/admin/inicjatywy" },
      { label: "Mapa wyzwań", href: "/admin/mapa-potrzeb" },
      { label: "Raporty i trendy", href: "/admin/raporty" },
    ],
  },
  {
    module: "Kreator pomysłów",
    items: [
      { label: "Pomysły", href: "/admin/inicjatywy/pomysly" },
      { label: "Nabory i wnioski", href: "/admin/nabory" },
    ],
  },
] as const;

const hrefs: string[] = groups.flatMap((group) => group.items.map((item) => item.href));

// The longest matching href wins, so /admin/inicjatywy/pomysly is not also "Biblioteka innowacji",
// while sub-pages (e.g. a submission's details) keep their section highlighted.
function currentHref(pathname: string) {
  return hrefs.filter((href) => pathname === href || pathname.startsWith(`${href}/`)).sort((a, b) => b.length - a.length)[0];
}

export function AdminNav() {
  const current = currentHref(usePathname());

  return (
    <nav aria-label="Panel Administratora" className="flex flex-col gap-7.5 max-lg:flex-row max-lg:flex-wrap max-lg:gap-x-10 max-lg:gap-y-5">
      {groups.map((group) => (
        <div key={group.module} className="flex flex-col gap-2.5">
          <p className="text-caption leading-tight font-medium tracking-label-sm text-primary uppercase">{group.module}</p>
          <ul className="m-0 flex list-none flex-col border-l border-line p-0">
            {group.items.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={item.href === current ? "page" : undefined}
                  className="-ml-px block border-l-2 border-transparent py-1.5 pl-4 text-ink no-underline aria-[current=page]:border-primary aria-[current=page]:font-medium aria-[current=page]:text-primary"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  );
}
