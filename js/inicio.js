/* ==========================================================
   AIRGOOD - PANTALLA DE INICIO
   Archivo: inicio.js
   Descripción: Personalización del panel principal
   ========================================================== */

document.addEventListener("DOMContentLoaded", function () {

    /* ======================================================
       01. OBTENER ELEMENTOS HTML
       ====================================================== */

    const seccionBienvenida = document.querySelector(
        ".seccion-bienvenida"
    );

    const seccionCalidadAire = document.querySelector(
        ".seccion-calidad-aire"
    );

    const seccionRecomendaciones = document.querySelector(
        ".seccion-recomendaciones"
    );

    const selectorDistrito = seccionBienvenida
        ? seccionBienvenida.querySelector("select")
        : null;


    /* ======================================================
       02. OBTENER DATOS DEL USUARIO
       ====================================================== */

    let usuario = AirGood.obtener(
        "airgood_usuario",
        null
    );

    if (!usuario) {

        // Usuario de demostración sin registro previo
        usuario = {
            nombre: "Visitante",
            correo: "",
            distrito: "",
            perfiles: []
        };

    }


    /* ======================================================
       03. PERSONALIZAR BIENVENIDA
       ====================================================== */

    function mostrarBienvenida() {

        if (!seccionBienvenida) {
            return;
        }

        const titulo = seccionBienvenida.querySelector(
            "h2"
        );

        if (!titulo) {
            return;
        }

        const primerNombre = usuario.nombre
            .trim()
            .split(/\s+/)[0];

        titulo.textContent =
            "¡Hola, " + primerNombre + "!";

    }


    /* ======================================================
       04. MOSTRAR DISTRITO PRINCIPAL
       ====================================================== */

    function cargarDistrito() {

        if (!selectorDistrito || !usuario.distrito) {
            return;
        }

        const opciones = Array.from(
            selectorDistrito.options
        );

        const opcionEncontrada = opciones.find(
            function (opcion) {

                return opcion.value.toLowerCase() ===
                    usuario.distrito.toLowerCase();

            }
        );

        if (opcionEncontrada) {
            selectorDistrito.value =
                opcionEncontrada.value;
        }

    }


    /* ======================================================
       05. GUARDAR CAMBIO DE DISTRITO
       ====================================================== */

    if (selectorDistrito) {

        selectorDistrito.addEventListener(
            "change",
            function () {

                const nuevoDistrito =
                    selectorDistrito.value;

                if (!nuevoDistrito) {
                    return;
                }

                usuario.distrito = nuevoDistrito;

                const guardado = AirGood.guardar(
                    "airgood_usuario",
                    usuario
                );

                if (guardado) {

                    AirGood.mostrarMensaje(
                        "Distrito principal actualizado.",
                        "exito"
                    );

                } else {

                    AirGood.mostrarMensaje(
                        "No se pudo actualizar el distrito.",
                        "error"
                    );

                }

                /*
                   En una siguiente etapa se
                   consultarán las mediciones del
                   nuevo distrito mediante una API.
                */

            }
        );

    }


    /* ======================================================
       06. IDENTIFICAR PERFIL DEL USUARIO
       ====================================================== */

    function obtenerDescripcionPerfil() {

        const perfiles = Array.isArray(usuario.perfiles)
            ? usuario.perfiles
            : [];

        if (perfiles.includes("respiratorio")) {
            return "Perfil con afección respiratoria";
        }

        if (perfiles.includes("adulto-mayor")) {
            return "Perfil de adulto mayor";
        }

        if (perfiles.includes("cuidador")) {
            return "Perfil de cuidador";
        }

        if (perfiles.includes("deportista")) {
            return "Perfil de deportista";
        }

        return "Perfil general";
    }


    /* ======================================================
       07. MOSTRAR PERFIL EN RECOMENDACIONES
       ====================================================== */

    function mostrarPerfil() {

        if (!seccionRecomendaciones) {
            return;
        }

        let etiqueta = document.getElementById(
            "perfil-activo-inicio"
        );

        if (!etiqueta) {

            etiqueta = document.createElement("p");

            etiqueta.id = "perfil-activo-inicio";
            etiqueta.className = "etiqueta-perfil";

            const titulo = seccionRecomendaciones.querySelector(
                "h2, h3"
            );

            if (titulo) {
                titulo.insertAdjacentElement(
                    "afterend",
                    etiqueta
                );
            } else {
                seccionRecomendaciones.prepend(etiqueta);
            }

        }

        etiqueta.textContent =
            obtenerDescripcionPerfil();

    }


    /* ======================================================
       08. IDENTIFICAR EL PANEL DE CALIDAD DEL AIRE
       ====================================================== */

    function prepararPanelICA() {

        if (!seccionCalidadAire) {
            return;
        }

        /*
           Por ahora se conserva el ICA ilustrativo
           escrito en inicio.html.

           Más adelante esta sección recibirá:
           - ICA actual del distrito
           - Categoría correspondiente
           - PM2.5 y PM10
           - Hora de actualización
           - Fuente de las mediciones
        */

        seccionCalidadAire.dataset.modo =
            "demostracion";

    }


    /* ======================================================
       08b. SALUDO, CAMPANA Y CARRUSELES (VISTA MÓVIL)
       ====================================================== */

    function legible(texto) {

        return String(texto || "")
            .split("-")
            .map(function (parte) {
                return parte.charAt(0).toUpperCase() + parte.slice(1);
            })
            .join(" ");

    }

    function mostrarSaludoMovil() {

        const nombre = (usuario.nombre || "").trim() || "Visitante";
        const hora = new Date().getHours();

        const franja = hora < 12
            ? "Buenos días"
            : hora < 19
                ? "Buenas tardes"
                : "Buenas noches";

        const textoFranja = document.getElementById("saludo-franja");
        const textoNombre = document.getElementById("saludo-nombre");
        const avatar = document.getElementById("avatar-iniciales");
        const punto = document.getElementById("punto-alerta");

        if (textoFranja) { textoFranja.textContent = franja; }
        if (textoNombre) { textoNombre.textContent = nombre.split(/\s+/)[0]; }
        if (avatar) { avatar.textContent = nombre.charAt(0).toUpperCase(); }
        if (punto) { punto.hidden = AirGood.alertasPendientes() === 0; }

    }

    function crearTarjetaCarrusel(icono, titulo, detalle, extra) {

        const tarjeta = document.createElement("article");
        tarjeta.className = "tarjeta-carrusel";

        const circulo = document.createElement("span");
        circulo.className = "icono-circulo";
        circulo.dataset.icono = icono;

        const encabezado = document.createElement("strong");
        encabezado.textContent = titulo;

        const linea = document.createElement("p");
        linea.textContent = detalle;

        tarjeta.append(circulo, encabezado, linea);

        if (extra) {
            tarjeta.appendChild(extra);
        }

        return tarjeta;

    }

    function crearMensajeVacio(texto) {

        const mensaje = document.createElement("p");
        mensaje.className = "carrusel-vacio";
        mensaje.textContent = texto;

        return mensaje;

    }

    function mostrarCarruselZonas() {

        const contenedor = document.getElementById("carrusel-zonas");

        if (!contenedor) {
            return;
        }

        const zonas = AirGood.obtener("airgood_zonas", []);

        contenedor.replaceChildren();

        if (!Array.isArray(zonas) || zonas.length === 0) {

            contenedor.appendChild(
                crearMensajeVacio(
                    "Aún no guardaste zonas. Agrégalas desde tu perfil."
                )
            );

            return;
        }

        zonas.forEach(function (zona) {

            const clave = AirGood.normalizar(zona.distrito);

            const estacion = AirGood.estaciones.find(function (e) {

                const distrito = AirGood.normalizar(e.distrito);

                return distrito === clave ||
                    (clave.length > 4 && distrito.includes(clave));

            });

            let extra;

            if (estacion) {

                const nivel = AirGood.nivelICA(estacion.ica);

                extra = document.createElement("span");
                extra.className = "insignia-ica";
                extra.textContent =
                    "ICA " + estacion.ica + " · " + nivel.texto;
                extra.style.background = nivel.color;
                extra.style.color =
                    nivel.clase === "moderado" ? "#112017" : "#fff";

            } else {

                extra = document.createElement("small");
                extra.textContent = "Sin datos de ICA para este distrito";

            }

            contenedor.appendChild(
                crearTarjetaCarrusel(
                    "mapa",
                    zona.nombre,
                    zona.distrito,
                    extra
                )
            );

        });

        AirGood.pintarIconos(contenedor);

    }

    function mostrarCarruselReportes() {

        const contenedor = document.getElementById("carrusel-reportes");

        if (!contenedor) {
            return;
        }

        const reportes = AirGood.obtener("airgood_reportes", []);

        contenedor.replaceChildren();

        if (!Array.isArray(reportes) || reportes.length === 0) {

            contenedor.appendChild(
                crearMensajeVacio(
                    "Todavía no hay reportes. Crea el primero desde la pestaña Reportes."
                )
            );

            return;
        }

        reportes.slice(0, 6).forEach(function (reporte) {

            const descripcion = document.createElement("p");
            descripcion.className = "texto-corto";
            descripcion.textContent = reporte.descripcion;

            const icono = AirGood.iconos[reporte.tipo]
                ? reporte.tipo
                : "reportes";

            contenedor.appendChild(
                crearTarjetaCarrusel(
                    icono,
                    AirGood.etiquetasTipo[reporte.tipo] || reporte.tipo,
                    legible(reporte.distrito),
                    descripcion
                )
            );

        });

        AirGood.pintarIconos(contenedor);

    }


    /* ======================================================
       09. INICIALIZAR PANTALLA
       ====================================================== */

    function iniciarPagina() {

        mostrarBienvenida();

        cargarDistrito();

        mostrarPerfil();

        prepararPanelICA();

        mostrarSaludoMovil();

        mostrarCarruselZonas();

        mostrarCarruselReportes();

    }

    iniciarPagina();

});