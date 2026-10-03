"use client";

import { useInitiatives } from "./initiatives-provider";

// The library of ROPS innovations and the ideas residents sent through "Zaoferuj pomoc".
export function InitiativesTabs() {
  const { tab, setTab, solutions, ideas, status } = useInitiatives();
  const tabs = [
    { id: "library" as const, label: "Biblioteka ROPS", count: solutions.length },
    { id: "ideas" as const, label: "Pomysły mieszkańców", count: ideas.length },
  ];

  return (
    <div role="tablist" aria-label="Rodzaj inicjatyw" className="flex flex-wrap gap-x-10 gap-y-2.5 border-b border-line">
      {tabs.map((item) => (
        <button
          key={item.id}
          type="button"
          role="tab"
          id={`tab-${item.id}`}
          aria-selected={tab === item.id}
          aria-controls={`panel-${item.id}`}
          onClick={() => setTab(item.id)}
          className="-mb-px border-0 border-b-2 border-transparent bg-transparent px-0 pb-2.5 text-lead font-light text-ink aria-selected:border-primary aria-selected:text-primary"
        >
          {item.label}
          {status === "ready" && <span className="ml-2 text-body text-muted">{item.count}</span>}
        </button>
      ))}
    </div>
  );
}
