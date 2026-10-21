# Question wording revision — 2026-10-21

## Editions and scope

- General: `v0.1` → `v0.2`, 48 original Thai bipolar items.
- Context Mode: `context-v1.0` → `context-v1.1`, 24 items in each of five contexts.
- IDs, dimensions, order, scoring direction and seven response positions are unchanged.
- Each general dimension has 12 items (six per direction); each context dimension has six (three per direction).
- Wording, examples and endpoints were revised. Unchanged score arithmetic does **not** establish measurement equivalence.

## Editorial decisions

Use short everyday situations, conversational Thai, and concrete actions. Ask about usual experience rather than an ideal self. Keep both endpoints respectful; neither should imply higher intelligence, kindness, competence or maturity. Avoid jokes, personality labels and emotional pressure inside scored items.

The four intended dimensions remain energy/processing (EI), information (SN), decision priorities (TF), and planning (JP). For TF, emphasize what receives weight first, rather than suggesting that reasoning and concern for people are mutually exclusive. For SN, remove emotional-memory language that can overlap with TF. In the friends context, item 5 now explicitly concerns a new idea, matching the processing focus of its other context variants.

Context items retain their explicitly authored context and the existing past-four-weeks instruction. The four-week window is a product choice, not a validated recommendation from the cited studies. The general 48-item questionnaire retains a usual-daily-life instruction; it is separate from Context Mode's General.

## Research and limits of inference

1. Boateng, G. O., et al. (2018). *Best Practices for Developing and Validating Scales for Health, Social, and Behavioral Research: A Primer.* https://doi.org/10.3389/fpubh.2018.00149
   - Supports deliberate item development, expert review, cognitive interviewing, and separate evaluation of dimensionality, reliability and validity.
   - Apply by checking item comprehension and construct relevance before statistical validation. The primer suggests cognitive interviews with 5–15 people over 2–3 rounds; this is not a psychometric validation sample size.
2. Lievens, F., De Corte, W., & Schollaert, E. (2008). *A closer look at the frame-of-reference effect in personality scale scores and validity.* https://doi.org/10.1037/0021-9010.93.2.268
   - Supports the importance of a conceptually relevant frame of reference and examines reduced response inconsistency.
   - Does not validate these five contexts, four-week window, Jung–Myers dimensions, or cross-context comparisons.
3. Landers, R. N., & Collmus, A. B. (2022). *Gamifying a personality measure by converting it into a story: Convergence, incremental prediction, faking, and reactions.* https://doi.org/10.1111/ijsa.12373
   - In a study of 426 people, storified conscientiousness and openness measures received more positive reactions on some dimensions but did not retain the original psychometric profile.
   - Motivates a restrained wording revision and fresh evaluation. It is not evidence that the present revision improves enjoyment, accuracy, or resistance to faking.

These sources informed design principles; none evaluated this Thai item set. No reliability, validity or engagement improvement is claimed.

## Version handling

- The 48-item draft key includes `QUESTIONNAIRE_VERSION`. Old drafts are left intact and never resumed as current answers.
- Result/history keys are retained. Identical score profiles from different questionnaire editions remain distinct history entries.
- Context drafts already use edition and context in their key. Archived sessions remain readable and linked from Context Mode.
- Context comparisons select only the current edition. Do not infer change in personality from differences between editions.
- The API request and completed 48-item result both use the shared edition constant.

## Validation still required

1. Expert review of construct coverage, single focus, endpoint balance and wording relevance across contexts.
2. Cognitive interviews with Thai-speaking target users, including how they interpret the midpoint and cases where neither endpoint fits. Do not treat a midpoint as missing data.
3. Pilot evaluation of completion, comprehension and enjoyment separately from measurement quality.
4. Examine item distributions, factor structure, reliability and convergent/discriminant validity with appropriate established measures.
5. Evaluate equivalence between editions and measurement invariance across contexts before treating score differences as directly comparable.

The inherited bipolar format itself also requires scrutiny: two legitimate preferences may coexist rather than form opposite ends of one construct. Software tests verify scoring and storage behavior, not psychometric quality.

## Implementation verification

Environment: local production server `http://127.0.0.1:3101`, Next.js 16.4.0, headless Microsoft Edge. Browser plugin not available; used bundled Playwright with installed Edge. No dependencies installed. Desktop viewport 1280×900; mobile viewport 390×844.

| Check | Result |
| --- | --- |
| Page identity and meaningful content | PASS: expected title and question content |
| Framework error overlay | PASS: none observed |
| Console health | PASS: no warnings, errors or uncaught page errors on changed routes |
| Desktop/mobile screenshots | PASS: visually inspected, no horizontal mobile overflow |
| General interaction | PASS: select → auto-advance → back with selection retained → reload/resume → final answer → result |
| General persistence | PASS: completed result, history and intercepted API payload carry v0.2; new draft cleared, old draft retained |
| Context interaction | PASS: all five contexts render; work select → reload/resume → completion |
| Context edition boundary | PASS: old draft preserved, new draft cleared, archived result linked and readable |
| Research links | PASS: all three added DOI links rendered |
| Automated tests | PASS: `node --test tests/*.test.mjs`, 23 tests |
| Production build | PASS: `npm run build` (generated-file write needed sandbox escalation) |

Screenshots are stored in the task artifact directory:

- `C:/Users/sutinan/.codex/visualizations/2026/10/21/01a15e0c-c60a-7691-84f0-5e6af8254734/questionnaire-desktop.png`
- `C:/Users/sutinan/.codex/visualizations/2026/10/21/01a15e0c-c60a-7691-84f0-5e6af8254734/questionnaire-mobile.png`
- `C:/Users/sutinan/.codex/visualizations/2026/10/21/01a15e0c-c60a-7691-84f0-5e6af8254734/questionnaire-methodology.png`

The API submission was intercepted in the browser test; no synthetic answers were sent to the real database. Live remote persistence and psychometric properties were not tested. General friend-comparison shares inherit the existing score-only format without questionnaire edition metadata, so general comparisons do not establish equivalence across editions.
