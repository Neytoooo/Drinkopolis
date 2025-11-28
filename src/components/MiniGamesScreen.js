import React from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import GameCard from "./GameCard";

export default function MiniGamesScreen({ navigation }) {
  return (
    <View style={s.wrap}>
      <Text style={s.header}>Mini-Jeux</Text>

      <ScrollView style={{width:"100%"}} contentContainerStyle={{paddingBottom: 30}}>
        
        <GameCard 
          title="🔥 Tap Battle"
          desc="Tape le plus vite possible pour battre l’adversaire !"
          color="#fa5252"
          onPress={() => navigation.navigate("TapBattle")}
        />

        <GameCard 
          title="⚡ Réflexe"
          desc="Appuie dès que l’écran devient VERT !"
          color="#4dabf7"
          onPress={() => {}}
        />

        <GameCard 
          title="🍀 Roulette du Shot"
          desc="Fais tourner la roue… bonne ou mauvaise surprise ?"
          color="#fab005"
          onPress={() => {}}
        />

        <GameCard 
  title="🧠 Memory Flash"
  desc="Retiens les cartes et trouve les paires avant ton adversaire !"
  color="#845ef7"
  onPress={() => navigation.navigate("Memory")}
/>

<GameCard 
  title="⚡ AirHockey"
  desc="Marque 6 points pour gagner !"
  color="#845ef7"
  onPress={() => navigation.navigate("AirHockey")}
/>

<GameCard 
  title="Beer Pong 🍺"
  desc="Flick vers le haut pour tirer !"
  color="#845ef7"
  onPress={() => navigation.navigate("BeerPong")}
/>

<GameCard
  title="Défi des Ombres 🌑"
  desc="Devine et reproduis la forme en ombre chinoise."
  color="#845ef7"
  onPress={() => navigation.navigate("ShadowChallenge")}
/>


<GameCard
  title="Tilt Golf ⛳"
  desc="Fais rouler la balle en inclinant ton tel."
  color="#0ff"
  onPress={() => navigation.navigate("TiltGolf")}
/>


      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: {
    flex: 1,
    backgroundColor: "#0b0b0b",
    alignItems: "center",
    paddingTop: 40,
  },
  header: {
    color: "#fff",
    fontWeight: "900",
    fontSize: 27,
    marginBottom: 20,
  },
});