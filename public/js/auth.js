document.addEventListener('DOMContentLoaded', function() {
  // Referencias a elementos del DOM
  const loginForm = document.getElementById('login-form');
  const registerForm = document.getElementById('register-form');
  const loginFormContainer = document.getElementById('loginForm');
  const registerFormContainer = document.getElementById('registerForm');
  const registerLink = document.getElementById('register-link');
  const loginLink = document.getElementById('login-link');
  const loginError = document.getElementById('login-error');
  const registerError = document.getElementById('register-error');

  // Verificar si ya hay una sesión activa
  const token = localStorage.getItem('token');
  if (token) {
    window.location.href = '/contactos.html';
    return;
  }

  // Mostrar formulario de registro
  if (registerLink) {
    registerLink.addEventListener('click', function(e) {
      e.preventDefault();
      loginFormContainer.style.display = 'none';
      registerFormContainer.style.display = 'block';
    });
  }

  // Mostrar formulario de login
  if (loginLink) {
    loginLink.addEventListener('click', function(e) {
      e.preventDefault();
      registerFormContainer.style.display = 'none';
      loginFormContainer.style.display = 'block';
    });
  }

  // Validar contraseña
  function validarPassword(password) {
    // Al menos 8 caracteres
    if (password.length < 8) return false;
    
    // Al menos una letra mayúscula
    if (!/[A-Z]/.test(password)) return false;
    
    // Al menos una letra minúscula
    if (!/[a-z]/.test(password)) return false;
    
    // Al menos un número
    if (!/[0-9]/.test(password)) return false;
    
    // Al menos un símbolo
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) return false;
    
    return true;
  }

  // Manejar el envío del formulario de login
  if (loginForm) {
    loginForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      
      const username = document.getElementById('username').value;
      const password = document.getElementById('password').value;
      
      // Reiniciar mensaje de error
      loginError.textContent = '';
      
      try {
        console.log('Intentando iniciar sesión con:', username);
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ username, password })
        });
        
        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Usuario o contraseña incorrectos');
        }
        
        const data = await response.json();
        console.log('Inicio de sesión exitoso');
        
        // Guardar token en localStorage
        localStorage.setItem('token', data.token);
        
        // Redirigir a la página de contactos
        window.location.href = '/contactos.html';
      } catch (error) {
        console.error('Error:', error);
        loginError.textContent = error.message;
      }
    });
  }

  // Manejar el envío del formulario de registro
  if (registerForm) {
    registerForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      
      const username = document.getElementById('new-username').value;
      const password = document.getElementById('new-password').value;
      const confirmPassword = document.getElementById('confirm-password').value;
      
      // Reiniciar mensaje de error
      registerError.textContent = '';
      
      // Validar que las contraseñas coincidan
      if (password !== confirmPassword) {
        registerError.textContent = 'Las contraseñas no coinciden';
        return;
      }
      
      // Validar requisitos de la contraseña
      if (!validarPassword(password)) {
        registerError.textContent = 'La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula, un número y un símbolo';
        return;
      }
      
      try {
        console.log('Intentando registrar usuario:', username);
        const response = await fetch('/api/auth/registro', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ username, password })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || 'Error al registrar usuario');
        }
        
        console.log('Registro exitoso');
        
        // Guardar token en localStorage
        localStorage.setItem('token', data.token);
        
        // Redirigir a la página de contactos
        window.location.href = '/contactos.html';
      } catch (error) {
        console.error('Error al registrar:', error);
        registerError.textContent = error.message;
      }
    });
  }
});