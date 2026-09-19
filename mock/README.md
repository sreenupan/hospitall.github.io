# Browser-only mock data

This is a static HTML/CSS/JavaScript prototype. It requires no Node runtime, application server, database service or payment service.

## Files and saving

- prototype/mock/seed.json contains the fictional starting data and pharmacy inventory.
- On first visit, the browser loads the JSON and saves a working copy in IndexedDB.
- Patient, Reception, Nurse, Doctor, Inpatient, Emergency and Pharmacy Rx Dispense use that shared browser copy.
- Reloading pages or restarting the browser retains data unless site storage is cleared. Different browsers, devices, profiles and visitors have separate demonstrations.
- Changes do not modify the hosted JSON file or GitHub repository.
- Refresh a destination role to see changes made in another open tab. Clinical forms are not replaced automatically during editing.
- Reset demo restores seed.json in this browser. Stale tabs must reload; old writes are rejected. IndexedDB transactions serialize concurrent tab writes.

Use HTTPS (as GitHub Pages does), with browser storage enabled. Storage failures show an unsaved-data notice and retain the previous saved database. Opening HTML through file:// is not supported because browsers restrict fetching local JSON.

## GitHub Pages layout

For https://sreenupan.github.io/hospitall.github.io/doctor.html#doctor, copy the contents of prototype/ into the Pages publishing root. Keep the existing HTML, CSS, JS, pharmacy-ux and other asset folders together. Include mock/seed.json and js/mock-core.js, js/mock-client.js and js/mock-loader.js.

All runtime URLs are relative, so hosting the files within another subdirectory also works. review/ evidence and mock/*.test.cjs are development files, not hosting requirements. Nothing was published or pushed.

## Demonstration sequence

1. Patient → Book another appointment → Dr. Priya Sharma → choose 04 Aug 2026 and 11:00 AM → confirm. This is the Reception/Nurse mock scenario date.
2. Reception → new visit → Collect Payment → Cash → Confirm Payment Received → Go to Check-in → Confirm Check-in → Send Nurse Handoff.
3. Nurse → same appointment ID → Record Vitals → Save Vitals → Mark Ready for Doctor → Confirm Ready.
4. Doctor → same visit → Start Consultation → complete the existing form → Complete Consultation.
5. Patient → My Appointments → Past → selected visit → summary and signed prescription.
6. Pharmacy → Rx Dispense → issued prescription → quantity, batch and mock payment → Dispense & Generate Bill. For a stocked test medicine use Paracetamol, 500 mg. Doctor prescriptions without explicit quantity leave the existing quantity field blank for confirmation.
7. For admission, sign the Doctor consultation with Admit to inpatient. Inpatient → Admissions → Review admission request → use the existing prefilled wizard.
8. Inpatient personas share admission, beds, observations, notes, orders/results, medicines, billing/insurance and discharge. Emergency inpatient handovers persist in the same browser.

Existing fixtures, static Doctor identity/date labels and the frozen Consultation layout remain preserved. Organization Admin and other Pharmacy business pages retain their independent UX demos; procurement/returns integration is not added.

## Verification

See [the current QA report](../review/github-pages-2026-09-19/report.md). Optional developer tests use Node only as a test runner, never as an application mode: node --test prototype/mock/store.test.cjs.
