import React, { useEffect, useState } from "react";
import { SafeAreaView, StatusBar } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import SetupScreen from "./src/SetupScreen";
import GameScreen from "./src/GameScreen";
import MiniGamesScreen from "./src/components/MiniGamesScreen"
import TapBattle from "./src/minigames/TapBattle";
import Memory from "./src/minigames/Memory";
import AirHockey from "./src/minigames/AirHockey";  // ← Change "Memory" en "AirHockey" ici !
import BeerPong from "./src/minigames/BeerPong";
import ShadowChallenge from "./src/minigames/ShadowChallenge";
import TiltGolf from "./src/minigames/TiltGolf";



// ... reste du code

import { Asset } from "expo-asset";
import { IMAGES } from "./src/images";

const Stack = createNativeStackNavigator();

export default function App() {
  const [players, setPlayers] = useState(null);
  const [ready, setReady] = useState(false);

  // Pré-chargement des assets
  useEffect(() => {
    (async () => {
      const assets = Object.values(IMAGES).filter(Boolean);
      await Asset.loadAsync(assets);
      setReady(true);
    })();
  }, []);

  if (!ready) return null;

  return (
    <NavigationContainer>
      <SafeAreaView style={{ flex: 1, backgroundColor: "#000" }}>
        <StatusBar barStyle="light-content" />

        <Stack.Navigator screenOptions={{ headerShown: false }}>

          {/* Écran d’accueil / configuration */}
          <Stack.Screen name="Setup">
            {(props) => <SetupScreen {...props} onStart={setPlayers} />}
          </Stack.Screen>

          {/* Partie en cours */}
          <Stack.Screen name="Game">
            {(props) => <GameScreen {...props} playersInit={players} />}
          </Stack.Screen>

          {/* Menu Mini-jeux */}
          <Stack.Screen name="MiniGames" component={MiniGamesScreen} />

          {/* Mini-jeu Tap Battle */}
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
