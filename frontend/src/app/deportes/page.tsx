import { ModulePlaceholder } from "@/components/common/ModulePlaceholder";
import { AppShell } from "@/components/layout/AppShell";

export default function DeportesPage() {
  return (
    <AppShell>
      <ModulePlaceholder
        title="Deportes"
        description="Administra los deportes oficiales, reglas configuradas y capacidad por grupo."
        buttonLabel="Nuevo deporte"
      />
    </AppShell>
  );
}
