const db = require('../db/database');

class Categoria {
  // Obtener todas las categorías del usuario
  static listar(usuarioId) {
    return new Promise((resolve, reject) => {
      db.all('SELECT * FROM categorias WHERE usuario_id = ? ORDER BY nombre', [usuarioId], (err, categorias) => {
        if (err) {
          return reject(err);
        }
        resolve(categorias);
      });
    });
  }

  // Obtener una categoría por ID
  static buscarPorId(id, usuarioId) {
    return new Promise((resolve, reject) => {
      const query = 'SELECT * FROM categorias WHERE id = ? AND usuario_id = ?';
      db.get(query, [id, usuarioId], (err, categoria) => {
        if (err) {
          return reject(err);
        }
        if (!categoria) {
          return reject(new Error('Categoría no encontrada'));
        }
        resolve(categoria);
      });
    });
  }

  // Crear una nueva categoría
  static crear(nombre, usuarioId) {
    return new Promise((resolve, reject) => {
      db.run('INSERT INTO categorias (nombre, usuario_id) VALUES (?, ?)', [nombre, usuarioId], function(err) {
        if (err) {
          return reject(err);
        }
        resolve({ id: this.lastID, nombre, usuario_id: usuarioId });
      });
    });
  }

  // Actualizar una categoría
  static actualizar(id, nombre, usuarioId) {
    return new Promise((resolve, reject) => {
      db.run('UPDATE categorias SET nombre = ? WHERE id = ? AND usuario_id = ?', [nombre, id, usuarioId], function(err) {
        if (err) {
          return reject(err);
        }
        if (this.changes === 0) {
          return reject(new Error('Categoría no encontrada o sin permisos'));
        }
        resolve({ id, nombre, usuario_id: usuarioId });
      });
    });
  }

  // Eliminar una categoría
  static eliminar(id, usuarioId) {
    return new Promise((resolve, reject) => {
      db.run('DELETE FROM categorias WHERE id = ? AND usuario_id = ?', [id, usuarioId], function(err) {
        if (err) {
          return reject(err);
        }
        if (this.changes === 0) {
          return reject(new Error('Categoría no encontrada o sin permisos'));
        }
        resolve({ eliminado: true });
      });
    });
  }
}

module.exports = Categoria;