import test from 'node:test';
import assert from 'node:assert/strict';
import { QUESTIONS } from '../data/questions.js';
import { CONTEXT_VERSION, CONTEXTS, getContextQuestions } from '../data/contextQuestions.js';
import { createContextStore, CONTEXT_STORAGE_KEY, selectLatestCompatible, getContextSession } from '../lib/contextStorage.js';
import { scoreAssessment } from '../lib/scoring.js';
import { scoreContext, compareContextSessions } from '../lib/contextScoring.js';
import { ANSWERS_KEY, HISTORY_KEY, getAnswers, saveAnswers, addHistory, getHistory } from '../lib/storage.js';

test('rewritten questionnaires have distinct editions and preserve balanced scoring', () => {
  assert.equal(QUESTIONS[0].version, 'v0.2');
  assert.equal(CONTEXT_VERSION, 'context-v1.1');
  for (const questions of [QUESTIONS, ...CONTEXTS.map(c => getContextQuestions(c.key))]) {
    assert.deepEqual(scoreAssessment(questions, questions.map(() => 4)).dims, { EI:50, SN:50, TF:50, JP:50 });
    for (const [direction, expected] of [[1, 100], [-1, 0]]) {
      assert.deepEqual(scoreAssessment(questions, questions.map(q => q.direction === direction ? 7 : 1)).dims,
        { EI:expected, SN:expected, TF:expected, JP:expected });
    }
    for (const dimension of ['EI', 'SN', 'TF', 'JP']) {
      const rows = questions.filter(q => q.dimension === dimension);
      assert.equal(rows.length, questions.length / 4);
      assert.equal(rows.filter(q => q.direction === 1).length, rows.length / 2);
    }
  }
});

test('new context drafts and comparisons exclude old editions without deleting history', () => {
  const old = { ...scoreContext('general', Array(24).fill(4)), id:'old-session', createdAt:'2026-10-14T10:00:00Z',
    questionnaireVersion:'context-v1.0', referencePeriod:'past-four-weeks', source:'context-assessment' };
  const previous = { schemaVersion:1, sessions:[old], drafts:{ 'context-v1.0:general':{answers:Array(24).fill(2),updatedAt:old.createdAt} } };
  const values = new Map([[CONTEXT_STORAGE_KEY, JSON.stringify(previous)]]);
  const store = createContextStore({ getItem:k=>values.get(k)??null, setItem:(k,v)=>values.set(k,v) });
  assert.equal(store.getDraft('general'), null);
  assert.equal(selectLatestCompatible(store.listSessions(), 'general'), null);
  assert.throws(() => compareContextSessions(old, scoreContext('work', Array(24).fill(4))));
  store.saveDraft('general', Array(24).fill(6));
  assert.equal(store.getDraft('general').answers[0], 6);
  assert.deepEqual(store.getSession(old.id), old);
  const originalWindow = Object.getOwnPropertyDescriptor(globalThis, 'window');
  Object.defineProperty(globalThis, 'window', {configurable:true,value:{localStorage:{getItem:k=>values.get(k)??null}}});
  try { assert.deepEqual(getContextSession(old.id), old); }
  finally { if(originalWindow) Object.defineProperty(globalThis, 'window', originalWindow); else delete globalThis.window; }
  assert.deepEqual(store.load().drafts['context-v1.0:general'], previous.drafts['context-v1.0:general']);
});

test('legacy drafts stay separate and identical scores from different editions remain in history', () => {
  const oldWindow = Object.getOwnPropertyDescriptor(globalThis, 'window');
  const oldStorage = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
  const values = new Map([['pte.answers.v9', JSON.stringify(Array(48).fill(2))]]);
  Object.defineProperty(globalThis, 'window', {configurable:true,value:{}});
  Object.defineProperty(globalThis, 'localStorage', {configurable:true,value:{getItem:k=>values.get(k)??null,setItem:(k,v)=>values.set(k,v)}});
  try {
    assert.notEqual(ANSWERS_KEY, 'pte.answers.v9');
    assert.deepEqual(getAnswers(48), Array(48).fill(null));
    saveAnswers(Array(48).fill(6));
    assert.deepEqual(getAnswers(48), Array(48).fill(6));
    assert.deepEqual(JSON.parse(values.get('pte.answers.v9')), Array(48).fill(2));
    const result = { ...scoreAssessment(QUESTIONS, Array(48).fill(4)), questionnaireVersion:'v0.1' };
    values.set(HISTORY_KEY, JSON.stringify([result]));
    addHistory({...result, questionnaireVersion:'v0.2'});
    assert.equal(getHistory().length, 2);
  } finally {
    if (oldWindow) Object.defineProperty(globalThis, 'window', oldWindow); else delete globalThis.window;
    if (oldStorage) Object.defineProperty(globalThis, 'localStorage', oldStorage); else delete globalThis.localStorage;
  }
});
