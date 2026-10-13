require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRoutes = require('./src/routes/auth');
const jobsRoutes = require('./src/routes/jobs');
const applicationsRoutes = require('./src/routes/applications');
const adminRoutes = require('./src/routes/admin');  // ← NUEVO

const app = express();
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ mensaje: 'Servidor de prácticas IE funcionando ✅' });
});

app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobsRoutes);
app.use('/api/applications', applicationsRoutes);
app.use('/api/admin', adminRoutes);  // ← NUEVO

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});