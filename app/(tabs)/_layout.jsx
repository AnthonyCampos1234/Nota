import React from "react";
import { StatusBar } from "expo-status-bar";
import { Redirect, Tabs } from "expo-router";
import { View, TouchableOpacity, StyleSheet, Platform } from "react-native";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Loader } from "../../components";
import { useGlobalContext } from "../../context/GlobalProvider";

const duoColors = {
  primary: '#4A90E2',
  secondary: '#FFC800',
  background: '#121212',
  surface: '#000000',
  text: '#FFFFFF',
  textSecondary: '#AAAAAA',
  error: '#FF4B4B',
};

const TabIcon = ({ icon, color, focused }) => {
  return (
    <View style={[styles.tabIconContainer, focused ? styles.tabIconContainerFocused : null]}>
      <Ionicons name={icon} size={32} color={color} />
    </View>
  );
};

const CustomTabBar = ({ state, descriptors, navigation }) => {
  const insets = useSafeAreaInsets();

  const handlePress = (route, isFocused) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const event = navigation.emit({
      type: 'tabPress',
      target: route.key,
      canPreventDefault: true,
    });

    if (!isFocused && !event.defaultPrevented) {
      navigation.navigate(route.name);
    }
  };

  return (
    <View
      style={[
        styles.tabBar,
        { paddingBottom: insets.bottom + 5 }
      ]}
    >
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const isFocused = state.index === index;

        return (
          <TouchableOpacity
            key={route.key}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            testID={options.tabBarTestID}
            onPress={() => handlePress(route, isFocused)}
            style={styles.tabButton}
          >
            {options.tabBarIcon({
              focused: isFocused,
              color: isFocused ? duoColors.primary : duoColors.textSecondary,
              size: 24
            })}
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const TabLayout = () => {
  const { loading, isLogged } = useGlobalContext();

  if (!loading && !isLogged) return <Redirect href="/sign-in" />;

  return (
    <View style={styles.container}>
      <Tabs
        screenOptions={{
          headerShown: false,
        }}
        tabBar={(props) => <CustomTabBar {...props} />}
      >
        <Tabs.Screen
          name="insight"
          options={{
            tabBarIcon: ({ color, focused }) => (
              <TabIcon
                icon="search-outline"
                color={color}
                focused={focused}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="home"
          options={{
            tabBarIcon: ({ color, focused }) => (
              <TabIcon
                icon="home-outline"
                color={color}
                focused={focused}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            tabBarIcon: ({ color, focused }) => (
              <TabIcon
                icon="settings-outline"
                color={color}
                focused={focused}
              />
            ),
          }}
        />
      </Tabs>
      <Loader isLoading={loading} />
      <StatusBar backgroundColor={duoColors.background} style="light" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: duoColors.surface,
    paddingTop: 3,
  },
  tabButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 6,
  },
  tabIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 128,
    height: 48,
    borderRadius: 8,
  },
  tabIconContainerFocused: {
    backgroundColor: `${duoColors.primary}20`,
  },
});

export default TabLayout;