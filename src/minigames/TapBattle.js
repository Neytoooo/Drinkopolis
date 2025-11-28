import React, { useState, useEffect, useRef } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";

export default function TapBattle({ navigation }) {
  const [countdown, setCountdown] = useState(3);
  const [running, setRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(3);
  const [p1, setP1] = useState(0);
  const [p2, setP2] = useState(0);
  const [winner, setWinner] = useState(null);

  const timerRef = useRef(null);

  // —————————— Compte à rebours 3,2,1 ——————————
  useEffect(() => {
    let t;
    if (countdown > 0) {
      t = setTimeout(() => setCountdown(countdown - 1), 1000);
    } else if (countdown === 0) {
      setRunning(true);
    }
    return () => clearTimeout(t);
  }, [countdown]);

  // —————————— Timer du jeu (3 secondes) ——————————
  useEffect(() => {
    if (!running) return;

    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 0.1) {
          clearInterval(timerRef.current);
          finishGame();
          return 0;
        }
        return t - 0.1;
      });
    }, 100);

    return () => clearInterval(timerRef.current);
  }, [running]);

  // —————————— Fin du jeu ——————————
  const finishGame = () => {
    setRunning(false);

    if (p1 > p2) setWinner("Joueur 1 gagne !");
    else if (p2 > p1) setWinner("Joueur 2 gagne !");
    else setWinner("Égalité parfaite !");
  };

  // —————————— Restart ——————————
  const restart = () => {
    setCountdown(3);
    setRunning(false);
    setTimeLeft(3);
    setWinner(null);
    setP1(0);
    setP2(0);
  };

  return (
    <View style={s.wrap}>
      {/* ——— Header ——— */}
      <Text style={s.title}>🔥 TAP BATTLE</Text>

      {/* ——— Compte à rebours ——— */}
      {winner === null && !running && countdown > 0 && (
        <Text style={s.count}>{countdown}</Text>
      )}

      {/* ——— Timer en cours ——— */}
      {running && (
        <Text style={s.timer}>Temps restant : {timeLeft.toFixed(1)}s</Text>
      )}

      {/* ——— Zones de tap ——— */}
      {winner === null && (
        <View style={s.playArea}>
          {/* Joueur 1 */}
          <Pressable
            style={[s.zone, { backgroundColor: "#1dd1a1" }]}
            disabled={!running}
            onPress={() => running && setP1(p1 + 1)}
          >
            <Text style={s.zoneLabel}>Joueur 1</Text>
            <Text style={s.score}>{p1}</Text>
          </Pressable>

          {/* Joueur 2 */}
          <Pressable
            style={[s.zone, { backgroundColor: "#ff6b6b" }]}
            disabled={!running}
            onPress={() => running && setP2(p2 + 1)}
          >
            <Text style={s.zoneLabel}>Joueur 2</Text>
            <Text style={s.score}>{p2}</Text>
          </Pressable>
        </View>
      )}

      {/* ——— Barres de progression ——— */}
      {winner === null && (
        <View style={s.bars}>
          <View style={s.barWrap}>
            <View style={[s.bar, { width: `${p1}%`, backgroundColor: "#1dd1a1" }]} />
          </View>
          <View style={s.barWrap}>
            <View style={[s.bar, { width: `${p2}%`, backgroundColor: "#ff6b6b" }]} />
          </View>
        </View>
      )}

      {/* ——— Résultat final ——— */}
      {winner && (
        <View style={s.resultBox}>
          <Text style={s.resultText}>{winner}</Text>

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
    fontWeight: "900",
    fontSize: 28,
    marginBottom: 20,
  },
  count: {
    color: "#fff",
    fontSize: 70,
    fontWeight: "900",
    marginTop: 70,
  },
  timer: {
    color: "#fff",
    fontSize: 18,
    marginBottom: 10,
  },
  playArea: {
    flexDirection: "row",
    width: "100%",
    marginTop: 20,
  },
  zone: {
    flex: 1,
    height: 200,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#000",
  },
  zoneLabel: {
    color: "#000",
    fontWeight: "900",
    fontSize: 20,
  },
  score: {
    color: "#000",
    fontSize: 26,
    marginTop: 8,
    fontWeight: "900",
  },
  bars: {
    width: "100%",
    paddingHorizontal: 20,
    marginTop: 20,
    gap: 12,
  },
  barWrap: {
    height: 18,
    backgroundColor: "#333",
    borderRadius: 10,
    overflow: "hidden",
  },
  bar: {
    height: "100%",
    borderRadius: 10,
  },
  resultBox: {
    alignItems: "center",
    marginTop: 40,
  },
  resultText: {
    color: "#fff",
    fontSize: 30,
    fontWeight: "900",
    marginBottom: 20,
  },
  btn: {
    backgroundColor: "#218c74",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 10,
  },
  btnTxt: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
});
