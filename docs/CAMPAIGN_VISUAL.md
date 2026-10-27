# Campaign map visual contract

The human's latest direction replaces the grade-selector interface with one continuous50-island journey. This map displays progression and navigation only; it does not claim that colors or map position establish new English semantics.

Visual thesis: a single warm notebook-paper chart over the existing turquoise island world, with numbered brass-edged stops, quiet chapter dividers and one coral current-island accent.

Content plan: show journey title and completion count, five plain chapter rows of ten islands, then one resume action and a compact state legend. Use the existing Rubik Hebrew/Latin font. Keep English level names LTR and Hebrew navigation RTL. No grade labels, new models, Tripo generations or marketing hero.

Interaction thesis: a short sheet entrance establishes the overlay; current-chapter scroll/focus restores orientation; restrained hover/focus and explicit state icons make each available stop understandable. Reduced-motion settings remove the entrance/hover movement. Unplayed islands beyond the frontier remain disabled; saved completed islands remain replayable.

## Integration

`mountCampaignMap(container, options)` is exported from `src/campaign-map.ts`, which imports its own `campaign.css`. It replaces container contents with a self-contained modal map. The caller provides all authored level metadata and progression; the renderer creates no puzzle content or unlock state.

```
{
  levels: [{id, number, title, chapter}],
  completed: Set<string>,
  currentId: string,
  unlockedThrough: number,
  onChoose(id),
  onClose()
}
```

`chapter` accepts a human-readable string or a numeric chapter identifier. Chapter grouping is stable by island number:1–10,11–20,21–30,31–40,41–50. Human-readable supplied chapter strings are displayed directly; numeric identifiers use a plain chapter-number heading. The lead/content owner supplies final names and all50 authored titles.

The lead pauses world input/pressure while the map is open, and hides/removes its host when onClose or onChoose runs. The renderer stops keyboard bubbling, traps Tab within its own enabled controls, supports Escape and backdrop close, and attempts to restore the previously focused element on close. It does not modify world/controller state or persist completion.

## States and controls

- Completed: check icon and explicit accessible completion label.
- Current: coral number/ring, visible “כאן” marker and aria-current=step. A completed current island retains its completion check.
- Available: numbered cream stop and accessible “פתוח” label.
- Locked: real disabled button, lock icon and accessible “נעול” label. Every number>unlockedThrough is disabled unless its ID is in completed. Legacy saved wins may appear later in the campaign and remain replayable without completing or unlocking intervening islands.

One roving Tab stop covers the map nodes, with Left/Right, Up/Down, Home/End navigation among enabled islands. Up/Down follow the current CSS grid column count. Number order remains LTR on the chart. Resume targets the enabled current island (including a legacy completed island beyond the frontier), or highest available stop. Available includes completed legacy islands. Vertical arrows preserve the visual column while skipping locked rows; horizontal arrows skip disabled islands. Completion counts intersect supplied authored IDs; no phantom completed island is counted.

Desktop uses ten stops per chapter; narrow screens use five stops across two rows. Touch targets remain at least44px. The sheet header/footer stay outside the scrolling chapter area; short-landscape and mobile views scroll the chapter content. Titles are visible, line-clamped to two lines and fully available in accessible names/native tooltips. All dynamic content uses textContent rather than injected HTML.

## Verification status

Implementation and TypeScript checks are recorded after creation below. Browser inspection is pending the lead's request; no visual pass or touch/keyboard browser result is claimed before it occurs. No runtime/gameplay, main.ts, style.css, world.ts or Git changes belong to this map subtask.

Implementation complete: the renderer and scoped stylesheet are saved. `npx tsc --noEmit` passed. The lead clarified the legacy-save exception: a completed ID beyond the current frontier remains enabled/replayable, and the renderer now implements that exception without changing any intervening island's state. Vertical keyboard navigation preserves the current chart column across sparse legacy completions. Actual desktop/mobile browser review remains pending integration notice.

## Actual browser review after integration

Ran `node work/campaign-art/review.mjs` against http://localhost:5263 in fresh, separate desktop1440×900 and mobile390×844 contexts (mobile touch enabled). No completion/win state or restored save was injected. All4 captures were produced; desktop top, mobile top and mobile end were opened and visually inspected. Captures and machine observations are in ignored `work/campaign-art/` for the lead's delivery selection.

Observed on both viewports:50nodes,5chapter headings, only island1 enabled and49disabled, no grade selector, no horizontal sheet overflow, current focus on1. Shift+Tab/Tab stayed within close/resume/current-node controls. ArrowRight/End did not enable locked nodes or move the world behind the map. Escape removed the map and restored focus to the map button. Scrolling reached island50, visibly locked and inside the chart. Mobile hit-testing confirmed the map covers the underlying D-pad; it did not protrude above the overlay in inspected captures. No page errors.

The five integrated chapter names are המכתבים הראשונים, מילים משנות דברים, משווים ובוחרים, מתארים בדיוק, הדרך לחגיגה. These are navigation headings supplied by content, not grade labels.

A minor style conflict was found: the game's global button:hover painted a white rectangle behind disabled stops. A scoped disabled:hover rule now keeps their background transparent. Ran `node work/campaign-art/mobile-recheck.mjs`: an actually hovered locked island38 computed transparent, the new mobile-end capture was opened/inspected, touch Resume returned to the actual first island, and touch Close removed the reopened map. No page errors. All art-owned browser contexts/processes were closed.

This fresh-save visual pass verifies current/locked rendering and map controls. Completed/available appearance and real unlock sequencing are implemented but were not claimed from injected completion fixtures; the lead and independent QA own actual campaign-play verification and legacy-save restoration tests.

## Final target-label cleanup

Root inspected the actual two-fan and three-sponge captures after the spacing fix. Adjacent pad captions obscured the objects. The final renderer shows the selected pad caption during placement and hides pad captions during exploration; numeric requirement markers and the lighthouse remain visible. TypeScript/build passed. Additional final static-browser captures hit startup/navigation/frame polling timeouts across headed/headless and native preview attempts; these are not reported as new visual passes. The previously inspected campaign/map captures and all 50 completed physical paths remain separate evidence.

Final root visual recovery passed against the completed static build at 127.0.0.1:4263 using a headed hardware renderer, timed startup polling, visible forced pointer clicks and the normal 16ms simulation hook for each capture. The isolated fixture restored earned 50 IDs solely for visual/control replay. Inspected fan-target-selected.png, two-fans-visible.png and three-sponges-visible.png: one selected caption while placing, no pad captions hiding finished objects. Actual two-fan force 8N; partial sponge absorption 4; three sponges 12 and ready. 0 page errors. See docs/campaign/pad-visibility.json/mjs. Failed prior startup/frame probes remain separate from this successful check.
