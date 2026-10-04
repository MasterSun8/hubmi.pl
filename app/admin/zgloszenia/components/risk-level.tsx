import type { Submission } from "./submissions-provider";

export type RiskLevel = 1 | 2 | 3 | 4;

export const riskLabels: Record<RiskLevel, string> = {
  1: "niskie",
  2: "średnie",
  3: "wysokie",
  4: "krytyczne",
};

const levels: RiskLevel[] = [1, 2, 3, 4];
const barHeights: Record<RiskLevel, string> = { 1: "h-1", 2: "h-2", 3: "h-3", 4: "h-4" };

// A signal-strength meter next to the label. The text carries the meaning
// (WCAG 1.4.1); the bars and the red for "krytyczne" only reinforce it.
export function RiskBadge({ item }: { item: Pick<Submission, "type" | "riskLevel"> }) {
  if (item.type === "idea") return <span className="text-muted">nie dotyczy</span>;
  if (item.riskLevel === null) return <span className="text-muted">brak oceny</span>;

  const level = item.riskLevel as RiskLevel;
  return (
    <span className={`inline-flex items-center gap-2 ${level === 4 ? "font-medium text-error" : "text-ink"}`}>
      <span className="inline-flex h-4 items-end gap-0.5" aria-hidden="true">
        {levels.map((bar) => (
          <span key={bar} className={`w-1 rounded-xs ${bar <= level ? "bg-current" : "bg-line/40"} ${barHeights[bar]}`} />
        ))}
      </span>
      {riskLabels[level]}
    </span>
  );
}
