const UI = (() => {
    const A = Air;
    const page = document.body.dataset.page;
    const app = document.querySelector('#app');
    const state = { selected: A.getBase().id, compare: ['san-juan-de-lurigancho', 'miraflores'], comparePeriod: 'promedio', map: null, selectedReportLocation: false, draft: false, chartPeriod: 7, mapPins: true };
    const icon = (name, extra = '') => window.AirIcons[name] || window.AirIcons.info;
    const link = (title, href, cls = '') => `<a class="${cls}" href="${href}">${title}</a>`;
    const choices = (chosen = '', initial = 'Selecciona un distrito') => `<option value="">${initial}</option>${A.zones.map(z => `<option value="${z.id}" ${z.id === chosen ? 'selected' : ''}>${A.esc(z.name)}</option>`).join('')}`;
    const title = (eyebrow, heading, desc = '') => `<div class="heading"><span class="eyebrow">${eyebrow}</span><h1>${heading}</h1>${desc ? `<p>${desc}</p>` : ''}</div>`;
    const levelPill = val => `<span class="level-pill level-${A.level(val).code}">${icon(A.level(val).icon)} ${A.level(val).name}</span>`;
    const officialLink = a => `<a class="source-official" href="${A.esc(a.official || A.officialUrl(A.zone(a.id)))}" target="_blank" rel="noopener noreferrer">Consultar SENAMHI ${icon('open_in_new')}</a>`;
    const infoSource = a => {
        const valid = A.validAqi(a.ica);
        const grid = valid && a.grid && Number.isFinite(a.grid.latitude) && Number.isFinite(a.grid.longitude)
            ? `<span class="source-grid">Celda del modelo: ${a.grid.latitude.toFixed(2)}°, ${a.grid.longitude.toFixed(2)}°</span>` : '';
        return `<div class="source-row source-verified">${icon(valid ? 'query_stats' : 'wifi_off')}<div><strong>${valid ? 'Estimación regional · CAMS Global / Open-Meteo' : 'Sin datos actuales disponibles'}</strong><p>${A.esc(a.note)}</p>${valid ? `<p>Hora de referencia (Lima): <b>${A.esc(A.stamp(a.time))}</b></p>` : ''}${grid}${officialLink(a)}</div></div>`;
    };
    const notices = () => `<div class="toast-area" id="toast-area" aria-live="polite"></div><div class="modal-root" id="modal-root"></div>`;
    const navs = [['inicio', 'Inicio'], ['mapa', 'Mapa'], ['comparar', 'Comparar'], ['reportes', 'Reportes'], ['alertas', 'Alertas'], ['perfil', 'Mi perfil']];
    const logo = () => `<a class="logo" href="index.html" aria-label="AirGood, ir a la portada"><span class="logo-icon">${icon('air')}</span><span>Air<span class="logo-accent">Good</span></span></a>`;
    function header() {
        const inside = !['index', 'login', 'registro', 'recuperar', 'seleccionar-perfil', 'educacion', 'preguntas-frecuentes'].includes(page);
        const menu = inside ? navs : [['index', 'Inicio'], ['index#consulta', 'Consultar distrito'], ['index#beneficios', 'Qué ofrecemos'], ['index#preguntas', 'Preguntas frecuentes'], ['index#contacto', 'Contacto']];
        return `<a class="skip" href="#main">Saltar al contenido</a><div class="utility"><div class="shell utility-inner"><span>${icon('eco')} Una ciudad más saludable empieza con información clara</span><div class="utility-actions"><span class="utility-label">Accesibilidad</span><button class="utility-button" id="font-minus" type="button" aria-label="Reducir tamaño del texto">A−</button><button class="utility-button" id="font-plus" type="button" aria-label="Aumentar tamaño del texto">A+</button><button class="utility-button" id="contrast-toggle" type="button" aria-pressed="false">${icon('contrast')} <span>Contraste</span></button></div></div></div>
    <header class="main-header"><div class="shell header-row">${logo()}<button class="menu-toggle" id="menu-toggle" aria-controls="nav-panel" aria-expanded="false" type="button">${icon('menu')} Menú</button><nav id="nav-panel" class="nav-panel" aria-label="Navegación principal"><div class="nav-links">${menu.map(([target, label]) => `<a href="${target.includes('#') ? target : target + '.html'}" ${target === page ? 'aria-current="page"' : ''}>${label}</a>`).join('')}</div><div class="nav-actions">${A.sessions() ? `<span class="user-chip">${icon('account_circle')} ${A.esc(A.user().name.split(' ')[0])}</span><button class="btn btn-ghost btn-sm" type="button" data-action="logout">Salir</button>` : `${link('Ingresar', 'login.html', 'btn btn-ghost btn-sm')}${link('Crear cuenta', 'registro.html', 'btn btn-primary btn-sm')}`}</div></nav></div></header>`;
    }
    function footer() { return `<footer class="footer"><div class="shell foot-grid"><div><div class="foot-brand">${logo()}</div><p>Respira informado, vive mejor. Calidad del aire y acciones preventivas para los distritos de Lima.</p></div><div><h3>Explora</h3>${link('Consultar distritos', 'mapa.html')}${link('Comparar zonas', 'comparar.html')}${link('Reportes ciudadanos', 'reportes.html')}</div><div><h3>Ayuda</h3>${link('¿Qué es el ICA?', 'educacion.html')}${link('Preguntas frecuentes', 'preguntas-frecuentes.html')}${link('Mi perfil', 'perfil.html')}</div><div><h3>Acerca de los datos</h3><p>La consulta actual usa estimaciones regionales CAMS Global mediante Open-Meteo. La sección Comparar usa mediciones históricas ATU 2023; son fuentes, periodos y unidades diferentes. Reportes y cuentas locales.</p><a href="https://www.senamhi.gob.pe/main.php?p=calidad-del-aire" target="_blank" rel="noopener noreferrer">Monitoreo oficial SENAMHI ${icon('open_in_new')}</a><a href="https://open-meteo.com/en/docs/air-quality-api" target="_blank" rel="noopener noreferrer">Conocer la fuente de datos ${icon('open_in_new')}</a></div></div><div class="shell foot-bottom"><span>© AirGood · Proyecto académico HCI for UX Design</span><span>Lima, Perú · Diseñado para personas</span></div></footer>`; }
    function layout(content, opts = {}) { app.innerHTML = header() + `<main id="main">${content}</main>` + footer() + notices(); document.documentElement.classList.toggle('contrast', A.read('contrast', false)); document.documentElement.style.setProperty('--font-size', A.read('font_size', 16) + 'px'); const c = document.querySelector('#contrast-toggle'); if (c)
        c.setAttribute('aria-pressed', String(A.read('contrast', false))); if (opts.scroll !== false)
        window.scrollTo(0, 0); }
    function toast(msg, mode = 'ok') { const area = document.querySelector('#toast-area'); if (!area)
        return; const item = document.createElement('div'); item.className = 'toast ' + mode; item.setAttribute('role', 'status'); item.textContent = msg; area.append(item); setTimeout(() => item.remove(), 5500); }
    function modal(html) { const r = document.querySelector('#modal-root'); r.innerHTML = `<div class="modal-backdrop"><div class="modal-box" role="dialog" aria-modal="true" aria-labelledby="modal-title"><button type="button" class="modal-close icon-button" aria-label="Cerrar" data-action="close-modal">${icon('close')}</button>${html}</div></div>`; r.querySelector('button,input,select')?.focus(); }
    const closeModal = () => { const e = document.querySelector('#modal-root'); if (e)
        e.innerHTML = ''; };
    function cardAqi(a, compact = false) {
        const valid = A.validAqi(a.ica);
        const l = A.level(a.ica);
        const numeral = valid ? a.ica : '—';
        const format = v => v !== null && Number.isFinite(v) ? v.toFixed(1) : 'Sin dato';
        return `<article class="aqi-result ${compact ? 'compact' : ''} ${valid ? '' : 'aqi-missing'}" style="--category-color:${l.color}"><div class="aqi-top"><span>${icon('location_on')} ${A.esc(a.name)}</span><span class="aqi-status">${icon(l.icon)} ${l.short}</span></div><div class="aqi-middle"><div><strong>${numeral}</strong><span>${valid ? 'US AQI estimado · modelo regional' : 'US AQI · sin información'}</span></div><div class="aqi-orbit"><span>${icon(valid ? 'air' : 'wifi_off')}</span></div></div><p class="aqi-message">${A.esc(A.personalLine(a.ica))}</p><button class="aqi-explain" type="button" data-action="explain">${icon('help')} ¿Qué significa este nivel?</button><div class="aqi-mini"><span>PM2.5 <b>${format(a.pm25)}</b> ${a.pm25 === null ? '' : 'µg/m³'}</span><span>PM10 <b>${format(a.pm10)}</b> ${a.pm10 === null ? '' : 'µg/m³'}</span></div>${infoSource(a)}${valid ? '' : `<div class="unavailable-note">${icon('wifi_off')} No hay lecturas fiables. No se mostrarán valores simulados. <button type="button" data-action="refresh">Reintentar consulta</button>.</div>`}</article>`;
    }
    const levelsHtml = () => `<div class="legend-grid">${A.levels.map(x => `<div class="legend-item"><span class="legend-dot" style="background:${x.color}">${icon(x.icon)}</span><div><b>${x.name}</b><span>${x.range} ICA</span></div></div>`).join('')}</div>`;
    function faqHtml() { return [
        ['¿De dónde salen los números de cada distrito?', 'Los valores proceden del modelo CAMS Global consultado mediante Open-Meteo. Son estimaciones regionales de aproximadamente 45 km de resolución, no mediciones tomadas en cada distrito. Varios distritos pueden compartir la misma celda y el mismo índice.'],
        ['¿Cómo contrasto el dato de San Juan de Lurigancho?', 'SENAMHI cuenta con una estación en San Juan de Lurigancho. AirGood incluye un enlace a su información oficial, pero no reemplaza sus mediciones ni interpreta el dato regional como si fuera una lectura de esa estación.'],
        ['¿Qué pasa si no hay conexión a los datos?', 'AirGood muestra «Sin datos disponibles». No inventa números ni considera valores antiguos como si fueran actuales. Puedes reintentar o consultar SENAMHI.'],
        ['¿Qué significa US AQI?', 'Es el índice de calidad del aire según la escala de Estados Unidos. El número se calcula a partir de concentraciones de contaminantes y permite interpretar seis niveles. No debe confundirse con el índice empleado por las autoridades peruanas.'],
        ['¿Cómo funcionan las alertas y reportes?', 'Las alertas se calculan cuando se consulta una estimación disponible y la web está abierta. Los reportes, preferencias y cuentas de esta edición se guardan localmente en el navegador.']
    ].map(([q, a], i) => `<details class="faq-item" ${i === 0 ? 'open' : ''}><summary>${q}<span class="faq-arrow">${icon('expand_more')}</span></summary><p>${a}</p></details>`).join(''); }
    function landing() {
        layout(`<section class="hero"><div class="shell hero-grid"><div><span class="hero-tag">${icon('location_on')} Calidad del aire en Lima, a tu alcance</span><h1>Respira seguro con <span>información clara</span> de tu distrito</h1><p>Revisa la calidad del aire, descubre cuándo salir y recibe recomendaciones prácticas para cuidar a quienes más quieres.</p><div class="hero-buttons">${link('Comenzar gratis ' + icon('arrow_forward'), 'registro.html', 'btn btn-primary btn-lg')}${link('Consultar mi distrito', 'index.html#consulta', 'btn btn-outline-light btn-lg')}</div><div class="hero-trust"><span>${icon('check_circle')} Recomendaciones personalizadas</span><span>${icon('shield')} Información transparente</span></div></div><div class="hero-dashboard"><div class="floating-label">${icon('verified')} Vista previa de AirGood</div><div class="preview-head"><div><span class="preview-small">Hoy en tu zona</span><strong>Tu aire, más claro.</strong></div><div class="preview-weather">${icon('air')}</div></div><div id="hero-preview"><div class="skeleton-dark">Consultando calidad del aire…</div></div><div class="preview-foot"><span>${icon('notifications_active')} Alertas preventivas</span><span>${icon('map')} Mapas por distrito</span></div></div></div></section>
  <section class="section" id="beneficios"><div class="shell">${sectionTitle('Pensado para la vida diaria', 'Información útil para cuidar a quienes más lo necesitan', 'AirGood transforma un índice complejo en decisiones que puedes tomar con confianza.')}<div class="benefits-grid"><article class="feature-card"><span class="feature-icon">${icon('pulmonology')}</span><h3>Afecciones respiratorias</h3><p>Consulta el riesgo antes de salir y limita la exposición cuando el aire está contaminado.</p><span class="feature-meta">Prevención personalizada ${icon('arrow_outward')}</span></article><article class="feature-card"><span class="feature-icon">${icon('family_restroom')}</span><h3>Niños y adultos mayores</h3><p>Consejos claros para los grupos más sensibles, sin tecnicismos ni indicadores difíciles.</p><span class="feature-meta">Lectura sencilla ${icon('arrow_outward')}</span></article><article class="feature-card"><span class="feature-icon">${icon('directions_run')}</span><h3>Deportistas al aire libre</h3><p>Compara distritos y consulta pronósticos por hora antes de hacer ejercicio.</p><span class="feature-meta">Planifica mejor ${icon('arrow_outward')}</span></article></div></div></section>
  <section id="consulta" class="section section-muted"><div class="shell">${sectionTitle('Consulta interactiva', '¿Cómo está el aire en tu distrito?', 'Selecciona una zona de Lima para consultar el índice, su significado y recomendaciones para hoy.')}<div class="consult-layout"><div class="consult-controls card"><div class="step">01 / ELIGE TU DISTRITO</div><label for="landing-zone">Distrito de Lima Metropolitana</label><select id="landing-zone" class="input">${choices(A.getBase().id, 'Elige una zona')}</select><div class="callout"><div class="callout-icon">${icon('lightbulb')}</div><div><b>Interpreta el índice fácilmente</b><p>Seis categorías permiten entender el nivel de riesgo sin depender solo del color.</p></div></div>${levelsHtml()}</div><div id="landing-result" class="consult-result"><div class="card loading-card">Consultando información…</div></div></div></div></section>
  <section class="section"><div class="shell">${sectionTitle('Herramientas de AirGood', 'Todo lo que necesitas en un solo lugar', 'Explora la contaminación y toma decisiones informadas sobre tus actividades.')}<div class="tools-grid">${[['map', 'Mapa interactivo', 'Explora distritos y áreas verdes con indicadores de calidad del aire.', 'mapa.html'], ['query_stats', 'Historial y pronóstico', 'Revisa la evolución del aire por horas y los últimos 30 días.', 'detalle.html'], ['compare_arrows', 'Comparar distritos', 'Consulta mediciones históricas de la ATU y descubre qué zonas registraron más PM2.5.', 'comparar.html'], ['campaign', 'Reportes ciudadanos', 'Registra humo vehicular, obras o emisiones industriales en el mapa.', 'reportes.html'], ['notifications_active', 'Alertas preventivas', 'Elige tus umbrales y consulta el historial de avisos.', 'alertas.html'], ['volunteer_activism', 'Zonas favoritas', 'Guarda tu casa, trabajo o lugares que visitas con frecuencia.', 'perfil.html']].map(([i, t, d, h]) => `<a class="tool-card" href="${h}"><div class="tool-icon">${icon(i)}</div><div><h3>${t}</h3><p>${d}</p></div><span class="tool-arrow">${icon('arrow_forward')}</span></a>`).join('')}</div></div></section>
  <section class="section section-muted" id="preguntas"><div class="shell faq-layout"><div>${sectionTitle('Preguntas frecuentes', 'Lo que necesitas saber', 'Resolvemos tus dudas sobre los datos, alertas y reportes comunitarios.')}<a class="text-link" href="educacion.html">Aprender sobre la escala ICA ${icon('arrow_forward')}</a></div><div>${faqHtml()}</div></div></section>
  <section class="section" id="contacto"><div class="shell contact-grid"><div class="contact-visual"><span class="eyebrow">Estamos para ayudarte</span><h2>Una comunidad mejor informada respira mejor.</h2><p>Cuéntanos tus dudas sobre AirGood, el monitoreo o cómo participar con un sensor comunitario.</p><div class="contact-chip">${icon('support_agent')} Soporte y consultas</div></div><form id="contact-form" class="card contact-form" novalidate><h3>Envíanos tu consulta</h3><label for="contact-name">Nombre completo</label><input class="input" id="contact-name" name="name" autocomplete="name" required minlength="2" placeholder="Tu nombre"><span class="field-error" id="contact-name-error"></span><label for="contact-email">Correo electrónico</label><input class="input" id="contact-email" name="email" type="email" autocomplete="email" required placeholder="tu@correo.com"><span class="field-error" id="contact-email-error"></span><label for="contact-message">Mensaje</label><textarea class="input" id="contact-message" name="message" required minlength="10" rows="4" placeholder="¿Cómo podemos ayudarte?"></textarea><span class="field-error" id="contact-message-error"></span><button type="submit" class="btn btn-primary">Guardar consulta ${icon('arrow_forward')}</button><p class="form-note">Versión demostrativa: la consulta se guarda localmente y no se envía por correo.</p><div id="contact-feedback" role="status"></div></form></div></section>`, { scroll: false });
        loadLandingData();
    }
    function sectionTitle(label, h, desc) { return `<div class="section-heading"><span class="eyebrow">${label}</span><h2>${h}</h2><p>${desc}</p></div>`; }
    async function loadLandingData() {
        const z = state.selected;
        for (const id of ['hero-preview', 'landing-result']) {
            const target = document.querySelector('#' + id);
            if (target) target.innerHTML = '<div class="loading-card">Consultando la fuente de datos…</div>';
        }
        const a = await A.getAir(z);
        if (z !== state.selected || !document.querySelector('#landing-result')) return;
        state.currentAir = a;
        const valid = A.validAqi(a.ica);
        const l = A.level(a.ica);
        document.querySelector('#landing-result').innerHTML = cardAqi(a) + `<div class="under-result"><a href="detalle.html?zona=${a.id}&origen=index" class="btn btn-primary">Ver detalle y pronóstico ${icon('arrow_forward')}</a><a href="alertas.html" class="btn btn-subtle">Configurar mis alertas</a></div>`;
        const future = (a.hours || []).filter(x => new Date(x.time).getTime() >= Date.now() - 3600000).slice(0, 7);
        const bars = future.length ? future.map(h => `<span style="height:${Math.min(100, Math.max(10, h.ica / 180 * 100))}%;background:${A.level(h.ica).color}" title="${A.esc(A.stamp(h.time))} · US AQI ${h.ica}"></span>`).join('') : '';
        document.querySelector('#hero-preview').innerHTML = `<div class="preview-score"><div><span>${valid ? 'US AQI estimado' : 'Sin datos actuales'} · ${A.esc(a.name)}</span><strong>${valid ? a.ica : '—'}</strong><span class="preview-pip" style="--pip:${l.color}">${icon(l.icon)} ${l.name}</span></div><div class="preview-chart">${bars || `<span class="empty-preview">${icon('wifi_off')}</span>`}</div></div><p class="preview-advice">${A.esc(A.recommendations(a.ica)[0])}</p><small>${valid ? 'Modelo CAMS Global · Open-Meteo · no es una lectura de estación' : 'Sin estimaciones disponibles; no se usan valores ficticios'}</small>`;
    }
    function authPage(kind) {
        let body = '';
        if (kind === 'registro') {
            body = `<form id="register-form" class="auth-form" novalidate><label for="reg-name">Nombre completo</label><input id="reg-name" class="input" autocomplete="name" required minlength="2" placeholder="Nombres y apellidos"><label for="reg-email">Correo electrónico</label><input id="reg-email" class="input" type="email" autocomplete="email" required placeholder="nombre@correo.com"><label for="reg-pass">Contraseña</label><input id="reg-pass" class="input" type="password" autocomplete="new-password" required minlength="8" placeholder="Mínimo 8 caracteres"><div class="strength"><div id="strength-bar"></div></div><small id="strength-label">Usa 8 o más caracteres, letras, números y símbolos.</small><label for="reg-repeat">Confirmar contraseña</label><input id="reg-repeat" class="input" type="password" autocomplete="new-password" required placeholder="Repite tu contraseña"><span id="auth-error" class="field-error" role="alert"></span><button class="btn btn-primary btn-block" type="submit">Crear cuenta ${icon('arrow_forward')}</button></form><p class="auth-switch">¿Ya tienes cuenta? <a href="login.html">Inicia sesión</a></p>`;
        }
        else if (kind === 'login') {
            body = `<form id="login-form" class="auth-form" novalidate><label for="login-email">Correo electrónico</label><input id="login-email" class="input" type="email" required autocomplete="email" placeholder="nombre@correo.com"><label for="login-pass">Contraseña</label><input id="login-pass" class="input" type="password" required autocomplete="current-password" placeholder="Tu contraseña"><div class="auth-help"><a href="recuperar.html">¿Olvidaste tu contraseña?</a></div><span id="auth-error" class="field-error" role="alert"></span><button class="btn btn-primary btn-block" id="login-button" type="submit" disabled>Ingresar ${icon('arrow_forward')}</button></form><p class="auth-switch">¿Aún no tienes cuenta? <a href="registro.html">Crear cuenta</a></p>`;
        }
        else {
            body = `<div class="auth-form"><p>En la edición local puedes restablecer tu contraseña únicamente desde <b>Mi perfil</b> cuando has iniciado sesión. La recuperación por correo necesita un servicio externo de verificación.</p><a class="btn btn-primary btn-block" href="login.html">Volver al inicio de sesión</a></div>`;
        }
        layout(`<section class="auth-section"><div class="shell auth-grid"><div class="auth-story"><div class="auth-mark">${icon('air')}</div><span class="eyebrow">AIRGOOD · LIMA</span><h1>Tu aire, tus decisiones, tu tranquilidad.</h1><p>Consulta tu distrito, recibe recomendaciones de protección y mantente informado sobre las condiciones del aire.</p><div class="auth-stats"><span>${icon('public')} 43 distritos</span><span>${icon('monitor_heart')} Consejos adaptados</span></div></div><div class="card auth-card"><span class="eyebrow">${kind === 'registro' ? 'COMIENZA AQUÍ' : kind === 'login' ? 'BIENVENIDO DE VUELTA' : 'AYUDA CON TU CUENTA'}</span><h2>${kind === 'registro' ? 'Crea tu cuenta' : kind === 'login' ? 'Iniciar sesión' : 'Recuperar acceso'}</h2><p class="subtitle">${kind === 'registro' ? 'Personaliza tu experiencia en menos de dos minutos.' : kind === 'login' ? 'Consulta tus zonas y preferencias guardadas.' : 'Información para proteger el acceso a tu cuenta.'}</p>${body}<p class="local-note">${icon('lock')} Cuenta local de demostración: tus datos permanecen en este navegador. No ingreses contraseñas que uses en otros servicios.</p></div></div></section>`);
    }
    const profiles = [['respiratorio', 'pulmonology', 'Afección respiratoria', 'Recomendaciones ante partículas y episodios de contaminación.'], ['cuidador', 'child_care', 'Cuido a un niño menor de 5 años', 'Avisos para reducir la exposición de los más pequeños.'], ['mayor', 'elderly', 'Adulto mayor (60+)', 'Mensajes claros y consejos para actividades cotidianas.'], ['deportista', 'directions_run', 'Deportista', 'Planifica tus actividades al aire libre.']];
    function profilesPage() {
        const u = A.user();
        const selected = u?.perfiles || [];
        layout(`<section class="inner-hero"><div class="shell">${title('Un AirGood más útil para ti', 'Personaliza tu experiencia', 'Selecciona los perfiles que te representan y tu distrito principal.')}</div></section><section class="section small-section"><div class="shell narrow"><form id="profile-setup" class="card form-card" novalidate><div class="step">PASO 1 DE 2</div><h2>¿A quiénes debemos cuidar?</h2><p>Elige uno o varios perfiles. Puedes cambiarlos después.</p><div class="profile-list">${profiles.map(([value, i, n, d]) => `<label class="profile-option ${selected.includes(value) ? 'is-active' : ''}"><input type="checkbox" name="profile" value="${value}" ${selected.includes(value) ? 'checked' : ''}><span class="profile-icon">${icon(i)}</span><span><b>${n}</b><small>${d}</small></span><span class="option-check">${icon('check_circle')}</span></label>`).join('')}<label class="profile-option ${selected.includes('informativo') ? 'is-active' : ''}"><input type="checkbox" name="profile" value="informativo" ${selected.includes('informativo') ? 'checked' : ''}><span class="profile-icon">${icon('info')}</span><span><b>Solo quiero informarme</b><small>Consulta general sin un perfil de vulnerabilidad.</small></span><span class="option-check">${icon('check_circle')}</span></label></div><p id="profile-error" class="field-error" role="status"></p><button id="profile-next" class="btn btn-primary btn-block" type="button" ${!selected.length ? 'disabled' : ''}>Continuar ${icon('arrow_forward')}</button><div id="profile-step2" class="setup-step" hidden><hr><div class="step">PASO 2 DE 2</div><h2>Tu distrito base</h2><label for="district-search">Busca un distrito de Lima</label><input class="input" id="district-search" list="district-list" autocomplete="off" placeholder="Por ejemplo, Santa Anita" value="${u?.district ? A.esc(A.zone(u.district).name) : ''}"><datalist id="district-list">${A.zones.map(z => `<option value="${A.esc(z.name)}"></option>`).join('')}</datalist><p id="district-error" class="field-error"></p><div id="district-summary" class="chosen-district" role="status"></div><button class="btn btn-primary btn-block" type="submit">Guardar distrito y continuar ${icon('check')}</button></div></form></div></section>`);
    }
    function dashboard() { layout(`<section class="inner-hero home-hero"><div class="shell"><div class="heading"><span class="eyebrow">TU CENTRO DE CONTROL</span><h1>Hola, <span>${A.esc(A.user()?.name?.split(' ')[0] || 'bienvenido')}</span> ${icon('waving_hand')}</h1><p>Conoce el aire de tu zona y planifica tu día con información clara.</p></div></div></section><section class="section small-section"><div class="shell"><div class="dashboard-heading"><div><span class="eyebrow">TU DISTRITO PRINCIPAL</span><h2>¿Cómo está el aire hoy?</h2></div><div class="field-inline"><label for="home-zone">Consultar distrito</label><select class="input" id="home-zone">${choices(A.getBase().id)}</select></div></div><div class="dashboard-grid"><div id="home-air" class="loading-card card">Consultando información…</div><div class="card side-panel"><span class="eyebrow">RECOMENDACIÓN PARA HOY</span><div class="recommendation-icon">${icon('health_and_safety')}</div><h3 id="home-advice-title">Preparando recomendación…</h3><p id="home-advice-text">La recomendación se adapta a tu distrito y perfil.</p><a class="btn btn-subtle" href="alertas.html">Gestionar mis alertas ${icon('arrow_forward')}</a><button class="text-link" type="button" data-action="explain">¿Qué significa este nivel? ${icon('help')}</button></div></div><div class="quick-grid">${[['map', 'Explorar mapa', 'Ver zonas cercanas', 'mapa.html'], ['compare_arrows', 'Comparar distritos', 'Comparación histórica ATU', 'comparar.html'], ['campaign', 'Registrar reporte', 'Ayuda a tu comunidad', 'reportes.html'], ['notifications', 'Ver alertas', 'Avisos de tu distrito', 'alertas.html']].map(([i, t, d, h]) => `<a class="quick-link" href="${h}">${icon(i)}<span><b>${t}</b><small>${d}</small></span>${icon('arrow_forward')}</a>`).join('')}</div><div class="chart-layout"><section class="card chart-card"><div class="card-section-heading"><div><span class="eyebrow">PRÓXIMAS HORAS</span><h2>Pronóstico estimado</h2></div><a class="text-link" id="forecast-detail" href="detalle.html">Ver detalle ${icon('arrow_forward')}</a></div><div id="home-forecast" role="region" aria-label="Pronóstico por horas"></div></section><section class="card chart-card"><div class="card-section-heading"><div><span class="eyebrow">EVOLUCIÓN</span><h2>Historial de ICA</h2></div><div class="tab-switch"><button type="button" class="tab is-on" data-period="7">7 días</button><button type="button" class="tab" data-period="30">30 días</button></div></div><div id="home-history" role="region" aria-label="Historial de calidad del aire"></div></section></div></div></section>`); loadDashboard(); }
    const hourLabel = t => { const d = new Date(t); return Number.isNaN(+d) ? String(t).slice(11, 16) : d.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' }); };
    function chartHours(a, target) {
        const node = document.querySelector(target);
        if (!node)
            return;
        const now = Date.now();
        const future = (a.hours || []).filter(x => new Date(x.time).getTime() >= now - 3600000).slice(0, 12);
        if (!future.length) {
            node.innerHTML = '<div class="empty-state">Pronóstico no disponible.</div>';
            return;
        }
        const max = Math.max(160, ...future.map(x => x.ica));
        node.innerHTML = `<div class="hour-bars">${future.map((h, i) => `<button type="button" class="hour-bar ${i === 0 ? 'selected' : ''}" data-forecast="${i}" aria-label="${hourLabel(h.time)}: ICA ${h.ica}" title="${hourLabel(h.time)}: ${h.ica}"><span class="bar-score">${h.ica}</span><span class="bar-fill" style="height:${Math.max(9, Math.round(h.ica / max * 100))}%;background:${A.level(h.ica).color}"></span><small>${hourLabel(h.time)}</small></button>`).join('')}</div><div id="forecast-reading" class="chart-note">${icon('schedule')} <b>${hourLabel(future[0].time)}</b> · ICA ${future[0].ica} · ${A.level(future[0].ica).name}</div><p class="caption">Pronóstico estimado · generación: ${A.esc(A.stamp(a.time))}</p>`;
        node._forecast = future;
    }
    function chartHistory(a, target, days) { const node = document.querySelector(target); if (!node)
        return; node.innerHTML = '<div class="chart-loading">Actualizando historial…</div>'; setTimeout(() => { if (!node.isConnected)
        return; const perDay = new Map(); for (const x of (a.hours || [])) {
        const time = new Date(x.time);
        if (time.getTime() > Date.now() || !Number.isFinite(+time))
            continue;
        const key = time.toLocaleDateString('en-CA', { timeZone: 'America/Lima' });
        const o = perDay.get(key) || [];
        o.push(Number(x.ica));
        perDay.set(key, o);
    } const entries = [...perDay].slice(-days).map(([day, vals]) => ({ day, ica: Math.round(vals.reduce((sum, n) => sum + n, 0) / vals.length) })); if (!entries.length) {
        node.innerHTML = '<div class="empty-state">Sin historial disponible.</div>';
        return;
    } const worst = entries.reduce((a, b) => a.ica >= b.ica ? a : b); const max = Math.max(160, ...entries.map(x => x.ica)); node.innerHTML = `<div class="history-bars">${entries.map((x, i) => `<button type="button" class="history-col ${x.day === worst.day ? 'worst' : ''}" data-history="${i}" aria-label="${x.day}: ICA promedio ${x.ica}" title="${x.day}: ${x.ica}"><span style="height:${Math.max(5, Math.round(x.ica / max * 100))}%;background:${A.level(x.ica).color}"></span><small>${days === 30 && i % 5 !== 0 ? '' : x.day.slice(5).replace('-', '/')}</small></button>`).join('')}</div><div id="history-reading" class="chart-note">${icon('warning')} Peor día: <b>${A.esc(worst.day)}</b> · ICA ${worst.ica}</div><p class="caption">Estimaciones históricas del modelo, no mediciones de estaciones.</p>`; node._history = entries; }, 100); }
    async function loadDashboard() {
        const z = state.selected;
        const a = await A.getAir(z);
        if (z !== state.selected)
            return;
        const box = document.querySelector('#home-air');
        if (!box)
            return;
        box.innerHTML = cardAqi(a) + `<div class="card-actions"><a class="btn btn-primary" href="detalle.html?zona=${a.id}&origen=inicio">Detalle de la zona ${icon('arrow_forward')}</a><button class="btn btn-subtle" data-action="refresh" type="button">${icon('refresh')} Actualizar</button></div>`;
        document.querySelector('#home-advice-title').textContent = A.recommendations(a.ica)[0];
        document.querySelector('#home-advice-text').textContent = A.recommendations(a.ica)[1];
        document.querySelector('#forecast-detail').href = 'detalle.html?zona=' + a.id + '&origen=inicio';
        chartHours(a, '#home-forecast');
        chartHistory(a, '#home-history', state.chartPeriod);
        state.currentAir = a;
    }
    function mapPage() { layout(`<section class="inner-hero"><div class="shell">${title('Explora Lima', 'Mapa de calidad del aire', 'Consulta distritos, reportes comunitarios y áreas verdes desde un solo lugar.')}</div></section><section class="section small-section"><div class="shell"><div class="map-layout"><aside class="card map-sidebar"><h2>Encuentra una zona</h2><form id="map-search" class="search-box"><label for="map-query">Distrito o zona</label><div class="search-input">${icon('search')}<input id="map-query" class="input" type="search" list="map-list" placeholder="Ej. Santa Anita, Miraflores"><datalist id="map-list">${A.zones.map(x => `<option value="${A.esc(x.name)}"></option>`).join('')}</datalist></div><button class="btn btn-primary" type="submit">Buscar</button></form><div id="map-results" class="search-results"></div><div class="map-options"><label><input type="checkbox" id="map-show-parks" checked> ${icon('park')} Áreas verdes</label><label><input type="checkbox" id="map-show-reports" checked> ${icon('campaign')} Reportes ciudadanos</label><label><input type="checkbox" id="map-show-sensors" checked> ${icon('sensors')} Sensores registrados</label></div><div class="map-actions"><button type="button" class="btn btn-subtle" data-action="map-center">${icon('my_location')} Mi ubicación</button><button type="button" class="btn btn-subtle" data-action="legend">${icon('help')} Escala ICA</button></div><p class="caption">La ubicación de cada distrito es referencial. Los niveles disponibles son estimaciones de CAMS Global (≈45 km), no mediciones individuales de cada distrito. Consulta SENAMHI para datos de estaciones.</p></aside><section class="map-main"><div class="map-topline"><span>${icon('location_on')} Lima Metropolitana</span><span id="map-origin" class="subtle-pill">Modelo regional · ≈45 km</span></div><div id="real-map" class="real-map"><div id="fallback-map" class="fallback-map"><div class="map-texture"></div><div class="map-shape"></div><div id="fallback-pins"></div><div class="map-overlay-title">LIMA <span>METROPOLITANA</span></div></div></div><div class="map-under"><span>${icon('info')} Toca una zona para ver su nivel y consultar el detalle.</span><button type="button" class="text-link" data-action="map-retry">${icon('refresh')} Reintentar mapa</button></div></section></div><section class="section-block"><div class="split-heading"><div><span class="eyebrow">COMUNIDAD AIRGOOD</span><h2>Lo que sucede cerca de ti</h2></div><a class="btn btn-primary" href="reportes.html">${icon('add_circle')} Crear un reporte</a></div><div id="map-report-cards" class="reports-grid"></div><div class="split-heading park-heading"><div><span class="eyebrow">ESPACIOS PARA RESPIRAR</span><h2>Parques y áreas verdes</h2></div><button class="btn btn-subtle" data-action="add-park" type="button">${icon('add')} Registrar área verde</button></div><div id="map-park-cards" class="park-grid"></div></section></div></section>`); drawMapReports(); drawParks(); drawMapPins(); hydrateMapPins(); initLeaflet(); }
    const zoneLink = (id, origin = 'mapa') => `detalle.html?zona=${encodeURIComponent(id)}&origen=${origin}`;
    function drawMapReports() { const r = document.querySelector('#map-report-cards'); if (!r)
        return; const items = A.reports().slice(0, 6); r.innerHTML = items.length ? items.map(x => `<div class="mini-report"><div class="mini-report-icon">${icon('campaign')}</div><div><strong>${A.esc(x.categoryLabel)}</strong><span>${A.esc(A.zone(x.zone).name)} · ${A.esc(A.stamp(x.date))}</span><p>${A.esc(x.description)}</p></div></div>`).join('') : `<div class="empty-state full-width">Todavía no hay reportes en este navegador. <a href="reportes.html">Registra el primero</a>.</div>`; }
    function drawParks() { const r = document.querySelector('#map-park-cards'); if (!r)
        return; r.innerHTML = A.allParks().map(p => `<article class="park-card"><span class="park-icon">${icon('park')}</span><div><h3>${A.esc(p.name)}</h3><p>${A.esc(p.district)}</p></div><button class="text-link" type="button" data-action="park-detail" data-park="${p.id}">Ver confort ${icon('arrow_forward')}</button></article>`).join(''); }
    const shownZones = () => ['ate', 'santa-anita', 'comas', 'san-isidro', 'santiago-de-surco', 'miraflores', 'san-borja', 'la-molina', 'lima', 'chorrillos', 'san-juan-de-lurigancho', 'villa-el-salvador'];
    function fallbackPos(z) { return { x: Math.max(9, Math.min(92, ((z.lng + 77.2) / .55) * 100)), y: Math.max(8, Math.min(92, ((-11.75 - z.lat) / .75) * 100)) }; }
    function drawMapPins() { const el = document.querySelector('#fallback-pins'); if (!el)
        return; const marks = shownZones().map(id => { const z = A.zone(id), p = fallbackPos(z); return `<button type="button" data-action="open-zone" data-zone="${z.id}" class="map-pin" title="${A.esc(z.name)}" style="left:${p.x}%;top:${p.y}%"><span class="pin-inner" id="fallback-${z.id}">${icon('location_on')}</span><span>${A.esc(z.name)}</span></button>`; }).join(''); const extras = A.reports().map((r, i) => { const p = fallbackPos({ lat: r.lat, lng: r.lng }); return `<a class="extra-fallback-pin" style="left:${p.x}%;top:${p.y}%" href="reportes.html" title="${A.esc(r.categoryLabel)}">${icon('campaign')}</a>`; }).join(''); el.innerHTML = marks + extras; }
    async function hydrateMapPins() {
        const shown = shownZones();
        const r = document.querySelector('#map-results');
        if (r)
            r.innerHTML = '<p class="caption">Distritos sugeridos</p><div id="recent-zones"></div>';
        const readings = await Promise.all(shown.map(async id => ({ id, data: await A.getAir(id) })));
        for (const { id, data } of readings) {
            if (!document.querySelector('#fallback-pins'))
                return;
            const marker = document.querySelector('#fallback-' + id);
            if (marker) {
                marker.style.background = A.level(data.ica).color;
                marker.textContent = A.validAqi(data.ica) ? data.ica : "—";
                marker.setAttribute('aria-label', A.zone(id).name + (A.validAqi(data.ica) ? ' AQI estimado ' + data.ica : ' sin datos disponibles'));
            }
            if (state.mapLayers?.has(id))
                state.mapLayers.get(id).setStyle({ color: A.level(data.ica).color, fillColor: A.level(data.ica).color }).bindPopup(`<b>${A.esc(data.name)}</b><br>${A.validAqi(data.ica) ? 'US AQI modelado ' + data.ica + ' · ' + A.level(data.ica).name : 'Sin datos disponibles'}<br>Estimación regional, no lectura de estación<br><a href="${zoneLink(data.id)}">Ver detalle</a>`);
        }
        refreshMapResults('');
    }
    function refreshMapResults(query) { const r = document.querySelector('#map-results'); if (!r)
        return; const matches = query ? A.zones.filter(z => A.clean(z.name).includes(A.clean(query))).slice(0, 10) : A.recent().map(A.zone).concat(shownZones().slice(0, 8).map(A.zone)).filter((x, i, a) => a.findIndex(y => x.id === y.id) === i); r.innerHTML = (query ? '<p class="caption">Resultados de búsqueda</p>' : '<p class="caption">Explora distritos</p>') + (matches.length ? matches.map(z => `<button type="button" class="map-result-item" data-action="open-zone" data-zone="${z.id}"><span>${icon('location_on')}</span><b>${A.esc(z.name)}</b><small id="result-${z.id}">Ver nivel</small>${icon('chevron_right')}</button>`).join('') : `<div class="empty-state">No encontramos resultados. <button class="text-link" type="button" data-action="map-explore">Explorar mapa</button></div>`); }
    ;
    updateMapSearchValues();
    async function updateMapSearchValues() { const list = document.querySelectorAll('.map-result-item'); for (const node of list) {
        const id = node.dataset.zone;
        const t = node.querySelector('small');
        if (!t)
            continue;
        const a = await A.getAir(id);
        if (t.isConnected)
            t.textContent = A.validAqi(a.ica) ? 'US AQI ' + a.ica + ' · ' + A.level(a.ica).short : 'Sin datos disponibles';
    } }
    async function initLeaflet() { if (!document.querySelector('#real-map'))
        return; const script = document.createElement('script'); script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'; script.crossOrigin = 'anonymous'; const css = document.createElement('link'); css.rel = 'stylesheet'; css.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'; document.head.append(css); script.onload = () => { if (!document.querySelector('#real-map') || !window.L || state.map)
        return; try {
        document.querySelector('#fallback-map').style.display = 'none';
        const div = document.createElement('div');
        div.id = 'leaflet-map';
        document.querySelector('#real-map').append(div);
        state.map = L.map(div, { scrollWheelZoom: false }).setView([-12.07, -77.028], 11);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap contributors', maxZoom: 18 }).addTo(state.map);
        state.mapLayers = new Map();
        shownZones().forEach(id => { const z = A.zone(id); const c = L.circleMarker([z.lat, z.lng], { radius: 14, color: '#14b86b', weight: 3, fillColor: '#14b86b', fillOpacity: .4 }).addTo(state.map).bindPopup(`<b>${A.esc(z.name)}</b><br>Consultando ICA…<br><a href="${zoneLink(id)}">Ver detalle</a>`); state.mapLayers.set(id, c); });
        drawExtraMapLayers();
        state.map.on('click', e => { if (state.locationPicker) {
            state.selectedReportLocation = true;
            document.querySelector('#report-lat').value = e.latlng.lat.toFixed(6);
            document.querySelector('#report-lng').value = e.latlng.lng.toFixed(6);
            toast('Ubicación exacta seleccionada en el mapa.');
        } });
        document.querySelector('#map-origin').textContent = 'Mapa interactivo · OpenStreetMap';
        setTimeout(() => state.map?.invalidateSize(), 200);
    }
    catch (e) {
        showFallback();
    } }; script.onerror = showFallback; document.head.append(script); }
    function showFallback() { const fb = document.querySelector('#fallback-map'); if (fb)
        fb.style.display = 'block'; const lm = document.querySelector('#leaflet-map'); if (lm)
        lm.remove(); state.map = null; toast('No se pudo cargar el mapa externo. Puedes consultar los distritos en el mapa alternativo.', 'info'); }
    function drawExtraMapLayers() {
        if (!state.map)
            return;
        if (state.extraLayers)
            state.extraLayers.forEach(x => state.map.removeLayer(x));
        state.extraLayers = [];
        if (document.querySelector('#map-show-parks')?.checked) {
            A.allParks().forEach(p => { const l = L.marker([p.lat, p.lng], { title: p.name }).addTo(state.map).bindPopup(`<b>${A.esc(p.name)}</b><br>Área verde · ${A.esc(p.district)}`); state.extraLayers.push(l); });
        }
        if (document.querySelector('#map-show-reports')?.checked) {
            A.reports().forEach(p => { const l = L.circleMarker([p.lat, p.lng], { radius: 10, color: '#ed7b48', fillColor: '#ed7b48', fillOpacity: .8 }).addTo(state.map).bindPopup(`<b>${A.esc(p.categoryLabel)}</b><br>${A.esc(p.description)}`); state.extraLayers.push(l); });
        }
        if (document.querySelector('#map-show-sensors')?.checked) {
            A.sensors().filter(p => p.status === 'activo').forEach(p => { const l = L.circleMarker([p.lat, p.lng], { radius: 8, color: '#4f85ed', fillColor: '#4f85ed' }).addTo(state.map).bindPopup(`<b>Sensor ${A.esc(p.id)}</b><br>${A.esc(p.address)}`); state.extraLayers.push(l); });
        }
    }
    function detailPage() { const q = new URLSearchParams(location.search); const z = A.zone(q.get('zona') || A.getBase().id); state.selected = z.id; const origin = ['mapa', 'inicio', 'index', 'comparar'].includes(q.get('origen')) ? q.get('origen') : 'mapa'; layout(`<section class="inner-hero"><div class="shell"><a class="back-link" href="${origin}.html">${icon('arrow_back')} Volver a ${origin === 'mapa' ? 'mapa' : origin === 'index' ? 'portada' : origin === 'comparar' ? 'comparador' : 'inicio'}</a>${title('DETALLE DE ZONA', A.esc(z.name), 'Consulta los contaminantes, la evolución del ICA y recomendaciones de protección.')}</div></section><section class="section small-section"><div class="shell"><div class="detail-actions"><button class="btn btn-subtle" data-action="favorite" data-zone="${z.id}">${icon('bookmark_add')} Guardar como zona frecuente</button><button class="btn btn-subtle" data-action="share" type="button">${icon('share')} Compartir</button><button class="btn btn-subtle" data-action="legend" type="button">${icon('help')} Leyenda ICA</button></div><div class="dashboard-grid"><div id="detail-air" class="card loading-card">Consultando datos…</div><div class="card side-panel"><span class="eyebrow">¿QUÉ SIGNIFICA?</span><div class="recommendation-icon">${icon('health_and_safety')}</div><h3>Comprende el riesgo para tu salud</h3><p id="detail-explanation">Te explicaremos qué significa el nivel de tu zona.</p><button class="text-link" data-action="explain" type="button">${icon('help')} ¿Qué significa?</button><a class="btn btn-subtle" href="comparar.html">Comparar con otra zona ${icon('arrow_forward')}</a></div></div><div class="detail-sections"><section class="card chart-card"><div class="card-section-heading"><div><span class="eyebrow">COMPOSICIÓN DEL AIRE</span><h2>Contaminantes</h2></div><span class="caption">Concentración en µg/m³</span></div><div id="detail-pollutants"></div></section><section class="card chart-card"><div class="card-section-heading"><div><span class="eyebrow">POR HORAS</span><h2>Pronóstico estimado</h2></div></div><div id="detail-forecast"></div></section><section class="card chart-card"><div class="card-section-heading"><div><span class="eyebrow">ÚLTIMOS DÍAS</span><h2>Historial de calidad del aire</h2></div><div class="tab-switch"><button class="tab is-on" type="button" data-period="7">7 días</button><button class="tab" type="button" data-period="30">30 días</button></div></div><div id="detail-history"></div></section></div></div></section>`); loadDetail(); }
    async function loadDetail() {
        const a = await A.getAir(state.selected);
        state.currentAir = a;
        const x = document.querySelector('#detail-air');
        if (!x) return;
        x.innerHTML = cardAqi(a);
        document.querySelector('#detail-explanation').textContent = A.personalLine(a.ica);
        const available = A.pollutants.filter(p => a[p.key] !== null && Number.isFinite(a[p.key]));
        const maxPollution = available.length ? Math.max(...available.map(p => a[p.key])) : 0;
        const dominant = available.find(p => a[p.key] === maxPollution);
        document.querySelector('#detail-pollutants').innerHTML = A.pollutants.map(p => `<div class="pollutant-row"><div class="pollutant-heading"><b>${p.title} ${dominant?.key === p.key ? '<span class="small-badge">Mayor concentración</span>' : ''}</b><strong>${Number.isFinite(a[p.key]) && a[p.key] !== null ? a[p.key].toFixed(1) + ' µg/m³' : 'Sin dato'}</strong></div><div class="meter"><span style="width:${a[p.key] !== null && maxPollution ? Math.min(100, a[p.key] / maxPollution * 100) : 0}%;background:${A.level(a.ica).color}"></span></div><button class="text-link" type="button" data-action="pollutant" data-pollutant="${p.key}">${icon('info')} ¿Qué es ${p.title}?</button></div>`).join('');
        chartHours(a, '#detail-forecast');
        chartHistory(a, '#detail-history', state.chartPeriod);
    }
    function comparePage() {
        const H = AirGoodHistorico;
        const periodOptions = `<option value="promedio">Promedio de junio a diciembre de 2023</option>${H.meses.map((m,i)=>`<option value="${i}">${m} de 2023</option>`).join('')}`;
        layout(`<section class="inner-hero"><div class="shell">${title('Datos documentados · ATU', 'Compara la contaminación por distritos', 'Explora promedios de PM2.5 registrados en 50 puntos de Lima y Callao entre junio y diciembre de 2023. Publicación: enero de 2024.')}</div></section><section class="section small-section"><div class="shell"><div class="atu-source-strip"><div><strong>${icon('verified')} Datos históricos medidos, no simulados</strong><p>ATU · Boletín N.º 7, enero de 2024 · Concentración de PM2.5 en µg/m³. Los valores representan los lugares monitorizados, no el aire de cada calle ni el estado actual.</p></div><a class="btn btn-subtle btn-sm" href="${H.fuente}" target="_blank" rel="noopener noreferrer">Ver boletín oficial ${icon('open_in_new')}</a></div><div class="atu-stats" id="atu-stats" aria-live="polite"></div><div class="card compare-control"><div><h2>Compara entre dos o tres distritos</h2><p>Selecciona un periodo y observa las diferencias utilizando la misma fuente y unidad. En distritos con más de un punto se calcula el promedio simple de los puntos disponibles.</p></div><div class="atu-toolbar"><div><label for="atu-period">Periodo de medición</label><select id="atu-period" class="input">${periodOptions}</select></div><div class="atu-toolbar-info">${icon('calendar_month')} <span>Histórico ATU · Jun–Dic 2023</span></div></div><div class="compare-inputs" id="compare-inputs"></div><div class="atu-quick-actions"><button type="button" class="btn btn-subtle btn-sm" data-action="atu-example">${icon('compare_arrows')} Ejemplo: SJL vs. Miraflores</button><button type="button" class="btn btn-subtle btn-sm" data-action="atu-extremes">${icon('leaderboard')} Mayor vs. menor registro</button></div><div id="compare-favorites" class="compare-favorites"></div><datalist id="compare-zone-list">${H.zonas.map(z=>`<option value="${A.esc(z.name)}"></option>`).join('')}</datalist><button id="compare-add" type="button" class="btn btn-subtle" data-action="compare-add">${icon('add')} Agregar zona</button></div><div id="compare-results" class="compare-grid" aria-live="polite"></div><section class="atu-ranking card"><div class="card-section-heading"><div><span class="eyebrow">RANKING DOCUMENTADO</span><h2>Comparación de los distritos monitoreados</h2></div><span class="atu-tiny">PM2.5 · µg/m³</span></div><div id="atu-ranking"></div></section><div class="atu-method"><h3>${icon('info')} ¿Cómo interpretar esta comparación?</h3><p>La ATU registró concentraciones en 50 puntos de Lima y Callao. El ranking de AirGood agrupa las estaciones por distrito y promedia sus valores sin ponderación. Únicamente se comparan los distritos presentes en el boletín. No es un ranking oficial de los 43 distritos, no es el ICA y no describe lo que ocurre hoy.</p><p>Como referencia adicional independiente, un informe elaborado a partir de IQAir reportó para <strong>2024</strong> 27,5 µg/m³ en San Juan de Lurigancho y 53,4 µg/m³ en Santa María (Ate). No se mezclan esas cifras con las del comparador de 2023.</p><div class="comparison-links"><a href="${H.fuente}" target="_blank" rel="noopener noreferrer">Boletín ATU, tabla página 8 ${icon('open_in_new')}</a><a href="${H.referencia2024}" target="_blank" rel="noopener noreferrer">Reporte 2024 elaborado por AAP / IQAir ${icon('open_in_new')}</a></div></div></div></section>`);
        compareControls(); loadCompare();
    }
    function compareControls() {
        const e = document.querySelector('#compare-inputs');
        if (!e) return;
        const H = AirGoodHistorico;
        const options = H.zonas.map(z=>`<option value="${z.id}">${A.esc(z.name)}</option>`).join('');
        e.innerHTML = state.compare.map((id,i)=>`<div class="compare-selector"><label for="compare-${i}">Distrito ${i+1}</label><select class="input" id="compare-${i}" data-compare="${i}" aria-label="Distrito ${i+1} a comparar">${options.replace(`value="${id}"`,`value="${id}" selected`)}</select><button type="button" data-action="compare-remove" data-index="${i}" aria-label="Quitar distrito ${i+1}" class="icon-button" ${state.compare.length <= 2 ? 'disabled' : ''}>${icon('close')}</button></div>`).join('');
        document.querySelector('#compare-add').disabled=state.compare.length>=3;
        const fav=A.favs().filter(f=>H.zonas.some(z=>z.id===f.zone));
        document.querySelector('#compare-favorites').innerHTML=fav.length?`<span class="caption">Mis zonas frecuentes con datos:</span> ${fav.map(f=>`<button type="button" class="filter-chip" data-action="compare-favorite" data-zone="${f.zone}">${A.esc(A.zone(f.zone).name)}</button>`).join('')}`:'';
    }
    function loadCompare() {
        const H=AirGoodHistorico;
        const target=document.querySelector('#compare-results');
        if (!target) return;
        const ranking=H.ranking(state.comparePeriod);
        const first=ranking[0],last=ranking[ranking.length-1];
        const chosen=state.compare.map(id=>H.medicion(id,state.comparePeriod)).filter(Boolean);
        const periodo=state.comparePeriod==='promedio'?'promedio de junio–diciembre de 2023':H.meses[Number(state.comparePeriod)].toLowerCase()+' de 2023';
        const periodSelect=document.querySelector('#atu-period');if(periodSelect)periodSelect.value=state.comparePeriod;
        const stats=document.querySelector('#atu-stats');
        stats.innerHTML=`<article class="atu-stat"><span>Mayor concentración del grupo monitoreado</span><strong>${A.esc(first.name)}</strong><div class="atu-number high">${first.pm25.toFixed(1)}<small>µg/m³</small></div><p>${first.estaciones} ${first.estaciones===1?'punto':'puntos'} · ${A.esc(periodo)}</p></article><article class="atu-stat"><span>Menor concentración del grupo monitoreado</span><strong>${A.esc(last.name)}</strong><div class="atu-number low">${last.pm25.toFixed(1)}<small>µg/m³</small></div><p>${last.estaciones} ${last.estaciones===1?'punto':'puntos'} · ${A.esc(periodo)}</p></article>`;
        const ordered=[...chosen].sort((a,b)=>b.pm25-a.pm25);
        const highest=ordered[0],lowest=ordered[ordered.length-1];
        const difference=(highest.pm25-lowest.pm25).toFixed(1);
        const selectedText=chosen.length===2?`<strong>${A.esc(highest.name)}</strong> registró <strong>${difference} µg/m³ más</strong> de PM2.5 que <strong>${A.esc(lowest.name)}</strong> en los puntos monitoreados.`:`El distrito con mayor concentración entre los elegidos fue <strong>${A.esc(highest.name)}</strong>, con ${highest.pm25.toFixed(1)} µg/m³. La diferencia respecto al menor fue ${difference} µg/m³.`;
        const mean=chosen.reduce((s,x)=>s+x.pm25,0)/chosen.length;
        target.innerHTML=`<div class="atu-verdict"><span class="eyebrow">RESULTADO DE LA COMPARACIÓN · ${A.esc(periodo.toUpperCase())}</span><h2>${icon('analytics')} Comparación con valores medidos</h2><p>${selectedText}</p><span class="atu-verdict-note">Concentración de PM2.5, no índice AQI. La comparación corresponde exclusivamente al periodo y puntos de monitoreo de la ATU.</span></div>${chosen.map(d=>{const high=d.id===highest.id;const v=d.pm25;return `<article class="card compare-card atu-card"><span class="eyebrow">${icon('location_on')} ${A.esc(d.name)}</span><div class="atu-compare-value" style="color:${high?'#b75136':'#16875e'}">${v.toFixed(1)}<small>µg/m³ de PM2.5</small></div><div class="atu-measure-bar" role="img" aria-label="Concentración ${v.toFixed(1)} microgramos por metro cúbico"><div style="width:${Math.max(3,v/highest.pm25*100)}%;background:${high?'#bb6848':'#1e9773'}"></div></div><p class="atu-status-label">${high?'Mayor concentración entre seleccionados':'Menor concentración que el máximo seleccionado'} · ${d.estaciones} ${d.estaciones===1?'punto':'puntos'}</p><details class="atu-points"><summary>${icon('place')} Ver puntos utilizados en el promedio</summary>${d.puntos.map(p=>`<div class="atu-point-row"><span>${A.esc(p.nombre)}</span><strong>${p.pm25.toFixed(2)} µg/m³</strong></div>`).join('')}</details></article>`}).join('')}`;
        const max=ranking[0].pm25;
        document.querySelector('#atu-ranking').innerHTML=`<div class="atu-ranking-label"><span>Se muestran ${ranking.length} distritos que tienen puntos de medición en el boletín; ordenados por el promedio de los puntos.</span><strong>${A.esc(periodo)}</strong></div><div class="atu-bars">${ranking.map((d,i)=>`<div class="atu-bar-row"><span class="atu-rank-position">${i+1}.</span><span class="atu-bar-label">${A.esc(d.name)}<small>${d.estaciones} ${d.estaciones===1?'punto':'puntos'}</small></span><div class="atu-bar-track"><span style="width:${(d.pm25/max*100).toFixed(1)}%;background:${i===0?'#b85e43':i===ranking.length-1?'#188b62':'#46a783'}"></span></div><b>${d.pm25.toFixed(1)}</b></div>`).join('')}</div>`;
    }
    function alertsPage() { const s = A.settings(); layout(`<section class="inner-hero"><div class="shell">${title('Cuida tu salud', 'Centro de alertas', 'Configura cuándo quieres recibir avisos y consulta el historial de cambios en tu zona.')}</div></section><section class="section small-section"><div class="shell alerts-layout"><aside class="card alerts-settings"><span class="eyebrow">PREFERENCIAS</span><h2>Configura tus alertas</h2><form id="alerts-form"><label class="toggle-line"><span><b>Activar alertas</b><small>Registra avisos cuando el ICA supera el umbral.</small></span><input id="alert-enabled" type="checkbox" ${s.enabled ? 'checked' : ''}></label><label for="alert-threshold">Avísame a partir de</label><select id="alert-threshold" class="input"><option value="51" ${s.threshold === 51 ? 'selected' : ''}>Moderado · ICA 51</option><option value="101" ${s.threshold === 101 ? 'selected' : ''}>Dañino para sensibles · ICA 101</option><option value="151" ${s.threshold === 151 ? 'selected' : ''}>Dañino · ICA 151</option><option value="201" ${s.threshold === 201 ? 'selected' : ''}>Muy dañino · ICA 201</option></select><label class="toggle-line"><span><b>Notificaciones del navegador</b><small>Solo cuando tienes AirGood abierto y lo autorizas.</small></span><input id="alert-desktop" type="checkbox" ${s.desktop ? 'checked' : ''}></label><button type="submit" class="btn btn-primary btn-block">Guardar preferencias ${icon('check')}</button><button type="button" class="text-link" data-action="alert-reset">Restablecer configuración</button></form><div class="callout soft"><div class="callout-icon">${icon('info')}</div><p>Esta edición consulta los datos al abrir la página y durante la sesión. Para recibir avisos con la web cerrada se necesita un servidor de notificaciones.</p></div></aside><div class="alerts-history"><div class="split-heading"><div><span class="eyebrow">TU HISTORIAL</span><h2>Notificaciones</h2></div><button class="btn btn-subtle" type="button" data-action="alerts-read">${icon('done_all')} Marcar como leídas</button></div><div class="callout soft"><div class="callout-icon">${icon('science')}</div><div><b>Comprueba cómo funcionan los avisos</b><p>Estos botones crean un evento de prueba identificado como demostración.</p><div class="form-actions"><button type="button" class="btn btn-subtle btn-sm" data-action="simulate-risk">Probar alerta</button><button type="button" class="btn btn-subtle btn-sm" data-action="simulate-good">Probar mejora</button></div></div></div><div class="filter-row"><button class="filter-chip is-on" type="button" data-alert-filter="all">Todas</button><button class="filter-chip" type="button" data-alert-filter="riesgo">Calidad baja</button><button class="filter-chip" type="button" data-alert-filter="mejora">Mejoras</button></div><div id="alerts-list" aria-live="polite"></div></div></div></section>`); showAlerts('all'); A.getAir(A.getBase().id).then(() => showAlerts(document.querySelector('[data-alert-filter].is-on')?.dataset.alertFilter || 'all')); }
    function showAlerts(filter) { const node = document.querySelector('#alerts-list'); if (!node)
        return; const history = A.alerts().filter(x => filter === 'all' || x.type === filter); node.innerHTML = history.length ? history.map(x => `<article class="card alert-item ${x.read ? 'is-read' : ''}"><div class="alert-icon ${x.type}">${icon(x.type === 'mejora' ? 'trending_down' : 'notification_important')}</div><div><div class="alert-heading"><h3>${A.esc(x.title)}</h3>${!x.read ? '<span class="unread-dot" aria-label="Sin leer"></span>' : ''}</div><p>${A.esc(A.zone(x.zone).name)} · ICA ${x.ica} · ${A.esc(A.stamp(x.date))}</p><span>${A.esc(x.text)}</span><button class="text-link" type="button" data-action="alert-detail" data-alert="${x.id}">Consultar detalle ${icon('arrow_forward')}</button></div></article>`).join('') : `<div class="card empty-state">${icon('notifications_none')}<h3>No hay alertas en este grupo</h3><p>Los avisos se registran cuando se consulta un distrito que supera el umbral configurado o mejora respecto de una alerta anterior.</p><button type="button" class="btn btn-subtle" data-action="alert-check">Comprobar mi distrito ${icon('refresh')}</button></div>`; }
    const categories = [['trafico', 'Tránsito vehicular'], ['obras', 'Obras y construcción'], ['industrial', 'Emisiones industriales o fábricas']];
    function reportsPage() { layout(`<section class="inner-hero"><div class="shell">${title('Participación ciudadana', 'Reporta lo que ocurre en tu distrito', 'Registra incidentes de humo, polvo o emisiones que observes en tu comunidad.')}</div></section><section class="section small-section"><div class="shell"><div class="report-layout"><div class="card report-form"><div class="card-section-heading"><div><span class="eyebrow">NUEVO REPORTE</span><h2>Contar lo que está pasando</h2></div><div class="round-icon">${icon('add_location_alt')}</div></div><form id="report-form" novalidate><label for="report-category">¿Qué tipo de incidente observaste?</label><select id="report-category" class="input" required><option value="">Selecciona una categoría</option>${categories.map(([x, y]) => `<option value="${x}">${y}</option>`).join('')}</select><label for="report-district">Distrito</label><select id="report-district" class="input" required>${choices(A.getBase().id)}</select><div class="form-two"><div><label for="report-intensity">Intensidad percibida</label><select id="report-intensity" class="input"><option value="baja">Baja</option><option value="media" selected>Media</option><option value="alta">Alta</option></select></div><div><label for="report-schedule">Horario o recurrencia</label><input id="report-schedule" class="input" placeholder="Ej. 7 a. m. o cada tarde"></div></div><label for="report-description">Descripción</label><textarea id="report-description" class="input" rows="4" required minlength="10" maxlength="600" placeholder="Describe lo que observaste y dónde ocurre."></textarea><label for="report-photo">Fotografía opcional</label><input type="file" id="report-photo" class="input" accept="image/jpeg,image/png,image/webp"><p class="caption">Foto de máximo 1 MB. Se almacena solo en este navegador.</p><div class="location-box"><div><b>${icon('pin_drop')} Ubicación precisa del incidente</b><p>Puedes usar tu GPS o marcar el punto en el mapa. La ubicación es necesaria para publicarlo.</p></div><div class="form-two"><button type="button" class="btn btn-subtle" data-action="report-gps">${icon('my_location')} Usar GPS</button><button type="button" class="btn btn-subtle" data-action="report-map-location">${icon('map')} Elegir en mapa</button></div><div class="form-two"><div><label for="report-lat">Latitud</label><input id="report-lat" class="input" inputmode="decimal" type="number" step="any" placeholder="-12.0436"></div><div><label for="report-lng">Longitud</label><input id="report-lng" class="input" inputmode="decimal" type="number" step="any" placeholder="-76.9715"></div></div><p class="caption" id="report-location-status">Sin ubicación seleccionada.</p></div><p class="field-error" id="report-error" role="alert"></p><div class="form-actions"><button class="btn btn-primary" type="submit">${icon('send')} Registrar reporte</button><button class="btn btn-subtle" data-action="clear-report" type="button">Limpiar</button></div><p class="form-note">Edición local: aparece en el mapa de este navegador, pero no se distribuye a otros usuarios sin un servidor.</p></form></div><aside class="report-side"><div class="card"><span class="eyebrow">REPORTES DE TU COMUNIDAD</span><h2 id="report-count">0 reportes</h2><p>Los incidentes registrados se organizan por distrito y categoría.</p><div class="report-summary" id="report-summary"></div></div><div class="card transparent-card"><span class="feature-icon">${icon('verified_user')}</span><h3>Reporta con responsabilidad</h3><p>Incluye información precisa, evita fotografías de personas sin autorización y no difundas datos privados.</p></div></aside></div><div class="split-heading report-list-heading"><div><span class="eyebrow">HISTORIAL LOCAL</span><h2>Reportes registrados</h2></div><div class="filter-controls"><select class="input" id="report-filter"><option value="all">Todas las categorías</option>${categories.map(([x, y]) => `<option value="${x}">${y}</option>`).join('')}</select><select class="input" id="report-zone-filter">${choices('', 'Todos los distritos')}</select></div></div><div id="reports-list" class="reports-grid"></div></div></section>`); renderReports(); }
    function renderReports() {
        const list = A.reports();
        const count = document.querySelector('#report-count');
        if (!count)
            return;
        count.textContent = list.length + ' ' + (list.length === 1 ? 'reporte' : 'reportes');
        const groups = {};
        list.forEach(x => groups[x.zone] = (groups[x.zone] || 0) + 1);
        document.querySelector('#report-summary').innerHTML = Object.entries(groups).slice(0, 6).sort((a, b) => b[1] - a[1]).map(([id, n]) => `<div><span>${A.esc(A.zone(id).name)}</span><b>${n}</b></div>`).join('') || '<p>Sin incidentes reportados.</p>';
        const cat = document.querySelector('#report-filter')?.value || 'all', z = document.querySelector('#report-zone-filter')?.value || '';
        const selected = list.filter(x => (cat === 'all' || x.category === cat) && (!z || x.zone === z));
        document.querySelector('#reports-list').innerHTML = selected.length ? selected.map(x => `<article class="card report-card"><div class="report-head"><span class="report-type">${icon('campaign')} ${A.esc(x.categoryLabel)}</span><span class="intensity intensity-${x.intensity}">${A.esc(x.intensity)}</span></div><h3>${A.esc(A.zone(x.zone).name)}</h3><p>${A.esc(x.description)}</p>${x.photo ? `<img class="report-photo" alt="Fotografía adjunta al reporte" src="${x.photo}">` : ''}<div class="report-meta">${icon('schedule')} ${A.esc(A.stamp(x.date))} · ${A.esc(x.schedule || 'Sin horario específico')}</div><div class="report-head"><span class="caption">${icon('location_on')} ${Number(x.lat).toFixed(4)}, ${Number(x.lng).toFixed(4)}</span><button class="text-link" type="button" data-action="report-confirm" data-report="${x.id}">${icon('thumb_up')} Confirmar (${x.confirms || 0})</button></div></article>`).join('') : `<div class="empty-state full-width">No hay reportes con estos filtros. Puedes registrar uno usando el formulario.</div>`;
    }
    function profilePage() { const u = A.user(); if (!u) {
        location.href = 'login.html';
        return;
    } const favorites = A.favs(); layout(`<section class="inner-hero"><div class="shell">${title('CONFIGURACIÓN PERSONAL', 'Mi perfil', 'Gestiona tus datos, distritos, preferencias y dispositivos desde aquí.')}</div></section><section class="section small-section"><div class="shell profile-layout"><aside class="card profile-aside"><div class="avatar">${A.esc(u.name[0].toUpperCase())}</div><h2>${A.esc(u.name)}</h2><p>${A.esc(u.email)}</p><div class="profile-links"><a href="#datos">${icon('person')} Datos personales</a><a href="#zonas">${icon('bookmark')} Zonas frecuentes</a><a href="#sensores">${icon('sensors')} Mis sensores</a><a href="#privacidad">${icon('lock')} Privacidad y seguridad</a></div><a href="seleccionar-perfil.html" class="btn btn-subtle btn-block">${icon('tune')} Perfiles y distrito</a></aside><div class="profile-main"><section id="datos" class="card profile-section"><div class="card-section-heading"><div><span class="eyebrow">INFORMACIÓN DE TU CUENTA</span><h2>Datos personales</h2></div><button class="btn btn-subtle btn-sm" type="button" data-action="edit-profile">${icon('edit')} Editar</button></div><form id="personal-form" novalidate><div class="form-two"><div><label for="personal-name">Nombre completo</label><input id="personal-name" class="input" value="${A.esc(u.name)}" disabled required minlength="2"></div><div><label for="personal-email">Correo electrónico</label><input id="personal-email" class="input" type="email" value="${A.esc(u.email)}" disabled required></div></div><div id="profile-edit-actions" class="form-actions" hidden><button class="btn btn-primary" type="submit">Guardar cambios</button><button class="btn btn-subtle" type="button" data-action="cancel-edit">Cancelar</button></div></form><div class="profile-badges"><span>${icon('location_on')} ${A.esc(A.getBase().name)}</span><span>${icon('health_and_safety')} ${u.perfiles.length} perfiles elegidos</span></div></section><section id="zonas" class="card profile-section"><div class="card-section-heading"><div><span class="eyebrow">MIS LUGARES</span><h2>Zonas frecuentes <small>(${favorites.length}/5)</small></h2></div><button class="btn btn-subtle btn-sm" type="button" data-action="favorite-add" ${favorites.length >= 5 ? 'disabled' : ''}>${icon('add')} Agregar zona</button></div><div id="favorite-list"></div><p class="caption" id="favorite-limit">${favorites.length >= 5 ? 'Llegaste al límite de 5 zonas. Elimina una para agregar otra.' : 'Puedes guardar hasta cinco zonas con etiquetas personalizadas.'}</p></section><section class="card profile-section" id="sensores"><div class="card-section-heading"><div><span class="eyebrow">PARTICIPACIÓN COMUNITARIA</span><h2>Mis sensores</h2></div></div><p>Registra un sensor y prueba su conexión antes de publicarlo en el mapa.</p><form id="sensor-form" novalidate><div class="form-two"><div><label for="sensor-id">ID del dispositivo</label><input id="sensor-id" class="input" required placeholder="Ej. AG-SEN-014"></div><div><label for="sensor-zone">Distrito</label><select id="sensor-zone" class="input">${choices(A.getBase().id)}</select></div></div><label for="sensor-address">Dirección de instalación</label><input id="sensor-address" class="input" required minlength="6" placeholder="Av., calle y referencia"><label for="sensor-endpoint">Dirección de datos del sensor (URL HTTPS)</label><input id="sensor-endpoint" class="input" type="url" placeholder="https://dispositivo.example/api/medicion"><p class="caption">La URL debe responder con un JSON que incluya pm25 o aqi. Sin dispositivo conectado, el sensor se guarda como no verificado.</p><div class="form-actions"><button type="button" class="btn btn-subtle" data-action="sensor-test">${icon('network_check')} Probar señal</button><button type="submit" class="btn btn-primary">${icon('add')} Registrar mi sensor</button></div><p id="sensor-feedback" role="status" class="caption"></p></form><div id="sensor-list"></div></section><section class="card profile-section" id="privacidad"><span class="eyebrow">SEGURIDAD</span><h2>Privacidad y cuenta</h2><p>Tu cuenta funciona localmente. No compartas contraseñas que uses en otros servicios.</p><button class="btn btn-subtle" data-action="change-password" type="button">${icon('password')} Cambiar contraseña</button><div class="danger-box"><div><h3>Eliminar mi cuenta</h3><p>Elimina tu perfil, zonas, alertas, sensores y reportes de este navegador.</p></div><button class="btn btn-danger" data-action="delete-account" type="button">${icon('delete_forever')} Eliminar mi cuenta</button></div></section></div></div></section>`); renderFavorites(); renderSensors(); }
    function renderFavorites() { const list = document.querySelector('#favorite-list'); if (!list)
        return; const f = A.favs(); list.innerHTML = f.length ? f.map((x, i) => `<div class="favorite-row"><span class="favorite-icon">${icon(x.label === 'Trabajo' ? 'work' : x.label === 'Entrenamiento' ? 'directions_run' : x.label === 'Colegio' ? 'school' : 'home')}</span><div><b>${A.esc(A.zone(x.zone).name)}</b><small>${A.esc(x.label)}</small></div><div><button type="button" class="icon-button" data-action="favorite-edit" data-index="${i}" aria-label="Editar zona">${icon('edit')}</button><button type="button" class="icon-button" data-action="favorite-remove" data-index="${i}" aria-label="Eliminar zona">${icon('delete')}</button></div></div>`).join('') : `<div class="empty-state">Aún no has agregado zonas frecuentes. Guarda tu casa, trabajo o lugar de entrenamiento.</div>`; const count = document.querySelector('#zonas h2 small'); if (count)
        count.textContent = '(' + f.length + '/5)'; const b = document.querySelector('[data-action="favorite-add"]'); if (b)
        b.disabled = f.length >= 5; const note = document.querySelector('#favorite-limit'); if (note)
        note.textContent = f.length >= 5 ? 'Llegaste al límite de 5 zonas. Elimina una para agregar otra.' : 'Puedes guardar hasta cinco zonas con etiquetas personalizadas.'; }
    function favoriteModal(index = -1, zoneId = '') { const fav = A.favs()[index]; modal(`<span class="eyebrow">MIS LUGARES</span><h2 id="modal-title">${index >= 0 ? 'Editar' : 'Agregar'} zona frecuente</h2><form id="favorite-form"><input type="hidden" id="favorite-index" value="${index}"><label for="favorite-zone">Distrito</label><select id="favorite-zone" class="input">${choices(fav?.zone || zoneId || A.getBase().id)}</select><label for="favorite-label">Etiqueta</label><select id="favorite-label" class="input">${['Casa', 'Trabajo', 'Colegio', 'Entrenamiento', 'Otro'].map(x => `<option ${x === fav?.label ? 'selected' : ''}>${x}</option>`).join('')}</select><div class="form-actions"><button class="btn btn-primary" type="submit">Guardar zona</button><button class="btn btn-subtle" type="button" data-action="close-modal">Cancelar</button></div></form>`); }
    function renderSensors() { const target = document.querySelector('#sensor-list'); if (!target)
        return; const list = A.sensors().filter(x => x.owner === A.user()?.id); target.innerHTML = list.length ? `<div class="sensor-list">${list.map(x => `<div class="sensor-row"><span class="round-icon">${icon('sensors')}</span><div><b>${A.esc(x.id)}</b><small>${A.esc(x.address)}, ${A.esc(A.zone(x.zone).name)}</small></div><span class="small-badge ${x.status === 'activo' ? 'success' : ''}">${x.status === 'activo' ? 'Señal verificada' : 'Sin verificar'}</span></div>`).join('')}</div>` : ''; }
    function infoPage(kind) { const faq = kind === 'preguntas-frecuentes'; layout(`<section class="inner-hero"><div class="shell">${title('APRENDE CON AIRGOOD', faq ? 'Preguntas frecuentes' : 'Entiende la calidad del aire', faq ? 'Respuestas sobre el funcionamiento de AirGood.' : 'Una guía sencilla para interpretar el ICA y actuar según el nivel de contaminación.')}</div></section><section class="section"><div class="shell narrow">${faq ? faqHtml() : `<div class="card learning-card"><h2>¿Qué es el ICA?</h2><p>El Índice de Calidad del Aire, o ICA, resume la calidad del aire en una escala de 0 a 500. Los números altos indican mayor riesgo. AirGood utiliza la escala de AQI estadounidense cuando la fuente Open-Meteo está disponible.</p>${levelsHtml()}<h3>¿Qué hago si el nivel es alto?</h3><p>Reduce el ejercicio al aire libre, mantén los ambientes ventilados solo cuando las condiciones mejoren y sigue las indicaciones de las autoridades de salud.</p><h3>¿De dónde vienen los datos?</h3><p>De estimaciones CAMS Global distribuidas por Open-Meteo, con una resolución aproximada de 45 km en Perú. No son mediciones locales. La plataforma no genera datos artificiales cuando falla la fuente. Consulta SENAMHI para datos de sus estaciones.</p><p><a href="https://www.senamhi.gob.pe/main.php?p=calidad-del-aire" target="_blank" rel="noopener noreferrer">Ir al monitoreo oficial de SENAMHI</a></p></div>`}<div class="card next-action"><div><h2>Consulta tu zona</h2><p>Usa la información para decidir qué hacer hoy.</p></div><a class="btn btn-primary" href="index.html#consulta">Consultar un distrito ${icon('arrow_forward')}</a></div></div></section>`); }
    function reportMapPicker() { modal(`<span class="eyebrow">UBICACIÓN DEL INCIDENTE</span><h2 id="modal-title">Marca el punto en el mapa</h2><p>Elige el lugar aproximándolo visualmente y, si lo necesitas, ajusta después las coordenadas.</p><div id="pick-map" class="pick-map" role="button" tabindex="0" aria-label="Seleccionar coordenadas en mapa esquemático de Lima"><div class="map-texture"></div><span>${icon('location_on')} Selecciona un punto</span></div><p class="caption">Mapa esquemático: coordenadas calculadas según el punto elegido.</p><button class="btn btn-subtle" data-action="close-modal" type="button">Volver al reporte</button>`); }
    function pickPoint(x, y) { const lat = -11.75 - y * .75, lng = -77.2 + x * .55; const inputLat = document.querySelector('#report-lat'), inputLng = document.querySelector('#report-lng'); if (inputLat && inputLng) {
        inputLat.value = lat.toFixed(6);
        inputLng.value = lng.toFixed(6);
        document.querySelector('#report-location-status').textContent = 'Ubicación marcada: ' + lat.toFixed(5) + ', ' + lng.toFixed(5);
        state.selectedReportLocation = true;
    } closeModal(); toast('Ubicación seleccionada en el mapa.'); }
    async function handleAction(el, e) {
        const action = el.dataset.action;
        if (action === 'close-modal') {
            closeModal();
            return;
        }
        if (action === 'logout') {
            A.logout();
            location.href = 'index.html';
            return;
        }
        if (action === 'explain') {
            const a = state.currentAir;
            if (!a)
                return toast('Consulta primero tu distrito.', 'info');
            modal(`<span class="eyebrow">ENTIENDE EL ICA</span><h2 id="modal-title">${A.esc(A.level(a.ica).name)} · US AQI ${A.validAqi(a.ica) ? a.ica : 'sin datos'}</h2><p>${A.esc(A.personalLine(a.ica))}</p><div class="callout soft"><p>${A.esc(A.recommendations(a.ica)[1])}</p></div><button type="button" class="btn btn-subtle" data-action="close-modal">Entendido</button>`);
            return;
        }
        if (action === 'refresh') {
            const b = el;
            b.disabled = true;
            await A.getAir(state.selected, true);
            b.disabled = false;
            if (page === 'inicio')
                loadDashboard();
            if (page === 'detalle')
                loadDetail();
            if (page === 'index')
                loadLandingData();
            return;
        }
        if (action === 'legend') {
            modal(`<span class="eyebrow">ESCALA DE CALIDAD DEL AIRE</span><h2 id="modal-title">¿Qué significan los colores?</h2><p>La categoría se representa con color, nombre e ícono.</p>${levelsHtml()}`);
            return;
        }
        if (action === 'pollutant') {
            const p = A.pollutants.find(p => p.key === el.dataset.pollutant);
            if (p)
                modal(`<span class="eyebrow">CONTAMINANTES</span><h2 id="modal-title">${p.title}</h2><p>${p.detail}</p><button type="button" class="btn btn-subtle" data-action="close-modal">Entendido</button>`);
            return;
        }
        if (action === 'share') {
            const url = location.href;
            if (navigator.share) {
                try {
                    await navigator.share({ title: 'AirGood: calidad del aire en ' + A.zone(state.selected).name, url });
                }
                catch { }
            }
            else if (navigator.clipboard) {
                await navigator.clipboard.writeText(url);
                toast('Enlace copiado al portapapeles.');
            }
            else
                toast('Puedes copiar la dirección de esta página.', 'info');
            return;
        }
        if (action === 'favorite') {
            const id = el.dataset.zone;
            let f = A.favs();
            if (f.some(x => x.zone === id))
                return toast('Esta zona ya está guardada.', 'info');
            if (f.length >= 5)
                return toast('Alcanzaste el máximo de cinco zonas.', 'error');
            A.saveFavs([...f, { zone: id, label: 'Otro' }]);
            toast('Zona guardada en tus lugares frecuentes.');
            return;
        }
        if (action === 'atu-example') { state.compare=['san-juan-de-lurigancho','miraflores']; compareControls(); loadCompare(); return; }
        if (action === 'atu-extremes') { const r=AirGoodHistorico.ranking(state.comparePeriod); state.compare=[r[0].id,r[r.length-1].id]; compareControls(); loadCompare(); return; }
        if (action === 'compare-favorite') {
            const id = el.dataset.zone;
            if (state.compare.includes(id))
                return toast('Ese distrito ya está seleccionado.', 'info');
            const i = state.compare.length < 3 ? state.compare.length : state.compare.length - 1;
            state.compare[i] = id;
            compareControls();
            loadCompare();
            return;
        }
        if (action === 'compare-add') {
            if (state.compare.length >= 3)
                return;
            const next = AirGoodHistorico.zonas.find(x => !state.compare.includes(x.id));
            state.compare.push(next?.id || '');
            compareControls();
            loadCompare();
            return;
        }
        if (action === 'compare-remove') {
            state.compare.splice(Number(el.dataset.index), 1);
            compareControls();
            loadCompare();
            return;
        }
        if (action === 'open-zone') {
            A.rememberZone(el.dataset.zone);
            location.href = zoneLink(el.dataset.zone);
            return;
        }
        if (action === 'map-explore') {
            document.querySelector('#map-query').value = '';
            refreshMapResults('');
            return;
        }
        if (action === 'map-retry') {
            if (state.map) {
                state.map.invalidateSize();
                toast('Mapa actualizado.');
            }
            else
                initLeaflet();
            return;
        }
        if (action === 'map-center') {
            if (!navigator.geolocation)
                return toast('Tu navegador no permite usar ubicación.', 'error');
            navigator.geolocation.getCurrentPosition(pos => { const lat = pos.coords.latitude, lng = pos.coords.longitude; if (state.map)
                state.map.setView([lat, lng], 13);
            else
                toast('Ubicación: ' + lat.toFixed(4) + ', ' + lng.toFixed(4)); }, () => toast('No se pudo acceder a tu ubicación. Puedes buscar un distrito.', 'error'), { enableHighAccuracy: true, timeout: 9000 });
            return;
        }
        if (action === 'park-detail') {
            const park = A.allParks().find(x => x.id === el.dataset.park);
            if (!park)
                return;
            const a = await A.getAir(park.district);
            const l = A.level(a.ica);
            modal(`<span class="eyebrow">ÁREA VERDE</span><h2 id="modal-title">${A.esc(park.name)}</h2><p>${A.esc(park.district)} · US AQI modelado del entorno: <b>${A.validAqi(a.ica) ? a.ica : 'sin datos'}</b></p>${levelPill(a.ica)}<div class="callout soft"><p>${A.esc(A.recommendations(a.ica)[1])}</p><p>El modelo regional no permite determinar la calidad del aire dentro del parque.</p></div>${infoSource(a)}<a class="btn btn-primary" href="${zoneLink(a.id)}">Ver distrito</a>`);
            return;
        }
        if (action === 'add-park') {
            modal(`<span class="eyebrow">COMUNIDAD AIRGOOD</span><h2 id="modal-title">Registrar área verde</h2><form id="park-form"><label for="park-name">Nombre del parque</label><input class="input" id="park-name" required minlength="3"><label for="park-zone">Distrito</label><select class="input" id="park-zone">${choices(A.getBase().id)}</select><div class="form-two"><div><label for="park-lat">Latitud</label><input class="input" id="park-lat" type="number" step="any" required placeholder="-12.08"></div><div><label for="park-lng">Longitud</label><input class="input" id="park-lng" type="number" step="any" required placeholder="-77.02"></div></div><button class="btn btn-primary" type="submit">Guardar área verde</button></form>`);
            return;
        }
        if (action === 'alert-detail') {
            const h = A.alerts();
            const a = h.find(x => x.id === el.dataset.alert);
            if (!a)
                return;
            a.read = true;
            A.saveAlerts(h);
            showAlerts(document.querySelector('[data-alert-filter].is-on')?.dataset.alertFilter || 'all');
            modal(`<span class="eyebrow">DETALLE DE ALERTA</span><h2 id="modal-title">${A.esc(a.title)}</h2><p>${A.esc(A.zone(a.zone).name)} · ICA ${a.ica} · ${A.esc(A.stamp(a.date))}</p>${levelPill(a.ica)}<div class="callout soft"><p>${A.esc(a.text)}</p></div><div class="form-actions"><a class="btn btn-primary" href="${zoneLink(a.zone, 'mapa')}">Ver zona</a><button class="btn btn-subtle" type="button" data-action="close-modal">Volver a alertas</button></div>`);
            return;
        }
        if (action === 'alerts-read') {
            A.saveAlerts(A.alerts().map(x => ({ ...x, read: true })));
            showAlerts(document.querySelector('[data-alert-filter].is-on')?.dataset.alertFilter || 'all');
            toast('Historial marcado como leído.');
            return;
        }
        if (action === 'simulate-risk' || action === 'simulate-good') {
            const isHigh = action === 'simulate-risk', a = A.getBase(), ica = isHigh ? 172 : 38;
            A.insertAlert({ key: 'test:' + Date.now() + ':' + ica, type: isHigh ? 'riesgo' : 'mejora', zone: a.id, ica, title: isHigh ? 'Prueba: calidad del aire elevada' : 'Prueba: la calidad del aire mejoró', text: isHigh ? 'Aviso ilustrativo de contaminación. Reduce el ejercicio al aire libre.' : 'Aviso ilustrativo de mejoría de condiciones.' });
            showAlerts('all');
            toast('Aviso de demostración agregado al historial.');
            return;
        }
        if (action === 'alert-check') {
            await A.getAir(A.getBase().id, true);
            showAlerts('all');
            toast('Se comprobó el nivel actual de tu distrito.');
            return;
        }
        if (action === 'alert-reset') {
            A.saveSettings({ enabled: true, threshold: 101, desktop: false });
            alertsPage();
            toast('Configuración restablecida.');
            return;
        }
        if (action === 'report-gps') {
            if (!navigator.geolocation)
                return toast('Geolocalización no disponible.', 'error');
            el.disabled = true;
            navigator.geolocation.getCurrentPosition(p => { document.querySelector('#report-lat').value = p.coords.latitude.toFixed(6); document.querySelector('#report-lng').value = p.coords.longitude.toFixed(6); document.querySelector('#report-location-status').textContent = 'Ubicación GPS registrada · precisión aproximada ' + Math.round(p.coords.accuracy) + ' metros'; el.disabled = false; state.selectedReportLocation = true; toast('Ubicación obtenida.'); }, () => { el.disabled = false; toast('No se pudo obtener el GPS. Puedes elegir un punto en el mapa.', 'error'); }, { enableHighAccuracy: true, timeout: 10000 });
            return;
        }
        if (action === 'report-map-location') {
            reportMapPicker();
            return;
        }
        if (action === 'clear-report') {
            document.querySelector('#report-form').reset();
            document.querySelector('#report-lat').value = '';
            document.querySelector('#report-lng').value = '';
            document.querySelector('#report-location-status').textContent = 'Sin ubicación seleccionada.';
            document.querySelector('#report-error').textContent = '';
            return;
        }
        if (action === 'report-confirm') {
            const r = A.reports().map(x => x.id === el.dataset.report ? { ...x, confirms: (x.confirms || 0) + 1 } : x);
            A.write('reports', r);
            renderReports();
            toast('Confirmación registrada en este navegador.');
            return;
        }
        if (action === 'favorite-add') {
            if (A.favs().length >= 5)
                return toast('Solo puedes guardar hasta cinco zonas.', 'error');
            favoriteModal();
            return;
        }
        if (action === 'favorite-edit') {
            favoriteModal(Number(el.dataset.index));
            return;
        }
        if (action === 'favorite-remove') {
            const x = A.favs();
            x.splice(Number(el.dataset.index), 1);
            A.saveFavs(x);
            renderFavorites();
            toast('Zona eliminada.');
            return;
        }
        if (action === 'edit-profile') {
            ['personal-name', 'personal-email'].forEach(id => document.querySelector('#' + id).disabled = false);
            document.querySelector('#profile-edit-actions').hidden = false;
            state.draft = false;
            document.querySelector('#personal-name').focus();
            return;
        }
        if (action === 'cancel-edit') {
            const u = A.user();
            document.querySelector('#personal-name').value = u.name;
            document.querySelector('#personal-email').value = u.email;
            ['personal-name', 'personal-email'].forEach(id => document.querySelector('#' + id).disabled = true);
            document.querySelector('#profile-edit-actions').hidden = true;
            state.draft = false;
            return;
        }
        if (action === 'change-password') {
            modal(`<span class="eyebrow">SEGURIDAD</span><h2 id="modal-title">Cambiar contraseña</h2><form id="password-form"><label for="old-pass">Contraseña actual</label><input class="input" id="old-pass" type="password" required><label for="new-pass">Nueva contraseña</label><input class="input" id="new-pass" type="password" minlength="8" required><p class="field-error" id="password-error" role="alert"></p><button class="btn btn-primary" type="submit">Actualizar contraseña</button></form>`);
            return;
        }
        if (action === 'delete-account') {
            modal(`<span class="eyebrow">ACCIÓN IRREVERSIBLE</span><h2 id="modal-title">¿Eliminar tu cuenta?</h2><p>Se eliminarán el perfil, las zonas frecuentes, las alertas, los sensores y los reportes asociados a tu cuenta de este navegador.</p><form id="delete-form"><label for="delete-password">Ingresa tu contraseña para confirmar</label><input class="input" id="delete-password" type="password" required><p class="field-error" id="delete-error" role="alert"></p><div class="form-actions"><button class="btn btn-danger" type="submit">Eliminar definitivamente</button><button class="btn btn-subtle" data-action="close-modal" type="button">Cancelar</button></div></form>`);
            return;
        }
        if (action === 'sensor-test') {
            const url = document.querySelector('#sensor-endpoint')?.value;
            if (!url || !url.startsWith('https://'))
                return toast('Ingresa una URL HTTPS de un sensor real para verificar su señal.', 'error');
            const out = document.querySelector('#sensor-feedback');
            out.textContent = 'Comprobando conexión…';
            try {
                const r = await fetch(url, { signal: AbortSignal.timeout(6000) });
                if (!r.ok)
                    throw Error('El dispositivo no respondió');
                const j = await r.json();
                if (!Number.isFinite(Number(j.pm25 ?? j.pm2_5 ?? j.aqi)))
                    throw Error('La respuesta no contiene pm25 ni aqi');
                state.sensorVerifiedUrl = url;
                out.textContent = 'Señal verificada correctamente. Puedes registrar el sensor.';
                toast('Señal de dispositivo verificada.');
            }
            catch (err) {
                state.sensorVerifiedUrl = '';
                out.textContent = 'No se pudo verificar la señal. El sensor se guardará como no verificado.';
                toast(err.message, 'error');
            }
            return;
        }
    }
    async function formSubmitted(form, e) {
        e.preventDefault();
        const id = form.id;
        if (id === 'register-form') {
            const name = form.querySelector('#reg-name').value.trim(), email = form.querySelector('#reg-email').value.trim(), password = form.querySelector('#reg-pass').value, confirm = form.querySelector('#reg-repeat').value;
            const err = form.querySelector('#auth-error');
            err.textContent = '';
            if (name.length < 2)
                return err.textContent = 'Ingresa tu nombre completo.';
            if (!/^\S+@\S+\.\S+$/.test(email))
                return err.textContent = 'Ingresa un correo válido.';
            if (password.length < 8)
                return err.textContent = 'La contraseña necesita al menos 8 caracteres.';
            if (password !== confirm)
                return err.textContent = 'Las contraseñas no coinciden.';
            try {
                await A.register({ name, email, password });
                location.href = 'seleccionar-perfil.html';
            }
            catch (x) {
                err.textContent = x.message;
            }
            return;
        }
        if (id === 'login-form') {
            const email = document.querySelector('#login-email').value, password = document.querySelector('#login-pass').value, err = document.querySelector('#auth-error');
            try {
                await A.login(email, password);
                location.href = 'inicio.html';
            }
            catch {
                err.textContent = 'Correo o contraseña incorrectos.';
            }
            return;
        }
        if (id === 'profile-setup') {
            const chosen = [...document.querySelectorAll('[name="profile"]:checked')].map(x => x.value), v = document.querySelector('#district-search').value.trim(), z = A.zones.find(x => A.clean(x.name) === A.clean(v));
            if (!chosen.length)
                return document.querySelector('#profile-error').textContent = 'Elige al menos un perfil.';
            if (!z) {
                document.querySelector('#district-error').textContent = 'No encontramos ese distrito. Prueba con Ate, Santa Anita o Miraflores.';
                return;
            }
            const u = A.user();
            if (u) {
                u.perfiles = chosen;
                u.district = z.id;
                A.saveUser(u);
            }
            else
                A.setBase(z.id);
            A.rememberZone(z.id);
            location.href = 'inicio.html';
            return;
        }
        if (id === 'contact-form') {
            const name = document.querySelector('#contact-name'), email = document.querySelector('#contact-email'), message = document.querySelector('#contact-message');
            let ok = true;
            for (const el of [name, email, message]) {
                const valid = el.checkValidity();
                document.querySelector('#' + el.id + '-error').textContent = valid ? '' : el === name ? 'Ingresa tu nombre.' : el === email ? 'Ingresa un correo electrónico válido.' : 'Escribe un mensaje de al menos diez caracteres.';
                if (!valid)
                    ok = false;
            }
            if (!ok)
                return;
            A.write('contact', [...A.read('contact', []), { name: name.value, email: email.value, message: message.value, date: A.timestamp() }]);
            form.reset();
            document.querySelector('#contact-feedback').textContent = 'Tu consulta se guardó localmente en este navegador. Para enviarla al equipo se requiere un servicio de contacto.';
            toast('Consulta guardada.');
            return;
        }
        if (id === 'map-search') {
            const q = document.querySelector('#map-query').value.trim();
            refreshMapResults(q);
            if (q) {
                const exact = A.zones.find(x => A.clean(x.name) === A.clean(q));
                if (exact) {
                    A.rememberZone(exact.id);
                    state.map?.setView([exact.lat, exact.lng], 13);
                }
            }
            return;
        }
        if (id === 'alerts-form') {
            const enabled = document.querySelector('#alert-enabled').checked, threshold = Number(document.querySelector('#alert-threshold').value);
            let desktop = document.querySelector('#alert-desktop').checked;
            if (desktop && 'Notification' in window && Notification.permission !== 'granted') {
                const permission = await Notification.requestPermission();
                if (permission !== 'granted') {
                    desktop = false;
                    document.querySelector('#alert-desktop').checked = false;
                    toast('Las notificaciones del navegador no fueron autorizadas.', 'info');
                }
            }
            A.saveSettings({ enabled, threshold, desktop });
            A.write('alert_state_' + A.getBase().id, { high: false });
            await A.getAir(A.getBase().id, true);
            showAlerts('all');
            toast('Preferencias guardadas.');
            return;
        }
        if (id === 'report-form') {
            const category = document.querySelector('#report-category').value, zone = document.querySelector('#report-district').value, intensity = document.querySelector('#report-intensity').value, description = document.querySelector('#report-description').value.trim(), schedule = document.querySelector('#report-schedule').value.trim(), lat = Number(document.querySelector('#report-lat').value), lng = Number(document.querySelector('#report-lng').value), error = document.querySelector('#report-error');
            error.textContent = '';
            if (!category || !zone || description.length < 10)
                return error.textContent = 'Completa categoría, distrito y una descripción de al menos diez caracteres.';
            if (!document.querySelector('#report-lat').value || !document.querySelector('#report-lng').value || !Number.isFinite(lat) || !Number.isFinite(lng) || lat < -13 || lat > -11 || lng < -78 || lng > -76)
                return error.textContent = 'Selecciona una ubicación válida de Lima mediante GPS, mapa o coordenadas.';
            const file = document.querySelector('#report-photo').files[0];
            if (file && (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 1024 * 1024))
                return error.textContent = 'La imagen debe ser JPG, PNG o WebP y pesar menos de 1 MB.';
            let photo = '';
            if (file)
                photo = await new Promise(resolve => { const r = new FileReader(); r.onload = () => resolve(r.result); r.onerror = () => resolve(''); r.readAsDataURL(file); });
            const label = categories.find(x => x[0] === category)?.[1] || category;
            const report = { id: crypto.randomUUID(), owner: A.user()?.id || 'guest', category, categoryLabel: label, zone, intensity, description, schedule, photo, lat, lng, date: A.timestamp(), confirms: 0 };
            try {
                A.write('reports', [report, ...A.reports()]);
                A.insertAlert({ key: 'community:' + report.id, type: 'comunidad', zone, ica: 0, title: 'Nuevo reporte comunitario', text: label + ' registrado en ' + A.zone(zone).name + '.' });
                form.reset();
                document.querySelector('#report-district').value = zone;
                document.querySelector('#report-location-status').textContent = 'Sin ubicación seleccionada.';
                renderReports();
                toast('Reporte registrado y disponible en el mapa de este navegador.');
            }
            catch {
                error.textContent = 'No se pudo guardar la imagen por falta de espacio. Inténtalo sin fotografía.';
            }
            return;
        }
        if (id === 'favorite-form') {
            const index = Number(document.querySelector('#favorite-index').value), z = document.querySelector('#favorite-zone').value, label = document.querySelector('#favorite-label').value, f = A.favs();
            if (!z)
                return toast('Selecciona un distrito.', 'error');
            if (index < 0 && f.length >= 5)
                return toast('Máximo cinco zonas.', 'error');
            if (index < 0 && f.some(x => x.zone === z))
                return toast('Esta zona ya está guardada.', 'error');
            if (index >= 0)
                f[index] = { zone: z, label };
            else
                f.push({ zone: z, label });
            A.saveFavs(f);
            closeModal();
            renderFavorites();
            toast('Zona frecuente guardada.');
            return;
        }
        if (id === 'personal-form') {
            const name = document.querySelector('#personal-name').value.trim(), email = document.querySelector('#personal-email').value.trim(), u = A.user();
            if (name.length < 2 || !/^\S+@\S+\.\S+$/.test(email))
                return toast('Revisa el nombre y correo.', 'error');
            if (A.read('accounts', []).some(x => x.id !== u.id && A.clean(x.email) === A.clean(email)))
                return toast('Ese correo pertenece a otra cuenta.', 'error');
            u.name = name;
            u.email = email.toLowerCase();
            A.saveUser(u);
            state.draft = false;
            profilePage();
            toast('Datos personales actualizados.');
            return;
        }
        if (id === 'password-form') {
            const oldPass = document.querySelector('#old-pass').value, newPass = document.querySelector('#new-pass').value, err = document.querySelector('#password-error');
            if (newPass.length < 8)
                return err.textContent = 'Usa al menos ocho caracteres.';
            try {
                await A.changePassword(oldPass, newPass);
                closeModal();
                toast('Contraseña actualizada.');
            }
            catch (x) {
                err.textContent = x.message;
            }
            return;
        }
        if (id === 'delete-form') {
            try {
                await A.deleteAccount(document.querySelector('#delete-password').value);
                location.href = 'index.html?cuenta=eliminada';
            }
            catch (x) {
                document.querySelector('#delete-error').textContent = x.message;
            }
            return;
        }
        if (id === 'sensor-form') {
            const sid = document.querySelector('#sensor-id').value.trim(), address = document.querySelector('#sensor-address').value.trim(), zone = document.querySelector('#sensor-zone').value, url = document.querySelector('#sensor-endpoint').value.trim(), out = document.querySelector('#sensor-feedback');
            if (sid.length < 3 || address.length < 6 || !zone)
                return out.textContent = 'Completa un ID válido, distrito y dirección de instalación.';
            if (A.sensors().some(x => A.clean(x.id) === A.clean(sid)))
                return out.textContent = 'Ya registraste un sensor con ese ID.';
            const z = A.zone(zone), verified = Boolean(url && state.sensorVerifiedUrl === url);
            A.write('sensors', [...A.sensors(), { id: sid, address, zone, lat: z.lat, lng: z.lng, url, owner: A.user()?.id || 'guest', status: verified ? 'activo' : 'no-verificado', date: A.timestamp() }]);
            form.reset();
            state.sensorVerifiedUrl = '';
            out.textContent = verified ? 'Sensor registrado con señal verificada.' : 'Sensor registrado sin verificación de señal. No se mostrará como activo en el mapa hasta verificarlo.';
            renderSensors();
            toast('Sensor agregado.');
            return;
        }
        if (id === 'park-form') {
            const name = document.querySelector('#park-name').value.trim(), district = document.querySelector('#park-zone').value, lat = Number(document.querySelector('#park-lat').value), lng = Number(document.querySelector('#park-lng').value);
            if (name.length < 3 || !district || !Number.isFinite(lat) || !Number.isFinite(lng) || lat < -13 || lat > -11 || lng < -78 || lng > -76)
                return toast('Revisa el nombre, distrito y coordenadas.', 'error');
            A.write('parks', [...A.read('parks', []), { id: crypto.randomUUID(), name, district: A.zone(district).name, lat, lng }]);
            closeModal();
            drawParks();
            drawExtraMapLayers();
            toast('Área verde añadida al mapa local.');
            return;
        }
    }
    document.addEventListener('click', async (e) => {
        if (e.target.classList?.contains('modal-backdrop')) {
            closeModal();
            return;
        }
        const action = e.target.closest('[data-action]');
        if (action) {
            if (action.tagName === 'BUTTON')
                e.preventDefault();
            try {
                await handleAction(action, e);
            }
            catch (err) {
                toast(err.message || 'No se pudo completar la acción.', 'error');
            }
            return;
        }
        const toggled = e.target.closest('#menu-toggle');
        if (toggled) {
            const menu = document.querySelector('#nav-panel'), open = !menu.classList.contains('is-open');
            menu.classList.toggle('is-open', open);
            toggled.setAttribute('aria-expanded', String(open));
            return;
        }
        if (e.target.closest('#font-plus')) {
            const next = Math.min(21, A.read('font_size', 16) + 1);
            A.write('font_size', next);
            document.documentElement.style.setProperty('--font-size', next + 'px');
            return;
        }
        if (e.target.closest('#font-minus')) {
            const next = Math.max(14, A.read('font_size', 16) - 1);
            A.write('font_size', next);
            document.documentElement.style.setProperty('--font-size', next + 'px');
            return;
        }
        if (e.target.closest('#contrast-toggle')) {
            const next = !A.read('contrast', false);
            A.write('contrast', next);
            document.documentElement.classList.toggle('contrast', next);
            document.querySelector('#contrast-toggle').setAttribute('aria-pressed', String(next));
            return;
        }
        const next = e.target.closest('#profile-next');
        if (next) {
            const ch = [...document.querySelectorAll('[name="profile"]:checked')];
            if (!ch.length)
                return;
            document.querySelector('#profile-step2').hidden = false;
            next.hidden = true;
            document.querySelector('#profile-step2').scrollIntoView({ block: 'center', behavior: 'smooth' });
            return;
        }
        const forecast = e.target.closest('[data-forecast]');
        if (forecast) {
            const node = forecast.closest('[role="region"]');
            const h = node?._forecast?.[Number(forecast.dataset.forecast)];
            if (!h)
                return;
            node.querySelectorAll('[data-forecast]').forEach(x => x.classList.toggle('selected', x === forecast));
            node.querySelector('#forecast-reading').innerHTML = icon('schedule') + ' <b>' + hourLabel(h.time) + '</b> · ICA ' + h.ica + ' · ' + A.level(h.ica).name;
            return;
        }
        const history = e.target.closest('[data-history]');
        if (history) {
            const node = history.closest('[role="region"]');
            const h = node?._history?.[Number(history.dataset.history)];
            if (!h)
                return;
            node.querySelector('#history-reading').innerHTML = icon('calendar_month') + ' <b>' + A.esc(h.day) + '</b> · ICA ' + h.ica + ' · ' + A.level(h.ica).name;
            return;
        }
        const period = e.target.closest('[data-period]');
        if (period) {
            state.chartPeriod = Number(period.dataset.period);
            document.querySelectorAll('[data-period]').forEach(x => x.classList.toggle('is-on', x.dataset.period === period.dataset.period));
            if (state.currentAir)
                chartHistory(state.currentAir, page === 'inicio' ? '#home-history' : '#detail-history', state.chartPeriod);
            return;
        }
        const filtered = e.target.closest('[data-alert-filter]');
        if (filtered) {
            document.querySelectorAll('[data-alert-filter]').forEach(x => x.classList.toggle('is-on', x === filtered));
            showAlerts(filtered.dataset.alertFilter);
            return;
        }
        const picker = e.target.closest('#pick-map');
        if (picker) {
            const bounds = picker.getBoundingClientRect();
            pickPoint(Math.max(0, Math.min(1, (e.clientX - bounds.left) / bounds.width)), Math.max(0, Math.min(1, (e.clientY - bounds.top) / bounds.height)));
            return;
        }
    });
    document.addEventListener('keydown', e => { if (e.key === 'Escape')
        closeModal(); if ((e.key === 'Enter' || e.key === ' ') && e.target.id === 'pick-map') {
        e.preventDefault();
        pickPoint(.5, .5);
    } });
    document.addEventListener('submit', e => { const f = e.target.closest('form'); if (f)
        formSubmitted(f, e).catch(x => toast(x.message, 'error')); });
    document.addEventListener('change', e => {
        const el = e.target;
        if (el.id === 'landing-zone') {
            state.selected = el.value || A.getBase().id;
            A.setBase(state.selected);
            loadLandingData();
        }
        if (el.id === 'home-zone') {
            state.selected = el.value || A.getBase().id;
            A.setBase(state.selected);
            loadDashboard();
        }
        if (el.id === 'atu-period') { state.comparePeriod = el.value; loadCompare(); return; }
        if (el.matches('[data-compare-search]')) {
            const i = Number(el.dataset.compareSearch), z = AirGoodHistorico.zonas.find(x => A.clean(x.name) === A.clean(el.value.trim()));
            if (!z)
                return toast('No encontramos ese distrito. Revisa el nombre.', 'error');
            if (state.compare.some((x, j) => j !== i && x === z.id))
                return toast('Ese distrito ya está seleccionado.', 'error');
            state.compare[i] = z.id;
            compareControls();
            loadCompare();
            return;
        }
        if (el.matches('[data-compare]')) {
            const i = Number(el.dataset.compare);
            if (state.compare.some((x, j) => j !== i && x === el.value)) {
                toast('Esa zona ya está en la comparación.', 'error');
                compareControls();
                return;
            }
            state.compare[i] = el.value;
            loadCompare();
        }
        if (el.name === 'profile') {
            const checks = [...document.querySelectorAll('[name="profile"]')];
            if (el.value === 'informativo' && el.checked)
                checks.filter(x => x !== el).forEach(x => x.checked = false);
            else if (el.checked)
                checks.find(x => x.value === 'informativo').checked = false;
            checks.forEach(x => x.closest('.profile-option').classList.toggle('is-active', x.checked));
            document.querySelector('#profile-next').disabled = !checks.some(x => x.checked);
        }
        if (['map-show-parks', 'map-show-reports', 'map-show-sensors'].includes(el.id))
            drawExtraMapLayers();
        if (['report-filter', 'report-zone-filter'].includes(el.id))
            renderReports();
        if (el.id === 'sensor-endpoint')
            state.sensorVerifiedUrl = '';
    });
    document.addEventListener('input', e => {
        const el = e.target;
        if (['login-email', 'login-pass'].includes(el.id)) {
            const submit = document.querySelector('#login-button');
            if (submit)
                submit.disabled = !(document.querySelector('#login-email').value.trim() && document.querySelector('#login-pass').value);
        }
        if (el.id === 'reg-pass') {
            const v = el.value, score = [v.length >= 8, /[a-z]/.test(v), /[A-Z]/.test(v), /\d/.test(v), /[^A-Za-z0-9]/.test(v)].filter(Boolean).length;
            document.querySelector('#strength-bar').style.width = score * 20 + '%';
            document.querySelector('#strength-bar').style.background = score >= 4 ? '#14b86b' : score >= 3 ? '#e4b83f' : '#e15b5b';
            document.querySelector('#strength-label').textContent = score >= 4 ? 'Contraseña fuerte' : score >= 3 ? 'Contraseña aceptable' : 'Utiliza 8 caracteres, mayúsculas, minúsculas, números y símbolos.';
        }
        if (el.id === 'district-search') {
            const z = A.zones.find(x => A.clean(x.name) === A.clean(el.value.trim()));
            document.querySelector('#district-summary').textContent = z ? 'Distrito seleccionado: ' + z.name : '';
            document.querySelector('#district-error').textContent = el.value && !z ? 'No encontramos ese distrito. Prueba con Ate, Santa Anita o Miraflores.' : '';
        }
        if (el.id === 'map-query')
            refreshMapResults(el.value.trim());
        if (['personal-name', 'personal-email'].includes(el.id) && !el.disabled)
            state.draft = true;
        if (['report-lat', 'report-lng'].includes(el.id))
            document.querySelector('#report-location-status').textContent = 'Coordenadas ingresadas manualmente.';
    });
    window.addEventListener('beforeunload', e => { if (state.draft) {
        e.preventDefault();
        e.returnValue = '';
    } });
    const views = { index: landing, registro: () => authPage('registro'), login: () => authPage('login'), recuperar: () => authPage('recuperar'), 'seleccionar-perfil': profilesPage, inicio: dashboard, mapa: mapPage, detalle: detailPage, comparar: comparePage, alertas: alertsPage, reportes: reportsPage, perfil: profilePage, educacion: () => infoPage('educacion'), 'preguntas-frecuentes': () => infoPage('preguntas-frecuentes') };
    (views[page] || landing)();
    if (location.hash) {
        setTimeout(() => document.querySelector(location.hash)?.scrollIntoView(), 100);
    }
    if (A.sessions())
        setInterval(() => { if (document.visibilityState === 'visible')
            A.getAir(A.getBase().id, true).then(a => { if (page === 'alertas')
                showAlerts(document.querySelector('[data-alert-filter].is-on')?.dataset.alertFilter || 'all'); }); }, 15 * 60 * 1000);
    return { state, toast, modal, loadDashboard, loadLandingData, showAlerts };
})();
