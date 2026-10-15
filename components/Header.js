import Link from "next/link";
export default function Header() {
  return (
    <header className="site-header">
      <div className="site-header-inner">
        <Link href="/" className="site-brand">
          <span aria-hidden="true">✳</span>
          <span>
            Personality
            <br />
            <strong>Type Explorer</strong>
          </span>
        </Link>
        <nav aria-label="เมนูหลัก">
          <Link href="/result">ผลของฉัน</Link>
          <Link href="/report">สรุปผล</Link>
          <Link href="/contexts">บริบทของฉัน</Link>
          <Link href="/history">ประวัติ</Link>
          <Link href="/compare">เปรียบเทียบ</Link>
          <Link href="/signs">สัญลักษณ์</Link>
          <Link href="/methodology">หลักการ</Link>
        </nav>
      </div>
    </header>
  );
}
