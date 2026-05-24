import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080/olimpiadas";

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("op_access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 403) {
      error.response.data = {
        ...(error.response.data ?? {}),
        mensaje: error.response.data?.mensaje ?? "Tu perfil no tiene permisos para realizar esta operacion.",
      };

    }

    return Promise.reject(error);
  },
);
