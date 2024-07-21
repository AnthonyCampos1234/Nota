import React from 'react';
import { StyleSheet, View, TouchableOpacity, Text, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const friendsList = [
  { id: '1', name: 'Anthony Campos' },
  { id: '2', name: 'Tim Tran' },
  { id: '3', name: 'Johnny Ram' },
  { id: '4', name: 'Bob Comb' },
  { id: '5', name: 'Randy Warhol' },
  { id: '6', name: 'Ella Maven' },
  { id: '7', name: 'Barack Obama' },
  { id: '8', name: 'Donald Trump' },
  { id: '9', name: 'Penny Wise' },
  { id: '10', name: 'Jimmy Crickets' },
];

const FriendItem = ({ name }) => (
  <View style={styles.friendItem}>
    <Ionicons name="person-circle-outline" size={24} color="white" />
    <Text style={styles.friendName}>{name}</Text>
  </View>
);

const FriendsScreen = () => {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topSection}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Friends</Text>
        <TouchableOpacity style={styles.addButton}>
          <Ionicons name="add-circle-outline" size={32} color="white" />
        </TouchableOpacity>
      </View>
      <FlatList
        data={friendsList}
        renderItem={({ item }) => <FriendItem name={item.name} />}
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
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    color: 'white',
    fontSize: 28,
    fontWeight: 'bold',
  },
  addButton: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    paddingHorizontal: 20,
  },
  friendItem: {
    flexDirection: 'row',
    backgroundColor: '#333333',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    alignItems: 'center',
  },
  friendName: {
    color: 'white',
    fontSize: 16,
    marginLeft: 10,
  },
});

export default FriendsScreen;