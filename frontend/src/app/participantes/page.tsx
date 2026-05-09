import { ParticipantesClient } from "@/app/participantes/ParticipantesClient";
import { AppShell } from "@/components/layout/AppShell";

export default function ParticipantesPage() {
  return (
    <AppShell>
      <ParticipantesClient />
    </AppShell>
  );
}
