import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, TextInput, Alert, Dimensions } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

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

const AssignmentItem = ({ item, onPress }) => (
  <TouchableOpacity onPress={() => onPress(item)} style={styles.assignmentItem}>
    <View style={[styles.colorDot, { backgroundColor: item.color }]} />
    <View style={styles.assignmentContent}>
      <Text style={styles.classTitle} numberOfLines={1}>{item.classTitle}</Text>
      <Text style={styles.assignmentTitle}>{item.title}</Text>
      <Text style={styles.dueDate}>Due: {item.dueDate}</Text>
    </View>
  </TouchableOpacity>
);

const AssignmentActionModal = ({ visible, assignment, onClose, onEdit, onDelete }) => (
  <Modal
    animationType="slide"
    transparent={true}
    visible={visible}
    onRequestClose={onClose}
  >
    <View style={styles.modalContainer}>
      <View style={styles.modalContent}>
        <Text style={styles.modalTitle}>{assignment?.title}</Text>
        <Text style={styles.modalText}>Class: {assignment?.classTitle}</Text>
        <Text style={styles.modalText}>Due: {assignment?.dueDate}</Text>
        <Text style={styles.modalText}>Description: {assignment?.description || 'No description available.'}</Text>
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
    </View>
  </Modal>
);

const EditAssignmentModal = ({ visible, assignment, onSave, onCancel }) => {
  const [title, setTitle] = useState('');
  const [classTitle, setClassTitle] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (assignment) {
      setTitle(assignment.title || '');
      setClassTitle(assignment.classTitle || '');
      setDueDate(assignment.dueDate || '');
      setDescription(assignment.description || '');
    }
  }, [assignment]);

  const handleSave = () => {
    onSave({ ...assignment, title, classTitle, dueDate, description });
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onCancel}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>{assignment?.id ? 'Edit Assignment' : 'New Assignment'}</Text>
          <TextInput
            style={styles.input}
            placeholder="Title"
            placeholderTextColor="#999"
            value={title}
            onChangeText={setTitle}
          />
          <TextInput
            style={styles.input}
            placeholder="Class"
            placeholderTextColor="#999"
            value={classTitle}
            onChangeText={setClassTitle}
          />
          <TextInput
            style={styles.input}
            placeholder="Due Date"
            placeholderTextColor="#999"
            value={dueDate}
            onChangeText={setDueDate}
          />
          <TextInput
            style={styles.input}
            placeholder="Description"
            placeholderTextColor="#999"
            value={description}
            onChangeText={setDescription}
            multiline
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
      </View>
    </Modal>
  );
};

const AssignmentsScreen = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [assignments, setAssignments] = useState([
    {
      id: '1',
      classTitle: 'INTB1203 40039 Intl Bus and Social Resp SEC 01 Sum...',
      title: 'Reflection Paper[Optional]',
      dueDate: '1:00 PM',
      color: '#FF0000',
      description: 'Write a reflection paper on the topics covered in class this week.'
    },
    // ... (other assignments)
  ]);

  const [actionModalVisible, setActionModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [sortOrder, setSortOrder] = useState('asc');

  const handleAssignmentPress = useCallback((assignment) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.medium);
    setSelectedAssignment(assignment);
    setActionModalVisible(true);
  }, []);

  const getRandomColor = () => {
    const colors = ['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF'];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  const handleAddAssignment = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const newAssignment = {
      id: '',
      classTitle: '',
      title: '',
      dueDate: '',
      color: getRandomColor(),
      description: ''
    };
    setSelectedAssignment(newAssignment);
    setEditModalVisible(true);
  }, []);

  const handleEditAssignment = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.medium);
    setActionModalVisible(false);
    setEditModalVisible(true);
  }, []);

  const handleDeleteAssignment = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      "Delete Assignment",
      "Are you sure you want to delete this assignment?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "OK",
          onPress: () => {
            setAssignments(assignments.filter(a => a.id !== selectedAssignment.id));
            setActionModalVisible(false);
          }
        }
      ]
    );
  }, [assignments, selectedAssignment]);

  const handleBackPress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    navigation.goBack();
  }, [navigation]);

  const handleSaveAssignment = useCallback((updatedAssignment) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.medium);
    if (updatedAssignment.id) {
      setAssignments(assignments.map(a => a.id === updatedAssignment.id ? updatedAssignment : a));
    } else {
      const newAssignment = {
        ...updatedAssignment,
        id: String(assignments.length + 1),
        color: getRandomColor(),
      };
      setAssignments([...assignments, newAssignment]);
    }
    setEditModalVisible(false);
    setSelectedAssignment(null);
  }, [assignments]);

  const handleSort = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.medium);
    const newSortOrder = sortOrder === 'asc' ? 'desc' : 'asc';
    setSortOrder(newSortOrder);
    const sortedAssignments = [...assignments].sort((a, b) => {
      if (newSortOrder === 'asc') {
        return new Date(a.dueDate) - new Date(b.dueDate);
      } else {
        return new Date(b.dueDate) - new Date(a.dueDate);
      }
    });
    setAssignments(sortedAssignments);
  }, [sortOrder, assignments]);

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <LinearGradient
        colors={[colors.gradientStart, colors.gradientMiddle1, colors.gradientMiddle2, colors.gradientEnd]}
        style={styles.gradientBackground}
      >
        <View style={[styles.topSection, { paddingTop: insets.top }]}>
          <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
            <Ionicons name="chevron-back" size={32} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Assignments</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.controlsSection}>
          <TouchableOpacity onPress={handleAddAssignment} style={styles.addButton}>
            <Ionicons name="add-circle-outline" size={32} color={colors.text} />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleSort} style={styles.sortButton}>
            <Text style={styles.sortText}>Sort {sortOrder === 'asc' ? '↑' : '↓'}</Text>
          </TouchableOpacity>
        </View>
        <FlatList
          data={assignments}
          renderItem={({ item }) => <AssignmentItem item={item} onPress={handleAssignmentPress} />}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContainer}
        />
        <AssignmentActionModal
          visible={actionModalVisible}
          assignment={selectedAssignment}
          onClose={() => setActionModalVisible(false)}
          onEdit={handleEditAssignment}
          onDelete={handleDeleteAssignment}
        />
        <EditAssignmentModal
          visible={editModalVisible}
          assignment={selectedAssignment}
          onSave={handleSaveAssignment}
          onCancel={() => {
            setEditModalVisible(false);
            setSelectedAssignment(null);
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
    paddingHorizontal: 20,
    paddingBottom: 10,
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
    flex: 1,
    textAlign: 'center',
    color: colors.text,
    fontSize: 28,
    fontWeight: 'bold',
    marginLeft: 10,
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
    width: 80,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sortText: {
    color: colors.text,
    fontSize: 20,
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  assignmentItem: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
    marginBottom: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.secondary,
  },
  colorDot: {
    width: 10,
    height: '100%',
  },
  assignmentContent: {
    flex: 1,
    padding: 15,
  },
  classTitle: {
    color: colors.textSecondary,
    fontSize: 12,
    marginBottom: 5,
  },
  assignmentTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  dueDate: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    padding: 20,
    width: '80%',
    borderWidth: 1,
    borderColor: colors.secondary,
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
    backgroundColor: 'rgba(255,255,255,0.1)',
    color: colors.text,
    borderRadius: 8,
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
    borderRadius: 8,
    flex: 1,
    marginRight: 10,
  },
  cancelButton: {
    backgroundColor: colors.accent,
    padding: 12,
    borderRadius: 8,
    flex: 1,
    marginLeft: 10,
  },
  editButton: {
    backgroundColor: colors.tertiary,
    padding: 12,
    borderRadius: 8,
    flex: 1,
    marginRight: 10,
  },
  deleteButton: {
    backgroundColor: colors.accent,
    padding: 12,
    borderRadius: 8,
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
    backgroundColor: colors.secondary,
    padding: 12,
    borderRadius: 8,
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
});

export default AssignmentsScreen;