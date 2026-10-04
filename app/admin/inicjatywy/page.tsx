import type { Metadata } from "next";
import { InitiativesView } from "./components/initiatives-view";

export const metadata: Metadata = {
  title: "Biblioteka innowacji — Panel Administratora Hubmi",
};

// Zasobnik wiedzy: library of ROPS innovations (GET /api/solutions) with matchmaking counts.
export default function InitiativesPage() {
  return <InitiativesView tab="library" />;
}
