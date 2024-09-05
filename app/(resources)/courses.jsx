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

const coursesItems = [
    { title: 'Banner', description: 'Register for courses and manage class schedules', icon: 'calendar-outline', url: 'https://nubanner.neu.edu/StudentRegistrationSsb/ssb/registration' },
    { title: 'Time Ticketing', description: 'View your registration appointment time', icon: 'time-outline', url: 'https://registrar.northeastern.edu/article/time-ticketing/' },
    { title: 'Schedule', description: 'Organize and view your class timetable', icon: 'list-outline', url: 'https://nubanner.neu.edu/ssomanager/c/SSB?pkg=bwskfshd.P_CrseSchdDetl' },
    { title: 'Grades', description: 'Check your academic performance and final grades', icon: 'school-outline', url: 'https://nubanner.neu.edu/ssomanager/c/SSB?pkg=bwskogrd.P_ViewTermGrde' },
    { title: 'Transcript', description: 'Request and view your academic transcripts', icon: 'document-text-outline', url: 'https://nubanner.neu.edu/ssomanager/c/SSB?pkg=bwskotrn.P_ViewTermTran' },
    { title: 'Degree Audit', description: 'Track progress towards your degree completion', icon: 'checkmark-circle-outline', url: 'https://neu.uachieve.com/selfservice' },
    { title: 'Graduate Degree Audit', description: 'Monitor your progress in graduate programs', icon: 'ribbon-outline', url: 'https://uagr.northeastern.edu/SelfService' },
    { title: 'Calendars', description: 'View academic and campus event calendars', icon: 'calendar-number-outline', url: 'https://registrar.northeastern.edu/article/academic-calendar/' },
    { title: 'NUPath Dashboard', description: 'Track completion of core curriculum requirements', icon: 'git-network-outline', url: 'https://www.northeastern.edu/core/dashboard/' },
    { title: 'Registrar Forms', description: 'Access academic forms and petitions', icon: 'clipboard-outline', url: 'https://northeastern.secure.force.com/public/apex/ITSASCMainEntry' },
    { title: 'Textbook Exchange', description: 'Buy and sell textbooks with other students', icon: 'book-outline', url: 'https://neu-textbooks.glide.page/dl/6471c6' },
    { title: 'RateMyProfessors', description: 'Read and write reviews about professors', icon: 'star-outline', url: 'https://www.ratemyprofessors.com/school/696' },
];

const CourseItem = ({ item, onPress }) => (
    <TouchableOpacity onPress={() => onPress(item)} style={styles.courseItem}>
        <LinearGradient
            colors={colors.gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.courseGradient}
        >
            <View style={styles.courseContent}>
                <Ionicons name={item.icon} size={24} color={colors.text} style={styles.courseIcon} />
                <View style={styles.courseTextContainer}>
                    <Text style={styles.courseTitle} numberOfLines={1}>{item.title}</Text>
                    <Text style={styles.courseDescription} numberOfLines={2}>{item.description}</Text>
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
                        <Text style={styles.headerTitle}>Courses</Text>
                    </View>
                    <View style={styles.placeholderButton} />
                </View>
                <Text style={styles.headerSubtitle}>Manage your academic resources</Text>
            </Animated.View>
            <Animated.View style={[styles.miniHeader, { opacity: miniHeaderOpacity, paddingTop: insets.top }]}>
                <View style={styles.miniHeaderContent}>
                    <TouchableOpacity onPress={onBackPress} style={styles.miniBackButton}>
                        <Ionicons name="chevron-back" size={24} color={colors.text} />
                    </TouchableOpacity>
                    <Text style={styles.miniHeaderTitle}>Courses</Text>
                </View>
            </Animated.View>
        </Animated.View>
    );
};

const Courses = () => {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const scrollY = useRef(new Animated.Value(0)).current;

    const handleBackPress = useCallback(() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        router.back();
    }, [router]);

    const handleCoursePress = useCallback(async (course) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        const supported = await Linking.canOpenURL(course.url);

        if (supported) {
            await Linking.openURL(course.url);
        } else {
            Alert.alert(`Unable to open`, `Don't know how to open this URL: ${course.url}`);
        }
    }, []);

    return (
        <View style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />
            <StatusBar barStyle="light-content" />
            <Header scrollY={scrollY} insets={insets} onBackPress={handleBackPress} />
            <Animated.FlatList
                data={coursesItems}
                renderItem={({ item }) => <CourseItem item={item} onPress={handleCoursePress} />}
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
    courseItem: {
        marginBottom: 15,
        borderRadius: 12,
        overflow: 'hidden',
    },
    courseGradient: {
        padding: 2,
    },
    courseContent: {
        backgroundColor: colors.card,
        borderRadius: 10,
        padding: 15,
        flexDirection: 'row',
        alignItems: 'center',
    },
    courseIcon: {
        marginRight: 15,
    },
    courseTextContainer: {
        flex: 1,
    },
    courseTitle: {
        color: colors.text,
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    courseDescription: {
        color: colors.subtext,
        fontSize: 14,
    },
});

export default Courses;