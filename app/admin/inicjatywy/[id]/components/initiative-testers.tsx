import { getInnovationTesters } from "@/lib/server/solutions";

export async function InitiativeTesters({ solutionId }: { solutionId: string }) {
  const testers = await getInnovationTesters(solutionId);

  if (testers.length === 0) {
    return (
      <section className="flex flex-col gap-2.5">
        <h2 className="text-body font-semibold text-primary">Chętni na testerów pilotażu (0)</h2>
        <p className="text-sm text-muted">Brak zgłoszeń do pilotażu tej innowacji.</p>
      </section>
    );
  }

  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-body font-semibold text-primary">Chętni na testerów pilotażu ({testers.length})</h2>
      
      <div className="flex flex-col gap-3">
        {testers.map((tester) => (
          <article key={tester.id} className="p-4 border border-line bg-surface rounded flex flex-col gap-2 text-sm">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-semibold text-ink">{tester.fullName}</p>
                <p className="text-muted">{tester.organization || "Brak nazwy organizacji"}</p>
              </div>
              <a href={`mailto:${tester.email}`} className="text-primary font-medium underline underline-offset-2 hover:text-cta">
                {tester.email}
              </a>
            </div>
            
            {tester.motivation && (
              <div className="mt-2 pt-2 border-t border-line">
                <p className="text-muted text-xs font-semibold uppercase tracking-wider mb-1">Motywacja:</p>
                <p className="text-ink">{tester.motivation}</p>
              </div>
            )}
            
            <p className="text-xs text-muted mt-1">Zgłoszono: {tester.createdAt.toLocaleDateString()}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
