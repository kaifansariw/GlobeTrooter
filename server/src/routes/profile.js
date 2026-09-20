const express = require('express');
const bcrypt = require('bcryptjs');
const pool = require('../db/pool');
const { auth } = require('../middleware/auth');
const router = express.Router();

// GET /api/profile  – get current user's profile
router.get('/', auth, async (req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT id, first_name, last_name, email, phone, city, country, bio, avatar_url, is_admin, created_at,
         (SELECT COUNT(*) FROM trips WHERE user_id = u.id) AS trips_count
       FROM users u WHERE id = $1`,
      [req.user.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'User not found.' });
    res.json(result.rows[0]);
  } catch (err) { next(err); }
});

// PUT /api/profile  – update profile
router.put('/', auth, async (req, res, next) => {
  try {
    const { first_name, last_name, phone, city, country, bio } = req.body;
    const result = await pool.query(
      `UPDATE users SET first_name=$1, last_name=$2, phone=$3, city=$4, country=$5, bio=$6
       WHERE id=$7
       RETURNING id, first_name, last_name, email, phone, city, country, bio, avatar_url`,
      [first_name, last_name, phone, city, country, bio, req.user.id]
    );
    res.json(result.rows[0]);
  } catch (err) { next(err); }
});

// PUT /api/profile/password  – change password
router.put('/password', auth, async (req, res, next) => {
  try {
    const { current_password, new_password } = req.body;
    if (!current_password || !new_password) {
      return res.status(400).json({ error: 'Both current and new password are required.' });
    }
    const user = await pool.query('SELECT password_hash FROM users WHERE id=$1', [req.user.id]);
    const valid = await bcrypt.compare(current_password, user.rows[0].password_hash);
    if (!valid) return res.status(401).json({ error: 'Current password is incorrect.' });

    const hash = await bcrypt.hash(new_password, 12);
    await pool.query('UPDATE users SET password_hash=$1 WHERE id=$2', [hash, req.user.id]);
    res.json({ message: 'Password updated successfully.' });
  } catch (err) { next(err); }
});

// DELETE /api/profile  – delete account
router.delete('/', auth, async (req, res, next) => {
  try {
    await pool.query('DELETE FROM users WHERE id=$1', [req.user.id]);
    res.json({ message: 'Account deleted.' });
  } catch (err) { next(err); }
});

module.exports = router;
