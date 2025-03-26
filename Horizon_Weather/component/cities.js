import React, { useState } from "react";
import { View, FlatList, Text, ActivityIndicator, StyleSheet } from "react-native";
import SearchBar from "./SearchBar"; // Ensure correct import path
import { geoApiOptions, GEO_API_URL, getDistanceBetweenPlaces } from "../api/api"; // Adjust path if needed

const Cities = () => {
  const [search, setSearch] = useState("");
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [distance, setDistance] = useState(null);

  const loadOptions = async (inputValue) => {
    if (inputValue.length < 2) {
      setCities([]); // Clear results if input is too short
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `${GEO_API_URL}/cities?namePrefix=${inputValue}&country=LK`,
        geoApiOptions
      );

      if (!response.ok) throw new Error("Failed to fetch cities.");

      const data = await response.json();
      setCities(data.data); // Store fetched cities
    } catch (error) {
      console.error("Error fetching cities:", error);
      setCities([]);
    } finally {
      setLoading(false);
    }
  };

  const handleOnChange = (inputValue) => {
    setSearch(inputValue);
    loadOptions(inputValue);
  };

  const handleCitySelect = async (city) => {
    setSearch(`${city.name}, ${city.region}`);
    setCities([]); // Hide suggestions

    // Fetch distance to a fixed city (e.g., New York with ID "Q60")
    const distanceData = await getDistanceBetweenPlaces(city.id);
    if (distanceData) {
      setDistance(distanceData.distance);
    }
  };

  return (
    <View style={styles.container}>
      <SearchBar value={search} onChangeText={handleOnChange} />

      {loading && <ActivityIndicator size="small" color="#0000ff" />}

      <FlatList
        data={cities}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Text style={styles.cityItem} onPress={() => handleCitySelect(item)}>
            {item.name}, {item.region}
          </Text>
        )}
      />

      {distance !== null && (
        <Text style={styles.distanceText}>Distance: {distance} km</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 10,
    backgroundColor: "#f9f9f9",
  },
  cityItem: {
    padding: 10,
    fontSize: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  distanceText: {
    marginTop: 10,
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default Cities;
