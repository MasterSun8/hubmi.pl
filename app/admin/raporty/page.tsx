import type { Metadata } from "next";
import { getTrendsData } from "@/app/api/reports/trends/route";
import { ReportsDashboard } from "./components/reports-dashboard";

export const metadata: Metadata = {
  title: "Raporty i Trendy — Panel instytucji Hubmi",
};

export default async function RaportyPage() {
  // Pobieramy dane bezpośrednio na serwerze (Server Component)
  const initialData = await getTrendsData();

  return (
    <main id="main-content" className="p-10 max-sm:p-5">
      <p className="text-caption font-medium tracking-label-sm text-primary uppercase mb-2">
        Moduł analityczny
      </p>
      
      {/* Przekazujemy pobrane dane do interaktywnego komponentu klienckiego */}
      <ReportsDashboard initialData={initialData} />
    </main>
  );
}
