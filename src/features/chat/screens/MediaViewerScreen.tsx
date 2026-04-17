import { ResizeMode, Video } from "expo-av";
import * as FileSystem from "expo-file-system/legacy";
import * as ImageManipulator from "expo-image-manipulator";
import * as MediaLibrary from "expo-media-library";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
    Download,
    FastForward,
    MoreVertical,
    Pause,
    Play,
    Rewind,
    X,
} from "lucide-react-native";
import React, { useRef, useState } from "react";
import {
    Alert,
    Dimensions,
    Image,
    ScrollView,
    Text,
    ToastAndroid,
    TouchableOpacity,
    View,
} from "react-native";
import { styles } from "./MediaViewerScreen.styles";

const { width } = Dimensions.get("window");

export const MediaViewerScreen = () => {
    const router = useRouter();
    const { url, type } = useLocalSearchParams();
    const videoRef = useRef<Video>(null);

    // States cho Video
    const [isPlaying, setIsPlaying] = useState(true);
    const [duration, setDuration] = useState(0);
    const [position, setPosition] = useState(0);

    // State cho Menu 3 chấm
    const [showMenu, setShowMenu] = useState(false);

    // Định dạng thời gian (mm:ss)
    const formatTime = (millis: number) => {
        const totalSeconds = Math.floor(millis / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
    };

    const handlePlaybackStatusUpdate = (status: any) => {
        if (status.isLoaded) {
            setDuration(status.durationMillis || 0);
            setPosition(status.positionMillis || 0);
            setIsPlaying(status.isPlaying);
        }
    };

    const skipVideo = async (amountMillis: number) => {
        if (videoRef.current && duration > 0) {
            const newPos = Math.max(0, Math.min(position + amountMillis, duration));
            await videoRef.current.setPositionAsync(newPos);
        }
    };

    const handleSeek = async (event: any) => {
        if (!duration) return;
        const { locationX } = event.nativeEvent;
        const percent = locationX / width; // width là độ rộng màn hình (tạm dùng cho thanh progress full-width trừ padding)
        const seekTime = percent * duration;
        await videoRef.current?.setPositionAsync(seekTime);
    };

    // Tính năng tải xuống (Download)
    const handleDownload = async () => {
        setShowMenu(false);
        try {
            const { status } = await MediaLibrary.requestPermissionsAsync();
            if (status !== "granted") {
                Alert.alert("Lỗi", "Cần cấp quyền truy cập thư viện ảnh để tải file.");
                return;
            }

            if (!FileSystem.documentDirectory) {
                Alert.alert("Lỗi", "Hệ thống không hỗ trợ thư mục lưu trữ cục bộ.");
                return;
            }

            const fileUri = String(url);
            const filename = fileUri.split('/').pop() || `download_${Date.now()}`;
            const fileExt = type === "VIDEO" ? ".mp4" : ".jpg";
            const localPath = `${FileSystem.documentDirectory}${filename}${fileExt.includes('.') ? '' : fileExt}`;

            // 1. Tải file về vùng nhớ tạm của app
            const { uri } = await FileSystem.downloadAsync(fileUri, localPath);
            let finalUri = uri;

            // 2. Nếu là ảnh, dùng chiêu "rửa" ảnh để xóa ngày tháng cũ (EXIF)
            if (type === "IMAGE") {
                const manipResult = await ImageManipulator.manipulateAsync(
                    uri,
                    [], // Không thu phóng hay cắt xén gì cả
                    { compress: 1, format: ImageManipulator.SaveFormat.JPEG } // Giữ nguyên chất lượng 100%, tự động loại bỏ EXIF
                );
                finalUri = manipResult.uri;
            }

            // 3. Khởi tạo đối tượng Asset từ file đã xử lý
            const asset = await MediaLibrary.createAssetAsync(finalUri);

            // 4. Lưu vào một Album riêng biệt (Đổi tên "PingMe" thành tên App của bạn)
            // Tham số false ở cuối nghĩa là di chuyển (move) file gốc vào album thay vì copy thành 2 bản
            await MediaLibrary.createAlbumAsync("PingMe", asset, false);

            ToastAndroid.show(
                "Đã lưu vào thư mục PingMe trong Thư viện ảnh",
                ToastAndroid.SHORT
            );
        } catch (error) {
            console.log("Lỗi tải xuống:", error);
            Alert.alert("Lỗi", "Không thể tải file lúc này.");
        }
    };

    return (
        <View style={styles.container}>
            {/* HEADER */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.iconBtn} onPress={() => router.back()}>
                    <X size={24} color="#FFF" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.iconBtn} onPress={() => setShowMenu(!showMenu)}>
                    <MoreVertical size={24} color="#FFF" />
                </TouchableOpacity>
            </View>

            {/* DROPDOWN MENU */}
            {showMenu && (
                <View style={styles.dropdownMenu}>
                    <TouchableOpacity style={styles.menuItem} onPress={handleDownload}>
                        <Download size={20} color="#000" />
                        <Text style={styles.menuText}>Tải xuống</Text>
                    </TouchableOpacity>
                </View>
            )}

            {/* CONTENT */}
            <View style={styles.content}>
                {type === "IMAGE" ? (
                    // Khung chứa ảnh (Cưỡng ép render đúng kích thước, cho phép zoom)
                    <ScrollView
                        maximumZoomScale={3}
                        minimumZoomScale={1}
                        showsHorizontalScrollIndicator={false}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', alignItems: 'center' }}
                    >
                        <Image
                            source={{ uri: String(url) }}
                            style={styles.image}
                            resizeMode="contain" // Chứa trọn vẹn không cắt
                        />
                    </ScrollView>
                ) : (
                    // Khung chứa Video (Không zoom, ResizeMode.CONTAIN)
                    <>
                        <Video
                            ref={videoRef}
                            source={{ uri: String(url) }}
                            style={styles.video}
                            resizeMode={ResizeMode.CONTAIN}
                            shouldPlay
                            onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
                        />

                        {/* BỘ ĐIỀU KHIỂN VIDEO */}
                        <View style={styles.videoControls}>
                            {/* Nút Play/Pause & Skip */}
                            <View style={styles.controlRow}>
                                <TouchableOpacity style={styles.controlBtn} onPress={() => skipVideo(-5000)}>
                                    <Rewind size={24} color="#FFF" />
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[styles.controlBtn, styles.playBtn]}
                                    onPress={() => isPlaying ? videoRef.current?.pauseAsync() : videoRef.current?.playAsync()}
                                >
                                    {isPlaying ? <Pause size={28} color="#FFF" /> : <Play size={28} color="#FFF" />}
                                </TouchableOpacity>

                                <TouchableOpacity style={styles.controlBtn} onPress={() => skipVideo(5000)}>
                                    <FastForward size={24} color="#FFF" />
                                </TouchableOpacity>
                            </View>

                            {/* Thanh Progress */}
                            <TouchableOpacity
                                style={styles.progressContainer}
                                activeOpacity={0.8}
                                onPress={handleSeek}
                            >
                                <View style={styles.progressBarBg}>
                                    <View
                                        style={[
                                            styles.progressBarFill,
                                            { width: duration > 0 ? `${(position / duration) * 100}%` : "0%" },
                                        ]}
                                    />
                                </View>
                            </TouchableOpacity>

                            {/* Thời gian */}
                            <View style={styles.timeRow}>
                                <Text style={styles.timeText}>{formatTime(position)}</Text>
                                <Text style={styles.timeText}>{formatTime(duration)}</Text>
                            </View>
                        </View>
                    </>
                )}
            </View>
        </View>
    );
};