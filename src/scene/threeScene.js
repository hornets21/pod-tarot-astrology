import * as THREE from 'three';

let scene, camera, renderer;
let esiimsiGroup, bambooCylinder, sticksGroup, drawnStickMesh;
let tarotDeckGroup;
let candleLights = [];
let magicParticles;
let isDragging = false;
let previousMousePosition = { x: 0, y: 0 };
let clock = new THREE.Clock();
let currentSceneMode = 'esiimsi';
let isShakingEsiimsi = false;

export function initThreeScene(container) {
  const width = container.clientWidth || window.innerWidth;
  const height = container.clientHeight || window.innerHeight;

  // 1. Scene setup
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x07050d);
  scene.fog = new THREE.FogExp2(0x07050d, 0.045);

  // 2. Camera setup
  camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
  camera.position.set(0, 4.2, 8.5);
  camera.lookAt(0, 1.2, 0);

  // 3. WebGL Renderer
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  container.innerHTML = '';
  container.appendChild(renderer.domElement);

  // 4. Lighting - Mystical Altar Candlelight Atmosphere
  const ambientLight = new THREE.AmbientLight(0x2d1a4d, 1.2);
  scene.add(ambientLight);

  // Main overhead mystical purple spotlight
  const purpleSpot = new THREE.SpotLight(0xa855f7, 2.5, 20, Math.PI / 4, 0.5, 1);
  purpleSpot.position.set(0, 8, 2);
  purpleSpot.castShadow = true;
  purpleSpot.shadow.mapSize.width = 1024;
  purpleSpot.shadow.mapSize.height = 1024;
  scene.add(purpleSpot);

  // Warm Golden Candle Lights (Left & Right)
  candleLights = [];
  const candle1 = new THREE.PointLight(0xffa233, 2.8, 8);
  candle1.position.set(-3.5, 2.2, 1.5);
  scene.add(candle1);
  candleLights.push(candle1);

  const candle2 = new THREE.PointLight(0xffa233, 2.8, 8);
  candle2.position.set(3.5, 2.2, 1.5);
  scene.add(candle2);
  candleLights.push(candle2);

  // Center Mystic Crystal Ball Glow
  const centerGlow = new THREE.PointLight(0xc084fc, 1.8, 6);
  centerGlow.position.set(0, 1.5, 0.5);
  scene.add(centerGlow);

  // 5. Altar Wooden Table with Sacred Cloth
  createAltarTable();

  // 6. 3D Esiimsi Bamboo Shaker Cylinder + 40 Sticks
  createEsiimsiObject();

  // 7. 3D Tarot Deck
  createTarotDeckObject();

  // 8. Mystical Incense / Magical Sparkle Particles
  createMagicParticles();

  // 9. Event Listeners for Orbit / Resize
  setupInteractions(container);

  // 10. Start Animation Loop
  animate();
}

function createAltarTable() {
  const tableGeo = new THREE.CylinderGeometry(6, 6.4, 0.8, 48);
  const tableMat = new THREE.MeshStandardMaterial({
    color: 0x1a1226,
    roughness: 0.6,
    metalness: 0.3
  });
  const table = new THREE.Mesh(tableGeo, tableMat);
  table.position.y = -0.4;
  table.receiveShadow = true;
  scene.add(table);

  // Golden Sacred Mandala Mat on table
  const matGeo = new THREE.CircleGeometry(4.2, 48);
  const matCanvas = document.createElement('canvas');
  matCanvas.width = 1024;
  matCanvas.height = 1024;
  const ctx = matCanvas.getContext('2d');

  ctx.fillStyle = '#120b22';
  ctx.fillRect(0, 0, 1024, 1024);
  ctx.strokeStyle = '#e6c875';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.arc(512, 512, 490, 0, Math.PI * 2);
  ctx.stroke();

  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(512, 512, 440, 0, Math.PI * 2);
  ctx.arc(512, 512, 360, 0, Math.PI * 2);
  ctx.arc(512, 512, 260, 0, Math.PI * 2);
  ctx.stroke();

  // Draw 12 Zodiac lines
  for (let i = 0; i < 12; i++) {
    const rad = (i * Math.PI) / 6;
    ctx.beginPath();
    ctx.moveTo(512 + Math.cos(rad) * 260, 512 + Math.sin(rad) * 260);
    ctx.lineTo(512 + Math.cos(rad) * 440, 512 + Math.sin(rad) * 440);
    ctx.stroke();
  }

  ctx.fillStyle = '#e6c875';
  ctx.font = 'bold 36px Sarabun, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('เรือนพยากรณ์ พ่อหมอ SARABEST', 512, 512);

  const matTexture = new THREE.CanvasTexture(matCanvas);
  const clothMat = new THREE.MeshStandardMaterial({
    map: matTexture,
    roughness: 0.8,
    metalness: 0.2
  });
  const tableCloth = new THREE.Mesh(matGeo, clothMat);
  tableCloth.rotation.x = -Math.PI / 2;
  tableCloth.position.y = 0.01;
  tableCloth.receiveShadow = true;
  scene.add(tableCloth);
}

function createEsiimsiObject() {
  esiimsiGroup = new THREE.Group();
  esiimsiGroup.position.set(0, 0, 0);

  // Texture for Bamboo Cylinder matching the Sacred Altar Table & Tarot Suite
  const cylCanvas = document.createElement('canvas');
  cylCanvas.width = 512;
  cylCanvas.height = 1024;
  const ctx = cylCanvas.getContext('2d');

  // Deep mystic ebony lacquer background matching the table
  const grad = ctx.createLinearGradient(0, 0, 512, 0);
  grad.addColorStop(0, '#0e0819');
  grad.addColorStop(0.5, '#190f2d');
  grad.addColorStop(1, '#0e0819');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 1024);

  // Subtle woodgrain / aged lacquer texture lines
  ctx.strokeStyle = 'rgba(230, 200, 117, 0.08)';
  ctx.lineWidth = 1;
  for (let y = 0; y < 1024; y += 8) {
    ctx.beginPath();
    ctx.moveTo(0, y + (Math.sin(y * 0.05) * 4));
    ctx.lineTo(512, y + (Math.sin(y * 0.05) * 4));
    ctx.stroke();
  }

  // Antique Gold Filigree Borders (Upper, Middle, Lower)
  ctx.strokeStyle = '#e6c875';
  ctx.lineWidth = 6;
  ctx.strokeRect(16, 20, 480, 984);
  ctx.lineWidth = 2;
  ctx.strokeRect(28, 32, 456, 960);

  // Astrological & Sacred Geometric Mandala in center
  ctx.beginPath();
  ctx.arc(256, 450, 110, 0, Math.PI * 2);
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(256, 450, 85, 0, Math.PI * 2);
  ctx.stroke();

  // Sacred Thai Seal & Inscription
  ctx.fillStyle = '#e6c875';
  ctx.font = 'bold 44px Cinzel, serif';
  ctx.textAlign = 'center';
  ctx.fillText('✦ ๔๐ ✦', 256, 440);

  ctx.font = 'bold 30px Sarabun, sans-serif';
  ctx.fillText('เซียมซีพยากรณ์', 256, 485);

  ctx.font = '19px Sarabun, sans-serif';
  ctx.fillStyle = '#c084fc';
  ctx.fillText('เรือนพยากรณ์ พ่อหมอ SARABEST', 256, 680);

  const cylTexture = new THREE.CanvasTexture(cylCanvas);

  // Bamboo Cylinder Container: bundles body, base, gold rims, and sticks into one unified object
  bambooCylinder = new THREE.Group();
  bambooCylinder.position.set(0, 0, 0);

  // 1. Bamboo Cylinder Wall Body
  const cylinderGeo = new THREE.CylinderGeometry(0.72, 0.66, 2.8, 36, 1, true);
  const cylinderMat = new THREE.MeshStandardMaterial({
    map: cylTexture,
    roughness: 0.45,
    metalness: 0.35,
    side: THREE.DoubleSide
  });
  const cylinderBodyMesh = new THREE.Mesh(cylinderGeo, cylinderMat);
  cylinderBodyMesh.position.y = 1.4;
  cylinderBodyMesh.castShadow = true;
  bambooCylinder.add(cylinderBodyMesh);

  // Matching Antique Gold Rims & Bands (Base, Center Ring, Upper Rim)
  const goldAltarMat = new THREE.MeshStandardMaterial({
    color: 0xe6c875,
    roughness: 0.32,
    metalness: 0.85
  });

  // 2. Heavy Gold Base
  const baseGeo = new THREE.CylinderGeometry(0.70, 0.76, 0.22, 36);
  const cylBase = new THREE.Mesh(baseGeo, goldAltarMat);
  cylBase.position.y = 0.11;
  cylBase.castShadow = true;
  bambooCylinder.add(cylBase);

  // 3. Middle Ornamental Gold Ring
  const midRingGeo = new THREE.TorusGeometry(0.70, 0.03, 16, 36);
  const cylMidRing = new THREE.Mesh(midRingGeo, goldAltarMat);
  cylMidRing.rotation.x = Math.PI / 2;
  cylMidRing.position.y = 1.35;
  bambooCylinder.add(cylMidRing);

  // 4. Upper Gold Rim
  const rimGeo = new THREE.TorusGeometry(0.73, 0.04, 16, 36);
  const cylRim = new THREE.Mesh(rimGeo, goldAltarMat);
  cylRim.rotation.x = Math.PI / 2;
  cylRim.position.y = 2.8;
  bambooCylinder.add(cylRim);

  // 5. 40 Wooden Bamboo Sticks inside the cylinder (harmonized wood & gold dipped tips)
  sticksGroup = new THREE.Group();
  sticksGroup.position.y = 1.2;

  const stickGeo = new THREE.BoxGeometry(0.042, 3.2, 0.065);
  const stickWoodMat = new THREE.MeshStandardMaterial({
    color: 0x3d2716, // Rich dark polished sandalwood/aged bamboo
    roughness: 0.6,
    metalness: 0.15
  });

  const goldLeafTipMat = new THREE.MeshStandardMaterial({
    color: 0xe6c875, // Golden tip matching the altar
    roughness: 0.3,
    metalness: 0.8
  });

  const maroonBandMat = new THREE.MeshStandardMaterial({
    color: 0x581313, // Deep sacred crimson lacquer ring
    roughness: 0.5
  });

  for (let i = 0; i < 40; i++) {
    const stickMesh = new THREE.Mesh(stickGeo, stickWoodMat);

    // Tip decoration: crimson band + gold tip
    const maroonBand = new THREE.Mesh(new THREE.BoxGeometry(0.045, 0.15, 0.068), maroonBandMat);
    maroonBand.position.y = 1.25;
    stickMesh.add(maroonBand);

    const goldTip = new THREE.Mesh(new THREE.BoxGeometry(0.045, 0.3, 0.068), goldLeafTipMat);
    goldTip.position.y = 1.45;
    stickMesh.add(goldTip);

    const angle = Math.random() * Math.PI * 2;
    const radius = Math.random() * 0.44;
    stickMesh.position.set(Math.cos(angle) * radius, (Math.random() - 0.5) * 0.22, Math.sin(angle) * radius);
    stickMesh.rotation.set((Math.random() - 0.5) * 0.14, Math.random() * Math.PI, (Math.random() - 0.5) * 0.14);
    stickMesh.castShadow = true;
    sticksGroup.add(stickMesh);
  }

  bambooCylinder.add(sticksGroup);

  // 6. Special Floating Highlight Stick that emerges upon drawing
  const drawnStickGeo = new THREE.BoxGeometry(0.12, 3.4, 0.035);
  const stickCanvas = document.createElement('canvas');
  stickCanvas.width = 128;
  stickCanvas.height = 512;
  const sCtx = stickCanvas.getContext('2d');
  
  // Dark ritual wood body
  sCtx.fillStyle = '#1c1328';
  sCtx.fillRect(0, 0, 128, 512);

  // Gold borders
  sCtx.strokeStyle = '#e6c875';
  sCtx.lineWidth = 4;
  sCtx.strokeRect(6, 6, 116, 500);

  // Gold gilded top
  sCtx.fillStyle = '#e6c875';
  sCtx.fillRect(6, 6, 116, 95);

  sCtx.fillStyle = '#140c20';
  sCtx.font = 'bold 42px Sarabun';
  sCtx.textAlign = 'center';
  sCtx.fillText('๑', 64, 68);

  const drawnStickTex = new THREE.CanvasTexture(stickCanvas);
  const drawnStickMat = new THREE.MeshStandardMaterial({
    map: drawnStickTex,
    roughness: 0.4,
    metalness: 0.3
  });

  drawnStickMesh = new THREE.Mesh(drawnStickGeo, drawnStickMat);
  drawnStickMesh.position.set(0, 2.0, 0);
  drawnStickMesh.visible = false;
  bambooCylinder.add(drawnStickMesh);

  // Attach unified cylinder assembly to main altar group
  esiimsiGroup.add(bambooCylinder);
  scene.add(esiimsiGroup);
}

function createTarotDeckObject() {
  tarotDeckGroup = new THREE.Group();
  tarotDeckGroup.position.set(0, 0.05, 0.5);
  tarotDeckGroup.visible = false;

  const backCanvas = document.createElement('canvas');
  backCanvas.width = 512;
  backCanvas.height = 800;
  const bCtx = backCanvas.getContext('2d');

  bCtx.fillStyle = '#0f0920';
  bCtx.fillRect(0, 0, 512, 800);
  bCtx.strokeStyle = '#e6c875';
  bCtx.lineWidth = 12;
  bCtx.strokeRect(16, 16, 480, 768);
  bCtx.lineWidth = 4;
  bCtx.strokeRect(30, 30, 452, 740);

  bCtx.beginPath();
  bCtx.arc(256, 400, 120, 0, Math.PI * 2);
  bCtx.stroke();
  bCtx.fillStyle = '#c084fc';
  bCtx.font = 'bold 80px Cinzel, serif';
  bCtx.textAlign = 'center';
  bCtx.fillText('✦ ☽ ✦', 256, 425);

  const cardBackTexture = new THREE.CanvasTexture(backCanvas);

  const cardGeo = new THREE.BoxGeometry(1.6, 0.015, 2.5);
  const cardEdgeMat = new THREE.MeshStandardMaterial({
    color: 0x9a7b2c,
    roughness: 0.4,
    metalness: 0.7
  });
  const cardBackMat = new THREE.MeshStandardMaterial({
    map: cardBackTexture,
    roughness: 0.5,
    metalness: 0.3
  });
  const cardFrontBlankMat = new THREE.MeshStandardMaterial({
    color: 0x140c20,
    roughness: 0.5,
    metalness: 0.3
  });

  for (let i = 0; i < 18; i++) {
    // Multi-material: [+x, -x, +y (back), -y (front), +z, -z]
    const cMesh = new THREE.Mesh(cardGeo, [
      cardEdgeMat,
      cardEdgeMat,
      cardBackMat,
      cardFrontBlankMat.clone(),
      cardEdgeMat,
      cardEdgeMat
    ]);
    cMesh.position.set((Math.random() - 0.5) * 0.05, i * 0.018, (Math.random() - 0.5) * 0.05);
    cMesh.rotation.y = (Math.random() - 0.5) * 0.08;
    cMesh.castShadow = true;
    cMesh.receiveShadow = true;
    tarotDeckGroup.add(cMesh);
  }

  // Floating mystical rune ring above the deck to indicate interactivity
  const ringGeo = new THREE.RingGeometry(0.85, 1.05, 36);
  const ringMat = new THREE.MeshBasicMaterial({
    color: 0xc084fc,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.55
  });
  tarotAura = new THREE.Mesh(ringGeo, ringMat);
  tarotAura.rotation.x = -Math.PI / 2;
  tarotAura.position.set(0, 0.36, 0);
  tarotDeckGroup.add(tarotAura);

  scene.add(tarotDeckGroup);
}

function createMagicParticles() {
  const particleCount = 200;
  const geom = new THREE.BufferGeometry();
  const positions = new Float32Array(particleCount * 3);
  const colors = new Float32Array(particleCount * 3);

  for (let i = 0; i < particleCount; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 12;
    positions[i * 3 + 1] = Math.random() * 6;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 10;

    const isGold = Math.random() > 0.5;
    colors[i * 3] = isGold ? 0.95 : 0.75;
    colors[i * 3 + 1] = isGold ? 0.82 : 0.35;
    colors[i * 3 + 2] = isGold ? 0.40 : 0.98;
  }

  geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geom.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  const mat = new THREE.PointsMaterial({
    size: 0.08,
    vertexColors: true,
    transparent: true,
    opacity: 0.75,
    blending: THREE.AdditiveBlending
  });

  magicParticles = new THREE.Points(geom, mat);
  scene.add(magicParticles);
}

let raycaster = new THREE.Raycaster();
let mouseVec = new THREE.Vector2();
let onTarotCardClickCallback = null;
let isPointerDown = false;
let pointerDownPos = { x: 0, y: 0 };
let pointerDownTime = 0;
let isDrawingTarot = false;
let tarotAura;

export function setTarotCardClickHandler(cb) {
  onTarotCardClickCallback = cb;
}

function setupInteractions(container) {
  window.addEventListener('resize', () => {
    const w = container.clientWidth || window.innerWidth;
    const h = container.clientHeight || window.innerHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  });

  const onDown = (e) => {
    isDragging = false;
    isPointerDown = true;
    const clientX = e.clientX || (e.touches && e.touches[0].clientX) || 0;
    const clientY = e.clientY || (e.touches && e.touches[0].clientY) || 0;
    pointerDownPos = { x: clientX, y: clientY };
    pointerDownTime = Date.now();
    previousMousePosition = { x: clientX, y: clientY };
  };

  const onMove = (e) => {
    const clientX = e.clientX || (e.touches && e.touches[0].clientX) || 0;
    const clientY = e.clientY || (e.touches && e.touches[0].clientY) || 0;

    const deltaX = clientX - previousMousePosition.x;
    const deltaY = clientY - previousMousePosition.y;

    if (isPointerDown) {
      const distFromStart = Math.hypot(clientX - pointerDownPos.x, clientY - pointerDownPos.y);
      if (distFromStart > 6) {
        isDragging = true;
      }
    }

    if (isDragging) {
      if (currentSceneMode === 'esiimsi') {
        if (esiimsiGroup && !isShakingEsiimsi) esiimsiGroup.rotation.y += deltaX * 0.008;
        if (bambooCylinder && !isShakingEsiimsi) bambooCylinder.rotation.x = Math.max(-0.25, Math.min(0.25, bambooCylinder.rotation.x + deltaY * 0.004));
      } else {
        if (tarotDeckGroup && !isDrawingTarot && activeDrawnCardSnapshots.length === 0) {
          tarotDeckGroup.rotation.y += deltaX * 0.008;
        }
      }
    } else if (currentSceneMode === 'tarot' && tarotDeckGroup && tarotDeckGroup.visible) {
      // Raycast hover check over 3D tarot cards
      const rect = renderer.domElement.getBoundingClientRect();
      mouseVec.x = ((clientX - rect.left) / rect.width) * 2 - 1;
      mouseVec.y = -((clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(mouseVec, camera);
      const hits = raycaster.intersectObjects(tarotDeckGroup.children, true);
      if (hits.length > 0) {
        container.style.cursor = 'pointer';
      } else {
        container.style.cursor = 'default';
      }
    }

    previousMousePosition = { x: clientX, y: clientY };
  };

  const onUp = (e) => {
    const clientX = (e.changedTouches && e.changedTouches[0] ? e.changedTouches[0].clientX : e.clientX) || previousMousePosition.x;
    const clientY = (e.changedTouches && e.changedTouches[0] ? e.changedTouches[0].clientY : e.clientY) || previousMousePosition.y;
    const distFromStart = Math.hypot(clientX - pointerDownPos.x, clientY - pointerDownPos.y);
    const duration = Date.now() - pointerDownTime;

    if (!isDragging && distFromStart < 10 && duration < 450) {
      handleSceneClick(clientX, clientY);
    }

    isDragging = false;
    isPointerDown = false;
  };

  function handleSceneClick(clientX, clientY) {
    const rect = renderer.domElement.getBoundingClientRect();
    mouseVec.x = ((clientX - rect.left) / rect.width) * 2 - 1;
    mouseVec.y = -((clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(mouseVec, camera);

    if (currentSceneMode === 'tarot' && tarotDeckGroup && tarotDeckGroup.visible) {
      const hits = raycaster.intersectObjects(tarotDeckGroup.children, true);
      if (hits.length > 0 && !isDrawingTarot) {
        if (onTarotCardClickCallback) {
          onTarotCardClickCallback();
        }
      }
    }
  }

  container.addEventListener('mousedown', onDown);
  window.addEventListener('mousemove', onMove);
  window.addEventListener('mouseup', onUp);

  container.addEventListener('touchstart', onDown, { passive: true });
  window.addEventListener('touchmove', onMove, { passive: true });
  window.addEventListener('touchend', onUp);
}

function animate() {
  requestAnimationFrame(animate);
  const elapsedTime = clock.getElapsedTime();

  // Realistic Candle Flame Flicker
  candleLights.forEach((light, idx) => {
    light.intensity = 2.4 + Math.sin(elapsedTime * 6 + idx * 2) * 0.4 + Math.cos(elapsedTime * 11) * 0.2;
  });

  // Ambient Particle slow float
  if (magicParticles) {
    const pos = magicParticles.geometry.attributes.position.array;
    for (let i = 1; i < pos.length; i += 3) {
      pos[i] += 0.005;
      if (pos[i] > 6) pos[i] = 0;
    }
    magicParticles.geometry.attributes.position.needsUpdate = true;
  }

  // Idle gentle bobbing when not shaking
  if (!isShakingEsiimsi && currentSceneMode === 'esiimsi' && esiimsiGroup) {
    esiimsiGroup.position.y = Math.sin(elapsedTime * 1.5) * 0.04;
  }

  // Gentle pulse and spin on tarot interactive aura
  if (tarotAura && currentSceneMode === 'tarot') {
    tarotAura.rotation.z += 0.012;
    tarotAura.material.opacity = 0.4 + Math.sin(elapsedTime * 3) * 0.25;
  }

  renderer.render(scene, camera);
}

export function switchSceneMode(mode) {
  currentSceneMode = mode;
  if (!esiimsiGroup || !tarotDeckGroup) return;

  if (mode === 'esiimsi') {
    esiimsiGroup.visible = true;
    tarotDeckGroup.visible = false;
    camera.position.set(0, 4.2, 8.5);
    camera.lookAt(0, 1.2, 0);
  } else {
    esiimsiGroup.visible = false;
    tarotDeckGroup.visible = true;
    camera.position.set(0, 3.8, 6.2);
    camera.lookAt(0, 0.4, 0.5);
  }
}

export function resetEsiimsiView() {
  if (esiimsiGroup) {
    esiimsiGroup.rotation.set(0, 0, 0);
    bambooCylinder.rotation.set(0, 0, 0);
  }
  if (tarotDeckGroup) {
    tarotDeckGroup.rotation.set(0, 0, 0);
  }
  camera.position.set(0, 4.2, 8.5);
  camera.lookAt(0, 1.2, 0);
}

export function resetTarotView() {
  if (tarotDeckGroup) {
    tarotDeckGroup.rotation.set(0, 0, 0);
  }
}

export function hideDrawnStick() {
  if (drawnStickMesh) {
    drawnStickMesh.visible = false;
  }
}

export function triggerEsiimsiShakeAnimation(luckyNumber, onRattle, onComplete) {
  if (isShakingEsiimsi) return;
  isShakingEsiimsi = true;

  const thaiDigit = luckyNumber.toString().replace(/\d/g, d => "๐๑๒๓๔๕๖๗๘๙"[d]);

  const sCanvas = document.createElement('canvas');
  sCanvas.width = 128;
  sCanvas.height = 512;
  const sCtx = sCanvas.getContext('2d');
  
  // Dark ritual wood body matching the suite
  sCtx.fillStyle = '#1c1328';
  sCtx.fillRect(0, 0, 128, 512);

  // Gold borders
  sCtx.strokeStyle = '#e6c875';
  sCtx.lineWidth = 4;
  sCtx.strokeRect(6, 6, 116, 500);

  // Gold gilded top
  sCtx.fillStyle = '#e6c875';
  sCtx.fillRect(6, 6, 116, 105);

  sCtx.fillStyle = '#140c20';
  sCtx.font = 'bold 44px Sarabun';
  sCtx.textAlign = 'center';
  sCtx.fillText(thaiDigit, 64, 72);

  sCtx.fillStyle = '#fef08a';
  sCtx.font = 'bold 28px Sarabun';
  sCtx.fillText(luckyNumber.toString(), 64, 160);

  drawnStickMesh.material.map = new THREE.CanvasTexture(sCanvas);
  drawnStickMesh.material.map.needsUpdate = true;
  drawnStickMesh.position.set(0, 1.2, 0);
  drawnStickMesh.visible = false;

  let shakeCount = 0;
  const maxShakes = 28;
  const shakeInterval = setInterval(() => {
    shakeCount++;

    const shakeIntensity = 0.22;
    bambooCylinder.rotation.z = (Math.random() - 0.5) * shakeIntensity;
    bambooCylinder.rotation.x = 0.4 + (Math.random() - 0.5) * shakeIntensity;
    sticksGroup.rotation.y += 0.3;
    sticksGroup.position.y = 1.2 + Math.sin(shakeCount) * 0.15;

    if (shakeCount % 2 === 0 && onRattle) {
      onRattle();
    }

    if (shakeCount >= maxShakes) {
      clearInterval(shakeInterval);

      bambooCylinder.rotation.set(0, 0, 0);
      sticksGroup.position.set(0, 1.2, 0);

      drawnStickMesh.visible = true;
      let liftProgress = 0;
      const liftInterval = setInterval(() => {
        liftProgress += 0.05;
        drawnStickMesh.position.y = 1.4 + Math.sin(liftProgress * Math.PI * 0.5) * 1.8;
        drawnStickMesh.rotation.y = liftProgress * 2;
        drawnStickMesh.rotation.x = Math.sin(liftProgress * 1.5) * 0.2;

        if (liftProgress >= 1.0) {
          clearInterval(liftInterval);
          isShakingEsiimsi = false;
          if (onComplete) onComplete();
        }
      }, 25);
    }
  }, 55);
}

export function triggerTarotShuffleAnimation(onRattle, onComplete) {
  if (!tarotDeckGroup) return;
  if (onRattle) onRattle();

  let steps = 0;
  const shuffleAnim = setInterval(() => {
    steps++;
    tarotDeckGroup.children.forEach((c) => {
      if (c !== tarotAura) {
        c.position.x = (Math.random() - 0.5) * 0.4;
        c.rotation.y = (Math.random() - 0.5) * 0.2;
      }
    });

    if (steps > 12) {
      clearInterval(shuffleAnim);
      if (tarotDeckGroup) tarotDeckGroup.rotation.y = 0;
      tarotDeckGroup.children.forEach((c) => {
        if (c !== tarotAura) {
          c.position.x = 0;
          c.rotation.y = 0;
        }
      });
      if (onComplete) onComplete();
    }
  }, 40);
}

function generateTarotCardTexture(cardData) {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 800;
  const ctx = canvas.getContext('2d');

  // Deep mystic obsidian background
  ctx.fillStyle = '#110a20';
  ctx.fillRect(0, 0, 512, 800);

  // Antique gold filigree borders
  ctx.strokeStyle = '#e6c875';
  ctx.lineWidth = 14;
  ctx.strokeRect(16, 16, 480, 768);
  ctx.lineWidth = 3;
  ctx.strokeRect(30, 30, 452, 740);

  // Corner ornaments
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(30, 30, 18, 0, Math.PI * 0.5);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(482, 30, 18, Math.PI * 0.5, Math.PI);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(30, 770, 18, Math.PI * 1.5, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(482, 770, 18, Math.PI, Math.PI * 1.5);
  ctx.stroke();

  // Roman Numeral / Card No
  ctx.fillStyle = '#e6c875';
  ctx.font = 'bold 36px Cinzel, serif';
  ctx.textAlign = 'center';
  ctx.fillText(`— ${cardData.id} —`, 256, 85);

  // English Name
  ctx.font = 'bold 32px Cinzel, serif';
  ctx.fillText(cardData.nameEn.toUpperCase(), 256, 135);

  // Center Emblem Circle
  ctx.save();
  ctx.beginPath();
  ctx.arc(256, 410, 175, 0, Math.PI * 2);
  ctx.clip();
  ctx.fillStyle = '#22133c';
  ctx.fillRect(0, 0, 512, 800);

  // Radiance lines
  ctx.strokeStyle = cardData.color || '#a855f7';
  ctx.lineWidth = 2.5;
  for (let a = 0; a < Math.PI * 2; a += Math.PI / 8) {
    ctx.beginPath();
    ctx.moveTo(256, 410);
    ctx.lineTo(256 + Math.cos(a) * 200, 410 + Math.sin(a) * 200);
    ctx.stroke();
  }

  // Mystic star glyph
  ctx.fillStyle = '#fde68a';
  ctx.font = '80px serif';
  ctx.textBaseline = 'middle';
  ctx.fillText('✦ ☽ ✦', 256, 410);
  ctx.restore();

  // Thai Name
  ctx.fillStyle = '#f8fafc';
  ctx.font = 'bold 30px Sarabun, sans-serif';
  ctx.fillText(cardData.nameTh, 256, 670);

  // Keywords
  ctx.fillStyle = '#c084fc';
  ctx.font = '21px Sarabun, sans-serif';
  ctx.fillText((cardData.keywords || '').slice(0, 36), 256, 720);

  return new THREE.CanvasTexture(canvas);
}

let activeDrawnCardSnapshots = [];

export function resetDrawnTarotCards() {
  if (activeDrawnCardSnapshots.length === 0) return;
  activeDrawnCardSnapshots.forEach(snap => {
    snap.mesh.position.set(snap.posX, snap.posY, snap.posZ);
    snap.mesh.rotation.set(snap.rotX, snap.rotY, snap.rotZ);
    if (snap.mesh.material && snap.mesh.material[3]) {
      snap.mesh.material[3].map = null;
      snap.mesh.material[3].needsUpdate = true;
    }
  });
  activeDrawnCardSnapshots = [];
  isDrawingTarot = false;
}

export function triggerTarotCardDrawAnimation(drawnCards, onComplete) {
  if (isDrawingTarot || !tarotDeckGroup) return;
  resetDrawnTarotCards();
  isDrawingTarot = true;

  const cardMeshes = tarotDeckGroup.children.filter(c => c !== tarotAura);
  const count = Math.min((drawnCards && drawnCards.length) || 1, 3);
  const activeCards = cardMeshes.slice(-count);

  if (activeCards.length === 0) {
    isDrawingTarot = false;
    if (onComplete) onComplete();
    return;
  }

  // Save initial transforms
  activeDrawnCardSnapshots = activeCards.map(c => ({
    mesh: c,
    posX: c.position.x,
    posY: c.position.y,
    posZ: c.position.z,
    rotX: c.rotation.x,
    rotY: c.rotation.y,
    rotZ: c.rotation.z
  }));

  // Realign the deck smoothly towards the camera / front
  let startDeckRotY = tarotDeckGroup.rotation.y % (Math.PI * 2);
  if (startDeckRotY > Math.PI) startDeckRotY -= Math.PI * 2;
  if (startDeckRotY < -Math.PI) startDeckRotY += Math.PI * 2;

  // Define target layouts based on card count (1 card or 3 cards)
  // Perfectly angled and elevated towards the camera (0, 4.2, 8.5)
  let targets = [];
  if (count === 1) {
    targets = [
      { x: 0, y: 1.68, z: 2.3, rotX: 0.38, rotY: 0, rotZ: Math.PI }
    ];
  } else {
    // 3 Cards spread across the altar: Left, Center, Right
    targets = [
      { x: -1.85, y: 1.55, z: 2.1, rotX: 0.35, rotY: 0.15, rotZ: Math.PI - 0.08 },
      { x: 0.0, y: 1.68, z: 2.3, rotX: 0.38, rotY: 0, rotZ: Math.PI },
      { x: 1.85, y: 1.55, z: 2.1, rotX: 0.35, rotY: -0.15, rotZ: Math.PI + 0.08 }
    ];
  }

  // Assign front face textures
  const textureLoader = new THREE.TextureLoader();
  activeCards.forEach((cardMesh, idx) => {
    if (drawnCards && drawnCards[idx]) {
      const cardInfo = drawnCards[idx];
      const tex = generateTarotCardTexture(cardInfo);
      const mat = new THREE.MeshStandardMaterial({
        map: tex,
        roughness: 0.45,
        metalness: 0.3
      });
      cardMesh.material[3] = mat;

      if (cardInfo.image) {
        textureLoader.load(
          cardInfo.image,
          (imgTex) => {
            imgTex.colorSpace = THREE.SRGBColorSpace;
            mat.map = imgTex;
            mat.needsUpdate = true;
          },
          undefined,
          () => {
            // Keep procedural canvas texture if image not yet found
          }
        );
      }
    }
  });

  let progress = 0;
  const drawInterval = setInterval(() => {
    progress += 0.04;
    const ease = Math.sin(progress * Math.PI * 0.5);

    // Smoothly re-orient deck toward the user's camera
    if (tarotDeckGroup) {
      tarotDeckGroup.rotation.y = startDeckRotY * (1 - ease);
    }

    activeCards.forEach((c, idx) => {
      const orig = activeDrawnCardSnapshots[idx];
      const tgt = targets[idx];
      c.position.x = orig.posX + (tgt.x - orig.posX) * ease;
      c.position.y = orig.posY + (tgt.y - orig.posY) * ease;
      c.position.z = orig.posZ + (tgt.z - orig.posZ) * ease;

      c.rotation.x = orig.rotX + (tgt.rotX - orig.rotX) * ease;
      c.rotation.y = orig.rotY + (tgt.rotY - orig.rotY) * ease;
      c.rotation.z = orig.rotZ + (tgt.rotZ - orig.rotZ) * ease;
    });

    if (progress >= 1.0) {
      clearInterval(drawInterval);
      if (tarotDeckGroup) tarotDeckGroup.rotation.y = 0;
      setTimeout(() => {
        isDrawingTarot = false;
        if (onComplete) onComplete();
      }, 350);
    }
  }, 25);
}

