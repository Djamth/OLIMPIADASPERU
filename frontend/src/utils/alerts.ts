import Swal from "sweetalert2";
import type { AxiosError } from "axios";

const baseOptions = {
  confirmButtonColor: "#1565C0",
  cancelButtonColor: "#E53935",
  background: "#ffffff",
};

export const alerts = {
  success(title: string, text?: string) {
    return Swal.fire({ ...baseOptions, icon: "success", title, text });
  },
  error(title: string, text?: string) {
    return Swal.fire({ ...baseOptions, icon: "error", title, text });
  },
  warning(title: string, text?: string) {
    return Swal.fire({ ...baseOptions, icon: "warning", title, text });
  },
  confirm(title: string, text?: string) {
    return Swal.fire({
      ...baseOptions,
      icon: "question",
      title,
      text,
      showCancelButton: true,
      confirmButtonText: "Confirmar",
      cancelButtonText: "Cancelar",
    });
  },
  choose(title: string, text: string, confirmText: string, denyText: string) {
    return Swal.fire({
      ...baseOptions,
      icon: "question",
      title,
      text,
      showCancelButton: true,
      showDenyButton: true,
      confirmButtonText: confirmText,
      denyButtonText: denyText,
      cancelButtonText: "Cancelar",
    });
  },
  loading(title = "Procesando...") {
    return Swal.fire({
      title,
      allowEscapeKey: false,
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });
  },
  close() {
    Swal.close();
  },
};

export function getErrorMessage(error: unknown) {
  const axiosError = error as AxiosError<{ mensaje?: string; message?: string }>;
  if (axiosError.response?.status === 403) {
    return axiosError.response?.data?.mensaje
      ?? axiosError.response?.data?.message
      ?? "Tu perfil no tiene permisos para realizar esta operación.";
  }

  return axiosError.response?.data?.mensaje
    ?? axiosError.response?.data?.message
    ?? "No se pudo completar la operación.";
}
