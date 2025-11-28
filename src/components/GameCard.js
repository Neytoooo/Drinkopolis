import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';

export default function GameCard({ title, desc, color="#21c997", onPress }) {
  return (
    <Pressable onPress={onPress} style={[s.card, {backgroundColor: color}]}>
      <Text style={s.title}>{title}</Text>
      <Text style={s.desc}>{desc}</Text>
    </Pressable>
  );
}

const s = StyleSheet.create({
  card: {
    width: "90%",
    borderRadius: 14,
    padding: 20,
    marginVertical: 10,
    alignSelf: "center",
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  title: {
    color: "#001",
    fontSize: 20,
    fontWeight: "900",
  },
  desc: {
    color: "#012",
    marginTop: 6,
    fontSize: 14,
    fontWeight: "600",
  }
});
