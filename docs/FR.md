Functional Requirements (FR)

This document lists the project's functional requirements (FR). Items are numbered and mapped to issues where applicable.

Repository: https://github.com/CSCI4830-UNO/MavStudy

## FR11 — Blocking System
- ID: FR11
- Title: Blocking System
- Source / Issue: #17 (https://github.com/CSCI4830-UNO/MavStudy/issues/17)
- Priority: High
- Description: Allow users to block other users from interacting with them (prevent messages, group invites, or profile viewing as defined).
- Acceptance criteria:
  - A user can add another user to their blocked list.
  - Blocked users cannot send messages or join the blocked user's groups.
  - The block persists between sessions and is stored in Firestore.

## FR12 — Session Rater
- ID: FR12
- Title: Session Rater
- Source / Issue: #12 (https://github.com/CSCI4830-UNO/MavStudy/issues/12)
- Priority: Medium
- Description: After a study session or group activity, users can rate the session and leave optional feedback.
- Acceptance criteria:
  - Users may submit a rating (1–5) and an optional text comment for a session.
  - Ratings are stored and associated with the session and author in Firestore.

## FR13 — Calendar Integration
- ID: FR13
- Title: Calendar Integration
- Source / Issue: #13 (https://github.com/CSCI4830-UNO/MavStudy/issues/13)
- Priority: Medium
- Description: Integrate with a calendar (export or sync events) so users can add study sessions to their personal calendars.
- Acceptance criteria:
  - Users can export a session as an iCal file or open a calendar event prefilled with session details.

## Additional inferred FRs (from code/commits)

- FR01 — Real-time Chat / Conversations
  - Description: Provide real-time chat between users in groups (implemented via Firebase Firestore and UI). (see commit: e13bf5e)

- FR02 — Create and Join Study Groups
  - Description: Users can create groups, set preferences, and join/leave groups. (many commits around groups UI and join/leave fixes)

- FR03 — Resources page (student resources)
  - Description: Resources listing page with grouped resource cards and multi-link support. (commit: 3ea426a)

- FR04 — Post Sorting and Filtering
  - Description: Provide sorting and filtering of posts on the home/resources pages. (commit: ff987a3)

---

If you want to add formal IDs or acceptance-test links for any of these, tell me and I will update the FR list and convert items to a numbered product backlog.
