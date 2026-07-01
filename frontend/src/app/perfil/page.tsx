"use client";

import { Badge } from "@/components/common/Badge";
import { AppShell } from "@/components/layout/AppShell";
import { useAuth } from "@/context/AuthContext";
import { authService } from "@/services/authService";
import { alerts, getErrorMessage } from "@/utils/alerts";
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  LockKeyhole,
  Mail,
  Save,
  ShieldCheck,
  UserRound,
  type LucideIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import type { FormEvent } from "react";
import { useEffect, useState } from "react";

function getInitials(name?: string | null) {
  return (name || "Usuario")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export default function PerfilPage() {
  const { user, updateUser } = useAuth();
  const router = useRouter();
  const [sendingRecovery, setSendingRecovery] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [profileForm, setProfileForm] = useState({ nombre: "", email: "" });
  const [passwordForm, setPasswordForm] = useState({
    passwordActual: "",
    nuevaPassword: "",
    confirmarPassword: "",
  });

  useEffect(() => {
    setProfileForm({
      nombre: user?.nombre ?? "",
      email: user?.email ?? "",
    });
  }, [user]);

  const modules = user?.modulos ?? [];

  const handleProfileSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!profileForm.nombre.trim() || !profileForm.email.trim()) {
      await alerts.warning("Datos incompletos", "Ingresa tu nombre y correo para actualizar el perfil.");
      return;
    }

    setSavingProfile(true);
    alerts.loading("Actualizando perfil");
    try {
      const response = await authService.updateProfile({
        nombre: profileForm.nombre.trim(),
        email: profileForm.email.trim(),
      });
      updateUser(response);
      alerts.close();
      await alerts.success("Perfil actualizado", "Tus datos fueron guardados correctamente.");
    } catch (error) {
      alerts.close();
      await alerts.error("No se pudo actualizar", getErrorMessage(error));
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (passwordForm.nuevaPassword.length < 6) {
      await alerts.warning("Contraseña débil", "La nueva contraseña debe tener al menos 6 caracteres.");
      return;
    }
    if (passwordForm.nuevaPassword !== passwordForm.confirmarPassword) {
      await alerts.warning("No coinciden", "La confirmación debe ser igual a la nueva contraseña.");
      return;
    }

    const result = await alerts.confirm(
      "Cambiar contraseña",
      "Se actualizará tu contraseña de acceso para próximas sesiones.",
    );
    if (!result.isConfirmed) return;

    setChangingPassword(true);
    alerts.loading("Actualizando contraseña");
    try {
      const response = await authService.changePassword({
        passwordActual: passwordForm.passwordActual,
        nuevaPassword: passwordForm.nuevaPassword,
      });
      setPasswordForm({ passwordActual: "", nuevaPassword: "", confirmarPassword: "" });
      alerts.close();
      await alerts.success("Contraseña actualizada", response.mensaje);
    } catch (error) {
      alerts.close();
      await alerts.error("No se pudo cambiar", getErrorMessage(error));
    } finally {
      setChangingPassword(false);
    }
  };

  const sendRecoveryCode = async () => {
    if (!user?.email) {
      await alerts.warning("Correo no disponible", "Tu cuenta no tiene un correo válido para recuperar contraseña.");
      return;
    }

    setSendingRecovery(true);
    alerts.loading("Enviando código");
    try {
      const response = await authService.forgotPassword({ email: user.email });
      alerts.close();
      await alerts.success("Código enviado", response.mensaje);
      router.push(`/reset-password?email=${encodeURIComponent(user.email)}`);
    } catch (error) {
      alerts.close();
      await alerts.error("No se pudo enviar el código", getErrorMessage(error));
    } finally {
      setSendingRecovery(false);
    }
  };

  return (
    <AppShell>
      <section className="grid gap-5">
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_24px_70px_rgba(15,23,42,0.08)]">
          <div className="relative bg-slate-950 px-6 py-8 text-white md:px-8">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_10%,rgba(37,99,235,0.42),transparent_30%),linear-gradient(135deg,rgba(15,23,42,0.2),rgba(15,23,42,0.92))]" />
            <div className="relative z-10 flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-4">
                <div className="grid h-20 w-20 place-items-center rounded-2xl bg-white text-2xl font-black text-blue-700 shadow-xl shadow-blue-950/30">
                  {getInitials(user?.nombre)}
                </div>
                <div>
                  <Badge tone={user?.estado === "ACTIVO" ? "green" : "amber"}>{user?.estado || "SIN ESTADO"}</Badge>
                  <h1 className="mt-3 text-3xl font-black tracking-normal md:text-4xl">{user?.nombre || "Usuario"}</h1>
                  <p className="mt-1 text-sm font-semibold text-slate-300">{user?.email || "Sin correo registrado"}</p>
                </div>
              </div>
              <div className="grid gap-2 rounded-xl border border-white/10 bg-white/10 p-4 backdrop-blur md:min-w-64">
                <span className="text-xs font-black uppercase tracking-[0.16em] text-slate-300">Perfil asignado</span>
                <strong className="text-xl font-black">{user?.rolNombre || "Invitado"}</strong>
                <span className="text-sm font-semibold text-slate-300">{modules.length} módulos habilitados</span>
              </div>
            </div>
          </div>

          <div className="grid gap-5 p-5 md:p-8 xl:grid-cols-[minmax(0,1.1fr)_minmax(360px,0.9fr)]">
            <section className="grid gap-5">
              <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="mb-5">
                  <h2 className="text-2xl font-black tracking-normal text-slate-950">Información de cuenta</h2>
                  <p className="mt-1 text-sm font-semibold text-slate-500">
                    Actualiza tus datos personales visibles dentro del panel administrativo.
                  </p>
                </div>

                <form className="grid gap-4" onSubmit={handleProfileSubmit}>
                  <label className="grid gap-2">
                    <span className="text-xs font-black uppercase tracking-[0.12em] text-slate-500">Nombre completo</span>
                    <div className="flex h-12 items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3">
                      <UserRound className="text-slate-400" size={18} />
                      <input
                        className="w-full bg-transparent text-sm font-bold text-slate-900 outline-none"
                        value={profileForm.nombre}
                        onChange={(event) => setProfileForm((prev) => ({ ...prev, nombre: event.target.value }))}
                        maxLength={100}
                      />
                    </div>
                  </label>

                  <label className="grid gap-2">
                    <span className="text-xs font-black uppercase tracking-[0.12em] text-slate-500">Correo</span>
                    <div className="flex h-12 items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3">
                      <Mail className="text-slate-400" size={18} />
                      <input
                        className="w-full bg-transparent text-sm font-bold text-slate-900 outline-none"
                        type="email"
                        value={profileForm.email}
                        onChange={(event) => setProfileForm((prev) => ({ ...prev, email: event.target.value }))}
                        maxLength={100}
                      />
                    </div>
                  </label>

                  <button
                    className="inline-flex h-11 w-fit items-center justify-center gap-2 rounded-xl bg-blue-700 px-5 text-sm font-black text-white shadow-[0_18px_34px_rgba(37,99,235,0.22)] transition hover:-translate-y-0.5 hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
                    type="submit"
                    disabled={savingProfile}
                  >
                    <Save size={17} />
                    Guardar perfil
                  </button>
                </form>
              </section>

              <section className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-black text-slate-950">Módulos disponibles</h3>
                    <p className="text-sm font-semibold text-slate-500">Accesos habilitados para tu perfil actual.</p>
                  </div>
                  <Badge tone="blue">{modules.length} activos</Badge>
                </div>
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {modules.length === 0 ? (
                    <p className="text-sm font-semibold text-slate-500">No hay módulos asignados.</p>
                  ) : modules.map((module) => (
                    <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2" key={module.id}>
                      <CheckCircle2 className="text-emerald-600" size={17} />
                      <span className="truncate text-sm font-extrabold text-slate-700">{module.nombre}</span>
                    </div>
                  ))}
                </div>
              </section>

              <div className="grid gap-3 sm:grid-cols-2">
                <InfoCard icon={ShieldCheck} label="Rol" value={user?.rolNombre || "Invitado"} />
                <InfoCard icon={Building2} label="Institución" value={user?.institucionNombre || "Sin institución asignada"} />
              </div>
            </section>

            <aside className="grid content-start gap-4">
              <section className="rounded-2xl border border-blue-100 bg-blue-50 p-5">
                <div className="mb-4 grid h-12 w-12 place-items-center rounded-xl bg-white text-blue-700 shadow-sm">
                  <KeyRound size={24} />
                </div>
                <h3 className="text-xl font-black text-slate-950">Cambiar contraseña</h3>
                <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">
                  Usa tu contraseña actual para confirmar la operación y proteger tu cuenta.
                </p>

                <form className="mt-5 grid gap-3" onSubmit={handlePasswordSubmit}>
                  <PasswordInput
                    label="Contraseña actual"
                    value={passwordForm.passwordActual}
                    show={showPassword}
                    onChange={(value) => setPasswordForm((prev) => ({ ...prev, passwordActual: value }))}
                    onToggle={() => setShowPassword((value) => !value)}
                  />
                  <PasswordInput
                    label="Nueva contraseña"
                    value={passwordForm.nuevaPassword}
                    show={showPassword}
                    onChange={(value) => setPasswordForm((prev) => ({ ...prev, nuevaPassword: value }))}
                    onToggle={() => setShowPassword((value) => !value)}
                  />
                  <PasswordInput
                    label="Confirmar contraseña"
                    value={passwordForm.confirmarPassword}
                    show={showPassword}
                    onChange={(value) => setPasswordForm((prev) => ({ ...prev, confirmarPassword: value }))}
                    onToggle={() => setShowPassword((value) => !value)}
                  />
                  <button
                    className="mt-2 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-blue-700 px-4 text-sm font-black text-white shadow-[0_18px_34px_rgba(37,99,235,0.22)] transition hover:-translate-y-0.5 hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
                    type="submit"
                    disabled={changingPassword}
                  >
                    <LockKeyhole size={17} />
                    Actualizar contraseña
                  </button>
                </form>

                <button
                  className="mt-3 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-blue-200 bg-white px-4 text-sm font-black text-blue-700 transition hover:-translate-y-0.5 hover:border-blue-300 disabled:cursor-not-allowed disabled:opacity-60"
                  type="button"
                  disabled={sendingRecovery}
                  onClick={sendRecoveryCode}
                >
                  Enviar código por correo
                  <ArrowRight size={16} />
                </button>
              </section>

              <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="mb-4 grid h-12 w-12 place-items-center rounded-xl bg-emerald-50 text-emerald-700">
                  <BadgeCheck size={24} />
                </div>
                <h3 className="text-xl font-black text-slate-950">Estado de sesión</h3>
                <div className="mt-4 grid gap-3">
                  <StatusRow label="Autenticación" value="Activa" />
                  <StatusRow label="Tipo de token" value={user?.tokenType || "Cookie"} />
                  <StatusRow label="Alcance" value={user?.rolNombre || "Invitado"} />
                </div>
              </section>
            </aside>
          </div>
        </div>
      </section>
    </AppShell>
  );
}

function PasswordInput({
  label,
  value,
  show,
  onChange,
  onToggle,
}: {
  label: string;
  value: string;
  show: boolean;
  onChange: (value: string) => void;
  onToggle: () => void;
}) {
  return (
    <label className="grid gap-2">
      <span className="text-xs font-black uppercase tracking-[0.12em] text-slate-500">{label}</span>
      <div className="flex h-12 items-center gap-3 rounded-xl border border-blue-100 bg-white px-3">
        <LockKeyhole className="text-slate-400" size={18} />
        <input
          className="w-full bg-transparent text-sm font-bold text-slate-900 outline-none"
          type={show ? "text" : "password"}
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
        <button className="text-slate-400 transition hover:text-blue-700" type="button" onClick={onToggle} aria-label={show ? "Ocultar contraseña" : "Mostrar contraseña"}>
          {show ? <EyeOff size={17} /> : <Eye size={17} />}
        </button>
      </div>
    </label>
  );
}

function InfoCard({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 grid h-10 w-10 place-items-center rounded-lg bg-blue-50 text-blue-700">
        <Icon size={19} />
      </div>
      <span className="text-xs font-black uppercase tracking-[0.12em] text-slate-400">{label}</span>
      <strong className="mt-1 block break-words text-sm font-black text-slate-900">{value}</strong>
    </div>
  );
}

function StatusRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg bg-slate-50 px-3 py-2">
      <span className="text-sm font-bold text-slate-500">{label}</span>
      <strong className="text-sm font-black text-slate-900">{value}</strong>
    </div>
  );
}
