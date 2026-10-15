import express from 'express';
import { query } from '../config/database';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';

const router = express.Router();

// Get all visits (manager)
router.get('/', authenticate, authorize('manager'), async (req: AuthRequest, res) => {
  try {
    const result = await query(`
      SELECT v.*, 
             c.card_uuid,
             u_client.name as client_name, 
             u_client.email as client_email,
             u_client.avatar as client_avatar,
             u_barman.name as barman_name
      FROM visits_log v
      JOIN nfc_cards c ON v.card_id = c.id
      JOIN users u_client ON v.client_id = u_client.id
      LEFT JOIN users u_barman ON v.barman_id = u_barman.id
      ORDER BY v.scanned_at DESC
      LIMIT 100
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Get visits error:', error);
    res.status(500).json({ error: 'Failed to fetch visits' });
  }
});

// Get client visits
router.get('/client/:clientId', authenticate, async (req: AuthRequest, res) => {
  try {
    const { clientId } = req.params;
    
    // Check if user is requesting their own visits or is a manager
    if (req.user!.userId !== clientId && req.user!.role !== 'manager') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const result = await query(`
      SELECT v.*, 
             c.card_uuid,
             u_barman.name as barman_name
      FROM visits_log v
      JOIN nfc_cards c ON v.card_id = c.id
      LEFT JOIN users u_barman ON v.barman_id = u_barman.id
      WHERE v.client_id = $1
      ORDER BY v.scanned_at DESC
    `, [clientId]);
    
    res.json(result.rows);
  } catch (error) {
    console.error('Get client visits error:', error);
    res.status(500).json({ error: 'Failed to fetch client visits' });
  }
});

// Get today's visits
router.get('/today', authenticate, authorize('barman', 'manager'), async (req: AuthRequest, res) => {
  try {
    const result = await query(`
      SELECT v.*, 
             c.card_uuid,
             u_client.name as client_name, 
             u_client.avatar as client_avatar,
             u_barman.name as barman_name
      FROM visits_log v
      JOIN nfc_cards c ON v.card_id = c.id
      JOIN users u_client ON v.client_id = u_client.id
      LEFT JOIN users u_barman ON v.barman_id = u_barman.id
      WHERE DATE(v.scanned_at) = CURRENT_DATE
      ORDER BY v.scanned_at DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Get today visits error:', error);
    res.status(500).json({ error: 'Failed to fetch today visits' });
  }
});

// Get visit statistics
router.get('/stats', authenticate, authorize('manager'), async (req: AuthRequest, res) => {
  try {
    const result = await query(`
      SELECT 
        COUNT(*) as total_visits,
        COUNT(CASE WHEN DATE(scanned_at) = CURRENT_DATE THEN 1 END) as today_visits,
        COUNT(CASE WHEN discount_applied > 0 THEN 1 END) as visits_with_discount,
        AVG(discount_applied) as avg_discount,
        COUNT(DISTINCT client_id) as unique_clients
      FROM visits_log
    `);
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get visit stats error:', error);
    res.status(500).json({ error: 'Failed to fetch visit statistics' });
  }
});

export default router;
