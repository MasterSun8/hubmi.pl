import Link from "next/link";

// The one "← back" link style used on every page (public and admin).
export function BackLink({ href, children }: { href: string; children: string }) {
  return (
    <Link className="self-start text-caption font-medium tracking-label-sm text-ink uppercase no-underline" href={href}>
      <span aria-hidden="true">←</span> {children}
    </Link>
  );
}
