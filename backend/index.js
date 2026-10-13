require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
app.use(cors());
app.use(express.json());

// Conexión a PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Ruta de prueba
app.get('/', (req, res) => {
  res.json({ mensaje: 'Servidor de prácticas IE funcionando ✅' });
});

// Ruta para verificar la conexión a la base de datos
app.get('/db-test', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ 
      mensaje: 'Conexión a PostgreSQL exitosa ✅', 
      hora: result.rows[0].now 
    });
  } catch (error) {
    res.status(500).json({ 
      mensaje: 'Error al conectar con la base de datos ❌', 
      error: error.message 
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});