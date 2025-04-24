import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, ActivityIndicator, Animated } from 'react-native';
import axios from 'axios';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import LoadingSpinner from './LodingSpinner';

const CurrentWeather = ({ city, isDayTime }) => {
  // Initialize all state variables properly
  const [weatherData, setWeatherData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const apiKey = 'c1347ee59c0c794deef2405e7fd251eb';
  

  useEffect(() => {
    if (city) {
      fetchWeather(city);
    }
  }, [city]);

  const fetchWeather = async (city) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`
      );
      setWeatherData(response.data);
    } catch (error) {
      console.error('Error fetching weather:', error);
      setError('Failed to fetch weather data');
    } finally {
      setIsLoading(false);
    }
  };

  if (!city) {
    return (
      <View style={[styles.container,{justifyContent:'center'}]}>
        <LoadingSpinner/>
        <Text style={styles.loadingText}>...</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {isLoading && <Text>Loading weather data...</Text>}
      {error && <Text style={styles.error}>{error}</Text>}
      {weatherData && (
        <View style={styles.weatherInfo}>
          <View style={styles.headerContainer}>
            <View style={styles.illustrationContainer}>
              {isDayTime ? (
                <Image
                  source={require('../assets/sun.png')}
                  style={styles.sun}
                />
              ) : (
                <>
                  <Image
                    source={require('../assets/moon.png')}
                    style={styles.moon}
                  />
                  <Image
                    source={require('../assets/tent.png')}
                    style={styles.tent}
                  />
                </>
              )}
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.cityName}>{weatherData.name}</Text>
              <Text style={styles.temp}>{Math.round(weatherData.main.temp)}°C</Text>
            </View>
          </View>

          <Text style={styles.description}>
            {weatherData.weather[0].description}
          </Text>
          <Image
            source={{ uri: `https://openweathermap.org/img/wn/${weatherData.weather[0].icon}@2x.png` }}
            style={styles.weatherIcon}
          />
          
          <View style={styles.detailsContainer}>
            <View style={styles.detailRow}>
              <MaterialCommunityIcons name="thermometer" size={24} color="#ff8c00" style={styles.iconStyle} />
              <Text style={styles.detailText}>Feels like: {Math.round(weatherData.main.feels_like)}°C</Text>
            </View>
            <View style={styles.detailRow}>
              <MaterialCommunityIcons name="water" size={24} color="#1E90FF" style={styles.iconStyle} />
              <Text style={styles.detailText}>Humidity: {Math.round(weatherData.main.humidity)}%</Text>
            </View>
            <View style={styles.detailRow}>
              <MaterialCommunityIcons name="weather-windy" size={24} color="#4682B4" style={styles.iconStyle} />
              <Text style={styles.detailText}>Wind: {Math.round(weatherData.wind.speed)} m/s</Text>
            </View>
            <View style={styles.detailRow}>
              <MaterialCommunityIcons name="gauge" size={24} color="#696969" style={styles.iconStyle} />
              <Text style={styles.detailText}>Pressure: {Math.round(weatherData.main.pressure)} hPa</Text>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
    width: '90%',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 15,
    padding: 15,
    alignSelf: 'center',
  },
  weatherInfo: {
    alignItems: 'center',
    width: '100%',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginBottom: 15,
  },
  illustrationContainer: {
    width: 100,
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginRight: 15,
  },
  sun: {
    width: 60,
    height: 60,
    position: 'absolute',
    top: 0,
  },
  moon: {
    width: 60,
    height: 60,
    position: 'absolute',
    top: 0,
  },
  tent: {
    width: 80,
    height: 60,
    position: 'absolute',
    bottom: 0,
  },
  textContainer: {
    flex: 1,
    alignItems: 'flex-start',
  },
  cityName: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  temp: {
    color: '#fff',
    fontSize: 50,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  description: {
    color: '#fff',
    fontSize: 18,
    marginBottom: 15,
    textTransform: 'capitalize',
    textAlign: 'center',
  },
  weatherIcon: {
    width: 80,
    height: 80,
    marginBottom: 20,
  },
  error: {
    color: '#fff',
    marginBottom: 20,
  },
  detailsContainer: {
    width: '100%',
    paddingHorizontal: 20,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    width: '100%',
  },
  iconStyle: {
    width: 30,
    textAlign: 'center',
  },
  detailText: {
    color: '#fff',
    fontSize: 16,
    marginLeft: 10,
    flex: 1,
    fontWeight: 'bold',
  },
});

export default CurrentWeather;