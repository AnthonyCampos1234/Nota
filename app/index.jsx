import React, { useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import { Redirect, router } from "expo-router";
import { View, Text, Image, Animated, StyleSheet, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';

import { images } from "../constants";
import { CustomButton, Loader } from "../components";
import { useGlobalContext } from "../context/GlobalProvider";

const colors = {
  background: '#000000',
  card: '#1A1A1A',
  accent: '#FF385C',
  text: '#FFFFFF',
  subtext: '#A0A0A0',
  border: '#333333',
  gradient: ['#FF385C', '#FF1493'],
};

const Welcome = () => {
  const { loading, isLogged } = useGlobalContext();
  const fadeAnim = new Animated.Value(0);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleGetStarted = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    router.push("/sign-up");
  };

  const handleSignIn = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    router.push("/sign-in");
  };

  const handleTermsPress = () => {
    Haptics.selectionAsync();
    router.push("/terms");
  };

  const handlePrivacyPress = () => {
    Haptics.selectionAsync();
    router.push("/privacy");
  };

  if (!loading && isLogged) return <Redirect href="/home" />;

  return (
    <LinearGradient
      colors={[colors.background, colors.card]}
      style={styles.container}
    >
      <SafeAreaView style={styles.container}>
        <Loader isLoading={loading} />

        <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
          <View style={styles.logoContainer}>
            <Image
              source={images.NootaLogoForHome}
              resizeMode="contain"
              style={styles.logo}
            />
          </View>

          <View style={styles.textContainer}>
            <Text style={styles.title}>
              All of your university{"\n"}
              needs with <Text style={styles.accentText}>Nota</Text>
            </Text>

            <Text style={styles.subtitle}>
              Everything You Need, From Study to Play,{"\n"}
              Simplifying Uni Life, Every Day
            </Text>

            <CustomButton
              title="Get Started"
              handlePress={handleGetStarted}
              containerStyles="w-full mb-3"
            />

            <TouchableOpacity onPress={handleSignIn}>
              <Text style={styles.signInText}>Already have an account? Sign In</Text>
            </TouchableOpacity>

            <Text style={styles.termsText}>
              By continuing, you agree to our{' '}
              <Text style={styles.linkText} onPress={handleTermsPress}>Terms of Service</Text>
              {' '}and{' '}
              <Text style={styles.linkText} onPress={handlePrivacyPress}>Privacy Policy</Text>
            </Text>
          </View>
        </Animated.View>

        <StatusBar style="light" />
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    padding: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 50,
  },
  logo: {
    width: 200,
    height: 200,
  },
  textContainer: {
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    color: colors.text,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  accentText: {
    color: colors.accent,
  },
  subtitle: {
    fontSize: 16,
    color: colors.subtext,
    textAlign: 'center',
    marginBottom: 40,
  },
  signInText: {
    color: colors.text,
    fontSize: 16,
    marginBottom: 20,
  },
  termsText: {
    color: colors.subtext,
    fontSize: 12,
    textAlign: 'center',
  },
  linkText: {
    color: colors.accent,
    textDecorationLine: 'underline',
  },
});

export default Welcome;