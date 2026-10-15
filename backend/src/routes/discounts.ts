import express from 'express';
import { query } from '../config/database';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';

const router = express.Router();

// Get all discount rules
router.get('/', async (req, res) => {
  try {
    const result = await query(`
      SELECT * FROM discount_rules
      ORDER BY created_at DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Get discount rules error:', error);
    res.status(500).json({ error: 'Failed to fetch discount rules' });
  }
});

// Get active discount rules
router.get('/active', async (req, res) => {
  try {
    const result = await query(`
      SELECT * FROM discount_rules
      WHERE is_active = TRUE
      ORDER BY discount_percentage DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Get active discount rules error:', error);
    res.status(500).json({ error: 'Failed to fetch active discount rules' });
  }
});

// Create discount rule
router.post('/', authenticate, authorize('manager'), async (req: AuthRequest, res) => {
  try {
    const { name, description, discount_percentage, valid_days, start_time, end_time, is_active = true } = req.body;

    // Validate input
    if (!name || !discount_percentage || !valid_days || !start_time || !end_time) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const result = await query(`
      INSERT INTO discount_rules (name, description, discount_percentage, valid_days, start_time, end_time, is_active)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `, [name, description, discount_percentage, valid_days, start_time, end_time, is_active]);

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Create discount rule error:', error);
    res.status(500).json({ error: 'Failed to create discount rule' });
  }
});

// Update discount rule
router.put('/:id', authenticate, authorize('manager'), async (req: AuthRequest, res) => {
  try {
    const { name, description, discount_percentage, valid_days, start_time, end_time, is_active } = req.body;

    const result = await query(`
      UPDATE discount_rules
      SET name = COALESCE($1, name),
          description = COALESCE($2, description),
          discount_percentage = COALESCE($3, discount_percentage),
          valid_days = COALESCE($4, valid_days),
          start_time = COALESCE($5, start_time),
          end_time = COALESCE($6, end_time),
          is_active = COALESCE($7, is_active)
      WHERE id = $8
      RETURNING *
    `, [name, description, discount_percentage, valid_days, start_time, end_time, is_active, req.params.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Discount rule not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update discount rule error:', error);
    res.status(500).json({ error: 'Failed to update discount rule' });
  }
});

// Toggle discount rule active status
router.patch('/:id/toggle', authenticate, authorize('manager'), async (req: AuthRequest, res) => {
  try {
    const result = await query(`
      UPDATE discount_rules
      SET is_active = NOT is_active
      WHERE id = $1
      RETURNING *
    `, [req.params.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Discount rule not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Toggle discount rule error:', error);
    res.status(500).json({ error: 'Failed to toggle discount rule' });
  }
});

// Delete discount rule
router.delete('/:id', authenticate, authorize('manager'), async (req: AuthRequest, res) => {
  try {
    const result = await query(`
      DELETE FROM discount_rules
      WHERE id = $1
      RETURNING *
    `, [req.params.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Discount rule not found' });
    }

    res.json({ message: 'Discount rule deleted successfully' });
  } catch (error) {
    console.error('Delete discount rule error:', error);
    res.status(500).json({ error: 'Failed to delete discount rule' });
  }
});

export default router;
