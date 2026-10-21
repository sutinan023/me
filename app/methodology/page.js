import { REFERENCES } from "@/data/references";
import { QUESTIONNAIRE_VERSION } from "@/data/questions";
import { CONTEXT_VERSION } from "@/data/contextQuestions";

export default function MethodologyPage(){
  return <main className="wrap">
    <section className="card">
      <span className="pill">Methodology · References · Limitations</span>
      <h1 className="hero-title" style={{fontSize:"clamp(36px,5vw,58px)"}}>Methodology &<br/>Research Basis</h1>
      <p className="muted" style={{maxWidth:800,lineHeight:1.8}}>แบบประเมินนี้เป็น research-informed self-reflection prototype ใช้ 4 continuous dimensions จากกรอบ Jung–Myers แต่ไม่ได้เป็น MBTI® official assessment และยังไม่ควรเรียกว่า scientifically validated test จนกว่าจะผ่าน pilot และ psychometric validation</p>
      <div className="grid2" style={{marginTop:20}}>
        <div className="info"><h3>Measurement</h3><p className="muted">ภาพรวม 48 ข้อ ({QUESTIONNAIRE_VERSION}) · Context Mode 24 ข้อต่อบริบท ({CONTEXT_VERSION}) · สเกล 7 ระดับ · จำนวนข้อสองทิศทางเท่ากันในแต่ละมิติ</p></div>
        <div className="info"><h3>Interpretation</h3><p className="muted">แสดง spectrum ก่อน type เพื่อไม่ตีความว่าบุคลิกภาพแบ่งเป็นสองกลุ่มเด็ดขาด</p></div>
        <div className="info"><h3>Limitations</h3><p className="muted">Self-report, context-sensitive, ไม่ใช้วินิจฉัย คัดเลือกพนักงาน วัดสติปัญญา หรือทำนาย compatibility</p></div>
        <div className="info"><h3>Validation status</h3><p className="muted">Research-informed prototype — ยังต้องมี expert review, pilot, factor analysis, reliability และ validity testing</p></div>
      </div>
      <h2 className="section-title" style={{marginTop:28}}>ภาษาชวนตอบ ออกแบบอย่างมีหลักการ</h2>
      <p className="muted">คำถามภาษาไทยเขียนขึ้นสำหรับโปรเจกต์นี้ อ้างอิงหลักการออกแบบการวัด ไม่ใช่การแปลข้อคำถามจากแบบทดสอบมาตรฐาน และงานวิจัยที่อ้างถึงไม่ได้ตรวจสอบชุดคำถามนี้โดยตรง</p>
      <div className="grid2" style={{marginTop:20}}>
        <div className="info"><h3>สั้น ชัด และใกล้ชีวิตจริง</h3><p className="muted">ใช้สถานการณ์สั้นและถามประเด็นหลักทีละเรื่อง ลดศัพท์เฉพาะและคำตัดสินคุณค่า ให้ตัวเลือกทั้งสองด้านมีน้ำหนักใกล้เคียงกัน นำหลักการพัฒนาข้อคำถามของ Boateng และคณะ (2018) มาประยุกต์ใช้</p></div>
        <div className="info"><h3>ตอบจากบริบทเดียวกัน</h3><p className="muted">Context Mode ให้ย้อนนึกถึงบริบทที่เลือกในช่วง 4 สัปดาห์ที่ผ่านมา งานของ Lievens และคณะ (2008) สนับสนุนความสำคัญของกรอบอ้างอิงที่เหมาะกับสิ่งที่วัด แต่ไม่ได้ยืนยันช่วงเวลา 4 สัปดาห์หรือบริบททั้งห้าของโปรเจกต์นี้</p></div>
        <div className="info"><h3>สนุกด้วยการนึกภาพตาม</h3><p className="muted">เราเลือกใช้ภาษาชวนคุยและสถานการณ์คุ้นเคย งานของ Landers และ Collmus (2022) พบว่าการเพิ่มเรื่องราวทำให้ผู้ตอบประเมินประสบการณ์เชิงบวกขึ้นบางด้าน แต่คุณสมบัติการวัดเปลี่ยนไปด้วย จึงไม่ถือว่าการปรับภาษาแล้วจะคงคุณภาพเดิมโดยอัตโนมัติ</p></div>
        <div className="info"><h3>แยกรุ่นก่อนตีความ</h3><p className="muted">เก็บเวอร์ชันไว้กับผลและคำตอบที่ทำค้าง ผลรุ่นก่อนยังเปิดอ่านได้ ส่วนการเทียบใน Context Mode ใช้ชุดคำถามรุ่นปัจจุบันเดียวกัน การคงสูตรคะแนนและทิศทางข้อไม่ได้พิสูจน์ว่ารุ่นใหม่วัดได้เท่ารุ่นเดิม</p></div>
      </div>
      <h2 className="section-title" style={{marginTop:28}}>สิ่งที่ต้องทดสอบกับผู้ใช้จริง</h2>
      <p className="muted">เริ่มจากให้ผู้เชี่ยวชาญทบทวนว่าแต่ละข้อวัดตรงมิติ แล้วสัมภาษณ์ผู้ใช้ให้เล่าว่าเข้าใจคำถามอย่างไร ตามแนวทางของ Boateng และคณะ (2018) ซึ่งเสนอผู้เข้าร่วม 5–15 คนใน 2–3 รอบ จากนั้นทดลองเก็บข้อมูลเพื่อตรวจโครงสร้างมิติ ความเที่ยง ความตรง และความเทียบเท่าระหว่างรุ่นหรือบริบท ก่อนอ้างความน่าเชื่อถือเชิงจิตมิติ</p>
      <h2 className="section-title" style={{marginTop:28}}>References</h2>
      <div style={{display:"grid",gap:10}}>
        {REFERENCES.map((r,i)=><div className="info" key={i}><span className="pill">{r.group}</span><p className="muted">{r.citation}</p>{r.doi&&<a href={`https://doi.org/${r.doi}`} target="_blank" rel="noreferrer">อ่านงานวิจัย · DOI: {r.doi} ↗</a>}</div>)}
      </div>
    </section>
  </main>
}
