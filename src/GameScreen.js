import React, { useState, useRef, useEffect } from "react";
import { View, Alert, Text, StyleSheet } from "react-native";
import { TILES } from "./tiles";
import BoardPortrait from "./BoardPortrait";
import PlayerPanel from "./components/PlayerPanel";
import SpecialCard from "./components/SpecialCard";
import PlayerHand from "./components/PlayerHand";
import { buildShuffledDeck } from "./cards";
import Dice3D from "./components/Dice3D"; 
import { socket } from "./socket"; // Import socket pour la sync

// petit helper pour attendre en async
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export default function GameScreen(props) {
  const { route } = props;

  // Récupération des infos (Joueurs + RoomId)
  const rawPlayers = route?.params?.players || props.playersInit || [];
  const roomId = route?.params?.roomId; // <--- On a besoin de l'ID de la salle

  if (!rawPlayers || rawPlayers.length === 0) {
    return (
      <View style={{ flex: 1, backgroundColor: "#050B14", justifyContent: "center", alignItems: "center" }}>
        <Text style={{ color: "#fff" }}>Aucun joueur fourni à GameScreen.</Text>
      </View>
    );
  }

  // ---------- STATE JOUEURS ----------
  const [players, setPlayers] = useState(
    rawPlayers.map((p, i) => ({
      id: p.id || String(i), // L'ID du socket est crucial ici !
      name: p.name || `Joueur ${i + 1}`,
      skin: p.skin || "dealer",
      pos: 0,
      shots: 0,
      tafs: 0,
      prisonTurns: 0,
      shield: false,
      doubleRoll: false,
      hand: [], 
      keep: [],
    }))
  );

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
  const [lastCard, setLastCard] = useState(null); 

  // --- ÉTATS DÉ ---
  const [diceResult, setDiceResult] = useState(null);
  const [isRolling, setIsRolling] = useState(false);

  const current = players[turn];
  const playersAt = (idx) => players.filter((p) => p.pos === idx);
  const nextIndex = (i) => (i + 1) % players.length;
  const mutatePlayer = (id, fn) => updatePlayers((ps) => ps.map((p) => (p.id === id ? fn(p) : p)));

  // ============================================================
  // GESTION DU SOCKET (SYNC)
  // ============================================================
  
  useEffect(() => {
    // Écouter les événements venant des autres joueurs
    socket.on("gameEvent", (event) => {
      if (event.type === "ROLL") {
        // L'autre joueur a lancé le dé, on joue l'animation chez nous
        startDiceAnimation(event.roll);
      }
      else if (event.type === "PRISON_SKIP") {
        // L'autre joueur passe son tour (prison)
        handlePrisonSkip(event.playerId);
      }
    });

    return () => {
      socket.off("gameEvent");
    };
  }, []);

  // ============================================================
  // LOGIQUE DE JEU
  // ============================================================

  const moveStepByStep = async (playerId, steps) => {
    const len = TILES.length;
    const dir = steps >= 0 ? 1 : -1;
    let remaining = Math.abs(steps);
    let currentPos = playersRef.current.find((p) => p.id === playerId)?.pos ?? 0;

    while (remaining > 0) {
      currentPos = (currentPos + dir + len) % len;
      updatePlayers((ps) => ps.map((p) => p.id === playerId ? { ...p, pos: currentPos } : p));
      remaining -= 1;
      await delay(160);
    }
  };

  const drawCard = (playerId) => { /* ... Logique carte identique ... */ };
  const moveBy = (playerId, delta) => {
    updatePlayers((ps) => ps.map((p) => {
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
      mutatePlayer(playerId, (p) => ({ ...p, pos: prisonIdx, prisonTurns: p.prisonTurns + 1, shots: p.shots + 1 }));
    }
  };

  const resolveTile = (playerId, finalRoll) => {
    const player = playersRef.current.find((p) => p.id === playerId);
    if (!player) return;
    const tile = TILES[player.pos];

    // Logique simplifiée des cases pour la démo
    switch (tile.type) {
      case "SHOT1": mutatePlayer(playerId, (p) => ({ ...p, shots: p.shots + 1 })); break;
      case "PRISON": mutatePlayer(playerId, (p) => ({ ...p, prisonTurns: p.prisonTurns + 1, shots: p.shots + 1 })); break;
      case "GO_PRISON": teleportToPrison(playerId); break;
      // ... autres cases ...
    }
  };

  // --- ACTIONS ---

  // 1. Déclenché par le bouton "Lancer"
  const handlePressRoll = () => {
    if (isRolling) return;

    const snapshot = playersRef.current;
    const me = snapshot[turn];

    // SÉCURITÉ : Est-ce bien mon tour ?
    if (me.id !== socket.id) {
      Alert.alert("Ce n'est pas ton tour !", `C'est au tour de ${me.name}`);
      return;
    }

    // Gestion Prison
    if (me.prisonTurns > 0) {
      // On informe les autres qu'on passe notre tour
      socket.emit("sendGameEvent", { roomId, type: "PRISON_SKIP", playerId: me.id });
      handlePrisonSkip(me.id);
      return;
    }

    // Calcul du dé (C'est moi qui décide du résultat)
    const roll = Math.ceil(Math.random() * 6);

    // On informe les autres
    socket.emit("sendGameEvent", { roomId, type: "ROLL", roll });

    // On joue l'animation chez nous
    startDiceAnimation(roll);
  };

  // 2. Logique commune (déclenchée localement ou via socket)
  const handlePrisonSkip = (playerId) => {
    mutatePlayer(playerId, (p) => ({ ...p, prisonTurns: p.prisonTurns - 1 }));
    if(playerId === socket.id) Alert.alert("Prison", "Tu es bloqué ce tour.");
    setTurn(nextIndex(turn));
  };

  const startDiceAnimation = (roll) => {
    setIsRolling(true);
    setDiceResult(roll);
    setLastRoll(roll);
  };

  // 3. Fin de l'animation du dé
  const onDiceLanded = async () => {
    const roll = diceResult;
    const me = playersRef.current[turn]; 
    if (!me) {
      setIsRolling(false);
      setDiceResult(null);
      return;
    }

    // Tout le monde voit le pion bouger
    await moveStepByStep(me.id, roll);
    resolveTile(me.id, roll);

    setIsRolling(false);
    setDiceResult(null);
    setTurn(nextIndex(turn));
  };

  // --- RENDER ---
  // On grise le bouton si ce n'est pas notre tour
  const isMyTurn = current?.id === socket.id;

  return (
    <View style={{ flex: 1, backgroundColor: "#050B14" }}>
      <View
        style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        onLayout={(e) => setBoardHeight(e.nativeEvent.layout.height)}
      >
        <BoardPortrait
          players={players}
          playersAt={(idx) => playersAt(idx).map((p) => ({ ...p, isActive: p.id === current.id }))}
          maxHeight={boardHeight}
          diceResult={diceResult}
          onDiceLand={onDiceLanded}
        />
      </View>

      <SpecialCard card={lastCard} onClose={() => setLastCard(null)} />
      <PlayerHand cards={current?.hand || []} />

      {!isRolling && (
        <View style={{opacity: isMyTurn ? 1 : 0.5}}> 
           <PlayerPanel 
             current={current} 
             lastRoll={lastRoll} 
             onRoll={handlePressRoll} 
           />
           {!isMyTurn && <Text style={s.waitText}>En attente de {current.name}...</Text>}
        </View>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  waitText: {
    color: '#00f3ff',
    textAlign: 'center',
    marginBottom: 10,
    fontWeight: 'bold',
    fontStyle: 'italic'
  }
});