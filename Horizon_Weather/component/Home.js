import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableWithoutFeedback, Keyboard, Animated, Easing } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import SearchBar from './SearchBar';
import CurrentWeather from './CurrentWeather';
import axios from 'axios';

const Home = () => {
  const [search, setSearch] = useState('');
  const [selectedCity, setSelectedCity] = useState('London');
  const [currentWeather, setCurrentWeather] = useState('default');
  const [nextWeather, setNextWeather] = useState(null);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const apiKey = 'c1347ee59c0c794deef2405e7fd251eb';

  const weatherGradients = {
    clear: { colors: ['#56CCF2', '#2F80ED'], start: { x: 0, y: 0 }, end: { x: 1, y: 1 } },
    clouds: { colors: ['#bdc3c7', '#2c3e50'], start: { x: 0, y: 0 }, end: { x: 1, y: 1 } },
    rain: { colors: ['#0F2027', '#203A43', '#2C5364'], start: { x: 0, y: 0 }, end: { x: 1, y: 1 } },
    snow: { colors: ['#E0EAFC', '#CFDEF3'], start: { x: 0, y: 0 }, end: { x: 1, y: 1 } },
    thunderstorm: { colors: ['#000000', '#434343'], start: { x: 0, y: 0 }, end: { x: 1, y: 1 } },
    drizzle: { colors: ['#4B79A1', '#283E51'], start: { x: 0, y: 0 }, end: { x: 1, y: 1 } },
    default: { colors: ['#4c669f', '#3b5998', '#192f6a'], start: { x: 0, y: 0 }, end: { x: 1, y: 1 } }
  };

  useEffect(() => {
    fetchDefaultWeather();
  }, []);

  const fetchDefaultWeather = async () => {
    try {
      const response = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?q=London&appid=${apiKey}&units=metric`
      );
      const weatherMain = response.data.weather[0].main.toLowerCase();
      startBackgroundTransition(weatherMain);
    } catch (error) {
      console.error('Error fetching default weather:', error);
      startBackgroundTransition('default');
    }
  };

  const startBackgroundTransition = (newWeatherType) => {
    setNextWeather(newWeatherType);
    fadeAnim.setValue(0);
    
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1500,
      easing: Easing.inOut(Easing.quad),
      useNativeDriver: true,
    }).start(() => {
      setCurrentWeather(newWeatherType);
      setNextWeather(null);
    });
  };

  const handleCitySelect = async (cityName) => {
    setSelectedCity(cityName);
    Keyboard.dismiss();
    
    try {
      const response = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${apiKey}&units=metric`
      );
      const weatherMain = response.data.weather[0].main.toLowerCase();
      startBackgroundTransition(weatherMain);
    } catch (error) {
      console.error('Error fetching weather:', error);
      startBackgroundTransition('default');
    }
  };

  const currentGradient = weatherGradients[currentWeather] || weatherGradients.default;
  const nextGradient = nextWeather ? weatherGradients[nextWeather] : null;

  return (
    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
      <View style={styles.container}>
        {/* Current background (static) */}
        <LinearGradient
          colors={currentGradient.colors}
          style={styles.background}
          start={currentGradient.start}
          end={currentGradient.end}
        />
        
        {/* Transition background (animated) */}
        {nextGradient && (
          <Animated.View style={[styles.background, {
            opacity: fadeAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [1, 0]
            })
          }]}>
            <LinearGradient
              colors={nextGradient.colors}
              style={styles.background}
              start={nextGradient.start}
              end={nextGradient.end}
            />
          </Animated.View>
        )}
        
        {/* Content */}
        <View style={styles.content}>
          <Text style={styles.title}>Horizon Weather</Text>
          
          <SearchBar 
            value={search}
            onChangeText={setSearch}
            onCitySelect={handleCitySelect}
          />
          
          {selectedCity && <CurrentWeather city={selectedCity} />}
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  background: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  content: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  title: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    textAlign: 'center',
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
});

export default Home;