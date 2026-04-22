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

export const getActiveEvents = async () => {
  try {
    const response: any = await apiClient.get('/map/events/active');
    return response;
  } catch (error) {
    throw error;
  }
};

export const checkInEvent = async (eventId: string, lat: number, lng: number) => {
  try {
    const response: any = await apiClient.post(`/map/events/check-in/${eventId}`, {
      latitude: lat,
      longitude: lng
    });
    return response;
  } catch (error) {
    throw error;
  }
};
