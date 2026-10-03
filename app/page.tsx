import Link from "next/link";
import { AccessibilityBar } from "@/components/ui/accessibility-bar";
import { StartButton } from "@/components/ui/start-button";
import styles from "./page.module.css";

const paths = [
  {
    id: "problem",
    title: "Zgłoś problem",
    description: "Potrzebujesz wsparcia dla siebie lub innych?",
    detail: "Pomóż nam zrozumieć, czego brakuje.",
  },
  {
    id: "pomoc",
    title: "Zaoferuj pomoc",
    description: "Masz pomysł, doświadczenie lub gotowe rozwiązanie?",
    detail: "Podziel się tym, co może pomóc innym.",
  },
] as const;

export default function Home() {
  return (
    <div className={styles.page}>
      <AccessibilityBar />
      <header className={styles.header}>
        <Link className={styles.brand} href="/" aria-label="Hubmi — strona główna">
          hubmi-innovations.org
        </Link>
        <p className="hubmi-label hubmi-label--small">
          Innowacje społeczne dla Małopolski
        </p>
      </header>
      <main id="main-content" className={styles.main}>
        <p className="hubmi-label hubmi-accent">Mały krok. Wspólna zmiana.</p>
        <h1 className="hubmi-heading hubmi-heading--display hubmi-accent">
          Razem możemy więcej
        </h1>
        <p>
          Łączymy potrzeby mieszkańców z pomysłami i rozwiązaniami społecznymi.
          <br />
          Wybierz, jak chcesz działać.
        </p>
        <div className={styles.paths}>
          {paths.map((path) => (
            <section key={path.id} className={styles.path} aria-labelledby={path.id}>
              <h2 id={path.id} className="hubmi-heading hubmi-heading--section">
                {path.title}
              </h2>
              <p>
                {path.description}
                <br />
                {path.detail}
              </p>
              <div className={styles.action}>
                <StartButton label={`Rozpocznij — ${path.title.toLowerCase()}`} />
              </div>
            </section>
          ))}
        </div>
      </main>
      <footer className={styles.footer}>
        <p className="hubmi-caption">Platforma innowacji społecznych</p>
        <p className={styles.partner}>ROPS Kraków · Małopolska</p>
      </footer>
    </div>
  );
}
