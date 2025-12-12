Non-Functional Requirements (NFR)

This document lists non-functional requirements and constraints for MavStudy.

1. Performance
   - The application should load the main UI (home/resources) within 2 seconds on a broadband connection.
   - Chat message updates should appear within 2 seconds of sending under normal conditions.

2. Scalability
   - The system should handle hundreds of concurrent users without a significant degradation in response time. Firebase Firestore rules and indexes should be reviewed for scale.

3. Availability
   - Target availability: 99% during daytime hours.

4. Security
   - All authentication is handled by Firebase Auth.
   - Sensitive operations (profile edits, joining groups) require authenticated users.
   - Follow Firebase security rules for Firestore and Storage to prevent unauthorized reads/writes.

5. Privacy
   - Do not store plaintext passwords in the repo or in client-side code.
   - Follow the privacy expectations: user profile and minimal PII only; store timestamps rather than raw credentials.

6. Accessibility
   - Basic accessibility: pages should be usable via keyboard navigation and provide alt text for images where possible.

7. Responsiveness
   - UI should be responsive and usable on mobile and desktop screens.

8. Maintainability
   - Code should be modular and documented; unit tests are desirable for critical functions.
