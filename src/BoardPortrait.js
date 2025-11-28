import React, { useMemo } from "react";
import { View, Text, Dimensions, StyleSheet } from "react-native";
import { TILES } from "./tiles";
import Tile from "./components/Tile";

const { width, height } = Dimensions.get("window");

// plateau carré centré, 10 cases par côté
const OUTER_MARGIN = 0;
const PER_SIDE = 10;

export default function BoardPortrait({ players, playersAt, maxHeight = Infinity }) {
  const maxBoardWidth  = width - OUTER_MARGIN * 2;
  const maxBoardHeight = (maxHeight || width) - OUTER_MARGIN * 2;
  const boardSize = Math.min(maxBoardWidth, maxBoardHeight);

  // 1 case = 1/10 du bord externe
  const tileSize  = Math.floor(boardSize / PER_SIDE);
  const innerSize = tileSize * (PER_SIDE - 2);

  const centerLeft = (boardSize - innerSize) / 2;
  const centerTop  = (boardSize - innerSize) / 2;

  const positions = useMemo(() => {
    const pos = [];
    // haut 0..9
    for (let i = 0; i < 10; i++) {
      pos.push({ left: centerLeft - tileSize + i * tileSize, top: centerTop - tileSize });
    }
    // droite 10..19
    for (let i = 0; i < 10; i++) {
      pos.push({ left: centerLeft + innerSize, top: centerTop + i * tileSize });
    }
    // bas 20..29
    for (let i = 0; i < 10; i++) {
      pos.push({ left: centerLeft + innerSize - i * tileSize - tileSize, top: centerTop + innerSize });
    }
    // gauche 30..39
    for (let i = 0; i < 10; i++) {
      pos.push({ left: centerLeft - tileSize, top: centerTop + innerSize - i * tileSize - tileSize });
    }
    return pos;
  }, [centerLeft, centerTop, innerSize, tileSize]);

  return (
    <View style={[s.wrap, { width: boardSize, height: boardSize, alignSelf: "center" }]}>
      {TILES.map((t, i) => (
        <View key={i} style={[s.abs, positions[i], { width: tileSize, height: tileSize }]}>
          <Tile tile={t} playersHere={playersAt(t.index)} />
        </View>
      ))}

      <View
        style={[
          s.center,
          { left: centerLeft, top: centerTop, width: innerSize, height: innerSize }
        ]}
      >
        <View style={s.centerBadge}>
          <Text style={s.title}>SOIRÉES{"\n"}ÉPICÉES</Text>
          <Text style={s.sub}>Mode pass & play</Text>
        </View>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { position: "relative", backgroundColor: "#0b0b0b" },
  abs: { position: "absolute" },
  center: {
    position: "absolute",
    borderRadius: 0,          // carré au centre (comme demandé)
    backgroundColor: "#102528",
    alignItems: "center",
    justifyContent: "center",
  },
  centerBadge: {
    backgroundColor: "#21c997",
    borderRadius: 24,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  title: { color: "#001", fontWeight: "900", fontSize: 28, textAlign: "center", lineHeight: 30 },
  sub:   { color: "#012", textAlign: "center", marginTop: 4, fontWeight: "700" },
});
