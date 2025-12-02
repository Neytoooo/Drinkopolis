import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";

export default function PlayerPanel({ current, onRoll, lastRoll }) {
  return (
    <View style={s.bar}>
      <View style={{ flex:1 }}>
        <Text style={s.h}>Tour de {current.name}</Text>
        <Text style={s.meta}>Shots: {current.shots}  •  Tafs: {current.tafs}  •  Prison: {current.prisonTurns}</Text>
      </View>
      <Pressable style={s.btn} onPress={onRoll}>
        <Text style={s.btnT}>🎲 Lancer {lastRoll ? `(${lastRoll})` : ""}</Text>
      </Pressable>
    </View>
  );
}

const s = StyleSheet.create({
  bar: { 
    flexDirection: "row", 
    alignItems: "center", 
    padding: 15, 
    gap: 10, 
    
    // Style "Flottant"
    position: 'absolute',
    bottom: 20,
    left: 10,
    right: 10,
    backgroundColor: "rgba(20, 30, 48, 0.95)", // Semi-transparent
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    
    // Ombre
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 10
  },
  h: { color: "#fff", fontSize: 18, fontWeight: "800" },
  meta: { color: "#bbb", fontSize: 12, marginTop: 2 },
  btn: { 
    backgroundColor: "#00f3ff", // Cyan Néon pour le bouton
    paddingHorizontal: 16, 
    paddingVertical: 12, 
    borderRadius: 12,
    shadowColor: "#00f3ff",
    shadowOpacity: 0.5,
    shadowRadius: 8
  },
  btnT: { color: "#000", fontWeight: "900" }
});