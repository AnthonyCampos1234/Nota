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

const huskyCardItems = [
    { title: 'Balance', description: 'Check the balance on your Husky Card', icon: 'wallet-outline', url: 'https://nu.outsystemsenterprise.com/StudentFinance/HuskyCardAccounts' },
    { title: 'Preferences', description: 'Set preferences for your Husky Card', icon: 'settings-outline', url: 'https://huskycardcenter.neu.edu/student/welcome.phps' },
    { title: 'Meal Plan', description: 'Manage your campus dining meal plan', icon: 'restaurant-outline', url: 'https://nubanner.neu.edu/ssomanager/c/SSB?pkg=bzskoacc.p_selmp' },
    { title: 'Dining Hours', description: 'Check operating hours for dining locations', icon: 'time-outline', url: 'https://nudining.com/public/hours-of-operation' },
    { title: 'Husker Gym', description: 'Access gym facilities and schedules', icon: 'fitness-outline', url: 'https://gym.husker.nu/' },
    { title: 'Event Tickets', description: 'Purchase tickets for campus events', icon: 'ticket-outline', url: 'https://nuhuskies.evenue.net/' },
    { title: 'Menus', description: 'View menus for campus dining facilities', icon: 'fast-food-outline', url: 'https://nudining.com/public' },
    { title: 'On-Campus Vendors', description: 'Find vendors that accept Husky Card on campus', icon: 'business-outline', url: 'https://www.northeastern.edu/huskycard/vendors/on-campus-vendors/' },
    { title: 'Off-Campus Vendors', description: 'Locate off-campus businesses that accept Husky Card', icon: 'map-outline', url: 'https://www.northeastern.edu/huskycard/vendors/off-campus-vendors/' },
];

const HuskyCardItem = ({ item, onPress }) => (
    <TouchableOpacity onPress={() => onPress(item)} style={styles.huskyCardItem}>
        <LinearGradient
            colors={colors.gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.huskyCardGradient}
        >
            <View style={styles.huskyCardContent}>
                <Ionicons name={item.icon} size={24} color={colors.text} style={styles.huskyCardIcon} />
                <View style={styles.huskyCardTextContainer}>
                    <Text style={styles.huskyCardTitle} numberOfLines={1}>{item.title}</Text>
                    <Text style={styles.huskyCardDescription} numberOfLines={2}>{item.description}</Text>
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
                        <Text style={styles.headerTitle}>Husky Card</Text>
                    </View>
                    <View style={styles.placeholderButton} />
                </View>
                <Text style={styles.headerSubtitle}>Manage your campus ID and services</Text>
            </Animated.View>
            <Animated.View style={[styles.miniHeader, { opacity: miniHeaderOpacity, paddingTop: insets.top }]}>
                <View style={styles.miniHeaderContent}>
                    <TouchableOpacity onPress={onBackPress} style={styles.miniBackButton}>
                        <Ionicons name="chevron-back" size={24} color={colors.text} />
                    </TouchableOpacity>
                    <Text style={styles.miniHeaderTitle}>Husky Card</Text>
                </View>
            </Animated.View>
        </Animated.View>
    );
};

const HuskyCard = () => {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const scrollY = useRef(new Animated.Value(0)).current;

    const handleBackPress = useCallback(() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        router.back();
    }, [router]);

    const handleHuskyCardItemPress = useCallback(async (item) => {
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
                data={huskyCardItems}
                renderItem={({ item }) => <HuskyCardItem item={item} onPress={handleHuskyCardItemPress} />}
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
    huskyCardItem: {
        marginBottom: 15,
        borderRadius: 12,
        overflow: 'hidden',
    },
    huskyCardGradient: {
        padding: 2,
    },
    huskyCardContent: {
        backgroundColor: colors.card,
        borderRadius: 10,
        padding: 15,
        flexDirection: 'row',
        alignItems: 'center',
    },
    huskyCardIcon: {
        marginRight: 15,
    },
    huskyCardTextContainer: {
        flex: 1,
    },
    huskyCardTitle: {
        color: colors.text,
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    huskyCardDescription: {
        color: colors.subtext,
        fontSize: 14,
    },
});

export default HuskyCard;