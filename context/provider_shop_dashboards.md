# 🏥 Provider Emergency & Shop Portal Systems

## 1. Service Provider Incident Response Dashboard (`pages/provider.html`)
The **APARA Provider Dashboard** is the command station for roadside rescue teams, medical crews, and towing services. It features a dark-themed glassmorphism interface engineered to track and process incoming emergencies.

### Key Components
*   **Live Incident Feed**: Long-polls the local/remote Firestore database every $3\text{ seconds}$ to pull newly registered alerts in the provider’s coverage corridor.
*   **Availability Toggle**: Allows the provider to temporarily pause incoming alerts via `Store.updateProvider(id, { available: false })`.
*   **Response History Analytics**: Compiles the provider’s performance metrics directly from historical database entries (total dispatches, resolved incidents, and average response times).

---

## 2. Unified SOS Lookup & Parser Engine
When a driver is completely offline, their emergency SMS is received by the dispatcher's mobile device. The dispatcher pastes this SMS into the **Unified SOS Lookup Tool** in the provider dashboard.

### Regex Parser Pipeline
The parser handles heavily formatted, multi-line SMS payloads, extracting coordinates, PINs, and code structures:

```mermaid
flowchart TD
    A[Raw pasted text input] --> B{Contains pipe symbol |?}
    B -- Yes --> C[Extract parts: BlockCode, coords, timestamp, confidence]
    B -- No --> D{Contains standard block code XX-NNN-XXX?}
    D -- Yes --> E[Decode via BlockCodeEncoder]
    D -- No --> F{Is exact 8-character string?}
    F -- Yes --> G[Decode via India Grid Base36 Encoder]
    F -- No --> H[Reject format]
    C & E & G --> I[Parse coordinates from string, Google Maps link, or Decoded Block]
    I --> J{Coordinates found?}
    J -- Yes --> K[Initialize Leaflet Map and Plot Incident]
    J -- No --> L[Render Warning: COORDINATES MISSING]
```

### Coordinates Extraction Rules
1.  **Direct Coordinate Pattern**: Looks for matching decimals `(-?\d+\.\d+),\s*(-?\d+\.\d+)` with prefixes like `Loc:`, `Coords:`, or `Location:`.
2.  **Google Maps URL matching**: Parses Google Maps URL formats to extract coordinates from parameters:
    *   Query Parameter Match: `maps.google.com/?q=(-?[\d.]+),\s*(-?[\d.]+)`
    *   Path Coordinate Match: `google.com/maps.*?(-?\d+\.\d+),\s*(-?\d+\.\d+)`
3.  **Security PIN extraction**: Matches standard 4-digit numeric sequences following `PIN:`.

---

## 3. Map Plotting & Leaflet Geometry Render
Once coordinates are successfully parsed, the system initializes an interactive **OpenStreetMap** tile layer using Leaflet:

### Multi-Marker Coordinate Geometry
1.  **Incident Marker (Red Circle)**: Plotted at the decoded coordinate center ($C$).
2.  **Confidence Search Circle**: Plots an uncertainty bounding radius circle around the customer's estimated coordinates:
    *   **High Confidence ($\ge 85\%$)**: Plots a tight $150\text{m}$ search circle.
    *   **Medium Confidence ($50\% \text{ to } 84\%$)**: Plots a $400\text{m}$ search circle.
    *   **Low Confidence ($< 50\%$)**: Plots a $600\text{m}$ search circle.
3.  **Provider Own Marker (Blue Pulse)**: Uses HTML5 `navigator.geolocation.watchPosition` to track the provider's active vehicle in real-time. A div icon styled as a glowing blue dot is rendered:
    ```javascript
    const provIcon = L.divIcon({
      html: '<div style="width:14px;height:14px;background:#3B82F6;border:2px solid #fff;border-radius:50%;box-shadow:0 0 8px rgba(59,130,246,0.6);"></div>'
    });
    ```
4.  **Auto-Zoom Fit Bounding Box**: Calculates a lat/lng bounding box encompassing both the provider ($P$) and the incident ($I$), and adjusts the view padding by $30\%$ to keep both elements visible:
    ```javascript
    const bounds = L.latLngBounds([[lat, lng], [provPosition.lat, provPosition.lng]]);
    map.fitBounds(bounds.pad(0.3));
    ```

---

## 4. Shop Catalogue & Sync State Manager (`pages/shop_provider.html`)
The **Shop Provider Dashboard** manages roadside amenities, meal prep, and supply distribution for drivers.

### Offline-First Catalog Lifecycle
1.  **Local Menu Edits**: Adding, deleting, or disabling items modifies a local cache in the browser's `localStorage` via the `MenuManager` library.
2.  **Dirty Flag Trigger**: Any local edit increments a local session variable `shopState.menuDirtyCount`. When this value is $>0$, the app renders a glowing floating sync action button (FAB) labeled "☁️ Sync to Cloud".
3.  **Dirty State FAB Styling**:
    *   **Active Changes**: Button slides in from the bottom with a pulsing gold border.
    *   **Sync in Progress**: Spin animation classes are dynamically applied to the cloud icon, and input fields are disabled.
4.  **Multi-Tier Sync Execution**:
    ```javascript
    // 1. Push Menu items array to Firestore shop menu node
    await FirebaseSync.pushMenu(shopId, menu);
    // 2. Push Shop profile metadata (Active/Inactive, name, location)
    await FirebaseSync.pushShop(shopData);
    // 3. Increment the global config version (polling version)
    const ver = parseInt(localStorage.getItem('apara_config_version') || '1');
    await FirebaseSync.pushConfigVersion(ver + 1, { action: 'shop_menu_updated' });
    ```
    Once this transaction completes successfully, `menuDirtyCount` resets to `0`, hiding the sync button, and the global configuration version is updated to trigger a silent background sync on all driver devices in the region.

---

## 5. Security Order Verification Protocol (PIN / OTP)
To prevent theft and fraud on remote highway pickups, the system enforces a hardware-independent **Fulfillment PIN (One-Time Password)** protocol:

```text
Driver Side                      Shop Provider Side
┌────────────────────────┐       ┌────────────────────────┐
│                        │       │                        │
│ Displays pickup PIN    │       │ Receives client order  │
│ e.g. "PIN: 4892"       │       │ Status: PENDING        │
│                        │       │                        │
└───────────┬────────────┘       └───────────┬────────────┘
            │                                │
            │      Physically Recites        │
            └───────────────────────────────>│ Prompted for PIN code  │
                                             │ [4892]                 │
                                             │                        │
                                             │ Verifies against       │
                                             │ order.pickupPin        │
                                             │                        │
                                             │   Correct?             │
                                             │  ├── Yes ──> Fulfilled │
                                             │  └── No  ──> Rejected  │
```

*   **Fulfillment Handshake**: The driver physically recites their 4-digit `pickupPin` to the merchant at the pickup location.
*   **Merchant Fulfill Verification**: The shop provider enters this code into the `#fulfillPin` input element in the order details screen.
*   **Verification Match**: If the code matches `order.pickupPin`, the order is marked as fulfilled, setting the fulfillment timestamp and tracking completion metrics. Otherwise, the input is cleared and the dispatcher is warned to protect against brute-force attempts.
*   **Order Audits Logging**: Logs are pushed to Firestore to calculate the fulfillment speed in minutes (`fulfilledAt` - `timestamp`).
