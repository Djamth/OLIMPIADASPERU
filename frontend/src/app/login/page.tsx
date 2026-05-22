"use client";

import { useAuth } from "@/context/AuthContext";
import { useState } from "react";

export default function LoginPage() {
  const { login, isLoading } = useAuth();
  const [form, setForm] = useState({
    email: "admin@olimpiadasperu.pe",
    password: "Admin123*",
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      await login(form);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="login-surface d-flex align-items-center">
      <div className="container py-5">
        <div className="row align-items-center g-5">
          <div className="col-12 col-lg-6 text-white">
            <span className="chip login-chip fw-semibold mb-3">
              <i className="bi bi-trophy-fill" />
              Plataforma deportiva institucional
            </span>
            <h1 className="display-5 fw-bold mb-3">
              Gestiona olimpiadas internas con una experiencia moderna, clara y competitiva.
            </h1>
            <p className="lead mb-4 text-white-50">
              Organiza deportes, equipos, participantes, programacion y resultados desde un solo panel administrativo.
            </p>
            <div className="row g-3">
              <div className="col-sm-6">
                <div className="login-feature-card p-3 h-100">
                  <div className="fw-semibold mb-1">Reglas por deporte</div>
                  <div className="small">Validaciones listas para futbol, basquet, voley y ping pong.</div>
                </div>
              </div>
              <div className="col-sm-6">
                <div className="login-feature-card p-3 h-100">
                  <div className="fw-semibold mb-1">Resultados y ranking</div>
                  <div className="small">Anotaciones reales por participante y estadisticas deportivas.</div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-12 col-lg-5 ms-lg-auto">
            <div className="login-panel p-4 p-lg-5">
              <div className="text-center mb-4">
                <div
                  className="login-lock mx-auto mb-3 d-flex align-items-center justify-content-center rounded-circle"
                >
                  <i className="bi bi-person-lock fs-2" />
                </div>
                <h2 className="h3 mb-1">Iniciar sesion</h2>
                <p className="mb-0 login-muted">Accede al panel de Olimpiadas Peru</p>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label">Correo</label>
                  <div className="input-group">
                    <span className="input-group-text">
                      <i className="bi bi-envelope" />
                    </span>
                    <input
                      type="email"
                      className="form-control"
                      value={form.email}
                      onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
                      required
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label className="form-label">Contrasena</label>
                  <div className="input-group">
                    <span className="input-group-text">
                      <i className="bi bi-shield-lock" />
                    </span>
                    <input
                      type="password"
                      className="form-control"
                      value={form.password}
                      onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
                      required
                    />
                  </div>
                </div>

                <button type="submit" className="btn btn-primary w-100 py-2 rounded-pill" disabled={submitting || isLoading}>
                  {submitting ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" />
                      Ingresando...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-box-arrow-in-right me-2" />
                      Ingresar al sistema
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
