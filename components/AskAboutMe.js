'use client';
import { useState } from "react";

function answer(q,p){
  const s=q.toLowerCase();
  if(/คนเยอะ|social|เข้าสังคม/.test(s)) return `I ${p.dims.EI}% เป็น preference ที่ชัดที่สุด จึงเป็นไปได้ว่าการอยู่กับคนและสิ่งเร้าต่อเนื่องใช้พลังมากกว่า ลองเว้นช่วงพักหลัง social event และอย่านัดกิจกรรมติดกันมากเกินไป`;
  if(/งาน|work|อาชีพ/.test(s)) return `J ${100-p.dims.JP}% และ S/N ที่ค่อนข้างสมดุลชี้ว่าคุณอาจทำงานสบายขึ้นเมื่อมี scope และ milestone ชัด แต่ยังเข้าใจทั้งรายละเอียดและภาพรวมได้ อย่าจำกัดตัวเองด้วยรายชื่ออาชีพของ MBTI`;
  if(/conflict|ขัดแย้ง|ทะเลาะ/.test(s)) return `T/F ของคุณค่อนข้างสมดุล ลองใช้สูตร “ข้อเท็จจริง → ผลกระทบ → สิ่งที่ต้องการ” จะช่วยให้พูดตรงโดยไม่ทิ้งความสัมพันธ์`;
  if(/เครียด|stress|หมดแรง/.test(s)) return `เมื่อ I สูงและมี preference ทาง J พอสมควร สถานการณ์ที่ทั้งสิ่งเร้าเยอะและแผนเปลี่ยนบ่อยอาจใช้พลังมาก ลองลด input และเลือกปิดทีละ 1 เรื่อง`;
  return `จากโปรไฟล์ ${p.type} ของคุณ จุดที่ควรใช้เป็นบริบทคือ I ${p.dims.EI}% ชัดที่สุด ขณะที่ S/N และ T/F ค่อนข้างสมดุล ลองถามเฉพาะเรื่องงาน การเข้าสังคม conflict ความเครียด หรือความสัมพันธ์`;
}
export default function AskAboutMe({profile}){
  const [input,setInput]=useState("");
  const [msgs,setMsgs]=useState([{who:"bot",text:"ถามเกี่ยวกับตัวเองได้เลย เช่น “ทำไมฉันเหนื่อยเวลาเจอคนเยอะ?”"}]);
  const ask=()=>{
    const q=input.trim(); if(!q)return;
    setMsgs(m=>[...m,{who:"user",text:q},{who:"bot",text:answer(q,profile)}]); setInput("");
  };
  return <section style={{marginTop:22}}>
    <h2 className="section-title">Ask about me</h2>
    <div className="chat">{msgs.map((m,i)=><div key={i} className={`bubble ${m.who}`}>{m.text}</div>)}</div>
    <div style={{display:"grid",gridTemplateColumns:"1fr auto",gap:9,marginTop:10}}>
      <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&ask()} placeholder="ถามเกี่ยวกับตัวเอง..." style={{border:"1px solid var(--line)",borderRadius:14,padding:"12px 13px"}}/>
      <button className="btn btn-primary" onClick={ask}>ถาม →</button>
    </div>
    <p className="muted" style={{fontSize:12}}>เป็น interpretation เพื่อ self-reflection ไม่ใช่การวินิจฉัย</p>
  </section>
}
