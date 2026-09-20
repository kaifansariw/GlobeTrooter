const express = require('express');
const pool = require('../db/pool');
const { auth, adminOnly } = require('../middleware/auth');
const router = express.Router();

// GET /api/admin/stats
router.get('/stats', auth, adminOnly, async (req, res, next) => {
  try {
    const [usersR, tripsR, activeTodayR, citiesR, activitiesR] = await Promise.all([
      pool.query('SELECT COUNT(*) FROM users'),
      pool.query('SELECT COUNT(*) FROM trips'),
      pool.query(`SELECT COUNT(*) FROM users WHERE created_at > NOW() - INTERVAL '1 day'`),
      pool.query(
        `SELECT d.name, d.emoji, COUNT(td.trip_id) AS trips,
           ROUND((COUNT(td.trip_id) - LAG(COUNT(td.trip_id)) OVER (ORDER BY COUNT(td.trip_id))) * 100.0
             / NULLIF(LAG(COUNT(td.trip_id)) OVER (ORDER BY COUNT(td.trip_id)), 0), 0) || '%' AS growth
         FROM destinations d
         LEFT JOIN trip_destinations td ON d.id = td.destination_id
         GROUP BY d.id ORDER BY trips DESC LIMIT 6`
      ),
      pool.query(
        `SELECT a.name, a.category, a.rating, a.emoji, COUNT(sa.id) AS bookings
         FROM activities a LEFT JOIN stop_activities sa ON a.id = sa.activity_id
         GROUP BY a.id ORDER BY bookings DESC LIMIT 5`
      ),
    ]);

    res.json({
      total_users: parseInt(usersR.rows[0].count),
      total_trips: parseInt(tripsR.rows[0].count),
      active_today: parseInt(activeTodayR.rows[0].count),
      popular_cities: citiesR.rows,
      popular_activities: activitiesR.rows,
    });
  } catch (err) { next(err); }
});

// GET /api/admin/users
router.get('/users', auth, adminOnly, async (req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT u.id, u.first_name, u.last_name, u.email, u.city, u.country, u.is_admin, u.created_at,
         COUNT(t.id) AS trips_count
       FROM users u LEFT JOIN trips t ON u.id = t.user_id
       GROUP BY u.id ORDER BY u.created_at DESC`
    );
    res.json(result.rows);
  } catch (err) { next(err); }
});

// GET /api/admin/analytics – monthly trip creation data
router.get('/analytics', auth, adminOnly, async (req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT TO_CHAR(created_at, 'Mon') AS month, COUNT(*) AS trips
       FROM trips
       WHERE created_at > NOW() - INTERVAL '6 months'
       GROUP BY DATE_TRUNC('month', created_at), TO_CHAR(created_at, 'Mon')
       ORDER BY DATE_TRUNC('month', created_at)`
    );
    res.json(result.rows);
  } catch (err) { next(err); }
});

module.exports = router;
