"use client";

import { authService } from "@/services/authService";
import { alerts, getErrorMessage } from "@/utils/alerts";
import { ArrowLeft, Eye, EyeOff, KeyRound, Loader2, LockKeyhole, Mail, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useMemo, useState } from "react";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialEmail = useMemo(() => searchParams.get("email") ?? "", [searchParams]);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    email: initialEmail,
    codigo: "",
    nuevaPassword: "",
    confirmarPassword: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (form.nuevaPassword.length < 6) {
      await alerts.warning("Contraseña muy corta", "La nueva contraseña debe tener al menos 6 caracteres.");
      return;
    }

    if (form.nuevaPassword !== form.confirmarPassword) {
      await alerts.warning("No coinciden", "Confirma la misma contraseña antes de continuar.");
      return;
    }

    setSubmitting(true);
    alerts.loading("Actualizando contraseña");

    try {
      const response = await authService.resetPassword({
        email: form.email,
        codigo: form.codigo,
        nuevaPassword: form.nuevaPassword,
      });
      alerts.close();
      await alerts.success("Contraseña actualizada", response.mensaje);
      router.push("/login");
    } catch (error) {
      alerts.close();
      await alerts.error("No se pudo actualizar", getErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass =
    "h-14 w-full rounded-r-xl border border-l-0 border-slate-200 bg-white px-4 text-sm font-semibold text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10";

  return (
    <main className="min-h-screen bg-slate-100 p-4 text-slate-950 md:p-7">
      <section className="mx-auto grid min-h-[calc(100vh-3.5rem)] max-w-6xl overflow-hidden rounded-[28px] border border-white/80 bg-white shadow-[0_30px_90px_rgba(15,23,42,0.14)] lg:grid-cols-[0.95fr_1.05fr]">
        <div className="relative hidden overflow-hidden bg-slate-950 lg:block">
          <div className="absolute inset-0 bg-[url('/images/fondo.png')] bg-cover bg-center" />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(4,20,52,0.2),rgba(4,20,52,0.68))]" />
          <div className="relative z-10 flex h-full flex-col justify-end p-12 text-white">
            <div className="mb-6 grid h-16 w-16 place-items-center rounded-2xl border border-white/20 bg-white/10 backdrop-blur">
              <KeyRound className="text-amber-200" size={34} />
            </div>
            <h1 className="text-4xl font-black tracking-normal">Nueva contraseña</h1>
            <p className="mt-4 max-w-md text-sm font-semibold leading-6 text-sky-50/85">
              Usa el código enviado a tu correo. Al confirmar, el código quedará marcado como utilizado.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-center px-5 py-10 md:px-12">
          <section className="w-full max-w-md">
            <Link className="mb-8 inline-flex items-center gap-2 text-sm font-black text-slate-500 transition hover:text-blue-700" href="/login">
              <ArrowLeft size={18} />
              Volver al inicio de sesión
            </Link>

            <div className="mb-8">
              <div className="mb-5 grid h-16 w-16 place-items-center rounded-2xl bg-blue-50 text-blue-700 ring-1 ring-blue-100">
                <ShieldCheck size={31} />
              </div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-700">Validación final</p>
              <h2 className="mt-2 text-4xl font-black tracking-normal text-slate-950">Restablecer acceso</h2>
              <p className="mt-3 text-sm font-semibold leading-6 text-slate-500">
                Ingresa el código de 6 dígitos y define una nueva contraseña para tu cuenta.
              </p>
            </div>

            <form className="grid gap-5" onSubmit={handleSubmit}>
              <label className="grid gap-2">
                <span className="text-sm font-black text-slate-800">Correo</span>
                <span className="flex">
                  <span className="grid h-14 w-14 place-items-center rounded-l-xl border border-slate-200 bg-white text-slate-500">
                    <Mail size={21} />
                  </span>
                  <input
                    className={inputClass}
                    type="email"
                    value={form.email}
                    onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
                    placeholder="Correo registrado"
                    required
                  />
                </span>
              </label>

              <label className="grid gap-2">
                <span className="text-sm font-black text-slate-800">Código</span>
                <span className="flex">
                  <span className="grid h-14 w-14 place-items-center rounded-l-xl border border-slate-200 bg-white text-slate-500">
                    <KeyRound size={21} />
                  </span>
                  <input
                    className={inputClass}
                    inputMode="numeric"
                    maxLength={6}
                    value={form.codigo}
                    onChange={(event) => setForm((prev) => ({ ...prev, codigo: event.target.value.replace(/\D/g, "") }))}
                    placeholder="000000"
                    required
                  />
                </span>
              </label>

              <label className="grid gap-2">
                <span className="text-sm font-black text-slate-800">Nueva contraseña</span>
                <span className="flex">
                  <span className="grid h-14 w-14 place-items-center rounded-l-xl border border-slate-200 bg-white text-slate-500">
                    <LockKeyhole size={21} />
                  </span>
                  <span className="relative flex-1">
                    <input
                      className={`${inputClass} pr-12`}
                      type={showPassword ? "text" : "password"}
                      value={form.nuevaPassword}
                      onChange={(event) => setForm((prev) => ({ ...prev, nuevaPassword: event.target.value }))}
                      placeholder="Mínimo 6 caracteres"
                      required
                      minLength={6}
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

              <label className="grid gap-2">
                <span className="text-sm font-black text-slate-800">Confirmar contraseña</span>
                <span className="flex">
                  <span className="grid h-14 w-14 place-items-center rounded-l-xl border border-slate-200 bg-white text-slate-500">
                    <LockKeyhole size={21} />
                  </span>
                  <input
                    className={inputClass}
                    type={showPassword ? "text" : "password"}
                    value={form.confirmarPassword}
                    onChange={(event) => setForm((prev) => ({ ...prev, confirmarPassword: event.target.value }))}
                    placeholder="Repite la nueva contraseña"
                    required
                    minLength={6}
                  />
                </span>
              </label>

              <button
                className="inline-flex h-14 w-full items-center justify-center gap-3 rounded-xl bg-blue-700 px-5 text-base font-black text-white shadow-[0_18px_36px_rgba(37,99,235,0.22)] transition hover:-translate-y-0.5 hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
                type="submit"
                disabled={submitting}
              >
                {submitting ? <Loader2 className="animate-spin" size={21} /> : <ShieldCheck size={21} />}
                Actualizar contraseña
              </button>
            </form>
          </section>
        </div>
      </section>
    </main>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<main className="grid min-h-screen place-items-center bg-slate-100 text-sm font-black text-slate-500">Cargando recuperación...</main>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
