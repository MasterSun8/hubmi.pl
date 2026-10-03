export type TextSize = "normal" | "large" | "xlarge";
export type Contrast = "normal" | "high";
export type A11yPreferences = { textSize: TextSize; contrast: Contrast };

export const A11Y_STORAGE_KEY = "hubmi-a11y";
export const defaultA11yPreferences: A11yPreferences = { textSize: "normal", contrast: "normal" };

const textSizes: TextSize[] = ["normal", "large", "xlarge"];

export function readA11yPreferences(): A11yPreferences {
  try {
    const stored = JSON.parse(localStorage.getItem(A11Y_STORAGE_KEY) ?? "{}");
    return {
      textSize: textSizes.includes(stored.textSize) ? stored.textSize : "normal",
      contrast: stored.contrast === "high" ? "high" : "normal",
    };
  } catch {
    return defaultA11yPreferences;
  }
}

export function applyA11yPreferences({ textSize, contrast }: A11yPreferences) {
  const root = document.documentElement;
  if (textSize === "normal") root.removeAttribute("data-text-size");
  else root.setAttribute("data-text-size", textSize);
  if (contrast === "high") root.setAttribute("data-contrast", "high");
  else root.removeAttribute("data-contrast");
}

// Runs in <head> before first paint so a saved preference never flashes the default look.
export const a11yInlineScript = `(function(){try{var p=JSON.parse(localStorage.getItem("${A11Y_STORAGE_KEY}")||"{}"),r=document.documentElement;if(p.textSize==="large"||p.textSize==="xlarge")r.setAttribute("data-text-size",p.textSize);if(p.contrast==="high")r.setAttribute("data-contrast","high")}catch(e){}})()`;
