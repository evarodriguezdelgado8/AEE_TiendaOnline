// ============================================================
//                          SERVIDOR API
//      Backend para la tienda de Navidad (Node + Express)
//      Gestiona login, validación de carrito y productos vistos.
// ============================================================

const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();

// ============================================================
//                     MIDDLEWARES GLOBALES
// ============================================================
app.use(cors());
app.use(bodyParser.json());

// ------------------------------------------------------------
//      Servir archivos estáticos del frontend
// ------------------------------------------------------------
const frontendPath = path.join(__dirname, 'frontend');
app.use(express.static(frontendPath));


// ============================================================
//                 RUTAS A ARCHIVOS JSON DEL BACKEND
// ============================================================
const usuariosPath = path.join(__dirname, "backend", "data", "usuarios.json");
const tiendaPath   = path.join(__dirname, "backend", "data", "tienda.json");

// Función para leer JSON desde disco
function leerJSON(ruta) {
  return JSON.parse(fs.readFileSync(ruta, 'utf8'));
}

// Cargar datos iniciales
let usuarios = leerJSON(usuariosPath);
let tienda   = leerJSON(tiendaPath);


// ============================================================
//                           TOKEN
// ============================================================
// Para esta práctica el token es fijo, sin generación dinámica.
const TOKEN_PRIVADO = 'token_privado_tienda_navidad_2025';

// Mapa temporal en memoria para registrar productos vistos
const productosVistosPorUsuario = {};


// ============================================================
//              MIDDLEWARE → Validar token recibido
// ============================================================
function validarToken(req, res, next) {
  const token =
    req.headers['x-token'] ||
    (req.headers['authorization'] && req.headers['authorization'].split(' ')[1]);

  if (!token || token !== TOKEN_PRIVADO) {
    return res.status(401).json({ error: 'Token inválido o no enviado' });
  }

  next();
}


// ============================================================
//                     RUTA → POST /login
// ============================================================
// Recibe usuario/contraseña → valida → devuelve token y tienda
app.post('/login', (req, res) => {
  const { usuario, password } = req.body || {};

  // Validar campos mínimos
  if (!usuario || !password) {
    return res.status(400).json({ error: 'Faltan credenciales' });
  }

  // Buscar usuario en el JSON
  const encontrado = usuarios.find(
    u => u.usuario === usuario && u.password === password
  );

  if (!encontrado) {
    return res.status(401).json({ error: 'Credenciales incorrectas' });
  }

  // Devolver token y datos de la tienda
  res.json({
    token: TOKEN_PRIVADO,
    tienda
  });
});


// ============================================================
//                 RUTA → POST /carrito
//                 Valida precios del cliente
// ============================================================
app.post('/carrito', validarToken, (req, res) => {
  const { carrito } = req.body || {};

  // Comprobar que llega un array válido
  if (!Array.isArray(carrito)) {
    return res.status(400).json({ error: 'Carrito inválido' });
  }

  const productos = tienda.productos || [];
  const errores = [];

  // Validación individual de cada producto del carrito
  carrito.forEach(item => {
    const prod = productos.find(p => p.id === item.id);

    if (!prod) {
      errores.push({ id: item.id, error: 'Producto no existe' });
      return;
    }

    // Comparar precios para evitar manipulación
    if (Number(prod.precio) !== Number(item.precio)) {
      errores.push({
        id: item.id,
        nombre: prod.nombre,
        precioServidor: prod.precio,
        precioCliente: item.precio,
        error: 'Precio manipulado'
      });
    }
  });

  // Si hay errores → rechazamos el pedido
  if (errores.length > 0) {
    return res.status(400).json({ ok: false, errores });
  }

  // Pedido correcto
  return res.json({ ok: true, mensaje: 'Pedido validado y aceptado' });
});


// ============================================================
//           RUTA → POST /productos_vistos
//           Registra un producto que un usuario ha visto
// ============================================================
app.post('/productos_vistos', validarToken, (req, res) => {
  const { usuario, productoId } = req.body || {};

  // Validación mínima
  if (!usuario || !productoId) {
    return res.status(400).json({ error: 'Falta usuario o productoId' });
  }

  // Crear array si no existe
  if (!productosVistosPorUsuario[usuario]) {
    productosVistosPorUsuario[usuario] = [];
  }

  const arr = productosVistosPorUsuario[usuario];

  // Mover al principio si ya existía
  const idx = arr.indexOf(productoId);
  if (idx !== -1) arr.splice(idx, 1);

  arr.unshift(productoId);

  // Guardar solo últimos 10 vistos
  productosVistosPorUsuario[usuario] = arr.slice(0, 10);

  res.json({ ok: true, vistos: productosVistosPorUsuario[usuario] });
});


// ============================================================
//          RUTA → GET /productos_vistos?usuario=...
//          Devuelve productos vistos completos
// ============================================================
app.get('/productos_vistos', validarToken, (req, res) => {
  const usuario = req.query.usuario;

  if (!usuario) {
    return res.status(400).json({ error: 'Falta usuario' });
  }

  const idsVistos = productosVistosPorUsuario[usuario] || [];

  // Filtrar productos reales
  const productos = tienda.productos.filter(p => idsVistos.includes(p.id));

  res.json({ ok: true, vistos: productos });
});


// ============================================================
//                    Redirección raíz al login
// ============================================================
app.get("/", (req, res) => {
  res.redirect("/login.html");
});


// ============================================================
//                     INICIO DEL SERVIDOR
// ============================================================
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor API ejecutándose en http://localhost:${PORT}`);
});
