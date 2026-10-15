import QRCode from 'qrcode';
import { getSignAsset } from '../data/personalSigns.js';
import { createReportPdfBytes } from './reportPdf.js';

const WIDTH = 794;
const HEIGHT = 1123;

// Draw one fixed A4 composition for the preview and both downloadable formats.
export async function renderReport(report, compareUrl=null, metadata=null) {
  await document.fonts.ready;
  const canvas = document.createElement('canvas');
  canvas.width = WIDTH * 2;
  canvas.height = HEIGHT * 2;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('อุปกรณ์นี้ไม่รองรับการสร้างภาพ');
  ctx.scale(2, 2);
  const font = getComputedStyle(document.body).fontFamily;
  const text = (value, x, y, size=14, weight=400, color='#29483c') => {
    ctx.font = `${weight} ${size}px ${font}`;
    ctx.fillStyle = color;
    ctx.fillText(value, x, y);
  };
  const paragraph = (value, x, y, width, size=14, lineHeight=23, color='#566358') => {
    ctx.font = `400 ${size}px ${font}`;
    const segments = typeof Intl.Segmenter === 'function'
      ? [...new Intl.Segmenter('th', { granularity: 'word' }).segment(value)].map(s => s.segment)
      : Array.from(value);
    let line = '';
    for (const segment of segments) {
      if (line && ctx.measureText(line + segment).width > width) {
        text(line.trim(), x, y, size, 400, color);
        y += lineHeight;
        line = segment.trimStart();
      } else line += segment;
    }
    if (line) text(line.trim(), x, y, size, 400, color);
    return y + lineHeight;
  };
  const rect = (x,y,w,h,color,radius=0) => {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.roundRect(x,y,w,h,radius);
    ctx.fill();
  };
  const asset = new Image();
  asset.src = getSignAsset(report.type);
  let qr=null;
  if(compareUrl) {
    qr = new Image();
    qr.src = await QRCode.toDataURL(compareUrl, { width: 336, margin: 4, errorCorrectionLevel: 'M', color: { dark: '#29483c', light: '#ffffff' } });
  }
  await Promise.all([asset.decode(),qr?.decode()]);
  rect(0,0,WIDTH,HEIGHT,'#f8f6f0');
  rect(24,24,746,1075,'#fdfcf8',18);
  text('✳  PERSONALITY TYPE EXPLORER',50,58,12,700);
  text('สรุปผลของคุณ · 1 หน้า',535,58,10,500,'#7d8376');
  rect(50,78,694,1,'#e2e6db');
  text(metadata?`${metadata.contextLabel} · CONTEXT MODE`:'A LITTLE MORE YOU.',50,112,11,600,'#977e59');
  text(report.type,46,193,82,800);
  text(report.name,50,232,22,600);
  ctx.drawImage(asset,560,100,180,180);
  if(metadata) text(`${new Date(metadata.createdAt).toLocaleString('th-TH',{timeZone:'Asia/Bangkok',dateStyle:'medium',timeStyle:'short'})} · ${metadata.questionnaireVersion} · ใกล้ ${report.type}`,50,254,11,400,'#7d8376');
  paragraph(report.summary,50,287,680,15,26);
  text('01  /  YOUR FOUR DIMENSIONS',50,382,11,700,'#977e59');
  report.dimensions.forEach((d,i) => {
    const y = 416+i*67;
    text(d.title,50,y,14,700);
    text(d.balanced ? 'ใกล้กึ่งกลาง' : d.description,420,y,12,400,'#7d8376');
    text(`${d.left} ${d.leftPct}%`,50,y+24,12,600);
    text(`${d.right} ${d.rightPct}%`,677,y+24,12,600);
    rect(139,y+14,508,10,'#e5e9df',5);
    rect(139,y+14,254,10,'#c7d4be',5);
    rect(392,y+10,1,18,'#ffffff');
    ctx.beginPath();
    ctx.arc(139+(508*d.value/100),y+19,7,0,Math.PI*2);
    ctx.fillStyle='#355e49'; ctx.fill();
    ctx.strokeStyle='#ffffff'; ctx.lineWidth=2; ctx.stroke();
    text(`${d.labels[0]}  ↔  ${d.labels[1]}`,139,y+44,10,400,'#7d8376');
  });
  rect(50,681,694,278,'#eef1e8',14);
  text('02  /  จุดเด่นของคุณ',70,716,16,700);
  text('03  /  GROWTH TIPS',420,716,16,700);
  rect(395,737,1,194,'#dce2d3');
  report.strengths.forEach((value,i) => {
    text(`0${i+1}`,70,752+i*66,11,700,'#977e59');
    paragraph(value,101,752+i*66,270,14,22);
  });
  report.tips.forEach((value,i) => {
    text(`0${i+1}`,420,752+i*66,11,700,'#977e59');
    paragraph(value,451,752+i*66,270,14,22);
  });
  text(metadata?'คุณคนเดิม ในบริบทที่ต่างกัน':'เข้าใจตัวเอง แล้วเข้าใจกัน',50,1001,18,700);
  paragraph(metadata?'จากคำตอบครั้งนี้ preference ที่แสดงออกอาจต่างกัน ไม่ได้หมายความว่า type จริงเปลี่ยน':'สแกน QR เพื่อเปรียบเทียบกับฉัน ผ่านคะแนนทั้ง 4 มิติ',50,1029,qr?525:680,12,20);
  paragraph('ผลนี้เป็นแนวโน้มเพื่อสำรวจตัวเอง ไม่ใช่ป้ายกำกับตายตัว',50,1055,525,11,19,'#7d8376');
  text('Research-informed prototype · ไม่ใช่ MBTI® อย่างเป็นทางการ',50,1080,10,400,'#7d8376');
  if(qr) ctx.drawImage(qr,640,978,104,104);
  return canvas;
}

export async function canvasBlob(canvas, type='image/png') {
  const blob = await new Promise(resolve => canvas.toBlob(resolve,type,0.96));
  if (!blob) throw new Error('สร้างไฟล์ไม่สำเร็จ');
  return blob;
}

// A single JPEG image in a standard one-page PDF keeps Thai shaping identical
// to the canvas, with no remote renderer or font downloads at export time.
export async function reportPdf(canvas, compareUrl=null) {
  const jpeg = new Uint8Array(await (await canvasBlob(canvas,'image/jpeg')).arrayBuffer());
  return new Blob([createReportPdfBytes(jpeg,canvas.width,canvas.height,compareUrl)],{type:'application/pdf'});
}

export function downloadBlob(blob, filename) {
  const url=URL.createObjectURL(blob);
  const link=document.createElement('a');
  link.href=url; link.download=filename;
  document.body.appendChild(link); link.click(); link.remove();
  setTimeout(() => URL.revokeObjectURL(url),10000);
}
