const express = require('express');
const router = express.Router();
const categoriasController = require('../controllers/categoriasController');
const verificarToken = require('../middleware/auth');

// Aplicar middleware de autenticación a todas las rutas
router.use(verificarToken);

// Rutas CRUD
router.get('/', categoriasController.listar);
router.get('/:id', categoriasController.obtener);
router.post('/', categoriasController.crear);
router.put('/:id', categoriasController.actualizar);
router.delete('/:id', categoriasController.eliminar);

module.exports = router;