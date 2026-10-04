"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// Sections without a screen yet are listed as in Figma 15:818, without a link.
const items = [
  { label: "Mapa potrzeb", href: "/admin/mapa-potrzeb" },
  { label: "Zgłoszenia", href: "/admin/zgloszenia" },
  { label: "Inicjatywy", href: "/admin/inicjatywy" },
  { label: "Raporty", href: "/admin/raporty" },
  { label: "Baza wiedzy" },
  { label: "Ustawienia" },
] as const;

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Panel instytucji" className="flex flex-col gap-7.5 max-lg:flex-row max-lg:flex-wrap max-lg:gap-x-5 max-lg:gap-y-2.5">
      {items.map((item) =>
        "href" in item ? (
          <Link
            key={item.label}
            href={item.href}
            // Sub-pages (e.g. a submission's details) keep their section highlighted.
            aria-current={pathname.startsWith(item.href) ? "page" : undefined}
            className="text-ink no-underline aria-[current=page]:font-medium aria-[current=page]:text-primary"
          >
            {item.label}
          </Link>
        ) : (
          <span key={item.label} className="text-muted" title="Wkrótce">
            {item.label}
          </span>
        ),
      )}
    </nav>
  );
}
