const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

// Dominios de email público que NO se aceptan para empresas
const PUBLIC_EMAIL_DOMAINS = [
  'gmail.com', 'hotmail.com', 'outlook.com', 'yahoo.com',
  'live.com', 'icloud.com', 'aol.com', 'protonmail.com'
];

// ============================================
// REGISTRO
// ============================================
async function register(req, res) {
  const { email, password, role, full_name, company_name, ruc, corporate_domain } = req.body;

  // Validaciones básicas
  if (!email || !password || !role || !full_name) {
    return res.status(400).json({ error: 'Faltan campos obligatorios' });
  }

  if (!['student', 'company', 'mentor'].includes(role)) {
    return res.status(400).json({ error: 'Rol inválido' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
  }

  // Si es empresa, verificar que el email NO sea de dominio público
  if (role === 'company') {
    const domain = email.split('@')[1]?.toLowerCase();
    if (PUBLIC_EMAIL_DOMAINS.includes(domain)) {
      return res.status(400).json({ 
        error: 'Las empresas deben registrarse con un email corporativo (no Gmail, Hotmail, etc.)' 
      });
    }
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Verificar si el email ya existe
    const existing = await client.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      await client.query('ROLLBACK');
      return res.status(409).json({ error: 'El email ya está registrado' });
    }

    // Hashear la contraseña
    const password_hash = await bcrypt.hash(password, 10);

    // Insertar usuario
    const userResult = await client.query(
      `INSERT INTO users (email, password_hash, role, full_name, is_verified)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, email, role, full_name, created_at`,
      [email, password_hash, role, full_name, role !== 'company'] // empresas no verificadas al inicio
    );
    const user = userResult.rows[0];

    // Si es empresa, crear su perfil
    if (role === 'company') {
      if (!company_name || !ruc) {
        await client.query('ROLLBACK');
        return res.status(400).json({ error: 'Empresas deben proporcionar company_name y ruc' });
      }
      const domain = email.split('@')[1]?.toLowerCase();
      await client.query(
        `INSERT INTO company_profiles (user_id, company_name, ruc, corporate_domain, verification_status)
         VALUES ($1, $2, $3, $4, $5)`,
        [user.id, company_name, ruc, domain, 'pending']
      );
    }

    await client.query('COMMIT');

    // Generar token JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      mensaje: 'Usuario registrado exitosamente',
      user,
      token
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error en registro:', error.message);
    res.status(500).json({ error: 'Error al registrar el usuario', detalle: error.message });
  } finally {
    client.release();
  }
}

// ============================================
// LOGIN
// ============================================
async function login(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email y contraseña son obligatorios' });
  }

  try {
    const result = await pool.query(
      'SELECT id, email, password_hash, role, full_name, is_verified FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const user = result.rows[0];
    const passwordOk = await bcrypt.compare(password, user.password_hash);

    if (!passwordOk) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      mensaje: 'Login exitoso',
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        full_name: user.full_name,
        is_verified: user.is_verified
      },
      token
    });
  } catch (error) {
    console.error('Error en login:', error.message);
    res.status(500).json({ error: 'Error al iniciar sesión' });
  }
}

// ============================================
// PERFIL (ruta protegida de prueba)
// ============================================
async function profile(req, res) {
  try {
    const result = await pool.query(
      'SELECT id, email, role, full_name, is_verified, created_at FROM users WHERE id = $1',
      [req.user.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    res.json({ user: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener el perfil' });
  }
}

module.exports = { register, login, profile };