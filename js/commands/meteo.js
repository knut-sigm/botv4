import axios from "axios";

export const name = "meteo";

export async function execute(sock, msg, args) {
  try {
    const from = msg.key.remoteJid;
    const city = args.join(" ");

    if (!city) {
      await sock.sendMessage(from, { text: "> Knut XMD:❌ Utilisation : meteo <ville>" }, { quoted: msg });
      return;
    }

    const apiKey = "4902c0f2550f58298ad4146a92b65e10"; // Remplace par ta clé OpenWeather
    const response = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric&lang=fr`
    );

    const weather = response.data;
    const weatherText = `> ╔────────METEO────────╗
> 🌆 *Météo à ${weather.name}* 🌍
> ───────────────────
> 🌤️ *Conditions* : ${weather.weather[0].description}
> 🌡️ *Température* : ${weather.main.temp}°C 🌞
> 🌡️ *Ressenti* : ${weather.main.feels_like}°C 🧥
> 💧 *Humidité* : ${weather.main.humidity}% 💦
> 🌬️ *Vent* : ${weather.wind.speed} m/s 🍃
> 📊 *Pression* : ${weather.main.pressure} hPa 📉
> ───────────────────
> ⏰ Dernière mise à jour : ${new Date(weather.dt * 1000).toLocaleTimeString("fr-FR")}
> ╚─────────────────╝`;

    await sock.sendMessage(from, { text: weatherText }, { quoted: msg });

  } catch (error) {
    console.error("❌ Erreur météo :", error);
    await sock.sendMessage(msg.key.remoteJid, { text: "> Knut XMD:⚠️ Désolé, je n’ai pas pu récupérer la météo pour cette ville." }, { quoted: msg });
  }
}