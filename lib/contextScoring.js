import { CONTEXT_VERSION, getContext, getContextQuestions } from '../data/contextQuestions.js';
import { scoreAssessment } from './scoring.js';

export const CONTEXT_COPY = 'บริบทอาจเกี่ยวข้องกับ preference ที่แสดงออกต่างกัน จากคำตอบครั้งนี้ ไม่ได้หมายความว่า type จริงของคุณเปลี่ยน';
export const DIMENSION_KEYS=['EI','SN','TF','JP'];
const PAIRS={EI:['E','I'],SN:['S','N'],TF:['T','F'],JP:['J','P']};

export function scoreContext(context,answers) {
  const questions=getContextQuestions(context);
  if(!Array.isArray(answers)||answers.length!==24||!answers.every(n=>Number.isInteger(n)&&n>=1&&n<=7)) throw new Error('กรุณาตอบให้ครบ 24 ข้อ');
  return {...scoreAssessment(questions,answers),context,questionnaireVersion:CONTEXT_VERSION};
}

export function compareContextSessions(general,other) {
  const valid=s=>getContext(s?.context) && s.questionnaireVersion===CONTEXT_VERSION && DIMENSION_KEYS.every(k=>Number.isFinite(s?.dims?.[k])&&s.dims[k]>=0&&s.dims[k]<=100);
  if(!valid(general)||!valid(other)||general.context!=='general'||other.context==='general') throw new Error('ต้องเทียบกับ General จากชุดคำถามเดียวกัน');
  const rows=DIMENSION_KEYS.map(key=>{
    const a=general.dims[key],b=other.dims[key],delta=b-a;
    return {key,generalValue:a,contextValue:b,delta,toward:delta===0?null:PAIRS[key][delta>0?1:0],nearMidpoint:Math.abs(b-50)<=5,crossedMidpoint:(a<50)!==(b<50)};
  });
  const max=Math.max(...rows.map(r=>Math.abs(r.delta)));
  return {rows,largestKeys:max===0?[]:rows.filter(r=>Math.abs(r.delta)===max).map(r=>r.key)};
}
