// src/minigames/TiltGolf.js
import React, { useEffect, useRef, useState } from "react";
import { View, Text, Pressable, StyleSheet, Dimensions } from "react-native";
import { Accelerometer } from "expo-sensors";

const { width: SCREEN_W } = Dimensions.get("window");
const GAME_W = Math.min(320, SCREEN_W - 32); // plateau centré
const GAME_H = 480;
const BALL_R = 14;
const HOLE_R = 20;

export default function TiltGolf({ navigation }) {
  const [pos, setPos] = useState({ x: GAME_W / 2, y: GAME_H - 80 });
  const [jumpZ, setJumpZ] = useState(0); // hauteur de saut (visuel)
  const [message, setMessage] = useState("Incline ton tel pour bouger la balle");
  const vel = useRef({ vx: 0, vy: 0 });
  const accel = useRef({ ax: 0, ay: 0 });
  const rafId = useRef(null);

  const hole = { x: GAME_W / 2, y: 60 };

  // Abonnement accéléromètre
  useEffect(() => {
    Accelerometer.setUpdateInterval(16);
    const sub = Accelerometer.addListener(({ x, y }) => {
      // Ajustement axes (à tweaker selon ton device)
      accel.current.ax = -x; // gauche/droite
      accel.current.ay = y;  // avant/arrière
    });

    return () => {
      sub && sub.remove();
    };
  }, []);

  // Boucle physique
  useEffect(() => {
    let lastTime = Date.now();

    const loop = () => {
      const now = Date.now();
      const dt = (now - lastTime) / 1000; // en secondes
      lastTime = now;

      const a = accel.current;
      const v = vel.current;

      const ACC_FACTOR = 250; // sensibilité
      const FRICTION = 0.92;

      v.vx += a.ax * ACC_FACTOR * dt;
      v.vy += a.ay * ACC_FACTOR * dt;

      v.vx *= FRICTION;
      v.vy *= FRICTION;

      setPos(prev => {
        let x = prev.x + v.vx * dt;
        let y = prev.y + v.vy * dt;

        // collisions bords
        if (x < BALL_R) {
          x = BALL_R;
          v.vx *= -0.4;
        }
        if (x > GAME_W - BALL_R) {
          x = GAME_W - BALL_R;
          v.vx *= -0.4;
        }
        if (y < BALL_R) {
          y = BALL_R;
          v.vy *= -0.4;
        }
        if (y > GAME_H - BALL_R) {
          y = GAME_H - BALL_R;
          v.vy *= -0.4;
        }

        // check trou (si pas en plein saut)
        const dx = x - hole.x;
        const dy = y - hole.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < HOLE_R - 4 && jumpZ <= 0.5) {
          setMessage("🏆 Trou ! L'autre boit 😈");
          // on "colle" la balle dans le trou
          return { x: hole.x, y: hole.y };
        }

        return { x, y };
      });

      // gestion saut visuel (petit arc)
      setJumpZ(z => {
        if (z <= 0) return 0;
        return z - dt * 3; // redescend
      });

      rafId.current = requestAnimationFrame(loop);
    };

    loop();
    return () => {
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, [hole.x, hole.y, jumpZ]);

  // bouton SAUT : petit boost + arc visuel
  const handleJump = () => {
    // si déjà en l'air on ignore
    if (jumpZ > 0.1) return;
    vel.current.vy -= 200;  // petit coup vers le haut (tu peux changer)
    setJumpZ(1);            // lance l'arc de saut
  };

  const resetGame = () => {
    vel.current = { vx: 0, vy: 0 };
    setPos({ x: GAME_W / 2, y: GAME_H - 80 });
    setJumpZ(0);
    setMessage("Incline ton tel pour bouger la balle");
  };

  // hauteur verticale transformée en offset + scale pour fake 3D
  const zOffset = -jumpZ * 18;         // monte visuellement
  const scale = 1 + jumpZ * 0.1;       // balle un peu plus grosse quand elle “s'approche”

  return (
    <View style={s.wrap}>
      <Text style={s.title}>⛳ Tilt Golf</Text>
      <Text style={s.subtitle}>Bouge ton téléphone pour guider la balle.</Text>

      <View style={s.gameArea}>
        {/* trou */}
        <View
          style={[
            s.hole,
            {
              left: hole.x - HOLE_R,
              top: hole.y - HOLE_R,
              width: HOLE_R * 2,
              height: HOLE_R * 2,
              borderRadius: HOLE_R,
            },
          ]}
        />

        {/* ombre de la balle */}
        <View
          style={[
            s.shadow,
            {
              left: pos.x - BALL_R,
              top: pos.y - BALL_R + 6, // légère ombre
              opacity: 0.4 + jumpZ * 0.1,
            },
          ]}
        />

        {/* balle */}
        <View
          style={[
            s.ball,
            {
              left: pos.x - BALL_R,
              top: pos.y - BALL_R + zOffset,
              transform: [{ scale }],
            },
          ]}
        />
      </View>

      <Text style={s.msg}>{message}</Text>

      <View style={s.buttonsRow}>
        <Pressable style={[s.btn, s.btnJump]} onPress={handleJump}>
          <Text style={s.btnText}>Saut</Text>
        </Pressable>
        <Pressable style={[s.btn, s.btnReset]} onPress={resetGame}>
          <Text style={s.btnText}>Reset</Text>
        </Pressable>
        <Pressable
          style={[s.btn, s.btnBack]}
          onPress={() => navigation.goBack()}
        >
          <Text style={s.btnText}>Retour</Text>
        </Pressable>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: {
    flex: 1,
    backgroundColor: "#000",
    paddingTop: 40,
    alignItems: "center",
  },
  title: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "900",
  },
  subtitle: {
    color: "#aaa",
    fontSize: 13,
    marginTop: 4,
    marginBottom: 10,
  },
  gameArea: {
    width: GAME_W,
    height: GAME_H,
    borderRadius: 24,
    backgroundColor: "#02151b",
    borderWidth: 3,
    borderColor: "#0ff",
    overflow: "hidden",
    marginTop: 10,
  },
  hole: {
    position: "absolute",
    backgroundColor: "#000",
    borderWidth: 2,
    borderColor: "#0ff",
  },
  ball: {
    position: "absolute",
    width: BALL_R * 2,
    height: BALL_R * 2,
    borderRadius: BALL_R,
    backgroundColor: "#ffd43b",
    borderWidth: 2,
    borderColor: "#ffa94d",
  },
  shadow: {
    position: "absolute",
    width: BALL_R * 2,
    height: BALL_R * 2,
    borderRadius: BALL_R,
    backgroundColor: "#000",
  },
  msg: {
    color: "#fff",
    fontSize: 14,
    marginTop: 12,
    textAlign: "center",
    paddingHorizontal: 20,
  },
  buttonsRow: {
    flexDirection: "row",
    marginTop: 18,
    gap: 10,
  },
  btn: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
  },
  btnJump: {
    backgroundColor: "#e8590c",
  },
  btnReset: {
    backgroundColor: "#228be6",
  },
  btnBack: {
    backgroundColor: "#343a40",
  },
  btnText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 14,
  },
});
