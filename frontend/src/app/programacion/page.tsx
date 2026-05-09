import { ProgramacionClient } from "@/app/programacion/ProgramacionClient";
import { AppShell } from "@/components/layout/AppShell";

export default function ProgramacionPage() {
  return (
    <AppShell>
      <ProgramacionClient />
    </AppShell>
  );
}
