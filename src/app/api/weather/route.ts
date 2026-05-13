import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get("lat") || "55.6761"; // Copenhagen default
  const lon = searchParams.get("lon") || "12.5683";

  try {
    const apiKey = process.env.OPENWEATHER_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "No API key configured" }, { status: 500 });
    }

    const res = await fetch(
      `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&exclude=minutely,alerts&units=metric&appid=${apiKey}`
    );

    if (!res.ok) {
      // Fallback to free 2.5 API if 3.0 isn't available
      const fallback = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`
      );

      if (!fallback.ok) {
        return NextResponse.json(
          { error: "Weather fetch failed" },
          { status: 502 }
        );
      }

      const data = await fallback.json();
      return NextResponse.json({
        temp: Math.round(data.main.temp),
        feelsLike: Math.round(data.main.feels_like),
        description: data.weather[0].description,
        icon: data.weather[0].icon,
        humidity: data.main.humidity,
        windSpeed: Math.round(data.wind.speed * 3.6),
        city: data.name,
      });
    }

    const data = await res.json();
    return NextResponse.json({
      temp: Math.round(data.current.temp),
      feelsLike: Math.round(data.current.feels_like),
      description: data.current.weather[0].description,
      icon: data.current.weather[0].icon,
      humidity: data.current.humidity,
      windSpeed: Math.round(data.current.wind_speed * 3.6),
      city: data.timezone,
    });
  } catch {
    return NextResponse.json({ error: "Weather failed" }, { status: 500 });
  }
}
