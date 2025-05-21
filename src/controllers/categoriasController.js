const Categoria = require('../models/categoria');

const categoriasController = {
  // Listar todas las categorías del usuario
  async listar(req, res) {
    try {
      const usuarioId = req.usuario.id;
      const categorias = await Categoria.listar(usuarioId);
      res.json({ categorias });
    } catch (error) {
      console.error('Error al listar categorías:', error);
      res.status(500).json({ error: error.message });
    }
  },
  
  // Obtener una categoría por ID
  async obtener(req, res) {
    try {
      const usuarioId = req.usuario.id;
      const categoria = await Categoria.buscarPorId(req.params.id, usuarioId);
      res.json({ categoria });
    } catch (error) {
      console.error('Error al obtener categoría:', error);
      res.status(404).json({ error: error.message });
    }
  },
  
  // Crear una nueva categoría
  async crear(req, res) {
    try {
      const { nombre } = req.body;
      const usuarioId = req.usuario.id;
      
      if (!nombre) {
        return res.status(400).json({ error: 'El nombre de la categoría es requerido' });
      }
      
      const categoria = await Categoria.crear(nombre, usuarioId);
      res.status(201).json({ categoria });
    } catch (error) {
      console.error('Error al crear categoría:', error);
      res.status(500).json({ error: error.message });
    }
  },
  
  // Actualizar una categoría
  async actualizar(req, res) {
    try {
      const { nombre } = req.body;
      const usuarioId = req.usuario.id;
      
      if (!nombre) {
        return res.status(400).json({ error: 'El nombre de la categoría es requerido' });
      }
      
      const categoria = await Categoria.actualizar(req.params.id, nombre, usuarioId);
      res.json({ categoria });
    } catch (error) {
      console.error('Error al actualizar categoría:', error);
      if (error.message.includes('no encontrada')) {
        return res.status(404).json({ error: error.message });
      }
      res.status(500).json({ error: error.message });
    }
  },
  
  // Eliminar una categoría
  async eliminar(req, res) {
    try {
      const usuarioId = req.usuario.id;
      await Categoria.eliminar(req.params.id, usuarioId);
      res.json({ mensaje: 'Categoría eliminada correctamente' });
    } catch (error) {
      console.error('Error al eliminar categoría:', error);
      if (error.message.includes('no encontrada')) {
        return res.status(404).json({ error: error.message });
      }
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = categoriasController;