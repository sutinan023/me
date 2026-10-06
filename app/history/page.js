'use client';
import { useEffect, useState } from "react";
import { getHistory } from "@/lib/storage";

export default function HistoryPage(){
  const [items,setItems]=useState([]);
  useEffect(()=>setItems(getHistory()),[]);
  return <main className="wrap"><section className="card">
    <h1 className="section-title">Personality Timeline</h1>
    <p className="muted">เก็บใน browser นี้เป็นค่าเริ่มต้น เพื่อให้ยังใช้ได้แม้ไม่ล็อกอิน</p>
    <div style={{display:"grid",gap:10,marginTop:18}}>
      {[...items].reverse().map(x=><div className="info" key={x.id} style={{display:"grid",gridTemplateColumns:"90px 1fr",gap:12}}>
        <div style={{fontWeight:900,fontSize:24}}>{x.type}</div>
        <div><strong>{new Date(x.createdAt).toLocaleString("th-TH")}</strong><div className="muted" style={{marginTop:5}}>E {100-x.dims.EI}/I {x.dims.EI} · S {100-x.dims.SN}/N {x.dims.SN} · T {100-x.dims.TF}/F {x.dims.TF} · J {100-x.dims.JP}/P {x.dims.JP}</div></div>
      </div>)}
    </div>
  </section></main>
}
