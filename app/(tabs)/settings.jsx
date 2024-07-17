import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { View, Image, FlatList, TouchableOpacity, Text, Dimensions } from "react-native";

import { icons } from "../../constants";
import useAppwrite from "../../lib/useAppwrite";
import { getUserPosts, signOut } from "../../lib/appwrite";
import { useGlobalContext } from "../../context/GlobalProvider";
import { EmptyState, InfoBox, VideoCard } from "../../components";
import { CustomButton, FormField } from "../../components";

const Profile = () => {
  const { user, setUser, setIsLogged } = useGlobalContext();
  const { data: posts } = useAppwrite(() => getUserPosts(user.$id));

  const logout = async () => {
    await signOut();
    setUser(null);
    setIsLogged(false);

    router.replace("/sign-in");
  };

  return (
    <SafeAreaView style={{ backgroundColor: "#000", flex: 1 }}>
      <View className="w-full flex justify-center items-center mt-6 px-4">
            <TouchableOpacity
              onPress={logout}
              className="flex w-full items-end mb-10"
            >
              <Image
                source={icons.logout}
                resizeMode="contain"
                className="w-6 h-6"
              />
            </TouchableOpacity>

            <View className="w-16 h-16 border border-white rounded-lg flex justify-center items-center">
              <Image
                source={{ uri: user?.avatar }}
                className="w-[90%] h-[90%] rounded-lg"
                resizeMode="cover"
              />
            </View>

            <InfoBox
              title={user?.username}
              containerStyles="mt-5"
              titleStyles="text-lg"
            />

            <View className="mt-5 flex flex-row">
              <InfoBox
                title='4.00'
                subtitle="GPA"
                titleStyles="text-xl"
                containerStyles="mr-10"
              />
              <InfoBox
                title="10"
                subtitle="Friends"
                titleStyles="text-xl"
              />
            </View>

            <InfoBox
              title='Connect Accounts:'
              containerStyles="mt-5"
              titleStyles="text-lg"
        />
        </View>
      <FlatList
        ListHeaderComponent={() => (
          <View className="w-full flex justify-center items-center px-4">
            <View className="w-full flex justify-center px-4">
              <CustomButton title="Northeastern Edu" containerStyles="mt-7"/>
              <CustomButton title="Canvas" containerStyles="mt-7"/>
              <CustomButton title="Google Classroom" containerStyles="mt-7"/>
              <CustomButton title="Google Calendar" containerStyles="mt-7"/>
              <CustomButton title="Apple Calendar" containerStyles="mt-7"/>
            </View>

          </View>
        )}
      />
    </SafeAreaView>
  );
};

export default Profile;
