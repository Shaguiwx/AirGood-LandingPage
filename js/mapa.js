/* ==========================================================
   AIRGOOD - MAPA DE CALIDAD DEL AIRE
   Archivo: mapa.js
   Requiere Leaflet (se carga en mapa.html antes de este archivo)
   ========================================================== */

document.addEventListener("DOMContentLoaded", function () {

    /* ======================================================
       01. ELEMENTOS HTML
       ====================================================== */

    const contenedorMapa = document.getElementById("mapa-interactivo");
    const formularioBusqueda = document.getElementById("form-busqueda-mapa");
    const campoBusqueda = document.getElementById("buscar-distrito");
    const filtroParques = document.getElementById("mostrar-parques");
    const filtroSensores = document.getElementById("mostrar-sensores");
    const datosEstacion = document.getElementById("datos-estacion");
    const listaReportesZona = document.getElementById("lista-reportes-zona");

    if (!contenedorMapa) {
        return;
    }

    if (typeof L === "undefined") {
        contenedorMapa.textContent =
            "No se pudo cargar el mapa. Revisa tu conexión a internet.";
        return;
    }


    /* ======================================================
       02. DATOS DE DEMOSTRACIÓN
       ====================================================== */

    // Estaciones y niveles de demostración: se definen en app.js
    // para compartirlos con Inicio. No son mediciones reales.
    const estaciones = AirGood.estaciones;

    const parques = [
        { nombre: "Parque Kennedy", lat: -12.1219, lng: -77.0297 },
        { nombre: "Bosque El Olivar", lat: -12.0978, lng: -77.0345 },
        { nombre: "Parque de la Reserva", lat: -12.0698, lng: -77.0349 }
    ];

    const obtenerNivel = AirGood.nivelICA;


    /* ======================================================
       03. FUNCIONES AUXILIARES
       ====================================================== */

    function normalizar(texto) {
        return String(texto || "")
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .trim();
    }

    function crear(etiqueta, texto, clase) {
        const el = document.createElement(etiqueta);
        el.textContent = texto;
        if (clase) { el.className = clase; }
        return el;
    }


    /* ======================================================
       04. CREAR EL MAPA
       ====================================================== */

    contenedorMapa.replaceChildren();
    contenedorMapa.classList.add("mapa-activo");

    const mapa = L.map(contenedorMapa, {
        center: [-12.07, -77.02],
        zoom: 11,
        scrollWheelZoom: false
    });

    L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
        {
            maxZoom: 18,
            attribution:
                '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> ' +
                '&copy; <a href="https://carto.com/attributions">CARTO</a>'
        }
    ).addTo(mapa);

    const capaEstaciones = L.layerGroup().addTo(mapa);
    const capaParques = L.layerGroup();
    const marcadores = new Map();


    /* ======================================================
       05. MARCADORES DE ESTACIONES
       ====================================================== */

    function crearIcono(estacion, seleccionado) {
        const nivel = obtenerNivel(estacion.ica);
        const forma = estacion.tipo === "oficial" ? "" : " marcador-comunitario";
        const activo = seleccionado ? " marcador-activo" : "";

        return L.divIcon({
            className: "marcador-ica-contenedor",
            html: '<span class="marcador-ica' + forma + activo +
                  '" style="background:' + nivel.color + '">' +
                  estacion.ica + "</span>",
            iconSize: [44, 44],
            iconAnchor: [22, 22]
        });
    }

    estaciones.forEach(function (estacion) {
        const marcador = L.marker([estacion.lat, estacion.lng], {
            icon: crearIcono(estacion, false),
            title: estacion.nombre + ", ICA " + estacion.ica,
            keyboard: true
        });

        marcador.on("click", function () {
            seleccionarEstacion(estacion);
        });

        marcadores.set(estacion.id, marcador);
    });


    /* ======================================================
       06. PARQUES Y ÁREAS VERDES
       ====================================================== */

    parques.forEach(function (parque) {
        L.circle([parque.lat, parque.lng], {
            radius: 320,
            color: "#2F9E5E",
            weight: 2,
            fillColor: "#7BCB98",
            fillOpacity: 0.45
        })
            .bindTooltip(parque.nombre)
            .addTo(capaParques);
    });


    /* ======================================================
       07. PANEL DE DETALLE
       ====================================================== */

    function mostrarReportesZona(estacion) {
        if (!listaReportesZona) { return; }

        listaReportesZona.replaceChildren();

        const guardados = AirGood.obtener("airgood_reportes", []);
        const clave = normalizar(estacion.distrito);

        const delDistrito = Array.isArray(guardados)
            ? guardados.filter(function (r) {
                return normalizar(r.distrito).replace(/-/g, " ") ===
                    clave.replace(/santiago de /, "");
            })
            : [];

        if (delDistrito.length === 0) {
            listaReportesZona.appendChild(
                crear("p", "Aún no hay reportes ciudadanos en " +
                    estacion.distrito + ".")
            );
            return;
        }

        delDistrito.slice(0, 3).forEach(function (r) {
            const item = document.createElement("p");
            item.append(
                crear("strong", r.tipo + ": "),
                document.createTextNode(r.descripcion)
            );
            listaReportesZona.appendChild(item);
        });
    }

    function seleccionarEstacion(estacion) {
        const nivel = obtenerNivel(estacion.ica);

        // Resaltar marcador activo
        estaciones.forEach(function (e) {
            marcadores.get(e.id).setIcon(crearIcono(e, e.id === estacion.id));
        });

        datosEstacion.replaceChildren();

        const insignia = crear(
            "p",
            "ICA " + estacion.ica + " · " + nivel.texto,
            "insignia-ica nivel-" + nivel.clase
        );
        insignia.style.background = nivel.color;
        insignia.style.color = nivel.clase === "moderado" ? "#112017" : "#fff";

        datosEstacion.append(
            crear("h4", estacion.nombre),
            crear("p", estacion.distrito + " · " +
                (estacion.tipo === "oficial" ? "Estación oficial" : "Sensor comunitario")),
            insignia,
            crear("p", "Datos de demostración, no son mediciones actuales.",
                "aviso-demostracion")
        );

        document.getElementById("valor-pm25").textContent = estacion.pm25 + " µg/m³";
        document.getElementById("valor-pm10").textContent = estacion.pm10 + " µg/m³";
        document.getElementById("valor-ozono").textContent = estacion.ozono + " µg/m³";

        mostrarReportesZona(estacion);

        mapa.flyTo([estacion.lat, estacion.lng], 13, { duration: 0.8 });
    }


    /* ======================================================
       08. FILTROS Y BÚSQUEDA
       ====================================================== */

    function aplicarFiltros() {
        const busqueda = normalizar(campoBusqueda ? campoBusqueda.value : "");
        const incluirComunitarios = filtroSensores ? filtroSensores.checked : true;

        capaEstaciones.clearLayers();
        const visibles = [];

        estaciones.forEach(function (e) {
            const coincide = busqueda === "" ||
                normalizar(e.distrito).includes(busqueda);
            const tipoOk = incluirComunitarios || e.tipo !== "comunitario";

            if (coincide && tipoOk) {
                capaEstaciones.addLayer(marcadores.get(e.id));
                visibles.push([e.lat, e.lng]);
            }
        });

        if (visibles.length > 0 && busqueda !== "") {
            mapa.fitBounds(visibles, { padding: [60, 60], maxZoom: 13 });
        }

        if (visibles.length === 0) {
            AirGood.mostrarMensaje(
                "No se encontraron estaciones con esos filtros.",
                "info"
            );
        }
    }

    if (formularioBusqueda) {
        formularioBusqueda.addEventListener("submit", function (evento) {
            evento.preventDefault();
            aplicarFiltros();
        });
    }

    if (campoBusqueda) {
        campoBusqueda.addEventListener("input", aplicarFiltros);
    }

    if (filtroSensores) {
        filtroSensores.addEventListener("change", aplicarFiltros);
    }

    if (filtroParques) {
        filtroParques.addEventListener("change", function () {
            if (filtroParques.checked) {
                capaParques.addTo(mapa);
            } else {
                mapa.removeLayer(capaParques);
            }
        });
    }


    // Botón de filtros (visible solo en móvil)
    const botonFiltros = document.getElementById("btn-filtros-mapa");
    const panelFiltros = document.getElementById("panel-filtros-mapa");

    if (botonFiltros && panelFiltros) {
        botonFiltros.addEventListener("click", function () {
            const abierto = panelFiltros.classList.toggle("abierto");
            botonFiltros.setAttribute("aria-expanded", String(abierto));
        });
    }


    /* ======================================================
       09. INICIALIZAR
       ====================================================== */

    aplicarFiltros();

    // El mapa se dibuja bien aunque el contenedor cambie de tamaño
    setTimeout(function () { mapa.invalidateSize(); }, 200);

});