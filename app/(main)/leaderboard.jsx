import React, { useRef, useCallback } from 'react';
import { SafeAreaView, View, Text, FlatList, StyleSheet, TouchableOpacity, Animated, StatusBar, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { BlurView } from 'expo-blur';
import { router } from "expo-router";

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
  ['#FF416C', '#FF4B2B'],
  ['#4776E6', '#8E54E9'],
  ['#00C9FF', '#92FE9D'],
  ['#F857A6', '#FF5858'],
  ['#7F00FF', '#E100FF'],
  ['#FFD200', '#F7971E'],
  ['#43CEA2', '#185A9D'],
  ['#FFA17F', '#00223E'],
];

const leaderboardData = [
  { name: 'Anthony Campos', gpa: 4.00, medal: 'gold' },
  { name: 'Tim Tran', gpa: 4.00, medal: 'gold' },
  { name: 'Johnny Ram', gpa: 3.98, medal: 'bronze' },
  { name: 'Bob Comb', gpa: 3.95 },
  { name: 'Randy Warhol', gpa: 3.94 },
  { name: 'Ella Maven', gpa: 3.91 },
  { name: 'Barack Obama', gpa: 3.87 },
  { name: 'Donald Trump', gpa: 3.82 },
  { name: 'Penny Wise', gpa: 3.52 },
  { name: 'Jimmy Crickets', gpa: 3.51 },
];

const Header = ({ scrollY, insets, onBackPress }) => {
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
            <Text style={styles.headerTitle}>Leaderboard</Text>
          </View>
          <View style={styles.placeholderButton} />
        </View>
        <Text style={styles.headerSubtitle}>Northeastern University</Text>
      </Animated.View>
      <Animated.View style={[styles.miniHeader, { opacity: miniHeaderOpacity, paddingTop: insets.top }]}>
        <View style={styles.miniHeaderContent}>
          <TouchableOpacity onPress={onBackPress} style={styles.miniBackButton}>
            <Ionicons name="chevron-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.miniHeaderTitle}>Leaderboard</Text>
        </View>
      </Animated.View>
    </Animated.View>
  );
};

const Leaderboard = () => {
  const insets = useSafeAreaInsets();
  const scrollY = useRef(new Animated.Value(0)).current;

  const handleBackPress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.back();
  }, []);

  const renderItem = ({ item, index }) => (
    <LinearGradient
      colors={gradientColors[index % gradientColors.length]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.item}
    >
      {item.medal && (
        <Text style={styles.medal}>
          {item.medal === 'gold' ? '🥇' : item.medal === 'silver' ? '🥈' : '🥉'}
        </Text>
      )}
      <Text style={styles.name}>{item.name}</Text>
      <Text style={styles.gpa}>{item.gpa.toFixed(2)}</Text>
    </LinearGradient>
  );

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <StatusBar barStyle="light-content" />
      <Header scrollY={scrollY} insets={insets} onBackPress={handleBackPress} />
      <Animated.FlatList
        data={leaderboardData}
        renderItem={renderItem}
        keyExtractor={(item) => item.name}
        contentContainerStyle={[
          styles.listContainer,
          { paddingTop: HEADER_MAX_HEIGHT, paddingBottom: insets.bottom + 20 }
        ]}
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
      />
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
  placeholderButton: {
    width: 40,
  },
  headerSubtitle: {
    fontSize: 16,
    color: colors.subtext,
    textAlign: 'center',
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
  },
  miniBackButton: {
    marginRight: 15,
  },
  miniHeaderTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  listContainer: {
    paddingHorizontal: 20,
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    marginBottom: 10,
    borderRadius: 10,
  },
  medal: {
    fontSize: 20,
    marginRight: 10,
  },
  name: {
    flex: 1,
    color: colors.text,
    fontSize: 16,
    fontWeight: 'bold',
  },
  gpa: {
    color: colors.text,
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default Leaderboard;