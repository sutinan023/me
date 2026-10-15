'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { getLatestResult } from '@/lib/storage';
import { decodeLocalShare, isValidResult } from '@/lib/share';
import { buildReport, getReportLinks } from '@/lib/report';
import { getContextSession } from '@/lib/contextStorage';
import { getContext } from '@/data/contextQuestions';

export default function ReportView() {
  const [state,setState]=useState({ loading: true });
  const [busy,setBusy]=useState('');
  const [message,setMessage]=useState('');
  const canvasRef=useRef(null);
  const actionRef=useRef(false);

  useEffect(() => {
    let cancelled=false;
    let previewUrl;
    async function load() {
      let contextual=false;
      try {
        const params=new URLSearchParams(window.location.search);
        let profile;
        contextual=params.has('contextSession');
        if(contextual && (params.has('p')||params.has('friend')||params.getAll('contextSession').length!==1)) throw Error('กรุณาเปิดลิงก์รายงานเพียงรูปแบบเดียว');
        const shared=params.has('p') || params.has('friend');
        if(contextual) profile=getContextSession(params.get('contextSession'));
        else if (params.has('friend')) {
          const response=await fetch(`/api/share/${encodeURIComponent(params.get('friend'))}`);
          const data=await response.json();
          if (!response.ok) throw new Error(data.error || 'ไม่พบรายงานที่แชร์');
          profile=data.result;
        } else if (params.has('p')) profile=decodeLocalShare(params.get('p'));
        else profile=getLatestResult();
        if (!isValidResult(profile)) throw new Error('ข้อมูลรายงานไม่ถูกต้องหรือไม่สมบูรณ์');
        const report=buildReport(profile);
        const links=contextual?{report:null,compare:null}:getReportLinks(profile,window.location.origin);
        const metadata=contextual?{contextLabel:getContext(profile.context).label,questionnaireVersion:profile.questionnaireVersion,createdAt:profile.createdAt}:null;
        // Preserve database expiry/revocation for both the report link and QR.
        if (params.has('friend')) {
          const token=encodeURIComponent(params.get('friend'));
          links.report=`${window.location.origin}/report?friend=${token}`;
          links.compare=`${window.location.origin}/compare?friend=${token}`;
        }
        const { renderReport, canvasBlob }=await import('@/lib/reportExport');
        const canvas=await renderReport(report,links.compare,metadata);
        previewUrl=URL.createObjectURL(await canvasBlob(canvas));
        if (cancelled) { URL.revokeObjectURL(previewUrl); return; }
        canvasRef.current=canvas;
        setState({ loading:false, report, links, previewUrl, shared, contextual, metadata, sessionId:profile.id, contextKey:profile.context });
      } catch (error) {
        if (!cancelled) setState({ loading:false, error:error.message || 'เปิดรายงานไม่สำเร็จ', contextual });
      }
    }
    load();
    return () => { cancelled=true; if (previewUrl) URL.revokeObjectURL(previewUrl); };
  },[]);

  async function action(kind) {
    if (actionRef.current || !state.report) return;
    actionRef.current=true;
    setBusy(kind); setMessage('');
    try {
      if (kind === 'copy') {
        await navigator.clipboard.writeText(state.links.report);
        setMessage('คัดลอกลิงก์สรุปผลแล้ว');
      } else if (kind === 'share') {
        if (navigator.share) await navigator.share({ title:`${state.report.type} · สรุปผลของฉัน`, text:'มารู้จักจังหวะของฉันผ่าน 4 มิติ', url:state.links.report });
        else { await navigator.clipboard.writeText(state.links.report); setMessage('คัดลอกลิงก์สรุปผลแล้ว'); }
      } else {
        const { canvasBlob, reportPdf, downloadBlob }=await import('@/lib/reportExport');
        const blob=kind === 'pdf' ? await reportPdf(canvasRef.current,state.links.compare) : await canvasBlob(canvasRef.current);
        downloadBlob(blob,`personality-report-${state.contextual?`${state.contextKey}-${state.sessionId}-`:''}${state.report.type.toLowerCase()}.${kind}`);
        setMessage(`ดาวน์โหลด ${kind.toUpperCase()} แล้ว`);
      }
    } catch (error) {
      if (error.name !== 'AbortError') setMessage('ทำรายการไม่สำเร็จ กรุณาลองอีกครั้ง หรือคัดลอกลิงก์ด้านล่าง');
    } finally { actionRef.current=false; setBusy(''); }
  }

  if (state.loading) return <main className="wrap report-wrap"><section className="card" role="status">กำลังจัดหน้าสรุปผลของคุณ…</section></main>;
  if (state.error) return <main className="wrap report-wrap"><section className="card"><h1 className="section-title">เปิดสรุปผลไม่ได้</h1><p role="alert">{state.error}</p><Link className="btn btn-primary" href={state.contextual?'/contexts':'/result'}>กลับไปดูผลของฉัน</Link></section></main>;
  const { report,links }=state;
  return <main className="wrap report-wrap">
    <div className="report-heading">
      <div><p className="eyebrow">A KEEPSAKE OF WHO YOU ARE TODAY.</p><h1 className="section-title">{state.contextual?`${state.metadata.contextLabel} · สรุปผลของคุณ`:state.shared ? 'สรุปผลที่แชร์ให้คุณ' : 'สรุปผลของคุณ'}</h1><p className="muted">{state.contextual?`${state.metadata.questionnaireVersion} · ${new Date(state.metadata.createdAt).toLocaleString('th-TH',{timeZone:'Asia/Bangkok'})}`:'หนึ่งหน้าเพื่อเข้าใจตัวเอง เก็บไว้ หรือส่งต่อให้ใครสักคน'}</p></div>
      <Link className="report-back" href={state.contextual?'/contexts':'/result'}>← {state.contextual?'Context Mode':'ผลของฉัน'}</Link>
    </div>
    <section className="report-toolbar" aria-label="บันทึกและแชร์สรุปผล">
      <button className="btn btn-primary" disabled={!!busy} onClick={() => action('png')}>{busy === 'png' ? 'กำลังสร้าง…' : '↓ ดาวน์โหลด PNG'}</button>
      <button className="btn btn-soft" disabled={!!busy} onClick={() => action('pdf')}>{busy === 'pdf' ? 'กำลังสร้าง…' : '↓ ดาวน์โหลด PDF'}</button>
      {!state.contextual&&<><button className="btn btn-soft" disabled={!!busy} onClick={() => action('copy')}>คัดลอกลิงก์</button>
      <button className="btn btn-soft" disabled={!!busy} onClick={() => action('share')}>แชร์สรุปผล ↗</button></>}
    </section>
    <p className="report-status" role="status" aria-live="polite">{message || (state.contextual?'A4 · 1 หน้า · เก็บใน browser นี้ · รุ่นนี้ยังไม่แชร์บริบทสาธารณะ':'A4 · 1 หน้า · QR สำหรับ Compare รวมอยู่ในไฟล์')}</p>
    <figure className="report-preview">
      {/* The exported bitmap is the preview itself, avoiding capture drift. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={state.previewUrl} width="1588" height="2246" alt={`สรุปผล ${report.type}${state.contextual?` · ${state.metadata.contextLabel}`:''}: ภาพรวม, 4 มิติ, จุดเด่น, Growth tips อ่านรายละเอียดแบบข้อความด้านล่าง`} />
      <figcaption><a href={state.previewUrl} target="_blank" rel="noopener noreferrer">เปิดภาพขนาดเต็ม ↗</a><a href={state.contextual?'/contexts':links.compare}>{state.contextual?'เทียบบริบทของฉัน ↗':'เปรียบเทียบกับผลนี้ ↗'}</a></figcaption>
    </figure>
    <details className="report-text"><summary>อ่านสรุปผลแบบข้อความ</summary><article>
      <h2>{report.type} · {report.name}</h2><p>{report.summary}</p>
      <h3>4 มิติของคุณ</h3><ul>{report.dimensions.map(d => <li key={d.key}><strong>{d.title}: {d.left} {d.leftPct}% / {d.right} {d.rightPct}%</strong> — {d.description}</li>)}</ul>
      <h3>จุดเด่น</h3><ul>{report.strengths.map(s => <li key={s}>{s}</li>)}</ul>
      <h3>Growth tips</h3><ul>{report.tips.map(t => <li key={t}>{t}</li>)}</ul>
      <p>อ่านผลเป็นแนวโน้มเพื่อสำรวจตัวเอง ไม่ใช่ป้ายกำกับตายตัว · Research-informed prototype · ไม่ใช่ MBTI® อย่างเป็นทางการ</p>
    </article></details>
    {!state.contextual&&<div className="report-link-box"><label htmlFor="report-link">ลิงก์แชร์สรุปผล</label><input id="report-link" readOnly value={links.report} onFocus={e => e.target.select()} /><p className="muted">ผู้ที่มีลิงก์นี้เห็น Type และ 4 คะแนนได้ โดยไม่มีคำตอบแบบประเมิน 48 ข้อ</p></div>}
  </main>;
}
