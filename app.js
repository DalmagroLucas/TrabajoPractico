// Seleccionamos el formulario por su ID
const formulario = document.getElementById('formulario-juego');

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
        const palabrasClaves = document.getElementById('palabras-claves').value;

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

                // Limpiamos el formulario y notificamos al usuario[cite: 1]
                formulario.reset();
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


// ==========================================
// 4. INICIALIZACIÓN
// ==========================================

// Ejecutamos la función de mostrar reseñas apenas la estructura del DOM esté lista[cite: 3]
document.addEventListener('DOMContentLoaded', mostrarResenas);