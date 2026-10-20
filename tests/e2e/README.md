# Authentication E2E

Run `bunx playwright test` against the running app at `http://localhost:8080`.
These seven regression checks use synthetic provider responses; they do not
verify real email delivery or hosted authentication settings. They cover signup
without a session, access rejection before confirmation, confirmation callback,
logout, login, reload, provider errors, throttling and connection failure.

## Real inbox check

Run `python3 tests/e2e/real_signup.py` in an interactive terminal with Python
Playwright installed and the app running at `http://localhost:8080`. Provide a
new email address you control and a unique password through hidden prompts.
The script submits an actual signup and pauses for you to retrieve the original
confirmation link from your inbox. It follows that real link, verifies the UI,
signs out, checks an incorrect password, signs in, reloads and signs out again.
Only the callback destination is brought to the local UI after real verification.
No administrator confirmation or fabricated session is used.

No passwords, links, inbox contents, browser storage, screenshots or traces are
saved. Never paste credentials or confirmation links into chat. The real test
account remains afterwards. Use a dedicated testing address. Without inbox
access this run is blocked and real confirmation must be reported unverified.