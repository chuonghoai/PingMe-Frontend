import React, { useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Marker } from 'react-native-maps';
import { ITEM_DEFINITIONS } from './challenge-definition';

interface MapEventMarkerProps {
    event: {
        id: string;
        name: string;
        latitude: number;
        longitude: number;
        rewardItem: string;
    };
    onPress: (event: any) => void;
}

export const MapEventMarker = React.memo(({ event, onPress }: MapEventMarkerProps) => {
    const [tracksViewChanges, setTracksViewChanges] = useState(true);

    const itemDef = useMemo(() => (ITEM_DEFINITIONS as any)[event.rewardItem], [event.rewardItem]);
    const emoji = itemDef?.emoji || '🎁';

    useEffect(() => {
        const timer = setTimeout(() => setTracksViewChanges(false), 1000);
        return () => clearTimeout(timer);
    }, []);

    return (
        <Marker
            coordinate={{ latitude: event.latitude, longitude: event.longitude }}
            tracksViewChanges={tracksViewChanges}
            anchor={{ x: 0.5, y: 0.8 }}
            onPress={() => {
                onPress(event);
                console.log(`Pressed event: ${event.latitude} ${event.longitude}`);
            }}
        >
            <View style={styles.markerContainer}>
                <View style={styles.pinHead}>
                    <View style={styles.whiteCircle}>
                        <Text style={styles.emojiText}>{emoji}</Text>
                    </View>
                </View>
                <View style={styles.pinTip} />
            </View>
        </Marker>
    );
});

const styles = StyleSheet.create({
    markerContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    pinHead: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#FFB300',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 2,
        borderWidth: 1,
        borderColor: '#FFA000',
    },
    whiteCircle: {
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
    },
    emojiText: {
        fontSize: 18,
    },
    pinTip: {
        width: 0,
        height: 0,
        backgroundColor: 'transparent',
        borderStyle: 'solid',
        borderLeftWidth: 8,
        borderRightWidth: 8,
        borderBottomWidth: 12,
        borderLeftColor: 'transparent',
        borderRightColor: 'transparent',
        borderBottomColor: '#FFB300',
        transform: [{ rotate: '180deg' }],
        marginTop: -4,
        zIndex: 1,
    },
});