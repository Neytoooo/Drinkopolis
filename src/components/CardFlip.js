// src/components/CardFlip.js
import React, { useRef, useState } from "react";
import { Pressable, View, Text, StyleSheet, Animated } from "react-native";
import { Image } from "expo-image";

export default function CardFlip({ frontSrc, title, desc, style }) {
  const anim = useRef(new Animated.Value(0)).current;
  const [flipped, setFlipped] = useState(false);

  const flip = () => {
    Animated.timing(anim, {
      toValue: flipped ? 0 : 1,
      duration: 300,
      useNativeDriver: true,
    }).start(() => setFlipped(!flipped));
  };

  const frontRotate = anim.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "180deg"] });
  const backRotate  = anim.interpolate({ inputRange: [0, 1], outputRange: ["180deg", "360deg"] });
  const frontOpacity = anim.interpolate({ inputRange: [0, .5], outputRange: [1, 0] });
  const backOpacity  = anim.interpolate({ inputRange: [.5, 1], outputRange: [0, 1] });

  return (
    <Pressable onPress={flip} style={[s.wrap, style]}>
      {/* FACE AVANT */}
      <Animated.View style={[
        s.side, s.front,
        { transform: [{ perspective: 800 }, { rotateY: frontRotate }], opacity: frontOpacity }
      ]}>
        {frontSrc
          ? <Image source={frontSrc} style={s.img} contentFit="contain" />
          : <View style={[s.backCard, {justifyContent:"center"}]}><Text style={s.title}>{title}</Text></View>
        }
      </Animated.View>

      {/* FACE ARRIÈRE (dos avec l’effet) */}
      <Animated.View style={[
        s.side, s.back,
        { transform: [{ perspective: 800 }, { rotateY: backRotate }], opacity: backOpacity }
      ]}>
        <View style={s.backCard}>
          <Text style={s.title}>{title}</Text>
          <Text style={s.desc}>{desc}</Text>
          <Text style={s.hint}>Touchez pour retourner</Text>
        </View>
      </Animated.View>
    </Pressable>
  );
}

const s = StyleSheet.create({
  wrap: { width: 120, height: 170 },
  side: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backfaceVisibility: "hidden" },
  front:{},
  back: {},
  img: { width: "100%", height: "100%" },
  backCard: {
    flex: 1,
    backgroundColor: "#1f2430",
    borderWidth: 2, borderColor: "#00d1b2", borderRadius: 12,
    padding: 10, justifyContent: "center"
  },
  title: { color: "#fff", fontSize: 16, fontWeight: "900", textAlign: "center" },
  desc: { color: "#cfe9ff", textAlign: "center", marginTop: 6 },
  hint: { color: "#86a3b0", textAlign: "center", marginTop: 8, fontSize: 11 }
});
