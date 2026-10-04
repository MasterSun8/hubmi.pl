import type { Metadata } from "next";
import { BackLink } from "@/shared/components/back-link";
import { notFound } from "next/navigation";
import { getSolution, getInnovationComments } from "@/lib/server/solutions";
import { SiteHeader } from "@/shared/components/site-header";
import { InnovationComments } from "./components/comments";
import { PublicTesterForm } from "./components/public-tester-form";
import { InnovationDescription } from "./components/innovation-description";

export const metadata: Metadata = { title: "Baza wiedzy — Innowacje społeczne" };

function youtubeId(url: string) {
  try {
    const { hostname, pathname, searchParams } = new URL(url);
    if (hostname === "youtu.be") return pathname.slice(1) || null;
    if (hostname === "youtube.com" || hostname.endsWith(".youtube.com")) {
      return searchParams.get("v") ?? pathname.match(/\/(?:embed|shorts)\/([\w-]+)/)?.[1] ?? null;
    }
  } catch {}
  return null;
}
const labelClass = "text-caption font-medium tracking-label-sm text-primary uppercase";
const linkClass = "inline-flex min-h-11 items-center gap-2.5 text-primary underline underline-offset-4 break-words";

function materialLabel(url: string, index: number) {
  try {
    if (new URL(url).pathname.toLowerCase().endsWith(".zip")) return "Pakiet do wdrożenia (ZIP)";
  } catch {}
  return `Materiał do pobrania ${index + 1}`;
}

export default async function InnovationPage({ params }: PageProps<"/innowacje/[id]">) {
  const { id } = await params;
  const solution = await getSolution(id);
  if (!solution || solution.status !== "published") notFound();
  const comments = await getInnovationComments(id);
  const videoId = solution.videoUrls.map(youtubeId).find(Boolean) ?? null;
  const author = solution.authorName || solution.organization;

  return (
    <div className="flex min-h-svh flex-col gap-10 px-page py-10 max-sm:gap-7.5 max-sm:py-7.5">
      <SiteHeader><p className={labelClass}>Baza wiedzy</p></SiteHeader>
      <nav aria-label="Powrót">
        <BackLink href="/">Wróć na stronę główną</BackLink>
      </nav>
      <main id="main-content" className="flex flex-col gap-10 max-sm:gap-7.5">
        <header className="flex max-w-[70ch] flex-col gap-5">
          <p className={labelClass}>Innowacja społeczna</p>
          <h1 className="font-heading text-section text-primary text-balance">{solution.title}</h1>
          {author && <p className="text-primary">Autor: <span className="text-ink">{author}</span></p>}
          {solution.organization && solution.organization !== author && <p>{solution.organization}</p>}
        </header>
        <div className="grid grid-cols-[minmax(0,1fr)_minmax(280px,360px)] items-start gap-x-15 gap-y-10 max-lg:grid-cols-1">
          <div className="flex min-w-0 flex-col gap-10 max-sm:gap-7.5">
            {videoId && (
              <section className="flex flex-col gap-5 border-t border-line pt-7.5" aria-labelledby="video-title">
                <h2 id="video-title" className="font-light text-subtitle text-primary">Zobacz, jak to działa</h2>
                <figure className="relative m-0 aspect-video w-full overflow-hidden bg-ink">
                  <iframe className="absolute inset-0 size-full border-0" src={`https://www.youtube-nocookie.com/embed/${videoId}`}
                    title={`Film o innowacji: ${solution.title}`} loading="lazy"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
                </figure>
              </section>
            )}
            <InnovationDescription description={solution.description} />
            {solution.problem && <section className="flex flex-col gap-5 border-t border-line pt-7.5"><h2 className="font-light text-subtitle text-primary">Rozwiązywany problem</h2><p className="max-w-[65ch] whitespace-pre-wrap">{solution.problem}</p></section>}
            {solution.effectiveness && <section className="flex flex-col gap-5 border-t border-line pt-7.5"><h2 className="font-light text-subtitle text-primary">Efektywność i rezultaty</h2><p className="max-w-[65ch] whitespace-pre-wrap">{solution.effectiveness}</p></section>}
            <InnovationComments solutionId={id} initialComments={comments} />
          </div>
          <aside className="flex min-w-0 flex-col gap-10" aria-label="Odbiorcy, materiały i pilotaż">
            {(solution.targetGroups.length > 0 || solution.categories.length > 0) && (
              <section className="flex flex-col gap-5 border-t border-line pt-7.5">
                <h2 className="font-light text-subtitle text-primary">Dla kogo?</h2>
                {solution.targetGroups.length > 0 && <p>{solution.targetGroups.join(", ")}</p>}
                {solution.categories.length > 0 && <div className="flex flex-col gap-2.5"><h3 className={labelClass}>Tematy</h3><p>{solution.categories.join(" · ")}</p></div>}
              </section>
            )}
            {(solution.materialsUrls.length > 0 || solution.sourceUrl || solution.termsOfUseUrl) && (
              <section className="flex flex-col gap-5 border-t border-line pt-7.5" aria-labelledby="materials-title">
                <h2 id="materials-title" className="font-light text-subtitle text-primary">Materiały i źródło</h2>
                <ul className="m-0 flex list-none flex-col gap-2.5 p-0">
                  {solution.materialsUrls.map((url, index) => (
                    <li key={url}><a href={url} target="_blank" rel="noreferrer" className={linkClass}>
                      {materialLabel(url, index)}<span aria-hidden="true">↗</span>
                    </a></li>
                  ))}
                  {solution.termsOfUseUrl && <li><a className={linkClass} href={solution.termsOfUseUrl} target="_blank" rel="noreferrer">Zasady wykorzystania <span aria-hidden="true">↗</span></a></li>}
                  {solution.sourceUrl && <li><a className={linkClass} href={solution.sourceUrl} target="_blank" rel="noreferrer">Zobacz w bibliotece ROPS <span aria-hidden="true">↗</span></a></li>}
                </ul>
                <p className="text-caption text-muted">Linki otwierają się w nowej karcie.</p>
              </section>
            )}
            <PublicTesterForm solutionId={id} />
          </aside>
        </div>
      </main>
    </div>
  );
}
