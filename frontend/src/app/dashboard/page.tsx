import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/common/PageHeader";
import { StatCard } from "@/components/common/StatCard";
import type { SummaryCard } from "@/types/dashboard";

const summary: SummaryCard[] = [
  { title: "Equipos activos", value: "24", subtitle: "Listos para competir", icon: "bi-people-fill", tone: "primary" },
  { title: "Participantes", value: "286", subtitle: "Registrados en el sistema", icon: "bi-person-badge-fill", tone: "success" },
  { title: "Partidos programados", value: "18", subtitle: "Calendario de la semana", icon: "bi-calendar2-event-fill", tone: "warning" },
  { title: "Resultados cargados", value: "12", subtitle: "Estadisticas al dia", icon: "bi-graph-up-arrow", tone: "danger" },
];

export default function DashboardPage() {
  return (
    <AppShell>
      <PageHeader
        title="Dashboard"
        description="Resumen general de la competencia, actividad deportiva y modulos mas consultados."
      />

      <div className="row g-4 mb-4">
        {summary.map((item) => (
          <div className="col-12 col-md-6 col-xl-3" key={item.title}>
            <StatCard {...item} />
          </div>
        ))}
      </div>

      <div className="row g-4">
        <div className="col-12 col-xl-8">
          <div className="surface-card p-4 h-100">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h3 className="h5 mb-0">Proximas contiendas</h3>
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
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Futbol</td>
                    <td>Brasil vs Francia</td>
                    <td>10/05/2026 09:00</td>
                    <td>Cancha Principal</td>
                  </tr>
                  <tr>
                    <td>Voley</td>
                    <td>Argentina vs Peru</td>
                    <td>10/05/2026 11:00</td>
                    <td>Coliseo Norte</td>
                  </tr>
                  <tr>
                    <td>Basquet</td>
                    <td>Chile vs Colombia</td>
                    <td>11/05/2026 14:00</td>
                    <td>Cancha Techada</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="col-12 col-xl-4">
          <div className="surface-card p-4 h-100">
            <h3 className="h5 mb-3">Estado del proyecto</h3>
            <div className="d-flex flex-column gap-3">
              <div className="p-3 rounded-3 bg-primary-subtle">
                <div className="fw-semibold text-primary mb-1">Backend estable</div>
                <div className="small text-soft">Autenticacion, CRUD y validaciones deportivas ya listas.</div>
              </div>
              <div className="p-3 rounded-3 bg-danger-subtle">
                <div className="fw-semibold text-danger mb-1">Frontend en construccion</div>
                <div className="small text-soft">Base Next.js con layout, login y navegacion ya preparada.</div>
              </div>
              <div className="p-3 rounded-3 bg-success-subtle">
                <div className="fw-semibold text-success mb-1">Siguiente integracion</div>
                <div className="small text-soft">Conectar listas y formularios reales de deportes, equipos y participantes.</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
