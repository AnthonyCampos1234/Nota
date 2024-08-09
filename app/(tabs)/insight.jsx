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
  Modal,
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

const Header = ({ userName, onChatPress }) => {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
      <View style={styles.userInfo}>
        <Text style={styles.headerTitle}>{userName}</Text>
        <TouchableOpacity onPress={onChatPress} style={styles.aiChatButton}>
          <Ionicons name="logo-android" size={24} color={colors.accent} />
          <Text style={styles.aiChatButtonText}>AI Chat</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const ResourceCard = ({ title, description, icon, color, onPress }) => (
  <TouchableOpacity
    style={[styles.resourceCard, { borderColor: color }]}
    onPress={onPress}
  >
    <View style={[styles.resourceIcon, { backgroundColor: color }]}>
      <Ionicons name={icon} size={32} color={colors.primary} />
    </View>
    <View style={styles.resourceInfo}>
      <Text style={styles.resourceTitle}>{title}</Text>
      <Text style={styles.resourceDescription}>{description}</Text>
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
  const [showAllResources, setShowAllResources] = useState(false);
  const [showAIChat, setShowAIChat] = useState(false);
  const [question, setQuestion] = useState("");
  const [aiResponse, setAiResponse] = useState("");

  const fetchUserData = useCallback(async () => {
    try {
      const user = await getCurrentUser();
      if (user && user.username) {
        setUserName(user.username);
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

  const allResources = [
    { id: '1', title: 'Apps', description: 'Digital tools for coursework and collaboration.', icon: 'apps-outline', color: colors.secondary },
    { id: '2', title: 'General', description: 'Resources for printing, records, and jobs.', icon: 'people-outline', color: colors.tertiary },
    { id: '3', title: 'Courses', description: 'Manage registration, schedules, and grades.', icon: 'library-outline', color: colors.quaternary },
    { id: '4', title: 'Husky Card', description: 'Manage campus card for dining and purchases.', icon: 'card-outline', color: colors.accent },
    { id: '5', title: 'Financial', description: 'Handle billing, aid, and scholarships.', icon: 'cash-outline', color: colors.tertiary },
    { id: '6', title: 'Housing', description: 'Manage housing and maintenance requests.', icon: 'home-outline', color: colors.quaternary },
    { id: '7', title: 'Miscellaneous', description: 'Room reservations, parking, and VPN access.', icon: 'ellipsis-horizontal-outline', color: colors.secondary },
    { id: '8', title: 'Social', description: 'Find and join clubs and organizations.', icon: 'people-circle-outline', color: colors.accent },
  ];

  const initialResources = allResources.filter(resource =>
    ['General', 'Courses', 'Husky Card'].includes(resource.title)
  );

  const newsItems = [
    { id: '1', title: "New Research Grant Awarded to CS Department", source: "University News" },
    { id: '2', title: "Guest Lecture Series: AI in Healthcare", source: "Events Office" },
    { id: '3', title: "Student Startup Wins National Competition", source: "Business School" },
  ];

  const handleResourcePress = (resource) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    // Navigate to the appropriate resource page
    switch (resource.title) {
      case 'Apps':
        router.push('/(resources)/apps');
        break;
      case 'General':
        router.push('/(resources)/general');
        break;
      case 'Courses':
        router.push('/(resources)/courses');
        break;
      case 'Husky Card':
        router.push('/(resources)/husky-card');
        break;
      case 'Financial':
        router.push('/(resources)/financial');
        break;
      case 'Housing':
        router.push('/(resources)/housing');
        break;
      case 'Miscellaneous':
        router.push('/(resources)/miscellaneous');
        break;
      case 'Social':
        router.push('/(resources)/social');
        break;
      default:
        console.log('Unknown resource');
    }
  };

  const handleViewAllResources = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setShowAllResources(true);
  };

  const closeAllResources = () => {
    setShowAllResources(false);
  };

  const handleNewsPress = (news) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleChatPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setShowAIChat(true);
  };

  const closeAIChat = () => {
    setShowAIChat(false);
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
        <Header userName={userName} onChatPress={handleChatPress} />
        <FlatList
          contentContainerStyle={styles.scrollViewContent}
          ListHeaderComponent={
            <>
              <Text style={styles.sectionTitle}>Campus News</Text>
              {newsItems.map((item) => (
                <NewsItem
                  key={item.id}
                  title={item.title}
                  source={item.source}
                  onPress={() => handleNewsPress(item)}
                />
              ))}
              <Text style={styles.sectionTitle}>Student Resources</Text>
            </>
          }
          data={initialResources}
          renderItem={({ item }) => (
            <ResourceCard
              title={item.title}
              description={item.description}
              icon={item.icon}
              color={item.color}
              onPress={() => handleResourcePress(item)}
            />
          )}
          keyExtractor={(item) => item.id}
          ListFooterComponent={
            <TouchableOpacity style={styles.viewAllButton} onPress={handleViewAllResources}>
              <Text style={styles.viewAllButtonText}>View All Resources</Text>
            </TouchableOpacity>
          }
        />
      </LinearGradient>

      <Modal
        animationType="slide"
        transparent={true}
        visible={showAllResources}
        onRequestClose={closeAllResources}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>All Resources</Text>
            <FlatList
              data={allResources}
              renderItem={({ item }) => (
                <ResourceCard
                  title={item.title}
                  description={item.description}
                  icon={item.icon}
                  color={item.color}
                  onPress={() => {
                    handleResourcePress(item);
                    closeAllResources();
                  }}
                />
              )}
              keyExtractor={(item) => item.id}
            />
            <TouchableOpacity style={styles.closeButton} onPress={closeAllResources}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        animationType="slide"
        transparent={true}
        visible={showAIChat}
        onRequestClose={closeAIChat}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>AI Study Assistant</Text>
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
            <TouchableOpacity style={styles.closeButton} onPress={closeAIChat}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  chatIconContainer: {
    padding: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 24,
    marginBottom: 16,
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
  viewAllButton: {
    backgroundColor: colors.secondary,
    borderRadius: 25,
    padding: 12,
    alignItems: 'center',
    marginBottom: 24,
  },
  viewAllButtonText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: 'bold',
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
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: colors.primary,
    borderRadius: 20,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 20,
    textAlign: 'center',
  },
  closeButton: {
    backgroundColor: colors.secondary,
    borderRadius: 25,
    padding: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  closeButtonText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: 'bold',
  },
  aiChatContainer: {
    flexDirection: 'row',
    backgroundColor: colors.primary,
    borderRadius: 25,
    paddingHorizontal: 16,
    marginBottom: 16,
    borderColor: colors.secondary,
    borderWidth: 1,
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
    borderWidth: 1,
  },
  aiResponseText: {
    color: colors.text,
    fontSize: 16,
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
  aiChatButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${colors.accent}20`,
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  aiChatButtonText: {
    color: colors.accent,
    marginLeft: 8,
    fontWeight: 'bold',
  },
});

export default Insight;