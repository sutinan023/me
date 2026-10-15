'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getContext, getContextQuestions } from '@/data/contextQuestions';
import { scoreContext } from '@/lib/contextScoring';
import { createContextStore } from '@/lib/contextStorage';

export default function ContextAssessment({context}) {
  const meta=getContext(context);
  const questions=getContextQuestions(context);
  const [answers,setAnswers]=useState(Array(24).fill(null));
  const [index,setIndex]=useState(0);
  const [ready,setReady]=useState(false);
  const [fatal,setFatal]=useState('');
  const [message,setMessage]=useState('');
  const [busy,setBusy]=useState(false);
  const [unsaved,setUnsaved]=useState(false);
  const timer=useRef(null),lock=useRef(false),session=useRef(null);
  const unsavedRef=useRef(false);
  const router=useRouter();
  useEffect(()=>{
    try {
      const saved=createContextStore(window.localStorage).getDraft(context)?.answers||Array(24).fill(null);
      setAnswers(saved);
      const missing=saved.indexOf(null);
      setIndex(missing<0?23:missing);
      setReady(true);
    } catch(error) {setFatal(error.message);}
    return ()=>clearTimeout(timer.current);
  },[context]);

  function advance(values=answers) {
    if(lock.current||unsavedRef.current) return;
    clearTimeout(timer.current);
    if(values[index]===null) return;
    if(index<23) {setIndex(index+1);return;}
    const missing=values.indexOf(null);
    if(missing>=0) {setIndex(missing);return;}
    lock.current=true;setBusy(true);setMessage('');
    try {
      session.current ||= {...scoreContext(context,values),id:crypto.randomUUID(),createdAt:new Date().toISOString(),referencePeriod:'past-four-weeks',source:'context-assessment'};
      createContextStore(window.localStorage).complete(session.current);
      router.push(`/result?contextSession=${encodeURIComponent(session.current.id)}`);
    } catch(error) {setMessage(error.message);lock.current=false;setBusy(false);}
  }
  function choose(value) {
    if(lock.current) return;
    clearTimeout(timer.current);
    const next=[...answers];next[index]=value;
    setAnswers(next);
    session.current=null;
    try {
      createContextStore(window.localStorage).saveDraft(context,next);
      unsavedRef.current=false;setUnsaved(false);setMessage('');
      timer.current=setTimeout(()=>advance(next),220);
    } catch(error) {unsavedRef.current=true;setUnsaved(true);setMessage(error.message);}
  }
  function retryDraft() {
    try {
      createContextStore(window.localStorage).saveDraft(context,answers);
      unsavedRef.current=false;setUnsaved(false);setMessage('');
    } catch(error) {setMessage(error.message);}
  }
  if(fatal) return <main className="wrap"><section className="card"><h1 className="section-title">เปิดแบบประเมินไม่ได้</h1><p role="alert">{fatal}</p><Link href="/contexts" className="btn btn-soft">กลับ Context Mode</Link></section></main>;
  if(!ready) return <main className="wrap"><section className="card" role="status">กำลังโหลดคำตอบของบริบทนี้…</section></main>;
  const q=questions[index],count=answers.filter(v=>v!==null).length;
  return <main className="wrap context-assessment"><section className="card">
    <div className="context-assessment-heading"><span className="pill">{meta.label} · 24 ข้อ</span><Link href="/contexts">พักไว้ / เปลี่ยนบริบท ↗</Link></div>
    <h1 className="section-title">{meta.subtitle}</h1><p className="muted">{meta.prompt}</p>
    <p className="context-small">ตอบจากประสบการณ์ในบริบทนี้ ไม่มีคำตอบที่ถูกหรือผิด · เก็บใน browser นี้</p>
    <div className="context-progress-text"><span>Question {index+1} / 24</span><span>ตอบแล้ว {count}</span></div>
    <progress value={count} max={24} aria-label="ความคืบหน้าแบบประเมิน" />
    <h2 className="context-question">{q.question}</h2>
    <div className="grid2"><div className="info">{q.left}</div><div className="info">{q.right}</div></div>
    <div className="context-answers">{[1,2,3,4,5,6,7].map(value=><button key={value} aria-label={`เลือกคะแนน ${value}`} aria-pressed={answers[index]===value} disabled={busy} onClick={()=>choose(value)}>{value}</button>)}</div>
    <div className="context-progress-text context-small"><span>ใกล้ด้านซ้ายมาก</span><span>กึ่งกลาง</span><span>ใกล้ด้านขวามาก</span></div>
    <p className="context-save-status" role="status">{busy?'กำลังบันทึกผลบริบท…':unsaved?'คำตอบล่าสุดยังไม่ได้บันทึก':answers[index]!==null?'รับคำตอบแล้ว — กดถัดไปได้':'เลือกคะแนนที่ใกล้กับคุณในบริบทนี้'}</p>
    {message&&<div className="info"><p role="alert">{message} {unsaved?'คำตอบล่าสุดยังอยู่ในหน้านี้ แต่ยังไม่ได้บันทึก กรุณาลองบันทึกอีกครั้งก่อนเปลี่ยนหน้า':'คำตอบที่บันทึกไว้ยังอยู่ กรุณาลองอีกครั้ง'}</p>{unsaved&&<button className="btn btn-soft" onClick={retryDraft}>ลองบันทึกคำตอบอีกครั้ง</button>}</div>}
    <div className="context-progress-text"><button className="btn btn-soft" disabled={index===0||busy||unsaved} onClick={()=>{clearTimeout(timer.current);setIndex(index-1);}}>← ย้อนกลับ</button><button className="btn btn-primary" disabled={answers[index]===null||busy||unsaved} onClick={()=>advance()}>{index===23?'ดูผลบริบท →':'ถัดไป →'}</button></div>
  </section></main>;
}
