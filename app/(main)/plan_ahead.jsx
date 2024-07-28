import React, { useState } from 'react';
import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Animated } from "react-native";
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

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
    outputRange: [60, 250], // Adjust 250 based on your content
  });

  return (
    <Animated.View style={[styles.section, { maxHeight }]}>
      <TouchableOpacity onPress={toggleOpen} style={styles.sectionHeader}>
        <View style={[styles.sideBar, { backgroundColor: section.completed ? '#4CAF50' : '#FF0000' }]} />
        <View style={styles.sectionContent}>
          <Text style={styles.sectionText}>{section.title}</Text>
        </View>
        <View style={styles.iconContainer}>
          <Ionicons name={isOpen ? "chevron-up" : "chevron-down"} size={24} color="#FFF" />
        </View>
      </TouchableOpacity>
      {isOpen && (
        <View style={styles.courseList}>
          {section.courses.map((course, index) => (
            <TouchableOpacity key={index} style={styles.courseItem}>
              <Text style={styles.courseText}>{course}</Text>
              <Ionicons name="add-circle-outline" size={24} color="#4CAF50" />
            </TouchableOpacity>
          ))}
        </View>
      )}
    </Animated.View>
  );
};

const PlanAhead = () => {
  const navigation = useNavigation();
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

  const toggleSection = (index) => {
    setOpenSection(openSection === index ? null : index);
  };

  const handleAddPress = () => {
    console.log("Selected courses:", selectedCourses);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topSection}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Plan Ahead</Text>
        <TouchableOpacity onPress={handleAddPress} style={styles.addButton}>
          <Ionicons name="add-circle-outline" size={32} color="white" />
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
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    padding: 16,
  },
  topSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  backButton: {
    width: 50,
    height: 50,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    color: '#FFF',
    fontSize: 28,
    fontWeight: 'bold',
  },
  addButton: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  degreeContainer: {
    backgroundColor: '#333',
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
  },
  degreeTitle: {
    color: '#FFF',
    fontSize: 18,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  section: {
    backgroundColor: '#333',
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
    color: '#FFF',
    fontSize: 16,
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
    borderBottomColor: '#555',
  },
  courseText: {
    color: '#FFF',
    fontSize: 16,
  },
});

export default PlanAhead;