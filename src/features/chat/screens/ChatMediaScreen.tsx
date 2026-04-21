import { chatApi } from "@/services/chatApi";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ChevronLeft, PlayCircle } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    Image,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { styles } from "./ChatMediaScreen.styles";
import { COLORS } from "./ChatProfileScreen.styles";

export const ChatMediaScreen = () => {
    const router = useRouter();
    const { conversationId } = useLocalSearchParams();

    const [mediaList, setMediaList] = useState<any[]>([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (conversationId) {
            fetchMedia(1);
        }
    }, [conversationId]);

    const fetchMedia = async (pageNumber: number) => {
        if (isLoading || !hasMore) return;

        try {
            setIsLoading(true);
            const res: any = await chatApi.getConversationMedia(conversationId as string, pageNumber, 15);

            if (res.success && res.data) {
                const filteredMedia = res.data.messages.filter(
                    (m: any) => m.type === "IMAGE" || m.type === "VIDEO"
                );

                if (pageNumber === 1) {
                    setMediaList(filteredMedia);
                } else {
                    setMediaList(prev => [...prev, ...filteredMedia]);
                }

                // Nếu API trả về ít hơn limit tức là đã hết
                if (filteredMedia.length < 15) {
                    setHasMore(false);
                }
                setPage(pageNumber + 1);
            }
        } catch (error) {
            console.log("Lỗi lấy tất cả media:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const renderItem = ({ item }: { item: any }) => (
        <TouchableOpacity style={styles.mediaItem}>
            {item.media?.secureUrl && (
                <>
                    <Image source={{ uri: item.media.secureUrl }} style={styles.mediaImage} />
                    {item.type === "VIDEO" && (
                        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.2)' }}>
                            <PlayCircle size={30} color={COLORS.white} />
                        </View>
                    )}
                </>
            )}
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                    <ChevronLeft size={28} color={COLORS.amberGold} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Phương tiện và file</Text>
            </View>

            <FlatList
                data={mediaList}
                keyExtractor={(item, index) => item.id || index.toString()}
                renderItem={renderItem}
                numColumns={3}
                contentContainerStyle={styles.listContent}
                onEndReached={() => fetchMedia(page)}
                onEndReachedThreshold={0.5}
                ListFooterComponent={
                    isLoading ? <ActivityIndicator size="large" color={COLORS.amberGold} style={{ margin: 20 }} /> : null
                }
                ListEmptyComponent={
                    !isLoading ? <Text style={{ textAlign: 'center', marginTop: 40, color: COLORS.textSub }}>Chưa có file phương tiện nào</Text> : null
                }
            />
        </View>
    );
};