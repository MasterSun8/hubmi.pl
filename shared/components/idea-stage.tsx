// Stage of an idea from the idea card (fiszka): shared by the "Zaoferuj pomoc" chat and the admin panel.

export type IdeaStage = "idea" | "prototype" | "pilot" | "running";

export const ideaStages: { id: IdeaStage; label: string }[] = [
  { id: "idea", label: "Pomysł" },
  { id: "prototype", label: "Prototyp" },
  { id: "pilot", label: "Testy w małej skali" },
  { id: "running", label: "Działa" },
];

export const ideaStageLabels = Object.fromEntries(ideaStages.map((stage) => [stage.id, stage.label])) as Record<
  IdeaStage,
  string
>;

// Four segments, filled up to the current stage; the label next to it carries the meaning.
export function IdeaStageBar({ stage }: { stage: IdeaStage | null }) {
  const current = ideaStages.findIndex((item) => item.id === stage);
  return (
    <span className="grid grid-cols-4 gap-1" aria-hidden="true">
      {ideaStages.map((item, index) => (
        <span key={item.id} className={`h-1 transition-colors duration-500 ${index <= current ? "bg-primary" : "bg-line/50"}`} />
      ))}
    </span>
  );
}
