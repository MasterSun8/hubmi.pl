import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getSolution, getInnovationComments } from "@/lib/server/solutions";
import { InnovationComments } from "./components/comments";
import { PublicTesterForm } from "./components/public-tester-form";

export const metadata: Metadata = {
  title: "Baza Wiedzy — Innowacje Społeczne",
};

function youtubeId(url: string) {
  try {
    const { hostname, pathname, searchParams } = new URL(url);
    if (hostname.endsWith("youtu.be")) return pathname.slice(1) || null;
    if (hostname.endsWith("youtube.com")) return searchParams.get("v") ?? pathname.match(/\/embed\/([\w-]+)/)?.[1] ?? null;
  } catch {}
  return null;
}

export default async function InnovationPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const { id } = params;

  const solution = await getSolution(id);
  
  if (!solution || solution.status !== "published") {
    notFound();
  }

  const comments = await getInnovationComments(id);
  const videoId = solution.videoUrls.map(youtubeId).find(Boolean) ?? null;

  return (
    <main className="mx-auto max-w-5xl p-10 max-sm:p-5 flex flex-col gap-10">
      <nav>
        <Link href="/" className="text-primary font-medium tracking-label hover:underline">
          <span aria-hidden="true">←</span> Wróć do strony głównej
        </Link>
      </nav>

      <header className="flex flex-col gap-4">
        <p className="text-caption font-medium tracking-label-sm text-primary uppercase">Baza Innowacji Społeczych</p>
        <h1 className="font-heading text-display text-ink">{solution.title}</h1>
        {solution.authorName && (
          <p className="text-lg text-muted">
            Autor: <span className="font-semibold text-ink">{solution.authorName}</span>
            {solution.organization && ` (${solution.organization})`}
          </p>
        )}
      </header>

      {videoId && (
        <figure className="relative aspect-video w-full max-w-3xl overflow-hidden bg-ink rounded-lg shadow-sm">
          <iframe
            className="absolute inset-0 size-full border-0"
            src={`https://www.youtube-nocookie.com/embed/${videoId}`}
            title={`Film o innowacji: ${solution.title}`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </figure>
      )}

      <div className="grid grid-cols-[minmax(0,1fr)_350px] gap-10 items-start max-md:grid-cols-1">
        {/* Lewa kolumna: Opis innowacji */}
        <section className="flex flex-col gap-6 text-base text-ink">
          <div>
            <h2 className="font-heading text-xl text-primary mb-2">Opis innowacji</h2>
            <p className="leading-relaxed">{solution.description}</p>
          </div>
          
          {solution.problem && (
            <div>
              <h2 className="font-heading text-xl text-primary mb-2">Rozwiązywany problem</h2>
              <p className="leading-relaxed">{solution.problem}</p>
            </div>
          )}

          {solution.effectiveness && (
            <div>
              <h2 className="font-heading text-xl text-primary mb-2">Efektywność i rezultaty</h2>
              <p className="leading-relaxed">{solution.effectiveness}</p>
            </div>
          )}
          
          <hr className="border-t border-line my-4" />
          
          <InnovationComments solutionId={id} initialComments={comments} />
        </section>

        {/* Prawa kolumna: Metadane i pliki */}
        <aside className="flex flex-col gap-6 bg-surface p-6 rounded-lg border border-line">
          {solution.categories.length > 0 && (
            <div className="flex flex-col gap-2">
              <h3 className="text-caption font-bold text-muted uppercase">Kategorie</h3>
              <div className="flex flex-wrap gap-2">
                {solution.categories.map((cat) => (
                  <span key={cat} className="bg-white border border-field px-3 py-1 rounded-full text-xs font-medium">
                    {cat}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          {solution.targetGroups.length > 0 && (
            <div className="flex flex-col gap-2">
              <h3 className="text-caption font-bold text-muted uppercase">Odbiorcy</h3>
              <p className="text-sm font-medium">{solution.targetGroups.join(", ")}</p>
            </div>
          )}

          {solution.materialsUrls.length > 0 && (
            <div className="flex flex-col gap-2 pt-4 border-t border-line">
              <h3 className="text-caption font-bold text-muted uppercase">Materiały do pobrania</h3>
              <ul className="flex flex-col gap-2 list-none p-0 m-0">
                {solution.materialsUrls.map((url, i) => {
                  const isZip = url.toLowerCase().endsWith(".zip");
                  return (
                    <li key={url}>
                      <a href={url} target="_blank" rel="noreferrer" className="text-primary hover:underline text-sm font-medium flex items-center gap-2">
                        {isZip ? "📦 Pakiet do wdrożenia (ZIP)" : `📄 Materiał PDF ${i + 1}`}
                      </a>
                    </li>
                  )
                })}
              </ul>
            </div>
          )}
          
          <div className="pt-4 border-t border-line">
            <PublicTesterForm solutionId={id} />
          </div>
        </aside>
      </div>
    </main>
  );
}
