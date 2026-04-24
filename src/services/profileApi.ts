import { apiClient } from "./apiClient";

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

export interface UpdateProfileRequest {
  firstName: string;
  lastName: string;
  bio: string;
}

export interface UpdateAvatarRequest {
  avatarUrl: string;
  publicId: string;
}

export const getNearbyUsers = async (lat: number, lng: number, radius: number = 2000) => {
  return await apiClient.get(`/users/nearby?lat=${lat}&lng=${lng}&radius=${radius}`);
};

export const searchUsersGlobally = async (query: string) => {
  return await apiClient.get(`/users/search?q=${encodeURIComponent(query)}`);
};
export const profileApi = {
  getProfile: async (): Promise<ProfileResponse> => {
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
