import { router } from "expo-router";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { View, FlatList, TouchableOpacity, Text, StyleSheet, Modal, TextInput, Alert, Dimensions } from "react-native";
import { useState, useEffect, useCallback } from "react";
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';

import { useGlobalContext } from "../../context/GlobalProvider";

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

const CourseItem = ({ item, onPress }) => (
  <LinearGradient
    colors={[colors.gradientMiddle1, colors.gradientMiddle2]}
    start={{ x: 0, y: 0 }}
    end={{ x: 1, y: 1 }}
    style={styles.courseItem}
  >
    <TouchableOpacity onPress={() => onPress(item)} style={styles.courseContent}>
      <View style={[styles.colorDot, { backgroundColor: item.color }]} />
      <Text style={styles.courseTitle} numberOfLines={2}>{item.title}</Text>
    </TouchableOpacity>
  </LinearGradient>
);

const CourseActionModal = ({ visible, course, onClose, onEdit, onDelete }) => (
  <Modal
    animationType="slide"
    transparent={true}
    visible={visible}
    onRequestClose={onClose}
  >
    <View style={styles.centeredView}>
      <View style={styles.modalView}>
        <Text style={styles.modalText}>{course?.title}</Text>
        <Text style={styles.modalDescription}>{course?.description || 'No description available.'}</Text>
        <View style={styles.buttonContainer}>
          <TouchableOpacity onPress={onEdit} style={[styles.button, styles.editButton]}>
            <Text style={styles.textStyle}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onDelete} style={[styles.button, styles.deleteButton]}>
            <Text style={styles.textStyle}>Delete</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity onPress={onClose} style={[styles.button, styles.closeButton]}>
          <Text style={styles.textStyle}>Close</Text>
        </TouchableOpacity>
      </View>
    </View>
  </Modal>
);

const EditCourseModal = ({ visible, course, onSave, onCancel }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (course) {
      setTitle(course.title || '');
      setDescription(course.description || '');
    }
  }, [course]);

  const handleSave = () => {
    onSave({ ...course, title, description });
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onCancel}
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <Text style={styles.modalText}>{course?.id ? 'Edit Course' : 'New Course'}</Text>
          <TextInput
            style={styles.input}
            placeholder="Course Title"
            placeholderTextColor={colors.textSecondary}
            value={title}
            onChangeText={setTitle}
          />
          <TextInput
            style={[styles.input, styles.descriptionInput]}
            placeholder="Course Description"
            placeholderTextColor={colors.textSecondary}
            value={description}
            onChangeText={setDescription}
            multiline
          />
          <View style={styles.buttonContainer}>
            <TouchableOpacity onPress={handleSave} style={[styles.button, styles.saveButton]}>
              <Text style={styles.textStyle}>Save</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onCancel} style={[styles.button, styles.cancelButton]}>
              <Text style={styles.textStyle}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const Courses = () => {
  const { user, setUser, setIsLogged } = useGlobalContext();
  const insets = useSafeAreaInsets();
  const [courses, setCourses] = useState([
    { id: '1', title: "CS2510 30198 Fundamentals of Computer Science 2 SEC 01", color: '#FF0000', description: "Introduction to object-oriented design and programming." },
    { id: '2', title: "FINA2201 30396 Financial Management SEC 01", color: '#00FF00', description: "Basics of financial management and analysis." },
    { id: '3', title: "CS3500 40039 Object-Oriented Design SEC 01", color: '#00FFFF', description: "Advanced concepts in object-oriented programming and design patterns." },
    { id: '4', title: "MATH2331 31477 Linear Algebra SEC 02", color: '#FF00FF', description: "Study of linear equations, matrices, and vector spaces." },
    { id: '5', title: "PHYS1151 32556 Physics for Engineering I SEC 01", color: '#FFFF00', description: "Fundamental principles of mechanics for engineering students." },
  ]);
  const [actionModalVisible, setActionModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [sortOrder, setSortOrder] = useState('asc');

  const handleCoursePress = useCallback((course) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.medium);
    setSelectedCourse(course);
    setActionModalVisible(true);
  }, []);

  const getRandomColor = () => {
    const colors = ['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF'];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  const handleAddCourse = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const newCourse = {
      id: '',
      title: '',
      color: getRandomColor(),
      description: ''
    };
    setSelectedCourse(newCourse);
    setEditModalVisible(true);
  }, []);

  const handleEditCourse = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.medium);
    setActionModalVisible(false);
    setEditModalVisible(true);
  }, []);

  const handleDeleteCourse = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      "Delete Course",
      "Are you sure you want to delete this course?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "OK",
          onPress: () => {
            setCourses(courses.filter(c => c.id !== selectedCourse.id));
            setActionModalVisible(false);
          }
        }
      ]
    );
  }, [courses, selectedCourse]);

  const handleSaveCourse = useCallback((updatedCourse) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    if (updatedCourse.id) {
      setCourses(courses.map(c => c.id === updatedCourse.id ? updatedCourse : c));
    } else {
      const newCourse = {
        ...updatedCourse,
        id: String(courses.length + 1),
        color: getRandomColor(),
      };
      setCourses([...courses, newCourse]);
    }
    setEditModalVisible(false);
    setSelectedCourse(null);
  }, [courses]);

  const handleSort = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.medium);
    const newSortOrder = sortOrder === 'asc' ? 'desc' : 'asc';
    setSortOrder(newSortOrder);
    const sortedCourses = [...courses].sort((a, b) => {
      if (newSortOrder === 'asc') {
        return a.title.localeCompare(b.title);
      } else {
        return b.title.localeCompare(a.title);
      }
    });
    setCourses(sortedCourses);
  }, [courses, sortOrder]);

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
          <Text style={styles.headerTitle}>Courses</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.controlsSection}>
          <TouchableOpacity onPress={handleAddCourse} style={styles.addButton}>
            <Ionicons name="add-circle-outline" size={32} color={colors.text} />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleSort} style={styles.sortButton}>
            <Text style={styles.sortText}>Sort {sortOrder === 'asc' ? '↑' : '↓'}</Text>
          </TouchableOpacity>
        </View>
        <FlatList
          data={courses}
          renderItem={({ item }) => <CourseItem item={item} onPress={handleCoursePress} />}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContainer}
        />
        <CourseActionModal
          visible={actionModalVisible}
          course={selectedCourse}
          onClose={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.medium);
            setActionModalVisible(false);
          }}
          onEdit={handleEditCourse}
          onDelete={handleDeleteCourse}
        />
        <EditCourseModal
          visible={editModalVisible}
          course={selectedCourse}
          onSave={handleSaveCourse}
          onCancel={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.medium);
            setEditModalVisible(false);
            setSelectedCourse(null);
          }}
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
  placeholder: {
    width: 40,
  },
  controlsSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  addButton: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sortButton: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: 10,
    borderRadius: 8,
  },
  sortText: {
    color: colors.text,
    fontSize: 16,
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  courseItem: {
    borderRadius: 10,
    marginBottom: 10,
    overflow: 'hidden',
  },
  courseContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
  },
  colorDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 10,
  },
  courseTitle: {
    flex: 1,
    color: colors.text,
    fontSize: 16,
    fontWeight: 'bold',
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    backgroundColor: colors.gradientMiddle1,
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: '80%',
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  modalDescription: {
    marginBottom: 20,
    textAlign: 'center',
    color: colors.text,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 20,
  },
  button: {
    borderRadius: 20,
    padding: 10,
    elevation: 2,
    minWidth: 80,
  },
  editButton: {
    backgroundColor: colors.tertiary,
  },
  deleteButton: {
    backgroundColor: colors.accent,
  },
  closeButton: {
    backgroundColor: colors.secondary,
    marginTop: 10,
  },
  saveButton: {
    backgroundColor: colors.tertiary,
  },
  cancelButton: {
    backgroundColor: colors.accent,
  },
  textStyle: {
    color: colors.text,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    color: colors.text,
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    width: '100%',
  },
  descriptionInput: {
    height: 100,
    textAlignVertical: 'top',
  },
});

export default Courses;