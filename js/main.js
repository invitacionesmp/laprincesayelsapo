/* ========= DATOS DE LA INVITACIÓN (edita aquí) ========= */
const CONFIG = {
  nombre: "Jennifer",
  fecha: "2027-12-04T21:00:00-03:00",   // AAAA-MM-DDThh:mm:ss
  lugar1: "TOMÁS ANTONIO VALLE (K30 G. CATÁN)",
  lugar2: "EVENTOS SUEÑOS DORADOS",
  direccionMapa: "Eventos Sueños Dorados, Tomás Antonio Valle 6007, González Catán, Buenos Aires, Argentina",
  alias: "32.jenni",
  whatsapp: "",        // ej: "5493880000000" -> al enviar abre WhatsApp con la respuesta
  musicaInicio: 29,    // segundo en que empieza la canción (29 = 0:29)
  endpoint: ""         // opcional: URL de Formspree / Google Apps Script para guardar respuestas
};

const R = (a, b) => a + Math.random() * (b - a);
const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
const fecha = new Date(CONFIG.fecha), pad = n => String(n).padStart(2, "0");

/* ---- Rellenar textos ---- */
$$("[data-name]").forEach(e => e.textContent = CONFIG.nombre);
$("#dia").textContent = fecha.toLocaleDateString("es-AR", { weekday: "long" });
$("#fecha").textContent = `${pad(fecha.getDate())}/${pad(fecha.getMonth() + 1)}`;
$("#hora").textContent = `${pad(fecha.getHours())}:${pad(fecha.getMinutes())} HS`;
$("#lugar1").textContent = CONFIG.lugar1;
$("#lugar2").textContent = CONFIG.lugar2;
$("#alias").textContent = CONFIG.alias;
$("#mapa").src = "https://www.google.com/maps?q=" + encodeURIComponent(CONFIG.direccionMapa) + "&output=embed";

/* ---- Imágenes faltantes: placeholder con el nombre del archivo ---- */
function fallback(img) {
  if (img.dataset.err) return; img.dataset.err = 1;
  if (!img.dataset.ph) { img.style.visibility = "hidden"; return; }
  const [w, h] = (img.dataset.size || "300x300").split("x");
  img.src = "data:image/svg+xml," + encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' width='${w}' height='${h}'><rect width='100%' height='100%' fill='#fff' fill-opacity='.45' stroke='#6f8a58' stroke-dasharray='8 6' stroke-width='2' rx='10'/><text x='50%' y='50%' fill='#4f6b3d' font-family='sans-serif' font-size='15' text-anchor='middle'>img/${img.dataset.ph}</text></svg>`);
}
document.addEventListener("error", e => e.target.tagName === "IMG" && fallback(e.target), true);
$$("img").forEach(i => i.complete && !i.naturalWidth && fallback(i));

/* ---- Música (empieza en el segundo 29) ---- */
const audio = $("#musica"), btn = $("#musicBtn");
const setOn = on => btn.classList.toggle("on", on);
audio.addEventListener("play", () => setOn(true));
audio.addEventListener("pause", () => setOn(false));
audio.addEventListener("ended", () => { audio.currentTime = CONFIG.musicaInicio; audio.play().catch(() => {}); });  // al terminar, vuelve al 0:29
function iniciarMusica() {
  const go = () => { try { audio.currentTime = CONFIG.musicaInicio; } catch (_) {} audio.play().catch(() => {}); };
  audio.readyState >= 1 ? go() : (audio.addEventListener("loadedmetadata", go, { once: true }), audio.load());
}
btn.onclick = () => audio.paused ? audio.play().catch(() => {}) : audio.pause();

let opened = false;
$("#env").addEventListener("click", () => {
  if (opened) return; opened = true;
  $("#env").classList.add("open"); $(".tap").style.opacity = 0;
  iniciarMusica();
  const r = $("#env").getBoundingClientRect(); burst(r.left + r.width / 2, r.top + r.height / 3, 60);
  setTimeout(() => {
    $("#cover").classList.add("out"); document.body.classList.remove("locked"); window.scrollTo(0, 0);
    setTimeout(() => $("#cover").remove(), 1400);
  }, 2300);
});

/* ---- Destellos sobre los vestidos ---- */
$$(".glints").forEach(g => { for (let i = 0; i < 9; i++) { const e = document.createElement("i");
  e.style.cssText = `left:${R(5, 90)}%;top:${R(25, 95)}%;animation-delay:${R(0, 3).toFixed(2)}s;animation-duration:${R(2, 3.6).toFixed(2)}s;scale:${R(.6, 1.2).toFixed(2)}`; g.appendChild(e); } });

/* ---- Animaciones al hacer scroll ---- */
const io = new IntersectionObserver(es => es.forEach(e => {
  if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
}), { threshold: .15 });
$$(".rv").forEach((e, i) => { e.style.setProperty("--d", (i % 3) * .12 + "s"); io.observe(e); });

/* ---- Parallax suave en flores ---- */
const par = $$(".par");
addEventListener("scroll", () => { const y = scrollY; par.forEach(p => p.style.translate = `0 ${y * p.dataset.s}px`); }, { passive: true });

/* ---- Cuenta regresiva ---- */
function tick() {
  let t = Math.max(0, fecha - Date.now()) / 1000;
  const v = { d: Math.floor(t / 86400), h: Math.floor(t % 86400 / 3600), m: Math.floor(t % 3600 / 60), s: Math.floor(t % 60) };
  for (const k in v) { const el = $("#" + k), txt = pad(v[k]); if (el.textContent !== txt) { el.textContent = txt; el.classList.remove("tick"); void el.offsetWidth; el.classList.add("tick"); } }
}
tick(); setInterval(tick, 1000);

/* ---- Formulario ---- */
$("#form").addEventListener("submit", async e => {
  e.preventDefault();
  const nombre = $("#nombre").value.trim(), asiste = (document.querySelector("[name=asiste]:checked") || {}).value, msg = $("#msg");
  if (!nombre || !asiste) { msg.textContent = "Por favor completa tu nombre y elige una opción."; return; }
  const data = { nombre, asiste, fecha: new Date().toISOString() };
  try { localStorage.setItem("rsvp", JSON.stringify(data)); } catch (_) {}
  if (CONFIG.endpoint) fetch(CONFIG.endpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).catch(() => {});
  msg.textContent = "Se ha guardado la respuesta ✨";
  const r = e.submitter.getBoundingClientRect(); burst(r.left + r.width / 2, r.top, 50);
  if (CONFIG.whatsapp) open(`https://wa.me/${CONFIG.whatsapp}?text=` + encodeURIComponent(`Hola! Soy ${nombre}. ${asiste} 🎉`), "_blank");
});

/* ---- Partículas: destellos, luciérnagas, pétalos y estela ---- */
const cv = $("#fx"), cx = cv.getContext("2d"), dpr = Math.min(devicePixelRatio || 1, 2);
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
let W, H, P = [];
function size() { W = innerWidth; H = innerHeight; cv.width = W * dpr; cv.height = H * dpr; cx.setTransform(dpr, 0, 0, dpr, 0, 0); }
addEventListener("resize", size); size();
const cols = ["#fff", "#fff6c8", "#f2d78a", "#d9ecb0"];
function make(t, x, y) {
  const o = { t, x: x ?? R(0, W), y: y ?? R(0, H), ph: R(0, 6.28), c: cols[Math.floor(R(0, cols.length))] };
  if (t === "spark") Object.assign(o, { r: R(2, 5.5), vy: -R(.08, .35), vx: R(-.1, .1), sp: R(.02, .06) });
  if (t === "fly") Object.assign(o, { r: R(6, 12), a: R(0, 6.28), sp: R(.2, .6) });
  if (t === "petal") Object.assign(o, { y: y ?? -20, r: R(4, 8), vy: R(.4, 1), rot: R(0, 6.28), vr: R(-.03, .03) });
  if (t === "burst") Object.assign(o, { r: R(2, 5), vx: R(-3, 3), vy: R(-4, 1.5), life: 1 });
  return o;
}
const n = W < 500 ? .7 : 1;
if (!reduce) {
  for (let i = 0; i < 45 * n; i++) P.push(make("spark"));
  for (let i = 0; i < 12 * n; i++) P.push(make("fly"));
  for (let i = 0; i < 12 * n; i++) P.push(make("petal", undefined, R(-H, H)));
}
function star(x, y, r) { cx.beginPath(); for (let i = 0; i < 8; i++) { const q = i % 2 ? r * .25 : r, a = i * Math.PI / 4; cx.lineTo(x + Math.cos(a) * q, y + Math.sin(a) * q); } cx.closePath(); cx.fill(); }
function burst(x, y, k) { if (reduce) return; for (let i = 0; i < k; i++) P.push(make("burst", x, y)); }
let lastT = 0;
addEventListener("pointermove", e => { if (reduce || e.timeStamp - lastT < 40) return; lastT = e.timeStamp; for (let i = 0; i < 2; i++) { const p = make("burst", e.clientX, e.clientY); p.vx *= .3; p.vy *= .3; p.r *= .7; P.push(p); } }, { passive: true });
function frame(ts) {
  cx.clearRect(0, 0, W, H);
  for (let i = P.length - 1; i >= 0; i--) {
    const p = P[i]; p.ph += .05;
    if (p.t === "spark") {
      p.x += p.vx; p.y += p.vy; if (p.y < -10) { p.y = H + 10; p.x = R(0, W); }
      cx.globalAlpha = .25 + .75 * Math.abs(Math.sin(p.ph * p.sp * 20)); cx.fillStyle = p.c; star(p.x, p.y, p.r);
    } else if (p.t === "fly") {
      p.a += Math.sin(p.ph * .3) * .08; p.x += Math.cos(p.a) * p.sp; p.y += Math.sin(p.a) * p.sp;
      if (p.x < -20) p.x = W + 20; if (p.x > W + 20) p.x = -20; if (p.y < -20) p.y = H + 20; if (p.y > H + 20) p.y = -20;
      const g = cx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r), al = .35 + .35 * Math.sin(p.ph * .6);
      g.addColorStop(0, `rgba(255,248,170,${al + .3})`); g.addColorStop(.4, `rgba(220,240,120,${al * .5})`); g.addColorStop(1, "rgba(220,240,120,0)");
      cx.globalAlpha = 1; cx.fillStyle = g; cx.beginPath(); cx.arc(p.x, p.y, p.r, 0, 6.28); cx.fill();
    } else if (p.t === "petal") {
      p.y += p.vy; p.x += Math.sin(p.ph) * .7; p.rot += p.vr; if (p.y > H + 20) { p.y = -20; p.x = R(0, W); }
      cx.save(); cx.translate(p.x, p.y); cx.rotate(p.rot); cx.globalAlpha = .75; cx.fillStyle = "#fffdf4";
      cx.beginPath(); cx.ellipse(0, 0, p.r, p.r * .55, 0, 0, 6.28); cx.fill(); cx.restore();
    } else {
      p.x += p.vx; p.y += p.vy; p.vy += .05; p.life -= .02;
      if (p.life <= 0) { P.splice(i, 1); continue; }
      cx.globalAlpha = p.life; cx.fillStyle = p.c; star(p.x, p.y, p.r * (1 + p.life));
    }
  }
  cx.globalAlpha = 1; requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
