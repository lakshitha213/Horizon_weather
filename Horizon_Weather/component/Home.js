import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableWithoutFeedback, Keyboard } from 'react-native';
import SearchBar from './SearchBar';
import WeatherPage from './CurrentWeather';  // Assuming you have a WeatherPage component

const Home = () => {
  const [search, setSearch] = useState('');  // This is the state for search input
  const [selectedCity, setSelectedCity] = useState(null);  // Store the selected city

  // Function to handle city selection and pass it to WeatherPage
  const handleCitySelect = (cityName) => {
    setSearch(cityName);  // Set city name in the search bar
    setSelectedCity(cityName); // Set selected city for weather update
  };

  return (
    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
      <View style={styles.container}>
        <Text style={styles.title}>Horizon Weather</Text>

        {/* Pass the handleCitySelect function to SearchBar to update the selected city */}
        <SearchBar value={search} onChangeText={(text) => setSearch(text)} onCitySelect={handleCitySelect} />

        {/* If a city is selected, show weather data */}
        {selectedCity && <WeatherPage city={selectedCity} />}
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    
    flex: 1, 
    backgroundColor: '#ADD8E6', // Light blue background
    width: '100%', // Ensures full width
    height: '100%', // Ensures full height
  },
  title:{
    position: 'absolute', // Position the title absolutely
    top: 50, // Adjust this to control vertical position
    left: '30%', // Center horizontally
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000', // Color for text
  },
});

export default Home;
