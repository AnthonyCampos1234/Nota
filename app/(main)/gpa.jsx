import React, { useState, useMemo, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

const ClassItem = ({ item }) => (
  <View style={styles.classItem}>
    <View style={[styles.colorDot, { backgroundColor: item.color }]} />
    <View style={styles.classContent}>
      <Text style={styles.classTitle} numberOfLines={1}>{item.title}</Text>
      <Text style={styles.classInfo}>{item.grade} ({item.credits} cr)</Text>
    </View>
  </View>
);

const GPAScreen = () => {
  const navigation = useNavigation();
  const [sortOrder, setSortOrder] = useState('asc');
  const [selectedSemester, setSelectedSemester] = useState('All');
  const [displayedGPA, setDisplayedGPA] = useState('0.00');
  const initialLoadRef = useRef(true);
  const [hypotheticalGrades, setHypotheticalGrades] = useState([]);
  const [whatIfGPA, setWhatIfGPA] = useState('0.00');

  const allClasses = [
    { id: '1', title: 'CS2510 30198 Fundamentals of Computer Science 2 SEC 01', grade: 'B+', color: '#FFFF00', semester: 'Fall 2023', credits: 4 },
    { id: '2', title: 'FINA2201 30396 Financial Management SEC 01', grade: 'A+', color: '#00FF00', semester: 'Fall 2023', credits: 3 },
    { id: '3', title: 'CS3500 40039 Object-Oriented Design SEC 01', grade: 'C', color: '#FF0000', semester: 'Spring 2024', credits: 4 },
    { id: '4', title: 'MATH2331 31477 Linear Algebra SEC 02', grade: 'D-', color: '#00FFFF', semester: 'Spring 2024', credits: 3 },
  ];

  const semesters = ['All', ...new Set(allClasses.map(c => c.semester))];

  const filteredAndSortedClasses = useMemo(() => {
    let filtered = selectedSemester === 'All'
      ? allClasses
      : allClasses.filter(c => c.semester === selectedSemester);

    return filtered.sort((a, b) => {
      if (sortOrder === 'asc') {
        return a.title.localeCompare(b.title);
      } else {
        return b.title.localeCompare(a.title);
      }
    });
  }, [selectedSemester, sortOrder]);

  const calculateGPA = (classes) => {
    const gradePoints = {
      'A+': 4.0, 'A': 4.0, 'A-': 3.7, 'B+': 3.3, 'B': 3.0, 'B-': 2.7,
      'C+': 2.3, 'C': 2.0, 'C-': 1.7, 'D+': 1.3, 'D': 1.0, 'D-': 0.7, 'F': 0
    };
    let totalPoints = 0;
    let totalCredits = 0;
    classes.forEach(cls => {
      totalPoints += gradePoints[cls.grade] * cls.credits;
      totalCredits += cls.credits;
    });
    return totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : '0.00';
  };

  const gpa = calculateGPA(filteredAndSortedClasses);

  useEffect(() => {
    if (initialLoadRef.current) {
      let start = 0;
      const end = parseFloat(gpa);
      const duration = 30;
      const interval = 1;
      const step = (end - start) / (duration / interval);

      const timer = setInterval(() => {
        start += step;
        if (start >= end) {
          clearInterval(timer);
          setDisplayedGPA(gpa);
          initialLoadRef.current = false;
        } else {
          setDisplayedGPA(start.toFixed(2));
        }
      }, interval);

      return () => clearInterval(timer);
    } else {
      setDisplayedGPA(gpa);
    }
  }, [gpa]);

  useEffect(() => {
    const allGrades = [...filteredAndSortedClasses, ...hypotheticalGrades];
    const newGPA = calculateGPA(allGrades);
    setWhatIfGPA(newGPA);
  }, [hypotheticalGrades, filteredAndSortedClasses]);

  const addHypotheticalGrade = () => {
    setHypotheticalGrades([...hypotheticalGrades, { id: Date.now().toString(), grade: 'A', credits: 3 }]);
  };

  const updateHypotheticalGrade = (id, field, value) => {
    setHypotheticalGrades(
      hypotheticalGrades.map(grade =>
        grade.id === id ? { ...grade, [field]: value } : grade
      )
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.topSection}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backButtonText}>{'<'}</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>GPA</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.gpaSection}>
          <Text style={styles.gpa}>{displayedGPA}</Text>
          <Text style={styles.gpaSubtitle}>*Rounded</Text>
        </View>
        <View style={styles.controls}>
          <TouchableOpacity
            style={styles.controlButton}
            onPress={() => {
              const currentIndex = semesters.indexOf(selectedSemester);
              const nextIndex = (currentIndex + 1) % semesters.length;
              setSelectedSemester(semesters[nextIndex]);
            }}
          >
            <Text style={styles.controlText}>{`${selectedSemester} ⌄`}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.controlButton}
            onPress={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
          >
            <Text style={styles.controlText}>{`Sort ${sortOrder === 'asc' ? '↑' : '↓'}`}</Text>
          </TouchableOpacity>
        </View>
        <FlatList
          data={filteredAndSortedClasses}
          renderItem={({ item }) => <ClassItem item={item} />}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContainer}
          scrollEnabled={false}
        />

        <View style={styles.whatIfSection}>
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
                placeholderTextColor="#888"
              />
              <TextInput
                style={styles.creditsInput}
                value={grade.credits.toString()}
                onChangeText={(newCredits) => updateHypotheticalGrade(grade.id, 'credits', parseInt(newCredits) || 0)}
                placeholder="Credits"
                placeholderTextColor="#888"
                keyboardType="numeric"
              />
            </View>
          ))}
          <TouchableOpacity style={styles.addGradeButton} onPress={addHypotheticalGrade}>
            <Text style={styles.addGradeButtonText}>Add Hypothetical Grade</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  topSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 10,
  },
  backButton: {
    width: 50,
    height: 50,
    borderRadius: 15,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 30,
    color: '#fff',
  },
  headerTitle: {
    color: 'white',
    fontSize: 28,
    fontWeight: 'bold',
  },
  placeholder: {
    width: 50,
    height: 50,
  },
  gpaSection: {
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 10,
  },
  gpa: {
    color: 'white',
    fontSize: 120,
    fontWeight: 'bold',
  },
  gpaSubtitle: {
    color: 'gray',
    fontSize: 16,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  controlButton: {
    padding: 10,
  },
  controlText: {
    color: 'white',
    fontSize: 20,
  },
  listContainer: {
    paddingHorizontal: 20,
  },
  classItem: {
    flexDirection: 'row',
    backgroundColor: '#333333',
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
    color: 'white',
    fontSize: 16,
  },
  classInfo: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  whatIfSection: {
    padding: 20,
    backgroundColor: '#222',
    borderRadius: 10,
    margin: 20,
  },
  whatIfTitle: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  whatIfGPA: {
    color: 'white',
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
    color: 'white',
    fontSize: 16,
    width: 80,
  },
  gradeInput: {
    backgroundColor: '#333',
    color: 'white',
    padding: 10,
    borderRadius: 5,
    width: 80,
    textAlign: 'center',
  },
  creditsInput: {
    backgroundColor: '#333',
    color: 'white',
    padding: 10,
    borderRadius: 5,
    width: 80,
    textAlign: 'center',
  },
  addGradeButton: {
    backgroundColor: '#FFF',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
  },
  addGradeButtonText: {
    color: 'black',
    fontSize: 16,
  },
});

export default GPAScreen;