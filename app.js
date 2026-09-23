//guardamos en formulario un formulario a traves de la id
const formulario = document.getElementById('formulario-juego');
// Crea el array de los tags que se van a utilizar
let tagsSeleccionados = [];
//Este if se encarga unicamente de el envio del formulario
if (formulario) {
    const usuarioActivo = obtenerUsuarioLogueado();
    if (!usuarioActivo) {
            alert('Tenes que iniciar sesion antes de publicar');
            window.location.href = 'inicio_sesion.html';
            return;
    }
    formulario.addEventListener('submit', function(evento) { //ocurre unicamente si se envia un formulario
        //evita que se envie el formulario
        evento.preventDefault(); 
        //se guardan los datos del formulario
        const tituloResena = document.getElementById('titulo-resena').value;
        const nombreJuego = document.getElementById('nombre-juego').value;
        const opinion = document.getElementById('opinion').value;
        const calificacion = document.getElementById('calificacion').value;
        //si los tags estan separados por una , los une, sino los usa como los mando el usuario
        const palabrasClaves = tagsSeleccionados.length > 0 
            ? tagsSeleccionados.join(', ') 
            : document.getElementById('tag-input').value;
        //trae los archivos enviados
        const inputImagen = document.getElementById('imagen-juego');
        //agarra el archivo que especificamente queremos
        const archivoImagen = inputImagen.files[0];
        if (archivoImagen) {//solamente se ejecuta si hay imagen
            const lector = new FileReader(); //funcion para leer archivos
            lector.onload = function(e) { //esta funcion tiene una demora
                //Creamos la nueva reseña con todos los datos ingresados
                const nuevaResena = {
                    id: Date.now(), //La id de la reseña va a ser la fecha de realizacion
                    usuarioId: usuarioActivo.id,
                    titulo: tituloResena,
                    juego: nombreJuego,
                    opinion: opinion,
                    calificacion: calificacion,
                    tags: palabrasClaves,
                    imagen: e.target.result // La imagen convertida a texto
                };
                //trae a la variable reseñas guardadas, las reseñas guardadas (valga la redundancia) o un null si es q esta vacio
                let resenasGuardadas = JSON.parse(localStorage.getItem('misResenas')) || [];
                //Guarda la nueva reseña
                resenasGuardadas.push(nuevaResena);
                //las re-convertimos en un json y se guarda
                localStorage.setItem('misResenas', JSON.stringify(resenasGuardadas));
                //se limpia el formulario
                formulario.reset();
                //se limpian los tags y se actualizan las estrellas
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
                alert('Reseña subida');
                window.location.href = 'resenas.html';
            };

            // Leemos el archivo para disparar el lector.onload
            lector.readAsDataURL(archivoImagen);
        } 
    });
}


//COSAS A CAMBIAR: EL ORDEN DE LAS COSAS PARECIERA ESTA MAL, DEBERIA REVISAR DE ANTEMANO SI EL USUARIO ES ACTIVO

//PRECARGA LOS USUARIOS SI NO HAY NINGUN USUARIO CARGADO
function inicializarUsuarios() {
    // si no hay usuarios cargados, utilizamos los del json
    if (!localStorage.getItem('usuarios')) {
        fetch('../Json/usuarios.json')//trae el json
            .then(res => res.json()) //convierte las respuestas en datos
            .then(data => { //guarda en el local storage los del json
                localStorage.setItem('usuarios', JSON.stringify(data));
            })
            .catch(() => {
                // Si falla la ruta por carpetas, intentar desde raíz
                fetch('Json/usuarios.json')
                    .then(res => res.json())
                    .then(data => localStorage.setItem('usuarios', JSON.stringify(data)))
                    .catch(e => console.log('No se pudieron cargar los usuarios, revisen que falló', e));
            });
    }
}

//CARGAR A UN NUEVO USUARIO
function inicializarFormularioRegistro() {
    const formRegistro = document.getElementById('formulario-registro');
    if (!formRegistro) return; 

    formRegistro.addEventListener('submit', function(e) {
        e.preventDefault();

        const usuarioInput = document.getElementById('reg-usuario').value.trim();
        const passInput = document.getElementById('reg-contrasena').value;
        const confirmPassInput = document.getElementById('reg-confirmar-contrasena').value;
        const mensaje = document.getElementById('mensaje-registro');

        if (mensaje) mensaje.textContent = '';

        //valida que le nombre de usuario sea minimamente 5 letras y que acepta letras y numeros
        const regexUsuario = /^[a-zA-Z0-9]{5,}$/;
        if (!regexUsuario.test(usuarioInput)) {
            const textoError = 'El nombre de usuario tiene que tener minimamente 5 letras y/o numeros';
            if (mensaje) mensaje.textContent = textoError;
            return;
        }

        //valida que la contraseña sea minimo 8 letras y que tenga que tener minimamente una letra y un numero
        const regexPassword = /^(?=.*[a-zA-Z])(?=.*\d).{8,}$/;
        if (!regexPassword.test(passInput)) {
            const textoError = 'La contraseña tiene que tener minimamente 8 letras y/o numeros. si o si tiene que llevar una letra y un numero';
            if (mensaje) mensaje.textContent = textoError;
            return;
        }

        //valida que las dos contraseñas sean iguales
        if (passInput !== confirmPassInput) {
            const textoError = 'Las contraseñas tienen que ser iguales';
            if (mensaje) mensaje.textContent = textoError;
            return;
        }

        //valida que no sea un usuario existente
        let listaUsuarios = JSON.parse(localStorage.getItem('usuarios')) || []; //trae los usuarios registrados
        const usuarioExiste = listaUsuarios.some(u => u.usuario.toLowerCase() === usuarioInput.toLowerCase()); //revisa usuario por usuario a ver si alguno coincide
        if (usuarioExiste) {
            const textoError = 'El nombre esta en uso, usa otro';
            if (mensaje) mensaje.textContent = textoError;
            return;
        }

        //Si no salto ningun error, crea al nuevo usuario
        const nuevoUsuario = {
            id: Date.now(), // Igual q las reseñas, la id es la fecha actual
            usuario: usuarioInput,
            contrasena: passInput
        };

        //Se guarda el nuevo usuario en la lista de usuarios
        listaUsuarios.push(nuevoUsuario);
        localStorage.setItem('usuarios', JSON.stringify(listaUsuarios)); 

        //se autoinicia sesion
        const sesion = {
            id: nuevoUsuario.id,
            usuario: nuevoUsuario.usuario
        };
        localStorage.setItem('usuarioLogueado', JSON.stringify(sesion));

        alert(`Se creo la cuenta`);

        //Devuelve al inicio
        window.location.href = 'inicio.html';
    });
}


//FUNCION QUE INICIA SESION
function inicializarFormularioLogin() {
    const formLogin = document.getElementById('formulario-login');
    if (!formLogin) return;

    formLogin.addEventListener('submit', function(e) {
        e.preventDefault();
        const usuarioInput = document.getElementById('usuario').value.trim();
        const passInput = document.getElementById('contrasena').value;
        const mensaje = document.getElementById('mensaje-login');

        let listaUsuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
        const usuarioEncontrado = listaUsuarios.find(
            u => u.usuario.toLowerCase() === usuarioInput.toLowerCase() && u.contrasena === passInput
        );

        if (usuarioEncontrado) {
            //se guardan los datos como la sesion actual
            const sesion = {
                id: usuarioEncontrado.id,
                usuario: usuarioEncontrado.usuario
            };
            localStorage.setItem('usuarioLogueado', JSON.stringify(sesion));
            alert(`Sesion iniciada`);

            //devuelve al home
            window.location.href = 'inicio.html';

        } else {
            //Sino se reinicia el formulario y tiramos error
            formLogin.reset();
            const errorTexto = 'Nombre de usuario o contraseña incorrectos';
            if (mensaje) {
                mensaje.textContent = errorTexto;
            }
        }
    });
}

function obtenerUsuarioLogueado() {
    return JSON.parse(localStorage.getItem('usuarioLogueado')) || null;
}

function cerrarSesion() {
    localStorage.removeItem('usuarioLogueado');
    window.location.href = 'inicio_sesion.html';
}

//FUNCION QUE MUESTRA LA TARJETA
function mostrarResenas() {
    const contenedor = document.getElementById('contenedor-resenas');
    if (!contenedor) return;

    //Se guarda las reseñas cargadas
    let resenasGuardadas = JSON.parse(localStorage.getItem('misResenas')) || [];

    //mensaje que se muestra si no hay reseñas
    if (resenasGuardadas.length === 0) {
        contenedor.innerHTML = '<h3 class="sin-resenas">No hay reseñas, puede ser por un error, estamos trabajando para resolverlo</h3>';
        return;
    }

    //limpieza de contenedores para evitar duplicaciones
    contenedor.innerHTML = '';

    //Creacion de "tarjetas" de cada uno de las reseñas
    resenasGuardadas.forEach(function(resena) {
        const tarjeta = document.createElement('div'); //crea un div que vendria a ser cada tarjeta
        tarjeta.classList.add('tarjeta-resena'); //le pone el estilo de tarjeta resena

        tarjeta.innerHTML = `
            <div class="tarjeta-imagen">
                <img src="${resena.imagen}" alt="Portada de ${resena.juego}">
            </div>
            <div class="tarjeta-contenido">
                <h3 class="tarjeta-titulo">${resena.titulo}</h3>
                <h4 class="tarjeta-juego">${resena.juego}</h4>
                <div class="tarjeta-puntuacion">${resena.calificacion} / 5</div>
                <p class="tarjeta-opinion">"${resena.opinion}"</p>
                <div class="tarjeta-tags">${resena.tags}</div>
            </div>
        `;
        //se agrega cada tarjeta al contenedor padre para poder mostrar las tarjetas
        contenedor.appendChild(tarjeta);
    });
}
//CAMBIOS: SACAR LA OPCION DE ELIMINAR UNA RESEÑA Y TRATAR DE QUE EL HTML QUEDE EN EL HTML



//CARGA LOS TAGS DEL JSON
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
                .catch(e => console.log('hubo un error cargando los tags, revisen que paso', e));
        });
}

//CARGA LOS JUEGOS DEL JSON
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
                .catch(e => console.log('hubo un error cargando los juegos, revisen que paso', e));
        });
}


//AGREGA LOS TAGS
function agregarTag(valor) {
    const tagTexto = valor.trim();
    if (tagTexto && !tagsSeleccionados.includes(tagTexto)) {
        tagsSeleccionados.push(tagTexto);
        renderizarTags();
    }
}

//ELIMINA LOS TAGS
function eliminarTag(tagTexto) {
    tagsSeleccionados = tagsSeleccionados.filter(t => t !== tagTexto);
    renderizarTags();
}

//MUESTRA LOS TAGS
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

//CAMBIA LAS ESTRELLAS SEGUN LAS QUE SE ELIJAN
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

//Crea el formulario que despues se va a enviar
function inicializarFormulario() {
    cargarTagsJSON();
    cargarJuegosJSON();

    const paramsInicio = new URLSearchParams(window.location.search);
    const juegoDesdeInicio = paramsInicio.get('juego');
    if (juegoDesdeInicio) {
        const inputNombreJuego = document.getElementById('nombre-juego');
        if (inputNombreJuego) inputNombreJuego.value = juegoDesdeInicio;
    }

    
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
    const selectJuego = document.getElementById('filtro-juego');
    const selectTag = document.getElementById('filtro-tag');
    const selectCalificacion = document.getElementById('filtro-calificacion');
    const btnLimpiar = document.getElementById('btn-limpiar');
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
    const selectJuego = document.getElementById('filtro-juego');
    const selectTag = document.getElementById('filtro-tag');
    const selectCalificacion = document.getElementById('filtro-calificacion');
    const btnLimpiar = document.getElementById('btn-limpiar');
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
document.addEventListener('DOMContentLoaded', () => {
    // Carga de usuarios precargados
    if (typeof inicializarUsuarios === 'function') {
        inicializarUsuarios();
    }

    // Inicialización de formularios de registro y login
    inicializarFormularioRegistro();
    inicializarFormularioLogin();

    // Resto de inicializaciones
    mostrarResenas();
    inicializarFormulario();
    inicializarTema();
});