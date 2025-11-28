import React, { useEffect, useState } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";

export default function Memory({ navigation }) {

  // —————————— Préparation des cartes ——————————
  const baseSymbols = ["🍺", "🍷", "🔥", "🍀", "🎲", "💋"];
  const deck = [...baseSymbols, ...baseSymbols] // 12 cartes (6 paires)
    .sort(() => Math.random() - 0.5)
    .map((s, i) => ({ id: i, symbol: s }));

  const [cards, setCards] = useState(deck);
  const [visible, setVisible] = useState(true); // toutes les cartes visibles au début
  const [selected, setSelected] = useState([]); // 0 ou 2 cartes
  const [matched, setMatched] = useState([]);   // paires trouvées
  const [turn, setTurn] = useState(1);          // J1 ou J2
  const [score, setScore] = useState({ 1: 0, 2: 0 });
  const [end, setEnd] = useState(false);

  // —————————— Flash de départ ——————————
  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
    }, 1200);

    return () => clearTimeout(timer);
  }, []);

  // —————————— Logique du Memory ——————————
  const onCardPress = (card) => {
    if (visible || end) return;                    // pas de clic pendant flash / après fin
    if (matched.includes(card.id)) return;         // déjà trouvée
    if (selected.find((c) => c.id === card.id)) return; // déjà sélectionnée

    const newSel = [...selected, card];
    setSelected(newSel);

    // On attend d'avoir 2 cartes
    if (newSel.length === 2) {
      setTimeout(() => {
        const [a, b] = newSel;

        if (a.symbol === b.symbol) {
          // Match !
          setMatched((m) => [...m, a.id, b.id]);
          setScore((s) => ({ ...s, [turn]: s[turn] + 1 }));
        }

        setSelected([]);

        // tournante J1 / J2
        setTurn((t) => (t === 1 ? 2 : 1));

      }, 600);
    }
  };

  // —————————— Vérification de fin ——————————
  useEffect(() => {
    if (matched.length === cards.length) {
      setEnd(true);
    }
  }, [matched]);

  const restart = () => {
    const newDeck = [...baseSymbols, ...baseSymbols]
      .sort(() => Math.random() - 0.5)
      .map((s, i) => ({ id: i, symbol: s }));

    setCards(newDeck);
    setVisible(true);
    setSelected([]);
    setMatched([]);
    setTurn(1);
    setScore({ 1: 0, 2: 0 });
    setEnd(false);

    setTimeout(() => setVisible(false), 1200);
  };

  const winner = score[1] > score[2] ? "Joueur 1" :
                 score[2] > score[1] ? "Joueur 2" :
                 "Égalité";

  return (
    <View style={s.wrap}>
      <Text style={s.title}>🧠 MEMORY FLASH</Text>

      {/* ——— Score + tour ——— */}
      {!end && (
        <Text style={s.turn}>Tour : {turn === 1 ? "Joueur 1" : "Joueur 2"}</Text>
      )}

      {/* ——— Grille de cartes ——— */}
      <View style={s.grid}>
        {cards.map((card) => {
          const isVisible = visible ||
            selected.find((c) => c.id === card.id) ||
            matched.includes(card.id);

          return (
            <Pressable
              key={card.id}
              onPress={() => onCardPress(card)}
              style={[s.card, matched.includes(card.id) && s.cardMatched]}
            >
              <Text style={s.cardText}>
                {isVisible ? card.symbol : "❓"}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* ——— FIN DU JEU ——— */}
      {end && (
        <View style={s.resultBox}>
          <Text style={s.result}>Résultat : {winner} !</Text>
          <Pressable style={s.btn} onPress={restart}>
            <Text style={s.btnTxt}>Rejouer</Text>
          </Pressable>
          <Pressable style={[s.btn, { backgroundColor: "#555" }]}
            onPress={() => navigation.goBack()}>
            <Text style={s.btnTxt}>Retour</Text>
          </Pressable>
        </View>
      )}

    </View>
  );
}

const s = StyleSheet.create({
  wrap: {
    flex: 1,
    backgroundColor: "#0b0b0b",
    alignItems: "center",
    paddingTop: 40,
  },
  title: {
    color: "#fff",
    fontSize: 26,
    fontWeight: "900",
    marginBottom: 10,
  },
  turn: {
    color: "#bbb",
    fontSize: 16,
    marginBottom: 10,
  },

  // grille responsive
  grid: {
    width: "90%",
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginTop: 20,
  },

  card: {
    width: "30%",
    aspectRatio: 1,
    backgroundColor: "#222",
    borderRadius: 12,
    marginBottom: 12,
    justifyContent: "center",
    alignItems: "center",
  },

  cardMatched: {
    backgroundColor: "#2ecc71",
  },

  cardText: {
    fontSize: 36,
    color: "#fff",
  },

  resultBox: {
    marginTop: 40,
    alignItems: "center",
  },
  result: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "900",
    marginBottom: 20,
  },
  btn: {
    backgroundColor: "#2980b9",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 10,
  },
  btnTxt: {
    color: "#fff",
    fontWeight: "900",
    fontSize: 16,
  },
});
