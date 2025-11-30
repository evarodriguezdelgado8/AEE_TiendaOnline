// cliente/js/categorias.js
import { asegurarAutenticacion, obtenerTiendaLocal, obtenerUsuario, logout } from './auth.js';
import { showToast } from './utils.js';

document.getElementById('btnLogout').addEventListener('click', logout);
if (!asegurarAutenticacion()) throw new Error('No autenticado');

const tienda = obtenerTiendaLocal();
const params = new URLSearchParams(location.search);
const catId = Number(params.get('cat')) || null;

const titulo = document.getElementById('tituloCategoria');
const cont = document.getElementById('productosCategoria');
const categoriasUl = document.getElementById('listaCategorias');

if (!tienda) {
  titulo.textContent = 'Tienda no disponible';
} else {
  // Cargar TODAS las categorías en el sidebar
  tienda.categorias.forEach(cat => {
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href = `categorias.html?cat=${encodeURIComponent(cat.id)}`;
    a.textContent = cat.nombre;
    
    // Marcar como activa la categoría actual
    if (cat.id === catId) {
      a.classList.add('active');
    }
    
    li.appendChild(a);
    categoriasUl.appendChild(li);
  });

  // Mostrar productos de la categoría seleccionada
  const categoria = tienda.categorias.find(c => c.id === catId) || tienda.categorias[0];
  titulo.textContent = `Categoría: ${categoria.nombre}`;

  const productos = tienda.productos.filter(p => p.id_categoria === categoria.id);
  
  if (productos.length === 0) {
    const mensaje = document.createElement('p');
    mensaje.textContent = 'No hay productos en esta categoría';
    mensaje.style.textAlign = 'center';
    mensaje.style.padding = '40px';
    mensaje.style.color = '#2d5f3f';
    cont.appendChild(mensaje);
  } else {
    productos.forEach(producto => {
      const card = document.createElement('div');
      card.className = 'card';
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
      
      const btn = card.querySelector('.btn--primary');
      btn.addEventListener('click', () => {
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
      });
      
      cont.appendChild(card);
    });
  }
}

/* Comentario SOLID:
   - D (Dependency Inversion): este módulo no depende de detalles externos para renderizar productos, 
     toma la tienda desde localStorage a través de la abstracción en auth.js
   - S (Single Responsibility): Solo se encarga de mostrar categorías y productos
   - Usa showToast de utils.js para notificaciones
*/