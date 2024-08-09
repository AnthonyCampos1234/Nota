import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, ScrollView, Dimensions } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { getCurrentUser } from '../../lib/appwrite';
import { router, useFocusEffect } from "expo-router";



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

const ClassItem = ({ item }) => (
  <LinearGradient
    colors={[colors.gradientMiddle1, colors.gradientMiddle2]}
    start={{ x: 0, y: 0 }}
    end={{ x: 1, y: 1 }}
    style={styles.classItem}
  >
    <View style={[styles.colorDot, { backgroundColor: item.color }]} />
    <View style={styles.classContent}>
      <Text style={styles.classTitle} numberOfLines={1}>{item.title}</Text>
      <Text style={styles.classInfo}>{item.grade} ({item.credits} cr)</Text>
    </View>
  </LinearGradient>
);

const GPAScreen = () => {
  const insets = useSafeAreaInsets();
  const [displayedGPA, setDisplayedGPA] = useState('0.00');
  const [actualGPA, setActualGPA] = useState(0);
  const [totalCredits, setTotalCredits] = useState(0);
  const initialLoadRef = useRef(true);
  const [hypotheticalGrades, setHypotheticalGrades] = useState([]);
  const [whatIfGPA, setWhatIfGPA] = useState('0.00');

  const fetchUserGPA = useCallback(async () => {
    try {
      const user = await getCurrentUser();
      if (user && user.gpa !== undefined) {
        setActualGPA(user.gpa);
        setTotalCredits(user.totalCredits || 0); // Assuming the user object has a totalCredits field
      }
    } catch (error) {
      console.error("Error fetching user GPA:", error);
    }
  }, []);

  useEffect(() => {
    fetchUserGPA();
  }, [fetchUserGPA]);

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
              router.back();
            }}
            style={styles.backButton}
          >
            <Ionicons name="chevron-back" size={32} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>GPA</Text>
          <View style={styles.placeholder} />
        </View>
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: insets.bottom + 20 }
          ]}
        >
          <View style={styles.gpaSection}>
            <Text style={styles.gpa}>{displayedGPA}</Text>
            <Text style={styles.gpaSubtitle}>Current GPA</Text>
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
                  placeholderTextColor={colors.textSecondary}
                />
                <TextInput
                  style={styles.creditsInput}
                  value={grade.credits.toString()}
                  onChangeText={(newCredits) => updateHypotheticalGrade(grade.id, 'credits', newCredits)}
                  placeholder="Credits"
                  placeholderTextColor={colors.textSecondary}
                  keyboardType="numeric"
                />
              </View>
            ))}
            <TouchableOpacity style={styles.addGradeButton} onPress={addHypotheticalGrade}>
              <Text style={styles.addGradeButtonText}>Add Hypothetical Grade</Text>
            </TouchableOpacity>
          </LinearGradient>
        </ScrollView>
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
  scrollContent: {
    flexGrow: 1,
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
  placeholder: {
    width: 40,
  },
  gpaSection: {
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 10,
  },
  gpa: {
    color: colors.text,
    fontSize: 120,
    fontWeight: 'bold',
  },
  gpaSubtitle: {
    color: colors.textSecondary,
    fontSize: 16,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  controlButton: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: 10,
    borderRadius: 8,
  },
  controlText: {
    color: colors.text,
    fontSize: 16,
  },
  listContainer: {
    paddingHorizontal: 20,
  },
  classItem: {
    flexDirection: 'row',
    borderRadius: 10,
    marginBottom: 10,
    overflow: 'hidden',
  },
  colorDot: {
    width: 10,
    height: '100%',
  },
  classContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
  },
  classTitle: {
    flex: 1,
    color: colors.text,
    fontSize: 16,
  },
  classInfo: {
    color: colors.text,
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  whatIfSection: {
    padding: 20,
    borderRadius: 15,
    margin: 20,
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
    color: colors.primary,
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default GPAScreen;