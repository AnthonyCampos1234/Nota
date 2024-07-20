import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { View, FlatList, TouchableOpacity, Text, StyleSheet, Modal, TextInput } from "react-native";
import { useState } from "react";
import { Ionicons } from '@expo/vector-icons';

import { useGlobalContext } from "../../context/GlobalProvider";

const Courses = () => {
  const { user, setUser, setIsLogged } = useGlobalContext();
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);
  const [classDetails, setClassDetails] = useState("");

  const handlePress = (classInfo) => {
    setSelectedClass(classInfo);
    setClassDetails(`Detailed information about ${classInfo}`);
    setModalVisible(true);
  };

  const handleSave = () => {
    // Save the edited class details (you can implement this as needed)
    setModalVisible(false);
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity onPress={() => handlePress(item.title)} style={styles.courseItem}>
      <View style={[styles.colorDot, { backgroundColor: item.color }]} />
      <View style={styles.courseContent}>
        <Text style={styles.courseTitle} numberOfLines={2}>{item.title}</Text>
      </View>
    </TouchableOpacity>
  );

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
        <TouchableOpacity style={styles.addButton}>
          <Ionicons name="add-circle-outline" size={32} color="white" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.sortButton}>
          <Text style={styles.sortText}>Sort ↕</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={[
          { id: '1', title: "CS2510 30198 Fundamentals of Computer Science 2 SEC 01", color: '#FF0000' },
          { id: '2', title: "FINA2201 30396 Financial Management SEC 01", color: '#00FF00' },
          { id: '3', title: "CS3500 40039 Object-Oriented Design SEC 01", color: '#00FFFF' },
          { id: '4', title: "MATH2331 31477 Linear Algebra SEC 02", color: '#FF00FF' },
          { id: '5', title: "PHYS1151 32556 Physics for Engineering I SEC 01", color: '#FFFF00' },
        ]}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
      />

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(!modalVisible);
        }}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalText}>{selectedClass}</Text>
            <TextInput
              style={styles.modalDescription}
              multiline
              value={classDetails}
              onChangeText={setClassDetails}
            />
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 }}>
              <TouchableOpacity
                style={[styles.button, styles.buttonClose]}
                onPress={() => setModalVisible(!modalVisible)}
              >
                <Text style={styles.textStyle}>Close</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.buttonSave]}
                onPress={handleSave}
              >
                <Text style={styles.textStyle}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    marginTop: 22,
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
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
  button: {
    borderRadius: 20,
    padding: 10,
    elevation: 2,
    marginHorizontal: 10,
  },
  buttonClose: {
    backgroundColor: '#f44336',
  },
  buttonSave: {
    backgroundColor: '#4CAF50',
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: 'bold',
  },
  modalDescription: {
    marginBottom: 20,
    textAlign: 'center',
    width: '100%',
    height: 100,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
  }
});

export default Courses;