# 🩹 Road SOS Injury Triage & First-Aid Guidance Engine

## 1. Overview
The **Road SOS System** is a medically-reviewed, offline-capable triage and decision-support engine. Its purpose is to guide lay bystanders or drivers through performing life-saving first aid in the critical moments following a highway accident. 

It uses a deterministic, rule-based approach—**completely free of AI/LLM hallucinations**—to calculate patient severity and output highly structured, sequential first-aid instructions.

---

## 2. Interactive SVG Body-Mapping
To simplify injury selection during stressful emergency situations, the system utilizes a front and back interactive **SVG Body Map**:

*   **View Toggling**: Users can toggle between the `front` and `back` anatomical views.
*   **Region Filtering**: Tapping on a specific body region instantly narrows down the grid of 22 injury conditions to only those matching that body part:
    *   `HEAD` $\rightarrow$ Unconscious, Head Injury, Seizure, Vomiting, Dizziness, Eye Injury.
    *   `NECK` $\rightarrow$ Spinal Injury, Choking, Breathing Difficulty.
    *   `CHEST` $\rightarrow$ Chest Pain, Breathing Difficulty, Broken Ribs, Not Breathing.
    *   `BACK` $\rightarrow$ Spinal Injury, Burns.
    *   `FULL_BODY` $\rightarrow$ Shock, Allergic Reaction, Seizure, Crush Injury, Trapped.
*   **Fuzzy Search bar**: Integrated search allows fuzzy keyword matching across condition labels, IDs, and categories for fast, direct entry.

---

## 3. Deterministic Triage Priority Calculation (`SOSTriageEngine`)
The engine calculates an emergency priority rating from **`P1` (Critical)** to **`P4` (Moderate)** by parsing a variety of patient assessments, pain indicators, and environmental modifiers.

### Scoring Accumulation Formula
The raw urgency score is dynamically compiled as follows:
$$\text{Raw Score} = \sum (\text{Selected Condition Severities}) + \sum (\text{AVPU Assessment Scores}) + \text{Pain Modifier} + \text{Environment Modifiers}$$

1.  **Condition Severities**: Each of the 22 conditions has an assigned baseline severity score (e.g., Spine Injury = 5, Broken Arm = 3, Vomiting = 2).
2.  **Assessment Inputs**:
    *   **AVPU (Responsiveness)**: Alert (0), Voice (2), Pain (4), Unresponsive (5).
    *   **Breathing**: Normal (0), Shallow/Irregular (3), Not Breathing (5).
    *   **Pulse**: Strong (0), Weak/Fast (3), No Pulse (5).
    *   **Bleeding Severity**: None (0), Minor (1), Moderate (3), Severe Spurting (5).
    *   **Movement**: Normal (0), Limited (2), None/Severe Pain (4).
3.  **Pain Scale Modifiers**: Pain level (0 to 4) is directly added to the score.
4.  **Accident Type Modifiers**: High-impact crashes add urgency points:
    *   Head-on Collisions, Rollovers, and Pedestrian strikes: $+3$ points.
    *   Side impacts, multi-vehicle pileups, and motorcycle crashes: $+2$ points.
5.  **Contextual Environmental Flags**:
    *   Active fire present (`FLAG_FIRE`): $+3$ points.
    *   Hazmat exposure (`FLAG_HAZMAT`): $+3$ points.
    *   Pregnant victim (`FLAG_PREGNANT`): $+2$ points.
    *   Child victim (`FLAG_CHILD`): $+2$ points.

### Urgency Threshold Classification
The engine converts the final score into a priority classification:
*   **`P1` (Critical / Red)**: Immediate life support required (ALS ambulance recommended). Auto-boosted to `P1` if fire or hazmat is present, or if breathing/pulse is absent.
*   **`P2` (Urgent / Orange)**: Heavy trauma or systemic risk (BLS ambulance recommended).
*   **`P3` (Serious / Yellow)**: Isolated fractures, moderate burns (Private escort recommended).
*   **`P4` (Moderate / Cyan)**: Minor lacerations, dizziness (On-site first aid).

---

## 4. Multi-Injury Priority Combinations
When multiple injuries are selected, the first-aid steps must be carefully sequenced to prevent dangerous treatment conflicts. 

For instance, treating a head injury by putting the patient in the recovery position is dangerous if the patient also has a suspected spinal cord injury, as moving them could cause permanent paralysis.

### The Sequence Resolution Matrix
The engine resolves conflicts using a **combination priority ruleset** (`SOS_COMBO_RULES`), sorting by specificity (combos matching 3 conditions run first, then 2, then singles):

*   **Unconscious + Not Breathing + Heavy Bleeding**: The sequence resolves to **Bleeding Control $\rightarrow$ CPR**. Direct pressure is applied to stop blood loss *before* starting chest compressions, preventing the rescuer from pumping out the patient's blood volume.
*   **Unconscious + Spinal Injury + Heavy Bleeding**: The sequence resolves to **Bleeding Control $\rightarrow$ Spine Immobilization**. The patient's spine is kept aligned while controlling bleeding, avoiding the standard recovery position.
*   **Spine Injury + Head Injury**: Resolves to **Spine Immobilization $\rightarrow$ Head Care**. The head and neck are kept completely still in a neutral position while treating scalp wounds.

---

## 5. Medically-Reviewed Treatment Procedures (`SOS_TREATMENTS`)
All treatment steps are statically stored on the device to guarantee they work offline. Each protocol contains:
1.  **Numbered sequential steps** with clear, active verbs.
2.  **Visual instruction icons** for stress reduction.
3.  **Step-specific timers** (e.g., 20-minute water cooling for burns, 10-minute continuous pressure for bleeding).
4.  **"DON'Ts" sections**: Highlighting critical actions to avoid (e.g., "Do NOT use butter or toothpaste on burns", "Do NOT move a suspected spinal injury").
5.  **Text-To-Speech (TTS) voice directions**: Allows hands-free operation so the rescuer can listen to audio instructions while keeping their hands on the patient.

---

## 6. Deep Triage Mathematics & Clinical Risk Predictors

### A. Severity Score Algebraic Formula
The platform computes a normalized **Severity Score ($S$)** scaled from $0$ to $100$ to gauge the victim's critical threat level:
$$S = \text{Min}\left(100, \text{Max}\left(0, \text{Round}\left(B_{\text{priority}} + \text{Min}(30, 1.5 \times R_{\text{raw}}) + C_{\text{boost}}\right)\right)\right)$$

Where:
*   **$B_{\text{priority}}$ (Priority Base Weight)**: Matches the triage priority status:
    *   `P1` (Critical): $70$ points
    *   `P2` (Urgent): $50$ points
    *   `P3` (Serious): $30$ points
    *   `P4` (Moderate): $15$ points
*   **$R_{\text{raw}}$ (Raw urgencies score summation)**: Summed inputs from conditions, AVPU, pulse, and accident types. The raw score's contribution is scaled by $1.5$ and capped at $30$ points to prevent arithmetic overflow in multi-injury incidents.
*   **$C_{\text{boost}}$ (Context Boosters)**: Extra vulnerability weights:
    *   Severe Pain (level $\ge 4$): $+5$ points
    *   Severe Vehicle damage (level $\ge 4$): $+5$ points
    *   Active fire present (`FLAG_FIRE`): $+5$ points
    *   Hazmat exposure (`FLAG_HAZMAT`): $+5$ points
    *   High passenger count ($> 4$ passengers): $+3$ points

### B. Transport Recommendation Matrix
The triage engine maps final classification scores to four specific transport types:

| Priority | Urgency Label | Recommended Vehicle | Visual Icon | Dispatch Directive |
|---|---|---|---|---|
| **`P1`** | **CRITICAL** | **ALS Ambulance** | 🚑 | Immediate paramedic-staffed ambulance equipped with Advanced Life Support systems. |
| **`P2`** | **URGENT** | **BLS Ambulance** | 🚑 | Ambulance equipped with basic emergency monitors and staffed by a trained EMT. |
| **`P3`** | **SERIOUS** | **Self-drive / Escort** | 🚗 | Can be driven to the nearest local hospital by a companion, provided vitals are stable. |
| **`P4`** | **MODERATE** | **Self-care** | 🩹 | Primary first-aid on the scene. Hospital or clinic visits are optional/discretionary. |

### C. Clinical Risk Escalation Predictors
To assist first-responders who are waiting for an ambulance, the system analyzes inputs to generate real-time predictive hazard warnings:

*   **Injury: Head Injury** $\rightarrow$ *“⚠️ Head injuries can deteriorate rapidly — monitor consciousness every 2 min”*
*   **Injury: Bleeding / Heavy Bleeding** $\rightarrow$ *“⚠️ Uncontrolled bleeding leads to shock within 10-15 minutes”*
*   **Injury: Chest Pain** $\rightarrow$ *“⚠️ Chest pain may indicate cardiac arrest — be ready for CPR”*
*   **Injury: Burns / Severe Burns** $\rightarrow$ *“⚠️ Burns cause progressive fluid loss — shock risk increases over time”*
*   **Injury: Suspected Spine Injury** $\rightarrow$ *“⚠️ Any movement without immobilization risks permanent paralysis”*
*   **Combination: Unconscious + Vomiting** $\rightarrow$ *“⚠️ Aspiration risk — keep in recovery position at all times”*
*   **Context: Rollover Accident** $\rightarrow$ *“🔄 Rollover — assume spinal injury until proven otherwise”*
*   **Context: Pregnant Victim** $\rightarrow$ *“🤰 Pregnant victim — position on LEFT side, monitor for complications”*
*   **Context: Extreme Damage ($\ge 4$)** $\rightarrow$ *“🚗 Severe vehicle damage — assume hidden injuries, check for trapped occupants”*

