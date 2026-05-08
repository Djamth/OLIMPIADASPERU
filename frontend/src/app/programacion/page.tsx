import { ModulePlaceholder } from "@/components/common/ModulePlaceholder";
import { AppShell } from "@/components/layout/AppShell";

export default function ProgramacionPage() {
  return (
    <AppShell>
      <ModulePlaceholder
        title="Programacion"
        description="Organiza partidos por deporte, grupo, sede y fecha de competencia."
        buttonLabel="Programar partido"
      />
    </AppShell>
  );
}
