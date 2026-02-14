import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass';

class SatOrbitalSceneElement extends HTMLElement {
  static readonly template = document.createElement('template');
  private static readonly surfaceNormal = new THREE.Vector3();
  private static readonly ringDefaultNormal = new THREE.Vector3(0, 0, 1);

  private sceneContainer?: HTMLDivElement;

  private animationId = 0;
  private resizeObserver?: ResizeObserver;

  private scene?: THREE.Scene;
  private camera?: THREE.PerspectiveCamera;
  private renderer?: THREE.WebGLRenderer;
  private composer?: EffectComposer;
  private bloomPass?: UnrealBloomPass;

  private clock = new THREE.Clock();
  private reduceMotion = false;

  private planet?: THREE.Mesh;
  private clouds?: THREE.Mesh;
  private atmosphere?: THREE.Mesh;
  private satellite?: THREE.Group;
  private readonly planetRadius = 1.75;
  private readonly signalColor = 0x38bdf8;

  private readonly orbitA = 3.52;
  private readonly orbitB = 2.7;
  private readonly orbitTilt = Math.PI * 0.18;
  private readonly orbitSpeed = 0.33;
  private readonly trailLength = 140;
  private readonly signalInterval = 2.2;

  private trailPositions?: Float32Array;
  private trailGeometry?: THREE.BufferGeometry;
  private lastSignalAt = 0;

  private signalArcs: { line: THREE.Line; ring: THREE.Mesh; life: number }[] = [];
  private pulseRings: { ring: THREE.Mesh; life: number }[] = [];

  connectedCallback(): void {
    if (!this.shadowRoot) {
      this.attachShadow({ mode: 'open' });
    }

    if (!this.shadowRoot?.firstChild) {
      this.shadowRoot?.appendChild(SatOrbitalSceneElement.template.content.cloneNode(true));
    }

    this.sceneContainer =
      this.shadowRoot?.querySelector<HTMLDivElement>('[data-scene]') ?? undefined;

    if (!this.sceneContainer) {
      return;
    }

    this.reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    this.initScene();
    this.observeResize();
    this.renderLoop();
  }

  disconnectedCallback(): void {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }

    this.resizeObserver?.disconnect();
    window.removeEventListener('resize', this.updateViewport);

    this.clearSignals();

    if (this.scene) {
      this.scene.traverse((object) => {
        this.disposeRenderable(object);
      });
    }

    this.renderer?.dispose();
    this.renderer?.forceContextLoss();

    if (this.sceneContainer) {
      while (this.sceneContainer.firstChild) {
        this.sceneContainer.removeChild(this.sceneContainer.firstChild);
      }
    }

    this.scene = undefined;
    this.camera = undefined;
    this.renderer = undefined;
    this.composer = undefined;
    this.bloomPass = undefined;
    this.planet = undefined;
    this.clouds = undefined;
    this.atmosphere = undefined;
    this.satellite = undefined;
    this.trailPositions = undefined;
    this.trailGeometry = undefined;
    this.signalArcs = [];
    this.pulseRings = [];
    this.lastSignalAt = 0;
  }

  private initScene(): void {
    if (!this.sceneContainer) {
      return;
    }

    const container = this.sceneContainer;

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(
      50,
      container.clientWidth / container.clientHeight,
      0.1,
      120
    );
    camera.position.set(0.22, 0.1, 9.4);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.6));
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setClearColor(0x020617, 1);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.02;
    container.appendChild(renderer.domElement);

    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));

    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(container.clientWidth, container.clientHeight),
      0.22,
      0.9,
      0.25
    );
    composer.addPass(bloomPass);

    this.scene = scene;
    this.camera = camera;
    this.renderer = renderer;
    this.composer = composer;
    this.bloomPass = bloomPass;

    this.setupLights(scene);
    this.setupPlanetSystem(scene);
    this.setupOrbit(scene);
    this.setupTrail(scene);
  }

  private setupLights(scene: THREE.Scene): void {
    scene.add(new THREE.AmbientLight(0x3b4a6a, 0.55));

    const keyLight = new THREE.DirectionalLight(0x7aa8ff, 0.76);
    keyLight.position.set(5, 3, 4);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0x38bdf8, 0.17);
    fillLight.position.set(-6, -2, 4);
    scene.add(fillLight);
  }

  private setupPlanetSystem(scene: THREE.Scene): void {
    const loader = new THREE.TextureLoader();
    loader.setCrossOrigin('anonymous');

    const surfaceUrl = 'https://threejs.org/examples/textures/land_ocean_ice_cloud_2048.jpg';
    const cloudsUrl = 'https://threejs.org/examples/textures/earth_clouds_1024.png';

    const surfaceMap = loader.load(surfaceUrl);
    surfaceMap.colorSpace = THREE.SRGBColorSpace;

    const planet = new THREE.Mesh(
      new THREE.SphereGeometry(this.planetRadius, 64, 64),
      new THREE.MeshStandardMaterial({
        map: surfaceMap,
        color: 0x2746b6,
        roughness: 0.92,
        metalness: 0.02,
        emissive: 0x0b163a,
        emissiveIntensity: 0.28
      })
    );

    const cloudMap = loader.load(cloudsUrl);
    cloudMap.colorSpace = THREE.SRGBColorSpace;

    const clouds = new THREE.Mesh(
      new THREE.SphereGeometry(this.planetRadius * 1.012, 64, 64),
      new THREE.MeshLambertMaterial({
        map: cloudMap,
        transparent: true,
        opacity: 0.12,
        depthWrite: false
      })
    );

    const atmosphere = new THREE.Mesh(
      new THREE.SphereGeometry(this.planetRadius * 1.07, 64, 64),
      new THREE.MeshBasicMaterial({
        color: 0x3b82f6,
        transparent: true,
        opacity: 0.07,
        side: THREE.BackSide,
        depthWrite: false
      })
    );

    scene.add(planet, clouds, atmosphere);

    this.planet = planet;
    this.clouds = clouds;
    this.atmosphere = atmosphere;
  }

  private setupOrbit(scene: THREE.Scene): void {
    const satellite = new THREE.Group();

    const core = new THREE.Mesh(
      new THREE.BoxGeometry(0.12, 0.12, 0.12),
      new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 0.55, roughness: 0.32 })
    );

    const panelMaterial = new THREE.MeshBasicMaterial({
      color: 0x94a3b8,
      transparent: true,
      opacity: 0.62,
      depthWrite: false
    });

    const panelLeft = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.06, 0.02), panelMaterial);
    panelLeft.position.x = -0.36;

    const panelRight = panelLeft.clone();
    panelRight.position.x = 0.36;

    const antenna = new THREE.Mesh(
      new THREE.CylinderGeometry(0.01, 0.01, 0.16, 10),
      new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.55,
        depthWrite: false
      })
    );
    antenna.rotation.z = Math.PI / 2;
    antenna.position.set(0, 0.08, 0);

    satellite.add(core, panelLeft, panelRight, antenna);
    scene.add(satellite);

    this.satellite = satellite;
  }

  private setupTrail(scene: THREE.Scene): void {
    const trailPositions = new Float32Array(this.trailLength * 3);
    const trailColors = new Float32Array(this.trailLength * 3);

    const headColor = new THREE.Color(0x38bdf8);
    const tailColor = new THREE.Color(0x142044);

    for (let i = 0; i < this.trailLength; i += 1) {
      trailPositions[i * 3] = 9999;
      trailPositions[i * 3 + 1] = 9999;
      trailPositions[i * 3 + 2] = 9999;

      const factor = 1 - i / (this.trailLength - 1);
      const color = tailColor.clone().lerp(headColor, Math.pow(factor, 1.9));
      trailColors[i * 3] = color.r;
      trailColors[i * 3 + 1] = color.g;
      trailColors[i * 3 + 2] = color.b;
    }

    const trailGeometry = new THREE.BufferGeometry();
    trailGeometry.setAttribute('position', new THREE.BufferAttribute(trailPositions, 3));
    trailGeometry.setAttribute('color', new THREE.BufferAttribute(trailColors, 3));

    const trail = new THREE.Line(
      trailGeometry,
      new THREE.LineBasicMaterial({
        vertexColors: true,
        transparent: true,
        opacity: 0.45,
        depthWrite: false
      })
    );

    scene.add(trail);

    this.trailPositions = trailPositions;
    this.trailGeometry = trailGeometry;
  }

  private observeResize(): void {
    if (!this.sceneContainer) {
      return;
    }

    if (typeof ResizeObserver !== 'undefined') {
      this.resizeObserver = new ResizeObserver(() => {
        this.updateViewport();
      });

      this.resizeObserver.observe(this.sceneContainer);
      return;
    }

    window.addEventListener('resize', this.updateViewport);
  }

  private readonly updateViewport = (): void => {
    if (!this.sceneContainer || !this.camera || !this.renderer || !this.composer) {
      return;
    }

    const width = Math.max(this.sceneContainer.clientWidth, 1);
    const height = Math.max(this.sceneContainer.clientHeight, 1);

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(width, height);
    this.composer.setSize(width, height);
    this.bloomPass?.setSize(width, height);
  };

  private readonly renderLoop = (): void => {
    this.animationId = requestAnimationFrame(this.renderLoop);

    if (!this.scene || !this.camera || !this.renderer || !this.composer || !this.satellite) {
      return;
    }

    const delta = this.clock.getDelta();
    const elapsed = this.clock.elapsedTime;

    this.updateSatellite(elapsed);

    if (!this.reduceMotion && this.planet && this.clouds && this.atmosphere) {
      this.planet.rotation.y += 0.0012;
      this.clouds.rotation.y += 0.0016;
      this.atmosphere.rotation.y += 0.0007;

      if (elapsed - this.lastSignalAt >= this.signalInterval) {
        this.lastSignalAt = elapsed;
        this.emitSignal();
      }

      this.updateSignals(delta);
    }

    if (!this.reduceMotion && this.bloomPass) {
      this.bloomPass.strength = 0.2 + Math.sin(elapsed * 1.5) * 0.04;
    }

    this.composer.render();
  };

  private updateSatellite(elapsed: number): void {
    if (!this.satellite || !this.trailPositions || !this.trailGeometry) {
      return;
    }

    const angle = elapsed * this.orbitSpeed;
    const x = this.orbitA * Math.cos(angle);
    const yOrbit = this.orbitB * Math.sin(angle);

    const y = yOrbit * Math.cos(this.orbitTilt);
    const z = yOrbit * Math.sin(this.orbitTilt);

    this.satellite.position.set(x, y, z);
    this.satellite.lookAt(0, 0, 0);
    this.satellite.rotateY(Math.PI / 2);

    for (let i = this.trailLength - 1; i > 0; i -= 1) {
      this.trailPositions[i * 3] = this.trailPositions[(i - 1) * 3];
      this.trailPositions[i * 3 + 1] = this.trailPositions[(i - 1) * 3 + 1];
      this.trailPositions[i * 3 + 2] = this.trailPositions[(i - 1) * 3 + 2];
    }

    this.trailPositions[0] = x;
    this.trailPositions[1] = y;
    this.trailPositions[2] = z;

    this.trailGeometry.attributes['position'].needsUpdate = true;
  }

  private emitSignal(): void {
    if (!this.scene || !this.camera || !this.satellite) {
      return;
    }

    const start = this.satellite.position.clone();
    const camDirection = this.camera.position.clone().normalize();
    const satDirection = start.clone().normalize();
    const blendedDirection = satDirection
      .multiplyScalar(0.7)
      .add(camDirection.multiplyScalar(0.3))
      .normalize();

    const end = blendedDirection.multiplyScalar(this.planetRadius);
    const mid = start.clone().add(end).multiplyScalar(0.5);
    const control = mid
      .clone()
      .normalize()
      .multiplyScalar(this.planetRadius + 1.55);

    const curve = new THREE.QuadraticBezierCurve3(start, control, end);
    const points = curve.getPoints(90);
    const geometry = new THREE.BufferGeometry().setFromPoints(points);

    const material = new THREE.LineDashedMaterial({
      color: this.signalColor,
      transparent: true,
      opacity: 0.86,
      dashSize: 0.24,
      gapSize: 0.18,
      depthWrite: false
    });

    const line = new THREE.Line(geometry, material);
    line.computeLineDistances();
    this.scene.add(line);

    const ring = new THREE.Mesh(
      new THREE.RingGeometry(0.055, 0.088, 40),
      new THREE.MeshBasicMaterial({
        color: this.signalColor,
        transparent: true,
        opacity: 0.62,
        side: THREE.DoubleSide,
        depthWrite: false
      })
    );
    const surfaceNormal = SatOrbitalSceneElement.surfaceNormal.copy(end).normalize();
    ring.position.copy(surfaceNormal).multiplyScalar(this.planetRadius * 1.01);
    ring.quaternion.setFromUnitVectors(SatOrbitalSceneElement.ringDefaultNormal, surfaceNormal);
    this.scene.add(ring);

    this.signalArcs.push({ line, ring, life: 1 });
    if (this.signalArcs.length > 7) {
      const arc = this.signalArcs.shift();
      if (arc) {
        this.disposeSignalArc(arc);
      }
    }

    const pulseRing = new THREE.Mesh(
      new THREE.RingGeometry(0.05, 0.07, 48),
      new THREE.MeshBasicMaterial({
        color: this.signalColor,
        transparent: true,
        opacity: 0.7,
        side: THREE.DoubleSide,
        depthWrite: false
      })
    );
    pulseRing.position.copy(start);
    pulseRing.lookAt(this.camera.position);
    this.scene.add(pulseRing);
    this.pulseRings.push({ ring: pulseRing, life: 1 });
  }

  private updateSignals(delta: number): void {
    if (!this.scene || !this.camera || !this.satellite) {
      return;
    }

    for (let i = this.signalArcs.length - 1; i >= 0; i -= 1) {
      const arc = this.signalArcs[i];
      arc.life -= delta * 1.15;

      if (arc.life <= 0) {
        this.signalArcs.splice(i, 1);
        this.disposeSignalArc(arc);
        continue;
      }

      const lineMaterial = arc.line.material as THREE.LineDashedMaterial;
      lineMaterial.opacity = arc.life * 0.86;

      const ringMaterial = arc.ring.material as THREE.MeshBasicMaterial;
      ringMaterial.opacity = arc.life * 0.62;
      const ringScale = 1 + (1 - arc.life) * 0.65;
      arc.ring.scale.setScalar(ringScale);
    }

    for (let i = this.pulseRings.length - 1; i >= 0; i -= 1) {
      const pulse = this.pulseRings[i];
      pulse.life -= delta * 1.8;

      if (pulse.life <= 0) {
        this.pulseRings.splice(i, 1);
        this.disposePulseRing(pulse);
        continue;
      }

      const pulseMaterial = pulse.ring.material as THREE.MeshBasicMaterial;
      pulseMaterial.opacity = pulse.life * 0.7;
      pulse.ring.scale.setScalar(1 + (1 - pulse.life) * 4.5);
      pulse.ring.position.copy(this.satellite.position);
      pulse.ring.lookAt(this.camera.position);
    }
  }

  private clearSignals(): void {
    for (const arc of this.signalArcs) {
      this.disposeSignalArc(arc);
    }

    for (const pulse of this.pulseRings) {
      this.disposePulseRing(pulse);
    }
  }

  private disposeSignalArc(arc: { line: THREE.Line; ring: THREE.Mesh; life: number }): void {
    this.scene?.remove(arc.line);
    this.scene?.remove(arc.ring);
    arc.line.geometry.dispose();
    (arc.line.material as THREE.Material).dispose();
    arc.ring.geometry.dispose();
    (arc.ring.material as THREE.Material).dispose();
  }

  private disposePulseRing(pulse: { ring: THREE.Mesh; life: number }): void {
    this.scene?.remove(pulse.ring);
    pulse.ring.geometry.dispose();
    (pulse.ring.material as THREE.Material).dispose();
  }

  private disposeRenderable(object: THREE.Object3D): void {
    const geometry = (object as { geometry?: THREE.BufferGeometry }).geometry;
    if (geometry) {
      geometry.dispose();
    }

    const materialOrMaterials = (object as { material?: THREE.Material | THREE.Material[] })
      .material;
    if (!materialOrMaterials) {
      return;
    }

    if (Array.isArray(materialOrMaterials)) {
      materialOrMaterials.forEach((material) => material.dispose());
      return;
    }

    materialOrMaterials.dispose();
  }
}

SatOrbitalSceneElement.template.innerHTML = `
  <style>
    :host {
      position: absolute;
      inset: 0;
      display: block;
      overflow: hidden;
      contain: strict;
    }

    [data-scene] {
      position: absolute;
      inset: 0;
    }

    [data-overlay] {
      position: absolute;
      inset: 0;
      pointer-events: none;
      background:
        radial-gradient(760px 560px at 65% 45%, rgb(59 130 246 / 16%), transparent 60%),
        radial-gradient(660px 520px at 35% 55%, rgb(56 189 248 / 10%), transparent 62%),
        linear-gradient(to bottom, rgb(2 6 23 / 5%), rgb(2 6 23 / 42%));
    }

    [data-stars] {
      position: absolute;
      inset: 0;
      pointer-events: none;
      background-image:
        radial-gradient(circle at 14% 20%, rgb(226 232 240 / 30%) 0.09rem, transparent 0.11rem),
        radial-gradient(circle at 66% 22%, rgb(226 232 240 / 24%) 0.08rem, transparent 0.1rem),
        radial-gradient(circle at 82% 62%, rgb(226 232 240 / 18%) 0.1rem, transparent 0.12rem),
        radial-gradient(circle at 32% 74%, rgb(226 232 240 / 16%) 0.08rem, transparent 0.1rem);
    }
  </style>

  <div data-scene></div>
  <div data-stars></div>
  <div data-overlay></div>
`;

export function defineSatOrbitalSceneElement(): void {
  if (!customElements.get('sat-orbital-scene')) {
    customElements.define('sat-orbital-scene', SatOrbitalSceneElement);
  }
}
