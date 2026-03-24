import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import {
  ChevronLeft,
  Image as ImageIcon,
  MoreVertical,
  Phone,
  Send,
  Smile,
  Mic,
  Trash2,
  Play,
  Square,
  Pause
} from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
import * as ImagePicker from "expo-image-picker";
import { Audio, Video, ResizeMode } from "expo-av";
import { mediaApi } from "@/src/services/mediaApi";
import {
  ActivityIndicator,
  Alert,
  Animated,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useChat } from "../store/ChatContext";
import { chatApi } from "@/src/services/chatApi";
import { useUser } from "@/src/store/UserContext";
import { socketService } from "@/src/websockets/socketService";
import { COLORS, styles } from "./ChatRoomScreen.styles";

export const ChatRoomScreen = () => {
  const router = useRouter();
  const { id, name } = useLocalSearchParams();
  const { userProfile } = useUser();
  const { clearUnreadCount } = useChat();

  const [inputText, setInputText] = useState("");
  const [messages, setMessages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOtherTyping, setIsOtherTyping] = useState(false);

  const showMessage = (title: string, message: string) => {
    if (Platform.OS === "web") {
      window.alert(`${title}: ${message}`);
      return;
    }

    Alert.alert(title, message);
  };

  // --- AUDIO STATE ---
  const [recording, setRecording] = useState<Audio.Recording | undefined>();
  const [isRecording, setIsRecording] = useState(false);
  const [isRecordUIVisible, setIsRecordUIVisible] = useState(false);
  const [audioUri, setAudioUri] = useState<string | null>(null);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordDurationMillis, setRecordDurationMillis] = useState(0);
  const [playbackPosMillis, setPlaybackPosMillis] = useState(0);
  const [playbackDurationMillis, setPlaybackDurationMillis] = useState(0);
  const [progressBarWidth, setProgressBarWidth] = useState(0);

  // Ref quản lý trạng thái typing
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isTyping, setIsTyping] = useState(false);

  const flatListRef = useRef<FlatList>(null);

  // Animated Value cho cụm Media
  const mediaWidthAnim = useRef(new Animated.Value(100)).current;
  const mediaOpacityAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    return sound
      ? () => {
          sound.unloadAsync();
        }
      : undefined;
  }, [sound]);

  // 1. TẢI LỊCH SỬ TIN NHẮN
  useEffect(() => {
    if (id) {
      fetchMessages();
      socketService.emit("mark_read", { conversationId: id });
      clearUnreadCount(id as string);
    }
  }, [id]);

  const fetchMessages = async () => {
    try {
      setIsLoading(true);
      const response: any = await chatApi.getMessages(id as string, 1, 20);
      if (response.success) {
        setMessages(response.data.messages);
      }
    } catch (error) {
      console.error("Lỗi khi tải lịch sử chat:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // 2. LẮNG NGHE PHẢN HỒI GỬI TIN NHẮN TỪ SOCKET
  useEffect(() => {
    const handleMessageSuccess = (data: any) => {
      const realMessage = data.message || data;
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === data.temporaryId
            ? { ...msg, ...realMessage, isTemporary: false, isRead: false }
            : msg,
        ),
      );
    };

    const handleMessageError = (data: any) => {
      showMessage("Loi", "Loi mang, vui long kiem tra lai.");
      // Xóa tin nhắn tạm khỏi danh sách vì gửi thất bại
      setMessages((prev) => prev.filter((msg) => msg.id !== data.temporaryId));
    };

    const handleNewMessage = (data: any) => {
      const realMessage = data.message || data;
      const messageSenderId = realMessage.sender?.id || realMessage.senderId;
      if (messageSenderId === userProfile?.userId) return;

      if (realMessage.conversationId === id) {
        setMessages((prev) => [realMessage, ...prev]);
        socketService.emit("mark_read", { conversationId: id });
        clearUnreadCount(id as string);
      }
    };

    const handleMessagesRead = (data: any) => {
      if (data.conversationId === id) {
        setMessages((prev) => prev.map((msg) => {
          const senderId = msg.sender?.id || msg.senderId;
          if (senderId === userProfile?.userId) {
            return { ...msg, isRead: true };
          }
          return msg;
        }));
      }
    };

    const handleIsTyping = (data: { conversationId: string; userId: string; isTyping: boolean }) => {
      if (data.conversationId === id && data.userId !== userProfile?.userId) {
        setIsOtherTyping(data.isTyping);
      }
    };

    socketService.on("is_typing", handleIsTyping);
    socketService.on("message_sent_success", handleMessageSuccess);
    socketService.on("exception", handleMessageError);
    socketService.on("message_error", handleMessageError);
    socketService.on("new_message", handleNewMessage);
    socketService.on("messages_read", handleMessagesRead);

    return () => {
      socketService.off("is_typing", handleIsTyping);
      socketService.off("message_sent_success", handleMessageSuccess);
      socketService.off("exception", handleMessageError);
      socketService.off("message_error", handleMessageError);
      socketService.off("new_message", handleNewMessage);
      socketService.off("messages_read", handleMessagesRead);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, [id, userProfile]);

  // 3. HIỆU ỨNG UX & LOGIC TYPING
  const handleTextChange = (text: string) => {
    setInputText(text);

    // Xử lý hiệu ứng co giãn nút Media
    if (text.length > 0) {
      Animated.parallel([
        Animated.timing(mediaWidthAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: false,
        }),
        Animated.timing(mediaOpacityAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: false,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(mediaWidthAnim, {
          toValue: 90,
          duration: 250,
          useNativeDriver: false,
        }),
        Animated.timing(mediaOpacityAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: false,
        }),
      ]).start();
    }

    // Logic bắn event typing
    if (!isTyping) {
      setIsTyping(true);
      socketService.emit("typing", { conversationId: id, isTyping: true });
    }

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      socketService.emit("typing", { conversationId: id, isTyping: false });
    }, 3000);
  };

  // 5. MEDIA & AUDIO LOGIC
  const handlePickMedia = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) {
      showMessage("Lỗi", "Cần cấp quyền truy cập thư viện ảnh");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images', 'videos'],
      allowsMultipleSelection: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets) {
      for (const asset of result.assets) {
        const tempId = `temp_${Date.now()}_${Math.floor(Math.random() * 100000)}`;
        const type = asset.type === "video" ? "VIDEO" : "IMAGE";
        
        const tempMessage = {
          id: tempId,
          content: "",
          type: type,
          media: { secureUrl: asset.uri, resourceType: asset.type },
          sender: { id: userProfile?.userId },
          createdAt: new Date().toISOString(),
          isTemporary: true,
        };
        setMessages((prev) => [tempMessage, ...prev]);

        try {
          const signature = await mediaApi.getSignature();
          const cloudinaryRes = await mediaApi.uploadToCloudinary(asset.uri, signature, asset.type as any, asset.mimeType);
          const mediaRecord = await mediaApi.createMediaRecord(cloudinaryRes);

          socketService.emit("send_message", {
            conversationId: id,
            content: "",
            type: type,
            mediaId: mediaRecord.id,
            temporaryId: tempId,
          });
        } catch (err) {
          console.error(err);
          showMessage("Error", "Lỗi khi tải lên tệp tin đính kèm.");
          setMessages((prev) => prev.filter((msg) => msg.id !== tempId));
        }
      }
    }
  };

  const startRecording = async () => {
    if (isRecording) return;
    try {
      setIsRecording(true);
      if (recording) {
        await recording.stopAndUnloadAsync();
      }
      const permission = await Audio.requestPermissionsAsync();
      if (permission.status === "granted") {
        await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
        const { recording: newRecording } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
        
        newRecording.setOnRecordingStatusUpdate((status) => {
          setRecordDurationMillis(status.durationMillis);
        });
        
        setRecording(newRecording);
      } else {
        showMessage("Lỗi", "Cần cấp quyền microphone");
        setIsRecording(false);
      }
    } catch (err) {
      console.error("Lỗi ghi âm", err);
      setIsRecording(false);
    }
  };

  const stopRecording = async () => {
    if (!recording) {
       setIsRecording(false);
       return;
    }
    try {
      await recording.stopAndUnloadAsync();
      await Audio.setAudioModeAsync({ allowsRecordingIOS: false });
      const uri = recording.getURI();
      setAudioUri(uri);
      
      const { sound: newSound } = await Audio.Sound.createAsync(
         { uri: uri! },
         { shouldPlay: false, progressUpdateIntervalMillis: 100 },
         (status: any) => { 
           if (status.isLoaded) {
             setPlaybackDurationMillis(status.durationMillis || 0);
             setPlaybackPosMillis(status.positionMillis);
             setIsPlaying(status.isPlaying);
           }
           if (status.didJustFinish) {
             setIsPlaying(false);
             setPlaybackPosMillis(0);
           }
         }
      );
      setSound(newSound);
      
      setRecording(undefined);
      setIsRecording(false);
    } catch (err) {
      console.error(err);
      setIsRecording(false);
      setRecording(undefined);
    }
  };

  const handleSeek = async (evt: any) => {
    if (!sound || progressBarWidth === 0) return;
    const { locationX } = evt.nativeEvent;
    const ratio = Math.max(0, Math.min(1, locationX / progressBarWidth));
    const seekPos = ratio * playbackDurationMillis;
    await sound.setPositionAsync(seekPos);
  };

  const playOrPauseAudio = async () => {
    if (sound) {
      if (isPlaying) {
        await sound.pauseAsync();
        setIsPlaying(false);
      } else {
        await sound.playAsync();
        setIsPlaying(true);
      }
    }
  };

  const cancelAudio = () => {
    if (sound) { sound.unloadAsync(); setSound(null); }
    if (recording) { recording.stopAndUnloadAsync(); setRecording(undefined); }
    setIsRecording(false);
    setAudioUri(null);
    setIsPlaying(false);
    setRecordDurationMillis(0);
    setPlaybackPosMillis(0);
    setPlaybackDurationMillis(0);
  };

  const sendAudioMessage = async () => {
     if (!audioUri) return;
     const tempId = `temp_${Date.now()}_${Math.floor(Math.random() * 100000)}`;
     const uriToSend = audioUri;
     cancelAudio(); // Reset UI immediately
     setIsRecordUIVisible(false); // Close UI

     const tempMessage = {
       id: tempId,
       content: "",
       type: "AUDIO",
       media: { secureUrl: uriToSend, resourceType: "video", is_audio: true },
       sender: { id: userProfile?.userId },
       createdAt: new Date().toISOString(),
       isTemporary: true,
     };
     setMessages((prev) => [tempMessage, ...prev]);

     try {
       const signature = await mediaApi.getSignature();
       // Cloudinary processes audio faster when treating it as video upload
       const cloudinaryRes = await mediaApi.uploadToCloudinary(uriToSend, signature, "video", "audio/m4a");
       const mediaRecord = await mediaApi.createMediaRecord(cloudinaryRes);

       socketService.emit("send_message", {
         conversationId: id,
         content: "",
         type: "AUDIO",
         mediaId: mediaRecord.id,
         temporaryId: tempId,
       });
     } catch (err) {
       console.error("Audio upload error", err);
       showMessage("Error", "Gửi tin nhắn thoại thất bại.");
       setMessages((prev) => prev.filter((msg) => msg.id !== tempId));
     }
  };

  // 4. XỬ LÝ GỬI TIN NHẮN (Optimistic UI)
  const handleSend = () => {
    if (inputText.trim()) {
      const tempId = `temp_${Date.now()}_${Math.floor(Math.random() * 100000)}`;
      const textToSend = inputText.trim();

      // 4.1. Tạo tin nhắn tạm (Gắn cờ isTemporary)
      const tempMessage = {
        id: tempId,
        content: textToSend,
        sender: { id: userProfile?.userId },
        createdAt: new Date().toISOString(),
        isTemporary: true,
      };

      // 4.2. Render ngay lập tức lên màn hình
      setMessages((prev) => [tempMessage, ...prev]);
      setInputText("");

      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      setIsTyping(false);
      socketService.emit("typing", { conversationId: id, isTyping: false });

      // 4.4. Bắn event lên Backend
      socketService.emit("send_message", {
        conversationId: id,
        content: textToSend,
        type: "TEXT",
        temporaryId: tempId,
        // mediaId: ...,
        // replyToId: ...
      });
    }
  };

  const formatTime = (isoString: string) => {
    if (!isoString) return "";
    const date = new Date(isoString);
    return `${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`;
  };

const renderMessage = ({ item }: { item: any }) => {
    const messageSenderId = item.sender?.id || item.senderId || item.sender?.userId;
    const isMe = messageSenderId === userProfile?.userId;
    const displayContent = item.content || item.message?.content || "";
    const type = item.type || "TEXT";
    const media = item.media;

    // KIỂM TRA: Nếu chỉ có ảnh/video mà không có chữ
    const isMediaOnly = (!displayContent || displayContent.length === 0) && (type === "IMAGE" || type === "VIDEO");

    return (
      <View
        style={[
          styles.messageBubble,
          isMe ? styles.myMessage : styles.theirMessage,
          // Xóa border màu cam, background và padding nếu chỉ là ảnh/video
          isMediaOnly && { backgroundColor: 'transparent', borderWidth: 0, padding: 0, elevation: 0 } 
        ]}
      >
        {(type === "TEXT" || displayContent.length > 0) && (
          <Text style={[styles.messageText, isMe ? styles.myMessageText : {}]}>
            {displayContent}
          </Text>
        )}

        {/* --- ẢNH: Scale chuẩn không cắt xén (contain) --- */}
        {type === "IMAGE" && media?.secureUrl && (
          <Image 
            source={{ uri: media.secureUrl }} 
            style={{ 
              width: 250, 
              height: 250, // Giới hạn kích thước tối đa
              borderRadius: 8, 
              marginTop: displayContent ? 8 : 0 
            }} 
            resizeMode="contain" // Cốt lõi để không bị cắt xén
          />
        )}
        
        {/* --- VIDEO: Dùng expo-av Video có sẵn Controls --- */}
        {type === "VIDEO" && media?.secureUrl && (
          <Video
            source={{ uri: media.secureUrl }}
            style={{ 
              width: 250, 
              height: 250, // Khung tối đa cho video
              borderRadius: 8, 
              marginTop: displayContent ? 8 : 0,
              backgroundColor: '#000' 
            }}
            useNativeControls // Tự động có thumbnail, nút play, thanh tiến trình
            resizeMode={ResizeMode.CONTAIN} // Tránh cắt xén video
            isLooping={false}
          />
        )}

        {/* --- AUDIO: Sử dụng component AudioPlayer đã tạo --- */}
        {type === "AUDIO" && media?.secureUrl && (
          <View style={{ marginTop: displayContent ? 8 : 0 }}>
             <AudioPlayer uri={media.secureUrl} isMe={isMe} />
          </View>
        )}

        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: isMe ? "flex-end" : "flex-start",
            marginTop: 4,
          }}
        >
          <Text
            style={[
              styles.timeText,
              isMe ? styles.myTimeText : styles.theirTimeText,
              isMediaOnly && { color: COLORS.textSub, marginTop: 4 } 
            ]}
          >
            {formatTime(item.createdAt)}
          </Text>

          {item.isTemporary && (
            <ActivityIndicator
              size="small"
              color={isMediaOnly ? COLORS.amberGold : COLORS.white}
              style={{ marginLeft: 6 }}
            />
          )}

          {isMe && !item.isTemporary && (
            <Text style={{ 
              marginLeft: 6, 
              color: isMediaOnly ? COLORS.textSub : COLORS.white, 
              fontSize: 10, alignSelf: 'center', opacity: 0.8 
            }}>
              {item.isRead ? "✓✓" : "✓"}
            </Text>
          )}
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <Stack.Screen options={{ headerShown: false }} />

      {/* --- HEADER --- */}
      <View style={styles.headerContainer}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <ChevronLeft size={28} color={COLORS.amberGold} />
        </TouchableOpacity>

        <Image
          source={{ uri: "https://i.pravatar.cc/150?img=11" }}
          style={styles.headerAvatar}
        />

        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerName} numberOfLines={1}>
            {name || "Người dùng"}
          </Text>
          <View style={styles.headerStatusContainer}>
            <View style={styles.statusDot} />
            <Text style={styles.headerStatus}>Đang hoạt động</Text>
          </View>
        </View>

        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerIconButton}>
            <Phone size={22} color={COLORS.amberGold} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerIconButton}>
            <MoreVertical size={22} color={COLORS.iconGray} />
          </TouchableOpacity>
        </View>
      </View>

      {/* --- DANH SÁCH TIN NHẮN --- */}
      {isLoading ? (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ActivityIndicator size="large" color={COLORS.amberGold} />
        </View>
      ) : (
        <FlatList
          data={messages}
          keyExtractor={(item, index) =>
            item?.id ? item.id.toString() : index.toString()
          }
          renderItem={renderMessage}
          contentContainerStyle={styles.chatListContent}
          ref={flatListRef}
          inverted
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* --- TYPING --- */}
      {isOtherTyping && (
        <View style={{ paddingHorizontal: 16, paddingBottom: 8, backgroundColor: COLORS.lightYellow }}>
          <Text style={{ fontSize: 12, color: COLORS.textSub, fontStyle: "italic" }}>
            {name || "Người dùng"} đang soạn tin...
          </Text>
        </View>
      )}

      {/* --- THANH NHẬP LIỆU --- */}
      {isRecordUIVisible ? (
        <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white, paddingVertical: 12, paddingHorizontal: 16, borderTopWidth: 1, borderTopColor: COLORS.borderColor, minHeight: 60, justifyContent: 'space-between' }}>
           
           {audioUri ? (
             // --- TRẠNG THÁI 3: ĐÃ THU ÂM (hiện thanh process) ---
             <>
               <TouchableOpacity onPress={() => { cancelAudio(); setIsRecordUIVisible(false); }} style={{ padding: 8 }}>
                 <Trash2 size={24} color={COLORS.errorRed || '#FF3B30'} />
               </TouchableOpacity>

               <TouchableOpacity onPress={playOrPauseAudio} style={{ marginHorizontal: 8 }}>
                 {isPlaying ? <Pause size={28} color={COLORS.amberGold} /> : <Play size={28} color={COLORS.amberGold} />}
               </TouchableOpacity>

               {/* Process Bar */}
               <View 
                  style={{ flex: 1, height: 40, justifyContent: 'center', paddingHorizontal: 10 }}
                  onLayout={(e) => setProgressBarWidth(e.nativeEvent.layout.width - 20)}
               >
                 <View 
                   style={{ height: 6, backgroundColor: COLORS.borderColor, borderRadius: 3, overflow: 'hidden' }}
                   onTouchEnd={handleSeek}
                 >
                    <View style={{ height: '100%', backgroundColor: COLORS.amberGold, width: playbackDurationMillis > 0 ? `${(playbackPosMillis / playbackDurationMillis) * 100}%` : '0%' }} />
                 </View>
                 <Text style={{ fontSize: 10, color: COLORS.textSub, marginTop: 4, alignSelf: 'flex-end' }}>
                   {Math.floor(playbackPosMillis / 1000)}s / {Math.floor(playbackDurationMillis / 1000)}s
                 </Text>
               </View>

               <TouchableOpacity onPress={sendAudioMessage} style={{ backgroundColor: COLORS.amberGold, padding: 10, borderRadius: 24, marginLeft: 8 }}>
                 <Send size={20} color={COLORS.white} />
               </TouchableOpacity>
             </>
           ) : (
             // --- TRẠNG THÁI 2: ĐANG CHỜ / ĐANG THU ---
             <>
               <TouchableOpacity onPress={() => { cancelAudio(); setIsRecordUIVisible(false); }} style={{ padding: 8 }}>
                 <Text style={{ fontSize: 16, color: COLORS.textSub }}>Hủy</Text>
               </TouchableOpacity>
               
               <View style={{ flex: 1, alignItems: 'center' }}>
                 <Text style={{ color: recording ? (COLORS.errorRed || '#FF3B30') : COLORS.textMain, fontSize: 16 }}>
                   {recording ? `Đang ghi âm... ${Math.floor(recordDurationMillis / 1000)}s` : "Nhấn giữ để ghi âm"}
                 </Text>
               </View>

               <TouchableOpacity 
                  onPressIn={startRecording} 
                  onPressOut={stopRecording} 
                  delayPressIn={0}
                  style={{ 
                    backgroundColor: recording ? 'rgba(255, 59, 48, 0.1)' : COLORS.inputBackground, 
                    padding: 12, 
                    borderRadius: 30 
                  }}
                >
                 <Mic size={24} color={recording ? (COLORS.errorRed || '#FF3B30') : COLORS.amberGold} />
               </TouchableOpacity>
             </>
           )}
        </View>
      ) : (
        <View style={styles.inputContainer}>
          <Animated.View
            style={[
              styles.mediaButtonsContainer,
              { width: mediaWidthAnim, opacity: mediaOpacityAnim },
            ]}
          >
            <TouchableOpacity style={styles.mediaButton} onPress={handlePickMedia}>
              <ImageIcon size={24} color={COLORS.iconGray} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.mediaButton} onPress={() => setIsRecordUIVisible(true)}>
              <Mic size={24} color={COLORS.iconGray} />
            </TouchableOpacity>
          </Animated.View>

          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.textInput}
              placeholder="Nhập tin nhắn..."
              value={inputText}
              onChangeText={handleTextChange}
              placeholderTextColor={COLORS.textSub}
              multiline
            />
            <TouchableOpacity style={styles.stickerButton}>
              <Smile size={24} color={COLORS.iconGray} />
            </TouchableOpacity>
          </View>

          {inputText.trim().length > 0 && (
            <TouchableOpacity style={styles.sendBtn} onPress={handleSend}>
              <Send size={24} color={COLORS.amberGold} />
            </TouchableOpacity>
          )}
        </View>
      )}
    </KeyboardAvoidingView>
  );
};

// Audio message component
const AudioPlayer = ({ uri, isMe }: { uri: string; isMe: boolean }) => {
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [position, setPosition] = useState(0);
  const [barWidth, setBarWidth] = useState(0);
  
  // Use a ref to access the latest sound object inside the callback
  const soundRef = useRef<Audio.Sound | null>(null);

  useEffect(() => {
    return () => {
      if (soundRef.current) soundRef.current.unloadAsync();
    };
  }, []);

  const onPlaybackStatusUpdate = (status: any) => {
    if (status.isLoaded) {
      setPosition(status.positionMillis);
      setDuration(status.durationMillis || 0);
      setIsPlaying(status.isPlaying);
      if (status.didJustFinish) {
        setIsPlaying(false);
        setPosition(0);
        // Use ref to safely reset position to start
        if (soundRef.current) {
          soundRef.current.setPositionAsync(0);
        }
      }
    }
  };

  const handlePlayPause = async () => {
    if (!sound) {
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri },
        { shouldPlay: true, progressUpdateIntervalMillis: 50 },
        onPlaybackStatusUpdate
      );
      setSound(newSound);
      soundRef.current = newSound;
      setIsPlaying(true);
    } else {
      if (isPlaying) {
        await sound.pauseAsync();
      } else {
        // If it was at the end or reset to 0, start from beginning
        if (position >= duration && duration > 0) {
          await sound.replayAsync();
        } else {
          await sound.playAsync();
        }
      }
    }
  };

  const handleSeek = async (e: any) => {
    if (!sound || barWidth === 0 || duration === 0) return;
    const { locationX } = e.nativeEvent;
    const ratio = Math.max(0, Math.min(1, locationX / barWidth));
    const seekPos = ratio * duration;
    await sound.setPositionAsync(seekPos);
    setPosition(seekPos);
  };

  const formatTime = (millis: number) => {
    const totalSeconds = Math.floor(millis / 1000);
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const progress = duration > 0 ? (position / duration) * 100 : 0;

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', width: 220, padding: 8, backgroundColor: isMe ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.05)', borderRadius: 16 }}>
      <TouchableOpacity onPress={handlePlayPause}>
        {isPlaying ? <Square size={20} color={isMe ? COLORS.white : COLORS.amberGold} /> : <Play size={20} color={isMe ? COLORS.white : COLORS.amberGold} />}
      </TouchableOpacity>
      
      {/* Thanh tiến trình */}
      <View 
        style={{ flex: 1, marginHorizontal: 8, height: 20, justifyContent: 'center' }}
        onLayout={(e) => setBarWidth(e.nativeEvent.layout.width)}
        onTouchEnd={handleSeek}
      >
        <View style={{ width: '100%', height: 4, backgroundColor: 'rgba(150,150,150,0.5)', borderRadius: 2 }}>
          <View style={{ width: `${progress}%`, height: '100%', backgroundColor: isMe ? COLORS.white : COLORS.amberGold, borderRadius: 2 }} />
        </View>
      </View>
      
      {/* Thời gian */}
      <Text style={{ fontSize: 11, color: isMe ? COLORS.white : COLORS.textMain }}>
        {formatTime(position)} / {formatTime(duration)}
      </Text>
    </View>
  );
};