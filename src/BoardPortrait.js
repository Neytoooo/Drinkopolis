import React, { useMemo } from "react";
import { View, Text, Dimensions, StyleSheet } from "react-native";
import { TILES } from "./tiles";
import Tile from "./components/Tile";
import Dice3D from "./components/Dice3D"; // Import du composant dé

const { width, height } = Dimensions.get("window");

// plateau carré centré, 10 cases par côté
const OUTER_MARGIN = 0;
const PER_SIDE = 10;

export default function BoardPortrait({ players, playersAt, maxHeight = Infinity, diceResult, onDiceLand }) {
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
      
      {/* LES CASES DU JEU */}
      {TILES.map((t, i) => (
        <View key={i} style={[s.abs, positions[i], { width: tileSize, height: tileSize }]}>
          <Tile tile={t} playersHere={playersAt(t.index)} />
        </View>
      ))}

      {/* CENTRE DU PLATEAU (HUD + DÉ) */}
      <View
        style={[
          s.center,
          { left: centerLeft, top: centerTop, width: innerSize, height: innerSize }
        ]}
      >
        {/* Cercles décoratifs style Cyberpunk (toujours visibles) */}
        <View style={s.decorativeCircle} />
        
        <View style={s.hudContainer}>
          
          {/* LOGIQUE D'AFFICHAGE : Si on lance le dé, on l'affiche. Sinon on affiche le titre. */}
          {diceResult ? (
            <Dice3D result={diceResult} onLand={onDiceLand} />
          ) : (
            <>
              <Text style={s.neonTitle}>DRINKOPOLIS</Text>
              <Text style={s.neonSub}>NIGHT EDITION</Text>
              
              {/* Petite barre décorative */}
              <View style={s.actionZone}>
                 <View style={{width: 40, height: 4, backgroundColor: '#00f3ff', opacity: 0.3, borderRadius: 2}} />
              </View>
            </>
          )}

        </View>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { position: "relative" }, 
  abs: { position: "absolute", justifyContent: 'center', alignItems: 'center' },
  
  center: {
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",
  },
  
  // Style cercle pointillé autour du HUD
  decorativeCircle: {
    position: 'absolute',
    width: '94%',
    height: '94%',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#00f3ff',
    opacity: 0.15,
    borderStyle: 'dashed'
  },
  
  // Conteneur central (Panneau de contrôle)
  hudContainer: {
    width: '80%',
    height: '80%',
    backgroundColor: '#0f172a', // Bleu nuit profond
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#00f3ff', // Bordure Cyan
    alignItems: "center",
    justifyContent: "center",
    // Glow effect
    shadowColor: "#00f3ff",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  
  // Textes Néon
  neonTitle: { 
    color: "#fff", 
    fontWeight: "900", 
    fontSize: 26, 
    textAlign: "center", 
    letterSpacing: 2,
    textShadowColor: '#00f3ff',
    textShadowRadius: 10
  },
  neonSub:   { 
    color: "#00f3ff", 
    textAlign: "center", 
    marginTop: 4, 
    fontWeight: "700", 
    fontSize: 12, 
    letterSpacing: 4 
  },
  actionZone: {
    marginTop: 20,
    alignItems: 'center',
    gap: 4
  }
});