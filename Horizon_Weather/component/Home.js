import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableWithoutFeedback, Keyboard, Animated, Easing, ScrollView, SafeAreaView, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Location from 'expo-location';
import SearchBar from './SearchBar';
import CurrentWeather from './CurrentWeather';
import axios from 'axios';
import LoadingSpinner from './LodingSpinner';
import AnimatedPreloader from './AnimatedPreloader';
import { StatusBar } from 'expo-status-bar';
import Forecast from './Forecast';

const Home = () => {
  const [search, setSearch] = useState('');
  const [selectedCity, setSelectedCity] = useState(null);
  const [currentWeather, setCurrentWeather] = useState('default');
  const [nextWeather, setNextWeather] = useState(null);
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [forecastData, setForecastData] = useState(null);
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

  const fetcForecast = async (lat, lon) => {
    try{
      const response = await axios.get(
        `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`
      );
      setForecastData(response.data); 
    }catch (error){
      console.error('Error fetching forecast:',error);
    }
  }

  useEffect(() => {
    const loadingTimeout = setTimeout(() => {
      setIsLoading(false);
      setIsLoadingLocation(false);
    }, 2000); // 2 seconds timeout

    (async () => {
      setIsLoadingLocation(true);
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        fetchDefaultWeather();
        setIsLoadingLocation(false);
        return;
      }

      try {
        let location = await Location.getCurrentPositionAsync({});
        setLocation(location);
        await fetchWeatherByCoords(location.coords.latitude, location.coords.longitude);
      } catch (error) {
        console.error('Error getting location:', error);
        setErrorMsg('Could not get your location');
        fetchDefaultWeather();
      }
      setIsLoadingLocation(false);
    })();

    return () => clearTimeout(loadingTimeout);
  }, []);

  

  const fetchWeatherByCoords = async (lat, lon) => {
    try {
      const response = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`
      );
      setSelectedCity(response.data.name);
      const weatherMain = response.data.weather[0].main.toLowerCase();
      startBackgroundTransition(weatherMain);
    } catch (error) {
      console.error('Error fetching weather by coordinates:', error);
      fetchDefaultWeather();
    }
  };

  const fetchDefaultWeather = async () => {
    try {
      const response = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?q=London&appid=${apiKey}&units=metric`
      );
      setSelectedCity(response.data.name);
      const weatherMain = response.data.weather[0].main.toLowerCase();
      startBackgroundTransition(weatherMain);
      const forecastResponse = await axios.get(
        `https://api.openweathermap.org/data/2.5/forecast?q=London&appid=${apiKey}&units=metric`
      )
      setForecastData(forecastResponse.data);
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
    setIsLoading(true); // Set loading state when fetching new city data
    setSelectedCity(cityName);
    Keyboard.dismiss();
    
    try {
      const response = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${apiKey}&units=metric`
      );
      const weatherMain = response.data.weather[0].main.toLowerCase();
      startBackgroundTransition(weatherMain);

      const forecastResponse =await axios.get(
        `https://api.openweathermap.org/data/2.5/forecast?q=${cityName}&appid=${apiKey}&units=metric`
      );
      setForecastData(forecastResponse.data);
    } catch (error) {
      console.error('Error fetching weather:', error);
      startBackgroundTransition('default');
    } finally {
      setIsLoading(false); // Always turn off loading when done
    }
  };

  const currentGradient = weatherGradients[currentWeather] || weatherGradients.default;
  const nextGradient = nextWeather ? weatherGradients[nextWeather] : null;

  return (
    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
      <View style={styles.container}>
      
        <StatusBar translucent backgroundColor="transparent" />
        
        {/* Full-screen preloader */}
        {(isLoadingLocation || isLoading) && (
          <View style={styles.absoluteFill}>
            <LinearGradient
              colors={['#4c669f', '#3b5998', '#192f6a']}
              style={styles.background}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
            <AnimatedPreloader />
            </LinearGradient>
          </View>
        )}
        
        {/* Main content */}
        {!(isLoadingLocation || isLoading) && (
          <>
            <LinearGradient
              colors={currentGradient.colors}
              style={styles.background}
              start={currentGradient.start}
              end={currentGradient.end}
            />
            
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
            
            <ScrollView 
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
            <View style={styles.content}>
              <Text style={styles.title}>Horizon Weather</Text>
              
              {errorMsg && <Text style={styles.errorText}>{errorMsg}</Text>}
              
              <SearchBar 
                value={search}
                onChangeText={setSearch}
                onCitySelect={handleCitySelect}
              />
              
              <CurrentWeather city={selectedCity} />
              <Forecast forecastData={forecastData} />

              <View style={{ height: 20 }} />
            </View>
            </ScrollView>
          </>
        )}
      
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
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
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
  errorText: {
    color: '#ff4444',
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 50,
  },
  loadingText: {
    color: '#fff',
    fontSize: 18,
  },
  absoluteFill: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
    justifyContent: 'center',
    alignItems: 'center'
  },
});

export default Home;