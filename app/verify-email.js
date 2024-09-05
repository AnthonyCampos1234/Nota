import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useSearchParams, useRouter } from 'expo-router';
import { account } from '../lib/appwrite';

export default function VerifyEmail() {
    const [verificationStatus, setVerificationStatus] = useState('Verifying...');
    const { userId, secret } = useSearchParams();
    const router = useRouter();

    useEffect(() => {
        async function verifyEmail() {
            try {
                await account.updateVerification(userId, secret);
                setVerificationStatus('Email verified successfully!');
                setTimeout(() => router.replace('/sign-in'), 3000);
            } catch (error) {
                setVerificationStatus('Verification failed: ' + error.message);
            }
        }
        verifyEmail();
    }, [userId, secret]);

    return (
        <View style={styles.container}>
            <Text style={styles.text}>{verificationStatus}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    text: {
        fontSize: 18,
    },
});