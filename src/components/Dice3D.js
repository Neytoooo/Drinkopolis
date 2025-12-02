import React, { useEffect, useRef, useState } from 'react';
import { View, Animated, StyleSheet, Easing } from 'react-native';

const FACE_SIZE = 80; // Taille du dé
const DOT_SIZE = 14;  // Taille des points

// Position des points pour chaque face (1 à 6)
const FACES = {
  1: [{ top: '42%', left: '42%' }],
  2: [{ top: '20%', left: '20%' }, { top: '64%', left: '64%' }],
  3: [{ top: '20%', left: '20%' }, { top: '42%', left: '42%' }, { top: '64%', left: '64%' }],
  4: [{ top: '20%', left: '20%' }, { top: '20%', left: '64%' }, { top: '64%', left: '20%' }, { top: '64%', left: '64%' }],
  5: [{ top: '20%', left: '20%' }, { top: '20%', left: '64%' }, { top: '42%', left: '42%' }, { top: '64%', left: '20%' }, { top: '64%', left: '64%' }],
  6: [{ top: '20%', left: '20%' }, { top: '20%', left: '64%' }, { top: '42%', left: '20%' }, { top: '42%', left: '64%' }, { top: '64%', left: '20%' }, { top: '64%', left: '64%' }],
};

export default function Dice3D({ result, onLand }) {
  const anim = useRef(new Animated.Value(0)).current;
  const [displayValue, setDisplayValue] = useState(1);

  useEffect(() => {
    if (!result) return;

    // 1. Reset animation
    anim.setValue(0);

    // 2. Animation de "roulement"
    // On fait changer les chiffres rapidement pendant la rotation pour l'effet de flou
    const interval = setInterval(() => {
      setDisplayValue(Math.ceil(Math.random() * 6));
    }, 100);

    Animated.sequence([
      // Phase 1: Lancer haut + Rotation rapide
      Animated.parallel([
        Animated.timing(anim, {
          toValue: 1,
          duration: 800,
          easing: Easing.out(Easing.cubic), // Ralentissement à la fin
          useNativeDriver: true,
        }),
      ]),
    ]).start(() => {
      // Fin de l'animation
      clearInterval(interval);
      setDisplayValue(result); // Affiche le vrai résultat
      if (onLand) onLand();    // Prévient le jeu que c'est fini
    });

  }, [result]);

  // Interpolations pour l'effet 3D
  const rotateZ = anim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '1080deg'] // 3 tours complets
  });

  const scale = anim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.5, 1.4, 1] // Zoom in/out pour l'effet de saut
  });

  return (
    <View style={s.container}>
      <Animated.View style={[
        s.cubeFace, 
        { transform: [{ rotateZ }, { scale }] }
      ]}>
        {/* Les points du dé */}
        {FACES[displayValue].map((dot, i) => (
          <View key={i} style={[s.dot, dot]} />
        ))}
      </Animated.View>
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    width: FACE_SIZE,
    height: FACE_SIZE,
  },
  cubeFace: {
    width: FACE_SIZE,
    height: FACE_SIZE,
    backgroundColor: '#0f172a', // Fond bleu nuit
    borderWidth: 2,
    borderColor: '#00f3ff',     // Bordure néon cyan
    borderRadius: 16,
    position: 'relative',
    shadowColor: "#00f3ff",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 10,
  },
  dot: {
    position: 'absolute',
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: DOT_SIZE / 2,
    backgroundColor: '#fff', // Points blancs
    shadowColor: "#fff",
    shadowOpacity: 0.8,
    shadowRadius: 4,
  }
});