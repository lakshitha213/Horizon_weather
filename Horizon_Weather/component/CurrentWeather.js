import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, ActivityIndicator } from 'react-native';
import axios from 'axios';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import LoadingSpinner from './LodingSpinner';

const CurrentWeather = ({ city }) => {
  // Initialize all state variables properly
  const [weatherData, setWeatherData] = useState(null);
  const [isLoading, setIsLoading] = useState(false); // Renamed to be more descriptive
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
          <Text style={styles.cityName}>{weatherData.name}</Text>
          <Text style={styles.temp}>{Math.round(weatherData.main.temp)}°C</Text>
          <Text style={styles.description}>
            {weatherData.weather[0].description}
          </Text>
          <Image
            source={{ uri: `https://openweathermap.org/img/wn/${weatherData.weather[0].icon}@2x.png` }}
            style={styles.icon}
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
    alignItems: 'center',
    marginTop: 20,
    marginHorizontal: 20,       // Equal left/right spacing
    width: '90%',              // Slightly less than full width
    backgroundColor: 'gray', // Pleasant light gray
    borderRadius: 20,          // Rounded corners
    padding: 20,               // Internal spacing
    alignSelf: 'center',       // Horizontal centering
    borderWidth: 2,            // Optional subtle border
    borderColor: '#e0e0e0',    // Light border color
    shadowColor: '#000',       // Subtle shadow
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  weatherInfo: {
    alignItems: 'center',
    width: '90%',
  },
  cityName: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  temp: {
    fontSize: 50,
    color: '#ff8c00',
    marginBottom: 5,
  },
  description: {
    fontSize: 18,
    color: '#555',
    marginBottom: 15,
    textTransform: 'capitalize',
  },
  icon: {
    width: 100,
    height: 100,
    alignItems:'center' ,
    marginBottom: 20,
  },
  error: {
    color: 'red',
    marginBottom: 20,
  },
  detailsContainer: {
    width: '100%',
    paddingHorizontal: 80,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    width: '100%',
  },
  iconStyle: {
    width: 30,  // Fixed width for consistent alignment
    textAlign: 'center',
  },
  detailText: {
    fontSize: 16,
  marginLeft: 10,
  color: '#333',
  flex: 1,
  fontWeight: 'bold', 
  },
});

export default CurrentWeather;