// src/components/PlayerHand.js
import React from "react";
import { View, StyleSheet } from "react-native";
import { CARD_IMAGES, CARD_META } from "../cards";
import CardFlip from "./CardFlip";

export default function PlayerHand({ cards = [] }) {
  if (!cards?.length) return null;

  return (
    <View style={s.zone}>
      {cards.slice(0, 2).map((key, i) => (
        <CardFlip
          key={key + i}
          frontSrc={CARD_IMAGES[key]}
          title={CARD_META[key]?.title || key}
          desc={CARD_META[key]?.desc || ""}
          style={[s.cardWrap, i === 0 ? s.left : s.right]}
        />
      ))}
    </View>
  );
}

const s = StyleSheet.create({
  zone: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    gap: 16,
    flexDirection: "row",
  },
  cardWrap: { width: 120, height: 170, overflow: "visible" },
  left: { transform: [{ rotate: "-8deg" }] },
  right:{ transform: [{ rotate: "8deg" }] },
});
