'use client';
import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";

export default function SharePanel({profile}){
  const [url,setUrl]=useState("");
  const canvas=useRef(null);

  const create=async()=>{
    const res=await fetch("/api/share",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(profile)});
    const data=await res.json();
    if(!res.ok){ alert(data.error||"สร้างลิงก์ไม่สำเร็จ"); return ""; }
    setUrl(data.url);
    return data.url;
  };
  useEffect(()=>{ if(url&&canvas.current) QRCode.toCanvas(canvas.current,url,{width:190,margin:1}); },[url]);

  const copy=async()=>{ const shareUrl=url || await create(); if(!shareUrl) return; await navigator.clipboard.writeText(shareUrl); alert("คัดลอกลิงก์แล้ว"); };
  const nativeShare=async()=>{
    const shareUrl=url || await create();
    if(!shareUrl) return;
    if(navigator.share) await navigator.share({title:"Personality Type Explorer",text:`My result: ${profile.type}`,url:shareUrl});
    else { await navigator.clipboard.writeText(shareUrl); alert("คัดลอกลิงก์แล้ว"); }
  };

  return <section className="info" style={{marginTop:22}}>
    <h2 className="section-title">Share my result</h2>
    <p className="muted">แชร์เฉพาะ Type + 4 dimensions ไม่แชร์คำตอบ 48 ข้อ</p>
    <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
      <button className="btn btn-primary" onClick={create}>สร้างลิงก์ + QR</button>
      <button className="btn btn-soft" onClick={copy}>Copy link</button>
      <button className="btn btn-soft" onClick={nativeShare}>Share…</button>
    </div>
    {url&&<div className="grid2" style={{marginTop:16,alignItems:"center"}}>
      <canvas ref={canvas} style={{background:"white",borderRadius:16,padding:8,border:"1px solid var(--line)"}}/>
      <div><input readOnly value={url} style={{width:"100%",border:"1px solid var(--line)",borderRadius:12,padding:11}}/><p className="muted" style={{fontSize:12}}>ใครที่มีลิงก์นี้สามารถเห็นผลที่แชร์ได้</p></div>
    </div>}
  </section>
}
