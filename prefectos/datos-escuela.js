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
    var esc = { nombre: (d && d.n) || "", siglas: (d && d.s) || "", whatsapp: w, grupos: gr };
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
      document.addEventListener("DOMContentLoaded", function () {
        var b = document.createElement("div");
        b.style.cssText = "position:fixed;top:0;left:0;right:0;z-index:99999;background:#b91c1c;color:#fff;padding:12px 14px;font:600 14px system-ui;text-align:center";
        b.textContent = "Falta el enlace de tu escuela. Pídele a la dirección que te lo mande otra vez por WhatsApp y ábrelo desde ahí.";
        document.body.appendChild(b);
      });
    }
  })();

  window.fetch = function (url, opts) {
    if (typeof url === "string" && url.indexOf("/api/prefectos/maestros") !== -1) {
      return listo.then(function () {
        return new Response(JSON.stringify(lista), { status: 200, headers: { "Content-Type": "application/json" } });
      });
    }
    return ORIGINAL_FETCH(url, opts);
  };
})();
