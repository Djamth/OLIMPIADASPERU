import { ResultadosDetailClient } from "@/app/resultados/ResultadosDetailClient";
import { AppShell } from "@/components/layout/AppShell";

function buildReturnHref(searchParams?: Record<string, string | string[] | undefined>) {
  const params = new URLSearchParams();
  Object.entries(searchParams ?? {}).forEach(([key, raw]) => {
    if (Array.isArray(raw)) {
      if (raw[0]) params.set(key, raw[0]);
      return;
    }
    if (typeof raw === "string" && raw.length > 0) {
      params.set(key, raw);
    }
  });

  const query = params.toString();
  return query ? `/resultados?${query}` : "/resultados";
}

export default async function ResultadoDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolvedParams = await params;
  const resolvedSearchParams = (await searchParams) ?? {};

  return (
    <AppShell>
      <ResultadosDetailClient
        resultId={Number(resolvedParams.id)}
        returnHref={buildReturnHref(resolvedSearchParams)}
        initialSearchParams={resolvedSearchParams}
      />
    </AppShell>
  );
}