import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { View, FlatList, TouchableOpacity, Text, StyleSheet, Modal, TextInput } from "react-native";
import { useState } from "react";

import { useGlobalContext } from "../../context/GlobalProvider";
import { InfoBox } from "../../components";
import AssignmentButton from "../../components/ClassButton";

const Assignments = () => {
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
    setModalVisible(false);
  };

  const assignments = [
    {
      title: "Reflection Paper [Optional]",
      classTitle: "INTB1203 40039 Intl Bus and Social Resp SEC 01 Sum...",
      dueDate: "1:00 PM",
      classInfo: "Northeastern Edu"
    },
    {
      title: "Financial Report",
      classTitle: "FINA2201 30396 Financial Managemen...",
      dueDate: "3:00 PM",
      classInfo: "Canvas"
    },
    {
      title: "Project Submission",
      classTitle: "CS2510 30198 Fundamentals of Compu...",
      dueDate: "5:00 PM",
      classInfo: "Google Classroom"
    },
    {
      title: "Quiz 1",
      classTitle: "MATH2201 40198 Linear Algebra...",
      dueDate: "2:00 PM",
      classInfo: "Google Calendar"
    },
    {
      title: "Lab Report",
      classTitle: "PHYS1101 30199 Physics I...",
      dueDate: "6:00 PM",
      classInfo: "Apple Calendar"
    }
  ];

  return (
    <SafeAreaView style={{ backgroundColor: "#000", flex: 1 }}>
      <View style={{ paddingHorizontal: 30, paddingTop: 10 }}>
        <TouchableOpacity onPress={() => router.back()}>
          <View style={styles.backButton}>
            <Text style={{ fontSize: 24, color: '#fff' }}>{'<'}</Text>
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.header}>
        <InfoBox title='Add' containerStyles="mt-5" titleStyles="text-lg" />
        <InfoBox title='Sort' containerStyles="mt-5" titleStyles="text-lg" />
      </View>
      
      <FlatList
        ListHeaderComponent={() => (
          <View style={{ width: '100%', paddingHorizontal: 15 }}>
            {assignments.map((assignment, index) => (
              <AssignmentButton 
                key={index}
                title={`${assignment.classTitle}\n${assignment.title}\nDue: ${assignment.dueDate}`} 
                handlePress={() => handlePress(assignment.classInfo)} 
                containerStyles={{ marginTop: 5 }}
              />
            ))}
          </View>
        )}
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
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center'
  },
  header: {
    width: '100%', 
    justifyContent: 'space-between',
    flexDirection: 'row', 
    alignItems: 'center', 
    marginTop: 6,
    paddingHorizontal: 40
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
    width: '80%'
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
    fontWeight: 'bold'
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

export default Assignments;