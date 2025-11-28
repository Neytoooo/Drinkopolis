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
  bar:{ flexDirection:"row", alignItems:"center", padding:10, gap:10, backgroundColor:"#111", borderTopWidth:1, borderTopColor:"#000" },
  h:{ color:"#fff", fontSize:18, fontWeight:"800" },
  meta:{ color:"#bbb" },
  btn:{ backgroundColor:"#22b8cf", paddingHorizontal:16, paddingVertical:10, borderRadius:10 },
  btnT:{ color:"#001", fontWeight:"800" }
});
