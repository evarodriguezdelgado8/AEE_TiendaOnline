// cliente/js/categorias.js
// ============================================================
//           Página de categorías y productos asociados
// ============================================================

// Importamos funciones del sistema de autenticación y utilidades
import { asegurarAutenticacion, obtenerTiendaLocal, obtenerUsuario, logout } from './auth.js';
import { showToast } from './utils.js';

// Botón de cerrar sesión
document.getElementById('btnLogout').addEventListener('click', logout);

// Verificamos que haya sesión activa
if (!asegurarAutenticacion()) throw new Error('No autenticado');

// Obtenemos la tienda guardada en localStorage (cache local)
const tienda = obtenerTiendaLocal();

// Leer el parámetro 'cat' desde la URL para saber qué categoría mostrar
const params = new URLSearchParams(location.search);
const catId = Number(params.get('cat')) || null;

// Elementos del DOM donde se renderizarán contenidos
const titulo = document.getElementById('tituloCategoria');
const cont = document.getElementById('productosCategoria');
const categoriasUl = document.getElementById('listaCategorias');

// Si no hay datos de tienda, mostramos mensaje de error
if (!tienda) {
  titulo.textContent = 'Tienda no disponible';

} else {

  // ============================================================
  //          Cargar TODAS las categorías en el sidebar
  // ============================================================
  tienda.categorias.forEach(cat => {
    const li = document.createElement('li');
    const a = document.createElement('a');

    // Enlace con parámetro ?cat=ID
    a.href = `categorias.html?cat=${encodeURIComponent(cat.id)}`;
    a.textContent = cat.nombre;

    // Resaltar categoría activa
    if (cat.id === catId) {
      a.classList.add('active');
    }

    li.appendChild(a);
    categoriasUl.appendChild(li);
  });

  // ============================================================
  //        Determinar qué categoría se va a mostrar
  // ============================================================
  const categoria =
    tienda.categorias.find(c => c.id === catId) || tienda.categorias[0];

  // Título de la página
  titulo.textContent = `Categoría: ${categoria.nombre}`;

  // Filtrar productos que pertenecen a la categoría seleccionada
  const productos = tienda.productos.filter(
    p => p.id_categoria === categoria.id
  );

  // Si no hay productos → mensaje vacío
  if (productos.length === 0) {
    const mensaje = document.createElement('p');
    mensaje.textContent = 'No hay productos en esta categoría';
    mensaje.style.textAlign = 'center';
    mensaje.style.padding = '40px';
    mensaje.style.color = '#2d5f3f';
    cont.appendChild(mensaje);

  } else {

    // ============================================================
    //      Renderizar tarjetas de productos de la categoría
    // ============================================================
    productos.forEach(producto => {
      const card = document.createElement('div');
      card.className = 'card';

      // Estructura HTML de la tarjeta
      card.innerHTML = `
        <img src="${producto.imagen}" alt="${producto.nombre}">
        <div class="card-body">
          <div class="card-title">${producto.nombre}</div>
          <div class="card-price">${producto.precio.toFixed(2)} €</div>
          <div class="card-actions">
            <button class="btn btn--primary" data-id="${producto.id}">Añadir</button>
            <a class="btn btn--ghost" href="producto.html?id=${producto.id}">Ver</a>
          </div>
        </div>
      `;

      // Botón para añadir al carrito
      const btn = card.querySelector('.btn--primary');

      btn.addEventListener('click', () => {
        const key = 'tienda_carrito';

        // Obtener carrito actual del localStorage
        const actual = JSON.parse(localStorage.getItem(key) || '[]');

        // Buscar si el producto ya existe en el carrito
        const encontrado = actual.find(i => i.id === producto.id);

        if (encontrado) {
          // Si existe, solo incrementamos cantidad
          encontrado.cantidad += 1;
          showToast(
            `${producto.nombre} - Cantidad actualizada (${encontrado.cantidad})`,
            'success'
          );

        } else {
          // Si no existe, lo añadimos como nuevo
          actual.push({
            id: producto.id,
            cantidad: 1,
            precio: producto.precio,
            nombre: producto.nombre,
            imagen: producto.imagen
          });

          showToast(`${producto.nombre} añadido al carrito`, 'success');
        }

        // Guardar carrito actualizado
        localStorage.setItem(key, JSON.stringify(actual));
      });

      // Insertar la tarjeta en el contenedor principal
      cont.appendChild(card);
    });
  }
}

/*
  Comentario SOLID:
  - S (Single Responsibility): Este archivo maneja únicamente la vista
    de categorías y su relación con productos.
  
  - D (Dependency Inversion): No conoce la implementación interna de cómo
    se obtiene la tienda, solo usa obtenerTiendaLocal() como abstracción.
  
  - Usa showToast() de utils.js sin acoplarse a su lógica interna.
*/
