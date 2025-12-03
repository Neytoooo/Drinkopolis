import React, { useEffect, useState } from "react";
import { SafeAreaView, StatusBar, LogBox } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Asset } from "expo-asset";

// Imports des écrans
import SetupScreen from "./src/SetupScreen";
import GameScreen from "./src/GameScreen";
import MiniGamesScreen from "./src/components/MiniGamesScreen";
import LoadingScreen from "./src/LoadingScreen"; // <--- NOUVEAU

// Imports des Mini-jeux
import TapBattle from "./src/minigames/TapBattle";
import Memory from "./src/minigames/Memory";
import AirHockey from "./src/minigames/AirHockey";
import BeerPong from "./src/minigames/BeerPong";
import ShadowChallenge from "./src/minigames/ShadowChallenge";
import TiltGolf from "./src/minigames/TiltGolf";

import { IMAGES, PAWN_SKINS } from "./src/images";

LogBox.ignoreLogs(['SafeAreaView has been deprecated']);

const Stack = createNativeStackNavigator();

export default function App() {
  const [isAssetsLoaded, setIsAssetsLoaded] = useState(false);
  const [isSplashFinished, setIsSplashFinished] = useState(false);

  // 1. Pré-chargement réel des assets
  useEffect(() => {
    (async () => {
      try {
        const tileAssets = Object.values(IMAGES).filter((img) => typeof img === 'number');
        const pawnAssets = Object.values(PAWN_SKINS).filter((img) => typeof img === 'number');
        // Ajoute ici ton image de splash screen aussi pour qu'elle soit dispo tout de suite
        // await Asset.loadAsync([...tileAssets, ...pawnAssets, require('./assets/splash_custom.png')]);
        await Asset.loadAsync([...tileAssets, ...pawnAssets]);
      } catch (e) {
        console.log("Erreur chargement images:", e);
      } finally {
        setIsAssetsLoaded(true);
      }
    })();
  }, []);

  // 2. Si le chargement est fini ET l'animation finie, on lance l'app
  const appReady = isAssetsLoaded && isSplashFinished;

  if (!appReady) {
    // Affiche l'écran de chargement tant que tout n'est pas prêt
    return (
      <LoadingScreen onFinish={() => setIsSplashFinished(true)} />
    );
  }

  return (
    <NavigationContainer>
      <SafeAreaView style={{ flex: 1, backgroundColor: "#000" }}>
        <StatusBar barStyle="light-content" />

        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Setup" component={SetupScreen} />
          <Stack.Screen name="Game" component={GameScreen} />
          <Stack.Screen name="MiniGames" component={MiniGamesScreen} />
          <Stack.Screen name="TapBattle" component={TapBattle} />
          <Stack.Screen name="Memory" component={Memory} />
          <Stack.Screen name="AirHockey" component={AirHockey} />
          <Stack.Screen name="BeerPong" component={BeerPong} />
          <Stack.Screen name="ShadowChallenge" component={ShadowChallenge} />
          <Stack.Screen name="TiltGolf" component={TiltGolf} />
        </Stack.Navigator>
      </SafeAreaView>
    </NavigationContainer>
  );
}