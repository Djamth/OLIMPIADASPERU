import type { PublicDashboardResumen } from "@/types/admin";
import { useMemo } from "react";
import {
  EventSummarySection,
  FeaturedResultsSection,
  HeroSection,
  ResultsSection,
  StandingsSection,
  StatsSection,
  UpcomingMatchesSection,
} from "./PublicPortalSections";
import { buildPublicStandings } from "./publicPortalUtils";

type PublicPortalProps = {
  summary: PublicDashboardResumen | null;
  loading: boolean;
};

export function PublicPortal({ summary, loading }: PublicPortalProps) {
  const proximasContiendas = useMemo(() => summary?.proximasContiendas ?? [], [summary]);
  const ultimosResultados = useMemo(() => summary?.ultimosResultados ?? [], [summary]);
  const metricas = summary?.metricas ?? [];
  const nextMatch = proximasContiendas[0];
  const standings = useMemo(() => buildPublicStandings(ultimosResultados), [ultimosResultados]);

  return (
    <main className="public-scroll-shell bg-[#061225] text-slate-950">
      <HeroSection nextMatch={nextMatch} />
      <EventSummarySection metrics={metricas} loading={loading} />
      <FeaturedResultsSection results={ultimosResultados} loading={loading} />
      <StandingsSection standings={standings} loading={loading} />
      <UpcomingMatchesSection matches={proximasContiendas} loading={loading} />
      <ResultsSection results={ultimosResultados} loading={loading} />
      <StatsSection metrics={metricas} loading={loading} />
    </main>
  );
}
