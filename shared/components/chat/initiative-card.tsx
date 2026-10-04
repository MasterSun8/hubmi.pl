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

function TesterForm({ solutionId, onClose }: { solutionId: string; onClose: () => void }) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const payload = Object.fromEntries(fd.entries());
    payload.solutionId = solutionId;

    try {
      const res = await fetch("/api/innovation-testers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }).then(r => r.json());
      
      if (res.success) {
        setSuccess(true);
      } else {
        alert("Błąd: " + res.error);
      }
    } catch (err) {
      alert("Wystąpił błąd sieci");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="mt-2 bg-success/10 text-success p-3 rounded text-sm font-medium">
        Dziękujemy! Twoje zgłoszenie zostało wysłane do ROPS.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-3 flex flex-col gap-4 p-5 border border-line bg-surface rounded w-full">
      <h4 className="font-heading text-lg text-primary">Zgłoś chęć pilotażu</h4>
      
      <label className="flex min-h-10.5 items-center rounded-input border border-field px-5 transition-colors focus-within:border-primary">
        <input name="fullName" required placeholder="Imię i nazwisko" className="min-w-0 flex-1 bg-transparent py-2 text-ink placeholder:text-muted focus:outline-none" />
      </label>
      
      <label className="flex min-h-10.5 items-center rounded-input border border-field px-5 transition-colors focus-within:border-primary">
        <input name="email" type="email" required placeholder="Adres e-mail" className="min-w-0 flex-1 bg-transparent py-2 text-ink placeholder:text-muted focus:outline-none" />
      </label>
      
      <label className="flex min-h-10.5 items-center rounded-input border border-field px-5 transition-colors focus-within:border-primary">
        <input name="organization" placeholder="Organizacja / Samorząd (opcjonalnie)" className="min-w-0 flex-1 bg-transparent py-2 text-ink placeholder:text-muted focus:outline-none" />
      </label>
      
      <label className="flex items-start rounded-input border border-field px-5 py-2.5 transition-colors focus-within:border-primary">
        <textarea name="motivation" placeholder="Dlaczego chcesz przetestować to rozwiązanie?" rows={3} className="min-w-0 flex-1 bg-transparent text-ink placeholder:text-muted focus:outline-none resize-none" />
      </label>

      <div className="flex gap-4 justify-end mt-2">
        <button type="button" onClick={onClose} className="px-5 py-2.5 text-muted hover:text-ink font-medium cursor-pointer transition-colors bg-transparent border-0">
          Anuluj
        </button>
        <button type="submit" disabled={loading} className="rounded-button bg-primary px-5 py-2.5 font-medium text-on-primary transition-colors hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-50 cursor-pointer border-0">
          {loading ? "Wysyłanie..." : "Wyślij zgłoszenie"}
        </button>
      </div>
    </form>
  );
}

// Figma 15:811 — a solution from the database (a RAG source) shown under the assistant's answer,
// with its film and ROPS materials (GET /api/solutions/[id]/media) when the library has them.
export function InitiativeCard({ solution, index = 0 }: { solution: SolutionRef; index?: number }) {
  const [media, setMedia] = useState<Media | null>(null);
  const [showTesterForm, setShowTesterForm] = useState(false);

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
      <div className="flex w-full items-center justify-between gap-4 flex-wrap">
        <a className={linkClass} href={`/innowacje/${solution.id}`} target="_blank" rel="noreferrer">
          Zobacz stronę innowacji <span aria-hidden="true">→</span>
        </a>
        <button 
          onClick={() => setShowTesterForm(!showTesterForm)}
          className="text-primary font-medium text-sm hover:underline cursor-pointer bg-transparent border-0 p-0"
        >
          Zgłoś się do testowania
        </button>
      </div>

      <AnimatePresence>
        {showTesterForm && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }} 
            animate={{ opacity: 1, height: "auto" }} 
            exit={{ opacity: 0, height: 0 }} 
            className="w-full overflow-hidden"
          >
            <TesterForm solutionId={solution.id} onClose={() => setShowTesterForm(false)} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.article>
  );
}
