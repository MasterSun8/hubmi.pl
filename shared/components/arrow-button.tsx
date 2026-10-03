import Link from "next/link";
import type { ComponentProps } from "react";

type ArrowButtonProps = {
  children: string;
  "aria-label"?: string;
  className?: string;
} & (
  | { href: string }
  | ({ href?: never } & Pick<ComponentProps<"button">, "type" | "onClick" | "disabled" | "form">)
);

const buttonClass =
  "inline-flex items-center gap-5 border-0 bg-transparent p-0 text-left text-cta font-medium tracking-label text-primary uppercase no-underline cursor-pointer transition-colors duration-350 motion-reduce:transition-none disabled:opacity-50";

function ArrowIcon() {
  return (
    <svg
      className="h-17.5 w-26.25 flex-none max-lg:h-10 max-lg:w-15"
      viewBox="0 0 105 70"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      {/* Geometry exported from Figma, with color supplied by the shared token. */}
      <path d="M35 69.5C54.0538 69.5 69.5 54.0538 69.5 35C69.5 15.9462 54.0538 0.5 35 0.5C15.9462 0.5 0.5 15.9462 0.5 35C0.5 54.0538 15.9462 69.5 35 69.5Z" stroke="currentColor" />
      <path d="M35 35H104M98 41L104 35L98 29" stroke="currentColor" />
    </svg>
  );
}

export function ArrowButton({ children, className, ...props }: ArrowButtonProps) {
  const classes = className ? `${buttonClass} ${className}` : buttonClass;
  const content = (
    <>
      <ArrowIcon />
      {/* Two-line labels such as "Przekaż\nzgłoszenie" keep the break from the design. */}
      <span className="whitespace-pre-line">{children}</span>
    </>
  );

  if (props.href !== undefined) {
    return (
      <Link className={classes} href={props.href} aria-label={props["aria-label"]}>
        {content}
      </Link>
    );
  }

  return (
    <button type="button" className={classes} {...props}>
      {content}
    </button>
  );
}
