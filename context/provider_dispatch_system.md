# 🚨 Provider Fetching & Proximity-Based Dispatch System

## 1. Overview
The APARA platform implements an **offline-first provider discovery system**. Unlike traditional ridesharing or emergency dispatch platforms that perform intensive, real-time database queries on central servers, APARA pre-caches local service providers (hospitals, mechanics, fuel stations, tow operators) on the driver's device. 

This layout ensures that even in zero-connectivity areas, drivers can immediately locate and alert the nearest relevant aid.

---

## 2. 1° × 1° Geographic Zones
To make the data footprint lightweight and scalable, the Indian subcontinent is divided into **Geographic Zones** measuring **$1^\circ \times 1^\circ$** (approximately $111\text{ km} \times 111\text{ km}$).

### Zone ID Allocation
Zones are dynamically identified by rounding the driver’s latitude and longitude coordinates down to the nearest integer:
$$\text{zLat} = \lfloor \text{lat} \rfloor$$
$$\text{zLng} = \lfloor \text{lng} \rfloor$$
$$\text{Zone ID} = \text{"Z-" + zLat + "-" + zLng}$$

### Local Cache Storage
When a driver is online, the system downloads a **Zone Bundle** containing all service providers and shops within that specific zone and saves it permanently to the browser's local storage:
*   **Storage Key**: `apara_zone_[Zone ID]`
*   **Data Footprint**: Highly optimized JSON schema (average size is under $12\text{ KB}$ per zone, ensuring negligible storage footprint).

---

## 3. Boundary Detection & Real-Time Prefetching
To prevent service interruptions when a driver crosses from one zone to another, `ZoneManager` operates a real-time pre-caching watchdog.

On every 10-second GPS tick, `ZoneManager.checkBoundary(lat, lng)` executes:
1.  **Current Zone Identification**: Compares coordinates with the active zone. If a zone change is detected, it immediately loads the new zone bundle into memory.
2.  **Boundary Proximity Trigger**: Calculates the distance (via the Haversine formula) from the driver’s position to the center of the active zone:
    *   **Prefetch Threshold**: `ZONE_PREFETCH_KM = 80` (80 km from the center).
3.  **Adjacent Pre-fetching**: If the driver is more than 80 km away from the center of their current zone (approaching the perimeter), the system automatically pre-fetches the four adjacent zones in the background:
    *   **North**: $\text{lat} + 1^\circ$
    *   **South**: $\text{lat} - 1^\circ$
    *   **East**: $\text{lng} + 1^\circ$
    *   **West**: $\text{lng} - 1^\circ$
4.  This preemptive loading guarantees that adjacent emergency responders are already loaded when crossing regional boundaries, even if the driver loses internet access right at the border.

---

## 4. Cascading Radius Search
When an SOS is triggered, the engine locates providers by initiating a cascading search through all locally cached zones:
*   **Tier 1 (Priority Local Search)**: Targets a **10 km radius** (`SOS_SEARCH_RADIUS`) centered on the driver’s position.
*   **Tier 2 (Extended Search Fallback)**: If no matching providers are found in Tier 1, the search boundary automatically expands to a **100 km radius** (`SOS_EXTENDED_RADIUS` / `radiusKm = 100`).

---

## 5. The Provider Priority Scoring & Sorting Rules

### ⚠️ Critical Sorting Rule: Category Match Over Proximity
A common misunderstanding is that the provider list is sorted purely by distance. In reality, **capability matching takes absolute precedence over physical distance**.

During an emergency, the `allNearby` provider array is sorted via this exact algorithm:
```javascript
allNearby.sort((a, b) => {
  if (a.catMatch && !b.catMatch) return -1; // Category match goes up
  if (!a.catMatch && b.catMatch) return 1;  // Non-category match goes down
  return a.distance - b.distance;           // Distance acts as a secondary tie-breaker
});
```

#### Real-World Example
If a driver initiates a **Medical SOS (`MED`)**:
*   The system maps this emergency to the medical categories: **Hospital (`HOSP`)** and **Pharmacy (`PHAR`)**.
*   Suppose there is a **Hospital** located **15 km** away (a category match) and a **Mechanic** located **2 km** away (not a category match).
*   **Sorting Result**: The Hospital (15 km) is sorted **above** the Mechanic (2 km), because the system prioritizes life-saving capability over proximity. The closer mechanic is pushed down.

---

## 6. Provider Priority Scoring (`priorityDispatch`)
For incoming alert queues on the provider dashboard, the engine scores and prioritizes responders using an algebraic combination of distance and critical capabilities:

1.  **Severity Level Weights**:
    *   `P1` (Critical): Score weight = 4
    *   `P2` (Urgent): Score weight = 3
    *   `P3` (Serious): Score weight = 2
    *   `P4` (Moderate): Score weight = 1
2.  **Category Priority Matrix (`catPriority`)**:
    *   `HOSP` (Hospitals): Priority factor = 5
    *   `PHAR` (Pharmacies): Priority factor = 3
    *   `TOW` (Towers): Priority factor = 2
    *   `MECH` / `FUEL` / `PUNC` (Mechanic/Fuel/Puncture): Priority factor = 1
3.  **Score Equation**:
    $$\text{Base Score} = 100 - \text{distanceKm}$$
    If severity score is high ($\ge 3$, meaning `P1` or `P2` emergencies):
    $$\text{Final Score} = \text{Base Score} + (\text{Category Priority} \times 5)$$
4.  Providers are sorted in descending order of this score on the dispatch dashboard. This places the most highly equipped, closest responder at the top of the queue.
