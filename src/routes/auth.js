// src/routes/auth.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const usuariosController = require('../controllers/usuariosController');
const verificarToken = require('../middleware/auth');

// Rutas públicas
router.post('/registro', authController.registrar);
router.post('/login', authController.login);

// Rutas protegidas
router.get('/perfil', verificarToken, authController.perfil);

// Rutas para gestión de usuarios (protegidas)
router.get('/usuarios', verificarToken, usuariosController.listar);
router.get('/usuarios/:id', verificarToken, usuariosController.obtener);
router.post('/usuarios', verificarToken, usuariosController.crear);
router.put('/usuarios/:id', verificarToken, usuariosController.actualizar);
router.delete('/usuarios/:id', verificarToken, usuariosController.eliminar);

module.exports = router;