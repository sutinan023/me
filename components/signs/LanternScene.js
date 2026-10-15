"use client";
import { useEffect, useRef, useState } from "react";
import SignArtwork from "./SignArtwork";
import { getSignAsset } from "@/data/personalSigns";
import { getSignRegions } from "@/data/signExplodedLayouts";

// Match the CSS contours in the fallback, including holes in closed frames.
function regionShader(region, name) {
  if (!region.points) {
    const b = region.b.map(n => n.toFixed(6));
    return { declaration: "", test: `(vUv.x>=${b[0]}&&vUv.x<=${b[2]}&&vUv.y>=${b[1]}&&vUv.y<=${b[3]})` };
  }
  function polygon(points, suffix) {
    const uv = points.map(([x,y]) => [x, 1-y]);
    const crossings = uv.flatMap((a,i) => {
      const b = uv[(i+1)%uv.length];
      if (a[1] === b[1]) return [];
      const [ax,ay,bx,by] = [...a,...b].map(n => n.toFixed(6));
      return [`if((${ay}>p.y)!=(${by}>p.y)){if(p.x<(${bx}-${ax})*(p.y-${ay})/(${by}-${ay})+${ax})inside=!inside;}`];
    }).join("");
    return `bool ${name}${suffix}(vec2 p){bool inside=false;${crossings}return inside;}`;
  }
  const holes = region.holes || [];
  const exclusions = (region.exclude || []).map((r,i)=>regionShader(r,`${name}exclude${i}`));
  return {
    declaration: polygon(region.points,"outer") + holes.map((h,i)=>polygon(h,`hole${i}`)).join("") +
      exclusions.map(r=>r.declaration).join("") +
      `bool ${name}(vec2 p){return ${name}outer(p)${holes.map((_,i)=>`&&!${name}hole${i}(p)`).join("")}${exclusions.map(r=>`&&!${r.test.replaceAll("vUv","p")}`).join("")};}`,
    test: `${name}(vUv)`,
  };
}

export default function LanternScene({ type = "ISFJ", exploded, step, motion }) {
  const host = useRef(null),
    latest = useRef({ exploded, step, motion }),
    sync = useRef(null),
    [ready, setReady] = useState(false);
  useEffect(() => {
    latest.current = { exploded, step, motion };
    sync.current?.();
  }, [exploded, step, motion]);
  useEffect(() => {
    setReady(false);
    const regions = getSignRegions(type);
    let cancelled = false,
      renderer,
      observer,
      group,
      camera,
      scene,
      textures = [],
      meshes = [],
      loop,
      pointerX = 0,
      pointerY = 0;
    const element = host.current;
    const pointer = (e) => {
      const r = element.getBoundingClientRect();
      pointerX = ((e.clientX - r.left) / r.width - 0.5) * 0.12;
      pointerY = ((e.clientY - r.top) / r.height - 0.5) * 0.08;
    };
    const leave = () => {
      pointerX = 0;
      pointerY = 0;
    };
    const visibility = () => {
      if (renderer)
        renderer.setAnimationLoop(
          !document.hidden && latest.current.motion ? loop : null,
        );
    };
    async function setup() {
      try {
        const T = await import("three");
        if (cancelled) return;
        renderer = new T.WebGLRenderer({ alpha: true, antialias: true });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setClearColor(0, 0);
        element.append(renderer.domElement);
        renderer.domElement.setAttribute("aria-hidden", "true");
        scene = new T.Scene();
        camera = new T.PerspectiveCamera(32, 1, 0.1, 100);
        group = new T.Group();
        scene.add(group);
        const loaded = await Promise.allSettled(
          [getSignAsset(type), getSignAsset(type, true)].map((p) =>
            new T.TextureLoader().loadAsync(p),
          ),
        );
        textures = loaded
          .filter((r) => r.status === "fulfilled")
          .map((r) => r.value);
        if (cancelled) {
          textures.forEach((t) => t.dispose());
          return;
        }
        if (loaded.some((r) => r.status === "rejected"))
          throw new Error("Artwork could not load");
        textures.forEach((t) => {
          t.colorSpace = T.NoColorSpace;
          t.minFilter = T.LinearFilter;
        });
        const vertex = `varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`;
        const fragment = `uniform sampler2D art;uniform float opacity;uniform vec4 bounds;varying vec2 vUv;void main(){if(vUv.x<bounds.x||vUv.y<bounds.y||vUv.x>bounds.z||vUv.y>bounds.w)discard;vec4 c=texture2D(art,vUv);gl_FragColor=vec4(c.rgb,c.a*opacity);}`;
        function plane(texture, bounds, opacity, frag = fragment) {
          const m = new T.Mesh(
            new T.PlaneGeometry(3.6, 3.6),
            new T.ShaderMaterial({
              uniforms: {
                art: { value: texture },
                opacity: { value: opacity },
                bounds: { value: new T.Vector4(...bounds) },
              },
              vertexShader: vertex,
              fragmentShader: frag,
              transparent: true,
              depthWrite: false,
            }),
          );
          group.add(m);
          meshes.push(m);
          return m;
        }
        const full = plane(textures[0], [0, 0, 1, 1], 1),
          pieces = regions.map((s, i) => {
            const mask = regionShader(s, `region${i}`);
            const maskedFragment = fragment.replace("void main()", `${mask.declaration}void main()`)
              .replace("vec4 c=texture2D", `if(!${mask.test})discard;vec4 c=texture2D`);
            return { ...s, mesh: plane(textures[1], s.b, 0, maskedFragment) };
          });
        const masks = regions.map((s, i) => regionShader(s, `region${i}`));
        const exclude = `if(${masks.map(m => m.test).join("||")})discard;`;
        const decor = plane(
          textures[1],
          [0, 0, 1, 1],
          0,
          fragment.replace("void main()", `${masks.map(m => m.declaration).join("")}void main()`)
            .replace("vec4 c=texture2D", exclude + "vec4 c=texture2D"),
        );
        let blend = 0,
          last = performance.now();
        loop = (now) => {
          const dt = Math.min((now - last) / 1000, 0.08);
          last = now;
          const state = latest.current,
            target = state.exploded ? 1 : 0;
          blend = state.motion
            ? T.MathUtils.damp(blend, target, 5, dt)
            : target;
          full.material.uniforms.opacity.value = 1 - blend;
          decor.material.uniforms.opacity.value =
            blend * (state.step >= 0 && state.step < 4 ? 0.24 : 1);
          pieces.forEach((s, i) => {
            const active =
              state.step < 0 || state.step >= 4 || s.part === state.step;
            s.mesh.material.uniforms.opacity.value =
              blend * (active ? 1 : 0.24);
            s.mesh.position.set(
              s.dx * (1 - blend),
              s.dy * (1 - blend) +
                (type === "ISFJ" && state.motion && active
                  ? Math.sin(now * 0.0007 + i) * 0.006
                  : 0),
              s.z * blend,
            );
          });
          group.rotation.y = state.motion
            ? T.MathUtils.damp(group.rotation.y, pointerX, 5, dt)
            : 0;
          group.rotation.x = state.motion
            ? T.MathUtils.damp(group.rotation.x, pointerY, 5, dt)
            : 0;
          renderer.render(scene, camera);
        };
        const resize = () => {
          if (cancelled) return;
          const w = element.clientWidth,
            h = element.clientHeight;
          if (!w || !h) return;
          renderer.setSize(w, h, false);
          camera.aspect = w / h;
          const distance = type === "ISFJ" ? 5.9 : 6.8;
          camera.position.z = camera.aspect < 1 ? distance / camera.aspect : distance;
          camera.updateProjectionMatrix();
          loop(performance.now());
        };
        observer = new ResizeObserver(resize);
        observer.observe(element);
        resize();
        element.addEventListener("pointermove", pointer);
        element.addEventListener("pointerleave", leave);
        document.addEventListener("visibilitychange", visibility);
        sync.current = () => {
          if (cancelled) return;
          loop(performance.now());
          visibility();
        };
        sync.current();
        setReady(true);
      } catch {
        renderer?.setAnimationLoop(null);
        renderer?.domElement.remove();
        if (!cancelled) setReady(false);
      }
    }
    setup();
    return () => {
      cancelled = true;
      sync.current = null;
      observer?.disconnect();
      element.removeEventListener("pointermove", pointer);
      element.removeEventListener("pointerleave", leave);
      document.removeEventListener("visibilitychange", visibility);
      renderer?.setAnimationLoop(null);
      meshes.forEach((m) => {
        m.geometry.dispose();
        m.material.dispose();
      });
      textures.forEach((t) => t.dispose());
      renderer?.dispose();
      renderer?.domElement.remove();
    };
  }, [type]);
  return (
    <div
      ref={host}
      className="lantern-scene"
      role="img"
      aria-label={`Personal Sign ${type} ${exploded ? "แยกชิ้นส่วน" : "ประกอบสมบูรณ์"}`}
      data-view={exploded ? "exploded" : "assembled"}
      data-active-part={step >= 0 && step < 4 ? step : "all"}
    >
      {!ready && <SignArtwork type={type} exploded={exploded} activePart={step} size={400} />}
    </div>
  );
}
