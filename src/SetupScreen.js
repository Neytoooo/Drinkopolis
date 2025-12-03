import React, { useState, useEffect } from "react";
import { View, Text, TextInput, Pressable, StyleSheet, FlatList, ActivityIndicator, Alert, Share } from "react-native";
import { Image } from "expo-image";
import { PAWN_SKIN_LIST } from "./images";
import { socket } from "./socket"; 

export default function SetupScreen({ navigation }) {
  // --- ÉTATS ---
  const [myName, setMyName] = useState("");
  const [mySkin, setMySkin] = useState("dealer");
  
  const [step, setStep] = useState("menu"); 
  const [roomId, setRoomId] = useState(null);
  const [lobbyPlayers, setLobbyPlayers] = useState([]);
  const [isHost, setIsHost] = useState(false);

  // --- SOCKET ---
  useEffect(() => {
    socket.connect();

    socket.on("connect_error", (err) => {
      console.log("Erreur connection:", err.message);
    });

    socket.on("roomCreated", ({ roomId, players }) => {
      setRoomId(roomId);
      setLobbyPlayers(players);
      setIsHost(true);
      setStep("lobby"); 
    });

    socket.on("updateRoom", (players) => {
      setLobbyPlayers(players);
    });

    // --- MODIFICATION ICI : ON PASSE roomId ---
    socket.on("gameStarted", () => {
      navigation.navigate("Game", { players: lobbyPlayers, roomId: roomId });
    });

    return () => {
      socket.off("connect_error");
      socket.off("roomCreated");
      socket.off("updateRoom");
      socket.off("gameStarted");
    };
  }, [lobbyPlayers, roomId]); // Ajout de roomId aux dépendances

  // --- ACTIONS ---
  const handleCreateRoom = () => {
    if (!myName.trim()) return Alert.alert("Oups", "Entre un pseudo !");
    socket.emit("createRoom", { playerName: myName, skin: mySkin });
  };

  const handleJoinRoom = () => {
    if (!myName.trim() || !roomId) return Alert.alert("Erreur", "Pseudo et Code requis !");
    const cleanCode = roomId.trim().toUpperCase();
    socket.emit("joinRoom", { roomId: cleanCode, playerName: myName, skin: mySkin });
    setRoomId(cleanCode);
    setStep("lobby");
  };

  const handleLaunchGame = () => {
    socket.emit("startGame", roomId);
  };

  const onShareInvite = async () => {
    try {
      const result = await Share.share({
        message: `Viens jouer à Drinkopolis avec moi ! Code de la salle : ${roomId}`,
      });
    } catch (error) {
      Alert.alert(error.message);
    }
  };

  // --- SELECTEUR DE SKIN ---
  const renderSkinSelector = () => (
    <View style={s.skinSection}>
      <Text style={s.label}>Ton Personnage :</Text>
      <FlatList
        horizontal
        data={PAWN_SKIN_LIST}
        keyExtractor={(x) => x.key}
        contentContainerStyle={{ gap: 10 }}
        showsHorizontalScrollIndicator={false}
        renderItem={({ item }) => (
          <Pressable onPress={() => setMySkin(item.key)} style={[s.skin, mySkin === item.key && s.skinActive]}>
            <Image source={item.src} style={{ width: 40, height: 40 }} contentFit="contain" />
          </Pressable>
        )}
      />
    </View>
  );

  return (
    <View style={s.wrap}>
      <Text style={s.title}>DRINKOPOLIS</Text>
      <Text style={s.subtitle}>ONLINE</Text>

      {/* --- MENU PRINCIPAL --- */}
      {step === "menu" && (
        <View style={s.card}>
          <Text style={s.label}>Ton Pseudo :</Text>
          <TextInput 
            style={s.input} 
            value={myName} 
            onChangeText={setMyName} 
            placeholder="Ex: Le Boss" 
            placeholderTextColor="#555"
          />
          
          {renderSkinSelector()}

          <View style={s.divider} />

          {/* Créer Room */}
          <Pressable style={s.btnCreate} onPress={handleCreateRoom}>
            <Text style={s.btnT}>👑 CRÉER UNE SALLE</Text>
          </Pressable>

          <Text style={s.orText}>- OU -</Text>

          {/* Rejoindre Room */}
          <View style={s.joinRow}>
            <TextInput 
              style={[s.input, s.inputCode]} 
              value={roomId} 
              onChangeText={setRoomId} 
              placeholder="CODE" 
              placeholderTextColor="#555"
              maxLength={4}
              autoCapitalize="characters"
            />
            <Pressable style={s.btnJoin} onPress={handleJoinRoom}>
              <Text style={s.btnT}>REJOINDRE</Text>
            </Pressable>
          </View>

          <View style={s.divider} />

          {/* --- NOUVEAU BOUTON SALLE D'ARCADE --- */}
          <Pressable 
            style={s.btnArcade} 
            onPress={() => navigation.navigate("MiniGames")}
          >
            <Text style={s.btnT}>🎮 SALLE D'ARCADE</Text>
            <Text style={s.btnSub}>Jouer aux mini-jeux solo</Text>
          </Pressable>

        </View>
      )}

      {/* --- LOBBY (SALLE D'ATTENTE) --- */}
      {step === "lobby" && (
        <View style={s.lobbyCard}>
          <View style={s.lobbyHeader}>
            <Text style={s.lobbyTitle}>SALLE D'ATTENTE</Text>
            <View style={s.codeBox}>
                <Text style={s.codeLabel}>CODE :</Text>
                <Text style={s.codeValue}>{roomId}</Text>
            </View>
          </View>

          <Text style={s.playersTitle}>Joueurs connectés :</Text>
          <View style={s.playerGrid}>
            {lobbyPlayers.map((p, i) => (
              <View key={i} style={s.playerItem}>
                <View style={s.avatarCircle}>
                   <Image source={PAWN_SKIN_LIST.find(s=>s.key === p.skin)?.src} style={{width:30, height:30}} />
                </View>
                <Text style={s.playerName}>{p.name}</Text>
                {p.isHost && <Text style={s.crown}>👑</Text>}
              </View>
            ))}

            <Pressable style={s.btnAdd} onPress={onShareInvite}>
              <Text style={s.plusIcon}>+</Text>
              <Text style={s.inviteText}>Inviter</Text>
            </Pressable>
          </View>

          <View style={s.footer}>
            {isHost ? (
              <Pressable style={s.btnStart} onPress={handleLaunchGame}>
                <Text style={s.btnStartText}>LANCER LA PARTIE 🎲</Text>
              </Pressable>
            ) : (
              <View style={s.waiting}>
                <ActivityIndicator color="#00f3ff" />
                <Text style={s.waitingText}>L'hôte va lancer la partie...</Text>
              </View>
            )}
            
            <Pressable onPress={() => {setStep("menu"); socket.disconnect(); socket.connect();}} style={{marginTop:15}}>
                <Text style={s.cancelText}>Quitter</Text>
            </Pressable>
          </View>
        </View>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: "#050B14", padding: 20, justifyContent: "center" },
  title: { color: "#fff", fontSize: 36, fontWeight: "900", textAlign: "center", textShadowColor:"#00f3ff", textShadowRadius:15 },
  subtitle: { color: "#00f3ff", fontSize: 16, textAlign: "center", marginBottom: 30, letterSpacing: 6, fontWeight:"700" },
  card: { backgroundColor: "#0f172a", borderRadius: 24, padding: 24, borderWidth:1, borderColor:"#333" },
  label: { color: "#ccc", marginBottom: 8, fontWeight:"700", fontSize:14 },
  input: { backgroundColor: "#1e293b", color: "#fff", borderRadius: 12, padding: 14, fontSize:16, borderWidth:1, borderColor:"#334155" },
  skinSection: { marginTop: 15 },
  skin: { padding: 8, borderRadius: 12, backgroundColor: "#1e293b", borderWidth:1, borderColor:"transparent" },
  skinActive: { backgroundColor: "#0f172a", borderColor: "#00f3ff" },
  divider: { height:1, backgroundColor:"#333", marginVertical:20 },
  btnCreate: { backgroundColor: "#00f3ff", padding: 16, borderRadius: 14, alignItems:"center", shadowColor:"#00f3ff", shadowOpacity:0.4, shadowRadius:12 },
  btnArcade: { backgroundColor: "#8b5cf6", padding: 16, borderRadius: 14, alignItems:"center", marginTop: 5, shadowColor: "#8b5cf6", shadowOpacity:0.4, shadowRadius:12 },
  btnSub: { color: "#ddd", fontSize: 10, marginTop: 2, fontWeight: "600" },
  btnT: { color: "#000", fontWeight: "900", fontSize: 16 },
  orText: { color: "#555", textAlign:"center", marginVertical: 15, fontWeight:"800" },
  joinRow: { flexDirection:"row", gap: 10 },
  inputCode: { flex: 1, textAlign:"center", letterSpacing:2, fontWeight:"800" },
  btnJoin: { flex: 1, backgroundColor: "#334155", borderRadius: 14, justifyContent:"center", alignItems:"center" },
  lobbyCard: { backgroundColor: "#0f172a", borderRadius: 24, padding: 20, borderWidth:1, borderColor:"#00f3ff", minHeight: 400 },
  lobbyHeader: { alignItems:"center", marginBottom: 20 },
  lobbyTitle: { color:"#888", fontSize:12, letterSpacing:2, marginBottom: 5 },
  codeBox: { flexDirection:"row", alignItems:"baseline", gap: 8 },
  codeLabel: { color: "#fff", fontWeight:"700" },
  codeValue: { color: "#00f3ff", fontSize: 32, fontWeight:"900", letterSpacing: 2 },
  playersTitle: { color:"#fff", fontWeight:"700", marginBottom:15 },
  playerGrid: { flexDirection:"row", flexWrap:"wrap", gap: 15 },
  playerItem: { alignItems:"center", width: 70 },
  avatarCircle: { width: 60, height: 60, borderRadius: 30, backgroundColor: "#1e293b", justifyContent:"center", alignItems:"center", borderWidth:2, borderColor:"#fff" },
  playerName: { color:"#fff", fontSize: 12, marginTop: 5, fontWeight:"700", textAlign:"center" },
  crown: { position:"absolute", top:-5, right:0, fontSize:16 },
  btnAdd: { width: 60, height: 60, borderRadius: 30, backgroundColor: "#1e293b", justifyContent:"center", alignItems:"center", borderWidth:2, borderColor:"#444", borderStyle:"dashed" },
  plusIcon: { color: "#888", fontSize: 24, fontWeight:"300" },
  inviteText: { position:"absolute", bottom:-20, color:"#888", fontSize:12 },
  footer: { marginTop: "auto", paddingTop: 30 },
  btnStart: { backgroundColor: "#ff0055", padding: 18, borderRadius: 16, alignItems:"center", shadowColor:"#ff0055", shadowOpacity:0.5, shadowRadius:15 },
  btnStartText: { color: "#fff", fontWeight: "900", fontSize: 18 },
  waiting: { flexDirection:"row", gap:10, alignItems:"center", justifyContent:"center" },
  waitingText: { color:"#00f3ff", fontStyle:"italic" },
  cancelText: { color:"#666", textAlign:"center", textDecorationLine:"underline" }
});