document.addEventListener('DOMContentLoaded', function() {
  // Obtener botón del tema
  const themeToggle = document.getElementById('theme-toggle');
  const themeIcon = themeToggle.querySelector('i');
  
  // Comprobar si hay una preferencia guardada en localStorage
  const currentTheme = localStorage.getItem('theme');
  
  // Si hay una preferencia, aplicarla
  if (currentTheme) {
    document.documentElement.setAttribute('data-theme', currentTheme);
    
    // Ajustar el icono según el tema
    updateThemeIcon(currentTheme);
  }
  
  // Función para cambiar el tema
  function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    let newTheme = 'light';
    
    if (!currentTheme || currentTheme === 'light') {
      newTheme = 'dark';
    }
    
    // Establecer el nuevo tema
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    
    // Actualizar icono
    updateThemeIcon(newTheme);
  }
  
  // Función para actualizar icono según el tema
  function updateThemeIcon(theme) {
    if (theme === 'dark') {
      themeIcon.className = 'fas fa-sun';
    } else {
      themeIcon.className = 'fas fa-moon';
    }
  }
  
  // Agregar evento al botón
  themeToggle.addEventListener('click', toggleTheme);
});