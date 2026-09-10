import { useEffect, useRef } from "react";
import * as THREE from "three";

// Hero centrepiece: a 3D network of a client's systems (the nodes — CRM, ERP,
// inbox, documents…) connected through a central AI core (the XEDA orbit mark,
// in 3D). It says what we do — integrate AI into the tools you already run —
// rather than decorating the page with a generic object.
//
// Motion, all deliberately restrained for a conservative B2B audience:
//  - Burst → assemble on load: nodes fly in from a scattered cloud and lock into
//    the network. Scrolling away re-bursts them (a controlled scatter, not
//    fireworks), then they reassemble on the way back.
//  - Mouse parallax with depth: the whole network tilts toward the cursor, and
//    nearer nodes drift further than distant ones, so the layering reads as real.
//  - Scroll parallax: the network drifts up slower than the page (vertical) with
//    a slight horizontal offset, like the existing useParallax hero background.
//
// Performance: rAF loop runs only while the hero is on screen and the tab is
// visible; pixel ratio is capped; node count drops on small screens; everything
// is disposed on unmount. prefers-reduced-motion renders one static, assembled
// frame and never animates. Purely decorative (aria-hidden).

const NEAR_WHITE = 0xf2f3f5; // hsl(220 8% 96%), the hero's fixed foreground
const RING_R = 1.0;

function makeDotTexture(): THREE.Texture {
  const size = 64;
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const ctx = c.getContext("2d")!;
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0, "rgba(255,255,255,1)");
  g.addColorStop(0.3, "rgba(255,255,255,0.85)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

const easeOutCubic = (x: number) => 1 - Math.pow(1 - x, 3);
const clamp01 = (x: number) => Math.min(1, Math.max(0, x));

interface NetworkSceneProps {
  className?: string;
}

const NetworkScene = ({ className }: NetworkSceneProps) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    const small = window.innerWidth < 768;

    // --- renderer / scene / camera -------------------------------------------
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, small ? 1.25 : 1.5));
    renderer.setClearColor(0x000000, 0);
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(48, 1, 0.1, 100);
    // Pulled back a little so the network reads as atmosphere around the
    // headline rather than competing with it.
    camera.position.set(0, 0, 14.5);

    const group = new THREE.Group();
    scene.add(group);

    // --- node layout ----------------------------------------------------------
    // Index 0 is the AI core at the origin; the rest are a client's systems in a
    // loose, wide-screen-friendly ellipsoid. `home` is the assembled network,
    // `burst` the scattered cloud they fly in from / out to.
    const N = small ? 64 : 132;
    const home = new Float32Array(N * 3);
    const burst = new Float32Array(N * 3);
    const cur = new Float32Array(N * 3);
    for (let i = 1; i < N; i++) {
      const theta = 2 * Math.PI * Math.random();
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 2.2 + Math.pow(Math.random(), 0.7) * 4.2;
      const dx = Math.sin(phi) * Math.cos(theta);
      const dy = Math.sin(phi) * Math.sin(theta);
      const dz = Math.cos(phi);
      home[i * 3] = dx * r * 1.35;
      home[i * 3 + 1] = dy * r * 0.72;
      home[i * 3 + 2] = dz * r * 0.9;
      const br = r * 2.4 + Math.random() * 5;
      burst[i * 3] = dx * br * 1.6;
      burst[i * 3 + 1] = dy * br * 1.2;
      burst[i * 3 + 2] = dz * br * 1.3 - 2;
    }

    // Edges: each system links to its two nearest neighbours, and every fourth
    // one links straight into the core — the integration story in one graph.
    const edges: Array<[number, number]> = [];
    const seen = new Set<string>();
    const addEdge = (a: number, b: number) => {
      const key = a < b ? `${a}-${b}` : `${b}-${a}`;
      if (seen.has(key)) return;
      seen.add(key);
      edges.push([a, b]);
    };
    for (let i = 1; i < N; i++) {
      const dists: Array<[number, number]> = [];
      for (let j = 1; j < N; j++) {
        if (i === j) continue;
        const dx = home[i * 3] - home[j * 3];
        const dy = home[i * 3 + 1] - home[j * 3 + 1];
        const dz = home[i * 3 + 2] - home[j * 3 + 2];
        dists.push([dx * dx + dy * dy + dz * dz, j]);
      }
      dists.sort((a, b) => a[0] - b[0]);
      addEdge(i, dists[0][1]);
      addEdge(i, dists[1][1]);
      if (i % 4 === 0) addEdge(i, 0);
    }

    // --- geometry -------------------------------------------------------------
    const dotTex = makeDotTexture();

    const pointsGeo = new THREE.BufferGeometry();
    const posAttr = new THREE.BufferAttribute(cur, 3);
    posAttr.setUsage(THREE.DynamicDrawUsage);
    pointsGeo.setAttribute("position", posAttr);
    const pointsMat = new THREE.PointsMaterial({
      map: dotTex,
      color: NEAR_WHITE,
      size: small ? 0.2 : 0.17,
      transparent: true,
      opacity: 0.78,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true,
    });
    const points = new THREE.Points(pointsGeo, pointsMat);
    group.add(points);

    const linePos = new Float32Array(edges.length * 2 * 3);
    const linesGeo = new THREE.BufferGeometry();
    const lineAttr = new THREE.BufferAttribute(linePos, 3);
    lineAttr.setUsage(THREE.DynamicDrawUsage);
    linesGeo.setAttribute("position", lineAttr);
    const lineMat = new THREE.LineBasicMaterial({
      color: NEAR_WHITE,
      transparent: true,
      opacity: 0.14,
      depthWrite: false,
    });
    const lines = new THREE.LineSegments(linesGeo, lineMat);
    group.add(lines);

    // The core: the XEDA mark in 3D — a bright centre, a tilted ring, and a dot
    // orbiting it, exactly as on the logo.
    const coreGeo = new THREE.SphereGeometry(0.16, 24, 24);
    const coreMat = new THREE.MeshBasicMaterial({ color: NEAR_WHITE });
    const core = new THREE.Mesh(coreGeo, coreMat);
    group.add(core);

    const ringGeo = new THREE.TorusGeometry(RING_R, 0.014, 12, 96);
    // Soft enough that it never fights the headline it sits behind.
    const ringMat = new THREE.MeshBasicMaterial({ color: NEAR_WHITE, transparent: true, opacity: 0.32 });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = 1.15;
    ring.rotation.z = 0.35;
    // On narrow screens the core sits behind the body copy, so keep it smaller
    // there (the orbiting dot is a child, so it scales with the ring).
    ring.scale.setScalar(small ? 0.72 : 1);
    group.add(ring);

    const orbitGeo = new THREE.SphereGeometry(0.075, 16, 16);
    const orbitMat = new THREE.MeshBasicMaterial({ color: NEAR_WHITE });
    const orbitDot = new THREE.Mesh(orbitGeo, orbitMat);
    ring.add(orbitDot);

    // --- motion state ---------------------------------------------------------
    const INTRO_SECONDS = 1.9;
    let introT = reduced ? 1 : 0; // burst → assemble on load
    let scrollProg = 0; // 0 at top, 1 once the hero has scrolled past
    let effS = reduced ? 1 : 0; // smoothed effective assembly (0 burst … 1 home)
    let tRotX = 0, tRotY = 0, rotX = 0, rotY = 0;
    let tPanX = 0, tPanY = 0, panX = 0, panY = 0;
    let time = 0;
    let raf = 0;
    let visible = true;
    // Plain timestamp delta (THREE.Clock is deprecated). Reset on resume so time
    // spent paused off-screen never plays back as one giant jump.
    let last = performance.now();
    const delta = () => {
      const now = performance.now();
      const dt = (now - last) / 1000;
      last = now;
      return dt;
    };

    const heroEl = mount.closest("section") as HTMLElement | null;

    const writePositions = () => {
      for (let i = 0; i < N; i++) {
        const ix = i * 3;
        let x = burst[ix] + (home[ix] - burst[ix]) * effS;
        let y = burst[ix + 1] + (home[ix + 1] - burst[ix + 1]) * effS;
        const z = burst[ix + 2] + (home[ix + 2] - burst[ix + 2]) * effS;
        if (i > 0) {
          // Gentle idle drift so the assembled network never sits perfectly still.
          x += Math.sin(time * 0.6 + i) * 0.035;
          y += Math.cos(time * 0.5 + i * 1.3) * 0.035;
          // Depth-layered mouse parallax: nearer systems drift further.
          const depth = 0.55 + 0.45 * clamp01((home[ix + 2] + 6) / 12);
          x += panX * depth;
          y += panY * depth;
        }
        cur[ix] = x;
        cur[ix + 1] = y;
        cur[ix + 2] = z;
      }
      posAttr.needsUpdate = true;
      for (let e = 0; e < edges.length; e++) {
        const [a, b] = edges[e];
        const o = e * 6;
        linePos[o] = cur[a * 3];
        linePos[o + 1] = cur[a * 3 + 1];
        linePos[o + 2] = cur[a * 3 + 2];
        linePos[o + 3] = cur[b * 3];
        linePos[o + 4] = cur[b * 3 + 1];
        linePos[o + 5] = cur[b * 3 + 2];
      }
      lineAttr.needsUpdate = true;
    };

    const render = () => {
      group.rotation.x = rotX * 0.6;
      group.rotation.y = rotY + time * 0.04; // slow idle spin
      // Scroll parallax: drift up slower than the page, with a slight sideways lean.
      group.position.y = scrollProg * 2.2;
      group.position.x = scrollProg * 0.9;
      orbitDot.position.set(Math.cos(time * 1.1) * RING_R, 0, Math.sin(time * 1.1) * RING_R);
      lineMat.opacity = 0.05 + 0.11 * effS;
      renderer.render(scene, camera);
    };

    const active = () => visible && !document.hidden;

    const frame = () => {
      raf = 0;
      if (!active()) return;
      const dt = Math.min(delta(), 0.05);
      time += dt;
      if (introT < 1) introT = Math.min(1, introT + dt / INTRO_SECONDS);
      // Scrolling away re-bursts up to 85% — a controlled scatter, not a full reset.
      const target = easeOutCubic(introT) * (1 - scrollProg * 0.85);
      effS += (target - effS) * 0.08;
      rotX += (tRotX - rotX) * 0.06;
      rotY += (tRotY - rotY) * 0.06;
      panX += (tPanX - panX) * 0.06;
      panY += (tPanY - panY) * 0.06;
      writePositions();
      render();
      raf = requestAnimationFrame(frame);
    };

    const start = () => {
      if (reduced) return;
      if (!raf && active()) {
        last = performance.now(); // drop the time spent paused
        raf = requestAnimationFrame(frame);
      }
    };

    // --- input ----------------------------------------------------------------
    const onMove = (e: MouseEvent) => {
      const nx = (e.clientX / window.innerWidth - 0.5) * 2;
      const ny = (e.clientY / window.innerHeight - 0.5) * 2;
      tRotY = nx * 0.35;
      tRotX = -ny * 0.25;
      tPanX = nx * 0.6;
      tPanY = -ny * 0.4;
    };
    const onScroll = () => {
      const h = heroEl?.offsetHeight ?? window.innerHeight;
      scrollProg = clamp01(window.scrollY / (h * 0.85));
      start();
    };
    if (!reduced && !coarse) window.addEventListener("mousemove", onMove, { passive: true });
    if (!reduced) window.addEventListener("scroll", onScroll, { passive: true });

    // --- sizing / visibility --------------------------------------------------
    const resize = () => {
      const w = mount.clientWidth || 1;
      const h = mount.clientHeight || 1;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      if (reduced) {
        writePositions();
        render();
      }
    };
    const ro = new ResizeObserver(resize);
    ro.observe(mount);
    resize();

    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        start();
      },
      { threshold: 0 }
    );
    io.observe(mount);
    const onVisibility = () => start();
    document.addEventListener("visibilitychange", onVisibility);

    if (reduced) {
      // One static, fully assembled frame — no loop at all.
      writePositions();
      render();
    } else {
      start();
    }

    // --- teardown -------------------------------------------------------------
    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("visibilitychange", onVisibility);
      ro.disconnect();
      io.disconnect();
      pointsGeo.dispose();
      pointsMat.dispose();
      linesGeo.dispose();
      lineMat.dispose();
      coreGeo.dispose();
      coreMat.dispose();
      ringGeo.dispose();
      ringMat.dispose();
      orbitGeo.dispose();
      orbitMat.dispose();
      dotTex.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === mount) mount.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={mountRef} className={className} aria-hidden="true" />;
};

export default NetworkScene;
