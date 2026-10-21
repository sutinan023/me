import Link from 'next/link';

export default function NoSavedResult() {
  return (
    <main className="wrap">
      <section className="card">
        <p className="eyebrow">YOUR JOURNEY STARTS HERE</p>
        <h1 className="section-title">ยังไม่มีผลประเมินของคุณ</h1>
        <p className="muted">เริ่มสำรวจตัวเองผ่าน 48 คำถาม แล้วกลับมาค้นพบ Personal Sign และแนวโน้มทั้ง 4 มิติของคุณ</p>
        <p className="muted">ผลประเมินจะเก็บไว้ในเบราว์เซอร์ที่คุณใช้ทำแบบประเมิน</p>
        <Link className="btn btn-primary" href="/assessment">เริ่มสำรวจตัวเอง ↗</Link>
      </section>
    </main>
  );
}
