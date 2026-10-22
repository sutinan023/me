import test from 'node:test';
import assert from 'node:assert/strict';
import * as storage from '../lib/storage.js';

test('assessment instructions appear only once across visits in the same browser', () => {
  assert.equal(typeof storage.showAssessmentIntroOnce, 'function');
  const values = new Map([['pte.answers.v0.2', '[4,null]']]);
  const messages = [];
  const browser = {
    localStorage: {getItem:key=>values.get(key)??null, setItem:(key,value)=>values.set(key,value)},
    alert:message=>messages.push(message),
  };
  storage.showAssessmentIntroOnce(browser);
  storage.showAssessmentIntroOnce(browser);
  storage.showAssessmentIntroOnce({...browser});
  assert.equal(messages.length, 1);
  assert.ok(messages[0].includes('ไม่มีคำตอบถูกหรือผิด'));
  assert.ok(messages[0].includes('1 = ใกล้ด้านซ้ายมาก · 4 = ใกล้ทั้งสองด้านพอ ๆ กัน · 7 = ใกล้ด้านขวามาก'));
  assert.equal(values.get('pte.answers.v0.2'), '[4,null]');
});

test('blocked browser storage does not prevent reading the instructions', () => {
  assert.equal(typeof storage.showAssessmentIntroOnce, 'function');
  const messages = [];
  const browser = {get localStorage(){throw Error('Storage blocked');},alert:message=>messages.push(message)};
  assert.doesNotThrow(()=>storage.showAssessmentIntroOnce(browser));
  assert.equal(messages.length, 1);
});
