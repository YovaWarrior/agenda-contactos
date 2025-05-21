const db = require('./database');

const migrateDatabase = async () => {
  return new Promise((resolve, reject) => {
    console.log('Iniciando migración de la base de datos...');
    
    // Verificar y actualizar la tabla categorías
    db.all("PRAGMA table_info(categorias)", [], (err, rows) => {
      if (err) {
        console.error('Error al verificar estructura de tabla categorías:', err);
        return reject(err);
      }
      
      let hasCategoriaUsuarioId = rows.some(row => row.name === 'usuario_id');
      
      if (!hasCategoriaUsuarioId) {
        console.log('Añadiendo columna usuario_id a la tabla categorías...');
        
        db.run("ALTER TABLE categorias ADD COLUMN usuario_id INTEGER", [], (err) => {
          if (err) {
            console.error('Error al añadir columna a categorías:', err);
            return reject(err);
          }
          
          db.run("UPDATE categorias SET usuario_id = 1 WHERE usuario_id IS NULL", [], (err) => {
            if (err) {
              console.error('Error al actualizar datos de categorías:', err);
              return reject(err);
            }
            
            console.log('Migración de categorías completada.');
            
            // Continuar con la migración de contactos
            migrateContactosTable(resolve, reject);
          });
        });
      } else {
        console.log('La columna usuario_id ya existe en categorías.');
        // Continuar con la migración de contactos
        migrateContactosTable(resolve, reject);
      }
    });
  });
};

function migrateContactosTable(resolve, reject) {
  db.all("PRAGMA table_info(contactos)", [], (err, rows) => {
    if (err) {
      console.error('Error al verificar estructura de tabla contactos:', err);
      return reject(err);
    }
    
    let hasContactoUsuarioId = rows.some(row => row.name === 'usuario_id');
    
    if (!hasContactoUsuarioId) {
      console.log('Añadiendo columna usuario_id a la tabla contactos...');
      
      db.run("ALTER TABLE contactos ADD COLUMN usuario_id INTEGER", [], (err) => {
        if (err) {
          console.error('Error al añadir columna a contactos:', err);
          return reject(err);
        }
        
        db.run("UPDATE contactos SET usuario_id = 1 WHERE usuario_id IS NULL", [], (err) => {
          if (err) {
            console.error('Error al actualizar datos de contactos:', err);
            return reject(err);
          }
          
          console.log('Migración de contactos completada.');
          resolve();
        });
      });
    } else {
      console.log('La columna usuario_id ya existe en contactos.');
      resolve();
    }
  });
}

// Ejecutar la migración
migrateDatabase()
  .then(() => {
    console.log('Proceso de migración finalizado con éxito.');
    process.exit(0);
  })
  .catch((err) => {
    console.error('Error durante la migración:', err);
    process.exit(1);
  });