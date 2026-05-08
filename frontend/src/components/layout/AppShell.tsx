import { AppNavbar } from "@/components/layout/AppNavbar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { ProtectedPage } from "@/components/auth/ProtectedPage";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedPage>
      <div className="app-shell container-fluid">
        <div className="row">
          <div className="col-12 col-lg-3 col-xl-2 px-0">
            <AppSidebar />
          </div>
          <div className="col-12 col-lg-9 col-xl-10 p-3 p-lg-4">
            <AppNavbar />
            {children}
          </div>
        </div>
      </div>
    </ProtectedPage>
  );
}
