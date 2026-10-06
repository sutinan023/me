import { clarity } from "@/lib/scoring";

export default function DimensionBar({left,right,value,leftPct,rightPct}){
  return <div style={{padding:"16px 0",borderBottom:"1px solid var(--line)"}}>
    <div style={{display:"flex",justifyContent:"space-between",fontWeight:900,marginBottom:8}}>
      <span>{left} {leftPct}%</span><span>{right} {rightPct}%</span>
    </div>
    <div className="bar"><div className="pin" style={{left:`${value}%`}}/></div>
    <div style={{textAlign:"center",fontSize:12,color:"var(--muted)",marginTop:8}}>{clarity(value)}</div>
  </div>
}
