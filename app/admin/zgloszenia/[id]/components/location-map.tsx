"use client";

import { useEffect, useState } from "react";
import { useLoadedSubmission } from "./submission-details-provider";

type Place = { lat: number; lon: number };

// Geocodes the free-text location with OpenStreetMap Nominatim, limited to Poland.
async function geocode(query: string, signal: AbortSignal): Promise<Place | null> {
  const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=pl&q=${encodeURIComponent(query)}`;
  const response = await fetch(url, { signal, headers: { "Accept-Language": "pl" } });
  if (!response.ok) return null;
  const [hit] = (await response.json()) as { lat: string; lon: string }[];
  return hit ? { lat: Number(hit.lat), lon: Number(hit.lon) } : null;
}

// Figma 16:1571 — approximate location on an OpenStreetMap embed.
export function LocationMap() {
  const { submission } = useLoadedSubmission();
  const [place, setPlace] = useState<Place | null | "loading">("loading");

  useEffect(() => {
    const controller = new AbortController();
    // Notes in brackets ("Słomniki (koło Krakowa)") only confuse the geocoder.
    const town = submission.location.replace(/\([^)]*\)/g, "").trim();
    geocode(`${town}, małopolskie`, controller.signal)
      .then(setPlace)
      .catch(() => {
        if (!controller.signal.aborted) setPlace(null);
      });
    return () => controller.abort();
  }, [submission.location]);

  const delta = 0.03;
  const embed =
    place && place !== "loading"
      ? `https://www.openstreetmap.org/export/embed.html?bbox=${place.lon - delta * 1.6}%2C${place.lat - delta}%2C${place.lon + delta * 1.6}%2C${place.lat + delta}&layer=mapnik&marker=${place.lat}%2C${place.lon}`
      : null;

  return (
    <section className="flex flex-col gap-5 border border-line bg-surface p-7.5 max-sm:p-5" aria-labelledby="location-title">
      <h2 id="location-title" className="text-subtitle font-light text-primary">
        Lokalizacja
      </h2>
      <p className="font-medium">{submission.location} · woj. małopolskie</p>
      <div className="aspect-[430/280] w-full bg-surface">
        {embed ? (
          <iframe
            title={`Mapa: ${submission.location}`}
            src={embed}
            className="size-full border-0"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        ) : (
          <p className="flex size-full items-center justify-center p-5 text-center text-caption">
            {place === "loading" ? "Ładowanie mapy…" : "Nie udało się znaleźć tej miejscowości na mapie."}
          </p>
        )}
      </div>
      <p className="text-caption">© OpenStreetMap contributors</p>
      <p className="text-caption">
        Lokalizacja przybliżona do miejscowości.
        <br />
        Dokładnego adresu nie podano.
      </p>
    </section>
  );
}
