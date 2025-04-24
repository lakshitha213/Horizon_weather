import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableWithoutFeedback, Keyboard, Animated, Easing, ScrollView, SafeAreaView, Platform, Image, FlatList, TouchableOpacity, Modal, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Location from 'expo-location';
import SearchBar from './SearchBar';
import CurrentWeather from './CurrentWeather';
import axios from 'axios';
import LoadingSpinner from './LodingSpinner';
import AnimatedPreloader from './AnimatedPreloader';
import { StatusBar } from 'expo-status-bar';
import Forecast from './Forecast';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LineChart } from 'react-native-chart-kit';

const Home = () => {
  const [search, setSearch] = useState('');
  const [selectedCity, setSelectedCity] = useState(null);
  const [currentWeather, setCurrentWeather] = useState('default');
  const [nextWeather, setNextWeather] = useState(null);
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [forecastData, setForecastData] = useState(null);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const apiKey = 'c1347ee59c0c794deef2405e7fd251eb';
  const [isDayTime, setIsDayTime] = useState(true);
  const [cityTimezone, setCityTimezone] = useState(null);
  const moonAnim = useRef(new Animated.Value(0)).current;
  const [selectedForecast, setSelectedForecast] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [hourlyForecast, setHourlyForecast] = useState([]);

  const weatherGradients = {
    clear: { 
      colors: ['#56CCF2', '#2F80ED'], 
      start: { x: 0, y: 0 }, 
      end: { x: 1, y: 1 } 
    },
    clouds: { 
      colors: ['#bdc3c7', '#2c3e50'], 
      start: { x: 0, y: 0 }, 
      end: { x: 1, y: 1 } 
    },
    rain: { 
      colors: ['#0F2027', '#203A43', '#2C5364'], 
      start: { x: 0, y: 0 }, 
      end: { x: 1, y: 1 } 
    },
    snow: { 
      colors: ['#E0EAFC', '#CFDEF3'], 
      start: { x: 0, y: 0 }, 
      end: { x: 1, y: 1 } 
    },
    thunderstorm: { 
      colors: ['#000000', '#434343'], 
      start: { x: 0, y: 0 }, 
      end: { x: 1, y: 1 } 
    },
    drizzle: { 
      colors: ['#4B79A1', '#283E51'], 
      start: { x: 0, y: 0 }, 
      end: { x: 1, y: 1 } 
    },
    mist: {
      colors: ['#606c88', '#3f4c6b'],
      start: { x: 0, y: 0 },
      end: { x: 1, y: 1 }
    },
    haze: {
      colors: ['#757F9A', '#D7DDE8'],
      start: { x: 0, y: 0 },
      end: { x: 1, y: 1 }
    },
    fog: {
      colors: ['#757F9A', '#D7DDE8'],
      start: { x: 0, y: 0 },
      end: { x: 1, y: 1 }
    },
    default: { 
      colors: ['#4c669f', '#3b5998', '#192f6a'], 
      start: { x: 0, y: 0 }, 
      end: { x: 1, y: 1 } 
    }
  };

  const fetcForecast = async (lat, lon) => {
    try{
      const response = await axios.get(
        `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`
      );
      setForecastData(response.data); 
    }catch (error){
      console.error('Error fetching forecast:',error);
    }
  }

  useEffect(() => {
    const loadingTimeout = setTimeout(() => {
      setIsLoading(false);
      setIsLoadingLocation(false);
    }, 2000); // 2 seconds timeout

    (async () => {
      setIsLoadingLocation(true);
      setSelectedCity(null); // Clear selected city on refresh
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        fetchDefaultWeather();
        setIsLoadingLocation(false);
        return;
      }

      try {
        let location = await Location.getCurrentPositionAsync({});
        setLocation(location);
        await fetchWeatherByCoords(location.coords.latitude, location.coords.longitude);
      } catch (error) {
        console.error('Error getting location:', error);
        setErrorMsg('Could not get your location');
        fetchDefaultWeather();
      }
      setIsLoadingLocation(false);
    })();

    return () => clearTimeout(loadingTimeout);
  }, []);

  useEffect(() => {
    if (cityTimezone) {
      checkDayTime();
      const interval = setInterval(checkDayTime, 60000);
      return () => clearInterval(interval);
    }
  }, [cityTimezone]);

  useEffect(() => {
    if (!isDayTime) {
      // Reset and start moon rise animation
      moonAnim.setValue(0);
      Animated.sequence([
        Animated.delay(500), // Small delay before starting
        Animated.timing(moonAnim, {
          toValue: 1,
          duration: 5000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        })
      ]).start();
    } else {
      // Reset animation when switching to day
      moonAnim.setValue(0);
    }
  }, [isDayTime]);

  useEffect(() => {
    if (forecastData?.list) {
      // Get next 24 hours forecast regardless of current day
      const next24Hours = forecastData.list.slice(0, 8); // Since each item is 3 hours apart, 8 items = 24 hours
      setHourlyForecast(next24Hours);
    }
  }, [forecastData]);

  const fetchWeatherByCoords = async (lat, lon) => {
    try {
      const response = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`
      );
      setSelectedCity(response.data.name);
      setCityTimezone(response.data.timezone);
      const weatherMain = response.data.weather[0].main.toLowerCase();
      startBackgroundTransition(weatherMain);
      await fetcForecast(lat, lon);
    } catch (error) {
      console.error('Error fetching weather by coordinates:', error);
      fetchDefaultWeather();
    }
  };

  const fetchDefaultWeather = async () => {
    try {
      const response = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?q=London&appid=${apiKey}&units=metric`
      );
      setSelectedCity(response.data.name);
      setCityTimezone(response.data.timezone);
      const weatherMain = response.data.weather[0].main.toLowerCase();
      startBackgroundTransition(weatherMain);
      const forecastResponse = await axios.get(
        `https://api.openweathermap.org/data/2.5/forecast?q=London&appid=${apiKey}&units=metric`
      );
      setForecastData(forecastResponse.data);
    } catch (error) {
      console.error('Error fetching default weather:', error);
      startBackgroundTransition('default');
    }
  };

  const startBackgroundTransition = (newWeatherType) => {
    setNextWeather(newWeatherType);
    fadeAnim.setValue(0);
    
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1500,
      easing: Easing.inOut(Easing.quad),
      useNativeDriver: true,
    }).start(() => {
      setCurrentWeather(newWeatherType);
      setNextWeather(null);
    });
  };

  const handleCitySelect = async (cityName) => {
    setIsLoading(true);
    setSelectedCity(cityName);
    setSearch(''); // Clear the search input
    Keyboard.dismiss();
    
    try {
      const response = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${apiKey}&units=metric`
      );
      setCityTimezone(response.data.timezone);
      const weatherMain = response.data.weather[0].main.toLowerCase();
      startBackgroundTransition(weatherMain);

      const forecastResponse = await axios.get(
        `https://api.openweathermap.org/data/2.5/forecast?q=${cityName}&appid=${apiKey}&units=metric`
      );
      setForecastData(forecastResponse.data);
    } catch (error) {
      console.error('Error fetching weather:', error);
      startBackgroundTransition('default');
    } finally {
      setIsLoading(false);
    }
  };

  const currentGradient = weatherGradients[currentWeather] || weatherGradients.default;
  const nextGradient = nextWeather ? weatherGradients[nextWeather] : null;

  // Update function to check day time based on city's timezone
  const checkDayTime = () => {
    if (cityTimezone) {
      const now = new Date();
      const cityTime = new Date(now.getTime() + (cityTimezone * 1000));
      const hour = cityTime.getUTCHours();
      setIsDayTime(hour >= 6 && hour < 18);
    }
  };

  const renderForecastItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.forecastItem}
      onPress={() => {
        setSelectedForecast(item);
        setModalVisible(true);
      }}
    >
      <Text style={styles.forecastDay}>
        {new Date(item.dt * 1000).toLocaleDateString('en-US', { weekday: 'short' })}
      </Text>
      <Image
        source={{ uri: `https://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png` }}
        style={styles.forecastIcon}
      />
      <Text style={styles.forecastTemp}>
        {Math.round(item.main.temp)}°C
      </Text>
    </TouchableOpacity>
  );

  const renderRainDetails = (rainfall) => {
    if (!rainfall || rainfall.length === 0) return null;

    const getIntensityColor = (intensity) => {
      switch (intensity) {
        case 'Light': return 'rgba(30, 144, 255, 0.6)';
        case 'Moderate': return 'rgba(0, 120, 255, 0.7)';
        case 'Heavy': return 'rgba(0, 90, 255, 0.8)';
        default: return 'rgba(30, 144, 255, 0.6)';
      }
    };

    return (
      <View style={styles.rainDetailsContainer}>
        <View style={styles.rainHeaderRow}>
          <MaterialCommunityIcons name="weather-pouring" size={20} color="#fff" />
          <Text style={styles.rainHeaderText}>Rainfall Details</Text>
        </View>

        <View style={styles.intensityLegend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: 'rgba(30, 144, 255, 0.6)' }]} />
            <Text style={styles.legendText}>Light Rain (&lt;2.5 mm/h)</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: 'rgba(0, 120, 255, 0.7)' }]} />
            <Text style={styles.legendText}>Moderate (2.5-7.6 mm/h)</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: 'rgba(0, 90, 255, 0.8)' }]} />
            <Text style={styles.legendText}>Heavy Rain (&gt;7.6 mm/h)</Text>
          </View>
        </View>

        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.rainTable}
        >
          {rainfall.map((rain, index) => (
            <View key={index} style={styles.rainRow}>
              <Text style={styles.rainTime}>{rain.time}</Text>
              <View style={styles.rainAmountContainer}>
                <View 
                  style={[
                    styles.rainBar, 
                    { 
                      width: `${Math.min(100, rain.amount * 50)}%`,
                      backgroundColor: getIntensityColor(rain.intensity)
                    }
                  ]} 
                />
                <Text style={styles.rainAmount}>
                  {rain.amount.toFixed(1)} mm/h
                </Text>
                <Text style={[styles.intensityText, { color: getIntensityColor(rain.intensity) }]}>
                  {rain.intensity}
                </Text>
              </View>
            </View>
          ))}
        </ScrollView>
      </View>
    );
  };

  const renderHourlyForecast = () => {
    const data = prepareChartData();
    if (!data) return null;

    return (
      <>
        <View style={styles.hourlyForecastContainer}>
          <Text style={styles.hourlyForecastTitle}>
            {hourlyForecast[0]?.weather[0]?.main}. Low {data.lowestTemp}°C • High {data.highestTemp}°C
          </Text>
          
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.hourlyScrollContent}
          >
            <View style={styles.hourlyContent}>
              {/* Time row */}
              <View style={styles.hourlyRow}>
                {data.labels.map((time, index) => (
                  <Text key={`time-${index}`} style={styles.timeText}>{time}</Text>
                ))}
              </View>

              {/* Weather icons row */}
              <View style={styles.hourlyRow}>
                {hourlyForecast.map((item, index) => (
                  <View key={`icon-${index}`} style={styles.iconContainer}>
                    <Image
                      source={{ uri: `https://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png` }}
                      style={styles.weatherIcon}
                    />
                  </View>
                ))}
              </View>

              {/* Temperature row */}
              <View style={styles.hourlyRow}>
                {data.temperatures.map((temp, index) => (
                  <Text key={`temp-${index}`} style={styles.tempText}>{temp}°</Text>
                ))}
              </View>

              {/* Temperature bar chart */}
              <View style={styles.chartContainer}>
                <View style={styles.chartBackground}>
                  {data.temperatures.map((temp, index) => {
                    const heightPercentage = ((temp - data.lowestTemp) / data.tempRange) * 100;
  return (
                      <View 
                        key={`bar-${index}`} 
                        style={[
                          styles.tempBar,
                          { 
                            height: `${Math.max(20, heightPercentage)}%`,
                            backgroundColor: temp > (data.lowestTemp + data.highestTemp) / 2 
                              ? 'rgba(255, 140, 0, 0.6)'  // Warm
                              : 'rgba(135, 206, 235, 0.6)' // Cool
                          }
                        ]} 
                      />
                    );
                  })}
                </View>
              </View>

              {/* Humidity row */}
              <View style={styles.hourlyRow}>
                {data.humidity.map((hum, index) => (
                  <View key={`humidity-${index}`} style={styles.humidityContainer}>
                    <MaterialCommunityIcons name="water-percent" size={16} color="#1E90FF" />
                    <Text style={styles.humidityText}>{hum}%</Text>
                  </View>
                ))}
              </View>

              {/* Precipitation chance row */}
              <View style={styles.hourlyRow}>
                {data.precipitation.map((chance, index) => (
                  <View key={`precip-${index}`} style={styles.precipContainer}>
                    <MaterialCommunityIcons name="water" size={16} color="#fff" />
                    <Text style={styles.precipText}>{Math.round(chance)}%</Text>
                  </View>
                ))}
              </View>
            </View>
          </ScrollView>
        </View>
        {data.hasRain && renderRainDetails(data.rainfall)}
      </>
    );
  };

  const renderForecastDetails = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={modalVisible}
      onRequestClose={() => setModalVisible(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <TouchableOpacity 
            style={styles.closeButton}
            onPress={() => setModalVisible(false)}
          >
            <Text style={styles.closeButtonText}>×</Text>
          </TouchableOpacity>
          
          <Text style={styles.modalTitle}>
            {new Date(selectedForecast?.dt * 1000).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
          </Text>
          
          <View style={styles.weatherDetails}>
            <View style={styles.detailRow}>
              <MaterialCommunityIcons name="thermometer" size={24} color="#ff8c00" />
              <Text style={styles.detailText}>Feels like: {Math.round(selectedForecast?.main.feels_like)}°C</Text>
            </View>
            <View style={styles.detailRow}>
              <MaterialCommunityIcons name="water" size={24} color="#1E90FF" />
              <Text style={styles.detailText}>Humidity: {Math.round(selectedForecast?.main.humidity)}%</Text>
            </View>
            <View style={styles.detailRow}>
              <MaterialCommunityIcons name="weather-windy" size={24} color="#4682B4" />
              <Text style={styles.detailText}>Wind: {Math.round(selectedForecast?.wind.speed)} m/s</Text>
            </View>
            <View style={styles.detailRow}>
              <MaterialCommunityIcons name="gauge" size={24} color="#696969" />
              <Text style={styles.detailText}>Pressure: {Math.round(selectedForecast?.main.pressure)} hPa</Text>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );

  const prepareChartData = () => {
    if (!hourlyForecast.length) return null;

    const labels = hourlyForecast.map(item => {
      const date = new Date(item.dt * 1000);
      return date.toLocaleTimeString('en-US', { 
        hour: 'numeric',
        minute: 'numeric',
        hour12: true 
      });
    });

    const temperatures = hourlyForecast.map(item => Math.round(item.main.temp));
    const lowestTemp = Math.min(...temperatures);
    const highestTemp = Math.max(...temperatures);
    const tempRange = highestTemp - lowestTemp;

    const humidity = hourlyForecast.map(item => item.main.humidity);
    const precipitation = hourlyForecast.map(item => item.pop * 100);

    const rainfall = hourlyForecast.map(item => {
      const isRaining = item.weather[0].main.toLowerCase() === 'rain';
      const amount = isRaining ? (item.rain ? item.rain['3h'] / 3 || 0 : 0) : 0;
      
      // Categorize rain intensity
      let intensity = '';
      if (amount > 0) {
        if (amount < 2.5) intensity = 'Light';
        else if (amount < 7.6) intensity = 'Moderate';
        else intensity = 'Heavy';
      }

      return {
        amount,
        intensity,
        time: new Date(item.dt * 1000).toLocaleTimeString('en-US', { 
          hour: 'numeric',
          minute: 'numeric',
          hour12: true 
        })
      };
    }).filter(item => item.amount > 0);

    return {
      labels,
      temperatures,
      lowestTemp,
      highestTemp,
      tempRange,
      humidity,
      precipitation,
      rainfall,
      hasRain: rainfall.length > 0
    };
  };

  const chartConfig = {
    backgroundGradientFrom: 'transparent',
    backgroundGradientTo: 'transparent',
    color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    strokeWidth: 2,
    barPercentage: 0.5,
    useShadowColorFromDataset: false,
    decimalPlaces: 0,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: "4",
      strokeWidth: "2",
      stroke: "#fff"
    },
    propsForLabels: {
      fontSize: 10,
      fill: '#fff'
    }
  };

  return (
    <View style={styles.container}>
        <StatusBar translucent backgroundColor="transparent" />
        
        {/* Full-screen preloader */}
        {(isLoadingLocation || isLoading) && (
          <View style={styles.absoluteFill}>
            <LinearGradient
              colors={['#4c669f', '#3b5998', '#192f6a']}
              style={styles.background}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
            <AnimatedPreloader/>
            </LinearGradient>
          </View>
        )}
        
        {/* Main content */}
        {!(isLoadingLocation || isLoading) && (
          <>
            <LinearGradient
              colors={currentGradient.colors}
              style={styles.background}
              start={currentGradient.start}
              end={currentGradient.end}
            />
            
            {nextGradient && (
              <Animated.View style={[styles.background, {
                opacity: fadeAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [1, 0]
                })
              }]}>
                <LinearGradient
                  colors={nextGradient.colors}
                  style={styles.background}
                  start={nextGradient.start}
                  end={nextGradient.end}
                />
              </Animated.View>
            )}
            
          <ScrollView 
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.content}>
              <Text style={styles.title}>Horizon Weather</Text>
              
              {errorMsg && <Text style={styles.errorText}>{errorMsg}</Text>}
              
              <SearchBar 
                value={search}
                onChangeText={setSearch}
                onCitySelect={handleCitySelect}
              />
              
              {/* Day/Night Time Indicator */}
              <View style={styles.timeIndicator}>
                <Text style={styles.timeText}>
                  {isDayTime ? 'Day Time' : 'Night Time'}
                </Text>
              </View>
              
              <CurrentWeather city={selectedCity} isDayTime={isDayTime} />
              
              {renderHourlyForecast()}
              
              {/* 7-Day Forecast Section */}
              <View style={styles.forecastContainer}>
                <Text style={styles.forecastTitle}>7-Day Forecast</Text>
                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.forecastList}
                >
                  {forecastData?.list?.filter((_, index) => index % 8 === 0).slice(0, 7).map((item, index) => (
                    <TouchableOpacity 
                      key={index}
                      style={styles.forecastItem}
                      onPress={() => {
                        setSelectedForecast(item);
                        setModalVisible(true);
                      }}
                    >
                      <Text style={styles.forecastDay}>
                        {new Date(item.dt * 1000).toLocaleDateString('en-US', { weekday: 'short' })}
                      </Text>
                      <Image
                        source={{ uri: `https://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png` }}
                        style={styles.forecastIcon}
                      />
                      <Text style={styles.forecastTemp}>
                        {Math.round(item.main.temp)}°C
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>
          </ScrollView>
          </>
        )}
      
      {renderForecastDetails()}
      </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    
  },
  forecastContainer: {
    marginTop: 20,
    marginBottom: 20,
    width: '90%',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 15,
    padding: 15,
    alignSelf: 'center',
  },
  forecastTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  forecastList: {
    flexDirection: 'row',
    paddingHorizontal: 5,
    gap: 10,
  },
  forecastItem: {
    width: 100,
    alignItems: 'center',
    padding: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 10,
    marginRight: 10,
  },
  forecastDay: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  forecastIcon: {
    width: 50,
    height: 50,
    marginBottom: 5,
  },
  forecastTemp: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  background: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  title: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    textAlign: 'center',
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  errorText: {
    color: '#ff4444',
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
  },
  absoluteFill: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
    justifyContent: 'center',
    alignItems: 'center'
  },
  illustrationContainer: {
    width: '100%',
    height: 180,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    marginBottom: 10,
    position: 'relative',
    overflow: 'hidden',
  },
  timeIndicator: {
    marginTop: 10,
    marginBottom: 10,
    alignItems: 'center',
  },
  timeText: {
    color: '#fff',
    fontSize: 14,
    width: 60,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
    padding: 20,
    width: '80%',
    maxWidth: 400,
  },
  closeButton: {
    position: 'absolute',
    right: 10,
    top: 10,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 24,
    color: '#000',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#000',
  },
  weatherDetails: {
    marginTop: 10,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  detailText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#000',
  },
  hourlyForecastContainer: {
    marginTop: 20,
    width: '90%',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 15,
    padding: 15,
    alignSelf: 'center',
  },
  hourlyForecastTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  hourlyForecastItem: {
    alignItems: 'center',
    marginRight: 15,
    padding: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 10,
  },
  hourlyTime: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 5,
  },
  hourlyTemp: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  rainDetailsContainer: {
    marginTop: 20,
    width: '90%',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 15,
    padding: 15,
    alignSelf: 'center',
  },
  rainDetailsTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  rainDetailsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    padding: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 10,
  },
  rainTime: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  rainIntensity: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  hourlyScrollContent: {
    paddingHorizontal: 10,
  },
  hourlyContent: {
    gap: 15,
    minWidth: '100%',
  },
  hourlyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 0,
    paddingHorizontal: 10,
  },
  iconContainer: {
    width: 60,
    alignItems: 'center',
  },
  weatherIcon: {
    width: 30,
    height: 30,
  },
  tempText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    width: 60,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  chartContainer: {
    height: 60,
    marginVertical: 10,
    paddingHorizontal: 10,
  },
  chartBackground: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'flex-start',
    height: '100%',
    width: '100%',
  },
  tempBar: {
    width: 40,
    marginHorizontal: 10,
    borderRadius: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  humidityContainer: {
    width: 60,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  humidityText: {
    color: '#fff',
    fontSize: 12,
    marginLeft: 2,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  precipContainer: {
    width: 60,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  precipText: {
    color: '#fff',
    fontSize: 12,
    marginLeft: 2,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  rainHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    gap: 8,
  },
  rainHeaderText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  rainTable: {
    flexDirection: 'row',
    paddingHorizontal: 5,
    gap: 8,
  },
  rainRow: {
    width: 120,
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 3,
    padding: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 6,
  },
  rainAmountContainer: {
    width: '100%',
    flexDirection: 'column',
    gap: 3,
  },
  rainBar: {
    height: 12,
    borderRadius: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  rainAmount: {
    color: '#fff',
    fontSize: 11,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  intensityText: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  intensityLegend: {
    marginBottom: 15,
    padding: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  legendText: {
    color: '#fff',
    fontSize: 12,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
});

export default Home;