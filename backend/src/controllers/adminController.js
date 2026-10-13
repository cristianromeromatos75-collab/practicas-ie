const pool = require('../config/db');

// Listar ofertas pendientes de revisión
async function listPendingJobs(req, res) {
  try {
    const result = await pool.query(`
      SELECT 
        j.*,
        u.full_name AS publisher_name,
        u.email AS publisher_email,
        u.role AS publisher_role,
        cp.company_name,
        cp.ruc,
        cp.verification_status
      FROM jobs j
      JOIN users u ON j.publisher_id = u.id
      LEFT JOIN company_profiles cp ON cp.user_id = u.id
      WHERE j.status = 'pending'
      ORDER BY j.created_at DESC
    `);

    res.json({ total: result.rows.length, ofertas: result.rows });
  } catch (error) {
    console.error('Error al listar pendientes:', error.message);
    res.status(500).json({ error: 'Error al listar ofertas pendientes' });
  }
}

// Aprobar una oferta
async function approveJob(req, res) {
  const { id } = req.params;
  try {
    const result = await pool.query(
      `UPDATE jobs SET status = 'active' WHERE id = $1 RETURNING *`,
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Oferta no encontrada' });
    }
    res.json({ mensaje: 'Oferta aprobada', job: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: 'Error al aprobar la oferta' });
  }
}

// Rechazar una oferta
async function rejectJob(req, res) {
  const { id } = req.params;
  try {
    const result = await pool.query(
      `UPDATE jobs SET status = 'rejected' WHERE id = $1 RETURNING *`,
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Oferta no encontrada' });
    }
    res.json({ mensaje: 'Oferta rechazada', job: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: 'Error al rechazar la oferta' });
  }
}

module.exports = { listPendingJobs, approveJob, rejectJob };
