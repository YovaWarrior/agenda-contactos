const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Crear la ruta al archivo de la base de datos
const dbPath = path.resolve(__dirname, '../../agenda_contactos.sqlite');

// Crear conexión a la base de datos
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error al conectar con la base de datos:', err.message);
  } else {
    console.log('Conexión exitosa a la base de datos SQLite');
  }
});

module.exports = db;