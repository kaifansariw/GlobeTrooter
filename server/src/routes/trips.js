const express = require('express');
const pool = require('../db/pool');
const { auth } = require('../middleware/auth');

const router = express.Router();

// GET /api/trips  – get all trips for current user
router.get('/', auth, async (req, res, next) => {
  try {
    const trips = await pool.query(
      `SELECT t.*,
         COALESCE(
           json_agg(DISTINCT d.name) FILTER (WHERE d.name IS NOT NULL), '[]'
         ) AS destinations
       FROM trips t
       LEFT JOIN trip_destinations td ON t.id = td.trip_id
       LEFT JOIN destinations d       ON td.destination_id = d.id
       WHERE t.user_id = $1
       GROUP BY t.id
       ORDER BY t.created_at DESC`,
      [req.user.id]
    );
    res.json(trips.rows);
  } catch (err) { next(err); }
});

// POST /api/trips  – create new trip
router.post('/', auth, async (req, res, next) => {
  try {
    const { name, description, start_date, end_date, status, emoji, gradient, budget, image_url } = req.body;
    if (!name) return res.status(400).json({ error: 'Trip name is required.' });

    const result = await pool.query(
      `INSERT INTO trips (user_id, name, description, start_date, end_date, status, emoji, gradient, budget, image_url)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
      [req.user.id, name, description, start_date, end_date,
       status || 'upcoming', emoji || '✈️',
       gradient || 'linear-gradient(135deg, #714B67, #875A7B)', budget || 0,
       image_url || '/images/default_trip.jpg']
    );
    res.status(201).json(result.rows[0]);
  } catch (err) { next(err); }
});

// GET /api/trips/:id  – single trip with stops and activities
router.get('/:id', auth, async (req, res, next) => {
  try {
    const tripResult = await pool.query(
      `SELECT t.*,
         COALESCE(json_agg(DISTINCT d.name) FILTER (WHERE d.name IS NOT NULL),'[]') AS destinations
       FROM trips t
       LEFT JOIN trip_destinations td ON t.id = td.trip_id
       LEFT JOIN destinations d       ON td.destination_id = d.id
       WHERE t.id = $1 AND t.user_id = $2
       GROUP BY t.id`,
      [req.params.id, req.user.id]
    );

    if (tripResult.rows.length === 0) {
      return res.status(404).json({ error: 'Trip not found.' });
    }

    const trip = tripResult.rows[0];

    // Get stops with activities
    const stopsResult = await pool.query(
      `SELECT s.*,
         COALESCE(
           json_agg(
             json_build_object(
               'id',             sa.id,
               'activity_id',    sa.activity_id,
               'custom_name',    sa.custom_name,
               'scheduled_time', sa.scheduled_time,
               'day_number',     sa.day_number,
               'cost_override',  sa.cost_override,
               'notes',          sa.notes,
               'name',           COALESCE(a.name, sa.custom_name),
               'emoji',          a.emoji,
               'category',       a.category,
               'duration',       a.duration,
               'cost',           COALESCE(sa.cost_override, a.cost, 0)
             )
           ) FILTER (WHERE sa.id IS NOT NULL), '[]'
         ) AS activities
       FROM stops s
       LEFT JOIN stop_activities sa ON s.id = sa.stop_id
       LEFT JOIN activities a       ON sa.activity_id = a.id
       WHERE s.trip_id = $1
       GROUP BY s.id
       ORDER BY s.order_index`,
      [req.params.id]
    );

    trip.stops = stopsResult.rows;
    res.json(trip);
  } catch (err) { next(err); }
});

// PUT /api/trips/:id  – update trip
router.put('/:id', auth, async (req, res, next) => {
  try {
    const { name, description, start_date, end_date, status, emoji, gradient, budget, spent, is_public } = req.body;
    const result = await pool.query(
      `UPDATE trips SET
         name=$1, description=$2, start_date=$3, end_date=$4,
         status=$5, emoji=$6, gradient=$7, budget=$8, spent=$9, is_public=$10
       WHERE id=$11 AND user_id=$12 RETURNING *`,
      [name, description, start_date, end_date, status, emoji, gradient,
       budget, spent, is_public, req.params.id, req.user.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Trip not found.' });
    res.json(result.rows[0]);
  } catch (err) { next(err); }
});

// DELETE /api/trips/:id
router.delete('/:id', auth, async (req, res, next) => {
  try {
    const result = await pool.query(
      'DELETE FROM trips WHERE id=$1 AND user_id=$2 RETURNING id',
      [req.params.id, req.user.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Trip not found.' });
    res.json({ message: 'Trip deleted successfully.' });
  } catch (err) { next(err); }
});

// ── STOPS ──────────────────────────────────────────────────

// GET /api/trips/:id/stops
router.get('/:id/stops', auth, async (req, res, next) => {
  try {
    const stops = await pool.query(
      `SELECT s.*,
         COALESCE(
           json_agg(
             json_build_object(
               'id',sa.id,'activity_id',sa.activity_id,'custom_name',sa.custom_name,
               'scheduled_time',sa.scheduled_time,'day_number',sa.day_number,
               'name',COALESCE(a.name,sa.custom_name),'emoji',a.emoji,
               'cost',COALESCE(sa.cost_override,a.cost,0),'category',a.category
             )
           ) FILTER (WHERE sa.id IS NOT NULL),'[]'
         ) AS activities
       FROM stops s
       LEFT JOIN stop_activities sa ON s.id = sa.stop_id
       LEFT JOIN activities a       ON sa.activity_id = a.id
       WHERE s.trip_id = $1
       GROUP BY s.id ORDER BY s.order_index`,
      [req.params.id]
    );
    res.json(stops.rows);
  } catch (err) { next(err); }
});

// POST /api/trips/:id/stops
router.post('/:id/stops', auth, async (req, res, next) => {
  try {
    const { city, description, start_date, end_date, budget } = req.body;
    if (!city) return res.status(400).json({ error: 'City is required.' });

    const countResult = await pool.query('SELECT COUNT(*) FROM stops WHERE trip_id=$1', [req.params.id]);
    const orderIndex = parseInt(countResult.rows[0].count) + 1;

    const result = await pool.query(
      `INSERT INTO stops (trip_id, city, description, start_date, end_date, budget, order_index)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [req.params.id, city, description, start_date, end_date, budget || 0, orderIndex]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) { next(err); }
});

// PUT /api/stops/:stopId
router.put('/stops/:stopId', auth, async (req, res, next) => {
  try {
    const { city, description, start_date, end_date, budget } = req.body;
    const result = await pool.query(
      `UPDATE stops SET city=$1,description=$2,start_date=$3,end_date=$4,budget=$5
       WHERE id=$6 RETURNING *`,
      [city, description, start_date, end_date, budget, req.params.stopId]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Stop not found.' });
    res.json(result.rows[0]);
  } catch (err) { next(err); }
});

// DELETE /api/stops/:stopId
router.delete('/stops/:stopId', auth, async (req, res, next) => {
  try {
    await pool.query('DELETE FROM stops WHERE id=$1', [req.params.stopId]);
    res.json({ message: 'Stop deleted.' });
  } catch (err) { next(err); }
});

// POST /api/stops/:stopId/activities
router.post('/stops/:stopId/activities', auth, async (req, res, next) => {
  try {
    const { activity_id, custom_name, scheduled_time, day_number, cost_override, notes } = req.body;
    const result = await pool.query(
      `INSERT INTO stop_activities (stop_id,activity_id,custom_name,scheduled_time,day_number,cost_override,notes)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [req.params.stopId, activity_id, custom_name, scheduled_time, day_number || 1, cost_override, notes]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) { next(err); }
});

// DELETE /api/stop-activities/:id
router.delete('/stop-activities/:id', auth, async (req, res, next) => {
  try {
    await pool.query('DELETE FROM stop_activities WHERE id=$1', [req.params.id]);
    res.json({ message: 'Activity removed.' });
  } catch (err) { next(err); }
});

module.exports = router;
