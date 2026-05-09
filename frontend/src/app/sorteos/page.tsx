import { SorteosClient } from "@/app/sorteos/SorteosClient";
import { AppShell } from "@/components/layout/AppShell";

export default function SorteosPage() {
  return (
    <AppShell>
      <SorteosClient />
    </AppShell>
  );
}
