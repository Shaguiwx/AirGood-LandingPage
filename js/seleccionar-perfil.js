
/* ==========================================================
   AIRGOOD - SELECCIÓN DE PERFIL
   Archivo: seleccionar-perfil.js
   Descripción: Configuración inicial del usuario
   ========================================================== */

document.addEventListener("DOMContentLoaded", function () {

    /* ======================================================
       01. OBTENER ELEMENTOS HTML
       ====================================================== */

    const formulario = document.getElementById("form-perfil");

    if (!formulario) {
        return;
    }

    const opcionesPerfil = formulario.querySelectorAll(
        'input[type="checkbox"]'
    );

    const selectorDistrito = formulario.querySelector(
        'select[name="distrito"], #distrito-principal, #distrito'
    );

    const botonContinuar = formulario.querySelector(
        'button[type="submit"]'
    );


    /* ======================================================
       02. IDENTIFICAR PERFILES
       ====================================================== */

    const perfilesValidos = [
        "respiratorio",
        "cuidador",
        "adulto-mayor",
        "deportista"
    ];

    const valoresGenerales = [
        "general",
        "ninguno",
        "informativo",
        "solo-informarme"
    ];

    function normalizarValor(valor) {

        return String(valor || "")
            .trim()
            .toLowerCase()
            .replace(/\s+/g, "-");
    }

    function esPerfilGeneral(casilla) {

        const valor = normalizarValor(casilla.value);

        return valoresGenerales.includes(valor) ||
            casilla.id === "solo-informarme";
    }

    function obtenerPerfilesSeleccionados() {

        const seleccionados = [];

        opcionesPerfil.forEach(function (casilla) {

            if (!casilla.checked) {
                return;
            }

            if (esPerfilGeneral(casilla)) {
                seleccionados.push("general");
                return;
            }

            const valor = normalizarValor(casilla.value);

            if (perfilesValidos.includes(valor)) {
                seleccionados.push(valor);
            }

        });

        return [...new Set(seleccionados)];
    }


    /* ======================================================
       03. SELECCIÓN EXCLUSIVA DEL PERFIL GENERAL
       ====================================================== */

    opcionesPerfil.forEach(function (casilla) {

        casilla.addEventListener("change", function () {

            if (casilla.checked) {

                if (esPerfilGeneral(casilla)) {

                    // Solo quiero informarme:
                    // desmarcar todos los demás perfiles.

                    opcionesPerfil.forEach(function (otra) {

                        if (otra !== casilla) {
                            otra.checked = false;
                        }

                    });

                } else {

                    // Si selecciona un perfil de salud,
                    // desmarcar la opción general.

                    opcionesPerfil.forEach(function (otra) {

                        if (esPerfilGeneral(otra)) {
                            otra.checked = false;
                        }

                    });

                }

            }

            actualizarBoton();

        });

    });


    /* ======================================================
       04. VALIDAR FORMULARIO
       ====================================================== */

    function formularioValido() {

        const perfiles = obtenerPerfilesSeleccionados();

        const distrito = selectorDistrito
            ? selectorDistrito.value.trim()
            : "";

        return perfiles.length > 0 && distrito !== "";
    }

    function actualizarBoton() {

        if (!botonContinuar) {
            return;
        }

        botonContinuar.disabled = !formularioValido();

    }

    if (selectorDistrito) {

        selectorDistrito.addEventListener(
            "change",
            actualizarBoton
        );

    }


    /* ======================================================
       05. RECUPERAR PREFERENCIAS EXISTENTES
       ====================================================== */

    function cargarPreferencias() {

        const usuario = AirGood.obtener(
            "airgood_usuario",
            null
        );

        if (!usuario) {
            return;
        }

        const perfilesGuardados = Array.isArray(usuario.perfiles)
            ? usuario.perfiles
            : [];

        opcionesPerfil.forEach(function (casilla) {

            const valor = esPerfilGeneral(casilla)
                ? "general"
                : normalizarValor(casilla.value);

            casilla.checked = perfilesGuardados.includes(
                valor
            );

        });

        if (selectorDistrito && usuario.distrito) {

            const opcion = Array.from(
                selectorDistrito.options
            ).find(function (item) {

                return item.value.toLowerCase() ===
                    usuario.distrito.toLowerCase();

            });

            if (opcion) {
                selectorDistrito.value = opcion.value;
            }

        }

    }


    /* ======================================================
       06. GUARDAR PERFIL Y DISTRITO
       ====================================================== */

    formulario.addEventListener("submit", function (evento) {

        evento.preventDefault();

        if (!formularioValido()) {

            AirGood.mostrarMensaje(
                "Selecciona un perfil y tu distrito.",
                "error"
            );

            return;
        }

        const usuario = AirGood.obtener(
            "airgood_usuario",
            null
        );

        if (!usuario) {

            AirGood.mostrarMensaje(
                "Primero debes completar el registro.",
                "error"
            );

            return;
        }

        usuario.perfiles = obtenerPerfilesSeleccionados();
        usuario.distrito = selectorDistrito.value.trim();

        const guardado = AirGood.guardar(
            "airgood_usuario",
            usuario
        );

        if (!guardado) {

            AirGood.mostrarMensaje(
                "No se pudo guardar tu configuración.",
                "error"
            );

            return;
        }

        window.location.href = "inicio.html";

    });


    /* ======================================================
       07. INICIALIZACIÓN
       ====================================================== */

    cargarPreferencias();
    actualizarBoton();

});
