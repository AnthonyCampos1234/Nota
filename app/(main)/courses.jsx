import React, { useState, useCallback, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, TextInput, Alert, Dimensions, Animated, StatusBar } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { BlurView } from 'expo-blur';

import { useGlobalContext } from "../../context/GlobalProvider";

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
  secondary: '#4A90E2',
  tertiary: '#50C878',
  quaternary: '#9B59B6',
};

const CourseItem = ({ item, onPress }) => (
  <TouchableOpacity onPress={() => onPress(item)} style={styles.courseItem}>
    <LinearGradient
      colors={colors.gradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={styles.courseGradient}
    >
      <View style={styles.courseContent}>
        <Text style={styles.courseCode} numberOfLines={1}>{item.code || 'No Code'}</Text>
        <Text style={styles.courseTitle}>{item.name || 'Unnamed Course'}</Text>
        <Text style={styles.courseInfo}>{item.instructor || 'No Instructor'}</Text>
        <Text style={styles.courseSchedule}>
          {item.days !== 'N/A' ? `${item.days} • ` : ''}
          {item.time !== 'N/A' ? item.time : 'No schedule specified'}
        </Text>
        <Text style={styles.courseLocation}>{item.where || 'No location specified'}</Text>
        <Text style={styles.courseCredits}>Credits: {item.credits || 'N/A'}</Text>
      </View>
    </LinearGradient>
  </TouchableOpacity>
);

const CourseActionModal = ({ visible, course, onClose, onEdit, onDelete }) => (
  <Modal
    animationType="slide"
    transparent={true}
    visible={visible}
    onRequestClose={onClose}
  >
    <View style={styles.modalContainer}>
      <BlurView intensity={100} tint="dark" style={styles.modalBlur}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>{course?.name}</Text>
          <Text style={styles.modalText}>Code: {course?.code}</Text>
          <Text style={styles.modalText}>Instructor: {course?.instructor}</Text>
          <Text style={styles.modalText}>Time: {course?.time}</Text>
          <Text style={styles.modalText}>Days: {course?.days}</Text>
          <View style={styles.buttonContainer}>
            <TouchableOpacity onPress={onEdit} style={styles.editButton}>
              <Text style={styles.buttonText}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onDelete} style={styles.deleteButton}>
              <Text style={styles.buttonText}>Delete</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </BlurView>
    </View>
  </Modal>
);

const EditCourseModal = ({ visible, course, onSave, onCancel }) => {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [instructor, setInstructor] = useState('');
  const [time, setTime] = useState('');
  const [days, setDays] = useState('');

  useEffect(() => {
    if (course) {
      setName(course.name || '');
      setCode(course.code || '');
      setInstructor(course.instructor || '');
      setTime(course.time || '');
      setDays(course.days || '');
    }
  }, [course]);

  const handleSave = () => {
    onSave({ ...course, name, code, instructor, time, days });
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
            <Text style={styles.modalTitle}>{course?.id ? 'Edit Course' : 'New Course'}</Text>
            <TextInput
              style={styles.input}
              placeholder="Course Name"
              placeholderTextColor={colors.subtext}
              value={name}
              onChangeText={setName}
            />
            <TextInput
              style={styles.input}
              placeholder="Course Code"
              placeholderTextColor={colors.subtext}
              value={code}
              onChangeText={setCode}
            />
            <TextInput
              style={styles.input}
              placeholder="Instructor"
              placeholderTextColor={colors.subtext}
              value={instructor}
              onChangeText={setInstructor}
            />
            <TextInput
              style={styles.input}
              placeholder="Time (e.g., 1:35 pm - 3:15 pm)"
              placeholderTextColor={colors.subtext}
              value={time}
              onChangeText={setTime}
            />
            <TextInput
              style={styles.input}
              placeholder="Days (e.g., MWF)"
              placeholderTextColor={colors.subtext}
              value={days}
              onChangeText={setDays}
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
    </Modal>
  );
};

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
            <Text style={styles.headerTitle}>My Courses</Text>
          </View>
          <View style={styles.placeholderButton} />
        </View>
        <Text style={styles.headerSubtitle}>Manage your academic journey</Text>
      </Animated.View>
      <Animated.View style={[styles.miniHeader, { opacity: miniHeaderOpacity, paddingTop: insets.top }]}>
        <View style={styles.miniHeaderContent}>
          <TouchableOpacity onPress={onBackPress} style={styles.miniBackButton}>
            <Ionicons name="chevron-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.miniHeaderTitle}>My Courses</Text>
        </View>
      </Animated.View>
    </Animated.View>
  );
};

const Courses = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { user, setUser } = useGlobalContext();
  const scrollY = useRef(new Animated.Value(0)).current;
  const [courses, setCourses] = useState([]);
  const [actionModalVisible, setActionModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [sortOrder, setSortOrder] = useState('asc');
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log("Current user.courseSchedule:", JSON.stringify(user?.courseSchedule, null, 2));

    if (user?.courseSchedule && Array.isArray(user.courseSchedule)) {
      try {
        const parsedCourses = user.courseSchedule.map((courseString, index) => {
          const course = JSON.parse(courseString);
          console.log(`Processing course ${index}:`, JSON.stringify(course, null, 2));

          const meeting = course.meetingTimes && course.meetingTimes.length > 0 ? course.meetingTimes[0] : {};

          return {
            id: course.crn || index.toString(),
            name: course.name || `Course ${index + 1}`,
            code: course.code || '',
            instructor: course.instructor || '',
            time: meeting.time || 'N/A',
            days: meeting.days || 'N/A',
            credits: course.credits || '',
            where: meeting.location || 'N/A',
          };
        });

        console.log("Parsed courses:", JSON.stringify(parsedCourses, null, 2));

        setCourses(parsedCourses);
        setError(null);
      } catch (e) {
        console.error("Error processing course schedule:", e);
        setError(`Error processing course schedule: ${e.message}`);
      }
    } else {
      console.log("No course schedule found or invalid format");
      setError("No course schedule found or invalid format");
    }
  }, [user?.courseSchedule]);

  const handleBackPress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    navigation.goBack();
  }, [navigation]);

  const handleCoursePress = useCallback((course) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSelectedCourse(course);
    setActionModalVisible(true);
  }, []);

  const handleAddCourse = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSelectedCourse(null);
    setEditModalVisible(true);
  }, []);

  const handleEditCourse = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setActionModalVisible(false);
    setEditModalVisible(true);
  }, []);

  const handleDeleteCourse = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      "Delete Course",
      "Are you sure you want to delete this course?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: 'destructive',
          onPress: () => {
            setCourses(currentCourses =>
              currentCourses.filter(c => c.id !== selectedCourse.id)
            );
            setActionModalVisible(false);
          }
        }
      ]
    );
  }, [selectedCourse]);

  const handleSaveCourse = useCallback((updatedCourse) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setCourses(currentCourses => {
      if (updatedCourse.id) {
        return currentCourses.map(c =>
          c.id === updatedCourse.id ? updatedCourse : c
        );
      } else {
        const newCourse = {
          ...updatedCourse,
          id: String(Date.now()),
        };
        return [...currentCourses, newCourse];
      }
    });
    setEditModalVisible(false);
  }, []);

  const handleSort = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSortOrder(currentOrder => currentOrder === 'asc' ? 'desc' : 'asc');
    setCourses(currentCourses =>
      [...currentCourses].sort((a, b) => {
        return sortOrder === 'asc'
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name);
      })
    );
  }, [sortOrder]);

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <StatusBar barStyle="light-content" />
      <Header scrollY={scrollY} insets={insets} onBackPress={handleBackPress} />
      {error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : (
        <Animated.FlatList
          data={courses}
          renderItem={({ item }) => <CourseItem item={item} onPress={handleCoursePress} />}
          keyExtractor={item => item.id}
          contentContainerStyle={[
            styles.listContainer,
            { paddingTop: HEADER_MAX_HEIGHT, paddingBottom: 20 + insets.bottom }
          ]}
          scrollEventThrottle={16}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: false }
          )}
        />
      )}
      <View style={[styles.controlsSection, { bottom: insets.bottom }]}>
        <TouchableOpacity onPress={handleAddCourse} style={styles.addButton}>
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
      <CourseActionModal
        visible={actionModalVisible}
        course={selectedCourse}
        onClose={() => setActionModalVisible(false)}
        onEdit={handleEditCourse}
        onDelete={handleDeleteCourse}
      />
      <EditCourseModal
        visible={editModalVisible}
        course={selectedCourse}
        onSave={handleSaveCourse}
        onCancel={() => {
          setEditModalVisible(false);
          setSelectedCourse(null);
        }}
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
  listContainer: {
    paddingHorizontal: 20,
  },
  courseItem: {
    marginBottom: 15,
    borderRadius: 12,
    overflow: 'hidden',
  },
  courseGradient: {
    padding: 2,
  },
  courseContent: {
    backgroundColor: colors.card,
    borderRadius: 10,
    padding: 15,
  },
  courseCode: {
    color: colors.subtext,
    fontSize: 14,
    marginBottom: 5,
  },
  courseTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  courseInfo: {
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
  courseSchedule: {
    color: colors.subtext,
    fontSize: 14,
    marginTop: 5,
  },
  courseCredits: {
    color: colors.subtext,
    fontSize: 12,
    marginTop: 5,
  },
  errorText: {
    color: colors.accent,
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
  courseLocation: {
    color: colors.subtext,
    fontSize: 14,
    marginTop: 5,
  },
});

export default Courses;
