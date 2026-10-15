'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CONTEXTS, CONTEXT_VERSION } from '@/data/contextQuestions';
import { createContextStore, selectLatestCompatible } from '@/lib/contextStorage';
import ContextComparison, { contextDate } from './ContextComparison';

export default function ContextHub() {
  const [data,setData]=useState(null),[error,setError]=useState(''),[selected,setSelected]=useState({});
  const router=useRouter();
  useEffect(()=>{
    function refresh() {
      try {setData(createContextStore(window.localStorage).load());setError('');} catch(e){setError(e.message);}
    }
    refresh();window.addEventListener('storage',refresh);return()=>window.removeEventListener('storage',refresh);
  },[]);
  if(error) return <main className="wrap"><section className="card"><h1 className="section-title">อ่าน Context Mode ไม่สำเร็จ</h1><p role="alert">{error}</p><p className="muted">ข้อมูลเดิมยังไม่ได้ถูกล้าง ลองตรวจพื้นที่จัดเก็บหรือกลับมาเปิดใหม่</p><Link className="btn btn-soft" href="/result">ผลทั่วไปเดิม</Link></section></main>;
  if(!data) return <main className="wrap"><section className="card" role="status">กำลังโหลดบริบทของคุณ…</section></main>;
  const sessions=data.sessions.filter(s=>s.questionnaireVersion===CONTEXT_VERSION);
  function pick(context) {if(context!=='general'&&selected[context]==='')return null;return sessions.find(s=>s.context===context&&s.id===selected[context])||selectLatestCompatible(sessions,context);}
  function restart(context) {
    try {createContextStore(window.localStorage).resetDraft(context);router.push(`/assessment?context=${context}`);} catch(e){setError(e.message);}
  }
  const general=pick('general');
  const comparisons=CONTEXTS.filter(c=>c.key!=='general').map(c=>pick(c.key)).filter(Boolean);
  return <main className="wrap context-wrap">
    <section className="context-intro"><p className="eyebrow">ONE PERSON. MANY WAYS TO SHOW UP.</p><h1 className="hero-title">คุณ ในแต่ละบริบท</h1><p className="muted">สำรวจ preference ที่แสดงออกเมื่อทำงาน อยู่กับเพื่อน อยู่คนเดียว หรือมีความกดดัน<br/>24 ข้อต่อบริบท · ทำทีละบริบทได้ · เก็บใน browser นี้</p><p className="context-small">เป็นการสำรวจตัวเอง ไม่ใช่ข้อสรุปว่า type จริงเปลี่ยน ผลเดิม 48 ข้อเก็บไว้อ้างอิงแยกจาก General ชุดนี้</p><Link className="report-back" href="/result">ดูผลทั่วไป 48 ข้อเดิม ↗</Link></section>
    <section className="context-cards" aria-label="เลือกบริบท">{CONTEXTS.map((meta,index)=>{
      const result=selectLatestCompatible(sessions,meta.key),draft=data.drafts[`${CONTEXT_VERSION}:${meta.key}`],answered=draft?.answers.filter(v=>v!==null).length||0;
      const url=`/assessment?context=${meta.key}`;
      return <article className="context-card" key={meta.key}>
        <p className="eyebrow">0{index+1} / {meta.label}</p><h2>{meta.subtitle}</h2><p className="muted">{meta.prompt}</p>
        <p className="context-card-status">{draft?`ค้างไว้ ${answered}/24 ข้อ`:result?`ใกล้ ${result.type} · ทำแล้ว`:'ยังไม่ได้สำรวจ'}</p>
        {result&&<p className="context-small">{contextDate(result.createdAt)}</p>}
        <div className="context-card-actions"><Link className="btn btn-primary" href={url}>{draft?'ทำต่อ':result?'สำรวจอีกครั้ง':'เริ่มสำรวจ'}</Link>{result&&<Link className="btn btn-soft" href={`/result?contextSession=${result.id}`}>ดูผล</Link>}</div>
        {draft&&<button className="context-restart" onClick={()=>restart(meta.key)}>เริ่มใหม่ (ล้างคำตอบค้าง)</button>}
      </article>;
    })}</section>
    <section className="context-selection"><p className="eyebrow">CONNECT THE DOTS</p><h2 className="section-title">เปรียบเทียบฉันในหลายบริบท</h2>
      {!general?<div className="info"><p>ทำ General 24 ข้อเพื่อเป็นฐานเทียบ คะแนนจากแบบเดิม 48 ข้อจะไม่นำมาแทน</p><Link className="btn btn-primary" href="/assessment?context=general">เริ่ม General</Link></div>:comparisons.length===0?<div className="info">มี General แล้ว เลือกทำอีกหนึ่งบริบทเพื่อเริ่มเปรียบเทียบ</div>:null}
      <div className="context-selectors">{CONTEXTS.map(meta=>{
        const options=sessions.filter(s=>s.context===meta.key).sort((a,b)=>Date.parse(b.createdAt)-Date.parse(a.createdAt)||b.id.localeCompare(a.id));
        return options.length>0?<label key={meta.key}>{meta.label}<select aria-label={`เลือกผล ${meta.label}`} value={pick(meta.key)?.id||''} onChange={e=>setSelected(prev=>({...prev,[meta.key]:e.target.value}))}>{meta.key!=='general'&&<option value="">ไม่เปรียบเทียบบริบทนี้</option>}{options.map(s=><option value={s.id} key={s.id}>{contextDate(s.createdAt)} · {s.type} · {s.id.slice(0,6)}</option>)}</select></label>:null;
      })}</div>
      {general&&comparisons.length>0&&<ContextComparison general={general} sessions={comparisons}/>}
      <p className="context-small">{CONTEXT_VERSION} · เปอร์เซ็นต์คือคะแนนบน spectrum ไม่ใช่ความมั่นใจหรือความน่าจะเป็นของ Type · ไม่ใช่แบบประเมินที่ผ่านการตรวจสอบทางจิตมิติ</p>
    </section>
  </main>;
}
