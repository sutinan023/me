# V12 Context Mode — QA record

Verified 2026-10-14, Asia/Bangkok. Branch: `codex/v12-context-mode`. Existing uncommitted work has been preserved; no deployment, database migration, or real research-data upload was performed.

## Result

Implemented five independent modes, 24 questions per mode, local draft/session storage, comparison against a new General baseline, session selection/include-exclude, and correctly labeled single-context PNG/PDF reports. Public context sharing and cloud storage remain outside this release.

## Verification

| Check | Evidence |
| --- | --- |
| Node suite | `node --test tests/*.test.mjs`: 13 passed, 0 failed |
| Production build | `npm run build`: exit 0; `/contexts`, dynamic assessment and report routes included |
| Full questionnaire flow | Playwright answered 120 questions across Work, General, Friends, Alone, Stress; five complete sessions |
| Draft isolation | Answered Work/Friends partially, switched/reloaded, and resumed the correct question; completed drafts cleared individually |
| Data isolation | All three V9 storage values unchanged before/after the five V12 assessments |
| Remote privacy boundary | Intercepted API requests during V12: zero requests |
| Comparison | Four comparisons after all modes; signed differences, ties, zero, midpoint and compatible-version behavior checked |
| Session controls | Repeated Work sessions available; selected historical result and included/excluded completed contexts |
| Query navigation | Context Result → header General Result; Context Report → header Report; browser Back restores contextual report |
| Storage errors | Failed draft write preserves selected answer in memory, blocks progression until retry; failed completion preserves draft; retry works |
| Final double-click | One context session created; no remote submission |
| Explicit restart | Clears only selected draft and retains completed sessions |
| Invalid inputs | Empty/unknown/duplicate context parameters, unknown result ID, conflicting report queries, corrupt storage and incompatible version handled |
| Responsive/keyboard | Desktop and 390px mobile; no horizontal overflow; native button keyboard Enter advances questionnaire |
| Context exports | General/Work/Stress PNG 1588×2246; PDF valid, one A4 page, no URI annotations or misleading QR |
| Legacy regression | 48-question completion, one mocked API submission, Report, local Compare import, public encoded report, legacy PDF Compare URI retained |
| Review | Independent code review found query-state, unsaved-answer and include/exclude issues; one fix pass completed and browser regressions passed |

Final production preview: `http://localhost:3004/contexts`. Browser plugin was not available; user-requested Playwright CLI used from the cached installed package. Tests ran in disposable browser contexts; fixture sessions shown in screenshots are synthetic.

Commands: Playwright CLI `goto`, `snapshot`, `run-code`, screenshots/downloads; `node --test`; `npm run build`; `pypdf` strict parsing and URI/page assertions; `pdftoppm` PDF render inspection. The npm CLI bootstrap was not needed because an installed cached Playwright CLI was available.

Evidence: `output/playwright/v12-final-desktop.png`, `v12-final-mobile.png`, `v12-work-pdf-render.png`, `v12-general.png/pdf`, `v12-work.png/pdf`, `v12-stress.png/pdf`, `v12-final-stress.pdf`, `v12-legacy-report.pdf`.

Known non-blocking warnings: Node reports the existing package's unspecified ESM module type; browser has the existing missing favicon 404. No relevant application page errors or framework overlays appeared in the verified V12 flows. Legacy database success/failure is simulated; actual database writing was not revalidated in this task.

## Questionnaire pilot — not yet conducted

The 120 presentations have been inspected for construct/polarity consistency. Human comprehension testing and psychometric validation have not been conducted. Use the feature as an exploratory prototype.

Checklist for a small user pilot:

- ให้ผู้ทดลองอธิบายคำถามด้วยภาษาของตัวเอง โดยเฉพาะ Alone และ Stress
- ถามว่ามีข้อไหนไม่ตรงประสบการณ์ หรือสองด้านดูเหมือนควรเลือกพร้อมกัน
- ตรวจว่าคำถาม Work ใช้กับงาน การเรียน หรือโปรเจ็กต์ได้
- ตรวจว่าข้อกลับทิศไม่ได้สร้างความสับสนเพราะภาษา
- ให้ผู้ทดลองอ่านกราฟและอธิบายหน่วย "จุดคะแนน" กับจุดใกล้กึ่งกลาง
- ตรวจว่าเข้าใจ General เป็นภาพอ้างอิง และไม่ได้ตีความว่า type จริงเปลี่ยน
- เก็บข้อเสนอแนะก่อนเปลี่ยนคำถาม; หากเปลี่ยนเนื้อหา/การให้คะแนน ให้เพิ่ม questionnaire version และไม่เทียบข้ามเวอร์ชันโดยอัตโนมัติ

No scientific-validation, diagnostic, compatibility, or causal claims are made.
