import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import axios from 'axios';

const WeatherPage = ({ city }) => {
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const apiKey = 'c1347ee59c0c794deef2405e7fd251eb';  // Replace with your OpenWeatherMap API Key

  useEffect(() => {
    if (city) {
      fetchWeather(city);
    }
  }, [city]);

  const fetchWeather = async (city) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`
      );
      setWeatherData(response.data);
      console.log(weatherData)
    } catch (err) {
      setError('Could not fetch weather data.');
    }
    setLoading(false);
  };

  useEffect(()=>{
    fetchWeather(city)
  },[weatherData])

  return (
    <View style={styles.container}>
      {loading && <Text>Loading...</Text>}
      {error && <Text style={styles.error}>{error}</Text>}
      {weatherData && (
        <View style={styles.weatherInfo}>
          <Text style={styles.cityName}>{weatherData.name}</Text>
          <Text style={styles.temp}>{weatherData.main.temp}°C</Text>
          <Text style={styles.description}>{weatherData.weather[0].description}</Text>
          <Image
            source={{ uri: `http://openweathermap.org/img/wn/${weatherData.weather[0].icon}.png` }}
            style={styles.icon}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginTop: 20,
  },
  weatherInfo: {
    alignItems: 'center',
  },
  cityName: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  temp: {
    fontSize: 50,
    color: '#ff8c00',
  },
  description: {
    fontSize: 18,
    color: '#555',
  },
  icon: {
    width: 100,
    height: 100,
  },
  error: {
    color: 'red',
  },
});

export default WeatherPage;
