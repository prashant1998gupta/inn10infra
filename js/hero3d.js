/* ==========================================================
   Hero 3D City – Three.js
   Night-time golden city skyline that grows up on load, slowly
   orbits and reacts to the mouse. Falls back to the original
   image slider if WebGL / Three.js is not available.
   ========================================================== */
(function () {
  var canvas = document.getElementById("city3d");
  var fallback = document.getElementById("heroFallback");

  function startFallback() {
    canvas.style.display = "none";
    var slides = (window.INN10 && window.INN10.slides) || [];
    if (!slides.length) return;
    var i = 0;
    fallback.style.backgroundImage = "url('" + slides[0] + "')";
    fallback.classList.add("on");
    setInterval(function () {
      i = (i + 1) % slides.length;
      fallback.style.backgroundImage = "url('" + slides[i] + "')";
    }, 5000);
  }

  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (typeof THREE === "undefined" || reduced) { startFallback(); return; }

  var renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
  } catch (e) { startFallback(); return; }

  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  var scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x070b14, 0.018);
  var camera = new THREE.PerspectiveCamera(55, 1, 0.1, 400);
  camera.position.set(0, 18, 55);

  /* Lights */
  scene.add(new THREE.AmbientLight(0x4466aa, 0.55));
  var moon = new THREE.DirectionalLight(0xffe2a8, 0.9);
  moon.position.set(30, 50, 20);
  scene.add(moon);
  var glow = new THREE.PointLight(0xd4af37, 2.2, 90);
  glow.position.set(0, 12, 0);
  scene.add(glow);

  /* Ground grid */
  var grid = new THREE.GridHelper(300, 120, 0xd4af37, 0x1b2540);
  grid.material.opacity = 0.25;
  grid.material.transparent = true;
  scene.add(grid);

  /* Procedural window texture */
  function windowTexture() {
    var c = document.createElement("canvas");
    c.width = 64; c.height = 128;
    var g = c.getContext("2d");
    g.fillStyle = "#0d1424"; g.fillRect(0, 0, 64, 128);
    for (var y = 4; y < 128; y += 8) {
      for (var x = 4; x < 64; x += 8) {
        var r = Math.random();
        g.fillStyle = r > 0.65 ? "#ffd27a" : r > 0.5 ? "#9fc4ff" : "#151e33";
        g.fillRect(x, y, 4, 5);
      }
    }
    var t = new THREE.CanvasTexture(c);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    return t;
  }
  var textures = [windowTexture(), windowTexture(), windowTexture()];
  /* Buildings */
  var city = new THREE.Group();
  scene.add(city);
  var geo = new THREE.BoxGeometry(1, 1, 1);
  geo.translate(0, 0.5, 0);
  var buildings = [];
  for (var i = 0; i < 260; i++) {
    var x = (Math.random() - 0.5) * 160;
    var z = (Math.random() - 0.5) * 160;
    var d = Math.sqrt(x * x + z * z);
    if (d < 6) continue;
    var h = Math.max(2, (Math.random() * 26 + 4) * Math.max(0.25, 1 - d / 110));
    var w = Math.random() * 3 + 2;
    var tex = textures[i % 3].clone();
    tex.needsUpdate = true;
    tex.repeat.set(1, Math.max(1, Math.round(h / 6)));
    var mat = new THREE.MeshStandardMaterial({
      color: 0x1a2440, map: tex, emissive: 0xffffff, emissiveMap: tex,
      emissiveIntensity: 0.55, metalness: 0.4, roughness: 0.6
    });
    var mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(x, 0, z);
    mesh.scale.set(w, 0.01, w);
    mesh.userData.h = h;
    mesh.userData.delay = d * 0.012 + Math.random() * 0.3;
    city.add(mesh);
    buildings.push(mesh);
  }

  /* Central gold landmark tower */
  var towerMat = new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.9, roughness: 0.25, emissive: 0x3a2a00 });
  var tower = new THREE.Group();
  var yy = 0;
  [[5, 14], [3.8, 10], [2.6, 8], [1.4, 6]].forEach(function (l) {
    var part = new THREE.Mesh(new THREE.BoxGeometry(l[0], l[1], l[0]), towerMat);
    part.position.y = yy + l[1] / 2;
    yy += l[1];
    tower.add(part);
  });
  var spire = new THREE.Mesh(new THREE.ConeGeometry(0.5, 7, 8), towerMat);
  spire.position.y = yy + 3.5;
  tower.add(spire);
  tower.scale.y = 0.01;
  scene.add(tower);

  /* Golden dust particles */
  var pGeo = new THREE.BufferGeometry();
  var pts = new Float32Array(900 * 3);
  for (var p = 0; p < pts.length; p += 3) {
    pts[p] = (Math.random() - 0.5) * 200;
    pts[p + 1] = Math.random() * 60;
    pts[p + 2] = (Math.random() - 0.5) * 200;
  }
  pGeo.setAttribute("position", new THREE.BufferAttribute(pts, 3));
  var particles = new THREE.Points(pGeo, new THREE.PointsMaterial({ color: 0xd4af37, size: 0.35, transparent: true, opacity: 0.7 }));
  scene.add(particles);

  function resize() {
    var w = canvas.clientWidth, h = canvas.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  window.addEventListener("resize", resize);
  resize();

  var mx = 0, my = 0;
  window.addEventListener("mousemove", function (e) {
    mx = e.clientX / window.innerWidth - 0.5;
    my = e.clientY / window.innerHeight - 0.5;
  });

  /* Pause rendering when hero is off-screen */
  var visible = true;
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(function (en) { visible = en[0].isIntersecting; }).observe(canvas);
  }

  var clock = new THREE.Clock();
  function ease(t) { t = Math.min(1, Math.max(0, t)); return 1 - Math.pow(1 - t, 3); }

  function animate() {
    requestAnimationFrame(animate);
    if (!visible) return;
    var t = clock.getElapsedTime();
    for (var k = 0; k < buildings.length; k++) {
      var b = buildings[k];
      b.scale.y = Math.max(0.01, b.userData.h * ease((t - b.userData.delay) / 1.2));
    }
    tower.scale.y = Math.max(0.01, ease((t - 0.4) / 1.8));

    var ang = t * 0.06 + mx * 0.6;
    camera.position.x += (Math.sin(ang) * 58 - camera.position.x) * 0.05;
    camera.position.z += (Math.cos(ang) * 58 - camera.position.z) * 0.05;
    camera.position.y += (20 - my * 14 - camera.position.y) * 0.05;
    camera.lookAt(0, 10, 0);

    particles.rotation.y = t * 0.02;
    glow.intensity = 2 + Math.sin(t * 2) * 0.4;
    renderer.render(scene, camera);
  }
  animate();
})();
