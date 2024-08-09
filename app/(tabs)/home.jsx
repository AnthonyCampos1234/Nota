import React, { useState, useEffect, useCallback } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Dimensions,
  Animated,
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

const Header = ({ userName, gpa, onAvatarPress }) => {
  const insets = useSafeAreaInsets();
  const [bounceAnim] = useState(new Animated.Value(0));

  const animateGPA = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.medium);
    Animated.sequence([
      Animated.timing(bounceAnim, { toValue: 1.1, duration: 200, useNativeDriver: true }),
      Animated.spring(bounceAnim, { toValue: 1, friction: 4, useNativeDriver: true })
    ]).start();
  }, [bounceAnim]);

  useEffect(() => {
    animateGPA();
  }, [gpa, animateGPA]);

  return (
    <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
      <View style={styles.welcomeContainer}>
        <Text style={styles.welcomeText}>Welcome back,</Text>
        <Text style={styles.userName}>{userName}</Text>
      </View>
      <TouchableOpacity onPress={animateGPA} style={styles.gpaContainer}>
        <Animated.View style={[styles.gpaContent, { transform: [{ scale: bounceAnim }] }]}>
          <Ionicons name="school" size={24} color={colors.secondary} />
          <Text style={styles.gpaText}>GPA: {gpa.toFixed(2)}</Text>
        </Animated.View>
      </TouchableOpacity>
    </View>
  );
};

const CollegeProgressInfographic = ({ currentYear, totalYears }) => {
  const progress = (currentYear / totalYears) * 100;

  return (
    <View style={styles.infoContainer}>
      <Text style={styles.infoTitle}>College Progress</Text>
      <View style={styles.progressBarContainer}>
        <LinearGradient
          colors={[colors.secondary, colors.tertiary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.progressBar, { width: `${progress}%` }]}
        />
      </View>
      <View style={styles.labelsContainer}>
        <Text style={styles.label}>Year 1</Text>
        <Text style={styles.label}>Year 2</Text>
        <Text style={styles.label}>Year 3</Text>
        <Text style={styles.label}>Year 4</Text>
      </View>
      <Text style={styles.progressText}>{`${currentYear} / ${totalYears} Years Completed`}</Text>
    </View>
  );
};

const UpcomingDeadlines = ({ deadlines }) => {
  return (
    <View style={styles.deadlinesContainer}>
      <Text style={styles.sectionTitle}>Upcoming Deadlines</Text>
      {deadlines.map((deadline, index) => (
        <View key={index} style={styles.deadlineItem}>
          <View style={styles.deadlineIconContainer}>
            <Ionicons name={deadline.icon} size={24} color={colors.accent} />
          </View>
          <View style={styles.deadlineContent}>
            <Text style={styles.deadlineTitle}>{deadline.title}</Text>
            <Text style={styles.deadlineDate}>{deadline.date}</Text>
          </View>
        </View>
      ))}
    </View>
  );
};

const CourseCard = ({ title, code, progress, onPress, colorIndex }) => {
  const cardColors = [colors.secondary, colors.tertiary, colors.quaternary, colors.accent];
  const backgroundColor = cardColors[colorIndex % cardColors.length];

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.medium);
    onPress();
  };

  return (
    <TouchableOpacity style={[styles.courseCard, { backgroundColor: colors.primary, borderColor: backgroundColor }]} onPress={onPress}>
      <View style={[styles.courseIcon, { backgroundColor }]}>
        <Ionicons name="book-outline" size={32} color={colors.primary} />
      </View>
      <View style={styles.courseInfo}>
        <Text style={styles.courseTitle}>{title}</Text>
        <Text style={styles.courseCode}>{code}</Text>
      </View>
      <View style={styles.courseProgressBar}>
        <View style={[styles.courseProgress, { width: `${progress}%`, backgroundColor }]} />
      </View>
    </TouchableOpacity>
  );
};

const QuickAction = ({ title, icon, onPress, colorIndex }) => {
  const actionColors = [colors.secondary, colors.tertiary, colors.quaternary, colors.accent];
  const backgroundColor = actionColors[colorIndex % actionColors.length];

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.medium);
    onPress();
  };

  return (
    <TouchableOpacity onPress={handlePress} style={[styles.quickAction, { backgroundColor: colors.primary, borderColor: backgroundColor }]}>
      <View style={styles.quickActionContent}>
        <View style={[styles.quickActionIcon, { backgroundColor }]}>
          <Ionicons name={icon} size={24} color={colors.primary} />
        </View>
        <Text style={[styles.quickActionTitle, { color: backgroundColor }]}>{title}</Text>
      </View>
    </TouchableOpacity>
  );
};

const DailyChallenge = ({ challenge, onPress }) => {
  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPress();
  };

  return (
    <TouchableOpacity style={styles.dailyChallenge} onPress={handlePress}>
      <Ionicons name="flash" size={24} color={colors.accent} />
      <Text style={styles.dailyChallengeText}>{challenge}</Text>
    </TouchableOpacity>
  );
};

const RewardBadge = ({ title, icon, count, colorIndex }) => {
  const badgeColors = [colors.secondary, colors.tertiary, colors.quaternary, colors.accent];
  const backgroundColor = badgeColors[colorIndex % badgeColors.length];

  return (
    <View style={[styles.rewardBadge, { backgroundColor: colors.primary, borderColor: backgroundColor }]}>
      <Ionicons name={icon} size={32} color={backgroundColor} />
      <Text style={[styles.rewardTitle, { color: backgroundColor }]}>{title}</Text>
      <Text style={styles.rewardCount}>{count}</Text>
    </View>
  );
};

const Quiz = ({ isVisible, onClose, onComplete }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});

  const questions = [
    {
      id: 1,
      text: "How satisfied are you with your current major?",
      options: ["Very satisfied", "Satisfied", "Neutral", "Dissatisfied", "Very dissatisfied"],
    },
    {
      id: 2,
      text: "How challenging do you find your classes overall?",
      options: ["Very challenging", "Challenging", "Moderate", "Easy", "Very easy"],
    },
    {
      id: 3,
      text: "How often do you participate in study groups?",
      options: ["Very often", "Often", "Sometimes", "Rarely", "Never"],
    },
    {
      id: 4,
      text: "How well do you manage your study-life balance?",
      options: ["Very well", "Well", "Moderately", "Poorly", "Very poorly"],
    },
    {
      id: 5,
      text: "How likely are you to recommend your major to others?",
      options: ["Very likely", "Likely", "Neutral", "Unlikely", "Very unlikely"],
    },
  ];

  const handleAnswer = (answer) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.medium);
    setAnswers({ ...answers, [questions[currentQuestion].id]: answer });
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      onComplete(answers);
    }
  };

  const handleClose = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onClose();
  };

  return (
    <Modal visible={isVisible} animationType="slide" transparent={true}>
      <View style={styles.quizContainer}>
        <View style={styles.quizContent}>
          <Text style={styles.quizTitle}>Student Experience Quiz</Text>
          <Text style={styles.quizQuestion}>{questions[currentQuestion].text}</Text>
          {questions[currentQuestion].options.map((option, index) => (
            <TouchableOpacity
              key={index}
              style={styles.quizOption}
              onPress={() => handleAnswer(option)}
            >
              <Text style={styles.quizOptionText}>{option}</Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity style={styles.quizCloseButton} onPress={handleClose}>
            <Text style={styles.quizCloseButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const Home = () => {
  const [userName, setUserName] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [gpa, setGpa] = useState(0);
  const [dailyChallenge, setDailyChallenge] = useState("Take the Student Experience Quiz!");
  const [rewardPoints, setRewardPoints] = useState(100);
  const [isQuizVisible, setIsQuizVisible] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [currentYear, setCurrentYear] = useState(2);
  const [totalYears, setTotalYears] = useState(4);

  const deadlines = [
    { title: "Math 101 Assignment", date: "Due in 2 days", icon: "calculator-outline" },
    { title: "Chemistry Lab Report", date: "Due in 4 days", icon: "flask-outline" },
    { title: "Literature Essay", date: "Due in 1 week", icon: "book-outline" },
    { title: "Physics Midterm", date: "In 2 weeks", icon: "rocket-outline" },
  ];

  const courses = [
    { id: '1', title: 'Introduction to Computer Science', code: 'CS101', progress: 75 },
    { id: '2', title: 'Calculus I', code: 'MATH201', progress: 50 },
    { id: '3', title: 'World History', code: 'HIST110', progress: 25 },
  ];

  const quickActions = [
    { title: 'Assignments', icon: 'document-text-outline', onPress: () => router.push('(main)/assignments') },
    { title: 'Calendar', icon: 'calendar-outline', onPress: () => router.push('(main)/calendar') },
    { title: 'GPA', icon: 'stats-chart-outline', onPress: () => router.push('(main)/gpa') },
    { title: 'Courses', icon: 'book-outline', onPress: () => router.push('(main)/courses') },
    { title: 'Plan Ahead', icon: 'calendar-outline', onPress: () => router.push('(main)/plan_ahead') },
    { title: 'Timeline', icon: 'time-outline', onPress: () => router.push('(main)/timeline') },
    { title: 'Friends', icon: 'people-outline', onPress: () => router.push('(main)/friends') },
    { title: 'Goals', icon: 'flag-outline', onPress: () => router.push('(main)/goals') },
  ];

  const rewards = [
    { title: 'Quiz Master', icon: 'ribbon-outline', count: 5 },
    { title: 'Study Streak', icon: 'flame-outline', count: 7 },
    { title: 'Team Player', icon: 'people-outline', count: 3 },
  ];

  const fetchUserData = useCallback(async () => {
    try {
      const user = await getCurrentUser();
      if (user) {
        setUserName(user.username);
        setGpa(user.gpa || 0);
        setIsLoading(false);
      } else {
        throw new Error("Username not found in user data");
      }
    } catch (err) {
      console.error("Error fetching user data:", err);
      setError(err.message);
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  useFocusEffect(
    useCallback(() => {
      fetchUserData();
    }, [fetchUserData])
  );

  const handleCoursePress = (course) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.medium);
    router.push(`(main)/course/${course.id}`);
  };

  const handleDailyChallengePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setRewardPoints(prevPoints => prevPoints + 10);
    setIsQuizVisible(true);
  };

  const handleQuizComplete = (answers) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setIsQuizVisible(false);
    setQuizCompleted(true);
    setRewardPoints(prevPoints => prevPoints + 50);
    setDailyChallenge("Great job! You've completed today's quiz.");
    console.log("Quiz answers:", answers);
  };

  const handleRetry = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    fetchUserData();
  };

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.primary }]}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.errorContainer, { backgroundColor: colors.primary }]}>
        <Text style={styles.errorText}>Error: {error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <LinearGradient
        colors={[colors.gradientStart, colors.gradientMiddle1, colors.gradientMiddle2, colors.gradientEnd]}
        style={styles.gradientBackground}
      >
        <Header
          userName={userName}
          gpa={gpa}
        />
        <FlatList
          contentContainerStyle={styles.scrollViewContent}
          ListHeaderComponent={
            <>
              <CollegeProgressInfographic currentYear={currentYear} totalYears={totalYears} />
              <UpcomingDeadlines deadlines={deadlines} />
              <DailyChallenge challenge={dailyChallenge} onPress={handleDailyChallengePress} />
              <View style={styles.rewardPointsContainer}>
                <Ionicons name="star" size={24} color={colors.accent} />
                <Text style={styles.rewardPointsText}>Reward Points: {rewardPoints}</Text>
              </View>
              {quizCompleted && (
                <View style={styles.quizCompletedContainer}>
                  <Text style={styles.quizCompletedText}>Quiz completed! +50 points</Text>
                </View>
              )}
              <Text style={styles.sectionTitle}>Your Achievements</Text>
              <FlatList
                horizontal
                showsHorizontalScrollIndicator={false}
                data={rewards}
                renderItem={({ item, index }) => <RewardBadge title={item.title} icon={item.icon} count={item.count} colorIndex={index} />}
                keyExtractor={(item) => item.title}
                style={styles.rewardsContainer}
              />
            </>
          }
          ListFooterComponent={
            <>
              <Text style={styles.sectionTitle}>Quick Actions</Text>
              <View style={styles.quickActionsContainer}>
                {quickActions.map((action, index) => (
                  <QuickAction
                    key={index}
                    title={action.title}
                    icon={action.icon}
                    onPress={action.onPress}
                    colorIndex={index}
                  />
                ))}
              </View>
            </>
          }
        />
      </LinearGradient>
      <Quiz
        isVisible={isQuizVisible}
        onClose={() => setIsQuizVisible(false)}
        onComplete={handleQuizComplete}
      />
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
  welcomeContainer: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 4,
  },
  gpaContainer: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    padding: 8,
    borderColor: colors.secondary,
  },
  gpaContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  gpaText: {
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
  quickActionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  quickAction: {
    width: '48%',
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  quickActionContent: {
    padding: 16,
    alignItems: 'center',
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  quickActionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: colors.text,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 18,
    color: colors.accent,
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: colors.accent,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
  },
  dailyChallenge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${colors.accent}20`,
    borderRadius: 16,
    padding: 16,
    marginTop: 16,
  },
  dailyChallengeText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginLeft: 12,
  },
  rewardPointsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    backgroundColor: `${colors.accent}20`,
    padding: 8,
    borderRadius: 16,
  },
  rewardPointsText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginLeft: 8,
  },
  rewardsContainer: {
    marginTop: 16,
    marginBottom: 24,
  },
  rewardBadge: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    marginRight: 16,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  rewardTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 8,
  },
  rewardCount: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
  },
  quizContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  quizContent: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    padding: 20,
    width: '80%',
  },
  quizTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 20,
    textAlign: 'center',
  },
  quizQuestion: {
    fontSize: 18,
    color: colors.text,
    marginBottom: 20,
    textAlign: 'center',
  },
  quizOption: {
    backgroundColor: `${colors.secondary}20`,
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
  },
  quizOptionText: {
    fontSize: 16,
    color: colors.text,
    textAlign: 'center',
  },
  quizCloseButton: {
    backgroundColor: colors.secondary,
    borderRadius: 8,
    padding: 12,
    marginTop: 20,
  },
  quizCloseButtonText: {
    fontSize: 16,
    color: colors.text,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  quizCompletedContainer: {
    backgroundColor: `${colors.tertiary}20`,
    borderRadius: 8,
    padding: 12,
    marginTop: 16,
  },
  quizCompletedText: {
    fontSize: 16,
    color: colors.text,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  infoContainer: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    padding: 16,
    marginTop: 16,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 12,
  },
  progressBarContainer: {
    height: 20,
    backgroundColor: '#333333',
    borderRadius: 10,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 10,
  },
  labelsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  label: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  progressText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 12,
  },
  deadlinesContainer: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    padding: 16,
    marginTop: 16,
  },
  deadlineItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  deadlineIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${colors.accent}20`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  deadlineContent: {
    flex: 1,
  },
  deadlineTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
  },
  deadlineDate: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
});

export default Home;