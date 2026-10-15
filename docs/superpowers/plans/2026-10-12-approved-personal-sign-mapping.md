# Approved Personal Sign Mapping Implementation Plan

> **For agentic workers:** Use superpowers:executing-plans to implement this plan inline, task by task. Steps use checkbox syntax for tracking.

**Goal:** Make all 16 Personal Signs match the mapping approved in PERSONAL_SIGN_MAPPING_REVIEW.md, including captions, complete-component highlights, and ENFP/ENFJ artwork adjustments.

**Architecture:** Keep the existing Next.js discovery flow, texture renderer, and CSS fallback. Store approved component names and visual meanings as shared data consumed by getSignParts. Reassign complete physical contours to the approved dimensions, adding contours for botanical pieces. Use sibling filenames for changed artwork.

**Tech Stack:** Next.js, React, Three.js, PNG assets, Node assertions, Playwright.

**Spec:** PERSONAL_SIGN_MAPPING_REVIEW.md (approved by user: “ok”).

## Global Constraints

- Preserve existing scoring, assessment, storage keys, APIs, and Result/Compare/History behavior.
- Keep ISFJ transparent artwork and its four existing groups.
- Give each physical piece one primary dimension; do not divide pieces by color or cut through them.
- Determine I/E and J/P from assembled structure, not gaps introduced by explosion.
- Do not push, deploy, or commit the user's existing workspace changes.

## Review Focus

- ESTP: all three fan blades belong to P; E highlights foliage.
- INTP: all four nodes belong to T; I highlights botanical pieces.
- Fallback: same components and holes as WebGL.
- ENFP: F has a visible warm core in both assembled and exploded views.
- ENFJ: E leaf pieces and J structural stems are independent.

## Task 1: Approved names and meanings

- [x] Add failing semantic assertions for ESTP, INTP, and all 16 type definitions.
- [x] Add shared names and per-type visual meaning, preserving original personality text.
- [x] Display actual component names and visual explanations in Discovery.
- [x] Pass semantic assertions.

## Task 2: Artwork and contours

- [x] Generate sibling ENFP assembled/exploded artwork with the approved F core, and ENFJ exploded artwork with detached E foliage.
- [x] Inspect generated images and check alpha.
- [x] Reassign and add contours according to the approved table; name physical groups so semantic assertions can pin their assignment.
- [x] Check probe pixels along complete components, especially ESTP fan blades and foliage.

## Task 3: Verification and delivery

- [x] Build production and restart the local test server.
- [x] Verify all 16 types and 64 highlights, assembled/exploded switching, replay, and Escape.
- [x] Inspect semantic contact sheets, fallback, and mobile.
- [x] Smoke-test Result, Compare, and History.
- [x] Update the approved mapping document and image prompt provenance, then deliver the local test link.

## Execution ledger

- User approved the draft mapping with “ok”; implement in the current workspace to retain their already edited and untracked artwork and pages.
- No branch or integration operation is required for this local update.

## Verification evidence (2026-10-13)

- Both Node suites pass: 16 approved mappings and SVG mask subtraction regressions (external and overlapping holes; three ESTP blade probes).
- Production webpack build exits 0; local production server restarted at http://localhost:3001/signs.
- Browser QA: all 16 types, 64 distinct desktop highlights, reassembly, replay, Escape; all 16 fallback views and 64 fallback highlights; all 16 mobile views, Reduced Motion and five routes without horizontal overflow.
- Final build smoke test: Result, Compare and History open Discovery; ENFP PNG download succeeds; no page errors.
- Final INFJ path contour refinement inspected in WebGL and fallback. ESTP fallback shows all three whole fan blades.
- Independent review caught exclusion-mask parity causing clipped blades. Added a failing regression, replaced parity subtraction with nested luminance masks, then verified passing tests and reviewer follow-up with no remaining findings.