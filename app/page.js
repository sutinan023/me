import Link from "next/link";

export default function Home(){
  return <main className="wrap">
    <section className="card" style={{padding:"54px 34px",textAlign:"center"}}>
      <span className="pill">Research-informed · Not an official MBTI® assessment</span>
      <h1 className="hero-title">เข้าใจตัวเอง<br/>ให้มากกว่า 4 ตัวอักษร</h1>
      <p className="muted" style={{maxWidth:680,margin:"0 auto 26px",fontSize:18,lineHeight:1.8}}>
        สำรวจการเติมพลัง การรับข้อมูล การตัดสินใจ และการจัดการชีวิต ผ่าน 4 personality dimensions แบบต่อเนื่อง
      </p>
      <div style={{display:"flex",justifyContent:"center",gap:10,flexWrap:"wrap"}}>
        <Link className="btn btn-primary" href="/assessment">เริ่มทำแบบประเมิน →</Link>
        <Link className="btn btn-soft" href="/result">ดูผลเดิมของฉัน</Link>
      </div>
      <div style={{display:"flex",justifyContent:"center",gap:8,flexWrap:"wrap",marginTop:22}}>
        {["48 คำถาม","8–12 นาที","7-point scale","ไม่ต้องสมัครสมาชิก"].map(x=><span className="pill" key={x}>{x}</span>)}
      </div>
    </section>

    <section className="grid2" style={{marginTop:18}}>
      <div className="info"><h2 className="section-title">Assess</h2><p className="muted">วัด 4 dimensions เป็น spectrum ก่อนสรุปเป็น type</p></div>
      <div className="info"><h2 className="section-title">Understand</h2><p className="muted">อ่าน Work, Communication, Relationships, Stress และ Growth จากคะแนนจริง</p></div>
      <div className="info"><h2 className="section-title">Track</h2><p className="muted">เก็บผลย้อนหลังและดูว่ามิติไหน stable หรือขยับตามเวลา</p></div>
      <div className="info"><h2 className="section-title">Connect</h2><p className="muted">แชร์ผลด้วย link/QR และ Compare กับอีกคนโดยไม่ใช้ compatibility score</p></div>
    </section>
  </main>
}
