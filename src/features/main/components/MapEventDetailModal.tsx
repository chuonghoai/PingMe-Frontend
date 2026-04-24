// src/features/main/components/MapEventDetailModal.tsx
import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ActivityIndicator, Alert } from 'react-native';
import { X, Gift, Info, MapPin } from 'lucide-react-native';
import { checkInEvent } from '@/services/mapApi';
import { ITEM_DEFINITIONS } from './challenge-definition';

interface MapEventDetailModalProps {
  visible: boolean;
  event: any;
  userLocation: { latitude: number; longitude: number } | null;
  onClose: () => void;
  onSuccess: () => void;
}

export const MapEventDetailModal = ({ visible, event, userLocation, onClose, onSuccess }: MapEventDetailModalProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const itemDef = useMemo(() => {
    if (!event) return null;
    return (ITEM_DEFINITIONS as any)[event.rewardItem];
  }, [event]);

  if (!event) return null;

  const handleCheckIn = async () => {
    if (!userLocation) {
      Alert.alert("Lỗi", "Không thể xác định vị trí hiện tại của bạn. Vui lòng bật GPS.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await checkInEvent(event.id, userLocation.latitude, userLocation.longitude);
      if (res?.success) {
        Alert.alert("Thành công 🎉", "Bạn đã hoàn thành nhiệm vụ và nhận được phần thưởng!");
        onSuccess();
        onClose();
      } else {
        Alert.alert("Thất bại", res?.message || "Không thể trả nhiệm vụ lúc này.");
      }
    } catch (error: any) {
      const msg = error?.response?.data?.message || "Khoảng cách quá xa hoặc sự kiện đã hết hạn.";
      Alert.alert("Chưa đạt yêu cầu", msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={onClose} />
        
        <View style={styles.bottomSheet}>
          <View style={styles.header}>
            <View style={styles.headerIndicator} />
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color="#64748B" />
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            <View style={styles.titleRow}>
              <View style={styles.iconWrapper}>
                <Text style={styles.emoji}>{itemDef?.emoji || '🎁'}</Text>
              </View>
              <View style={styles.titleInfo}>
                <Text style={styles.eventName}>{event.name}</Text>
                <Text style={styles.rewardText}>Phần thưởng: {itemDef?.name || event.rewardItem} (x{event.rewardQuantity})</Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.infoRow}>
              <Info size={20} color="#64748B" />
              <Text style={styles.infoText}>{event.description || 'Hãy đến địa điểm này để nhận quà nhé!'}</Text>
            </View>

            <View style={styles.infoRow}>
              <MapPin size={20} color="#64748B" />
              <Text style={styles.infoText}>
                Tọa độ: {event.latitude?.toFixed(4)}, {event.longitude?.toFixed(4)}
              </Text>
            </View>

            <TouchableOpacity 
              style={[styles.submitButton, isLoading && styles.submitButtonDisabled]} 
              onPress={handleCheckIn}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.submitText}>Trả nhiệm vụ</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  bottomSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 30,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  headerIndicator: {
    width: 40,
    height: 4,
    backgroundColor: '#E2E8F0',
    borderRadius: 2,
    marginBottom: 8,
  },
  closeButton: {
    position: 'absolute',
    right: 16,
    top: 16,
    padding: 4,
  },
  content: {
    paddingHorizontal: 20,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconWrapper: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFFBEB',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  emoji: {
    fontSize: 32,
  },
  titleInfo: {
    flex: 1,
    marginLeft: 16,
  },
  eventName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 4,
  },
  rewardText: {
    fontSize: 14,
    color: '#D97706',
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  infoText: {
    fontSize: 14,
    color: '#475569',
    marginLeft: 12,
    flex: 1,
  },
  submitButton: {
    backgroundColor: '#8B5CF6',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#8B5CF6',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  submitButtonDisabled: {
    backgroundColor: '#A78BFA',
  },
  submitText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});