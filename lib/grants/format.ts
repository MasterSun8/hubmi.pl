// Dates and amounts of grant calls in Polish, e.g. "30 listopada 2026", "10 000 zł".

export function formatCallDeadline(isoDate: string) {
  return new Intl.DateTimeFormat("pl-PL", { day: "numeric", month: "long", year: "numeric" }).format(
    new Date(`${isoDate}T12:00:00`),
  );
}

export function formatAmount(amount: number) {
  return new Intl.NumberFormat("pl-PL", { style: "currency", currency: "PLN", maximumFractionDigits: 0 }).format(amount);
}

export type CallPhase = "open" | "upcoming" | "closed";

export const callPhaseLabels: Record<CallPhase, string> = {
  open: "Trwa",
  upcoming: "Zaplanowany",
  closed: "Zakończony",
};

// Calls run on calendar days in Poland, the same rule as on the server.
export function callPhase(call: { startsOn: string; endsOn: string }): CallPhase {
  const today = new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Warsaw" }).format(new Date());
  if (today < call.startsOn) return "upcoming";
  return today > call.endsOn ? "closed" : "open";
}

export function formatCallPeriod(call: { startsOn: string; endsOn: string }) {
  const format = new Intl.DateTimeFormat("pl-PL", { day: "numeric", month: "short", year: "numeric" });
  return `${format.format(new Date(`${call.startsOn}T12:00:00`))} – ${format.format(new Date(`${call.endsOn}T12:00:00`))}`;
}
