"use client";

import { useLoadedInitiative } from "./initiative-provider";

const linkClass = "text-primary underline underline-offset-2";

// File name or host as a readable label for a URL.
function labelFor(url: string) {
  try {
    const { pathname, hostname } = new URL(url);
    const file = decodeURIComponent(pathname.split("/").filter(Boolean).at(-1) ?? "");
    return file || hostname;
  } catch {
    return url;
  }
}

export function InitiativeMaterials() {
  const { materialsUrls, videoUrls, termsOfUseUrl, contactUrl } = useLoadedInitiative();
  if (materialsUrls.length === 0 && videoUrls.length === 0 && !termsOfUseUrl && !contactUrl) return null;

  return (
    <section className="flex flex-col gap-5" aria-labelledby="materials-title">
      <h2 id="materials-title" className="text-subtitle font-light">
        Materiały
      </h2>
      <ul className="m-0 flex list-none flex-col gap-2.5 p-0">
        {videoUrls.map((url) => (
          <li key={url}>
            <a className={linkClass} href={url} target="_blank" rel="noreferrer">
              Film: {labelFor(url)}
            </a>
          </li>
        ))}
        {materialsUrls.map((url) => (
          <li key={url}>
            <a className={linkClass} href={url} target="_blank" rel="noreferrer">
              Do pobrania: {labelFor(url)}
            </a>
          </li>
        ))}
        {termsOfUseUrl && (
          <li>
            <a className={linkClass} href={termsOfUseUrl} target="_blank" rel="noreferrer">
              Zasady wykorzystania
            </a>
          </li>
        )}
        {contactUrl && (
          <li>
            <a className={linkClass} href={contactUrl} target="_blank" rel="noreferrer">
              Kontakt z autorem
            </a>
          </li>
        )}
      </ul>
      <p className="text-caption">Linki otwierają się w nowej karcie.</p>
    </section>
  );
}
