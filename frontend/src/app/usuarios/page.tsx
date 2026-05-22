import { RequireModule } from "@/components/auth/RequireModule";
import { AppShell } from "@/components/layout/AppShell";
import { UsuariosClient } from "@/app/usuarios/UsuariosClient";

export default function UsuariosPage() {
  return (
    <AppShell>
      <RequireModule keys={["/usuarios", "usuarios"]}>
        <UsuariosClient />
      </RequireModule>
    </AppShell>
  );
}
