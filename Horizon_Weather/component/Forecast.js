// components/Forecast.js
import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';

const Forecast = ({ forecastData }) => {
  if (!forecastData || !forecastData.list) return null;

  // Group forecast by day (one entry per day)
  const dailyForecasts = [];
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  for (let i = 0; i < 5; i++) {
    const forecastIndex = i * 8; // Get noon forecast (3hr intervals, 8 per day)
    if (forecastIndex < forecastData.list.length) {
      const forecast = forecastData.list[forecastIndex];
      const date = new Date(forecast.dt * 1000);
      dailyForecasts.push({
        day: days[date.getDay()],
        temp: Math.round(forecast.main.temp),
        icon: forecast.weather[0].icon,
        description: forecast.weather[0].description,
      });
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>5-Day Forecast</Text>
      
      {dailyForecasts.map((day, index) => (
        <View key={index} style={styles.forecastItem}>
          <Text style={styles.day}>{day.day}</Text>
          <Image
            source={{ uri: `https://openweathermap.org/img/wn/${day.icon}.png` }}
            style={styles.icon}
          />
          <Text style={styles.temp}>{day.temp}°C</Text>
          <Text style={styles.description}>{day.description}</Text>
        </View>
      ))}
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
  title: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  forecastItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.2)',
  },
  day: {
    color: '#fff',
    fontSize: 16,
    width: 40,
  },
  icon: {
    width: 30,
    height: 30,
  },
  temp: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    width: 50,
    textAlign: 'right',
  },
  description: {
    color: '#fff',
    fontSize: 14,
    width: 100,
    textTransform: 'capitalize',
  },
});

export default Forecast;