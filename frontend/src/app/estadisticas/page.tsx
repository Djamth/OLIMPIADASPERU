import { ModulePlaceholder } from "@/components/common/ModulePlaceholder";
import { AppShell } from "@/components/layout/AppShell";

export default function EstadisticasPage() {
  return (
    <AppShell>
      <ModulePlaceholder
        title="Estadisticas"
        description="Visualiza ranking por deporte y tabla de goleadores."
        buttonLabel="Actualizar tablero"
      />
    </AppShell>
  );
}
