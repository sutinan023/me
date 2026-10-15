import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
test('PDF serializer keeps one page and omits misleading links for contextual results',async()=>{
  const {createReportPdfBytes}=await import('../lib/reportPdf.js');
  const jpeg=readFileSync(new URL('./fixtures/report-pixel.jpg',import.meta.url));
  for(const url of [null,'https://example.com/compare?p=demo']) {
    const bytes=createReportPdfBytes(jpeg,1,1,url);
    const pdf=Buffer.from(bytes).toString('latin1');
    assert.ok(pdf.startsWith('%PDF-1.4'));
    assert.match(pdf,/\/Count 1/);
    assert.equal(pdf.includes('/Subtype /Link'),!!url);
    assert.equal(pdf.includes('/URI'),!!url);
    const lines=pdf.slice(pdf.indexOf('xref\n')).split('\n');
    const count=Number(lines[1].split(' ')[1]);
    for(let i=1;i<count;i++) {
      const offset=Number(lines[i+2].slice(0,10));
      assert.ok(pdf.slice(offset).startsWith(`${i} 0 obj`));
    }
  }
  assert.throws(()=>createReportPdfBytes(jpeg,0,1,null));
  assert.throws(()=>createReportPdfBytes(jpeg,1,NaN,null));
});
