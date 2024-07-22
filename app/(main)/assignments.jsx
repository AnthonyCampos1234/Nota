import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

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

  const handleAssignmentPress = (assignment) => {
    setSelectedAssignment(assignment);
    setActionModalVisible(true);
  };

  const getRandomColor = () => {
    const colors = ['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF'];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  const handleAddAssignment = () => {
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
  };

  const handleEditAssignment = () => {
    setActionModalVisible(false);
    setEditModalVisible(true);
  };

  const handleDeleteAssignment = () => {
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
  };

  const handleSaveAssignment = (updatedAssignment) => {
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
  };

  const handleSort = () => {
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
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topSection}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Assignments</Text>
        <View style={styles.placeholder} />
      </View>
      <View style={styles.controlsSection}>
        <TouchableOpacity onPress={handleAddAssignment} style={styles.addButton}>
          <Ionicons name="add-circle-outline" size={32} color="white" />
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
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 10,
  },
  backButton: {
    width: 50,
    height: 50,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
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
  assignmentItem: {
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
  assignmentContent: {
    flex: 1,
    padding: 15,
  },
  classTitle: {
    color: 'white',
    fontSize: 12,
    marginBottom: 5,
  },
  assignmentTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  dueDate: {
    color: 'white',
    fontSize: 14,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#333',
    borderRadius: 10,
    padding: 20,
    width: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 10,
  },
  modalText: {
    fontSize: 16,
    color: 'white',
    marginBottom: 5,
  },
  closeButton: {
    backgroundColor: '#555',
    padding: 10,
    borderRadius: 5,
    alignSelf: 'flex-end',
    marginTop: 10,
  },
  closeButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  input: {
    backgroundColor: '#444',
    color: 'white',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    padding: 10,
    borderRadius: 5,
    flex: 1,
    marginRight: 5,
  },
  cancelButton: {
    backgroundColor: '#f44336',
    padding: 10,
    borderRadius: 5,
    flex: 1,
    marginLeft: 5,
  },
  editButton: {
    backgroundColor: '#4CAF50',
    padding: 10,
    borderRadius: 5,
    flex: 1,
    marginRight: 5,
  },
  deleteButton: {
    backgroundColor: '#f44336',
    padding: 10,
    borderRadius: 5,
    flex: 1,
    marginLeft: 5,
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
  },
});

export default AssignmentsScreen;