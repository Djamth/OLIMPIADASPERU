import { DeportesClient } from "@/app/deportes/DeportesClient";
import { AppShell } from "@/components/layout/AppShell";

export default function DeportesPage() {
  return (
    <AppShell>
      <DeportesClient />
    </AppShell>
  );
}
