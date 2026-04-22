import { apiClient } from "./apiClient";

export const momentsApi = {
  // Create a new moment
  createMoment: async (data: {
    imageUrl: string;
    caption?: string;
    latitude: number;
    longitude: number;
  }) => {
    return apiClient.post("/moments", data);
  },

  // Delete own moment
  deleteMoment: async (momentId: string) => {
    return apiClient.delete(`/moments/${momentId}`);
  },

  // Get global feed (my + friends' moments)
  getGlobalFeed: async (page: number = 1, limit: number = 20) => {
    return apiClient.get(`/moments/global-feed?page=${page}&limit=${limit}`);
  },

  // Get local feed (moments at specific coordinate)
  getLocalFeed: async (lat: number, lng: number, page: number = 1, limit: number = 20) => {
    return apiClient.get(`/moments/local-feed?lat=${lat}&lng=${lng}&page=${page}&limit=${limit}`);
  },

  // Get map clusters
  getMapClusters: async () => {
    return apiClient.get("/moments/map-clusters");
  },

  // Report a moment
  reportMoment: async (momentId: string, reason: string, description?: string) => {
    try {
      const response = await apiClient.post(`/moments/${momentId}/report`, {
        reason,
        description,
      });
      return response.data;
    } catch (error) {
      console.error("Lỗi khi báo cáo khoảnh khắc:", error);
      throw error;
    }
  },
};
