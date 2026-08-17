/**
 * ╔══════════════════════════════════════════════════════╗
 * ║         KNUT XMD V4 — Module Router (ESM)           ║
 * ║   Importé par le server.js principal de Khost      ║
 * ╚══════════════════════════════════════════════════════╝
 *
 *  Ce fichier exporte un router Express qui monte :
 *    /knutxmd/pair   → codes de pairing Baileys (KNUT1204)
 *    /knutxmd/status → statut bot
 */

import express    from 'express';
import pairRouter from './pair.js';

const router = express.Router();

/* ── Router de pairing KNUT ── */
router.use('/pair', pairRouter);

/* ── GET /knutxmd/status ── */
router.get('/status', (req, res) => {
  res.json({ ok: true, bot: 'KNUT XMD V4', message: 'Utilisez /api/bot/status depuis server.js' });
});

export default router;
