document.addEventListener('DOMContentLoaded', function() {
  // Verificar autenticación
  const token = localStorage.getItem('token');
  if (!token) {
    window.location.href = '/';
    return;
  }

  // Referencias a elementos del DOM
  const usernameDisplay = document.getElementById('username-display');
  const logoutBtn = document.getElementById('logout-btn');
  const menuContactos = document.getElementById('menu-contactos');
  const menuCategorias = document.getElementById('menu-categorias');
  const menuAyuda = document.getElementById('menu-ayuda');
  const contactosSection = document.getElementById('contactos-section');
  const categoriasSection = document.getElementById('categorias-section');
  const ayudaSection = document.getElementById('ayuda-section');
  const contactsList = document.getElementById('contacts-list');
  const categoriesList = document.getElementById('categories-list');
  const categoriaFilter = document.getElementById('categoria-filter');
  const searchInput = document.getElementById('search-input');
  const searchBtn = document.getElementById('search-btn');
  const addContactBtn = document.getElementById('add-contact-btn');
  const addCategoryBtn = document.getElementById('add-category-btn');
  const contactModal = document.getElementById('contact-modal');
  const categoryModal = document.getElementById('category-modal');
  const contactForm = document.getElementById('contact-form');
  const categoryForm = document.getElementById('category-form');
  const modalCloseButtons = document.querySelectorAll('.close');
  const cancelBtn = document.getElementById('cancel-btn');
  const cancelCategoryBtn = document.getElementById('cancel-category-btn');
  const contactId = document.getElementById('contact-id');
  const categoryId = document.getElementById('category-id');
  const modalTitle = document.getElementById('modal-title');
  const categoryModalTitle = document.getElementById('category-modal-title');
  const imagenInput = document.getElementById('imagen');
  const imagenPreview = document.getElementById('imagen-preview');
  const categoriaSelect = document.getElementById('categoria');

  // Obtener información del usuario y mostrar nombre
  async function getUserInfo() {
    try {
      const response = await fetch('/api/auth/perfil', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Error al obtener información del usuario');
      }

      const data = await response.json();
      usernameDisplay.textContent = data.usuario.username;
    } catch (error) {
      console.error('Error:', error);
      alert('Error al obtener información del usuario. Por favor, inicia sesión nuevamente.');
      localStorage.removeItem('token');
      window.location.href = '/';
    }
  }

  // Cargar contactos
  async function loadContacts(categoriaId = null, searchTerm = null) {
    try {
      let url = '/api/contactos';
      
      if (categoriaId) {
        url = `/api/contactos/categoria/${categoriaId}`;
      } else if (searchTerm) {
        url = `/api/contactos/buscar?termino=${searchTerm}`;
      }
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Error al cargar contactos');
      }

      const data = await response.json();
      displayContacts(data.contactos);
      return data.contactos; // Devolver los contactos para usarlos en otras funciones
    } catch (error) {
      console.error('Error:', error);
      contactsList.innerHTML = '<p>Error al cargar contactos</p>';
      return []; // Devolver array vacío en caso de error
    }
  }

  // Obtener el conteo de contactos por categoría
  async function getContactCountsByCategory() {
    try {
      // Cargamos todos los contactos
      const contactos = await loadContacts();
      
      // Creamos un objeto para contar los contactos por categoría
      const counts = {};
      
      // Contamos los contactos por categoría
      contactos.forEach(contacto => {
        if (contacto.categoria_id && contacto.categoria_nombre) {
          if (!counts[contacto.categoria_id]) {
            counts[contacto.categoria_id] = {
              nombre: contacto.categoria_nombre,
              count: 0
            };
          }
          counts[contacto.categoria_id].count++;
        }
      });
      
      return counts;
    } catch (error) {
      console.error('Error al obtener conteo de contactos por categoría:', error);
      return {}; // Devolver objeto vacío en caso de error
    }
  }

  // Mostrar contactos en la interfaz
  function displayContacts(contactos) {
    contactsList.innerHTML = '';
    
    if (contactos.length === 0) {
      contactsList.innerHTML = '<p>No hay contactos para mostrar</p>';
      return;
    }
    
    contactos.forEach(contacto => {
      const contactCard = document.createElement('div');
      contactCard.className = 'contact-card';
      
      // Crear imagen del contacto
      const imageUrl = contacto.ruta_imagen ? `/img/${contacto.ruta_imagen}` : '/img/default-profile.png';
      
      contactCard.innerHTML = `
        <div class="contact-image">
          <img src="${imageUrl}" alt="${contacto.nombre}">
        </div>
        <div class="contact-details">
          <div class="contact-name">${contacto.nombre} ${contacto.apellido || ''}</div>
          <div class="contact-info">${contacto.telefono}</div>
          ${contacto.email ? `<div class="contact-info">${contacto.email}</div>` : ''}
          ${contacto.categoria_nombre ? `<div class="contact-category">${contacto.categoria_nombre}</div>` : ''}
        </div>
        <div class="card-actions">
          <button class="edit-btn" data-id="${contacto.id}">Editar</button>
          <button class="delete-btn" data-id="${contacto.id}">Eliminar</button>
        </div>
      `;
      
      contactsList.appendChild(contactCard);
      
      // Añadir event listeners a los botones
      const editBtn = contactCard.querySelector('.edit-btn');
      const deleteBtn = contactCard.querySelector('.delete-btn');
      
      editBtn.addEventListener('click', () => editContact(contacto.id));
      deleteBtn.addEventListener('click', () => deleteContact(contacto.id));
    });
  }

  // Cargar categorías
  async function loadCategories() {
    try {
      const response = await fetch('/api/categorias', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Error al cargar categorías');
      }

      const data = await response.json();
      
      // Obtener el conteo de contactos por categoría
      const contactCountsByCategory = await getContactCountsByCategory();
      
      // Mostrar categorías con su conteo correcto
      displayCategories(data.categorias, contactCountsByCategory);
      populateCategoryDropdowns(data.categorias);
    } catch (error) {
      console.error('Error:', error);
      categoriesList.innerHTML = '<p>Error al cargar categorías</p>';
    }
  }

  // Mostrar categorías en la interfaz
  function displayCategories(categorias, contactCountsByCategory = {}) {
    categoriesList.innerHTML = '';
    
    if (categorias.length === 0) {
      categoriesList.innerHTML = '<p style="text-align: center; padding: 20px;">No hay categorías para mostrar</p>';
      return;
    }
    
    // Estilo para el contenedor similar al de los contactos
    categoriesList.style.display = 'grid';
    categoriesList.style.gridTemplateColumns = 'repeat(auto-fill, minmax(250px, 1fr))';
    categoriesList.style.gap = '20px';
    categoriesList.style.marginTop = '20px';
    
    // Colores para las categorías según lo mostrado en la imagen
    const colorMap = {
      'Amigos': '#e91e63',  // Rosa/Rojo
      'Familia': '#4caf50',  // Verde
      'Otros': '#9c27b0',   // Púrpura
      'Trabajo': '#ff9800',  // Naranja
      'futbol': '#2196f3'    // Azul (para la nueva categoría que vi en la imagen)
    };
    
    categorias.forEach(categoria => {
      const categoryCard = document.createElement('div');
      categoryCard.className = 'category-card';
      categoryCard.style.border = '1px solid var(--border-color)'; 
      categoryCard.style.borderRadius = '4px';
      categoryCard.style.padding = '15px';
      categoryCard.style.backgroundColor = 'var(--bg-card)';
      categoryCard.style.boxShadow = '0 1px 3px var(--shadow-color)';
      
      // Obtener color para el punto basado en el nombre de categoría
      const color = colorMap[categoria.nombre] || '#607d8b'; // Gris como predeterminado
      
      // Obtener el conteo de contactos para esta categoría
      const categoryInfo = contactCountsByCategory[categoria.id] || { count: 0 };
      const contactCount = categoryInfo.count;
      
      categoryCard.innerHTML = `
        <div style="display: flex; align-items: center; margin-bottom: 15px;">
          <span style="display: inline-block; width: 10px; height: 10px; background-color: ${color}; border-radius: 50%; margin-right: 10px;"></span>
          <span style="font-weight: bold; color: var(--text-primary);">${categoria.nombre}</span>
        </div>
        
        <div style="margin-bottom: 15px; display: flex; align-items: center; color: var(--text-secondary);">
          <span style="display: inline-block; width: 20px;">👤</span>
          <span>${contactCount} contactos</span>
        </div>
        
        <div style="display: flex; justify-content: space-between;">
          <button class="edit-category-btn" data-id="${categoria.id}" style="background: none; border: none; color: var(--primary-light); cursor: pointer; display: flex; align-items: center;">
            <span style="margin-right: 5px;">✏️</span>
            <span>Editar</span>
          </button>
          <button class="delete-category-btn" data-id="${categoria.id}" style="background: none; border: none; color: var(--danger-color); cursor: pointer; display: flex; align-items: center;">
            <span style="margin-right: 5px;">🗑️</span>
            <span>Eliminar</span>
          </button>
        </div>
      `;
      
      categoriesList.appendChild(categoryCard);
      
      // Añadir event listeners a los botones
      const editBtn = categoryCard.querySelector('.edit-category-btn');
      const deleteBtn = categoryCard.querySelector('.delete-category-btn');
      
      editBtn.addEventListener('click', () => editCategory(categoria.id));
      deleteBtn.addEventListener('click', () => deleteCategory(categoria.id));
    });
  }

  // Poblar los desplegables de categorías
  function populateCategoryDropdowns(categorias) {
    // Limpiar opciones actuales
    categoriaFilter.innerHTML = '<option value="">Todas las categorías</option>';
    categoriaSelect.innerHTML = '<option value="">Sin categoría</option>';
    
    // Añadir categorías a los desplegables
    categorias.forEach(categoria => {
      const filterOption = document.createElement('option');
      filterOption.value = categoria.id;
      filterOption.textContent = categoria.nombre;
      categoriaFilter.appendChild(filterOption);
      
      const selectOption = document.createElement('option');
      selectOption.value = categoria.id;
      selectOption.textContent = categoria.nombre;
      categoriaSelect.appendChild(selectOption);
    });
  }

  // Abrir modal para crear/editar contacto
  function openContactModal(isEdit = false) {
    contactForm.reset();
    imagenPreview.innerHTML = '';
    contactId.value = '';
    modalTitle.textContent = isEdit ? 'Editar Contacto' : 'Añadir Contacto';
    contactModal.style.display = 'block';
  }

  // Abrir modal para crear/editar categoría
  function openCategoryModal(isEdit = false) {
    categoryForm.reset();
    categoryId.value = '';
    categoryModalTitle.textContent = isEdit ? 'Editar Categoría' : 'Añadir Categoría';
    categoryModal.style.display = 'block';
  }

  // Cerrar modales
  function closeModals() {
    contactModal.style.display = 'none';
    categoryModal.style.display = 'none';
  }

  // Editar contacto
  async function editContact(id) {
    try {
      const response = await fetch(`/api/contactos/${id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Error al obtener contacto');
      }

      const data = await response.json();
      const contacto = data.contacto;
      
      // Llenar formulario con datos del contacto
      contactId.value = contacto.id;
      document.getElementById('nombre').value = contacto.nombre;
      document.getElementById('apellido').value = contacto.apellido || '';
      document.getElementById('telefono').value = contacto.telefono;
      document.getElementById('email').value = contacto.email || '';
      document.getElementById('direccion').value = contacto.direccion || '';
      document.getElementById('categoria').value = contacto.categoria_id || '';
      
      // Mostrar imagen actual si existe
      if (contacto.ruta_imagen) {
        imagenPreview.innerHTML = `<img src="/img/${contacto.ruta_imagen}" alt="${contacto.nombre}">`;
      } else {
        imagenPreview.innerHTML = '';
      }
      
      openContactModal(true);
    } catch (error) {
      console.error('Error:', error);
      alert('Error al obtener información del contacto');
    }
  }

  // Eliminar contacto
  async function deleteContact(id) {
    if (confirm('¿Estás seguro de que deseas eliminar este contacto?')) {
      try {
        const response = await fetch(`/api/contactos/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Error al eliminar contacto');
        }

        // Recargar contactos
        loadContacts();
        // Recargar categorías para actualizar conteos
        loadCategories();
      } catch (error) {
        console.error('Error:', error);
        alert('Error al eliminar contacto');
      }
    }
  }

  // Editar categoría
  async function editCategory(id) {
    try {
      const response = await fetch(`/api/categorias/${id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Error al obtener categoría');
      }

      const data = await response.json();
      const categoria = data.categoria;
      
      // Llenar formulario con datos de la categoría
      categoryId.value = categoria.id;
      document.getElementById('nombre-categoria').value = categoria.nombre;
      
      openCategoryModal(true);
    } catch (error) {
      console.error('Error:', error);
      alert('Error al obtener información de la categoría');
    }
  }

  // Eliminar categoría
  async function deleteCategory(id) {
    if (confirm('¿Estás seguro de que deseas eliminar esta categoría?')) {
      try {
        const response = await fetch(`/api/categorias/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Error al eliminar categoría');
        }

        // Recargar categorías
        loadCategories();
        // Recargar contactos (por si alguno usaba esta categoría)
        loadContacts();
      } catch (error) {
        console.error('Error:', error);
        alert('Error al eliminar categoría');
      }
    }
  }

  // Event Listeners
  
  // Cambio entre secciones
  menuContactos.addEventListener('click', function(e) {
    e.preventDefault();
    
    contactosSection.style.display = 'block';
    categoriasSection.style.display = 'none';
    ayudaSection.style.display = 'none';
    
    menuContactos.classList.add('active');
    menuCategorias.classList.remove('active');
    menuAyuda.classList.remove('active');
    
    loadContacts();
  });
  
  menuCategorias.addEventListener('click', function(e) {
    e.preventDefault();
    
    contactosSection.style.display = 'none';
    categoriasSection.style.display = 'block';
    ayudaSection.style.display = 'none';
    
    menuContactos.classList.remove('active');
    menuCategorias.classList.add('active');
    menuAyuda.classList.remove('active');
    
    loadCategories();
  });
  
  menuAyuda.addEventListener('click', function(e) {
    e.preventDefault();
    
    contactosSection.style.display = 'none';
    categoriasSection.style.display = 'none';
    ayudaSection.style.display = 'block';
    
    menuContactos.classList.remove('active');
    menuCategorias.classList.remove('active');
    menuAyuda.classList.add('active');
  });
  
  // Filtrar por categoría
  categoriaFilter.addEventListener('change', function() {
    const categoriaId = this.value;
    loadContacts(categoriaId);
  });
  
  // Buscar contactos
  searchBtn.addEventListener('click', function() {
    const termino = searchInput.value.trim();
    if (termino) {
      loadContacts(null, termino);
    } else {
      loadContacts();
    }
  });
  
  // También buscar al presionar Enter
  searchInput.addEventListener('keyup', function(e) {
    if (e.key === 'Enter') {
      searchBtn.click();
    }
  });
  
  // Abrir modal para añadir contacto
  addContactBtn.addEventListener('click', function() {
    openContactModal();
  });
  
  // Abrir modal para añadir categoría
  addCategoryBtn.addEventListener('click', function() {
    openCategoryModal();
  });
  
  // Cerrar modales
  modalCloseButtons.forEach(button => {
    button.addEventListener('click', closeModals);
  });
  
  cancelBtn.addEventListener('click', closeModals);
  cancelCategoryBtn.addEventListener('click', closeModals);
  
  // Cerrar modales al hacer clic fuera
  window.addEventListener('click', function(e) {
    if (e.target === contactModal) {
      contactModal.style.display = 'none';
    }
    if (e.target === categoryModal) {
      categoryModal.style.display = 'none';
    }
  });
  
  // Vista previa de imagen
  imagenInput.addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function(e) {
        imagenPreview.innerHTML = `<img src="${e.target.result}" alt="Vista previa">`;
      };
      reader.readAsDataURL(file);
    }
  });
  
  // Guardar contacto
  contactForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const formData = new FormData();
    formData.append('nombre', document.getElementById('nombre').value);
    formData.append('apellido', document.getElementById('apellido').value);
    formData.append('telefono', document.getElementById('telefono').value);
    formData.append('email', document.getElementById('email').value);
    formData.append('direccion', document.getElementById('direccion').value);
    formData.append('categoria_id', document.getElementById('categoria').value);
    
    if (imagenInput.files.length > 0) {
      formData.append('imagen', imagenInput.files[0]);
    }
    
    const id = contactId.value;
    const isEdit = !!id;
    
    try {
      const url = isEdit ? `/api/contactos/${id}` : '/api/contactos';
      const method = isEdit ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method: method,
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error(`Error al ${isEdit ? 'actualizar' : 'crear'} contacto`);
      }

      closeModals();
      loadContacts();
      // Recargar categorías para actualizar conteos
      loadCategories();
    } catch (error) {
      console.error('Error:', error);
      alert(`Error al ${isEdit ? 'actualizar' : 'crear'} contacto`);
    }
  });
  
  // Guardar categoría
  categoryForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const nombre = document.getElementById('nombre-categoria').value;
    const id = categoryId.value;
    const isEdit = !!id;
    
    try {
      const url = isEdit ? `/api/categorias/${id}` : '/api/categorias';
      const method = isEdit ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method: method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ nombre })
      });

      if (!response.ok) {
        throw new Error(`Error al ${isEdit ? 'actualizar' : 'crear'} categoría`);
      }

      closeModals();
      loadCategories();
      // Recargar contactos (por si alguno usaba esta categoría)
      loadContacts();
    } catch (error) {
      console.error('Error:', error);
      alert(`Error al ${isEdit ? 'actualizar' : 'crear'} categoría`);
    }
  });
  
  // Cerrar sesión
  logoutBtn.addEventListener('click', function() {
    localStorage.removeItem('token');
    window.location.href = '/';
  });
  
  // Inicializar la aplicación
  getUserInfo();
  loadContacts();
  loadCategories();
});