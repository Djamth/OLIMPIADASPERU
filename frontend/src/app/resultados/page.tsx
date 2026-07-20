import { ResultadosClient } from "@/app/resultados/ResultadosClient";
import { AppShell } from "@/components/layout/AppShell";

export default async function ResultadosPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolvedSearchParams = (await searchParams) ?? {};

  return (
    <AppShell>
      <ResultadosClient initialSearchParams={resolvedSearchParams} />
    </AppShell>
  );
}
