import { ModulePlaceholder } from "@/components/common/ModulePlaceholder";
import { AppShell } from "@/components/layout/AppShell";

export default function ParticipantesPage() {
  return (
    <AppShell>
      <ModulePlaceholder
        title="Participantes"
        description="Registra jugadores por equipo y prepara la plantilla competitiva."
        buttonLabel="Nuevo participante"
      />
    </AppShell>
  );
}
