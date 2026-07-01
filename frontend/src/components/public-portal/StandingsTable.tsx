import type { StandingRow } from "./publicPortalUtils";

type StandingsTableProps = {
  standings: StandingRow[];
  loading: boolean;
};

export function StandingsTable({ standings, loading }: StandingsTableProps) {
  return (
    <div className="overflow-hidden border border-white/10 bg-white shadow-[0_30px_90px_rgba(0,0,0,0.28)]">
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-100 text-xs font-black uppercase tracking-[0.12em] text-slate-500">
            <tr>
              <th className="px-5 py-4">Pos</th>
              <th className="px-5 py-4">Equipo</th>
              <th className="px-5 py-4">PJ</th>
              <th className="px-5 py-4">G</th>
              <th className="px-5 py-4">E</th>
              <th className="px-5 py-4">D</th>
              <th className="px-5 py-4">GF</th>
              <th className="px-5 py-4">GC</th>
              <th className="px-5 py-4">PTS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {standings.map((item, index) => (
              <tr className="font-bold text-slate-700" key={item.team}>
                <td className="px-5 py-4 text-slate-400">{index + 1}</td>
                <td className="px-5 py-4 font-black text-slate-950">{item.team}</td>
                <td className="px-5 py-4">{item.p}</td>
                <td className="px-5 py-4">{item.w}</td>
                <td className="px-5 py-4">{item.d}</td>
                <td className="px-5 py-4">{item.l}</td>
                <td className="px-5 py-4">{item.gf}</td>
                <td className="px-5 py-4">{item.ga}</td>
                <td className="px-5 py-4 font-black text-blue-700">{item.pts}</td>
              </tr>
            ))}
            {!loading && standings.length === 0 && (
              <tr>
                <td className="px-5 py-8 text-center text-sm font-bold text-slate-500" colSpan={9}>
                  La tabla se formara cuando existan resultados publicados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
