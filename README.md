# Tema 7 — Préstamo de equipos de laboratorio

## Avance: etapa 4 · HU-1 a HU-4 — Entrega 1

Esta etapa contiene las historias HU-1 a HU-4. Después se agregan la HU-5
(devoluciones, etapa 5), la HU-6 (reserva anticipada, etapa 6) y la HU-7
(métricas y usuarios, versión final).

En esta entrega los datos viven en el front: `src/data/seed.json` se copia a
`localStorage` la primera vez. Para volver a los datos iniciales, en la consola
del navegador: `localStorage.removeItem('almacen.db.v6')`.

**Sesión.** El inicio de sesión lo valida el servidor (`POST /login`) contra la
lista de cuentas de `website/repositories.js`, a la que también se agregan las
cuentas registradas desde la app (`POST /api/v1/usuarios`, en memoria mientras
el servidor esté encendido).
Cada página recibe el usuario de la sesión en `window.USER` (sin contraseña) y
`/student/*` y `/manager/*` están protegidas con `soloStudent` y `soloManager`.

### Cómo ejecutar

    npm install
    npm run build
    node server.js        # http://localhost:3000  (redirige a /public)

### Usuarios de prueba (contraseña `123`)

Son los usuarios de `src/data/seed.json`: `website/repositories.js` los lee de
ahí al arrancar el servidor (si se cambian, hay que reiniciarlo). Las cuentas
creadas con "Crear cuenta" se agregan en memoria. Todos los correos terminan en
`@aloe.ulima.edu.pe`. Al 5.º intento fallido el ingreso se bloquea 15 minutos.

| Correo | Rol | Nombre | Caso |
|---|---|---|---|
| vccahuana@aloe.ulima.edu.pe | estudiante | Valeria Ccahuana Pino | Con deuda S/ 15.00 |
| mchavez@aloe.ulima.edu.pe | estudiante | Mateo Chávez Ríos |  |
| dcornejo@aloe.ulima.edu.pe | estudiante | Daniela Cornejo Saavedra | Con deuda S/ 20.00, sin préstamos en curso |
| mdelgado@aloe.ulima.edu.pe | estudiante | Mariana Delgado Ríos |  |
| bloqueado@aloe.ulima.edu.pe | estudiante | Alejandra Huamán Solís | Cuenta bloqueada con deuda S/ 60.00 |
| floayza@aloe.ulima.edu.pe | estudiante | Fabiana Loayza Ramos |  |
| rmendoza@aloe.ulima.edu.pe | estudiante | Renzo Andrés Mendoza Cárdenas | Sus solicitudes y préstamos aparecen en HU-3 y HU-4 |
| gnunez@aloe.ulima.edu.pe | estudiante | Gabriel Núñez Herrera | Sin ningún préstamo |
| lparedes@aloe.ulima.edu.pe | estudiante | Lucía Paredes Ynga |  |
| estudiante@aloe.ulima.edu.pe | estudiante | Ana María Pérez Hernández |  |
| cquispe@aloe.ulima.edu.pe | estudiante | Camila Quispe Andrade | Con deuda S/ 45.00 (PRE-2026-0291 vencido) |
| srojas@aloe.ulima.edu.pe | estudiante | Sebastián Rojas Ynga |  |
| dsalcedo@aloe.ulima.edu.pe | estudiante | Diego Salcedo Vera |  |
| jtorres@aloe.ulima.edu.pe | estudiante | Joaquín Torres Lima |  |
| avillanueva@aloe.ulima.edu.pe | estudiante | Andrés Villanueva Paz |  |
| jparedes@aloe.ulima.edu.pe | encargado | Jorge Luis Paredes Soto | Pendiente de aprobación: no puede iniciar sesión |
| encargado@aloe.ulima.edu.pe | encargado | Elena Sofía Rivas Talledo | Almacén H-102 |

### Rutas

| Ruta | Vista |
|---|---|
| /public | Landing (1.1) |
| /public/login · /public/register · /public/register-manager · /public/recover-password | HU-1 |
| /public/equipos/:id | Ficha pública del equipo (2.6) |
| /student/cuenta · /manager/cuenta | Mi cuenta (1.6) |
| /manager/inventario | Inventario (2.1) |
| /manager/inventario/nuevo · /manager/inventario/:id/editar | Nuevo / editar equipo (2.2) |
| /manager/inventario/:id | Unidades, condiciones e historial (2.3–2.5) |
| /public/catalogo · /student/catalogo | Catálogo (3.1) |
| /student/equipos/:id · /student/solicitar/:id · /student/solicitudes | Detalle, solicitud y mis solicitudes (3.2–3.4) |
| /manager/solicitudes · /manager/solicitudes/:codigo/entrega | Bandeja y registro de entrega (4.1–4.4) |
| /manager/prestamos · /manager/vencidos · /manager/prestamos/:codigo/constancia | Préstamos vigentes y constancia (4.5–4.6) |
| /student/prestamos/:codigo/constancia | Constancia vista por el estudiante (4.5) |

**Todos los datos están en `src/data/seed.json`** (ya no hay `demoData.js`).
Cada historia los lee con su servicio de `src/services/`: `catalogService` y
`requestService` (HU-3) y `loansService` (HU-4). Las vistas de HU-4 todavía
solo muestran los datos: aprobar o entregar aún no los modifica.

### Capas del front

    src/data/seed.json        datos semilla (contrato en docs/contrato-datos.md)
    src/services/             acceso a datos (en la Entrega 2 se cambian por fetch a la API)
    src/context/              estado global con Context: Auth, Inventory, Toast
    src/components/           componentes comunes: layouts, badges, modal, paginación, RequireRole
    src/pages/                vistas (no acceden a datos directamente, usan los contextos)
    public/assets/css/app.css sistema de diseño compartido

---

# Estructura del proyecto

Se partió de la plantilla del curso (React + Vite en el front, Node.js + Express
en el servidor) y se quitaron los ejemplos que no pertenecen al Tema 7.
Igual que en la plantilla (`admin/` para lo restringido y `website/` para lo
público), el servidor tiene **una carpeta por tipo de usuario**:

| Carpeta | Quién entra | Rutas |
|---|---|---|
| `website/` | Público general, sin sesión | `/public`, `/public/login`, `/public/catalogo`… · `POST /login`, `/logout-project`, `POST /api/v1/usuarios`, `/api/v1/sessions` |
| `student/` | Solo rol estudiante (`soloStudent`) | `/student`, `/student/catalogo`, `/student/solicitudes`… |
| `manager/` | Solo rol encargado (`soloManager`) | `/manager/inventario`, `/manager/solicitudes`, `/manager/prestamos`… |

Cada ruta de las apps React está registrada **una por una** en el `routes.js`
de su carpeta (sin comodines), agrupada por historia. Al agregar una página
nueva en React hay que agregar también su ruta ahí; si no, el servidor
responde 404.

Cada una sigue las mismas capas: `routes.js → controllers.js → services.js →
repositories.js` (+ `apis.js` y `models.js`). En la Entrega 1 solo se usan
rutas y controladores (más el repositorio de cuentas de `website/`); el resto
queda preparado para la Entrega 2.

> El público no va en `public/` porque esa carpeta la sirve Express tal cual al
> navegador: todo lo que se ponga ahí se puede descargar.

| Carpeta | Descripción |
|---|---|
| `src/` | App React: una entrada por rol (`entries/public`, `student`, `manager`), páginas por historia (`pages/`), contextos, servicios y datos semilla. |
| `views/` | Plantillas EJS: `public/`, `student/` y `manager/` cargan su app React; `403` y `404` son las páginas de error del servidor. |
| `configs/` | Arranque de Express (`bootstrap.js`), middlewares de protección por rol, helpers y conexión a la base de datos. |
| `public/` | Archivos estáticos: `assets/css` (sistema de diseño y errores), `favicon.ico` y `dist/` (lo genera `npm run build`). |
| `api/` | Entrada para Vercel (la misma app de `server.js`, exportada). |
| `db/` | Migraciones de dbmate. Aún son las de la plantilla; en la Entrega 2 se reemplazan por las del Tema 7. |
| `docs/` | Contrato de datos del grupo. |
| `server.js` | Arranque local en el puerto 3000. |

## Comandos GIT

Descargar GIT del [enlace](https://git-scm.com/install/windows)

Crear proyecto GIT

    > git init

Loguearse

    > git config --global user.name "Tu Nombre"
    > git config --global user.email "tu@email.com"

Crear rama

    > git checkout -b feature/prueba

Ver ramas

    > git branch

Cambiar rama

    > git checkout #nombre_rama

Despliegue en Vercel

    npm install -g vercel
    vercel login
    vercel --prod
