"use client";
import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { getSignParts, SIGN_ILLUSTRATIONS } from "@/data/personalSigns";
const LanternScene = dynamic(() => import("./LanternScene"), { ssr: false });
export default function SignDiscovery({ type, onClose }) {
  const dialog = useRef(null),
    [step, setStep] = useState(-1),
    [exploded, setExploded] = useState(false),
    [motion, setMotion] = useState(false),
    [seen, setSeen] = useState([]);
  const parts = getSignParts(type),
    part = parts[step],
    complete = step === 4;
  useEffect(() => {
    const node = dialog.current;
    const previous = document.activeElement;
    node.showModal();
    const old = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    setMotion(!window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    return () => {
      document.body.style.overflow = old;
      node.close();
      previous?.focus();
    };
  }, []);
  function select(i) {
    setStep(i);
    setSeen((s) => (s.includes(i) ? s : [...s, i]));
    setExploded(true);
  }
  function finish() {
    setStep(4);
    setSeen([0, 1, 2, 3]);
    setExploded(false);
  }
  return (
    <dialog
      ref={dialog}
      className="sign-dialog"
      onCancel={onClose}
      onClick={(e) => {
        if (e.target === dialog.current) onClose();
      }}
      aria-labelledby="sign-title"
    >
      <button className="sign-close" onClick={onClose} aria-label="ปิดการค้นพบ">
        ×
      </button>
      <div className="discovery-grid">
        <div className="discovery-art">
          <div className="sign-meta">
            <span>YOUR PERSONAL SIGN · {type}</span>
            <button onClick={() => setMotion((v) => !v)} aria-pressed={motion}>
              การเคลื่อนไหว: {motion ? "เปิด" : "ปิด"}
            </button>
          </div>
          <div className="sign-stage">
            <LanternScene type={type} exploded={exploded} step={step} motion={motion} />
          </div>
          <p className="sign-caption">
            {SIGN_ILLUSTRATIONS[type]?.name || `องค์ประกอบของ ${type}`}
          </p>
            <div className="sign-view">
              <button
                onClick={() => setExploded(false)}
                aria-pressed={!exploded}
              >
                ◉ ประกอบสมบูรณ์
              </button>
              <button onClick={() => setExploded(true)} aria-pressed={exploded}>
                ✧ แยกชิ้นส่วน
              </button>
            </div>
          <p className="muted sign-note">
            ขยับเมาส์เบา ๆ เพื่อสำรวจมิติของสัญลักษณ์
          </p>
        </div>
        <div className="discovery-story">
          <div className="sign-meta">
            <span>DISCOVER YOUR SIGN</span>
            <span>
              {step < 0
                ? "เริ่มต้น"
                : complete
                  ? "ค้นพบครบแล้ว"
                  : `${step + 1} / 4`}
            </span>
          </div>
          <h2 id="sign-title">
            {part?.title ||
              (complete
                ? "ส่วนเล็ก ๆ ที่ประกอบเป็นคุณ"
                : "ทุกชิ้นส่วนมีเรื่องราวซ่อนอยู่")}
          </h2>
          <p className="muted sign-description">
            {part?.meaning ||
              (complete
                ? "แนวโน้มทั้งสี่อยู่ร่วมกันในแบบของคุณ เลือกได้ว่าความหมายไหนตรงกับตัวเอง และความหมายไหนไม่ตรง"
                : "ค่อย ๆ เปิดเผยแนวโน้มทั้งสี่ แล้วดูว่าแต่ละส่วนเชื่อมโยงกับประสบการณ์ของคุณอย่างไร")}
          </p>
          <div className="sign-letters">
            {parts.map((p, i) => (
              <button
                key={p.letter}
                onClick={() => select(i)}
                aria-pressed={step === i}
              >
                <b>{p.letter}</b>
                <span>{p.name}</span>
              </button>
            ))}
          </div>
          <div className="sign-meaning" aria-live="polite">
            <span className="sign-spark">✧</span>
            <div>
              <p className="eyebrow">
                {part
                  ? `${part.letter} · ${part.name}`
                  : complete
                    ? parts.map((p) => p.letter).join(" + ")
                    : "YOUR OWN PACE"}
              </p>
              <h3>
                {part?.form ||
                  (complete
                    ? "ความหมายที่คุณเลือกค้นพบ"
                    : "ไม่ต้องรีบเข้าใจทุกอย่าง")}
              </h3>
              <p>
                {part
                  ? part.visualMeaning
                  : "เริ่มจากความสงสัยเล็ก ๆ แล้วให้สัญลักษณ์ค่อย ๆ เล่าเรื่อง"}
              </p>
            </div>
          </div>
          {part && (
            <div className="sign-reflection">
              <small>ชวนลองสังเกตตัวเอง</small>
              <p>{part.question}</p>
            </div>
          )}
          <button
            className="btn btn-primary sign-next"
            onClick={() =>
              complete ? select(0) : step === 3 ? finish() : select(step + 1)
            }
          >
            {complete
              ? "สำรวจอีกครั้ง"
              : step === 3
                ? "ประกอบเรื่องราวของฉัน"
                : step < 0
                  ? "ค้นพบความหมายของฉัน"
                  : `ค้นพบ ${parts[step + 1]?.letter} ต่อ`}{" "}
            <span>↗</span>
          </button>
          <button className="sign-skip" onClick={finish}>
            ดูความหมายทั้งหมด
          </button>
          <div className="sign-progress">
            {parts.map((p, i) => (
              <i key={p.letter} className={seen.includes(i) ? "done" : ""} />
            ))}
          </div>
          <p className="sign-note muted">
            สัญลักษณ์ที่ชวนให้ค้นพบ ไม่ใช่กำหนดว่าเราเป็นใคร
          </p>
        </div>
      </div>
    </dialog>
  );
}
