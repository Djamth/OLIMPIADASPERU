import { InstitucionesClient } from "@/app/instituciones/InstitucionesClient";
import { AppShell } from "@/components/layout/AppShell";

export default function InstitucionesPage() {
  return (
    <AppShell>
      <InstitucionesClient />
    </AppShell>
  );
}
