import Link from "next/link";
import type { ReactNode } from "react";
import { AccessibilityBar } from "./accessibility-bar";

export function SiteHeader({ children }: { children: ReactNode }) {
  return (
    <>
      <AccessibilityBar />
      <header className="flex items-center justify-between gap-5 max-sm:flex-col max-sm:items-start max-sm:gap-2.5 [&>:last-child:not(:first-child)]:max-lg:max-w-1/2 [&>:last-child:not(:first-child)]:max-lg:text-right max-sm:[&>:last-child:not(:first-child)]:max-w-none! max-sm:[&>:last-child:not(:first-child)]:text-left!">
        <Link className="text-title font-light text-primary no-underline" href="/" aria-label="Hubmi — strona główna">
          hubmi
        </Link>
        {children}
      </header>
    </>
  );
}
