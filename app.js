const formulario = document.getElementById('formulario-juego');
let tagsSeleccionados = [];
if (formulario) {
    formulario.addEventListener('submit', function(evento) { 
        evento.preventDefault(); 
        const usuarioActivo = obtenerUsuarioLogueado();
        if (!usuarioActivo) { 
            alert('Tenes que iniciar sesion antes de publicar');
            window.location.href = 'inicio_sesion.html';
            return;
        }
        const tituloResena = document.getElementById('titulo-resena').value;
        const nombreJuego = document.getElementById('nombre-juego').value;
        const juegovalido = LISTA_JUEGOS.some(juegos => juegos === nombreJuego)
        const opinion = document.getElementById('opinion').value;
        const calificacion = document.getElementById('calificacion').value;
        if (!juegovalido){
            alert("Pone un juego de los que ofrecemos");
            return;
        }

        const inputTag = document.getElementById("tag-input");
        if (inputTag && inputTag.value.trim() !== ""){
            agregarTag(inputTag.value);
            inputTag.value = "";
        }
        const palabrasClaves = tagsSeleccionados.length > 0 
            ? tagsSeleccionados.join(', ') 
            : document.getElementById('tag-input').value;
        
        const inputImagen = document.getElementById('imagen-juego');
        const archivoImagen = inputImagen.files[0];

        const paramsEdit = new URLSearchParams(window.location.search);
        const editId = paramsEdit.get('editId');

        if (tituloResena.trim() === "") {
            alert("El titulo es obligatoria");
            return;
        }

        if (nombreJuego.trim() === "") {
            alert("El juego es obligatoria");
            return;
        }

        const imgPrecargada = inputImagen.dataset.imagenPreCargada
        if (!archivoImagen && !editId && !imgPrecargada) {
            alert("La imagen es obligatoria");
            return;
        }
        
        if (opinion.trim() === "") {
            alert("La opinion es obligatoria");
            return;
        }

        if (!calificacion || calificacion === "" || calificacion === "0"){
            alert("La puntuacion no puede ser 0")
            return
        }

        if (tagsSeleccionados.length === 0) {
            alert('Minimamente pone un tag');
            return;
        }
        let resenasGuardadas = JSON.parse(localStorage.getItem('Resenas')) || [];

        const procesarGuardado = (imagenBase64) => {
            if (editId) {
                const indice = resenasGuardadas.findIndex(r => r.id == editId);
                if (indice !== -1) {
                    resenasGuardadas[indice].titulo = tituloResena;
                    resenasGuardadas[indice].juego = nombreJuego;
                    resenasGuardadas[indice].opinion = opinion;
                    resenasGuardadas[indice].calificacion = calificacion;
                    resenasGuardadas[indice].tags = palabrasClaves;
                    if (imagenBase64) resenasGuardadas[indice].imagen = imagenBase64;
                }
                alert("La reseña se actualizo")}
                else{
                    const nuevaResena = {
                    id: Date.now(), 
                    usuarioId: usuarioActivo.id,
                    titulo: tituloResena,
                    juego: nombreJuego,
                    opinion: opinion,
                    calificacion: calificacion,
                    tags: palabrasClaves,
                    imagen: imagenBase64 
                    };
                    resenasGuardadas.push(nuevaResena);
                    alert('Reseña subida');
                }
                localStorage.setItem('Resenas', JSON.stringify(resenasGuardadas));
                
        formulario.reset();
            tagsSeleccionados = [];
            renderizarTags();
            actualizarEstrellasCalificacion(5);
            
            const previewImg = document.getElementById('imagen-preview');
            const placeholder = document.getElementById('preview-placeholder');
            if (previewImg && placeholder) {
                previewImg.src = '';
                previewImg.classList.add('oculto');
                placeholder.classList.remove('oculto');
            }
            
            window.location.href = 'resenas.html';
        };

        if (archivoImagen) {
            const lector = new FileReader(); 
            lector.onload = function(e) { 
                procesarGuardado(e.target.result);
            };
            lector.readAsDataURL(archivoImagen);
        } else if (editId) {
            procesarGuardado(null);
        } else if (imgPrecargada){
            procesarGuardado(imgPrecargada)
        }
    });
}

function inicializarUsuarios() {
    if (!localStorage.getItem('usuarios')) {
        fetch('../Json/usuarios.json')
            .then(res => res.json()) 
            .then(data => { 
                localStorage.setItem('usuarios', JSON.stringify(data));
            })
            .catch(() => {
                fetch('Json/usuarios.json')
                    .then(res => res.json())
                    .then(data => localStorage.setItem('usuarios', JSON.stringify(data)))
                    .catch(e => console.log('No se pudieron cargar los usuarios, revisen que falló', e));
            });
    }
}

function inicializarPerfil(){
    const usuario = obtenerUsuarioLogueado()
    const NombreUsuario = document.querySelector("#nombre-perfil")
    const ContenedorResenas = document.querySelector("#contenedor-mis-resenas")

    if (!NombreUsuario || !ContenedorResenas) return;
    
    if (!usuario){
        alert("Como llegaste hasta aca? anda a iniciar sesion antes de hacer cualquier cosa")
        window.location.href = "inicio_sesion.html";
        return;
    }
    NombreUsuario.textContent = usuario.usuario;
    let todaslasresenas = JSON.parse(localStorage.getItem("Resenas")) || [];
    const misResenas = todaslasresenas.filter(resenas => resenas.usuarioId === usuario.id);
    misResenas.reverse()
    ContenedorResenas.innerHTML = "";
    
    if (misResenas.length == 0){
        ContenedorResenas.innerHTML = '<h3 class="sin-contenido">Para ver algo aca, tenes que publicar algo antes</h3>'
        return
    }

    misResenas.forEach(function(resena){
        const reseñapropia = document.createElement("div");
        reseñapropia.classList.add("tarjeta-resena");
        reseñapropia.innerHTML = ` 
            <a href="resena_individual.html?id=${resena.id}">
                <button class="btn-eliminar-resena" onclick="eliminarMisReseñas(${resena.id})">X</button>
                <button class="btn-editar-resena" onclick="window.location.href='formulario.html?editId=${resena.id}'">Editar</button>
                <div class="tarjeta-imagen">
                    <img src="${resena.imagen}" alt="Portada de ${resena.juego}">
                </div>
                <div class="tarjeta-contenido">
                    <h3 class="tarjeta-titulo">${resena.titulo}</h3>
                    <h4 class="tarjeta-juego">${resena.juego}</h4>
                    <div class="tarjeta-puntuacion">${resena.calificacion} / 5</div>
                    <p class="tarjeta-opinion">${resena.opinion}</p>
                    ${resena.tags ? `<div class="reseñapropia-tags">${resena.tags}</div>` : ''} 
                </div></a>`;
            
                ContenedorResenas.appendChild(reseñapropia)
    })
}

function eliminarMisReseñas(id){
    if (confirm("Vas a borrar tu reseña, seguro?")){
        let todaslasresenas = JSON.parse(localStorage.getItem("Resenas")) || [];

        todaslasresenas = todaslasresenas.filter(resena => resena.id !== id);
        localStorage.setItem("Resenas", JSON.stringify(todaslasresenas))

        inicializarPerfil()
    }
}

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

        const regexUsuario = /^[a-zA-Z0-9]{5,}$/;
        if (!regexUsuario.test(usuarioInput)) {
            const textoError = 'El nombre de usuario tiene que tener minimamente 5 letras y/o numeros';
            if (mensaje) mensaje.textContent = textoError;
            return;
        }

        const regexPassword = /^(?=.*[a-zA-Z])(?=.*\d).{8,}$/;
        if (!regexPassword.test(passInput)) {
            const textoError = 'La contraseña tiene que tener minimamente 8 letras y/o numeros. si o si tiene que llevar una letra y un numero';
            if (mensaje) mensaje.textContent = textoError;
            return;
        }

        if (passInput !== confirmPassInput) {
            const textoError = 'Las contraseñas tienen que ser iguales';
            if (mensaje) mensaje.textContent = textoError;
            return;
        }

        let listaUsuarios = JSON.parse(localStorage.getItem('usuarios')) || []; 
        const usuarioExiste = listaUsuarios.some(u => u.usuario.toLowerCase() === usuarioInput.toLowerCase()); 
        if (usuarioExiste) {
            const textoError = 'El nombre esta en uso, usa otro';
            if (mensaje) mensaje.textContent = textoError;
            return;
        }

        const nuevoUsuario = {
            id: Date.now(), 
            usuario: usuarioInput,
            contrasena: passInput
        };

        listaUsuarios.push(nuevoUsuario);
        localStorage.setItem('usuarios', JSON.stringify(listaUsuarios)); 

        const sesion = {
            id: nuevoUsuario.id,
            usuario: nuevoUsuario.usuario
        };
        localStorage.setItem('usuarioLogueado', JSON.stringify(sesion));

        alert(`Se creo la cuenta`);

        window.location.href = 'inicio.html';
    });
}

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
            u => u.usuario === usuarioInput && u.contrasena === passInput
        );

        if (usuarioEncontrado) {
            const sesion = {
                id: usuarioEncontrado.id,
                usuario: usuarioEncontrado.usuario
            };
            localStorage.setItem('usuarioLogueado', JSON.stringify(sesion));
            alert(`Sesion iniciada`);

            window.location.href = 'inicio.html';

        } else {
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
    actualizarHeader()
    window.location.href = 'inicio.html';
}

function mostrarResenas() {
    const contenedor = document.getElementById('contenedor-resenas');
    if (!contenedor) return;

    let resenasGuardadas = JSON.parse(localStorage.getItem('Resenas')) || [];

    resenasGuardadas.reverse() 
    if (resenasGuardadas.length === 0) {
        contenedor.innerHTML = '<h3 class="sin-contenido">No hay reseñas, puede ser por un error, estamos trabajando para resolverlo</h3>';
        return;
    }

    contenedor.innerHTML = '';

    resenasGuardadas.forEach(function(resena) {
        const tarjeta = document.createElement('div'); 
        tarjeta.classList.add('tarjeta-resena'); 

        tarjeta.innerHTML = `
            <a href="resena_individual.html?id=${resena.id}">
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
            </a>
        `;
        contenedor.appendChild(tarjeta);
    });
}

function inicializarResenaIndividual() {
    const detalleResena = document.getElementById('detalle-resena'); 
    const btnComentar = document.getElementById('btn-comentar');
    const contenedorComentarios = document.getElementById('contenedor-comentarios');
    
    const params = new URLSearchParams(window.location.search);
    const idResenaActual = params.get('id');

    if (!idResenaActual) return;

    if (detalleResena) {
        const resenasGuardadas = JSON.parse(localStorage.getItem('Resenas')) || [];
        
        const resena = resenasGuardadas.find(r => r.id == idResenaActual);

        if (resena) {
            detalleResena.innerHTML = `
                <div class="tarjeta-resena tarjeta-resena-individual">
                    <div class="contenedor-imagen-individual">
                        <img src="${resena.imagen}" alt="Portada" class="imagen-individual">
                    </div>
                    
                    <div class="contenido-individual">
                        <h1 class="titulo-individual">${resena.titulo}</h1>
                        <h2 class="juego-individual">${resena.juego}</h2>
                        
                        <div class="contenedor-calificacion-individual">
                            <span class="calificacion-individual">${resena.calificacion} / 5</span>
                        </div>
                                    
                        <p class="opinion-individual">"${resena.opinion}"</p>
                        
                        ${resena.tags ? `<div class="tags-individual">${resena.tags}</div>` : ''}
                    </div>
                </div>
            `;
        } else {
            detalleResena.innerHTML = '<h3 class="sin-contenido">No se encontró la reseña solicitada.</h3>';
        }
    }

    if (!btnComentar || !contenedorComentarios) return;

    mostrarComentarios(idResenaActual);

    btnComentar.addEventListener('click', function() {
        const inputComentario = document.getElementById('input-comentario');
        const textoComentario = inputComentario.value.trim();
        const usuarioActivo = obtenerUsuarioLogueado(); 

        if (!usuarioActivo) {
            alert('Debes iniciar sesión para comentar.');
            window.location.href = 'inicio_sesion.html';
            return;
        }

        if (textoComentario === '') {
            alert('El comentario no puede estar vacío.');
            return;
        }

        const nuevoComentario = {
            id: Date.now(),
            idResena: idResenaActual, 
            usuario: usuarioActivo.usuario, 
            texto: textoComentario
        };

        let comentariosGuardados = JSON.parse(localStorage.getItem('Comentarios')) || [];
        comentariosGuardados.push(nuevoComentario);
        localStorage.setItem('Comentarios', JSON.stringify(comentariosGuardados));

        inputComentario.value = '';
        mostrarComentarios(idResenaActual);
    });
}

function inicializarBotonesContrasena() {
    const botonesVer = document.querySelectorAll('.ver-clave');
    
    botonesVer.forEach(boton => {
        boton.addEventListener('click', function() {
            const targetId = this.getAttribute('data-target');
            const input = document.getElementById(targetId);
            
            if (input) {
                if (input.type === 'password') {
                    input.type = 'text';
                    this.textContent = '(/)'; 
                    this.style.color = "white"
                } else {
                    input.type = 'password';
                    this.textContent = '(0)'; 
                    this.style.color = "black"
                }
            }
        });
    });
}

function mostrarComentarios(idResena) {
    const contenedor = document.getElementById('contenedor-comentarios');
    if (!contenedor) return;

    contenedor.innerHTML = '<h3 class="titulo-comentarios">Comentarios</h3>'; 

    const todosLosComentarios = JSON.parse(localStorage.getItem('Comentarios')) || [];
    
    const comentariosDeEstaResena = todosLosComentarios.filter(c => c.idResena === idResena);

    if (comentariosDeEstaResena.length === 0) {
        contenedor.innerHTML += '<p class="texto-vacio-comentarios">5mentarios jeje</p>';
        return;
    }

    const usuarioActivo = obtenerUsuarioLogueado();

    comentariosDeEstaResena.forEach(comentario => {
        const div = document.createElement('div');
        
        div.classList.add("stl-comentarios")
        
        let botonBorrar = "";
        if (usuarioActivo && usuarioActivo.usuario === comentario.usuario) {
            botonBorrar = `<button class="btn-eliminar-comentario" onclick="eliminarComentario(${comentario.id}, '${idResena}')">X</button>`;
        }

        div.innerHTML = `
            ${botonBorrar}
            <strong class="usuario-comentario">${comentario.usuario}</strong>
            <p class="texto-comentario">${comentario.texto}</p>
        `;
        
        contenedor.appendChild(div);
    });
}

function eliminarComentario(idComentario, idResena) {
    if (confirm("¿Estás seguro de que quieres borrar tu comentario?")) {
        let comentariosGuardados = JSON.parse(localStorage.getItem('Comentarios')) || [];
        
        comentariosGuardados = comentariosGuardados.filter(c => c.id !== idComentario);
        
        localStorage.setItem('Comentarios', JSON.stringify(comentariosGuardados));
        
        mostrarComentarios(idResena);
    }
}

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

function agregarTag(valor) {
    const tagTexto = valor.trim();
    if (!tagTexto) return;
    const tagExiste = LISTA_TAGS.some(tags => tags === tagTexto);

    if(!tagExiste){
        alert("usa un tag valido")
        return
    }

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

function inicializarFormulario() {
    cargarTagsJSON();
    cargarJuegosJSON();

    const paramsInicio = new URLSearchParams(window.location.search);
    const juegoDesdeInicio = paramsInicio.get('juego');
    const imgDesdeInicio = paramsInicio.get("img")
    if (juegoDesdeInicio) {
        const inputNombreJuego = document.getElementById('nombre-juego');
        if (inputNombreJuego) inputNombreJuego.value = juegoDesdeInicio;
    }
    if (imgDesdeInicio){
        const previewImg = document.getElementById('imagen-preview');
        const placeholder = document.getElementById('preview-placeholder');
        const inputImagen = document.getElementById('imagen-juego');

        if (previewImg && placeholder && inputImagen) {
            previewImg.src = imgDesdeInicio;
            previewImg.classList.remove('oculto');
            placeholder.classList.add('oculto');
            
            inputImagen.removeAttribute('required');
            inputImagen.dataset.imagenPreCargada = imgDesdeInicio; 
        }
    }

    actualizarEstrellasCalificacion(0);

    const inputTag = document.getElementById('tag-input');
    if (inputTag) {
        inputTag.addEventListener('change', () => {
            if (inputTag.value.trim() !== '') {
                agregarTag(inputTag.value);
                inputTag.value = '';
            }
        });

        inputTag.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();

                const tagpuesto = inputTag.value.trim().toLowerCase();
                if (tagpuesto !== '') {
                    let coincidencia = LISTA_TAGS.find(tag => tag.toLowerCase().startsWith(tagpuesto));
                    if (!coincidencia) {
                        coincidencia = LISTA_TAGS.find(tag => 
                            tag.toLowerCase().includes(tagpuesto));
                    }
                        
                    if (coincidencia){
                        agregarTag(coincidencia);
                    }else{
                        agregarTag(inputTag.value);
                    }
                    
                    inputTag.value = '';
                }
            }
        });
    }

    const estrellasContenedor = document.getElementById('estrellas-calificacion');
    if (estrellasContenedor) {
        estrellasContenedor.addEventListener('click', function(e) {
            if (e.target.classList.contains('estrella-item')) {
                const valor = parseInt(e.target.getAttribute('data-valor'));
                actualizarEstrellasCalificacion(valor);
            }
        });
    }

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
    
    const paramsURL = new URLSearchParams(window.location.search);
    const editId = paramsURL.get('editId');
    if (editId) {
        const resenasGuardadas = JSON.parse(localStorage.getItem('Resenas')) || [];
        const resenaAEditar = resenasGuardadas.find(r => r.id == editId);
        
        if (resenaAEditar) {
            document.getElementById('titulo-resena').value = resenaAEditar.titulo;
            document.getElementById('nombre-juego').value = resenaAEditar.juego;
            document.getElementById('opinion').value = resenaAEditar.opinion;
            
            actualizarEstrellasCalificacion(resenaAEditar.calificacion);
            
            if (resenaAEditar.tags) {
                const tagsArray = resenaAEditar.tags.split(', ');
                tagsArray.forEach(tag => agregarTag(tag));
            }
            
            if (resenaAEditar.imagen && previewImg && placeholder && inputImagen) {
                previewImg.src = resenaAEditar.imagen;
                previewImg.classList.remove('oculto');
                placeholder.classList.add('oculto');
                
                inputImagen.removeAttribute('required');
            }
            
            const btnPublicar = document.querySelector('.boton-publicar');
            if (btnPublicar) btnPublicar.textContent = 'Guardar Cambios';
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    mostrarResenas();
    inicializarFormulario();
});

const LISTA_TAGS = [
    "Acción", "Aventura", "Battle Royale", "Carreras", "Casual", "Cooperativo", "Deportes", "Estrategia", "FPS", "Hack and Slash", "Indie", "JRPG", "Lucha", "Metroidvania", "Multijugador", "Mundo Abierto", "Música/Ritmo", "Novela Visual", "Plataformas", "Puzzle", "Roguelike", "Roguelite", "RPG", "Sandbox", "Shooter", "Simulación", "Singleplayer", "Soulslike", "Stealth", "Supervivencia", "Táctico", "Terror", "TPS"
];

const LISTA_JUEGOS = [
    "Apex Legends", "Baldur's Gate 3", "Black Myth: Wukong", "Bloodborne", "Call of Duty: Warzone", "Celeste", "Counter-Strike 2", "Cuphead", "Cyberpunk 2077", "Dark Souls III", "Dead Cells", "Death Stranding", "Disco Elysium", "Doom Eternal", "Dota 2", "Elden Ring", "Fallout 4", "Final Fantasy VII Remake", "Final Fantasy XVI", "Fortnite", "Ghost of Tsushima", "God of War", "God of War Ragnarök", "Grand Theft Auto V", "Hades", "Hades II", "Half-Life 2", "Helldivers 2", "Hollow Knight", "Horizon Forbidden West", "Horizon Zero Dawn", "It Takes Two", "League of Legends", "Left 4 Dead 2", "Minecraft", "Monster Hunter Rise", "Monster Hunter: World", "No Man's Sky", "Outer Wilds", "Overwatch 2", "Palworld", "Payday 2", "Persona 5 Royal", "Portal 2", "Red Dead Redemption 2", "Resident Evil 4 Remake", "Resident Evil Village", "Sea of Thieves", "Sekiro: Shadows Die Twice", "Silent Hill 2", "Skyrim (The Elder Scrolls V)", "Slay the Spire", "Spider-Man 2", "Spider-Man Remastered", "Stardew Valley", "Starfield", "Subnautica", "Super Mario Bros. Wonder", "Super Mario Odyssey", "Terraria", "The Last of Us Part I", "The Last of Us Part II", "The Legend of Zelda: Breath of the Wild", "The Legend of Zelda: Tears of the Kingdom", "The Witcher 3: Wild Hunt", "Undertale", "Valorant", "World of Warcraft"
];

function abrirHeader(){
    document.getElementById("btn-menu").addEventListener("click", function() {
    document.getElementById("nav-links").classList.toggle("mostrar");
});
}

function cargarPaginaFiltrar() {
    const inputTexto = document.getElementById('buscador-texto');
    const selectJuego = document.getElementById('filtro-juego');
    const selectTag = document.getElementById('filtro-tag');
    const selectCalificacion = document.getElementById('filtro-calificacion');
    const btnLimpiar = document.getElementById('btn-limpiar');
    const contenedor = document.getElementById('contenedor-resenas');

    if (!contenedor || !inputTexto) return; 

    if (selectJuego) {
        selectJuego.innerHTML = '<option value="">Todos los juegos</option>';
        LISTA_JUEGOS.forEach(juego => {
            const op = document.createElement('option');
            op.value = juego;
            op.textContent = juego;
            selectJuego.appendChild(op);
        });
    }

    if (selectTag) {
        selectTag.innerHTML = '<option value="">Todos los tags</option>';
        LISTA_TAGS.forEach(tag => {
            const op = document.createElement('option');
            op.value = tag;
            op.textContent = tag;
            selectTag.appendChild(op);
        });
    }

    function aplicarFiltros() {
        const textoBusqueda = inputTexto.value.toLowerCase().trim();
        const juegoElegido = selectJuego ? selectJuego.value.toLowerCase().trim() : '';
        const tagElegido = selectTag ? selectTag.value.toLowerCase().trim() : '';
        const calificacionElegida = selectCalificacion ? selectCalificacion.value : '';

        const resenasGuardadas = JSON.parse(localStorage.getItem('Resenas')) || [];

        const filtradas = resenasGuardadas.filter(resena => {
            const coincideTexto = textoBusqueda === '' || 
                (resena.titulo || '').toLowerCase().split(' ').includes(textoBusqueda);

            const coincideJuego = juegoElegido === '' || 
                (resena.juego || '').toLowerCase().includes(juegoElegido);

            const coincideTag = tagElegido === '' || 
                (resena.tags || '').toLowerCase().includes(tagElegido);

            const coincideCalificacion = calificacionElegida === '' || 
                String(resena.calificacion) === String(calificacionElegida);

            return coincideTexto && coincideJuego && coincideTag && coincideCalificacion;
        });

        contenedor.innerHTML = '';
        if (filtradas.length === 0) {
            contenedor.innerHTML = `
                <h3 class="sin-contenido">
                    No hay reseñas con los filtros puestos
                </h3>`;
            return;
        }

        filtradas.forEach(resena => {
            const tarjeta = document.createElement('div');
            tarjeta.classList.add('tarjeta-resena');

            tarjeta.innerHTML = `
                <a href="resena_individual.html?id=${resena.id}">
                    <div class="tarjeta-imagen">
                        <img src="${resena.imagen}" alt="Portada de ${resena.juego}">
                    </div>
                    <div class="tarjeta-contenido">
                        <h3 class="tarjeta-titulo">${resena.titulo}</h3>
                        <h4 class="tarjeta-juego">${resena.juego}</h4>
                        <div class="tarjeta-puntuacion">${resena.calificacion} / 5</div>
                        <p class="tarjeta-opinion">${resena.opinion}</p>
                        ${resena.tags ? `<div class="tarjeta-tags">${resena.tags}</div>` : ''}
                    </div>
                </a>
            `;
            contenedor.appendChild(tarjeta);
        });
    }

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

    aplicarFiltros();
}

document.addEventListener('DOMContentLoaded', cargarPaginaFiltrar);

function cargarPaginaInicio() {
    const contenedor = document.getElementById('contenedor-juegos');
    if (!contenedor) return;
    const imagenPorDefecto = "/Img/gameover.jpg"

    fetch('../Json/juegos.json')
        .then(respuesta => respuesta.json())
        .then(juegos => {
            contenedor.innerHTML = '';

            juegos.forEach(juego => {
                const tarjeta = document.createElement('div');
                tarjeta.classList.add('tarjeta-resena');

                tarjeta.innerHTML = `
                <a class="boton-enlace" href="formulario.html?juego=${encodeURIComponent(juego.nombre)}&img=${encodeURIComponent(juego.imagen)}">
                    <div class="tarjeta-imagen">
                        <img src="${juego.imagen}" alt="Portada de ${juego.nombre}">
                    </div>
                    <div class="tarjeta-contenido">
                        <h3 class="tarjeta-titulo">${juego.nombre}</h3>
                        <p class="tarjeta-descripcion">${juego.descripcion}</p>
                        <a class="boton-enlace" href="formulario.html?juego=${encodeURIComponent(juego.nombre)}&img=${encodeURIComponent(juego.imagen)}"></a>
                    </div>
                </a>
                `;

                const img = tarjeta.querySelector('.tarjeta-imagen img');
                img.onerror = function() {
                    this.onerror = null;
                    this.src = imagenPorDefecto;
                };

                contenedor.appendChild(tarjeta);
            });
        })
        .catch(err => {
            contenedor.innerHTML = '<h3 class="sin-contenido">Hubo un error cargando el json de juegos, revisen porfavor</h3>';
        });
}

document.addEventListener('DOMContentLoaded', cargarPaginaInicio);

function aplicarTema(tema) {
    if (tema === 'claro') {
        document.body.classList.add('modo-claro');
    } else {
        document.body.classList.remove('modo-claro');
    }

    const texto = tema === 'claro' ? 'Claro' : 'Oscuro';
    const botonNav = document.getElementById('boton-tema');
    const botonFlotante = document.getElementById('boton-tema-flotante');
    if (botonNav) botonNav.textContent = texto;
    if (botonFlotante) botonFlotante.textContent = texto;

    localStorage.setItem('tema', tema);
}

function inicializarTema() {
    const temaGuardado = localStorage.getItem('tema') || 'oscuro';
    aplicarTema(temaGuardado);

    const botonNav = document.getElementById('boton-tema');
    if (botonNav) {
        botonNav.addEventListener('click', () => {
            const nuevoTema = document.body.classList.contains('modo-claro') ? 'oscuro' : 'claro';
            aplicarTema(nuevoTema);
        });
    }
    const botonFlotante = document.getElementById('boton-tema-flotante');
    if (botonFlotante) {
        botonFlotante.addEventListener('click', () => {
            const nuevoTema = document.body.classList.contains('modo-claro') ? 'oscuro' : 'claro';
            aplicarTema(nuevoTema);
        });
    }
}

function actualizarHeader(){
    const linkNoLogin = document.querySelectorAll(".link-nologin")
    const linkLogin = document.querySelectorAll(".link-login")
    const botonlo = document.getElementById("btn-logout")

    const usuarioLogueado = obtenerUsuarioLogueado();
    if (usuarioLogueado){
        botonlo.style.display = "inline";
        linkNoLogin.forEach(link => link.style.display = 'none' );
        linkLogin.forEach(link => link.style.display = 'inline' );
    }
    else{
        botonlo.style.display = "none";
        linkNoLogin.forEach(link => link.style.display = 'inline' );
        linkLogin.forEach(link => link.style.display = 'none' );
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const botonLogOut = document.getElementById("btn-logout")   
    if (botonLogOut) {
        botonLogOut.addEventListener("click", cerrarSesion);
    } 
    if (typeof inicializarUsuarios === 'function') {
        inicializarUsuarios();
    }

    const funcionesArrancar = [
    inicializarFormularioRegistro,
    inicializarFormularioLogin,
    inicializarBotonesContrasena,

    inicializarResenaIndividual,
    inicializarPerfil,
    mostrarResenas,
    inicializarFormulario,
    inicializarTema,
    actualizarHeader,
    abrirHeader,]

    funcionesArrancar.forEach(funcion => {
        try{
            if(typeof funcion === 'function'){
                funcion();
            }
        }catch (error){
            console.warn("La funcion ${funcion.name} esta tirando problemas, revisar")
        }
    })
});
