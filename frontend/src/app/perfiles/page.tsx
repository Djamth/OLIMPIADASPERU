import { RequireModule } from "@/components/auth/RequireModule";
import { AppShell } from "@/components/layout/AppShell";
import { PerfilesClient } from "@/app/perfiles/PerfilesClient";

export default function PerfilesPage() {
  return (
    <AppShell>
      <RequireModule keys={["/roles", "/modulos", "roles", "modulos"]}>
        <PerfilesClient />
      </RequireModule>
    </AppShell>
  );
}
