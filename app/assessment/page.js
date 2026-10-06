'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { QUESTIONS } from "@/data/questions";
import { scoreAssessment } from "@/lib/scoring";
import { addHistory, clearAnswers, getAnswers, saveAnswers, saveLatestResult } from "@/lib/storage";

export default function AssessmentPage(){
  const router=useRouter();
  const [answers,setAnswers]=useState(Array(QUESTIONS.length).fill(null));
  const [index,setIndex]=useState(0);

  useEffect(()=>{
    const saved=getAnswers(QUESTIONS.length);
    setAnswers(saved);
    const first=saved.findIndex(x=>x==null);
    if(first>=0) setIndex(first);
  },[]);

  const q=QUESTIONS[index];
  const answered=answers.filter(x=>x!=null).length;
  const choose=(value)=>{
    const next=[...answers]; next[index]=value; setAnswers(next); saveAnswers(next);
  };
  const next=()=>{
    if(answers[index]==null) return alert("เลือกคำตอบก่อนนะ");
    if(index<QUESTIONS.length-1) return setIndex(index+1);
    if(answers.some(x=>x==null)) return setIndex(answers.findIndex(x=>x==null));
    const scored=scoreAssessment(QUESTIONS,answers);
    const result={...scored,id:`r-${Date.now()}`,createdAt:new Date().toISOString(),questionnaireVersion:"v0.1",source:"assessment"};
    saveLatestResult(result); addHistory(result); clearAnswers(); router.push("/result");
  };

  return <main className="wrap">
    <section className="card">
      <div style={{display:"flex",justifyContent:"space-between",color:"var(--muted)",fontSize:13}}>
        <span>Question {index+1} / {QUESTIONS.length}</span><span>ตอบแล้ว {answered}</span>
      </div>
      <div style={{height:9,background:"#eee5de",borderRadius:999,overflow:"hidden",marginTop:10}}>
        <div style={{height:"100%",width:`${answered/QUESTIONS.length*100}%`,background:"linear-gradient(90deg,var(--coral),var(--peach))"}}/>
      </div>
      <div style={{padding:"34px 4px 12px"}}>
        <div style={{fontSize:28,fontWeight:900,lineHeight:1.4,marginBottom:24}}>{q.question}</div>
        <div className="grid2">
          <div className="info" style={{fontWeight:800}}>{q.left}</div>
          <div className="info" style={{fontWeight:800,textAlign:"right"}}>{q.right}</div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:9,marginTop:18}}>
          {[1,2,3,4,5,6,7].map(v=><button key={v} onClick={()=>choose(v)} className="btn" style={{aspectRatio:"1",padding:0,border:`1px solid ${answers[index]===v?"var(--brown)":"var(--line)"}`,background:answers[index]===v?"var(--brown)":"white",color:answers[index]===v?"white":"var(--muted)",borderRadius:"50%"}}>{v}</button>)}
        </div>
        <div style={{display:"flex",justifyContent:"space-between",fontSize:12,color:"var(--muted)",marginTop:8}}>
          <span>ใกล้ด้านซ้ายมาก</span><span>กึ่งกลาง</span><span>ใกล้ด้านขวามาก</span>
        </div>
      </div>
      <div style={{display:"flex",justifyContent:"space-between",gap:10}}>
        <button className="btn btn-soft" disabled={index===0} onClick={()=>setIndex(Math.max(0,index-1))}>← ย้อนกลับ</button>
        <button className="btn btn-primary" onClick={next}>{index===QUESTIONS.length-1?"ดูผลลัพธ์ →":"ถัดไป →"}</button>
      </div>
    </section>
  </main>
}
