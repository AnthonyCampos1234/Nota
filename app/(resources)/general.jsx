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

const generalItems = [
    { title: 'PaperCut Printing', description: 'Print documents from university printers', icon: 'print-outline', url: 'https://papercut.northeastern.edu/' },
    { title: 'Trace', description: 'Access contact tracing information', icon: 'trail-sign-outline', url: 'https://www.applyweb.com/eval/shibboleth/neu/36892' },
    { title: 'Registrar', description: 'Handle enrollment, transcripts, and academic records', icon: 'school-outline', url: 'https://nubanner.neu.edu/ssomanager/c/SSB?pkg=twbkwbis.P_GenMenu?name=bmenu.P_StuMainMnu' },
    { title: 'Navigate', description: 'Access academic advising and support services', icon: 'compass-outline', url: 'https://northeastern.campus.eab.com/capabilities#/my/appointment-dashboard?tab_name=appointments' },
    { title: 'NUWorks', description: 'Find internships, jobs, and career advice', icon: 'briefcase-outline', url: 'https://northeastern-csm.symplicity.com/students/index.php?s=home' },
    { title: 'My Workday', description: 'Manage payroll, benefits, and HR information', icon: 'calendar-outline', url: 'https://www.myworkday.com/northeastern/d/pex/home.htmld' },
    { title: 'NUSHP', description: 'Access student health insurance plan information', icon: 'medical-outline', url: 'https://go.gallagherstudent.com/Universities/Northeastern%20University/Home' },
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
            <View style={[styles.resourceIcon, { backgroundColor: colors.tertiary }]}>
                <Ionicons name={icon} size={24} color={colors.primary} />
            </View>
            <View style={styles.resourceInfo}>
                <Text style={styles.resourceTitle}>{title}</Text>
                <Text style={styles.resourceDescription}>{description}</Text>
            </View>
        </TouchableOpacity>
    );
};

const General = () => {
    return (
        <>
            <Stack.Screen options={{ headerShown: false }} />
            <SafeAreaView style={styles.container} edges={['left', 'right']}>
                <LinearGradient
                    colors={[colors.gradientStart, colors.gradientMiddle1, colors.gradientMiddle2, colors.gradientEnd]}
                    style={styles.gradientBackground}
                >
                    <Header title="General" />
                    <ScrollView style={styles.scrollViewContent}>
                        {generalItems.map((item, index) => (
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
        width: 40, // To balance the header
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

export default General;