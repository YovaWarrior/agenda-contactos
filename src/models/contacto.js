const db = require('../db/database');

class Contacto {
  // Listar todos los contactos
  static listar() {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT c.*, cat.nombre as categoria_nombre, img.ruta_imagen
        FROM contactos c
        LEFT JOIN categorias cat ON c.categoria_id = cat.id
        LEFT JOIN imagenes_contacto img ON c.id = img.contacto_id
        ORDER BY c.nombre
      `;
      
      db.all(query, [], (err, contactos) => {
        if (err) {
          return reject(err);
        }
        resolve(contactos);
      });
    });
  }

  // Buscar contacto por ID
  static buscarPorId(id) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT c.*, cat.nombre as categoria_nombre, img.ruta_imagen
        FROM contactos c
        LEFT JOIN categorias cat ON c.categoria_id = cat.id
        LEFT JOIN imagenes_contacto img ON c.id = img.contacto_id
        WHERE c.id = ?
      `;
      
      db.get(query, [id], (err, contacto) => {
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
  static buscarPorCategoria(categoriaId) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT c.*, cat.nombre as categoria_nombre, img.ruta_imagen
        FROM contactos c
        LEFT JOIN categorias cat ON c.categoria_id = cat.id
        LEFT JOIN imagenes_contacto img ON c.id = img.contacto_id
        WHERE c.categoria_id = ?
        ORDER BY c.nombre
      `;
      
      db.all(query, [categoriaId], (err, contactos) => {
        if (err) {
          return reject(err);
        }
        resolve(contactos);
      });
    });
  }

  // Buscar contactos por nombre o teléfono
  static buscar(termino) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT c.*, cat.nombre as categoria_nombre, img.ruta_imagen
        FROM contactos c
        LEFT JOIN categorias cat ON c.categoria_id = cat.id
        LEFT JOIN imagenes_contacto img ON c.id = img.contacto_id
        WHERE c.nombre LIKE ? OR c.telefono LIKE ?
        ORDER BY c.nombre
      `;
      
      const parametro = `%${termino}%`;
      db.all(query, [parametro, parametro], (err, contactos) => {
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
      const { nombre, apellido, telefono, email, direccion, categoria_id } = contactoData;
      
      db.run(
        'INSERT INTO contactos (nombre, apellido, telefono, email, direccion, categoria_id) VALUES (?, ?, ?, ?, ?, ?)',
        [nombre, apellido, telefono, email, direccion, categoria_id],
        function(err) {
          if (err) {
            return reject(err);
          }
          
          // Si se proporcionó una imagen, guardarla
          if (contactoData.ruta_imagen) {
            db.run(
              'INSERT INTO imagenes_contacto (contacto_id, ruta_imagen) VALUES (?, ?)',
              [this.lastID, contactoData.ruta_imagen],
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
  static actualizar(id, contactoData) {
    return new Promise((resolve, reject) => {
      const { nombre, apellido, telefono, email, direccion, categoria_id } = contactoData;
      
      db.run(
        'UPDATE contactos SET nombre = ?, apellido = ?, telefono = ?, email = ?, direccion = ?, categoria_id = ? WHERE id = ?',
        [nombre, apellido, telefono, email, direccion, categoria_id, id],
        function(err) {
          if (err) {
            return reject(err);
          }
          
          if (this.changes === 0) {
            return reject(new Error('Contacto no encontrado'));
          }
          
          // Si se proporcionó una imagen, actualizarla o crearla
          if (contactoData.ruta_imagen) {
            db.get('SELECT id FROM imagenes_contacto WHERE contacto_id = ?', [id], (err, row) => {
              if (err) {
                return reject(err);
              }
              
              if (row) {
                // Actualizar imagen existente
                db.run(
                  'UPDATE imagenes_contacto SET ruta_imagen = ? WHERE contacto_id = ?',
                  [contactoData.ruta_imagen, id],
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
                  [id, contactoData.ruta_imagen],
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
  static eliminar(id) {
    return new Promise((resolve, reject) => {
      // Primero eliminamos las imágenes asociadas
      db.run('DELETE FROM imagenes_contacto WHERE contacto_id = ?', [id], (err) => {
        if (err) {
          return reject(err);
        }
        
        // Luego eliminamos el contacto
        db.run('DELETE FROM contactos WHERE id = ?', [id], function(err) {
          if (err) {
            return reject(err);
          }
          
          if (this.changes === 0) {
            return reject(new Error('Contacto no encontrado'));
          }
          
          resolve({ eliminado: true });
        });
      });
    });
  }
}

module.exports = Contacto;