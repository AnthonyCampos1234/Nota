import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { View, FlatList, TouchableOpacity, Text, StyleSheet, Modal, TextInput, Alert } from "react-native";
import { useState, useEffect } from "react";
import { Ionicons } from '@expo/vector-icons';

import { useGlobalContext } from "../../context/GlobalProvider";

const CourseItem = ({ item, onPress }) => (
  <TouchableOpacity onPress={() => onPress(item)} style={styles.courseItem}>
    <View style={[styles.colorDot, { backgroundColor: item.color }]} />
    <View style={styles.courseContent}>
      <Text style={styles.courseTitle} numberOfLines={2}>{item.title}</Text>
    </View>
  </TouchableOpacity>
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
            placeholderTextColor="#999"
            value={title}
            onChangeText={setTitle}
          />
          <TextInput
            style={[styles.input, styles.descriptionInput]}
            placeholder="Course Description"
            placeholderTextColor="#999"
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

  const handleCoursePress = (course) => {
    setSelectedCourse(course);
    setActionModalVisible(true);
  };

  const getRandomColor = () => {
    const colors = ['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF'];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  const handleAddCourse = () => {
    const newCourse = {
      id: '',
      title: '',
      color: getRandomColor(),
      description: ''
    };
    setSelectedCourse(newCourse);
    setEditModalVisible(true);
  };

  const handleEditCourse = () => {
    setActionModalVisible(false);
    setEditModalVisible(true);
  };

  const handleDeleteCourse = () => {
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
  };

  const handleSaveCourse = (updatedCourse) => {
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
  };

  const handleSort = () => {
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
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topSection}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>{'<'}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Courses</Text>
        <View style={styles.placeholder} />
      </View>
      <View style={styles.controlsSection}>
        <TouchableOpacity onPress={handleAddCourse} style={styles.addButton}>
          <Ionicons name="add-circle-outline" size={32} color="white" />
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
    backgroundColor: '#000',
  },
  topSection: {
    flexDirection: 'row',
    alignItems: 'center',
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
    flex: 1,
    textAlign: 'center',
    color: 'white',
    fontSize: 28,
    fontWeight: 'bold',
  },
  placeholder: {
    width: 50,
    height: 50,
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
    width: 80,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sortText: {
    color: 'white',
    fontSize: 20,
  },
  listContainer: {
    paddingHorizontal: 20,
  },
  courseItem: {
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
  courseContent: {
    flex: 1,
    padding: 15,
  },
  courseTitle: {
    color: 'white',
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
    backgroundColor: '#333',
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
    color: 'white',
  },
  modalDescription: {
    marginBottom: 20,
    textAlign: 'center',
    color: 'white',
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
    backgroundColor: '#4CAF50',
  },
  deleteButton: {
    backgroundColor: '#f44336',
  },
  closeButton: {
    backgroundColor: '#555',
    marginTop: 10,
  },
  saveButton: {
    backgroundColor: '#4CAF50',
  },
  cancelButton: {
    backgroundColor: '#f44336',
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#444',
    color: 'white',
    borderRadius: 5,
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