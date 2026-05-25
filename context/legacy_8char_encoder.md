# 🧭 Legacy 8-Character Block Code Encoder

## 1. Overview & Comparison
While the newer **11/15-Character Block Code System** (`BlockCodeEncoder` in `js/block-code-encoder.js`) covers regions with a coarser ~10km grid resolution, the core data layer ([js/data.js](file:///c:/Users/anshul%20prajapati/OneDrive/Desktop/DRISHYTOX/js/data.js)) preserves a highly precise **Legacy 8-Character India-Wide Coordinate Encoder**. 

This system achieves a **$1\text{ km}$ grid resolution** (10 times more precise) by utilizing deep relative grid calculations, a base-36 alphabet representation, and a customized error-correcting checksum.

---

## 2. Alphanumeric Code Format
*   **Format**: `RRR CCC T K`
*   **Example**: `2X4 A7B M 9` (arranged without spaces as `2X4A7BM9`)
*   **Components**:
    1.  `RRR` (Relative Row - 3 Base36 characters): Encodes the relative Latitude offset.
    2.  `CCC` (Relative Column - 3 Base36 characters): Encodes the relative Longitude offset.
    3.  `T` (Emergency Type - 1 character): A single-letter emergency type representation.
    4.  `K` (Weighted Checksum - 1 Base36 character): Validates against communication typos.

---

## 3. The 1km Grid Matrix Coordinates Baseline
To represent physical coordinates with high precision in just three characters, the encoder uses absolute offset benchmarks designed specifically to encompass the borders of the Indian subcontinent:

*   **Row Offset Base (`INDIA_ROW_BASE`)**: `800`
*   **Column Offset Base (`INDIA_COL_BASE`)**: `5500`

### Step Conversion Equations
1.  **Grid Cell Generation**:
    *   Latitude scaling: $1^\circ \text{ Latitude} \approx 111,320\text{ meters}$.
    *   Longitude scaling: $1^\circ \text{ Longitude} \approx 111,320 \times \cos(\text{Latitude})\text{ meters}$.
    *   Row Index ($\text{gridRow}$):
        $$\text{gridRow} = \left\lfloor \frac{\text{lat} \times 111320}{1000} \right\rfloor$$
    *   Column Index ($\text{gridCol}$):
        $$\text{gridCol} = \left\lfloor \frac{\text{lng} \times 111320 \times \cos\left(\frac{\text{lat} \times \pi}{180}\right)}{1000} \right\rfloor$$
2.  **Relative Offsets Calculation**:
    $$\text{relRow} = \max(0, \text{gridRow} - 800)$$
    $$\text{relCol} = \max(0, \text{gridCol} - 5500)$$
3.  **Base36 Mapping**:
    *   The offsets are converted into 3-character Base36 strings (`0-9`, `A-Z`), representing numbers up to $36^3 - 1 = 46,655$. This offers sufficient coverage to map every 1km square across the country.

---

## 4. Single-Character Emergency Types
Emergency codes are mapped to a single alphabetical character to keep the transmission size short:

| Emergency Type | Original 3-Char Code | Single-Character Type Code (`T`) |
| :--- | :--- | :--- |
| **Accident** | `ACC` | `A` |
| **Medical Emergency** | `MED` | `M` |
| **Tyre Puncture** | `TYR` | `T` |
| **Out of Fuel** | `FUL` | `F` |
| **Tow Required** | `TOW` | `W` |

---

## 5. The Weighted Base36 Checksum (`K`)
To prevent keyboard typos or verbal transmission errors, the 8th character is a **weighted modulo-36 checksum** calculated from the first 7 characters:

### Checksum Algorithm
```javascript
_checksum(body) {
  let sum = 0;
  for (let i = 0; i < body.length; i++) {
    const charValue = BASE36.indexOf(body[i].toUpperCase());
    sum = (sum + charValue * (i + 1)) % 36;
  }
  return BASE36[sum];
}
```

$$\text{Checksum Index} = \sum_{i=0}^{6} \left( \text{Base36Index}(\text{body}[i]) \times (i + 1) \right) \pmod{36}$$

When a provider decodes the code, the system validates the calculated checksum against the 8th character. If they do not match, the lookup tool immediately flags the input as an invalid typo, helping prevent dispatching rescue teams to the wrong highway location.
