import { WeatherData } from "../types";

const GEOCODING_API = "https://geocoding-api.open-meteo.com/v1/search";
const FORECAST_API = "https://api.open-meteo.com/v1/forecast";

interface GeoResult {
  name: string;
  latitude: number;
  longitude: number;
  country: string;
}

export async function getWeatherForLocation(location: string): Promise<WeatherData | null> {
  try {
    // 1. Get Coordinates
    const geoUrl = `${GEOCODING_API}?name=${encodeURIComponent(location)}&count=1&language=en&format=json`;
    const geoResponse = await fetch(geoUrl);
    const geoData = await geoResponse.json();

    if (!geoData.results || geoData.results.length === 0) {
      console.warn(`No coordinates found for location: ${location}`);
      return null;
    }

    const { latitude, longitude, name, country } = geoData.results[0] as GeoResult;

    // 2. Get Forecast
    const forecastUrl = `${FORECAST_API}?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=4`;
    const weatherResponse = await fetch(forecastUrl);
    const weatherData = await weatherResponse.json();

    if (!weatherData.current || !weatherData.daily) {
      return null;
    }

    // 3. Format Data
    const daily = [];
    // Skip today (index 0) for the forecast list, or include it if preferred. 
    // Usually "3 day forecast" means the next 3 days. 
    // The API returns today + next days. Let's take the next 3 days (indices 1, 2, 3).
    for (let i = 1; i <= 3; i++) {
        if (weatherData.daily.time[i]) {
            daily.push({
                date: weatherData.daily.time[i],
                maxTemp: Math.round(weatherData.daily.temperature_2m_max[i]),
                minTemp: Math.round(weatherData.daily.temperature_2m_min[i]),
                weatherCode: weatherData.daily.weather_code[i]
            });
        }
    }

    return {
      location: `${name}, ${country}`,
      currentTemp: Math.round(weatherData.current.temperature_2m),
      currentWeatherCode: weatherData.current.weather_code,
      daily
    };

  } catch (error) {
    console.error("Failed to fetch weather data:", error);
    return null;
  }
}