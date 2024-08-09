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

const housingItems = [
    { title: 'Housing Online', description: 'Manage your housing applications and assignments', icon: 'home-outline', url: 'https://neuidmsso.neu.edu/rmsmercury' },
    { title: 'Work Request', description: 'Submit maintenance requests for your residence', icon: 'construct-outline', url: 'https://service.northeastern.edu/facilities?id=sc_cat_item&sys_id=5a565f8187e64d50d9b1dc6d3fbb35f4' },
    { title: 'Floor Plans', description: 'View floor plans of residence halls', icon: 'map-outline', url: 'https://www.northeastern.edu/housing/dnaesantoelrihtriseertn/' },
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

const Housing = () => {
    return (
        <>
            <Stack.Screen options={{ headerShown: false }} />
            <SafeAreaView style={styles.container} edges={['left', 'right']}>
                <LinearGradient
                    colors={[colors.gradientStart, colors.gradientMiddle1, colors.gradientMiddle2, colors.gradientEnd]}
                    style={styles.gradientBackground}
                >
                    <Header title="Housing" />
                    <ScrollView style={styles.scrollViewContent}>
                        {housingItems.map((item, index) => (
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

export default Housing;