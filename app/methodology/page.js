import { REFERENCES } from "@/data/references";

export default function MethodologyPage(){
  return <main className="wrap">
    <section className="card">
      <span className="pill">Methodology · References · Limitations</span>
      <h1 className="hero-title" style={{fontSize:"clamp(36px,5vw,58px)"}}>Methodology &<br/>Research Basis</h1>
      <p className="muted" style={{maxWidth:800,lineHeight:1.8}}>แบบประเมินนี้เป็น research-informed self-reflection prototype ใช้ 4 continuous dimensions จากกรอบ Jung–Myers แต่ไม่ได้เป็น MBTI® official assessment และยังไม่ควรเรียกว่า scientifically validated test จนกว่าจะผ่าน pilot และ psychometric validation</p>
      <div className="grid2" style={{marginTop:20}}>
        <div className="info"><h3>Measurement</h3><p className="muted">48 original bipolar items · 7-point scale · 12 items ต่อ dimension · สลับ scoring direction</p></div>
        <div className="info"><h3>Interpretation</h3><p className="muted">แสดง spectrum ก่อน type เพื่อไม่ตีความว่าบุคลิกภาพแบ่งเป็นสองกลุ่มเด็ดขาด</p></div>
        <div className="info"><h3>Limitations</h3><p className="muted">Self-report, context-sensitive, ไม่ใช้วินิจฉัย คัดเลือกพนักงาน วัดสติปัญญา หรือทำนาย compatibility</p></div>
        <div className="info"><h3>Validation status</h3><p className="muted">Research-informed prototype — ยังต้องมี expert review, pilot, factor analysis, reliability และ validity testing</p></div>
      </div>
      <h2 className="section-title" style={{marginTop:28}}>References</h2>
      <div style={{display:"grid",gap:10}}>
        {REFERENCES.map((r,i)=><div className="info" key={i}><span className="pill">{r.group}</span><p className="muted">{r.citation}</p>{r.doi&&<code>DOI: {r.doi}</code>}</div>)}
      </div>
    </section>
  </main>
}
