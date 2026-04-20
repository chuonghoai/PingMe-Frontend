import { apiClient } from "./apiClient";

export interface FriendListResponseDto {
  userId: string;
  fullName: string;
  username?: string;
  avatarUrl: string;
  onlineStatus: string;
  lastActive: string;
}

export interface FriendRequestItemDto {
  requestId: string;
  fromUser: {
    userId: string;
    fullName: string;
    username?: string;
    avatarUrl: string;
  };
  toUserId: string;
  status: string;
  createdAt: string;
}

export const getFriendList = async () => {
  return await apiClient.get<FriendListResponseDto[]>("/friends");
};

export const getFriendRequests = async () => {
  return await apiClient.get<FriendRequestItemDto[]>("/friends/requests");
};

export const sendFriendRequest = async (targetUserId: string) => {
  return await apiClient.post("/friends/request", { targetUserId });
};

export const respondFriendRequest = async (requestId: string, action: "ACCEPT" | "REJECT") => {
  return await apiClient.post("/friends/respond", { requestId, action });
};

export const unfriend = async (friendId: string) => {
  return await apiClient.delete("/friends", { data: { friendId } });
};
