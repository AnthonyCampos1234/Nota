import React, { createContext, useState, useContext, useCallback } from 'react';
import { getFriends, getFriendRequests } from '../lib/appwrite';

const FriendsContext = createContext();

export const FriendsProvider = ({ children }) => {
    const [friends, setFriends] = useState([]);
    const [friendRequests, setFriendRequests] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchFriends = useCallback(async (userId) => {
        setLoading(true);
        try {
            const fetchedFriends = await getFriends(userId);
            setFriends(fetchedFriends);

            const fetchedRequests = await getFriendRequests(userId);
            setFriendRequests(fetchedRequests);
        } catch (error) {
            console.error("Error fetching friends:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    const addFriend = (newFriend) => {
        setFriends(prevFriends => [...prevFriends, newFriend]);
    };

    const removeFriend = (friendId) => {
        setFriends(prevFriends => prevFriends.filter(friend => friend.friendId !== friendId));
    };

    const value = {
        friends,
        friendRequests,
        loading,
        fetchFriends,
        addFriend,
        removeFriend,
        setFriendRequests,
    };

    return <FriendsContext.Provider value={value}>{children}</FriendsContext.Provider>;
};

export const useFriends = () => {
    const context = useContext(FriendsContext);
    if (context === undefined) {
        throw new Error('useFriends must be used within a FriendsProvider');
    }
    return context;
};