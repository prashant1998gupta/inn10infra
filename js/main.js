/* ==========================================================
   Inn10 Infra – Home page logic
   (shared helpers live in js/common.js → window.I10)
   ========================================================== */
(function () {
  var D = window.INN10, U = window.I10;
  var $ = U.$, $$ = U.$$, esc = U.esc;
  var BUILDERS = U.builders(), AREAS = U.areas();

  function fillSelect(sel, list, labelFn) {
    list.forEach(function (v) { sel.insertAdjacentHTML("beforeend", '<option value="' + esc(v) + '">' + esc(labelFn ? labelFn(v) : v) + "</option>"); });
  }
  function builderLabel(b) {
    var n = D.projects.filter(function (p) { return p.builder === b; }).length;
    return (b === "Others" ? "Other Builders" : b) + " (" + n + ")";
  }
  function areaLabel(a) {
    var n = D.projects.filter(function (p) { return p.area === a; }).length;
    return a + " (" + n + ")";
  }

  /* ---------- Filter state + matching ---------- */
  var state = { type: "all", area: "all", builder: "all", q: "", sort: "default" };
  function matches(p, s) {
    if (s.type !== "all" && p.types.indexOf(s.type) < 0) return false;
    if (s.area !== "all" && p.area !== s.area) return false;
    if (s.builder !== "all" && p.builder !== s.builder) return false;
    var q = s.q.toLowerCase();
    if (q && (p.name + " " + p.location + " " + p.config + " " + p.builder + " " + p.area).toLowerCase().indexOf(q) < 0) return false;
    return true;
  }

  /* ---------- Hero search bar ---------- */
  var sb = { type: "all" };
  fillSelect($("#sbArea"), AREAS, areaLabel);
  fillSelect($("#sbBuilder"), BUILDERS, function (b) { return b === "Others" ? "Other Builders" : b; });
  function sbState() { return { type: sb.type, area: $("#sbArea").value, builder: $("#sbBuilder").value, q: $("#sbQ").value.trim(), sort: "default" }; }
  function sbCount() {
    var s = sbState();
    var n = D.projects.filter(function (p) { return matches(p, s); }).length;
    $("#sbCount").textContent = "(" + n + ")";
  }
  $$("#sbTabs button").forEach(function (b) {
    b.addEventListener("click", function () {
      $$("#sbTabs button").forEach(function (x) { x.classList.remove("on"); });
      b.classList.add("on");
      sb.type = b.dataset.t;
      sbCount();
    });
  });
  ["#sbArea", "#sbBuilder"].forEach(function (id) { $(id).addEventListener("change", sbCount); });
  $("#sbQ").addEventListener("input", sbCount);
  $("#heroSearch").addEventListener("submit", function (e) {
    e.preventDefault();
    applyState(sbState());
    $("#projects").scrollIntoView({ behavior: "smooth" });
  });
  sbCount();

  /* ---------- Projects grid ---------- */
  var grid = $("#projectGrid");
  fillSelect($("#areaFilter"), AREAS, areaLabel);
  fillSelect($("#builderFilter"), BUILDERS, builderLabel);

  function sorted(list) {
    if (state.sort === "az") return list.slice().sort(function (a, b) { return a.name.localeCompare(b.name); });
    if (state.sort === "near") return list.slice().sort(function (a, b) { return U.km(D.office, a) - U.km(D.office, b); });
    return list;
  }
  function renderGrid() {
    var list = sorted(D.projects.filter(function (p) { return matches(p, state); }));
    grid.innerHTML = list.length
      ? list.map(function (p) {
          var html = U.card(p);
          if (state.sort === "near" && p.lat) html = html.replace('<p class="cfg">', '<p class="dist">' + U.km(D.office, p).toFixed(1) + ' km from Inn10 office</p><p class="cfg">');
          return html;
        }).join("")
      : '<p class="empty">No projects match your filters. <a href="#contact">Tell us your requirement</a> and we will find one for you.</p>';
    $("#resultCount").innerHTML = "<b>" + list.length + "</b> of " + D.projects.length + " projects";
    $("#clearFilters").hidden = state.type === "all" && state.area === "all" && state.builder === "all" && !state.q;
    U.bindTilt($$(".tilt", grid));
    $$(".p-card", grid).forEach(function (c, k) { c.style.animationDelay = Math.min(k * 0.05, 0.4) + "s"; });
    if (window.I10Map) window.I10Map.filter(list);
  }
  function syncControls() {
    $$("#typeFilters .chip").forEach(function (b) { b.classList.toggle("active", b.dataset.type === state.type); });
    $("#areaFilter").value = state.area;
    $("#builderFilter").value = state.builder;
    $("#searchBox").value = state.q;
    $("#sortBy").value = state.sort;
  }
  function applyState(s) {
    for (var k in s) state[k] = s[k];
    syncControls();
    renderGrid();
  }
  U.applyState = applyState;

  $$("#typeFilters .chip").forEach(function (btn) {
    btn.addEventListener("click", function () { applyState({ type: btn.dataset.type }); });
  });
  $("#areaFilter").addEventListener("change", function () { applyState({ area: this.value }); });
  $("#builderFilter").addEventListener("change", function () { applyState({ builder: this.value }); });
  $("#sortBy").addEventListener("change", function () { applyState({ sort: this.value }); });
  $("#searchBox").addEventListener("input", function () { state.q = this.value.trim(); renderGrid(); });
  $("#clearFilters").addEventListener("click", function () { applyState({ type: "all", area: "all", builder: "all", q: "" }); });

  function goFilter(s) {
    applyState(Object.assign({ type: "all", area: "all", builder: "all", q: "" }, s));
    $("#projects").scrollIntoView({ behavior: "smooth" });
  }
  /* footer "Popular Locations" links */
  document.addEventListener("click", function (e) {
    var a = e.target.closest("[data-area-link]");
    if (a) { e.preventDefault(); goFilter({ area: a.dataset.areaLink }); }
  });
  /* ---------- Explore by location tiles ---------- */
  var AREA_INFO = {
    "Noida": "Sector 43, 62, 73, 94 & 129",
    "Noida Expressway": "Sector 128, 131, 144 & 146",
    "Greater Noida": "Pari Chowk",
    "Delhi": "Chandni Chowk, Karol Bagh, Sadar Bazaar, Mayur Vihar & more"
  };
  $("#locGrid").innerHTML = AREAS.map(function (a) {
    var list = D.projects.filter(function (p) { return p.area === a; });
    var res = list.filter(function (p) { return p.types.indexOf("residential") >= 0; }).length;
    var com = list.length - res;
    return '<button class="loc-card tilt reveal" data-area="' + esc(a) + '">' +
      '<img src="' + esc(list[0].image) + '" alt="' + esc(a) + '" loading="lazy" />' +
      '<div class="loc-body"><h3>' + esc(a) + "</h3><p>" + esc(AREA_INFO[a] || "") + "</p>" +
      '<div class="loc-meta"><span><b>' + list.length + "</b> Projects</span>" +
      (res ? "<span>" + res + " Residential</span>" : "") + (com ? "<span>" + com + " Commercial</span>" : "") + "</div>" +
      '<span class="loc-go">Explore' + U.icon("arrow") + "</span></div></button>";
  }).join("");
  $("#locGrid").addEventListener("click", function (e) {
    var c = e.target.closest("[data-area]");
    if (c) goFilter({ area: c.dataset.area });
  });
  U.bindTilt($$("#locGrid .tilt"));

  /* ---------- Map section ---------- */
  (function initMap() {
    var el = $("#mapCanvas"), listEl = $("#mapList");
    var map = U.makeMap(el, { officeLabel: true });
    if (!map) { listEl.style.display = "none"; return; }
    var markers = {};
    D.projects.forEach(function (p) {
      if (!p.lat) return;
      var kind = p.types.indexOf("residential") >= 0 ? "res" : p.types.indexOf("office") >= 0 ? "off" : "com";
      markers[p.slug] = L.marker([p.lat, p.lng], { icon: U.pinIcon(kind) }).addTo(map).bindPopup(U.popupHTML(p), { maxWidth: 240 });
    });
    function fit(list) {
      var pts = list.filter(function (p) { return p.lat; }).map(function (p) { return [p.lat, p.lng]; });
      pts.push([D.office.lat, D.office.lng]);
      map.fitBounds(pts, { padding: [40, 40], maxZoom: 13 });
    }
    function renderList(list) {
      listEl.innerHTML = '<div class="ml-head"><b>' + list.length + '</b> projects on map<div class="ml-legend"><i class="pin-res"></i>Residential<i class="pin-com"></i>Retail<i class="pin-off"></i>Office<i class="pin-office"></i>Inn10</div></div>' +
        list.map(function (p) {
          return '<button class="ml-item" data-pin="' + p.slug + '"><img src="' + esc(p.image) + '" alt="" loading="lazy" /><span><b>' + esc(p.name) + "</b><em>" + esc(p.location) + "</em></span></button>";
        }).join("");
    }
    listEl.addEventListener("click", function (e) {
      var b = e.target.closest("[data-pin]");
      if (!b) return;
      var m = markers[b.dataset.pin];
      $$(".ml-item", listEl).forEach(function (x) { x.classList.toggle("on", x === b); });
      map.flyTo(m.getLatLng(), 14, { duration: 0.8 });
      setTimeout(function () { m.openPopup(); }, 850);
      if (window.innerWidth < 900) el.scrollIntoView({ behavior: "smooth", block: "center" });
    });
    window.I10Map = {
      filter: function (list) {
        var keep = {};
        list.forEach(function (p) { keep[p.slug] = 1; });
        Object.keys(markers).forEach(function (s) { if (keep[s]) markers[s].addTo(map); else map.removeLayer(markers[s]); });
        renderList(list);
        fit(list.length ? list : D.projects);
      }
    };
    /* Leaflet needs a size recalculation when the section first becomes visible */
    if ("IntersectionObserver" in window) {
      var once = new IntersectionObserver(function (en) {
        if (!en[0].isIntersecting) return;
        map.invalidateSize();
        fit(D.projects.filter(function (p) { return matches(p, state); }));
        once.disconnect();
      });
      once.observe(el);
    }
  })();
  /* ---------- 3D rotating featured carousel ---------- */
  var featured = D.projects.filter(function (p) { return p.featured; });
  var ring = $("#carouselRing"), N = featured.length, step = 360 / N;
  function radius() { return Math.round((Math.min(window.innerWidth * 0.62, 320) / 2) / Math.tan(Math.PI / N)) + 30; }
  ring.innerHTML = featured.map(function (p) {
    return '<a class="c-item" href="' + U.url(p) + '" draggable="false"><img src="' + esc(p.image) + '" alt="' + esc(p.name) + '" draggable="false" />' +
      '<button class="heart" data-short="' + p.slug + '" aria-label="Save ' + esc(p.name) + '">' + U.icon("heart") + "</button>" +
      '<div class="c-cap"><small>' + esc(p.builder === "Others" ? "Premium" : p.builder) + "</small><b>" + esc(p.name) + "</b><span>" + esc(p.location) + "</span></div></a>";
  }).join("");
  var items = $$(".c-item", ring), angle = 0, auto = true;
  function applyRing() { ring.style.transform = "translateZ(" + -radius() + "px) rotateY(" + angle + "deg)"; }
  function placeItems() {
    var R = radius();
    items.forEach(function (it, k) { it.style.transform = "rotateY(" + k * step + "deg) translateZ(" + R + "px)"; });
    applyRing();
  }
  function spin(d) {
    angle += d;
    applyRing();
    var idx = ((Math.round(-angle / step) % N) + N) % N;
    $("#carCount").textContent = ("0" + (idx + 1)).slice(-2) + " / " + ("0" + N).slice(-2);
  }
  placeItems();
  window.addEventListener("resize", placeItems);
  $("#carPrev").addEventListener("click", function () { auto = false; spin(step); });
  $("#carNext").addEventListener("click", function () { auto = false; spin(-step); });
  setInterval(function () { if (auto && !document.hidden) spin(-step); }, 3500);
  var stage = $(".carousel-stage"), dragX = null, moved = false;
  function dStart(x) { dragX = x; moved = false; ring.style.transition = "none"; }
  function dMove(x) { if (dragX === null) return; var dx = x - dragX; if (Math.abs(dx) > 2) { moved = true; auto = false; } dragX = x; spin(dx * 0.35); }
  function dEnd() { if (dragX === null) return; dragX = null; ring.style.transition = ""; angle = Math.round(angle / step) * step; applyRing(); }
  stage.addEventListener("mousedown", function (e) { if (!e.target.closest(".heart")) e.preventDefault(); dStart(e.clientX); });
  window.addEventListener("mousemove", function (e) { dMove(e.clientX); });
  window.addEventListener("mouseup", dEnd);
  stage.addEventListener("touchstart", function (e) { dStart(e.touches[0].clientX); }, { passive: true });
  stage.addEventListener("touchmove", function (e) { dMove(e.touches[0].clientX); }, { passive: true });
  stage.addEventListener("touchend", dEnd);
  /* a drag must not count as a click on the slide link */
  ring.addEventListener("click", function (e) { if (moved) { e.preventDefault(); moved = false; } });

  /* ---------- Builders marquee ---------- */
  var logos = D.developers.map(function (d) {
    return '<button class="logo-card" data-builder="' + esc(d.name) + '" title="View ' + esc(d.name) + ' projects"><img src="' + esc(d.logo) + '" alt="' + esc(d.name) + '" loading="lazy" /></button>';
  }).join("");
  $("#marqueeTrack").innerHTML = logos + logos;
  $("#marqueeTrack").addEventListener("click", function (e) {
    var b = e.target.closest("[data-builder]");
    if (!b) return;
    var name = b.dataset.builder;
    if (BUILDERS.indexOf(name) >= 0) goFilter({ builder: name });
    else { goFilter({}); U.toast(name + " inventory on request — call 8700 190 507"); }
  });

  /* ---------- Services: journey steps + fallback cards ---------- */
  var SERVICE_ICONS = ["search", "shield", "chart", "layers"];
  $("#journeySteps").innerHTML = D.services.map(function (s, k) {
    return '<div class="j-step" data-step="' + k + '"><span class="j-num">0' + (k + 1) + '</span><div><h3>' + esc(s.title) + "</h3><p>" + esc(s.text) + "</p></div></div>";
  }).join("");
  $("#serviceGrid").innerHTML = D.services.map(function (s, k) {
    return '<div class="s-card reveal"><div class="s-top"><span class="s-icon">' + U.icon(SERVICE_ICONS[k] || "check") + '</span><span class="s-num">0' + (k + 1) + "</span></div><h3>" + esc(s.title) + "</h3><p>" + esc(s.text) + "</p></div>";
  }).join("");
  U.bindTilt($$("#serviceGrid .tilt"));

  /* ---------- EMI ---------- */
  $("#emiMount").innerHTML = U.emiHTML;
  U.initEMI($("#emiBox"));

  /* ---------- About ---------- */
  U.bindTilt([$("#aboutVisual")]);
  $("#readMore").addEventListener("click", function () {
    var open = $("#moreText").classList.toggle("open");
    this.textContent = open ? "Read Less" : "Read More";
  });

  /* ---------- Testimonials ---------- */
  var tTrack = $("#testiTrack"), tDots = $("#testiDots"), tIdx = 0;
  tTrack.innerHTML = D.testimonials.map(function (t) {
    return '<blockquote class="testi"><span class="quote" aria-hidden="true">“</span><p>' + esc(t) + '</p><footer><span class="stars" aria-label="5 out of 5">★★★★★</span><span class="who">Happy Home Buyer · Delhi NCR</span></footer></blockquote>';
  }).join("");
  tDots.innerHTML = D.testimonials.map(function (_, k) { return '<button data-k="' + k + '" aria-label="Testimonial ' + (k + 1) + '"></button>'; }).join("");
  function showT(k) {
    tIdx = k;
    tTrack.style.transform = "translateX(" + -100 * k + "%)";
    $$("button", tDots).forEach(function (b, j) { b.classList.toggle("on", j === k); });
  }
  tDots.addEventListener("click", function (e) { if (e.target.dataset.k) showT(+e.target.dataset.k); });
  showT(0);
  setInterval(function () { if (!document.hidden) showT((tIdx + 1) % D.testimonials.length); }, 6000);

  /* ---------- Contact form ---------- */
  var fProject = $("#fProject");
  D.projects.forEach(function (p) { fProject.insertAdjacentHTML("beforeend", "<option>" + esc(p.name) + "</option>"); });
  U.bindForm($("#enquiryForm"), function () { return fProject.value; });

  /* ---------- Deep links: index.html?area=Noida&type=residential&builder=Godrej&q=sector ---------- */
  var qs = new URLSearchParams(location.search);
  var init = {};
  ["type", "area", "builder", "q"].forEach(function (k) { if (qs.get(k)) init[k] = qs.get(k); });
  if (Object.keys(init).length) applyState(init); else renderGrid();

  U.reveal(document);
})();
