import React, { useState } from "react";
import {
  View,
  TouchableOpacity,
  Image,
  FlatList,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
} from "react-native";

// === STICKER PACKS (v1 - Using Emoji from CDN PNG format) ===
const STICKER_PACKS = [
  {
    id: "smileys",
    name: "😊",
    stickers: [
      { id: "s1", url: "https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f600.png" },
      { id: "s2", url: "https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f602.png" },
      { id: "s3", url: "https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f60d.png" },
      { id: "s4", url: "https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f618.png" },
      { id: "s5", url: "https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f60e.png" },
      { id: "s6", url: "https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f622.png" },
      { id: "s7", url: "https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f62d.png" },
      { id: "s8", url: "https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f621.png" },
      { id: "s9", url: "https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f631.png" },
      { id: "s10", url: "https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f914.png" },
      { id: "s11", url: "https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f917.png" },
      { id: "s12", url: "https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f929.png" },
    ],
  },
  {
    id: "gestures",
    name: "👋",
    stickers: [
      { id: "g1", url: "https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f44d.png" },
      { id: "g2", url: "https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f44e.png" },
      { id: "g3", url: "https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f44b.png" },
      { id: "g4", url: "https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f44f.png" },
      { id: "g5", url: "https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f64f.png" },
      { id: "g6", url: "https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f4aa.png" },
      { id: "g7", url: "https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/270c.png" },
      { id: "g8", url: "https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f918.png" },
      { id: "g9", url: "https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f91d.png" },
      { id: "g10", url: "https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f91f.png" },
      { id: "g11", url: "https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f90c.png" },
      { id: "g12", url: "https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f90f.png" },
    ],
  },
  {
    id: "hearts",
    name: "❤️",
    stickers: [
      { id: "h1", url: "https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/2764.png" },
      { id: "h2", url: "https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f495.png" },
      { id: "h3", url: "https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f496.png" },
      { id: "h4", url: "https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f497.png" },
      { id: "h5", url: "https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f498.png" },
      { id: "h6", url: "https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f49c.png" },
      { id: "h7", url: "https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f49a.png" },
      { id: "h8", url: "https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f49b.png" },
      { id: "h9", url: "https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f90d.png" },
      { id: "h10", url: "https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f5a4.png" },
      { id: "h11", url: "https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f48b.png" },
      { id: "h12", url: "https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f49e.png" },
    ],
  },
  {
    id: "animals",
    name: "🐱",
    stickers: [
      { id: "a1", url: "https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f431.png" },
      { id: "a2", url: "https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f436.png" },
      { id: "a3", url: "https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f43b.png" },
      { id: "a4", url: "https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f437.png" },
      { id: "a5", url: "https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f430.png" },
      { id: "a6", url: "https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f981.png" },
      { id: "a7", url: "https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f427.png" },
      { id: "a8", url: "https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f43c.png" },
      { id: "a9", url: "https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f98a.png" },
      { id: "a10", url: "https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f985.png" },
      { id: "a11", url: "https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f984.png" },
      { id: "a12", url: "https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f40d.png" },
    ],
  },
];

const SCREEN_WIDTH = Dimensions.get("window").width;
const STICKER_SIZE = (SCREEN_WIDTH - 80) / 4; // 4 columns

interface StickerPickerProps {
  visible: boolean;
  onSend: (stickerUrl: string) => void;
}

export const StickerPicker: React.FC<StickerPickerProps> = ({ visible, onSend }) => {
  const [activePackIndex, setActivePackIndex] = useState(0);

  if (!visible) return null;

  const activePack = STICKER_PACKS[activePackIndex];

  return (
    <View style={pickerStyles.container}>
      {/* Pack tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={pickerStyles.tabBar}
        contentContainerStyle={pickerStyles.tabBarContent}
      >
        {STICKER_PACKS.map((pack, index) => (
          <TouchableOpacity
            key={pack.id}
            style={[
              pickerStyles.tabItem,
              activePackIndex === index && pickerStyles.tabItemActive,
            ]}
            onPress={() => setActivePackIndex(index)}
          >
            <Text style={pickerStyles.tabEmoji}>{pack.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Sticker grid */}
      <FlatList
        data={activePack.stickers}
        keyExtractor={(item) => item.id}
        numColumns={4}
        contentContainerStyle={pickerStyles.grid}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={pickerStyles.stickerItem}
            onPress={() => onSend(item.url)}
            activeOpacity={0.6}
          >
            <Image
              source={{ uri: item.url }}
              style={pickerStyles.stickerImage}
              resizeMode="contain"
            />
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

const pickerStyles = StyleSheet.create({
  container: {
    height: 260,
    backgroundColor: "#FAFAFA",
    borderTopWidth: 1,
    borderTopColor: "#E8E8E8",
  },
  tabBar: {
    maxHeight: 48,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  tabBarContent: {
    paddingHorizontal: 8,
    alignItems: "center",
  },
  tabItem: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  tabItemActive: {
    borderBottomColor: "#6C5CE7",
  },
  tabEmoji: {
    fontSize: 22,
  },
  grid: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  stickerItem: {
    width: STICKER_SIZE,
    height: STICKER_SIZE,
    justifyContent: "center",
    alignItems: "center",
    padding: 6,
  },
  stickerImage: {
    width: STICKER_SIZE - 16,
    height: STICKER_SIZE - 16,
  },
});
