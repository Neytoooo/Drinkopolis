import React, { useState } from "react";
import { View, Text, TextInput, Pressable, StyleSheet, FlatList } from "react-native";
import { Image } from "expo-image";
import { PAWN_SKIN_LIST } from "./images";

export default function SetupScreen({ navigation, onStart }) {

  const [players, setPlayers] = useState([
    { name:"Joueur 1", skin:"dealer" },
    { name:"Joueur 2", skin:"kid" }
  ]);

  const setName = (i, v) => { const copy=[...players]; copy[i].name=v; setPlayers(copy); };
  const setSkin = (i, skin) => { const copy=[...players]; copy[i].skin=skin; setPlayers(copy); };
  const addPlayer = () => setPlayers(p => [...p, { name:`Joueur ${p.length+1}`, skin:"leaf" }]);

  return (
    <View style={s.wrap}>
      <Text style={s.title}>Monopolis — Configuration</Text>

      {players.map((p, i) => (
        <View key={i} style={s.card}>
          <TextInput style={s.input} value={p.name} onChangeText={(v)=>setName(i,v)} />
          <FlatList
            horizontal
            data={PAWN_SKIN_LIST}
            keyExtractor={(x)=>x.key}
            contentContainerStyle={{ gap:10, paddingVertical:6 }}
            renderItem={({item})=>(
              <Pressable onPress={()=>setSkin(i, item.key)} style={[s.skin, p.skin===item.key && s.skinActive]}>
                <Image source={item.src} style={{ width:48, height:48 }} contentFit="contain" />
                <Text style={s.skinLabel}>{item.label}</Text>
              </Pressable>
            )}
          />
        </View>
      ))}

      <View style={s.row}>
        <Pressable style={s.btn} onPress={addPlayer}><Text style={s.btnT}>+ Ajouter joueur</Text></Pressable>
        <Pressable style={[s.btn, s.go]} onPress={()=> onStart(players)}><Text style={s.btnT}>Démarrer</Text></Pressable>
        <Pressable style={s.btn} onPress={() => navigation.navigate("MiniGames")}>
  <Text style={s.t}>Mini-Jeux</Text>
</Pressable>

      </View>
    </View>
  );
}

const s = StyleSheet.create({
  wrap:{ flex:1, backgroundColor:"#0b0b0b", padding:18, gap:12 },
  title:{ color:"#fff", fontSize:22, fontWeight:"900", textAlign:"center", marginBottom:4 },
  card:{ backgroundColor:"#161616", borderRadius:12, padding:12, gap:8 },
  input:{ backgroundColor:"#222", color:"#fff", borderRadius:8, paddingHorizontal:10, paddingVertical:8 },
  row:{ flexDirection:"row", gap:10, justifyContent:"center", marginTop:6 },
  btn:{ backgroundColor:"#228be6", paddingHorizontal:14, paddingVertical:10, borderRadius:10 },
  go:{ backgroundColor:"#51cf66" },
  btnT:{ color:"#fff", fontWeight:"800" },
  skin:{ alignItems:"center", padding:6, borderRadius:8, backgroundColor:"#222" },
  skinActive:{ backgroundColor:"#2b8a3e" },
  skinLabel:{ color:"#fff", fontSize:12, marginTop:4 }
});
