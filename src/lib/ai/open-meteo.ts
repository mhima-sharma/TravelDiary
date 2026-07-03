import { callExternalApi, ApiResult } from "./api-client";

const BASE_URL = "https://api.open-meteo.com/v1/forecast";

export interface CurrentWeather {
  temperatureC: number;
  windSpeedKmh: number;
  weatherCode: number;
  time: string;
}

interface OpenMeteoResponse {
  current_weather?: { temperature: number; windspeed: number; weathercode: number; time: string };
}

async function fetchCurrentWeather(lat: number, lon: number): Promise<CurrentWeather> {
  const url = `${BASE_URL}?latitude=${lat}&longitude=${lon}&current_weather=true`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Open-Meteo responded with ${res.status}`);

  const json: OpenMeteoResponse = await res.json();
  if (!json.current_weather) throw new Error("Open-Meteo returned no current weather data");

  return {
    temperatureC: json.current_weather.temperature,
    windSpeedKmh: json.current_weather.windspeed,
    weatherCode: json.current_weather.weathercode,
    time: json.current_weather.time,
  };
}

export async function getCurrentWeather(
  lat: number,
  lon: number,
  userId: string | null
): Promise<ApiResult<CurrentWeather>> {
  return callExternalApi("OPEN_METEO", "forecast", "TRIP_PLANNER", userId, () => fetchCurrentWeather(lat, lon));
}
