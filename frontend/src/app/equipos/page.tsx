import { ModulePlaceholder } from "@/components/common/ModulePlaceholder";
import { AppShell } from "@/components/layout/AppShell";

export default function EquiposPage() {
  return (
    <AppShell>
      <ModulePlaceholder
        title="Equipos"
        description="Gestiona equipos por institucion, categoria, genero y entrenador."
        buttonLabel="Nuevo equipo"
      />
    </AppShell>
  );
}
