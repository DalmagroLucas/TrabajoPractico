// Seleccionamos el formulario por su ID
const formulario = document.getElementById('formulario-juego');

// Variables globales para los tags
let tagsSeleccionados = [];

// Nos aseguramos de que el formulario exista en la página actual para evitar errores[cite: 1, 2]
if (formulario) {
    formulario.addEventListener('submit', function(evento) {
        // Evitamos que la página se recargue por defecto al enviar[cite: 1]
        evento.preventDefault(); 

        // Capturamos los valores de los campos de texto y número[cite: 1, 2]
        const tituloResena = document.getElementById('titulo-resena').value;
        const nombreJuego = document.getElementById('nombre-juego').value;
        const opinion = document.getElementById('opinion').value;
        const calificacion = document.getElementById('calificacion').value;
        
        // Si hay tags en la lista interactiva los unimos, o leemos directamente el texto
        const palabrasClaves = tagsSeleccionados.length > 0 
            ? tagsSeleccionados.join(', ') 
            : document.getElementById('tag-input').value;

        // Capturamos la imagen subida[cite: 2]
        const inputImagen = document.getElementById('imagen-juego');
        const archivoImagen = inputImagen.files[0];

        if (archivoImagen) {
            // FileReader convierte el archivo de imagen a un texto en formato Base64[cite: 2]
            const lector = new FileReader();

            lector.onload = function(e) {
                // Creamos el objeto con toda la información de la reseña[cite: 1, 2]
                const nuevaResena = {
                    id: Date.now(), // Identificador único basado en el tiempo[cite: 1]
                    titulo: tituloResena,
                    juego: nombreJuego,
                    opinion: opinion,
                    calificacion: calificacion,
                    tags: palabrasClaves,
                    imagen: e.target.result // La imagen convertida a texto
                };

                // Recuperamos las reseñas guardadas anteriormente o iniciamos una lista vacía [][cite: 1]
                let resenasGuardadas = JSON.parse(localStorage.getItem('misResenas')) || [];

                // Agregamos la nueva reseña a la lista[cite: 1]
                resenasGuardadas.push(nuevaResena);

                // Convertimos a JSON y guardamos la lista actualizada en el localStorage[cite: 1, 2]
                localStorage.setItem('misResenas', JSON.stringify(resenasGuardadas));

                // Limpiamos el formulario y notificamos al usuario
                formulario.reset();
                
                // Limpiamos los tags de pantalla y reseteamos las estrellas
                tagsSeleccionados = [];
                renderizarTags();
                actualizarEstrellasCalificacion(5);
                
                // Reseteamos la vista previa de la imagen
                const previewImg = document.getElementById('imagen-preview');
                const placeholder = document.getElementById('preview-placeholder');
                if (previewImg && placeholder) {
                    previewImg.src = '';
                    previewImg.classList.add('oculto');
                    placeholder.classList.remove('oculto');
                }

                alert('¡Reseña guardada con éxito!');
            };

            // Leemos el archivo para disparar el lector.onload
            lector.readAsDataURL(archivoImagen);
        }
    });
}


// ==========================================
// 2. ELIMINAR UNA RESEÑA DEL LOCALSTORAGE
// ==========================================

function eliminarResena(id) {
    // 1. Traemos la lista actual de reseñas[cite: 1, 2]
    let resenasGuardadas = JSON.parse(localStorage.getItem('misResenas')) || [];

    // 2. Filtramos la lista, conservando todas las reseñas EXCEPTO la que coincide con el ID a borrar
    resenasGuardadas = resenasGuardadas.filter(resena => resena.id !== id);

    // 3. Sobreescribimos el localStorage con la nueva lista filtrada[cite: 1, 2]
    localStorage.setItem('misResenas', JSON.stringify(resenasGuardadas));

    // 4. Volvemos a renderizar las reseñas en pantalla para refrescar la vista
    mostrarResenas();
}


// ==========================================
// 3. MOSTRAR LAS RESEÑAS (Página: ultimas_resenas.html)
// ==========================================

function mostrarResenas() {
    const contenedor = document.getElementById('contenedor-resenas');
    
    // Si no estamos en la página que tiene el contenedor de reseñas, detenemos la función
    if (!contenedor) return;

    // Leemos los datos del localStorage[cite: 1, 2]
    let resenasGuardadas = JSON.parse(localStorage.getItem('misResenas')) || [];

    // Si no hay reseñas guardadas, mostramos un mensaje amigable
    if (resenasGuardadas.length === 0) {
        contenedor.innerHTML = '<h3 style="color: #899aa9; text-align: center; grid-column: 1 / -1;">Aún no hay reseñas. ¡Sé el primero en escribir una!</h3>';
        return;
    }

    // Limpiamos el contenedor para evitar duplicados al refrescar
    contenedor.innerHTML = '';

    // Recorremos la lista de reseñas y creamos las tarjetas dinámicamente
    resenasGuardadas.forEach(function(resena) {
        const tarjeta = document.createElement('div');
        tarjeta.classList.add('tarjeta-resena');

        tarjeta.innerHTML = `
            <!-- Botón del tachito de basura arriba a la derecha -->
            <button class="boton-eliminar" title="Eliminar reseña">🗑️</button>
            
            <div class="tarjeta-imagen">
                <img src="${resena.imagen}" alt="Portada de ${resena.juego}">
            </div>
            <div class="tarjeta-contenido">
                <h3 class="tarjeta-titulo">${resena.titulo}</h3>
                <h4 class="tarjeta-juego">${resena.juego}</h4>
                <div class="tarjeta-puntuacion">⭐ ${resena.calificacion} / 5</div>
                <p class="tarjeta-opinion">"${resena.opinion}"</p>
                <div class="tarjeta-tags">🏷️ ${resena.tags}</div>
            </div>
        `;

        // Asignamos el evento de eliminación al botón de esta tarjeta en particular
        const btnEliminar = tarjeta.querySelector('.boton-eliminar');
        btnEliminar.addEventListener('click', function() {
            if (confirm(`¿Estás seguro de que deseas eliminar la reseña de "${resena.juego}"?`)) {
                eliminarResena(resena.id);
            }
        });

        // Insertamos la tarjeta creada en el contenedor
        contenedor.appendChild(tarjeta);
    });
}


// ==========================================================================
// CARGA DE ARCHIVOS JSON Y FUNCIONES DE CONTROL
// ==========================================================================

// CAMBIO REALIZADO: Carga ajustada a la carpeta Json/tags.json
function cargarTagsJSON() {
    const datalistTags = document.getElementById('opciones-tags');
    if (!datalistTags) return;

    fetch('../Json/tags.json')
        .then(respuesta => respuesta.json())
        .then(tags => {
            datalistTags.innerHTML = '';
            tags.forEach(tag => {
                const opcion = document.createElement('option');
                opcion.value = tag;
                datalistTags.appendChild(opcion);
            });
        })
        .catch(err => {
            // Intento secundario si la página se ejecuta desde la raíz
            fetch('Json/tags.json')
                .then(r => r.json())
                .then(tags => {
                    datalistTags.innerHTML = '';
                    tags.forEach(t => {
                        const o = document.createElement('option');
                        o.value = t;
                        datalistTags.appendChild(o);
                    });
                })
                .catch(e => console.log('Sugerencia: Usa Live Server para cargar los archivos JSON.', e));
        });
}

// CAMBIO REALIZADO: Carga ajustada a la carpeta Json/juegos.json
function cargarJuegosJSON() {
    const datalistJuegos = document.getElementById('opciones-juegos');
    if (!datalistJuegos) return;

    fetch('../Json/juegos.json')
        .then(respuesta => respuesta.json())
        .then(juegos => {
            datalistJuegos.innerHTML = '';
            juegos.forEach(juego => {
                const opcion = document.createElement('option');
                opcion.value = juego.nombre;
                datalistJuegos.appendChild(opcion);
            });
        })
        .catch(err => {
            fetch('Json/juegos.json')
                .then(r => r.json())
                .then(juegos => {
                    datalistJuegos.innerHTML = '';
                    juegos.forEach(j => {
                        const o = document.createElement('option');
                        o.value = j.nombre;
                        datalistJuegos.appendChild(o);
                    });
                })
                .catch(e => console.log('Sugerencia: Usa Live Server para cargar los archivos JSON.', e));
        });
}

function agregarTag(valor) {
    const tagTexto = valor.trim();
    if (tagTexto && !tagsSeleccionados.includes(tagTexto)) {
        tagsSeleccionados.push(tagTexto);
        renderizarTags();
    }
}

function eliminarTag(tagTexto) {
    tagsSeleccionados = tagsSeleccionados.filter(t => t !== tagTexto);
    renderizarTags();
}

function renderizarTags() {
    const contenedor = document.getElementById('contenedor-tags');
    if (!contenedor) return;

    contenedor.innerHTML = '';
    tagsSeleccionados.forEach(tag => {
        const badge = document.createElement('span');
        badge.classList.add('tag-badge');
        badge.innerHTML = `${tag} <span class="btn-borrar-tag" onclick="eliminarTag('${tag}')">&times;</span>`;
        contenedor.appendChild(badge);
    });
}

// CAMBIO REALIZADO: Función para iluminar las estrellas según la selección
function actualizarEstrellasCalificacion(valor) {
    const estrellas = document.querySelectorAll('.estrella-item');
    const inputCalificacion = document.getElementById('calificacion');

    if (inputCalificacion) inputCalificacion.value = valor || "";

    estrellas.forEach(estrella => {
        const val = parseInt(estrella.getAttribute('data-valor'));
        if (valor > 0 && val <= valor) {
            estrella.classList.add('activa');
        } else {
            estrella.classList.remove('activa');
        }
    });
}

// Inicialización de los eventos del formulario
function inicializarFormulario() {
    cargarTagsJSON();
    cargarJuegosJSON();

    // Pre-cargar el juego elegido desde inicio.html (parámetro ?juego=)
    const paramsInicio = new URLSearchParams(window.location.search);
    const juegoDesdeInicio = paramsInicio.get('juego');
    if (juegoDesdeInicio) {
        const inputNombreJuego = document.getElementById('nombre-juego');
        if (inputNombreJuego) inputNombreJuego.value = juegoDesdeInicio;
    }

    // 1. Estrellas inician en 0 (vacías)
    actualizarEstrellasCalificacion(0);

    const inputTag = document.getElementById('tag-input');
    if (inputTag) {
        // Al seleccionar una opción del datalist
        inputTag.addEventListener('change', () => {
            if (inputTag.value.trim() !== '') {
                agregarTag(inputTag.value);
                inputTag.value = '';
            }
        });

        // Al presionar Enter dentro del campo de tags
        inputTag.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                if (inputTag.value.trim() !== '') {
                    agregarTag(inputTag.value);
                    inputTag.value = '';
                }
            }
        });
    }

    // Interacción al hacer clic en las estrellas
    const estrellasContenedor = document.getElementById('estrellas-calificacion');
    if (estrellasContenedor) {
        estrellasContenedor.addEventListener('click', function(e) {
            if (e.target.classList.contains('estrella-item')) {
                const valor = parseInt(e.target.getAttribute('data-valor'));
                actualizarEstrellasCalificacion(valor);
            }
        });
    }

    // Previsualización de imagen
    const inputImagen = document.getElementById('imagen-juego');
    const previewImg = document.getElementById('imagen-preview');
    const placeholder = document.getElementById('preview-placeholder');

    if (inputImagen && previewImg && placeholder) {
        inputImagen.addEventListener('change', function() {
            const file = this.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    previewImg.src = e.target.result;
                    previewImg.classList.remove('oculto');
                    placeholder.classList.add('oculto');
                };
                reader.readAsDataURL(file);
            }
        });
    }
}



// ==========================================
// 4. INICIALIZACIÓN GENERAL
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
    mostrarResenas();
    inicializarFormulario();
});
 
function inicializarPaginaFiltrar() {
    const inputTexto = document.getElementById('buscador-texto');
    const selectJuego = document.getElementById('filtro-juego-select');
    const selectTag = document.getElementById('filtro-tag-select');
    const selectCalificacion = document.getElementById('filtro-calificacion');
    const btnLimpiar = document.getElementById('btn-limpiar-filtros');
    const contenedor = document.getElementById('contenedor-resenas');

    if (!contenedor || !inputTexto) return;

    // Cargar opciones en el select de Juegos
    if (selectJuego && selectJuego.options.length <= 1) {
        LISTA_JUEGOS.forEach(juego => {
            const op = document.createElement('option');
            op.value = juego;
            op.textContent = juego;
            selectJuego.appendChild(op);
        });
    }

    // Cargar opciones en el select de Tags
    if (selectTag && selectTag.options.length <= 1) {
        LISTA_TAGS.forEach(tag => {
            const op = document.createElement('option');
            op.value = tag;
            op.textContent = tag;
            selectTag.appendChild(op);
        });
    }

    // Función de filtrado flexible
    function aplicarFiltros() {
        const textoTitulo = inputTexto.value.toLowerCase().trim();
        const juegoElegido = selectJuego ? selectJuego.value.toLowerCase().trim() : '';
        const tagElegido = selectTag ? selectTag.value.toLowerCase().trim() : '';
        const calificacionElegida = selectCalificacion ? selectCalificacion.value : '';

        const resenasGuardadas = JSON.parse(localStorage.getItem('misResenas')) || [];

        const filtradas = resenasGuardadas.filter(resena => {
            // 1. Título
            const coincideTitulo = textoTitulo === '' || 
                (resena.titulo || '').toLowerCase().includes(textoTitulo);

            // 2. Juego (Usamos .includes para evitar fallos si hay espacios extra)
            const coincideJuego = juegoElegido === '' || 
                (resena.juego || '').toLowerCase().includes(juegoElegido) ||
                juegoElegido.includes((resena.juego || '').toLowerCase());

            // 3. Tag (Busca si la tag elegida está dentro del texto de tags)
            const coincideTag = tagElegido === '' || 
                (resena.tags || '').toLowerCase().includes(tagElegido);

            // 4. Calificación
            const coincideCalificacion = calificacionElegida === '' || 
                String(resena.calificacion) === String(calificacionElegida);

            return coincideTitulo && coincideJuego && coincideTag && coincideCalificacion;
        });

        renderizarTarjetas(filtradas, contenedor);
    }

    // Eventos de escucha
    inputTexto.addEventListener('input', aplicarFiltros);
    if (selectJuego) selectJuego.addEventListener('change', aplicarFiltros);
    if (selectTag) selectTag.addEventListener('change', aplicarFiltros);
    if (selectCalificacion) selectCalificacion.addEventListener('change', aplicarFiltros);

    if (btnLimpiar) {
        btnLimpiar.addEventListener('click', () => {
            inputTexto.value = '';
            if (selectJuego) selectJuego.value = '';
            if (selectTag) selectTag.value = '';
            if (selectCalificacion) selectCalificacion.value = '';
            aplicarFiltros();
        });
    }

    // Ejecución inicial
    aplicarFiltros();
}

// LISTAS INTEGRADAS
const LISTA_TAGS = [
    "Acción", "Aventura", "RPG", "JRPG", "Singleplayer", "Multijugador",
    "Cooperativo", "Plataformas", "Metroidvania", "Estrategia", "Terror",
    "Supervivencia", "Indie", "Shooter", "FPS", "TPS", "Puzzle", "Simulación",
    "Deportes", "Carreras", "Lucha", "Roguelike", "Roguelite", "Mundo Abierto",
    "Hack and Slash", "Stealth", "Soulslike", "Novela Visual", "Música/Ritmo",
    "Sandbox", "Táctico", "Casual", "Battle Royale"
];

const LISTA_JUEGOS = [
    "The Legend of Zelda: Breath of the Wild", "The Legend of Zelda: Tears of the Kingdom",
    "Elden Ring", "God of War", "God of War Ragnarök", "Red Dead Redemption 2",
    "The Witcher 3: Wild Hunt", "Hollow Knight", "Minecraft", "Grand Theft Auto V",
    "Cyberpunk 2077", "Dark Souls III", "Bloodborne", "Sekiro: Shadows Die Twice",
    "Baldur's Gate 3", "Super Mario Odyssey", "Super Mario Bros. Wonder", "Persona 5 Royal",
    "Final Fantasy VII Remake", "Final Fantasy XVI", "Resident Evil 4 Remake",
    "Resident Evil Village", "Silent Hill 2", "Hades", "Hades II", "Celeste",
    "Stardew Valley", "Terraria", "Portal 2", "Half-Life 2", "Doom Eternal",
    "Overwatch 2", "Counter-Strike 2", "Valorant", "League of Legends", "Dota 2",
    "World of Warcraft", "Fortnite", "Apex Legends", "Call of Duty: Warzone",
    "Fallout 4", "Skyrim (The Elder Scrolls V)", "Monster Hunter: World",
    "Monster Hunter Rise", "Death Stranding", "Ghost of Tsushima", "The Last of Us Part I",
    "The Last of Us Part II", "Horizon Zero Dawn", "Horizon Forbidden West",
    "Spider-Man Remastered", "Spider-Man 2", "Cuphead", "Undertale", "Dead Cells",
    "Slay the Spire", "Outer Wilds", "Disco Elysium", "Sea of Thieves", "It Takes Two",
    "Left 4 Dead 2", "Payday 2", "Subnautica", "No Man's Sky", "Starfield",
    "Palworld", "Helldivers 2", "Black Myth: Wukong"
];

function cargarPaginaFiltrar() {
    const inputTexto = document.getElementById('buscador-texto');
    const selectJuego = document.getElementById('filtro-juego-select');
    const selectTag = document.getElementById('filtro-tag-select');
    const selectCalificacion = document.getElementById('filtro-calificacion');
    const btnLimpiar = document.getElementById('btn-limpiar-filtros');
    const contenedor = document.getElementById('contenedor-resenas');

    if (!contenedor || !inputTexto) return;

    // Llenar select de Juegos
    if (selectJuego) {
        selectJuego.innerHTML = '<option value="">Todos los juegos</option>';
        LISTA_JUEGOS.forEach(juego => {
            const op = document.createElement('option');
            op.value = juego;
            op.textContent = juego;
            selectJuego.appendChild(op);
        });
    }

    // Llenar select de Tags
    if (selectTag) {
        selectTag.innerHTML = '<option value="">Todos los tags</option>';
        LISTA_TAGS.forEach(tag => {
            const op = document.createElement('option');
            op.value = tag;
            op.textContent = tag;
            selectTag.appendChild(op);
        });
    }

    // Lógica de filtrado
    function aplicarFiltros() {
        const textoBusqueda = inputTexto.value.toLowerCase().trim();
        const juegoElegido = selectJuego ? selectJuego.value.toLowerCase().trim() : '';
        const tagElegido = selectTag ? selectTag.value.toLowerCase().trim() : '';
        const calificacionElegida = selectCalificacion ? selectCalificacion.value : '';

        const resenasGuardadas = JSON.parse(localStorage.getItem('misResenas')) || [];

        const filtradas = resenasGuardadas.filter(resena => {
            // 1. Título
            const coincideTexto = textoBusqueda === '' || 
                (resena.titulo || '').toLowerCase().includes(textoBusqueda);

            // 2. Juego
            const coincideJuego = juegoElegido === '' || 
                (resena.juego || '').toLowerCase().includes(juegoElegido);

            // 3. Tag (Filtra de verdad si la tag seleccionada está dentro de los tags de la reseña)
            const coincideTag = tagElegido === '' || 
                (resena.tags || '').toLowerCase().includes(tagElegido);

            // 4. Calificación
            const coincideCalificacion = calificacionElegida === '' || 
                String(resena.calificacion) === String(calificacionElegida);

            return coincideTexto && coincideJuego && coincideTag && coincideCalificacion;
        });

        // Renderizado de las tarjetas abajo
        contenedor.innerHTML = '';

        if (filtradas.length === 0) {
            contenedor.innerHTML = `
                <h3 style="text-align: center; grid-column: 1 / -1; color: #888; font-weight: normal; margin-top: 30px; width: 100%;">
                    No se encontraron reseñas con esos filtros.
                </h3>`;
            return;
        }

        filtradas.forEach(resena => {
            const tarjeta = document.createElement('div');
            tarjeta.classList.add('tarjeta-resena');

            tarjeta.innerHTML = `
                <button class="boton-eliminar" title="Eliminar reseña">🗑️</button>
                <div class="tarjeta-imagen">
                    <img src="${resena.imagen || '../placeholder.png'}" alt="Portada de ${resena.juego}">
                </div>
                <div class="tarjeta-contenido">
                    <h3 class="tarjeta-titulo">${resena.titulo}</h3>
                    <h4 class="tarjeta-juego">${resena.juego}</h4>
                    <div class="tarjeta-puntuacion">★ ${resena.calificacion} / 5</div>
                    <p class="tarjeta-opinion">${resena.opinion}</p>
                    ${resena.tags ? `<div class="tarjeta-tags">🏷️ ${resena.tags}</div>` : ''}
                </div>
            `;

            const btnEliminar = tarjeta.querySelector('.boton-eliminar');
            if (btnEliminar) {
                btnEliminar.addEventListener('click', () => {
                    if (confirm(`¿Eliminar la reseña "${resena.titulo}"?`)) {
                        let resenas = JSON.parse(localStorage.getItem('misResenas')) || [];
                        resenas = resenas.filter(r => r.id !== resena.id);
                        localStorage.setItem('misResenas', JSON.stringify(resenas));
                        aplicarFiltros();
                    }
                });
            }

            contenedor.appendChild(tarjeta);
        });
    }

    // Eventos
    inputTexto.addEventListener('input', aplicarFiltros);
    if (selectJuego) selectJuego.addEventListener('change', aplicarFiltros);
    if (selectTag) selectTag.addEventListener('change', aplicarFiltros);
    if (selectCalificacion) selectCalificacion.addEventListener('change', aplicarFiltros);

    if (btnLimpiar) {
        btnLimpiar.addEventListener('click', () => {
            inputTexto.value = '';
            if (selectJuego) selectJuego.value = '';
            if (selectTag) selectTag.value = '';
            if (selectCalificacion) selectCalificacion.value = '';
            aplicarFiltros();
        });
    }

    // Render inicial
    aplicarFiltros();
}

document.addEventListener('DOMContentLoaded', cargarPaginaFiltrar);



//Inicio de la pagina

function cargarPaginaInicio() {
    const contenedor = document.getElementById('contenedor-juegos');
    if (!contenedor) return;

    // Imagen de respaldo por si la portada aún no existe en la carpeta Img
    const imagenPorDefecto = 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(
        '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="250"><rect width="100%" height="100%" fill="#14181c"/></svg>'
    );

    // Cargamos el archivo JSON que tiene la lista completa de juegos
    fetch('../Json/juegos.json')
        .then(respuesta => respuesta.json())
        .then(juegos => {
            // Limpiamos el contenedor para evitar duplicados al refrescar
            contenedor.innerHTML = '';

            // Recorremos la lista de juegos y creamos una tarjeta por cada uno
            juegos.forEach(juego => {
                const tarjeta = document.createElement('div');
                tarjeta.classList.add('tarjeta-resena');

                tarjeta.innerHTML = `
                    <div class="tarjeta-imagen">
                        <img src="${juego.imagen}" alt="Portada de ${juego.nombre}">
                    </div>
                    <div class="tarjeta-contenido">
                        <h3 class="tarjeta-titulo">${juego.nombre}</h3>
                        <p class="tarjeta-opinion">${juego.descripcion}</p>
                        <a class="boton-enlace" href="formulario.html?juego=${encodeURIComponent(juego.nombre)}">Dejar reseña</a>
                    </div>
                `;

                // Si la imagen no existe todavía, mostramos la imagen de respaldo
                const img = tarjeta.querySelector('.tarjeta-imagen img');
                img.onerror = function() {
                    this.onerror = null;
                    this.src = imagenPorDefecto;
                };

                contenedor.appendChild(tarjeta);
            });
        })
        .catch(err => {
            // Si el JSON no se puede cargar, avisamos al usuario (usar Live Server)
            contenedor.innerHTML = '<h3 style="color: #899aa9; text-align: center; grid-column: 1 / -1;">No se pudieron cargar los juegos. Abre la página con Live Server.</h3>';
        });
}

document.addEventListener('DOMContentLoaded', cargarPaginaInicio);

//Modo oscuro o claro


function aplicarTema(tema) {
    // Agregamos o quitamos la clase que activa el modo claro
    if (tema === 'claro') {
        document.body.classList.add('modo-claro');
    } else {
        document.body.classList.remove('modo-claro');
    }

    // Actualizamos los textos de los botones (muestran el modo al que se pasa al hacer click)
    const texto = tema === 'claro' ? 'Oscuro' : 'Claro';
    const botonNav = document.getElementById('boton-tema');
    const botonFlotante = document.getElementById('boton-tema-flotante');
    if (botonNav) botonNav.textContent = texto;
    if (botonFlotante) botonFlotante.textContent = texto;

    // Guardamos la preferencia para que se mantenga entre páginas
    localStorage.setItem('tema', tema);
}

function inicializarTema() {
    // Aplicamos el tema guardado, u oscuro si es la primera vez
    const temaGuardado = localStorage.getItem('tema') || 'oscuro';
    aplicarTema(temaGuardado);

    // Botón de la barra de navegación
    const botonNav = document.getElementById('boton-tema');
    if (botonNav) {
        botonNav.addEventListener('click', () => {
            const nuevoTema = document.body.classList.contains('modo-claro') ? 'oscuro' : 'claro';
            aplicarTema(nuevoTema);
        });
    }

    // Botón flotante de la página de inicio de sesión
    const botonFlotante = document.getElementById('boton-tema-flotante');
    if (botonFlotante) {
        botonFlotante.addEventListener('click', () => {
            const nuevoTema = document.body.classList.contains('modo-claro') ? 'oscuro' : 'claro';
            aplicarTema(nuevoTema);
        });
    }
}

document.addEventListener('DOMContentLoaded', inicializarTema);