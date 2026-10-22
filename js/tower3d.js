/* ==========================================================
   Services "journey" – a glass & gold tower that is built
   floor-by-floor as the user scrolls (Three.js).
   Each floor = one Inn10 service. Desktop only; on mobile or
   without WebGL the regular service cards are shown instead.
   ========================================================== */
(function () {
  var section = document.getElementById("services");
  var canvas = document.getElementById("tower3d");
  if (!section || !canvas) return;

  var steps = Array.prototype.slice.call(document.querySelectorAll(".j-step"));
  var bar = document.getElementById("journeyBar");
  var floorLbl = document.getElementById("journeyFloor");
  var FLOORS = (window.INN10 && window.INN10.services.length) || 4;

  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  /* must match the CSS rule in responsive.css (max-width: 899px), (max-height: 559px) */
  var desktop = window.matchMedia("(min-width: 900px) and (min-height: 560px)");
  var renderer;
  if (typeof THREE !== "undefined" && !reduced) {
    try { renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true }); } catch (e) { renderer = null; }
  }
  if (!renderer) { section.classList.add("no-3d"); return; }
  section.classList.add("has-3d");

  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(40, 1, 0.1, 200);

  scene.add(new THREE.AmbientLight(0x8899cc, 0.7));
  var key = new THREE.DirectionalLight(0xfff0d0, 1.1);
  key.position.set(10, 20, 14);
  scene.add(key);
  var rim = new THREE.PointLight(0xd4af37, 1.6, 60);
  rim.position.set(-8, 10, -6);
  scene.add(rim);

  /* Plot / base */
  var base = new THREE.Mesh(
    new THREE.CylinderGeometry(9, 9.4, 0.6, 64),
    new THREE.MeshStandardMaterial({ color: 0x16203a, metalness: 0.4, roughness: 0.7 })
  );
  base.position.y = -0.3;
  scene.add(base);
  var ringMesh = new THREE.Mesh(new THREE.TorusGeometry(9.2, 0.06, 8, 96), new THREE.MeshBasicMaterial({ color: 0xd4af37 }));
  ringMesh.rotation.x = Math.PI / 2;
  ringMesh.position.y = 0.02;
  scene.add(ringMesh);

  /* Blueprint grid on the plot */
  var grid = new THREE.GridHelper(16, 16, 0xd4af37, 0x2a3a66);
  grid.material.transparent = true;
  grid.material.opacity = 0.35;
  grid.position.y = 0.01;
  scene.add(grid);

  /* Floors */
  var H = 2.6, W = 6, Dp = 4.4;
  var glass = new THREE.MeshStandardMaterial({ color: 0x88aaff, metalness: 0.9, roughness: 0.08, transparent: true, opacity: 0.55, emissive: 0x0b1a3a });
  var gold = new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.95, roughness: 0.25, emissive: 0x2a1e00 });
  var tower = new THREE.Group();
  scene.add(tower);
  var floors = [];
  for (var i = 0; i < FLOORS; i++) {
    var g = new THREE.Group();
    var w = W - i * 0.55, d = Dp - i * 0.35;
    var body = new THREE.Mesh(new THREE.BoxGeometry(w, H - 0.25, d), glass);
    body.position.y = (H - 0.25) / 2 + 0.25;
    g.add(body);
    var slab = new THREE.Mesh(new THREE.BoxGeometry(w + 0.5, 0.25, d + 0.5), gold);
    slab.position.y = 0.125;
    g.add(slab);
    /* vertical gold fins */
    for (var f = -2; f <= 2; f++) {
      var fin = new THREE.Mesh(new THREE.BoxGeometry(0.08, H - 0.25, 0.08), gold);
      fin.position.set((f * w) / 4.4, body.position.y, d / 2 + 0.02);
      g.add(fin);
    }
    /* edge glow */
    var edges = new THREE.LineSegments(new THREE.EdgesGeometry(body.geometry), new THREE.LineBasicMaterial({ color: 0xf3d27a, transparent: true, opacity: 0.6 }));
    edges.position.copy(body.position);
    g.add(edges);
    g.position.y = i * H;
    g.userData = { target: i * H, from: i * H + 14 };
    g.visible = false;
    tower.add(g);
    floors.push(g);
  }
  /* crown + spire */
  var crown = new THREE.Group();
  var cw = W - FLOORS * 0.55;
  var cap = new THREE.Mesh(new THREE.BoxGeometry(cw + 0.6, 0.35, Dp - FLOORS * 0.35 + 0.6), gold);
  cap.position.y = 0.17;
  crown.add(cap);
  var spire = new THREE.Mesh(new THREE.ConeGeometry(0.35, 4, 8), gold);
  spire.position.y = 2.3;
  crown.add(spire);
  crown.position.y = FLOORS * H;
  crown.visible = false;
  tower.add(crown);

  /* Crane (blueprint feel) */
  var crane = new THREE.Group();
  var mast = new THREE.Mesh(new THREE.BoxGeometry(0.25, 16, 0.25), new THREE.MeshStandardMaterial({ color: 0xd4af37, wireframe: true }));
  mast.position.set(6.5, 8, -2);
  crane.add(mast);
  var jib = new THREE.Mesh(new THREE.BoxGeometry(10, 0.25, 0.25), new THREE.MeshStandardMaterial({ color: 0xd4af37, wireframe: true }));
  jib.position.set(3, 16, -2);
  crane.add(jib);
  scene.add(crane);

  function resize() {
    var w = canvas.clientWidth, h = canvas.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  window.addEventListener("resize", resize);
  /* ---------- Scroll progress → floors ---------- */
  var progress = 0, shown = 0;
  function readProgress() {
    if (!desktop.matches) return 1;
    var r = section.getBoundingClientRect();
    var total = section.offsetHeight - window.innerHeight;
    return Math.min(1, Math.max(0, -r.top / Math.max(1, total)));
  }
  var activeStep = -1;
  function updateText(p) {
    var idx = Math.min(FLOORS - 1, Math.floor(p * FLOORS * 0.999));
    if (idx !== activeStep) {
      activeStep = idx;
      steps.forEach(function (s, k) {
        s.classList.toggle("on", k === idx);
        s.classList.toggle("done", k < idx);
      });
      floorLbl.textContent = "Floor " + (idx + 1) + " / " + FLOORS + (p > 0.97 ? " · Complete ✓" : "");
    }
    bar.style.width = (p * 100).toFixed(1) + "%";
  }

  var visible = false;
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(function (en) { visible = en[0].isIntersecting; if (visible) resize(); }).observe(section);
  } else visible = true;

  var clock = new THREE.Clock();
  function ease(t) { t = Math.min(1, Math.max(0, t)); return 1 - Math.pow(1 - t, 3); }

  function animate() {
    requestAnimationFrame(animate);
    if (!visible || !desktop.matches) return; /* hidden on mobile – save battery */
    var t = clock.getElapsedTime();
    if (!canvas.clientWidth) return;
    if (renderer.domElement.width !== Math.floor(canvas.clientWidth * renderer.getPixelRatio())) resize();
    progress = readProgress();
    shown += (progress - shown) * 0.12;
    updateText(progress);

    /* each floor drops into place over its share of the scroll */
    var built = shown * (FLOORS + 0.6);
    for (var i = 0; i < FLOORS; i++) {
      var k = ease(built - i);
      var fl = floors[i];
      fl.visible = k > 0.001;
      fl.position.y = fl.userData.from + (fl.userData.target - fl.userData.from) * k;
      fl.scale.setScalar(0.85 + 0.15 * k);
    }
    var ck = ease(built - FLOORS);
    crown.visible = ck > 0.001;
    crown.position.y = FLOORS * H + 10 * (1 - ck);

    /* crane jib swings; camera orbits & rises with the building */
    crane.rotation.y = Math.sin(t * 0.4) * 0.5;
    var top = Math.max(2, built * H);
    var ang = t * 0.15 + shown * 2.4;
    camera.position.set(Math.sin(ang) * 26, 6 + top * 0.6, Math.cos(ang) * 26);
    camera.lookAt(0, top * 0.5, 0);
    rim.intensity = 1.4 + Math.sin(t * 2) * 0.3;
    renderer.render(scene, camera);
  }
  resize();
  animate();
})();
