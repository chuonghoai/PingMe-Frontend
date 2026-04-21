import { apiClient } from "./apiClient";

// Get all challenges with progress
export const getChallenges = async () => {
  return apiClient.get("/challenges");
};

// Claim challenge reward
export const claimChallengeReward = async (challengeId: string) => {
  return apiClient.post(`/challenges/${challengeId}/claim`);
};

// Get user inventory
export const getInventory = async () => {
  return apiClient.get("/challenges/inventory");
};

// Send gift to friend
export const sendGift = async (friendId: string, itemType: string) => {
  return apiClient.post("/challenges/gift/send", { friendId, itemType });
};

// Use special item
export const useSpecialItem = async (itemType: string, friendId?: string) => {
  return apiClient.post("/challenges/items/use", { itemType, friendId });
};

// Get item catalog
export const getItemCatalog = async () => {
  return apiClient.get("/challenges/items");
};
