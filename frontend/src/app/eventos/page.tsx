import { EventosClient } from "@/app/eventos/EventosClient";
import { AppShell } from "@/components/layout/AppShell";

export default function EventosPage() {
  return (
    <AppShell>
      <EventosClient />
    </AppShell>
  );
}
