import React from "react";
import { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { FlatList, RefreshControl, Text, View, StyleSheet, Image } from "react-native";
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { router } from "expo-router";

import { images } from "../../constants";
import { icons } from "../../constants";
import useAppwrite from "../../lib/useAppwrite";
import { getAllPosts, getLatestPosts } from "../../lib/appwrite";
import CustomButton2 from "../../components/CustomButton2";

const Home = () => {
  const { data: posts, refetch } = useAppwrite(getAllPosts);
  const { data: latestPosts } = useAppwrite(getLatestPosts);
  const navigation = useNavigation();

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  return (
    <SafeAreaView style={{ backgroundColor: "#000", flex: 1 }}>
      <View style={styles.titleContainer}>
        <Text style={styles.title}>Nota</Text>
      </View>
      
      <FlatList
        data={posts}
        keyExtractor={(item) => item.$id}
        ListHeaderComponent={() => (
          <View style={styles.headerContainer}>
            <View style={styles.greetingContainer}>
              <Text style={styles.greeting}>Hi,</Text>
              <View style={styles.gradientTextContainer}>
                <LinearGradient
                  colors={['#0000FF', '#FF69B4']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.gradient}
                >
                  <Text style={styles.gradientText}>
                    Anthony
                  </Text>
                </LinearGradient>
              </View>
            </View>

            <View style={styles.buttonsContainer}>
            <CustomButton2
                title="Courses"
                icon={icons.profile}
                onPress={() => router.push('(main)/courses')}
              />
              <CustomButton2
                title="Assignments"
                icon={icons.profile}
                onPress={() => router.push('(main)/assignments')}
              />
              <CustomButton2
                title="Plan Ahead"
                icon={icons.profile}
                onPress={() => router.push('(main)/plan_ahead')}
              />
              <CustomButton2
                title="Calendar"
                icon={icons.profile}
                onPress={() => router.push('(main)/calendar')}
              />
              <CustomButton2
                title="Timeline"
                icon={icons.profile}
                onPress={() => router.push('(main)/timeline')}
              />
              <CustomButton2
                title="GPA"
                icon={icons.profile}
                onPress={() => router.push('(main)/gpa')}
              />
              <CustomButton2
                title="Friends"
                icon={icons.profile}
                onPress={() => router.push('(main)/friends')}
              />
              <CustomButton2
                title="Leaderboard"
                icon={icons.profile}
                onPress={() => router.push('(main)/leaderboard')}
              />
            </View>
          </View>
        )}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    flex: 1,
    paddingVertical: 24,
    paddingHorizontal: 16,
  },
  titleContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    backgroundColor: '#000000'
  },
  title: {
    fontSize: 35,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  greetingContainer: {
    width: '100%',
    paddingLeft: 10,
    paddingBottom: 40,
  },
  greeting: {
    fontSize: 25,
    color: '#BBB',
    marginBottom: 8,
  },
  gradientTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  gradient: {
    paddingHorizontal: 5,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gradientText: {
    fontSize: 40,
    fontWeight: '400',
    color: '#FFF',
    backgroundColor: 'transparent',
  },
  buttonsContainer: {
    shadowColor: '#FFFFFF',
    shadowOpacity: 100,
    shadowOffset: 'center',
    shadowRadius: 5,
    marginTop: -20,
    paddingHorizontal: 15,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
});

export default Home;