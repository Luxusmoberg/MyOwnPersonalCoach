"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Cloud,
  CloudRain,
  CloudSun,
  Sun,
  Snowflake,
  CloudLightning,
  CloudFog,
  Wind,
} from "lucide-react";

interface WeatherData {
  temp: number;
  feelsLike: number;
  description: string;
  icon: string;
  humidity: number;
  windSpeed: number;
  city: string;
}

function getWeatherIcon(icon: string) {
  const map: Record<string, React.ReactNode> = {
    "01d": <Sun className="h-8 w-8 text-yellow-500" />,
    "01n": <Sun className="h-8 w-8 text-yellow-400 opacity-50" />,
    "02d": <CloudSun className="h-8 w-8 text-yellow-500" />,
    "02n": <CloudSun className="h-8 w-8 text-gray-400" />,
    "03d": <Cloud className="h-8 w-8 text-gray-400" />,
    "03n": <Cloud className="h-8 w-8 text-gray-500" />,
    "04d": <Cloud className="h-8 w-8 text-gray-500" />,
    "04n": <Cloud className="h-8 w-8 text-gray-600" />,
    "09d": <CloudRain className="h-8 w-8 text-blue-400" />,
    "09n": <CloudRain className="h-8 w-8 text-blue-500" />,
    "10d": <CloudRain className="h-8 w-8 text-blue-500" />,
    "10n": <CloudRain className="h-8 w-8 text-blue-600" />,
    "11d": <CloudLightning className="h-8 w-8 text-purple-500" />,
    "11n": <CloudLightning className="h-8 w-8 text-purple-600" />,
    "13d": <Snowflake className="h-8 w-8 text-cyan-400" />,
    "13n": <Snowflake className="h-8 w-8 text-cyan-500" />,
    "50d": <CloudFog className="h-8 w-8 text-gray-300" />,
    "50n": <CloudFog className="h-8 w-8 text-gray-400" />,
  };
  return map[icon] || <Cloud className="h-8 w-8 text-gray-400" />;
}

export function WeatherWidget() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          fetch(`/api/weather?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}`)
            .then((r) => r.json())
            .then((data) => {
              if (!data.error) setWeather(data);
            })
            .catch(() => {})
            .finally(() => setLoading(false));
        },
        () => {
          // Fallback to default location
          fetch("/api/weather")
            .then((r) => r.json())
            .then((data) => {
              if (!data.error) setWeather(data);
            })
            .catch(() => {})
            .finally(() => setLoading(false));
        }
      );
    } else {
      fetch("/api/weather")
        .then((r) => r.json())
        .then((data) => {
          if (!data.error) setWeather(data);
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, []);

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <Skeleton className="h-16 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!weather) return null;

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {getWeatherIcon(weather.icon)}
            <div>
              <p className="text-3xl font-bold">{weather.temp}°C</p>
              <p className="text-sm text-muted-foreground capitalize">
                {weather.description}
              </p>
              <p className="text-xs text-muted-foreground">
                Feels like {weather.feelsLike}°C
              </p>
            </div>
          </div>
          <div className="text-right text-xs text-muted-foreground space-y-1">
            <div className="flex items-center gap-1 justify-end">
              <Wind className="h-3 w-3" />
              {weather.windSpeed} km/h
            </div>
            <div>💧 {weather.humidity}%</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
