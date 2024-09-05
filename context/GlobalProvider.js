import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getCurrentUser, account } from "../lib/appwrite";

const GlobalContext = createContext();
export const useGlobalContext = () => useContext(GlobalContext);

const GlobalProvider = ({ children }) => {
  const [isLogged, setIsLogged] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkAuthStatus = async () => {
    try {
      const sessionJson = await AsyncStorage.getItem('userSession');
      if (sessionJson) {
        const session = JSON.parse(sessionJson);
        await account.getSession(session.$id); // Verify the session
        const currentUser = await getCurrentUser();
        if (currentUser) {
          setIsLogged(true);
          setUser(currentUser);
        } else {
          throw new Error("User not found");
        }
      } else {
        setIsLogged(false);
        setUser(null);
      }
    } catch (error) {
      console.error("Auth check error:", error);
      setIsLogged(false);
      setUser(null);
      await AsyncStorage.removeItem('userSession');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const updateAuthState = async (newUser, session) => {
    if (newUser && session) {
      await AsyncStorage.setItem('userSession', JSON.stringify(session));
      setUser(newUser);
      setIsLogged(true);
    } else {
      await AsyncStorage.removeItem('userSession');
      setUser(null);
      setIsLogged(false);
    }
  };

  return (
    <GlobalContext.Provider
      value={{
        isLogged,
        setIsLogged,
        user,
        setUser,
        loading,
        updateAuthState,
        checkAuthStatus,
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
};

export default GlobalProvider;