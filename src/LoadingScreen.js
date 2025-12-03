import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import { Image } from 'expo-image';

const { width, height } = Dimensions.get('window');

// Remplace par le chemin de ton image générée (ex: assets/splash_custom.png)
const BG_IMAGE = require('../assets/splash_custom.png'); 

export default function LoadingScreen({ onFinish }) {
  const progress = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Animation de la barre de chargement (2.5 secondes)
    Animated.timing(progress, {
      toValue: 1,
      duration: 2500,
      useNativeDriver: false,
    }).start(() => {
      // Une fois fini, on fait disparaître l'écran
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start(onFinish);
    });
  }, []);

  const widthInterp = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  return (
    <Animated.View style={[s.container, { opacity: fadeAnim }]}>
      {/* Image de fond */}
      <Image 
        source={BG_IMAGE} 
        style={s.bg} 
        contentFit="cover" 
        transition={500}
      />

      <View style={s.overlay} />

      <View style={s.content}>
        <Text style={s.title}>DRINKOPOLIS</Text>
        <Text style={s.subtitle}>CHARGEMENT DE LA SOIRÉE...</Text>

        {/* Barre de progression Néon */}
        <View style={s.barContainer}>
          <Animated.View style={[s.barFill, { width: widthInterp }]} />
        </View>
      </View>
    </Animated.View>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050B14',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bg: {
    ...StyleSheet.absoluteFillObject,
    width: width,
    height: height,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(5, 11, 20, 0.6)', // Assombrit l'image pour lire le texte
  },
  content: {
    position: 'absolute',
    bottom: 80,
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  title: {
    color: '#fff',
    fontSize: 42,
    fontWeight: '900',
    letterSpacing: 2,
    marginBottom: 5,
    textShadowColor: '#00f3ff',
    textShadowRadius: 15,
  },
  subtitle: {
    color: '#00f3ff',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 4,
    marginBottom: 30,
  },
  barContainer: {
    width: '100%',
    height: 6,
    backgroundColor: '#1e293b',
    borderRadius: 3,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#334155',
  },
  barFill: {
    height: '100%',
    backgroundColor: '#00f3ff',
    shadowColor: '#00f3ff',
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 5,
  },
});