import React, { useState, useCallback, useEffect } from 'react';
import { StyleSheet, View, TouchableOpacity, Text, FlatList, Modal, TextInput, Alert, RefreshControl, ActivityIndicator, Dimensions } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';

import {
  getCurrentUser,
  sendFriendRequest,
  acceptFriendRequest,
  denyFriendRequest,
  removeFriend as removeFriendApi,
  searchUsers,
  client,
  appwriteConfig,
} from "../../lib/appwrite";
import { useGlobalContext } from "../../context/GlobalProvider";
import { useFriends } from '../../context/FriendsContext';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

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

const gradientColors = [
  [colors.gradientStart, colors.gradientMiddle1, colors.gradientMiddle2, colors.gradientEnd],
  [colors.secondary, colors.quaternary],
  [colors.tertiary, colors.accent],
];

const FriendItem = ({ friend, onRemove, onViewProfile, isRemoving }) => (
  <LinearGradient
    colors={gradientColors[2]}
    start={{ x: 0, y: 0 }}
    end={{ x: 1, y: 1 }}
    style={styles.friendItem}
  >
    <TouchableOpacity onPress={() => onViewProfile(friend)} style={styles.friendInfo}>
      <Ionicons name="person-circle-outline" size={32} color={colors.text} />
      <Text style={styles.friendName}>{friend.name}</Text>
    </TouchableOpacity>
    <TouchableOpacity onPress={() => onRemove(friend.friendId)} style={styles.removeButton} disabled={isRemoving}>
      {isRemoving ? (
        <ActivityIndicator size="small" color={colors.text} />
      ) : (
        <View style={styles.removeButtonInner}>
          <Ionicons name="close-circle-outline" size={32} color={colors.text} />
          <Text style={styles.removeButtonText}>Remove</Text>
        </View>
      )}
    </TouchableOpacity>
  </LinearGradient>
);

const FriendRequestItem = ({ request, onAccept, onDeny, isProcessing }) => (
  <LinearGradient
    colors={gradientColors[1]}
    start={{ x: 0, y: 0 }}
    end={{ x: 1, y: 1 }}
    style={styles.friendRequestItem}
  >
    <Text style={styles.friendRequestName}>
      {request.senderName || `User ${request.senderId.slice(0, 8)}`}
    </Text>
    <View style={styles.friendRequestButtons}>
      {isProcessing ? (
        <ActivityIndicator size="small" color={colors.text} />
      ) : (
        <>
          <TouchableOpacity onPress={() => onAccept(request.$id)} style={styles.actionButton}>
            <Ionicons name="checkmark-circle-outline" size={32} color={colors.tertiary} />
            <Text style={styles.actionButtonText}>Accept</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => onDeny(request.$id)} style={styles.actionButton}>
            <Ionicons name="close-circle-outline" size={32} color={colors.accent} />
            <Text style={styles.actionButtonText}>Deny</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  </LinearGradient>
);

const FriendsScreen = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
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
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSendingRequest(true);

    try {
      await sendFriendRequest(user.$id, selectedUser.email);
      setSearchTerm('');
      setSearchResults([]);
      setIsAddModalVisible(false);
      Alert.alert("Success", "Friend request sent successfully");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error("Error sending friend request:", error);
      Alert.alert("Error", error.message || "Failed to send friend request. Please try again.");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setSendingRequest(false);
    }
  };

  const handleAcceptFriendRequest = async (requestId) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setProcessingRequests(prev => ({ ...prev, [requestId]: true }));
    try {
      await acceptFriendRequest(user.$id, requestId);
      fetchFriends(user.$id);
      Alert.alert("Success", "Friend request accepted");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error("Error accepting friend request:", error);
      Alert.alert("Error", "Failed to accept friend request. Please try again.");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setProcessingRequests(prev => ({ ...prev, [requestId]: false }));
    }
  };

  const handleDenyFriendRequest = async (requestId) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setProcessingRequests(prev => ({ ...prev, [requestId]: true }));
    try {
      await denyFriendRequest(user.$id, requestId);
      setFriendRequests(prev => prev.filter(request => request.$id !== requestId));
      Alert.alert("Success", "Friend request denied");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error("Error denying friend request:", error);
      Alert.alert("Error", "Failed to deny friend request. Please try again.");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setProcessingRequests(prev => ({ ...prev, [requestId]: false }));
    }
  };

  const handleRemoveFriend = async (friendId) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setRemovingFriends(prev => ({ ...prev, [friendId]: true }));
    try {
      await removeFriendApi(user.$id, friendId);
      removeFriend(friendId);
      Alert.alert("Success", "Friend removed successfully");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error("Error removing friend:", error);
      Alert.alert("Error", "Failed to remove friend. Please try again.");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setRemovingFriends(prev => ({ ...prev, [friendId]: false }));
    }
  };

  const renderGPA = (friend) => {
    if (!friend.gpa || !friend.gpaVisibility) {
      return <Text style={styles.gpa}>GPA: Not available</Text>;
    }

    switch (friend.gpaVisibility) {
      case 'public':
        return <Text style={styles.gpa}>GPA: {friend.gpa.toFixed(2)}</Text>;
      case 'friends':
        // Assuming the user viewing this is already a friend
        return <Text style={styles.gpa}>GPA: {friend.gpa.toFixed(2)}</Text>;
      case 'private':
      default:
        return <Text style={styles.gpa}>GPA: Private</Text>;
    }
  };

  const viewProfile = (friend) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.medium);
    setSelectedFriend(friend);
    setIsProfileModalVisible(true);
  };

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <LinearGradient
        colors={gradientColors[0]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientBackground}
      >
        <View style={[styles.topSection, { paddingTop: insets.top }]}>
          <TouchableOpacity
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              navigation.goBack();
            }}
            style={styles.backButton}
          >
            <Ionicons name="chevron-back" size={32} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Friends</Text>
          <TouchableOpacity
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.medium);
              setIsAddModalVisible(true);
            }}
            style={styles.addButton}
          >
            <Ionicons name="add-circle-outline" size={40} color={colors.text} />
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
            <LinearGradient
              colors={gradientColors[1]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.modalContent}
            >
              <Text style={styles.modalTitle}>Find Friends</Text>
              <TextInput
                style={styles.input}
                placeholder="Search by username or email"
                placeholderTextColor={colors.textSecondary}
                value={searchTerm}
                onChangeText={setSearchTerm}
                autoCapitalize="none"
              />
              {isSearching ? (
                <ActivityIndicator size="large" color={colors.text} />
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
                        <ActivityIndicator size="small" color={colors.text} />
                      ) : (
                        <Ionicons name="add-circle-outline" size={32} color={colors.text} />
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
              <TouchableOpacity
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.medium);
                  setIsAddModalVisible(false);
                }}
                style={styles.modalButton}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
            </LinearGradient>
          </View>
        </Modal>

        <Modal
          visible={isProfileModalVisible}
          transparent={true}
          animationType="slide"
        >
          <View style={styles.modalContainer}>
            <LinearGradient
              colors={gradientColors[2]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.modalContent}
            >
              <Text style={styles.modalTitle}>{selectedFriend?.name}</Text>
              {selectedFriend && renderGPA(selectedFriend)}
              <TouchableOpacity
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.medium);
                  setIsProfileModalVisible(false);
                }}
                style={styles.modalButton}
              >
                <Text style={styles.modalButtonText}>Close</Text>
              </TouchableOpacity>
            </LinearGradient>
          </View>
        </Modal>
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
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 15,
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
    color: colors.text,
    fontSize: 28,
    fontWeight: 'bold',
  },
  addButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionTitle: {
    color: colors.text,
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
    paddingBottom: 20,
  },
  friendItem: {
    flexDirection: 'row',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    alignItems: 'center',
  },
  friendRequestItem: {
    flexDirection: 'column',
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
    color: colors.text,
    fontSize: 18,
    marginLeft: 10,
  },
  friendRequestName: {
    color: colors.text,
    fontSize: 18,
    marginBottom: 10,
  },
  friendRequestButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  removeButton: {
    marginLeft: 10,
  },
  removeButtonInner: {
    flexDirection: 'column',
    alignItems: 'center',
  },
  removeButtonText: {
    color: colors.text,
    marginTop: 5,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    borderRadius: 15,
    padding: 20,
    width: '80%',
    alignItems: 'center',
  },
  modalTitle: {
    color: colors.text,
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    color: colors.text,
    width: '100%',
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
    fontSize: 16,
  },
  modalButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
    width: '100%',
  },
  modalButtonText: {
    color: colors.text,
    fontWeight: 'bold',
    fontSize: 16,
  },
  gpa: {
    color: colors.text,
    fontSize: 18,
    marginTop: 10,
    marginBottom: 15,
  },
  searchResultsList: {
    maxHeight: SCREEN_HEIGHT * 0.3,
    width: '100%',
    marginBottom: 15,
  },
  searchResultItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  searchResultText: {
    color: colors.text,
    fontSize: 16,
    flex: 1,
  },
  noResultsText: {
    color: colors.text,
    textAlign: 'center',
    marginTop: 10,
    fontSize: 16,
  },
  actionButton: {
    flexDirection: 'column',
    alignItems: 'center',
    padding: 10,
  },
  actionButtonText: {
    color: colors.text,
    marginTop: 5,
    fontSize: 14,
  },
});

export default FriendsScreen;