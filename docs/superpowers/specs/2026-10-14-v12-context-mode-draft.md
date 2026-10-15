# V12 — Context Mode: approved design

Date: 2026-10-14 (Asia/Bangkok)
Status: design approved by the user on 2026-10-14; implementation plan review is next. Product implementation has not started.
Confirmed decision: 24 questions per context, including a new General baseline.

สรุป: เพิ่ม General, Work, Friends, Alone และ Stress ใช้ 24 ข้อต่อบริบท ทำแยกครั้งได้ เก็บคำตอบค้างและผลแยกกัน แล้วเทียบคะแนน 4 มิติกับ General ชุดใหม่ Type เป็นคำสรุปรอง ไม่อ้างว่า type จริงเปลี่ยน ผลเดิม 48 ข้อเก็บไว้อ้างอิงแยก รุ่นแรกเสนอให้เก็บข้อมูลใน browser และมี Report รายบริบท ส่วนการแชร์บริบทสาธารณะและเก็บบนฐานข้อมูลเป็นงานถัดไป

## 1. Outcome and boundaries

Help one person explore how their self-reported preferences look in different situations: General, Work, Friends, Alone, and Stress. Compare four continuous dimensions first; use the four-letter pattern as a secondary shorthand. Never describe a different contextual pattern as a change in the person's true type.

Users can complete one context at a time, return to an independent draft, revisit earlier results, and choose which completed results to compare. Completing all five modes is optional. This is exploratory self-reflection; score differences are not evidence that context caused a personality change.

V12 includes context selection, contextual assessment, independent storage, comparison within one person, contextual interpretation, and context-aware single-result reports. A combined multi-context PNG/PDF, cloud synchronization, and public multi-context sharing are follow-up work.

## 2. Approaches considered

| Approach | Benefit | Cost or limitation |
| --- | --- | --- |
| 24 common-core questions in all five modes — selected | Manageable sessions and a consistent new General comparator | New wording and a new version; requires item review and user pilot |
| 48 questions adapted for each mode | Retains more coverage of the existing item set | Up to 240 answers; existing meeting/group/travel questions need careful adaptation |
| 16 questions adapted for each mode | Shorter sessions | Less item coverage; needs its own General baseline and version |

Sharing an item structure and scoring rule supports consistent presentation, but does not establish psychometric equivalence across contexts. Do not advertise a validated context measurement.

## 3. User journey

1. Open `/contexts` from a Context Mode entry in navigation or the result page.
2. See five cards with a short situation prompt and a state: not started, draft progress, or completed with date.
3. Start with General for a comparator, or complete a context first and add General later. No comparison is shown until the needed completed results exist.
4. Choose a card to open `/assessment?context=general|work|friends|alone|stress` with the context badge persistently visible.
5. Answer 24 questions using the existing seven-point answer controls, progress, back navigation, and automatic advance.
6. On completion, save that context session and open its contextual result. Offer "compare my contexts" and "open this Report".
7. On the comparison view, select a General session and one or more contextual sessions. Default to the most recent complete sessions of the compatible questionnaire version and show all assessment dates.

No-context `/assessment`, `/result`, and `/report` continue to support the existing 48-question flow. Context URLs choose the new questionnaire explicitly. An invalid context must show a recoverable error, not silently become General.

### Context prompts

| Mode | Prompt intention |
| --- | --- |
| General | Think about how you usually respond across daily situations over the past four weeks. |
| Work | Think about work, study, or a project with responsibilities during that same period. |
| Friends | Think about situations with friends or people you feel comfortable with. |
| Alone | Think about time alone and how you organize thoughts, choose activities, and make decisions. |
| Stress | Recall a demanding or stressful situation from the same period; do not ask users to become stressed while answering. |

If a context does not fit the user's experience, they can leave that mode unfinished or skip it. Do not replace a missing mode with fabricated answers or a neutral score.

## 4. Questionnaire and scoring

- Add a separately versioned context questionnaire, proposed identifier `context-v1.0`.
- 24 common item IDs: six for EI, six for SN, six for TF, and six for JP. Each dimension has three items in each scoring direction.
- Preserve seven-point responses and the current normalization to a 0–100 position, where increasing scores indicate I, N, F, and P respectively.
- Prepare explicit prompts/wording for all five contexts while keeping each item's intended dimension and polarity consistent. Do not automatically prepend a context label to the existing 48 items: some items refer to meetings, groups, friends, travel, or holidays that do not fit all contexts.
- Review all 120 item presentations for ambiguity, applicability, leading wording, and accidental polarity reversal before implementation acceptance. A small user pilot checks comprehension; it is not scientific validation.
- Final results require all 24 valid integer responses between 1 and 7. Incomplete sessions remain drafts, with no inferred Type and no automatic 50/50 scores for missing dimensions.
- Percentages are normalized response positions, not probabilities or confidence levels.
- For display, a dimension within five points of 50 is labeled near the midpoint. This is a presentation convention, not a statistical confidence interval.
- General `context-v1.0` is the comparator for these context results. Preserve old `v0.1` 48-question results as a separate reference; do not display their difference from the new questionnaire as a contextual shift.

## 5. Comparison and language

Use four horizontal spectrum rows with General and selected context markers. Each row shows both scores and the signed difference in score points. Offer a mobile table/text view; do not make a radar chart the only way to read the data.

For each dimension, compute `context score - General score`. Positive differences move toward I/N/F/P; negative differences move toward E/S/T/J. A difference of 12 means 12 score points, not a 12% increase in personality.

Show the largest numerical difference and any midpoint crossings with the underlying scores visible. Do not call a difference significant, a new identity, or a stable personality change. Do not infer a confidence level or diagnose stress from these responses.

Suggested copy:

> ในคำตอบชุดนี้ เวลาทำงานคุณให้น้ำหนักกับหลักเหตุผลมากกว่าภาพรวมทั่วไปของคุณ 12 จุด บริบทอาจเกี่ยวข้องกับ preference ที่แสดงออกต่างกัน แต่ผลนี้ไม่ได้หมายความว่า type จริงของคุณเปลี่ยน

Use "อาจ", "จากคำตอบครั้งนี้", and "ลองสังเกต". Include assessment dates and the fact that responses may also differ with time, interpretation of the questions, or the situation recalled. General is a reference snapshot, not an authoritative true type.

Type badges can say `Work · ใกล้ ISTJ` or `Stress · ใกล้ INFJ · S/N ใกล้กึ่งกลาง`. Avoid adding `-ish` without explaining which dimension is near the midpoint. Never hard-code outcomes such as Work = ISTJ or Stress = INFJ.

When General is absent, explain that a General assessment is needed for the baseline comparison. Individual completed context results remain viewable. When another context is missing, show an action to complete it, not a zero or midpoint marker.

## 6. Storage and compatibility

Existing issues to account for:

- `getLatestResult()` currently has a legacy fallback. It must never be mistaken for a completed V12 General result.
- The current history fingerprint uses only Type and scores. Identical scores in different contexts must remain separate sessions.
- The current draft key stores one answer array; switching contexts would mix answers without separate draft storage.
- Existing report/share tokens contain only Type and four scores, so context would otherwise be lost or mislabeled.

Proposed independent local namespace: `pte.contexts.v12`. Keep the V9 result/history/draft keys intact; V12 completion must not replace the old General result.

Suggested completed session shape:

```json
{
  "id": "unique-session-id",
  "context": "work",
  "questionnaireVersion": "context-v1.0",
  "type": "ISTJ",
  "dims": { "EI": 79, "SN": 46, "TF": 39, "JP": 38 },
  "createdAt": "ISO timestamp",
  "referencePeriod": "past-four-weeks",
  "source": "context-assessment"
}
```

The sample is illustrative, not a predicted outcome. Store validated complete sessions by unique ID and retain repeated assessments, including identical scores. Store drafts by both context and questionnaire version, with progress and update time. Session selection references IDs rather than copying or overwriting results.

Handle corrupt local data with a recoverable state. Preserve drafts on write failure; clear only the completed context draft after successful local writes. Completing another context must leave other drafts unchanged. Validate context values, question version, response count/range, session IDs, Type, and four finite score values on input.

## 7. Reports, sharing, and database boundary

Reuse the V10 layout for individual context reports, with a prominent context label, questionnaire version, and assessment date. The preview, PNG, and PDF must all carry the same label. Add the self-reflection wording without implying that a Work result replaces General.

Initially keep V12 context results local. The current assessment API expects 48 answers and the database has no context column; V12 must not post 24 answers into that legacy API or silently send responses to a database.

Initially disable the existing share and friend-Compare controls for all `context-v1.0` results, including the new 24-question General. Explain that those controls currently support legacy 48-question results. Do not export a context report with the existing QR if its payload would lose the context label. Context-aware public sharing is a subsequent step requiring an explicitly versioned payload, context preservation, opt-in scope, and database token expiry/revocation behavior.

This boundary preserves existing General sharing and Compare. V12 comparison belongs in `/contexts` and compares one person's chosen local sessions, rather than reusing `/compare`'s other-person logic.

## 8. Proposed implementation sequence

These are design-level work packages; a detailed execution plan follows approval of this design.

1. **Questionnaire and interpretation:** author and review the 24-item common core, five contextual presentations, instructions, and midpoint wording. Define data fixtures with equal scores, midpoint crossings, and opposing preferences.
2. **Data and storage:** add context metadata, validated session/draft storage, compatible-version selectors, and isolated namespaces; preserve all existing V9 data.
3. **Assessment integration:** introduce explicit context selection and the 24-question flow; keep the existing 48-question path and completion behavior unchanged.
4. **Context results and comparison:** implement cards, progress, session selection, four spectra, score-point differences, absent-data states, and contextual explanations.
5. **Individual context reports:** integrate context/date/version into preview and both exports; prevent accidental General-only sharing of context results.
6. **Verification and user pilot:** run regression tests, full browser flows, responsive checks, artifact checks, and comprehension review. Public sharing/cloud storage remains outside this release.

Likely file boundaries: new context question data, new context scoring/interpretation and storage helpers, `/contexts`, context-specific UI components; targeted changes to assessment selection, result routing, navigation, and report rendering. Avoid a broad rewrite of the existing scoring or friend comparison.

## 9. Acceptance criteria

- General and all four contexts can be completed separately, in any order.
- Switching context and reloading restores the correct independent draft.
- Each context presents 24 reviewed items; dimensions and directions match the approved item map.
- A context completion does not change V9 latest result, V9 history, or another context's draft.
- Identical scores in different contexts and repeated sessions are retained separately.
- Only complete sessions of the same context questionnaire version are offered for a contextual baseline comparison.
- Old 48-question results remain accessible and clearly separate from V12 General.
- All four displayed score differences have correct direction and units; equal values show zero.
- A midpoint crossing does not produce a claim that the true type changed.
- Missing General, unfinished modes, invalid URLs, and corrupt storage show understandable actions/states.
- Storage failure preserves answers and allows retry; rapid final clicks create one session.
- Report preview, PNG, and one-page PDF contain the correct context/date/version and legible Thai text.
- V12 sends no 24-question request to the legacy 48-question API; General flow, existing shares, and friend Compare still work.
- Browser testing covers desktop, 390px mobile, keyboard controls, completion, resume, result selection, and exports; unit tests cover scoring, storage isolation, compatibility, and midpoint/delta behavior.

## 10. Review decision

The user confirmed the 24-question format with a new General baseline and subsequently approved the full design with "ok" on 2026-10-14. This includes local-only V12 storage and deferred public context sharing. A detailed implementation plan must now be reviewed and its execution method selected before implementation. No code, database schema, deployed site, or stored user result is changed by this document.
