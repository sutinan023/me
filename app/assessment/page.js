import Link from 'next/link';
import LegacyAssessment from '@/components/assessment/LegacyAssessment';
import ContextAssessment from '@/components/contexts/ContextAssessment';
import { getContext } from '@/data/contextQuestions';

export default async function AssessmentPage({ searchParams }) {
  const params=await searchParams;
  if(!Object.hasOwn(params,'context')) return <LegacyAssessment />;
  if(typeof params.context!=='string'||!getContext(params.context)) return <main className="wrap"><section className="card"><h1 className="section-title">ไม่พบบริบทนี้</h1><p role="alert">กรุณาเลือกบริบทจาก Context Mode</p><Link className="btn btn-primary" href="/contexts">เลือกบริบท</Link></section></main>;
  return <ContextAssessment key={params.context} context={params.context} />;
}
