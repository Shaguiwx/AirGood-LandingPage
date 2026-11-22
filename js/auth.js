
/* ==========================================================
   AIRGOOD - AUTENTICACIÓN
   Archivo: auth.js
   Descripción: Registro e inicio de sesión de demostración
   ========================================================== */

document.addEventListener("DOMContentLoaded", function () {

    /* ======================================================
       01. OBTENER FORMULARIOS
       ====================================================== */

    const formularioLogin = document.getElementById(
        "form-login"
    );

    const formularioRegistro = document.getElementById(
        "form-registro"
    );


    /* ======================================================
       02. FUNCIONES AUXILIARES
       ====================================================== */

    function obtenerCampo(formulario, identificadores) {

        for (const identificador of identificadores) {

            const campo = formulario.querySelector(
                `[id="${identificador}"], [name="${identificador}"]`
            );

            if (campo) {
                return campo;
            }
        }

        return null;
    }


    function mostrarError(mensaje) {

        AirGood.mostrarMensaje(
            mensaje,
            "error"
        );

    }


    function obtenerUsuarioRegistrado() {

        return AirGood.obtener(
            "airgood_usuario",
            null
        );

    }


    function iniciarSesion(usuario) {

        // Guardamos únicamente la sesión de demostración.
        sessionStorage.setItem(
            "airgood_sesion",
            JSON.stringify({
                correo: usuario.correo,
                iniciada: true
            })
        );

    }


    /* ======================================================
       03. REGISTRO DE USUARIO
       ====================================================== */

    if (formularioRegistro) {

        formularioRegistro.addEventListener(
            "submit",
            function (evento) {

                evento.preventDefault();

                const campoNombre = obtenerCampo(
                    formularioRegistro,
                    ["nombre", "nombre-completo", "nombre-registro"]
                );

                const campoCorreo = obtenerCampo(
                    formularioRegistro,
                    ["correo", "email", "correo-registro"]
                );

                const campoContrasena = obtenerCampo(
                    formularioRegistro,
                    ["contrasena", "password", "clave", "password-registro"]
                );

                if (!campoNombre || !campoCorreo || !campoContrasena) {

                    mostrarError(
                        "No se encontraron todos los campos de registro."
                    );

                    return;
                }

                const nombre = campoNombre.value.trim();

                const correo = campoCorreo.value
                    .trim()
                    .toLowerCase();

                const contrasena = campoContrasena.value;

                /* Validaciones */

                if (!nombre || !correo || !contrasena) {

                    mostrarError(
                        "Completa todos los campos obligatorios."
                    );

                    return;
                }

                if (!campoCorreo.checkValidity()) {

                    mostrarError(
                        "Ingresa un correo electrónico válido."
                    );

                    return;
                }

                if (contrasena.length < 8) {

                    mostrarError(
                        "La contraseña debe tener al menos 8 caracteres."
                    );

                    return;
                }

                /* Guardar datos no sensibles */

                const usuario = {
                    nombre: nombre,
                    correo: correo,
                    distrito: "",
                    perfiles: []
                };

                const guardado = AirGood.guardar(
                    "airgood_usuario",
                    usuario
                );

                if (!guardado) {

                    mostrarError(
                        "No fue posible guardar el registro."
                    );

                    return;
                }

                iniciarSesion(usuario);

                AirGood.mostrarMensaje(
                    "Registro de demostración completado.",
                    "exito"
                );

                /* Continuar a selección de perfil */

                window.location.href =
                    "seleccionar-perfil.html";

            }
        );

    }


    /* ======================================================
       04. INICIO DE SESIÓN
       ====================================================== */

    if (formularioLogin) {

        formularioLogin.addEventListener(
            "submit",
            function (evento) {

                evento.preventDefault();

                const campoCorreo = obtenerCampo(
                    formularioLogin,
                    ["correo", "email", "correo-login"]
                );

                const campoContrasena = obtenerCampo(
                    formularioLogin,
                    ["contrasena", "password", "clave", "password-login"]
                );

                if (!campoCorreo || !campoContrasena) {

                    mostrarError(
                        "No se encontraron los campos de inicio de sesión."
                    );

                    return;
                }

                const correo = campoCorreo.value
                    .trim()
                    .toLowerCase();

                const contrasena = campoContrasena.value;

                if (!correo || !contrasena) {

                    mostrarError(
                        "Ingresa tu correo y contraseña."
                    );

                    return;
                }

                const usuario = obtenerUsuarioRegistrado();

                if (!usuario || usuario.correo !== correo) {

                    mostrarError(
                        "No existe un registro de demostración con ese correo."
                    );

                    return;
                }

                /*
                   IMPORTANTE:
                   Esta versión no verifica contraseñas.
                   Solo simula el ingreso para probar
                   la navegación de AirGood.
                */

                iniciarSesion(usuario);

                const configuracionCompleta =
                    Boolean(usuario.distrito) &&
                    Array.isArray(usuario.perfiles);

                if (configuracionCompleta) {

                    window.location.href = "inicio.html";

                } else {

                    window.location.href =
                        "seleccionar-perfil.html";

                }

            }
        );

    }

});
