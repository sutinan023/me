"use client";
import { useRef } from "react";
import SignArtwork from "./SignArtwork";
export default function IllustrationFloat({ type, motion }) {
  const frame = useRef(null);
  function tilt(e) {
    if (!motion) return;
    const r = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5,
      y = (e.clientY - r.top) / r.height - 0.5;
    frame.current.style.transform = `perspective(900px) rotateY(${x * 9}deg) rotateX(${-y * 7}deg)`;
  }
  function reset() {
    if (frame.current) frame.current.style.transform = "";
  }
  return (
    <div
      className="illustration-float"
      onPointerMove={tilt}
      onPointerLeave={reset}
    >
      <div
        ref={frame}
        className="illustration-tilt"
        style={{ transform: motion ? undefined : "none" }}
      >
        <div className={motion ? "illustration-breathe" : ""}>
          <SignArtwork type={type} size={400} />
        </div>
      </div>
    </div>
  );
}
