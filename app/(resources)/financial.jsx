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

const financialItems = [
    { title: 'E-Bill', description: 'View and pay your electronic bill', icon: 'cash-outline', url: 'https://nu.outsystemsenterprise.com/StudentFinance/ViewBill' },
    { title: 'Payment Plan', description: 'Set up and manage tuition payment plans', icon: 'calendar-outline', url: 'https://sso.myonplanu.com/landing/northeastern' },
    { title: 'Financial Aid Status', description: 'Check the status of your financial aid', icon: 'help-buoy-outline', url: 'https://www.pfw.neu.edu/NetPartnerStudent/PgHome.aspx' },
    { title: 'Direct Deposit', description: 'Set up direct deposit for refunds', icon: 'card-outline', url: 'https://nubanner.neu.edu/ssomanager/c/SSB?pkg=bwpkhpay.P_UpdateDirectDeposit' },
    { title: 'Scholarship Apps', description: 'Apply for scholarships', icon: 'gift-outline', url: 'https://nextgensso.com/sp/startSSO.ping?PartnerIdpId=https://neuidmsso.neu.edu/idp/shibboleth&TargetResource=https://northeastern.scholarships.ngwebsolutions.com/scholarx_studentportal.aspx' },
    { title: 'Awards and Aid', description: 'View your financial awards and aid information', icon: 'ribbon-outline', url: 'https://www.pfw.neu.edu/NetPartnerStudent/PgAwards.aspx' },
    { title: 'Appointments', description: 'Schedule appointments with financial advisors', icon: 'calendar-number-outline', url: 'https://service.northeastern.edu/appointments' },
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

const Financial = () => {
    return (
        <>
            <Stack.Screen options={{ headerShown: false }} />
            <SafeAreaView style={styles.container} edges={['left', 'right']}>
                <LinearGradient
                    colors={[colors.gradientStart, colors.gradientMiddle1, colors.gradientMiddle2, colors.gradientEnd]}
                    style={styles.gradientBackground}
                >
                    <Header title="Financial" />
                    <ScrollView style={styles.scrollViewContent}>
                        {financialItems.map((item, index) => (
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

export default Financial;