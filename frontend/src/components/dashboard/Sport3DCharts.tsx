"use client";

import type { DashboardSportChart } from "@/types/admin";
import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";

const ReactECharts = dynamic(() => import("echarts-for-react"), {
  ssr: false,
  loading: () => (
    <div className="grid h-[360px] place-items-center rounded-2xl border border-slate-200 bg-slate-50 text-sm font-black text-slate-500">
      Preparando grafica...
    </div>
  ),
});

const metricLabels = ["Equipos", "Participantes", "Partidos", "Resultados"] as const;
const metricColors = ["#2563eb", "#059669", "#f59e0b", "#dc2626"];

export function Sport3DCharts({ data }: { data: DashboardSportChart[] }) {
  const [glReady, setGlReady] = useState(false);

  useEffect(() => {
    let active = true;
    import("echarts-gl").then(() => {
      if (active) setGlReady(true);
    });
    return () => {
      active = false;
    };
  }, []);

  const option = useMemo(() => {
    const deportes = data.map((item) => item.deporte);
    const chartData = data.flatMap((item, sportIndex) => [
      [sportIndex, 0, item.equipos],
      [sportIndex, 1, item.participantes],
      [sportIndex, 2, item.partidos],
      [sportIndex, 3, item.resultados],
    ]);

    return {
      tooltip: {
        backgroundColor: "#0f172a",
        borderColor: "rgba(255,255,255,0.12)",
        textStyle: { color: "#fff", fontWeight: 700 },
        formatter: (params: any) => {
          const [sportIndex, metricIndex, value] = params.value;
          return `${deportes[sportIndex]}<br/>${metricLabels[metricIndex]}: <strong>${value}</strong>`;
        },
      },
      xAxis3D: {
        type: "category",
        data: deportes,
        axisLabel: {
          color: "#475569",
          fontWeight: 800,
          interval: 0,
        },
        axisLine: { lineStyle: { color: "#cbd5e1" } },
      },
      yAxis3D: {
        type: "category",
        data: metricLabels,
        axisLabel: {
          color: "#475569",
          fontWeight: 800,
        },
        axisLine: { lineStyle: { color: "#cbd5e1" } },
      },
      zAxis3D: {
        type: "value",
        axisLabel: {
          color: "#64748b",
          fontWeight: 700,
        },
        axisLine: { lineStyle: { color: "#cbd5e1" } },
        splitLine: { lineStyle: { color: "rgba(148,163,184,0.18)" } },
      },
      grid3D: {
        boxWidth: 150,
        boxDepth: 72,
        boxHeight: 80,
        top: -16,
        environment: "#f8fafc",
        viewControl: {
          projection: "perspective",
          autoRotate: false,
          beta: 28,
          alpha: 18,
          distance: 210,
          rotateSensitivity: 1,
          zoomSensitivity: 0.8,
        },
        light: {
          main: {
            intensity: 1.35,
            shadow: true,
            alpha: 35,
            beta: 30,
          },
          ambient: {
            intensity: 0.52,
          },
        },
        axisPointer: {
          show: true,
          lineStyle: { color: "#2563eb" },
        },
      },
      series: [{
        type: "bar3D",
        data: chartData,
        bevelSize: 0.35,
        bevelSmoothness: 4,
        shading: "lambert",
        itemStyle: {
          color: (params: any) => metricColors[params.value[1] as number] ?? "#2563eb",
          opacity: 0.95,
        },
        label: {
          show: false,
        },
        emphasis: {
          label: {
            show: true,
            color: "#0f172a",
            fontWeight: 900,
          },
          itemStyle: {
            opacity: 1,
          },
        },
      }],
    };
  }, [data]);

  if (!data.length) {
    return (
      <div className="grid h-[360px] place-items-center rounded-2xl border border-slate-200 bg-slate-50 text-sm font-black text-slate-500">
        No hay datos deportivos para graficar.
      </div>
    );
  }

  if (!glReady) {
    return (
      <div className="grid h-[360px] place-items-center rounded-2xl border border-slate-200 bg-slate-50 text-sm font-black text-slate-500">
        Activando vista 3D...
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 shadow-inner">
      <ReactECharts option={option} style={{ height: 380, width: "100%" }} notMerge lazyUpdate />
    </div>
  );
}
