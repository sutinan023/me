'use client';
import { useState } from "react";

const content={
  Overview:["ภาพรวม","แกน Introversion ที่สูงหมายถึงคุณอาจต้องการพื้นที่ส่วนตัวเพื่อประมวลผลและฟื้นพลัง ส่วน S/N และ T/F ที่ใกล้กึ่งกลางบอกว่าอย่าอ่านตัวเองจาก stereotype ของ type เพียงอย่างเดียว"],
  Work:["Work Style","มีโครงสร้างและ milestone ชัดน่าจะช่วยให้ทำงานสบายขึ้น แต่ยังควรมีพื้นที่ให้เลือกวิธีทำเอง โดยเฉพาะเมื่อโจทย์ต้องผสมรายละเอียดกับภาพรวม"],
  Communication:["Communication","รูปแบบที่น่าจะเวิร์กคือ ให้ context → บอกประเด็นชัด → ให้เวลาคิด → ค่อยตัดสินใจ โดยเฉพาะเมื่อเรื่องซับซ้อนหรือมี conflict"],
  Relationships:["Relationships","อาจให้คุณค่ากับความสม่ำเสมอ ความน่าเชื่อถือ และพื้นที่ส่วนตัว สิ่งที่ควรระวังคือคาดว่าอีกฝ่ายจะสังเกตรายละเอียดได้เองเหมือนคุณ"],
  Stress:["Stress","สิ่งเร้าเยอะ เรื่องค้าง และแผนเปลี่ยนพร้อมกันอาจเปลืองพลัง ลองลด input ชั่วคราวและเลือกปิดทีละหนึ่งเรื่อง"],
  Growth:["Growth","ลองพูดไอเดียก่อนพร้อม 100%, แยกข้อเท็จจริงกับคุณค่าเวลาตัดสินใจ และเหลือ buffer 10–20% ในแผน"]
};

export default function InsightTabs(){
  const [tab,setTab]=useState("Overview");
  return <div style={{marginTop:24}}>
    <div className="tabs">{Object.keys(content).map(k=><button key={k} className={`tab ${tab===k?"active":""}`} onClick={()=>setTab(k)}>{k}</button>)}</div>
    <div className="info" style={{marginTop:12}}><h3>{content[tab][0]}</h3><p className="muted" style={{lineHeight:1.8}}>{content[tab][1]}</p></div>
  </div>
}
