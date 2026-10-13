const pool = require('../config/db');

// Etiquetas válidas de Ingeniería Industrial
const VALID_TAGS = [
  'lean', 'mejora-continua', 'calidad', 'supply-chain',
  'produccion', 'ergonomia', 'factores-humanos', 'logistica',
  'seguridad-industrial', 'mantenimiento', 'automatizacion',
  'gestion-proyectos', 'data-analytics', 'sostenibilidad'
];

// Palabras sospechosas para marcar ofertas
const SUSPICIOUS_PATTERNS = [
  'pago adelantado', 'pagar para', 'inversión inicial', 'comprar materiales',
  'whatsapp personal', 'sin experiencia cobrar', 'tarjeta de crédito',
  'datos bancarios', 'transferencia previa'
];

function detectSuspicious(description) {
  const lower = description.toLowerCase();
  return SUSPICIOUS_PATTERNS.filter(p => lower.includes(p));
}

// ============================================
// CREAR OFERTA
// ============================================
async function createJob(req, res) {
  const {
    title, description, tags, job_type, location,
    duration_months, is_paid
  } = req.body;

  if (!title || !description || !job_type) {
    return res.status(400).json({ error: 'title, description y job_type son obligatorios' });
  }

  if (!['company_internship', 'research_project', 'alumni_opportunity'].includes(job_type)) {
    return res.status(400).json({ error: 'job_type inválido' });
  }

  // Validar etiquetas
  const jobTags = Array.isArray(tags) ? tags : [];
  const invalidTags = jobTags.filter(t => !VALID_TAGS.includes(t));
  if (invalidTags.length > 0) {
    return res.status(400).json({ 
      error: 'Etiquetas inválidas', 
      etiquetas_invalidas: invalidTags,
      etiquetas_validas: VALID_TAGS 
    });
  }

  // Si es empresa, verificar que esté verificada
  if (req.user.role === 'company') {
    const profile = await pool.query(
      'SELECT verification_status FROM company_profiles WHERE user_id = $1',
      [req.user.id]
    );
    if (profile.rows.length === 0) {
      return res.status(400).json({ error: 'La empresa no tiene perfil completo' });
    }
    // Opcional: dejar publicar pero con estado pending hasta verificación
  }

  // Detectar contenido sospechoso
  const suspicious = detectSuspicious(description);
  const initialStatus = suspicious.length > 0 ? 'pending' : 'active';

  try {
    const result = await pool.query(
      `INSERT INTO jobs (publisher_id, title, description, tags, job_type, location, duration_months, is_paid, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [
        req.user.id, title, description, jobTags, job_type,
        location || null, duration_months || null, is_paid || false, initialStatus
      ]
    );

    const job = result.rows[0];

    const response = {
      mensaje: suspicious.length > 0 
        ? 'Oferta creada pero marcada para revisión por contenido sospechoso' 
        : 'Oferta publicada exitosamente',
      job
    };

    if (suspicious.length > 0) {
      response.alertas = suspicious;
    }

    res.status(201).json(response);
  } catch (error) {
    console.error('Error al crear oferta:', error.message);
    res.status(500).json({ error: 'Error al crear la oferta' });
  }
}

// ============================================
// LISTAR OFERTAS (con filtros)
// ============================================
async function listJobs(req, res) {
  const { tag, job_type, location, paid, search } = req.query;

  const conditions = ["j.status = 'active'"];
  const params = [];

  if (tag) {
    params.push(tag);
    conditions.push(`$${params.length} = ANY(j.tags)`);
  }

  if (job_type) {
    params.push(job_type);
    conditions.push(`j.job_type = $${params.length}`);
  }

  if (location) {
    params.push(`%${location}%`);
    conditions.push(`j.location ILIKE $${params.length}`);
  }

  if (paid === 'true' || paid === 'false') {
    params.push(paid === 'true');
    conditions.push(`j.is_paid = $${params.length}`);
  }

  if (search) {
    params.push(`%${search}%`);
    conditions.push(`(j.title ILIKE $${params.length} OR j.description ILIKE $${params.length})`);
  }

  const query = `
    SELECT 
      j.id, j.title, j.description, j.tags, j.job_type,
      j.location, j.duration_months, j.is_paid, j.created_at,
      u.id AS publisher_id, u.full_name AS publisher_name, u.role AS publisher_role,
      cp.company_name, cp.verification_status
    FROM jobs j
    JOIN users u ON j.publisher_id = u.id
    LEFT JOIN company_profiles cp ON cp.user_id = u.id
    WHERE ${conditions.join(' AND ')}
    ORDER BY j.created_at DESC
    LIMIT 100
  `;

  try {
    const result = await pool.query(query, params);
    res.json({ 
      total: result.rows.length,
      ofertas: result.rows 
    });
  } catch (error) {
    console.error('Error al listar ofertas:', error.message);
    res.status(500).json({ error: 'Error al listar las ofertas' });
  }
}

// ============================================
// VER DETALLE DE UNA OFERTA
// ============================================
async function getJob(req, res) {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `SELECT 
        j.*,
        u.full_name AS publisher_name, u.role AS publisher_role, u.email AS publisher_email,
        cp.company_name, cp.verification_status, cp.ruc
      FROM jobs j
      JOIN users u ON j.publisher_id = u.id
      LEFT JOIN company_profiles cp ON cp.user_id = u.id
      WHERE j.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Oferta no encontrada' });
    }

    res.json({ job: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener la oferta' });
  }
}

// ============================================
// MIS OFERTAS (publicador)
// ============================================
async function myJobs(req, res) {
  try {
    const result = await pool.query(
      `SELECT * FROM jobs WHERE publisher_id = $1 ORDER BY created_at DESC`,
      [req.user.id]
    );
    res.json({ total: result.rows.length, ofertas: result.rows });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener tus ofertas' });
  }
}

// ============================================
// POSTULAR A UNA OFERTA
// ============================================
async function applyToJob(req, res) {
  const { id } = req.params;
  const { message } = req.body;

  try {
    // Verificar que la oferta existe y está activa
    const jobResult = await pool.query(
      'SELECT id, status, publisher_id FROM jobs WHERE id = $1',
      [id]
    );
    if (jobResult.rows.length === 0) {
      return res.status(404).json({ error: 'Oferta no encontrada' });
    }
    if (jobResult.rows[0].status !== 'active') {
      return res.status(400).json({ error: 'Esta oferta ya no acepta postulaciones' });
    }
    if (jobResult.rows[0].publisher_id === req.user.id) {
      return res.status(400).json({ error: 'No puedes postular a tu propia oferta' });
    }

    // Insertar postulación
    const result = await pool.query(
      `INSERT INTO applications (job_id, student_id, message)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [id, req.user.id, message || null]
    );

    res.status(201).json({
      mensaje: 'Postulación enviada exitosamente',
      application: result.rows[0]
    });
  } catch (error) {
    if (error.code === '23505') { // unique violation
      return res.status(409).json({ error: 'Ya postulaste a esta oferta' });
    }
    console.error('Error al postular:', error.message);
    res.status(500).json({ error: 'Error al enviar la postulación' });
  }
}

// ============================================
// MIS POSTULACIONES (estudiante)
// ============================================
async function myApplications(req, res) {
  try {
    const result = await pool.query(
      `SELECT 
        a.id, a.status, a.message, a.created_at,
        j.id AS job_id, j.title, j.job_type, j.location,
        u.full_name AS publisher_name
      FROM applications a
      JOIN jobs j ON a.job_id = j.id
      JOIN users u ON j.publisher_id = u.id
      WHERE a.student_id = $1
      ORDER BY a.created_at DESC`,
      [req.user.id]
    );
    res.json({ total: result.rows.length, postulaciones: result.rows });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener tus postulaciones' });
  }
}

// ============================================
// VER POSTULANTES DE UNA OFERTA (publicador)
// ============================================
async function jobApplicants(req, res) {
  const { id } = req.params;

  try {
    // Verificar que el usuario es el dueño de la oferta
    const jobResult = await pool.query(
      'SELECT publisher_id FROM jobs WHERE id = $1',
      [id]
    );
    if (jobResult.rows.length === 0) {
      return res.status(404).json({ error: 'Oferta no encontrada' });
    }
    if (jobResult.rows[0].publisher_id !== req.user.id) {
      return res.status(403).json({ error: 'No eres el dueño de esta oferta' });
    }

    const result = await pool.query(
      `SELECT 
        a.id, a.status, a.message, a.created_at,
        u.id AS student_id, u.full_name, u.email
      FROM applications a
      JOIN users u ON a.student_id = u.id
      WHERE a.job_id = $1
      ORDER BY a.created_at DESC`,
      [id]
    );

    res.json({ total: result.rows.length, postulantes: result.rows });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener postulantes' });
  }
}

module.exports = {
  createJob, listJobs, getJob, myJobs,
  applyToJob, myApplications, jobApplicants,
  VALID_TAGS
};