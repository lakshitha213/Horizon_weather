import React, { useState, useEffect } from 'react';
import { View, TextInput, FlatList, Text, TouchableOpacity, StyleSheet } from 'react-native';
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons';

const SearchBar = ({ onCitySelect }) => {
  const [query, setQuery] = useState('');
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (query.length > 2) {
      const delay = setTimeout(fetchCities, 600); // Debounce API calls
      return () => clearTimeout(delay);
    } else {
      setCities([]);
    }
  }, [query]);

  const fetchCities = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(
        `https://wft-geo-db.p.rapidapi.com/v1/geo/cities?namePrefix=${query}`,
        {
          headers: {
            'X-RapidAPI-Key': '7aafc54f23mshbff4f725786ddb5p1f9440jsn3fef59bc6060',
            'X-RapidAPI-Host': 'wft-geo-db.p.rapidapi.com',
          },
        }
      );
      setCities(response.data.data);
    } catch (err) {
      console.error('Error fetching cities:', err);
      setError('Too many requests. Please try again later.');
    }
    setLoading(false);
  };

  const hideResults = () => {
    setCities([]); // Clear search results when user taps outside
    setQuery('');  // Optionally clear the search query as well
    Keyboard.dismiss(); // Dismiss keyboard when tapping outside
  };

  return (
    <View style={styles.container}>
      {/* Search Input with Icon */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.input}
          placeholder="Search the city..."
          placeholderTextColor="black"
          value={query}
          onChangeText={setQuery}
        />
        <TouchableOpacity onPress={fetchCities} style={styles.iconContainer}>
          <Ionicons name="search" size={24} color="black" />
        </TouchableOpacity>
      </View>

      {/* Loading & Error Messages */}
      {loading && <Text style={styles.loadingText}>Loading...</Text>}
      {error && <Text style={styles.errorText}>{error}</Text>}

      {/* Search Results */}
      {cities.length > 0 && (
        <FlatList
          data={cities}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
            style={styles.item}
            onPress={() => {
              setQuery(item.name); // Set selected city name in the search bar
              setCities([]); // Clear the search results after selecting a city
            }}  // Pass selected city to parent
            >
              <Text>{item.name}, {item.country}</Text>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 10 },

  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'gray',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#ddd',
    paddingHorizontal: 15,
    marginTop: 100,
    shadowColor: 'black',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 10,
  },

  input: {
    flex: 1,
    height: 50,
    width:100,
    color: 'black',
    fontSize: 16,
  },

  iconContainer: {
    padding: 10, // Makes the icon easier to click
  },

  item: {
    padding: 10,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    backgroundColor: 'white',
    borderRadius: 10,
    marginVertical: 0.5,
  },

  loadingText: {
    color: 'black',
    textAlign: 'center',
    marginVertical: 5,
  },

  errorText: {
    color: 'red',
    textAlign: 'center',
    marginVertical: 5,
  },
});

export default SearchBar;
