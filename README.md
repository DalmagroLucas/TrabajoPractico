GENX — Reseñas de videojuegos

Web donde los usuarios se registran, inician sesión y publican reseñas de juegos con imagen, calificación y comentarios. No hay base de datos: todo se guarda en el `localStorage` del navegador.

>El proyecto tiene que abrirse SIEMPRE con Live Server**, si no los juegos del JSON no aparecen.

1. Herramientas

HTML (estructura) ·
CSS (diseño y modo claro/oscuro) ·
JavaScript (toda la lógica) ·
JSON (datos precargados) ·
localStorage (todos los datos) .

No hay nada que instalar. No usa librerías.

2. Estructura de carpetas

TrabajoPractico-main/
├── app.js        <- Todo el JavaScript
├── style.css     <- Todo el CSS
├── README.md
├── Img/          <- Fotos de los juegos
├── Json/
│   ├── juegos.json    <- Los juegos (nombre, descripción, imagen)
│   ├── tags.json      <- Los tags (géneros)
│   └── usuarios.json  <- Los usuarios de prueba
└── Pages/        <- TODOS los .html van acá
    ├── inicio.html            ├── formulario.html
    ├── inicio_sesion.html     ├── resenaindividual.html
    ├── crear_usuario.html     ├── resenas.html
    └── perfil.html



3. Cómo abrir el proyecto

La página de Inicio lee `Json/juegos.json` con `fetch()`. Los navegadores bloquean `fetch()` si abrís el archivo con doble clic, y la página queda vacía.

Solución: usar Live Server de VS Code.

1. Abrí la carpeta `TrabajoPractico-main` en VS Code.
2. Instalá la extensión Live Server.
3. En el explorador, entrá a Pages.
4. ClicK derecho sobre `inicio.html` → Open with Live Server.


4. Páginas

| Qué hace |
|
| `inicio.html` | Catálogo de juegos. click en un juego → abre el formulario con el juego. 
| `resenas.html` | Todas las reseñas + filtros por texto, juego, tag y calificación. |
| `resena_individual.html` | Una reseña con su hilo de comentarios. |
| `formulario.html` | Publicar reseña. Requiere sesión iniciada. |
| `tus_resenas.html` | Tus reseñas, con opción de borrarlas o editarlas. |
| `inicio_sesion.html` | Iniciar sesión. |
| `crear_usuario.html` | Registrarse (inicia sesión al instante). |

---

5. Usuarios de prueba

Vienen en `Json/usuarios.json`:

| Usuario | Contraseña |
| `gamer123` | `Clave1234` |
| `pixelArt` | `Zelda2026` |
| `reviewerX` | `MasterPass1` |


6. Cómo funciona `app.js`

Todo está en un solo archivo. Las funciones se llaman `inicializarAlgo()` y se ejecutan solas al abrir la página, desde la lista `funcionesArrancar` (al final de `app.js`).

Cada función primero pregunta si el elemento que necesita existe, y si no, no hace nada. Por eso la misma función sirve para varias páginas:

JS
if(!contenedor) return;   // si no está, salgo


Además, cada una va dentro de un `try/catch`, así el error de una página no rompe a las demás.

Datos precargados: `LISTA_JUEGOS` y `LISTA_TAGS` en `app.js` se usan para validar que el juego y el tag existan. Los `.json` se usan para mostra las sugerencias del autocompletado. Si tocás una de las dos listas, actualizá la otra.

IDs: se generan con `Date.now()` (la hora del momento), por eso nunca se repiten.

Imágenes: la que sube el usuario se lee con `FileReader` y se guarda como texto en el `localStorage`. Si falta la foto de un juego, se usa `Img/gameover.jpg`.



7. Validaciones

Registro: usuario de mínimo 5 caracteres (solo letras y números) · Contraseña de mínimo 8 caracteres, con al menos una letra y un número · Las dos contraseñas iguales · Usuario no repetido.

Reseña: hay que estar logueado. El juego debe ser uno de la lista · Mínimo un tag válido · La calificación no puede ser 0 · La imagen es obligatoria.

Comentario: hay que estar logueado · No puede estar vacío.
