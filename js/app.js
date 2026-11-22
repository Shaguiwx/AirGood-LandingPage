/*
   AIRGOOD - FUNCIONES GENERALES
   Archivo: app.js
*/

const AirGood = {

    // 01. GUARDAR DATOS

    guardar: function (clave, datos) {
        try {
            localStorage.setItem(
                clave,
                JSON.stringify(datos)
            );

            return true;

        } catch (error) {
            console.error("Error al guardar:", error);
            return false;
        }
    },


    // 02. OBTENER DATOS

    obtener: function (clave, valorDefecto = null) {
        try {
            const datos = localStorage.getItem(clave);

            if (datos === null) {
                return valorDefecto;
            }

            return JSON.parse(datos);

        } catch (error) {
            console.error("Error al obtener:", error);
            return valorDefecto;
        }
    },


    // 03. ELIMINAR DATOS

    eliminar: function (clave) {
        try {
            localStorage.removeItem(clave);
            return true;

        } catch (error) {
            console.error("Error al eliminar:", error);
            return false;
        }
    },


    // 04. MOSTRAR MENSAJES 

    mostrarMensaje: function (mensaje, tipo = "info") {

        let contenedor = document.getElementById(
            "mensaje-sistema"
        );

        if (!contenedor) {
            contenedor = document.createElement("div");

            contenedor.id = "mensaje-sistema";
            contenedor.setAttribute("role", "status");
            contenedor.setAttribute("aria-live", "polite");

            document.body.appendChild(contenedor);
        }

        contenedor.textContent = mensaje;
        contenedor.className = "mensaje-sistema " + tipo;
        contenedor.hidden = false;

        // El aviso se oculta solo a los pocos segundos
        clearTimeout(AirGood.temporizadorMensaje);
        AirGood.temporizadorMensaje = setTimeout(function () {
            contenedor.hidden = true;
        }, 4500);
    }

};


/* ==========================================================
   05. DATOS DE DEMOSTRACIÓN COMPARTIDOS (Inicio y Mapa)
   Valores ilustrativos: no son mediciones reales.
   ========================================================== */

AirGood.estaciones = [
    { id: "ate", nombre: "Estación Ate", distrito: "Ate",
      tipo: "oficial", lat: -12.0258, lng: -76.9186,
      ica: 156, pm25: 62, pm10: 118, ozono: 54 },
    { id: "santa-anita", nombre: "Sensor Santa Anita", distrito: "Santa Anita",
      tipo: "comunitario", lat: -12.0436, lng: -76.9715,
      ica: 132, pm25: 48, pm10: 96, ozono: 49 },
    { id: "comas", nombre: "Estación Comas", distrito: "Comas",
      tipo: "oficial", lat: -11.9360, lng: -77.0600,
      ica: 108, pm25: 38, pm10: 80, ozono: 44 },
    { id: "san-isidro", nombre: "Estación San Isidro", distrito: "San Isidro",
      tipo: "oficial", lat: -12.0977, lng: -77.0365,
      ica: 74, pm25: 24, pm10: 55, ozono: 40 },
    { id: "surco", nombre: "Sensor Santiago de Surco", distrito: "Santiago de Surco",
      tipo: "comunitario", lat: -12.1453, lng: -77.0089,
      ica: 68, pm25: 21, pm10: 49, ozono: 38 },
    { id: "miraflores", nombre: "Sensor Miraflores", distrito: "Miraflores",
      tipo: "comunitario", lat: -12.1211, lng: -77.0297,
      ica: 45, pm25: 12, pm10: 30, ozono: 33 }
];

AirGood.niveles = [
    { max: 50,  clase: "bueno",      color: "#2F9E5E", texto: "Bueno" },
    { max: 100, clase: "moderado",   color: "#F0C10F", texto: "Moderado" },
    { max: 150, clase: "sensible",   color: "#E97C1D", texto: "Dañino para sensibles" },
    { max: 200, clase: "danino",     color: "#DB3A31", texto: "Dañino" },
    { max: 300, clase: "muy-danino", color: "#8143A4", texto: "Muy dañino" },
    { max: Infinity, clase: "peligroso", color: "#7E0023", texto: "Peligroso" }
];

AirGood.nivelICA = function (ica) {
    return AirGood.niveles.find(function (nivel) {
        return ica <= nivel.max;
    });
};

AirGood.normalizar = function (texto) {
    return String(texto || "")
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim();
};

AirGood.etiquetasTipo = {
    humo: "Humo",
    trafico: "Tráfico vehicular",
    polvo: "Polvo",
    obras: "Obras de construcción",
    industrial: "Emisiones industriales"
};

// Alertas de ejemplo de alertas.html menos las que ya se marcaron como leídas.
// Cuando existan alertas reales, este número vendrá del servidor.
AirGood.alertasPendientes = function () {
    const TOTAL_DEMO = 2;
    const leidas = AirGood.obtener("airgood_alertas_leidas", []);

    return Math.max(
        0,
        TOTAL_DEMO - (Array.isArray(leidas) ? leidas.length : 0)
    );
};


/* ==========================================================
   06. ICONOS DE LÍNEA (se pintan en cualquier [data-icono])
   ========================================================== */

AirGood.iconos = {
    inicio: '<path d="M3 11l9-8 9 8"/><path d="M5 10v10h14V10"/><path d="M10 20v-6h4v6"/>',
    mapa: '<path d="M12 21s7-6.2 7-11a7 7 0 0 0-14 0c0 4.8 7 11 7 11z"/><circle cx="12" cy="10" r="2.5"/>',
    reportes: '<circle cx="12" cy="12" r="9"/><path d="M12 7v6"/><path d="M12 16.5v.5"/>',
    alertas: '<path d="M6 9a6 6 0 0 1 12 0c0 6 2 7 2 7H4s2-1 2-7"/><path d="M10 20a2 2 0 0 0 4 0"/>',
    perfil: '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/>',
    filtros: '<path d="M4 7h10"/><path d="M18 7h2"/><path d="M4 17h2"/><path d="M10 17h10"/><circle cx="16" cy="7" r="2"/><circle cx="8" cy="17" r="2"/>',
    todos: '<rect x="4" y="4" width="6.5" height="6.5" rx="1.5"/><rect x="13.5" y="4" width="6.5" height="6.5" rx="1.5"/><rect x="4" y="13.5" width="6.5" height="6.5" rx="1.5"/><rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.5"/>',
    humo: '<path d="M3 8h10a3 3 0 1 0-3-3"/><path d="M3 12h15a3 3 0 1 1-3 3"/><path d="M3 16h7"/>',
    trafico: '<path d="M5 16l1.5-5a2 2 0 0 1 2-1.5h7a2 2 0 0 1 2 1.5L19 16"/><rect x="3" y="16" width="18" height="4" rx="1.5"/><path d="M7.5 18h.01"/><path d="M16.5 18h.01"/>',
    polvo: '<path d="M6 8h.01"/><path d="M12 6h.01"/><path d="M18 9h.01"/><path d="M9 13h.01"/><path d="M15 14h.01"/><path d="M6 18h.01"/><path d="M12 18h.01"/><path d="M18 18h.01"/>',
    obras: '<path d="M4 18h16"/><path d="M6 18a6 6 0 0 1 12 0"/><path d="M12 8v4"/>',
    industrial: '<path d="M3 20V11l6 4v-4l6 4V5h4v15z"/>'
};

AirGood.icono = function (nombre) {
    const trazo = AirGood.iconos[nombre];

    if (!trazo) {
        return "";
    }

    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
        'stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" ' +
        'aria-hidden="true" focusable="false">' + trazo + "</svg>";
};

AirGood.pintarIconos = function (raiz) {
    (raiz || document).querySelectorAll("[data-icono]").forEach(
        function (elemento) {
            if (!elemento.firstChild) {
                elemento.innerHTML = AirGood.icono(elemento.dataset.icono);
            }
        }
    );
};


/* ==========================================================
   07. NAVEGACIÓN: ícono + etiqueta (el ícono solo se ve en móvil)
   ========================================================== */

AirGood.iniciarNavegacion = function () {
    document.querySelectorAll(".navegacion a").forEach(function (enlace) {
        const destino = (enlace.getAttribute("href") || "")
            .replace(".html", "");

        const texto = enlace.textContent.trim();

        const icono = document.createElement("span");
        icono.className = "nav-icono";
        icono.dataset.icono = destino;

        const etiqueta = document.createElement("span");
        etiqueta.className = "nav-texto";
        etiqueta.textContent = texto;

        enlace.replaceChildren(icono, etiqueta);
    });
};

document.addEventListener("DOMContentLoaded", function () {
    AirGood.iniciarNavegacion();
    AirGood.pintarIconos();
});