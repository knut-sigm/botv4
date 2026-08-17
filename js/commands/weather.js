import axios from 'axios';

export const name = 'weather';
export const aliases = ['meteo', 'temps'];
export const description = 'Affiche la météo actuelle avec une source de secours.';

const clean = (value) => String(value || '').trim().replace(/[<>]/g, '').slice(0, 80);

async function fetchWeather(location) {
  const encoded = encodeURIComponent(location);
  const sources = [
    async () => (await axios.get(`https://wttr.in/${encoded}?format=j1`, { timeout: 7000, responseType: 'json' })).data,
    async () => (await axios.get(`https://wttr.in/${encoded}?format=j1`, { timeout: 12000, responseType: 'json' })).data
  ];
  let lastError;
  for (const source of sources) {
    try { return await source(); } catch (error) { lastError = error; }
  }
  throw lastError || new Error('weather_unavailable');
}

export async function execute(sock, msg, args, from) {
  const location = clean(args.join(' '));
  if (!location) return sock.sendMessage(from, { text: '🌤️ Utilisation : !weather <ville>' }, { quoted: msg });
  try {
    const data = await fetchWeather(location);
    const current = data?.current_condition?.[0];
    const area = data?.nearest_area?.[0];
    if (!current) throw new Error('invalid_weather_payload');
    const place = area?.areaName?.[0]?.value || location;
    const country = area?.country?.[0]?.value || '';
    const text = [
      `🌤️ *Météo — ${place}${country ? ", ${country}" : ''}*`,
      `🌡️ Température : ${current.temp_C}°C (ressenti ${current.FeelsLikeC}°C)`,
      `☁️ Conditions : ${current.weatherDesc?.[0]?.value || 'indisponibles'}`,
      `💧 Humidité : ${current.humidity}%`,
      `💨 Vent : ${current.windspeedKmph} km/h`
    ].join('\n');
    return sock.sendMessage(from, { text }, { quoted: msg });
  } catch {
    return sock.sendMessage(from, { text: '⚠️ Service météo temporairement indisponible. Réessaie dans quelques secondes.' }, { quoted: msg });
  }
}
