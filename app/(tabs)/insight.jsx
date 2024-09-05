import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TextInput, FlatList, TouchableOpacity, KeyboardAvoidingView, Platform, Animated, Keyboard } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { getCurrentUser } from "../../lib/appwrite";
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

const HEADER_MAX_HEIGHT = 200;
const HEADER_MIN_HEIGHT = 100;
const TAB_BAR_HEIGHT = 120;

const colors = {
  background: '#000000',
  card: '#1A1A1A',
  accent: '#FF385C',
  text: '#FFFFFF',
  subtext: '#A0A0A0',
  border: '#333333',
  gradient: ['#FF385C', '#FF1493'],
  secondary: '#4A90E2',
  inputBackground: '#2C2C2E',
};

const Header = ({ scrollY }) => {
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

  return (
    <Animated.View style={[styles.header, { height: headerHeight }]}>
      <BlurView intensity={50} tint="dark" style={StyleSheet.absoluteFill} />
      <Animated.View style={[styles.headerContent, { opacity: headerOpacity }]}>
        <Text style={styles.logoText}>Insight</Text>
        <Text style={styles.headerSubtitle}>Your AI Study Assistant</Text>
      </Animated.View>
    </Animated.View>
  );
};

const ComingSoonOverlay = () => (
  <View style={styles.overlay}>
    <BlurView intensity={100} tint="dark" style={StyleSheet.absoluteFill} />
    <LinearGradient
      colors={colors.gradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.gradientOverlay}
    />
    <View style={styles.contentContainer}>
      <Text style={styles.comingSoonText}>Coming Soon</Text>
      <Text style={styles.descriptionText}>
        We're working hard to bring you an amazing AI-powered college experience.
        Stay tuned for updates!
      </Text>
    </View>
  </View>
);

const Insight = () => {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const scrollY = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef(null);
  const inputRef = useRef(null);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    fetchUserData();

    const keyboardWillShowListener = Keyboard.addListener(
      'keyboardWillShow',
      (e) => setKeyboardHeight(e.endCoordinates.height)
    );
    const keyboardWillHideListener = Keyboard.addListener(
      'keyboardWillHide',
      () => setKeyboardHeight(0)
    );

    return () => {
      keyboardWillShowListener.remove();
      keyboardWillHideListener.remove();
    };
  }, []);

  const fetchUserData = async () => {
    try {
      const user = await getCurrentUser();
      if (user && user.username) {
        setMessages([
          { id: '0', text: `Welcome, ${user.username}! I'm your AI study assistant. How can I help you today?`, sender: 'ai' }
        ]);
      } else {
        throw new Error("Username not found in user data");
      }
    } catch (err) {
      console.error("Error fetching user data:", err);
      setMessages([
        { id: '0', text: "Welcome! I'm your AI study assistant. How can I help you today?", sender: 'ai' }
      ]);
    }
  };

  const sendMessage = async () => {
    if (inputText.trim() === "") return;

    const newUserMessage = { id: Date.now().toString(), text: inputText, sender: 'user' };
    setMessages(prevMessages => [...prevMessages, newUserMessage]);
    setInputText("");
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    flatListRef.current?.scrollToEnd({ animated: true });

    // Simulate AI response (replace with actual AI integration)
    setTimeout(() => {
      const aiResponse = { id: (Date.now() + 1).toString(), text: `I understand you're asking about "${inputText}". As your AI study assistant, I'm here to help. Could you provide more details about what specific information you need?`, sender: 'ai' };
      setMessages(prevMessages => [...prevMessages, aiResponse]);
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 1000);
  };

  const renderMessage = ({ item }) => (
    <View style={[styles.messageBubble, item.sender === 'user' ? styles.userMessage : styles.aiMessage]}>
      <Text style={styles.messageText}>{item.text}</Text>
    </View>
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
      keyboardVerticalOffset={Platform.OS === "ios" ? -insets.bottom : 0}
    >
      <Header scrollY={scrollY} />
      <Animated.FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={item => item.id}
        contentContainerStyle={[
          styles.messageList,
          {
            paddingTop: HEADER_MAX_HEIGHT,
            paddingBottom: 80 + insets.bottom + TAB_BAR_HEIGHT
          }
        ]}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
      />
      <Animated.View
        style={[
          styles.inputContainer,
          {
            bottom: keyboardHeight > 0 ? keyboardHeight - insets.bottom : TAB_BAR_HEIGHT,
            position: 'absolute',
            left: 10,
            right: 10,
          }
        ]}
      >
        <BlurView intensity={100} tint="dark" style={StyleSheet.absoluteFill} />
        <TextInput
          ref={inputRef}
          style={styles.input}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Ask me anything about your studies..."
          placeholderTextColor={colors.subtext}
          multiline
        />
        <TouchableOpacity onPress={sendMessage} style={styles.sendButton}>
          <LinearGradient
            colors={colors.gradient}
            style={styles.sendButtonGradient}
          >
            <Ionicons name="send" size={24} color={colors.text} />
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
      <ComingSoonOverlay />
    </KeyboardAvoidingView>
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
    backgroundColor: colors.background,
  },
  headerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    fontSize: 40,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 10,
  },
  headerSubtitle: {
    fontSize: 16,
    color: colors.subtext,
  },
  messageList: {
    flexGrow: 1,
    padding: 16,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 20,
    marginBottom: 12,
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: colors.accent,
  },
  aiMessage: {
    alignSelf: 'flex-start',
    backgroundColor: colors.card,
  },
  messageText: {
    color: colors.text,
    fontSize: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    borderRadius: 25,
    overflow: 'hidden',
  },
  input: {
    flex: 1,
    backgroundColor: colors.inputBackground,
    color: colors.text,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    marginRight: 10,
    maxHeight: 100,
    textAlignVertical: 'center', // This centers text vertically
  },
  sendButton: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 50,
    height: 50,
    borderRadius: 25,
    overflow: 'hidden',
  },
  sendButtonGradient: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  gradientOverlay: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.3,
  },
  contentContainer: {
    alignItems: 'center',
    padding: 20,
  },
  comingSoonText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 16,
  },
  descriptionText: {
    fontSize: 18,
    color: colors.text,
    textAlign: 'center',
    maxWidth: '80%',
    lineHeight: 24,
  },
});

export default Insight;



