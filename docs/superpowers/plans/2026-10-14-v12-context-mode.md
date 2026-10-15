# V12 Context Mode Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** ให้คนเดียวกันสำรวจ General, Work, Friends, Alone และ Stress ผ่าน 24 ข้อต่อบริบท แล้วเทียบ preference ทั้ง 4 มิติโดยไม่อ้างว่า type จริงเปลี่ยน

**Architecture:** เพิ่มข้อมูลและ storage ของ Context Mode แยกจาก V9 โดยเก็บใน browser รุ่นแรกใช้หน้า `/contexts` เป็นจุดเริ่มและหน้าเปรียบเทียบ ใช้ flow แบบประเมินและ Report เดิมเฉพาะส่วนที่เหมาะสม พร้อมรักษาเส้นทาง 48 ข้อและการแชร์เดิม

**Tech Stack:** Next.js 16.4.0 App Router, React 19, JavaScript, CSS เดิม, localStorage, Node test runner, Playwright CLI, canvas/PDF exporter เดิม ไม่เพิ่ม dependencies

**Spec:** [Approved design](../specs/2026-10-14-v12-context-mode-draft.md)

สถานะ: ลงมือด้วยวิธี Native ตามที่ผู้ใช้ยืนยันแล้ว; implementation และ QA เสร็จ 2026-10-14 ดู docs/V12_CONTEXT_MODE_QA.md สำหรับหลักฐานและข้อจำกัด

## Global Constraints

- Context keys: `general`, `work`, `friends`, `alone`, `stress`; questionnaire version: `context-v1.0`.
- 24 ข้อ: EI/SN/TF/JP อย่างละ 6 ข้อ; direction `1` และ `-1` อย่างละ 3 ข้อต่อมิติ; คำตอบเป็น integer 1–7.
- มีข้อความคำถามที่ตรวจทานแล้วครบ 5 × 24 รูปแบบ; ห้ามเติมชื่อบริบทหน้าคำถามเดิมโดยอัตโนมัติ.
- รายงานและเปรียบเทียบเฉพาะผลครบ 24 ข้อ; ค่าใกล้กึ่งกลางใช้ `Math.abs(value - 50) <= 5` เพื่อการแสดงผล.
- เปรียบเทียบกับ General จาก questionnaire version เดียวกันเท่านั้น; delta = context score − General score หน่วยเป็นจุดคะแนน.
- Context storage ใช้ `pte.contexts.v12`; ไม่เขียน `pte.latestResult.v9`, `pte.history.v9`, `pte.answers.v9` จาก flow V12.
- ไม่ส่ง V12 ไป `/api/assessment` หรือ `/api`; ไม่มี schema migration/cloud sync ในรุ่นนี้.
- ไม่สร้างลิงก์แชร์สาธารณะหรือ QR ที่ทำชื่อบริบทหาย; General 24 ข้ออยู่ภายใต้ข้อจำกัดเดียวกัน.
- Type เป็นคำสรุปรอง; ห้าม hard-code Work = ISTJ, Stress = INFJ หรือบอกว่า type จริงเปลี่ยน.
- แสดงวันประเมินและข้อความว่าเป็นแนวโน้มจากคำตอบครั้งนี้; ข้อมูลอาจต่างจากเวลาและการตีความคำถามด้วย.
- อ่านคู่มือที่เกี่ยวข้องใน `node_modules/next/dist/docs/` ก่อนแก้ Next.js APIs; `searchParams` ของ Server Page ต้อง await ตามคู่มือที่ติดตั้ง.
- ใช้ workspace ที่เก็บงานเดิมครบ; อย่า reset/clean ไฟล์ที่ผู้ใช้แก้ไว้ อย่า stage diff เก่าของผู้ใช้รวมกับ V12.

## Review Focus

1. URL context/session ที่ผิดหรือว่าง ต้องแสดงข้อผิดพลาดและทางกลับ ไม่ตกไปใช้ General หรือ legacy fallback — Task 3/4.
2. ข้อมูล localStorage เสีย, storage ถูกปิด, หรือ quota เต็ม ต้องไม่เขียนทับข้อมูลเดิม/ล้าง draft — Task 2/3.
3. Type/คะแนนเหมือนกันข้ามบริบทหรือทำซ้ำ ต้องเก็บเป็นคนละ session; final click ซ้ำต้องไม่สร้างสอง session — Task 2/3.
4. ผลจากคนละ questionnaire version หรือ General 48 ข้อ ต้องไม่ถูกนำมาคำนวณ contextual delta — Task 1/4.
5. Context Report ต้องไม่มีข้อความ QR, URI annotation, ลิงก์แชร์ หรือการ overwrite ผลทั่วไปโดยไม่ตั้งใจ — Task 5/6.

## File Structure and Shared Interfaces

| File | Responsibility |
| --- | --- |
| `data/contextQuestions.js` | metadata 5 บริบท, common item map 24 ข้อ และคำถามเฉพาะแต่ละบริบท |
| `lib/contextScoring.js` | ตรวจคำตอบ, คำนวณผล และเปรียบเทียบ compatible sessions |
| `lib/contextStorage.js` | validated local session/draft storage แยกจาก V9 |
| `components/assessment/LegacyAssessment.js` | ย้าย client component 48 ข้อเดิมมาทั้งชุดโดยไม่เปลี่ยนพฤติกรรม |
| `components/contexts/ContextAssessment.js` | flow 24 ข้อ, draft, local completion และ error/retry |
| `components/contexts/ContextHub.js` | cards, session selectors, missing-data states |
| `components/contexts/ContextComparison.js` | spectra, delta, วันที่ และคำอธิบาย |
| `components/contexts/ContextResult.js` | ผลแต่ละ context; ไม่มี InsightTabs/AskAboutMe เดิมที่ข้อความอิงโปรไฟล์ชุดเดียว |
| `app/contexts/page.js` | Server shell/metadata ของ Context Mode |
| `app/assessment/page.js` | Server route เลือก legacy หรือ contextual assessment อย่างชัดเจน |
| `app/result/page.js` | เพิ่มทางไป Context Mode และเลือก contextual result ด้วย session ID |
| `components/report/ReportView.js` | resolve context session สำหรับ Report; จำกัด public sharing ของ V12 |
| `lib/reportExport.js` | optional QR และ metadata บริบทในภาพ/PDF โดยรักษา API เดิม |
| `lib/reportPdf.js` | สร้าง PDF bytes จาก JPEG และ optional Compare URI เพื่อทดสอบโครงสร้างได้โดยไม่ mock canvas |
| `components/Header.js`, `app/globals.css` | entry link และ styling เฉพาะ V12 |
| `tests/context-*.test.mjs` | regression tests ของข้อมูล, scoring, storage และ compatibility |

`ContextSession` fields: `id`, `context`, `questionnaireVersion`, `type`, `name`, `dims`, `createdAt`, `referencePeriod: "past-four-weeks"`, `source: "context-assessment"`. `id` เป็น UUID; วันที่เป็น ISO timestamp. เก็บคำตอบใน draft แยก ไม่ใส่ใน report model.

Storage document: `{ schemaVersion: 1, sessions: ContextSession[], drafts: { [version + ":" + context]: { answers: (number|null)[24], updatedAt: string } } }`.

## Task 1: Questionnaire, Scoring, and Comparison Rules

**Files:** Create `data/contextQuestions.js`, `lib/contextScoring.js`, `tests/context-scoring.test.mjs`.

**Interfaces:**
- `CONTEXT_VERSION = "context-v1.0"`; `CONTEXTS` is an array of `{ key, label, prompt }`.
- `getContextQuestions(context)` returns 24 objects compatible with `scoreAssessment`: `{ id, dimension, direction, question, left, right, version }`; rejects unknown contexts.
- `scoreContext(context, answers)` validates the complete response and returns `{ context, questionnaireVersion, type, name, dims }`.
- `compareContextSessions(general, other)` rejects non-General baselines, legacy versions, or version mismatch; returns `{ rows: [{ key, generalValue, contextValue, delta, toward, nearMidpoint, crossedMidpoint }], largestKeys }`.
- `toward` is `E/S/T/J` for negative delta, `I/N/F/P` for positive delta, and `null` for zero. `largestKeys` includes ties in fixed EI/SN/TF/JP order.

- [x] เขียน failing tests: ตรวจทั้ง 5 ชุดว่ามี 24 IDs ที่ตรงกัน, 6 ข้อต่อมิติ, polarity 3/3, และข้อความไม่ว่าง. ตรวจ all-4 answers ให้คะแนน `{ EI:50, SN:50, TF:50, JP:50 }`; reject 23/25 คำตอบ, null, 0, 8, string, NaN และ unknown context.
- [x] เพิ่ม regression assertions ที่ระบุ direction และ compatibility ชัดเจน:

```js
const general56 = { context: 'general', questionnaireVersion: 'context-v1.0', dims: { EI:79, SN:46, TF:56, JP:38 } };
const work44 = { context: 'work', questionnaireVersion: 'context-v1.0', dims: { EI:79, SN:46, TF:44, JP:38 } };
const friends56 = { ...general56, context: 'friends' };
const legacyGeneral = { ...general56, questionnaireVersion: 'v0.1' };
assert.equal(compareContextSessions(general56, work44).rows.find(r => r.key === 'TF').delta, -12);
assert.equal(compareContextSessions(general56, work44).rows.find(r => r.key === 'TF').toward, 'T');
assert.throws(() => compareContextSessions(legacyGeneral, work44));
assert.throws(() => compareContextSessions(work44, friends56));
```

- [x] Run `node --test tests/context-scoring.test.mjs`; ต้อง fail เพราะ feature ยังไม่มี.
- [x] เขียนและตรวจทาน 24 common items พร้อมคำถาม/anchors ทั้ง 120 รูปแบบตามบริบท รักษามิติและ polarity. Stress ใช้การย้อนนึกถึงสถานการณ์ ไม่ชวนสร้างความเครียด. Work ครอบคลุมงาน/เรียน/โปรเจ็กต์. Reuse `scoreAssessment` หลัง validate เท่านั้น.
- [x] Run tests ให้ผ่าน; ตรวจ ties, zero delta, 45/50/55 midpoint display และ 49→51 crossing โดยไม่กล่าวว่าเป็นความต่างที่มีนัยสำคัญ.
- [x] ตรวจ diff และทำ checkpoint เฉพาะไฟล์ Task 1.

## Task 2: Independent Context Storage

**Files:** Create `lib/contextStorage.js`, `tests/context-storage.test.mjs`.

**Consumes:** Task 1 context keys/version; `ContextSession` shape above.

**Produces:** `createContextStore(storage)` returns `load()`, `getDraft(context)`, `saveDraft(context, answers)`, `getSession(id)`, `listSessions()`, `complete(session)`. Browser callers pass `window.localStorage`; tests pass a small Storage adapter.

`load()` returns validated data, empty data only when the key is absent; throws a typed error with code `corrupt` or `unavailable` on failures. `getSession` returns null for an absent ID. `complete` appends by unique ID and clears only that context/version draft in one `setItem` write. An existing session ID makes completion idempotent; equal scores with different IDs remain separate.

- [x] เขียน failing tests สำหรับ absent store, แยก draft work/friends, repeated identical scores ต่าง ID, duplicate same ID, และ complete ที่ไม่แตะ V9 keys.
- [x] ใช้ adapter ที่ `setItem` throw เพื่อ assert ว่า session/draft เก่ายังอยู่ครบ. Test malformed JSON/schema และ invalid session fields ว่าต้องแจ้ง error ไม่ overwrite. Unknown schema version ต้องแจ้ง unsupported/corrupt state แทน initialize ทับ.
- [x] Run `node --test tests/context-storage.test.mjs`; ยืนยัน fail ก่อน implement.
- [x] Implement atomic completion, validation of context/version/date/ID/type/dims, และ draft values 1–7 หรือ null. อ่าน stored document ล่าสุดก่อนแต่ละ mutation; เก็บ session เวอร์ชันอื่นไว้แต่ไม่เลือกมาเทียบโดยอัตโนมัติ.
- [x] Run tests ให้ผ่านพร้อม Task 1 tests. อย่าแก้ `lib/storage.js` หรือเติม legacy result ลง V12 General.
- [x] ตรวจ diff และทำ checkpoint เฉพาะไฟล์ Task 2.

## Task 3: Context Assessment and Completion

**Files:** Create `components/assessment/LegacyAssessment.js`, `components/contexts/ContextAssessment.js`; modify `app/assessment/page.js`.

**Consumes:** `getContextQuestions`, `scoreContext`, `createContextStore`.

**Produces:** `ContextAssessment({ context })`; completion creates a UUID session and routes to `/result?contextSession=<id>`. Server page awaits `searchParams`; absence of `context` renders legacy, unknown/empty/duplicate context values render a recoverable error.

- [x] ทำ browser checks ก่อนแก้: `/assessment?context=work` ยังเป็น 48 ข้อ; context switch ใช้ draft เดียวกัน. ใช้ isolated Playwright context เพื่อไม่แตะข้อมูลผู้ใช้.
- [x] ย้าย component 48 ข้อเดิมไป `LegacyAssessment.js` โดยรักษา local-first persistence, API route, timeout 8 วินาที และ double-submit guard เดิม. Server shell เลือก flow ตาม query.
- [x] Implement 24-question client, persistent context badge/prompt, independent draft restore, answer controls/back/auto-advance และ final missing-answer validation. ใช้ synchronous ref lock สำหรับ completion และ session ID เดียวต่อ attempt; หาก write fail ต้อง retry ด้วย ID เดิมได้โดยไม่เกิด duplicate.
- [x] ทดสอบ Work 24 ข้อ → result ID; สลับ Friends กลับ Work/reload ให้ draft ถูกต้อง; missing answers เป็น draft; ไม่ต้องทำ General ก่อน context อื่น; invalid context มีทางกลับ `/contexts`.
- [x] Intercept legacy API requests แล้ว assert ว่า flow V12 ส่ง **0 requests**. ตรวจ V9 keys ไม่เปลี่ยน; simulate storage blocked/quota error ให้คง draftและ retry สำเร็จ; double final click สร้างหนึ่ง session.
- [x] Run domain tests และ Playwright checks ให้ผ่าน; ตรวจ diff และ checkpoint Task 3.

## Task 4: Context Hub, Session Results, and Comparisons

**Files:** Create `app/contexts/page.js`, `components/contexts/ContextHub.js`, `components/contexts/ContextComparison.js`, `components/contexts/ContextResult.js`, `tests/context-selection.test.mjs`; modify `app/result/page.js`, `components/Header.js`, `app/globals.css`.

**Consumes:** context metadata, store methods, `compareContextSessions`.

**Produces:** `ContextHub()`, `ContextComparison({ general, sessions })`, `ContextResult({ sessionId })`. Add pure `selectLatestCompatible(sessions, context, version)` to `lib/contextStorage.js`; choose newest date and use stable ID tie-breaking. Result routing with `contextSession` never calls the legacy fallback for unknown IDs.

- [x] เขียน failing selector tests สำหรับ empty sessions, mixed versions, legacy General, date ties และ repeated sessions; run `node --test tests/context-selection.test.mjs` เพื่อยืนยัน fail.
- [x] Implement selectors และ cards ทั้ง 5 mode: not started/draft/completed, progress/date, resume และ explicit restart ที่ไม่ลบผลเก่า. ให้ผู้ใช้เลือก General session และแต่ละ context session เอง; default latest compatible; เลือกเฉพาะ version ที่ตรงกับ baseline.
- [x] Implement 4 spectrum rows พร้อม legend, score/delta เป็นจุด, dates, midpoint labels, และ text/table view สำหรับมือถือ. Missing General แสดง action; missing context ไม่สร้างค่า 50. Largest-difference ties แสดงครบโดยไม่ลำเอียงให้หนึ่งมิติเด่นกว่าโดยพลการ.
- [x] ContextResult แสดง Type รองจากคะแนน พร้อมบริบท/date, reflection copy, link comparison และ `/report?contextSession=<id>`. ไม่ใช้ InsightTabs/AskAboutMe เดิมกับ context results. ลิงก์ย้อน `/result` ยังอ่าน General เดิมตามปกติ.
- [x] Browser verify: ทำ Work ก่อน General, จากนั้น Generalแล้วเทียบ, change selected session, identical scores zero delta, midpoint crossing labels, corrupt storage/invalid ID error และ 390px ไม่ล้นแนวนอน. Keyboard เข้าถึง cards/selectorsได้.
- [x] Run domain suite; ตรวจ diff และ checkpoint Task 4.

## Task 5: Correctly Labeled Context Reports

**Files:** Modify `components/report/ReportView.js`, `lib/reportExport.js`; create `lib/reportPdf.js`, `tests/context-report.test.mjs`, `tests/fixtures/report-pixel.jpg` (valid small JPEG fixture).

**Consumes:** `getSession(id)`, existing `buildReport(profile)` and canvas exporter.

**Produces:** extend `renderReport(report, compareUrl = null, metadata = null)` where metadata is `{ contextLabel, questionnaireVersion, createdAt }`; extend `reportPdf(canvas, compareUrl = null)` with optional URI annotation. Extract PDF serialization to `createReportPdfBytes(jpegBytes, width, height, compareUrl = null)` in `lib/reportPdf.js`, returning `Uint8Array`; the browser wrapper still returns a PDF Blob. Existing calls with a compare URL retain their current behavior.

- [x] เขียน failing Node tests โดยส่ง valid JPEG fixture เข้า pure serializer: null QR URL ต้องมีหนึ่ง page, ไม่มี `/Subtype /Link`/URI annotation; legacy URL caseยังมี Compare link; verify xref offsetsตรงตำแหน่ง objects และ reject invalid image dimensions. Run `node --test tests/context-report.test.mjs` ให้ fail เพราะ serializer ยังไม่มี. Tests ไม่พึ่ง browser artifacts ที่อาจยังไม่ถูกสร้าง.
- [x] ReportView ตรวจ `contextSession` ก่อน legacy `p/friend/default` และ reject conflicting query modes. V12โหลดจาก context store เท่านั้น ไม่เรียก `getReportLinks` หรือ API share. Unknown ID/version แสดงทางกลับ Context Mode.
- [x] Context preview แสดง context/date/version; เพิ่มแบบข้อความด้วย. PNG/PDF ใช้ composition เดียวกัน; replace QR footer ด้วย contextual reflection text. ซ่อน share/copy/public Compare controls ของ V12 พร้อมคำอธิบายสั้น ๆ; มี link กลับ `/contexts` แทน.
- [x] Implement optional QR and optional PDF annotation โดยทำ xref/object count ให้ถูกทั้งสองกรณี. Legacy preview, sharing, QR และ PDF ยังเหมือนเดิม. Context filename มี context และ session ID เพื่อไม่สับสนกับรายงาน General.
- [x] Run serializer tests ให้ผ่าน. Download General-24, Work และ Stress PNG/PDF จริง; ตรวจด้วย pypdf ว่าเป็น A4 one pageและไม่มี URI ที่ทำ contextหาย. ตรวจ metadataตรง session, readable Thai, ไม่มีชน/ตัดข้อความ. Render PDF ด้วย `pdftoppm` แล้วดูภาพ; verify legacy report QR ยังคงอยู่. การตรวจ layoutใช้ real canvas/exports ไม่ใช้ canvas mock.
- [x] Run domain suite; ตรวจ diff และ checkpoint Task 5.

## Task 6: End-to-End Verification and Handoff

**Files:** Create `docs/V12_CONTEXT_MODE_QA.md`; browser artifacts under `output/playwright/`.

- [x] Run `node --test tests/*.test.mjs`; ทุก existing/new test ต้องผ่าน ระบุ warning/failure จริงทั้งหมดใน QA record.
- [x] Run `npm run build` ให้ exit 0 แล้วใช้ production server บน port ว่างตรวจ flow เพื่อเลี่ยง dev refresh. เก็บ port/viewport/commands ใน QA record.
- [x] Playwright: ทำทั้ง 5 contexts, ทดสอบ resume/reload/switch, เลือก baseline/session, negative/positive/zero delta, missing General/context, incompatible version, invalid URL/session, storage failure/retry และ duplicate click. ตรวจไม่มี framework overlay/page errors.
- [x] Snapshot ก่อนใช้ refs; screenshot desktop และ 390px mobile. ตรวจการแสดงชื่อ context ขณะตอบและเมื่อดูผล/Report; เปรียบเทียบ old V9 storage ก่อน/หลัง.
- [x] Regression: เส้นทาง 48 ข้อ → result → report ยังใช้ได้; friend Compare/local share ยังนำเข้าได้; context flowไม่มี request ไป legacy save/share APIs.
- [x] ตรวจ artifact PNG/PDF จริงและ PDF rendering. ตรวจ copy โดยค้นข้อความที่อ้าง type จริงเปลี่ยน, statistical significance, confidence หรือ diagnosis แล้วแก้ทุกจุดที่ผิดขอบเขต.
- [x] เพิ่ม pilot checklist ภาษาไทยสำหรับทดลองอ่านคำถาม/คำอธิบายกับผู้ใช้: อธิบายแต่ละคำถามเข้าใจไหม, Alone/Stress ใช้ตอบได้จริงไหม, อ่านกราฟแล้วเข้าใจว่าคะแนนตามบริบทหรือเข้าใจว่า identity เปลี่ยน. ระบุ pilot ว่ายังไม่ทำหากยังไม่มีข้อมูลจากคนทดลอง; ไม่เรียกแบบประเมิน validated.
- [x] Review diff ทั้งงาน แก้ข้อผิดพลาดสำคัญก่อนส่งมอบ แล้วสรุปสิ่งที่ตรวจผ่านและข้อจำกัด local-only/ไม่มี public context sharing ให้ผู้ใช้.

## Plan Self-Review

- ครอบคลุมทั้ง 5 contexts, 24 questions, version-compatible baseline, independent drafts/sessions และ V9 preservation: Tasks 1–4.
- คำอธิบายไม่เปลี่ยน type จริง, dates, midpoint และ units: Tasks 1/4/6.
- PNG/PDF labels และ public-sharing boundary: Task 5; legacy API/sharing regressions: Tasks 3/6.
- Review Focus ทั้ง 5 ข้อมี regression checks ระบุไว้แล้ว;ไม่มี migration, dependency installation หรือ cloud work แฝง.
- Interfaces ใช้ชื่อเดียวกันข้าม tasks; storage completion เป็น atomic write; report exporterรองรับ null QR อย่างชัดเจน.

## Execution Handoff

แนะนำ **Native**: ให้ agent หลักทำเองทีละ task ในแชตนี้ เพราะ scoring/storage/assessment/report ใช้ interfaces ต่อกัน และต้องรักษา diff เดิมจำนวนมาก จากนั้นมี reviewer ตรวจงานทั้งชุดก่อนส่งมอบ.

อีกทางคือ **Subagent-driven**: ให้ implementer และ reviewer แยกตรวจแต่ละ task เหมาะหากต้องการ review ระหว่างทุกขั้น แต่มีต้นทุนบริบทเพิ่ม.

ผู้ใช้ยืนยันแผนและวิธี Native แล้ว ฟีเจอร์อยู่บน branch codex/v12-context-mode พร้อม local preview โดยยังไม่มีการ push/deploy หรือผสานงานเดิมของผู้ใช้เข้ากับ commit ใหม่.
