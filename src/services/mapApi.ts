import { apiClient } from "./apiClient";

// Get friends on map (lat, lng, avatar, online status)
export const getFriendsOnMap = async () => {
  return apiClient.get("/friends/map");
};

// Get friend popup info (distance, activity, relationship)
export const getFriendPopup = async (friendId: string) => {
  return apiClient.get(`/friends/${friendId}/popup`);
};

// Update my current location
export const updateMyLocation = async (lat: number, lng: number) => {
  return apiClient.put("/users/me", { lat, lng });
};
