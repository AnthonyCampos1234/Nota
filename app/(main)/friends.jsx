import React, { useState, useCallback, useRef } from 'react';
import { StyleSheet, View, TouchableOpacity, Text, FlatList, Modal, TextInput, Alert, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';

import { getCurrentUser, getFriends, addFriend, removeFriend } from "../../lib/appwrite";
import { useGlobalContext } from "../../context/GlobalProvider";

const FriendItem = ({ friend, onRemove, onViewProfile }) => (
  <View style={styles.friendItem}>
    <TouchableOpacity onPress={() => onViewProfile(friend)} style={styles.friendInfo}>
      <Ionicons name="person-circle-outline" size={24} color="white" />
      <Text style={styles.friendName}>{friend.name}</Text>
    </TouchableOpacity>
    <TouchableOpacity onPress={() => onRemove(friend.friendId)} style={styles.removeButton}>
      <Ionicons name="close-circle-outline" size={24} color="white" />
    </TouchableOpacity>
  </View>
);

const FriendsScreen = () => {
  const navigation = useNavigation();
  const { user } = useGlobalContext();
  const [friends, setFriends] = useState([]);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [newFriendEmail, setNewFriendEmail] = useState('');
  const [isProfileModalVisible, setIsProfileModalVisible] = useState(false);
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [isSubmitting, setSubmitting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const pageSize = 20; // Number of friends to load per page

  const friendsCache = useRef(new Map());

  const fetchFriends = useCallback(async (refresh = false) => {
    if (loading) return;

    setLoading(true);
    try {
      const currentUser = await getCurrentUser();
      if (!currentUser) throw new Error("No user logged in");

      const newPage = refresh ? 0 : page;
      const cachedFriends = friendsCache.current.get(newPage);

      if (cachedFriends && !refresh) {
        setFriends(prevFriends => refresh ? cachedFriends : [...prevFriends, ...cachedFriends]);
        setLoading(false);
        return;
      }

      const friendsList = await getFriends(currentUser.$id, pageSize, newPage * pageSize);
      friendsCache.current.set(newPage, friendsList);

      setFriends(prevFriends => refresh ? friendsList : [...prevFriends, ...friendsList]);
      setPage(newPage + 1);
    } catch (error) {
      console.error("Error fetching friends:", error);
      Alert.alert("Error", "Failed to fetch friends. Please try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [loading, page]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setPage(0);
    friendsCache.current.clear();
    fetchFriends(true);
  }, [fetchFriends]);

  useFocusEffect(
    useCallback(() => {
      if (friends.length === 0) {
        fetchFriends();
      }
    }, [fetchFriends, friends.length])
  );

  const handleAddFriend = async () => {
    if (newFriendEmail.trim() === "") {
      Alert.alert("Error", "Please enter a valid email");
      return;
    }

    setSubmitting(true);

    try {
      const currentUser = await getCurrentUser();
      if (!currentUser) throw new Error("No user logged in");

      await addFriend(currentUser.$id, newFriendEmail);
      setNewFriendEmail('');
      setIsAddModalVisible(false);
      onRefresh(); // Refresh the friends list
      Alert.alert("Success", "Friend added successfully");
    } catch (error) {
      console.error("Error adding friend:", error);
      Alert.alert("Error", error.message || "Failed to add friend. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemoveFriend = async (friendId) => {
    try {
      const currentUser = await getCurrentUser();
      if (!currentUser) throw new Error("No user logged in");

      await removeFriend(currentUser.$id, friendId);
      onRefresh(); // Refresh the friends list
      Alert.alert("Success", "Friend removed successfully");
    } catch (error) {
      console.error("Error removing friend:", error);
      Alert.alert("Error", "Failed to remove friend. Please try again.");
    }
  };

  const viewProfile = (friend) => {
    setSelectedFriend(friend);
    setIsProfileModalVisible(true);
  };

  const renderGPA = (friend) => {
    if (friend.gpaVisibility === 'public' || friend.gpaVisibility === 'friends') {
      return <Text style={styles.gpa}>GPA: {friend.gpa?.toFixed(2) || 'N/A'}</Text>;
    }
    return <Text style={styles.gpa}>GPA: Hidden</Text>;
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topSection}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Friends</Text>
        <TouchableOpacity onPress={() => setIsAddModalVisible(true)} style={styles.addButton}>
          <Ionicons name="add-circle-outline" size={32} color="white" />
        </TouchableOpacity>
      </View>
      <FlatList
        data={friends}
        renderItem={({ item }) => (
          <FriendItem
            friend={item}
            onRemove={handleRemoveFriend}
            onViewProfile={viewProfile}
          />
        )}
        keyExtractor={item => item.$id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        onEndReached={() => fetchFriends()}
        onEndReachedThreshold={0.1}
      />

      <Modal
        visible={isAddModalVisible}
        transparent={true}
        animationType="slide"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add New Friend</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter friend's email"
              placeholderTextColor="#999"
              value={newFriendEmail}
              onChangeText={setNewFriendEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity onPress={() => setIsAddModalVisible(false)} style={styles.modalButton}>
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleAddFriend} style={[styles.modalButton, isSubmitting && styles.disabledButton]} disabled={isSubmitting}>
                <Text style={styles.modalButtonText}>{isSubmitting ? 'Adding...' : 'Add'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={isProfileModalVisible}
        transparent={true}
        animationType="slide"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{selectedFriend?.name}</Text>
            {selectedFriend && renderGPA(selectedFriend)}
            <TouchableOpacity onPress={() => setIsProfileModalVisible(false)} style={styles.modalButton}>
              <Text style={styles.modalButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    color: 'white',
    fontSize: 28,
    fontWeight: 'bold',
    paddingRight: 15,
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
  friendInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  friendName: {
    color: 'white',
    fontSize: 16,
    marginLeft: 10,
  },
  removeButton: {
    marginLeft: 10,
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
    alignItems: 'center',
  },
  modalTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  input: {
    backgroundColor: '#444',
    color: 'white',
    width: '100%',
    padding: 10,
    borderRadius: 5,
    marginBottom: 15,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  modalButton: {
    backgroundColor: '#555',
    padding: 10,
    borderRadius: 5,
    width: '45%',
    alignItems: 'center',
  },
  modalButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  gpa: {
    color: 'white',
    fontSize: 16,
    marginTop: 10,
    marginBottom: 15,
  },
  disabledButton: {
    opacity: 0.5,
  },
});

export default FriendsScreen;