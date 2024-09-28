import React, { useState, useCallback } from 'react';
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Animated, Dimensions } from "react-native";
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

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

const gradientColors = [
  [colors.gradientStart, colors.gradientMiddle1, colors.gradientMiddle2, colors.gradientEnd],
  [colors.secondary, colors.quaternary],
  [colors.tertiary, colors.accent],
];

const AnimatedSection = ({ section, isOpen, toggleOpen }) => {
  const [animation] = useState(new Animated.Value(0));

  React.useEffect(() => {
    Animated.timing(animation, {
      toValue: isOpen ? 1 : 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [isOpen]);

  const maxHeight = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [60, 250], 
  });

  return (
    <Animated.View style={[styles.section, { maxHeight }]}>
      <TouchableOpacity
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.medium);
          toggleOpen();
        }}
        style={styles.sectionHeader}
      >
        <View style={[styles.sideBar, { backgroundColor: section.completed ? colors.tertiary : colors.accent }]} />
        <View style={styles.sectionContent}>
          <Text style={styles.sectionText}>{section.title}</Text>
        </View>
        <View style={styles.iconContainer}>
          <Ionicons name={isOpen ? "chevron-up" : "chevron-down"} size={24} color={colors.text} />
        </View>
      </TouchableOpacity>
      {isOpen && (
        <View style={styles.courseList}>
          {section.courses.map((course, index) => (
            <TouchableOpacity
              key={index}
              style={styles.courseItem}
              onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.medium)}
            >
              <Text style={styles.courseText}>{course}</Text>
              <Ionicons name="add-circle-outline" size={24} color={colors.tertiary} />
            </TouchableOpacity>
          ))}
        </View>
      )}
    </Animated.View>
  );
};

const PlanAhead = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [openSection, setOpenSection] = useState(null);
  const [selectedCourses, setSelectedCourses] = useState([]);

  const sections = [
    {
      title: "Engineering Requirements",
      completed: false,
      courses: ["ENGR1000", "ENGR2000", "ENGR3000"]
    },
    {
      title: "Computer Science Requirements",
      completed: false,
      courses: ["CS1000", "CS2000", "CS3000"]
    },
    {
      title: "Supporting Courses",
      completed: false,
      courses: ["MATH1000", "PHYS1000", "CHEM1000"]
    },
    {
      title: "Professional Development",
      completed: true,
      courses: ["PROF1000", "PROF2000"]
    },
    {
      title: "General Electives",
      completed: false,
      courses: ["ELEC1000", "ELEC2000", "ELEC3000"]
    },
  ];

  const toggleSection = useCallback((index) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.medium);
    setOpenSection(openSection === index ? null : index);
  }, [openSection]);

  const handleAddPress = useCallback(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    console.log("Selected courses:", selectedCourses);
  }, [selectedCourses]);

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <LinearGradient
        colors={gradientColors[0]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientBackground}
      >
        <View style={[styles.topSection, { paddingTop: insets.top }]}>
          <TouchableOpacity
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              navigation.goBack();
            }}
            style={styles.backButton}
          >
            <Ionicons name="chevron-back" size={32} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Plan Ahead</Text>
          <TouchableOpacity onPress={handleAddPress} style={styles.addButton}>
            <Ionicons name="add-circle-outline" size={32} color={colors.text} />
          </TouchableOpacity>
        </View>
        <View style={styles.degreeContainer}>
          <Text style={styles.degreeTitle}>Computer Engineering and Computer Science, BSCmpE</Text>
        </View>
        <FlatList
          data={sections}
          renderItem={({ item, index }) => (
            <AnimatedSection
              section={item}
              isOpen={openSection === index}
              toggleOpen={() => toggleSection(index)}
            />
          )}
          keyExtractor={(item, index) => index.toString()}
          contentContainerStyle={styles.listContainer}
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
  topSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 15,
  },
  backButton: {
    width: 45,
    height: 45,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    color: colors.text,
    fontSize: 28,
    fontWeight: 'bold',
  },
  addButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  degreeContainer: {
    backgroundColor: colors.gradientMiddle1,
    borderRadius: 8,
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 20,
  },
  degreeTitle: {
    color: colors.text,
    fontSize: 18,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  section: {
    backgroundColor: colors.gradientMiddle2,
    borderRadius: 8,
    marginBottom: 12,
    overflow: 'hidden',
  },
  sectionHeader: {
    flexDirection: 'row',
    height: 60,
  },
  sideBar: {
    width: 10,
    alignSelf: 'stretch',
  },
  sectionContent: {
    flex: 1,
    justifyContent: 'center',
    paddingLeft: 16,
  },
  sectionText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: 'bold',
  },
  iconContainer: {
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  courseList: {
    paddingLeft: 26,
    paddingRight: 16,
    paddingBottom: 10,
  },
  courseItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.textSecondary,
  },
  courseText: {
    color: colors.text,
    fontSize: 16,
  },
});

export default PlanAhead;
