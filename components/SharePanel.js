import Link from 'next/link';

export default function SharePanel({profile}) {
  const href=profile?.source==='context-assessment'
    ? `/report?contextSession=${encodeURIComponent(profile.id)}`
    : '/report';
  return <Link className="btn btn-primary" href={href}>บันทึกและแชร์ผล</Link>;
}
