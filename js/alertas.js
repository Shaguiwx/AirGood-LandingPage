
/* ==========================================================
   AIRGOOD - GESTIÓN DE ALERTAS
   Archivo: alertas.js
   ========================================================== */

document.addEventListener("DOMContentLoaded", function () {

    /* ======================================================
       01. OBTENER ELEMENTOS HTML
       ====================================================== */

    const botonesFiltro = document.querySelectorAll(
        ".filtro-alerta"
    );

    const tarjetasAlertas = document.querySelectorAll(
        ".tarjeta-alerta"
    );

    const botonMarcarTodas = document.getElementById(
        "marcar-todas-leidas"
    );

    const formularioConfiguracion = document.getElementById(
        "form-configuracion-alertas"
    );

    const selectorUmbral = document.getElementById(
        "umbral-alerta"
    );

    const notificacionesActivas = document.getElementById(
        "notificaciones-activas"
    );


    /* ======================================================
       02. FILTRAR ALERTAS
       ====================================================== */

    botonesFiltro.forEach(function (boton) {

        boton.addEventListener("click", function () {

            const filtro = boton.dataset.filtro;

            // Quitar selección anterior
            botonesFiltro.forEach(function (otroBoton) {

                otroBoton.classList.remove("activo");

                otroBoton.setAttribute(
                    "aria-pressed",
                    "false"
                );
            });

            // Activar el filtro seleccionado
            boton.classList.add("activo");

            boton.setAttribute(
                "aria-pressed",
                "true"
            );

            // Mostrar las alertas correspondientes
            tarjetasAlertas.forEach(function (tarjeta) {

                const tipo = tarjeta.dataset.tipo;

                if (filtro === "todas" || filtro === tipo) {
                    tarjeta.hidden = false;
                } else {
                    tarjeta.hidden = true;
                }

            });

        });

    });


    /* ======================================================
       03. MARCAR UNA ALERTA COMO LEÍDA
       ====================================================== */

    function marcarComoLeida(tarjeta, indice) {

        tarjeta.classList.add("alerta-leida");

        const boton = tarjeta.querySelector(".marcar-leida");

        if (boton) {
            boton.textContent = "Leída";
            boton.disabled = true;
        }

        // Guardar el estado en el navegador
        const alertasLeidas = AirGood.obtener(
            "airgood_alertas_leidas",
            []
        );

        if (!alertasLeidas.includes(indice)) {
            alertasLeidas.push(indice);

            AirGood.guardar(
                "airgood_alertas_leidas",
                alertasLeidas
            );
        }

    }


    /* ======================================================
       04. RECUPERAR ALERTAS LEÍDAS
       ====================================================== */

    const alertasGuardadas = AirGood.obtener(
        "airgood_alertas_leidas",
        []
    );

    tarjetasAlertas.forEach(function (tarjeta, indice) {

        if (alertasGuardadas.includes(indice)) {
            marcarComoLeida(tarjeta, indice);
        }

        const boton = tarjeta.querySelector(".marcar-leida");

        if (boton) {

            boton.addEventListener("click", function () {

                marcarComoLeida(tarjeta, indice);

                AirGood.mostrarMensaje(
                    "Alerta marcada como leída.",
                    "exito"
                );

            });

        }

    });


    /* ======================================================
       05. MARCAR TODAS COMO LEÍDAS
       ====================================================== */

    if (botonMarcarTodas) {

        botonMarcarTodas.addEventListener(
            "click",
            function () {

                tarjetasAlertas.forEach(
                    function (tarjeta, indice) {

                        marcarComoLeida(tarjeta, indice);

                    }
                );

                AirGood.mostrarMensaje(
                    "Todas las alertas fueron marcadas como leídas.",
                    "exito"
                );

            }
        );

    }


    /* ======================================================
       06. COMPARTIR POR WHATSAPP
       ====================================================== */

    const botonesCompartir = document.querySelectorAll(
        ".compartir-alerta"
    );

    botonesCompartir.forEach(function (boton) {

        boton.addEventListener("click", function () {

            const tarjeta = boton.closest(".tarjeta-alerta");

            if (!tarjeta) {
                return;
            }

            const titulo = tarjeta.querySelector("h4");

            const contenido = tarjeta.querySelector(
                ".contenido-alerta"
            );

            const mensaje =
                "Aviso de AirGood (demostración)\n\n" +
                (titulo ? titulo.textContent.trim() : "") +
                "\n" +
                (contenido ? contenido.innerText.trim() : "");

            const url = "https://wa.me/?text=" +
                encodeURIComponent(mensaje);

            window.open(
                url,
                "_blank",
                "noopener,noreferrer"
            );

        });

    });


    /* ======================================================
       07. CARGAR CONFIGURACIÓN GUARDADA
       ====================================================== */

    const configuracionGuardada = AirGood.obtener(
        "airgood_configuracion_alertas",
        null
    );

    if (configuracionGuardada) {

        if (selectorUmbral) {
            selectorUmbral.value =
                configuracionGuardada.umbral;
        }

        if (notificacionesActivas) {
            notificacionesActivas.checked =
                configuracionGuardada.activas;
        }

    }


    /* ======================================================
       08. GUARDAR CONFIGURACIÓN
       ====================================================== */

    if (formularioConfiguracion) {

        formularioConfiguracion.addEventListener(
            "submit",
            function (evento) {

                // Evitar recargar la página
                evento.preventDefault();

                const configuracion = {

                    umbral: selectorUmbral.value,

                    activas: notificacionesActivas.checked

                };

                const guardado = AirGood.guardar(
                    "airgood_configuracion_alertas",
                    configuracion
                );

                if (guardado) {

                    AirGood.mostrarMensaje(
                        "Configuración guardada correctamente.",
                        "exito"
                    );

                } else {

                    AirGood.mostrarMensaje(
                        "No se pudo guardar la configuración.",
                        "error"
                    );

                }

            }
        );

    }
    
    

});
