'use client';
import { useEffect, useState } from "react";
import { getLatestResult } from "@/lib/storage";
import { decodeLocalShare } from "@/lib/share";

function computedType(d){return (d.EI<50?"E":"I")+(d.SN<50?"S":"N")+(d.TF<50?"T":"F")+(d.JP<50?"J":"P")}
function label(n){return n<=10?"ใกล้กันมาก":n<=25?"ต่างเล็กน้อย":n<=45?"ต่างพอสมควร":"ต่างกันชัด"}

export default function ComparePage(){
  const [me,setMe]=useState(null);
  const [other,setOther]=useState({type:"",dims:{EI:50,SN:50,TF:50,JP:50}});
  const [loaded,setLoaded]=useState(false);

  useEffect(()=>{
    setMe(getLatestResult());
    const sp=new URLSearchParams(window.location.search);
    const token=sp.get("friend");
    const local=sp.get("p");
    (async()=>{
      if(token){
        const r=await fetch(`/api/share/${token}`);
        if(r.ok){const d=await r.json();setOther(d.result);setLoaded(true);}
      } else if(local){
        const d=decodeLocalShare(local);
        if(d){setOther(d);setLoaded(true);}
      }
    })();
  },[]);

  if(!me)return <main className="wrap"><section className="card">Loading…</section></main>;
  const dims=["EI","SN","TF","JP"];
  const type=other.type||computedType(other.dims);

  return <main className="wrap"><section className="card">
    <h1 className="section-title">Compare me with someone</h1>
    <p className="muted">ไม่ใช้ compatibility score — เราดูว่าความต้องการและจังหวะในแต่ละ dimension ต่างกันตรงไหน</p>
    {loaded&&<div className="info" style={{margin:"14px 0"}}>นำเข้าผลจากลิงก์แชร์เรียบร้อยแล้ว: <strong>{type}</strong></div>}
    <div className="grid2" style={{marginTop:16}}>
      <div className="info"><span className="pill">YOU</span><h2 style={{fontSize:34}}>{me.type}</h2><p className="muted">I {me.dims.EI} · N {me.dims.SN} · F {me.dims.TF} · P {me.dims.JP}</p></div>
      <div className="info"><span className="pill">OTHER</span><h2 style={{fontSize:34}}>{type}</h2>
        {dims.map(k=><div key={k} style={{marginTop:12}}><label style={{fontSize:12,fontWeight:800}}>{k}</label><input type="range" min="0" max="100" value={other.dims[k]} onChange={e=>setOther(o=>({...o,dims:{...o.dims,[k]:Number(e.target.value)}}))} style={{width:"100%"}}/></div>)}
      </div>
    </div>
    <div style={{marginTop:18}}>
      {dims.map(k=>{const diff=Math.abs(me.dims[k]-other.dims[k]);return <div className="info" key={k} style={{marginTop:10}}><div style={{display:"flex",justifyContent:"space-between"}}><strong>{k}</strong><span className="pill">{label(diff)} · {diff} จุด</span></div><div className="bar" style={{marginTop:12}}><div className="pin" style={{left:`${me.dims[k]}%`}}/><div className="pin" style={{left:`${other.dims[k]}%`,background:"var(--coral)"}}/></div></div>})}
    </div>
    <div className="grid2" style={{marginTop:18}}>
      <div className="info"><h3>Communication</h3><p className="muted">ถ้า E/I ต่างกันมาก ให้สิทธิ์คนหนึ่งคิดก่อนตอบ และอีกคนใช้การคุยเพื่อประมวลผล โดยตกลงจังหวะร่วมกัน</p></div>
      <div className="info"><h3>Working together</h3><p className="muted">ถ้า J/P ต่างกันมาก ให้ตกลงว่าอะไรต้องล็อก และอะไรเปลี่ยนได้ตั้งแต่ต้น</p></div>
    </div>
  </section></main>
}
