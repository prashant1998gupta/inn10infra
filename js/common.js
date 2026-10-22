/* ==========================================================
   Inn10 Infra – Shared helpers (used by every page)
   Header / footer / shortlist / map / EMI / enquiry form
   ========================================================== */
(function () {
  var D = window.INN10;
  var U = (window.I10 = {});
  var $ = (U.$ = function (s, c) { return (c || document).querySelector(s); });
  var $$ = (U.$$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); });
  var esc = (U.esc = function (s) {
    return String(s).replace(/[&<>"']/g, function (m) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m]; });
  });
  U.TYPE_LABEL = { residential: "Residential", commercial: "Commercial", office: "Office" };
  U.isHome = !!document.getElementById("home");

  /* ---------- Enrich project data ---------- */
  U.slug = function (n) { return n.toLowerCase().replace(/'/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""); };
  U.areaOf = function (loc) {
    if (/greater noida/i.test(loc)) return "Greater Noida";
    if (/expressway/i.test(loc)) return "Noida Expressway";
    if (/noida/i.test(loc)) return "Noida";
    return "Delhi";
  };
  D.projects.forEach(function (p, i) {
    p.id = i;
    p.slug = U.slug(p.name);
    p.area = U.areaOf(p.location);
    var g = D.geo && D.geo[p.name];
    if (g) { p.lat = g[0]; p.lng = g[1]; }
  });
  U.bySlug = function (s) {
    for (var i = 0; i < D.projects.length; i++) if (D.projects[i].slug === s) return D.projects[i];
    return null;
  };
  U.url = function (p) { return "project.html?p=" + encodeURIComponent(p.slug); };
  U.builderLogo = function (name) {
    for (var i = 0; i < D.developers.length; i++) if (D.developers[i].name === name) return D.developers[i].logo;
    return "";
  };
  U.areas = function () {
    return ["Noida", "Noida Expressway", "Greater Noida", "Delhi"].filter(function (a) {
      return D.projects.some(function (p) { return p.area === a; });
    });
  };
  U.builders = function () {
    var b = [];
    D.projects.forEach(function (p) { if (b.indexOf(p.builder) < 0) b.push(p.builder); });
    return b.sort(function (x, y) { return x === "Others" ? 1 : y === "Others" ? -1 : x.localeCompare(y); });
  };
  U.km = function (a, b) {
    var r = Math.PI / 180, dLat = (b.lat - a.lat) * r, dLng = (b.lng - a.lng) * r;
    var h = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(a.lat * r) * Math.cos(b.lat * r) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
    return 6371 * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
  };

  /* ---------- Indian currency format ---------- */
  U.inr = function (n) { return "₹ " + Math.round(n).toLocaleString("en-IN"); };
  U.inrShort = function (n) {
    if (n >= 1e7) return "₹ " + (n / 1e7).toFixed(2).replace(/\.?0+$/, "") + " Cr";
    if (n >= 1e5) return "₹ " + (n / 1e5).toFixed(2).replace(/\.?0+$/, "") + " Lakh";
    return U.inr(n);
  };

  /* ---------- Shared chrome: header ---------- */
  function link(h) { return U.isHome ? h : "index.html" + h; }
  var NAV = [["#projects", "Projects"], ["#map", "Map"], ["#services", "Services"], ["#emi", "EMI Calculator"], ["#about", "About"], ["#contact", "Contact"]];
  var header = document.createElement("header");
  header.id = "header";
  header.innerHTML =
    '<div class="container nav-wrap">' +
      '<a href="' + (U.isHome ? "#home" : "index.html") + '" class="logo"><img src="assets/images/logo-white.png" alt="Inn10 Infra" /></a>' +
      '<nav id="nav">' + NAV.map(function (n) { return '<a href="' + link(n[0]) + '">' + n[1] + "</a>"; }).join("") + "</nav>" +
      '<div class="nav-right">' +
        '<button class="sl-btn" id="slBtn" aria-label="My shortlist" title="My shortlist">♥<span id="slCount">0</span></button>' +
        '<a href="tel:+918700190507" class="btn btn-gold nav-cta">📞 8700 190 507</a>' +
        '<button id="menuToggle" aria-label="Menu"><span></span><span></span><span></span></button>' +
      "</div>" +
    "</div>";
  document.body.insertBefore(header, document.body.firstChild);
  /* ---------- Shared chrome: footer + floating buttons + drawer + toast ---------- */
  var chrome = document.createElement("div");
  chrome.innerHTML =
    '<footer id="siteFooter"><div class="container footer-grid">' +
      '<div><img src="assets/images/logo-white.png" alt="Inn10 Infra" class="footer-logo" />' +
        "<p>Inn10 Infra Projects LLP is a real estate consultancy with extensive resources and ability to offer personalized professional services in Indirapuram, Noida, Noida Extension &amp; Delhi NCR.</p></div>" +
      "<div><h4>Explore</h4>" + NAV.map(function (n) { return '<a href="' + link(n[0]) + '">' + n[1] + "</a>"; }).join("") + "</div>" +
      "<div><h4>Popular Locations</h4>" + U.areas().map(function (a) { return '<a href="' + link("#projects") + '" data-area-link="' + esc(a) + '">' + esc(a) + "</a>"; }).join("") + "</div>" +
      '<div><h4>Contact</h4><a href="tel:+918700190507">8700 190 507</a><a href="tel:+919990913542">9990 913 542</a>' +
        '<a href="mailto:info@inn10infra.com">info@inn10infra.com</a><a href="mailto:gargvishalassociates@gmail.com">gargvishalassociates@gmail.com</a>' +
        '<p class="addr">' + esc(D.company.address) + "</p></div>" +
    "</div>" +
    '<div class="copyright">&copy;' + new Date().getFullYear() + ". All Rights Reserved by Inn10 Infra Projects LLP. " +
      '<span class="disclaimer">Project images, brochures &amp; map locations are indicative. Please verify details with RERA &amp; the developer before booking.</span></div></footer>' +
    '<a class="float-btn wa" href="https://wa.me/' + D.company.whatsapp + '" target="_blank" rel="noopener" aria-label="WhatsApp">💬</a>' +
    '<a class="float-btn call" href="tel:+918700190507" aria-label="Call">📞</a>' +
    '<button class="float-btn top" id="toTop" aria-label="Back to top">↑</button>' +
    '<aside class="drawer" id="drawer" aria-label="My shortlist"><div class="drawer-head"><h3>My Shortlist ♥</h3><button id="drawerClose" aria-label="Close">&times;</button></div>' +
      '<div class="drawer-list" id="drawerList"></div>' +
      '<div class="drawer-foot"><button class="btn btn-gold" id="slEnquire">Enquire for all on WhatsApp</button><button class="btn-link" id="slClear">Clear shortlist</button></div></aside>' +
    '<div class="drawer-bg" id="drawerBg"></div>' +
    '<div class="toast" id="toast"></div>';
  while (chrome.firstChild) document.body.appendChild(chrome.firstChild);

  U.toast = function (msg) {
    var t = $("#toast");
    t.textContent = msg;
    t.classList.add("show");
    clearTimeout(U._tt);
    U._tt = setTimeout(function () { t.classList.remove("show"); }, 2200);
  };

  /* ---------- Header behaviour ---------- */
  var toTop = $("#toTop");
  function onScroll() {
    var y = window.scrollY;
    header.classList.toggle("scrolled", y > 60 || !U.isHome);
    toTop.classList.toggle("show", y > 600);
    if (!U.isHome) return;
    var pos = y + 140;
    $$("section[id]").forEach(function (sec) {
      var a = $('#nav a[href="#' + sec.id + '"]');
      if (a) a.classList.toggle("active", pos >= sec.offsetTop && pos < sec.offsetTop + sec.offsetHeight);
    });
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
  toTop.addEventListener("click", function () { window.scrollTo({ top: 0, behavior: "smooth" }); });
  $("#menuToggle").addEventListener("click", function () { document.body.classList.toggle("menu-open"); });
  $$("#nav a").forEach(function (a) { a.addEventListener("click", function () { document.body.classList.remove("menu-open"); }); });
  /* ---------- Shortlist (saved in localStorage) ---------- */
  var KEY = "inn10_shortlist";
  function readSL() { try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch (e) { return []; } }
  function writeSL(a) { try { localStorage.setItem(KEY, JSON.stringify(a)); } catch (e) { /* private mode */ } }
  var shortlist = readSL().filter(function (s) { return U.bySlug(s); });
  U.isShort = function (slug) { return shortlist.indexOf(slug) >= 0; };
  U.toggleShort = function (slug) {
    var k = shortlist.indexOf(slug);
    if (k >= 0) shortlist.splice(k, 1); else shortlist.push(slug);
    writeSL(shortlist);
    renderSL();
    U.toast(k >= 0 ? "Removed from shortlist" : "♥ " + U.bySlug(slug).name + " saved to shortlist");
  };
  function renderSL() {
    $("#slCount").textContent = shortlist.length;
    $("#slBtn").classList.toggle("has", shortlist.length > 0);
    $("#drawerList").innerHTML = shortlist.length
      ? shortlist.map(function (s) {
          var p = U.bySlug(s);
          return '<div class="dl-item"><img src="' + esc(p.image) + '" alt="" /><div><a href="' + U.url(p) + '"><b>' + esc(p.name) + "</b></a><span>" + esc(p.location) + '</span></div><button data-unshort="' + p.slug + '" aria-label="Remove">&times;</button></div>';
        }).join("")
      : '<p class="dl-empty">No saved projects yet.<br />Tap ♥ on any project to save it here.</p>';
    $$("[data-short]").forEach(function (b) { b.classList.toggle("on", U.isShort(b.dataset.short)); });
    $("#slEnquire").disabled = !shortlist.length;
  }
  U.renderSL = renderSL;
  function openDrawer(o) { document.body.classList.toggle("drawer-open", o); }
  $("#slBtn").addEventListener("click", function () { openDrawer(true); });
  $("#drawerClose").addEventListener("click", function () { openDrawer(false); });
  $("#drawerBg").addEventListener("click", function () { openDrawer(false); });
  $("#slClear").addEventListener("click", function () { shortlist = []; writeSL(shortlist); renderSL(); });
  $("#slEnquire").addEventListener("click", function () {
    var txt = "Hello Inn10 Infra, I am interested in these projects:\n" +
      shortlist.map(function (s, k) { var p = U.bySlug(s); return (k + 1) + ". " + p.name + " - " + p.location; }).join("\n") +
      "\nPlease share details & arrange a site visit.";
    window.open("https://wa.me/" + D.company.whatsapp + "?text=" + encodeURIComponent(txt), "_blank");
  });
  /* capture phase so ♥ inside links/cards never triggers navigation */
  document.addEventListener("click", function (e) {
    var s = e.target.closest("[data-short]");
    if (s) { e.preventDefault(); e.stopPropagation(); U.toggleShort(s.dataset.short); return; }
    var u = e.target.closest("[data-unshort]");
    if (u) { e.stopPropagation(); U.toggleShort(u.dataset.unshort); }
  }, true);
  renderSL();

  /* ---------- 3D tilt ---------- */
  var canHover = window.matchMedia("(hover: hover)").matches;
  U.bindTilt = function (els) {
    if (!canHover) return;
    els.forEach(function (el) {
      if (!el || el._tilt) return;
      el._tilt = true;
      el.addEventListener("mousemove", function (e) {
        var r = el.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
        el.style.transform = "perspective(900px) rotateY(" + x * 10 + "deg) rotateX(" + -y * 10 + "deg) translateZ(8px)";
        el.style.setProperty("--gx", (x + 0.5) * 100 + "%");
        el.style.setProperty("--gy", (y + 0.5) * 100 + "%");
      });
      el.addEventListener("mouseleave", function () { el.style.transform = ""; });
    });
  };

  /* ---------- Reveal on scroll + counters ---------- */
  function countUp(el) {
    var target = +el.dataset.target, n = 0;
    var t = setInterval(function () { n++; el.textContent = n; if (n >= target) clearInterval(t); }, 1200 / target);
  }
  var io = "IntersectionObserver" in window ? new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (!en.isIntersecting) return;
      en.target.classList.add("in");
      if (en.target.classList.contains("counter")) countUp(en.target);
      io.unobserve(en.target);
    });
  }, { threshold: 0.12 }) : null;
  U.reveal = function (root) {
    $$(".reveal:not(.in), .counter:not(.in)", root).forEach(function (el) {
      if (io) io.observe(el);
      else { el.classList.add("in"); if (el.classList.contains("counter")) el.textContent = el.dataset.target; }
    });
  };

  /* ---------- Preloader ---------- */
  /* Hide on full load, but never block the page longer than 2.5s on slow
     networks (map tiles, fonts and the 3D library can take a while). */
  function hidePreloader() {
    var pl = $("#preloader");
    if (!pl || pl.classList.contains("hide")) return;
    pl.classList.add("hide");
    setTimeout(function () { if (pl.parentNode) pl.parentNode.removeChild(pl); }, 900); /* after fade-out */
  }
  window.addEventListener("load", function () { setTimeout(hidePreloader, 500); });
  setTimeout(hidePreloader, 2500);
  /* ---------- Project card (listing style) ---------- */
  U.card = function (p) {
    var tags = p.types.map(function (t) { return '<span class="tag tag-' + t + '">' + U.TYPE_LABEL[t] + "</span>"; }).join("");
    var bro = p.brochure
      ? '<a class="btn btn-gold btn-sm" href="' + esc(p.brochure) + '" target="_blank" rel="noopener">⬇ Brochure</a>'
      : '<a class="btn btn-gold btn-sm" href="' + U.url(p) + '#enquire">Request Brochure</a>';
    return (
      '<article class="p-card tilt">' +
        '<a class="p-img" href="' + U.url(p) + '"><img src="' + esc(p.image) + '" alt="' + esc(p.name) + '" loading="lazy" />' +
          '<span class="builder-badge">' + esc(p.builder === "Others" ? "Premium" : p.builder) + "</span>" +
          '<div class="tags">' + tags + "</div>" +
          '<span class="view-hint">View Details →</span>' +
        "</a>" +
        '<button class="heart' + (U.isShort(p.slug) ? " on" : "") + '" data-short="' + p.slug + '" aria-label="Save to shortlist">♥</button>' +
        '<div class="p-body">' +
          '<a href="' + U.url(p) + '"><h3>' + esc(p.name) + "</h3></a>" +
          '<p class="cfg">' + esc(p.config) + "</p>" +
          '<p class="loc">📍 ' + esc(p.location) + "</p>" +
          '<div class="p-actions">' + bro + '<a class="btn btn-outline btn-sm" href="' + U.url(p) + '">View Project</a></div>' +
          '<a class="call-line" href="tel:+918700190507">📞 Free Site Visit: <b>8700 190 507</b></a>' +
        "</div>" +
      "</article>"
    );
  };

  /* ---------- EMI calculator (pure canvas donut, no library) ---------- */
  U.initEMI = function (root) {
    if (!root) return;
    var amt = $("[data-emi=amt]", root), rate = $("[data-emi=rate]", root), yrs = $("[data-emi=yrs]", root);
    var cvs = $("canvas", root);
    function draw(principal, interest) {
      var ctx = cvs.getContext("2d"), s = cvs.width, c = s / 2, r = s / 2 - 18;
      ctx.clearRect(0, 0, s, s);
      var tot = principal + interest, a = (principal / tot) * Math.PI * 2;
      ctx.lineWidth = 26; ctx.lineCap = "butt";
      ctx.beginPath(); ctx.strokeStyle = "#d4af37"; ctx.arc(c, c, r, -Math.PI / 2, -Math.PI / 2 + a); ctx.stroke();
      ctx.beginPath(); ctx.strokeStyle = "#3557c4"; ctx.arc(c, c, r, -Math.PI / 2 + a, Math.PI * 1.5); ctx.stroke();
    }
    function calc() {
      var P = +amt.value, R = +rate.value / 12 / 100, N = +yrs.value * 12;
      var emi = R ? (P * R * Math.pow(1 + R, N)) / (Math.pow(1 + R, N) - 1) : P / N;
      var total = emi * N, interest = total - P;
      $("[data-out=amt]", root).textContent = U.inrShort(P);
      $("[data-out=rate]", root).textContent = (+rate.value).toFixed(2) + " %";
      $("[data-out=yrs]", root).textContent = yrs.value + " Years";
      $("[data-out=emi]", root).textContent = U.inr(emi);
      $("[data-out=principal]", root).textContent = U.inrShort(P);
      $("[data-out=interest]", root).textContent = U.inrShort(interest);
      $("[data-out=total]", root).textContent = U.inrShort(total);
      [amt, rate, yrs].forEach(function (el) {
        el.style.setProperty("--pct", ((el.value - el.min) / (el.max - el.min)) * 100 + "%");
      });
      draw(P, interest);
    }
    [amt, rate, yrs].forEach(function (el) { el.addEventListener("input", calc); });
    calc();
  };
  U.emiHTML =
    '<div class="emi-box glass" id="emiBox">' +
      '<div class="emi-inputs">' +
        '<label>Loan Amount <b data-out="amt"></b><input type="range" data-emi="amt" min="500000" max="100000000" step="100000" value="10000000" /></label>' +
        '<label>Interest Rate (p.a.) <b data-out="rate"></b><input type="range" data-emi="rate" min="6" max="15" step="0.05" value="8.5" /></label>' +
        '<label>Loan Tenure <b data-out="yrs"></b><input type="range" data-emi="yrs" min="1" max="30" step="1" value="20" /></label>' +
        '<p class="emi-note">Indicative calculation only. Actual EMI depends on your bank\'s terms.</p>' +
      "</div>" +
      '<div class="emi-result">' +
        '<div class="emi-chart"><canvas width="220" height="220"></canvas><div class="emi-center"><span>Monthly EMI</span><strong data-out="emi"></strong></div></div>' +
        '<ul class="emi-legend"><li><i class="lg-gold"></i>Principal <b data-out="principal"></b></li><li><i class="lg-blue"></i>Interest <b data-out="interest"></b></li><li><i></i>Total Payable <b data-out="total"></b></li></ul>' +
      "</div>" +
    "</div>";
  /* ---------- Interactive map (Leaflet + Esri dark-gray tiles, no API key) ---------- */
  U.pinIcon = function (kind, label) {
    return L.divIcon({
      className: "pin-wrap",
      html: '<div class="pin pin-' + kind + '"><span></span></div>' + (label ? '<div class="pin-label">' + esc(label) + "</div>" : ""),
      iconSize: [30, 42],
      iconAnchor: [15, 40],
      popupAnchor: [0, -36]
    });
  };
  U.popupHTML = function (p) {
    return '<div class="map-pop"><img src="' + esc(p.image) + '" alt="" /><b>' + esc(p.name) + "</b><span>" + esc(p.config) + "</span><em>📍 " + esc(p.location) + '</em><a href="' + U.url(p) + '">View Project →</a></div>';
  };
  U.makeMap = function (el, opts) {
    opts = opts || {};
    if (typeof L === "undefined") {
      el.classList.add("map-fallback");
      el.innerHTML = '<p>Map could not load (offline). Projects:</p><ul>' + D.projects.map(function (p) {
        return '<li><a href="' + U.url(p) + '">' + esc(p.name) + "</a> – " + esc(p.location) + "</li>";
      }).join("") + "</ul>";
      return null;
    }
    var map = L.map(el, { scrollWheelZoom: false, zoomControl: true, attributionControl: true });
    /* CARTO basemaps now require an API key, so Esri's keyless dark canvas is used.
       Base layer + a separate labels layer on top. */
    var ESRI = "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/";
    L.tileLayer(ESRI + "World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}", {
      maxZoom: 16,
      attribution: 'Tiles &copy; <a href="https://www.esri.com/">Esri</a> — Esri, HERE, Garmin, &copy; OpenStreetMap contributors'
    }).addTo(map);
    L.tileLayer(ESRI + "World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}", { maxZoom: 16, pane: "overlayPane" }).addTo(map);
    /* enable wheel-zoom only after user clicks map – avoids hijacking page scroll */
    map.on("click", function () { map.scrollWheelZoom.enable(); });
    map.on("mouseout", function () { map.scrollWheelZoom.disable(); });
    var o = D.office;
    L.marker([o.lat, o.lng], { icon: U.pinIcon("office", opts.officeLabel ? "Inn10 Office" : ""), zIndexOffset: 1000 })
      .addTo(map).bindPopup('<div class="map-pop"><b>' + esc(o.name) + "</b><em>" + esc(o.address) + '</em><a href="https://www.google.com/maps/dir/?api=1&destination=' + o.lat + "," + o.lng + '" target="_blank" rel="noopener">Get Directions →</a></div>');
    return map;
  };

  /* ---------- Enquiry form (WhatsApp / Email – works without a server) ---------- */
  U.bindForm = function (form, getProject) {
    if (!form) return;
    var via = "whatsapp";
    $$("button[type=submit]", form).forEach(function (b) { b.addEventListener("click", function () { via = b.dataset.via; }); });
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var name = $("[name=name]", form).value.trim();
      var phone = $("[name=phone]", form).value.trim();
      var msg = $(".form-msg", form);
      if (!name || !/^[0-9+\s-]{10,15}$/.test(phone)) {
        msg.textContent = "Please enter your name and a valid mobile number.";
        msg.className = "form-msg err";
        return;
      }
      var proj = getProject ? getProject() : "";
      var extra = $$("[data-extra]", form).map(function (el) { return el.value ? el.dataset.extra + ": " + el.value : ""; }).filter(Boolean);
      var req = $("[name=msg]", form) ? $("[name=msg]", form).value.trim() : "";
      var text = "Hello Inn10 Infra,\nName: " + name + "\nMobile: " + phone +
        (proj ? "\nProject: " + proj : "") + (extra.length ? "\n" + extra.join("\n") : "") + (req ? "\nRequirement: " + req : "");
      if (via === "email") {
        window.location.href = "mailto:" + D.company.emails[0] + "?subject=" + encodeURIComponent("Enquiry - " + (proj || "General")) + "&body=" + encodeURIComponent(text);
      } else {
        window.open("https://wa.me/" + D.company.whatsapp + "?text=" + encodeURIComponent(text), "_blank");
      }
      msg.textContent = "Thank you " + name + "! Our advisor will call you shortly.";
      msg.className = "form-msg ok";
      form.reset();
    });
  };
})();
