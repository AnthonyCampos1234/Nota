import React, { useState, useRef, useEffect } from "react";
import { Link, router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  View,
  Text,
  ScrollView,
  Alert,
  Image,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TextInput,
} from "react-native";
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import { images } from "../../constants";
import { CustomButton, FormField } from "../../components";
import { getCurrentUser, signIn } from "../../lib/appwrite";
import { useGlobalContext } from "../../context/GlobalProvider";

const colors = {
  background: '#000000',
  card: '#1A1A1A',
  accent: '#FF385C',
  text: '#FFFFFF',
  subtext: '#A0A0A0',
  border: '#333333',
  gradient: ['#FF385C', '#FF1493'],
  secondary: '#3cdef6',
};

const SignIn = () => {
  const { setUser, setIsLogged } = useGlobalContext();
  const [isSubmitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const inputRefs = useRef({});
  const scrollViewRef = useRef();

  const submit = async () => {
    if (form.email === "" || form.password === "") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setSubmitting(true);

    try {
      // Check for existing session
      let session;
      try {
        session = await account.getSession('current');
      } catch (error) {
        // No active session, proceed with sign-in
      }

      if (session) {
        // A session already exists
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        Alert.alert(
          "Already Signed In",
          "You're already signed in. Do you want to continue?",
          [
            {
              text: "Cancel",
              onPress: () => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
                setSubmitting(false);
              },
              style: "cancel"
            },
            {
              text: "Continue",
              onPress: async () => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
                // Optionally, you can delete the existing session and create a new one
                await account.deleteSession('current');
                await signIn(form.email, form.password);
                const result = await getCurrentUser();
                setUser(result);
                setIsLogged(true);
                router.replace("/home");
              }
            }
          ]
        );
        return;
      }

      // No existing session, proceed with sign-in
      await signIn(form.email, form.password);
      const result = await getCurrentUser();
      setUser(result);
      setIsLogged(true);

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      if (result.needsOnboarding) {
        router.replace("/OnboardingScreen");
      } else {
        router.replace("/home");
      }
    } catch (error) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Error", error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleForgotPassword = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    // Add your forgot password logic here
  };

  const togglePasswordVisibility = () => {
    Haptics.selectionAsync();
    setShowPassword(!showPassword);
  };

  const handleSignUpPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    router.push("/sign-up");
  };

  const handleInputFocus = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  };

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
      }
    );

    return () => {
      keyboardDidShowListener.remove();
    };
  }, []);

  const renderFormField = (title, value, onChangeText, keyboardType, secureTextEntry, leftIcon, rightIcon) => (
    <TouchableOpacity
      style={styles.formFieldWrapper}
      activeOpacity={1}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        const input = inputRefs.current[title];
        input && input.focus();
      }}
    >
      <View style={styles.inputContainer}>
        {leftIcon}
        <TextInput
          ref={(ref) => (inputRefs.current[title] = ref)}
          style={styles.input}
          placeholder={title}
          placeholderTextColor={colors.subtext}
          value={value}
          onChangeText={onChangeText}
          keyboardType={keyboardType}
          secureTextEntry={secureTextEntry}
        />
        {rightIcon}
      </View>
    </TouchableOpacity>
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
    >
      <LinearGradient colors={[colors.background, colors.card]} style={styles.container}>
        <SafeAreaView style={styles.container}>
          <ScrollView
            ref={scrollViewRef}
            contentContainerStyle={styles.scrollViewContent}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.content}>
              <View style={styles.logoContainer}>
                <Image
                  source={images.NootaLogoForHome}
                  resizeMode="contain"
                  style={styles.logo}
                />
              </View>

              <View style={styles.formContainer}>
                <Text style={styles.title}>Welcome Back</Text>
                <Text style={styles.subtitle}>Sign in to your account</Text>

                {renderFormField(
                  "Email",
                  form.email,
                  (e) => setForm({ ...form, email: e }),
                  "email-address",
                  false,
                  <Ionicons name="mail-outline" size={24} color={colors.subtext} style={styles.icon} />,
                  null
                )}

                {renderFormField(
                  "Password",
                  form.password,
                  (e) => setForm({ ...form, password: e }),
                  "default",
                  !showPassword,
                  <Ionicons name="lock-closed-outline" size={24} color={colors.subtext} style={styles.icon} />,
                  <TouchableOpacity onPress={togglePasswordVisibility} style={styles.eyeIcon}>
                    <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={24} color={colors.subtext} />
                  </TouchableOpacity>
                )}

                <TouchableOpacity style={styles.forgotPassword} onPress={handleForgotPassword}>
                  <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                </TouchableOpacity>

                <CustomButton
                  title="Sign In"
                  handlePress={submit}
                  containerStyles={styles.button}
                  isLoading={isSubmitting}
                />

                <View style={styles.signupContainer}>
                  <Text style={styles.signupText}>Don't have an account?</Text>
                  <TouchableOpacity onPress={handleSignUpPress}>
                    <Text style={styles.signupLink}>Sign Up</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    width: 120,
    height: 120,
  },
  formContainer: {
    width: '100%',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.subtext,
    marginBottom: 30,
  },
  formFieldWrapper: {
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  input: {
    flex: 1,
    color: colors.text,
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  icon: {
    marginRight: 8,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 20,
    padding: 10,
  },
  forgotPasswordText: {
    color: colors.accent,
    fontSize: 16,
  },
  button: {
    marginBottom: 30,
    paddingVertical: 16,
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  signupText: {
    fontSize: 16,
    color: colors.subtext,
    marginRight: 8,
  },
  signupLink: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.accent,
    padding: 10,
  },
  eyeIcon: {
    padding: 10,
  },
});

export default SignIn;