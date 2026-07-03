import { RequireModule } from "@/components/auth/RequireModule";
import { AppShell } from "@/components/layout/AppShell";
import { AccionesClient } from "@/app/acciones/AccionesClient";

export default function AccionesPage() {
  return (
    <AppShell>
      <RequireModule keys={["/acciones", "acciones"]}>
        <AccionesClient />
      </RequireModule>
    </AppShell>
  );
}
