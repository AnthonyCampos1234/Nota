import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const AssignmentItem = ({ item }) => (
  <View style={styles.assignmentItem}>
    <View style={[styles.colorDot, { backgroundColor: item.color }]} />
    <View style={styles.assignmentContent}>
      <Text style={styles.classTitle} numberOfLines={1}>{item.classTitle}</Text>
      <Text style={styles.assignmentTitle}>{item.title}</Text>
      <Text style={styles.dueDate}>Due: {item.dueDate}</Text>
    </View>
  </View>
);

const AssignmentsScreen = () => {
  const navigation = useNavigation();
  const [assignments, setAssignments] = useState([
    {
      id: '1',
      classTitle: 'INTB1203 40039 Intl Bus and Social Resp SEC 01 Sum...',
      title: 'Reflection Paper[Optional]',
      dueDate: '1:00 PM',
      color: '#FF0000'
    },
    {
      id: '2',
      classTitle: 'CS 3500 Summer 1 2024 (Boston)',
      title: 'Assignment 6: Stocks (Part 3)',
      dueDate: '6:00 PM',
      color: '#00FF00'
    },
    {
      id: '3',
      classTitle: 'FINA2201 30396 Financial Management SEC 01 Sprin...',
      title: 'Time Value of Money 1',
      dueDate: '3 days',
      color: '#00FFFF'
    },
    {
      id: '4',
      classTitle: 'INTB1203 40039 Intl Bus and Social Resp SEC 01 Sum...',
      title: 'Firm Strategy Presentation a...',
      dueDate: '1 week',
      color: '#FF0000'
    },
    {
      id: '5',
      classTitle: 'ENGW1111 11477 First-Year Writing SEC 39 Fall 2023 ...',
      title: 'Draft 1: Exploratory Essay',
      dueDate: '3 weeks',
      color: '#0000FF'
    },
    {
      id: '6',
      classTitle: 'ECON1126 32556 Recitation for ECON 1116 SEC 01 Sp...',
      title: 'Lab 4: Understanding Econo...',
      dueDate: '1 month',
      color: '#FF00FF'
    },
    {
      id: '7',
      classTitle: 'CS2510 30198 Fundamentals of Computer Sci 2 SEC 0...',
      title: 'Assignment 4: Clock (Part 1)',
      dueDate: '2 months',
      color: '#FFFF00'
    },
  ]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topSection}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>{'<'}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Assignments</Text>
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
        data={assignments}
        renderItem={({ item }) => <AssignmentItem item={item} />}
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
});

export default AssignmentsScreen;