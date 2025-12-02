import React, { useEffect, useState } from "react";
import { SafeAreaView, StatusBar, LogBox } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Asset } from "expo-asset";

// Imports des écrans
import SetupScreen from "./src/SetupScreen";
import GameScreen from "./src/GameScreen";
import MiniGamesScreen from "./src/components/MiniGamesScreen";

// Imports des Mini-jeux
import TapBattle from "./src/minigames/TapBattle";
import Memory from "./src/minigames/Memory";
import AirHockey from "./src/minigames/AirHockey";
import BeerPong from "./src/minigames/BeerPong";
import ShadowChallenge from "./src/minigames/ShadowChallenge";
import TiltGolf from "./src/minigames/TiltGolf";

import { IMAGES } from "./src/images";

// Ignore les warnings visuels non critiques (optionnel)
LogBox.ignoreLogs(['SafeAreaView has been deprecated']);

const Stack = createNativeStackNavigator();

export default function App() {
  const [ready, setReady] = useState(false);

  // Pré-chargement des assets (Images)
  useEffect(() => {
    (async () => {
      try {
        const assets = Object.values(IMAGES).filter((img) => typeof img === 'number');
        await Asset.loadAsync(assets);
      } catch (e) {
        console.log("Erreur chargement images:", e);
      } finally {
        setReady(true);
      }
    })();
  }, []);

  if (!ready) return null;

  return (
    <NavigationContainer>
      <SafeAreaView style={{ flex: 1, backgroundColor: "#000" }}>
        <StatusBar barStyle="light-content" />

        <Stack.Navigator screenOptions={{ headerShown: false }}>

          {/* 1. ÉCRAN DE CONFIGURATION (Lobby) */}
          {/* On ne passe plus de props ici, SetupScreen gère la navigation */}
          <Stack.Screen name="Setup" component={SetupScreen} />

          {/* 2. LE JEU PRINCIPAL */}
          <Stack.Screen name="Game" component={GameScreen} />

          {/* 3. MENU MINI-JEUX */}
          <Stack.Screen name="MiniGames" component={MiniGamesScreen} />

          {/* 4. LES MINI-JEUX */}
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