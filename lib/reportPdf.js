export function createReportPdfBytes(jpeg,width,height,compareUrl=null) {
  if(!(jpeg instanceof Uint8Array)||!Number.isInteger(width)||!Number.isInteger(height)||width<1||height<1) throw Error('Invalid PDF image');
  const encode=value=>new TextEncoder().encode(value);
  const parts=[encode('%PDF-1.4\n')],offsets=[0];let length=parts[0].length;
  const append=bytes=>{parts.push(bytes);length+=bytes.length;};
  const object=(id,body,stream)=>{
    offsets[id]=length;append(encode(`${id} 0 obj\n${body}`));
    if(stream){append(encode('\nstream\n'));append(stream);append(encode('\nendstream'));}
    append(encode('\nendobj\n'));
  };
  object(1,'<< /Type /Catalog /Pages 2 0 R >>');
  object(2,'<< /Type /Pages /Kids [3 0 R] /Count 1 >>');
  object(3,`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595.28 841.89] /Resources << /XObject << /Report 4 0 R >> >> /Contents 5 0 R ${compareUrl?'/Annots [6 0 R]':''} >>`);
  object(4,`<< /Type /XObject /Subtype /Image /Width ${width} /Height ${height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpeg.length} >>`,jpeg);
  const content=encode('q\n595.28 0 0 841.89 0 0 cm\n/Report Do\nQ\n');
  object(5,`<< /Length ${content.length} >>`,content);
  if(compareUrl) {
    const url=new URL(compareUrl).href.replace(/([\\()])/g,'\\$1');
    object(6,`<< /Type /Annot /Subtype /Link /Rect [480 30 558 109] /Border [0 0 0] /A << /S /URI /URI (${url}) >> >>`);
  }
  const xref=length,count=offsets.length;
  append(encode(`xref\n0 ${count}\n0000000000 65535 f \n${offsets.slice(1).map(o=>`${String(o).padStart(10,'0')} 00000 n \n`).join('')}trailer\n<< /Size ${count} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`));
  const result=new Uint8Array(length);let at=0;
  for(const part of parts){result.set(part,at);at+=part.length;}
  return result;
}
