import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Linking, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';

const colors = {
    primary: '#000000',
    secondary: '#4A90E2',
    tertiary: '#50C878',
    quaternary: '#9B59B6',
    accent: '#FF69B4',
    text: '#FFFFFF',
    textSecondary: '#CCCCCC',
    gradientStart: '#000000',
    gradientMiddle1: '#0F2027',
    gradientMiddle2: '#203A43',
    gradientEnd: '#2C5364',
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

const Header = ({ title }) => {
    const insets = useSafeAreaInsets();
    const router = useRouter();

    return (
        <View style={[styles.header, { paddingTop: insets.top }]}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                <Ionicons name="chevron-back" size={32} color={colors.text} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{title}</Text>
            <View style={styles.placeholder} />
        </View>
    );
};

const ResourceItem = ({ title, description, icon, url }) => {
    const handlePress = async () => {
        const supported = await Linking.canOpenURL(url);

        if (supported) {
            await Linking.openURL(url);
        } else {
            Alert.alert(`Don't know how to open this URL: ${url}`);
        }
    };

    return (
        <TouchableOpacity style={styles.resourceCard} onPress={handlePress}>
            <View style={[styles.resourceIcon, { backgroundColor: colors.quaternary }]}>
                <Ionicons name={icon} size={24} color={colors.primary} />
            </View>
            <View style={styles.resourceInfo}>
                <Text style={styles.resourceTitle}>{title}</Text>
                <Text style={styles.resourceDescription}>{description}</Text>
            </View>
        </TouchableOpacity>
    );
};

const Courses = () => {
    return (
        <>
            <Stack.Screen options={{ headerShown: false }} />
            <SafeAreaView style={styles.container} edges={['left', 'right']}>
                <LinearGradient
                    colors={[colors.gradientStart, colors.gradientMiddle1, colors.gradientMiddle2, colors.gradientEnd]}
                    style={styles.gradientBackground}
                >
                    <Header title="Courses" />
                    <ScrollView style={styles.scrollViewContent}>
                        {coursesItems.map((item, index) => (
                            <ResourceItem
                                key={index}
                                title={item.title}
                                description={item.description}
                                icon={item.icon}
                                url={item.url}
                            />
                        ))}
                    </ScrollView>
                </LinearGradient>
            </SafeAreaView>
        </>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.primary,
    },
    gradientBackground: {
        flex: 1,
    },
    scrollViewContent: {
        flexGrow: 1,
        paddingHorizontal: 16,
        paddingBottom: 32,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: colors.text,
    },
    backButton: {
        width: 45,
        height: 45,
        borderRadius: 16,
        backgroundColor: 'rgba(255,255,255,0.3)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    placeholder: {
        width: 40,
    },
    resourceCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.primary,
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
    },
    resourceIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    resourceInfo: {
        flex: 1,
    },
    resourceTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.text,
        marginBottom: 4,
    },
    resourceDescription: {
        fontSize: 14,
        color: colors.textSecondary,
    },
});

export default Courses;