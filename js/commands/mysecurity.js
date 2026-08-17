import { loadSudo } from "../knut-bridge.js";

export const name = "mysecurity";

export async function execute(sock, msg, args, from) {
  try {
    const sender = msg.key.participant || from;
    const senderNum = sender.split("@")[0].replace(/[^0-9]/g, "");
    const owners = (global.owners || []).map(n => n.replace(/[^0-9]/g, ""));
    const sudoList = loadSudo().map(n => n.replace(/[^0-9]/g, ""));

    if (!owners.includes(senderNum) && !sudoList.includes(senderNum)) {
      await sock.sendMessage(from, { text: "⛔ Accès refusé." }, { quoted: msg });
      return;
    }

    if (!global.antiCall) global.antiCall = { enabled: false };
    if (!global.antiUnknown) global.antiUnknown = { enabled: false };

    const arg = args[0]?.toLowerCase();

    if (arg === "state") {
      await sock.sendMessage(from, { 
        text: `📞 Call: ${global.antiCall.enabled ? '✅' : '❌'}\n👤 Unknown: ${global.antiUnknown.enabled ? '✅' : '❌'}`
      }, { quoted: msg });
      return;
    }

    if (arg === "on") {
      global.antiCall.enabled = true;
      global.antiUnknown.enabled = true;
      await sock.sendMessage(from, { text: "✅ Anti‑Call & Anti‑Unknown ON" }, { quoted: msg });
      return;
    }

    if (arg === "off") {
      global.antiCall.enabled = false;
      global.antiUnknown.enabled = false;
      await sock.sendMessage(from, { text: "❌ Anti‑Call & Anti‑Unknown OFF" }, { quoted: msg });
      return;
    }

    // Aide minimaliste
    await sock.sendMessage(from, {
      text: `📌 *MySecurity*\non | off | state`
    }, { quoted: msg });

  } catch (err) {
    console.error("mysecurity error:", err);
    await sock.sendMessage(msg.key.remoteJid, { text: "❌ Erreur." }, { quoted: msg });
  }
}