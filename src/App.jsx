import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import './App.css';

const API_KEY = 'a5b51fd70ee60b0f5c54959206f3c127'; 

const WeatherApp = () => {
  const [city, setCity] = useState('');
  const [weatherData, setWeatherData] = useState(null);
  const [forecastData, setForecastData] = useState(null);
  const [error, setError] = useState('');
  const [searchHistory, setSearchHistory] = useState([]);

  
  const fetchWeather = useCallback(async (city) => {
    try {
      const weatherResponse = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`
      );
      const forecastResponse = await axios.get(
        `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&units=metric`
      );

      setWeatherData(weatherResponse.data);
      setForecastData(processForecastData(forecastResponse.data.list));
      setError('');
      localStorage.setItem('lastCity', city);
      setSearchHistory((prev) => [...new Set([city, ...prev])]);
    } catch (err) {
      setError('City not found. Please try again.');
      setWeatherData(null);
      setForecastData(null);
    }
  }, []);

  useEffect(() => {
    const lastCity = localStorage.getItem('lastCity');
    if (lastCity) {
      setCity(lastCity);
      fetchWeather(lastCity);
    }
  }, [fetchWeather]);

  const processForecastData = (forecastList) => {
    const dailyForecast = {};
    forecastList.forEach((item) => {
      const date = item.dt_txt.split(" ")[0];
      if (!dailyForecast[date] || item.dt_txt.includes("12:00:00")) {
        dailyForecast[date] = item;
      }
    });
    return Object.values(dailyForecast).slice(0, 5);
  };

  return (
    <div className="weather-app">
      <h1>Weather Forecast</h1>
      <div className="search-container">
        <input
          type="text"
          placeholder="Enter city name"
          value={city}
          onChange={(e) => setCity(e.target.value)}
        />
        <button onClick={() => fetchWeather(city)}>Get Weather</button>
      </div>

      {error && <p className="error">{error}</p>}

      {weatherData && <WeatherCard data={weatherData} />}

      {forecastData && (
        <div className="forecast-container">
          <h2>5-Day Forecast</h2>
          <div className="forecast-grid">
            {forecastData.map((day, index) => (
              <ForecastCard key={index} forecast={day} />
            ))}
          </div>
        </div>
      )}

      <h3>Search History</h3>
      <ul className="history-list">
        {searchHistory.map((city, index) => (
          <li key={index} onClick={() => fetchWeather(city)}>{city}</li>
        ))}
      </ul>
    </div>
  );
};

const WeatherCard = ({ data }) => (
  <div className="weather-card">
    <h2>{data.name}, {data.sys?.country}</h2>
    <p>Temperature: {data.main?.temp}°C</p>
    <p>Humidity: {data.main?.humidity}%</p>
    <p>Wind Speed: {data.wind?.speed} m/s</p>
    <img
      src={`https://openweathermap.org/img/wn/${data.weather[0]?.icon}@2x.png`}
      alt={data.weather[0]?.description}
    />
    <p>{data.weather[0]?.description}</p>
  </div>
);

const ForecastCard = ({ forecast }) => (
  <div className="forecast-card">
    <h3>{new Date(forecast.dt * 1000).toLocaleDateString('en-US', { weekday: 'long' })}</h3>
    <p>{new Date(forecast.dt * 1000).toLocaleDateString()}</p>
    <img
      src={`https://openweathermap.org/img/wn/${forecast.weather[0].icon}@2x.png`}
      alt={forecast.weather[0].description}
    />
    <p>Temp: {forecast.main.temp}°C</p>
    <p>Humidity: {forecast.main.humidity}%</p>
    <p>Wind: {forecast.wind.speed} m/s</p>
  </div>
);

export default WeatherApp;