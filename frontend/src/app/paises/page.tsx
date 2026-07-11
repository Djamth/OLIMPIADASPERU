import { AppShell } from "@/components/layout/AppShell";
import { PaisesClient } from "@/app/paises/PaisesClient";
import { RequireModule } from "@/components/auth/RequireModule";

export default function PaisesPage() {
  return (
    <AppShell>
      <RequireModule keys={["/instituciones", "instituciones"]}>
        <PaisesClient />
      </RequireModule>
    </AppShell>
  );
}
