import React, { useCallback, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Dimensions, Animated, StatusBar, Linking, Alert } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const HEADER_MAX_HEIGHT = 200;
const HEADER_MIN_HEIGHT = 100;

const colors = {
    background: '#000000',
    card: '#1A1A1A',
    accent: '#FF385C',
    text: '#FFFFFF',
    subtext: '#A0A0A0',
    border: '#333333',
    gradient: ['#FF385C', '#FF1493'],
    secondary: '#4A90E2',
    tertiary: '#50C878',
    quaternary: '#9B59B6',
};

const miscellaneousItems = [
    { title: 'Room Reservations', description: 'Reserve rooms for study or events', icon: 'calendar-outline', url: 'https://dashboard.robinpowered.com/Northeastern' },
    { title: 'Parking', description: 'Manage parking permits and payments', icon: 'car-outline', url: 'https://www.masparc.com/wheretopark/' },
    { title: 'VPN Portal', description: "Access the university's VPN service", icon: 'shield-outline', url: 'https://vpn.northeastern.edu/global-protect/getsoftwarepage.esp' },
    { title: 'Snell Reservations', description: 'Reserve space in Snell Library', icon: 'book-outline', url: 'https://northeastern.libcal.com/reserve/' },
    { title: 'DRC Services', description: 'Access services from the Disability Resource Center', icon: 'accessibility-outline', url: 'https://northeastern.secure.force.com/public/apex/ITSDRCMainEntry' },
];

const MiscellaneousItem = ({ item, onPress }) => (
    <TouchableOpacity onPress={() => onPress(item)} style={styles.miscellaneousItem}>
        <LinearGradient
            colors={colors.gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.miscellaneousGradient}
        >
            <View style={styles.miscellaneousContent}>
                <Ionicons name={item.icon} size={24} color={colors.text} style={styles.miscellaneousIcon} />
                <View style={styles.miscellaneousTextContainer}>
                    <Text style={styles.miscellaneousTitle} numberOfLines={1}>{item.title}</Text>
                    <Text style={styles.miscellaneousDescription} numberOfLines={2}>{item.description}</Text>
                </View>
            </View>
        </LinearGradient>
    </TouchableOpacity>
);

const Header = ({ scrollY, insets, onBackPress }) => {
    const headerHeight = scrollY.interpolate({
        inputRange: [0, HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT],
        outputRange: [HEADER_MAX_HEIGHT, HEADER_MIN_HEIGHT],
        extrapolate: 'clamp',
    });

    const headerOpacity = scrollY.interpolate({
        inputRange: [0, (HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT) / 2, HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT],
        outputRange: [1, 1, 0],
        extrapolate: 'clamp',
    });

    const miniHeaderOpacity = scrollY.interpolate({
        inputRange: [0, HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT],
        outputRange: [0, 1],
        extrapolate: 'clamp',
    });

    return (
        <Animated.View style={[styles.header, { height: headerHeight }]}>
            <BlurView intensity={50} tint="dark" style={StyleSheet.absoluteFill} />
            <Animated.View style={[styles.headerContent, { opacity: headerOpacity, paddingTop: insets.top }]}>
                <View style={styles.headerTopRow}>
                    <TouchableOpacity onPress={onBackPress} style={styles.backButton}>
                        <Ionicons name="chevron-back" size={28} color={colors.text} />
                    </TouchableOpacity>
                    <View style={styles.headerTitleContainer}>
                        <Text style={styles.headerTitle}>Miscellaneous</Text>
                    </View>
                    <View style={styles.placeholderButton} />
                </View>
                <Text style={styles.headerSubtitle}>Additional university resources</Text>
            </Animated.View>
            <Animated.View style={[styles.miniHeader, { opacity: miniHeaderOpacity, paddingTop: insets.top }]}>
                <View style={styles.miniHeaderContent}>
                    <TouchableOpacity onPress={onBackPress} style={styles.miniBackButton}>
                        <Ionicons name="chevron-back" size={24} color={colors.text} />
                    </TouchableOpacity>
                    <Text style={styles.miniHeaderTitle}>Miscellaneous</Text>
                </View>
            </Animated.View>
        </Animated.View>
    );
};

const Miscellaneous = () => {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const scrollY = useRef(new Animated.Value(0)).current;

    const handleBackPress = useCallback(() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        router.back();
    }, [router]);

    const handleMiscellaneousItemPress = useCallback(async (item) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        const supported = await Linking.canOpenURL(item.url);

        if (supported) {
            await Linking.openURL(item.url);
        } else {
            Alert.alert(`Unable to open`, `Don't know how to open this URL: ${item.url}`);
        }
    }, []);

    return (
        <View style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />
            <StatusBar barStyle="light-content" />
            <Header scrollY={scrollY} insets={insets} onBackPress={handleBackPress} />
            <Animated.FlatList
                data={miscellaneousItems}
                renderItem={({ item }) => <MiscellaneousItem item={item} onPress={handleMiscellaneousItemPress} />}
                keyExtractor={item => item.title}
                contentContainerStyle={[
                    styles.listContainer,
                    { paddingTop: HEADER_MAX_HEIGHT, paddingBottom: 20 + insets.bottom }
                ]}
                scrollEventThrottle={16}
                onScroll={Animated.event(
                    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                    { useNativeDriver: false }
                )}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    header: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1,
        backgroundColor: 'transparent',
    },
    headerContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    headerTopRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        marginBottom: 10,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitleContainer: {
        flex: 1,
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 32,
        fontWeight: 'bold',
        color: colors.text,
    },
    placeholderButton: {
        width: 40,
    },
    headerSubtitle: {
        fontSize: 16,
        color: colors.subtext,
        textAlign: 'center',
    },
    miniHeader: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: HEADER_MIN_HEIGHT,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    miniHeaderContent: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },
    miniBackButton: {
        marginRight: 15,
    },
    miniHeaderTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: colors.text,
    },
    listContainer: {
        paddingHorizontal: 20,
    },
    miscellaneousItem: {
        marginBottom: 15,
        borderRadius: 12,
        overflow: 'hidden',
    },
    miscellaneousGradient: {
        padding: 2,
    },
    miscellaneousContent: {
        backgroundColor: colors.card,
        borderRadius: 10,
        padding: 15,
        flexDirection: 'row',
        alignItems: 'center',
    },
    miscellaneousIcon: {
        marginRight: 15,
    },
    miscellaneousTextContainer: {
        flex: 1,
    },
    miscellaneousTitle: {
        color: colors.text,
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    miscellaneousDescription: {
        color: colors.subtext,
        fontSize: 14,
    },
});

export default Miscellaneous;