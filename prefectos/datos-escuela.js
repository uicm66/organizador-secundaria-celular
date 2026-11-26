// Datos de la escuela para la página pública de las prefectas.
// No hay servidor: la lista de maestros, el nombre de la escuela y el WhatsApp viajan DENTRO del
// enlace (después del #, que nunca se envía a ningún servidor) y se guardan en este celular.
// Formato: #e=<base64url(deflate-raw(JSON))>   JSON = {n:nombre, s:siglas, w:whatsapp, m:[[nombre, academia], ...]}
(function () {
  var CLAVE = "pf-escuela-datos";
  var ORIGINAL_FETCH = window.fetch.bind(window);
  var datos = null;

  function b64urlABytes(s) {
    s = s.replace(/-/g, "+").replace(/_/g, "/"); while (s.length % 4) s += "=";
    var bin = atob(s), u = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i);
    return u;
  }
  async function descomprimir(bytes) {
    var ds = new DecompressionStream("deflate-raw");
    var w = ds.writable.getWriter(); w.write(bytes); w.close();
    return new Response(ds.readable).text();
  }
  function aRespuesta(d) {
    var maestros = ((d && d.m) || []).map(function (x, i) { return { id: "m" + i, nombre: x[0] || "", academia: x[1] || "" }; });
    // wa.me necesita código de país: un número de 10 dígitos (México) recibe el 52, también si el enlace es viejo.
    var w = String((d && d.w) || "").replace(/\D/g, ""); if (w.length === 10) w = "52" + w;
    var gr = (d && Array.isArray(d.g) && d.g.length === 3) ? d.g.map(function (n) { n = parseInt(n, 10); return isNaN(n) ? 6 : Math.max(0, Math.min(12, n)); }) : [6, 6, 6];
    // obs: el programa de la escuela ya sabe importar «Observación» (enlaces nuevos traen o:1); si no, el botón no aparece.
    var esc = { nombre: (d && d.n) || "", siglas: (d && d.s) || "", whatsapp: w, grupos: gr, obs: !!(d && d.o) };
    return { maestros: maestros, escuela: esc };
  }
  var lista = null;
  var listo = (async function () {
    var h = (location.hash || "").match(/[#&]e=([A-Za-z0-9_-]+)/);
    if (h) {
      try {
        var d = JSON.parse(await descomprimir(b64urlABytes(h[1])));
        localStorage.setItem(CLAVE, JSON.stringify(d));
      } catch (e) { console.error("Enlace de la escuela inválido", e); }
    }
    try { datos = JSON.parse(localStorage.getItem(CLAVE) || "null"); } catch (e) { datos = null; }
    lista = aRespuesta(datos);
    if (!datos) {
      // En iPhone el acceso directo guarda sus datos APARTE de Safari y abre la página sin el "#e=…":
      // por eso aquí se puede PEGAR el enlace de la escuela (se copia en WhatsApp dejando el dedo sobre él).
      var mostrar = function () {
        var b = document.createElement("div");
        b.style.cssText = "position:fixed;top:0;left:0;right:0;z-index:99999;background:#b91c1c;color:#fff;padding:calc(env(safe-area-inset-top) + 12px) 14px 12px;font:600 14px system-ui;text-align:center;cursor:pointer";
        b.innerHTML = "Falta el enlace de tu escuela.<br><u>Toca aquí para pegarlo</u>";
        b.addEventListener("click", abrirPegar);
        document.body.appendChild(b);
      };
      if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", mostrar); else mostrar();
    }
  })();

  function abrirPegar() {
    if (document.getElementById("pf-pegar-enlace")) return;
    var f = document.createElement("div");
    f.id = "pf-pegar-enlace";
    f.style.cssText = "position:fixed;inset:0;z-index:100000;background:rgba(0,0,0,.55);display:flex;align-items:flex-start;justify-content:center;padding:calc(env(safe-area-inset-top) + 24px) 14px 14px;font-family:system-ui";
    f.innerHTML = "<div style='background:#fff;border-radius:14px;padding:16px;max-width:420px;width:100%;box-shadow:0 10px 30px rgba(0,0,0,.3)'>"
      + "<div style='font-weight:700;font-size:16px;margin-bottom:8px;color:#1a237e'>Pega el enlace de tu escuela</div>"
      + "<ol style='font-size:14px;color:#444;margin:0 0 10px;padding-left:20px;line-height:1.5'>"
      + "<li>En WhatsApp, deja el dedo sobre el enlace que te mandó la dirección y toca <b>Copiar</b>.</li>"
      + "<li>Regresa aquí, deja el dedo en el cuadro de abajo y toca <b>Pegar</b>.</li></ol>"
      + "<textarea id='pf-pegar-texto' rows='4' style='width:100%;box-sizing:border-box;font-size:16px;padding:8px;border:1.5px solid #c5cae9;border-radius:8px' placeholder='https://…/prefectos/#e=…'></textarea>"
      + "<div id='pf-pegar-error' style='color:#b91c1c;font-size:13px;min-height:18px;margin:6px 0'></div>"
      + "<div style='display:flex;gap:8px;justify-content:flex-end'>"
      + "<button id='pf-pegar-cancelar' style='padding:10px 14px;border-radius:8px;border:1px solid #ccc;background:#fff;font-size:15px'>Cancelar</button>"
      + "<button id='pf-pegar-guardar' style='padding:10px 16px;border-radius:8px;border:none;background:#1a237e;color:#fff;font-weight:700;font-size:15px'>Guardar</button>"
      + "</div></div>";
    document.body.appendChild(f);
    document.getElementById("pf-pegar-cancelar").onclick = function () { f.remove(); };
    document.getElementById("pf-pegar-guardar").onclick = async function () {
      var err = document.getElementById("pf-pegar-error");
      var m = String(document.getElementById("pf-pegar-texto").value || "").match(/[#&]e=([A-Za-z0-9_-]+)/);
      if (!m) { err.textContent = "Ese no es el enlace completo. Cópialo otra vez de WhatsApp (es muy largo)."; return; }
      try {
        var d = JSON.parse(await descomprimir(b64urlABytes(m[1])));
        if (!d || !Array.isArray(d.m)) throw new Error("sin maestros");
        localStorage.setItem(CLAVE, JSON.stringify(d));
        location.reload();
      } catch (e) { err.textContent = "El enlace está incompleto o dañado. Cópialo otra vez de WhatsApp."; }
    };
  }

  window.fetch = function (url, opts) {
    if (typeof url === "string" && url.indexOf("/api/prefectos/maestros") !== -1) {
      return listo.then(function () {
        return new Response(JSON.stringify(lista), { status: 200, headers: { "Content-Type": "application/json" } });
      });
    }
    return ORIGINAL_FETCH(url, opts);
  };
})();
