import test, { beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { RESULT_KEY, HISTORY_KEY, LEGACY_RESULT, getLatestResult, saveLatestResult, getHistory, addHistory } from '../lib/storage.js';

let values;
let originalWindow;
let originalStorage;

beforeEach(() => {
  originalWindow = Object.getOwnPropertyDescriptor(globalThis, 'window');
  originalStorage = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
  values = new Map();
  Object.defineProperty(globalThis, 'window', { configurable: true, value: {} });
  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    value: {
      getItem: key => values.get(key) ?? null,
      setItem: (key, value) => values.set(key, value),
    },
  });
});

afterEach(() => {
  if (originalWindow) Object.defineProperty(globalThis, 'window', originalWindow);
  else delete globalThis.window;
  if (originalStorage) Object.defineProperty(globalThis, 'localStorage', originalStorage);
  else delete globalThis.localStorage;
});

test('a new visitor has no personal result or generated history', () => {
  assert.equal(getLatestResult(), null);
  assert.deepEqual(getHistory(), []);
  assert.equal(values.size, 0);
});

test('server rendering does not substitute an example result', () => {
  delete globalThis.window;
  assert.equal(getLatestResult(), null);
  assert.deepEqual(getHistory(), []);
});

test('invalid saved data does not become a personal result', () => {
  for (const stored of ['invalid json', 'null', '{}', 'false', JSON.stringify({ type: 'ISFJ', dims: { EI: 101, SN: 46, TF: 56, JP: 38 } })]) {
    values.set(RESULT_KEY, stored);
    assert.equal(getLatestResult(), null);
    assert.equal(values.get(RESULT_KEY), stored);
  }
});

test('unavailable storage does not substitute sample data', () => {
  localStorage.getItem = () => { throw new Error('Storage blocked'); };
  assert.equal(getLatestResult(), null);
  assert.deepEqual(getHistory(), []);
});

test('existing saved results including the legacy baseline remain readable', () => {
  saveLatestResult(LEGACY_RESULT);
  values.set(HISTORY_KEY, JSON.stringify([LEGACY_RESULT]));
  assert.deepEqual(getLatestResult(), LEGACY_RESULT);
  assert.deepEqual(getHistory(), [LEGACY_RESULT]);
});

test('completing an assessment saves only the actual result in history', () => {
  const result = { id: 'new-result', type: 'ENFP', dims: { EI: 20, SN: 80, TF: 70, JP: 65 }, source: 'assessment' };
  saveLatestResult(result);
  addHistory(result);
  assert.deepEqual(getLatestResult(), result);
  assert.deepEqual(getHistory(), [result]);
});

test('invalid history containers return an empty history without overwriting storage', () => {
  for (const stored of ['invalid json', 'null', '{}']) {
    values.set(HISTORY_KEY, stored);
    assert.deepEqual(getHistory(), []);
    assert.equal(values.get(HISTORY_KEY), stored);
  }
});
