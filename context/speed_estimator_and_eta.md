# ⏱️ Speed Estimator & History-Driven ETA Engine

## 1. Overview & Architectural Design
Calculating accurate emergency arrival times (ETA) on remote highway corridors is highly complex. A simple distance-over-speed calculation fails when traffic bottlenecks, steep mountain passes, or offline signal blackouts are involved.

To solve this, APARA implements a **Layered Speed Estimation Engine** (`SpeedEstimator` in [data.js](file:///c:/Users/anshul%20prajapati/OneDrive/Desktop/DRISHYTOX/js/data.js)) combined with a **Historical Corridor Traversal Tracker** (`DeadZoneHistory`). 

These systems work offline to calculate highly accurate travel times and estimate the driver's current coordinates based on historical average transit profiles.

---

## 2. The 6-Layer Speed Estimation Hierarchy
When the system calculates a driver's speed or estimates the travel time to an emergency location, it queries **six hierarchical data layers**. It automatically selects the layer with the highest confidence, falling back to lower-confidence layers if data is missing:

```
+-------------------------------------------------------+
|  Layer 1: Live GPS Speed (>2 km/h)                   | --> Confidence: 95%
+---------------------------+---------------------------+
                            | (If 0 or missing)
                            v
+-------------------------------------------------------+
|  Layer 2: User's Own Block Speed (Previous Visits)    | --> Confidence: 80%
+---------------------------+---------------------------+
                            | (If missing)
                            v
+-------------------------------------------------------+
|  Layer 3: User's Historical Entry Speed               | --> Confidence: 75%
+---------------------------+---------------------------+
                            | (If missing)
                            v
+-------------------------------------------------------+
|  Layer 4: Community Block Speed (Downloaded Profiles) | --> Confidence: 50% - 85%
+---------------------------+---------------------------+
                            | (If missing)
                            v
+-------------------------------------------------------+
|  Layer 5: User's Overall Average speed                | --> Confidence: 50%
+---------------------------+---------------------------+
                            | (If missing)
                            v
+-------------------------------------------------------+
|  Layer 6: Default Global Speed Fallback (40 km/h)      | --> Confidence: 20%
+-------------------------------------------------------+
```

### The Layer Priority Details
1.  **Layer 1: Live GPS Speed** (`gps_live`): Directly calculated from position change vectors over time. Confidence is **95%**.
2.  **Layer 2: User Block Average** (`user_block`): Reads the driver's previous average speed within the specific $1\text{ km}$ grid block (`BlockTransitLog`). Confidence is **80%**.
3.  **Layer 3: User Entry Speed** (`user_entry`): Reads the driver's most recent entry speed when crossing into this specific block. Confidence is **75%**.
4.  **Layer 4: Community Average** (`community`): Pulls pre-downloaded average block transit speeds cached in `apara_community_speeds`. Confidence dynamically scales between **$50\%$ and $85\%$** based on the total number of community samples:
    $$\text{Confidence} = \min(85, 50 + \text{sampleCount} \times 2)$$
5.  **Layer 5: User Overall Average** (`user_overall`): The driver's rolling average speed compiled across all historic transits. Confidence is **50%**.
6.  **Layer 6: Default Fallback** (`default`): Statically set to **$40\text{ km/h}$** (`DEFAULT_SPEED_KMH`) for typical highway traffic. Confidence is **20%**.

---

## 3. ETA Arithmetic & Equations
To find the travel time from a provider to a distress signal, `SpeedEstimator.calculateETA` executes:
1.  **Distance Calculation**: Calculates the physical distance using the Haversine formula:
    $$\text{distanceKm} = \frac{\text{Utils.haversine(fromLat, fromLng, toLat, toLng)}}{1000}$$
2.  **Estimated Speed Extraction**: Retrieves the speed estimate ($\text{speedKmh}$) from the 6-layer hierarchy, enforcing a minimum cap of $5\text{ km/h}$ to prevent dividing by zero:
    $$\text{speedKmh} = \max(5, \text{estimatedSpeed})$$
3.  **Travel Time Calculation**:
    $$\text{etaHours} = \frac{\text{distanceKm}}{\text{speedKmh}}$$
    $$\text{etaMinutes} = \max(1, \lfloor \text{etaHours} \times 60 + 0.5 \rfloor)$$

---

## 4. History-Driven Offline Positioning (`DeadZoneHistory`)
When a vehicle enters a known communication dead zone, cellular and GPS signals can cut out entirely. The **DeadZoneHistory** system steps in to act as a localized positioning helper:

### A. Data Profiling & Transit Records
While driving online, the app records block crossing timelines:
*   `recordEntry()`: Captures entering coordinates, entry block ID, speed, and baseline entry timestamp.
*   `recordBlockCrossing()`: Logs exact milliseconds elapsed when crossing between adjacent $1\text{ km}$ blocks, generating per-block transit speed profiles.
*   `recordExit()`: Logs exit block coordinates and total traversal elapsed time.

### B. Offline Path Estimation Walk-Through
When the driver's device is completely offline and an SOS is triggered, `estimateFromHistory` reconstructs the driver's location along the corridor:
1.  Calculates elapsed time ($\text{elapsedMs}$) since the driver was last seen online.
2.  Determines the starting entry block ID based on the last known online coordinates.
3.  **Iterative Block Deduction**: The engine loops forward through the corridor blocks, subtracting each block's historical average transit duration from the remaining elapsed time:
    ```javascript
    while (remainingMs > 0) {
      const transitProfile = blockProfiles[`${currentBlock}-${nextBlock}`];
      if (transitProfile && remainingMs >= transitProfile.avgTimeMs) {
        remainingMs -= transitProfile.avgTimeMs;
        currentBlock = nextBlock; // Move to the next block
      } else {
        // Driver is estimated to be partially through this block
        remainingMs = 0;
      }
    }
    ```
4.  **Coordinate Interpolation**: Based on the calculated `currentBlock` index, the system maps the estimated latitude and longitude coordinates to the geometric center of that specific highway block. 

This allows the app to generate a highly accurate, estimated block code (e.g. `NH48-B31`) for emergency dispatch even when the device has been in a total signal blackout for hours.
