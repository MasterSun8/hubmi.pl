"use client";

import { useIndicators } from "./indicators-provider";

// The context line under the search field (Figma 15:832).
export function IndicatorMeta() {
  const { selected } = useIndicators();
  const parts = ["Małopolska", "22 powiaty", selected ? `rok ${selected.year}` : null, "dane z bazy ROPS"];

  return (
    <p className="text-caption font-medium tracking-caption uppercase">
      {parts.filter(Boolean).join("  ·  ")}
    </p>
  );
}
