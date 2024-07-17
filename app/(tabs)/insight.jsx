import { useState } from "react";
import { router } from "expo-router";
import { ResizeMode, Video } from "expo-av";
import * as DocumentPicker from "expo-document-picker";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  View,
  Text,
  Alert,
  Image,
  TouchableOpacity,
  ScrollView,
  FlatList,
  RefreshControl
} from "react-native";
import useAppwrite from "../../lib/useAppwrite";
import { getAllPosts, getLatestPosts } from "../../lib/appwrite";

import { icons } from "../../constants";
import { createVideoPost } from "../../lib/appwrite";
import { CustomButton, FormField } from "../../components";
import { useGlobalContext } from "../../context/GlobalProvider";

const Insight = () => {
  const { data: posts, refetch } = useAppwrite(getAllPosts);
  const { data: latestPosts } = useAppwrite(getLatestPosts);

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }
  const { user } = useGlobalContext();
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({
    title: "",
    video: null,
    thumbnail: null,
    prompt: "",
  });

  const submit = async () => {
    if (
      (form.prompt === "") |
      (form.title === "") |
      !form.thumbnail |
      !form.video
    ) {
      return Alert.alert("Please provide all fields");
    }

    setUploading(true);
    try {
      await createVideoPost({
        ...form,
        userId: user.$id,
      });

      Alert.alert("Success", "Post uploaded successfully");
      router.push("/home");
    } catch (error) {
      Alert.alert("Error", error.message);
    } finally {
      setForm({
        title: "",
        video: null,
        thumbnail: null,
        prompt: "",
      });

      setUploading(false);
    }
  };

  return (
    <SafeAreaView style={{ backgroundColor: "#000", flex: 1 }}>
      <View className="px-4 mt-6">
        <Text className="text-2xl text-white font-psemibold">Ask For Help!</Text>

        <FormField
          title="AI Help Chat"
          value={form.prompt}
          placeholder="Enter your question..."
          handleChangeText={(e) => setForm({ ...form, prompt: e })}
          otherStyles="mt-7"
        />

        <CustomButton
          title="Send"
          handlePress={submit}
          containerStyles="mt-7"
          isLoading={uploading}
        />
      </View>
      <View className="px-4 mt-6">
      <Text className="text-2xl text-white font-psemibold">
        News & Updates:
      </Text>
      </View>      
      <ScrollView className="px-4 my-6">
        <Text className="text-2xl text-white">
          - Update 2.0 released! {"\n"}
          - Desktop Application coming soon! {"\n"}
          - Update 2.0 released! {"\n"}
          - Desktop Application coming soon! {"\n"}
          - Update 2.0 released! {"\n"}
          - Desktop Application coming soon! {"\n"}
          - Update 2.0 released! {"\n"}
          - Desktop Application coming soon! {"\n"}
          - Update 2.0 released! {"\n"}
          - Desktop Application coming soon! {"\n"}
          - Update 2.0 released! {"\n"}
          - Desktop Application coming soon! {"\n"}
          - Update 2.0 released! {"\n"}
          - Desktop Application coming soon! {"\n"}
          - Update 2.0 released! {"\n"}
          - Desktop Application coming soon! {"\n"}
          - Update 2.0 released! {"\n"}
          - Desktop Application coming soon! {"\n"}
          - Update 2.0 released! {"\n"}
          - Desktop Application coming soon! {"\n"}
          - Update 2.0 released! {"\n"}
          - Desktop Application coming soon! {"\n"}
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Insight;
