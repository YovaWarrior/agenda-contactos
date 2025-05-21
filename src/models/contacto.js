const db = require('../db/database');

class Contacto {
  // Listar todos los contactos del usuario
  static listar(usuarioId) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT c.*, cat.nombre as categoria_nombre, img.ruta_imagen
        FROM contactos c
        LEFT JOIN categorias cat ON c.categoria_id = cat.id
        LEFT JOIN imagenes_contacto img ON c.id = img.contacto_id
        WHERE c.usuario_id = ?
        ORDER BY c.nombre
      `;
      
      db.all(query, [usuarioId], (err, contactos) => {
        if (err) {
          return reject(err);
        }
        resolve(contactos);
      });
    });
  }

  // Buscar contacto por ID (con verificación de usuario)
  static buscarPorId(id, usuarioId = null) {
    return new Promise((resolve, reject) => {
      let query = `
        SELECT c.*, cat.nombre as categoria_nombre, img.ruta_imagen
        FROM contactos c
        LEFT JOIN categorias cat ON c.categoria_id = cat.id
        LEFT JOIN imagenes_contacto img ON c.id = img.contacto_id
        WHERE c.id = ?
      `;
      
      let params = [id];
      
      if (usuarioId) {
        query += ' AND c.usuario_id = ?';
        params.push(usuarioId);
      }
      
      db.get(query, params, (err, contacto) => {
        if (err) {
          return reject(err);
        }
        if (!contacto) {
          return reject(new Error('Contacto no encontrado'));
        }
        resolve(contacto);
      });
    });
  }

  // Buscar contactos por categoría
  static buscarPorCategoria(categoriaId, usuarioId) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT c.*, cat.nombre as categoria_nombre, img.ruta_imagen
        FROM contactos c
        LEFT JOIN categorias cat ON c.categoria_id = cat.id
        LEFT JOIN imagenes_contacto img ON c.id = img.contacto_id
        WHERE c.categoria_id = ? AND c.usuario_id = ?
        ORDER BY c.nombre
      `;
      
      db.all(query, [categoriaId, usuarioId], (err, contactos) => {
        if (err) {
          return reject(err);
        }
        resolve(contactos);
      });
    });
  }

  // Buscar contactos por nombre o teléfono
  static buscar(termino, usuarioId) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT c.*, cat.nombre as categoria_nombre, img.ruta_imagen
        FROM contactos c
        LEFT JOIN categorias cat ON c.categoria_id = cat.id
        LEFT JOIN imagenes_contacto img ON c.id = img.contacto_id
        WHERE (c.nombre LIKE ? OR c.telefono LIKE ?) AND c.usuario_id = ?
        ORDER BY c.nombre
      `;
      
      const parametro = `%${termino}%`;
      db.all(query, [parametro, parametro, usuarioId], (err, contactos) => {
        if (err) {
          return reject(err);
        }
        resolve(contactos);
      });
    });
  }

  // Crear un nuevo contacto
  static crear(contactoData) {
    return new Promise((resolve, reject) => {
      const { nombre, apellido, telefono, email, direccion, categoria_id, usuario_id, ruta_imagen } = contactoData;
      
      db.run(
        'INSERT INTO contactos (nombre, apellido, telefono, email, direccion, categoria_id, usuario_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [nombre, apellido, telefono, email, direccion, categoria_id, usuario_id],
        function(err) {
          if (err) {
            return reject(err);
          }
          
          // Si se proporcionó una imagen, guardarla
          if (ruta_imagen) {
            db.run(
              'INSERT INTO imagenes_contacto (contacto_id, ruta_imagen) VALUES (?, ?)',
              [this.lastID, ruta_imagen],
              (err) => {
                if (err) {
                  return reject(err);
                }
                Contacto.buscarPorId(this.lastID)
                  .then(contacto => resolve(contacto))
                  .catch(err => reject(err));
              }
            );
          } else {
            Contacto.buscarPorId(this.lastID)
              .then(contacto => resolve(contacto))
              .catch(err => reject(err));
          }
        }
      );
    });
  }

  // Actualizar contacto
  static actualizar(id, contactoData, usuarioId) {
    return new Promise((resolve, reject) => {
      const { nombre, apellido, telefono, email, direccion, categoria_id, ruta_imagen } = contactoData;
      
      db.run(
        'UPDATE contactos SET nombre = ?, apellido = ?, telefono = ?, email = ?, direccion = ?, categoria_id = ? WHERE id = ? AND usuario_id = ?',
        [nombre, apellido, telefono, email, direccion, categoria_id, id, usuarioId],
        function(err) {
          if (err) {
            return reject(err);
          }
          
          if (this.changes === 0) {
            return reject(new Error('Contacto no encontrado o sin permisos'));
          }
          
          // Si se proporcionó una imagen, actualizarla o crearla
          if (ruta_imagen) {
            db.get('SELECT id FROM imagenes_contacto WHERE contacto_id = ?', [id], (err, row) => {
              if (err) {
                return reject(err);
              }
              
              if (row) {
                // Actualizar imagen existente
                db.run(
                  'UPDATE imagenes_contacto SET ruta_imagen = ? WHERE contacto_id = ?',
                  [ruta_imagen, id],
                  (err) => {
                    if (err) {
                      return reject(err);
                    }
                    Contacto.buscarPorId(id)
                      .then(contacto => resolve(contacto))
                      .catch(err => reject(err));
                  }
                );
              } else {
                // Crear nueva imagen
                db.run(
                  'INSERT INTO imagenes_contacto (contacto_id, ruta_imagen) VALUES (?, ?)',
                  [id, ruta_imagen],
                  (err) => {
                    if (err) {
                      return reject(err);
                    }
                    Contacto.buscarPorId(id)
                      .then(contacto => resolve(contacto))
                      .catch(err => reject(err));
                  }
                );
              }
            });
          } else {
            Contacto.buscarPorId(id)
              .then(contacto => resolve(contacto))
              .catch(err => reject(err));
          }
        }
      );
    });
  }

  // Eliminar contacto
  static eliminar(id, usuarioId) {
    return new Promise((resolve, reject) => {
      // Primero eliminamos las imágenes asociadas
      db.run('DELETE FROM imagenes_contacto WHERE contacto_id = ?', [id], (err) => {
        if (err) {
          return reject(err);
        }
        
        // Luego eliminamos el contacto
        db.run('DELETE FROM contactos WHERE id = ? AND usuario_id = ?', [id, usuarioId], function(err) {
          if (err) {
            return reject(err);
          }
          
          if (this.changes === 0) {
            return reject(new Error('Contacto no encontrado o sin permisos'));
          }
          
          resolve({ eliminado: true });
        });
      });
    });
  }
}

module.exports = Contacto;