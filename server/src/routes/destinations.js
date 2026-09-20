const express = require('express');
const pool = require('../db/pool');
const { auth } = require('../middleware/auth');
const router = express.Router();

// GET /api/destinations?q=&category=&limit=
router.get('/', async (req, res, next) => {
  try {
    const { q = '', category = '', limit = 20 } = req.query;
    const result = await pool.query(
      `SELECT * FROM destinations
       WHERE ($1 = '' OR LOWER(name) LIKE '%' || LOWER($1) || '%' OR LOWER(country) LIKE '%' || LOWER($1) || '%')
         AND ($2 = '' OR LOWER(category) = LOWER($2))
       ORDER BY popularity DESC
       LIMIT $3`,
      [q, category, parseInt(limit)]
    );
    res.json(result.rows);
  } catch (err) { next(err); }
});

// GET /api/destinations/:id
router.get('/:id', async (req, res, next) => {
  try {
    const result = await pool.query('SELECT * FROM destinations WHERE id=$1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Destination not found.' });
    res.json(result.rows[0]);
  } catch (err) { next(err); }
});

module.exports = router;
