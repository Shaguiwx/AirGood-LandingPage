const Air = (() => {
    const districts = [
        ['Ancón', -11.775, -77.164], ['Ate', -12.0258, -76.9186], ['Barranco', -12.148, -77.021], ['Breña', -12.061, -77.051], ['Carabayllo', -11.89, -77.038], ['Chaclacayo', -11.975, -76.77], ['Chorrillos', -12.178, -77.015], ['Cieneguilla', -12.091, -76.769], ['Comas', -11.936, -77.06], ['El Agustino', -12.04, -77.0], ['Independencia', -11.99, -77.058], ['Jesús María', -12.077, -77.049], ['La Molina', -12.089, -76.949], ['La Victoria', -12.071, -77.02], ['Lima', -12.046, -77.042], ['Lince', -12.084, -77.031], ['Los Olivos', -11.977, -77.07], ['Lurigancho-Chosica', -11.945, -76.708], ['Lurín', -12.278, -76.869], ['Magdalena del Mar', -12.092, -77.067], ['Miraflores', -12.1211, -77.0297], ['Pachacámac', -12.229, -76.858], ['Pucusana', -12.478, -76.797], ['Pueblo Libre', -12.076, -77.066], ['Puente Piedra', -11.864, -77.077], ['Punta Hermosa', -12.332, -76.823], ['Punta Negra', -12.363, -76.798], ['Rímac', -12.03, -77.035], ['San Bartolo', -12.389, -76.779], ['San Borja', -12.102, -77.004], ['San Isidro', -12.0977, -77.0365], ['San Juan de Lurigancho', -11.99, -76.999], ['San Juan de Miraflores', -12.166, -76.966], ['San Luis', -12.076, -77.004], ['San Martín de Porres', -12.013, -77.081], ['San Miguel', -12.077, -77.089], ['Santa Anita', -12.0436, -76.9715], ['Santa María del Mar', -12.406, -76.775], ['Santa Rosa', -11.803, -77.172], ['Santiago de Surco', -12.1453, -77.0089], ['Surquillo', -12.116, -77.01], ['Villa El Salvador', -12.213, -76.942], ['Villa María del Triunfo', -12.163, -76.94]
    ];
    const zones = districts.map(([name, lat, lng]) => ({ id: name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''), name, lat, lng }));
    const parks = [
        { id: 'kennedy', name: 'Parque Kennedy', district: 'Miraflores', lat: -12.1216, lng: -77.0307 },
        { id: 'olivar', name: 'Bosque El Olivar', district: 'San Isidro', lat: -12.1014, lng: -77.0375 },
        { id: 'reserva', name: 'Parque de la Reserva', district: 'Lima', lat: -12.0716, lng: -77.0344 },
        { id: 'pentagonito', name: 'Pentagonito', district: 'San Borja', lat: -12.0988, lng: -76.9943 },
        { id: 'expo', name: 'Parque de la Exposición', district: 'Lima', lat: -12.0616, lng: -77.0371 },
        { id: 'amistad', name: 'Parque de la Amistad', district: 'Santiago de Surco', lat: -12.1418, lng: -77.0048 }
    ];
    const levels = [
        { max: 50, name: 'Bueno', short: 'Bueno', color: '#14b86b', icon: 'check_circle', range: '0–50', code: 'good' },
        { max: 100, name: 'Moderado', short: 'Moderado', color: '#e4b83f', icon: 'info', range: '51–100', code: 'moderate' },
        { max: 150, name: 'Dañino para grupos sensibles', short: 'Sensible', color: '#ef9345', icon: 'warning', range: '101–150', code: 'sensitive' },
        { max: 200, name: 'Dañino', short: 'Dañino', color: '#e15b5b', icon: 'error', range: '151–200', code: 'unhealthy' },
        { max: 300, name: 'Muy dañino', short: 'Muy dañino', color: '#a887e5', icon: 'report', range: '201–300', code: 'very' },
        { max: 500, name: 'Peligroso', short: 'Peligroso', color: '#ad5970', icon: 'dangerous', range: '301–500', code: 'hazard' }
    ];
    const advice = {
        good: ['Buenas condiciones para salir.', 'Puedes caminar o hacer deporte al aire libre con normalidad.'],
        moderate: ['El aire es aceptable para la mayoría.', 'Si eres sensible, considera reducir el ejercicio intenso al aire libre.'],
        sensitive: ['Precaución para personas sensibles.', 'Niños, mayores y personas con afecciones respiratorias deberían limitar esfuerzos prolongados.'],
        unhealthy: ['Es mejor reducir tu exposición.', 'Evita actividades físicas intensas al aire libre y procura permanecer en interiores.'],
        very: ['El nivel es muy perjudicial.', 'Evita salir salvo que sea necesario; mantén puertas y ventanas cerradas.'],
        hazard: ['Alerta por calidad del aire.', 'Permanece en interiores y evita cualquier actividad al aire libre.']
    };
    const pollutants = [
        { key: 'pm25', title: 'PM2.5', detail: 'Partículas muy pequeñas que pueden llegar hasta los pulmones.' },
        { key: 'pm10', title: 'PM10', detail: 'Polvo y otras partículas que pueden irritar las vías respiratorias.' },
        { key: 'ozone', title: 'Ozono (O₃)', detail: 'Gas que, cuando se acumula cerca del suelo, puede afectar la respiración.' }
    ];
    const key = 'airgood_v3_';
    const read = (name, fallback = null) => { try {
        const x = localStorage.getItem(key + name);
        return x === null ? fallback : JSON.parse(x);
    }
    catch {
        return fallback;
    } };
    const write = (name, value) => { localStorage.setItem(key + name, JSON.stringify(value)); window.dispatchEvent(new CustomEvent('airgood:change', { detail: name })); return value; };
    const remove = name => localStorage.removeItem(key + name);
    const clean = s => String(s ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
    const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    const zone = id => zones.find(x => x.id === id) || zones.find(x => clean(x.name) === clean(id)) || zones.find(x => clean(x.name).includes(clean(id))) || zones.find(x => x.id === 'santa-anita');
    const validAqi = n => n !== null && n !== undefined && n !== '' && Number.isFinite(Number(n)) && Number(n) >= 0 && Number(n) <= 500;
    const level = n => validAqi(n) ? levels.find(x => Number(n) <= x.max) || levels[levels.length - 1] : { name: 'Sin datos', short: 'No disponible', color: '#84939c', icon: 'info', code: 'unavailable' };
    const timestamp = () => new Date().toISOString();
    const stamp = s => s && !Number.isNaN(new Date(s).getTime()) ? new Date(s).toLocaleString('es-PE', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'America/Lima' }) : 'No disponible';
    const user = () => { const id = sessionStorage.getItem(key + 'session'); return id ? (read('accounts', []).find(x => x.id === id) || null) : null; };
    const saveUser = u => { const list = read('accounts', []); const i = list.findIndex(a => a.id === u.id); if (i >= 0)
        list[i] = u;
    else
        list.push(u); write('accounts', list); return u; };
    const sessions = () => Boolean(user());
    const profile = () => user()?.perfiles || ['informativo'];
    const personalLine = (n) => { if (!validAqi(n)) return 'Sin estimaciones confiables disponibles. Consulta SENAMHI y vuelve a intentar más tarde.'; const p = profile(); let extra = ''; if (p.includes('cuidador'))
        extra = ' Si cuidas a niños pequeños, limita su exposición.';
    else if (p.includes('respiratorio'))
        extra = ' Si tienes afecciones respiratorias, prioriza espacios cerrados.';
    else if (p.includes('mayor'))
        extra = ' Si eres adulto mayor, reduce el esfuerzo físico.';
    else if (p.includes('deportista'))
        extra = ' Si entrenas, ajusta la intensidad.'; return advice[level(n).code][0] + extra; };
    const recommendations = n => validAqi(n) ? advice[level(n).code] : ['No hay un índice disponible.', 'No es posible determinar el riesgo actual a partir de los datos de AirGood. Consulta la red oficial SENAMHI.'];
    const getBase = () => zone(user()?.district || read('guest_district', 'santa-anita'));
    const setBase = id => { const z = zone(id); const u = user(); if (u) {
        u.district = z.id;
        saveUser(u);
    }
    else
        write('guest_district', z.id); return z; };
    const favs = () => read('favorites_' + (user()?.id || 'guest'), []);
    const saveFavs = a => write('favorites_' + (user()?.id || 'guest'), a);
    const alerts = () => read('alerts_' + (user()?.id || 'guest'), []);
    const saveAlerts = a => write('alerts_' + (user()?.id || 'guest'), a);
    const settings = () => read('settings_' + (user()?.id || 'guest'), { enabled: true, threshold: 101, desktop: false });
    const saveSettings = x => write('settings_' + (user()?.id || 'guest'), x);
    const reports = () => read('reports', []);
    const sensors = () => read('sensors', []);
    const allParks = () => [...parks, ...read('parks', [])];
    const airCache = new Map();
    const pendingAir = new Map();
    const officialUrl = z => z.id === 'san-juan-de-lurigancho' ? 'https://www.senamhi.gob.pe/?e=112267&p=calidad-del-aire-estacion' : 'https://www.senamhi.gob.pe/main.php?p=calidad-del-aire';
    const toLimaTime = t => typeof t === 'string' ? (/[zZ]$|[+-]\d{2}:\d{2}$/.test(t) ? t : t + '-05:00') : '';
    const actualNumber = v => v !== null && v !== undefined && v !== '' && Number.isFinite(Number(v)) ? Number(v) : null;
    const unavailable = (z, reason = 'No fue posible consultar las estimaciones en este momento.') => ({
        id: z.id, name: z.name, ica: null, pm25: null, pm10: null, ozone: null, time: null,
        hours: [], source: 'unavailable', note: reason, grid: null, official: officialUrl(z)
    });
    async function getAir(id, force = false) {
        const z = zone(id);
        const cached = airCache.get(z.id) || read('aqi_' + z.id);
        const isRecorded = x => x && x.data && x.data.source === 'api' && x.data.dataVersion === 2 && validAqi(x.data.ica) && x.data.time &&
            Date.now() - new Date(x.data.time).getTime() < 3 * 3600000;
        if (!force && isRecorded(cached) && Date.now() - cached.savedAt < 20 * 60000) {
            airCache.set(z.id, cached);
            return cached.data;
        }
        if (!force && pendingAir.has(z.id)) return pendingAir.get(z.id);
        const request = async () => {
            const endpoint = new URL('https://air-quality-api.open-meteo.com/v1/air-quality');
            endpoint.search = new URLSearchParams({
                latitude: String(z.lat), longitude: String(z.lng), domains: 'cams_global',
                current: 'us_aqi,pm2_5,pm10,ozone', hourly: 'us_aqi', past_days: '30',
                forecast_days: '2', timezone: 'America/Lima'
            }).toString();
            try {
                const response = await fetch(endpoint.toString(), { signal: AbortSignal.timeout(12000) });
                if (!response.ok) throw new Error('El servicio de datos no respondió.');
                const json = await response.json();
                const cur = json.current || {};
                const value = actualNumber(cur.us_aqi);
                if (!validAqi(value)) throw new Error('El modelo no informó un índice AQI válido.');
                const sourceTime = toLimaTime(cur.time);
                const age = Date.now() - new Date(sourceTime).getTime();
                if (!Number.isFinite(age) || age < -3 * 3600000 || age > 3 * 3600000) throw new Error('La última estimación disponible no es reciente.');
                const hours = (json.hourly?.time || []).map((t, i) => ({ time: toLimaTime(t), ica: actualNumber(json.hourly.us_aqi?.[i]) }))
                    .filter(x => validAqi(x.ica) && Number.isFinite(new Date(x.time).getTime()));
                const data = {
                    id: z.id, name: z.name, ica: Math.round(value), pm25: actualNumber(cur.pm2_5),
                    pm10: actualNumber(cur.pm10), ozone: actualNumber(cur.ozone), time: sourceTime, hours,
                    source: 'api', dataVersion: 2, grid: { latitude: actualNumber(json.latitude), longitude: actualNumber(json.longitude) },
                    official: officialUrl(z),
                    note: 'Estimación regional CAMS Global, con cuadrícula aproximada de 45 km. No es una medición local de SENAMHI ni representa uniformemente todo el distrito.'
                };
                const cache = { savedAt: Date.now(), data };
                airCache.set(z.id, cache);
                write('aqi_' + z.id, cache);
                checkAlerts(data);
                return data;
            } catch (error) {
                return unavailable(z, 'Consulta no disponible o sin respuesta reciente. AirGood no sustituye los datos ausentes por valores simulados.');
            }
        };
        const job = request().finally(() => pendingAir.delete(z.id));
        pendingAir.set(z.id, job);
        return job;
    }
    function insertAlert(item) { const a = alerts(); if (a.some(v => v.key === item.key))
        return false; a.unshift({ id: crypto.randomUUID?.() || String(Date.now()), date: timestamp(), read: false, ...item }); saveAlerts(a.slice(0, 100)); return true; }
    function checkAlerts(data) {
        if (!validAqi(data?.ica) || data.source !== 'api') return;
        const s = settings();
        const saved = read('alert_state_' + data.id, { high: false });
        const high = data.ica >= s.threshold;
        if (!s.enabled) {
            write('alert_state_' + data.id, { high });
            return;
        }
        if (high && !saved.high) {
            const a = { key: 'pollution:' + data.id + ':' + Date.now(), type: 'riesgo', zone: data.id, ica: data.ica, title: 'Calidad del aire elevada', text: recommendations(data.ica)[1] };
            if (insertAlert(a))
                notify(a, s);
        }
        if (!high && saved.high) {
            const a = { key: 'improvement:' + data.id + ':' + Date.now(), type: 'mejora', zone: data.id, ica: data.ica, title: 'La calidad del aire mejoró', text: 'Las condiciones actuales de tu zona están por debajo de tu umbral.' };
            if (insertAlert(a))
                notify(a, s);
        }
        write('alert_state_' + data.id, { high });
    }
    function notify(a, s) { if (s.desktop && 'Notification' in window && Notification.permission === 'granted' && document.visibilityState === 'visible')
        new Notification('AirGood · ' + a.title, { body: zone(a.zone).name + ' · ICA ' + a.ica + ' · ' + a.text, icon: '../assets/icons/favicon.svg' }); }
    async function hashPassword(pass, salt) { const bytes = new TextEncoder().encode(salt + ':' + pass); const digest = await crypto.subtle.digest('SHA-256', bytes); return [...new Uint8Array(digest)].map(x => x.toString(16).padStart(2, '0')).join(''); }
    const newSalt = () => [...crypto.getRandomValues(new Uint8Array(16))].map(x => x.toString(16).padStart(2, '0')).join('');
    async function register({ name, email, password }) {
        const list = read('accounts', []);
        if (list.some(x => clean(x.email) === clean(email)))
            throw Error('Ese correo ya tiene una cuenta.');
        const salt = newSalt(), passwordHash = await hashPassword(password, salt);
        const u = { id: crypto.randomUUID(), name: name.trim(), email: email.trim().toLowerCase(), salt, passwordHash, district: '', perfiles: [], created: timestamp() };
        saveUser(u);
        sessionStorage.setItem(key + 'session', u.id);
        return u;
    }
    async function login(email, password) { const account = read('accounts', []).find(x => clean(x.email) === clean(email)); if (!account || await hashPassword(password, account.salt) !== account.passwordHash)
        throw Error('Correo o contraseña incorrectos.'); sessionStorage.setItem(key + 'session', account.id); return account; }
    const logout = () => sessionStorage.removeItem(key + 'session');
    async function verifyPassword(p) { const u = user(); return Boolean(u && await hashPassword(p, u.salt) === u.passwordHash); }
    async function changePassword(oldPass, newPass) { if (!await verifyPassword(oldPass))
        throw Error('La contraseña actual no coincide.'); const u = user(); u.salt = newSalt(); u.passwordHash = await hashPassword(newPass, u.salt); saveUser(u); }
    async function deleteAccount(pass) { if (!await verifyPassword(pass))
        throw Error('La contraseña no es correcta.'); const u = user(); write('accounts', read('accounts', []).filter(x => x.id !== u.id)); ['favorites_', 'alerts_', 'settings_'].forEach(x => remove(x + u.id)); write('reports', reports().filter(x => x.owner !== u.id)); write('sensors', sensors().filter(x => x.owner !== u.id)); logout(); }
    const recent = () => read('recent', []);
    const rememberZone = id => write('recent', [id, ...recent().filter(x => x !== id)].slice(0, 6));
    return { zones, parks, levels, pollutants, zone, level, read, write, remove, clean, esc, timestamp, stamp, user, saveUser, sessions, profile, personalLine, recommendations, getBase, setBase, favs, saveFavs, alerts, saveAlerts, settings, saveSettings, reports, sensors, allParks, getAir, insertAlert, checkAlerts, validAqi, officialUrl, register, login, logout, verifyPassword, changePassword, deleteAccount, recent, rememberZone, key };
})();
window.Air = Air;
