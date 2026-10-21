"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { QUESTIONS, QUESTIONNAIRE_VERSION } from "@/data/questions";
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
  const [saveError, setSaveError] = useState("");
  const savingRef = useRef(false);
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
    if (savingRef.current) return;
    savingRef.current = true;
    setSaving(true);
    setSaveError("");

    try {
      const scored = scoreAssessment(QUESTIONS, finalAnswers);
      const result = {
        ...scored,
        id: `r-${Date.now()}`,
        createdAt: new Date().toISOString(),
        questionnaireVersion: QUESTIONNAIRE_VERSION,
        source: "assessment",
      };

      // Preserve the completed result before waiting for the network. Keep
      // the answers until both local result and history writes succeed.
      saveLatestResult(result);
      addHistory(result);
      clearAnswers();

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000);
      try {
        const response = await fetch("/api/assessment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: controller.signal,
          body: JSON.stringify({
            questionnaireVersion: QUESTIONNAIRE_VERSION,
            answers: finalAnswers,
            result,
          }),
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Save failed");
        console.log("Saved session:", data.sessionId);
      } catch (error) {
        console.warn("Remote save unavailable; completed result is saved in this browser.", error);
      } finally {
        clearTimeout(timeout);
      }

      router.push("/result");
    } catch {
      setSaveError("บันทึกผลใน browser ไม่สำเร็จ กรุณาตรวจสอบพื้นที่จัดเก็บแล้วลองอีกครั้ง คำตอบยังไม่ถูกล้าง");
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  }

  async function advance(finalAnswers = answers) {
    if (savingRef.current) return;

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
    if (savingRef.current) return;

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
        <p className="eyebrow">มาสำรวจจังหวะที่เป็นคุณ</p>
        <p className="muted">ลองนึกถึงสิ่งที่คุณมักทำจริงในชีวิตประจำวัน ไม่มีคำตอบถูกหรือผิด และไม่ต้องเลือกด้านใดด้านหนึ่งสุดทาง</p>
        <p className="context-small">1 = ใกล้ด้านซ้ายมาก · 4 = ใกล้ทั้งสองด้านพอ ๆ กัน · 7 = ใกล้ด้านขวามาก</p>
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
            <div className="info" style={{ fontWeight: 800, display: "flex", alignItems: "center" }}>1 = {q.left}</div>
            <div className="info" style={{ fontWeight: 800, textAlign: "right", display: "flex", alignItems: "center", justifyContent: "flex-end" }}>7 = {q.right}</div>
          </div>

          <div className="assessment-scale">
            {[1,2,3,4,5,6,7].map((v) => {
              const isSelected = answers[index] === v;
              return (
                <button
                  key={v}
                  className="assessment-score"
                  onClick={() => choose(v)}
                  disabled={saving}
                  aria-label={`เลือกคะแนน ${v}`}
                  aria-pressed={isSelected}
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
            <span>ใกล้คำตอบ 1</span>
            <span>กึ่งกลาง</span>
            <span>ใกล้คำตอบ 7</span>
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

        {saveError && <p className="info" role="alert">{saveError}</p>}

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, marginTop: 4 }}>
          <button className="btn btn-soft" disabled={index === 0 || saving} onClick={goBack}>
            ← ย้อนกลับ
          </button>

          <button className="btn btn-primary" disabled={!selected || saving} onClick={goNextNow}>
            {index === QUESTIONS.length - 1 ? "ดูผลลัพธ์ →" : "ถัดไป →"}
          </button>
        </div>
      </section>
      <style jsx>{`
        .assessment-scale {
          display: grid;
          grid-template-columns: repeat(7, minmax(0, 1fr));
          gap: 9px;
          margin-top: 22px;
        }
        @media (max-width: 560px) {
          .assessment-scale {
            display: flex;
            flex-wrap: wrap;
            justify-content: center;
            gap: 8px;
          }
          .assessment-score {
            width: calc((100% - 24px) / 4);
            min-height: 48px;
            aspect-ratio: auto !important;
            border-radius: 14px !important;
          }
        }
      `}</style>
    </main>
  );
}
