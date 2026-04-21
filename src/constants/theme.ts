/**
 * PingMe - Bright Retro-Electronic Theme
 * A vibrant, clean canvas (white/slate base) popping with vivid neon colors.
 */

import { Platform } from 'react-native';

// ── Core Bright Retro Palette ──
export const PINGME_COLORS = {
  // Primary & Accent (Vibrant Neons)
  primary: '#00C2FF',        // Vibrant Cyan
  primaryLight: '#E0F2FE',   // Light Cyan bg
  secondary: '#8B5CF6',      // Vibrant Purple
  accent: '#10B981',         // Neon Emerald Green
  accentWarm: '#FF5C35',     // Vibrant Orange/Coral

  // Backgrounds (Clean & Bright)
  bgDark: '#0A0E17',         // Only used for extremely dark specific contrasting elements
  bgWhite: '#FFFFFF',        // Pure White Base
  bgMid: '#F1F5F9',          // Light Slate
  bgSurface: '#F8FAFC',      // Slate 50 - Card backgrounds
  surfaceHighlight: '#F1F5F9', // Slightly darker surface for buttons
  bgGlass: 'rgba(255, 255, 255, 0.85)', // Glass effect on bright bg

  // Text
  textPrimary: '#0F172A',    // Slate 900 (Dark Slate for crisp reading)
  textSecondary: '#64748B',  // Slate 500 (Muted)
  textMuted: '#94A3B8',      // Slate 400 (Very subtle labels)

  // Status
  online: '#10B981',         // Emerald Green glow
  offline: '#CBD5E1',        // Slate 300
  danger: '#FF3860',         // Vibrant Ruby Red
  warning: '#FBBF24',        // Bright Amber

  // Surfaces
  white: '#FFFFFF',
  black: '#000000',
  border: '#E2E8F0',         // Slate 200 (Clean structural lines)
  shadow: 'rgba(0, 194, 255, 0.25)', // Smooth Cyan shadow glow for primary elements
};

export const Colors = {
  light: {
    text: PINGME_COLORS.textPrimary,
    background: PINGME_COLORS.bgWhite,
    tint: PINGME_COLORS.primary,
    icon: PINGME_COLORS.textSecondary,
    tabIconDefault: PINGME_COLORS.textSecondary,
    tabIconSelected: PINGME_COLORS.primary,
  },
  dark: {
    text: PINGME_COLORS.white,
    background: PINGME_COLORS.bgDark,
    tint: PINGME_COLORS.primary,
    icon: PINGME_COLORS.textSecondary,
    tabIconDefault: PINGME_COLORS.textSecondary,
    tabIconSelected: PINGME_COLORS.primary,
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});

// ── Snazzy Maps Light Retro Style (Clean & Vibrant) ──
export const SNAZZY_MAP_STYLE = [
  {
    "featureType": "all",
    "elementType": "labels.text",
    "stylers": [
      {
        "color": "#878787"
      }
    ]
  },
  {
    "featureType": "all",
    "elementType": "labels.text.stroke",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  },
  {
    "featureType": "landscape",
    "elementType": "all",
    "stylers": [
      {
        "color": "#f9f5ed"
      }
    ]
  },
  {
    "featureType": "road.highway",
    "elementType": "all",
    "stylers": [
      {
        "color": "#f5f5f5"
      }
    ]
  },
  {
    "featureType": "road.highway",
    "elementType": "geometry.stroke",
    "stylers": [
      {
        "color": "#c9c9c9"
      }
    ]
  },
  {
    "featureType": "water",
    "elementType": "all",
    "stylers": [
      {
        "color": "#aee0f4"
      }
    ]
  }
]

// ── Dark Maps Style (Night Mode) ──
export const DARK_MAP_STYLE = [
  { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
  {
    featureType: "administrative.locality",
    elementType: "labels.text.fill",
    stylers: [{ color: "#d59563" }],
  },
  {
    featureType: "poi",
    elementType: "labels.text.fill",
    stylers: [{ color: "#d59563" }],
  },
  {
    featureType: "poi.park",
    elementType: "geometry",
    stylers: [{ color: "#263c3f" }],
  },
  {
    featureType: "poi.park",
    elementType: "labels.text.fill",
    stylers: [{ color: "#6b9a76" }],
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#38414e" }],
  },
  {
    featureType: "road",
    elementType: "geometry.stroke",
    stylers: [{ color: "#212a37" }],
  },
  {
    featureType: "road",
    elementType: "labels.text.fill",
    stylers: [{ color: "#9ca5b3" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry",
    stylers: [{ color: "#746855" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry.stroke",
    stylers: [{ color: "#1f2835" }],
  },
  {
    featureType: "road.highway",
    elementType: "labels.text.fill",
    stylers: [{ color: "#f3d19c" }],
  },
  {
    featureType: "transit",
    elementType: "geometry",
    stylers: [{ color: "#2f3948" }],
  },
  {
    featureType: "transit.station",
    elementType: "labels.text.fill",
    stylers: [{ color: "#d59563" }],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#17263c" }],
  },
  {
    featureType: "water",
    elementType: "labels.text.fill",
    stylers: [{ color: "#515c6d" }],
  },
  {
    featureType: "water",
    elementType: "labels.text.stroke",
    stylers: [{ color: "#17263c" }],
  }
];
