"use client";

import { useLayoutEffect, useState } from "react";
import {
  A11Y_STORAGE_KEY,
  applyA11yPreferences,
  defaultA11yPreferences,
  readA11yPreferences,
  type A11yPreferences,
  type TextSize,
} from "@/app/components/accessibility-preferences";

// The size buttons keep a fixed font size so the controls stay put while the page scales.
const textSizes: { value: TextSize; label: string; name: string; className: string }[] = [
  { value: "normal", label: "A", name: "Normalny rozmiar tekstu", className: "text-[14px]" },
  { value: "large", label: "A+", name: "Większy tekst", className: "text-[17px]" },
  { value: "xlarge", label: "A++", name: "Największy tekst", className: "text-[20px]" },
];

const buttonClass =
  "inline-flex h-9 min-w-9 items-center justify-center gap-2 rounded-input border border-ink bg-transparent px-2.5 font-medium leading-5 text-ink cursor-pointer aria-pressed:border-primary aria-pressed:bg-primary aria-pressed:text-on-primary";

export function AccessibilityBar() {
  const [preferences, setPreferences] = useState<A11yPreferences>(defaultA11yPreferences);

  // Sync with what the inline script in the root layout already applied. It also
  // re-applies the attributes after React's dev remount clears them from <html>.
  useLayoutEffect(() => {
    const stored = readA11yPreferences();
    applyA11yPreferences(stored);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-off read of client-only storage
    setPreferences(stored);
  }, []);

  function update(next: A11yPreferences) {
    setPreferences(next);
    applyA11yPreferences(next);
    try {
      localStorage.setItem(A11Y_STORAGE_KEY, JSON.stringify(next));
    } catch {}
  }

  const highContrast = preferences.contrast === "high";

  return (
    <div
      className="mb-5 flex flex-wrap items-center justify-end gap-x-5 gap-y-2.5 border-b border-line pb-5 max-sm:justify-start"
      role="group"
      aria-label="Ustawienia dostępności"
    >
      <div className="flex items-center gap-2.5" role="group" aria-labelledby="a11y-text-size">
        <span id="a11y-text-size" className="text-caption font-medium tracking-label-sm uppercase">
          Rozmiar tekstu
        </span>
        {textSizes.map((size) => {
          const active = preferences.textSize === size.value;
          return (
            <button
              key={size.value}
              type="button"
              className={`${buttonClass} ${size.className}`}
              aria-pressed={active}
              aria-label={size.name}
              onClick={() => update({ ...preferences, textSize: size.value })}
            >
              {size.label}
            </button>
          );
        })}
      </div>
      <span className="h-6 w-px bg-line max-sm:hidden" aria-hidden="true" />
      <button
        type="button"
        className={`${buttonClass} pr-4 pl-3.5 text-caption tracking-label-sm uppercase`}
        aria-pressed={highContrast}
        onClick={() => update({ ...preferences, contrast: highContrast ? "normal" : "high" })}
      >
        <svg viewBox="0 0 16 16" width="16" height="16" fill="none" aria-hidden="true" focusable="false">
          <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.5" />
          <path d="M8 1.5A6.5 6.5 0 0 1 8 14.5Z" fill="currentColor" />
        </svg>
        {highContrast ? "Kontrast: włączony" : "Kontrast"}
      </button>
    </div>
  );
}
