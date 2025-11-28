// src/components/SpecialCard.js
import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";

export default function SpecialCard({ card, onClose }) {
  if (!card) return null;
  return (
    <View style={s.wrap}>
      <View style={s.card}>
        <Text style={s.h}>{card.title}</Text>
        <Text style={s.desc}>{card.desc}</Text>
        <View style={{ height:8 }} />
        <Text style={s.kind}>
          {card.kind === "instant" ? "Effet immédiat" : "À garder"}
        </Text>
        <Pressable style={s.btn} onPress={onClose}>
          <Text style={s.btnT}>OK</Text>
        </Pressable>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  wrap:{ paddingHorizontal:12, paddingTop:10, paddingBottom:6, backgroundColor:"#000" },
  card:{
    backgroundColor:"#1f2430",
    borderWidth:2, borderColor:"#00d1b2",
    borderRadius:12, padding:12
  },
  h:{ color:"#fff", fontSize:18, fontWeight:"900" },
  desc:{ color:"#d0e0ff", marginTop:6 },
  kind:{ color:"#aaa", fontSize:12 },
  btn:{ alignSelf:"flex-end", marginTop:8, backgroundColor:"#00d1b2", paddingHorizontal:14, paddingVertical:8, borderRadius:8 },
  btnT:{ color:"#08212a", fontWeight:"900" }
});
