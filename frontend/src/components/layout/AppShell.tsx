"use client";

import { ProtectedPage } from "@/components/auth/ProtectedPage";
import { AppNavbar } from "@/components/layout/AppNavbar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import type { CSSProperties } from "react";
import { useEffect, useState } from "react";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const sidebarWidth = collapsed ? 72 : 240;

  useEffect(() => {
    document.body.classList.toggle("mobile-menu-open", sidebarOpen);

    return () => document.body.classList.remove("mobile-menu-open");
  }, [sidebarOpen]);

  return (
    <ProtectedPage>
      <main
        className="op-shell"
        style={{ "--op-sidebar-width": `${sidebarWidth}px` } as CSSProperties}
      >
        <aside className={`op-sidebar ${sidebarOpen ? "is-open" : ""}`}>
          <AppSidebar
            collapsed={collapsed}
            onToggleCollapsed={() => setCollapsed((value) => !value)}
            onNavigate={() => setSidebarOpen(false)}
          />
        </aside>

        {sidebarOpen && (
          <button
            className="op-sidebar-overlay"
            type="button"
            onClick={() => setSidebarOpen(false)}
            aria-label="Cerrar menu"
          />
        )}

        <section className="op-main">
          <div className="op-main-inner">
            <AppNavbar onOpenMobileMenu={() => setSidebarOpen(true)} />
            <div className="op-page-content">{children}</div>
          </div>
        </section>
      </main>
    </ProtectedPage>
  );
}
