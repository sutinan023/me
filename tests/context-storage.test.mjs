import test from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { scoreContext } from '../lib/contextScoring.js';
const makeSession=context=>({...scoreContext(context,Array(24).fill(4)),id:randomUUID(),createdAt:'2026-10-14T10:00:00.000Z',referencePeriod:'past-four-weeks',source:'context-assessment'});

test('storage isolates drafts, retains repeated sessions and completes atomically',async()=>{
  const {createContextStore,CONTEXT_STORAGE_KEY}=await import('../lib/contextStorage.js');
  const map=new Map([['pte.latestResult.v9','legacy']]);
  let fail=false;
  const adapter={getItem:k=>map.get(k)??null,setItem:(k,v)=>{if(fail)throw Error('quota');map.set(k,v);}};
  const store=createContextStore(adapter);
  assert.deepEqual(store.listSessions(),[]);
  store.saveDraft('work',[4,...Array(23).fill(null)]);
  store.saveDraft('friends',Array(24).fill(3));
  const work=makeSession('work');
  const before=map.get(CONTEXT_STORAGE_KEY);
  fail=true;
  assert.throws(()=>store.complete(work),e=>e.code==='unavailable');
  assert.equal(map.get(CONTEXT_STORAGE_KEY),before);
  fail=false;
  store.complete(work); store.complete(work);
  store.complete({...work,id:randomUUID()});
  store.complete(makeSession('friends'));
  assert.equal(store.listSessions().length,3);
  assert.equal(store.getDraft('work'),null);
  assert.equal(store.getDraft('friends'),null);
  assert.equal(map.get('pte.latestResult.v9'),'legacy');
  assert.equal(store.getSession('missing'),null);
  assert.throws(()=>store.saveDraft('invalid',Array(24).fill(4)));
  assert.throws(()=>store.saveDraft('work',Array(24).fill('4')));
  const previous=map.get(CONTEXT_STORAGE_KEY);
  for(const bad of ['{',JSON.stringify({schemaVersion:2}),JSON.stringify({schemaVersion:1,sessions:[{type:'bad'}],drafts:{}})]) {
    map.set(CONTEXT_STORAGE_KEY,bad);
    assert.throws(()=>store.load(),e=>e.code==='corrupt');
    assert.throws(()=>store.saveDraft('work',Array(24).fill(4)));
    assert.equal(map.get(CONTEXT_STORAGE_KEY),bad);
  }
  map.set(CONTEXT_STORAGE_KEY,previous);
  store.saveDraft('friends',Array(24).fill(2));
  store.complete(makeSession('work'));
  assert.equal(store.getDraft('friends').answers[0],2);
  store.saveDraft('work',Array(24).fill(6));
  const sessionCount=store.listSessions().length;
  store.resetDraft('work');
  assert.equal(store.getDraft('work'),null);
  assert.equal(store.getDraft('friends').answers[0],2);
  assert.equal(store.listSessions().length,sessionCount);
});
