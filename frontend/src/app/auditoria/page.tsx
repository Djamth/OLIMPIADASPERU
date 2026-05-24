import { AuditoriaClient } from "@/app/auditoria/AuditoriaClient";
import { RequireModule } from "@/components/auth/RequireModule";
import { AppShell } from "@/components/layout/AppShell";

export default function AuditoriaPage() {
  return (
    <AppShell>
      <RequireModule keys={["/auditoria", "auditoria"]}>
        <AuditoriaClient />
      </RequireModule>
    </AppShell>
  );
}
