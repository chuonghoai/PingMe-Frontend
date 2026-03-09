import { apiClient } from "./apiClient";

// --- 1. RESPONSE TỪ GET /users/me ---
export interface ProfileResponse {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  avatarUrl: string;
  bio: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

// --- 2. REQUEST CHO PUT /users/me ---
export interface UpdateProfileRequest {
  firstName: string;
  lastName: string;
  bio: string;
}

// --- 3. REQUEST CHO PATCH /users/avatar ---
export interface UpdateAvatarRequest {
  avatarUrl: string;
  publicId: string;
}

// --- 4. CÁC HÀM GỌI API ---
export const profileApi = {
  getProfile: async (): Promise<ProfileResponse> => {
    // Tự động nhận header Authorization Bearer từ apiClient
    const response = await apiClient.get<{
      success: boolean;
      data: ProfileResponse;
    }>("/users/me");
    return response.data.data;
  },

  updateProfile: async (
    data: UpdateProfileRequest,
  ): Promise<{ updatedAt: string }> => {
    const response = await apiClient.put<{
      success: boolean;
      data: { updatedAt: string };
    }>("/users/me", data);
    return response.data.data;
  },

  updateAvatar: async (
    data: UpdateAvatarRequest,
  ): Promise<{ avatarUrl: string; updatedAt: string }> => {
    const response = await apiClient.patch<{
      success: boolean;
      data: { avatarUrl: string; updatedAt: string };
    }>("/users/avatar", data);
    return response.data.data;
  },
};
