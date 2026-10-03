import type { Metadata } from "next";
import Link from "next/link";
import { AdminNav } from "./components/admin-nav";

export const metadata: Metadata = {
  title: "Panel instytucji — Hubmi",
  robots: { index: false, follow: false },
};

// Figma 15:817 — fixed sidebar (15:818) next to the working area.
export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return (
    <div className="flex min-h-svh max-lg:flex-col">
      <aside className="flex w-57.5 flex-none flex-col gap-7.5 border-r border-line bg-surface px-7.5 py-10 max-lg:w-auto max-lg:border-r-0 max-lg:border-b max-lg:px-5 max-lg:py-5">
        <Link className="text-title font-light text-primary no-underline" href="/" aria-label="Hubmi — strona główna">
          hubmi.pl
        </Link>
        <p className="text-caption font-medium tracking-label-sm uppercase">Panel instytucji</p>
        <AdminNav />
      </aside>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
