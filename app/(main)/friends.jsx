import React, { useState, useCallback, useEffect } from 'react';
import { StyleSheet, View, TouchableOpacity, Text, FlatList, Modal, TextInput, Alert, RefreshControl, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';

import {
  getCurrentUser,
  sendFriendRequest,
  acceptFriendRequest,
  denyFriendRequest,
  removeFriend as removeFriendApi,
  searchUsers,
  client,
  appwriteConfig
} from "../../lib/appwrite";
import { useGlobalContext } from "../../context/GlobalProvider";
import { useFriends } from '../../context/FriendsContext';

const FriendItem = ({ friend, onRemove, onViewProfile, isRemoving }) => (
  <View style={styles.friendItem}>
    <TouchableOpacity onPress={() => onViewProfile(friend)} style={styles.friendInfo}>
      <Ionicons name="person-circle-outline" size={32} color="white" />
      <Text style={styles.friendName}>{friend.name}</Text>
    </TouchableOpacity>
    <TouchableOpacity onPress={() => onRemove(friend.friendId)} style={styles.removeButton} disabled={isRemoving}>
      {isRemoving ? (
        <ActivityIndicator size="small" color="white" />
      ) : (
        <View style={styles.removeButtonInner}>
          <Ionicons name="close-circle-outline" size={32} color="white" />
          <Text style={styles.removeButtonText}>Remove</Text>
        </View>
      )}
    </TouchableOpacity>
  </View>
);

const FriendRequestItem = ({ request, onAccept, onDeny, isProcessing }) => (
  <View style={styles.friendRequestItem}>
    <Text style={styles.friendRequestName}>
      {request.senderName || `User ${request.senderId.slice(0, 8)}`}
    </Text>
    <View style={styles.friendRequestButtons}>
      {isProcessing ? (
        <ActivityIndicator size="small" color="white" />
      ) : (
        <>
          <TouchableOpacity onPress={() => onAccept(request.$id)} style={styles.actionButton}>
            <Ionicons name="checkmark-circle-outline" size={32} color="green" />
            <Text style={styles.actionButtonText}>Accept</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => onDeny(request.$id)} style={styles.actionButton}>
            <Ionicons name="close-circle-outline" size={32} color="red" />
            <Text style={styles.actionButtonText}>Deny</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  </View>
);

const FriendsScreen = () => {
  const navigation = useNavigation();
  const { user } = useGlobalContext();
  const { friends, friendRequests, loading, fetchFriends, removeFriend, setFriendRequests } = useFriends();
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isProfileModalVisible, setIsProfileModalVisible] = useState(false);
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [isSubmitting, setSubmitting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [processingRequests, setProcessingRequests] = useState({});
  const [removingFriends, setRemovingFriends] = useState({});
  const [sendingRequest, setSendingRequest] = useState(false);


  const setupRealtimeSubscription = useCallback(() => {
    const subscription = client.subscribe([`databases.${appwriteConfig.databaseId}.collections.${appwriteConfig.friendsCollectionId}.documents`], (response) => {
      if (response.events.includes(`databases.${appwriteConfig.databaseId}.collections.${appwriteConfig.friendsCollectionId}.documents.*.delete`)) {
        const deletedFriendship = response.payload;
        if (deletedFriendship.userId === user.$id || deletedFriendship.friendId === user.$id) {
          removeFriend(deletedFriendship.friendId);
        }
      }
    });

    return () => {
      subscription();
    };
  }, [user, removeFriend]);

  useEffect(() => {
    const unsubscribe = setupRealtimeSubscription();
    return unsubscribe;
  }, [setupRealtimeSubscription]);

  useFocusEffect(
    useCallback(() => {
      if (user) {
        fetchFriends(user.$id);
      }
    }, [fetchFriends, user])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchFriends(user.$id).then(() => setRefreshing(false));
  }, [fetchFriends, user]);

  const handleSearch = useCallback(async () => {
    if (searchTerm.trim() === "") {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const results = await searchUsers(searchTerm);
      setSearchResults(results);
    } catch (error) {
      console.error("Error searching users:", error);
      Alert.alert("Error", "Failed to search users. Please try again.");
    } finally {
      setIsSearching(false);
    }
  }, [searchTerm]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchTerm.trim() !== "") {
        handleSearch();
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, handleSearch]);

  const handleSendFriendRequest = async (selectedUser) => {
    setSendingRequest(true);

    try {
      await sendFriendRequest(user.$id, selectedUser.email);
      setSearchTerm('');
      setSearchResults([]);
      setIsAddModalVisible(false);
      Alert.alert("Success", "Friend request sent successfully");
    } catch (error) {
      console.error("Error sending friend request:", error);
      Alert.alert("Error", error.message || "Failed to send friend request. Please try again.");
    } finally {
      setSendingRequest(false);
    }
  };

  const handleAcceptFriendRequest = async (requestId) => {
    setProcessingRequests(prev => ({ ...prev, [requestId]: true }));
    try {
      await acceptFriendRequest(user.$id, requestId);
      fetchFriends(user.$id);
      Alert.alert("Success", "Friend request accepted");
    } catch (error) {
      console.error("Error accepting friend request:", error);
      Alert.alert("Error", "Failed to accept friend request. Please try again.");
    } finally {
      setProcessingRequests(prev => ({ ...prev, [requestId]: false }));
    }
  };

  const handleDenyFriendRequest = async (requestId) => {
    setProcessingRequests(prev => ({ ...prev, [requestId]: true }));
    try {
      await denyFriendRequest(user.$id, requestId);
      setFriendRequests(prev => prev.filter(request => request.$id !== requestId));
      Alert.alert("Success", "Friend request denied");
    } catch (error) {
      console.error("Error denying friend request:", error);
      Alert.alert("Error", "Failed to deny friend request. Please try again.");
    } finally {
      setProcessingRequests(prev => ({ ...prev, [requestId]: false }));
    }
  };

  const handleRemoveFriend = async (friendId) => {
    setRemovingFriends(prev => ({ ...prev, [friendId]: true }));
    try {
      await removeFriendApi(user.$id, friendId);
      removeFriend(friendId);
      Alert.alert("Success", "Friend removed successfully");
    } catch (error) {
      console.error("Error removing friend:", error);
      Alert.alert("Error", "Failed to remove friend. Please try again.");
    } finally {
      setRemovingFriends(prev => ({ ...prev, [friendId]: false }));
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
          <Ionicons name="chevron-back" size={32} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Friends</Text>
        <TouchableOpacity onPress={() => setIsAddModalVisible(true)} style={styles.addButton}>
          <Ionicons name="add-circle-outline" size={40} color="white" />
        </TouchableOpacity>
      </View>

      {friendRequests.length > 0 && (
        <View style={styles.friendRequestsSection}>
          <Text style={styles.sectionTitle}>Friend Requests</Text>
          <FlatList
            data={friendRequests}
            renderItem={({ item }) => (
              <FriendRequestItem
                key={item.$id}
                request={item}
                onAccept={handleAcceptFriendRequest}
                onDeny={handleDenyFriendRequest}
                isProcessing={processingRequests[item.$id]}
              />
            )}
            keyExtractor={item => item.$id}
            horizontal
            showsHorizontalScrollIndicator={false}
          />
        </View>
      )}

      <Text style={styles.sectionTitle}>My Friends</Text>
      <FlatList
        data={friends}
        renderItem={({ item }) => (
          <FriendItem
            key={item.$id}
            friend={item}
            onRemove={handleRemoveFriend}
            onViewProfile={viewProfile}
            isRemoving={removingFriends[item.friendId]}
          />
        )}
        keyExtractor={item => item.$id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />

      <Modal
        visible={isAddModalVisible}
        transparent={true}
        animationType="slide"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Find Friends</Text>
            <TextInput
              style={styles.input}
              placeholder="Search by username or email"
              placeholderTextColor="#999"
              value={searchTerm}
              onChangeText={setSearchTerm}
              autoCapitalize="none"
            />
            {isSearching ? (
              <ActivityIndicator size="large" color="white" />
            ) : (
              <FlatList
                data={searchResults}
                keyExtractor={(item) => item.$id}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.searchResultItem}
                    onPress={() => handleSendFriendRequest(item)}
                    disabled={sendingRequest}
                  >
                    <Text style={styles.searchResultText}>{item.username} ({item.email})</Text>
                    {sendingRequest ? (
                      <ActivityIndicator size="small" color="white" />
                    ) : (
                      <Ionicons name="add-circle-outline" size={32} color="white" />
                    )}
                  </TouchableOpacity>
                )}
                style={styles.searchResultsList}
                ListEmptyComponent={
                  searchTerm.trim() !== "" && (
                    <Text style={styles.noResultsText}>No users found</Text>
                  )
                }
              />
            )}
            <TouchableOpacity onPress={() => setIsAddModalVisible(false)} style={styles.modalButton}>
              <Text style={styles.modalButtonText}>Cancel</Text>
            </TouchableOpacity>
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
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 20,
    marginTop: 20,
    marginBottom: 10,
  },
  friendRequestsSection: {
    marginBottom: 20,
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
  friendRequestItem: {
    flexDirection: 'column',
    backgroundColor: '#333333',
    borderRadius: 10,
    padding: 15,
    marginRight: 10,
    width: 250,
  },
  friendInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  friendName: {
    color: 'white',
    fontSize: 18,
    marginLeft: 10,
  },
  friendRequestName: {
    color: 'white',
    fontSize: 18,
    marginBottom: 10,
  },
  friendRequestButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  acceptButton: {
    marginRight: 10,
  },
  removeButton: {
    marginLeft: 10,
  },
  removeButtonInner: {
    flexDirection: 'column',
    alignItems: 'center',
  },
  removeButtonText: {
    color: 'white',
    marginTop: 5,
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
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 20,
  },
  modalButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
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
  searchResultsList: {
    maxHeight: 200,
    width: '100%',
    marginBottom: 15,
  },
  searchResultItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#444',
  },
  searchResultText: {
    color: 'white',
    fontSize: 16,
    flex: 1,
  },
  noResultsText: {
    color: 'white',
    textAlign: 'center',
    marginTop: 10,
  },
  actionButton: {
    flexDirection: 'column',
    alignItems: 'center',
    padding: 10,
  },
  actionButtonText: {
    color: 'white',
    marginTop: 5,
  },
});

export default FriendsScreen;