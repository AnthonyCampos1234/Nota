import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text, View, StyleSheet, StatusBar, ScrollView } from "react-native";
import { LinearGradient } from 'expo-linear-gradient';
import { router } from "expo-router";
import { Ionicons } from '@expo/vector-icons';
import CustomButton2 from "../../components/CustomButton2";

const Home = ({ userName = "Anthony" }) => {
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
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
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
                <Text style={styles.gradientText}>
                  {userName}
                </Text>
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
      </ScrollView>
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
    color: '#BBB',
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