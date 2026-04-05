# Audit Report: /search and /carte Pages — Pre-Merge Assessment

**Date:** 2026-04-04
**Purpose:** Verify the current working state of both pages and identify blockers before merging them into a unified Airbnb-style split-view experience.

---

## 1. End-to-End Functionality

### /search — WORKING

- **URL:** `/search?q=...&radius=...`
- **Verified live:** `https://nestrate.nanocorp.app/search?q=paris` returns 50 results with map + list side-by-side.
- **Server component** (`app/search/page.tsx`) calls `searchEhpads()` from `app/lib/ehpad.ts`.
- **Search flow:**
  1. Text query is geocoded internally via `geocodeFromEhpadData()` (averages lat/lng of matching EHPADs).
  2. If geocoding succeeds and radius > 0 → `searchByRadius()` uses Haversine SQL (subquery pattern — **fixed in commit 8b56238**).
  3. If geocoding fails → falls back to LIKE-based text search (name, city, department, postal code, FINESS ID).
- **Results display:** `SearchResultsWithMap` renders a sticky map (left) + scrollable card list (right) on desktop, stacked on mobile. Hover-highlight sync between list and map works.
- **Radius selector:** Buttons for Exact, 10, 20, 30, 50, 100 km. Default 20 km.
- **Limit:** 50 results max.

### /carte — PARTIALLY BROKEN

- **URL:** `/carte`
- **Verified live:** Map loads with all 7,399 markers. Browse mode (click marker → see details) **works**.
- **Radius mode is BROKEN:** Clicking the map in "Rayon" mode calls `GET /api/ehpads?lat=...&lng=...&radius=...` which returns **HTTP 500**.
- **Root cause:** `app/api/ehpads/route.ts` (line 44) still uses `HAVING` on a non-aggregated query, which is invalid SQL. The server-side `searchByRadius()` in `app/lib/ehpad.ts` was fixed (commit `8b56238`) to use a subquery pattern, but the API route was **not updated**.
- **Browse mode works** because it calls `GET /api/ehpads` (no params) which returns all lightweight markers — that query is fine.

---

## 2. Existing Leaflet Code Inventory

### Components

| Component | File | Role |
|---|---|---|
| `MapView` | `app/components/MapView.tsx` | Full-page interactive map for `/carte`. Browse + radius modes. Sidebar with controls, legend, and results. |
| `SearchResultsMap` | `app/components/SearchResultsMap.tsx` | Embeddable map for `/search` results. Highlight sync, popups, auto-fit bounds. |
| `SearchResultsWithMap` | `app/components/SearchResultsWithMap.tsx` | Layout wrapper: sticky map + scrollable results list. Toggle to show/hide map. |
| `SearchBar` | `app/components/SearchBar.tsx` | Text input with radius selector. Submits to `/search?q=...&radius=...`. |

### How Leaflet is wired

- Both `MapView` and `SearchResultsMap` use **raw Leaflet `L.*` API** (not `react-leaflet`).
- Both are loaded with `dynamic(() => import(...), { ssr: false })` to avoid server-side rendering.
- Both import `leaflet/dist/leaflet.css` directly.
- Markers use `L.divIcon` with inline SVG-like HTML (colored circles, 12px).
- Tiles: OpenStreetMap (`https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png`).
- No marker clustering — all 7,399 markers rendered individually on `/carte`.
- `SearchResultsMap` supports highlight state (larger icon + dark border on hover).

### Dependencies (package.json)

| Package | Version | Status |
|---|---|---|
| `leaflet` | ^1.9.4 | Used directly in both map components |
| `@types/leaflet` | ^1.9.21 | TypeScript types |
| `react-leaflet` | ^5.0.0 | **UNUSED** — declared but never imported anywhere |
| `proj4` | ^2.20.6 | Only used in `scripts/import-france-ehpad-data.mjs` (one-time import) |

---

## 3. Blockers and Issues to Fix Before Merge

### Critical

1. **API radius search returns 500** — `app/api/ehpads/route.ts` line 44 uses `HAVING` on a non-aggregated query. Must be rewritten to use subquery pattern (matching the fix already in `app/lib/ehpad.ts:searchByRadius`). This breaks `/carte` radius mode and will break any client-side radius queries in the unified page.

### Important

2. **No marker clustering** — Loading 7,399 individual `L.divIcon` markers causes significant lag, especially on mobile. Must add `leaflet.markercluster` before shipping the unified view.

3. **No bounding-box pre-filter** — Haversine is computed on every row (full table scan of 7,399 rows). For the unified view with "search as you drag" behavior, queries need a `WHERE latitude BETWEEN x AND y AND longitude BETWEEN a AND b` pre-filter to avoid scanning the full table on every map drag.

4. **Geocoding is internal-only** — `geocodeFromEhpadData()` averages coordinates of matching EHPADs. Searching for a town with no EHPAD (or a street address) returns no results. Need BAN API (`api-adresse.data.gouv.fr`) for proper geocoding + autocomplete.

### Cleanup

5. **`react-leaflet` is unused** — Remove from `package.json` to reduce bundle size.
6. **`proj4` is import-only** — Only needed during data import scripts, not at runtime. Could be moved to devDependencies or removed from the web bundle.
7. **Duplicated code** — `MapView.tsx` and `SearchResultsMap.tsx` share marker icon creation, grade colors, and Leaflet initialization logic. Should be consolidated for the unified component.

---

## 4. Data Model Summary

- **Table:** `ehpad_establishments` — 7,399 rows, all with lat/lng coordinates.
- **Indexes:** `lower(city)`, `department_code`, `lower(name)`, `has_quality_grade`. No spatial index.
- **Extensions:** `unaccent` (for accent-insensitive search).
- **No PostGIS** — not needed if we add a simple bounding-box WHERE clause.

---

## 5. Recommended Implementation Order for Unified Split-View

### Step 1: Fix the API route (30 min)
Fix the `HAVING` bug in `app/api/ehpads/route.ts` by using a subquery pattern (same as `searchByRadius` in `ehpad.ts`). Add a bounding-box pre-filter to both the API route and `searchByRadius`. This unblocks all client-side radius/map-drag queries.

### Step 2: Add marker clustering (1 hour)
Install `leaflet.markercluster`. Create a shared map utility module that consolidates marker icon creation, grade colors, and cluster config. This is required before rendering 7,400 markers on a single page.

### Step 3: Build the unified split-view page (2-3 hours)
Replace the current `/search` page with a single split-view layout:
- **Left panel:** Search bar (with BAN API autocomplete), filters (department, grade), scrollable result cards.
- **Right panel:** Leaflet map with clustered markers, updating on search/filter/drag.
- Reuse and refactor existing `SearchResultsMap` and `MapView` logic into one component.
- Add hover-highlight sync (already partially working in `SearchResultsWithMap`).
- Add bounding-box search on map drag/zoom.

### Step 4: Add BAN API geocoding + autocomplete (1-2 hours)
Replace `geocodeFromEhpadData` with BAN API (`api-adresse.data.gouv.fr/search`). Add real-time autocomplete in the search bar. Re-center map on selected address.

### Step 5: Remove /carte, add redirect (15 min)
Delete `app/carte/page.tsx` and `app/components/MapView.tsx`. Add a redirect from `/carte` to `/search`. Remove `react-leaflet` and optionally `proj4` from dependencies.

### Step 6: Mobile toggle (1 hour)
On small screens, replace side-by-side with a toggle between list view and map view. Add a floating "Carte" / "Liste" button.

---

## 6. File Map

```
app/
├── search/page.tsx              → Server component, calls searchEhpads()
├── carte/page.tsx               → Client component, loads MapView (to be removed)
├── components/
│   ├── MapView.tsx              → Full interactive map (to be merged/replaced)
│   ├── SearchResultsMap.tsx     → Embeddable results map (to be evolved into unified map)
│   ├── SearchResultsWithMap.tsx → Layout wrapper (to be evolved into split-view)
│   └── SearchBar.tsx            → Search input + radius selector (to add autocomplete)
├── lib/
│   ├── db.ts                    → PostgreSQL connection (postgres library)
│   └── ehpad.ts                 → searchEhpads(), searchByRadius(), geocodeFromEhpadData()
└── api/
    └── ehpads/route.ts          → GET endpoint: all markers + radius search (HAVING BUG)
```
