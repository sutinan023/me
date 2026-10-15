import { SIGN_TYPES, SIGN_ILLUSTRATIONS } from "@/data/personalSigns";
import SignPreview from "@/components/signs/SignPreview";
export const metadata = {
  title: "Personal Signs · Personality Type Explorer",
  description: "สำรวจ illustration และความหมายของ Personal Sign ทั้ง 16 Type",
};
export default function SignsPage() {
  return (
    <main className="wrap">
      <p className="eyebrow">SIXTEEN SIGNS. MANY WAYS TO BE YOU.</p>
      <h1 className="section-title">สัญลักษณ์ที่ชวนให้ค้นพบ</h1>
      <p className="muted">
        แตะภาพเพื่อสำรวจความหมายทั้งสี่ด้าน ทุก Type มีคุณค่าเท่ากัน
        และเป็นจุดเริ่มต้นของการเข้าใจตัวเอง
      </p>
      <section
        className="sign-gallery"
        aria-label="Personal Signs ทั้ง 16 Type"
      >
        {SIGN_TYPES.map((type) => (
          <article className="sign-gallery-card" key={type}>
            <SignPreview type={type} />
            <h2>{type}</h2>
            <p>{SIGN_ILLUSTRATIONS[type].name}</p>
          </article>
        ))}
      </section>
      <p className="muted sign-note">
        รูปทรงเป็นภาษาภาพ ไม่ใช่ข้อสรุปว่าคนใน Type เดียวกันต้องเหมือนกัน
      </p>
    </main>
  );
}
