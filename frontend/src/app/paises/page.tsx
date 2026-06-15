import { PaisesClient } from "@/app/paises/PaisesClient";
import { RequireModule } from "@/components/auth/RequireModule";

export default function PaisesPage() {
  return (
    <RequireModule keys={["/instituciones", "instituciones"]}>
      <PaisesClient />
    </RequireModule>
  );
}
