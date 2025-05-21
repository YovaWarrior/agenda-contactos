const app = require('./app');

// Definir puerto
const PORT = process.env.PORT || 3000;
// Definir host (0.0.0.0 permite conexiones desde cualquier dispositivo en la red)
const HOST = '0.0.0.0';

// Iniciar el servidor
app.listen(PORT, HOST, () => {
  console.log(`Servidor ejecutándose en http://${HOST}:${PORT}`);
  console.log('Para acceder desde otros dispositivos en la misma red:');
  console.log('1. Encuentra la dirección IP de este ordenador en la red local');
  console.log('2. Accede desde otro dispositivo usando http://IP-DEL-ORDENADOR:3000');
});