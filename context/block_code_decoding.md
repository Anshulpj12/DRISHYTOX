# 🗺️ Block Code Encoding & Decoding Engine

## 1. Overview & Design Philosophy
The **Block Code System** is the cornerstone of the APARA (DRISHYTOX) offline emergency infrastructure. It is designed to solve the "last mile" geolocation problem on remote Indian highways, where mobile internet or cellular data is non-existent. 

Instead of relying on active network sockets to transmit latitude and longitude coordinates, the system compresses location data, emergency types, and trigger alerts into a short, alphanumeric string (either **11 characters** for standard SOS or **15 characters** for automated safety alerts). This code can be reliably shared through:
*   Standard cellular voice calls (verbal recitation).
*   High-reliability SMS text messaging (100% offline).
*   Local V2V (Vehicle-to-Vehicle) or mesh relay packets.

---

## 2. Alphanumeric Code Formats

### Standard 11-Character Code
*   **Format**: `RR-NNN-TTT`
*   **Example**: `AD-142-ACC`
*   **Components**:
    1.  `RR` (Region Code - 2 characters): Identifies a broad geographic sector (~110km square).
    2.  `NNN` (Block Index - 3 digits): Locates the specific grid square inside that region.
    3.  `TTT` (Emergency Type - 3 characters): Encodes the priority issue (e.g., `ACC` = Accident, `MED` = Medical).

### Reason-Enhanced 15-Character Code
*   **Format**: `RR-NNN-TTT-RRRR`
*   **Example**: `AD-142-ACC-NRSP`
*   **Components**:
    *   Adds a fourth block `RRRR` (Reason Suffix - 4 characters) to detail how the emergency was triggered (e.g., `NRSP` = No Response from driver, `STAT` = Stationary too long).

---

## 3. Geographic Region Grid & Mapping Math
India is bounded approximately within a bounding box defined as:
*   **Latitude Bounds**: $6.0^\circ\text{ N}$ to $37.0^\circ\text{ N}$
*   **Longitude Bounds**: $68.0^\circ\text{ E}$ to $98.0^\circ\text{ E}$

The encoder divides this total boundary into a matrix containing **10 Latitude divisions** and **5 Longitude divisions**, yielding **50 region sectors**.

### Region Code Allocation Matrix
Each region maps to a predefined array index and is represented by a unique alphabetical pair from `AA` to `EJ`:
```javascript
const _REGION_CODES = [
  'AA','AB','AC','AD','AE','AF','AG','AH','AI','AJ',
  'BA','BB','BC','BD','BE','BF','BG','BH','BI','BJ',
  'CA','CB','CC','CD','CE','CF','CG','CH','CI','CJ',
  'DA','DB','DC','DD','DE','DF','DG','DH','DI','DJ',
  'EA','EB','EC','ED','EE','EF','EG','EH','EI','EJ'
];
```

### Region Selection Formulas
To find the region index for a coordinate pair:
$$\text{latStep} = \frac{37.0 - 6.0}{10} = 3.1^\circ$$
$$\text{lngStep} = \frac{98.0 - 68.0}{5} = 6.0^\circ$$

$$\text{latIdx} = \min\left(9, \left\lfloor \frac{\text{lat} - 6.0}{\text{latStep}} \right\rfloor\right)$$
$$\text{lngIdx} = \min\left(4, \left\lfloor \frac{\text{lng} - 68.0}{\text{lngStep}} \right\rfloor\right)$$
$$\text{regionIdx} = (\text{latIdx} \times 5) + \text{lngIdx}$$

---

## 4. Block Interleaving Mathematics
Once a region is selected, the specific position *inside* that region is mapped. The encoder computes the coordinate's fractional offset relative to that region's baseline boundaries and splits it into a finer **$32 \times 32$ grid** (5 bits for Latitude, 5 bits for Longitude).

### Mathematical Sequence
1.  **Fractional Position Extraction**:
    $$\text{latFrac} = \frac{(\text{lat} - 6.0) \pmod{\text{latStep}}}{\text{latStep}}$$
    $$\text{lngFrac} = \frac{(\text{lng} - 68.0) \pmod{\text{lngStep}}}{\text{lngStep}}$$
2.  **Bit Scaling**:
    $$\text{latBlock} = \min\left(31, \lfloor \text{latFrac} \times 32 \rfloor\right)$$
    $$\text{lngBlock} = \min\left(31, \lfloor \text{lngFrac} \times 32 \rfloor\right)$$
3.  **Interleaving Conversion**:
    $$\text{blockNum} = (\text{latBlock} \times 32) + \text{lngBlock}$$
    The calculated `blockNum` falls between `0` and `1023`. The encoder caps this value at `999` to ensure it formats into a clean, 3-character string:
    $$\text{blockCode} = \min(999, \text{blockNum}).\text{toString}().\text{padStart}(3, '0')$$

---

## 5. Decoding Mechanics & Coordinated Estimation
When a provider receives a block code, the system reverses the equations. Because block encoding is a lossy compression, decoding estimates the **exact center point** of the matched grid square.

1.  Extract the index of `regionCode` from `_REGION_CODES` to derive the base region coordinates (`regionLatMin`, `regionLngMin`).
2.  Extract `blockNum` from the 3-digit code block.
3.  Calculate the grid cell offsets:
    $$\text{latBlock} = \left\lfloor \frac{\text{blockNum}}{32} \right\rfloor$$
    $$\text{lngBlock} = \text{blockNum} \pmod{32}$$
4.  Reconstruct the center coordinates (adding $0.5$ shifts the position to the exact center of the block cell for optimal accuracy):
    $$\text{latFrac} = \frac{\text{latBlock} + 0.5}{32}$$
    $$\text{lngFrac} = \frac{\text{lngBlock} + 0.5}{32}$$
    $$\text{lat} = \text{regionLatMin} + (\text{latFrac} \times \text{latStep})$$
    $$\text{lng} = \text{regionLngMin} + (\text{lngFrac} \times \text{lngStep})$$

### Grid Coverage Resolution (Accuracy)
*   Each block cell covers an area of approximately:
    $$\frac{3.1^\circ}{32} \text{ Latitude} \approx 0.0968^\circ \approx 10.75\text{ km}$$
*   The system offers a geometric accuracy of **$\approx 10\text{ km}$**. This tells response teams exactly which corridor block the driver is in, allowing them to search a short local radius.

---

## 6. Dead Reckoning and Offline fallbacks
If the driver's GPS receiver is disabled or completely failing due to obstruction (such as tunnels or valleys), the app triggers `getOfflineEstimatedCode()` to run a dead reckoning calculation:
1.  **Dead Reckoning Estimate**: Asks the `GPSTracker` to predict coordinates based on the driver's last known trajectory, heading, and rolling average speed (`GPSTracker.getEstimatedPosition()`).
2.  **Last Known Cache Fallback**: Queries `apara_last_known_pos` directly out of the device's persistent `localStorage`.
3.  **Default Null Block**: If no historical coordinate trace is found, it falls back to a neutral string: `XX-000-SOS-[REASON]` indicating a total signal loss.
