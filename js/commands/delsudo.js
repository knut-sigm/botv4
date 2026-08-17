import fs from "fs";

const SUDO_FILE = "./json/sudo.json";

function loadSudo() {

  if (!fs.existsSync(SUDO_FILE)) return [];

  try {

    return JSON.parse(fs.readFileSync(SUDO_FILE, "utf-8"));

  } catch {

    return [];

  }

}

function saveSudo(list) {

  fs.writeFileSync(SUDO_FILE, JSON.stringify(list, null, 2));

}

function normalizeNumber(input) {

  if (!input) return null;

  return input.replace(/[^0-9]/g, ""); // Garde uniquement les chiffres

}

function removeSudo(number) {

  const sudo = loadSudo();

  const filtered = sudo.filter(n => n !== number);

  saveSudo(filtered);

  return sudo.length !== filtered.length; // true si suppression effectuée

}

export const name = "delsudo";

export async function execute(sock, msg, args) {

  const from = msg.key.remoteJid;

  let target;

  // Cas 1 : réponse à un message

  if (msg.message?.extendedTextMessage?.contextInfo?.participant) {

    target = msg.message.extendedTextMessage.contextInfo.participant;

  }

  // Cas 2 : numéro passé en argument

  if (!target && args.length > 0) {

    target = args[0];

  }

  const bare = normalizeNumber(target);

  if (!bare) {

    return await sock.sendMessage(from, {

      text: `> Knut XMD: ❌ Réponds à un message ou tape :\n*.delsudo 237xxxxxxxx*`

    }, { quoted: msg });

  }

  const removed = removeSudo(bare);

  if (removed) {

    await sock.sendMessage(from, {

      text: `> Knut XMD: 🗑️ Le numéro *${bare}* a bien été retiré des sudo.`

    }, { quoted: msg });

  } else {

    await sock.sendMessage(from, {

      text: `> Knut XMD: ⚠️ Le numéro *${bare}* n'était pas dans la liste sudo.`

    }, { quoted: msg });

  }

}