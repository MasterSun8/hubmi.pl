import styles from "./start-button.module.css";

export function StartButton({ label }: { label: string }) {
  return (
    <button type="button" className={styles.button} aria-label={label} disabled>
      <svg className={styles.icon} viewBox="0 0 105 70" fill="none" aria-hidden="true" focusable="false">
        {/* Geometry exported from Figma, with color supplied by the shared token. */}
        <path d="M35 69.5C54.0538 69.5 69.5 54.0538 69.5 35C69.5 15.9462 54.0538 0.5 35 0.5C15.9462 0.5 0.5 15.9462 0.5 35C0.5 54.0538 15.9462 69.5 35 69.5Z" stroke="currentColor" />
        <path d="M35 35H104M98 41L104 35L98 29" stroke="currentColor" />
      </svg>
      <span>Rozpocznij</span>
    </button>
  );
}
