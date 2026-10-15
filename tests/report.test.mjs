import test from 'node:test';
import assert from 'node:assert/strict';
import { decodeLocalShare, encodeLocalShare } from '../lib/share.js';

const profile = { type: 'ISFJ', dims: { EI: 79, SN: 46, TF: 56, JP: 38 }, answers: [1, 2, 3] };

test('shared results reject invalid scores and unknown types', () => {
  const token = value => Buffer.from(JSON.stringify(value)).toString('base64url');
  for (const invalid of [
    { v: 1, type: 'XXXX', ei: 79, sn: 46, tf: 56, jp: 38 },
    { v: 1, type: 'ISFJ', ei: -1, sn: 46, tf: 56, jp: 38 },
    { v: 1, type: 'ISFJ', ei: 101, sn: 46, tf: 56, jp: 38 },
    { v: 1, type: 'ISFJ', ei: '79', sn: 46, tf: 56, jp: 38 },
    { v: 1, type: 'ISFJ', ei: 79, sn: 46, tf: 56 },
  ]) assert.equal(decodeLocalShare(token(invalid)), null);
});

test('report links preserve scores without answers or private fields', async () => {
  const { getReportLinks } = await import('../lib/report.js');
  const links = getReportLinks(profile, 'https://example.com');
  assert.equal(new URL(links.report).pathname, '/report');
  assert.equal(new URL(links.compare).pathname, '/compare');
  assert.deepEqual(decodeLocalShare(new URL(links.report).searchParams.get('p')), { type: profile.type, dims: profile.dims });
  assert.deepEqual(decodeLocalShare(encodeLocalShare(profile)), { type: profile.type, dims: profile.dims });
});

test('report interprets balance and opposite preferences from actual scores', async () => {
  const { buildReport } = await import('../lib/report.js');
  const balanced = buildReport({ type: 'ISFJ', dims: { EI: 50, SN: 50, TF: 50, JP: 50 } });
  assert.ok(balanced.dimensions.every(d => d.balanced));
  assert.ok(balanced.dimensions.every(d => d.leftPct === 50 && d.rightPct === 50));
  const left = buildReport({ type: 'ESTJ', dims: { EI: 0, SN: 0, TF: 0, JP: 0 } });
  const right = buildReport({ type: 'INFP', dims: { EI: 100, SN: 100, TF: 100, JP: 100 } });
  assert.equal(left.dimensions.map(d => d.preference).join(''), 'ESTJ');
  assert.equal(right.dimensions.map(d => d.preference).join(''), 'INFP');
  assert.notEqual(left.summary, right.summary);
  assert.notDeepEqual(left.strengths, right.strengths);
  assert.notDeepEqual(left.tips, right.tips);
});

test('report supports all sixteen types and rejects corrupt stored results', async () => {
  const { buildReport } = await import('../lib/report.js');
  for (const a of 'EI') for (const b of 'SN') for (const c of 'TF') for (const d of 'JP') {
    const report = buildReport({ type: a+b+c+d, dims: { EI: a === 'E' ? 20 : 80, SN: b === 'S' ? 20 : 80, TF: c === 'T' ? 20 : 80, JP: d === 'J' ? 20 : 80 } });
    assert.equal(report.dimensions.length, 4);
    assert.equal(report.strengths.length, 3);
    assert.equal(report.tips.length, 3);
  }
  assert.throws(() => buildReport({ type: 'ISFJ', dims: { EI: NaN } }));
});
