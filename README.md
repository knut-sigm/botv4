# Knut XMD v4 — serveur Node.js

Lancement sur VPS, serveur Linux, hébergement Node.js ou Pterodactyl : npm install puis npm start.

index.js est à la racine. Les autres modules JavaScript sont dans js/. Les commandes sont dans js/commands/. Les données sont dans json/, sauf config.json qui reste à la racine.

Le paquet est prévu pour une seule session WhatsApp. Conserve le dossier session sur un volume persistant et ne lance qu’un seul processus Node.