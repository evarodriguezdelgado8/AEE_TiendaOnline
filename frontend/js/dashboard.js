// cliente/js/dashboard.js
// ============================================================
//                       Página de Dashboard
//      Muestra productos destacados, recomendados y vistos
//      recientemente, además del listado de categorías.
// ============================================================

// Importamos utilidades del sistema de autenticación y helpers
import { asegurarAutenticacion, obtenerTiendaLocal, obtenerUsuario, logout } from './auth.js';
import { showToast } from './utils.js';

// URL base del API (para futuras ampliaciones)
const API = 'http://localhost:3000';

// Botón de cerrar sesión
document.getElementById('btnLogout').addEventListener('click', logout);

// Verificar que el usuario tenga sesión activa
if (!asegurarAutenticacion()) throw new Error('No autenticado');

// Cargar tienda en caché local y datos del usuario
const tienda = obtenerTiendaLocal();
const usuario = obtenerUsuario();

// ============================================================
//              Crear tarjeta HTML de un producto
// ============================================================
function crearCard(producto) {
  const div = document.createElement('div');
  div.className = 'card';

  // Estructura visual de la tarjeta
  div.innerHTML = `
    <img src="${producto.imagen}" alt="${producto.nombre}">
    <div class="card-body">
      ${producto.destacado ? '<div class="label-destacado">DESTACADO</div>' : ''}
      <div class="card-title">${producto.nombre}</div>
      <div class="card-price">${producto.precio.toFixed(2)} €</div>
      <div class="card-actions">
        <button class="btn btn--primary" data-id="${producto.id}">Añadir</button>
        <a class="btn btn--ghost" href="producto.html?id=${producto.id}">Ver</a>
      </div>
    </div>
  `;

  // Acción del botón "Añadir"
  const btn = div.querySelector('.btn--primary');
  btn.addEventListener('click', () => {
    añadirAlCarrito(producto);
  });

  return div;
}

// ============================================================
//                Añadir un producto al carrito
// ============================================================
function añadirAlCarrito(producto) {
  const key = 'tienda_carrito';

  // Obtener carrito desde localStorage
  const actual = JSON.parse(localStorage.getItem(key) || '[]');

  // Comprobar si ya existe
  const encontrado = actual.find(i => i.id === producto.id);

  if (encontrado) {
    // Si existe → incrementar cantidad
    encontrado.cantidad += 1;
    showToast(
      `${producto.nombre} - Cantidad actualizada (${encontrado.cantidad})`,
      'success'
    );

  } else {
    // Si no existe → añadir como nuevo
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
}

// ============================================================
//   Cargar áreas del dashboard: destacados, recomendados,
//   categorías y productos vistos recientemente
// ============================================================
const destacadosDiv = document.getElementById('destacados');
const recomendadosDiv = document.getElementById('recomendados');
const categoriasUl = document.getElementById('listaCategorias');

if (tienda) {

  // ------------------------------------------------------------
  //                     Productos destacados
  // ------------------------------------------------------------
  const destacados = tienda.productos.filter(p => p.destacado);
  destacados.forEach(p => destacadosDiv.appendChild(crearCard(p)));

  // ------------------------------------------------------------
  //                     Productos recomendados
  // ------------------------------------------------------------
  const recomendados = tienda.productos.filter(p => p.recomendado);
  recomendados.forEach(p => recomendadosDiv.appendChild(crearCard(p)));

  // ------------------------------------------------------------
  //              Listado lateral de categorías
  // ------------------------------------------------------------
  tienda.categorias.forEach(cat => {
    const li = document.createElement('li');
    const a = document.createElement('a');

    // Enlace a categorías.html con parámetro ?cat=ID
    a.href = `categorias.html?cat=${encodeURIComponent(cat.id)}`;
    a.textContent = cat.nombre;

    li.appendChild(a);
    categoriasUl.appendChild(li);
  });
}

// ============================================================
//       Mostrar productos vistos recientemente (localStorage)
// ============================================================
(function mostrarVistosLocal() {
  const vistos = JSON.parse(localStorage.getItem('tienda_productos_vistos') || '[]');
  if (vistos.length === 0) return;

  const cont = document.createElement('div');
  cont.innerHTML = '<h3>Vistos recientemente</h3>';

  const grid = document.createElement('div');
  grid.className = 'grid';

  vistos.forEach(id => {
    const prod = tienda.productos.find(p => p.id === id);
    if (prod) grid.appendChild(crearCard(prod));
  });

  cont.appendChild(grid);
  document.querySelector('main').prepend(cont);
})();

/*
  Comentario SOLID:
  - S (Single Responsibility): Este archivo gestiona únicamente la vista del
    dashboard y la interacción con el carrito.
  
  - O (Open/Closed): Las funciones están pensadas para ampliarse sin modificar
    la lógica principal, por ejemplo, integrando más secciones del dashboard.
  
  - D (Dependency Inversion): Usa showToast() y los métodos de auth.js sin
    depender de su implementación interna.
*/
