// src/minigames/TiltGolf.js
import React, { useEffect, useRef, useState } from "react";
import { View, Text, Pressable, StyleSheet, Dimensions } from "react-native";
import { Accelerometer } from "expo-sensors";
import { Image, ImageBackground } from "expo-image";

const { width: SCREEN_W } = Dimensions.get("window");
const GAME_W = Math.min(320, SCREEN_W - 32);
const GAME_H = 480;

const BALL_SIZE = 28;
const BALL_R = BALL_SIZE / 2;
const HOLE_R = 20;

/* ---------------------------------------------------------
   TEXTURES
--------------------------------------------------------- */
const GRASS_TEXTURE = require("../../assets/tiles/grass.jpg");
const BALL_TEXTURE = require("../../assets/tiles/ball.png");


/* ---------------------------------------------------------
   UTILS
--------------------------------------------------------- */
const rand = (min, max) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

const rectsOverlap = (a, b) =>
  !(a.x + a.w <= b.x || b.x + b.w <= a.x || a.y + a.h <= b.y || b.y + b.h <= a.y);

const pointInsideRect = (px, py, r, margin = 0) =>
  px > r.x - margin &&
  px < r.x + r.w + margin &&
  py > r.y - margin &&
  py < r.y + r.h + margin;

/* ---------------------------------------------------------
   PATTERNS
--------------------------------------------------------- */
const RAW_PATTERNS = [
  {
    name: "L-horizontal",
    rects: [
      { x: 0, y: 0, w: 160, h: 18 },
      { x: 0, y: 0, w: 18, h: 120 },
    ],
  },
  {
    name: "L-vertical",
    rects: [
      { x: 0, y: 0, w: 18, h: 140 },
      { x: 0, y: 122, w: 150, h: 18 },
    ],
  },
  {
    name: "T",
    rects: [
      { x: 0, y: 0, w: 160, h: 18 },
      { x: 71, y: 0, w: 18, h: 120 },
    ],
  },
  {
    name: "Double",
    rects: [
      { x: 0, y: 0, w: 180, h: 18 },
      { x: 0, y: 60, w: 180, h: 18 },
    ],
  },
  {
    name: "Couloir",
    rects: [
      { x: 0, y: 0, w: 18, h: 160 },
      { x: 90, y: 0, w: 18, h: 160 },
    ],
  },
];

const PATTERNS = RAW_PATTERNS.map((p) => {
  const maxX = Math.max(...p.rects.map((r) => r.x + r.w));
  const maxY = Math.max(...p.rects.map((r) => r.y + r.h));
  return { ...p, width: maxX, height: maxY };
});

/* ---------------------------------------------------------
   GENERATION 10 NIVEAUX
--------------------------------------------------------- */
function generateLevels(count = 10) {
  const levels = [];

  for (let i = 0; i < count; i++) {
    const start = {
      x: rand(40, GAME_W - 40),
      y: rand(GAME_H - 120, GAME_H - 60),
    };

    const hole = {
      x: rand(40, GAME_W - 40),
      y: rand(40, 120),
    };

    const obstacles = [];

    // Add patterns
    const patternCount = rand(1, 3);
    for (let pIndex = 0; pIndex < patternCount; pIndex++) {
      const tpl = PATTERNS[rand(0, PATTERNS.length - 1)];
      let placed = false;

      for (let tries = 0; tries < 10 && !placed; tries++) {
        const px = rand(20, GAME_W - tpl.width - 20);
        const py = rand(120, GAME_H - tpl.height - 120);

        const candidate = tpl.rects.map((r) => ({
          x: px + r.x,
          y: py + r.y,
          w: r.w,
          h: r.h,
        }));

        let collision = false;

        for (const c of candidate) {
          if (
            pointInsideRect(start.x, start.y, c, 40) ||
            pointInsideRect(hole.x, hole.y, c, 40)
          ) {
            collision = true;
            break;
          }

          for (const exist of obstacles) {
            if (rectsOverlap(c, exist)) {
              collision = true;
              break;
            }
          }

          if (collision) break;
        }

        if (!collision) {
          obstacles.push(...candidate);
          placed = true;
        }
      }
    }

    // Ronds mobiles
    const movers = [];

    if (i >= 1) {
      const pushCount = rand(1, 2);
      for (let j = 0; j < pushCount; j++) {
        movers.push({
          kind: "push",
          axis: Math.random() < 0.5 ? "x" : "y",
          x: rand(40, GAME_W - 40),
          y: rand(140, GAME_H - 140),
          range: rand(30, 60),
          speed: Math.random() * 1.4 + 0.5,
          r: rand(10, 16),
        });
      }
    }

    if (i >= 3) {
      const danCount = rand(1, 2);
      for (let j = 0; j < danCount; j++) {
        movers.push({
          kind: "danger",
          axis: Math.random() < 0.5 ? "x" : "y",
          x: rand(40, GAME_W - 40),
          y: rand(140, GAME_H - 140),
          range: rand(25, 60),
          speed: Math.random() * 1.6 + 0.8,
          r: rand(12, 18),
        });
      }
    }

    levels.push({
      name: `Niveau ${i + 1}`,
      start,
      hole,
      obstacles,
      movers,
    });
  }

  return levels;
}

const LEVELS = generateLevels(10);

/* ---------------------------------------------------------
   COMPONENT
--------------------------------------------------------- */
export default function TiltGolf({ navigation }) {
  const [levelIndex, setLevelIndex] = useState(0);
  const [pos, setPos] = useState(LEVELS[0].start);
  const [jumpZ, setJumpZ] = useState(0);
  const [message, setMessage] = useState("Incline ton téléphone !");
  const vel = useRef({ vx: 0, vy: 0 });
  const accel = useRef({ ax: 0, ay: 0 });
  const rafId = useRef(null);
  const timeRef = useRef(0);
  const rotationRef = useRef(0); // angle visuel

  const currentLevel = LEVELS[levelIndex];
  const hole = currentLevel.hole;

  /* ---------------------------------------------------------
     GYRO
  --------------------------------------------------------- */
  useEffect(() => {
    Accelerometer.setUpdateInterval(16);
    const sub = Accelerometer.addListener(({ x, y }) => {
      accel.current.ax = -x * 1.4;
      accel.current.ay = y * 1.4;
    });
    return () => sub && sub.remove();
  }, []);

  /* ---------------------------------------------------------
     LOOP
  --------------------------------------------------------- */
  useEffect(() => {
    let last = Date.now();

    const loop = () => {
      const now = Date.now();
      const dt = (now - last) / 1000;
      last = now;

      const a = accel.current;
      const v = vel.current;

      const ACC_FACTOR = 430;
      const FRICTION = 0.965;
      const MAX_SPEED = 900;

      v.vx += a.ax * ACC_FACTOR * dt;
      v.vy += a.ay * ACC_FACTOR * dt;

      v.vx *= FRICTION;
      v.vy *= FRICTION;

      v.vx = Math.max(-MAX_SPEED, Math.min(MAX_SPEED, v.vx));
      v.vy = Math.max(-MAX_SPEED, Math.min(MAX_SPEED, v.vy));

      // rotation réaliste
      const speed = Math.sqrt(v.vx * v.vx + v.vy * v.vy);
      rotationRef.current += speed * dt * 0.08 * (jumpZ > 0 ? 0.4 : 1);

      // position + collisions
      setPos((prev) => {
        let x = prev.x + v.vx * dt;
        let y = prev.y + v.vy * dt;

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

        for (const o of currentLevel.obstacles) {
          if (
            x > o.x - BALL_R &&
            x < o.x + o.w + BALL_R &&
            y > o.y - BALL_R &&
            y < o.y + o.h + BALL_R
          ) {
            const cx = o.x + o.w / 2;
            const cy = o.y + o.h / 2;
            const dx = x - cx;
            const dy = y - cy;
            if (Math.abs(dx) > Math.abs(dy)) {
              v.vx *= -0.6;
              x = dx > 0 ? o.x + o.w + BALL_R : o.x - BALL_R;
            } else {
              v.vy *= -0.6;
              y = dy > 0 ? o.y + o.h + BALL_R : o.y - BALL_R;
            }
          }
        }

        const t = timeRef.current + dt;
        timeRef.current = t;

        for (const m of currentLevel.movers) {
          const phase = t * m.speed;
          const offset = Math.sin(phase) * m.range;
          const cx = m.axis === "x" ? m.x + offset : m.x;
          const cy = m.axis === "y" ? m.y + offset : m.y;

          const dx = x - cx;
          const dy = y - cy;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const minDist = BALL_R + m.r;

          if (dist < minDist) {
            const nx = dx / dist;
            const ny = dy / dist;

            const FORCE = m.kind === "danger" ? 900 : 400;
            v.vx += nx * FORCE;
            v.vy += ny * FORCE;

            x = cx + nx * (minDist + 1);
            y = cy + ny * (minDist + 1);

            setMessage(m.kind === "danger" ? "💥 Danger !" : "🔵 Poussé !");
          }
        }

        const dxh = x - hole.x;
        const dyh = y - hole.y;
        if (Math.sqrt(dxh * dxh + dyh * dyh) < HOLE_R - 4 && jumpZ <= 0) {
          handleLevelComplete();
          return { x: hole.x, y: hole.y };
        }

        return { x, y };
      });

      setJumpZ((z) => (z <= 0 ? 0 : z - dt * 2));

      rafId.current = requestAnimationFrame(loop);
    };

    loop();
    return () => rafId.current && cancelAnimationFrame(rafId.current);
  }, [levelIndex]);

  /* ---------------------------------------------------------
     LEVELS
  --------------------------------------------------------- */
  const loadLevel = (index) => {
    setLevelIndex(index);
    vel.current = { vx: 0, vy: 0 };
    timeRef.current = 0;
    rotationRef.current = 0;
    setPos(LEVELS[index].start);
    setJumpZ(0);
    setMessage(`📍 ${LEVELS[index].name}`);
  };

  const handleLevelComplete = () => {
    setMessage("🏆 Niveau réussi !");
    setTimeout(() => {
      const next = levelIndex + 1;
      if (next >= LEVELS.length) {
        setMessage("🎉 Terminé !");
        return;
      }
      loadLevel(next);
    }, 900);
  };

  /* ---------------------------------------------------------
     JUMP
  --------------------------------------------------------- */
  const handleJump = () => {
    if (jumpZ > 0.1) return;
    vel.current.vx += accel.current.ax * 180;
    vel.current.vy += accel.current.ay * 180;
    setJumpZ(1.4);
  };

  const resetGame = () => loadLevel(levelIndex);

  /* ---------------------------------------------------------
     VISUALS
  --------------------------------------------------------- */
  const zOffset = -jumpZ * 26;
  const scale = 1 + jumpZ * 0.15;

  return (
    <View style={s.wrap}>
      <Text style={s.title}>⛳ Tilt Golf</Text>
      <Text style={s.subtitle}>{currentLevel.name}</Text>

      <ImageBackground
        source={BALL_TEXTURE}
        contentFit="cover"
        style={s.gameArea}
      >
        {/* Static walls */}
        {currentLevel.obstacles.map((o, i) => (
          <View
            key={i}
            style={{
              position: "absolute",
              left: o.x,
              top: o.y,
              width: o.w,
              height: o.h,
              backgroundColor: "rgba(0,255,255,0.35)",
              borderColor: "#0ff",
              borderWidth: 1,
            }}
          />
        ))}

        {/* Movers */}
        {currentLevel.movers.map((m, i) => {
          const t = timeRef.current;
          const offset = Math.sin(t * m.speed) * m.range;
          const cx = m.axis === "x" ? m.x + offset : m.x;
          const cy = m.axis === "y" ? m.y + offset : m.y;

          return (
            <View
              key={i}
              style={{
                position: "absolute",
                left: cx - m.r,
                top: cy - m.r,
                width: m.r * 2,
                height: m.r * 2,
                borderRadius: m.r,
                backgroundColor: m.kind === "danger" ? "#ff4b4b" : "#22b8cf",
                borderWidth: 2,
                borderColor: m.kind === "danger" ? "#ff8787" : "#66d9e8",
              }}
            />
          );
        })}

        {/* Hole */}
        <View
          style={[
            s.hole,
            {
              left: hole.x - HOLE_R,
              top: hole.y - HOLE_R,
              width: HOLE_R * 2,
              height: HOLE_R * 2,
            },
          ]}
        />

        {/* Ball */}
        <Image
          source={GRASS_TEXTURE}
          style={{
            position: "absolute",
            width: BALL_SIZE,
            height: BALL_SIZE,
            left: pos.x - BALL_R,
            top: pos.y - BALL_R + zOffset,
            transform: [
              { scale },
              { rotate: `${rotationRef.current}rad` },
            ],
          }}
          contentFit="contain"
        />
      </ImageBackground>

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

/* ---------------------------------------------------------
   STYLES
--------------------------------------------------------- */
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
    color: "#0ff",
    fontSize: 14,
    marginBottom: 10,
    fontWeight: "800",
  },
  gameArea: {
    width: GAME_W,
    height: GAME_H,
    borderRadius: 24,
    overflow: "hidden",
    borderColor: "#0ff",
    borderWidth: 3,
    marginTop: 10,
  },
  hole: {
    position: "absolute",
    backgroundColor: "#000",
    borderRadius: 999,
    borderWidth: 2,
    borderColor: "#0ff",
  },
  msg: {
    color: "#fff",
    marginTop: 12,
    fontSize: 14,
    textAlign: "center",
  },
  buttonsRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 18,
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

