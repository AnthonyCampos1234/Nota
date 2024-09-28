import React, { useState, useCallback, useEffect, useRef, useMemo } from "react";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  Animated,
  FlatList,
  Alert,
} from "react-native";
import { router, useFocusEffect } from "expo-router";
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { getCurrentUser } from "../../lib/appwrite";
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useGlobalContext } from "../../context/GlobalProvider";

const { width } = Dimensions.get("window");
const HEADER_MAX_HEIGHT = 200;
const HEADER_MIN_HEIGHT = 100;

const colors = {
  background: '#000000',
  card: '#1A1A1A',
  accent: '#FF385C',
  text: '#FFFFFF',
  subtext: '#A0A0A0',
  border: '#333333',
  gradient: ['#FF385C', '#FF1493'],
  secondary: '#4A90E2',
  tertiary: '#50C878',
  quaternary: '#9B59B6',
};

const Header = ({ scrollY, userName, currentGPA, insets }) => {
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

  const miniHeaderOpacity = scrollY.interpolate({
    inputRange: [0, HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  return (
    <Animated.View style={[styles.header, { height: headerHeight }]}>
      <BlurView intensity={50} tint="dark" style={StyleSheet.absoluteFill} />
      <Animated.View style={[styles.headerContent, { opacity: headerOpacity, paddingTop: insets.top }]}>
        <Text style={styles.logoText}>Nota</Text>
        <Text style={styles.headerSubtitle}>Your academic journey starts here</Text>
      </Animated.View>
      <Animated.View style={[styles.miniHeader, { opacity: miniHeaderOpacity, paddingTop: insets.top }]}>
        <View style={styles.miniHeaderContent}>
          <Text style={styles.miniLogoText}>Nota</Text>
          <View style={styles.miniHeaderInfo}>
            <Text style={styles.miniHeaderName}>{userName}</Text>
            <Text style={styles.miniHeaderGPA}>GPA: {currentGPA.toFixed(2)}</Text>
          </View>
        </View>
      </Animated.View>
    </Animated.View>
  );
};

// const UpcomingDeadlines = ({ deadlines }) => (
//   <View style={styles.sectionContainer}>
//     <Text style={styles.sectionTitle}>Upcoming Deadlines</Text>
//     {deadlines.map((deadline, index) => (
//       <View key={index} style={styles.deadlineItem}>
//         <Ionicons name="calendar" size={24} color={colors.accent} />
//         <View style={styles.deadlineInfo}>
//           <Text style={styles.deadlineTitle}>{deadline.title}</Text>
//           <Text style={styles.deadlineDate}>{deadline.date}</Text>
//         </View>
//       </View>
//     ))}
//   </View>
// );

const UpcomingClasses = ({ classes }) => (
  <View style={styles.sectionContainer}>
    <Text style={styles.sectionTitle}>Upcoming Classes</Text>
    {classes.length > 0 ? (
      classes.map((classItem, index) => (
        <View key={classItem.id} style={styles.classItem}>
          <View style={[styles.classColorIndicator, { backgroundColor: colors.accent }]} />
          <View style={styles.classInfo}>
            <Text style={styles.classTitle}>{classItem.name}</Text>
            <Text style={styles.classTime}>{classItem.time}</Text>
            <Text style={styles.classLocation}>{classItem.where}</Text>
          </View>
        </View>
      ))
    ) : (
      <Text style={styles.noClassesText}>No classes scheduled for today</Text>
    )}
  </View>
);

const ProgressBar = ({ progress, label }) => {
  const animatedWidth = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animatedWidth, {
      toValue: progress,
      duration: 1500,
      useNativeDriver: false,
    }).start();
  }, [progress]);

  const widthInterpolated = animatedWidth.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });


  return (
    <View style={styles.progressBarContainer}>
      <Text style={styles.progressLabel}>{label}</Text>
      <LinearGradient
        colors={colors.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.progressBarBackground}
      >
        <Animated.View style={[styles.progressBarForeground, { width: widthInterpolated }]}>
          <Ionicons name="infinite-outline" size={24} color="#FFFFFF" style={styles.progressIcon} />
        </Animated.View>
      </LinearGradient>
      <Text style={styles.progressText}>
        {progress.toFixed(1)}% completed
      </Text>
    </View>
  );
};

const ScrollIndicator = ({ currentIndex, totalItems }) => {
  return (
    <View style={styles.scrollIndicatorContainer}>
      {[...Array(totalItems)].map((_, index) => (
        <View
          key={index}
          style={[
            styles.scrollIndicatorDot,
            index === currentIndex && styles.scrollIndicatorDotActive
          ]}
        />
      ))}
    </View>
  );
};

const QuickAction = ({ title, icon, onPress }) => (
  <TouchableOpacity style={styles.quickAction} onPress={onPress}>
    <LinearGradient
      colors={colors.gradient}
      style={styles.quickActionGradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <Ionicons name={icon} size={28} color={colors.text} />
    </LinearGradient>
    <Text style={styles.quickActionText}>{title}</Text>
  </TouchableOpacity>
);

const QuickActions = ({ actions }) => {
  return (
    <View style={styles.quickActionsContainer}>
      <Text style={styles.sectionTitle}>Quick Actions</Text>
      <View style={styles.quickActionsRow}>
        {actions.map((action, index) => (
          <QuickAction
            key={index}
            title={action.title}
            icon={action.icon}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
              action.onPress();
            }}
          />
        ))}
      </View>
    </View>
  );
};


const StudentResources = ({ resources }) => {
  return (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionTitle}>Student Resources</Text>
      <View style={styles.resourcesGrid}>
        {resources.map((resource, index) => (
          <TouchableOpacity
            key={index}
            style={styles.resourceItem}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
              resource.onPress();
            }}
          >
            <LinearGradient
              colors={colors.gradient}
              style={styles.resourceIconBackground}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Ionicons name={resource.icon} size={24} color={colors.text} />
            </LinearGradient>
            <Text style={styles.resourceTitle}>{resource.title}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const calculateProgress = (user) => {
  if (!user) {
    return { overallProgress: 0 };
  }

  const cumulativeHours = user.cumulativeHours || 0;
  const requiredCredits = 120; 

  const overallProgress = (cumulativeHours / requiredCredits) * 100;

  return {
    overallProgress: Math.min(overallProgress, 100),
  };
};

const AcademicProgress = ({ user }) => {
  const { overallProgress } = calculateProgress(user);

  if (!user) {
    return <Text style={styles.loadingText}>Loading academic progress...</Text>;
  }

  return (
    <View style={styles.academicProgressContainer}>
      <Text style={styles.academicProgressTitle}>Your Academic Journey</Text>
      <ProgressBar progress={overallProgress} label="Overall Progress" />
    </View>
  );
};

const Home = () => {
  const { user, setUser } = useGlobalContext();
  const [userName, setUserName] = useState("");
  const [currentGPA, setCurrentGPA] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [upcomingClasses, setUpcomingClasses] = useState([]);
  const scrollY = useRef(new Animated.Value(0)).current;
  const lastScrollY = useRef(0);
  const hasTriggeredDownHaptic = useRef(false);
  const hasTriggeredUpHaptic = useRef(false);
  const insets = useSafeAreaInsets();

  const quickActions = [
    { title: 'Friends', icon: 'person-add-outline', onPress: () => router.push('(main)/friends') },
    { title: 'Courses', icon: 'book-outline', onPress: () => router.push('(main)/courses') },
    { title: 'GPA', icon: 'stats-chart-outline', onPress: () => router.push('(main)/gpa') },
    { title: 'Leaderboard', icon: 'medal-outline', onPress: () => router.push('(main)/leaderboard') },
  ];

  const deadlines = [
    { title: 'Essay Submission', date: 'Sep 15' },
    { title: 'Math Quiz', date: 'Sep 18' },
    { title: 'Group Project Presentation', date: 'Sep 22' },
  ];

  const studentResources = [
    { title: 'Apps', icon: 'apps-outline', onPress: () => router.push('(resources)/apps') },
    { title: 'Courses', icon: 'library-outline', onPress: () => router.push('(resources)/courses') },
    { title: 'Financial', icon: 'cash-outline', onPress: () => router.push('(resources)/financial') },
    { title: 'General', icon: 'people-outline', onPress: () => router.push('(resources)/general') },
    { title: 'Housing', icon: 'home-outline', onPress: () => router.push('(resources)/housing') },
    { title: 'Husky Card', icon: 'card-outline', onPress: () => router.push('(resources)/husky-card') },
    { title: 'Miscellaneous', icon: 'ellipsis-horizontal-outline', onPress: () => router.push('(resources)/miscellaneous') },
    { title: 'Social', icon: 'people-circle-outline', onPress: () => router.push('(resources)/social') },
  ];

  const classColors = useMemo(() => {
    return ['#4A90E2', '#50C878', '#9B59B6'];
  }, []);

  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    {
      useNativeDriver: false,
      listener: (event) => {
        const currentScrollY = event.nativeEvent.contentOffset.y;
        const headerTransitionPoint = HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT;

        if (currentScrollY > lastScrollY.current &&
          currentScrollY > headerTransitionPoint &&
          !hasTriggeredDownHaptic.current) {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.light);
          hasTriggeredDownHaptic.current = true;
          hasTriggeredUpHaptic.current = false;
        }
        else if (currentScrollY < lastScrollY.current &&
          currentScrollY < headerTransitionPoint &&
          !hasTriggeredUpHaptic.current) {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.light);
          hasTriggeredUpHaptic.current = true;
          hasTriggeredDownHaptic.current = false;
        }

        lastScrollY.current = currentScrollY;
      }
    }
  );

  const fetchUpcomingClasses = useCallback(() => {
    if (user?.courseSchedule && Array.isArray(user.courseSchedule)) {
      const today = new Date();
      const dayOfWeek = ['U', 'M', 'T', 'W', 'R', 'F', 'S'][today.getDay()];

      const classesToday = user.courseSchedule
        .map((courseString, index) => {
          try {
            const course = JSON.parse(courseString);
            const meeting = course.meetingTimes && course.meetingTimes.length > 0 ? course.meetingTimes[0] : {};
            if (meeting.days && meeting.days.includes(dayOfWeek)) {
              return {
                id: `${course.crn || index}-${dayOfWeek}`,
                name: course.name,
                time: meeting.time || 'N/A',
                where: meeting.location || 'N/A',
                color: classColors[index % classColors.length]
              };
            }
            return null;
          } catch (error) {
            console.error("Error parsing course:", error);
            return null;
          }
        })
        .filter(Boolean)
        .sort((a, b) => {
          const timeA = a.time.split(' - ')[0];
          const timeB = b.time.split(' - ')[0];
          return timeA.localeCompare(timeB);
        });

      setUpcomingClasses(classesToday);
    } else {
      console.log("No course schedule found or invalid format");
      setUpcomingClasses([]);
    }
  }, [user?.courseSchedule, classColors]);

  useEffect(() => {
    if (user) {
      fetchUpcomingClasses();
    }
  }, [fetchUpcomingClasses, user]);

  const fetchUserData = useCallback(async () => {
    try {
      console.log("Fetching user data...");
      const currentUser = await getCurrentUser();
      console.log("Current user data:", currentUser);

      if (currentUser) {
        setUser(currentUser);
        setUserName(currentUser.username);
        setCurrentGPA(currentUser.currentGPA || 0);
        setIsLoading(false);
        setError(null);
        console.log("User data set successfully");
      } else {
        console.log("No user data returned from getCurrentUser");
        setError("User data not found. Please try logging in again.");
        setIsLoading(false);
        setUser(null); 
      }
    } catch (err) {
      console.error("Error fetching user data:", err);
      setError(`Error fetching user data: ${err.message}`);
      setIsLoading(false);
      setUser(null); 
    }
  }, [setUser]);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  useFocusEffect(
    useCallback(() => {
      fetchUserData();
    }, [fetchUserData])
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Error: {error}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => {
            setIsLoading(true);
            setError(null);
            fetchUserData();
          }}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.retryButton, { marginTop: 10 }]}
          onPress={() => {
            // need to add logic to navigate to login screen
            Alert.alert(
              "Session Expired",
              "Your session has expired. Please log in again.",
              [
                { text: "OK", onPress: () => router.replace('/login') }
              ]
            );
          }}
        >
          <Text style={styles.retryButtonText}>Log In Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const isNewUser = (user) => {
    if (!user || !user.createdAt) return true;
    const now = new Date();
    const createdAt = new Date(user.createdAt);
    const daysSinceCreation = (now - createdAt) / (1000 * 60 * 60 * 24);
    return daysSinceCreation < 1;
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <Header scrollY={scrollY} userName={userName} currentGPA={currentGPA} insets={insets} />
      <Animated.ScrollView
        contentContainerStyle={[
          styles.scrollViewContent,
          { paddingTop: HEADER_MAX_HEIGHT, paddingBottom: 60 + insets.bottom }
        ]}
        scrollEventThrottle={16}
        onScroll={handleScroll}
      >
        <View style={styles.content}>
          <Text style={styles.welcomeText}>
            {user && !isNewUser(user) ? "Welcome back," : "Welcome,"}
          </Text>
          <Text style={styles.userName}>{userName}</Text>

          {user ? (
            <AcademicProgress user={user} />
          ) : (
            <Text style={styles.loadingText}>Loading user data...</Text>
          )}

          <UpcomingClasses classes={upcomingClasses} />

          {/* <UpcomingDeadlines deadlines={deadlines} /> */}

          <QuickActions actions={quickActions} />

          <StudentResources resources={studentResources} />
        </View>
      </Animated.ScrollView>
    </View>
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
  miniHeader: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: HEADER_MIN_HEIGHT,
  },
  miniHeaderContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  miniLogoText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
  },
  miniHeaderInfo: {
    alignItems: 'flex-end',
  },
  miniHeaderName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  miniHeaderGPA: {
    fontSize: 16,
    color: colors.subtext,
  },
  scrollViewContent: {
    flexGrow: 1,
  },
  content: {
    padding: 20,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 5,
  },
  userName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.accent,
    marginBottom: 20,
  },
  gpaContainer: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 20,
    marginVertical: 20,
  },
  gpaLabel: {
    fontSize: 16,
    color: colors.subtext,
    marginBottom: 5,
  },
  gpaValue: {
    fontSize: 36,
    fontWeight: 'bold',
    color: colors.accent,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 30,
    marginBottom: 15,
  },
  quickActionsContainer: {
    marginBottom: 20,
  },
  quickActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickAction: {
    alignItems: 'center',
    width: '23%', 
  },
  quickActionGradient: {
    width: 60, 
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  quickActionText: {
    color: colors.text,
    fontSize: 12,
    textAlign: 'center',
  },
  courseCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
  },
  courseInfo: {
    marginBottom: 10,
  },
  courseTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 5,
  },
  courseInstructor: {
    fontSize: 14,
    color: colors.subtext,
  },
  courseProgressContainer: {
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
    marginBottom: 10,
  },
  courseProgress: {
    height: '100%',
    backgroundColor: colors.accent,
    borderRadius: 2,
  },
  courseProgressText: {
    fontSize: 14,
    color: colors.accent,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    fontSize: 18,
    color: colors.text,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  errorText: {
    fontSize: 18,
    color: colors.text,
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: colors.card,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
  },
  sectionContainer: {
    marginBottom: 15,
  },
  deadlineItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 15,
  },
  deadlineInfo: {
    marginLeft: 10,
  },
  deadlineTitle: {
    fontSize: 16,
    color: colors.text,
    fontWeight: 'bold',
  },
  deadlineDate: {
    fontSize: 14,
    color: colors.subtext,
  },
  resourcesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  resourceItem: {
    width: '48%',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    alignItems: 'center',
  },
  resourceTitle: {
    fontSize: 14,
    color: colors.text,
    marginTop: 5,
    textAlign: 'center',
  },
  graduationContainer: {
    backgroundColor: colors.card,
    borderRadius: 15,
    padding: 20,
    marginVertical: 20,
  },
  graduationTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 15,
  },
  graduationProgressContainer: {
    height: 36,
    borderRadius: 18,
    overflow: 'hidden',
    marginBottom: 10,
  },
  graduationProgressBackground: {
    flex: 1,
    justifyContent: 'center',
  },
  graduationProgressForeground: {
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderTopRightRadius: 18,
    borderBottomRightRadius: 18,
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingRight: 6,
  },
  graduationProgressText: {
    fontSize: 16,
    color: colors.subtext,
    textAlign: 'center',
    marginBottom: 10,
  },
  graduationMessageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.subtext,
    borderRadius: 10,
    padding: 10,
  },
  graduationIcon: {
    marginRight: 10,
  },
  graduationMotivationalMessage: {
    flex: 1,
    fontSize: 14,
    color: '#FFFFFF',
    fontStyle: 'italic',
  },
  academicProgressContainer: {
    backgroundColor: colors.card,
    borderRadius: 15,
    padding: 20,
    marginVertical: 20,
  },
  academicProgressTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 15,
  },
  progressBarContainer: {
    marginBottom: 15,
  },
  progressLabel: {
    fontSize: 16,
    color: colors.text,
    marginBottom: 5,
  },
  progressBarBackground: {
    height: 36,
    borderRadius: 18,
    overflow: 'hidden',
  },
  progressBarForeground: {
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderTopRightRadius: 18,
    borderBottomRightRadius: 18,
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingRight: 6,
  },
  progressIcon: {
    marginRight: 10,
  },
  progressText: {
    fontSize: 14,
    color: colors.subtext,
    marginTop: 5,
  },
  quickActionsContainer: {
    marginBottom: 20,
  },
  quickActionsWrapper: {
    marginBottom: 10,
  },
  quickAction: {
    alignItems: 'center',
    marginRight: 20,
    width: 80, 
  },
  scrollIndicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: 20,
  },
  scrollIndicatorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.border,
    marginHorizontal: 4,
  },
  scrollIndicatorDotActive: {
    backgroundColor: colors.accent,
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  resourcesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  resourceItem: {
    width: '48%',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    alignItems: 'center',
  },
  resourceIconBackground: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  resourceTitle: {
    fontSize: 14,
    color: colors.text,
    marginTop: 5,
    textAlign: 'center',
  },
  classItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 15,
  },
  classColorIndicator: {
    width: 4,
    height: '100%',
    borderRadius: 2,
    marginRight: 10,
  },
  classInfo: {
    flex: 1,
  },
  classTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 2,
  },
  classTime: {
    fontSize: 14,
    color: colors.subtext,
    marginBottom: 2,
  },
  classLocation: {
    fontSize: 14,
    color: colors.subtext,
  },
  noClassesText: {
    fontSize: 16,
    color: colors.subtext,
    textAlign: 'center',
    marginTop: 10,
  },
  cumulativeHoursText: {
    fontSize: 14,
    color: colors.subtext,
    marginTop: 10,
    textAlign: 'center',
  },
});

export default Home;
