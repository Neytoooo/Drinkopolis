import React, { useRef, useState, useEffect } from "react";
import { View, PanResponder, Animated, Text, StyleSheet } from "react-native";

export default function AirHockey() {
  const [scoreL, setScoreL] = useState(0);
  const [scoreR, setScoreR] = useState(0);

  const ball = useRef(new Animated.ValueXY({ x: 180, y: 300 })).current;
  const ballSpeed = useRef({ x: 4, y: 4 }).current;

  const leftPos = useRef(new Animated.ValueXY({ x: 100, y: 500 })).current;
  const rightPos = useRef(new Animated.ValueXY({ x: 250, y: 100 })).current;

  /** Gestion du déplacement des joueurs **/
  const createDrag = (obj) =>
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, g) => {
        obj.setValue({ x: g.moveX - 40, y: g.moveY - 40 });
      },
    });

  const dragL = createDrag(leftPos);
  const dragR = createDrag(rightPos);

  /** Boucle d’animation du palet **/
  useEffect(() => {
    const interval = setInterval(() => {
      ball.setValue({
        x: ball.x._value + ballSpeed.x,
        y: ball.y._value + ballSpeed.y,
      });

      const bx = ball.x._value;
      const by = ball.y._value;

      // Rebonds murs
      if (bx <= 0 || bx >= 350) ballSpeed.x *= -1;
      if (by <= 0 || by >= 650) ballSpeed.y *= -1;

      // Collision avec joueurs
      const hit = (p) =>
        Math.abs(p.x._value - bx) < 50 && Math.abs(p.y._value - by) < 50;

      if (hit(leftPos)) ballSpeed.y = -Math.abs(ballSpeed.y);
      if (hit(rightPos)) ballSpeed.y = Math.abs(ballSpeed.y);

      // But en haut = point joueur bas
      if (by < 10) {
        setScoreL((s) => s + 1);
        resetBall();
      }

      // But en bas = point joueur haut
      if (by > 690) {
        setScoreR((s) => s + 1);
        resetBall();
      }
    }, 16);

    return () => clearInterval(interval);
  }, []);

  const resetBall = () => {
    ball.setValue({ x: 180, y: 300 });
    ballSpeed.x = (Math.random() > 0.5 ? 1 : -1) * 4;
    ballSpeed.y = (Math.random() > 0.5 ? 1 : -1) * 4;
  };

  return (
    <View style={s.wrap}>
      <Text style={s.score}>{scoreL} — {scoreR}</Text>

      <Animated.View
        style={[s.ball, { transform: ball.getTranslateTransform() }]}
      />

      <Animated.View
        {...dragL.panHandlers}
        style={[s.paletL, { transform: leftPos.getTranslateTransform() }]}
      />

      <Animated.View
        {...dragR.panHandlers}
        style={[s.paletR, { transform: rightPos.getTranslateTransform() }]}
      />
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: "black" },
  score: {
    color: "white",
    fontSize: 40,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 20,
  },
  ball: {
    width: 20,
    height: 20,
    backgroundColor: "yellow",
    borderRadius: 20,
    position: "absolute",
  },
  paletL: {
    width: 80, height: 80,
    borderRadius: 50,
    backgroundColor: "#00a8e8",
    position: "absolute",
  },
  paletR: {
    width: 80, height: 80,
    borderRadius: 50,
    backgroundColor: "#e71d36",
    position: "absolute",
  },
});
