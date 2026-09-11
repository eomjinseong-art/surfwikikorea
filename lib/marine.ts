export interface MarineForecast {
  waveHeight: number;
  wavePeriod: number;
  windSpeed: number;
  windDirection: number;
}

export async function getMarineForecast(lat: number, lng: number, signal?: AbortSignal): Promise<MarineForecast | null> {
  try {
    const marineUrl = `https://marine-api.open-meteo.com/v1/marine?latitude=${lat}&longitude=${lng}&current=wave_height,wave_period&timezone=Asia%2FTokyo`;
    const windUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=wind_speed_10m,wind_direction_10m&timezone=Asia%2FTokyo`;

    const [mRes, wRes] = await Promise.all([fetch(marineUrl, { signal }), fetch(windUrl, { signal })]);
    const mData = await mRes.json();
    const wData = await wRes.json();

    const waveHeight = mData.current?.wave_height;
    const wavePeriod = mData.current?.wave_period;
    const windSpeed = wData.current?.wind_speed_10m;
    const windDirection = wData.current?.wind_direction_10m;
    if (typeof waveHeight !== "number" || !Number.isFinite(waveHeight)) return null;

    return {
      waveHeight,
      wavePeriod: typeof wavePeriod === "number" && Number.isFinite(wavePeriod) ? wavePeriod : 0,
      windSpeed: typeof windSpeed === "number" && Number.isFinite(windSpeed) ? windSpeed : 0,
      windDirection: typeof windDirection === "number" && Number.isFinite(windDirection) ? windDirection : 0,
    };
  } catch {
    return null;
  }
}
