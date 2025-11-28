import React, { useRef, useState } from "react";
import { View, Text, Animated, PanResponder, StyleSheet, Dimensions, TouchableOpacity } from "react-native";

const { width, height } = Dimensions.get("window");

export default function BeerPong() {
  const [score, setScore] = useState(0);
  const [message, setMessage] = useState("Déplace la balle et appuie sur LANCER ! 🎯");
  const [cupStates, setCupStates] = useState(Array(10).fill(true));
  const [isThrowing, setIsThrowing] = useState(false);
  
  const ballX = useRef(new Animated.Value(width / 2 - 20)).current;
  const ballY = useRef(new Animated.Value(height - 200)).current;
  const ballScale = useRef(new Animated.Value(1)).current;
  const ballRotation = useRef(new Animated.Value(0)).current;
  
  const currentBallPos = useRef({ x: width / 2 - 20, y: height - 200 });

  // Positions des gobelets
  const cupPositions = [
    { x: width / 2 - 25, y: 120 },
    { x: width / 2 - 70, y: 190 }, { x: width / 2 + 20, y: 190 },
    { x: width / 2 - 115, y: 260 }, { x: width / 2 - 25, y: 260 }, { x: width / 2 + 65, y: 260 },
    { x: width / 2 - 160, y: 330 }, { x: width / 2 - 70, y: 330 }, { x: width / 2 + 20, y: 330 }, { x: width / 2 + 110, y: 330 }
  ];

  const checkCollision = (bx, by) => {
    let hit = false;
    const newCupStates = [...cupStates];
    
    cupPositions.forEach((cup, index) => {
      if (!cupStates[index]) return;
      
      const distance = Math.sqrt(
        Math.pow(bx - cup.x, 2) + Math.pow(by - cup.y, 2)
      );
      
      if (distance < 55) {
        newCupStates[index] = false;
        hit = true;
        setScore(prev => prev + 1);
        setMessage("🎯 BUT ! Score: " + (score + 1) + "/10");
        
        setTimeout(() => {
          if (score + 1 === 10) {
            setMessage("🏆 VICTOIRE TOTALE ! 🎉");
          } else {
            setMessage("Positionne et tire ! 🍺");
          }
        }, 1500);
      }
    });
    
    if (hit) setCupStates(newCupStates);
    if (!hit) {
      setMessage("❌ Raté !");
      setTimeout(() => setMessage("Réessaye ! 🎯"), 1200);
    }
  };

  const throwBall = () => {
    if (isThrowing) return;
    
    setIsThrowing(true);
    setMessage("🚀 Tir !");
    
    // Calcul de la trajectoire depuis la position actuelle vers le centre haut
    const startX = currentBallPos.current.x;
    const startY = currentBallPos.current.y;
    
    // Le tir va toujours vers le haut-centre
    const targetX = width / 2 - 20;
    const targetY = 100;

    Animated.parallel([
      Animated.timing(ballX, {
        toValue: targetX,
        duration: 600,
        useNativeDriver: false
      }),
      Animated.timing(ballY, {
        toValue: targetY,
        duration: 600,
        useNativeDriver: false
      }),
      Animated.timing(ballScale, {
        toValue: 0.5,
        duration: 300,
        useNativeDriver: false
      }),
      Animated.timing(ballRotation, {
        toValue: 2,
        duration: 600,
        useNativeDriver: false
      })
    ]).start(() => {
      const bx = ballX._value + 20;
      const by = ballY._value + 20;
      checkCollision(bx, by);
      
      setTimeout(() => {
        const resetX = width / 2 - 20;
        const resetY = height - 200;
        
        Animated.parallel([
          Animated.timing(ballScale, {
            toValue: 1,
            duration: 300,
            useNativeDriver: false
          }),
          Animated.spring(ballX, {
            toValue: resetX,
            friction: 8,
            tension: 40,
            useNativeDriver: false
          }),
          Animated.spring(ballY, {
            toValue: resetY,
            friction: 8,
            tension: 40,
            useNativeDriver: false
          })
        ]).start(() => {
          ballRotation.setValue(0);
          currentBallPos.current = { x: resetX, y: resetY };
          setIsThrowing(false);
        });
      }, 300);
    });
  };

  const pan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !isThrowing,
      onMoveShouldSetPanResponder: () => !isThrowing,
      
      onPanResponderGrant: () => {
        ballX.setOffset(currentBallPos.current.x);
        ballY.setOffset(currentBallPos.current.y);
        ballX.setValue(0);
        ballY.setValue(0);
      },
      
      onPanResponderMove: Animated.event(
        [null, { dx: ballX, dy: ballY }],
        { useNativeDriver: false }
      ),
      
      onPanResponderRelease: () => {
        ballX.flattenOffset();
        ballY.flattenOffset();
        
        let finalX = ballX._value;
        let finalY = ballY._value;
        
        // Limites
        if (finalX < 10) finalX = 10;
        if (finalX > width - 50) finalX = width - 50;
        if (finalY < height - 350) finalY = height - 350;
        if (finalY > height - 100) finalY = height - 100;
        
        currentBallPos.current = { x: finalX, y: finalY };
        
        if (finalX !== ballX._value || finalY !== ballY._value) {
          ballX.setValue(finalX);
          ballY.setValue(finalY);
        }
      }
    })
  ).current;

  const spin = ballRotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
  });

  return (
    <View style={s.container}>
      <View style={s.table}>
        <View style={s.centerLine} />
        
        <View style={s.launchZone}>
          <Text style={s.launchText}>Zone de lancer</Text>
        </View>

        {cupPositions.map((pos, i) => (
          <View
            key={i}
            style={[
              s.cup,
              { left: pos.x, top: pos.y },
              !cupStates[i] && s.cupHit
            ]}
          >
            <View style={s.cupTop} />
            <View style={s.cupBody} />
            <View style={s.cupShadow} />
          </View>
        ))}

        <Animated.View
          {...pan.panHandlers}
          style={[
            s.ball,
            {
              left: ballX,
              top: ballY,
              transform: [
                { scale: ballScale },
                { rotate: spin }
              ]
            }
          ]}
        >
          <View style={s.ballShine} />
        </Animated.View>
      </View>

      <View style={s.header}>
        <Text style={s.title}>🍺 Beer Pong 3D</Text>
        <Text style={s.score}>Score: {score}/10</Text>
      </View>

      <View style={s.messageBox}>
        <Text style={s.message}>{message}</Text>
      </View>

      {/* BOUTON LANCER */}
      <TouchableOpacity 
        style={[s.shootButton, isThrowing && s.shootButtonDisabled]} 
        onPress={throwBall}
        disabled={isThrowing}
      >
        <Text style={s.shootButtonText}>
          {isThrowing ? "⏳" : "🚀 LANCER"}
        </Text>
      </TouchableOpacity>

      <View style={s.instructions}>
        <Text style={s.instructionText}>
          👆 Déplace la balle dans la zone
        </Text>
        <Text style={s.instructionText}>
          🎯 Puis appuie sur LANCER
        </Text>
      </View>

      {score === 10 && (
        <View style={s.victoryOverlay}>
          <Text style={s.victoryText}>🏆</Text>
          <Text style={s.victoryTitle}>VICTOIRE !</Text>
          <Text style={s.victorySubtitle}>Tous les gobelets éliminés ! 🎉</Text>
        </View>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1a1a2e"
  },
  table: {
    flex: 1,
    backgroundColor: "#0f3460",
    borderRadius: 20,
    margin: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10
  },
  centerLine: {
    position: "absolute",
    top: 0,
    left: width / 2 - 1,
    width: 2,
    height: "100%",
    backgroundColor: "#ffffff22"
  },
  launchZone: {
    position: "absolute",
    bottom: 50,
    left: 20,
    right: 20,
    height: 250,
    borderWidth: 2,
    borderColor: "#ffffff33",
    borderRadius: 15,
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center"
  },
  launchText: {
    color: "#ffffff44",
    fontSize: 16,
    fontWeight: "600"
  },
  cup: {
    position: "absolute",
    width: 50,
    height: 70,
    alignItems: "center"
  },
  cupTop: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#ff4444",
    borderWidth: 3,
    borderColor: "#cc0000",
    shadowColor: "#ff0000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.5,
    shadowRadius: 10
  },
  cupBody: {
    width: 45,
    height: 25,
    backgroundColor: "#dd3333",
    marginTop: -5,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    borderWidth: 2,
    borderColor: "#cc0000",
    borderTopWidth: 0
  },
  cupShadow: {
    position: "absolute",
    bottom: -8,
    width: 60,
    height: 8,
    borderRadius: 30,
    backgroundColor: "#00000044"
  },
  cupHit: {
    opacity: 0.2,
    transform: [{ scale: 0.8 }]
  },
  ball: {
    position: "absolute",
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#ffffff",
    shadowColor: "#fff",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.8,
    shadowRadius: 15,
    elevation: 10,
    zIndex: 100
  },
  ballShine: {
    position: "absolute",
    top: 5,
    left: 8,
    width: 15,
    height: 15,
    borderRadius: 10,
    backgroundColor: "#ffffff99"
  },
  header: {
    position: "absolute",
    top: 40,
    width: "100%",
    alignItems: "center",
    zIndex: 10
  },
  title: {
    color: "#fff",
    fontSize: 32,
    fontWeight: "900",
    textShadowColor: "#ff4444",
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 10
  },
  score: {
    color: "#ffd700",
    fontSize: 28,
    fontWeight: "800",
    marginTop: 5
  },
  messageBox: {
    position: "absolute",
    top: height / 2 - 100,
    width: "100%",
    alignItems: "center",
    zIndex: 10
  },
  message: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
    backgroundColor: "#00000088",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20
  },
  shootButton: {
    position: "absolute",
    bottom: 120,
    alignSelf: "center",
    backgroundColor: "#00ff00",
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 30,
    shadowColor: "#00ff00",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 10,
    zIndex: 200
  },
  shootButtonDisabled: {
    backgroundColor: "#666",
    shadowColor: "#000"
  },
  shootButtonText: {
    color: "#000",
    fontSize: 24,
    fontWeight: "900"
  },
  instructions: {
    position: "absolute",
    bottom: 30,
    width: "100%",
    alignItems: "center",
    zIndex: 10
  },
  instructionText: {
    color: "#aaa",
    fontSize: 14,
    marginVertical: 3,
    textAlign: "center"
  },
  victoryOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#000000dd",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000
  },
  victoryText: {
    fontSize: 120,
    marginBottom: 20
  },
  victoryTitle: {
    color: "#ffd700",
    fontSize: 48,
    fontWeight: "900"
  },
  victorySubtitle: {
    color: "#fff",
    fontSize: 24,
    marginTop: 10
  }
});                                 