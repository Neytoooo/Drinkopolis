import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Image } from "expo-image";
import { IMAGES, PAWN_SKINS } from "../images";

// Palette de couleurs Néon pour le nouveau design
const NEON_COLORS = {
  DEPART: "#00ff9d", // Vert alien
  SOBRE: "#00f3ff",  // Cyan électrique
  SHOT1: "#ff0055",  // Rose néon
  SHOT2: "#ff0000",  // Rouge pur
  TAF1: "#ffaa00",   // Orange ambre
  CARTE: "#bc13fe",  // Violet laser
  SEXY: "#ff00ff",   // Magenta
  FUN: "#ffff00",    // Jaune pur
  PRISON: "#6a00ff", // Indigo profond
  GO_PRISON: "#aaaaaa",
  PARC: "#00ff00",
  IMPOT: "#ff4444"
};

export default function Tile({ tile, playersHere = [] }) {
  const src = IMAGES[tile.type] || null;
  // Récupération de la couleur néon (ou gris par défaut)
  const glowColor = NEON_COLORS[tile.type] || "#888"; 

  return (
    <View style={[s.container, { borderColor: glowColor, shadowColor: glowColor }]}>
      
      {/* Fond semi-transparent pour l'effet vitre */}
      <View style={s.innerGlass} />

      {/* Contenu (Image ou Texte) */}
      <View style={s.content}>
        {src ? (
          <Image source={src} style={s.img} contentFit="contain" />
        ) : (
          <Text style={[s.label, { color: glowColor }]}>
            {/* On raccourcit le texte pour le design */}
            {tile.label.replace(/ \(.+\)/, "")}
          </Text>
        )}
      </View>

      {/* Pions des joueurs */}
      <View style={s.pawns}>
        {playersHere.map(p => (
          <View key={p.id} style={[s.pawnWrap, { borderColor: "#fff" }]}>
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
  container: {
    width: "96%", // Un peu d'espace entre les cases
    height: "96%",
    borderRadius: 8, // Coins arrondis
    borderWidth: 1.5, // Bordure fine
    backgroundColor: "#111", // Fond très sombre
    justifyContent: "center",
    alignItems: "center",
    
    // Effet GLOW (Ombre portée colorée)
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
    elevation: 5, // Pour Android
  },
  innerGlass: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255,255,255,0.03)", // Léger reflet
    borderRadius: 8,
  },
  content: {
    flex: 1,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    padding: 2,
  },
  img: { 
    width: "70%", 
    height: "70%" 
  },
  label: {
    fontWeight: "900",
    fontSize: 10,
    textAlign: "center",
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: {width: -1, height: 1},
    textShadowRadius: 10
  },
  pawns: { 
    position: "absolute", 
    bottom: -4, 
    right: -4, 
    flexDirection: "row", 
    flexWrap: "wrap-reverse",
    gap: 2 
  },
  pawnWrap:{ 
    width: 24, 
    height: 24, 
    borderRadius: 12, 
    backgroundColor: "#000", 
    borderWidth: 1, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  pawnImg:{ width: "90%", height: "90%" }
});