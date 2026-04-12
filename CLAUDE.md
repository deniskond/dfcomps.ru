# dfcomps.ru — AI Agent Guide

---

## Product Overview

dfcomps.ru is a community platform for the Defrag mod of Quake 3 Arena — a racing/speedrun game mode where players navigate obstacle courses as fast as possible. The site manages competitions, tracks ratings, hosts community news, and provides player profiles. Two physics engines are supported throughout: **VQ3** (standard Quake 3 physics) and **CPM** (Challenge ProMode physics), and most features track them independently.

---

## News System

News posts are the primary content feed on the main page. Several types exist:

- **Simple (text)** — Plain editorial posts, announcements, community updates.
- **Offline Cup Start** — Announces the start of an offline competition, shows the map, download links, and deadline.
- **Offline Cup Results** — Published after an offline cup ends; contains ranked results tables per physics with times, rating changes, and demo download links.
- **Online Cup Announce** — Announces an upcoming online cup with server connection info and schedule.
- **Online Cup Results** — Results after an online cup concludes, with per-physics standings.
- **Multicup Results** — Aggregated standings for multi-round events, showing cumulative points across all rounds.
- **DFWC Round Results** — Results for Defrag World Championship rounds.
- **Streamers Results** — Results for streamer-hosted events.

Each news post can have a comment thread. Newsmakers can schedule posts beforehand. Posts support image uploads (JPG/PNG/GIF, max 5 MB). Individual posts can be hidden from the main page while remaining accessible by direct link.

---

## Competition System

### Competition Types

**Offline Cups** — Players download a map, record their best run as a Quake 3 demo file, and upload it before the deadline. Demos are then validated by designated validators before ratings are calculated.

**Online Cups** — Played live on a dedicated server. Results are entered by the organizer per round. Supports two simultaneous servers for larger events.

**Multicups** — Multi-round events that aggregate results from several individual cups into cumulative standings. Support different scoring systems, the modern one is EE system which was used for DFWC format with its own point distribution formula.

### Cup Configuration Options

When creating or editing a cup, the following settings are available:

- **Maps** — Up to 5 maps can be configured (name, author, weapons used, file size, custom map flag, levelshot image). Maps can be sourced from ws.q3df.org or uploaded as custom pk3 files.
- **Physics** — CPM, VQ3, or both.
- **Time window** — Start and end datetime for the competition period.
- **Round number** — For online cups with multiple rounds.
- **Server URLs** — Connection info for online play; optional second server for load balancing.
- **Archive links** — YouTube/Twitch VOD links attached to results news.
- **Timer support** — Whether the cup is displayed in the main timer block on the site.
- **Multicup association** — Links the cup to a parent multicup event.

### Cup Lifecycle

Offline cups move through these states:
1. **Active** — Accepting demo uploads from players.
2. **Waiting for validation** — Deadline passed; validators review submitted demos.
3. **Waiting for rating calculation** — All demos validated; admin triggers rating calculation.
4. **Finished** — Ratings calculated and published.

### Demo Validation

Validators review each submitted demo and mark it:
- **Valid** — Accepted, counts for ratings.
- **Invalid** — Rejected with a stated reason (e.g., cheating, corrupted file, wrong map).
- **Unwatched** — Default state, pending review.

Demos can also be flagged as: organizer run (excluded from rankings), outside competition (recorded but not counting), or excluded from calculations entirely. The validator can download a zip archive of all demos for a cup.

---

## Warcup System

**Warcups** are weekly community-run offline competitions. They are the most frequent competition type on the site and have a dedicated map selection process driven by community suggestions and admin voting.

### Map Selection Process

1. **Community suggestions** — Any community member can suggest maps for upcoming Warcups. Suggestions are stored and tracked with vote counts.

2. **Map types** — Suggested maps are categorized as:
   - **Strafe** — Pure movement/strafe maps.
   - **Weapon (Combo)** — Maps requiring mixed weapon usage.
   - **Weapon (Single)** — Maps built around one specific weapon.
   - **Extra** — Special or unconventional maps.

3. **Rotation system** — Warcups follow a fixed rotation sequence (1 = Strafe, 2 = Weapon Combo, 3 = Weapon Single) so that map types cycle predictably week to week.

4. **Voting period** — Before each Warcup, a voting period opens for admins with the `WARCUP_ADMIN` role. During this period, eligible admins vote on which community-suggested maps to use for the upcoming round. The voting state machine moves through: `WAITING` → `VOTING` → `CLOSING` → back to `WAITING`.

5. **Admin override** — Admins can flag a suggestion as an admin suggestion, which can override community picks if needed.

6. **Map selection outcome** — The winning map is recorded with its levelshot, weapon info, and map type. The Warcup number and next rotation slot are incremented automatically.

### Warcup Statistics

The admin panel shows suggestion statistics broken down by map type: how many Strafe, Weapon Combo, Weapon Single, and Extra maps have been submitted to the map suggestion pool.

---

## Rating System

Ratings are tracked separately for VQ3 and CPM physics. The system uses a points-based leaderboard (not pure ELO).

### Classic Rating

After each cup, each participant's rating changes based on their finishing position relative to the field:

- **Bonus points pool** scales with participant count. With fewer than ~3 players the pool is minimal; it grows up to a maximum with large fields.
- **Position-based rewards:** 1st place earns the most points, scaled between 15–50 depending on field size. 2nd place earns 10–30 points, 3rd place earns 5–20 points. Players finishing lower receive smaller adjustments.
- **Both-physics bonus** — Players who compete in both CPM and VQ3 in the same cup earn an additional bonus.
- **Minimum rating floor** — Ratings cannot drop below 1700. Players at or below this floor receive a small guaranteed positive change instead of a decrease.
- Ties at the same time share identical bonus points.

### Rating Change Tracking

Every cup produces a `RatingChange` record per user, storing the exact point delta for each physics. Historical ratings per season are snapshotted in `OldRating` records when a season ends.

### 1v1 Rating

A separate rating system exists for 1v1 duel mode, calculated independently from the main cup ratings with its own ELO-style formula.

### Seasons

The platform operates in numbered seasons. At season end, an admin:
1. Saves current ratings to historical records.
2. Assigns season rewards to top finishers (Top 1, 2, 3, and Top 10 per physics).
3. Resets ratings to the baseline for the new season.
4. Increments the season counter.

---

## User Profiles

Each registered user has a public profile page showing:

- **Display name** and **avatar** (uploadable image).
- **Country flag** (optional).
- **Current ratings** for both VQ3 and CPM.
- **Rating history chart** — Visual graph of rating progression over time, separate lines for each physics.
- **Cup history** — Paginated list of all cups participated in, with placement, time, and rating change per entry.
- **Recent demos** — Last 5 submitted demos with validation status and times.
- **Rewards/Achievements** — Badges earned for season participation, top season finishes, and special event wins (e.g., DFWC 2019/2021 champion, SDC-UK20, various FPS Cup awards, and special community achievements).

Profile editing allows updating the display name, avatar, and country.

---

## Admin Panel

The admin panel is role-gated and organized into sections based on the user's assigned roles.

### Roles

| Role | Capabilities |
|---|---|
| `USER` | Basic account; can participate in cups and comment |
| `NEWSMAKER` | Create, edit, and schedule news posts (up to 7 days ahead) |
| `VALIDATOR` | Review and validate/invalidate demo submissions |
| `CUP_ORGANIZER` | Create, edit, configure, and delete cups; input online round results |
| `MODERATOR` | Moderate comments and content |
| `STREAMER` | Access to streamer-specific result publishing |
| `WARCUP_ADMIN` | Participate in Warcup map voting; make admin map suggestions |
| `ADMIN` | Season management: save ratings, assign rewards, reset, increment season |
| `SUPERADMIN` | Full system access |

Multiple roles can be assigned to a single user.

### Cup Management

- Create offline cups with full map and timing configuration.
- Edit or delete existing cups.
- View the demo validation queue (submitted demos awaiting review).
- Process individual demo validations with accept/reject decisions.
- Download all demos for a cup as a zip archive.
- Trigger rating calculation once validation is complete.
- For online cups: input round results manually, assign players to servers, set maps per round.

### News Management

- View all news posts in a list with timestamps.
- Create news of any type, with associated cup linkage where applicable.
- Edit or delete existing posts.
- Upload images for news posts.

### Multicup Management

- Create and configure multi-round events.
- View and edit multicup details.
- Calculate aggregated multicup ratings.
- Mark multicups as finished.

### Season Management

- View and trigger end-of-season operations: snapshot ratings, distribute rewards, reset for new season.
- Assign Top 1/2/3/Top 10 rewards automatically by physics.

### Warcup Management

- View current Warcup state and active voting period.
- Browse community map suggestions with type distribution statistics.
- Cast votes on suggested maps during the voting window.
- Submit admin map suggestions to override community picks.

---

## Demo Parsing System

When a player uploads a Quake 3 demo file (`.dm_68` format) for an offline cup, the backend parses the binary demo to extract run metadata automatically.

The parser reads the demo's internal event log to identify:
- The **map name** the demo was recorded on.
- The **player's name** as recorded in the demo.
- **Race timing events** — start, reset, and finish line crossing events are detected and the cleanest valid finish time is selected.
- **Maximum speed** reached during the run.
- The **finish classification** — whether the finish event was recorded correctly or has anomalies.

This extracted data is used to populate the demo record in the database (map, time, player info) and is cross-referenced against the cup's expected map to catch wrong-map uploads. The parser outcome informs validators before they watch the demo, providing them with the reported time upfront.

---

## World Records Database

A dedicated section of the site for tracking all-time best times per map, independent of the cup competition system.

- Players upload demo files following a strict filename convention that encodes the map name, physics, time, player name, and country (e.g., `mapname[df.vq3]01.23.456(PlayerName.RU).dm_68`).
- The system validates the map name against the Q3DF map database.
- Records are browsable with filtering by map name and physics.
- Demo files are available for download.
- Both registered site users and unregistered "DF name" players (anonymous community members) can submit records.
- The page shows the 25 most recent records per page and highlights the last 5 uploads.

---

## Site Pages

| Page | URL | Description |
|---|---|---|
| Main / News Feed | `/` | Latest news posts with comments |
| News Archive | `/news` | All news organized by theme/category |
| Rating Tables | `/rating` | Full leaderboards for VQ3 and CPM with Top 10 highlights |
| Cup Archive | `/archive` | Historical list of all past cups and their results |
| Active Cup | `/cup` | Current cup info, countdown timer, registration, and map details |
| Player Profile | `/profile/:id` | Individual player stats, history, rewards, and rating chart |
| 1v1 Mode | `/1v1` | Queue, matchmaking, pick/ban map selection, and match tracking |
| WR Database | `/wr-database` | World record demo browser and upload form |
| Movies | `/movies` | Community video content gallery |
| Rules | `/rules` | Competition rules and guidelines |
| Teams | `/teams` | Team information |
| Timer | `/timer` | Standalone countdown timer for active competitions |
| Admin Panel | `/admin` | Role-gated administration interface |
| DFWC 2019 | `/dfwc2019` | Legacy Defrag World Championship 2019 event page |
| Discord OAuth | `/oauth/discord` | Discord login callback handler |

---

## E2E Test Validation

### When to use e2e tests

E2E tests are **not required after every change**. They are appropriate when:
- Backend API endpoints are added or modified
- Core user flows are changed (auth, cup operations, news)
- The user explicitly asks for e2e validation

**Do NOT run e2e tests by default.** If you think e2e validation would be beneficial, ask the user first.

### Running e2e tests (agentic)

```bash
npm run e2e:agentic
```

Same flow as `npm run e2e` but uses Cypress `--reporter=min` for compact output (pass/fail counts + failure details only). Backend SQL query logging is also suppressed via `NODE_ENV=test`.

- Runtime: ~15 minutes
- Requires Docker running (PostgreSQL on port 5432)
- Ports 4000 and 4001 must be free

### Verbose e2e (human use)

```bash
npm run e2e          # all tests, verbose
npm run e2e:single   # single spec file (edit --spec path in package.json first)
```

### Prerequisites

- Docker running: `docker ps`
- If database container not yet initialized: `npm run database:setup`
