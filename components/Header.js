import Link from "next/link";

export default function Header(){
  return <header className="wrap" style={{paddingBottom:8}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:12,flexWrap:"wrap"}}>
      <Link href="/" style={{fontWeight:900,fontSize:18}}>✦ Personality Type Explorer</Link>
      <nav style={{display:"flex",gap:8,flexWrap:"wrap"}}>
        <Link className="btn btn-soft" href="/result">My result</Link>
        <Link className="btn btn-soft" href="/history">History</Link>
        <Link className="btn btn-soft" href="/compare">Compare</Link>
        <Link className="btn btn-soft" href="/methodology">Methodology</Link>
      </nav>
    </div>
  </header>
}
