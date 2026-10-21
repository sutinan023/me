import test from 'node:test';
import assert from 'node:assert/strict';
import { CONTEXT_VERSION } from '../data/contextQuestions.js';

test('context questionnaires have matching IDs, balanced directions and valid scores', async () => {
  const { CONTEXTS, getContextQuestions } = await import('../data/contextQuestions.js');
  const { scoreContext, compareContextSessions } = await import('../lib/contextScoring.js');
  assert.equal(CONTEXTS.length, 5);
  for (const { key } of CONTEXTS) {
    const qs = getContextQuestions(key);
    assert.equal(qs.length, 24);
    assert.deepEqual(qs.map(q=>q.id), Array.from({length:24},(_,i)=>i+1));
    for (const dim of ['EI','SN','TF','JP']) {
      const rows=qs.filter(q=>q.dimension===dim);
      assert.equal(rows.length,6);
      assert.equal(rows.filter(q=>q.direction===1).length,3);
      assert.equal(rows.filter(q=>q.direction===-1).length,3);
    }
    assert.ok(qs.every(q=>q.question && q.left && q.right));
    assert.deepEqual(scoreContext(key,Array(24).fill(4)).dims,{EI:50,SN:50,TF:50,JP:50});
    assert.deepEqual(scoreContext(key,qs.map(q=>q.direction===1?7:1)).dims,{EI:100,SN:100,TF:100,JP:100});
    assert.deepEqual(scoreContext(key,qs.map(q=>q.direction===1?1:7)).dims,{EI:0,SN:0,TF:0,JP:0});
    for (const bad of [Array(23).fill(4),Array(25).fill(4),Array(24).fill(null),Array(24).fill(0),Array(24).fill(8),Array(24).fill('4'),Array(24).fill(NaN)]) assert.throws(()=>scoreContext(key,bad));
  }
  assert.throws(()=>getContextQuestions('invalid'));
  const general={context:'general',questionnaireVersion:CONTEXT_VERSION,dims:{EI:50,SN:49,TF:56,JP:38}};
  const work={...general,context:'work',dims:{EI:50,SN:51,TF:44,JP:38}};
  const result=compareContextSessions(general,work);
  assert.equal(result.rows[2].delta,-12);
  assert.equal(result.rows[2].toward,'T');
  assert.equal(result.rows[0].toward,null);
  assert.equal(result.rows[1].crossedMidpoint,true);
  assert.equal(result.rows[1].nearMidpoint,true);
  assert.deepEqual(result.largestKeys,['TF']);
  assert.throws(()=>compareContextSessions({...general,questionnaireVersion:'v0.1'},work));
  assert.throws(()=>compareContextSessions(work,general));
  assert.throws(()=>compareContextSessions(general,{...work,dims:{EI:NaN}}));
  for(const value of [44,45,50,55,56]) assert.equal(compareContextSessions(general,{...work,dims:{...work.dims,SN:value}}).rows[1].nearMidpoint,Math.abs(value-50)<=5);
  const neutral={...general,dims:{EI:50,SN:50,TF:50,JP:50}};
  assert.deepEqual(compareContextSessions(neutral,{...neutral,context:'work'}).largestKeys,[]);
  assert.deepEqual(compareContextSessions(neutral,{...work,dims:{EI:0,SN:0,TF:0,JP:0}}).largestKeys,['EI','SN','TF','JP']);
});
