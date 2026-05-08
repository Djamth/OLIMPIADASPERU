import Swal from "sweetalert2";

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
