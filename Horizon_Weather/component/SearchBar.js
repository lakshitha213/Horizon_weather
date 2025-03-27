import React, { useState } from "react";
import { View, TextInput, FlatList, Text, TouchableOpacity, StyleSheet } from "react-native";
import axios from "axios";

const SearchBar = () => {
  const [query, setQuery] = useState("");
  const [cities, setCities] = useState([]);

  const fetchCities = async (text) => {
    setQuery(text);
    if (text.length > 2) {
      try {
        const response = await axios.get(
          `https://wft-geo-db.p.rapidapi.com/v1/geo/cities?namePrefix=${text}`,
          {
            headers: {
              "X-RapidAPI-Key": "7aafc54f23mshbff4f725786ddb5p1f9440jsn3fef59bc6060",
              "X-RapidAPI-Host": "wft-geo-db.p.rapidapi.com",
            },
          }
        );
        setCities(response.data.data);
      } catch (error) {
        console.error("Error fetching cities:", error);
      }
    } else {
      setCities([]);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Search city..."
        value={query}
        onChangeText={fetchCities}
      />
      {cities.length > 0 && (
        <FlatList
          data={cities}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.item} onPress={() => setQuery(item.name)}>
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
  input: { width: '100%',
    height: 40,
    marginTop: 100,
    paddingHorizontal: 10,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd', },
  item: { padding: 10, borderBottomWidth: 1 },
});

export default SearchBar;
