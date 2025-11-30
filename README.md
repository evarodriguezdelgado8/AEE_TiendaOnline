🎄 Tienda de Navidad - Proyecto DWEC (RA4)

Este proyecto es una Single Page Application (SPA) simulada con arquitectura Offline-First, desarrollada con Node.js en el backend y JavaScript Vanilla en el frontend.

🚀 Características Principales

Arquitectura Offline-First:

Al hacer login, el servidor envía toda la información de la tienda (productos y categorías).

El cliente guarda estos datos en localStorage.

La navegación (Dashboard, Categorías, Detalles) es instantánea y no requiere peticiones al servidor.

Seguridad Anti-Fraude:

Validación de Precios: Aunque el cliente manipule el precio en el localStorage, el servidor recalcula el total basándose en su propia base de datos (tienda.json) antes de aceptar el pedido.

Token de Sesión: Todas las peticiones críticas (/carrito, /productos_vistos) están protegidas por un middleware que verifica el token.

Principios SOLID:

El código está modularizado para cumplir con la Responsabilidad Única (SRP) y la Inversión de Dependencias (DIP).

🛠️ Instalación y Ejecución

Instalar dependencias:

npm install


(Requiere express, cors, body-parser)

Iniciar el servidor:

node server.js


Acceso:

Abrir http://localhost:3000 en el navegador.

Usuario Demo: eva / Contraseña: 1234.

📂 Estructura del Proyecto

/backend: Contiene la lógica del servidor y los datos JSON ("Fuente de la verdad").

/frontend: Cliente web.

auth.js: Gestión centralizada de sesión (LocalStorage).

utils.js: Funciones auxiliares (DRY).

*.js: Lógica específica de cada vista.

🛡️ Principios SOLID Aplicados

S (Single Responsibility): Cada archivo JS tiene una única responsabilidad (ej: login.js solo gestiona el acceso, carrito.js solo la compra).

O (Open/Closed): Las funciones de renderizado están diseñadas para aceptar nuevos productos sin modificar el código fuente, solo el JSON.

D (Dependency Inversion): Los módulos de alto nivel (vistas) no dependen de implementaciones de bajo nivel (como alert), sino de abstracciones como showToast en utils.js.

Desarrollado para el módulo de Desarrollo Web en Entorno Cliente.
