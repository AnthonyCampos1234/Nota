import React, { useState, useEffect, useRef } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text, View, StyleSheet, StatusBar, ScrollView, Animated } from "react-native";
import { LinearGradient } from 'expo-linear-gradient';
import { router } from "expo-router";
import { Ionicons } from '@expo/vector-icons';
import CustomButton2 from "../../components/CustomButton2";
import { getCurrentUser, getFriends, addFriend, removeFriend } from "../../lib/appwrite";

const Home = () => {
  const [userName, setUserName] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const animatedValue = useRef(new Animated.Value(0)).current;
  const isInitialMount = useRef(true);

  const startAnimation = () => {
    animatedValue.setValue(0);
    Animated.spring(animatedValue, {
      toValue: 1,
      tension: 10,
      friction: 0,
      useNativeDriver: true,
    }).start();
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const user = await getCurrentUser();
        if (user && user.username) {
          setUserName(user.username);
          setIsLoading(false);
          startAnimation();
        } else {
          throw new Error("Username not found in user data");
        }
      } catch (err) {
        console.error("Error fetching user:", err);
        setError(err.message);
        setIsLoading(false);
      }
    };

    fetchUser();

    if (!isInitialMount.current) {
      startAnimation();
    } else {
      isInitialMount.current = false;
    }
  }, []);

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.7, 1],
  });

  const scale = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.9, 1],
  });

  const menuItems = [
    { title: "Courses", icon: "book-outline", route: '(main)/courses' },
    { title: "Assignments", icon: "document-text-outline", route: '(main)/assignments' },
    { title: "Plan Ahead", icon: "calendar-outline", route: '(main)/plan_ahead' },
    { title: "Calendar", icon: "calendar", route: '(main)/calendar' },
    { title: "Timeline", icon: "time-outline", route: '(main)/timeline' },
    { title: "GPA", icon: "school-outline", route: '(main)/gpa' },
    { title: "Friends", icon: "people-outline", route: '(main)/friends' },
    { title: "Leaderboard", icon: "podium-outline", route: '(main)/leaderboard' },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="light-content" />
      <View style={styles.titleContainer}>
        <Text style={styles.title}>Nota</Text>
      </View>
      <View contentContainerStyle={styles.scrollViewContent}>
        <View style={styles.headerContainer}>
          <View style={styles.greetingContainer}>
            <Text style={styles.greeting}>Hi,</Text>
            <View style={styles.gradientTextContainer}>
              <LinearGradient
                colors={['#0000FF', '#FF69B4']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.gradient}
              >
                {isLoading ? (
                  <Text style={styles.gradientText}>Loading...</Text>
                ) : error ? (
                  <Text style={styles.gradientText}>Error: {error}</Text>
                ) : (
                  <Animated.Text
                    style={[
                      styles.gradientText,
                      {
                        opacity: opacity,
                        transform: [{ scale: scale }]
                      }
                    ]}
                  >
                    {userName || "User"}
                  </Animated.Text>
                )}
              </LinearGradient>
            </View>
          </View>
          <View style={styles.buttonsContainer}>
            {menuItems.map((item, index) => (
              <CustomButton2
                key={index}
                title={item.title}
                iconName={item.icon}
                onPress={() => router.push(item.route)}
              />
            ))}
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  scrollViewContent: {
    flexGrow: 1,
  },
  headerContainer: {
    paddingVertical: 24,
    paddingHorizontal: 16,
  },
  titleContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
    backgroundColor: '#000000'
  },
  title: {
    fontSize: 35,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  greetingContainer: {
    width: '100%',
    paddingLeft: 10,
    paddingBottom: 30,
  },
  greeting: {
    fontSize: 25,
    color: '#FFF',
    marginBottom: 8,
  },
  gradientTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  gradient: {
    paddingHorizontal: 5,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gradientText: {
    fontSize: 40,
    fontWeight: '400',
    color: '#FFF',
    backgroundColor: 'transparent',
  },
  buttonsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 5,
  },
});

export default Home;