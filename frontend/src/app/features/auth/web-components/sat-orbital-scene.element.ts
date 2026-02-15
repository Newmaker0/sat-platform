import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass';

class SatOrbitalSceneElement extends HTMLElement {
  static readonly template = document.createElement('template');
  private static readonly ringDefaultNormal = new THREE.Vector3(0, 0, 1);

  private sceneContainer?: HTMLDivElement;

  private animationId = 0;
  private isRenderLoopActive = false;
  private resizeObserver?: ResizeObserver;

  private scene?: THREE.Scene;
  private camera?: THREE.PerspectiveCamera;
  private renderer?: THREE.WebGLRenderer;
  private composer?: EffectComposer;
  private bloomPass?: UnrealBloomPass;

  private clock = new THREE.Clock();
  private elapsedSeconds = 0;
  private reduceMotion = false;
  private readonly reducedMotionFps = 18;
  private lastReducedMotionFrameTime = 0;

  private planet?: THREE.Mesh;
  private globeDots?: THREE.Points;
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
  private ownedTextures: THREE.Texture[] = [];
  private lastSignalAt = 0;
  private hasEmittedReady = false;

  private signalArcs: Array<{
    line: THREE.Line;
    material: THREE.LineBasicMaterial;
    pointCount: number;
    headProgress: number;
    trailLength: number;
    speed: number;
    targetNormal: THREE.Vector3;
    landed: boolean;
  }> = [];
  private pulseRings: Array<{ ring: THREE.Mesh; life: number; surfaceNormal: THREE.Vector3 }> = [];

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
    this.hasEmittedReady = false;

    this.initScene();
    this.observeResize();
    this.startRenderLoop();
    document.addEventListener('visibilitychange', this.handleVisibilityChange);
  }

  disconnectedCallback(): void {
    this.stopRenderLoop();

    this.resizeObserver?.disconnect();
    window.removeEventListener('resize', this.updateViewport);
    document.removeEventListener('visibilitychange', this.handleVisibilityChange);

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
    this.atmosphere = undefined;
    this.satellite = undefined;
    this.trailPositions = undefined;
    this.trailGeometry = undefined;
    this.signalArcs = [];
    this.pulseRings = [];
    this.lastSignalAt = 0;
    this.hasEmittedReady = false;
    this.ownedTextures.forEach((texture) => texture.dispose());
    this.ownedTextures = [];
    this.elapsedSeconds = 0;
    this.lastReducedMotionFrameTime = 0;
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
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, this.reduceMotion ? 1 : 1.3));
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setClearColor(0x020617, 1);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.02;
    container.appendChild(renderer.domElement);

    let composer: EffectComposer | undefined;
    let bloomPass: UnrealBloomPass | undefined;

    if (!this.reduceMotion) {
      composer = new EffectComposer(renderer);
      composer.addPass(new RenderPass(scene, camera));

      bloomPass = new UnrealBloomPass(
        new THREE.Vector2(container.clientWidth, container.clientHeight),
        0.22,
        0.9,
        0.25
      );
      composer.addPass(bloomPass);
    }

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
    const surfaceMap = this.createSurfaceTexture();

    const planet = new THREE.Mesh(
      new THREE.SphereGeometry(this.planetRadius, 48, 48),
      new THREE.MeshStandardMaterial({
        map: surfaceMap,
        color: 0x1d4da8,
        roughness: 0.9,
        metalness: 0.02,
        emissive: 0x0b163a,
        emissiveIntensity: 0.24
      })
    );

    const atmosphere = new THREE.Mesh(
      new THREE.SphereGeometry(this.planetRadius * 1.07, 48, 48),
      new THREE.MeshBasicMaterial({
        color: 0x3b82f6,
        transparent: true,
        opacity: 0.07,
        side: THREE.BackSide,
        depthWrite: false
      })
    );

    scene.add(planet, atmosphere);

    this.planet = planet;
    this.atmosphere = atmosphere;
    this.loadEarthWaterTexture();
  }

  private createSurfaceTexture(): THREE.CanvasTexture {
    const width = 1024;
    const height = 512;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext('2d');
    if (!context) {
      const fallback = new THREE.CanvasTexture(canvas);
      fallback.colorSpace = THREE.SRGBColorSpace;
      return fallback;
    }

    const oceanGradient = context.createLinearGradient(0, 0, 0, height);
    oceanGradient.addColorStop(0, '#173a9f');
    oceanGradient.addColorStop(0.45, '#1f4acc');
    oceanGradient.addColorStop(1, '#0e2465');
    context.fillStyle = oceanGradient;
    context.fillRect(0, 0, width, height);

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    this.ownedTextures.push(texture);
    return texture;
  }

  private loadEarthWaterTexture(): void {
    const loader = new THREE.TextureLoader();
    loader.load(
      '/assets/Earth_Water.webp',
      (texture) => {
        if (!this.planet || !this.scene) {
          texture.dispose();
          return;
        }

        texture.colorSpace = THREE.SRGBColorSpace;
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.ClampToEdgeWrapping;
        this.ownedTextures.push(texture);

        const planetMaterial = this.planet.material as THREE.MeshStandardMaterial;
        planetMaterial.map = texture;
        planetMaterial.needsUpdate = true;

        const image = texture.image as TexImageSource | undefined;
        if (image) {
          this.setupStripeDotsLayer(image);
        }
      },
      undefined,
      (error) => {
        // Keep fallback generated texture if the asset is unavailable.
        console.warn('Falha ao carregar /assets/Earth_Water.webp', error);
      }
    );
  }

  private setupStripeDotsLayer(image: TexImageSource): void {
    if (!this.scene) {
      return;
    }

    const imageData = this.extractImageData(image);
    if (!imageData) {
      return;
    }

    if (this.globeDots) {
      this.scene.remove(this.globeDots);
      this.globeDots.geometry.dispose();
      (this.globeDots.material as THREE.Material).dispose();
    }

    const sphereGeometry = new THREE.SphereGeometry(this.planetRadius * 1.012, 220, 140);
    const spherePositions = sphereGeometry.getAttribute('position');
    const sphereUvs = sphereGeometry.getAttribute('uv');

    const positions: number[] = [];
    const random = this.seededRandom(22031991);

    for (let i = 0; i < spherePositions.count; i += 1) {
      const u = sphereUvs.getX(i);
      const v = sphereUvs.getY(i);
      const maskStrength = this.sampleMask(imageData, u, v);

      if (maskStrength < 0.45) {
        continue;
      }

      if (random() < 0.14) {
        continue;
      }

      positions.push(spherePositions.getX(i), spherePositions.getY(i), spherePositions.getZ(i));
    }

    sphereGeometry.dispose();

    const dotsGeometry = new THREE.BufferGeometry();
    dotsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));

    const dotsMaterial = new THREE.PointsMaterial({
      color: 0x3ea3ff,
      size: 0.013,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.9,
      depthWrite: false,
      blending: THREE.NormalBlending
    });

    this.globeDots = new THREE.Points(dotsGeometry, dotsMaterial);
    if (this.planet) {
      this.globeDots.rotation.copy(this.planet.rotation);
    }
    this.scene.add(this.globeDots);
  }

  private extractImageData(source: TexImageSource): ImageData | null {
    const width = (source as { width?: number }).width ?? 0;
    const height = (source as { height?: number }).height ?? 0;
    if (!width || !height) {
      return null;
    }

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext('2d');
    if (!context) {
      return null;
    }

    context.drawImage(source as CanvasImageSource, 0, 0, width, height);
    return context.getImageData(0, 0, width, height);
  }

  private sampleMask(imageData: ImageData, u: number, v: number): number {
    // Sample away from texture borders to avoid UV seam artifacts (vertical line over the Pacific).
    const safeU = Math.min(0.999, Math.max(0.001, u));
    const safeV = Math.min(0.999, Math.max(0.001, v));
    const x = Math.floor(safeU * (imageData.width - 2)) + 1;
    const y = Math.floor((1 - safeV) * (imageData.height - 2)) + 1;
    const index = (y * imageData.width + x) * 4;

    const red = imageData.data[index] ?? 0;
    const green = imageData.data[index + 1] ?? 0;
    const blue = imageData.data[index + 2] ?? 0;
    const alpha = (imageData.data[index + 3] ?? 0) / 255;

    const luminance = (0.2126 * red + 0.7152 * green + 0.0722 * blue) / 255;
    const alphaLand = 1 - alpha;
    const darkLand = Math.max(0, (0.4 - luminance) / 0.4);

    return Math.max(alphaLand, darkLand);
  }

  private seededRandom(seed: number): () => number {
    let current = seed >>> 0;
    return () => {
      current = (1664525 * current + 1013904223) >>> 0;
      return current / 4294967296;
    };
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
    if (!this.sceneContainer || !this.camera || !this.renderer) {
      return;
    }

    const width = Math.max(this.sceneContainer.clientWidth, 1);
    const height = Math.max(this.sceneContainer.clientHeight, 1);

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(width, height);
    this.composer?.setSize(width, height);
    this.bloomPass?.setSize(width, height);
  };

  private readonly handleVisibilityChange = (): void => {
    if (document.hidden) {
      this.stopRenderLoop();
      return;
    }

    this.startRenderLoop();
  };

  private startRenderLoop(): void {
    if (this.isRenderLoopActive) {
      return;
    }

    this.isRenderLoopActive = true;
    this.clock.start();
    this.animationId = requestAnimationFrame(this.renderLoop);
  }

  private stopRenderLoop(): void {
    this.isRenderLoopActive = false;

    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = 0;
    }

    this.clock.stop();
  }

  private readonly renderLoop = (timestamp: number): void => {
    if (!this.isRenderLoopActive) {
      return;
    }

    this.animationId = requestAnimationFrame(this.renderLoop);

    if (!this.scene || !this.camera || !this.renderer || !this.satellite) {
      return;
    }

    if (this.reduceMotion) {
      const minFrameTime = 1000 / this.reducedMotionFps;
      if (timestamp - this.lastReducedMotionFrameTime < minFrameTime) {
        return;
      }
      this.lastReducedMotionFrameTime = timestamp;
    }

    const rawDelta = this.clock.getDelta();
    const delta = Math.min(rawDelta, 0.05);
    this.elapsedSeconds += delta;
    const elapsed = this.elapsedSeconds;

    this.updateSatellite(elapsed);

    if (!this.reduceMotion && this.planet && this.atmosphere) {
      this.planet.rotation.y += 0.0012;
      if (this.globeDots) {
        this.globeDots.rotation.y += 0.0012;
      }
      this.atmosphere.rotation.y += 0.0007;

      if (elapsed - this.lastSignalAt >= this.signalInterval) {
        this.lastSignalAt = elapsed;
        this.emitSignal();
      }

      this.updateSignals(delta);
    }

    if (this.composer) {
      this.composer.render();
    } else {
      this.renderer.render(this.scene, this.camera);
    }

    if (!this.hasEmittedReady) {
      this.hasEmittedReady = true;
      this.dispatchEvent(new CustomEvent('orbitalready', { bubbles: true, composed: true }));
    }
  };

  private updateSatellite(elapsed: number): void {
    if (!this.satellite || !this.trailPositions || !this.trailGeometry) {
      return;
    }

    const angle = elapsed * this.orbitSpeed;
    const phase = angle + Math.sin(elapsed * 0.21) * 0.24;
    const radialWobble = Math.sin(elapsed * 0.63) * 0.22 + Math.sin(elapsed * 1.18 + 1.3) * 0.08;
    const localA = this.orbitA + radialWobble;
    const localB = this.orbitB + radialWobble * 0.72;
    const yOrbit = localB * Math.sin(phase);
    const dynamicTilt = this.orbitTilt + Math.sin(elapsed * 0.31) * 0.1;
    const x = localA * Math.cos(phase);
    const y = yOrbit * Math.cos(dynamicTilt);
    const z = yOrbit * Math.sin(dynamicTilt) + Math.sin(elapsed * 0.57) * 0.16;

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
      .clone()
      .multiplyScalar(0.56)
      .add(camDirection.multiplyScalar(0.44))
      .normalize();
    const end = blendedDirection.multiplyScalar(this.planetRadius);
    const mid = start.clone().add(end).multiplyScalar(0.5);
    const lateralAxis = new THREE.Vector3().crossVectors(start, end);
    if (lateralAxis.lengthSq() < 1e-5) {
      lateralAxis.set(0, 1, 0);
    } else {
      lateralAxis.normalize();
    }
    const control = mid
      .clone()
      .normalize()
      .multiplyScalar(this.planetRadius + 2.25)
      .add(lateralAxis.multiplyScalar(0.34));

    const curve = new THREE.QuadraticBezierCurve3(start, control, end);
    const points = curve.getPoints(84);
    const geometry = new THREE.BufferGeometry().setFromPoints(points);

    const material = new THREE.LineBasicMaterial({
      color: this.signalColor,
      transparent: true,
      opacity: 0.8,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });

    const line = new THREE.Line(geometry, material);
    geometry.setDrawRange(0, 0);
    this.scene.add(line);

    this.signalArcs.push({
      line,
      material,
      pointCount: points.length,
      headProgress: 0,
      trailLength: 0.16,
      speed: 1.2,
      targetNormal: end.clone().normalize(),
      landed: false
    });
    if (this.signalArcs.length > 7) {
      const arc = this.signalArcs.shift();
      if (arc) {
        this.disposeSignalArc(arc);
      }
    }
  }

  private updateSignals(delta: number): void {
    if (!this.scene) {
      return;
    }

    for (let i = this.signalArcs.length - 1; i >= 0; i -= 1) {
      const arc = this.signalArcs[i];
      arc.headProgress += delta * arc.speed;

      const head = Math.min(arc.headProgress, 1);
      const tail = Math.max(0, head - arc.trailLength);
      const startIndex = Math.floor(tail * (arc.pointCount - 1));
      const endIndex = Math.floor(head * (arc.pointCount - 1));
      const drawCount = Math.max(0, endIndex - startIndex + 1);

      const lineGeometry = arc.line.geometry as THREE.BufferGeometry;
      lineGeometry.setDrawRange(startIndex, drawCount);

      if (!arc.landed && head >= 1) {
        arc.landed = true;
        this.spawnSurfacePing(arc.targetNormal);
      }

      if (arc.headProgress <= 1) {
        arc.material.opacity = 0.35 + head * 0.55;
      } else {
        const fade = Math.max(0, 1 - (arc.headProgress - 1) / 0.24);
        arc.material.opacity = fade * 0.68;
      }

      if (arc.headProgress >= 1.24) {
        this.signalArcs.splice(i, 1);
        this.disposeSignalArc(arc);
      }
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
      pulse.ring.position.copy(pulse.surfaceNormal).multiplyScalar(this.planetRadius * 1.014);
    }
  }

  private spawnSurfacePing(surfaceNormal: THREE.Vector3): void {
    if (!this.scene) {
      return;
    }

    const ring = new THREE.Mesh(
      new THREE.RingGeometry(0.05, 0.072, 48),
      new THREE.MeshBasicMaterial({
        color: this.signalColor,
        transparent: true,
        opacity: 0.72,
        side: THREE.DoubleSide,
        depthWrite: false,
        blending: THREE.AdditiveBlending
      })
    );

    ring.position.copy(surfaceNormal).multiplyScalar(this.planetRadius * 1.014);
    ring.quaternion.setFromUnitVectors(SatOrbitalSceneElement.ringDefaultNormal, surfaceNormal);

    this.scene.add(ring);
    this.pulseRings.push({ ring, life: 1, surfaceNormal: surfaceNormal.clone() });

    if (this.pulseRings.length > 14) {
      const pulse = this.pulseRings.shift();
      if (pulse) {
        this.disposePulseRing(pulse);
      }
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

  private disposeSignalArc(arc: {
    line: THREE.Line;
    material: THREE.LineBasicMaterial;
    pointCount: number;
    headProgress: number;
    trailLength: number;
    speed: number;
    targetNormal: THREE.Vector3;
    landed: boolean;
  }): void {
    this.scene?.remove(arc.line);
    arc.line.geometry.dispose();
    (arc.line.material as THREE.Material).dispose();
  }

  private disposePulseRing(pulse: {
    ring: THREE.Mesh;
    life: number;
    surfaceNormal: THREE.Vector3;
  }): void {
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
