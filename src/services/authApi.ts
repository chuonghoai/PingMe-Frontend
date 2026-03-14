import { apiClient } from "./apiClient";

// --- 1. ĐỊNH NGHĨA KIỂU DỮ LIỆU GỬI ĐI (REQUEST) ---
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

// --- 2. ĐỊNH NGHĨA KIỂU DỮ LIỆU NHẬN VỀ (RESPONSE) ---
export interface AuthResponse {
  token: string;
  userId: string;
  email: string;
  // Bạn có thể tùy chỉnh thêm dựa vào DTO của Spring Boot trả về
}

export interface AddProfileRequest {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  gender: string;
  dob: string;
  bio?: string; // Optional (Có thể thêm sau)
}

// --- 3. GOM NHÓM CÁC HÀM GỌI API ---
export const authApi = {
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    // Gọi POST tới endpoint /auth/login của Spring Boot
    const response = await apiClient.post<AuthResponse>("/auth/login", data);
    return response.data;
  },

  register: async (data: RegisterRequest): Promise<void> => {
    await apiClient.post("/auth/register", data);
  },

  verifyOtp: async (data: VerifyOtpRequest): Promise<boolean> => {
    const response = await apiClient.post<boolean>("/auth/verify-otp", data);
    return response.data;
  },

  resendOtp: async (email: string): Promise<void> => {
    await apiClient.post("/auth/resend-otp", { email });
  },

  addProfile: async (data: AddProfileRequest): Promise<void> => {
    // Gọi POST tới endpoint /auth/add-profile
    await apiClient.post("/auth/add-profile", data);
  },
};
