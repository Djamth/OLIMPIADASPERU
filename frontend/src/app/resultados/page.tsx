import { ModulePlaceholder } from "@/components/common/ModulePlaceholder";
import { AppShell } from "@/components/layout/AppShell";

export default function ResultadosPage() {
  return (
    <AppShell>
      <ModulePlaceholder
        title="Resultados"
        description="Carga marcadores, observaciones y anotaciones por participante."
        buttonLabel="Registrar resultado"
      />
    </AppShell>
  );
}
