import { api } from "@/services/api";
import type {
  ApiMessageResponse,
  CambiarPasswordRequest,
  ForgotPasswordRequest,
  LoginRequest,
  LoginResponse,
  PerfilUpdateRequest,
  ResetPasswordRequest,
} from "@/types/auth";

export const authService = {
  async login(payload: LoginRequest) {
    const { data } = await api.post<LoginResponse>("/api/auth/login", payload);
    return data;
  },

  async me() {
    const { data } = await api.get<LoginResponse>("/api/auth/me");
    return data;
  },

  async logout() {
    await api.post("/api/auth/logout");
  },

  async forgotPassword(payload: ForgotPasswordRequest) {
    const { data } = await api.post<ApiMessageResponse>("/api/auth/forgot-password", payload);
    return data;
  },

  async resetPassword(payload: ResetPasswordRequest) {
    const { data } = await api.post<ApiMessageResponse>("/api/auth/reset-password", payload);
    return data;
  },

  async updateProfile(payload: PerfilUpdateRequest) {
    const { data } = await api.put<LoginResponse>("/api/perfil", payload);
    return data;
  },

  async changePassword(payload: CambiarPasswordRequest) {
    const { data } = await api.put<ApiMessageResponse>("/api/perfil/password", payload);
    return data;
  },
};
