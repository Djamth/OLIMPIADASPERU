import { AppShell } from "@/components/layout/AppShell";
import Link from "next/link";
import {
  ArrowUpRight,
  BarChart3,
  CalendarDays,
  ClipboardCheck,
  Medal,
  Trophy,
  UsersRound,
} from "lucide-react";

const metrics = [
  {
    title: "Equipos activos",
    value: "24",
    change: "+8% este mes",
    icon: UsersRound,
    tone: "primary",
  },
  {
    title: "Participantes",
    value: "286",
    change: "+41 registros",
    icon: ClipboardCheck,
    tone: "success",
  },
  {
    title: "Partidos programados",
    value: "18",
    change: "7 por jugarse",
    icon: CalendarDays,
    tone: "warning",
  },
  {
    title: "Resultados cargados",
    value: "12",
    change: "Ranking actualizado",
    icon: Medal,
    tone: "danger",
  },
];

const bars = [28, 54, 48, 82, 22, 74, 76, 86, 58, 31];

const moduleLinks = [
  { href: "/instituciones", label: "Instituciones", value: "Clientes y sedes" },
  { href: "/equipos", label: "Equipos", value: "Delegaciones" },
  { href: "/participantes", label: "Participantes", value: "Deportistas" },
  { href: "/programacion", label: "Programacion", value: "Calendario" },
  { href: "/resultados", label: "Resultados", value: "Marcadores" },
  { href: "/estadisticas", label: "Estadisticas", value: "Rankings" },
];

export default function DashboardPage() {
  return (
    <AppShell>
      <section className="dashboard-hero mb-4">
        <div>
          <span className="module-eyebrow text-white-50">Resumen general</span>
          <h2 className="display-6 fw-bold mb-2">Gestion central de Olimpiadas Peru</h2>
          <p className="mb-0 text-white-75">
            Monitorea equipos, deportes, programacion, resultados y estadisticas desde un solo panel.
          </p>
        </div>
        <Link href="/programacion" className="btn btn-light d-inline-flex align-items-center gap-2">
          Ver calendario
          <ArrowUpRight size={16} />
        </Link>
      </section>

      <div className="row g-3 mb-4">
        {metrics.map((item) => {
          const Icon = item.icon;
          return (
            <div className="col-12 col-md-6 col-xl-3" key={item.title}>
              <article className={`metric-card metric-${item.tone}`}>
                <div className="d-flex align-items-center justify-content-between mb-3">
                  <div className="metric-icon">
                    <Icon size={19} />
                  </div>
                  <span className="status-pill">Activo</span>
                </div>
                <p className="text-soft small mb-1">{item.title}</p>
                <div className="d-flex align-items-end justify-content-between gap-3">
                  <strong className="metric-value">{item.value}</strong>
                  <span className="metric-change">{item.change}</span>
                </div>
              </article>
            </div>
          );
        })}
      </div>

      <div className="row g-4 mb-4">
        <div className="col-12 col-xl-8">
          <section className="surface-card p-4 h-100">
            <div className="d-flex flex-column flex-md-row justify-content-between gap-2 mb-4">
              <div>
                <h3 className="h5 fw-bold mb-1">Actividad semanal</h3>
                <p className="text-soft mb-0">Partidos registrados por fecha y estado de competencia.</p>
              </div>
              <span className="badge rounded-pill text-bg-light border align-self-start">Ultimos 10 dias</span>
            </div>
            <div className="dashboard-bars">
              {bars.map((height, index) => (
                <div className="dashboard-bar-track" key={index}>
                  <span style={{ height: `${height}%` }} />
                </div>
              ))}
            </div>
            <div className="d-flex justify-content-between text-soft small mt-3">
              <span>01 May</span>
              <span>05 May</span>
              <span>10 May</span>
            </div>
          </section>
        </div>

        <div className="col-12 col-xl-4">
          <section className="surface-card p-4 h-100">
            <div className="d-flex align-items-center justify-content-between mb-3">
              <div>
                <h3 className="h5 fw-bold mb-1">Avance funcional</h3>
                <p className="text-soft mb-0">Procesos listos para pruebas.</p>
              </div>
              <BarChart3 className="text-primary" size={22} />
            </div>
            <div className="d-flex flex-column gap-3">
              {[
                ["Autenticacion y seguridad", "100%"],
                ["CRUD principales", "85%"],
                ["Reglas por deporte", "75%"],
                ["Frontend conectado", "65%"],
              ].map(([label, value]) => (
                <div key={label}>
                  <div className="d-flex justify-content-between small fw-semibold mb-1">
                    <span>{label}</span>
                    <span>{value}</span>
                  </div>
                  <div className="progress progress-slim">
                    <div className="progress-bar" style={{ width: value }} />
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>

      <div className="row g-4">
        <div className="col-12 col-xl-8">
          <section className="surface-card p-4 h-100">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h3 className="h5 fw-bold mb-0">Proximas contiendas</h3>
              <span className="badge text-bg-primary">Semana actual</span>
            </div>
            <div className="table-responsive">
              <table className="table table-modern align-middle mb-0">
                <thead>
                  <tr>
                    <th>Deporte</th>
                    <th>Encuentro</th>
                    <th>Fecha</th>
                    <th>Sede</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Futbol</td>
                    <td>Brasil vs Francia</td>
                    <td>10/05/2026 09:00</td>
                    <td>Cancha Principal</td>
                    <td><span className="status-pill status-blue">Programado</span></td>
                  </tr>
                  <tr>
                    <td>Voley</td>
                    <td>Argentina vs Peru</td>
                    <td>10/05/2026 11:00</td>
                    <td>Coliseo Norte</td>
                    <td><span className="status-pill status-red">Por confirmar</span></td>
                  </tr>
                  <tr>
                    <td>Basquet</td>
                    <td>Chile vs Colombia</td>
                    <td>11/05/2026 14:00</td>
                    <td>Cancha Techada</td>
                    <td><span className="status-pill status-green">Listo</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        </div>

        <div className="col-12 col-xl-4">
          <section className="surface-card p-4 h-100">
            <div className="d-flex align-items-center gap-2 mb-3">
              <Trophy className="text-danger" size={20} />
              <h3 className="h5 fw-bold mb-0">Modulos rapidos</h3>
            </div>
            <div className="module-shortcuts">
              {moduleLinks.map((item) => (
                <Link href={item.href} className="module-shortcut" key={item.href}>
                  <span>
                    <strong>{item.label}</strong>
                    <small>{item.value}</small>
                  </span>
                  <ArrowUpRight size={16} />
                </Link>
              ))}
            </div>
          </section>
        </div>
      </div>
    </AppShell>
  );
}
