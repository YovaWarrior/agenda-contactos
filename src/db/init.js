const db = require('./database');
const bcrypt = require('bcrypt');

// Crear tablas en tercera forma normal (3FN)
const createTables = () => {
  return new Promise((resolve, reject) => {
    // Tabla de usuarios (para autenticación)
    db.run(`
      CREATE TABLE IF NOT EXISTS usuarios (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `, (err) => {
      if (err) {
        console.error('Error al crear tabla usuarios:', err.message);
        return reject(err);
      }
      
      // Tabla de categorías
      db.run(`
        CREATE TABLE IF NOT EXISTS categorias (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          nombre TEXT NOT NULL,
          usuario_id INTEGER,
          FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
          UNIQUE(nombre, usuario_id)
        )
      `, (err) => {
        if (err) {
          console.error('Error al crear tabla categorias:', err.message);
          return reject(err);
        }
        
        // Tabla de contactos
        db.run(`
          CREATE TABLE IF NOT EXISTS contactos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nombre TEXT NOT NULL,
            apellido TEXT,
            telefono TEXT NOT NULL,
            email TEXT,
            direccion TEXT,
            categoria_id INTEGER,
            usuario_id INTEGER NOT NULL,
            fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (categoria_id) REFERENCES categorias(id),
            FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
          )
        `, (err) => {
          if (err) {
            console.error('Error al crear tabla contactos:', err.message);
            return reject(err);
          }
          
          // Tabla para las imágenes de contactos (relación 1:1)
          db.run(`
            CREATE TABLE IF NOT EXISTS imagenes_contacto (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              contacto_id INTEGER UNIQUE,
              ruta_imagen TEXT NOT NULL,
              FOREIGN KEY (contacto_id) REFERENCES contactos(id) ON DELETE CASCADE
            )
          `, (err) => {
            if (err) {
              console.error('Error al crear tabla imagenes_contacto:', err.message);
              return reject(err);
            }
            
            console.log('Base de datos inicializada correctamente');
            resolve();
          });
        });
      });
    });
  });
};

// Insertar datos iniciales
const insertInitialData = () => {
  return new Promise((resolve, reject) => {
    // Crear un usuario de prueba
    const saltRounds = 10;
    const plainPassword = 'Admin123!';
    
    bcrypt.hash(plainPassword, saltRounds, (err, hash) => {
      if (err) {
        console.error('Error al crear hash de contraseña:', err.message);
        return reject(err);
      }
      
      db.run('INSERT OR IGNORE INTO usuarios (username, password) VALUES (?, ?)', ['admin', hash], function(err) {
        if (err) {
          console.error('Error al crear usuario de prueba:', err.message);
          return reject(err);
        }
        
        const userId = this.lastID || 1;
        
        // Insertar categorías iniciales para el usuario admin
        const categorias = ['Trabajo', 'Familia', 'Amigos', 'Otros'];
        let count = 0;
        
        categorias.forEach(categoria => {
          db.run('INSERT OR IGNORE INTO categorias (nombre, usuario_id) VALUES (?, ?)', [categoria, userId], (err) => {
            if (err) {
              console.error(`Error al insertar categoría ${categoria}:`, err.message);
              return reject(err);
            }
            
            count++;
            if (count === categorias.length) {
              console.log('Usuario de prueba creado: admin / Admin123!');
              console.log('Datos iniciales insertados correctamente');
              resolve();
            }
          });
        });
      });
    });
  });
};

// Ejecutar inicialización y luego insertar datos
async function initialize() {
  try {
    await createTables();
    await insertInitialData();
    
    console.log('Inicialización completada con éxito');
    
    // Cerrar conexión después de inicializar
    setTimeout(() => {
      db.close((err) => {
        if (err) {
          console.error('Error al cerrar la conexión:', err.message);
        } else {
          console.log('Conexión a la base de datos cerrada');
        }
      });
    }, 1000);
  } catch (error) {
    console.error('Error durante la inicialización:', error);
    db.close();
  }
}

// Iniciar el proceso
initialize();