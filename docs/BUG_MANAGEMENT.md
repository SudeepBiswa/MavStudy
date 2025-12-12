Bug Management (draft)

Reporting
- Use GitHub Issues to report bugs. Include steps to reproduce, expected vs actual behavior, browser/OS, and screenshots.

Severity levels
- Critical: Data loss, security breach, app unusable — fix immediately.
- High: Core functionality broken (e.g., join/leave group fails) — fix in next patch.
- Medium: Important but not blocking (e.g., sorting issue) — schedule in backlog.
- Low: UI tweaks, cosmetic issues.

Triage process
- Triager (project lead) reviews new bugs within 48 hours and assigns a severity and owner.
- Bugs with Critical/High severity should have a fix branch and a PR with a reference to the issue.

Labels to use
- bug, severity:critical/high/medium/low, needs-reproduction, regression

Storage & tracking
- All bug discussion should remain on the Issue thread. Use Checklists in the issue description for steps to reproduce.

Release practice
- Apply a tested fix and create a PR; after review merge to `main` and deploy to Firebase Hosting.
