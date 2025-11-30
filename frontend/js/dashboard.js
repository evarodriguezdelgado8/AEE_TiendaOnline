// cliente/js/dashboard.js
import { asegurarAutenticacion, obtenerTiendaLocal, obtenerUsuario, logout } from './auth.js';
import { showToast } from './utils.js';

const API = 'http://localhost:3000';
document.getElementById('btnLogout').addEventListener('click', logout);

if (!asegurarAutenticacion()) throw new Error('No autenticado');

const tienda = obtenerTiendaLocal();
const usuario = obtenerUsuario();

function crearCard(producto) {
  const div = document.createElement('div');
  div.className = 'card';
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
  const btn = div.querySelector('.btn--primary');
  btn.addEventListener('click', () => {
    añadirAlCarrito(producto);
  });
  return div;
}

function añadirAlCarrito(producto) {
  const key = 'tienda_carrito';
  const actual = JSON.parse(localStorage.getItem(key) || '[]');
  const encontrado = actual.find(i => i.id === producto.id);
  
  if (encontrado) {
    encontrado.cantidad += 1;
    showToast(`${producto.nombre} - Cantidad actualizada (${encontrado.cantidad})`, 'success');
  } else {
    actual.push({ 
      id: producto.id, 
      cantidad: 1, 
      precio: producto.precio, 
      nombre: producto.nombre, 
      imagen: producto.imagen 
    });
    showToast(`${producto.nombre} añadido al carrito`, 'success');
  }
  
  localStorage.setItem(key, JSON.stringify(actual));
}

// cargar destacados y recomendados
const destacadosDiv = document.getElementById('destacados');
const recomendadosDiv = document.getElementById('recomendados');
const categoriasUl = document.getElementById('listaCategorias');

if (tienda) {
  const destacados = tienda.productos.filter(p => p.destacado);
  destacados.forEach(p => destacadosDiv.appendChild(crearCard(p)));

  // Cargar recomendados
  // Filtramos explícitamente los que tienen recomendado: true
  const recomendados = tienda.productos.filter(p => p.recomendado);
  
  recomendados.forEach(p => recomendadosDiv.appendChild(crearCard(p)));

  tienda.categorias.forEach(cat => {
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href = `categorias.html?cat=${encodeURIComponent(cat.id)}`;
    a.textContent = cat.nombre;
    li.appendChild(a);
    categoriasUl.appendChild(li);
  });
}

// mostrar también productos vistos recientemente (desde localStorage)
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

/* Comentarios SOLID:
  - S (Single Responsibility): dashboard.js solo renderiza dashboard y gestiona añadir al carrito.
  - O (Open/Closed): las funciones están escritas para extender sin modificar la lógica base.
  - D (Dependency Inversion): Usa showToast de utils.js en lugar de alert() directamente.
*/