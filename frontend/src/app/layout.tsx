import type { Metadata } from "next";
import "./globals.css";
import { AppProviders } from "@/components/providers/AppProviders";

export const metadata: Metadata = {
  title: "Olimpiadas Peru",
  description: "Sistema de gestion de olimpiadas deportivas escolares",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className="bg-slate-50">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
