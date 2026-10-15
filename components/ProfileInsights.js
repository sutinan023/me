export default function ProfileInsights({report}) {
  return <div className="grid2 context-insights">
    <section className="info"><h2 className="profile-insight-title">จุดเด่นของคุณ</h2><ul>{report.strengths.map(text=><li key={text}>{text}</li>)}</ul></section>
    <section className="info"><h2 className="profile-insight-title">Growth tips</h2><ul>{report.tips.map(text=><li key={text}>{text}</li>)}</ul></section>
  </div>;
}
