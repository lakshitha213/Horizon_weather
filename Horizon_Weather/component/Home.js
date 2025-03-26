import React, { useState } from 'react';
import { View, Text, StyleSheet,TouchableWithoutFeedback,Keyboard } from 'react-native';
import SearchBar from './SearchBar';

const Home = () => {

    const[search, setSearch] = useState('');

  return (
    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
    <View style={styles.container}>
      <Text style={styles.title}>Horizon Weather</Text>

      <SearchBar value={search} onChangeText={(text)=> setSearch(text)}/>

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
