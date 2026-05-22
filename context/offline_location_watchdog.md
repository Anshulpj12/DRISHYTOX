# 🐕 Location Watchdog & Offline Safety Architecture

## 1. Overview & Watchdog Safety Loop
The **Location Watchdog** is a background monitoring agent designed to detect cases where a driver becomes unconscious, incapacitated, or unresponsive due to an accident, medical event, or crash. 

It functions as an automated safety net that continuously analyzes GPS coordinates and device availability to trigger emergency actions if the driver fails to respond to safety checks.

---

## 2. Detection Triggers (The 5-Minute Rules)

The watchdog operates a continuous, 10-second inspection loop (`CHECK_INTERVAL_MS = 10000`) checking for two critical emergency cases:

### Case 1: GPS Signal Loss (GPS Off Detection)
*   **Threshold**: `GPS_OFF_THRESHOLD_MS = 5 * 60 * 1000` (5 minutes).
*   **Condition**: If the device fails to emit a single GPS location tick for over 5 minutes (indicating the GPS hardware was disabled, permissions were revoked, or the phone was crushed/submerged).
*   **State Triggered**: Transition to `GPS_WARN` state.

### Case 2: Inactivity / Lack of Movement (Stationary Detection)
*   **Threshold**: `STATIC_THRESHOLD_MS = 5 * 60 * 1000` (5 minutes) and `MOVEMENT_THRESHOLD_M = 50` (50 meters).
*   **Condition**: If GPS coordinates are actively emitting, but the cumulative displacement of the driver remains under 50 meters for over 5 minutes (indicating a sudden, unplanned stop on a highway corridor).
*   **State Triggered**: Transition to `STAT_WARN` state.

---

## 3. Warning Countdown & Interactive Overrides
Once a trigger condition is met, the system does not immediately send an SOS. Instead, it prompts the driver with an overlay featuring a **60-second countdown timer** to confirm their safety.

```
                  +--------------------------------+
                  |   Watchdog Detects Trigger     |
                  +----------------+---------------+
                                   |
                                   v
                  +----------------+---------------+
                  |  Show 60-Second Warning Modal  |
                  +-------+--------+--------+------+
                          |        |        |
         +----------------+        |        +---------------+
         | [STAY]                  | [I'M OK]               | (Timer Expires / [NO])
         v                         v                        v
+--------+-------+        +--------+-------+       +--------+-------+
|  PARKED State  |        | DRIVING State  |       |  Auto-SOS Sent |
+--------+-------+        +----------------+       +----------------+
         | (START DRIVING)
         v
+--------+-------+
| DRIVING State  |
+----------------+
```

### Driver Interaction Choices
1.  **`pressOK()` / `pressStart()` (I'm OK / Driving)**:
    *   Used in GPS off warning or after being parked.
    *   Resets the check timers and transitions the state machine back to `DRIVING`.
2.  **`pressStay()` (Stay)**:
    *   Used when the driver has intentionally parked (e.g., at a restaurant or resting point).
    *   Puts the watchdog into `PARKED` state. This pauses all safety timers until the driver explicitly clicks "START DRIVING" (`pressStart()`) to resume.
3.  **`pressNO()` (Send SOS)**:
    *   Bypasses the countdown timer immediately to launch the emergency sequence.
4.  **No Interaction (Auto-Trigger)**:
    *   If the 60-second timer hits `0` with zero user input, the watchdog assumes the driver is unconscious or trapped and automatically fires the SOS.

---

## 4. Why the System Works Completely Offline
To support total offline resilience, three low-level architectures operate silently behind the scenes:

### A. Data Buffer Batched Sync (`DataBuffer`)
Instead of constantly executing synchronous writes to local storage for every GPS position update (which degrades mobile performance and wears flash memory), the app utilizes a sessionStorage buffer:
*   **Buffering**: All block data and transit logs are recorded in a temporary buffer inside browser `sessionStorage`.
*   **Batched Flush**: Every 5 minutes (`FLUSH_INTERVAL = 300000`), or when the user leaves the page (`beforeunload` event), the buffer flushes and appends the records to the main persistent `localStorage` databases.

### B. Offline Route Reconstruction (The Retro-Generator)
If GPS signal is lost (e.g., in a mountain pass) and reacquired later, the app must not lose the intermediate transit record history. The **Offline Retro-Generator** (`OfflineRetroGenerator.retroGenerateBlocks`) reconstructs this gap:
1.  Calculates the Haversine distance between the last position before signal loss and the new position.
2.  Computes elapsed time.
3.  If the gap is wider than a grid cell (`BLOCK_GRID_SIZE`) and duration $> 10$ seconds:
    *   It draws a linear path (interpolation steps) between the two coordinates.
    *   Calculates average speed over the gap.
    *   Synthesizes entry/exit transit logs and mock block records for all intermediate grid blocks crossed during the blackout period.

### C. Message Queue Auto-Flush (`SOSMessageQueue`)
When the watchdog triggers an Auto-SOS while offline, it immediately:
1.  Flashes the pre-formatted emergency text message link, directing the OS to open the native SMS application (which operates on standard cellular bands without mobile internet).
2.  Queues the structured alert packet in `SOSMessageQueue` (`apara_sos_msg_queue`).
3.  **Connection Monitor**: `NetworkDetector` listens for browser connectivity events (`online`).
4.  **Auto-Flush**: The instant the device gains internet access, the queue automatically wakes up and flushes all pending SOS payloads to Firebase Firestore in the background.
