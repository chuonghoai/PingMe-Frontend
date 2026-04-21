import * as TaskManager from 'expo-task-manager';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '@/services/apiClient';
import { getAccessToken } from '@/utils/tokenStorage';

export const BACKGROUND_LOCATION_TASK = 'BACKGROUND_LOCATION_TASK';

TaskManager.defineTask(BACKGROUND_LOCATION_TASK, async ({ data, error }) => {
  if (error) {
    console.error("[BackgroundLocation] Error:", error);
    return;
  }
  if (data) {
    const { locations } = data as { locations: Location.LocationObject[] };
    if (!locations || locations.length === 0) return;

    let points: any[] = [];
    try {
      const cachedStr = await AsyncStorage.getItem('cached_route_points');
      if (cachedStr) {
        points = JSON.parse(cachedStr);
      }
    } catch (err) {
      console.log("[BackgroundLocation] Cache read error:", err);
    }
    
    const newPoints = locations.map(loc => ({
      lat: loc.coords.latitude,
      lng: loc.coords.longitude,
      timestamp: loc.timestamp
    }));
    
    points = [...points, ...newPoints];

    try {
      // Save back to storage first to secure data
      await AsyncStorage.setItem('cached_route_points', JSON.stringify(points));
    } catch (err) {
      console.log("[BackgroundLocation] Cache write error:", err);
    }

    // Try to sync to backend
    if (points.length >= 1) {
      try {
        const token = await getAccessToken();
        if (token) {
          const res = await fetch(`${BASE_URL}/exploration/sync`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ points })
          });
          if (res.ok) {
            // Success, clear cache
            await AsyncStorage.removeItem('cached_route_points');
          }
        }
      } catch (e) {
        console.log("[BackgroundLocation] Sync fetch exception during background:", e);
      }
    }
  }
});

export const syncCachedLocationPoints = async () => {
  try {
    const cachedStr = await AsyncStorage.getItem('cached_route_points');
    if (cachedStr) {
      const points = JSON.parse(cachedStr);
      if (points && points.length > 0) {
        const token = await getAccessToken();
        if (token) {
          const res = await fetch(`${BASE_URL}/exploration/sync`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ points })
          });
          if (res.ok) {
            await AsyncStorage.removeItem('cached_route_points');
            console.log("[Sync] Flushed cached points on startup");
          }
        }
      }
    }
  } catch (e) {
    console.log("[Sync] Failed to flush cached points:", e);
  }
};

export const startBackgroundLocationTracking = async () => {
  const { status: fgStatus } = await Location.requestForegroundPermissionsAsync();
  if (fgStatus === 'granted') {
    const { status: bgStatus } = await Location.requestBackgroundPermissionsAsync();
    if (bgStatus === 'granted') {
      const isRegistered = await TaskManager.isTaskRegisteredAsync(BACKGROUND_LOCATION_TASK);
      if (!isRegistered) {
        await Location.startLocationUpdatesAsync(BACKGROUND_LOCATION_TASK, {
          accuracy: Location.Accuracy.Balanced,
          distanceInterval: 10, // Cập nhật mỗi 10 mét
          deferredUpdatesInterval: 5000, // Cập nhật mảng data 1 lần/ 5 giây
          foregroundService: {
            notificationTitle: "PingMe đang hoạt động",
            notificationBody: "Đang lưu vết hành trình bản đồ của bạn.",
            notificationColor: "#8B5CF6",
          },
        });
        console.log("[LocationTask] Background tracking started");
      }
    } else {
      console.log("[LocationTask] Background permission not granted");
    }
  } else {
    console.log("[LocationTask] Foreground permission not granted");
  }
};
