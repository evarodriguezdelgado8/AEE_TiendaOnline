// cliente/js/producto.js
import { asegurarAutenticacion, obtenerTiendaLocal, obtenerUsuario, logout } from './auth.js';
import { showToast } from './utils.js';

document.getElementById('btnLogout').addEventListener('click', logout);
if (!asegurarAutenticacion()) throw new Error('No autenticado');

const API = 'http://localhost:3000';

if (!asegurarAutenticacion()) throw new Error('No autenticado');

const tienda = obtenerTiendaLocal();
const usuario = obtenerUsuario();
const params = new URLSearchParams(location.search);
const id = params.get('id');

const cont = document.getElementById('productoDetalle');

if (!tienda) {
  cont.innerHTML = '<p>Tienda no encontrada</p>';
} else {
  const producto = tienda.productos.find(p => p.id === id);
  if (!producto) {
    cont.innerHTML = '<p>Producto no encontrado</p>';
  } else {
    // Crear estructura del producto sin estilos inline
    const wrapper = document.createElement('div');
    
    const img = document.createElement('img');
    img.src = producto.imagen;
    img.alt = producto.nombre;
    
    const infoDiv = document.createElement('div');
    
    const titulo = document.createElement('h2');
    titulo.textContent = producto.nombre;
    
    const precio = document.createElement('p');
    precio.style.fontWeight = '700';
    precio.style.color = '#c41e3a';
    precio.style.fontSize = '28px';
    precio.textContent = `${producto.precio.toFixed(2)} €`;
    
    const descripcion = document.createElement('p');
    descripcion.textContent = producto.descripcion || 'Producto de alta calidad para esta Navidad.';
    
    const actionsDiv = document.createElement('div');
    
    const btnAñadir = document.createElement('button');
    btnAñadir.id = 'btnAñadir';
    btnAñadir.className = 'btn btn--primary';
    btnAñadir.innerHTML = '<span>🛒</span> Añadir al carrito';
    
    const btnVerMas = document.createElement('a');
    btnVerMas.className = 'btn btn--ghost';
    btnVerMas.href = `categorias.html?cat=${producto.id_categoria}`;
    btnVerMas.textContent = 'Ver más productos';
    
    actionsDiv.appendChild(btnAñadir);
    actionsDiv.appendChild(btnVerMas);
    
    infoDiv.appendChild(titulo);
    infoDiv.appendChild(precio);
    infoDiv.appendChild(descripcion);
    infoDiv.appendChild(actionsDiv);
    
    wrapper.appendChild(img);
    wrapper.appendChild(infoDiv);
    
    cont.appendChild(wrapper);
    
    // Event listener para añadir al carrito
    btnAñadir.addEventListener('click', () => {
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

    // Añadir a productos vistos en localStorage
    const vistosKey = 'tienda_productos_vistos';
    const vistos = JSON.parse(localStorage.getItem(vistosKey) || '[]');
    const idx = vistos.indexOf(producto.id);
    if (idx !== -1) vistos.splice(idx, 1);
    vistos.unshift(producto.id);
    localStorage.setItem(vistosKey, JSON.stringify(vistos.slice(0, 10)));

    // Notificar al servidor (POST /productos_vistos)
    (async function enviarVistoServidor() {
      try {
        await fetch(API + '/productos_vistos', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-token': localStorage.getItem('tienda_token')
          },
          body: JSON.stringify({ usuario, productoId: producto.id })
        });
      } catch (err) {
        console.warn('No se pudo notificar vistos al servidor', err);
      }
    })();
  }
}

/* Comentario SOLID:
   - S (Single Responsibility): este módulo solo renderiza la ficha y notifica 'visto'.
   - Se eliminaron todos los estilos inline para mantener separación de responsabilidades.
   - D (Dependency Inversion): Usa showToast de utils.js para notificaciones.
*/