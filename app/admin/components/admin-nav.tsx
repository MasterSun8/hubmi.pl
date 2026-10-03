"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// Only the needs map is built so far; the other sections are listed as in Figma 15:818.
const items = [
  { label: "Mapa potrzeb", href: "/admin/mapa-potrzeb" },
  { label: "Zgłoszenia" },
  { label: "Inicjatywy" },
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
            aria-current={pathname === item.href ? "page" : undefined}
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
