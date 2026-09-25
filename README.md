GENX — Reseñas de videojuegos
`Dalmagro Lucas` - `Frati Guillermo` - `Miceli Tiziano` - `Pereyra Briscil`

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

<img width="274" height="505" alt="imagen" src="https://github.com/user-attachments/assets/5fad312d-707d-4c74-b5c9-2276bd4388a2" />


3. Cómo abrir el proyecto

1. Abrí la carpeta `TrabajoPractico-main` en VS Code.
2. Instalá la extensión Live Server.
3. En el explorador, entrá a Pages.
4. ClicK derecho sobre `inicio.html` → Open with Live Server.


4. Páginas


| Qué hace |
|
| `inicio.html` | Catálogo de juegos. click en un juego → abre el formulario con el juego.
<img width="1865" height="943" alt="imagen" src="https://github.com/user-attachments/assets/73710366-c486-47ba-aa2f-eda9ba65af6c" />

| `resenas.html` | Todas las reseñas + filtros por texto, juego, tag y calificación. |
<img width="1866" height="945" alt="imagen" src="https://github.com/user-attachments/assets/10bc4131-486e-4132-96da-f92e39933303" />


| `resena_individual.html` | Una reseña con su hilo de comentarios. |
<img width="1867" height="942" alt="imagen" src="https://github.com/user-attachments/assets/c4def2c7-8f5e-47a0-9837-e226d37a5fab" />


| `formulario.html` | Publicar reseña o editarlas. Requiere sesión iniciada. |
<img width="1867" height="945" alt="imagen" src="https://github.com/user-attachments/assets/ef3b79c9-01c4-4ab4-8215-e5326b79819e" />


| `tus_resenas.html` | Tus reseñas, con opción de borrarlas o editarlas. |
<img width="1866" height="941" alt="imagen" src="https://github.com/user-attachments/assets/ccf157ae-b8d0-49f5-b9f0-05e4d52d13cc" />


| `inicio_sesion.html` | Iniciar sesión. |
<img width="1867" height="942" alt="imagen" src="https://github.com/user-attachments/assets/5569e166-62a0-4d0a-9146-4c1d28deca41" />


| `crear_usuario.html` | Registrarse (inicia sesión al instante). |
<img width="1867" height="942" alt="imagen" src="https://github.com/user-attachments/assets/8872eb5d-e860-486b-8de1-3bc6fa39d0eb" />


---

5. Usuarios de prueba

Vienen en `Json/usuarios.json`:
```
| Usuario | Contraseña |
| `gamer123` | `Clave1234` |
| `pixelArt` | `Zelda2026` |
| `reviewerX` | `MasterPass1` |
```

6. Cómo funciona `app.js`

Todo está en un solo archivo. Las funciones se llaman `inicializar_________()` y se ejecutan solas al abrir la página, desde la lista `funcionesArrancar` (al final de `app.js`).

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
