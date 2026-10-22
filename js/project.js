/* ==========================================================
   Inn10 Infra – Project detail page  (project.html?p=<slug>)
   ========================================================== */
(function () {
  var D = window.INN10, U = window.I10;
  var $ = U.$, $$ = U.$$, esc = U.esc;

  var slug = new URLSearchParams(location.search).get("p");
  var p = slug && U.bySlug(slug);
  if (!p) {
    $("#pd").innerHTML = '<section class="section pd-404"><div class="container"><h1>Project not found</h1><p>The project you are looking for is not listed. Browse all our projects instead.</p><a class="btn btn-gold" href="index.html#projects">View All Projects</a></div></section>';
    return;
  }
  var builderName = p.builder === "Others" ? "Premium Project" : p.builder;
  var typeText = p.types.map(function (t) { return U.TYPE_LABEL[t]; }).join(" & ");

  /* ---------- SEO / title ---------- */
  document.title = p.name + " – " + p.location + " | Inn10 Infra";
  var md = document.querySelector('meta[name="description"]');
  md.setAttribute("content", p.name + " by " + builderName + ": " + p.config + " at " + p.location + ". Brochure, location map, EMI calculator & free site visit with Inn10 Infra – 8700 190 507.");
  var ld = document.createElement("script");
  ld.type = "application/ld+json";
  ld.textContent = JSON.stringify({
    "@context": "https://schema.org", "@type": "Residence", name: p.name,
    address: { "@type": "PostalAddress", streetAddress: p.location, addressRegion: "Delhi NCR", addressCountry: "IN" },
    image: location.href.replace(/project\.html.*$/, "") + p.image
  });
  document.head.appendChild(ld);

  /* ---------- Hero ---------- */
  $("#pdBg").style.backgroundImage = "url('" + p.image + "')";
  $("#pdImg").src = p.image;
  $("#pdImg").alt = p.name;
  $("#crumbs").innerHTML = '<a href="index.html">Home</a><span>/</span><a href="index.html?area=' + encodeURIComponent(p.area) + '#projects">' + esc(p.area) + "</a><span>/</span><b>" + esc(p.name) + "</b>";
  var logo = U.builderLogo(p.builder);
  $("#pdBuilder").innerHTML = (logo ? '<img src="' + esc(logo) + '" alt="' + esc(p.builder) + '" />' : "") + "<span>" + esc(builderName) + "</span>";
  $("#pdName").textContent = p.name;
  $("#pdName2").textContent = p.name;
  $("#pdLoc").innerHTML = U.icon("pin") + esc(p.location);
  $("#pdTags").innerHTML = p.types.map(function (t) { return '<span class="tag">' + U.TYPE_LABEL[t] + "</span>"; }).join("") + '<span class="tag tag-plain">' + esc(p.config) + "</span>";

  var bro = $("#pdBrochure");
  if (p.brochure) { bro.href = p.brochure; }
  else { bro.href = "#enquire"; bro.removeAttribute("target"); bro.querySelector("span").textContent = "Request Brochure"; }

  /* 3D tilt of hero image following the mouse */
  var vis = $("#pdVisual");
  if (window.matchMedia("(hover: hover)").matches) {
    document.querySelector(".pd-hero").addEventListener("mousemove", function (e) {
      var x = e.clientX / window.innerWidth - 0.5, y = e.clientY / window.innerHeight - 0.5;
      vis.style.transform = "perspective(1200px) rotateY(" + (-18 + x * 16) + "deg) rotateX(" + (6 - y * 10) + "deg)";
    });
  }

  /* Save / share */
  var sBtn = $("#pdShort");
  sBtn.dataset.short = p.slug;
  $("#pdShare").addEventListener("click", function () {
    var data = { title: p.name + " | Inn10 Infra", text: p.name + " – " + p.config + ", " + p.location, url: location.href };
    if (navigator.share) { navigator.share(data).catch(function () {}); return; }
    if (navigator.clipboard) navigator.clipboard.writeText(location.href).then(function () { U.toast("Link copied — share it on WhatsApp"); });
    else window.open("https://wa.me/?text=" + encodeURIComponent(data.text + " " + data.url), "_blank");
  });
  U.renderSL();

  /* ---------- Overview facts ---------- */
  var dist = p.lat ? U.km(D.office, p) : null;
  var facts = [
    ["building", "Developer", builderName],
    ["home", "Property Type", typeText],
    ["layers", "Configuration", p.config],
    ["pin", "Location", p.location],
    ["map", "Micro-market", p.area],
    ["file", "Brochure", p.brochure ? "Available" : "On request"]
  ];
  $("#pdFacts").innerHTML = facts.map(function (f) {
    return '<div class="fact reveal"><span class="f-ico">' + U.icon(f[0]) + "</span><div><small>" + f[1] + "</small><b>" + esc(f[2]) + "</b></div></div>";
  }).join("");
  $("#pdDesc").textContent = p.name + (p.builder !== "Others" ? " by " + p.builder : "") + " offers " + p.config.toLowerCase() +
    " at " + p.location + ". Inn10 Infra provides customised need-based research, onsite visits, inventory shortlisting, negotiation, legal advisory and registration assistance for this project. Call 8700 190 507 for the latest price list and available inventory.";
  /* ---------- Brochure viewer (PDF embedded in page) ---------- */
  var box = $("#pdBrochureBox");
  if (p.brochure) {
    box.innerHTML =
      '<div class="pdf-wrap"><div class="pdf-bar"><span class="pdf-name">' + U.icon("file") + esc(p.name) + " — Brochure</span><div class=\"pdf-actions\">" +
        '<a class="btn btn-sm btn-outline-light" href="' + esc(p.brochure) + '" target="_blank" rel="noopener">Full Screen</a>' +
        '<a class="btn btn-sm btn-gold" href="' + esc(p.brochure) + '" download>' + U.icon("download") + "Download</a></div></div>" +
      '<button class="pdf-load" id="pdfLoad"><img src="' + esc(p.image) + '" alt="" /><span class="pdf-play">' + U.icon("play") + "View brochure here</span></button></div>";
    /* PDFs are large – only load the viewer when the user asks */
    $("#pdfLoad").addEventListener("click", function () {
      var f = document.createElement("iframe");
      f.src = p.brochure + "#view=FitH";
      f.title = p.name + " brochure";
      f.className = "pdf-frame";
      this.replaceWith(f);
    });
  } else {
    box.innerHTML = '<div class="no-brochure"><p>The e-brochure for <b>' + esc(p.name) + "</b> is shared on request with the latest price list.</p>" +
      '<a class="btn btn-gold" href="https://wa.me/' + D.company.whatsapp + "?text=" + encodeURIComponent("Hello Inn10 Infra, please share the brochure & price list of " + p.name + ".") + '" target="_blank" rel="noopener">' + U.icon("whatsapp") + "Get Brochure on WhatsApp</a></div>";
  }

  /* ---------- Location map ---------- */
  var mapEl = $("#pdMap");
  if (p.lat) {
    $("#pdDist").innerHTML = "Approx. <b>" + dist.toFixed(1) + " km</b> from the Inn10 Infra office, Indirapuram (straight-line). Pin location is indicative.";
    var map = U.makeMap(mapEl, { officeLabel: true });
    if (map) {
      var m = L.marker([p.lat, p.lng], { icon: U.pinIcon("hero", p.name), zIndexOffset: 2000 }).addTo(map);
      m.bindPopup(U.popupHTML(p).replace(/<a href="project\.html[^"]*">View Project<\/a>/, ""));
      L.polyline([[D.office.lat, D.office.lng], [p.lat, p.lng]], { color: "#d4af37", weight: 2, dashArray: "6 8", opacity: 0.8 }).addTo(map);
      /* nearby Inn10 projects */
      D.projects.forEach(function (o) {
        if (o === p || !o.lat || U.km(p, o) > 8) return;
        L.marker([o.lat, o.lng], { icon: U.pinIcon("near"), opacity: 0.85 }).addTo(map).bindPopup(U.popupHTML(o), { maxWidth: 240 });
      });
      map.fitBounds([[p.lat, p.lng], [D.office.lat, D.office.lng]], { padding: [60, 60], maxZoom: 14 });
      setTimeout(function () { map.invalidateSize(); }, 300);
    }
    var q = encodeURIComponent(p.name + ", " + p.location);
    $("#pdMapActions").innerHTML =
      '<a class="btn btn-outline btn-sm" href="https://www.google.com/maps/search/?api=1&query=' + q + '" target="_blank" rel="noopener">' + U.icon("map") + "Open in Google Maps</a>" +
      '<a class="btn btn-gold btn-sm" href="https://www.google.com/maps/dir/?api=1&destination=' + q + '" target="_blank" rel="noopener">' + U.icon("compass") + "Get Directions</a>";
  } else {
    mapEl.style.display = "none";
  }

  /* ---------- EMI ---------- */
  $("#pdEmi").innerHTML = U.emiHTML;
  U.initEMI($("#pdEmi .emi-box"));

  /* ---------- Enquiry form ---------- */
  var dateIn = $("#pdForm input[type=date]");
  var today = new Date();
  dateIn.min = new Date(today.getTime() - today.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
  U.bindForm($("#pdForm"), function () { return p.name + " (" + p.location + ")"; });
  /* bottom dock WhatsApp pre-filled with this project */
  var dw = $("#dockWa");
  if (dw) dw.href = "https://wa.me/" + D.company.whatsapp + "?text=" + encodeURIComponent("Hello Inn10 Infra, I am interested in " + p.name + ", " + p.location + ". Please share details.");

  /* ---------- Similar projects: same area or same type, nearest first ---------- */
  var sim = D.projects.filter(function (o) {
    return o !== p && (o.area === p.area || o.types.some(function (t) { return p.types.indexOf(t) >= 0; }));
  }).sort(function (a, b) {
    var sa = (a.area === p.area ? 0 : 1000) + (a.lat && p.lat ? U.km(p, a) : 500);
    var sb = (b.area === p.area ? 0 : 1000) + (b.lat && p.lat ? U.km(p, b) : 500);
    return sa - sb;
  }).slice(0, 3);
  $("#pdSimilar").innerHTML = sim.map(U.card).join("");
  U.bindTilt($$("#pdSimilar .tilt"));

  /* ---------- Sub-nav highlight ---------- */
  var links = $$("#pdSubnav a[href^='#']");
  window.addEventListener("scroll", function () {
    var pos = window.scrollY + 160;
    links.forEach(function (a) {
      var s = $(a.getAttribute("href"));
      if (s) a.classList.toggle("active", pos >= s.offsetTop && pos < s.offsetTop + s.offsetHeight);
    });
  }, { passive: true });

  if (location.hash === "#enquire") setTimeout(function () { $("#enquire").scrollIntoView(); }, 300);
  U.renderSL();
  U.reveal(document);
})();
