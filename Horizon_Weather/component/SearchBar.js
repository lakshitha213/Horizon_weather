import React, { useState, useEffect } from 'react';
import { View, TextInput, FlatList, Text, TouchableOpacity, StyleSheet, Keyboard, ActivityIndicator } from 'react-native';
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons';
import LoadingSpinner from './LodingSpinner';

const SearchBar = ({ value, onChangeText, onCitySelect }) => {
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (value.length > 2) {
      const delay = setTimeout(fetchCities, 600);
      return () => clearTimeout(delay);
    } else {
      setCities([]);
    }
  }, [value]);

  const fetchCities = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(
        `https://wft-geo-db.p.rapidapi.com/v1/geo/cities?namePrefix=${value}`,
        {
          headers: {
            'X-RapidAPI-Key': '7aafc54f23mshbff4f725786ddb5p1f9440jsn3fef59bc6060',
            'X-RapidAPI-Host': 'wft-geo-db.p.rapidapi.com',
          },
        }
      );
      setCities(response.data.data);
    } catch (error) {
      if (error.response?.status === 429) {
        // Wait 1 second and try again
        await new Promise(resolve => setTimeout(resolve, 1000));
        return fetchCities();
      }
      throw error;
    }
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.input}
          placeholder="Search the city..."
          placeholderTextColor="black"
          value={value}
          onChangeText={onChangeText}
        />
        <TouchableOpacity onPress={fetchCities} style={styles.iconContainer}>
        {loading ? (
            <ActivityIndicator size="small" color="#000" />
          ) : (
            <Ionicons name="search" size={24} color="black" />
          )}
        </TouchableOpacity>
      </View>

      {loading && <Text style={styles.loadingText}>Loading...</Text>}
      {error && <Text style={styles.errorText}>{error}</Text>}

      {cities.length > 0 && (
        <View style={styles.listContainer}>
          <FlatList
            data={cities}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.item}
                onPress={() => {
                  const cityName = `${item.name}, ${item.countryCode}`;
                  onChangeText(cityName);
                  onCitySelect(item.name);
                  setCities([]);
                  Keyboard.dismiss();
                }}
              >
                <Text style={styles.itemText}>
                  {item.name}, {item.country}
                </Text>
                <Ionicons name="location-outline" size={18} color="#666" />
              </TouchableOpacity>
            )}
            keyboardShouldPersistTaps="handled"
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 10,
    position: 'relative',
    zIndex: 1000,
    marginTop: 0,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'gray',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    paddingHorizontal: 15,
    marginTop: 100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    height: 50,
  },
  input: {
    flex: 1,
    height: '100%',
    color: 'black',  // Black text color for search input
    fontSize: 16,
  },
  iconContainer: {
    padding: 8,
  },
  listContainer: {
    position: 'absolute',
    top: 60,
    left: 10,
    right: 10,
    backgroundColor: 'white',
    marginTop: 0,
    borderRadius: 10,
    maxHeight: 300,
    zIndex: 1000,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  item: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    backgroundColor: 'white',
    borderRadius: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemText: {
    fontSize: 16,
    color: '#000',
  },
  loadingText: {
    color: 'black',
    textAlign: 'center',
    padding: 15,
    fontSize: 16,
  },
  errorText: {
    color: '#ff4444',
    textAlign: 'center',
    padding: 15,
    fontSize: 16,
    fontWeight: '500',
  },
});

export default SearchBar;