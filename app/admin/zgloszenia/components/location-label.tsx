import { countyOfLocation } from "@/lib/geo/county-of-location";

// The town the resident typed, plus its county when it is not a city county
// itself ("Słomniki · powiat krakowski", but just "Kraków").
export function LocationLabel({ location }: { location: string }) {
  const county = countyOfLocation(location);
  return (
    <>
      {location}
      {county && !county.startsWith("powiat m. ") && <span className="text-muted"> · {county}</span>}
    </>
  );
}
