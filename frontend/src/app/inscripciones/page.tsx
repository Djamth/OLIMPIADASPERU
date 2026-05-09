import { InscripcionesClient } from "@/app/inscripciones/InscripcionesClient";
import { AppShell } from "@/components/layout/AppShell";

export default function InscripcionesPage() {
  return (
    <AppShell>
      <InscripcionesClient />
    </AppShell>
  );
}
