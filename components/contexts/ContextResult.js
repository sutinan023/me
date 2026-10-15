'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getContext } from '@/data/contextQuestions';
import { getContextSession } from '@/lib/contextStorage';
import { buildReport } from '@/lib/report';
import { CONTEXT_COPY } from '@/lib/contextScoring';
import DimensionBar from '@/components/DimensionBar';
import SignPreview from '@/components/signs/SignPreview';
import { contextDate } from './ContextComparison';

export default function ContextResult({sessionId}) {
  const [result,setResult]=useState(null),[error,setError]=useState('');
  useEffect(()=>{try{setResult(getContextSession(sessionId));}catch(e){setError(e.message);}},[sessionId]);
  if(error) return <main className="wrap"><section className="card"><h1 className="section-title">เปิดผลบริบทไม่ได้</h1><p role="alert">{error}</p><Link className="btn btn-primary" href="/contexts">กลับ Context Mode</Link></section></main>;
  if(!result) return <main className="wrap"><section className="card" role="status">กำลังโหลดผลบริบท…</section></main>;
  const meta=getContext(result.context),report=buildReport(result);
  return <main className="wrap context-result"><section className="card">
    <p className="eyebrow">{meta.label} · สรุปผลตามบริบท</p><h1 className="section-title">{meta.subtitle}</h1><p className="context-small">{contextDate(result.createdAt)} · {result.questionnaireVersion}</p>
    <div className="context-result-sign"><SignPreview type={result.type}/><h2>ใกล้ {result.type}</h2><p>{result.name}</p></div>
    <p className="context-reflection">{CONTEXT_COPY}</p><p className="muted">{report.summary}</p>
    {report.dimensions.map(d=><div key={d.key}><h3>{d.title}{d.balanced?' · ใกล้กึ่งกลาง':''}</h3><DimensionBar left={d.left} right={d.right} value={d.value} leftPct={d.leftPct} rightPct={d.rightPct}/></div>)}
    <div className="grid2 context-insights"><section className="info"><h3>จุดเด่นจากคำตอบนี้</h3><ul>{report.strengths.map(s=><li key={s}>{s}</li>)}</ul></section><section className="info"><h3>Growth tips</h3><ul>{report.tips.map(s=><li key={s}>{s}</li>)}</ul></section></div>
    <div className="context-card-actions"><Link className="btn btn-primary" href="/contexts">เทียบบริบทของฉัน</Link><Link className="btn btn-soft" href={`/report?contextSession=${result.id}`}>ดูสรุปผล · PNG / PDF ↗</Link></div>
    <p className="context-small">ผลนี้เก็บเฉพาะใน browser นี้ รุ่นนี้ยังไม่แชร์บริบทสาธารณะหรือเทียบกับผลของคนอื่น</p>
  </section></main>;
}
