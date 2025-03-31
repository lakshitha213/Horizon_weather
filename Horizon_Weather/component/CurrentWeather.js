import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import axios from 'axios';

const CurrentWeather = ({ city }) => {
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const apiKey = 'c1347ee59c0c794deef2405e7fd251eb';

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
    } catch (err) {
      setError('Could not fetch weather data. Please try another city.');
      setWeatherData(null);
    }
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      {loading && <Text>Loading weather data...</Text>}
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
          <Text style={styles.feel}>Feels like :- {Math.round(weatherData.main.feels_like)}°C</Text>
          <Text style={styles.humidity}>Humidity :- {Math.round(weatherData.main.humidity)}%</Text>
          <Text style={styles.wind}>Wind Speed :- {Math.round(weatherData.wind.speed)}m/s</Text>
          <Text style={styles.wind}>Pressure :- {Math.round(weatherData.main.pressure)} hPa</Text>
        </View>
      )}
    </View>
  );
};

// ... keep the same styles ...


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

export default CurrentWeather;