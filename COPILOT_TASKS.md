# Copilot Tasks — GRD Emergency Kit Game (Microgames + Logic)

## Rules
- Work only inside /js/game and /js/microgames and /js/ui when assigned.
- Do not modify CSS files created by Gemini.
- Keep each microgame independent (no shared DOM selectors outside its mount element).
- Must support mouse + touch. Provide click fallback whenever dragging is used.
- Avoid external requests. Everything local.

---

## Task 1 — ItemBank (data + helpers)
Create /js/game/ItemBank.js
- Load items from /data/items.json with fetch; fallback to embedded list if fetch fails.
- Provide helpers:
  - getByCategory('E'|'R'|'N')
  - sample(count, filters)
  - getEssentialIds()
  - getItem(id)
  - shuffle()

DoD:
- No crashes if fetch fails.
- Items have id, name, category, feedback.

---

## Task 2 — ScoreManager (combo + streak + lives effects)
Create /js/game/ScoreManager.js
- Tracks score, streak, bestStreak.
- Scoring rules (config-driven).
- Expose:
  - addResult({win, picks:{E,R,N}, timeUsed})
  - getSummary()

DoD:
- Unit-ish tests via console logs.
- Summary includes totalWins, totalFails, accuracy.

---

## Task 3 — Microgame: MG_SelectEssentials
Create /js/microgames/MG_SelectEssentials.js
Goal: select 3 essential items (tap/click or drag into zone).
- Duration: calm 18s, challenge 12s.
- UI: grid of 9 items (mix E/R/N). User must select 3 essentials.
- Feedback inline (small badge) per selection.
- Win when 3 essentials selected; fail if selects 2 wrong or time ends.

DoD:
- Works without drag (click to select).
- Calls ctx.onComplete({win, scoreDelta, details}) once.

---

## Task 4 — Microgame: MG_PriorityOne
Create /js/microgames/MG_PriorityOne.js
Goal: choose the MOST vital item (1 pick).
- Show 6 items; exactly 1 is “priority” essential (water or medkit depending config).
- Player picks once.
- Win/Fail immediate (fast microgame).

---

## Task 5 — Microgame: MG_RemoveJunk
Create /js/microgames/MG_RemoveJunk.js
Goal: bag has 5 items; remove 2 non-essentials.
- Player clicks items to remove (or drags out).
- Win when removed the correct 2.
- Fail if removes essential or time ends.

---

## Task 6 — Microgame: MG_SwapItem
Create /js/microgames/MG_SwapItem.js
Goal: swap 1 bad item for 1 good item.
- Bag starts with 4 items (includes 1 N). Tray has options including the correct E.
- Player must replace N with E.

---

## Task 7 — Microgame: MG_Memory
Create /js/microgames/MG_Memory.js
Goal: memorize an expert bag for 2 seconds then recreate.
- Phase A: show 4 items in bag for 2s.
- Phase B: user selects 4 from 10.
- Win if matches all 4.

---

## Task 8 — Integrate microgames.json
Create /data/microgames.json listing microgame ids, title, weights, and duration overrides.
MicrogameEngine should be able to pick next game randomly by weights.

---

## Task 9 — Accessibility & Reduced Motion hooks
- All interactive elements must have aria-label.
- Ensure focus states exist (CSS will handle, but add proper tabindex).
- Respect prefers-reduced-motion by disabling JS-driven shakes and heavy particles.

---

## Task 10 — Smoke test page
Add a hidden dev route or debug toggle in main.js:
- pressing `D` opens a debug menu to launch a specific microgame.

