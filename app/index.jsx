import { StatusBar } from "expo-status-bar";
import { Redirect, router } from "expo-router";
import { View, Text, Image, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { images } from "../constants";
import { CustomButton, Loader } from "../components";
import { useGlobalContext } from "../context/GlobalProvider";

const Welcome = () => {
  const { loading, isLogged } = useGlobalContext();

  if (!loading && isLogged) return <Redirect href="/home" />;

  return (
    <SafeAreaView style={{ backgroundColor: "#000", flex: 1 }}>
      <Loader isLoading={loading} />

        <View className="w-full flex justify-center h-full">
          <Image
            source={images.NootaLogoForHome}
            resizeMode="contain"
            style={{ width: 400, height: 400 }}
          />

          <View >
            <Text className="text-3xl text-white font-bold text-center">
              All of your university{"\n"}
              needs with{" "}
              <Text style={{ backgroundColor: "#000", flex: 1 }}>Nota</Text>
            </Text>
          </View>

          <Text className="text-sm font-pregular text-gray-100 mt-5 text-center">
            Everything You Need, From Study to Play,{"\n"}
            Simplifying Uni Life, Every Day
          </Text>

          <CustomButton
            title="Continue"
            handlePress={() => router.push("/sign-in")}
            containerStyles="w-full mt-20"
          />
        </View>

      <StatusBar backgroundColor="#161622" style="light" />
    </SafeAreaView>
  )
    ;
};

export default Welcome;
