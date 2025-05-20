const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

// Inicializar la aplicación Express
const app = express();

// Configurar middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../public')));

// Configurar vistas
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Importar rutas
const authRoutes = require('./routes/auth');
const contactosRoutes = require('./routes/contactos');
const categoriasRoutes = require('./routes/categorias');

// Rutas básicas
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Usar rutas
app.use('/api/auth', authRoutes);
app.use('/api/contactos', contactosRoutes);
app.use('/api/categorias', categoriasRoutes);

// Manejar errores 404
app.use((req, res) => {
  res.status(404).send('Página no encontrada');
});

module.exports = app;