# APARA Advanced Cockpit Subsystems

This document provides a deep technical review of the secondary high-reliability systems built into the **APARA Cockpit / Driver Mobile App** (`pages/driver.html`). These subsystems ensure hands-free emergency operations, hardware diagnostics, and continuous location tracking under the harshest road conditions.

---

## 1. Cinematic Fullscreen Shock-Triggered Voice SOS (`VoiceSOS`)
To protect drivers in catastrophic crash scenarios, APARA includes a hands-free **Voice SOS Assistant** powered by the HTML5 Web Speech API, running behind a cinematic dark-mode HUD overlay (`#voiceSosOverlay`).

### 1.1 Trigger Mechanisms
The overlay is activated via two methods:
1.  **Sudden Impact Detection**: Initiated by sudden G-force spike alerts from the mobile device accelerometer.
2.  **Manual SOS HUD Tap**: Triggers the module instantly via the cockpit navigation console.

Upon activation, the app initiates high-intensity vibration pulsing (`navigator.vibrate([200, 100, 200, 100, 400])`) to alert the driver in shock conditions that an SOS flow has begun.

### 1.2 Web Speech Recognition Engine
Once the overlay appears, the speech engine initiates:
*   **Indian Dialect Optimization**: Speech recognition language is set to `en-IN` to match regional pronunciation of English commands.
*   **Continuous Interim Parsing**: Listens continuously with high-frequency retry loops:
    *   If a `no-speech` or `aborted` event is fired while the overlay is active, the engine automatically restarts the microphone stream within $500\text{ ms}$.
    *   If the microphone permission is blocked by the OS, it falls back gracefully to high-contrast button taps without breaking the application state.
*   **Fuzzy Command Dictionary**: Maps spoken phrases and numbers to emergency categories:
    *   `1` / `"one"` / `"hospital"` / `"accident"` $\rightarrow$ `ACC` (Accident / Medical Rescue)
    *   `2` / `"two"` / `"mechanic"` / `"tow"` $\rightarrow$ `TOW` (Towing / Breakdown)
    *   `3` / `"three"` / `"fuel"` / `"tyre"` / `"petrol"` $\rightarrow$ `TYR` or `FUL`
    *   `0` / `"zero"` / `"cancel"` / `"no"` / `"stop"` / `"fine"` $\rightarrow$ Dismisses false alarms

### 1.3 Automatic SMS Dispatch URI
If an emergency command is matched or a button is tapped:
1.  Synthesizes a precise 8-character block code encoding coordinates and reason.
2.  Calculates the nearest active service provider within a $10\text{ km}$ geodesic radius using Haversine math.
3.  Pre-formats a highly structured SMS packet:
    ```
    APARA SOS [Block Code]
    [Icon] [Emergency Type]
    Loc: [Latitude],[Longitude]
    PIN: [4-Digit Verification PIN]
    Maps: https://maps.google.com/?q=[Latitude],[Longitude]
    ```
4.  Launches the native messaging app via a structured URI (`sms:[phone_number]?body=[sms_body]`), opening the draft for instant one-tap dispatch.

---

## 2. OBD-II Bluetooth Hardware Integration
For professional highway transport, the cockpit can bypass standard phone-based GPS velocity estimation and query the vehicle directly using **Web Bluetooth GATT Services**.

*   **Scanning and Pairing**: Requests a connection using `navigator.bluetooth.requestDevice` to query nearby Bluetooth OBD-II scanners.
*   **High-Fidelity Telemetry**: Integrates GATT profile data to parse vehicle speed (velocity in km/h) and diagnostic fault codes directly from the ECU.
*   **Telemetry Overrides**: When active, OBD-speed data overrides GPS accuracy jitter in speed estimation layers, ensuring highly reliable dead-reckoning equations even when satellite signals are blocked in tunnels or dense mountain gaps.

---

## 3. Screen Wake Lock API Safeguard
Since mobile operating systems aggressively sleep background tabs to conserve battery, APARA enforces a continuous tracking lock to prevent the device from entering low-power sleep states while on active highway corridors.

*   **Wake Lock Acquisition**: Calls `navigator.wakeLock.request('screen')` immediately upon GPS activation to acquire a system-level stay-awake token.
*   **Visibility Change Handler**: If the driver switches away from the tab or locks the screen, the wake lock is naturally released by the OS. To counteract this, a window `visibilitychange` listener automatically re-acquires the lock the moment the APARA cockpit becomes visible again:
    ```javascript
    document.addEventListener('visibilitychange', async () => {
      if (document.visibilityState === 'visible' && state.gpsStarted) {
        await requestWakeLock();
        if (state.lastKnownPos) onGPSUpdate(state.lastKnownPos, false);
        if (state.map) state.map.invalidateSize();
      }
    });
    ```
*   **Visual Layout Invalidation**: The visibility listener triggers a Leaflet `.invalidateSize()` draw cycle on the map viewport to fix any broken tiles or dimensions caused by the browser layout sleeping.

---

## 4. GPS Retro-Generation & Reconnection Pipeline (`OfflineRetroGenerator`)
When a vehicle drives through a prolonged internet and satellite blackout (e.g., inside the *NH44 Banihal Pass*), the device stops actively synchronizing transit checkpoints with the cloud. To ensure historical database consistency and provider logs remain perfect upon signal recovery, the **Offline Retro-Generator** engine runs.

### 4.1 Block Recovery Math
Upon receiving a fresh GPS coordinates packet after being offline, `retroGenerateBlocks()` compares the disconnect coordinates (`lastPos`) and the recovery coordinates (`newPos`):

$$\text{distance} = \text{Utils.haversine(lastPos.lat, lastPos.lng, newPos.lat, newPos.lng)}$$
$$\text{elapsedSec} = \frac{\text{newPos.timestamp} - \text{lastPos.timestamp}}{1000}$$

If $\text{distance} \ge 1000\text{ m}$ (grid size) and $\text{elapsedSec} \ge 10\text{ s}$, the engine:
1.  **Interpolates Steps**: Computes the exact number of physical $1\text{ km}$ grid intervals spanned:
    $$\text{numSteps} = \lceil \frac{\text{distance}}{\text{BLOCK\_GRID\_SIZE}} \rceil$$
2.  **Linear Vector Projection**: Walks a direct straight line from the last seen position to the new online coordinates, projecting estimated coordinates for each intermediate block:
    $$\text{lat}_i = \text{lastPos.lat} + (\text{newPos.lat} - \text{lastPos.lat}) \times \frac{i}{\text{numSteps}}$$
    $$\text{lng}_i = \text{lastPos.lng} + (\text{newPos.lng} - \text{lastPos.lng}) \times \frac{i}{\text{numSteps}}$$
3.  **Timestamp Reconstitution**: Distributes intermediate crossing timestamps evenly across the elapsed duration.
4.  **Retro-Active Record Injection**: Calls `BlockRegistry.createRetroBlock()` and triggers `BlockTransitLog.recordEntry` / `recordExit` to backfill the log.

This post-reconnection pipeline fills the offline physical traversal path seamlessly, maintaining highly accurate community profiles.

---

## 5. Parked Mode State Banner
To prevent battery drain and accidental emergency triggers when the vehicle is stationary (e.g., when resting at a dhaba or waiting at a toll crossing), the system monitors driver movement over time.

*   **Significant Movement Filter**: Tracks the physical distance moved since the last recorded coordinate. Significant movement is defined by a threshold of $50\text{ meters}$ (`_MOVEMENT_THRESHOLD_M = 50`).
*   **Stationary Check**: If the elapsed duration since the last significant movement exceeds $5\text{ minutes}$ ($300,000\text{ ms}$), the vehicle is flagged as stationary:
    $$\text{isStationary} = (\text{Date.now()} - \text{lastMovementTime}) > 300,000\text{ ms}$$
*   **Watchdog Suspension**: Activating Parked Mode pauses the `LocationWatchdog` crash detection loops, and renders a slim visual banner on the HUD indicating that passive battery-saving tracking is active.
