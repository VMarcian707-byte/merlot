import express from 'express';
import { query } from '../config/database';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';

const router = express.Router();

// Get all announcements
router.get('/', async (req, res) => {
  try {
    const result = await query(`
      SELECT a.*, u.name as manager_name
      FROM announcements a
      LEFT JOIN users u ON a.created_by_manager_id = u.id
      ORDER BY a.created_at DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Get announcements error:', error);
    res.status(500).json({ error: 'Failed to fetch announcements' });
  }
});

// Get announcements for user (filtered by target)
router.get('/for-user', authenticate, async (req: AuthRequest, res) => {
  try {
    const userRole = req.user!.role;
    const target = userRole === 'client' ? 'vip' : 'all';

    const result = await query(`
      SELECT a.*, u.name as manager_name
      FROM announcements a
      LEFT JOIN users u ON a.created_by_manager_id = u.id
      WHERE a.target = 'all' OR a.target = $1
      ORDER BY a.created_at DESC
    `, [target]);
    
    res.json(result.rows);
  } catch (error) {
    console.error('Get user announcements error:', error);
    res.status(500).json({ error: 'Failed to fetch announcements' });
  }
});

// Create announcement
router.post('/', authenticate, authorize('manager'), async (req: AuthRequest, res) => {
  try {
    const { title, message, event_date, target = 'all' } = req.body;
    const manager_id = req.user!.userId;

    // Validate input
    if (!title || !message) {
      return res.status(400).json({ error: 'Title and message are required' });
    }

    const result = await query(`
      INSERT INTO announcements (title, message, event_date, target, created_by_manager_id)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `, [title, message, event_date, target, manager_id]);

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Create announcement error:', error);
    res.status(500).json({ error: 'Failed to create announcement' });
  }
});

// Update announcement
router.put('/:id', authenticate, authorize('manager'), async (req: AuthRequest, res) => {
  try {
    const { title, message, event_date, target } = req.body;

    const result = await query(`
      UPDATE announcements
      SET title = COALESCE($1, title),
          message = COALESCE($2, message),
          event_date = COALESCE($3, event_date),
          target = COALESCE($4, target)
      WHERE id = $5
      RETURNING *
    `, [title, message, event_date, target, req.params.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Announcement not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update announcement error:', error);
    res.status(500).json({ error: 'Failed to update announcement' });
  }
});

// Delete announcement
router.delete('/:id', authenticate, authorize('manager'), async (req: AuthRequest, res) => {
  try {
    const result = await query(`
      DELETE FROM announcements
      WHERE id = $1
      RETURNING *
    `, [req.params.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Announcement not found' });
    }

    res.json({ message: 'Announcement deleted successfully' });
  } catch (error) {
    console.error('Delete announcement error:', error);
    res.status(500).json({ error: 'Failed to delete announcement' });
  }
});

export default router;
