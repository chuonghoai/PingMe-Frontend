import React, { useEffect, useRef, useState } from 'react';
import { AppState, Platform, Animated, PanResponder, StyleSheet, Text, View } from 'react-native';
import notifee, { AndroidImportance, AndroidCategory, EventType } from '@notifee/react-native';
import { socketService } from '@/websockets/socketService';
import { useRouter } from 'expo-router';

export const BackgroundNotificationHandler = () => {
  const appState = useRef(AppState.currentState);
  const router = useRouter();

  const [toastData, setToastData] = useState<{ title: string; message: string } | null>(null);
  const toastAnimY = useRef(new Animated.Value(-150)).current;
  const toastTimeout = useRef<any>(null);

  const hideToast = () => {
    Animated.timing(toastAnimY, {
      toValue: -150,
      duration: 300,
      useNativeDriver: true,
    }).start(() => setToastData(null));
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (evt, gestureState) => {
        if (gestureState.dy < 0) {
          toastAnimY.setValue(Math.max(-150, 60 + gestureState.dy));
        }
      },
      onPanResponderRelease: (evt, gestureState) => {
        if (gestureState.dy < -20 || gestureState.vy < -0.5) {
          if (toastTimeout.current) clearTimeout(toastTimeout.current);
          hideToast();
        } else {
          Animated.spring(toastAnimY, {
            toValue: 60,
            useNativeDriver: true,
          }).start();
        }
      }
    })
  ).current;

  useEffect(() => {
    async function requestPermissions() {
      await notifee.requestPermission();
    }
    requestPermissions();

    async function createChannels() {
      await notifee.createChannel({
        id: 'chat_messages',
        name: 'Tin nhắn mới',
        importance: AndroidImportance.HIGH,
      });

      await notifee.createChannel({
        id: 'incoming_calls',
        name: 'Cuộc gọi đến',
        importance: AndroidImportance.HIGH,
        sound: 'default',
        vibration: true,
      });
    }
    if (Platform.OS === 'android') {
      createChannels();
    }

    const subscription = AppState.addEventListener('change', nextAppState => {
      appState.current = nextAppState;
    });

    const onReceiveMessage = async (msg: any) => {
      if (appState.current.match(/inactive|background/)) {
        await notifee.displayNotification({
          title: `💬 Tin nhắn từ ${msg.senderName || 'Ai đó'}`,
          body: msg.content || 'Đã gửi một ảnh tĩnh.',
          android: {
            channelId: 'chat_messages',
            smallIcon: 'ic_launcher',
            pressAction: {
              id: 'default',
            },
          },
        });
      }
    };

    const onIncomingCall = async (callData: any) => {
      if (appState.current.match(/inactive|background/)) {
        await notifee.displayNotification({
          title: '📞 Cuộc gọi Video đến',
          body: `${callData.callerName || 'Chưa rõ'} đang gọi cho bạn...`,
          android: {
            channelId: 'incoming_calls',
            smallIcon: 'ic_launcher',
            category: AndroidCategory.CALL,
            fullScreenAction: {
              id: 'default',
              mainComponent: 'PingMe', 
            },
            pressAction: {
              id: 'default',
            },
            actions: [
              {
                title: '❌ TỪ CHỐI',
                pressAction: { id: 'reject_call' },
              },
              {
                title: '✅ NGHE MÁY',
                pressAction: { id: 'accept_call' },
              },
            ],
          },
        });
      }
    };

    const onNewMapEvent = async (data: any) => {
      if (appState.current.match(/inactive|background/)) {
        await notifee.displayNotification({
          title: data.title || '🌟 Sự kiện Bản đồ mới!',
          body: data.message,
          android: { channelId: 'chat_messages', smallIcon: 'ic_launcher' },
        });
      } else {
        setToastData({ title: data.title, message: data.message });
        Animated.spring(toastAnimY, {
          toValue: 60,
          useNativeDriver: true,
        }).start();

        if (toastTimeout.current) clearTimeout(toastTimeout.current);
        toastTimeout.current = setTimeout(() => {
          hideToast();
        }, 1500);
      }
    };

    socketService.on("receive_message", onReceiveMessage);
    socketService.on("incoming_call", onIncomingCall);
    socketService.on("new_map_event", onNewMapEvent);

    return () => {
      subscription.remove();
      socketService.off("receive_message", onReceiveMessage);
      socketService.off("incoming_call", onIncomingCall);
      socketService.off("new_map_event", onNewMapEvent);
    };
  }, []);

  useEffect(() => {
    return notifee.onForegroundEvent(({ type, detail }) => {
      switch (type) {
        case EventType.ACTION_PRESS:
          if (detail.pressAction?.id === 'accept_call') {
            console.log("Chap nhan cuoc goi tu Notifee");
          } else if (detail.pressAction?.id === 'reject_call') {
            // TODO
          }
          break;
        case EventType.PRESS:
          router.push("/(main)/chat" as any);
          break;
      }
    });
  }, []);

  return (
    <View style={styles.overlay} pointerEvents="box-none">
      <Animated.View
        {...panResponder.panHandlers}
        style={[
          styles.toastContainer,
          { transform: [{ translateY: toastAnimY }] }
        ]}
      >
        {toastData && (
          <View style={styles.toastContent}>
            <Text style={styles.toastTitle}>{toastData.title}</Text>
            <Text style={styles.toastMessage} numberOfLines={2}>
              {toastData.message}
            </Text>
            <View style={styles.indicator} />
          </View>
        )}
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 99999,
    elevation: 99999,
  },
  toastContainer: {
    position: 'absolute',
    top: 0,
    left: 16,
    right: 16,
  },
  toastContent: {
    backgroundColor: 'rgba(30, 41, 59, 0.95)',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  toastTitle: {
    color: '#38BDF8',
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 4,
  },
  toastMessage: {
    color: '#F8FAFC',
    fontSize: 14,
    lineHeight: 20,
  },
  indicator: {
    width: 30,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 10,
  }
});