/* ============================================================
   build-data.mjs
   Lee el Google Sheet de pruebas (CSV público), lo interpreta y
   genera data.js con window.DASHBOARD_DATA para el tablero.
   Se ejecuta en la GitHub Action (cada hora) y también en local.
   Uso: node build-data.mjs
   ============================================================ */

import { writeFileSync } from 'node:fs';

const SHEET_ID = '1eAyPECgajnUTBYrIeKALlj0PWDMq3D6qc9nalekbhBg';
const GID = '0';
const URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=${GID}`;

/* ---------- Parser CSV robusto (comillas y saltos de línea) ---------- */
function parseCSV(text){
  const rows = []; let row = [], field = '', inQ = false;
  for (let i = 0; i < text.length; i++){
    const c = text[i];
    if (inQ){
      if (c === '"'){
        if (text[i + 1] === '"'){ field += '"'; i++; }
        else inQ = false;
      } else field += c;
    } else {
      if (c === '"') inQ = true;
      else if (c === ',') { row.push(field); field = ''; }
      else if (c === '\r') { /* ignore */ }
      else if (c === '\n') { row.push(field); rows.push(row); row = []; field = ''; }
      else field += c;
    }
  }
  if (field.length || row.length){ row.push(field); rows.push(row); }
  return rows;
}

/* ---------- Utilidades ---------- */
const stripAccents = (s) => (s || '').normalize('NFD')
  .split('').filter(ch => { const c = ch.codePointAt(0); return c < 0x300 || c > 0x36f; }).join('');
const norm = (s) => stripAccents(s).toUpperCase().trim();

function toISO(raw){
  const s = (raw || '').trim();
  let m;
  if ((m = s.match(/^(\d{4})-(\d{2})-(\d{2})/)))          return `${m[1]}-${m[2]}-${m[3]}`;
  if ((m = s.match(/^(\d{2})(\d{2})\/(\d{4})$/)))         return `${m[3]}-${m[2]}-${m[1]}`; // DDMM/YYYY (ej. 1606/2026)
  if ((m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/)))   return `${m[3]}-${String(m[2]).padStart(2,'0')}-${String(m[1]).padStart(2,'0')}`; // DD/MM/YYYY
  return null;
}

function resultado(v){
  const n = norm(v);
  if (!n) return '';
  if (n.includes('SATISF') && (n.startsWith('NO') || n.includes('NO SATISF'))) return 'NOSAT';
  if (n.includes('SATISF')) return 'SAT';
  return '';
}
function min1(v){
  const n = norm(v);
  if (!n) return null;
  if (n.startsWith('SI') || n === 'S') return true;
  if (n.startsWith('NO')) return false;
  return null;
}
function categoria(q, o){
  const t = norm(q + ' ' + o);
  if (t.includes('ERROR') || t.includes('NO GENER')) return 'infofail';
  if (t.includes('INFORME') || t.includes('OPERACION') || t.includes('ENTREGA') ||
      t.includes('MENU') || t.includes('PDF') || t.includes('EXCEL') || t.includes('FOTO')) return 'menu';
  return 'otro';
}

/* ---------- Localizar columnas por su encabezado ---------- */
function colFinder(header){
  const H = header.map(norm);
  const find = (...keys) => { for (let i = 0; i < H.length; i++) if (keys.some(k => H[i].includes(k))) return i; return -1; };
  return {
    fecha:  find('FECHA'),
    consul: find('CONSULTA'),
    result: find('RESULTADO'),
    min1:   find('MINUTO'),
    obs:    find('OBSERVA'),
  };
}

/* ---------- Principal ---------- */
const res = await fetch(URL, { redirect: 'follow' });
if (!res.ok) { console.error('Error al leer el Sheet:', res.status); process.exit(1); }
const csv = await res.text();
const table = parseCSV(csv);
if (!table.length) { console.error('Sheet vacío'); process.exit(1); }

const header = table[0];
const col = colFinder(header);

let lastDate = null;
const rows = [];
for (let i = 1; i < table.length; i++){
  const r = table[i];
  const consulta = (r[col.consul] || '').trim();
  const resultRaw = col.result >= 0 ? (r[col.result] || '').trim() : '';
  if (!consulta && !resultRaw) continue;                 // fila vacía → se ignora

  const iso = toISO(r[col.fecha]);
  if (iso) lastDate = iso;                                // recuerda la última fecha válida
  const f = iso || lastDate;                              // filas sin fecha heredan la anterior
  if (!f) continue;

  const rr = resultado(resultRaw);
  const mm = col.min1 >= 0 ? min1(r[col.min1]) : null;
  const row = { f, r: rr };
  if (mm !== null) row.m = mm;                            // guarda SÍ (true) y NO (false)
  if (rr === 'NOSAT'){
    row.q = consulta;
    row.o = col.obs >= 0 ? (r[col.obs] || '').trim() : '';
    row.c = categoria(consulta, row.o);
  }
  rows.push(row);
}

/* ---------- Escribir data.js ---------- */
const now = new Date();
const payload = { generatedAt: now.toISOString(), rows };
writeFileSync('data.js', 'window.DASHBOARD_DATA = ' + JSON.stringify(payload) + ';\n', 'utf8');

/* ---------- Resumen por consola (para verificar) ---------- */
const by = {};
for (const x of rows){
  const b = by[x.f] || (by[x.f] = { total:0, SAT:0, NOSAT:0, vacio:0, medidas:0, min1:0 });
  b.total++; if (x.r === 'SAT') b.SAT++; else if (x.r === 'NOSAT') b.NOSAT++; else b.vacio++;
  if (x.m === true || x.m === false) b.medidas++;
  if (x.m === true) b.min1++;
}
console.log('Total pruebas:', rows.length);
for (const d of Object.keys(by).sort())
  console.log(`  ${d}  total=${by[d].total}  SAT=${by[d].SAT}  NOSAT=${by[d].NOSAT}  sinEval=${by[d].vacio}  medidas=${by[d].medidas}  <=min=${by[d].min1}`);
