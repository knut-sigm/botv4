import fs from "fs";

const SUDO_FILE = "./json/sudo.json";

function loadSudo() {

  if (!fs.existsSync(SUDO_FILE)) return [];

  return JSON.parse(fs.readFileSync(SUDO_FILE, "utf-8"));

}

function saveSudo(list) {

  fs.writeFileSync(SUDO_FILE, JSON.stringify(list, null, 2));

}

function addSudo(number) {

  const sudo = loadSudo();

  if (!sudo.includes(number)) sudo.push(number);

  saveSudo(sudo);

  return sudo;

}

export const name = "setsudo";

export async function execute(sock, msg, args) {

  const from = msg.key.remoteJid;

  let target;

  // Cas 1 : réponse à un message

  if (msg.message?.extendedTextMessage?.contextInfo?.participant) {

    target = msg.message.extendedTextMessage.contextInfo.participant;

  }

  // Cas 2 : numéro en argument

  if (!target && args.length > 0) {

    target = args[0].replace(/[^0-9]/g, "");

  } else {

    target = target ? target.replace(/[^0-9]/g, "") : null;

  }

  if (!target) {

    return await sock.sendMessage(from, {

      text: `> Knut XMD: ❌ Réponds à un message ou tape :\n*.setsudo 237xxxxxxxx*`

    }, { quoted: msg });

  }

  const updated = addSudo(target);

  await sock.sendMessage(from, {

    text: `> Knut XMD: ✅ Le numéro *${target}* a été ajouté en sudo.`

  }, { quoted: msg });

}