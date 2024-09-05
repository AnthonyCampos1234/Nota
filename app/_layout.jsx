import { useEffect } from "react";
import { useFonts } from "expo-font";
import "react-native-url-polyfill/auto";
import { SplashScreen, Stack } from "expo-router";

import GlobalProvider from "../context/GlobalProvider";
import { FriendsProvider } from "../context/FriendsContext";
import { useGlobalContext } from "../context/GlobalProvider";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

const AppLayout = () => {
  const { isLogged, user, loading } = useGlobalContext();

  if (loading) {
    return null; // Or a loading spinner
  }

  let initialRoute = '(auth)';
  if (isLogged) {
    initialRoute = user?.needsOnboarding ? 'OnboardingScreen' : '(tabs)';
  }

  return (
    <Stack initialRouteName={initialRoute}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="search/[query]" options={{ headerShown: false }} />
      <Stack.Screen name="(main)/courses" options={{ headerShown: false }} />
      <Stack.Screen name="(main)/plan_ahead" options={{ headerShown: false }} />
      <Stack.Screen name="(main)/timeline" options={{ headerShown: false }} />
      <Stack.Screen name="(main)/gpa" options={{ headerShown: false }} />
      <Stack.Screen name="(main)/friends" options={{ headerShown: false }} />
      <Stack.Screen name="(main)/leaderboard" options={{ headerShown: false }} />
      <Stack.Screen name="OnboardingScreen" options={{ headerShown: false }} />
    </Stack>
  );
};

const RootLayout = () => {
  const [fontsLoaded, error] = useFonts({
    "Poppins-Black": require("../assets/fonts/Poppins-Black.ttf"),
    "Poppins-Bold": require("../assets/fonts/Poppins-Bold.ttf"),
    "Poppins-ExtraBold": require("../assets/fonts/Poppins-ExtraBold.ttf"),
    "Poppins-ExtraLight": require("../assets/fonts/Poppins-ExtraLight.ttf"),
    "Poppins-Light": require("../assets/fonts/Poppins-Light.ttf"),
    "Poppins-Medium": require("../assets/fonts/Poppins-Medium.ttf"),
    "Poppins-Regular": require("../assets/fonts/Poppins-Regular.ttf"),
    "Poppins-SemiBold": require("../assets/fonts/Poppins-SemiBold.ttf"),
    "Poppins-Thin": require("../assets/fonts/Poppins-Thin.ttf"),
  });

  useEffect(() => {
    if (error) throw error;
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, error]);

  if (!fontsLoaded && !error) {
    return null;
  }

  return (
    <GlobalProvider>
      <FriendsProvider>
        <AppLayout />
      </FriendsProvider>
    </GlobalProvider>
  );
};

export default RootLayout;