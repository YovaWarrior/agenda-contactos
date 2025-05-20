const db = require('../db/database');

class Categoria {
  // Obtener todas las categorías
  static listar() {
    return new Promise((resolve, reject) => {
      db.all('SELECT * FROM categorias ORDER BY nombre', [], (err, categorias) => {
        if (err) {
          return reject(err);
        }
        resolve(categorias);
      });
    });
  }

  // Obtener una categoría por ID
  static buscarPorId(id) {
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM categorias WHERE id = ?', [id], (err, categoria) => {
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
  static crear(nombre) {
    return new Promise((resolve, reject) => {
      db.run('INSERT INTO categorias (nombre) VALUES (?)', [nombre], function(err) {
        if (err) {
          return reject(err);
        }
        resolve({ id: this.lastID, nombre });
      });
    });
  }

  // Actualizar una categoría
  static actualizar(id, nombre) {
    return new Promise((resolve, reject) => {
      db.run('UPDATE categorias SET nombre = ? WHERE id = ?', [nombre, id], function(err) {
        if (err) {
          return reject(err);
        }
        if (this.changes === 0) {
          return reject(new Error('Categoría no encontrada'));
        }
        resolve({ id, nombre });
      });
    });
  }

  // Eliminar una categoría
  static eliminar(id) {
    return new Promise((resolve, reject) => {
      db.run('DELETE FROM categorias WHERE id = ?', [id], function(err) {
        if (err) {
          return reject(err);
        }
        if (this.changes === 0) {
          return reject(new Error('Categoría no encontrada'));
        }
        resolve({ eliminado: true });
      });
    });
  }
}

module.exports = Categoria;