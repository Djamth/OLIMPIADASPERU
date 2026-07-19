"use client";

import { useAuth } from "@/context/AuthContext";
import {
  BarChart3,
  Eye,
  EyeOff,
  Loader2,
  LockKeyhole,
  LogIn,
  Mail,
  Medal,
  ShieldCheck,
  Trophy,
  UserRound,
  UsersRound,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const featureItems = [
  { label: "Deportes", icon: Trophy },
  { label: "Resultados", icon: Medal },
  { label: "Estadísticas", icon: BarChart3 },
  { label: "Atletas", icon: UsersRound },
  { label: "Competencias", icon: ShieldCheck },
];

export default function LoginPage() {
  const { login, isLoading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [form, setForm] = useState({
    email: "",
    password: "",
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
    "h-14 w-full rounded-r-xl border border-l-0 border-slate-200 bg-white px-4 text-sm font-semibold text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10";

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_8%_10%,rgba(21,101,192,0.12),transparent_26%),linear-gradient(135deg,#f8fbff,#eef4fb)] text-slate-950">
      <section className="grid min-h-screen overflow-hidden bg-white shadow-[0_30px_90px_rgba(15,23,42,0.16)] lg:grid-cols-[1.38fr_1fr]">
        <div className="relative hidden overflow-hidden bg-slate-950 lg:block">
          <div className="absolute inset-0 bg-[url('/images/fondo.png')] bg-cover bg-center" />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(4,20,52,0.22),rgba(4,20,52,0.99)),radial-gradient(circle_at_50%_24%,rgba(21,101,192,0.18),transparent_28%)]" />
          <div className="absolute left-8 top-8 h-40 w-40 rounded-full border border-sky-300/10 bg-[radial-gradient(circle,rgba(56,189,248,0.22)_1px,transparent_1px)] bg-[length:16px_16px] opacity-70" />
          <div className="absolute bottom-8 right-8 h-32 w-52 rounded-full border border-sky-300/10 bg-[radial-gradient(circle,rgba(255,255,255,0.22)_1px,transparent_1px)] bg-[length:14px_14px] opacity-60" />

          <div className="relative z-10 flex h-full flex-col items-center justify-center px-10 py-12 text-center text-white">
            <div className="mb-7 grid h-28 w-28 place-items-center rounded-full border border-white/20 bg-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.25)] backdrop-blur-md">
              <Trophy className="text-amber-300" size={58} />
            </div>
            <h1 className="text-6xl font-black uppercase tracking-normal drop-shadow-xl">Olimpiadas</h1>
            <p className="mt-3 text-lg font-bold uppercase tracking-[0.18em] text-sky-100/90">
              Sistema de gestión deportiva
            </p>

            <div className="mt-12 grid w-full max-w-3xl grid-cols-5 gap-5">
              {featureItems.map((item) => {
                const Icon = item.icon;
                return (
                  <div className="grid justify-items-center gap-3 text-white" key={item.label}>
                    <div className="grid h-12 w-12 place-items-center rounded-xl border border-sky-200/20 bg-sky-300/10 text-sky-200 backdrop-blur">
                      <Icon size={25} />
                    </div>
                    <span className="text-xs font-black uppercase">{item.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="flex min-h-screen items-center justify-center bg-white px-5 py-10 md:px-10">
          <section className="w-full max-w-md">
            <div className="mb-9 text-center">
              <div className="mx-auto mb-5 grid h-20 w-20 place-items-center rounded-full border border-slate-200 bg-slate-50 text-blue-600 shadow-[0_16px_34px_rgba(15,23,42,0.08)]">
                <UserRound size={38} />
              </div>
              <h2 className="text-4xl font-black tracking-normal text-slate-950">Bienvenido</h2>
              <p className="mt-2 text-base font-semibold text-slate-500">Inicia sesión para continuar</p>
            </div>

            <form className="grid gap-5" onSubmit={handleSubmit}>
              <label className="grid gap-2">
                <span className="text-sm font-black text-slate-800">Correo</span>
                <span className="flex">
                  <span className="grid h-14 w-14 place-items-center rounded-l-xl border border-slate-200 bg-white text-slate-500">
                    <Mail size={21} />
                  </span>
                  <input
                    type="email"
                    className={inputClass}
                    value={form.email}
                    onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
                    placeholder="Ingresa tu correo"
                    required
                  />
                </span>
              </label>

              <label className="grid gap-2">
                <span className="text-sm font-black text-slate-800">Contraseña</span>
                <span className="flex">
                  <span className="grid h-14 w-14 place-items-center rounded-l-xl border border-slate-200 bg-white text-slate-500">
                    <LockKeyhole size={21} />
                  </span>
                  <span className="relative flex-1">
                    <input
                      type={showPassword ? "text" : "password"}
                      className={`${inputClass} pr-12`}
                      value={form.password}
                      onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
                      placeholder="Ingresa tu contraseña"
                      required
                    />
                    <button
                      className="absolute right-3 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-lg text-slate-400 transition hover:bg-slate-50 hover:text-blue-600"
                      type="button"
                      onClick={() => setShowPassword((value) => !value)}
                      aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </span>
                </span>
              </label>

              <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
                <label className="inline-flex cursor-pointer items-center gap-2 font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded accent-blue-600"
                    checked={remember}
                    onChange={(event) => setRemember(event.target.checked)}
                  />
                  Recordarme
                </label>
                <Link className="font-bold text-blue-600 transition hover:text-blue-800" href="/recuperar-password">
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>

              <button
                type="submit"
                className="mt-1 inline-flex h-14 w-full items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-blue-700 to-blue-600 px-5 text-base font-black text-white shadow-[0_18px_36px_rgba(37,99,235,0.28)] transition hover:-translate-y-0.5 hover:from-blue-800 hover:to-blue-600 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={submitting || isLoading}
              >
                {submitting ? (
                  <>
                    <Loader2 className="animate-spin" size={21} />
                    Ingresando...
                  </>
                ) : (
                  <>
                    <LogIn size={21} />
                    Iniciar sesión
                  </>
                )}
              </button>
            </form>
          </section>
        </div>
      </section>
    </main>
  );
}
