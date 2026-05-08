import { ModulePlaceholder } from "@/components/common/ModulePlaceholder";
import { AppShell } from "@/components/layout/AppShell";

export default function InscripcionesPage() {
  return (
    <AppShell>
      <ModulePlaceholder
        title="Inscripciones"
        description="Controla las inscripciones por deporte y el estado de confirmacion de cada equipo."
        buttonLabel="Nueva inscripcion"
      />
    </AppShell>
  );
}
