"use client";

import { ideaStages } from "@/shared/components/idea-stage";
import { plural } from "../../zgloszenia/components/submissions-provider";
import { useInitiatives, type IdeaStageFilter } from "./initiatives-provider";

// Stage filter for the ideas tab: ROPS looks for ideas already tested in micro scale.
export function IdeasToolbar() {
  const { stageFilter, setStageFilter, ideaResults } = useInitiatives();

  return (
    <div className="flex flex-wrap items-center gap-x-7.5 gap-y-2.5">
      <label className="relative flex items-center gap-1">
        <span>Etap:</span>
        <select
          value={stageFilter}
          onChange={(event) => setStageFilter(event.target.value as IdeaStageFilter)}
          className="field-sizing-content appearance-none bg-transparent pr-5 text-ink focus:outline-none focus-visible:underline"
        >
          <option value="all">wszystkie</option>
          {ideaStages.map((stage) => (
            <option key={stage.id} value={stage.id}>
              {stage.label.toLocaleLowerCase("pl")}
            </option>
          ))}
          <option value="unknown">nieokreślony</option>
        </select>
        <svg viewBox="0 0 12 12" fill="none" className="pointer-events-none absolute right-0 size-3" aria-hidden="true">
          <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </label>
      <p className="text-caption" aria-live="polite">
        {ideaResults.length} {plural(ideaResults.length, "pomysł", "pomysły", "pomysłów")}
      </p>
    </div>
  );
}
