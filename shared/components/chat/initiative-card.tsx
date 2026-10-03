"use client";

import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import { useEffect, useState } from "react";
import type { SolutionRef } from "@/types/chat";

const linkClass = "text-cta font-medium tracking-label text-primary uppercase no-underline";

type Media = { videoUrls: string[]; materialsUrls: string[] };

// YouTube video id from watch?v=, youtu.be/ and embed/ links.
function youtubeId(url: string) {
  try {
    const { hostname, pathname, searchParams } = new URL(url);
    if (hostname.endsWith("youtu.be")) return pathname.slice(1) || null;
    if (hostname.endsWith("youtube.com")) return searchParams.get("v") ?? pathname.match(/\/embed\/([\w-]+)/)?.[1] ?? null;
  } catch {}
  return null;
}

// Human label for a download: ROPS ships a PDF leaflet, a ZIP package and sometimes extra PDFs.
function materialLabel(url: string, index: number, urls: string[]) {
  const path = url.toLowerCase();
  if (path.endsWith(".zip")) return "Pakiet do wdrożenia (ZIP)";
  const firstPdf = urls.findIndex((item) => item.toLowerCase().endsWith(".pdf"));
  if (path.endsWith(".pdf")) return index === firstPdf ? "Opis innowacji (PDF)" : "Materiał dodatkowy (PDF)";
  return "Materiały";
}

// Thumbnail first, the player loads only after a click (no YouTube requests until the resident wants the film).
function VideoPreview({ id, title }: { id: string; title: string }) {
  const [playing, setPlaying] = useState(false);

  return (
    <div className="relative aspect-video w-full overflow-hidden bg-ink">
      {playing ? (
        <iframe
          className="absolute inset-0 size-full border-0"
          src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1`}
          title={`Film: ${title}`}
          allow="autoplay; encrypted-media; picture-in-picture"
          allowFullScreen
        />
      ) : (
        <button type="button" className="group absolute inset-0 size-full cursor-pointer border-0 bg-transparent p-0" onClick={() => setPlaying(true)}>
          <Image src={`https://i.ytimg.com/vi/${id}/hqdefault.jpg`} alt="" fill unoptimized sizes="444px" className="object-cover" />
          <span className="absolute inset-0 flex items-center justify-center bg-ink/30 transition-colors group-hover:bg-ink/10">
            <span className="flex size-15 items-center justify-center rounded-full bg-primary text-on-primary" aria-hidden="true">
              <svg className="ml-1 size-6" viewBox="0 0 24 24" fill="currentColor" focusable="false">
                <path d="M6 4l14 8-14 8z" />
              </svg>
            </span>
          </span>
          <span className="sr-only">Odtwórz film o inicjatywie {title}</span>
        </button>
      )}
    </div>
  );
}

// Figma 15:811 — a solution from the database (a RAG source) shown under the assistant's answer,
// with its film and ROPS materials (GET /api/solutions/[id]/media) when the library has them.
export function InitiativeCard({ solution, index = 0 }: { solution: SolutionRef; index?: number }) {
  const [media, setMedia] = useState<Media | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    fetch(`/api/solutions/${solution.id}/media`, { signal: controller.signal })
      .then((response) => (response.ok ? (response.json() as Promise<{ data: Media }>) : null))
      .then((body) => body && setMedia(body.data))
      .catch(() => {});
    return () => controller.abort();
  }, [solution.id]);

  const videoId = media?.videoUrls.map(youtubeId).find(Boolean) ?? null;
  const materials = media?.materialsUrls ?? [];

  return (
    <motion.article
      className="flex max-w-111 flex-col items-start gap-2.5 border border-line bg-surface p-5"
      aria-label={`Rozwiązanie z bazy: ${solution.title}`}
      initial={{ opacity: 0, y: 16, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, ease: [0.5, 0, 0.2, 1], delay: 0.1 + index * 0.08 }}
    >
      <p className="text-caption font-medium tracking-label-sm text-primary uppercase">Rozwiązanie z bazy</p>
      <h3 className="text-card-title font-light">{solution.title}</h3>
      <AnimatePresence initial={false}>
        {(videoId || materials.length > 0) && (
          <motion.div
            className="flex w-full flex-col gap-2.5 overflow-hidden"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            transition={{ duration: 0.4, ease: [0.5, 0, 0.2, 1] }}
          >
            {videoId && <VideoPreview id={videoId} title={solution.title} />}
            {materials.length > 0 && (
              <ul className="m-0 flex list-none flex-col gap-1 p-0" aria-label="Materiały do pobrania">
                {materials.map((url, i) => (
                  <li key={url}>
                    <a className="text-primary underline underline-offset-2" href={url} target="_blank" rel="noreferrer">
                      {materialLabel(url, i, materials)}
                      <span className="sr-only"> (otwiera się w nowej karcie)</span>
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </motion.div>
        )}
      </AnimatePresence>
      {solution.url && (
        <a className={linkClass} href={solution.url} target="_blank" rel="noreferrer">
          Zobacz inicjatywę <span aria-hidden="true">→</span>
          <span className="sr-only"> (otwiera się w nowej karcie)</span>
        </a>
      )}
    </motion.article>
  );
}
