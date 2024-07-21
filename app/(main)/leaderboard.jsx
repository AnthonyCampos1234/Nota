import React from 'react';
import { SafeAreaView, View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const leaderboardData = [
  { name: 'Anthony Campos', gpa: 4.00, medal: 'gold' },
  { name: 'Tim Tran', gpa: 4.00, medal: 'gold' },
  { name: 'Johnny Ram', gpa: 3.98, medal: 'bronze' },
  { name: 'Bob Comb', gpa: 3.95 },
  { name: 'Randy Warhol', gpa: 3.94 },
  { name: 'Ella Maven', gpa: 3.91 },
  { name: 'Barack Obama', gpa: 3.87 },
  { name: 'Donald Trump', gpa: 3.82 },
  { name: 'Penny Wise', gpa: 3.52 },
  { name: 'Jimmy Crickets', gpa: 3.51 },
];

const Leaderboard = () => {
  const navigation = useNavigation();

  const renderItem = ({ item, index }) => (
    <View style={styles.item}>
      {item.medal && (
        <Text style={styles.medal}>
          {item.medal === 'gold' ? '🥇' : item.medal === 'silver' ? '🥈' : '🥉'}
        </Text>
      )}
      <Text style={styles.name}>{item.name}</Text>
      <Text style={styles.gpa}>{item.gpa.toFixed(2)}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topSection}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>{'<'}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Northeastern University</Text>
        <View style={styles.placeholder} />
      </View>
      <FlatList
        data={leaderboardData}
        renderItem={renderItem}
        keyExtractor={(item) => item.name}
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
  listContainer: {
    paddingHorizontal: 20,
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    marginBottom: 10,
    backgroundColor: '#333',
    borderRadius: 10,
  },
  medal: {
    fontSize: 20,
    marginRight: 10,
  },
  name: {
    flex: 1,
    color: 'white',
    fontSize: 16,
  },
  gpa: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default Leaderboard;