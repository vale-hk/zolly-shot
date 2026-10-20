# CineTrack update
- [x] Premium cinematic palette, camera dolly header and pre-login landing.
- [x] Cloud authentication with profiles and persistent user data.
- [x] Interactive cinema cards and full movie detail modal.
- [x] Community watchlist saving with duplicate prevention.
- [x] Week/month/year habits accordions and calendar.
- [x] Test duplicate rules and verify signed-in save/reload flow.

## Security architecture deliverables
- [x] Audit current controls and verify Chilean legal sources.
- [x] Deliver technical security architecture, authentication examples and phased implementation plan.
- [x] Deliver secure-registration checklist distinguishing verified controls from pending work.

## Functional security and privacy
- [x] Add and run seven browser regression checks for signup, simulated confirmation, login, reload and safe errors; all fourteen existing unit tests pass.
- [x] Add a human-assisted real-inbox test without stored credentials or administrator confirmation.
- [ ] Run the real-inbox signup/confirmation/login test. Blocker: a new real inbox controlled by the tester and its confirmation link are unavailable; delivery and live confirmation are not verified.
- [x] Harden hosted registration and password settings, validation and recovery.
- [x] Remove public account identifiers and automatic activity sharing; enforce database validation.
- [x] Add authenticator verification and account security controls with database assurance enforcement.
- [x] Add provisional privacy notice and defensive response headers; verify visitor isolation, eight public pages and fourteen unit tests.
- [ ] Verify confirmed registration, signed-in saving, MFA enrollment/login and two-account isolation end-to-end. Blocker: no existing auth users; confirmation requires a real inbox controlled by the user (reserved test domains are correctly rejected).
- [ ] Complete legal notice, retention and incident procedures. Blocker: responsible party identity/contact, retention policy and operational decisions have not been supplied.
- [ ] Verify production HTTPS and configure CAPTCHA/email DNS. Blocker: no published site or verified sender domain/CAPTCHA credentials.

## Remaining architecture targets
- HttpOnly sessions and strict script CSP are not implemented; current managed browser sessions and Start hydration must be migrated together before claiming those targets.
- External penetration testing and operational/legal compliance certification are not performed.
## Zolly Shot rebrand
- [x] Brand, logo, vertigo landing, Filmoteca rename, sections and dashboard profile (name + pseudonym).
- [x] Detail modal with rating, review, remove; posters; catalog 1920–today, genres, add-then-choose status; films only with adaptation note.
- [x] Community likes, comments and quick status menu.
- [ ] Verify signed-in flows end-to-end. Blocker: no confirmed test account available.
## Zolly Shot round 2
- [x] Brand font on headings/buttons, new logo (IMAX frame, camera, film strip) with slogan.
- [x] Dashboard header with welcome, compact once name + pseudonym set (no avatar by design).
- [x] Cinematic frames for cards; private "Mis ideas" with four templates; notification bell with replies.
