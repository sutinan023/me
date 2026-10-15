import Link from "next/link";
import SignArtwork from "@/components/signs/SignArtwork";
export default function Home() {
  return (
    <main className="wrap">
      <section className="home-hero">
        <div>
          <p className="eyebrow">A LITTLE CURIOSITY. A LITTLE MORE YOU.</p>
          <h1 className="hero-title">
            ค่อย ๆ ค้นพบ
            <br />
            <em>ความเป็นคุณ</em>
          </h1>
          <p className="muted home-intro">
            เข้าใจตัวเองให้มากกว่า 4 ตัวอักษร
            <br />
            ผ่านการเติมพลัง การรับข้อมูล การตัดสินใจ และจังหวะการใช้ชีวิต
          </p>
          <div className="home-actions">
            <Link className="btn btn-primary" href="/assessment">
              เริ่มสำรวจตัวเอง ↗
            </Link>
            <Link className="btn btn-soft" href="/result">
              ดูผลเดิมของฉัน
            </Link>
          </div>
          <div className="home-facts">
            <span>48 คำถาม</span>
            <span>8–12 นาที</span>
            <span>ไม่ต้องสมัครสมาชิก</span>
          </div>
        </div>
        <div className="home-art">
          <SignArtwork type="ISFJ" size={470} priority />
          <p>
            ISFJ · แสงอุ่นที่โอบล้อม <span>ตัวอย่าง Personal Sign</span>
          </p>
        </div>
      </section>
      <section className="home-journey">
        <div>
          <span>01 / EXPLORE</span>
          <h2>เริ่มจากความสงสัย</h2>
          <p>ตอบตามสิ่งที่ใกล้กับตัวคุณ แล้วเห็นแนวโน้มบน spectrum</p>
        </div>
        <div>
          <span>02 / DISCOVER</span>
          <h2>ค่อย ๆ เปิดความหมาย</h2>
          <p>ค้นพบ Personal Sign และเชื่อมโยงกับประสบการณ์ของตัวเอง</p>
        </div>
        <div>
          <span>03 / CONNECT</span>
          <h2>เข้าใจตัวเองและอีกคน</h2>
          <p>เก็บผลย้อนหลัง แชร์ และเปรียบเทียบจังหวะที่เหมือนหรือต่างกัน</p>
        </div>
      </section>
      <div className="home-footnote">
        <span>✳</span>
        <p>
          สัญลักษณ์ที่ชวนให้ค้นพบ ไม่ใช่กำหนดว่าเราเป็นใคร
          <br />
          <small>
            Research-informed · ไม่ใช่แบบประเมิน MBTI® อย่างเป็นทางการ
          </small>
        </p>
      </div>
    </main>
  );
}
