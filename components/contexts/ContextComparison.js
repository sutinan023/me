import { getContext } from '@/data/contextQuestions';
import { compareContextSessions, CONTEXT_COPY } from '@/lib/contextScoring';

const LABELS={EI:'การเติมพลัง',SN:'การรับข้อมูล',TF:'การตัดสินใจ',JP:'จังหวะการใช้ชีวิต'};
const PAIRS={EI:['E','I'],SN:['S','N'],TF:['T','F'],JP:['J','P']};
export const contextDate=value=>new Date(value).toLocaleString('th-TH',{timeZone:'Asia/Bangkok',dateStyle:'medium',timeStyle:'short'});

export default function ContextComparison({general,sessions}) {
  return <section className="context-comparisons" aria-label="เปรียบเทียบบริบทของฉัน">
    {sessions.map(session=>{
      const data=compareContextSessions(general,session),meta=getContext(session.context);
      return <article className="card context-comparison" key={session.id}>
        <p className="eyebrow">SAME YOU. DIFFERENT SITUATIONS.</p><h3>{meta.subtitle} เทียบกับ General</h3>
        <p className="context-small">General · ใกล้ {general.type} · {contextDate(general.createdAt)}<br/>{meta.label} · ใกล้ {session.type} · {contextDate(session.createdAt)}</p>
        <div className="context-legend"><span>● General</span><span>◆ {meta.label}</span></div>
        {data.rows.map(row=><div className="context-spectrum" key={row.key}>
          <div className="context-progress-text"><strong>{LABELS[row.key]}</strong><span>{row.delta===0?'เท่ากัน':`${row.delta>0?'+':''}${row.delta} จุด → ${row.toward}`}</span></div>
          <div className="context-spectrum-track"><i className="context-midline"/><i className="context-marker general" style={{left:`${row.generalValue}%`}}/><i className="context-marker specific" style={{left:`${row.contextValue}%`}}/></div>
          <div className="context-progress-text context-small"><span>{PAIRS[row.key][0]}</span><span>50</span><span>{PAIRS[row.key][1]}</span></div>
          <p className="context-small">{row.key}: General {row.generalValue} → {meta.label} {row.contextValue}{row.nearMidpoint?' · บริบทนี้ใกล้กึ่งกลาง':''}{row.crossedMidpoint?' · ข้ามกึ่งกลาง แต่ไม่ได้หมายความว่า type จริงเปลี่ยน':''}</p>
        </div>)}
        <p className="context-reflection">{data.largestKeys.length?`ความต่างที่มากที่สุดในคำตอบชุดนี้: ${data.largestKeys.map(k=>LABELS[k]).join(' / ')}`:'คะแนนทั้ง 4 มิติเท่ากันในคำตอบชุดนี้'}</p>
        <p className="muted">{CONTEXT_COPY}</p><p className="context-small">วันเวลาที่ตอบและการตีความคำถามอาจเกี่ยวข้องด้วย General เป็นภาพอ้างอิง ไม่ใช่ข้อสรุปว่าเป็นตัวตนที่แท้จริง</p>
      </article>;
    })}
  </section>;
}
