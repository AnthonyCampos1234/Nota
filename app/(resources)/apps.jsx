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

const appsItems = [
    { title: 'Canvas', description: 'Access course materials, assignments, and grades', icon: 'book-outline', url: 'https://northeastern.instructure.com/' },
    { title: 'Office 365', description: 'Utilize Microsoft tools for email, documents, and collaboration', icon: 'mail-outline', url: 'https://www.office.com/' },
    { title: 'Piazza', description: 'Engage in class discussions and get help from classmates and instructors', icon: 'chatbubbles-outline', url: 'https://piazza.com/' },
    { title: 'Navigate', description: 'Track academic progress and access advising resources', icon: 'compass-outline', url: 'https://northeastern.campus.eab.com/capabilities#/my/appointment-dashboard?tab_name=appointments' },
    { title: 'NUWorks', description: 'Find job opportunities and career resources', icon: 'briefcase-outline', url: 'https://northeastern-csm.symplicity.com/students/index.php?s=home' },
    { title: 'Workday', description: 'Manage payroll, benefits, and personal information', icon: 'cash-outline', url: 'https://www.myworkday.com/northeastern/d/pex/home.htmld' },
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
            <View style={[styles.resourceIcon, { backgroundColor: colors.secondary }]}>
                <Ionicons name={icon} size={24} color={colors.primary} />
            </View>
            <View style={styles.resourceInfo}>
                <Text style={styles.resourceTitle}>{title}</Text>
                <Text style={styles.resourceDescription}>{description}</Text>
            </View>
        </TouchableOpacity>
    );
};

const Apps = () => {
    return (
        <>
            <Stack.Screen options={{ headerShown: false }} />
            <SafeAreaView style={styles.container} edges={['left', 'right']}>
                <LinearGradient
                    colors={[colors.gradientStart, colors.gradientMiddle1, colors.gradientMiddle2, colors.gradientEnd]}
                    style={styles.gradientBackground}
                >
                    <Header title="Apps" />
                    <ScrollView style={styles.scrollViewContent}>
                        {appsItems.map((item, index) => (
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

export default Apps;