import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Linking, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Video } from 'expo-av';
import { useGlobalContext } from '../context/GlobalProvider';
import { processScheduleText, processGpaText, updateUserSettings } from '../lib/appwrite';

const colors = {
    background: '#000000',
    card: '#1A1A1A',
    accent: '#FF385C',
    text: '#FFFFFF',
    subtext: '#A0A0A0',
    border: '#333333',
    gradient: ['#FF385C', '#FF1493'],
};

const { width: screenWidth } = Dimensions.get('window');

const OnboardingScreen = () => {
    const { user, setUser, setNeedsOnboarding } = useGlobalContext();
    const [step, setStep] = useState(0);
    const [scheduleText, setScheduleText] = useState('');
    const [gpaText, setGpaText] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const videoRef = useRef(null);

    const steps = [
        {
            title: 'Welcome to Nota!',
            description: "Let's set up your account to get the most out of the app.",
        },
        {
            title: 'How to Copy Your Class Schedule',
            description: 'We wanted to make it as easy as possible for you to switch to Nota, so please watch this video to see how to copy your class schedule and once your ready go ahead and click the button to access your class schedule information. After come right back to Nota to paste it:',
            video: require('../assets/courseScheduleRecording.mp4'),
            externalLink: 'https://nubanner.neu.edu/ssomanager/c/SSB?pkg=bwskfshd.P_CrseSchdDetl',
            externalLinkText: 'Go to Student Portal',
        },
        {
            title: 'Class Schedule',
            description: 'Paste your class schedule here.',
            input: scheduleText,
            setInput: setScheduleText,
            placeholder: 'Paste your class schedule here',
            submitText: 'Submit Class Schedule',
            onSubmit: handleScheduleSubmit,
        },
        {
            title: 'How to Copy Your GPA Information',
            description: 'Watch this video to see how to copy your GPA information and once your ready go ahead and click the button to access your GPA information. After come right back to Nota to paste it:',
            video: require('../assets/gradesRecording.mp4'),
            externalLink: 'https://nubanner.neu.edu/ssomanager/c/SSB?pkg=bwskogrd.P_ViewTermGrde',
            externalLinkText: 'Go to Academic Records',
        },
        {
            title: 'GPA Information',
            description: 'Paste your GPA information here.',
            input: gpaText,
            setInput: setGpaText,
            placeholder: 'Paste your GPA information here',
            submitText: 'Submit GPA Information',
            onSubmit: handleGpaSubmit,
        },
        {
            title: 'All Set!',
            description: "Great job! You're all set to start using Nota. Tap 'Finish' to go to your dashboard.",
        },
    ];

    useEffect(() => {
        if (videoRef.current) {
            videoRef.current.playAsync();
        }
    }, [step]);

    async function handleScheduleSubmit() {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        setIsProcessing(true);
        try {
            const result = await processScheduleText(user.$id, scheduleText);
            if (result.success) {
                setUser(prevUser => ({ ...prevUser, ...result.data }));
                setStep(step + 1);
            }
        } catch (error) {
            console.error('Error processing schedule:', error);
        } finally {
            setIsProcessing(false);
        }
    }

    async function handleGpaSubmit() {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        setIsProcessing(true);
        try {
            const result = await processGpaText(user.$id, gpaText);
            if (result.success) {
                setUser(prevUser => ({ ...prevUser, ...result.data }));
                setStep(step + 1);
            }
        } catch (error) {
            console.error('Error processing GPA:', error);
        } finally {
            setIsProcessing(false);
        }
    }

    async function finishOnboarding() {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        try {
            await updateUserSettings(user.$id, { needsOnboarding: false });
            setNeedsOnboarding(false);
            router.replace('/(tabs)/home');
        } catch (error) {
            console.error('Error finishing onboarding:', error);
        }
    }

    function handleExternalLink(url) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        Linking.openURL(url).catch((err) => console.error('An error occurred', err));
        setStep(step + 1);
    }

    function renderStep() {
        const currentStep = steps[step];

        return (
            <View style={styles.stepContainer}>
                <Text style={styles.stepTitle}>{currentStep.title}</Text>
                <Text style={styles.stepDescription}>{currentStep.description}</Text>
                {currentStep.video && (
                    <Video
                        ref={videoRef}
                        style={styles.video}
                        source={currentStep.video}
                        resizeMode="cover"
                        isLooping
                        shouldPlay
                    />
                )}
                {currentStep.input !== undefined && (
                    <>
                        <TextInput
                            style={styles.input}
                            multiline
                            numberOfLines={6}
                            onChangeText={currentStep.setInput}
                            value={currentStep.input}
                            placeholder={currentStep.placeholder}
                            placeholderTextColor={colors.subtext}
                            onFocus={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)}
                        />
                        <TouchableOpacity
                            style={styles.submitButton}
                            onPress={() => {
                                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
                                currentStep.onSubmit();
                            }}
                            disabled={isProcessing}
                        >
                            <Text style={styles.submitButtonText}>
                                {isProcessing ? 'Processing...' : currentStep.submitText}
                            </Text>
                        </TouchableOpacity>
                    </>
                )}
            </View>
        );
    }

    function handleNext() {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        if (step < steps.length - 1) {
            setStep(step + 1);
        } else {
            finishOnboarding();
        }
    }

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <LinearGradient
                    colors={colors.gradient}
                    style={styles.header}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                >
                    <Text style={styles.headerText}>Nota</Text>
                </LinearGradient>
                {renderStep()}
            </ScrollView>
            <View style={styles.footer}>
                {steps[step].externalLink ? (
                    <TouchableOpacity
                        style={styles.externalLinkButton}
                        onPress={() => handleExternalLink(steps[step].externalLink)}
                    >
                        <Text style={styles.externalLinkButtonText}>{steps[step].externalLinkText}</Text>
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity
                        style={styles.nextButton}
                        onPress={handleNext}
                        disabled={isProcessing}
                    >
                        <Text style={styles.nextButtonText}>
                            {step === steps.length - 1 ? 'Finish' : 'Next'}
                        </Text>
                        <Ionicons name="arrow-forward" size={24} color={colors.text} />
                    </TouchableOpacity>
                )}
            </View>
        </SafeAreaView>
    );
};


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    scrollContent: {
        flexGrow: 1,
    },
    header: {
        padding: 20,
        alignItems: 'center',
    },
    headerText: {
        fontSize: 32,
        fontWeight: 'bold',
        color: colors.text,
    },
    stepContainer: {
        padding: 20,
    },
    stepTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: colors.text,
        marginBottom: 10,
    },
    stepDescription: {
        fontSize: 16,
        color: colors.subtext,
        marginBottom: 20,
    },
    input: {
        backgroundColor: colors.card,
        color: colors.text,
        padding: 15,
        borderRadius: 12,
        fontSize: 16,
        marginBottom: 20,
        textAlignVertical: 'top',
        borderWidth: 1,
        borderColor: colors.border,
        height: 120,
    },
    submitButton: {
        backgroundColor: colors.accent,
        borderRadius: 12,
        padding: 15,
        alignItems: 'center',
    },
    submitButtonText: {
        color: colors.text,
        fontSize: 16,
        fontWeight: 'bold',
    },
    footer: {
        padding: 20,
    },
    nextButton: {
        backgroundColor: colors.accent,
        borderRadius: 12,
        padding: 15,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    nextButtonText: {
        color: colors.text,
        fontSize: 18,
        fontWeight: 'bold',
        marginRight: 10,
    },
    video: {
        width: screenWidth - 40, 
        height: (screenWidth - 40) * (16 / 9), 
        marginBottom: 20,
    },
    footer: {
        padding: 20,
        backgroundColor: colors.background,
    },
    externalLinkButton: {
        backgroundColor: colors.accent,
        borderRadius: 12,
        padding: 15,
        alignItems: 'center',
    },
    externalLinkButtonText: {
        color: colors.text,
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default OnboardingScreen;
