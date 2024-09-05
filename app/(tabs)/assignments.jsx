import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, SectionList, TouchableOpacity, Modal, TextInput, Alert, Dimensions, Animated, StatusBar, ScrollView, Platform, KeyboardAvoidingView, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { BlurView } from 'expo-blur';
import { databases, appwriteConfig, getCurrentUser } from '../../lib/appwrite';
import { useGlobalContext } from "../../context/GlobalProvider";
import DateTimePicker from '@react-native-community/datetimepicker';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
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
  overdueGradient: ['#FF6B6B', '#FF4757'],
  secondary: '#4A90E2',
  tertiary: '#50C878',
  quaternary: '#9B59B6',
};

const formatDueDate = (dateString) => {
  const date = new Date(dateString);
  const options = {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  };
  return date.toLocaleString('en-US', options);
};

const AssignmentItem = ({ item, onPress, onToggleComplete }) => {
  // Add null check for item
  if (!item) {
    return null; // or return a placeholder component
  }

  const isOverdue = item.dueDate && new Date(item.dueDate) < new Date() && !item.completed;

  return (
    <TouchableOpacity onPress={() => onPress(item)} style={styles.assignmentItem}>
      <LinearGradient
        colors={isOverdue ? colors.overdueGradient : (colors.gradient || ['#000000', '#000000'])}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.assignmentGradient}
      >
        <View style={styles.assignmentContent}>
          <View style={styles.assignmentHeader}>
            <Text style={styles.classTitle} numberOfLines={1}>{item.courseTitle || 'No Course'}</Text>
            <TouchableOpacity onPress={() => onToggleComplete(item)}>
              <Ionicons
                name={item.completed ? "checkmark-circle" : "ellipse-outline"}
                size={24}
                color={item.completed ? colors.tertiary : colors.subtext}
              />
            </TouchableOpacity>
          </View>
          <Text style={[
            styles.assignmentTitle,
            item.completed && styles.completedText,
            isOverdue && styles.overdueText
          ]}>{item.title || 'Untitled Assignment'}</Text>
          <Text style={[styles.dueDate, isOverdue && styles.overdueDueDate]}>
            {isOverdue ? 'Overdue: ' : 'Due: '}{item.dueDate ? formatDueDate(item.dueDate) : 'No due date'}
          </Text>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const AssignmentActionModal = ({ visible, assignment, onClose, onEdit, onDelete, onToggleComplete }) => (
  <Modal
    animationType="slide"
    transparent={true}
    visible={visible}
    onRequestClose={onClose}
  >
    <View style={styles.modalContainer}>
      <BlurView intensity={100} tint="dark" style={styles.modalBlur}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>{assignment?.title}</Text>
          <Text style={styles.modalText}>Course: {assignment?.courseTitle}</Text>
          <Text style={styles.modalText}>Due: {assignment ? formatDueDate(assignment.dueDate) : 'N/A'}</Text>
          <Text style={styles.modalText}>Description: {assignment?.description || 'No description available.'}</Text>
          <Text style={styles.modalText}>Status: {assignment?.completed ? 'Completed' : 'Pending'}</Text>
          <View style={styles.buttonContainer}>
            <TouchableOpacity onPress={onEdit} style={styles.editButton}>
              <Text style={styles.buttonText}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onDelete} style={styles.deleteButton}>
              <Text style={styles.buttonText}>Delete</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity onPress={() => onToggleComplete(assignment)} style={styles.toggleCompleteButton}>
            <Text style={styles.buttonText}>
              {assignment?.completed ? 'Mark as Incomplete' : 'Mark as Complete'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </BlurView>
    </View>
  </Modal>
);

const EditAssignmentModal = ({ visible, assignment, onSave, onCancel, courses }) => {
  const [title, setTitle] = useState('');
  const [courseTitle, setCourseTitle] = useState('');
  const [dueDate, setDueDate] = useState(new Date());
  const [description, setDescription] = useState('');
  const [showCourseSelection, setShowCourseSelection] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  useEffect(() => {
    if (assignment) {
      setTitle(assignment.title || '');
      setCourseTitle(assignment.courseTitle || '');
      setDueDate(assignment.dueDate ? new Date(assignment.dueDate) : new Date());
      setDescription(assignment.description || '');
    } else {
      setTitle('');
      setCourseTitle(courses.length > 0 ? courses[0].name : '');
      setDueDate(new Date());
      setDescription('');
    }
  }, [assignment, courses]);

  const handleSave = () => {
    onSave({ ...assignment, title, courseTitle, dueDate: dueDate.toISOString(), description });
  };

  const handleCourseSelect = (course) => {
    setCourseTitle(course.name);
    setShowCourseSelection(false);
  };

  const handleDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || dueDate;
    setShowDatePicker(Platform.OS === 'ios');
    setDueDate(currentDate);
  };

  const handleTimeChange = (event, selectedTime) => {
    const currentTime = selectedTime || dueDate;
    setShowTimePicker(Platform.OS === 'ios');
    setDueDate(currentTime);
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onCancel}
    >
      <View style={styles.modalContainer}>
        <BlurView intensity={100} tint="dark" style={styles.modalBlur}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{assignment?.id ? 'Edit Assignment' : 'New Assignment'}</Text>
            <TextInput
              style={styles.input}
              placeholder="Title"
              placeholderTextColor={colors.subtext}
              value={title}
              onChangeText={setTitle}
            />
            <TouchableOpacity
              style={styles.courseSelector}
              onPress={() => setShowCourseSelection(true)}
            >
              <Text style={styles.courseSelectorText}>
                {courseTitle || 'Select a course'}
              </Text>
              <Ionicons name="chevron-down" size={24} color={colors.text} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.dateTimeSelector}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={styles.dateTimeSelectorText}>
                Due Date: {dueDate.toLocaleDateString()}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.dateTimeSelector}
              onPress={() => setShowTimePicker(true)}
            >
              <Text style={styles.dateTimeSelectorText}>
                Due Time: {dueDate.toLocaleTimeString()}
              </Text>
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                value={dueDate}
                mode="date"
                display="default"
                onChange={handleDateChange}
              />
            )}
            {showTimePicker && (
              <DateTimePicker
                value={dueDate}
                mode="time"
                display="default"
                onChange={handleTimeChange}
              />
            )}
            <TextInput
              style={[styles.input, styles.multilineInput]}
              placeholder="Description"
              placeholderTextColor={colors.subtext}
              value={description}
              onChangeText={setDescription}
              multiline
              returnKeyType="done"
              blurOnSubmit={true}
              onSubmitEditing={() => {
                Keyboard.dismiss();
              }}
            />
            <View style={styles.buttonContainer}>
              <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
                <Text style={styles.buttonText}>Save</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={onCancel} style={styles.cancelButton}>
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </BlurView>
      </View>

      <Modal
        animationType="slide"
        transparent={true}
        visible={showCourseSelection}
        onRequestClose={() => setShowCourseSelection(false)}
      >
        <View style={styles.courseSelectionModal}>
          <BlurView intensity={100} tint="dark" style={StyleSheet.absoluteFill} />
          <View style={styles.courseSelectionContent}>
            <Text style={styles.courseSelectionTitle}>Select a Course</Text>
            <ScrollView style={styles.courseList}>
              {courses.map((course) => (
                <TouchableOpacity
                  key={course.id}
                  style={styles.courseItem}
                  onPress={() => handleCourseSelect(course)}
                >
                  <Text style={styles.courseItemText}>{course.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity
              style={styles.closeCourseSelectionButton}
              onPress={() => setShowCourseSelection(false)}
            >
              <Text style={styles.closeCourseSelectionButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </Modal>
  );
};

const Header = ({ scrollY, insets }) => {
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
    <Animated.View style={[styles.header, { height: headerHeight, paddingTop: insets.top }]}>
      <BlurView intensity={50} tint="dark" style={StyleSheet.absoluteFill} />
      <Animated.View style={[styles.headerContent, { opacity: headerOpacity }]}>
        <Text style={styles.logoText}>Assignments</Text>
        <Text style={styles.headerSubtitle}>Manage your tasks and deadlines</Text>
      </Animated.View>
      <Animated.View style={[styles.miniHeader, { opacity: miniHeaderOpacity, paddingTop: insets.top }]}>
        <View style={styles.miniHeaderContent}>
          <Text style={styles.miniLogoText}>Assignments</Text>
        </View>
      </Animated.View>
    </Animated.View>
  );
};

const AssignmentsScreen = () => {
  const insets = useSafeAreaInsets();
  const [assignments, setAssignments] = useState([]);
  const [actionModalVisible, setActionModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [sortOrder, setSortOrder] = useState('asc');
  const scrollY = useRef(new Animated.Value(0)).current;
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const { user } = useGlobalContext();
  const [courses, setCourses] = useState([]);
  const [activeTab, setActiveTab] = useState('due');

  useEffect(() => {
    fetchUserAndAssignments();
    if (user?.courseSchedule && Array.isArray(user.courseSchedule)) {
      const parsedCourses = user.courseSchedule.map((courseString, index) => {
        try {
          const course = JSON.parse(courseString);
          return {
            id: course.crn || index.toString(),
            name: course.name || `Course ${index + 1}`,
          };
        } catch (e) {
          console.error('Error parsing course:', e);
          return {
            id: index.toString(),
            name: `Course ${index + 1}`,
          };
        }
      });
      setCourses(parsedCourses);
    } else {
      setCourses([]);
    }
  }, [user]);

  const fetchUserAndAssignments = async () => {
    try {
      setLoading(true);
      const user = await getCurrentUser();
      if (!user) throw new Error('User not found');
      setCurrentUser(user);

      // Add a null check and provide a default empty array
      const userAssignments = user.assignments || [];

      const parsedAssignments = userAssignments.map(assignment => {
        try {
          return JSON.parse(assignment);
        } catch (e) {
          console.error('Error parsing assignment:', e);
          return null;
        }
      }).filter(assignment => assignment !== null);

      setAssignments(parsedAssignments);
    } catch (error) {
      console.error('Error fetching user and assignments:', error);
      Alert.alert('Error', 'Failed to fetch assignments. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAssignmentPress = useCallback((assignment) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSelectedAssignment(assignment);
    setActionModalVisible(true);
  }, []);

  const handleAddAssignment = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSelectedAssignment(null);
    setEditModalVisible(true);
  }, []);

  const handleEditAssignment = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setActionModalVisible(false);
    setEditModalVisible(true);
  }, []);

  const handleDeleteAssignment = useCallback(async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      "Delete Assignment",
      "Are you sure you want to delete this assignment?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: 'destructive',
          onPress: async () => {
            try {
              const updatedAssignments = assignments.filter(a => a.id !== selectedAssignment.id);
              await updateUserAssignments(updatedAssignments);
              setAssignments(updatedAssignments);
              setActionModalVisible(false);
            } catch (error) {
              console.error('Error deleting assignment:', error);
              Alert.alert('Error', 'Failed to delete assignment. Please try again.');
            }
          }
        }
      ]
    );
  }, [selectedAssignment, assignments]);

  const handleSaveAssignment = useCallback(async (updatedAssignment) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      let updatedAssignments;
      if (updatedAssignment.id) {
        updatedAssignments = assignments.map(a =>
          a.id === updatedAssignment.id ? updatedAssignment : a
        );
      } else {
        const newAssignment = {
          ...updatedAssignment,
          id: Date.now().toString(),
          completed: false,
        };
        updatedAssignments = [...assignments, newAssignment];
      }

      await updateUserAssignments(updatedAssignments);
      setAssignments(updatedAssignments);
      setEditModalVisible(false);
    } catch (error) {
      console.error('Error saving assignment:', error);
      if (error.message === 'Assignment data too large') {
        Alert.alert('Error', 'Assignment data is too large. Please shorten your input.');
      } else {
        Alert.alert('Error', 'Failed to save assignment. Please try again.');
      }
    }
  }, [assignments, currentUser]);

  const handleToggleComplete = useCallback(async (assignment) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      const updatedAssignments = assignments.map(a =>
        a.id === assignment.id ? { ...a, completed: !a.completed } : a
      );
      await updateUserAssignments(updatedAssignments);
      setAssignments(updatedAssignments);
      setActionModalVisible(false);
    } catch (error) {
      console.error('Error toggling assignment completion:', error);
      Alert.alert('Error', 'Failed to update assignment status. Please try again.');
    }
  }, [assignments, currentUser]);

  const updateUserAssignments = async (updatedAssignments) => {
    try {
      const stringifiedAssignments = updatedAssignments.map(assignment => {
        const assignmentString = JSON.stringify(assignment);
        if (assignmentString.length > 5000) {
          throw new Error('Assignment data too large');
        }
        return assignmentString;
      });

      await databases.updateDocument(
        appwriteConfig.databaseId,
        appwriteConfig.userCollectionId,
        currentUser.$id,
        { assignments: stringifiedAssignments }
      );
    } catch (error) {
      console.error('Error updating user assignments:', error);
      throw error;
    }
  };

  const sortAssignments = useCallback((assignmentsToSort) => {
    return [...assignmentsToSort].sort((a, b) => {
      const dateA = new Date(a.dueDate);
      const dateB = new Date(b.dueDate);
      return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    });
  }, [sortOrder]);

  const getSectionedAssignments = useCallback(() => {
    if (!assignments || assignments.length === 0) {
      return []; // Return an empty array if there are no assignments
    }

    const now = new Date();
    const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

    const overdue = assignments.filter(a => a && a.dueDate && !a.completed && new Date(a.dueDate) < now);
    const dueSoon = assignments.filter(a => a && a.dueDate && !a.completed && new Date(a.dueDate) >= now && new Date(a.dueDate) <= threeDaysFromNow);
    const upcoming = assignments.filter(a => a && a.dueDate && !a.completed && new Date(a.dueDate) > threeDaysFromNow);
    const completed = assignments.filter(a => a && a.completed);

    return [
      { title: 'Overdue', data: sortAssignments(overdue) },
      { title: 'Due Soon', data: sortAssignments(dueSoon) },
      { title: 'Upcoming', data: sortAssignments(upcoming) },
      { title: 'Completed', data: sortAssignments(completed) },
    ].filter(section => section.data.length > 0); // Only include non-empty sections
  }, [assignments, sortOrder]);

  const renderSectionHeader = ({ section: { title } }) => (
    <View style={[
      styles.sectionHeader,
      title === 'Overdue' && styles.overdueSectionHeader
    ]}>
      <Text style={[
        styles.sectionHeaderText,
        title === 'Overdue' && styles.overdueSectionHeaderText
      ]}>{title}</Text>
    </View>
  );

  const handleSort = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSortOrder(currentOrder => currentOrder === 'asc' ? 'desc' : 'asc');
  }, []);

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <StatusBar barStyle="light-content" />
      <Header scrollY={scrollY} insets={insets} />
      <Animated.SectionList
        sections={getSectionedAssignments()}
        renderItem={({ item }) => (
          <AssignmentItem
            item={item}
            onPress={handleAssignmentPress}
            onToggleComplete={handleToggleComplete}
          />
        )}
        renderSectionHeader={renderSectionHeader}
        keyExtractor={item => item.id}
        contentContainerStyle={[
          styles.listContainer,
          { paddingTop: HEADER_MAX_HEIGHT + insets.top, paddingBottom: insets.bottom + 80 }
        ]}
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
      />
      <View style={[styles.controlsSection, { bottom: insets.bottom + 80 }]}>
        <TouchableOpacity onPress={handleAddAssignment} style={styles.addButton}>
          <LinearGradient
            colors={colors.gradient}
            style={styles.addButtonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Ionicons name="add" size={32} color={colors.text} />
          </LinearGradient>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleSort} style={styles.sortButton}>
          <Text style={styles.sortText}>Sort {sortOrder === 'asc' ? '↑' : '↓'}</Text>
        </TouchableOpacity>
      </View>
      <AssignmentActionModal
        visible={actionModalVisible}
        assignment={selectedAssignment}
        onClose={() => setActionModalVisible(false)}
        onEdit={handleEditAssignment}
        onDelete={handleDeleteAssignment}
        onToggleComplete={handleToggleComplete}
      />
      <EditAssignmentModal
        visible={editModalVisible}
        assignment={selectedAssignment}
        onSave={handleSaveAssignment}
        onCancel={() => {
          setEditModalVisible(false);
          setSelectedAssignment(null);
        }}
        courses={courses}
      />
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
  listContainer: {
    paddingHorizontal: 20,
  },
  assignmentItem: {
    marginBottom: 15,
    borderRadius: 12,
    overflow: 'hidden',
  },
  assignmentGradient: {
    padding: 2,
  },
  assignmentContent: {
    backgroundColor: colors.card,
    borderRadius: 10,
    padding: 15,
  },
  classTitle: {
    color: colors.subtext,
    fontSize: 14,
    marginBottom: 5,
  },
  assignmentTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  dueDate: {
    color: colors.accent,
    fontSize: 14,
  },
  controlsSection: {
    position: 'absolute',
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  addButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    overflow: 'hidden',
    marginRight: 15,
  },
  addButtonGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sortButton: {
    backgroundColor: colors.card,
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 20,
  },
  sortText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBlur: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 20,
    width: '90%',
    maxWidth: 400,
  },
  multilineInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 20,
    textAlign: 'center',
  },
  modalText: {
    fontSize: 16,
    color: colors.text,
    marginBottom: 10,
  },
  input: {
    backgroundColor: colors.background,
    color: colors.text,
    borderRadius: 10,
    padding: 12,
    marginBottom: 15,
    fontSize: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  saveButton: {
    backgroundColor: colors.tertiary,
    padding: 12,
    borderRadius: 10,
    flex: 1,
    marginRight: 10,
  },
  cancelButton: {
    backgroundColor: colors.accent,
    padding: 12,
    borderRadius: 10,
    flex: 1,
    marginLeft: 10,
  },
  editButton: {
    backgroundColor: colors.secondary,
    padding: 12,
    borderRadius: 10,
    flex: 1,
    marginRight: 10,
  },
  deleteButton: {
    backgroundColor: colors.accent,
    padding: 12,
    borderRadius: 10,
    flex: 1,
    marginLeft: 10,
  },
  buttonText: {
    color: colors.text,
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 16,
  },
  closeButton: {
    backgroundColor: colors.card,
    padding: 12,
    borderRadius: 10,
    alignSelf: 'center',
    marginTop: 20,
    width: '100%',
  },
  closeButtonText: {
    color: colors.text,
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 16,
  },
  courseSelector: {
    backgroundColor: colors.background,
    borderRadius: 10,
    padding: 12,
    marginBottom: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  courseSelectorText: {
    color: colors.text,
    fontSize: 16,
  },
  courseSelectionModal: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  courseSelectionContent: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 20,
    width: '90%',
    maxWidth: 400,
    maxHeight: '80%',
  },
  courseSelectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 20,
    textAlign: 'center',
  },
  courseList: {
    maxHeight: 300,
  },
  courseItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  courseItemText: {
    color: colors.text,
    fontSize: 16,
  },
  closeCourseSelectionButton: {
    backgroundColor: colors.accent,
    padding: 12,
    borderRadius: 10,
    marginTop: 20,
  },
  closeCourseSelectionButtonText: {
    color: colors.text,
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 16,
  },
  dateTimeSelector: {
    backgroundColor: colors.background,
    borderRadius: 10,
    padding: 12,
    marginBottom: 15,
  },
  dateTimeSelectorText: {
    color: colors.text,
    fontSize: 16,
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: colors.card,
    borderRadius: 20,
    marginHorizontal: 20,
    marginTop: HEADER_MIN_HEIGHT + 10,
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 1,
  },
  tab: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  activeTab: {
    backgroundColor: colors.accent,
  },
  tabText: {
    color: colors.text,
    fontWeight: 'bold',
  },
  assignmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: colors.subtext,
  },
  toggleCompleteButton: {
    backgroundColor: colors.secondary,
    padding: 12,
    borderRadius: 10,
    marginTop: 10,
  },
  sectionHeader: {
    backgroundColor: colors.card,
    padding: 10,
    marginTop: 10,
    marginBottom: 5,
    borderRadius: 10,
  },
  sectionHeaderText: {
    color: colors.text,
    fontSize: 18,
    fontWeight: 'bold',
  },
  sectionHeader: {
    backgroundColor: colors.card,
    padding: 10,
    marginTop: 10,
    marginBottom: 5,
    borderRadius: 10,
  },
  sectionHeaderText: {
    color: colors.text,
    fontSize: 18,
    fontWeight: 'bold',
  },
  overdueGradient: ['#FF6B6B', '#FF4757'],
  overdueText: {
    color: '#FF4757',
    fontWeight: 'bold',
  },
  overdueDueDate: {
    color: '#FF4757',
    fontWeight: 'bold',
  },
  overdueSectionHeader: {
    backgroundColor: '#FF4757',
  },
  overdueSectionHeaderText: {
    color: colors.text,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  safeArea: {
    flex: 1,
    width: '100%',
  },
  modalContent: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 20,
    width: '100%',
    maxWidth: SCREEN_WIDTH * 0.9,
    alignSelf: 'center',
  },
  multilineInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  input: {
    backgroundColor: colors.background,
    color: colors.text,
    borderRadius: 10,
    padding: 12,
    marginBottom: 15,
    fontSize: 16,
    width: '100%',
  },
  courseSelector: {
    backgroundColor: colors.background,
    borderRadius: 10,
    padding: 12,
    marginBottom: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  dateTimeSelector: {
    backgroundColor: colors.background,
    borderRadius: 10,
    padding: 12,
    marginBottom: 15,
    width: '100%',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    width: '100%',
  },
  saveButton: {
    backgroundColor: colors.tertiary,
    padding: 12,
    borderRadius: 10,
    flex: 1,
    marginRight: 10,
  },
  cancelButton: {
    backgroundColor: colors.accent,
    padding: 12,
    borderRadius: 10,
    flex: 1,
    marginLeft: 10,
  },
});

export default AssignmentsScreen;