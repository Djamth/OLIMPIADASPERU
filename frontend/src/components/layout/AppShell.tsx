"use client";

import { AppNavbar } from "@/components/layout/AppNavbar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { ProtectedPage } from "@/components/auth/ProtectedPage";
import { useEffect, useState } from "react";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  useEffect(() => {
    document.body.classList.toggle("mobile-menu-open", mobileSidebarOpen);

    return () => {
      document.body.classList.remove("mobile-menu-open");
    };
  }, [mobileSidebarOpen]);

  return (
    <ProtectedPage>
      <div className={`app-shell ${sidebarCollapsed ? "sidebar-collapsed" : ""}`}>
        <div
          className={`sidebar-mobile-backdrop ${mobileSidebarOpen ? "show" : ""}`}
          onClick={() => setMobileSidebarOpen(false)}
        />
        <div className={`app-sidebar-wrapper ${mobileSidebarOpen ? "mobile-open" : ""}`}>
          <AppSidebar
            collapsed={sidebarCollapsed}
            onNavigate={() => setMobileSidebarOpen(false)}
            onCloseMobile={() => setMobileSidebarOpen(false)}
          />
        </div>
        <main className="app-content p-3 p-lg-4 content-panel">
          <AppNavbar
            sidebarCollapsed={sidebarCollapsed}
            onToggleSidebar={() => setSidebarCollapsed((value) => !value)}
            onOpenMobileMenu={() => setMobileSidebarOpen(true)}
          />
            {children}
        </main>
      </div>
    </ProtectedPage>
  );
}
