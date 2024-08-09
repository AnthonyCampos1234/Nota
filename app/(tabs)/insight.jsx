import React, { useState, useCallback } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
  Alert,
  Dimensions,
  Animated,
} from "react-native";
import { router, useFocusEffect } from "expo-router";
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { getCurrentUser } from "../../lib/appwrite";
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

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

const Header = ({ userName, insightPoints }) => {
  const insets = useSafeAreaInsets();
  const [bounceAnim] = useState(new Animated.Value(1));

  const animateInsightPoints = useCallback(() => {
    Animated.sequence([
      Animated.timing(bounceAnim, { toValue: 1.1, duration: 200, useNativeDriver: true }),
      Animated.spring(bounceAnim, { toValue: 1, friction: 4, useNativeDriver: true })
    ]).start();
  }, [bounceAnim]);

  return (
    <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
      <View style={styles.userInfo}>
        <Text style={styles.headerTitle}>{userName}</Text>
        <TouchableOpacity onPress={animateInsightPoints} style={styles.insightPointsContainer}>
          <Animated.View style={[styles.insightPointsContent, { transform: [{ scale: bounceAnim }] }]}>
            <Ionicons name="flash" size={24} color={colors.accent} />
            <Text style={styles.insightPointsText}>{insightPoints} IP</Text>
          </Animated.View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const InsightCard = ({ title, points, icon, progress, color, onPress }) => (
  <TouchableOpacity
    style={[styles.insightCard, { borderColor: color }]}
    onPress={onPress}
  >
    <View style={[styles.insightIcon, { backgroundColor: color }]}>
      <Ionicons name={icon} size={32} color={colors.primary} />
    </View>
    <View style={styles.insightInfo}>
      <Text style={styles.insightTitle}>{title}</Text>
      <Text style={styles.insightPoints}>{points} IP</Text>
    </View>
    <View style={styles.insightProgressBar}>
      <View style={[styles.insightProgress, { width: `${progress}%`, backgroundColor: color }]} />
    </View>
  </TouchableOpacity>
);

const NewsItem = ({ title, source, onPress }) => (
  <TouchableOpacity style={styles.newsItem} onPress={onPress}>
    <Text style={styles.newsTitle}>{title}</Text>
    <Text style={styles.newsSource}>{source}</Text>
  </TouchableOpacity>
);

const Insight = () => {
  const [userName, setUserName] = useState("");
  const [insightPoints, setInsightPoints] = useState(0);
  const [question, setQuestion] = useState("");
  const [aiResponse, setAiResponse] = useState("");

  const fetchUserData = useCallback(async () => {
    try {
      const user = await getCurrentUser();
      if (user && user.username) {
        setUserName(user.username);
        setInsightPoints(150);
      } else {
        throw new Error("Username not found in user data");
      }
    } catch (err) {
      console.error("Error fetching user data:", err);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchUserData();
    }, [fetchUserData])
  );

  const insightActivities = [
    { id: '1', title: 'Daily Quiz', points: 20, icon: 'help-circle-outline', progress: 0, color: colors.secondary },
    { id: '2', title: 'Read Article', points: 15, icon: 'book-outline', progress: 50, color: colors.tertiary },
    { id: '3', title: 'Watch Lecture', points: 30, icon: 'videocam-outline', progress: 75, color: colors.quaternary },
    { id: '4', title: 'Practice Problems', points: 25, icon: 'create-outline', progress: 25, color: colors.accent },
  ];

  const newsItems = [
    { id: '1', title: "New Research Grant Awarded to CS Department", source: "University News" },
    { id: '2', title: "Guest Lecture Series: AI in Healthcare", source: "Events Office" },
    { id: '3', title: "Student Startup Wins National Competition", source: "Business School" },
  ];

  const handleActivityPress = (activity) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    console.log(`Starting activity: ${activity.title}`);
  };

  const handleNewsPress = (news) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    console.log(`Opening news: ${news.title}`);
  };

  const askQuestion = async () => {
    if (question.trim() === "") {
      return Alert.alert("Error", "Please enter a question");
    }
    try {
      // TODO: Implement actual AI chat logic here
      setAiResponse("This is a placeholder response. In a real app, we would integrate with an AI service to provide answers.");
      setQuestion("");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      Alert.alert("Error", "Failed to process your question");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <LinearGradient
        colors={[colors.gradientStart, colors.gradientMiddle1, colors.gradientMiddle2, colors.gradientEnd]}
        style={styles.gradientBackground}
      >
        <Header userName={userName} insightPoints={insightPoints} />
        <FlatList
          contentContainerStyle={styles.scrollViewContent}
          ListHeaderComponent={
            <>
              <Text style={styles.sectionTitle}>Today's Insights</Text>
              {insightActivities.map((item) => (
                <InsightCard
                  key={item.id}
                  title={item.title}
                  points={item.points}
                  icon={item.icon}
                  progress={item.progress}
                  color={item.color}
                  onPress={() => handleActivityPress(item)}
                />
              ))}
              <Text style={styles.sectionTitle}>AI Study Assistant</Text>
              <View style={styles.aiChatContainer}>
                <TextInput
                  style={styles.aiChatInput}
                  value={question}
                  onChangeText={setQuestion}
                  placeholder="Ask a study question..."
                  placeholderTextColor={colors.textSecondary}
                />
                <TouchableOpacity style={styles.aiChatButton} onPress={askQuestion}>
                  <Ionicons name="send" size={24} color={colors.text} />
                </TouchableOpacity>
              </View>
              {aiResponse !== "" && (
                <View style={styles.aiResponseContainer}>
                  <Text style={styles.aiResponseText}>{aiResponse}</Text>
                </View>
              )}
              <Text style={styles.sectionTitle}>Campus News</Text>
            </>
          }
          data={newsItems}
          renderItem={({ item }) => (
            <NewsItem
              title={item.title}
              source={item.source}
              onPress={() => handleNewsPress(item)}
            />
          )}
          keyExtractor={(item) => item.id}
        />
      </LinearGradient>
    </SafeAreaView>
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
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  insightPointsContainer: {
    backgroundColor: `${colors.accent}20`,
    borderRadius: 16,
    padding: 8,
  },
  insightPointsContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  insightPointsText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginLeft: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 24,
    marginBottom: 16,
  },
  insightCard: {
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
  insightIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  insightInfo: {
    flex: 1,
  },
  insightTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  insightPoints: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  insightProgressBar: {
    width: 60,
    height: 8,
    backgroundColor: `${colors.text}40`,
    borderRadius: 4,
    overflow: 'hidden',
  },
  insightProgress: {
    height: '100%',
  },
  aiChatContainer: {
    flexDirection: 'row',
    backgroundColor: colors.primary,
    borderRadius: 25,
    paddingHorizontal: 16,
    marginBottom: 16,
    borderColor: colors.secondary,
  },
  aiChatInput: {
    flex: 1,
    color: colors.text,
    fontSize: 16,
    paddingVertical: 12,
  },
  aiChatButton: {
    backgroundColor: colors.secondary,
    borderRadius: 25,
    padding: 12,
    alignSelf: 'center',
  },
  aiResponseContainer: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderColor: colors.tertiary,
  },
  aiResponseText: {
    color: colors.text,
    fontSize: 16,
  },
  newsItem: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderColor: colors.quaternary,
  },
  newsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  newsSource: {
    fontSize: 14,
    color: colors.textSecondary,
  },
});

export default Insight;