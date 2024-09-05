import React from "react";
import { StatusBar } from "expo-status-bar";
import { Redirect, Tabs } from "expo-router";
import { View, TouchableOpacity, StyleSheet, Platform } from "react-native";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Loader } from "../../components";
import { useGlobalContext } from "../../context/GlobalProvider";

const colors = {
  background: '#000000',
  card: '#1A1A1A',
  accent: '#FF385C',
  text: '#FFFFFF',
  subtext: '#A0A0A0',
  border: '#333333',
  gradient: ['#FF385C', '#FF1493'],
};

const TabIcon = ({ icon, color, focused }) => {
  return (
    <View style={[styles.tabIconContainer, focused ? styles.tabIconContainerFocused : null]}>
      {focused ? (
        <LinearGradient
          colors={colors.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradientBackground}
        >
          <Ionicons name={icon} size={24} color={colors.text} />
        </LinearGradient>
      ) : (
        <Ionicons name={icon} size={24} color={color} />
      )}
    </View>
  );
};

const CustomTabBar = ({ state, descriptors, navigation }) => {
  const insets = useSafeAreaInsets();

  const handlePress = (route, isFocused) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

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
    <BlurView intensity={100} tint="dark" style={[styles.tabBar, { paddingBottom: insets.bottom }]}>
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
              color: isFocused ? colors.accent : colors.subtext,
              size: 24
            })}
          </TouchableOpacity>
        );
      })}
    </BlurView>
  );
};

const TabLayout = () => {
  const { loading, isLogged } = useGlobalContext();
  const insets = useSafeAreaInsets();

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
          name="assignments"
          options={{
            tabBarIcon: ({ color, focused }) => (
              <TabIcon
                icon="document-text-outline"
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
          name="calendar"
          options={{
            tabBarIcon: ({ color, focused }) => (
              <TabIcon
                icon="calendar-outline"
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
      <StatusBar backgroundColor={colors.background} style="light" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: `${colors.card}80`,
    paddingTop: 10,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  tabButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
  },
  tabIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  tabIconContainerFocused: {
    backgroundColor: `${colors.accent}20`,
  },
  gradientBackground: {
    width: 80,
    height: 50,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default TabLayout;