export enum EItemType {
    ROSE = 'ROSE',
    ROCKET = 'ROCKET',
    STAR = 'STAR',
    STREAK_SHIELD = 'STREAK_SHIELD',
    EXP_BOOST = 'EXP_BOOST',
}

export enum EItemCategory {
    GIFT = 'GIFT',
    SPECIAL = 'SPECIAL',
}

export interface ItemDefinition {
    type: EItemType;
    name: string;
    emoji: string;
    category: EItemCategory;
    intimacyBonus: number;
    description: string;
}

export const ITEM_DEFINITIONS: Record<EItemType, ItemDefinition> = {
    [EItemType.ROSE]: {
        type: EItemType.ROSE,
        name: 'Hoa hồng',
        emoji: '🌹',
        category: EItemCategory.GIFT,
        intimacyBonus: 15,
        description: 'Tặng bạn bè để tăng 15 điểm thân mật',
    },
    [EItemType.ROCKET]: {
        type: EItemType.ROCKET,
        name: 'Tên lửa',
        emoji: '🚀',
        category: EItemCategory.GIFT,
        intimacyBonus: 25,
        description: 'Tặng bạn bè để tăng 25 điểm thân mật',
    },
    [EItemType.STAR]: {
        type: EItemType.STAR,
        name: 'Ngôi sao',
        emoji: '⭐',
        category: EItemCategory.GIFT,
        intimacyBonus: 40,
        description: 'Tặng bạn bè để tăng 40 điểm thân mật',
    },
    [EItemType.STREAK_SHIELD]: {
        type: EItemType.STREAK_SHIELD,
        name: 'Khiên bảo vệ streak',
        emoji: '🛡️',
        category: EItemCategory.SPECIAL,
        intimacyBonus: 0,
        description: 'Bảo vệ streak không bị mất khi bỏ lỡ 1 ngày',
    },
    [EItemType.EXP_BOOST]: {
        type: EItemType.EXP_BOOST,
        name: 'x2 EXP 1 giờ',
        emoji: '⚡',
        category: EItemCategory.SPECIAL,
        intimacyBonus: 0,
        description: 'Nhân đôi điểm thân mật nhận được trong 60 phút',
    },
};