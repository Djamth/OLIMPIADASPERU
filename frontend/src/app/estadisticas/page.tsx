import { EstadisticasClient } from "@/app/estadisticas/EstadisticasClient";
import { AppShell } from "@/components/layout/AppShell";

export default function EstadisticasPage() {
  return (
    <AppShell>
      <EstadisticasClient />
    </AppShell>
  );
}
