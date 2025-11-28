import React, { useState, useRef } from "react";
import { View, Alert } from "react-native";
import { TILES } from "./tiles";
import BoardPortrait from "./BoardPortrait";
import PlayerPanel from "./components/PlayerPanel";
import SpecialCard from "./components/SpecialCard";
import PlayerHand from "./components/PlayerHand";
import { buildShuffledDeck } from "./cards";
import MiniGamesScreen from "./components/MiniGamesScreen";
import TapBattle from "./minigames/TapBattle";


// petit helper pour attendre en async
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export default function GameScreen({ playersInit }) {
  // ---------- STATE JOUEURS ----------
  const [players, setPlayers] = useState(
    playersInit.map((p, i) => ({
      id: String(i),
      name: p.name,
      skin: p.skin,
      pos: 0,
      shots: 0,
      tafs: 0,
      prisonTurns: 0,
      shield: false,
      doubleRoll: false,
      hand: [], // cartes visibles
      keep: [], // cartes gardées (logique interne)
    }))
  );

  // ref pour toujours avoir la version FRAÎCHE des joueurs dans l’async
  const playersRef = useRef(players);
  const updatePlayers = (updater) => {
    setPlayers((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      playersRef.current = next;
      return next;
    });
  };

  const [turn, setTurn] = useState(0);
  const [lastRoll, setLastRoll] = useState(null);
  const [boardHeight, setBoardHeight] = useState(0);

  const [deck, setDeck] = useState(buildShuffledDeck());
  const [discard, setDiscard] = useState([]);
  const [lastCard, setLastCard] = useState(null); // carte spéciale tirée

  const current = players[turn];
  const playersAt = (idx) => players.filter((p) => p.pos === idx);
  const nextIndex = (i) => (i + 1) % players.length;
  const mutatePlayer = (id, fn) =>
    updatePlayers((ps) => ps.map((p) => (p.id === id ? fn(p) : p)));

  // ---------- ANIMATION DE DEPLACEMENT ----------
  const moveStepByStep = async (playerId, steps) => {
    const len = TILES.length;
    const dir = steps >= 0 ? 1 : -1;
    let remaining = Math.abs(steps);

    // position de départ (fraîche depuis la ref)
    let currentPos =
      playersRef.current.find((p) => p.id === playerId)?.pos ?? 0;

    while (remaining > 0) {
      currentPos = (currentPos + dir + len) % len;

      updatePlayers((ps) =>
        ps.map((p) =>
          p.id === playerId
            ? {
                ...p,
                pos: currentPos,
              }
            : p
        )
      );

      remaining -= 1;
      await delay(160); // durée entre 2 cases
    }
  };

  // ---------- TIRAGE CARTES SPECIALES ----------
  const drawCard = (playerId) => {
    let d = deck.slice();
    let disc = discard.slice();
    if (d.length === 0) {
      d = buildShuffledDeck();
      disc = [];
    }

    const card = d.pop();
    setDeck(d);
    setDiscard([...disc, card]);
    setLastCard(card); // visible sous le plateau

    const snapshotPlayers = playersRef.current;

    if (card.kind === "keep") {
      // main max 2 → si pleine, on ignore la nouvelle
      const me = snapshotPlayers.find((p) => p.id === playerId);
      if (me && me.hand.length >= 2) return;

      mutatePlayer(playerId, (p) => ({
        ...p,
        hand: [...p.hand, card.key],
        keep: [...p.keep, card.key],
        shield: p.shield || card.key === "SHIELD",
        doubleRoll: p.doubleRoll || card.key === "DOUBLE_ROLL",
      }));
      return;
    }

    // instant (exemples simples)
    const others = snapshotPlayers.filter((p) => p.id !== playerId);
    const nextPlayer =
      others.length > 0 ? others[nextIndex(turn) % others.length] : null;

    switch (card.key) {
      case "GIVE_SHOT":
        if (nextPlayer)
          mutatePlayer(nextPlayer.id, (p) => ({
            ...p,
            shots: p.shots + 1,
          }));
        break;
      case "TAKE_SHOT":
        mutatePlayer(playerId, (p) => ({ ...p, shots: p.shots + 1 }));
        break;
      case "GIVE_TAF":
        if (nextPlayer)
          mutatePlayer(nextPlayer.id, (p) => ({
            ...p,
            tafs: p.tafs + 1,
          }));
        break;
      case "CLEANSE":
        mutatePlayer(playerId, (p) => ({
          ...p,
          shots: Math.max(0, p.shots - 1),
        }));
        break;
      case "MOVE_3":
        // pour l’instant : déplacement instantané (on pourra aussi l’animer plus tard)
        moveBy(playerId, 3);
        break;
      case "BACK_2":
        moveBy(playerId, -2);
        break;
      case "TELEPORT_PRISON":
        teleportToPrison(playerId);
        break;
      case "CHANCE":
        // à affiner plus tard
        break;
      default:
        break;
    }
  };



  const moveBy = (playerId, delta) => {
    updatePlayers((ps) =>
      ps.map((p) => {
        if (p.id !== playerId) return p;
        const len = TILES.length;
        let next = (p.pos + delta) % len;
        if (next < 0) next += len;
        return { ...p, pos: next };
      })
    );
  };

  const teleportToPrison = (playerId) => {
    const prisonIdx = TILES.findIndex((t) => t.type === "PRISON");
    if (prisonIdx >= 0) {
      mutatePlayer(playerId, (p) => ({
        ...p,
        pos: prisonIdx,
        prisonTurns: p.prisonTurns + 1,
        shots: p.shots + 1,
      }));
    }
  };

  // ---------- RESOLUTION CASE ----------
  const resolveTile = (playerId, finalRoll) => {
    const snapshotPlayers = playersRef.current;
    const player = snapshotPlayers.find((p) => p.id === playerId);
    if (!player) return;

    const tile = TILES[player.pos];

    const consumeShield = () => {
      let used = false;
      mutatePlayer(playerId, (p) => {
        if (!p.shield) return p;
        used = true;
        return {
          ...p,
          shield: false,
          keep: p.keep.filter((k) => k !== "SHIELD"),
          hand: p.hand.filter((k) => k !== "SHIELD"),
        };
      });
      return used;
    };

    switch (tile.type) {
      case "SHOT1":
        if (!consumeShield())
          mutatePlayer(playerId, (p) => ({ ...p, shots: p.shots + 1 }));
        break;
      case "SHOT2":
        if (!consumeShield())
          mutatePlayer(playerId, (p) => ({ ...p, shots: p.shots + 2 }));
        break;
      case "TAF1":
        if (!consumeShield())
          mutatePlayer(playerId, (p) => ({ ...p, tafs: p.tafs + 1 }));
        break;
      case "PRISON":
        if (!consumeShield())
          mutatePlayer(playerId, (p) => ({
            ...p,
            prisonTurns: p.prisonTurns + 1,
            shots: p.shots + 1,
          }));
        break;
      case "GO_PRISON":
        if (!consumeShield()) teleportToPrison(playerId);
        break;
      case "CARTE":
        drawCard(playerId);
        break;
      default:
        break;
    }
  };

  // ---------- TOUR DE JEU ----------
  const turnRoll = async () => {
    const snapshot = playersRef.current;
    const me = snapshot[turn];
    if (!me) return;

    // prison ?
    if (me.prisonTurns > 0) {
      mutatePlayer(me.id, (p) => ({
        ...p,
        prisonTurns: p.prisonTurns - 1,
      }));
      Alert.alert("Prison", "Tu es bloqué ce tour.");
      setTurn(nextIndex(turn));
      return;
    }

    const roll = Math.ceil(Math.random() * 6);
    setLastRoll(roll);

    // ANIMATION de déplacement
    await moveStepByStep(me.id, roll);

    // résolution de la case d’arrivée
    resolveTile(me.id, roll);

    // joueur suivant
    setTurn(nextIndex(turn));
  };

  // ---------- RENDER ----------
  return (
    <View style={{ flex: 1, backgroundColor: "#000" }}>
      {/* Plateau */}
      <View
        style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        onLayout={(e) => setBoardHeight(e.nativeEvent.layout.height)}
      >
        <BoardPortrait
          players={players}
          playersAt={(idx) =>
            playersAt(idx).map((p) => ({ ...p, isActive: p.id === current.id }))
          }
          maxHeight={boardHeight}
        />
      </View>

      {/* Carte spéciale tirée (popup) */}
      <SpecialCard card={lastCard} onClose={() => setLastCard(null)} />

      {/* Main du joueur courant */}
      <PlayerHand cards={current?.hand || []} />

      {/* Panneau bas */}
      <PlayerPanel current={current} lastRoll={lastRoll} onRoll={turnRoll} />
    </View>
  );
}
