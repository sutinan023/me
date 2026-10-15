import { TYPE_NAMES } from './scoring.js';
import { encodeLocalShare, isValidResult } from './share.js';

const META = [
  { key: 'EI', left: 'E', right: 'I', title: 'การเติมพลัง', labels: ['โลกภายนอก', 'โลกภายใน'], balance: 'เติมพลังได้ทั้งจากผู้คนและเวลาส่วนตัว', strength: ['แลกเปลี่ยนความคิดและเชื่อมต่อกับผู้คน', 'ทบทวนอย่างลึกซึ้งและฟังอย่างตั้งใจ'], tip: ['พักเงียบ ๆ ก่อนตัดสินใจเรื่องสำคัญสัก 10 นาที', 'ลองแบ่งปันความคิดกับคนที่ไว้ใจ ก่อนคิดจนสมบูรณ์'] },
  { key: 'SN', left: 'S', right: 'N', title: 'การรับข้อมูล', labels: ['รายละเอียด', 'ความเป็นไปได้'], balance: 'มองได้ทั้งรายละเอียดและภาพรวม', strength: ['สังเกตรายละเอียดและเชื่อมกับประสบการณ์จริง', 'เชื่อมโยงภาพรวมและมองเห็นทางเลือกใหม่'], tip: ['ลองคิดทางเลือกใหม่อีกหนึ่งวิธี ก่อนเลือกวิธีที่คุ้นเคย', 'เปลี่ยนไอเดียใหญ่ให้เป็นก้าวเล็ก ๆ ที่ทำได้วันนี้'] },
  { key: 'TF', left: 'T', right: 'F', title: 'การตัดสินใจ', labels: ['หลักเหตุผล', 'คุณค่าและผู้คน'], balance: 'พิจารณาทั้งหลักเหตุผลและผลกระทบต่อผู้คน', strength: ['วิเคราะห์ทางเลือกด้วยเหตุผลและหลักเกณฑ์', 'รับฟังคุณค่าและใส่ใจผลกระทบต่อผู้คน'], tip: ['ก่อนสรุป ลองถามว่าแต่ละคนได้รับผลกระทบอย่างไร', 'เขียนข้อเท็จจริงและขอบเขตของตัวเอง ก่อนตอบตกลง'] },
  { key: 'JP', left: 'J', right: 'P', title: 'จังหวะการใช้ชีวิต', labels: ['มีโครงสร้าง', 'เปิดทางเลือก'], balance: 'ปรับจังหวะได้ทั้งการวางแผนและความยืดหยุ่น', strength: ['จัดลำดับความสำคัญและทำสิ่งต่าง ๆ ให้เสร็จ', 'ปรับตัวกับข้อมูลใหม่และเปิดรับความเปลี่ยนแปลง'], tip: ['เผื่อเวลาในแผน 10–20% สำหรับสิ่งที่คาดไม่ถึง', 'เลือกหนึ่งเรื่องที่จะทำให้เสร็จ พร้อมกำหนดเวลาชัดเจน'] },
];

export function buildReport(profile) {
  if (!isValidResult(profile)) throw new Error('ข้อมูลผลลัพธ์ไม่สมบูรณ์');
  const dimensions = META.map(meta => {
    const value = profile.dims[meta.key];
    const side = value < 50 ? 0 : 1;
    const balanced = Math.abs(value - 50) <= 5;
    return { ...meta, value, leftPct: 100-value, rightPct: value, balanced,
      preference: side ? meta.right : meta.left,
      description: balanced ? meta.balance : `เอนเอียงไปทาง${meta.labels[side]}`,
      strengthText: balanced ? meta.balance : meta.strength[side],
      tipText: balanced ? `ลองสังเกตว่าในบริบทไหนคุณใช้${meta.labels[0]} หรือ${meta.labels[1]}มากขึ้น` : meta.tip[side],
    };
  });
  const ranked = [...dimensions].sort((a,b) => Math.abs(b.value-50)-Math.abs(a.value-50));
  const strongest = ranked[0];
  const summary = dimensions.every(d => d.balanced)
    ? 'ทั้งสี่มิติของคุณอยู่ใกล้กึ่งกลาง คุณอาจใช้หลายแนวทางตามสถานการณ์ ลองอ่านคะแนนควบคู่กับประสบการณ์จริงของตัวเอง'
    : `แนวโน้มที่เด่นที่สุดของคุณคือ${strongest.title} — ${strongest.description} ส่วนมิติอื่นช่วยเติมภาพว่าคุณรับข้อมูล ตัดสินใจ และใช้ชีวิตในจังหวะแบบไหน`;
  return { type: profile.type, name: TYPE_NAMES[profile.type], summary, dimensions,
    strengths: ranked.slice(0,3).map(d => d.strengthText), tips: ranked.slice(0,3).map(d => d.tipText) };
}

export function getReportLinks(profile, origin) {
  const token = encodeLocalShare(profile);
  return { report: `${origin}/report?p=${token}`, compare: `${origin}/compare?p=${token}` };
}
