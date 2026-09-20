const express = require('express');
const pool = require('../db/pool');
const { auth } = require('../middleware/auth');
const router = express.Router();

// GET /api/activities?q=&city=&category=&limit=
router.get('/', async (req, res, next) => {
  try {
    const { q = '', city = '', category = '', limit = 30 } = req.query;
    const result = await pool.query(
      `SELECT * FROM activities
       WHERE ($1 = '' OR LOWER(name) LIKE '%' || LOWER($1) || '%')
         AND ($2 = '' OR LOWER(city) = LOWER($2))
         AND ($3 = '' OR LOWER(category) = LOWER($3))
       ORDER BY rating DESC, name
       LIMIT $4`,
      [q, city, category, parseInt(limit)]
    );
    res.json(result.rows);
  } catch (err) { next(err); }
});

// GET /api/activities/:id
router.get('/:id', async (req, res, next) => {
  try {
    const result = await pool.query('SELECT * FROM activities WHERE id=$1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Activity not found.' });
    res.json(result.rows[0]);
  } catch (err) { next(err); }
});

module.exports = router;
