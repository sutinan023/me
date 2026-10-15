"use client";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from 'next/navigation';
import SignPreview from "@/components/signs/SignPreview";
import DimensionBar from "@/components/DimensionBar";
import InsightTabs from "@/components/InsightTabs";
import AskAboutMe from "@/components/AskAboutMe";
import SharePanel from "@/components/SharePanel";
import { adjacentTypes } from "@/lib/scoring";
import { getLatestResult } from "@/lib/storage";
import ContextResult from "@/components/contexts/ContextResult";
import Link from "next/link";

function ResultContent() {
  const [p, setP] = useState(null);
  const [contextId,setContextId]=useState(null);
  useEffect(() => {
    const params=new URLSearchParams(window.location.search);
    if(params.has('contextSession')) setContextId(params.getAll('contextSession').length===1?params.get('contextSession'):'');
    else setP(getLatestResult());
  }, []);
  if(contextId!==null) return <ContextResult sessionId={contextId}/>;
  if (!p)
    return (
      <main className="wrap">
        <section className="card">Loading…</section>
      </main>
    );

  const adjacent = adjacentTypes(p.type, p.dims);
  return (
    <main className="wrap">
      <section className="card">
        <div className="context-card-actions"><Link className="btn btn-soft" href="/contexts">สำรวจ Context Mode ↗</Link></div>
        <div style={{ textAlign: "center" }}>
          <p className="eyebrow">YOUR PERSONAL SIGN</p>
          <SignPreview type={p.type} />
          <span className="pill">Your closest personality pattern</span>
          <div
            style={{
              fontSize: 64,
              fontWeight: 900,
              letterSpacing: 5,
              marginTop: 10,
            }}
          >
            {p.type}
          </div>
          <div style={{ fontSize: 20, fontWeight: 800, color: "var(--coral)" }}>
            {p.name || "Your personality pattern"}
          </div>
          <p className="muted">
            อ่านผลเป็นแนวโน้มบน spectrum ไม่ใช่ป้ายกำกับตายตัว
          </p>
        </div>

        <div style={{ marginTop: 24 }}>
          <DimensionBar
            left="E"
            right="I"
            value={p.dims.EI}
            leftPct={100 - p.dims.EI}
            rightPct={p.dims.EI}
          />
          <DimensionBar
            left="S"
            right="N"
            value={p.dims.SN}
            leftPct={100 - p.dims.SN}
            rightPct={p.dims.SN}
          />
          <DimensionBar
            left="T"
            right="F"
            value={p.dims.TF}
            leftPct={100 - p.dims.TF}
            rightPct={p.dims.TF}
          />
          <DimensionBar
            left="J"
            right="P"
            value={p.dims.JP}
            leftPct={100 - p.dims.JP}
            rightPct={p.dims.JP}
          />
        </div>

        {adjacent.length > 0 && (
          <div className="info" style={{ marginTop: 18 }}>
            <strong>Adjacent pattern:</strong> {adjacent.join(", ")}{" "}
            <span className="muted">— มีบางมิติอยู่ใกล้ 50/50</span>
          </div>
        )}
        <InsightTabs />
        <AskAboutMe profile={p} />
        <SharePanel profile={p} />
      </section>
    </main>
  );
}

function ResultRoute() {
  const params=useSearchParams();
  return <ResultContent key={params.toString()}/>;
}

export default function ResultPage() {
  return <Suspense fallback={<main className="wrap"><section className="card" role="status">กำลังโหลดผล…</section></main>}><ResultRoute/></Suspense>;
}
