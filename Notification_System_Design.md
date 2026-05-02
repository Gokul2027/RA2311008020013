# Notification System Design

## Stage 1

### Problem
Students can receive a noisy stream of updates, which makes important notices easy to miss. The goal of the Priority Inbox is to surface the top unread notifications that deserve attention first.

### Approach
Each notification earns a score based on its category and how recent it is:

`score = typeWeight + recencyScore`

Priority weights are assigned by impact:

- Placement: 30
- Result: 20
- Event: 10

The recency portion is calculated as:

`10 / (hoursElapsed + 1)`

This keeps fresh notifications near the top while ensuring the score never falls to zero.

### Handling New Notifications Efficiently
If the feed grows continuously, the ranking layer can place incoming notifications into a max-heap keyed by score. That makes repeated top-N retrieval much cheaper than sorting the entire list after every insertion.

### Output
The Stage 1 script prints a ranked terminal view of the chosen top-N notifications. A screenshot of that terminal run should be stored in `priority_inbox/screenshots/`.

### Authentication
The evaluation service is pre-authorised at the platform level, but the submission still needs a token for API access. During the pre-test setup, registration yields a `clientID` and `clientSecret`, which are then used by the auth step before fetching notifications.

---

## Stage 2

### Architecture

```text
React SPA (Vite + TypeScript)
      |
  auth + api layer
      |
evaluation notification service
```

The frontend authenticates once, stores the token in session storage, and uses that token for notification requests and telemetry logging. The application is designed to run on `http://localhost:3000` and uses Material UI as the presentation layer.

### Pages
1. All Notifications: filterable, paginated feed with read and unread states.
2. Priority Inbox: ranked list of the most important unread notifications with a selectable top-N view.

### API Usage
The notifications endpoint is consumed with the supported query parameters:

- `limit`
- `page`
- `notification_type`

### Read/Unread Tracking
Viewed notification IDs are tracked on the client through React context and mirrored into session storage so the interface feels consistent during a browsing session.

### Logging
API requests, failures, route changes, filter changes, and read actions are routed through the shared `Log()` middleware so both stages follow the same telemetry pattern.
