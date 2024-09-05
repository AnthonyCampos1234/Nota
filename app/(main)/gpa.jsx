import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, ScrollView, Dimensions, Animated, StatusBar } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { getCurrentUser } from '../../lib/appwrite';
import { router, useFocusEffect } from "expo-router";
import { BlurView } from 'expo-blur';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
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

const gradientColors = [
  [colors.background, colors.card],
  colors.gradient,
  [colors.secondary, colors.quaternary],
];

const Header = ({ scrollY, insets, onBackPress }) => {
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
        <View style={styles.headerTopRow}>
          <TouchableOpacity onPress={onBackPress} style={styles.backButton}>
            <Ionicons name="chevron-back" size={28} color={colors.text} />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>GPA</Text>
          </View>
          <View style={styles.placeholderButton} />
        </View>
        <Text style={styles.headerSubtitle}>Track and project your academic performance</Text>
      </Animated.View>
      <Animated.View style={[styles.miniHeader, { opacity: miniHeaderOpacity, paddingTop: insets.top }]}>
        <View style={styles.miniHeaderContent}>
          <TouchableOpacity onPress={onBackPress} style={styles.miniBackButton}>
            <Ionicons name="chevron-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.miniHeaderTitle}>GPA</Text>
        </View>
      </Animated.View>
    </Animated.View>
  );
};

const GPAScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const scrollY = useRef(new Animated.Value(0)).current;
  const [displayedGPA, setDisplayedGPA] = useState('0.00');
  const [actualGPA, setActualGPA] = useState(0);
  const [totalCredits, setTotalCredits] = useState(0);
  const initialLoadRef = useRef(true);
  const [hypotheticalGrades, setHypotheticalGrades] = useState([]);
  const [whatIfGPA, setWhatIfGPA] = useState('0.00');
  const [currentGPA, setCurrentGPA] = useState(0);
  const [cumulativeGPA, setCumulativeGPA] = useState(0);

  const fetchUserGPA = useCallback(async () => {
    try {
      const user = await getCurrentUser();
      if (user) {
        setCurrentGPA(user.currentGPA || 0);
        setCumulativeGPA(user.cumulativeGPA || 0);
        setActualGPA(user.currentGPA || 0);
        setTotalCredits(user.totalCredits || 0);
      }
    } catch (error) {
      console.error("Error fetching user GPA:", error);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchUserGPA();
    }, [fetchUserGPA])
  );

  useEffect(() => {
    if (initialLoadRef.current || actualGPA !== parseFloat(displayedGPA)) {
      let start = initialLoadRef.current ? 0 : parseFloat(displayedGPA);
      const end = actualGPA;
      const duration = 30;
      const interval = 1;
      const step = (end - start) / (duration / interval);

      const timer = setInterval(() => {
        start += step;
        if (start >= end) {
          clearInterval(timer);
          setDisplayedGPA(end.toFixed(2));
          initialLoadRef.current = false;
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } else {
          setDisplayedGPA(start.toFixed(2));
        }
      }, interval);

      return () => clearInterval(timer);
    }
  }, [actualGPA]);

  const calculateWhatIfGPA = useCallback((currentGPA, totalCredits, hypotheticalGrades) => {
    const gradePoints = {
      'A+': 4.0, 'A': 4.0, 'A-': 3.7, 'B+': 3.3, 'B': 3.0, 'B-': 2.7,
      'C+': 2.3, 'C': 2.0, 'C-': 1.7, 'D+': 1.3, 'D': 1.0, 'D-': 0.7, 'F': 0
    };

    let totalPoints = currentGPA * totalCredits;
    let newTotalCredits = totalCredits;

    hypotheticalGrades.forEach(grade => {
      if (gradePoints[grade.grade] !== undefined) {
        totalPoints += gradePoints[grade.grade] * grade.credits;
        newTotalCredits += grade.credits;
      }
    });

    return newTotalCredits > 0 ? (totalPoints / newTotalCredits).toFixed(2) : currentGPA.toFixed(2);
  }, []);

  useEffect(() => {
    const newGPA = calculateWhatIfGPA(actualGPA, totalCredits, hypotheticalGrades);
    setWhatIfGPA(newGPA);
  }, [hypotheticalGrades, actualGPA, totalCredits, calculateWhatIfGPA]);

  const addHypotheticalGrade = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setHypotheticalGrades([...hypotheticalGrades, { id: Date.now().toString(), grade: 'A', credits: 3 }]);
  }, [hypotheticalGrades]);

  const updateHypotheticalGrade = useCallback((id, field, value) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setHypotheticalGrades(
      hypotheticalGrades.map(grade =>
        grade.id === id ? { ...grade, [field]: field === 'credits' ? parseInt(value) || 0 : value } : grade
      )
    );
  }, [hypotheticalGrades]);

  const handleBackPress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.back();
  }, []);

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <StatusBar barStyle="light-content" />
      <Header scrollY={scrollY} insets={insets} onBackPress={handleBackPress} />
      <Animated.ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: HEADER_MAX_HEIGHT, paddingBottom: insets.bottom + 20 }
        ]}
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
      >
        <View style={styles.gpaSection}>
          <Text style={styles.gpa}>{displayedGPA}</Text>
          <Text style={styles.gpaSubtitle}>Current GPA</Text>
        </View>
        <View style={styles.gpaInfoSection}>
          <Text style={styles.gpaInfoText}>Current GPA: {currentGPA.toFixed(2)}</Text>
          <Text style={styles.gpaInfoText}>Cumulative GPA: {cumulativeGPA.toFixed(2)}</Text>
        </View>

        <LinearGradient
          colors={gradientColors[1]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.whatIfSection}
        >
          <Text style={styles.whatIfTitle}>What If Calculator</Text>
          <Text style={styles.whatIfGPA}>Projected GPA: {whatIfGPA}</Text>
          {hypotheticalGrades.map((grade, index) => (
            <View key={grade.id} style={styles.hypotheticalGradeRow}>
              <Text style={styles.hypotheticalGradeText}>Class {index + 1}:</Text>
              <TextInput
                style={styles.gradeInput}
                value={grade.grade}
                onChangeText={(newGrade) => updateHypotheticalGrade(grade.id, 'grade', newGrade)}
                placeholder="Grade"
                placeholderTextColor={colors.subtext}
              />
              <TextInput
                style={styles.creditsInput}
                value={grade.credits.toString()}
                onChangeText={(newCredits) => updateHypotheticalGrade(grade.id, 'credits', newCredits)}
                placeholder="Credits"
                placeholderTextColor={colors.subtext}
                keyboardType="numeric"
              />
            </View>
          ))}
          <TouchableOpacity style={styles.addGradeButton} onPress={addHypotheticalGrade}>
            <Text style={styles.addGradeButtonText}>Add Hypothetical Grade</Text>
          </TouchableOpacity>
        </LinearGradient>
      </Animated.ScrollView>
    </SafeAreaView>
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
    backgroundColor: 'transparent',
  },
  headerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.text,
  },
  placeholderButton: {
    width: 40,
  },
  headerSubtitle: {
    fontSize: 16,
    color: colors.subtext,
    textAlign: 'center',
  },
  miniHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: HEADER_MIN_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  miniHeaderContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  miniBackButton: {
    marginRight: 15,
  },
  miniHeaderTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
  },
  gpaSection: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  gpa: {
    color: colors.text,
    fontSize: 120,
    fontWeight: 'bold',
  },
  gpaSubtitle: {
    color: colors.subtext,
    fontSize: 16,
  },
  whatIfSection: {
    padding: 20,
    borderRadius: 15,
    marginVertical: 20,
  },
  whatIfTitle: {
    color: colors.text,
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  whatIfGPA: {
    color: colors.text,
    fontSize: 18,
    marginBottom: 20,
  },
  hypotheticalGradeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  hypotheticalGradeText: {
    color: colors.text,
    fontSize: 16,
    width: 80,
  },
  gradeInput: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    color: colors.text,
    padding: 10,
    borderRadius: 8,
    width: 80,
    textAlign: 'center',
  },
  creditsInput: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    color: colors.text,
    padding: 10,
    borderRadius: 8,
    width: 80,
    textAlign: 'center',
  },
  addGradeButton: {
    backgroundColor: colors.accent,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 15,
  },
  addGradeButtonText: {
    color: colors.background,
    fontSize: 16,
    fontWeight: 'bold',
  },
  gpaInfoSection: {
    marginTop: 20,
    padding: 15,
    backgroundColor: colors.card,
    borderRadius: 12,
  },
  gpaInfoText: {
    color: colors.text,
    fontSize: 16,
    marginBottom: 5,
  },
});

export default GPAScreen;