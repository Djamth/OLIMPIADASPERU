import { ResultadosClient } from "@/app/resultados/ResultadosClient";
import { AppShell } from "@/components/layout/AppShell";

export default function ResultadosPage() {
  return (
    <AppShell>
      <ResultadosClient />
    </AppShell>
  );
}
