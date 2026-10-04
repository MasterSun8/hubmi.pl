"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowButton } from "@/shared/components/arrow-button";

type CommentRow = {
  id: string;
  authorName: string;
  content: string;
  createdAt: Date;
};

export function InnovationComments({ solutionId, initialComments }: { solutionId: string; initialComments: CommentRow[] }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const form = e.currentTarget;
    const fd = new FormData(form);
    const payload = Object.fromEntries(fd.entries());

    try {
      const res = await fetch(`/api/solutions/${solutionId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }).then(r => r.json());
      
      if (res.success) {
        form.reset();
        router.refresh();
      } else {
        alert("Błąd: " + res.error);
      }
    } catch {
      alert("Wystąpił błąd sieci");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="flex w-full flex-col gap-7.5 border-t border-line pt-7.5" aria-labelledby="discussion-title">
      <div className="flex flex-col gap-2.5">
        <h2 id="discussion-title" className="font-light text-subtitle text-primary">Dyskusja <span className="text-muted">({initialComments.length})</span></h2>
        <p className="text-muted">Podziel się doświadczeniem lub zapytaj o wdrożenie tej innowacji.</p>
      </div>
      <div className="flex flex-col gap-5">
        {initialComments.length === 0 ? <p className="text-muted">Nie ma jeszcze komentarzy. Możesz rozpocząć rozmowę.</p> : initialComments.map(comment => (
          <article key={comment.id} className="flex flex-col gap-2.5 border-b border-line pb-5">
            <div className="flex flex-wrap items-baseline justify-between gap-2.5">
              <h3 className="font-medium">{comment.authorName}</h3>
              <time className="text-caption text-muted" dateTime={new Date(comment.createdAt).toISOString()}>{new Date(comment.createdAt).toLocaleDateString("pl-PL")}</time>
            </div>
            <p className="whitespace-pre-wrap break-words">{comment.content}</p>
          </article>
        ))}
      </div>
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <h3 className="text-caption font-medium tracking-label-sm text-primary uppercase">Dodaj komentarz</h3>
        <label className="flex flex-col gap-2.5">
          <span>Imię lub pseudonim</span>
          <input name="authorName" required autoComplete="nickname" className="min-h-11 w-full rounded-input border border-field bg-surface px-5 py-2.5 text-ink" />
        </label>
        <label className="flex flex-col gap-2.5">
          <span>Twój komentarz</span>
          <textarea name="content" required rows={4} className="w-full resize-y rounded-input border border-field bg-surface px-5 py-2.5 text-ink" />
        </label>
        <div><ArrowButton type="submit" disabled={loading}>{loading ? "Publikowanie…" : "Opublikuj komentarz"}</ArrowButton></div>
      </form>
    </section>
  );
}
