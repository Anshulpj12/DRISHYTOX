# 🛒 Highway Marketplace: Shop Registry, Menus & Order System

## 1. Overview & Architecture
The **Highway Marketplace** is designed to connect drivers with local roadside businesses along major Indian highway corridors. Drivers can locate active fuel stations, mechanical repair shops, pharmacies, dhabas (roadside diners), and general stores. 

True to APARA's core design system, the marketplace operates **offline-first**, utilizing localized coordinate queries and buffering pending transactions inside local storage.

---

## 2. Shop Registry CRUD Architecture
The registry (`ShopRegistry` in [data.js](file:///c:/Users/anshul%20prajapati/OneDrive/Desktop/DRISHYTOX/js/data.js)) manages all metadata related to registered commercial operators. 

### Commercial Categories
Establishments are classified into specific categories with corresponding visual icons:
*   `FOOD` $\rightarrow$ Restaurant / Dhaba 🍛
*   `STLL` $\rightarrow$ Food Stall 🍢
*   `CAFE` $\rightarrow$ Café / Tea Stall ☕
*   `BAKE` $\rightarrow$ Bakery / Snacks 🥐
*   `GROC` $\rightarrow$ General Store 🛒
*   `FUEL` $\rightarrow$ Fuel Station ⛽
*   `MECH` $\rightarrow$ Mechanic 🔧
*   `PHAR` $\rightarrow$ Pharmacy 💊

### Registry Mechanics
1.  **Shop ID Generation**: Unique IDs are generated using the category code and a padded index:
    *   **Format**: `SHOP-[Category Code]-[6-Digit Padded Index]`
    *   **Example**: `SHOP-FOOD-000042`
2.  **Operator Passwords**: Dynamic 8-character passwords are automatically generated for shop owners to secure their catalogs.
3.  **Local Storage Syncing**: Created or updated shops are saved locally in the driver's database under the key `apara_shops`.
4.  **Cloud Propagation**: Updates are immediately queued for background cloud uploads via `FirebaseSync.pushShop(shop)` when internet connectivity is active.
5.  **Zone Refresh Bumps**: Modifying or deleting a shop triggers `ConfigPush.bumpVersion()`. This bumps the system configuration version so that all nearby drivers automatically clear their local caches and download the latest, updated shop registry files.

---

## 3. Offline Proximity Shop Search
Drivers can query active shops without an internet connection using local math:
*   **Query**: `ShopRegistry.getNearbyShops(lat, lng, radiusM)`
*   **Default Radius**: $5000\text{ meters}$ (5 km).
*   **Process**:
    1.  Loops through all registered shops where `status === 'Active'`.
    2.  Extracts coordinates from the shop's `gps` string (formatted as `"latitude, longitude"`).
    3.  Calculates exact physical distance using `Utils.haversine()`.
    4.  Filters out any shop located further than the target radius.
    5.  Returns the filtered establishments sorted in ascending order of distance (closest shops first).

---

## 4. Menu & Order Management
The system keeps the driver and provider catalogs perfectly synchronized, handling item menus and transaction queues offline:

### Menu Caching (`MenuManager`)
*   Each shop's catalog is stored locally in the driver's device under a specific key prefix: `apara_menu_[Shop ID]`.
*   **Automatic Catalog Syncing**: The `MenuManager` fetches the shop's menu from the cloud in the background and saves it to local memory. This allows drivers to browse and select products offline.
*   **Unique Item Code Generation**: Every product added to a menu is assigned an automated, unique code matching the product's name to prevent duplicates.

### Offline Order Queue
*   **Order Buffering**: When a driver places an order while offline, the system compiles an order record (containing item selections, quantities, prices, driver coordinates, and contact details) and saves it to a local queue.
*   **V2V Relay / Bluetooth Pre-fill**: The order can be shared via short-range local wireless links or encoded into a scannable transaction QR code.
*   **Background Sync**: The moment internet connectivity is restored, the background sync engine pushes the queued orders to the active Firebase Firestore order collection. This instantly alerts the shop owner's dashboard so they can begin preparing the order.

---

## 5. Leaflet Proximity Map & Provider Integration
The Highway Marketplace incorporates a high-fidelity **Leaflet Proximity Map Canvas** (`#mktMap`) directly in the driver's interface. This map integrates commercial services and emergency safety responders on a single visual plane, allowing drivers to assess local services and medical safety nets at a glance.

### 5.1 Interactive Map Architecture & Markers
When the driver navigates to the marketplace tab, the map canvas initializes (`initMktMap()`) and plots all active entities within a strict $10\text{ km}$ geodesic radius (`MKT_DISPLAY_RADIUS = 10000`).

The layout overlays four visual elements:
1.  **User Vehicle Position**: A solid pulsing blue circle marker (`#3B82F6`) with a high-contrast white border, tracking the driver's GPS or dead-reckoned location.
2.  **Proximity Circle Boundary**: A green dotted border (`#10B981`, `dashArray: '6,4'`, `fillOpacity: 0.04`) sweeping a $10\text{ km}$ radius to indicate the local range limits.
3.  **Active Commercial Shops**: Green-themed circular markers representing retail shops, dhabas, or general stores (styled according to `MKT_CAT_COLORS`).
4.  **Active SOS Responders**: Larger circle markers representing emergency service providers (hospitals, towing services, tyre repairers) styled according to `PROVIDER_COLORS` to differentiate them from standard storefronts.

### 5.2 Direct SOS Provider Integration
To maximize emergency resilience, active emergency providers cached via the driver's local Geographic Zone bundle (`ZoneManager`) are plotted dynamically on the same map:

*   **Geospatial Source**: Queries both the local `ZoneManager.getCachedZoneIds()` provider database and memory collections inside `Store.getProviders()`.
*   **Unique Color Coding (`PROVIDER_COLORS`)**:
    *   **Hospitals (`HOSP`)**: `#EF4444` (Crimson)
    *   **Pharmacies (`PHAR`)**: `#A855F7` (Purple)
    *   **Mechanics (`MECH`)**: `#F97316` (Orange)
    *   **Towing (`TOW`)**: `#EAB308` (Yellow)
    *   **Fuel Delivery (`FUEL`)**: `#3B82F6` (Blue)
    *   **Tyre Punctures (`PUNC`)**: `#F59E0B` (Amber)
*   **One-Tap Communication popups**: Tapping a provider marker displays their brand logo/icon, name, service category, exact Haversine distance, and an active direct-dial anchor link (`tel:phone_number`). This allows drivers to bypass the automated triage system and immediately contact local operators directly via voice call in time-sensitive crises.

---

## 6. Zone Cache Invalidation — Critical Provider/Shop Refresh Mechanism

### 6.1 The Problem (Fixed 2026-05-28)
When providers or shops are registered, they are saved to `localStorage` under `apara_providers` / `apara_shops`. However, the **marketplace map** and **SOS provider search** read from **zone caches** (`apara_zone_*`), not directly from the Store. If the zone cache is not invalidated when providers change, newly registered providers are invisible.

### 6.2 The Solution: ConfigPush.bumpVersion()
All three Store mutation methods now trigger zone cache refresh:
- `Store.saveProvider()` → `ConfigPush.bumpVersion({ type: 'provider_added' })`
- `Store.updateProvider()` → `ConfigPush.bumpVersion({ type: 'provider_updated' })`
- `Store.deleteProvider()` → `ConfigPush.bumpVersion({ type: 'provider_deleted' })`

This matches the pattern already used by `ShopRegistry.saveShop()` and `ShopRegistry.deleteShop()`.

### 6.3 GPS String Parsing Requirement
Providers from `Store.getProviders()` store GPS as a **string** field `p.gps = "lat, lng"`, NOT as separate `p.lat` / `p.lng` numeric fields. Any code that searches providers by proximity **must** parse the GPS string:
```javascript
let pLat, pLng;
if (p.lat != null && p.lng != null) { pLat = p.lat; pLng = p.lng; }
else if (p.gps) {
  const pts = p.gps.split(',').map(x => parseFloat(x.trim()));
  if (pts.length !== 2 || isNaN(pts[0]) || isNaN(pts[1])) return;
  pLat = pts[0]; pLng = pts[1];
} else return;
```

Zone-cached providers (`zone.providers`) already have parsed `p.lat` and `p.lng` fields set by `ZoneManager.loadZone()`.

### 6.4 Map Refresh on Config Push
The `onConfigPushUpdate()` handler in `driver.html` now calls `renderMktMapMarkers()` after receiving zone update notifications, ensuring the marketplace map immediately reflects provider changes without requiring a page reload.
