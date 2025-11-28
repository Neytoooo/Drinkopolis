import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Image } from "expo-image";
import { IMAGES, PAWN_SKINS } from "../images";

const COLORS = {
  DEPART:"#20c997", SOBRE:"#4dabf7", SHOT1:"#fa5252", SHOT2:"#e03131",
  TAF1:"#b08968", CARTE:"#845ef7", SEXY:"#f06595", FUN:"#fab005",
  PRISON:"#5f3dc4", GO_PRISON:"#343a40", PARC:"#2b8a3e", IMPOT:"#495057"
};

export default function Tile({ tile, playersHere = [] }) {
  const src = IMAGES[tile.type] || null;

  return (
    <View style={[s.tile, { backgroundColor: COLORS[tile.type] || "#666" }]}>
      {src && <Image source={src} style={s.img} contentFit="cover" transition={80} />}
      {!src && <Text style={s.label} numberOfLines={2}>{tile.label}</Text>}

      <View style={s.pawns}>
        {playersHere.map(p => (
          <View key={p.id} style={s.pawnWrap}>
            <Image
              source={PAWN_SKINS[p.skin] || PAWN_SKINS.kid}
              style={s.pawnImg}
              contentFit="contain"
            />
          </View>
        ))}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  tile: {
    width: "100%",
    height: "100%",
    borderRadius: 0,          // carré
    overflow: "hidden",
    justifyContent: "flex-end",
  },
  img: { position: "absolute", inset: 0, width: "100%", height: "100%" },
  label: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 12,
    backgroundColor: "#0008",
    margin: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 0,
    alignSelf: "flex-start",
  },
  pawns: { position: "absolute", bottom: 4, left: 4, right: 4, flexDirection: "row", flexWrap: "wrap", gap: 4 },
  pawnWrap:{ width: 22, height: 22, borderRadius: 4, backgroundColor: "#0008", overflow: "hidden", borderWidth: 1, borderColor: "#000" },
  pawnImg:{ width: "100%", height: "100%" }
});
