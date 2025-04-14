import { SafeAreaProvider,SafeAreaView } from "react-native-safe-area-context";
import InitialLayout from "@/components/initialLayout";
import ConvexAndClerkProvider from "@/providers/ConvexAndClerkProvider";
import { SplashScreen } from "expo-router";
import {useFonts} from "expo-font"
import { useCallback, useEffect } from "react";
import * as NavigationBar from "expo-navigation-bar";
import { Platform } from "react-native";
import { StatusBar } from "react-native";
SplashScreen.preventAutoHideAsync();
export default function RootLayout() {
 const [fontLoaded] = useFonts({
    "JetBrainsMono-Medium":require("../assets/fonts/JetBrainsMono-Medium.ttf")
  })
  const onLayoutRootView = useCallback(async () => {
   if(!fontLoaded) await SplashScreen.hideAsync()
  },[])
// 修改 Android 的原生狀態欄色調
  useEffect(() => {
    if (Platform.OS === "android") {
      NavigationBar.setBackgroundColorAsync("#000000")
      NavigationBar.setButtonStyleAsync("light");
    }
  },[])
  return (
    <ConvexAndClerkProvider>
    <SafeAreaProvider>
      <SafeAreaView style={{flex:1,backgroundColor:"black"}} onLayout={onLayoutRootView} >
      <InitialLayout/>
      </SafeAreaView>
      </SafeAreaProvider>
      <StatusBar barStyle={"light-content"}/>
      </ConvexAndClerkProvider>
)}
