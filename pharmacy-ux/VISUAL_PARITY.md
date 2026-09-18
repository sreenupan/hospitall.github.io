# Pharmacy visual parity â€” 14 September 2026

The user restored their finalized Pharmacy backup and explicitly prohibited workflow changes. This supersedes the earlier workflow-extension attempt.

Scope: match completed HospitALL modules through colours, typography, cards, controls, a blue collapsible/resizable sidebar, white header and responsive presentation. Keep all existing pages, navigation labels/destinations, forms, sample data, validation, action handlers and workflow scripts.

Implementation adds only hospitall-theme.css and hospitall-shell.js to the existing HTML pages. The shell moves existing DOM nodes without replacing their workflow content or handlers. Table wrappers provide contained horizontal scrolling; they retain every column and control. Sidebar width uses a separate visual preference key. No Pharmacy business state is read or written by the added script.

Restored baseline and byte-for-byte source preservation evidence: ../review/pharmacy-visual-2026-09-14/. Removing the two asset tags must reproduce each original HTML file exactly; pharmacy-ux.js, README.md and WORKFLOW_PLAN.md must retain their original hashes.

- [x] Record restored baseline.
- [x] Add isolated theme and presentation shell.
- [x] Review all 18 pages at 1600x900, 1280x800, 900x700 and 390x844.
- [x] Smoke-check existing form/view transitions, report tabs and shell controls.
- [x] Inspect screenshot gallery, console logs and final preservation checks.

Do not repair or redesign existing workflow behavior during this visual-only pass. Existing workflow limitations are not authorization to change them. Doctor and other completed modules remain untouched.

Completed: 18 pages, 44 captured states, 166 viewport/layout checks across four sizes. Gallery: ../review/pharmacy-visual-2026-09-14/index.html. Original 21 restored files preserved (HTML differs only by two visual asset tags); 45 protected module assets unchanged. Browser console errors: none observed. Screenshots are viewport captures; long forms and wide tables remain scrollable. Native OS print dialog not tested.
