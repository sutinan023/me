"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { QUESTIONS } from "@/data/questions";
import { scoreAssessment } from "@/lib/scoring";
import {
  addHistory,
  clearAnswers,
  getAnswers,
  saveAnswers,
  saveLatestResult,
} from "@/lib/storage";

export default function AssessmentPage() {
  const router = useRouter();
  const [answers, setAnswers] = useState(Array(QUESTIONS.length).fill(null));
  const [index, setIndex] = useState(0);
  const [transitioning, setTransitioning] = useState(false);
  const [saving, setSaving] = useState(false);
  const autoNextTimer = useRef(null);

  useEffect(() => {
    const saved = getAnswers(QUESTIONS.length);
    setAnswers(saved);
    const first = saved.findIndex((x) => x == null);
    if (first >= 0) setIndex(first);
    else if (saved.every((x) => x != null)) setIndex(QUESTIONS.length - 1);

    return () => {
      if (autoNextTimer.current) clearTimeout(autoNextTimer.current);
    };
  }, []);

  const q = QUESTIONS[index];
  const answered = answers.filter((x) => x != null).length;
  const selected = answers[index] != null;

  async function finishAssessment(finalAnswers) {
    if (saving) return;
    setSaving(true);

    try {
      const scored = scoreAssessment(QUESTIONS, finalAnswers);
      const result = {
        ...scored,
        id: `r-${Date.now()}`,
        createdAt: new Date().toISOString(),
        questionnaireVersion: "v0.1",
        source: "assessment",
      };

      try {
        const response = await fetch("/api/assessment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            questionnaireVersion: "v0.1",
            answers: finalAnswers,
            result,
          }),
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Save failed");
        console.log("Saved session:", data.sessionId);
      } catch (error) {
        console.error("Supabase save failed:", error);
      }

      saveLatestResult(result);
      addHistory(result);
      clearAnswers();
      router.push("/result");
    } finally {
      setSaving(false);
    }
  }

  async function advance(finalAnswers = answers) {
    if (saving) return;

    if (autoNextTimer.current) {
      clearTimeout(autoNextTimer.current);
      autoNextTimer.current = null;
    }

    if (finalAnswers[index] == null) return;
    setTransitioning(false);

    if (index === QUESTIONS.length - 1) {
      const missingIndex = finalAnswers.findIndex((x) => x == null);
      if (missingIndex >= 0) {
        setIndex(missingIndex);
        return;
      }
      await finishAssessment(finalAnswers);
      return;
    }

    setIndex((current) => current + 1);
  }

  function choose(value) {
    if (saving) return;

    const nextAnswers = [...answers];
    nextAnswers[index] = value;
    setAnswers(nextAnswers);
    saveAnswers(nextAnswers);
    setTransitioning(true);

    if (autoNextTimer.current) clearTimeout(autoNextTimer.current);

    autoNextTimer.current = setTimeout(() => {
      advance(nextAnswers);
    }, 220);
  }

  function goBack() {
    if (saving) return;
    if (autoNextTimer.current) {
      clearTimeout(autoNextTimer.current);
      autoNextTimer.current = null;
    }
    setTransitioning(false);
    setIndex((current) => Math.max(0, current - 1));
  }

  function goNextNow() {
    if (!selected || saving) return;
    advance(answers);
  }

  return (
    <main className="wrap">
      <section className="card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, color: "var(--muted)", fontSize: 13 }}>
          <span>Question {index + 1} / {QUESTIONS.length}</span>
          <span>ตอบแล้ว {answered}</span>
        </div>

        <div style={{ height: 9, background: "#eee5de", borderRadius: 999, overflow: "hidden", marginTop: 10 }}>
          <div style={{ height: "100%", width: `${(answered / QUESTIONS.length) * 100}%`, background: "linear-gradient(90deg,var(--coral),var(--peach))", transition: "width .25s ease" }} />
        </div>

        <div style={{ padding: "34px 4px 12px" }}>
          <div style={{ fontSize: 28, fontWeight: 900, lineHeight: 1.4, marginBottom: 24 }}>
            {q.question}
          </div>

          <div className="grid2">
            <div className="info" style={{ fontWeight: 800, display: "flex", alignItems: "center" }}>{q.left}</div>
            <div className="info" style={{ fontWeight: 800, textAlign: "right", display: "flex", alignItems: "center", justifyContent: "flex-end" }}>{q.right}</div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 9, marginTop: 22 }}>
            {[1,2,3,4,5,6,7].map((v) => {
              const isSelected = answers[index] === v;
              return (
                <button
                  key={v}
                  onClick={() => choose(v)}
                  disabled={saving}
                  aria-label={`เลือกคะแนน ${v}`}
                  style={{
                    aspectRatio: "1",
                    padding: 0,
                    borderRadius: "50%",
                    border: isSelected ? "2px solid var(--brown)" : "1px solid var(--line)",
                    background: isSelected ? "var(--brown)" : "white",
                    color: isSelected ? "white" : "var(--muted)",
                    fontWeight: 800,
                    fontSize: 15,
                    cursor: saving ? "default" : "pointer",
                    transform: isSelected ? "scale(1.08)" : "scale(1)",
                    boxShadow: isSelected ? "0 8px 20px rgba(119,93,80,.18)" : "none",
                    transition: "all .16s ease",
                  }}
                >
                  {v}
                </button>
              );
            })}
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, fontSize: 12, color: "var(--muted)", marginTop: 10 }}>
            <span>ใกล้ด้านซ้ายมาก</span>
            <span>กึ่งกลาง</span>
            <span>ใกล้ด้านขวามาก</span>
          </div>

          <div style={{ textAlign: "center", marginTop: 20, minHeight: 22, fontSize: 12, color: "var(--muted)" }}>
            {saving
              ? "กำลังบันทึกผล…"
              : transitioning
                ? "รับคำตอบแล้ว…"
                : selected
                  ? "เลือกแล้ว — ระบบจะไปข้อถัดไปอัตโนมัติ"
                  : "เลือกคำตอบที่ใกล้กับคุณที่สุด"}
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, marginTop: 4 }}>
          <button className="btn btn-soft" disabled={index === 0 || saving} onClick={goBack}>
            ← ย้อนกลับ
          </button>

          <button className="btn btn-primary" disabled={!selected || saving} onClick={goNextNow}>
            {index === QUESTIONS.length - 1 ? "ดูผลลัพธ์ →" : "ถัดไป →"}
          </button>
        </div>
      </section>
    </main>
  );
}
