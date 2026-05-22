# 🧪 Offline Testing, Mocking & Diagnostic Framework

## 1. Overview & Architectural Role
Stranded on remote highways with zero internet connectivity, emergency features like automated GPS dead reckoning, speech triage, and location watchdogs are difficult to test in a standard laboratory environment. 

To bridge this gap, the APARA repository includes a specialized **Offline Test Harness** (`tests/test_offline.html`). This test harness wraps the production Driver App within an interactive sandbox, mocking device sensors and network environments to allow developers to safely simulate offline incidents and verify software stability under deterministic conditions.

---

## 2. The Test Harness Architecture (`test_offline.html`)
The test harness operates as an outer orchestrator using a full-viewport iframe pointing directly to the driver portal:

```
+-------------------------------------------------------+
|  tests/test_offline.html (Orchestrator Parent Frame)  |
|                                                       |
|   1. Query real GPS/IP coordinates                    |
|   2. Inject mock APIs into child iframe               |
|   3. Trigger auto-login and drive vectors             |
|                                                       |
|   +-----------------------------------------------+   |
|   |  pages/driver.html (Child Production App)     |   |
|   |                                               |   |
|   |  * Runs production telemetry HUD logic        |   |
|   |  * Thinks it is moving at 100 km/h East       |   |
|   |  * Emits simulated offline transit logs       |   |
|   +-----------------------------------------------+   |
+-------------------------------------------------------+
```

---

## 3. Dynamic API Mocking & Injection
Because modern browsers enforce strict permissions and sandboxing constraints on location data, the harness intercepts and mocks the standard web device interfaces at script parse time using `Object.defineProperty` on the child iframe's `contentWindow` (`fw`):

### A. Geolocation API Mocking
To bypass cellular GPS instability, the harness overrides the global `navigator.geolocation` system:
```javascript
Object.defineProperty(fw.navigator, 'geolocation', {
    value: {
        getCurrentPosition: function(success) {
            success({
                coords: { 
                    latitude: startLat, 
                    longitude: startLng, 
                    accuracy: 20, 
                    speed: 27.77, // 100 km/h in meters/second
                    heading: 90   // Eastward vector
                },
                timestamp: Date.now()
            });
        },
        watchPosition: function() { return 1; }, // Mocks watch handle
        clearWatch: function() {}
    },
    configurable: true
});
```

### B. Permissions Query Interception
Bypasses native security prompt delays by forcing permissions queries to immediately resolve as allowed:
```javascript
Object.defineProperty(fw.navigator, 'permissions', {
    value: {
        query: function() {
            return Promise.resolve({ state: 'granted' });
        }
    },
    configurable: true
});
```

---

## 4. Automated Verification & Simulation Sequences
The parent harness automates a multi-step sequence to test dead reckoning:

### Step 1: Real-Location Bootstrapping
When the test harness is opened in a browser:
1.  Attempts to acquire the developer's exact, high-accuracy GPS position.
2.  If permissions are denied or GPS times out, it falls back to **GeoJS IP Geolocation** via a lightweight JSON call (`https://get.geojs.io/v1/ip/geo.json`).
3.  If IP coordinates are blocked or offline, it falls back to India's national geographic center (`20.5937, 78.9629`).

### Step 2: Auto-Login Bypass
The parent window accesses the child document DOM, fills in a test driver credentials string, and triggers the production login handler:
```javascript
const mobileInput = fw.document.getElementById('driverMobile');
if (mobileInput) {
    mobileInput.value = '9876543210';
    fw.driverLogin(); // Skips the login page UI transition
}
```

### Step 3: Velocity Injection & Online Drift (2-Second Delay)
After 2 seconds, the harness injects a high-velocity position vector to establish a baseline state:
*   Injects a speed of $27.77\text{ m/s}$ ($100\text{ km/h}$) heading $90^\circ$ (due East).
*   Triggers the production location event handlers (`fw.onGPSUpdate()`) to simulate an active vehicle cruising along the corridor.

### Step 4: Network Offline Dispatch (4-Second Mark)
Exactly 2 seconds after the online update, the harness dispatches a fake browser-wide connection offline event to the iframe:
```javascript
fw.window.dispatchEvent(new Event('offline'));
```
The production driver app instantly transitions to offline status. The dead-reckoning positioning engine wakes up, utilizing the previously injected speed vector and trajectory history to estimate the vehicle's location and output correct block codes completely offline.

---

## 5. Manual Diagnostics Checklist
When modifying core location or emergency triage features, developers should run through the following test procedures to ensure system safety:

| Checkpoint Target | Action Trigger | Expected Diagnostic Outcome |
|---|---|---|
| **Online/Offline Status Switch** | Disconnect network cable / toggle Chrome dev tools offline. | Top header status banner instantly transitions between **ONLINE** (cyan) and **OFFLINE** (amber). |
| **Vibration Feedback** | Click the SOS button. | Verify `navigator.vibrate` is called with correct length bursts. |
| **Dead Reckoning Calculations** | Run `tests/test_offline.html`. | Confirm grid block labels (`#mktBlockLabel`) update along an eastward trajectory after network goes offline. |
| **Speech recognition triage** | Tap Mic button and say: "hospital". | Mic modal closes, triage state registers an Accident (`ACC`), and maps candidate providers. |
| **Watchdog stationary trigger** | Let app sit static for $> 5\text{ minutes}$ in driving mode. | Cinematic `#watchdogModal` pops up, initiating the loud 60-second emergency dispatch countdown. |
