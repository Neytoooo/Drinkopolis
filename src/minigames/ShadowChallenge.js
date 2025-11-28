// src/minigames/ShadowChallenge.js
import React, { useMemo, useState } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";

// Formes possibles (style "ombre chinoise")
const SHAPES = [
  {
    key: "cat",
    label: "Chat",
    emoji: "🐱",
    idealLength: 900,
    aspect: 0.9, // largeur / hauteur
  },
  {
    key: "bottle",
    label: "Bouteille",
    emoji: "🍾",
    idealLength: 1100,
    aspect: 0.4,
  },
  {
    key: "heart",
    label: "Cœur",
    emoji: "❤️",
    idealLength: 800,
    aspect: 1.0,
  },
  {
    key: "star",
    label: "Étoile",
    emoji: "⭐",
    idealLength: 1000,
    aspect: 1.0,
  },
];

export default function ShadowChallenge({ navigation }) {
  const [step, setStep] = useState("view");
  const [paths, setPaths] = useState([]); // [[{x,y}, ...], ...]
  const [currentPath, setCurrentPath] = useState(null);
  const [score, setScore] = useState(null);

  // Choix aléatoire d'une forme pour cette manche
  const shape = useMemo(
    () => SHAPES[Math.floor(Math.random() * SHAPES.length)],
    []
  );

  // --- dessin au doigt sur la zone ---
  const handleStart = (e) => {
    const { locationX, locationY } = e.nativeEvent;
    const p = { x: locationX, y: locationY };
    setCurrentPath([p]);
  };

  const handleMove = (e) => {
    if (!currentPath) return;
    const { locationX, locationY } = e.nativeEvent;
    const p = { x: locationX, y: locationY };
    setCurrentPath((prev) => [...prev, p]);
  };

  const handleEnd = () => {
    if (!currentPath || currentPath.length < 2) {
      setCurrentPath(null);
      return;
    }
    setPaths((ps) => [...ps, currentPath]);
    setCurrentPath(null);
  };

  const resetDrawing = () => {
    setPaths([]);
    setCurrentPath(null);
    setScore(null);
  };

  // Mesure le dessin : longueur + bounding box
  const measureDrawing = () => {
    let length = 0;
    let allPoints = [];

    const allPaths = [...paths];
    if (currentPath && currentPath.length > 1) {
      allPaths.push(currentPath);
    }

    allPaths.forEach((path) => {
      allPoints = allPoints.concat(path);
      for (let i = 1; i < path.length; i++) {
        const dx = path[i].x - path[i - 1].x;
        const dy = path[i].y - path[i - 1].y;
        length += Math.sqrt(dx * dx + dy * dy);
      }
    });

    if (allPoints.length === 0) {
      return { length: 0, width: 0, height: 0 };
    }

    let minX = allPoints[0].x;
    let maxX = allPoints[0].x;
    let minY = allPoints[0].y;
    let maxY = allPoints[0].y;

    allPoints.forEach((p) => {
      if (p.x < minX) minX = p.x;
      if (p.x > maxX) maxX = p.x;
      if (p.y < minY) minY = p.y;
      if (p.y > maxY) maxY = p.y;
    });

    const width = maxX - minX;
    const height = maxY - minY;

    return { length, width, height };
  };

  // Calcul d'un score un peu plus malin
  const validate = () => {
    const { length, width, height } = measureDrawing();

    if (length < 50 || width < 10 || height < 10) {
      setScore(0);
      setStep("result");
      return;
    }

    const targetLen = shape.idealLength;
    const targetAspect = shape.aspect;

    const aspect = height === 0 ? 1 : width / height;

    // similarité longueur (0..1)
    const lenRatio =
      targetLen === 0
        ? 0
        : Math.min(length, targetLen) / Math.max(length, targetLen);

    // similarité proportions (0..1)
    const aspRatio =
      targetAspect === 0
        ? 0
        : Math.min(aspect, targetAspect) / Math.max(aspect, targetAspect);

    // pondération : 60% longueur, 40% proportions
    let rawScore = lenRatio * 0.6 + aspRatio * 0.4;

    // un peu de tolérance
    rawScore = Math.max(0, Math.min(1, rawScore));

    const final = Math.round(rawScore * 100);
    setScore(final);
    setStep("result");
  };

  return (
    <View style={s.wrap}>
      <Text style={s.title}>🌑 Défi des Ombres</Text>

      {/* ETAPE 1 : Joueur A regarde la forme */}
      {step === "view" && (
        <>
          <Text style={s.subtitle}>Joueur A : mémorise la forme</Text>
          <View style={s.shadowBox}>
            <Text style={s.shadowEmoji}>{shape.emoji}</Text>
          </View>
          <Text style={s.help}>
            Regarde bien la silhouette, puis passe le téléphone au joueur B.
          </Text>

          <Pressable style={s.btnMain} onPress={() => setStep("draw")}>
            <Text style={s.btnText}>Ok, j'ai vu</Text>
          </Pressable>
        </>
      )}

      {/* ETAPE 2 : Joueur B dessine */}
      {step === "draw" && (
        <>
          <Text style={s.subtitle}>Joueur B : dessine la forme au doigt</Text>

          <View
            style={s.canvas}
            onStartShouldSetResponder={() => true}
            onResponderGrant={handleStart}
            onResponderMove={handleMove}
            onResponderRelease={handleEnd}
          >
            {paths.map((path, i) =>
              path.map((p, j) => (
                <View
                  key={`${i}-${j}`}
                  style={[s.dot, { left: p.x - 2, top: p.y - 2 }]}
                />
              ))
            )}
            {currentPath &&
              currentPath.map((p, j) => (
                <View
                  key={`cur-${j}`}
                  style={[s.dot, { left: p.x - 2, top: p.y - 2 }]}
                />
              ))}
          </View>

          <View style={s.row}>
            <Pressable style={[s.btn, s.btnGhost]} onPress={resetDrawing}>
              <Text style={s.btnText}>Effacer</Text>
            </Pressable>
            <Pressable style={[s.btn, s.btnMain]} onPress={validate}>
              <Text style={s.btnText}>Valider</Text>
            </Pressable>
          </View>
        </>
      )}

      {/* ETAPE 3 : Résultat */}
      {step === "result" && (
        <>
          <Text style={s.subtitle}>Résultat du défi</Text>

          <View style={s.resultRow}>
            <View style={s.shadowBoxSmall}>
              <Text style={s.shadowEmojiSmall}>{shape.emoji}</Text>
              <Text style={s.smallLabel}>Forme à reproduire</Text>
            </View>

            <View style={s.canvasSmall}>
              {paths.map((path, i) =>
                path.map((p, j) => (
                  <View
                    key={`${i}-${j}`}
                    style={[s.dotSmall, { left: p.x / 4, top: p.y / 4 }]}
                  />
                ))
              )}
              {currentPath &&
                currentPath.map((p, j) => (
                  <View
                    key={`cur-${j}`}
                    style={[s.dotSmall, { left: p.x / 4, top: p.y / 4 }]}
                  />
                ))}
              <Text style={s.smallLabel}>Ton dessin</Text>
            </View>
          </View>

          <Text style={s.scoreText}>{score}% de ressemblance</Text>
          <Text style={s.comment}>
            Perdant = celui qui a la moins bonne précision.
          </Text>

          <Pressable
            style={s.btnMain}
            onPress={() => {
              setPaths([]);
              setCurrentPath(null);
              setScore(null);
              setStep("view");
            }}
          >
            <Text style={s.btnText}>Rejouer une autre ombre</Text>
          </Pressable>

          <Pressable
            style={[s.btn, s.btnGhost, { marginTop: 10 }]}
            onPress={() => navigation.goBack()}
          >
            <Text style={s.btnText}>Retour</Text>
          </Pressable>
        </>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  wrap: {
    flex: 1,
    backgroundColor: "#050505",
    paddingTop: 40,
    paddingHorizontal: 16,
    alignItems: "center",
  },
  title: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "900",
    marginBottom: 10,
  },
  subtitle: {
    color: "#ddd",
    fontSize: 16,
    marginBottom: 10,
    textAlign: "center",
  },
  help: {
    color: "#888",
    fontSize: 13,
    textAlign: "center",
    marginHorizontal: 20,
    marginBottom: 16,
  },
  shadowBox: {
    width: 220,
    height: 220,
    borderRadius: 16,
    backgroundColor: "#111",
    borderWidth: 2,
    borderColor: "#333",
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 12,
  },
  shadowEmoji: {
    fontSize: 120,
    color: "#fff",
  },
  btnMain: {
    backgroundColor: "#21c997",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 999,
    marginTop: 8,
  },
  btn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
  },
  btnGhost: {
    backgroundColor: "#222",
  },
  btnText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 14,
  },
  canvas: {
    width: "100%",
    height: 260,
    borderRadius: 16,
    backgroundColor: "#f4f4f4",
    marginTop: 10,
    position: "relative",
    overflow: "hidden",
  },
  dot: {
    position: "absolute",
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#111",
  },
  row: {
    flexDirection: "row",
    gap: 12,
    marginTop: 12,
  },
  resultRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginVertical: 18,
  },
  shadowBoxSmall: {
    width: 140,
    height: 140,
    borderRadius: 12,
    backgroundColor: "#111",
    borderWidth: 1,
    borderColor: "#333",
    alignItems: "center",
    justifyContent: "center",
  },
  shadowEmojiSmall: {
    fontSize: 60,
  },
  smallLabel: {
    color: "#aaa",
    fontSize: 11,
    marginTop: 4,
    textAlign: "center",
  },
  canvasSmall: {
    width: 140,
    height: 140,
    borderRadius: 12,
    backgroundColor: "#f4f4f4",
    overflow: "hidden",
    position: "relative",
    alignItems: "center",
    justifyContent: "flex-end",
    paddingBottom: 4,
  },
  dotSmall: {
    position: "absolute",
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: "#111",
  },
  scoreText: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "900",
    marginBottom: 4,
  },
  comment: {
    color: "#bbb",
    fontSize: 13,
    textAlign: "center",
    marginBottom: 12,
  },
});
