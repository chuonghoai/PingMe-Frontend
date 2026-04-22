import { useState, useEffect, useCallback } from 'react';
import { getActiveEvents } from '@/services/mapApi';
import { socketService } from '@/websockets/socketService';

export const useMapEvents = () => {
  const [events, setEvents] = useState<any[]>([]);

  const fetchEvents = useCallback(async () => {
    try {
      const response = await getActiveEvents();
      if (response?.success) {
        setEvents(response.data);
      }
    } catch (error) {
      console.error("[useMapEvents] Error fetching events:", error);
    }
  }, []);

  useEffect(() => {
    fetchEvents();

    socketService.on("new_map_event", fetchEvents);
    return () => {
      socketService.off("new_map_event", fetchEvents);
    };
  }, [fetchEvents]);

  return { events, refreshEvents: fetchEvents };
};