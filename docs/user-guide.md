# User Guide

This guide describes the main features of the Nahla admin portal
from the point of view of an administrator.

## 1. Login

Open:

```
http://localhost:3000/login
```

- Enter your email and password
- Use the FR / EN switch to choose the interface language
- Click **Se connecter / Sign in**

If the credentials are invalid or the account is blocked,
an error message is displayed.

## 2. Language switch

The **FR / EN** button is available in the top-right corner of every page,
including the login page.
The selected language is remembered between sessions.

## 3. Dashboard (`/dashboard`)

The dashboard is the entry point for every admin.

It contains:

- Key metrics (total users, active users, premium users, etc.)
- A subscription distribution chart
- Active users by region
- An activity heatmap
- A 30-day subscription trend chart

The 30-day trend uses daily snapshots stored by the backend.
If no snapshots exist yet, an **Initialize snapshot** button is shown.

## 4. Users management (`/users`)

The users page lists all Nahla users.

Available actions:

- Search and paginate the list
- Add a user
- Edit a user
- Block or unblock a user
- Export the list to Excel or PDF
- Click on a row (or the **View** button) to open the 360° profile

Available roles: `Super Admin`, `Support`, `Analyste`, `Apiculteur`.

## 5. 360° Profile (`/users/[id]`)

The 360° profile displays a complete view of a specific beekeeper:

- Personal information
- Account status
- Current subscription and expiration
- Hives, movements and last activity
- Churn risk
- Trajectory map of the hives
- Related field signalements

The administrator can also suspend or reactivate the user.

## 6. NDVI Cartography (`/maps`)

The map page has two tabs:

- **NDVI Zones**
- **Activity Heatmap**

On the NDVI tab, the administrator can:

- View existing zones with their color coding
- View localized beekeepers as markers
- Use the current location button
- Add a new zone either from the map or from the current location
- Update the details of any zone

All NDVI zones are persisted in the backend.

## 7. Field alerts (`/alerts`)

The alerts page shows the field signalements sent by beekeepers.

The administrator can:

- Filter by status (`All`, `Pending`, `Validated`, `Rejected`)
- Open the details of a signalement
- Validate the information
- Reject the signalement with a required reason

## 8. Reported content (`/reports`)

The reports page shows complaints made against existing platform content.

Each row includes:

- Reporter
- Target type
- Reason
- Snapshot of the reported content
- Status
- Creation date

## 9. AI Assistant (`/ai`)

The AI page contains three sections:

### AI Reports

Generate executive summaries:

- Weekly summary
- Subscriptions
- Signalements
- Dashboard health

### General Beekeeping Assistant

Ask general questions related to bees, hives, floraison, pesticides,
drought, transhumance, etc.

### Nahla Platform Assistant

Ask questions related to Nahla users, subscriptions, signalements,
reports, maps and dashboard indicators.

Both assistants work as a chat:

- Follow-up questions are supported thanks to a short conversation history
- The history is kept **only** while the page is open
- Refreshing the page clears the conversation
- Responses are returned in the currently selected language

## 10. Logout

Click **Logout / Déconnexion** in the bottom-left corner.
This clears the local token and returns to the login page.