// cliente/js/producto.js
// ============================================================
//                     Página de Detalle de Producto
//  Muestra información completa de un producto, permite añadirlo
//  al carrito y registra la visita tanto en localStorage como en
//  el servidor.
// ============================================================

import { asegurarAutenticacion, obtenerTiendaLocal, obtenerUsuario, logout } from './auth.js';
import { showToast } from './utils.js';

// Botón de cerrar sesión
document.getElementById('btnLogout').addEventListener('click', logout);

// Verificar autenticación
if (!asegurarAutenticacion()) throw new Error('No autenticado');

// URL base del servidor
const API = 'http://localhost:3000';

// Obtenemos datos del sistema
const tienda = obtenerTiendaLocal();
const usuario = obtenerUsuario();

// Parámetro ?id de la URL
const params = new URLSearchParams(location.search);
const id = params.get('id');

// Contenedor donde se renderiza el producto
const cont = document.getElementById('productoDetalle');

// ============================================================
//            Validación inicial: tienda y producto
// ============================================================
if (!tienda) {
  cont.innerHTML = '<p>Tienda no encontrada</p>';

} else {

  const producto = tienda.productos.find(p => p.id === id);

  if (!producto) {
    cont.innerHTML = '<p>Producto no encontrado</p>';
  } else {

    // ============================================================
    //          Construcción visual del detalle del producto
    // ============================================================

    const wrapper = document.createElement('div');

    const img = document.createElement('img');
    img.src = producto.imagen;
    img.alt = producto.nombre;

    const infoDiv = document.createElement('div');

    const titulo = document.createElement('h2');
    titulo.textContent = producto.nombre;

    const precio = document.createElement('p');
    precio.textContent = `${producto.precio.toFixed(2)} €`;
    precio.className = 'producto-precio';  // estilos definidos en CSS

    const descripcion = document.createElement('p');
    descripcion.textContent =
      producto.descripcion || 'Producto de alta calidad para esta Navidad.';

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

    // ============================================================
    //           Añadir producto al carrito (localStorage)
    // ============================================================
    btnAñadir.addEventListener('click', () => {
      const key = 'tienda_carrito';
      const actual = JSON.parse(localStorage.getItem(key) || '[]');

      const encontrado = actual.find(i => i.id === producto.id);

      if (encontrado) {
        encontrado.cantidad += 1;
        showToast(
          `${producto.nombre} - Cantidad actualizada (${encontrado.cantidad})`,
          'success'
        );
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

    // ============================================================
    //        Registrar producto como "visto" en localStorage
    // ============================================================
    const vistosKey = 'tienda_productos_vistos';
    const vistos = JSON.parse(localStorage.getItem(vistosKey) || '[]');

    // Evitar duplicados, mover al inicio
    const idx = vistos.indexOf(producto.id);
    if (idx !== -1) vistos.splice(idx, 1);
    vistos.unshift(producto.id);

    // Guardar máx. 10 productos recientes
    localStorage.setItem(vistosKey, JSON.stringify(vistos.slice(0, 10)));

    // ============================================================
    //          Notificar al servidor que se vio el producto
    // ============================================================
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

/*
  Comentario SOLID:
  - S (Single Responsibility):
    Este módulo se encarga únicamente de renderizar la ficha del producto,
    añadirlo al carrito y registrar la visualización.

  - Se eliminaron estilos inline para mantener separación entre lógica y presentación.

  - D (Dependency Inversion):
    showToast() y los métodos de autenticación se utilizan sin depender
    de su implementación interna.
*/
