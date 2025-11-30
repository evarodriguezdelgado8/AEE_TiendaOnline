// cliente/js/carrito.js
// ======================================================
//      Gestión del carrito de compras (Frontend)
// ======================================================

// Importamos funciones relacionadas con autenticación,
// utilidades y logout desde los módulos correspondientes.
import { asegurarAutenticacion, obtenerTiendaLocal, obtenerUsuario, logout } from './auth.js';
import { showToast } from './utils.js';

// Botón de cierre de sesión
document.getElementById('btnLogout').addEventListener('click', logout);

// Antes de cargar la página del carrito, verificamos si el usuario está autenticado
if (!asegurarAutenticacion()) throw new Error('No autenticado');

// URL base de la API backend
const API = 'http://localhost:3000';

// Contenedor donde se mostrará el carrito
const cont = document.getElementById('carritoCont');

// Clave donde se almacenan los productos del carrito en LocalStorage
const key = 'tienda_carrito';

/**
 * Renderiza el carrito en pantalla.
 * Cada vez que se añade, elimina o compra un producto, se vuelve a ejecutar.
 */
function render() {
  const cart = JSON.parse(localStorage.getItem(key) || '[]');

  // Limpiar el contenedor para volver a construir el HTML
  cont.innerHTML = '';
  
  // Si no hay productos, mostramos mensaje vacío
  if (cart.length === 0) {
    const emptyMsg = document.createElement('p');
    emptyMsg.textContent = '🛒 El carrito está vacío';
    cont.appendChild(emptyMsg);
    return;
  }
  
  // Creamos la tabla donde se verán los productos
  const table = document.createElement('table');
  table.className = 'table';
  
  // Encabezados de la tabla
  const thead = document.createElement('thead');
  const headerRow = document.createElement('tr');
  
  const headers = ['Producto', 'Cantidad', 'Precio', 'Total', ''];
  headers.forEach(headerText => {
    const th = document.createElement('th');
    th.textContent = headerText;
    headerRow.appendChild(th);
  });
  
  thead.appendChild(headerRow);
  table.appendChild(thead);
  
  const tbody = document.createElement('tbody');
  let total = 0;
  
  // Recorremos el carrito para generar filas
  cart.forEach((item, idx) => {
    const subtotal = item.cantidad * item.precio;
    total += subtotal;
    
    const tr = document.createElement('tr');
    
    // ---- Columna producto + imagen ----
    const tdProducto = document.createElement('td');
    const img = document.createElement('img');
    img.src = item.imagen;
    img.alt = item.nombre;
    tdProducto.appendChild(img);
    
    const nombreSpan = document.createElement('span');
    nombreSpan.textContent = item.nombre;
    tdProducto.appendChild(nombreSpan);
    
    // ---- Columna cantidad ----
    const tdCantidad = document.createElement('td');
    tdCantidad.textContent = item.cantidad;
    
    // ---- Columna precio unitario ----
    const tdPrecio = document.createElement('td');
    tdPrecio.textContent = `${item.precio.toFixed(2)} €`;
    
    // ---- Columna subtotal ----
    const tdTotal = document.createElement('td');
    tdTotal.textContent = `${subtotal.toFixed(2)} €`;
    
    // ---- Columna eliminar producto ----
    const tdAccion = document.createElement('td');
    const btnRemove = document.createElement('button');
    btnRemove.className = 'btn btn--ghost btn-remove';
    btnRemove.textContent = 'Eliminar';

    // Cuando se elimina un producto, se quita del array y se vuelve a renderizar
    btnRemove.addEventListener('click', () => {
      const arr = JSON.parse(localStorage.getItem(key) || '[]');
      arr.splice(idx, 1);
      localStorage.setItem(key, JSON.stringify(arr));
      showToast('Producto eliminado del carrito', 'info');
      render();
    });

    tdAccion.appendChild(btnRemove);
    
    // Añadimos columnas a su fila
    tr.appendChild(tdProducto);
    tr.appendChild(tdCantidad);
    tr.appendChild(tdPrecio);
    tr.appendChild(tdTotal);
    tr.appendChild(tdAccion);
    
    // Añadimos fila al cuerpo de la tabla
    tbody.appendChild(tr);
  });
  
  table.appendChild(tbody);
  cont.appendChild(table);
  
  // Mostramos el total debajo de la tabla
  const totalP = document.createElement('p');
  totalP.textContent = `Total: ${total.toFixed(2)} €`;
  cont.appendChild(totalP);
}

// ======================================================
//        Eventos: Vaciar carrito / Finalizar compra
// ======================================================

// Botón "Vaciar carrito"
document.getElementById('btnVaciar').addEventListener('click', () => {
  const cart = JSON.parse(localStorage.getItem(key) || '[]');
  
  if (cart.length === 0) {
    showToast('El carrito ya está vacío', 'info');
    return;
  }
  
  if (!confirm('¿Vaciar el carrito?')) return;
  
  localStorage.removeItem(key);
  showToast('Carrito vaciado', 'success');
  render();
});

// Botón "Comprar"
document.getElementById('btnComprar').addEventListener('click', async () => {
  const cart = JSON.parse(localStorage.getItem(key) || '[]');

  if (cart.length === 0) {
    showToast('El carrito está vacío', 'error');
    return;
  }
  
  try {
    // Token necesario para validar compra
    const token = localStorage.getItem('tienda_token');

    // Enviamos el carrito al backend para validaciones y "compra simulada"
    const res = await fetch(API + '/carrito', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-token': token // Token personalizado
      },
      body: JSON.stringify({ carrito: cart })
    });

    const data = await res.json();
    
    // Si hay errores en la respuesta del servidor → Mostrar en Toast
    if (!res.ok) {
      console.error(data);
      let msg = 'Error validando carrito: ';
      
      if (data.errores) {
        // Si el backend devuelve errores por producto
        msg += data.errores.map(e => 
          `${e.nombre || e.id}: ${e.error}`
        ).join(', ');
      } else {
        msg += data.error || 'Error desconocido';
      }
      
      showToast(msg, 'error', 5000);
      return;
    }
    
    // Compra validada correctamente
    localStorage.removeItem(key);
    showToast('¡Compra realizada con éxito! Gracias por tu compra 🎉', 'success', 4000);
    render();
    
  } catch (err) {
    console.error(err);
    showToast('Error al conectar con el servidor', 'error');
  }
});

// Render inicial al cargar la página
render();

/*
  Comentario SOLID:
  - S (Single Responsibility): Este módulo solo gestiona y muestra el carrito.
  - I (Interface Segregation): No mezcla otras funcionalidades (login, productos…).
  - D (Dependency Inversion): Depende de funciones externas como showToast,
    pero no conoce su implementación interna.
*/
