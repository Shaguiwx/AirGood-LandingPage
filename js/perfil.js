
document.addEventListener("DOMContentLoaded", function () {

    // 1. Obtener elementos HTML

    const formularioDatos = document.getElementById(
        "form-datos-personales"
    );

    const botonGuardarPerfiles = document.getElementById(
        "guardar-perfiles"
    );

    const listaZonas = document.getElementById(
        "lista-zonas"
    );

    const botonAgregarZona = document.getElementById(
        "agregar-zona"
    );

    const listaSensores = document.getElementById(
        "lista-sensores"
    );

    const formularioSensor = document.getElementById(
        "form-vincular-sensor"
    );

    const formularioAccesibilidad = document.getElementById(
        "form-accesibilidad"
    );

    const botonCerrarSesion = document.getElementById(
        "cerrar-sesion"
    );

    const botonEliminarCuenta = document.getElementById(
        "eliminar-cuenta"
    );


    // 2. Definir claves de almacenamiento

    const CLAVE_USUARIO = "airgood_usuario";
    const CLAVE_ZONAS = "airgood_zonas";
    const CLAVE_SENSORES = "airgood_sensores";
    const CLAVE_ACCESIBILIDAD = "airgood_accesibilidad";

    let usuario = AirGood.obtener(CLAVE_USUARIO, null);

    let zonas = AirGood.obtener(CLAVE_ZONAS, []);
    let sensores = AirGood.obtener(CLAVE_SENSORES, []);

    if (!Array.isArray(zonas)) {
        zonas = [];
    }

    if (!Array.isArray(sensores)) {
        sensores = [];
    }


    // 3. Funciones auxiliares

    function obtenerCampo(id) {
        return document.getElementById(id);
    }

    function obtenerTexto(id) {
        const campo = obtenerCampo(id);

        return campo ? campo.value.trim() : "";
    }

    function crearElemento(etiqueta, texto) {
        const elemento = document.createElement(etiqueta);

        elemento.textContent = texto;

        return elemento;
    }

    function mostrarMensaje(mensaje, tipo = "info") {
        AirGood.mostrarMensaje(mensaje, tipo);
    }

    function guardarLista(clave, lista) {
        return AirGood.guardar(clave, lista);
    }


    // 4. Cargar información personal

    function cargarDatosPersonales() {
        if (!usuario) {
            return;
        }

        const campoNombre = obtenerCampo("nombre-usuario");
        const campoCorreo = obtenerCampo("correo-usuario");
        const campoDistrito = obtenerCampo("distrito-principal");

        if (campoNombre) {
            campoNombre.value = usuario.nombre || "";
        }

        if (campoCorreo) {
            campoCorreo.value = usuario.correo || "";
        }

        if (campoDistrito && usuario.distrito) {
            const opcion = Array.from(
                campoDistrito.options
            ).find(function (elemento) {
                return elemento.value === usuario.distrito;
            });

            if (opcion) {
                campoDistrito.value = usuario.distrito;
            }
        }
    }


    // 5. Guardar información personal

    if (formularioDatos) {
        formularioDatos.addEventListener("submit", function (evento) {
            evento.preventDefault();

            const nombre = obtenerTexto("nombre-usuario");
            const correo = obtenerTexto("correo-usuario");
            const distrito = obtenerTexto("distrito-principal");

            if (!nombre || !correo || !distrito) {
                mostrarMensaje(
                    "Completa todos los datos personales.",
                    "error"
                );
                return;
            }

            const campoCorreo = obtenerCampo("correo-usuario");

            if (campoCorreo && !campoCorreo.checkValidity()) {
                mostrarMensaje(
                    "Ingresa un correo válido.",
                    "error"
                );
                return;
            }

            const actualizado = {
                ...(usuario || {}),
                nombre: nombre,
                correo: correo.toLowerCase(),
                distrito: distrito
            };

            if (AirGood.guardar(CLAVE_USUARIO, actualizado)) {
                usuario = actualizado;

                mostrarMensaje(
                    "Datos personales actualizados.",
                    "exito"
                );
            } else {
                mostrarMensaje(
                    "No se pudieron guardar los cambios.",
                    "error"
                );
            }
        });
    }


    // 6. Cargar perfiles de salud

    const casillasPerfiles = document.querySelectorAll(
        'input[name="perfil-salud"]'
    );

    function cargarPerfiles() {
        const perfiles = usuario &&
            Array.isArray(usuario.perfiles)
            ? usuario.perfiles
            : [];

        casillasPerfiles.forEach(function (casilla) {
            casilla.checked = perfiles.includes(casilla.value);
        });
    }


    // 7. Actualizar perfiles de salud

    if (botonGuardarPerfiles) {
        botonGuardarPerfiles.addEventListener("click", function () {

            if (!usuario) {
                mostrarMensaje(
                    "Primero registra una cuenta de demostración.",
                    "error"
                );
                return;
            }

            const perfiles = [];

            casillasPerfiles.forEach(function (casilla) {
                if (casilla.checked) {
                    perfiles.push(casilla.value);
                }
            });

            usuario.perfiles = perfiles.length > 0
                ? perfiles
                : ["general"];

            if (AirGood.guardar(CLAVE_USUARIO, usuario)) {
                mostrarMensaje(
                    "Perfiles actualizados correctamente.",
                    "exito"
                );
            } else {
                mostrarMensaje(
                    "No se pudieron actualizar los perfiles.",
                    "error"
                );
            }
        });
    }


    // 8. Mostrar zonas guardadas

    function mostrarZonas() {
        if (!listaZonas) {
            return;
        }

        listaZonas.replaceChildren();

        if (zonas.length === 0) {
            listaZonas.appendChild(
                crearElemento(
                    "p",
                    "Todavía no tienes zonas guardadas."
                )
            );
            return;
        }

        zonas.forEach(function (zona) {
            const tarjeta = document.createElement("article");

            tarjeta.className = "tarjeta-zona";

            tarjeta.appendChild(
                crearElemento("h4", zona.nombre)
            );

            tarjeta.appendChild(
                crearElemento(
                    "p",
                    "Distrito: " + zona.distrito
                )
            );

            tarjeta.appendChild(
                crearElemento(
                    "p",
                    "ICA: pendiente de consultar"
                )
            );

            const etiqueta = document.createElement("label");
            const casilla = document.createElement("input");

            casilla.type = "checkbox";
            casilla.checked = zona.alertas;

            etiqueta.append(
                casilla,
                document.createTextNode(
                    " Recibir alertas de esta zona"
                )
            );

            casilla.addEventListener("change", function () {
                const actualizadas = zonas.map(function (item) {
                    return item.id === zona.id
                        ? { ...item, alertas: casilla.checked }
                        : item;
                });

                if (guardarLista(CLAVE_ZONAS, actualizadas)) {
                    zonas = actualizadas;
                    mostrarMensaje(
                        "Preferencia de alertas actualizada.",
                        "exito"
                    );
                } else {
                    casilla.checked = !casilla.checked;
                    mostrarMensaje(
                        "No se pudo guardar el cambio.",
                        "error"
                    );
                }
            });

            const botonEliminar = document.createElement("button");

            botonEliminar.type = "button";
            botonEliminar.className =
                "btn-secundario eliminar-zona";

            botonEliminar.textContent = "Eliminar zona";

            botonEliminar.addEventListener("click", function () {

                if (!confirm("¿Deseas eliminar esta zona?")) {
                    return;
                }

                const actualizadas = zonas.filter(
                    function (item) {
                        return item.id !== zona.id;
                    }
                );

                if (guardarLista(CLAVE_ZONAS, actualizadas)) {
                    zonas = actualizadas;
                    mostrarZonas();

                    mostrarMensaje(
                        "Zona eliminada.",
                        "exito"
                    );
                }
            });

            tarjeta.append(
                etiqueta,
                botonEliminar
            );

            listaZonas.appendChild(tarjeta);
        });
    }


    // 9. Agregar nueva zona

    if (botonAgregarZona) {
        botonAgregarZona.addEventListener("click", function () {

            const nombreIngresado = prompt(
                "Nombre de la zona (Casa, Trabajo, Parque):"
            );

            if (nombreIngresado === null) {
                return;
            }

            const nombre = nombreIngresado.trim();

            if (!nombre) {
                mostrarMensaje(
                    "Ingresa un nombre para la zona.",
                    "error"
                );
                return;
            }

            const distritoIngresado = prompt(
                "¿En qué distrito se encuentra?"
            );

            if (distritoIngresado === null) {
                return;
            }

            const distrito = distritoIngresado.trim();

            if (!distrito) {
                mostrarMensaje(
                    "Ingresa el distrito de la zona.",
                    "error"
                );
                return;
            }

            const nuevaZona = {
                id: "zona-" + Date.now() + "-" +
                    Math.random().toString(36).slice(2, 7),
                nombre: nombre,
                distrito: distrito,
                alertas: true
            };

            const actualizadas = [...zonas, nuevaZona];

            if (guardarLista(CLAVE_ZONAS, actualizadas)) {
                zonas = actualizadas;
                mostrarZonas();

                mostrarMensaje(
                    "Nueva zona guardada.",
                    "exito"
                );
            } else {
                mostrarMensaje(
                    "No se pudo guardar la zona.",
                    "error"
                );
            }
        });
    }


    // 10. Mostrar sensores vinculados

    function mostrarSensores() {
        if (!listaSensores) {
            return;
        }

        listaSensores.replaceChildren();

        if (sensores.length === 0) {
            listaSensores.appendChild(
                crearElemento(
                    "p",
                    "No tienes sensores registrados."
                )
            );
            return;
        }

        sensores.forEach(function (sensor) {
            const tarjeta = document.createElement("article");

            tarjeta.className = "tarjeta-sensor";

            tarjeta.appendChild(
                crearElemento("h4", sensor.nombre)
            );

            tarjeta.appendChild(
                crearElemento(
                    "p",
                    "Código: " + sensor.codigo
                )
            );

            tarjeta.appendChild(
                crearElemento(
                    "p",
                    "Estado: registro de demostración"
                )
            );

            const boton = document.createElement("button");

            boton.type = "button";
            boton.className = "btn-secundario";
            boton.textContent = "Quitar sensor";

            boton.addEventListener("click", function () {

                if (!confirm("¿Quitar este sensor?")) {
                    return;
                }

                const actualizados = sensores.filter(
                    function (item) {
                        return item.codigo !== sensor.codigo;
                    }
                );

                if (guardarLista(CLAVE_SENSORES, actualizados)) {
                    sensores = actualizados;
                    mostrarSensores();

                    mostrarMensaje(
                        "Sensor retirado de la lista.",
                        "exito"
                    );
                }
            });

            tarjeta.appendChild(boton);
            listaSensores.appendChild(tarjeta);
        });
    }


    // 11. Registrar nuevo sensor

    if (formularioSensor) {
        formularioSensor.addEventListener("submit", function (evento) {
            evento.preventDefault();

            const nombre = obtenerTexto("nombre-sensor");
            const codigo = obtenerTexto("codigo-sensor");

            if (!nombre || !codigo) {
                mostrarMensaje(
                    "Completa el nombre y código del sensor.",
                    "error"
                );
                return;
            }

            const repetido = sensores.some(function (sensor) {
                return sensor.codigo.toLowerCase() ===
                    codigo.toLowerCase();
            });

            if (repetido) {
                mostrarMensaje(
                    "Ya existe un sensor con ese código.",
                    "error"
                );
                return;
            }

            const nuevoSensor = {
                nombre: nombre,
                codigo: codigo
            };

            const actualizados = [...sensores, nuevoSensor];

            if (guardarLista(CLAVE_SENSORES, actualizados)) {
                sensores = actualizados;

                mostrarSensores();
                formularioSensor.reset();

                mostrarMensaje(
                    "Sensor registrado en la demostración.",
                    "exito"
                );
            } else {
                mostrarMensaje(
                    "No se pudo registrar el sensor.",
                    "error"
                );
            }
        });
    }


    // 12. Aplicar preferencias de accesibilidad

    const campoTamano = obtenerCampo("tamano-letra");
    const campoContraste = obtenerCampo("alto-contraste");

    function aplicarAccesibilidad(configuracion) {
        const tamanos = {
            normal: "100%",
            grande: "112.5%",
            "muy-grande": "125%"
        };

        const tamano = Object.hasOwn(
            tamanos,
            configuracion.tamano
        ) ? configuracion.tamano : "normal";

        document.documentElement.style.fontSize =
            tamanos[tamano];

        document.body.classList.toggle(
            "alto-contraste",
            Boolean(configuracion.contraste)
        );
    }

    function cargarAccesibilidad() {
        const configuracion = AirGood.obtener(
            CLAVE_ACCESIBILIDAD,
            {
                tamano: "normal",
                contraste: false
            }
        );

        if (campoTamano) {
            campoTamano.value = configuracion.tamano;
        }

        if (campoContraste) {
            campoContraste.checked =
                Boolean(configuracion.contraste);
        }

        aplicarAccesibilidad(configuracion);
    }


    // 13. Guardar preferencias de accesibilidad

    if (formularioAccesibilidad) {
        formularioAccesibilidad.addEventListener(
            "submit",
            function (evento) {
                evento.preventDefault();

                const configuracion = {
                    tamano: campoTamano
                        ? campoTamano.value
                        : "normal",

                    contraste: campoContraste
                        ? campoContraste.checked
                        : false
                };

                if (AirGood.guardar(
                    CLAVE_ACCESIBILIDAD,
                    configuracion
                )) {
                    aplicarAccesibilidad(configuracion);

                    mostrarMensaje(
                        "Preferencias de accesibilidad guardadas.",
                        "exito"
                    );
                } else {
                    mostrarMensaje(
                        "No se pudieron guardar las preferencias.",
                        "error"
                    );
                }
            }
        );
    }


    // 14. Cerrar sesión de demostración

    if (botonCerrarSesion) {
        botonCerrarSesion.addEventListener("click", function () {

            sessionStorage.removeItem("airgood_sesion");

            window.location.href = "login.html";

        });
    }


    // 15. Eliminar datos locales de demostración

    if (botonEliminarCuenta) {
        botonEliminarCuenta.addEventListener(
            "click",
            function () {

                const confirmado = confirm(
                    "¿Deseas borrar los datos de demostración " +
                    "guardados por AirGood en este navegador? " +
                    "Esta acción no se puede deshacer."
                );

                if (!confirmado) {
                    return;
                }

                const segundaConfirmacion = prompt(
                    'Para confirmar, escribe ELIMINAR:'
                );

                if (segundaConfirmacion !== "ELIMINAR") {
                    mostrarMensaje(
                        "Operación cancelada.",
                        "info"
                    );
                    return;
                }

                const claves = [
                    CLAVE_USUARIO,
                    CLAVE_ZONAS,
                    CLAVE_SENSORES,
                    CLAVE_ACCESIBILIDAD,
                    "airgood_reportes",
                    "airgood_alertas_leidas",
                    "airgood_configuracion_alertas"
                ];

                claves.forEach(function (clave) {
                    AirGood.eliminar(clave);
                });

                sessionStorage.removeItem("airgood_sesion");

                /*
                   Solo se borran datos locales.
                   No se elimina ninguna cuenta real.
                */

                window.location.href = "login.html";
            }
        );
    }


    // 16. Inicializar pantalla

    cargarDatosPersonales();
    cargarPerfiles();
    mostrarZonas();
    mostrarSensores();
    cargarAccesibilidad();

});
