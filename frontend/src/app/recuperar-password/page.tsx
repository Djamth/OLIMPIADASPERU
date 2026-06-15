"use client";

import { authService } from "@/services/authService";
import { getErrorMessage, alerts } from "@/utils/alerts";
import { ArrowLeft, Loader2, Mail, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function RecuperarPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    alerts.loading("Enviando código");

    try {
      const response = await authService.forgotPassword({ email });
      alerts.close();
      await alerts.success("Código enviado", response.mensaje);
      router.push(`/reset-password?email=${encodeURIComponent(email)}`);
    } catch (error) {
      alerts.close();
      await alerts.error("No se pudo enviar el código", getErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-100 p-4 text-slate-950 md:p-7">
      <section className="mx-auto grid min-h-[calc(100vh-3.5rem)] max-w-6xl overflow-hidden rounded-[28px] border border-white/80 bg-white shadow-[0_30px_90px_rgba(15,23,42,0.14)] lg:grid-cols-[0.95fr_1.05fr]">
        <div className="relative hidden overflow-hidden bg-slate-950 lg:block">
          <div className="absolute inset-0 bg-[url('/images/fondo.png')] bg-cover bg-center" />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(4,20,52,0.18),rgba(4,20,52,0.66))]" />
          <div className="relative z-10 flex h-full flex-col justify-end p-12 text-white">
            <div className="mb-6 grid h-16 w-16 place-items-center rounded-2xl border border-white/20 bg-white/10 backdrop-blur">
              <ShieldCheck className="text-sky-200" size={34} />
            </div>
            <h1 className="text-4xl font-black tracking-normal">Recuperación segura</h1>
            <p className="mt-4 max-w-md text-sm font-semibold leading-6 text-sky-50/85">
              Enviaremos un código temporal de 6 dígitos al correo registrado para validar el cambio de contraseña.
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
                <Mail size={31} />
              </div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-700">Seguridad de cuenta</p>
              <h2 className="mt-2 text-4xl font-black tracking-normal text-slate-950">Recuperar contraseña</h2>
              <p className="mt-3 text-sm font-semibold leading-6 text-slate-500">
                Ingresa tu correo institucional. Si existe una cuenta activa, recibirás un código para continuar.
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
                    className="h-14 w-full rounded-r-xl border border-l-0 border-slate-200 bg-white px-4 text-sm font-semibold text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="admin@olimpiadasperu.pe"
                    required
                  />
                </span>
              </label>

              <button
                className="inline-flex h-14 w-full items-center justify-center gap-3 rounded-xl bg-blue-700 px-5 text-base font-black text-white shadow-[0_18px_36px_rgba(37,99,235,0.22)] transition hover:-translate-y-0.5 hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
                type="submit"
                disabled={submitting}
              >
                {submitting ? <Loader2 className="animate-spin" size={21} /> : <Mail size={21} />}
                Enviar código
              </button>
            </form>
          </section>
        </div>
      </section>
    </main>
  );
}
