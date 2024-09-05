import React, { useState, useCallback, useEffect, useRef } from 'react';
import { StyleSheet, View, TouchableOpacity, Text, FlatList, Modal, TextInput, Alert, RefreshControl, ActivityIndicator, Dimensions, Animated, StatusBar } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { BlurView } from 'expo-blur';
import { router, useFocusEffect } from "expo-router";

import {
  getCurrentUser,
  getFriendRequests,
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
const HEADER_MAX_HEIGHT = 200;
const HEADER_MIN_HEIGHT = 100;

const colors = {
  background: '#000000',
  card: '#1A1A1A',
  accent: '#FF385C',
  text: '#FFFFFF',
  subtext: '#A0A0A0',
  border: '#333333',
  gradient: ['#FF385C', '#FF1493'],
  secondary: '#4A90E2',
  tertiary: '#50C878',
  quaternary: '#9B59B6',
};

const gradientColors = [
  [colors.background, colors.card],
  colors.gradient,
  [colors.secondary, colors.quaternary],
];

const Header = ({ scrollY, insets, onBackPress, onAddPress }) => {
  const headerHeight = scrollY.interpolate({
    inputRange: [0, HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT],
    outputRange: [HEADER_MAX_HEIGHT, HEADER_MIN_HEIGHT],
    extrapolate: 'clamp',
  });

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, (HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT) / 2, HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT],
    outputRange: [1, 1, 0],
    extrapolate: 'clamp',
  });

  const miniHeaderOpacity = scrollY.interpolate({
    inputRange: [0, HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  return (
    <Animated.View style={[styles.header, { height: headerHeight }]}>
      <BlurView intensity={50} tint="dark" style={StyleSheet.absoluteFill} />
      <Animated.View style={[styles.headerContent, { opacity: headerOpacity, paddingTop: insets.top }]}>
        <View style={styles.headerTopRow}>
          <TouchableOpacity onPress={onBackPress} style={styles.backButton}>
            <Ionicons name="chevron-back" size={28} color={colors.text} />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>Friends</Text>
          </View>
          <TouchableOpacity onPress={onAddPress} style={styles.addButton}>
            <Ionicons name="add-circle-outline" size={32} color={colors.text} />
          </TouchableOpacity>
        </View>
        <Text style={styles.headerSubtitle}>Connect with your peers</Text>
      </Animated.View>
      <Animated.View style={[styles.miniHeader, { opacity: miniHeaderOpacity, paddingTop: insets.top }]}>
        <View style={styles.miniHeaderContent}>
          <TouchableOpacity onPress={onBackPress} style={styles.miniBackButton}>
            <Ionicons name="chevron-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.miniHeaderTitle}>Friends</Text>
          <TouchableOpacity onPress={onAddPress} style={styles.miniAddButton}>
            <Ionicons name="add-circle-outline" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>
      </Animated.View>
    </Animated.View>
  );
};

const FriendsScreen = () => {
  const insets = useSafeAreaInsets();
  const scrollY = useRef(new Animated.Value(0)).current;
  const { user } = useGlobalContext();
  const { friends, friendRequests, loading, fetchFriends, removeFriend, setFriendRequests } = useFriends();
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isProfileModalVisible, setIsProfileModalVisible] = useState(false);
  const [selectedFriend, setSelectedFriend] = useState(null);
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
        fetchFriendRequests(user.$id);
      }
    }, [fetchFriends, user])
  );

  const fetchFriendRequests = async (userId) => {
    try {
      const requests = await getFriendRequests(userId);
      console.log("Friend requests fetched:", requests);
      setFriendRequests(requests);
    } catch (error) {
      console.error("Error fetching friend requests:", error);
    }
  };

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

  const handleBackPress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.back();
  }, []);

  const handleAddPress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsAddModalVisible(true);
  }, []);

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
    if (!friend.currentGPA || !friend.cumulativeGPA || !friend.gpaVisibility) {
      return <Text style={styles.gpa}>GPA: Not available</Text>;
    }

    switch (friend.gpaVisibility) {
      case 'Public':
        return (
          <Text style={styles.gpa}>
            Current GPA: {friend.currentGPA.toFixed(2)},
            Cumulative GPA: {friend.cumulativeGPA.toFixed(2)}
          </Text>
        );
      case 'Friends':
        // Assuming the user viewing this is already a friend
        return (
          <Text style={styles.gpa}>
            Current GPA: {friend.currentGPA.toFixed(2)},
            Cumulative GPA: {friend.cumulativeGPA.toFixed(2)}
          </Text>
        );
      case 'Private':
      default:
        return <Text style={styles.gpa}>GPA: Private</Text>;
    }
  };

  const viewProfile = (friend) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.medium);
    setSelectedFriend(friend);
    setIsProfileModalVisible(true);
  };

  const renderFriendItem = ({ item }) => (
    <FriendItem
      friend={item}
      onRemove={handleRemoveFriend}
      onViewProfile={viewProfile}
      isRemoving={removingFriends[item.friendId]}
    />
  );

  const renderFriendRequestItem = ({ item }) => (
    <FriendRequestItem
      request={item}
      onAccept={handleAcceptFriendRequest}
      onDeny={handleDenyFriendRequest}
      isProcessing={processingRequests[item.$id]}
    />
  );

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <StatusBar barStyle="light-content" />
      <Header
        scrollY={scrollY}
        insets={insets}
        onBackPress={handleBackPress}
        onAddPress={handleAddPress}
      />
      <Animated.FlatList
        data={friends}
        renderItem={renderFriendItem}
        keyExtractor={item => item.$id}
        contentContainerStyle={[
          styles.listContainer,
          { paddingTop: HEADER_MAX_HEIGHT, paddingBottom: insets.bottom + 20 }
        ]}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        ListHeaderComponent={() => (
          <>
            {friendRequests.length > 0 && (
              <View style={styles.friendRequestsSection}>
                <Text style={styles.sectionTitle}>Friend Requests</Text>
                <FlatList
                  data={friendRequests}
                  renderItem={renderFriendRequestItem}
                  keyExtractor={item => item.$id}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                />
              </View>
            )}
            <Text style={styles.sectionTitle}>My Friends</Text>
          </>
        )}
      />

      <Modal
        visible={isAddModalVisible}
        transparent={true}
        animationType="slide"
      >
        <View style={styles.modalContainer}>
          <BlurView intensity={100} tint="dark" style={styles.modalBlur}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Find Friends</Text>
              <TextInput
                style={styles.input}
                placeholder="Search by username or email"
                placeholderTextColor={colors.subtext}
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
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  setIsAddModalVisible(false);
                }}
                style={styles.modalButton}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </BlurView>
        </View>
      </Modal>

      <Modal
        visible={isProfileModalVisible}
        transparent={true}
        animationType="slide"
      >
        <View style={styles.modalContainer}>
          <BlurView intensity={100} tint="dark" style={styles.modalBlur}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>{selectedFriend?.name}</Text>
              {selectedFriend && renderGPA(selectedFriend)}
              <TouchableOpacity
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  setIsProfileModalVisible(false);
                }}
                style={styles.modalButton}
              >
                <Text style={styles.modalButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </BlurView>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1,
    backgroundColor: 'transparent',
  },
  headerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.text,
  },
  headerSubtitle: {
    fontSize: 16,
    color: colors.subtext,
    textAlign: 'center',
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  miniHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: HEADER_MIN_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  miniHeaderContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  miniBackButton: {
    marginRight: 15,
  },
  miniHeaderTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  miniAddButton: {
    marginLeft: 15,
  },
  listContainer: {
    paddingHorizontal: 20,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
  },
  friendRequestsSection: {
    marginBottom: 20,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBlur: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 20,
    width: '80%',
    maxWidth: 400,
  },
  modalTitle: {
    color: colors.text,
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
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
    backgroundColor: colors.accent,
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
    color: colors.subtext,
    textAlign: 'center',
    marginTop: 10,
    fontSize: 16,
  },
  friendItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
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
  friendRequestItem: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 15,
    marginRight: 10,
    width: 250,
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
  removeButton: {
    backgroundColor: colors.accent,
    borderRadius: 8,
    padding: 8,
  },
  removeButtonText: {
    color: colors.text,
    fontWeight: 'bold',
  },
  gpa: {
    color: colors.text,
    fontSize: 18,
    marginTop: 10,
    marginBottom: 15,
    textAlign: 'center',
  },
});

const FriendItem = ({ friend, onRemove, onViewProfile, isRemoving }) => (
  <TouchableOpacity onPress={() => onViewProfile(friend)} style={styles.friendItem}>
    <View style={styles.friendInfo}>
      <Ionicons name="person-circle-outline" size={32} color={colors.text} />
      <Text style={styles.friendName}>{friend.name}</Text>
    </View>
    <TouchableOpacity onPress={() => onRemove(friend.friendId)} style={styles.removeButton} disabled={isRemoving}>
      {isRemoving ? (
        <ActivityIndicator size="small" color={colors.text} />
      ) : (
        <Text style={styles.removeButtonText}>Remove</Text>
      )}
    </TouchableOpacity>
  </TouchableOpacity>
);

const FriendRequestItem = ({ request, onAccept, onDeny, isProcessing }) => (
  <View style={styles.friendRequestItem}>
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
  </View>
);

export default FriendsScreen;