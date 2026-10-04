"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

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
    const fd = new FormData(e.currentTarget);
    const payload = Object.fromEntries(fd.entries());

    try {
      const res = await fetch(`/api/solutions/${solutionId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }).then(r => r.json());
      
      if (res.success) {
        e.currentTarget.reset();
        router.refresh();
      } else {
        alert("Błąd: " + res.error);
      }
    } catch (err) {
      alert("Wystąpił błąd sieci");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="flex flex-col gap-8 mt-4 w-full">
      <h3 className="font-heading text-2xl text-primary border-b border-line pb-2">Dyskusja ({initialComments.length})</h3>
      
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 bg-surface p-5 rounded-lg border border-line">
        <h4 className="font-semibold text-ink">Dodaj komentarz</h4>
        <label className="flex min-h-10.5 items-center rounded-input border border-field px-5 transition-colors focus-within:border-primary">
          <input name="authorName" required placeholder="Twoje imię / pseudonim" className="min-w-0 flex-1 bg-transparent py-2 text-ink placeholder:text-muted focus:outline-none" />
        </label>
        <label className="flex items-start rounded-input border border-field px-5 py-2.5 transition-colors focus-within:border-primary">
          <textarea name="content" required placeholder="Dołącz do dyskusji o innowacji..." rows={3} className="min-w-0 flex-1 bg-transparent text-ink placeholder:text-muted focus:outline-none resize-none" />
        </label>
        <div className="flex justify-end mt-2">
          <button type="submit" disabled={loading} className="rounded-button bg-primary px-5 py-2.5 font-medium text-on-primary transition-colors hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-50 cursor-pointer border-0">
            {loading ? "Wysyłanie..." : "Opublikuj komentarz"}
          </button>
        </div>
      </form>

      <div className="flex flex-col gap-6">
        {initialComments.length === 0 ? (
          <p className="text-muted italic">Brak komentarzy. Bądź pierwszą osobą, która podzieli się opinią!</p>
        ) : (
          initialComments.map((comment) => {
            const initials = comment.authorName.substring(0, 2).toUpperCase();
            return (
              <article key={comment.id} className="flex gap-4">
                <div className="flex-none flex items-center justify-center w-11 h-11 rounded-full bg-primary/10 text-primary font-bold text-sm select-none">
                  {initials}
                </div>
                <div className="flex-1 bg-surface border border-line rounded-2xl rounded-tl-sm p-4 flex flex-col gap-1.5 shadow-sm">
                  <div className="flex justify-between items-baseline gap-2">
                    <span className="font-semibold text-ink">{comment.authorName}</span>
                    <span className="text-xs text-muted font-medium" title={new Date(comment.createdAt).toLocaleString()}>
                      {new Date(comment.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-ink leading-relaxed">{comment.content}</p>
                </div>
              </article>
            );
          })
        )}
      </div>
    </section>
  );
}
