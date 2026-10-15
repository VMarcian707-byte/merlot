import express from 'express';
import { query } from '../config/database';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// Get all cards (manager only)
router.get('/', authenticate, authorize('manager'), async (req: AuthRequest, res) => {
  try {
    const result = await query(`
      SELECT c.*, u.name as client_name, u.email as client_email, u.avatar as client_avatar
      FROM nfc_cards c
      LEFT JOIN users u ON c.assigned_user_id = u.id
      ORDER BY c.issued_at DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Get cards error:', error);
    res.status(500).json({ error: 'Failed to fetch cards' });
  }
});

// Get card by UUID
router.get('/uuid/:uuid', async (req, res) => {
  try {
    const result = await query(`
      SELECT c.*, u.name as client_name, u.email as client_email, u.phone as client_phone, u.avatar as client_avatar
      FROM nfc_cards c
      LEFT JOIN users u ON c.assigned_user_id = u.id
      WHERE c.card_uuid = $1
    `, [req.params.uuid]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Card not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get card error:', error);
    res.status(500).json({ error: 'Failed to fetch card' });
  }
});

// Create new card
router.post('/', authenticate, authorize('manager'), async (req: AuthRequest, res) => {
  try {
    const card_uuid = uuidv4().toUpperCase();

    const result = await query(
      'INSERT INTO nfc_cards (card_uuid) VALUES ($1) RETURNING *',
      [card_uuid]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Create card error:', error);
    res.status(500).json({ error: 'Failed to create card' });
  }
});

// Assign card to user
router.post('/:id/assign', authenticate, authorize('manager'), async (req: AuthRequest, res) => {
  try {
    const { user_id } = req.body;

    const result = await query(`
      UPDATE nfc_cards 
      SET assigned_user_id = $1, status = 'active'
      WHERE id = $2
      RETURNING *
    `, [user_id, req.params.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Card not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Assign card error:', error);
    res.status(500).json({ error: 'Failed to assign card' });
  }
});

// Block card
router.post('/:id/block', authenticate, authorize('manager'), async (req: AuthRequest, res) => {
  try {
    const result = await query(`
      UPDATE nfc_cards 
      SET status = 'blocked'
      WHERE id = $1
      RETURNING *
    `, [req.params.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Card not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Block card error:', error);
    res.status(500).json({ error: 'Failed to block card' });
  }
});

// Scan card (barman/manager)
router.post('/scan', authenticate, authorize('barman', 'manager'), async (req: AuthRequest, res) => {
  try {
    const { card_uuid } = req.body;
    const barman_id = req.user!.userId;

    // Use PostgreSQL function
    const result = await query(
      'SELECT scan_nfc_card($1, $2) as result',
      [card_uuid, barman_id]
    );

    res.json(result.rows[0].result);
  } catch (error) {
    console.error('Scan card error:', error);
    res.status(500).json({ error: 'Scan failed' });
  }
});

export default router;
