import { apiClient } from "./apiClient";

// DTO request
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
}

export interface VerifyOtpRequest {
  email: string;
  otp: string;
}

// DTO response
export interface AuthResponse {
  token: string;
  userId: string;
  email: string;
}

export interface AddProfileRequest {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  gender: string;
  dob: string;
  bio?: string;
}

// API call
export const authApi = {
  login: async (data: {
    email: string;
    password: string;
    rememberMe?: boolean;
  }) => {
    return apiClient.post("/auth/login", data);
  },

  sendOtp: async (email: string) => {
    return apiClient.post("/email/otp", { email });
  },

  register: async (data: { email: string; otp: string; password: string }) => {
    return apiClient.post("/auth/register", data);
  },

  addProfile: async (data: {
    email: string;
    fullname: string;
    phone: string;
    gender: string;
    dob: string;
  }) => {
    return apiClient.post("/auth/add-profile", data);
  },

  forgotPassword: async (email: string) => {
    return apiClient.post("/auth/forgot-password", { email });
  },

  resetPassword: async (data: {
    email: string;
    otp: string;
    newPassword: string;
  }) => {
    return apiClient.post("/auth/reset-password", data);
  },

  logout: async (refreshToken: string) => {
    return apiClient.post("/auth/logout", { refreshToken });
  },
};
