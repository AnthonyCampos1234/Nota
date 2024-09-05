import React, { useCallback, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking, Alert, Dimensions, Animated, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { BlurView } from 'expo-blur';
import { Stack } from 'expo-router';

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

const appsItems = [
    { title: 'Canvas', description: 'Access course materials, assignments, and grades', icon: 'book-outline', url: 'https://northeastern.instructure.com/' },
    { title: 'Office 365', description: 'Utilize Microsoft tools for email, documents, and collaboration', icon: 'mail-outline', url: 'https://www.office.com/' },
    { title: 'Piazza', description: 'Engage in class discussions and get help from classmates and instructors', icon: 'chatbubbles-outline', url: 'https://piazza.com/' },
    { title: 'Navigate', description: 'Track academic progress and access advising resources', icon: 'compass-outline', url: 'https://northeastern.campus.eab.com/capabilities#/my/appointment-dashboard?tab_name=appointments' },
    { title: 'NUWorks', description: 'Find job opportunities and career resources', icon: 'briefcase-outline', url: 'https://northeastern-csm.symplicity.com/students/index.php?s=home' },
    { title: 'Workday', description: 'Manage payroll, benefits, and personal information', icon: 'cash-outline', url: 'https://www.myworkday.com/northeastern/d/pex/home.htmld' },
];

const AppItem = ({ item, onPress }) => (
    <TouchableOpacity onPress={() => onPress(item)} style={styles.appItem}>
        <LinearGradient
            colors={colors.gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.appGradient}
        >
            <View style={styles.appContent}>
                <Ionicons name={item.icon} size={24} color={colors.text} style={styles.appIcon} />
                <View style={styles.appTextContainer}>
                    <Text style={styles.appTitle} numberOfLines={1}>{item.title}</Text>
                    <Text style={styles.appDescription} numberOfLines={2}>{item.description}</Text>
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
                        <Text style={styles.headerTitle}>Apps</Text>
                    </View>
                    <View style={styles.placeholderButton} />
                </View>
                <Text style={styles.headerSubtitle}>Access your university resources</Text>
            </Animated.View>
            <Animated.View style={[styles.miniHeader, { opacity: miniHeaderOpacity, paddingTop: insets.top }]}>
                <View style={styles.miniHeaderContent}>
                    <TouchableOpacity onPress={onBackPress} style={styles.miniBackButton}>
                        <Ionicons name="chevron-back" size={24} color={colors.text} />
                    </TouchableOpacity>
                    <Text style={styles.miniHeaderTitle}>Apps</Text>
                </View>
            </Animated.View>
        </Animated.View>
    );
};

const Apps = () => {
    const navigation = useNavigation();
    const insets = useSafeAreaInsets();
    const scrollY = useRef(new Animated.Value(0)).current;

    const handleBackPress = useCallback(() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        navigation.goBack();
    }, [navigation]);

    const handleAppPress = useCallback(async (app) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        const supported = await Linking.canOpenURL(app.url);

        if (supported) {
            await Linking.openURL(app.url);
        } else {
            Alert.alert(`Unable to open`, `Don't know how to open this URL: ${app.url}`);
        }
    }, []);

    return (
        <View style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />
            <StatusBar barStyle="light-content" />
            <Header scrollY={scrollY} insets={insets} onBackPress={handleBackPress} />
            <Animated.FlatList
                data={appsItems}
                renderItem={({ item }) => <AppItem item={item} onPress={handleAppPress} />}
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
    appItem: {
        marginBottom: 15,
        borderRadius: 12,
        overflow: 'hidden',
    },
    appGradient: {
        padding: 2,
    },
    appContent: {
        backgroundColor: colors.card,
        borderRadius: 10,
        padding: 15,
        flexDirection: 'row',
        alignItems: 'center',
    },
    appIcon: {
        marginRight: 15,
    },
    appTextContainer: {
        flex: 1,
    },
    appTitle: {
        color: colors.text,
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    appDescription: {
        color: colors.subtext,
        fontSize: 14,
    },
});

export default Apps;