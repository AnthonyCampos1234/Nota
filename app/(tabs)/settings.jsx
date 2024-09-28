import React, { useState, useCallback, useEffect, useRef } from 'react';
import { View, TouchableOpacity, Switch, Text, StyleSheet, FlatList, Image, Dimensions, Animated, Alert, TextInput } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useGlobalContext } from '../../context/GlobalProvider';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { getCurrentUser, account, updateUserSettings, checkUserPermissions, processGpaText, preprocessGPAText, processScheduleText, preprocessScheduleText } from "../../lib/appwrite";
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import axios from 'axios';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
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

const Header = ({ scrollY, userName, currentGPA, onLogout }) => {
  const insets = useSafeAreaInsets();

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
        <Text style={styles.logoText}>Settings</Text>
        <Text style={styles.headerSubtitle}>Customize your Nota experience</Text>
      </Animated.View>
      <Animated.View style={[styles.miniHeader, { opacity: miniHeaderOpacity, paddingTop: insets.top }]}>
        <View style={styles.miniHeaderContent}>
          <Text style={styles.miniLogoText}>Settings</Text>
          <TouchableOpacity onPress={onLogout} style={styles.logoutButton}>
            <Text style={styles.logoutButtonText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </Animated.View>
  );
};

const SettingsItem = ({ title, description, icon, component }) => (
  <View style={styles.settingsItem}>
    <View style={styles.settingsItemMain}>
      <LinearGradient
        colors={colors.gradient}
        style={styles.settingsIconContainer}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Ionicons name={icon} size={24} color={colors.text} />
      </LinearGradient>
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
    { label: 'Private', value: 'Private', icon: 'lock-closed-outline' },
    { label: 'Friends', value: 'Friends', icon: 'people-outline' },
    { label: 'Public', value: 'Public', icon: 'globe-outline' },
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
            color={value === option.value ? colors.background : colors.text}
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
  const [gpaText, setGpaText] = useState('');
  const [scheduleText, setScheduleText] = useState('');
  const scrollY = useRef(new Animated.Value(0)).current;
  const lastScrollY = useRef(0);
  const hasTriggeredDownHaptic = useRef(false);
  const hasTriggeredUpHaptic = useRef(false);
  const insets = useSafeAreaInsets();
  const [parsedCourseSchedule, setParsedCourseSchedule] = useState([]);

  useEffect(() => {
    if (user?.courseSchedule) {
      try {
        const parsedSchedule = user.courseSchedule.map(courseString => JSON.parse(courseString));
        setParsedCourseSchedule(parsedSchedule);
      } catch (error) {
        console.error("Error parsing course schedule:", error);
        setParsedCourseSchedule([]);
      }
    } else {
      setParsedCourseSchedule([]);
    }
  }, [user?.courseSchedule]);

  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    {
      useNativeDriver: false,
      listener: (event) => {
        const currentScrollY = event.nativeEvent.contentOffset.y;
        const headerTransitionPoint = HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT;

        if (currentScrollY > lastScrollY.current &&
          currentScrollY > headerTransitionPoint &&
          !hasTriggeredDownHaptic.current) {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          hasTriggeredDownHaptic.current = true;
          hasTriggeredUpHaptic.current = false;
        }
        else if (currentScrollY < lastScrollY.current &&
          currentScrollY < headerTransitionPoint &&
          !hasTriggeredUpHaptic.current) {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          hasTriggeredUpHaptic.current = true;
          hasTriggeredDownHaptic.current = false;
        }

        lastScrollY.current = currentScrollY;
      }
    }
  );


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

  const handleGpaTextSubmit = async () => {
    if (isUpdating) return;
    setIsUpdating(true);
    try {
      const processedData = await processGpaText(user.$id, gpaText);
      if (processedData.success) {
        Alert.alert("Success", "Your GPA has been updated successfully.");
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch (error) {
      console.error("Error processing GPA text:", error);
      Alert.alert("Error", "Failed to process GPA text. Please try again.");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleScheduleTextSubmit = async () => {
    if (isUpdating) return;
    setIsUpdating(true);
    try {
      console.log('handleScheduleTextSubmit - Starting schedule text submission');
      const processedText = preprocessScheduleText(scheduleText);
      console.log('handleScheduleTextSubmit - Processed schedule text:', processedText);

      console.log('handleScheduleTextSubmit - Sending request to Lambda function');
      const response = await axios.post(
        'https://utw7rcomf9.execute-api.us-east-2.amazonaws.com/default/TextractImageProcessor',
        { scheduleText: processedText },
        {
          headers: { 'Content-Type': 'application/json' },
          timeout: 30000
        }
      );

      console.log('handleScheduleTextSubmit - Received response from Lambda:', JSON.stringify(response.data, null, 2));

      if (response.data && response.data.success) {
        console.log('Schedule update successful');

        const { courses, totalCreditHours } = response.data.data;
        const semester = courses[0]?.associated_term || 'Current Semester';

        const updatedUser = await updateUserSettings(user.$id, {
          courseSchedule: courses,
          totalCreditHours: totalCreditHours,
          semester: semester
        });

        setUser(prevUser => ({
          ...prevUser,
          courseSchedule: updatedUser.courseSchedule,
          totalCreditHours: updatedUser.totalCreditHours,
          semester: updatedUser.semester
        }));

        const parsedSchedule = updatedUser.courseSchedule.map(courseString => JSON.parse(courseString));
        setParsedCourseSchedule(parsedSchedule);

        Alert.alert("Success", "Your class schedule has been updated successfully.");
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error("handleScheduleTextSubmit - Error:", error);
      if (error.isAxiosError) {
        console.error("handleScheduleTextSubmit - Axios error details:", {
          message: error.message,
          code: error.code,
          config: error.config,
          response: error.response ? {
            data: error.response.data,
            status: error.response.status,
            headers: error.response.headers
          } : 'No response'
        });
        if (error.response) {
          Alert.alert("Server Error", `Error ${error.response.status}: ${error.response.data.error || 'Unknown error'}`);
        } else if (error.request) {
          Alert.alert("No Response", "The server did not respond. Please try again later.");
        } else {
          Alert.alert("Request Error", error.message);
        }
      } else {
        Alert.alert("Error", `Failed to process schedule text: ${error.message}`);
      }
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleGPAUpdate = async (gpaUpdates) => {
    try {
      const currentUser = await getCurrentUser();
      if (!currentUser) {
        throw new Error("Unable to fetch current user");
      }
      console.log("Current user from database:", currentUser);

      const userPermissions = await checkUserPermissions(currentUser.$id);
      console.log("User permissions:", userPermissions);

      const updatePermissionString = `update("user:${currentUser.accountId}")`;
      const hasUpdatePermission = userPermissions.includes(updatePermissionString);

      console.log(`Checking for permission: ${updatePermissionString}`);
      console.log(`Has update permission: ${hasUpdatePermission}`);

      if (hasUpdatePermission) {
        console.log("Attempting to update user settings with:", gpaUpdates);
        const updatedUser = await updateUserSettings(currentUser.$id, gpaUpdates);
        console.log("Update result:", updatedUser);

        if (updatedUser) {
          setUser(prevUser => ({ ...prevUser, ...gpaUpdates }));
          setGpa(gpaUpdates.currentGPA?.toString() || '');
          Alert.alert("Success", "Your GPA has been updated successfully.");
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } else {
          Alert.alert("Info", "No changes were made to your GPA.");
        }
      } else {
        console.log("Update permission not found.");
        Alert.alert("Error", "You don't have permission to update your GPA");
      }
    } catch (error) {
      console.error("Error updating GPA:", error);
      if (error.response) {
        console.error("Error response:", error.response);
      }
      Alert.alert("Error", `Failed to update GPA: ${error.message}`);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  const handleProcessedData = async (data, imageType) => {
    try {
      if (imageType === 'grade') {
        if (data.gpa) {
          const gpaUpdates = {
            currentGPA: parseFloat(data.gpa.current),
            cumulativeGPA: parseFloat(data.gpa.cumulative)
          };
          console.log("Attempting to update GPA with:", gpaUpdates);
          await handleGPAUpdate(gpaUpdates);
        }
      } else if (imageType === 'schedule') {
      }
    } catch (error) {
      console.error("Error updating user data:", error);
      Alert.alert("Error", `Failed to update user data: ${error.message}`);
    }
  };

  const updateGpa = async (newGpa) => {
    if (isUpdating) return;

    setIsUpdating(true);

    try {
      await handleGPAUpdate({ currentGPA: parseFloat(newGpa) });
    } catch (error) {
      console.error("Error updating GPA:", error);
      Alert.alert("Error", "Failed to update GPA. Please try again.");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsUpdating(false);
    }
  };

  const toggleNotifications = async () => {
    if (isUpdating) return;

    const newValue = !notifications;
    setIsUpdating(true);
    setNotifications(newValue); 

    try {
      const updatedUser = await updateUserSettings(user.$id, { notifications: newValue });
      setUser(updatedUser);
    } catch (error) {
      console.error("Error updating notification settings:", error);
      setNotifications(!newValue); 
      Alert.alert("Error", "Failed to update notification settings. Please try again.");
    } finally {
      setIsUpdating(false);
    }
  };

  const changeGpaVisibility = async (newValue) => {
    if (isUpdating || newValue === gpaVisibility) return;

    setIsUpdating(true);
    setGpaVisibility(newValue); 

    try {
      const updatedUser = await updateUserSettings(user.$id, { gpaVisibility: newValue });
      setUser(updatedUser);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error("Error updating GPA visibility settings:", error);
      setGpaVisibility(gpaVisibility); 
      Alert.alert("Error", "Failed to update GPA visibility settings. Please try again.");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsUpdating(false);
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
              trackColor={{ false: colors.border, true: colors.accent }}
              thumbColor={notifications ? colors.text : colors.subtext}
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
    {
      title: 'Academic Information',
      data: [
        {
          title: 'GPA',
          description: 'Paste your GPA information here',
          icon: 'school-outline',
          component: (
            <View>
              <TextInput
                style={[styles.textInput, styles.fixedHeightInput]}
                multiline
                numberOfLines={4}
                onChangeText={setGpaText}
                value={gpaText}
                placeholder="Paste your GPA information here"
                placeholderTextColor={colors.subtext}
              />
              <TouchableOpacity
                onPress={handleGpaTextSubmit}
                style={styles.submitButton}
                disabled={isUpdating}
              >
                <Text style={styles.submitButtonText}>
                  {isUpdating ? 'Processing...' : 'Submit GPA Information'}
                </Text>
              </TouchableOpacity>
              {user?.currentGPA && user?.cumulativeGPA && (
                <View style={styles.gpaInfo}>
                  <Text style={styles.gpaText}>Current GPA: {user.currentGPA.toFixed(2)}</Text>
                  <Text style={styles.gpaText}>Cumulative GPA: {user.cumulativeGPA.toFixed(2)}</Text>
                </View>
              )}
            </View>
          )
        },
        {
          title: 'Class Schedule',
          description: 'Paste your class schedule here',
          icon: 'calendar-outline',
          component: (
            <View>
              <TextInput
                style={[styles.textInput, styles.fixedHeightInput]}
                multiline
                numberOfLines={6}
                onChangeText={setScheduleText}
                value={scheduleText}
                placeholder="Paste your class schedule here"
                placeholderTextColor={colors.subtext}
              />
              <TouchableOpacity
                onPress={handleScheduleTextSubmit}
                style={styles.submitButton}
                disabled={isUpdating}
              >
                <Text style={styles.submitButtonText}>
                  {isUpdating ? 'Processing...' : 'Submit Class Schedule'}
                </Text>
              </TouchableOpacity>
            </View>
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
      <View style={styles.container}>
        <Header scrollY={scrollY} userName={userName} currentGPA={user?.currentGPA} onLogout={logout} />
        <Animated.FlatList
          contentContainerStyle={[
            styles.scrollViewContent,
            { paddingTop: HEADER_MAX_HEIGHT, paddingBottom: insets.bottom + 20 }
          ]}
          scrollEventThrottle={16}
          onScroll={handleScroll}
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
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollViewContent: {
    paddingHorizontal: 16,
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1,
    backgroundColor: colors.background,
  },
  headerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    fontSize: 40,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 10,
  },
  headerSubtitle: {
    fontSize: 16,
    color: colors.subtext,
  },
  miniHeader: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: HEADER_MIN_HEIGHT,
  },
  miniHeaderContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  miniLogoText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
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
    borderColor: colors.accent,
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
    color: colors.subtext,
    fontSize: 16,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 22,
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
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  settingsTextContainer: {
    flex: 1,
  },
  settingsItemText: {
    color: colors.text,
    fontSize: 18,
    fontWeight: 'bold',
  },
  settingsItemDescription: {
    color: colors.subtext,
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
    backgroundColor: colors.card,
  },
  gpaVisibilityOptionSelected: {
    backgroundColor: colors.accent,
  },
  gpaVisibilityOptionText: {
    color: colors.text,
    marginLeft: 5,
    fontSize: 14,
  },
  gpaVisibilityOptionTextSelected: {
    color: colors.background,
    fontWeight: 'bold',
  },
  textInput: {
    backgroundColor: colors.card,
    color: colors.text,
    padding: 15,
    borderRadius: 12,
    fontSize: 16,
    marginBottom: 10,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: colors.border,
  },
  fixedHeightInput: {
    height: 120,
  },
  submitButton: {
    backgroundColor: colors.accent,
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  submitButtonText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: 'bold',
  },
  gpaInfo: {
    marginTop: 15,
    padding: 15,
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  gpaText: {
    color: colors.text,
    fontSize: 16,
    marginBottom: 5,
  },
  logoutButton: {
    backgroundColor: colors.accent,
    paddingHorizontal: 20,
    paddingVertical: 9,
    borderRadius: 20,
    marginTop: 10,
  },
  logoutButtonText: {
    color: colors.text,
    fontWeight: 'bold',
  },
});

export default Settings;
