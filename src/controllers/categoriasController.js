const Categoria = require('../models/categoria');

const categoriasController = {
  // Listar todas las categorías
  async listar(req, res) {
    try {
      const categorias = await Categoria.listar();
      res.json({ categorias });
    } catch (error) {
      console.error('Error al listar categorías:', error);
      res.status(500).json({ error: error.message });
    }
  },
  
  // Obtener una categoría por ID
  async obtener(req, res) {
    try {
      const categoria = await Categoria.buscarPorId(req.params.id);
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
      
      if (!nombre) {
        return res.status(400).json({ error: 'El nombre de la categoría es requerido' });
      }
      
      const categoria = await Categoria.crear(nombre);
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
      
      if (!nombre) {
        return res.status(400).json({ error: 'El nombre de la categoría es requerido' });
      }
      
      const categoria = await Categoria.actualizar(req.params.id, nombre);
      res.json({ categoria });
    } catch (error) {
      console.error('Error al actualizar categoría:', error);
      res.status(500).json({ error: error.message });
    }
  },
  
  // Eliminar una categoría
  async eliminar(req, res) {
    try {
      await Categoria.eliminar(req.params.id);
      res.json({ mensaje: 'Categoría eliminada correctamente' });
    } catch (error) {
      console.error('Error al eliminar categoría:', error);
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = categoriasController;