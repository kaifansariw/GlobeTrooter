const express = require('express');
const pool = require('../db/pool');
const { auth } = require('../middleware/auth');
const router = express.Router();

// GET /api/community  – public feed
router.get('/', async (req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT cp.*,
         u.first_name, u.last_name, u.avatar_url,
         COALESCE(json_agg(pt.tag) FILTER (WHERE pt.tag IS NOT NULL), '[]') AS tags
       FROM community_posts cp
       JOIN users u ON cp.user_id = u.id
       LEFT JOIN post_tags pt ON cp.id = pt.post_id
       WHERE cp.is_public = TRUE
       GROUP BY cp.id, u.first_name, u.last_name, u.avatar_url
       ORDER BY cp.created_at DESC
       LIMIT 50`
    );
    res.json(result.rows);
  } catch (err) { next(err); }
});

// POST /api/community  – create a post
router.post('/', auth, async (req, res, next) => {
  try {
    const { trip_id, trip_name, content, tags = [], is_public = true } = req.body;
    if (!content) return res.status(400).json({ error: 'Content is required.' });

    const postResult = await pool.query(
      `INSERT INTO community_posts (user_id, trip_id, trip_name, content, is_public)
       VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [req.user.id, trip_id || null, trip_name, content, is_public]
    );
    const post = postResult.rows[0];

    // Insert tags
    for (const tag of tags) {
      await pool.query('INSERT INTO post_tags (post_id, tag) VALUES ($1,$2) ON CONFLICT DO NOTHING', [post.id, tag]);
    }

    res.status(201).json({ ...post, tags });
  } catch (err) { next(err); }
});

// POST /api/community/:id/like
router.post('/:id/like', auth, async (req, res, next) => {
  try {
    const result = await pool.query(
      'UPDATE community_posts SET likes = likes + 1 WHERE id=$1 RETURNING likes',
      [req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) { next(err); }
});

module.exports = router;
