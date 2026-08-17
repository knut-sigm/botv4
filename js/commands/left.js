export const name = "left";

export async function execute(sock, msg, args) {
  try {
    await sock.sendMessage(msg.key.remoteJid, { text: "> Knut XMD: Good bye" });
    await sock.groupLeave(msg.key.remoteJid);
  } catch (err) {
    console.error("❌ Erreur leave :", err);
  }
}