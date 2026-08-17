import fs from "fs";

const SUDO_FILE = "./json/sudo.json";

function loadSudo() {

  if (!fs.existsSync(SUDO_FILE)) return [];

  return JSON.parse(fs.readFileSync(SUDO_FILE, "utf-8"));

}

export const name = "listsudo";

export async function execute(sock, msg) {

  const from = msg.key.remoteJid;

  const sudo = loadSudo();

  const list = sudo.length > 0

    ? sudo.map((n, i) => `${i + 1}. ${n}`).join("\n")

    : "⚠️ Aucun sudo défini.";

  await sock.sendMessage(from, {

    text: `
> ╔──── LISTSUDO ───╗
> Knut XMD: 👑 *Liste des sudo users* :\n\n${list}
> ╚───────────────╝`

  }, { quoted: msg });

}