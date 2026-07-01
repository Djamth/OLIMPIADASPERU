"use client";

import { PublicPortal } from "@/components/public-portal/PublicPortal";
import { publicDashboardService } from "@/services/adminServices";
import type { PublicDashboardResumen } from "@/types/admin";
import { useEffect, useState } from "react";

export default function PublicHomePage() {
  const [summary, setSummary] = useState<PublicDashboardResumen | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    publicDashboardService
      .resumen()
      .then(setSummary)
      .catch(() => setSummary(null))
      .finally(() => setLoading(false));
  }, []);

  return <PublicPortal summary={summary} loading={loading} />;
}
