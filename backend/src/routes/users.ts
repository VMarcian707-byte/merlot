import express from 'express';
import { query } from '../config/database';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';

const router = express.Router();

// Get all users (manager only)
router.get('/', authenticate, authorize('manager'), async (req: AuthRequest, res) => {
  try {
    const result = await query(`
      SELECT id, name, email, phone, role, avatar, created_at
      FROM users
      ORDER BY created_at DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Get clients only
router.get('/clients', authenticate, authorize('manager', 'barman'), async (req: AuthRequest, res) => {
  try {
    const result = await query(`
      SELECT id, name, email, phone, avatar, created_at
      FROM users
      WHERE role = 'client'
      ORDER BY name ASC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Get clients error:', error);
    res.status(500).json({ error: 'Failed to fetch clients' });
  }
});

// Get user by ID
router.get('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    
    // Check if user is requesting their own data or is a manager
    if (req.user!.userId !== id && req.user!.role !== 'manager') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const result = await query(`
      SELECT id, name, email, phone, role, avatar, created_at
      FROM users
      WHERE id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// Update user
router.put('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { name, phone, avatar } = req.body;
    
    // Check if user is updating their own data or is a manager
    if (req.user!.userId !== id && req.user!.role !== 'manager') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const result = await query(`
      UPDATE users
      SET name = COALESCE($1, name),
          phone = COALESCE($2, phone),
          avatar = COALESCE($3, avatar),
          updated_at = NOW()
      WHERE id = $4
      RETURNING id, name, email, phone, role, avatar, created_at
    `, [name, phone, avatar, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// Delete user (manager only)
router.delete('/:id', authenticate, authorize('manager'), async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    const result = await query(`
      DELETE FROM users
      WHERE id = $1
      RETURNING id
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

export default router;
