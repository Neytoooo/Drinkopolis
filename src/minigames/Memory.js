import React, { useEffect, useState } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { Image } from "expo-image";

const CARD_BACK = require("../../assets/texture/card_back.png");

export default function Memory({ navigation }) {

  // —————————— PARAMÈTRES DES NIVEAUX ——————————
  const levels = [
    { pairs: 3 }, // Niveau 1
    { pairs: 4 },
    { pairs: 5 },
    { pairs: 6 },
    { pairs: 8 }, // Niveau 5
  ];

  const [level, setLevel] = useState(0); // index du niveau
  const [visible, setVisible] = useState(true);
  const [selected, setSelected] = useState([]);
  const [matched, setMatched] = useState([]);
  const [cards, setCards] = useState([]);
  
  const pairsCount = levels[level].pairs;

  // —————————— CRÉATION DU DECK ——————————
  useEffect(() => {
    const baseSymbols = ["🍺", "🍷", "🔥", "🍀", "🎲", "💋", "☕", "🍫", "🎉", "⚡"];

    const deck = baseSymbols
      .slice(0, pairsCount)
      .flatMap((s, i) => [
        { id: `${i}-A`, symbol: s },
        { id: `${i}-B`, symbol: s }
      ])
      .sort(() => Math.random() - 0.5);

    setCards(deck);
    setSelected([]);
    setMatched([]);
    setVisible(true);

    setTimeout(() => setVisible(false), 1200);
  }, [level]);

  // —————————— CLIC SUR UNE CARTE ——————————
  const onCardPress = (card) => {
    if (visible) return;
    if (matched.includes(card.id)) return;
    if (selected.some((c) => c.id === card.id)) return;

    const newSel = [...selected, card];
    setSelected(newSel);

    if (newSel.length === 2) {
      setTimeout(() => {
        const [a, b] = newSel;

        if (a.symbol === b.symbol) {
          setMatched((m) => [...m, a.id, b.id]);
        }

        setSelected([]);
      }, 600);
    }
  };

  // —————————— PASSAGE AU NIVEAU SUIVANT ——————————
  useEffect(() => {
    if (matched.length === cards.length && cards.length > 0) {
      setTimeout(() => {
        if (level < levels.length - 1) {
          setLevel(level + 1);
        }
      }, 700);
    }
  }, [matched]);

  return (
    <View style={s.wrap}>
      <Text style={s.title}>🧠 MEMORY FLASH</Text>

      <Text style={s.subtitle}>Niveau {level + 1} / {levels.length}</Text>
      <Text style={s.submini}>
        Paires trouvées : {matched.length / 2} / {pairsCount}
      </Text>

      {/* ——— GRILLE DES CARTES ——— */}
      <View style={s.grid}>
        {cards.map((card) => {
          const isVisible =
            visible ||
            selected.some((c) => c.id === card.id) ||
            matched.includes(card.id);

          return (
            <Pressable
              key={card.id}
              onPress={() => onCardPress(card)}
              style={[s.card]}
            >
              {isVisible ? (
                <Text style={s.cardText}>{card.symbol}</Text>
              ) : (
                <Image source={CARD_BACK} style={s.cardImg} contentFit="cover" />
              )}
            </Pressable>
          );
        })}
      </View>

      <Pressable style={s.btnRetour} onPress={() => navigation.goBack()}>
        <Text style={s.btnTxt}>Retour</Text>
      </Pressable>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: {
    flex: 1,
    backgroundColor: "#000",
    alignItems: "center",
    paddingTop: 30,
  },

  title: {
    color: "#fff",
    fontSize: 26,
    fontWeight: "900",
  },

  subtitle: {
    color: "#7cb4ff",
    fontSize: 22,
    marginTop: 5,
  },

  submini: {
    color: "#ccc",
    fontSize: 16,
    marginBottom: 10,
  },

  grid: {
    width: "90%",
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginTop: 20,
  },

  card: {
    width: "30%",
    aspectRatio: 64 / 89,
    backgroundColor: "#1c1c1c",
    borderRadius: 10,
    overflow: "hidden",
    marginBottom: 12,
    justifyContent: "center",
    alignItems: "center",
  },

  cardImg: {
    width: "100%",
    height: "100%",
  },

  cardText: {
    fontSize: 36,
    color: "#fff",
    fontWeight: "900",
  },

  btnRetour: {
    marginTop: 25,
    backgroundColor: "#444",
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 12,
  },

  btnTxt: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "900",
  },
});
