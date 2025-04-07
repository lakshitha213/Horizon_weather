import React, { useRef, useEffect } from 'react';
import { View, StyleSheet, Animated, Easing, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const AnimatedPreloader = () => {
  const spinValue = useRef(new Animated.Value(0)).current;
  const gradientAnim = useRef(new Animated.Value(0)).current;

  // Default gradient colors
  const gradientColors = [
    ['#4c669f', '#3b5998', '#192f6a'], // First gradient set
    ['#56CCF2', '#2F80ED'],           // Second gradient set
    ['#bdc3c7', '#2c3e50']            // Third gradient set
  ];

  useEffect(() => {
    // Spinning animation
    Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 800,
        easing: Easing.linear,
        useNativeDriver: true
      })
    ).start();

    // Gradient transition animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(gradientAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: false
        }),
        Animated.timing(gradientAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: false
        })
      ])
    ).start();
  }, []);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
  });

  const currentGradient = gradientAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [
      gradientColors[0],
      gradientColors[1],
      gradientColors[2]
    ]
  });

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.gradientContainer, {
        backgroundColor: currentGradient
      }]}>
        <Animated.View style={{ transform: [{ rotate: spin }] }}>
          <MaterialCommunityIcons 
            name="weather-cloudy" 
            size={80} 
            color="#fff" 
          />
        </Animated.View>
        <Text style={styles.text}>Loading Weather Data</Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gradientContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: '#fff',
    fontSize: 18,
    marginTop: 20,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3
  }
});

export default AnimatedPreloader;