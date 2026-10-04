import type { Metadata } from "next";
import { InitiativesView } from "../components/initiatives-view";

export const metadata: Metadata = {
  title: "Pomysły — Panel Administratora Hubmi",
};

// Kreator pomysłów: ideas sent through "Zaoferuj pomoc", with their idea card and canvas.
export default function IdeasPage() {
  return <InitiativesView tab="ideas" />;
}
