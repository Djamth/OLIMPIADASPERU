"use client";

import { useAuth } from "@/context/AuthContext";
import { Loader2, LockKeyhole, LogIn, Mail, ShieldCheck, Trophy } from "lucide-react";
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

  const inputClass =
    "h-12 w-full rounded-r-lg border border-l-0 border-white/15 bg-white/10 px-3 text-sm font-semibold text-white outline-none transition placeholder:text-white/35 focus:border-sky-400/70 focus:bg-white/[0.14] focus:ring-4 focus:ring-sky-400/15";

  return (
    <main className="login-surface grid min-h-screen place-items-center px-4 py-10">
      <div className="mx-auto grid w-full max-w-6xl items-center gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(380px,0.9fr)]">
        <section className="text-white">
          <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-sm font-bold text-sky-100 backdrop-blur">
            <Trophy size={17} />
            Plataforma deportiva institucional
          </span>
          <h1 className="mb-4 max-w-3xl text-4xl font-extrabold leading-tight tracking-normal md:text-5xl">
            Gestiona olimpiadas internas con una experiencia moderna, clara y competitiva.
          </h1>
          <p className="mb-6 max-w-2xl text-base font-medium leading-7 text-white/55 md:text-lg">
            Organiza deportes, equipos, participantes, programacion y resultados desde un solo panel administrativo.
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <article className="rounded-lg border border-white/15 bg-white/10 p-4 text-white backdrop-blur">
              <div className="mb-1 font-extrabold">Reglas por deporte</div>
              <div className="text-sm font-medium text-white/60">Validaciones listas para futbol, basquet, voley y ping pong.</div>
            </article>
            <article className="rounded-lg border border-white/15 bg-white/10 p-4 text-white backdrop-blur">
              <div className="mb-1 font-extrabold">Resultados y ranking</div>
              <div className="text-sm font-medium text-white/60">Anotaciones reales por participante y estadisticas deportivas.</div>
            </article>
          </div>
        </section>

        <section className="rounded-xl border border-white/15 bg-white/[0.11] p-6 text-white shadow-[0_24px_70px_rgba(0,0,0,0.35)] backdrop-blur-xl md:p-9">
          <div className="mb-6 text-center">
            <div className="mx-auto mb-4 grid h-[72px] w-[72px] place-items-center rounded-full bg-sky-400/15 text-sky-300">
              <LockKeyhole size={34} />
            </div>
            <h2 className="mb-1 text-3xl font-extrabold">Iniciar sesion</h2>
            <p className="text-sm font-medium text-white/55">Accede al panel de Olimpiadas Peru</p>
          </div>

          <form className="grid gap-4" onSubmit={handleSubmit}>
            <label className="grid gap-2">
              <span className="text-sm font-bold text-white/80">Correo</span>
              <span className="flex">
                <span className="grid h-12 w-12 place-items-center rounded-l-lg border border-white/15 bg-white/10 text-sky-300">
                  <Mail size={18} />
                </span>
                <input
                  type="email"
                  className={inputClass}
                  value={form.email}
                  onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
                  required
                />
              </span>
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-bold text-white/80">Contrasena</span>
              <span className="flex">
                <span className="grid h-12 w-12 place-items-center rounded-l-lg border border-white/15 bg-white/10 text-sky-300">
                  <ShieldCheck size={18} />
                </span>
                <input
                  type="password"
                  className={inputClass}
                  value={form.password}
                  onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
                  required
                />
              </span>
            </label>

            <button
              type="submit"
              className="mt-2 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-blue-600 px-5 text-sm font-extrabold text-white shadow-[0_14px_28px_rgba(21,101,192,0.28)] transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={submitting || isLoading}
            >
              {submitting ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  Ingresando...
                </>
              ) : (
                <>
                  <LogIn size={18} />
                  Ingresar al sistema
                </>
              )}
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}
