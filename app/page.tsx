import Link from "next/link";
import { AccessibilityBar } from "@/shared/components/accessibility-bar";
import { SiteHeader } from "@/shared/components/site-header";
import { ArrowButton } from "@/shared/components/arrow-button";
import * as motion from "motion/react-client";
import { enter } from "@/shared/components/motion/enter";

const paths = [
  {
    id: "problem",
    href: "/zglos-problem",
    title: "Zgłoś problem",
    description: "Potrzebujesz wsparcia dla siebie lub innych?",
    detail: "Pomóż nam zrozumieć, czego brakuje.",
  },
  {
    id: "pomoc",
    href: "/zaoferuj-pomoc",
    title: "Zaoferuj pomoc",
    description: "Masz pomysł, doświadczenie lub gotowe rozwiązanie?",
    detail: "Podziel się tym, co może pomóc innym.",
  },
] as const;

export default function Home() {
  return (
    <div className="flex min-h-svh flex-col px-page py-10 max-sm:py-7.5">
      <AccessibilityBar />
      <SiteHeader>
        <div className="flex flex-wrap items-center justify-end gap-x-7.5 gap-y-2.5 max-sm:justify-start">
          <p className="text-caption font-medium tracking-label-sm uppercase">Innowacje społeczne dla Małopolski</p>
          {/* Demo shortcut to the institution panel. */}
          <Link className="text-body font-medium tracking-label text-primary uppercase no-underline" href="/admin">
            Kliknij tu aby wejść w admin panel
          </Link>
        </div>
      </SiteHeader>
      <main id="main-content" className="flex flex-1 flex-col justify-center gap-7.5 py-15 max-sm:py-10">
        <motion.p className="text-body font-medium tracking-label text-primary uppercase" {...enter(0)}>
          Mały krok. Wspólna zmiana.
        </motion.p>
        <motion.h1 className="font-heading text-display text-primary" {...enter(1, { y: 20 })}>
          Razem możemy więcej
        </motion.h1>
        <motion.p {...enter(2)}>
          Łączymy potrzeby mieszkańców z pomysłami i rozwiązaniami społecznymi.
          <br />
          Wybierz, jak chcesz działać.
        </motion.p>
        <div className="grid grid-cols-2 gap-10 pt-7.5 max-lg:gap-7.5 max-sm:grid-cols-1">
          {paths.map((path, index) => (
            <motion.section
              key={path.id}
              className="relative flex flex-col items-start gap-5 border-y border-line py-7.5"
              aria-labelledby={path.id}
              {...enter(3 + index, { y: 24 })}
            >
              <h2 id={path.id} className="font-heading text-section">
                {path.title}
              </h2>
              <p>
                {path.description}
                <br />
                {path.detail}
              </p>
              <div className="mt-auto pt-5">
                {/* The link stretches over the whole card, so the title and text are clickable too. */}
                <ArrowButton
                  href={path.href}
                  aria-label={`Rozpocznij — ${path.title.toLowerCase()}`}
                  className="after:absolute after:inset-0"
                >
                  Rozpocznij
                </ArrowButton>
              </div>
            </motion.section>
          ))}
        </div>
      </main>
      <motion.footer
        className="flex items-center justify-between gap-5 max-sm:flex-col max-sm:items-start max-sm:gap-2.5"
        {...enter(6, { y: 0 })}
      >
        <p className="text-caption">Platforma innowacji społecznych</p>
        <p className="text-caption font-medium tracking-caption uppercase">ROPS Kraków · Małopolska</p>
      </motion.footer>
    </div>
  );
}
