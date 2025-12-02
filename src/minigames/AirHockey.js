import React, { useRef, useState, useEffect } from "react";
import {
  View,
  PanResponder,
  Animated,
  Text,
  StyleSheet,
  Dimensions,
} from "react-native";
import { Image } from "expo-image";

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get("window");

// tailles adaptées à tes assets
const PALLET_SIZE = 100;
const PUCK_SIZE = 40;

const PALET_RADIUS = PALLET_SIZE / 2;
const PUCK_RADIUS = PUCK_SIZE / 2;

// friction (plus proche de l’air hockey)
const FRICTION = 0.985;
const MIN_SPEED = 5; // en dessous : la balle s’arrête
const MAX_SPEED = 2200; // limite anti-bug

// zone de but (demi-cercle au centre)
const GOAL_RADIUS = SCREEN_W * 0.22;
const GOAL_CENTER_X = SCREEN_W / 2;

// helpers
const dist2D = (x1, y1, x2, y2) =>
  Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2));

export default function AirHockey() {
  const [scoreL, setScoreL] = useState(0); // bas
  const [scoreR, setScoreR] = useState(0); // haut
  const [gameOver, setGameOver] = useState(false);

  // textures — mets bien ces fichiers dans assets/texture
  const FIELD_TEXTURE = require("../../assets/texture/airhockey_field.png");
  const PALET_BLUE = require("../../assets/texture/airhockey_blue.png");
  const PALET_RED = require("../../assets/texture/airhockey_red.png");
  const PUCK_TEXTURE = require("../../assets/texture/airhockey_puck.png");

  // pos = coin haut-gauche des éléments
  const ball = useRef(
    new Animated.ValueXY({
      x: SCREEN_W / 2 - PUCK_RADIUS,
      y: SCREEN_H / 2 - PUCK_RADIUS,
    })
  ).current;
  const ballSpeed = useRef({ vx: 0, vy: 0 }).current;

  const leftPos = useRef(
    new Animated.ValueXY({
      x: SCREEN_W / 2 - PALET_RADIUS,
      y: SCREEN_H - 140,
    })
  ).current; // joueur bas
  const rightPos = useRef(
    new Animated.ValueXY({
      x: SCREEN_W / 2 - PALET_RADIUS,
      y: 40,
    })
  ).current; // joueur haut

  // pour calculer la vitesse des palets
  const lastLeftCenter = useRef({
    x: SCREEN_W / 2,
    y: SCREEN_H - 140 + PALET_RADIUS,
  });
  const lastRightCenter = useRef({
    x: SCREEN_W / 2,
    y: 40 + PALET_RADIUS,
  });
  const leftVel = useRef({ vx: 0, vy: 0 }).current;
  const rightVel = useRef({ vx: 0, vy: 0 }).current;

  const rafId = useRef(null);

  // limite la position Y d’un palet à sa moitié de terrain
  const clampPalletY = (y, isTop) => {
    if (isTop) {
      // joueur haut
      const maxY = SCREEN_H / 2 - PALLET_SIZE;
      return Math.min(Math.max(y, 0), maxY);
    } else {
      // joueur bas
      const minY = SCREEN_H / 2;
      const maxY = SCREEN_H - PALLET_SIZE;
      return Math.min(Math.max(y, minY), maxY);
    }
  };

  const createDrag = (obj, isTop) =>
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, g) => {
        let x = g.moveX - PALET_RADIUS;
        let y = g.moveY - PALET_RADIUS;

        x = Math.min(Math.max(x, 0), SCREEN_W - PALLET_SIZE);
        y = clampPalletY(y, isTop);

        obj.setValue({ x, y });
      },
    });

  const dragL = createDrag(leftPos, false);
  const dragR = createDrag(rightPos, true);

  // spawn de la balle dans un camp
  const spawnBall = (side) => {
    // side: "top" ou "bottom"
    let x = SCREEN_W / 2 - PUCK_RADIUS;
    let y;

    if (side === "top") {
      y = SCREEN_H / 4 - PUCK_RADIUS;
    } else {
      y = (SCREEN_H * 3) / 4 - PUCK_RADIUS;
    }

    ball.setValue({ x, y });
    ballSpeed.vx = 0;
    ballSpeed.vy = 0;
  };

  // spawn initial aléatoire
  useEffect(() => {
    const randomSide = Math.random() < 0.5 ? "top" : "bottom";
    spawnBall(randomSide);
  }, []);

  // boucle principale avec requestAnimationFrame
  useEffect(() => {
    let lastTime = Date.now();

    const loop = () => {
      const now = Date.now();
      const dt = (now - lastTime) / 1000;
      lastTime = now;

      if (!gameOver) {
        stepPhysics(dt);
      }

      rafId.current = requestAnimationFrame(loop);
    };

    rafId.current = requestAnimationFrame(loop);
    return () => {
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, [gameOver]);

  const stepPhysics = (dt) => {
    // récupérer centre du puck
    let bx = ball.x._value + PUCK_RADIUS;
    let by = ball.y._value + PUCK_RADIUS;

    // mettre à jour la vitesse des palets (centres)
    const lc = {
      x: leftPos.x._value + PALET_RADIUS,
      y: leftPos.y._value + PALET_RADIUS,
    };
    const rc = {
      x: rightPos.x._value + PALET_RADIUS,
      y: rightPos.y._value + PALET_RADIUS,
    };

    if (dt > 0) {
      leftVel.vx = (lc.x - lastLeftCenter.current.x) / dt;
      leftVel.vy = (lc.y - lastLeftCenter.current.y) / dt;

      rightVel.vx = (rc.x - lastRightCenter.current.x) / dt;
      rightVel.vy = (rc.y - lastRightCenter.current.y) / dt;
    }

    lastLeftCenter.current = lc;
    lastRightCenter.current = rc;

    // appliquer friction sur la balle
    let vx = ballSpeed.vx * FRICTION;
    let vy = ballSpeed.vy * FRICTION;

    const speed = Math.sqrt(vx * vx + vy * vy);
    if (speed < MIN_SPEED) {
      vx = 0;
      vy = 0;
    }

    // limiter la vitesse max
    if (speed > MAX_SPEED) {
      const factor = MAX_SPEED / speed;
      vx *= factor;
      vy *= factor;
    }

    // intégrer position
    bx += vx * dt;
    by += vy * dt;

    // murs gauche/droite
    if (bx - PUCK_RADIUS <= 0) {
      bx = PUCK_RADIUS;
      vx = Math.abs(vx);
    } else if (bx + PUCK_RADIUS >= SCREEN_W) {
      bx = SCREEN_W - PUCK_RADIUS;
      vx = -Math.abs(vx);
    }

    // murs haut/bas (hors zone de but)
    // top
    const inTopGoalCorridor = Math.abs(bx - GOAL_CENTER_X) < GOAL_RADIUS;
    if (by - PUCK_RADIUS <= 0) {
      if (inTopGoalCorridor) {
        handleGoal("bottom"); // point pour bas (scoreL)
        return;
      } else {
        by = PUCK_RADIUS;
        vy = Math.abs(vy);
      }
    }

    // bottom
    const inBottomGoalCorridor = Math.abs(bx - GOAL_CENTER_X) < GOAL_RADIUS;
    if (by + PUCK_RADIUS >= SCREEN_H) {
      if (inBottomGoalCorridor) {
        handleGoal("top"); // point pour haut (scoreR)
        return;
      } else {
        by = SCREEN_H - PUCK_RADIUS;
        vy = -Math.abs(vy);
      }
    }

    // collisions rondes avec palet bas
    const distBlue = dist2D(lc.x, lc.y, bx, by);
    if (distBlue < PALET_RADIUS + PUCK_RADIUS) {
      applyPaddleHit({ cx: lc.x, cy: lc.y, vx: leftVel.vx, vy: leftVel.vy }, { bx, by }, { vx, vy });
      // récup après modif
      vx = ballSpeed.vx;
      vy = ballSpeed.vy;
    }

    // collisions rondes avec palet haut
    const distRed = dist2D(rc.x, rc.y, bx, by);
    if (distRed < PALET_RADIUS + PUCK_RADIUS) {
      applyPaddleHit({ cx: rc.x, cy: rc.y, vx: rightVel.vx, vy: rightVel.vy }, { bx, by }, { vx, vy });
      vx = ballSpeed.vx;
      vy = ballSpeed.vy;
    }

    // write back vitesses & position
    ballSpeed.vx = vx;
    ballSpeed.vy = vy;

    ball.setValue({
      x: bx - PUCK_RADIUS,
      y: by - PUCK_RADIUS,
    });
  };

  // applique un impact réaliste d’un palet sur le puck
  const applyPaddleHit = (paddle, ballCenter, currentSpeed) => {
    const { cx, cy, vx: pvx, vy: pvy } = paddle;
    const { bx, by } = ballCenter;

    let nx = bx - cx;
    let ny = by - cy;
    const len = Math.sqrt(nx * nx + ny * ny) || 1;
    nx /= len;
    ny /= len;

    // composante relative sur la normale
    let rvx = currentSpeed.vx - pvx;
    let rvy = currentSpeed.vy - pvy;
    const dot = rvx * nx + rvy * ny;

    // si on s’éloigne déjà, pas de rebond
    if (dot > 0) return;

    // coefficient pour la force d’impact
    const IMPACT = 0.5;
    const j = -(1.5 * dot) * IMPACT;

    // nouvelle vitesse = ancienne + impulsion + un peu de vitesse du palet
    ballSpeed.vx = currentSpeed.vx + (-j * nx) + pvx * 0.2;
    ballSpeed.vy = currentSpeed.vy + (-j * ny) + pvy * 0.2;
  };

  // gestion des buts
  const handleGoal = (loserSide) => {
    // loserSide: "top" ou "bottom"
    if (loserSide === "top") {
      // le joueur du haut a encaissé → point pour bas
      setScoreL((prev) => {
        const next = Math.min(prev + 1, 10);
        if (next >= 10) setGameOver(true);
        return next;
      });
      spawnBall("top"); // balle dans camp du perdant
    } else {
      // joueur du bas a encaissé → point pour haut
      setScoreR((prev) => {
        const next = Math.min(prev + 1, 10);
        if (next >= 10) setGameOver(true);
        return next;
      });
      spawnBall("bottom");
    }

    // balle sans vitesse
    ballSpeed.vx = 0;
    ballSpeed.vy = 0;
  };

  return (
    <View style={s.wrap}>
      {/* plateau plein écran, comme avant */}
      <Image
        source={FIELD_TEXTURE}
        style={s.field}
        contentFit="cover"
      />

      <View style={s.overlay}>
        <Text style={s.score}>
          {scoreL} — {scoreR}
        </Text>
        {gameOver && (
          <Text style={s.gameOver}>Score max 10 atteint</Text>
        )}

        {/* palet bleu (bas) */}
        <Animated.View
          {...dragL.panHandlers}
          style={{
            position: "absolute",
            transform: leftPos.getTranslateTransform(),
          }}
        >
          <Image
            source={PALET_BLUE}
            style={s.paletImg}
            contentFit="contain"
          />
        </Animated.View>

        {/* palet rouge (haut) */}
        <Animated.View
          {...dragR.panHandlers}
          style={{
            position: "absolute",
            transform: rightPos.getTranslateTransform(),
          }}
        >
          <Image
            source={PALET_RED}
            style={s.paletImg}
            contentFit="contain"
          />
        </Animated.View>

        {/* puck */}
        <Animated.View
          style={{
            position: "absolute",
            transform: ball.getTranslateTransform(),
          }}
        >
          <Image
            source={PUCK_TEXTURE}
            style={s.puckImg}
            contentFit="contain"
          />
        </Animated.View>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: {
    flex: 1,
    backgroundColor: "#000",
  },
  field: {
    position: "absolute",
    width: SCREEN_W,
    height: SCREEN_H,
  },
  overlay: {
    position: "absolute",
    width: "100%",
    height: "100%",
  },
  score: {
    color: "white",
    fontSize: 34,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 12,
    textShadowColor: "black",
    textShadowRadius: 6,
  },
  gameOver: {
    color: "#ffd43b",
    fontSize: 18,
    textAlign: "center",
    marginTop: 4,
  },
  paletImg: {
    width: PALLET_SIZE,
    height: PALLET_SIZE,
  },
  puckImg: {
    width: PUCK_SIZE,
    height: PUCK_SIZE,
  },
});
