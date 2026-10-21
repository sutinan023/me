'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getLatestResult } from '@/lib/storage';

export default function SavedResultLink() {
  const [hasResult, setHasResult] = useState(false);

  useEffect(() => {
    setHasResult(!!getLatestResult());
  }, []);

  return hasResult ? <Link className="btn btn-soft" href="/result">ดูผลเดิมของฉัน</Link> : null;
}
