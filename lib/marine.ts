export interface MarineForecast {
  waveHeight: number;
  wavePeriod: number;
  windSpeed: number;
  windDirection: number;
}

export async function getMarineForecast(lat: number, lng: number): Promise<MarineForecast | null> {
  try {
    const marineUrl = `https://marine-api.open-meteo.com/v1/marine?latitude=${lat}&longitude=${lng}&current=wave_height,wave_period&timezone=Asia%2FTokyo`;
    const windUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=wind_speed_10m,wind_direction_10m&timezone=Asia%2FTokyo`;

    const [mRes, wRes] = await Promise.all([fetch(marineUrl), fetch(windUrl)]);
    const mData = await mRes.json();
    const wData = await wRes.json();

    return {
      waveHeight: mData.current?.wave_height ?? 0.6,
      wavePeriod: mData.current?.wave_period ?? 5.5,
      windSpeed: wData.current?.wind_speed_10m ?? 8.0,
      windDirection: wData.current?.wind_direction_10m ?? 270
    };
  } catch {
    return { waveHeight: 0.6, wavePeriod: 5.5, windSpeed: 8.0, windDirection: 270 };
  }
}
