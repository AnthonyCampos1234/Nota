import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

const ClassItem = ({ item }) => (
  <View style={styles.classItem}>
    <View style={[styles.colorDot, { backgroundColor: item.color }]} />
    <View style={styles.classContent}>
      <Text style={styles.classTitle} numberOfLines={1}>{item.title}</Text>
      <Text style={styles.classGrade}>{item.grade}</Text>
    </View>
  </View>
);

const GPAScreen = () => {
  const navigation = useNavigation();
  const classes = [
    { id: '1', title: 'CS2510 30198 Fundamentals of Computer Science 2 SEC 01', grade: 'B+', color: '#FFFF00' },
    { id: '2', title: 'FINA2201 30396 Financial Management SEC 01', grade: 'A+', color: '#00FF00' },
    { id: '3', title: 'CS3500 40039 Object-Oriented Design SEC 01', grade: 'C', color: '#FF0000' },
    { id: '4', title: 'MATH2331 31477 Linear Algebra SEC 02', grade: 'D-', color: '#00FFFF' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topSection}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>{'<'}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>GPA</Text>
        <View style={styles.placeholder} />
      </View>
      <View style={styles.gpaSection}>
        <Text style={styles.gpa}>3.01</Text>
        <Text style={styles.gpaSubtitle}>*Rounded</Text>
      </View>
      <View style={styles.controls}>
        <TouchableOpacity style={styles.controlButton}>
          <Text style={styles.controlText}>Semester ⌄</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.controlButton}>
          <Text style={styles.controlText}>Sort ↕</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={classes}
        renderItem={({ item }) => <ClassItem item={item} />}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
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
    fontSize: 90,
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
  classGrade: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
});

export default GPAScreen;