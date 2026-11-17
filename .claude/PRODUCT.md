# PocketRun product overview

This file describes **what PocketRun is and where it is going**. It is the product reference: read it before designing a feature, naming a concept or writing user-facing text. Technical rules live in `.claude/CLAUDE.md`, `api/CLAUDE.md` and `ui/CLAUDE.md`.

**Reply language:** talk to the user in Brazilian Portuguese (pt-BR). This file is in English for the same reason as the other guides. User-facing text in the product is pt-BR.

## 1. One-line pitch

**PocketRun is a self-hosted backend for personal projects: one instance gives every project its own data store, its own micro-pages and its own short links, all managed from one panel.**

"Stop rebuilding backends. Start building products."

## 2. Where it comes from

PocketRun brings two earlier projects by the same author into one robust product:

| Origin | What it was | What it becomes in PocketRun |
| :--- | :--- | :--- |
| **PocketDB API** (Node/Express/Mongoose) | Generic REST backend. Each project got a `projectID` and a JWT made by a CLI script (`npm run control-access`). Data lived in key-value "collections" with a generic CRUD under `/kv/*`. | The **Data** module: the same `/kv/*` contract, rewritten in Go, with applications, tokens and access rules managed from the panel instead of a CLI. |
| **Shareds** (React app on top of PocketDB) | Manager for micro-pages (HTML/CSS/JS written in an in-browser editor) and redirect links, with access analytics and JSON backup. Admin access by a PIN stored in the frontend env. | The **Pages & Links** module: a native PocketRun feature, behind manager login, with no token or PIN shipped in a frontend bundle. |

Clients that used PocketDB must keep working with minimal changes: the `/kv/*` routes, the `controlAccess` header and the `{ "data": ..., "expiresInDays": N }` body stay compatible.

## 3. Who it is for

A single developer (or a small team) who builds many small things and does not want one backend per project:

- Prototypes and MVPs.
- Personal apps: agenda, personal finance, habits, shopping list, diary.
- Home projects: stock control, family organization, watch lists.
- Study projects: focus on the frontend or mobile app, not the backend.
- Small freelance jobs that need something online fast.
- Landing pages, promo pages and short links for any of the above.

Any client works: React, Vue, Flutter, mobile, scripts.

## 4. Core concepts

| Concept | Meaning |
| :--- | :--- |
| **Manager** | A person who logs into the panel (JWT). The first manager is created by the setup flow (`/setup/*`). A manager owns applications. |
| **Application** | One project. Has a name, a unique `projectId`, a description, allowed origins and access tokens. All data, pages and links belong to exactly one application and are invisible to the others. |
| **Access token** | Secret used by a client app to call the public API. Format `pk_live_...`, stored only as a hash, shown once at creation, optional expiry, revocable, with last-use tracking. Sent as `controlAccess`, `X-Pocket-Token` or `Authorization: Bearer`. |
| **Allowed origins** | Per-application CORS list. Browser calls from other origins are refused. Calls without an `Origin` header are allowed only if the application enables non-browser requests. |
| **Collection** | A named group of documents inside an application, like a table. Created on first write, no schema. |
| **Document** | A free JSON object (`data`) in a collection, with id, timestamps and an optional expiry (`expiresInDays`) after which it is deleted. |
| **Page** *(planned)* | A micro-page made of HTML, CSS and JS, published at a slug. |
| **Link** *(planned)* | A short slug that redirects to an external URL. |

## 5. Modules and status

### 5.1 Platform (done)

- First-run setup that creates the first manager.
- Manager login, registration and session (`/auth/*`).
- Applications: create, list, details, update, delete (`/apps/*`).
- Tokens per application: create with name and expiry, revoke, see prefix and last use.
- Per-application CORS control and non-browser access toggle.
- Two deploy modes from one image: `public` (client traffic) and `admin` (panel traffic).

### 5.2 Data, formerly PocketDB (done)

Public API, authenticated by an application token:

- `GET /ping`, `GET /validate/control-access`.
- `POST /kv/{collection}/create`
- `GET /kv/{collection}/get-all`, with `page`, `limit`, `pagination` and any other query param as an equality filter on `data`.
- `GET /kv/{collection}/get/{id}`
- `PATCH /kv/{collection}/update/{id}`
- `DELETE /kv/{collection}/delete/{id}`
- `DELETE /kv/{collection}/delete-all`
- `DELETE /kv/project/delete-all`

Panel, per application: data **explorer** (collections and documents), **tokens**, **security** (origins), **code snippets** for integrating a client, and a **danger zone**.

Not carried over yet from PocketDB: file upload.

### 5.3 Pages & Links, formerly Shareds (planned)

Content:

- Pages with HTML, CSS and JS edited in a code editor (Monaco) inside the panel.
- Redirect links to external URLs.
- Custom slug or random id for each page or link.
- Enable or disable a page or link at once.

Analytics:

- Views per day for the last 14 days (area chart).
- Average and total time on page, from activity pings sent by the published page.
- Total views, pings and status per item.

Administration:

- Export all pages, links and metrics of an application to JSON, and restore from that file.

Differences from Shareds that make it robust:

- Access is the manager login, not a PIN in the frontend env.
- No application token in a browser bundle: the panel uses the admin API.
- Pages and links belong to an application, like collections do.
- Public serving of pages, redirects and view tracking is done by the API, not by a separate React app.

## 6. Product principles

1. **One instance, many projects.** Adding a project costs a click in the panel, never a new server.
2. **Isolation by default.** Nothing from one application is ever readable or writable with another application's token.
3. **Zero backend code for the user.** A client gets a working backend from a token and the snippets in the panel.
4. **Secrets never leave the server in plain form.** Tokens are hashed; the plain token is shown once.
5. **Compatible with what already exists.** PocketDB clients and Shareds data should move over without a rewrite.
6. **The panel is the control center.** Anything that used to need a CLI script, an env var or direct database access belongs in the panel.
7. **Self-hosted and cheap.** Runs as a Docker Compose stack with MongoDB (local or Atlas), deployable on Dokploy.

## 7. Open product decisions

Settle these with the user before building Pages & Links:

- Where pages and links are served: a path on the public API (`/p/{slug}`), a dedicated domain, or both.
- Whether slugs are unique per application or across the whole instance (a short domain needs instance-wide slugs).
- How to import existing Shareds data (it lives in PocketDB collections today).
- Whether to bring back file upload from PocketDB, and where files are stored.
