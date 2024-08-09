import React, { useState, useCallback } from 'react';
import { View, TouchableOpacity, Switch, Text, StyleSheet, FlatList, Image, Dimensions, Animated, Alert, TextInput } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useGlobalContext } from '../../context/GlobalProvider';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { getCurrentUser, account, updateUserSettings } from "../../lib/appwrite";
import { LinearGradient } from 'expo-linear-gradient';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

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

const Header = ({ userName, insightPoints }) => {
  const insets = useSafeAreaInsets();
  const [bounceAnim] = useState(new Animated.Value(1));

  const animateInsightPoints = useCallback(() => {
    Animated.sequence([
      Animated.timing(bounceAnim, { toValue: 1.1, duration: 200, useNativeDriver: true }),
      Animated.spring(bounceAnim, { toValue: 1, friction: 4, useNativeDriver: true })
    ]).start();
  }, [bounceAnim]);

  return (
    <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
      <View style={styles.userInfo}>
        <Text style={styles.headerTitle}>{userName}</Text>
        <TouchableOpacity onPress={animateInsightPoints} style={styles.insightPointsContainer}>
          <Animated.View style={[styles.insightPointsContent, { transform: [{ scale: bounceAnim }] }]}>
            <Ionicons name="flash" size={24} color={colors.accent} />
            <Text style={styles.insightPointsText}>{insightPoints} IP</Text>
          </Animated.View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const SettingsItem = ({ title, description, icon, component }) => (
  <View style={styles.settingsItem}>
    <View style={styles.settingsItemMain}>
      <View style={[styles.settingsIconContainer, { backgroundColor: `${colors.secondary}20` }]}>
        <Ionicons name={icon} size={24} color={colors.secondary} />
      </View>
      <View style={styles.settingsTextContainer}>
        <Text style={styles.settingsItemText}>{title}</Text>
        {description && <Text style={styles.settingsItemDescription}>{description}</Text>}
      </View>
    </View>
    <View style={styles.settingsItemComponent}>
      {component}
    </View>
  </View>
);

const GpaVisibilitySelector = ({ value, onChange, disabled }) => {
  const options = [
    { label: 'Private', value: 'private', icon: 'lock-closed-outline' },
    { label: 'Friends', value: 'friends', icon: 'people-outline' },
    { label: 'Public', value: 'public', icon: 'globe-outline' },
  ];

  return (
    <View style={styles.gpaVisibilityContainer}>
      {options.map((option) => (
        <TouchableOpacity
          key={option.value}
          style={[
            styles.gpaVisibilityOption,
            value === option.value && styles.gpaVisibilityOptionSelected,
          ]}
          onPress={() => onChange(option.value)}
          disabled={disabled}
        >
          <Ionicons
            name={option.icon}
            size={20}
            color={value === option.value ? colors.primary : colors.text}
          />
          <Text
            style={[
              styles.gpaVisibilityOptionText,
              value === option.value && styles.gpaVisibilityOptionTextSelected,
            ]}
          >
            {option.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const Settings = () => {
  const { user, setUser, setIsLogged } = useGlobalContext();
  const [notifications, setNotifications] = useState(user?.notifications || false);
  const [gpaVisibility, setGpaVisibility] = useState(user?.gpaVisibility || 'private');
  const [gpa, setGpa] = useState(user?.gpa?.toString() || '');
  const [userName, setUserName] = useState("");
  const [insightPoints, setInsightPoints] = useState(0);
  const [isUpdating, setIsUpdating] = useState(false);
  const insets = useSafeAreaInsets();

  const fetchUserData = useCallback(async () => {
    try {
      const currentUser = await getCurrentUser();
      if (currentUser) {
        setUserName(currentUser.username || "");
        setInsightPoints(currentUser.insightPoints || 0);
        setNotifications(currentUser.notifications || false);
        setGpaVisibility(currentUser.gpaVisibility || 'private');
        setGpa(currentUser.gpa?.toString() || '');
        setUser(currentUser);
      } else {
        throw new Error("User data not found");
      }
    } catch (err) {
      console.error("Error fetching user data:", err);
      Alert.alert("Error", "Failed to fetch user data. Please try again.");
    }
  }, [setUser]);

  useFocusEffect(
    useCallback(() => {
      fetchUserData();
    }, [fetchUserData])
  );

  const toggleNotifications = async () => {
    if (isUpdating) return; // Prevent multiple toggles while updating

    const newValue = !notifications;
    setIsUpdating(true);
    setNotifications(newValue); // Optimistic update

    try {
      const updatedUser = await updateUserSettings(user.$id, { notifications: newValue });
      setUser(updatedUser);
    } catch (error) {
      console.error("Error updating notification settings:", error);
      setNotifications(!newValue); // Revert on error
      Alert.alert("Error", "Failed to update notification settings. Please try again.");
    } finally {
      setIsUpdating(false);
    }
  };

  const changeGpaVisibility = async (newValue) => {
    if (isUpdating || newValue === gpaVisibility) return;

    setIsUpdating(true);
    setGpaVisibility(newValue); // Optimistic update

    try {
      const updatedUser = await updateUserSettings(user.$id, { gpaVisibility: newValue });
      setUser(updatedUser);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error("Error updating GPA visibility settings:", error);
      setGpaVisibility(gpaVisibility); // Revert on error
      Alert.alert("Error", "Failed to update GPA visibility settings. Please try again.");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsUpdating(false);
    }
  };

  const updateGpa = async (newGpa) => {
    if (isUpdating) return;

    setIsUpdating(true);

    try {
      const updatedUser = await updateUserSettings(user.$id, { gpa: newGpa });
      setUser(updatedUser);
      setGpa(updatedUser.gpa?.toString() || '');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error("Error updating GPA:", error);
      Alert.alert("Error", "Failed to update GPA. Please try again.");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsUpdating(false);
    }
  };

  const logout = async () => {
    try {
      await account.deleteSession("current");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setUser(null);
      setIsLogged(false);
      router.replace('/sign-in');
    } catch (error) {
      console.error("Error logging out:", error);
      Alert.alert("Error", "Failed to log out. Please try again.");
    }
  };



  const settingsData = [
    {
      title: 'Account',
      data: [
        {
          title: 'Notifications',
          description: 'Toggle to enable or disable notifications',
          icon: 'notifications-outline',
          component: (
            <Switch
              value={notifications}
              onValueChange={toggleNotifications}
              disabled={isUpdating}
            />
          )
        },
        {
          title: 'GPA',
          description: 'Enter your current GPA',
          icon: 'school-outline',
          component: (
            <TextInput
              style={styles.gpaInput}
              value={gpa}
              onChangeText={setGpa}
              onEndEditing={() => updateGpa(gpa)}
              keyboardType="decimal-pad"
              placeholder="Enter your GPA"
              placeholderTextColor={colors.textSecondary}
            />
          )
        },
        {
          title: 'GPA Visibility',
          description: 'Control who can see your GPA',
          icon: 'eye-outline',
          component: (
            <GpaVisibilitySelector
              value={gpaVisibility}
              onChange={changeGpaVisibility}
              disabled={isUpdating}
            />
          )
        },
      ]
    },
  ];

  const toggleSetting = (key, currentValue) => {
    updateSetting(key, !currentValue);
  };

  const updateSetting = async (key, value) => {
    try {
      console.log(`Attempting to update ${key} to ${value}`);
      const updates = { [key]: value };

      console.log("Updates to be sent:", updates);

      const updatedUser = await updateUserSettings(user.$id, updates);
      console.log("Received updated user:", updatedUser);

      setUser(updatedUser);
      switch (key) {
        case 'notifications':
          setNotifications(value);
          break;
      }
      Alert.alert("Settings Updated", `Your ${key} setting has been updated.`);
    } catch (error) {
      console.error(`Error updating ${key} setting:`, error);
      if (error.response) {
        console.error("Error response:", error.response);
      }
      Alert.alert("Error", `Failed to update ${key} setting. Please try again. Error: ${error.message}`);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <LinearGradient
        colors={[colors.gradientStart, colors.gradientMiddle1, colors.gradientMiddle2, colors.gradientEnd]}
        style={styles.gradientBackground}
      >
        <Header userName={userName} insightPoints={insightPoints} />
        <FlatList
          contentContainerStyle={[
            styles.scrollViewContent,
            { paddingBottom: insets.bottom }
          ]}
          ListHeaderComponent={
            <>
              <View style={styles.profileSection}>
                <View style={styles.avatarContainer}>
                  <Image
                    source={{ uri: user?.avatar || 'https://via.placeholder.com/150' }}
                    style={styles.avatar}
                  />
                </View>
                <Text style={styles.username}>{user?.username || 'Username'}</Text>
                <Text style={styles.userEmail}>{user?.email || 'user@example.com'}</Text>
              </View>

              <View style={styles.card}>
                <View style={styles.statsContainer}>
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>{user?.gpa?.toFixed(2) || '0.00'}</Text>
                    <Text style={styles.statLabel}>GPA</Text>
                  </View>
                  <View style={styles.statDivider} />
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>{user?.courseSchedule?.length || 0}</Text>
                    <Text style={styles.statLabel}>Courses</Text>
                  </View>
                  <View style={styles.statDivider} />
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>{user?.dayStreak || 0}</Text>
                    <Text style={styles.statLabel}>Day Streak</Text>
                  </View>
                </View>
              </View>
            </>
          }
          data={settingsData}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>{item.title}</Text>
              {item.data.map((setting, index) => (
                <SettingsItem
                  key={index}
                  title={setting.title}
                  description={setting.description}
                  icon={setting.icon}
                  component={setting.component}
                />
              ))}
            </View>
          )}
          keyExtractor={(item, index) => index.toString()}
          ListFooterComponent={
            <TouchableOpacity onPress={logout} style={styles.logoutButton}>
              <Text style={styles.logoutButtonText}>Log Out</Text>
            </TouchableOpacity>
          }
        />
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
  scrollViewContent: {
    flexGrow: 1,
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  insightPointsContainer: {
    backgroundColor: `${colors.accent}20`,
    borderRadius: 16,
    padding: 8,
  },
  insightPointsContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  insightPointsText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginLeft: 8,
  },
  profileSection: {
    alignItems: 'center',
    marginVertical: 24,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: colors.secondary,
    marginBottom: 16,
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  username: {
    color: colors.text,
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  userEmail: {
    color: colors.textSecondary,
    fontSize: 16,
  },
  card: {
    backgroundColor: `${colors.secondary}10`,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: `${colors.secondary}30`,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    color: colors.text,
    fontSize: 24,
    fontWeight: 'bold',
  },
  statLabel: {
    color: colors.textSecondary,
    fontSize: 14,
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: colors.textSecondary,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  settingsItem: {
    marginBottom: 20,
  },
  settingsItemMain: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  settingsIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  settingsTextContainer: {
    flex: 1,
  },
  settingsItemText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: 'bold',
  },
  settingsItemDescription: {
    color: colors.textSecondary,
    fontSize: 14,
    marginTop: 2,
  },
  settingsItemComponent: {
    marginTop: 10,
  },
  gpaVisibilityContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  gpaVisibilityOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 20,
    backgroundColor: `${colors.secondary}20`,
  },
  gpaVisibilityOptionSelected: {
    backgroundColor: colors.secondary,
  },
  gpaVisibilityOptionText: {
    color: colors.text,
    marginLeft: 5,
    fontSize: 14,
  },
  gpaVisibilityOptionTextSelected: {
    color: colors.primary,
    fontWeight: 'bold',
  },
  logoutButton: {
    backgroundColor: colors.quaternary,
    borderRadius: 20,
    padding: 15,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  logoutButtonText: {
    color: colors.text,
    fontSize: 18,
    fontWeight: 'bold',
  },
  gpaInput: {
    backgroundColor: `${colors.secondary}20`,
    color: colors.text,
    padding: 10,
    borderRadius: 8,
    fontSize: 16,
  },
});

export default Settings;