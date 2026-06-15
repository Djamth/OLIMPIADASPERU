import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080/olimpiadas";
let refreshPromise: Promise<void> | null = null;

function clearStoredSession() {
  if (typeof window === "undefined") return;
  localStorage.removeItem("op_user");
}

async function refreshAccessToken() {
  await axios.post(
    `${API_BASE_URL}/api/auth/refresh-token`,
    {},
    { withCredentials: true },
  );
}

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error?.config as (typeof error.config & { _retry?: boolean }) | undefined;

    if (
      error?.response?.status === 401
      && originalRequest
      && !originalRequest._retry
      && !String(originalRequest.url ?? "").includes("/api/auth/")
      && typeof window !== "undefined"
    ) {
      originalRequest._retry = true;

      try {
        refreshPromise ??= refreshAccessToken().finally(() => {
          refreshPromise = null;
        });
        await refreshPromise;
        return api(originalRequest);
      } catch {
        clearStoredSession();
        if (!["/", "/login", "/recuperar-password", "/reset-password"].includes(window.location.pathname)) {
          window.location.assign("/login");
        }
      }
    }

    if (error?.response?.status === 403) {
      error.response.data = {
        ...(error.response.data ?? {}),
        mensaje: error.response.data?.mensaje ?? "Tu perfil no tiene permisos para realizar esta operación.",
      };

    }

    return Promise.reject(error);
  },
);

export { clearStoredSession };
