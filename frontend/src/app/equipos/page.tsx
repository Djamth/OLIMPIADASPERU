import { EquiposClient } from "@/app/equipos/EquiposClient";
import { AppShell } from "@/components/layout/AppShell";

export default function EquiposPage() {
  return (
    <AppShell>
      <EquiposClient />
    </AppShell>
  );
}
