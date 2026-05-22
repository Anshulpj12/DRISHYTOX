# ☁️ Firebase Online/Offline Data Synchronization Engine

## 1. Overview & Architectural Isolation
APARA's cloud syncing engine is divided into two separate, optimized modules:
1.  **Driver Sync Engine** ([firebase.js](file:///c:/Users/anshul%20prajapati/OneDrive/Desktop/DRISHYTOX/js/firebase.js)): Configured for mobile-first drivers. It minimizes mobile battery consumption and cellular data usage, operating with minimal write rates and sleeping when offline.
2.  **Provider & Admin Sync Engine** ([firebase_v2.js](file:///c:/Users/anshul%20prajapati/OneDrive/Desktop/DRISHYTOX/js/firebase_v2.js)): Configured for service providers, merchants, and admins. It handles active real-time dashboard listeners, menu creation, order workflows, and administrative configurations.

Both modules leverage a unified Firebase project configuration file ([firebase-config.js](file:///c:/Users/anshul%20prajapati/OneDrive/Desktop/DRISHYTOX/js/firebase-config.js)), which contains active credentials committed directly to the repository for seamless local development and offline fallback mock modes.

---

## 2. Cost-Optimized Zone Bundling & Live Config Synchronizer
Because reading millions of individual provider coordinates from standard cloud databases is expensive and prone to scaling limits, APARA uses a **Zone Bundling** architecture:

*   **Offline-First Aggregation**: All service provider locations, categories, active statuses, and highway shops are pre-compiled on the server (or admin panel) into $1^\circ \times 1^\circ$ geographic zone JSON documents.
*   **Single Document Reads**: Instead of querying hundreds of separate coordinates, a driver's app downloads a single compressed zone document (`apara_zone_[Zone ID]`) once when entering a new territory.
*   **Config Bumps (No Polling)**: The driver app does not query Firestore continuously. It listens to a single, lightweight configuration version path in the Firebase Realtime Database.

### The Dynamic Configuration Sync Loop
To maximize performance and reliability across varied mobile network qualities in rural India, `FirebaseSync` employs a hybrid push-and-pull mechanism to synchronize versions:

```
                      +----------------------------------+
                      |   Init Configuration Listener    |
                      +----------------+-----------------+
                                       |
                   [Has RTDB Client?]  |  [No RTDB / Offline?]
                     +-----------------+-----------------+
                     |                                   |
                     v                                   v
        +------------+-------------+       +-------------+------------+
        | RTDB Push (apara_config) |       |  Firestore Fallback Loop  |
        |  * Persistent WebSocket  |       |  * Check every 30 mins   |
        |  * Real-time free push   |       |  * Pull: config doc      |
        +------------+-------------+       +-------------+------------+
                     |                                   |
            (OnError / Blocked)                          |
                     +-----------------------------------+
```

1.  **RTDB WebSocket Push (`listenConfigVersion`)**:
    *   Subscribes to the Firebase Realtime Database path `apara_config` via a persistent WebSocket stream using `.ref('apara_config').on('value')`.
    *   Extracts the remote version (`data.version`) and compares it against `apara_config_version` stored in `localStorage`.
    *   If a remote configuration version bump is detected (`remoteVersion > localVersion`), it fires a developer-defined callback to fetch the new zone bundle, keeping data invalidations instant and server costs at $\$0$.
2.  **Firestore Polling Fallback (`_startFirestoreFallbackPolling`)**:
    *   If the RTDB client is unavailable, blocked by firewall configurations, or throws network connection errors, the engine automatically falls back to an offline-resilient polling sequence.
    *   A background timer triggers every **30 minutes** (`30 * 60 * 1000` ms) using a standard browser `setInterval` interval loop.
    *   On each tick, the system executes `fetchConfigVersion()` by retrieving the static document `apara_config` from the Cloud Firestore collection `/config`.
    *   If the polled remote version exceeds the active local version, the local cache is invalidated and updated, ensuring background telemetry sync remains active even on network nodes where WebSockets are closed.


---

## 3. 15-Day Batch Compressed Log Uploads (`TransitBatchSync`)
To keep background uploads extremely light, driver transit history, highway speeds, and newly discovered corridor blocks are not uploaded in real time. Instead, they undergo **Dictionary Compression** and are uploaded in 15-day batches:

### The Compression Pipeline
1.  **Dictionary Matching**: Repeats of long alphanumeric strings (like block IDs `BLK-802-5521` or ISO timestamps) are indexed and mapped to single-byte token placeholders (e.g., `~0~`, `~1~`).
2.  **Size Reduction**: This custom dictionary compression reduces the raw JSON footprint by **over 85%**.
3.  **15-Day Sync Lock**: `TransitBatchSync.sync(driverId)` operates on a 15-day sync cycle. Every 15 days, if a stable Wi-Fi or cellular network is detected via `NetworkDetector`, the driver's device uploads this highly compressed payload to the Firestore `driver_batches` collection.

---

## 4. Real-Time Emergency Event Listeners
When an emergency occurs, milliseconds count. The system maintains dedicated, real-time alert pipes:

### SOS Alert Synchronization
*   When a driver triggers a manual or automated SOS, a standardized emergency packet is built:
    *   **Firestore Collection**: `/sos_alerts`
    *   **Payload**: `{ id, blockCode, lat, lng, typeCode, reason, timestamp, resolved, autoTriggered }`
*   **Background Sync Retry**: If the driver is offline, the alert is safely queued in the device's `SOSMessageQueue`. The `NetworkDetector` listens for the browser's `online` event and immediately flushes the queued alerts to Firestore once connectivity returns.
*   **Active Provider Listeners**: The provider dashboard establishes a persistent real-time snapshot listener on the `/sos_alerts` collection, filtering for unresolved alerts. This ensures that any active emergency within the provider's region instantly pops up on their screen with an audible alert.

---

## 5. V2V (Vehicle-to-Vehicle) Local Relay Protocol
If cellular coverage is completely absent, drivers can relay SOS details to passing vehicles:
*   **Local Mesh Relay**: The active SOS block packet is written to a dedicated offline cache file on the device.
*   **Short-Range Broadcast**: The app uses local Wi-Fi Direct or Bluetooth APIs to broadcast this tiny alphanumeric payload.
*   **Relayed Uploads**: When passing vehicles eventually enter an online zone, their background sync engines automatically detect the relayed packets in their offline queue and upload them to Firestore. This acts as a physical mesh network, carrying emergency alerts out of cellular dead zones.
