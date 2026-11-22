document.addEventListener("DOMContentLoaded", function () {

    // 1. Obtener elementos HTML

    const formulario = document.getElementById("form-nuevo-reporte");

    const formularioFiltros = document.getElementById(
        "form-filtros-reportes"
    );

    const listaReportes = document.querySelector(
        ".seccion-listado-reportes"
    );

    const botonUbicacion = document.getElementById(
        "btn-ubicacion"
    );

    const estadoUbicacion = document.getElementById(
        "estado-ubicacion"
    );

    const campoLatitud = document.getElementById("latitud");
    const campoLongitud = document.getElementById("longitud");

    const CLAVE_REPORTES = "airgood_reportes";


    // 2. Recuperar reportes guardados

    let reportes = AirGood.obtener(CLAVE_REPORTES, []);

    if (!Array.isArray(reportes)) {
        reportes = [];
    }


    // 3. Funciones auxiliares

    function obtenerCampo(id) {
        return document.getElementById(id);
    }

    function obtenerTexto(id) {
        const campo = obtenerCampo(id);

        return campo ? campo.value.trim() : "";
    }

    function obtenerFechaActual() {
        return new Date().toISOString();
    }

    function formatearFecha(fecha) {
        const valor = new Date(fecha);

        if (Number.isNaN(valor.getTime())) {
            return "Fecha no disponible";
        }

        return valor.toLocaleString("es-PE", {
            dateStyle: "medium",
            timeStyle: "short"
        });
    }

    function agregarTexto(contenedor, etiqueta, texto) {
        const elemento = document.createElement(etiqueta);

        elemento.textContent = texto;
        contenedor.appendChild(elemento);

        return elemento;
    }

    function obtenerEtiquetaTipo(tipo) {
        const tipos = {
            humo: "Humo",
            trafico: "Tráfico vehicular",
            polvo: "Polvo",
            obras: "Obras de construcción",
            industrial: "Emisiones industriales"
        };

        return tipos[tipo] || tipo;
    }


    // 4. Crear una tarjeta de reporte

    function crearTarjeta(reporte) {
        const tarjeta = document.createElement("article");

        tarjeta.className = "tarjeta-reporte";
        tarjeta.dataset.distrito = reporte.distrito;
        tarjeta.dataset.tipo = reporte.tipo;
        tarjeta.dataset.reporteId = reporte.id;

        agregarTexto(
            tarjeta,
            "h4",
            obtenerEtiquetaTipo(reporte.tipo)
        );

        agregarTexto(
            tarjeta,
            "p",
            "Distrito: " + reporte.distrito
        );

        agregarTexto(
            tarjeta,
            "p",
            "Referencia: " + reporte.referencia
        );

        agregarTexto(
            tarjeta,
            "p",
            "Intensidad: " + reporte.intensidad
        );

        agregarTexto(
            tarjeta,
            "p",
            reporte.descripcion
        );

        const fecha = agregarTexto(
            tarjeta,
            "time",
            formatearFecha(reporte.fecha)
        );

        fecha.dateTime = reporte.fecha;

        if (reporte.latitud !== null &&
            reporte.longitud !== null) {

            agregarTexto(
                tarjeta,
                "p",
                "Ubicación aproximada registrada"
            );
        }

        if (reporte.fotoNombre) {
            agregarTexto(
                tarjeta,
                "p",
                "Archivo seleccionado: " + reporte.fotoNombre
            );
        }

        agregarTexto(
            tarjeta,
            "p",
            "Reporte de demostración, guardado en este navegador."
        );

        return tarjeta;
    }


    // 5. Mostrar reportes guardados

    function mostrarReportes() {
        if (!listaReportes) {
            return;
        }

        let contenedor = document.getElementById(
            "reportes-guardados"
        );

        if (!contenedor) {
            contenedor = document.createElement("div");
            contenedor.id = "reportes-guardados";
            contenedor.className = "lista-reportes";

            listaReportes.appendChild(contenedor);
        }

        contenedor.replaceChildren();

        reportes.forEach(function (reporte) {
            contenedor.appendChild(crearTarjeta(reporte));
        });

        aplicarFiltros();
    }


    // 6. Validar formulario

    function validarReporte(datos) {
        if (!datos.tipo || !datos.distrito ||
            !datos.descripcion || !datos.intensidad) {

            AirGood.mostrarMensaje(
                "Completa los campos obligatorios.",
                "error"
            );

            return false;
        }

        if (datos.descripcion.length > 500) {
            AirGood.mostrarMensaje(
                "La descripción no debe superar 500 caracteres.",
                "error"
            );

            return false;
        }

        if (datos.fecha &&
            Number.isNaN(new Date(datos.fecha).getTime())) {

            AirGood.mostrarMensaje(
                "Ingresa una fecha válida.",
                "error"
            );

            return false;
        }

        return true;
    }


    // 7. Registrar nuevo reporte

    if (formulario) {
        formulario.addEventListener("submit", function (evento) {
            evento.preventDefault();

            const archivo = obtenerCampo("foto-incidente");

            const latitudTexto = obtenerTexto("latitud");
            const longitudTexto = obtenerTexto("longitud");

            const reporte = {
                id: "reporte-" + Date.now() + "-" +
                    Math.random().toString(36).slice(2, 8),

                tipo: obtenerTexto("tipo-incidente"),
                distrito: obtenerTexto("distrito-reporte"),
                referencia: obtenerTexto("referencia"),
                intensidad: obtenerTexto("intensidad"),
                descripcion: obtenerTexto("descripcion"),

                fecha: obtenerTexto("fecha-incidente") ||
                    obtenerFechaActual(),

                latitud: latitudTexto === ""
                    ? null
                    : Number(latitudTexto),

                longitud: longitudTexto === ""
                    ? null
                    : Number(longitudTexto),

                fotoNombre: archivo && archivo.files.length > 0
                    ? archivo.files[0].name
                    : null
            };

            if (!validarReporte(reporte)) {
                return;
            }

            // El archivo de imagen no se almacena.
            // Solo registramos su nombre como demostración.

            const nuevosReportes = [reporte, ...reportes];

            const guardado = AirGood.guardar(
                CLAVE_REPORTES,
                nuevosReportes
            );

            if (!guardado) {
                AirGood.mostrarMensaje(
                    "No se pudo guardar el reporte.",
                    "error"
                );
                return;
            }

            reportes = nuevosReportes;

            mostrarReportes();
            formulario.reset();

            if (estadoUbicacion) {
                estadoUbicacion.textContent =
                    "No se ha seleccionado una ubicación.";
            }

            AirGood.mostrarMensaje(
                "Reporte de demostración guardado correctamente.",
                "exito"
            );
        });
    }


    // 8. Obtener ubicación del dispositivo

    if (botonUbicacion) {
        botonUbicacion.addEventListener("click", function () {

            if (!navigator.geolocation) {
                AirGood.mostrarMensaje(
                    "Tu navegador no admite geolocalización.",
                    "error"
                );
                return;
            }

            if (estadoUbicacion) {
                estadoUbicacion.textContent =
                    "Solicitando permiso de ubicación...";
            }

            navigator.geolocation.getCurrentPosition(
                function (posicion) {
                    if (campoLatitud) {
                        campoLatitud.value =
                            posicion.coords.latitude;
                    }

                    if (campoLongitud) {
                        campoLongitud.value =
                            posicion.coords.longitude;
                    }

                    if (estadoUbicacion) {
                        estadoUbicacion.textContent =
                            "Ubicación aproximada obtenida.";
                    }

                    AirGood.mostrarMensaje(
                        "Ubicación registrada para el reporte.",
                        "exito"
                    );
                },

                function () {
                    if (estadoUbicacion) {
                        estadoUbicacion.textContent =
                            "No fue posible obtener tu ubicación.";
                    }

                    AirGood.mostrarMensaje(
                        "Comprueba los permisos de ubicación.",
                        "error"
                    );
                },

                {
                    enableHighAccuracy: false,
                    timeout: 10000,
                    maximumAge: 60000
                }
            );
        });
    }


    // 9. Filtrar reportes por distrito y categoría

    function aplicarFiltros() {
        if (!formularioFiltros) {
            return;
        }

        const selectores = formularioFiltros.querySelectorAll(
            "select"
        );

        const distritoFiltro = formularioFiltros.querySelector(
            '[name="distrito"], #filtro-distrito'
        ) || selectores[0];

        const tipoFiltro = formularioFiltros.querySelector(
            '[name="categoria"], [name="tipo"], #filtro-categoria'
        ) || selectores[1];

        const distrito = distritoFiltro
            ? distritoFiltro.value.toLowerCase()
            : "";

        const tipo = tipoFiltro
            ? tipoFiltro.value.toLowerCase()
            : "";

        const tarjetas = listaReportes
            ? listaReportes.querySelectorAll(
                ".tarjeta-reporte"
            )
            : [];

        tarjetas.forEach(function (tarjeta) {
            const distritoTarjeta = (
                tarjeta.dataset.distrito || ""
            ).toLowerCase();

            const tipoTarjeta = (
                tarjeta.dataset.tipo || ""
            ).toLowerCase();

            const coincideDistrito =
                !distrito ||
                distrito === "todos" ||
                distrito === "todas" ||
                distritoTarjeta === distrito;

            const coincideTipo =
                !tipo ||
                tipo === "todos" ||
                tipo === "todas" ||
                tipoTarjeta === tipo;

            tarjeta.hidden = !(
                coincideDistrito && coincideTipo
            );
        });
    }

    if (formularioFiltros) {
        formularioFiltros.addEventListener(
            "submit",
            function (evento) {
                evento.preventDefault();
                aplicarFiltros();
            }
        );

        formularioFiltros.addEventListener(
            "change",
            aplicarFiltros
        );
    }


    // 10. Chips de tipo de incidente (vista móvil)
    // Cambian el selector oculto y reutilizan el mismo filtro.

    const chips = document.querySelectorAll(".chip-categoria");
    const selectorCategoria = document.getElementById("filtro-categoria");

    chips.forEach(function (chip) {
        chip.addEventListener("click", function () {

            if (selectorCategoria) {
                selectorCategoria.value = chip.dataset.valor;

                selectorCategoria.dispatchEvent(
                    new Event("change", { bubbles: true })
                );
            }

            chips.forEach(function (otro) {
                otro.setAttribute(
                    "aria-pressed",
                    String(otro === chip)
                );
            });
        });
    });


    // 11. Inicializar pantalla

    mostrarReportes();

});