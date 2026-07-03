/* ============================================================
   Tablero de indicadores · Asistente Mariana (Conalca)
   2 gráficas clave (satisfacción y respuesta < 1 min) + filtro
   por fecha. Sin librerías externas.
   ============================================================ */

/* ---------- 1. Datos (62 pruebas de la matriz) ----------
   f=fecha  s=sesión  r=resultado ('SAT'|'NOSAT'|'' sin evaluar)
   m=respuesta < 1 min (true|false|null no medido)
   q=consulta  c=categoría de falla  o=observación
   La sesión intermedia venía por # de fila; se le asignó 2026-06-24. */

const FALLBACK = [
  // ----- 16 jun 2026 (35 pruebas) -----
  {f:'2026-06-16', s:'16 jun', r:'SAT'},
  {f:'2026-06-16', s:'16 jun', r:'SAT'},
  {f:'2026-06-16', s:'16 jun', r:'SAT'},
  {f:'2026-06-16', s:'16 jun', r:'SAT'},
  {f:'2026-06-16', s:'16 jun', r:'SAT'},
  {f:'2026-06-16', s:'16 jun', r:'SAT'},
  {f:'2026-06-16', s:'16 jun', r:'NOSAT', c:'menu',
    q:'Dame un resumen de mis operaciones activas por ciudad de origen y destino.',
    o:'Ofreció un informe en PDF/Excel en vez de responder. Bug con las palabras informe, operaciones, entregas.'},
  {f:'2026-06-16', s:'16 jun', r:'SAT'},
  {f:'2026-06-16', s:'16 jun', r:'SAT'},
  {f:'2026-06-16', s:'16 jun', r:'SAT'},
  {f:'2026-06-16', s:'16 jun', r:'SAT'},
  {f:'2026-06-16', s:'16 jun', r:'SAT'},
  {f:'2026-06-16', s:'16 jun', r:'SAT'},
  {f:'2026-06-16', s:'16 jun', r:'SAT'},
  {f:'2026-06-16', s:'16 jun', r:'SAT'},
  {f:'2026-06-16', s:'16 jun', r:'SAT'},
  {f:'2026-06-16', s:'16 jun', r:'SAT'},
  {f:'2026-06-16', s:'16 jun', r:'SAT'},
  {f:'2026-06-16', s:'16 jun', r:'SAT'},
  {f:'2026-06-16', s:'16 jun', r:'SAT'},
  {f:'2026-06-16', s:'16 jun', r:'SAT'},
  {f:'2026-06-16', s:'16 jun', r:'SAT'},
  {f:'2026-06-16', s:'16 jun', r:'SAT'},
  {f:'2026-06-16', s:'16 jun', r:'SAT'},
  {f:'2026-06-16', s:'16 jun', r:'SAT'},
  {f:'2026-06-16', s:'16 jun', r:'SAT'},
  {f:'2026-06-16', s:'16 jun', r:'SAT'},
  {f:'2026-06-16', s:'16 jun', r:'SAT'},
  {f:'2026-06-16', s:'16 jun', r:'SAT'},
  {f:'2026-06-16', s:'16 jun', r:'SAT'},
  {f:'2026-06-16', s:'16 jun', r:'SAT'},
  {f:'2026-06-16', s:'16 jun', r:'SAT'},
  {f:'2026-06-16', s:'16 jun', r:'NOSAT', c:'menu',
    q:'Dame un informe técnico con fecha, placa, conductor, origen, destino, tiempos y cumplimiento.',
    o:'Respondió con el menú de informes en lugar de generar la tabla solicitada.'},
  {f:'2026-06-16', s:'16 jun', r:'NOSAT', c:'menu',
    q:'Dame las fotos de cargue y descargue de la operación.',
    o:'Cayó al menú de informes; no entrega fotos ni aclara que no las tiene.'},
  {f:'2026-06-16', s:'16 jun', r:'SAT'},

  // ----- 24 jun 2026 (15 pruebas) -----
  {f:'2026-06-24', s:'24 jun', r:'SAT'},
  {f:'2026-06-24', s:'24 jun', r:'SAT'},
  {f:'2026-06-24', s:'24 jun', r:'SAT'},
  {f:'2026-06-24', s:'24 jun', r:'SAT'},
  {f:'2026-06-24', s:'24 jun', r:'SAT'},
  {f:'2026-06-24', s:'24 jun', r:'SAT'},
  {f:'2026-06-24', s:'24 jun', r:'SAT'},
  {f:'2026-06-24', s:'24 jun', r:'SAT'},
  {f:'2026-06-24', s:'24 jun', r:'SAT'},
  {f:'2026-06-24', s:'24 jun', r:'SAT'},
  {f:'2026-06-24', s:'24 jun', r:'SAT'},
  {f:'2026-06-24', s:'24 jun', r:'SAT'},
  {f:'2026-06-24', s:'24 jun', r:'SAT'},
  {f:'2026-06-24', s:'24 jun', r:'SAT'},
  {f:'2026-06-24', s:'24 jun', r:'SAT'},

  // ----- 3 jul 2026 (12 pruebas · todas medidas < 1 min) -----
  {f:'2026-07-03', s:'3 jul', r:'SAT',   m:true},
  {f:'2026-07-03', s:'3 jul', r:'NOSAT', m:true, c:'otro',
    q:'¿Qué viajes tengo activos ahora?',
    o:'Marcada No satisfactorio sin observación registrada en la matriz.'},
  {f:'2026-07-03', s:'3 jul', r:'',      m:true},
  {f:'2026-07-03', s:'3 jul', r:'SAT',   m:true},
  {f:'2026-07-03', s:'3 jul', r:'',      m:true},
  {f:'2026-07-03', s:'3 jul', r:'',      m:true},
  {f:'2026-07-03', s:'3 jul', r:'NOSAT', m:true, c:'infofail',
    q:'Genérame un informe de mis servicios activos.',
    o:'«Ocurrió un error al generar el informe.» Además hace demasiadas preguntas pese a la instrucción inicial.'},
  {f:'2026-07-03', s:'3 jul', r:'',      m:true},
  {f:'2026-07-03', s:'3 jul', r:'',      m:true},
  {f:'2026-07-03', s:'3 jul', r:'',      m:true},
  {f:'2026-07-03', s:'3 jul', r:'',      m:true},
  {f:'2026-07-03', s:'3 jul', r:'',      m:true},
];

const CAT_LABEL = {
  menu:     'Cae al menú de informes',
  infofail: 'Generación de informes falla',
  otro:     'Otro / sin clasificar',
};
// Datos: del Sheet (data.js, generado cada hora) o, si no está, del respaldo embebido.
const PAYLOAD = (typeof window !== 'undefined' && window.DASHBOARD_DATA) ? window.DASHBOARD_DATA : null;
let DATA = (PAYLOAD && Array.isArray(PAYLOAD.rows) && PAYLOAD.rows.length) ? PAYLOAD.rows : FALLBACK;
let MIN_F = DATA.reduce((a, x) => x.f < a ? x.f : a, DATA[0].f);
let MAX_F = DATA.reduce((a, x) => x.f > a ? x.f : a, DATA[0].f);

const MESES = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];
const fFecha = (iso, y) => { const [Y,M,D] = iso.split('-'); return Number(D) + ' ' + MESES[Number(M)-1] + (y ? ' ' + Y : ''); };

/* ---------- 2. Utilidades ---------- */
const $ = (id) => document.getElementById(id);
function fmtBig(x){
  if (x == null || isNaN(x)) return '—';
  const r = Math.round(x * 10) / 10;
  return ((r % 1 === 0) ? String(r) : r.toFixed(1)).replace('.', ',');
}
const fmtPct = (x) => x == null ? '—' : fmtBig(x) + ' %';
const esc = (s) => (s || '').replace(/[&<>"]/g, (c) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const tone = (p) => p == null ? 'neutral' : p >= 90 ? 'good' : p >= 60 ? 'warn' : 'bad';

/* ---------- 3. Métricas ---------- */
function metrics(rows){
  const sat = rows.filter(r => r.r === 'SAT').length;
  const nosat = rows.filter(r => r.r === 'NOSAT').length;
  const sineval = rows.filter(r => r.r === '').length;
  const evaluadas = sat + nosat;
  const medidas = rows.filter(r => r.m === true || r.m === false).length;
  const min1yes = rows.filter(r => r.m === true).length;
  const fallas = rows.filter(r => r.r === 'NOSAT');
  return {
    total: rows.length, sat, nosat, sineval, evaluadas,
    satPct: evaluadas ? (sat / evaluadas * 100) : null,
    coberturaPct: rows.length ? (evaluadas / rows.length * 100) : null,
    medidas, min1yes, min1Pct: medidas ? (min1yes / medidas * 100) : null,
    fallas,
  };
}

/* ---------- 4. Filtro ---------- */
let from = MIN_F, to = MAX_F;
const filtered = () => DATA.filter(r => r.f >= from && r.f <= to);

/* ---------- 5. Render ---------- */
function render(){
  const m = metrics(filtered());
  renderVerdict(m);
  gauge('gaugeSat', 'capSat', 'badgeSat', m.satPct,
        `<b>${m.sat}</b> de <b>${m.evaluadas}</b> evaluadas`,
        'Sin pruebas evaluadas en el rango', 'Satisfacción');
  gauge('gaugeMin', 'capMin', 'badgeMin', m.min1Pct,
        `<b>${m.min1yes}</b> de <b>${m.medidas}</b> medidas`,
        'Aún no se registra en este rango', 'Respuesta < 2 min');
  renderStats(m);
  renderFallas(m);
  renderNota(m);
}

function renderMeta(){
  $('metaPeriodo').textContent = MIN_F === MAX_F ? fFecha(MIN_F, true) : `${fFecha(MIN_F)} – ${fFecha(MAX_F, true)}`;
  $('metaTotal').textContent = DATA.length;
  if (PAYLOAD && PAYLOAD.generatedAt){
    try {
      $('metaCorte').textContent = new Date(PAYLOAD.generatedAt)
        .toLocaleString('es-CO', {day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit'});
    } catch { $('metaCorte').textContent = PAYLOAD.generatedAt.slice(0,16).replace('T',' '); }
  } else {
    $('metaCorte').textContent = 'datos de ejemplo';
  }
}

function renderVerdict(m){
  if (m.total === 0){
    $('verdict').innerHTML = `<span class="dot warn"></span><span class="muted">Sin pruebas en el rango seleccionado.</span>`;
    return;
  }
  const t = tone(m.satPct);
  const txt = m.satPct == null ? 'sin datos' : m.satPct >= 90 ? 'buena' : m.satPct >= 60 ? 'aceptable' : 'requiere atención';
  $('verdict').innerHTML =
    `<span class="dot ${t === 'neutral' ? 'warn' : t}"></span><strong>Calidad general: ${txt}.</strong>` +
    `<span class="muted">${fmtPct(m.satPct)} de satisfacción</span>` +
    `<span class="sep">·</span><span class="muted"><b>${m.nosat}</b> ${m.nosat === 1 ? 'falla' : 'fallas'}</span>` +
    `<span class="sep">·</span><span class="muted"><b>${m.sineval}</b> sin evaluar</span>`;
}

function initFilter(){
  const f = $('from'), t = $('to');
  // Se guía con los límites de los datos, pero puedes elegir cualquier día del rango.
  f.min = MIN_F; f.max = MAX_F; f.value = from;
  t.min = MIN_F; t.max = MAX_F; t.value = to;
  f.addEventListener('change', (e) => {
    from = e.target.value || MIN_F;
    if (from > to){ to = from; t.value = to; }
    render();
  });
  t.addEventListener('change', (e) => {
    to = e.target.value || MAX_F;
    if (to < from){ from = to; f.value = from; }
    render();
  });
  $('reset').addEventListener('click', () => {
    from = MIN_F; to = MAX_F; f.value = from; t.value = to; render();
  });
}

/* ---------- 6. Gráfica circular (gauge) ---------- */
function gauge(gaugeId, capId, badgeId, pct, capHTML, capEmpty, name){
  const size = 190, sw = 18, r = (size - sw) / 2 - 2, cx = size / 2, cy = size / 2, C = 2 * Math.PI * r;
  const host = $(gaugeId), cap = $(capId), badge = $(badgeId);
  const t = tone(pct);

  if (pct == null){
    host.innerHTML =
      `<svg viewBox="0 0 ${size} ${size}" class="gauge" role="img" aria-label="${name}: sin datos">
         <circle class="g-track" cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke-width="${sw}"></circle>
         <text x="${cx}" y="${cy}" class="g-num" dominant-baseline="central">—</text>
       </svg>`;
    cap.textContent = capEmpty;
    badge.className = 'gauge-badge neutral'; badge.textContent = 'Sin datos';
    return;
  }

  const len = (pct / 100) * C;
  host.innerHTML =
    `<svg viewBox="0 0 ${size} ${size}" class="gauge" role="img" aria-label="${name}: ${fmtPct(pct)}"
          data-tt="<b>${name}</b><br>${fmtPct(pct)}">
       <circle class="g-track" cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke-width="${sw}"></circle>
       <circle class="g-arc ${t}" cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke-width="${sw}"
               stroke-dasharray="${len.toFixed(2)} ${(C - len).toFixed(2)}" transform="rotate(-90 ${cx} ${cy})"></circle>
       <text x="${cx}" y="${cy}" class="g-num" dominant-baseline="central">${fmtBig(pct)}<tspan class="g-unit"> %</tspan></text>
     </svg>`;
  cap.innerHTML = capHTML;
  const bTxt = t === 'good' ? '▲ En meta' : t === 'warn' ? '● Aceptable' : '▼ Atención';
  badge.className = 'gauge-badge ' + t;
  badge.textContent = bTxt;
}

/* ---------- 7. Estadísticas de apoyo ---------- */
function renderStats(m){
  const stats = [
    {label:'Cobertura', val:m.coberturaPct != null ? fmtBig(m.coberturaPct) + ' %' : '—',
      sub:`${m.evaluadas}/${m.total} evaluadas`, t:'accent'},
    {label:'Pruebas', val:m.total, sub:'en el rango', t:'accent'},
    {label:'Fallas', val:m.nosat, sub:'no satisfactorias', t:m.nosat ? 'bad' : 'good'},
    {label:'Sin evaluar', val:m.sineval, sub:'pendientes', t:m.sineval ? 'warn' : 'good'},
  ];
  $('stats').innerHTML = stats.map(s => `
    <div class="stat t-${s.t}">
      <span class="s-label">${s.label}</span>
      <span class="s-val">${s.val}</span>
      <span class="s-sub">${s.sub}</span>
    </div>`).join('');
}

/* ---------- 8. Fallas ---------- */
function renderFallas(m){
  $('fallasCount').textContent = m.fallas.length + (m.fallas.length === 1 ? ' caso' : ' casos');
  if (!m.fallas.length){
    $('flist').innerHTML = '<div class="empty">Sin fallas en este rango 🎉</div>';
    return;
  }
  const mon = (f) => ({'06':'jun', '07':'jul'}[f.slice(5, 7)] || '');
  $('flist').innerHTML = m.fallas.map(f => `
    <div class="fitem">
      <span class="tag">${Number(f.f.slice(8, 10))} ${mon(f.f)}</span>
      <div class="fbody">
        <div class="q">“${esc(f.q)}”</div>
        <div class="o">${esc(f.o)}</div>
        <span class="cat">${esc(CAT_LABEL[f.c] || f.c)}</span>
      </div>
    </div>`).join('');
}

/* ---------- 9. Nota ---------- */
function renderNota(m){
  $('notaTxt').innerHTML =
    `Las columnas <code>Evidencia</code>, <code>Validado en Silogtran</code> y <code>Validado en Arcángel</code> ` +
    `están vacías, y <b>${m.sineval} ${m.sineval === 1 ? 'prueba quedó' : 'pruebas quedaron'} sin marcar</b> en el rango actual. ` +
    `Al completarlas se activan los <b>indicadores de precisión del dato</b>.`;
}

/* ---------- 10. Tooltip ---------- */
const tt = $('tt');
document.addEventListener('mouseover', (e) => {
  const el = e.target.closest('[data-tt]');
  if (!el) return;
  tt.innerHTML = el.dataset.tt; tt.classList.add('on');
});
document.addEventListener('mousemove', (e) => {
  if (!tt.classList.contains('on')) return;
  const pad = 14; let x = e.clientX + pad, y = e.clientY + pad;
  const r = tt.getBoundingClientRect();
  if (x + r.width > innerWidth) x = e.clientX - r.width - pad;
  if (y + r.height > innerHeight) y = e.clientY - r.height - pad;
  tt.style.left = x + 'px'; tt.style.top = y + 'px';
});
document.addEventListener('mouseout', (e) => { if (e.target.closest('[data-tt]')) tt.classList.remove('on'); });

/* ---------- 11. Tema claro/oscuro ---------- */
function updateThemeIcon(){
  const cur = document.documentElement.getAttribute('data-theme');
  const isDark = cur ? cur === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches;
  $('themeBtn').textContent = isDark ? '☀' : '☾';
}
function initTheme(){
  const saved = localStorage.getItem('mariana-theme');
  if (saved) document.documentElement.setAttribute('data-theme', saved);
  updateThemeIcon();
  $('themeBtn').addEventListener('click', () => {
    const cur = document.documentElement.getAttribute('data-theme');
    const isDark = cur ? cur === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches;
    const next = isDark ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('mariana-theme', next);
    updateThemeIcon();
  });
}

/* ---------- 12. Arranque ---------- */
initTheme();
initFilter();
renderMeta();
render();
