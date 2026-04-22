import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, FlatList, ActivityIndicator, Image } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { ChevronLeft, Search, X, MessageSquare } from "lucide-react-native";
import { chatApi } from "@/services/chatApi";
import { COLORS, styles } from "./ChatSearchScreen.styles";

export const ChatSearchScreen = () => {
  const router = useRouter();
  const { conversationId } = useLocalSearchParams();

  const [keyword, setKeyword] = useState("");
  const [debouncedKeyword, setDebouncedKeyword] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedKeyword(keyword);
    }, 500);
    return () => clearTimeout(timer);
  }, [keyword]);

  useEffect(() => {
    if (debouncedKeyword.trim().length > 0) {
      handleSearch();
    } else {
      setResults([]);
    }
  }, [debouncedKeyword]);

  const handleSearch = async () => {
    try {
      setIsLoading(true);
      const res: any = await chatApi.searchMessagesInChat(conversationId as string, debouncedKeyword);
      if (res.success && res.data) {
        setResults(res.data);
      } else {
        setResults([]);
      }
    } catch (error) {
      console.log("Lỗi tìm kiếm:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')} - ${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
  };

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.messageItem}>
      <Image 
        source={{ uri: item.senderAvatar || "https://ui-avatars.com/api/?name=User" }} 
        style={styles.avatar} 
      />
      <View style={styles.messageContent}>
        <View style={styles.messageHeader}>
          <Text style={styles.senderName} numberOfLines={1}>{item.senderName || "Người dùng"}</Text>
          <Text style={styles.time}>{formatDate(item.createdAt)}</Text>
        </View>
        <Text style={styles.text}>{item.content}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header with Search Bar */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <ChevronLeft size={28} color={COLORS.textMain} />
        </TouchableOpacity>
        
        <View style={styles.searchContainer}>
          <Search size={18} color={COLORS.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm kiếm tin nhắn..."
            placeholderTextColor={COLORS.textMuted}
            value={keyword}
            onChangeText={setKeyword}
            autoFocus
            returnKeyType="search"
          />
          {keyword.length > 0 && (
            <TouchableOpacity style={styles.clearBtn} onPress={() => setKeyword("")}>
              <X size={18} color={COLORS.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Results List */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : results.length > 0 ? (
        <FlatList
          data={results}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      ) : keyword.trim().length > 0 ? (
        <View style={styles.emptyContainer}>
          <MessageSquare size={48} color={COLORS.border} />
          <Text style={styles.emptyText}>Không tìm thấy tin nhắn nào chứa "{keyword}"</Text>
        </View>
      ) : (
        <View style={styles.emptyContainer}>
          <Search size={48} color={COLORS.border} />
          <Text style={styles.emptyText}>Nhập từ khóa để tìm kiếm tin nhắn trong cuộc trò chuyện này</Text>
        </View>
      )}
    </View>
  );
};
