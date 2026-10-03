import Link from "next/link";
import type { ReactNode } from "react";

export function SiteHeader({ children }: { children: ReactNode }) {
  return (
    <header className="flex items-center justify-between gap-5 [&>:last-child:not(:first-child)]:max-lg:max-w-1/2 [&>:last-child:not(:first-child)]:max-lg:text-right">
      <Link className="text-title font-light text-primary no-underline" href="/" aria-label="Hubmi — strona główna">
        hubmi-innovations.org
      </Link>
      {children}
    </header>
  );
}
