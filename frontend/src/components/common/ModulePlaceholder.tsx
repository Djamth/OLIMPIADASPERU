import { PageHeader } from "@/components/common/PageHeader";

export function ModulePlaceholder({
  title,
  description,
  buttonLabel,
}: {
  title: string;
  description: string;
  buttonLabel: string;
}) {
  return (
    <>
      <PageHeader
        title={title}
        description={description}
        action={
          <button className="btn btn-primary rounded-pill px-4">
            <i className="bi bi-plus-circle me-2" />
            {buttonLabel}
          </button>
        }
      />

      <div className="row g-4">
        <div className="col-12 col-xl-8">
          <div className="surface-card p-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h3 className="h5 mb-0">Listado principal</h3>
              <span className="chip bg-primary-subtle text-primary">
                <i className="bi bi-lightning-charge-fill" />
                Listo para integrar
              </span>
            </div>

            <div className="table-responsive">
              <table className="table table-modern align-middle mb-0">
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Estado</th>
                    <th>Ultima actualizacion</th>
                    <th className="text-end">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {[1, 2, 3].map((row) => (
                    <tr key={row}>
                      <td>{title} Demo {row}</td>
                      <td>
                        <span className="badge text-bg-success">Activo</span>
                      </td>
                      <td className="text-soft">07/05/2026</td>
                      <td className="text-end">
                        <button className="btn btn-sm btn-outline-primary me-2">
                          <i className="bi bi-pencil-square" />
                        </button>
                        <button className="btn btn-sm btn-outline-danger">
                          <i className="bi bi-trash3" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="col-12 col-xl-4">
          <div className="surface-card p-4 h-100">
            <h3 className="h5 mb-3">Siguiente paso</h3>
            <p className="text-soft mb-3">
              Esta vista ya tiene la estructura visual base para enganchar el CRUD del backend.
            </p>
            <ul className="list-group list-group-flush">
              <li className="list-group-item px-0">Formulario crear y editar en modal</li>
              <li className="list-group-item px-0">Consumo real con Axios</li>
              <li className="list-group-item px-0">Alertas SweetAlert2 para confirmar acciones</li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}
