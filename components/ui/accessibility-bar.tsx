"use client";

import { useLayoutEffect, useState } from "react";
import {
  A11Y_STORAGE_KEY,
  applyA11yPreferences,
  defaultA11yPreferences,
  readA11yPreferences,
  type A11yPreferences,
  type TextSize,
} from "@/components/ui/accessibility-preferences";
import styles from "./accessibility-bar.module.css";

const textSizes: { value: TextSize; label: string; name: string }[] = [
  { value: "normal", label: "A", name: "Normalny rozmiar tekstu" },
  { value: "large", label: "A+", name: "Większy tekst" },
  { value: "xlarge", label: "A++", name: "Największy tekst" },
];

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
    <div className={styles.bar} role="group" aria-label="Ustawienia dostępności">
      <div className={styles.sizes} role="group" aria-labelledby="a11y-text-size">
        <span id="a11y-text-size" className={styles.label}>
          Rozmiar tekstu
        </span>
        {textSizes.map((size) => {
          const active = preferences.textSize === size.value;
          return (
            <button
              key={size.value}
              type="button"
              className={`${styles.button} ${styles[`size_${size.value}`]}`}
              aria-pressed={active}
              aria-label={size.name}
              onClick={() => update({ ...preferences, textSize: size.value })}
            >
              {size.label}
            </button>
          );
        })}
      </div>
      <span className={styles.separator} aria-hidden="true" />
      <button
        type="button"
        className={`${styles.button} ${styles.contrast}`}
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
