import { CONTEXT_VERSION, getContext } from '../data/contextQuestions.js';
import { isValidResult } from './share.js';

export const CONTEXT_STORAGE_KEY='pte.contexts.v12';
const validDate=s=>typeof s==='string' && Number.isFinite(Date.parse(s));
const validVersion=s=>typeof s==='string' && /^context-v\d+\.\d+$/.test(s);
const validAnswers=a=>Array.isArray(a)&&a.length===24&&a.every(v=>v===null||(Number.isInteger(v)&&v>=1&&v<=7));
const validSession=s=>isValidResult(s)&&getContext(s.context)&&validVersion(s.questionnaireVersion)&&typeof s.id==='string'&&/^[a-zA-Z0-9-]{1,80}$/.test(s.id)&&validDate(s.createdAt)&&typeof s.name==='string'&&s.referencePeriod==='past-four-weeks'&&s.source==='context-assessment';
function storageError(code) {
  return Object.assign(new Error(code==='corrupt'?'ข้อมูล Context Mode ใน browser ไม่สมบูรณ์ ยังไม่ได้เขียนทับข้อมูลเดิม':'บันทึกหรืออ่านข้อมูลใน browser ไม่สำเร็จ ตรวจพื้นที่จัดเก็บแล้วลองอีกครั้ง'),{code});
}

export function createContextStore(storage) {
  function load() {
    let raw;
    try {raw=storage.getItem(CONTEXT_STORAGE_KEY);} catch {throw storageError('unavailable');}
    if(raw===null) return {schemaVersion:1,sessions:[],drafts:{}};
    try {
      const data=JSON.parse(raw);
      if(data?.schemaVersion!==1||!Array.isArray(data.sessions)||!data.sessions.every(validSession)||!data.drafts||typeof data.drafts!=='object'||Array.isArray(data.drafts)) throw Error();
      if(new Set(data.sessions.map(s=>s.id)).size!==data.sessions.length) throw Error();
      for(const [key,d] of Object.entries(data.drafts)) {
        const [version,context,...rest]=key.split(':');
        if(rest.length||!validVersion(version)||!getContext(context)||!validAnswers(d?.answers)||!validDate(d?.updatedAt)) throw Error();
      }
      return data;
    } catch {throw storageError('corrupt');}
  }
  function write(data) {
    try {storage.setItem(CONTEXT_STORAGE_KEY,JSON.stringify(data));} catch {throw storageError('unavailable');}
  }
  function draftKey(context) {if(!getContext(context)) throw Error('ไม่พบบริบทนี้');return `${CONTEXT_VERSION}:${context}`;}
  return {
    load,
    listSessions:()=>load().sessions,
    getSession:id=>load().sessions.find(s=>s.id===id)||null,
    getDraft:context=>load().drafts[draftKey(context)]||null,
    saveDraft(context,answers) {
      const key=draftKey(context);
      if(!validAnswers(answers)) throw Error('คำตอบไม่ถูกต้อง');
      const data=load();
      data.drafts[key]={answers:[...answers],updatedAt:new Date().toISOString()};
      write(data);
    },
    resetDraft(context) {
      const data=load();
      delete data.drafts[draftKey(context)];
      write(data);
    },
    complete(session) {
      if(!validSession(session)||session.questionnaireVersion!==CONTEXT_VERSION) throw Error('ผลบริบทไม่สมบูรณ์');
      const data=load();
      if(data.sessions.some(s=>s.id===session.id)) return;
      data.sessions.push(session);
      delete data.drafts[draftKey(session.context)];
      write(data);
    },
  };
}

export function selectLatestCompatible(sessions,context,version=CONTEXT_VERSION) {
  return sessions.filter(s=>s.context===context&&s.questionnaireVersion===version)
    .sort((a,b)=>Date.parse(b.createdAt)-Date.parse(a.createdAt)||b.id.localeCompare(a.id))[0]||null;
}

export function getContextSession(id) {
  const session=createContextStore(window.localStorage).getSession(id);
  if(!session) throw Error('ไม่พบผลบริบทนี้');
  return session;
}
