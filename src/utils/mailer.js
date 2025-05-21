const nodemailer = require('nodemailer');

// Configuración para envío de correos con Gmail
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'carlosmartinezcrl7@gmail.com',
    pass: 'ootg bcai ybuz chqf' // Reemplaza con tu contraseña de aplicación
  }
});

// Función para enviar un correo de notificación
const enviarNotificacionContacto = async (email, nombre, usuarioNombre) => {
  if (!email) return { enviado: false, mensaje: 'No se proporcionó email' }; 
  
  try {
    // Enviar el correo
    const info = await transporter.sendMail({
      from: '"Agenda de Contactos" <carlosmartinezcrl7@gmail.com>',
      to: email,
      subject: 'Has sido añadido a una agenda de contactos',
      text: `Hola ${nombre},\n\nHas sido añadido a la agenda de contactos de ${usuarioNombre} en la aplicación Agenda de Contactos de FreeBSD y Haiku OS.\n\nSaludos,\nEl equipo de Agenda de Contactos`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Has sido añadido a una agenda de contactos</h2>
          <p>Hola <strong>${nombre}</strong>,</p>
          <p>Has sido añadido a la agenda de contactos de <strong>${usuarioNombre}</strong> en la aplicación Agenda de Contactos de FreeBSD y Haiku OS.</p>
          <p>Saludos,<br>El equipo de Agenda de Contactos</p>
        </div>
      `
    });
    
    console.log('Correo enviado:', info.messageId);
    return { enviado: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error al enviar correo:', error);
    return { enviado: false, error: error.message };
  }
};

module.exports = {
  enviarNotificacionContacto
};