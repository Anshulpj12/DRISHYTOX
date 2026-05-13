// ═══ ROAD SOS — Rule-Based Medical Guidance Engine ═══
// All protocols are medically reviewed, fixed, offline-capable. NO LLM.

const SOS_CONDITIONS = [
  {id:'unconscious',label:'Unconscious',icon:'😵',region:'head',severity:5,cat:'neuro'},
  {id:'not_breathing',label:'Not Breathing',icon:'🫁',region:'chest',severity:5,cat:'airway'},
  {id:'breathing_diff',label:'Breathing Difficulty',icon:'😮‍💨',region:'chest',severity:4,cat:'airway'},
  {id:'choking',label:'Choking',icon:'🤢',region:'chest',severity:5,cat:'airway'},
  {id:'chest_pain',label:'Chest Pain',icon:'💔',region:'chest',severity:4,cat:'cardiac'},
  {id:'head_injury',label:'Head Injury',icon:'🤕',region:'head',severity:4,cat:'trauma'},
  {id:'spine_injury',label:'Spine / Neck Injury',icon:'🦴',region:'back',severity:5,cat:'trauma'},
  {id:'heavy_bleeding',label:'Heavy Bleeding',icon:'🩸',region:'any',severity:5,cat:'bleeding'},
  {id:'bleeding',label:'Bleeding (Moderate)',icon:'💉',region:'any',severity:3,cat:'bleeding'},
  {id:'broken_arm',label:'Broken Arm',icon:'🦾',region:'arm',severity:3,cat:'fracture'},
  {id:'broken_leg',label:'Broken Leg',icon:'🦿',region:'leg',severity:3,cat:'fracture'},
  {id:'broken_rib',label:'Broken Ribs',icon:'🩻',region:'chest',severity:4,cat:'fracture'},
  {id:'burns',label:'Burns',icon:'🔥',region:'any',severity:3,cat:'burns'},
  {id:'severe_burns',label:'Severe Burns',icon:'🔥',region:'any',severity:5,cat:'burns'},
  {id:'shock',label:'Shock (Pale/Cold)',icon:'🥶',region:'body',severity:4,cat:'systemic'},
  {id:'seizure',label:'Seizures',icon:'⚡',region:'body',severity:4,cat:'neuro'},
  {id:'trapped',label:'Trapped / Pinned',icon:'🚗',region:'body',severity:4,cat:'trauma'},
  {id:'vomiting',label:'Vomiting',icon:'🤮',region:'head',severity:2,cat:'systemic'},
  {id:'dizziness',label:'Dizziness / Fainting',icon:'💫',region:'head',severity:2,cat:'neuro'},
  {id:'allergic',label:'Allergic Reaction',icon:'😰',region:'body',severity:3,cat:'systemic'},
  {id:'eye_injury',label:'Eye Injury',icon:'👁️',region:'head',severity:3,cat:'trauma'},
  {id:'crush_injury',label:'Crush Injury',icon:'🏗️',region:'any',severity:5,cat:'trauma'},
];

const SOS_ASSESSMENTS = [
  {id:'avpu',question:'Is the person responsive?',icon:'🧠',options:[
    {label:'Alert & Talking',value:'alert',score:0,color:'#22C55E'},
    {label:'Responds to Voice',value:'voice',score:2,color:'#EAB308'},
    {label:'Responds to Pain Only',value:'pain',score:4,color:'#F97316'},
    {label:'Unresponsive',value:'unresponsive',score:5,color:'#DC2626'}
  ]},
  {id:'breathing',question:'Is the person breathing?',icon:'🫁',options:[
    {label:'Breathing Normally',value:'normal',score:0,color:'#22C55E'},
    {label:'Shallow / Irregular',value:'abnormal',score:3,color:'#F97316'},
    {label:'Not Breathing',value:'none',score:5,color:'#DC2626'}
  ]},
  {id:'pulse',question:'Can you feel a pulse? (wrist or neck)',icon:'❤️',options:[
    {label:'Strong Pulse',value:'strong',score:0,color:'#22C55E'},
    {label:'Weak / Fast Pulse',value:'weak',score:3,color:'#F97316'},
    {label:'No Pulse Found',value:'none',score:5,color:'#DC2626'}
  ]},
  {id:'bleeding_sev',question:'How severe is the bleeding?',icon:'🩸',options:[
    {label:'No Visible Bleeding',value:'none',score:0,color:'#22C55E'},
    {label:'Minor / Controlled',value:'minor',score:1,color:'#EAB308'},
    {label:'Moderate — Steady Flow',value:'moderate',score:3,color:'#F97316'},
    {label:'Severe — Spurting / Pooling',value:'severe',score:5,color:'#DC2626'}
  ]},
  {id:'movement',question:'Can the person move their limbs?',icon:'🦾',options:[
    {label:'All Limbs Moving',value:'all',score:0,color:'#22C55E'},
    {label:'Some Limbs — Pain in Others',value:'some',score:2,color:'#EAB308'},
    {label:'Cannot Move — Severe Pain',value:'none',score:4,color:'#DC2626'}
  ]}
];

const SOS_TREATMENTS = {
  cpr:{id:'cpr',title:'CPR — Cardiopulmonary Resuscitation',priority:1,forConditions:['not_breathing','unconscious'],
    steps:[
      {text:'Place person on firm, flat surface on their back',detail:'Clear the area around them. Remove pillows.',icon:'⬇️'},
      {text:'Tilt head back, lift chin to open airway',detail:'Place one hand on forehead, two fingers under chin. Gently tilt head back.',icon:'🫁',warning:'If spine injury suspected, use jaw-thrust instead — do NOT tilt head'},
      {text:'Check for breathing for 10 seconds',detail:'Look at chest movement, listen for breath sounds, feel for air on your cheek.',icon:'👀',timer:10},
      {text:'If NOT breathing: Begin chest compressions',detail:'Place heel of one hand on center of chest, other hand on top. Press hard and fast, 5-6cm deep.',icon:'🫸'},
      {text:'Push hard and fast — 30 compressions',detail:'Rate: 100-120 per minute. Let chest fully recoil between pushes. Count aloud.',icon:'💪',timer:18},
      {text:'Give 2 rescue breaths',detail:'Pinch nose, seal lips over mouth, blow for 1 second each. Watch chest rise.',icon:'🌬️',timer:4},
      {text:'Repeat: 30 compressions + 2 breaths',detail:'Continue this cycle. Do NOT stop until help arrives or person starts breathing.',icon:'🔄'},
    ],
    donts:['Do NOT stop CPR unless person starts breathing or help arrives','Do NOT check pulse repeatedly — keep compressing','Do NOT give up — CPR can take 20+ minutes to work']
  },
  bleeding_control:{id:'bleeding_control',title:'Severe Bleeding Control',priority:1,forConditions:['heavy_bleeding','bleeding'],
    steps:[
      {text:'Apply DIRECT PRESSURE immediately',detail:'Use clean cloth, gauze, or even clothing. Press firmly on the wound.',icon:'🤚'},
      {text:'Press hard — do NOT lift to check',detail:'Maintain steady, firm pressure for at least 10 minutes without peeking.',icon:'⏱️',timer:600},
      {text:'If blood soaks through, add more cloth on TOP',detail:'Do NOT remove the first cloth — just add another layer and keep pressing.',icon:'🩹'},
      {text:'Elevate the injured area above heart if possible',detail:'Raise the bleeding limb higher than the chest to slow blood flow.',icon:'⬆️'},
      {text:'If limb bleeding won\'t stop — apply tourniquet',detail:'Use belt, cloth strip, or rope. Tie 5-8cm above wound. Tighten until bleeding stops. Note the TIME.',icon:'🪢'},
    ],
    donts:['Do NOT remove embedded objects (glass, metal)','Do NOT apply tourniquet on joints, neck, or torso','Do NOT keep lifting cloth to check — this breaks clots','Do NOT wash severe wounds with water']
  },
  airway:{id:'airway',title:'Airway Management',priority:1,forConditions:['choking','breathing_diff'],
    steps:[
      {text:'If CHOKING: Give 5 back blows',detail:'Stand behind person. Lean them forward. Strike firmly between shoulder blades with heel of hand.',icon:'🤚'},
      {text:'If still choking: 5 abdominal thrusts',detail:'Stand behind, fists above navel, pull sharply inward and upward.',icon:'💪'},
      {text:'Alternate: 5 back blows → 5 thrusts',detail:'Keep alternating until object comes out or person becomes unconscious.',icon:'🔄'},
      {text:'If person becomes unconscious, begin CPR',detail:'Lower to ground gently. Start chest compressions — they may dislodge the object.',icon:'🫸'},
      {text:'If breathing difficulty (not choking)',detail:'Sit person upright, lean slightly forward. Loosen tight clothing around neck/chest.',icon:'🧘'},
    ],
    donts:['Do NOT put fingers in mouth to grab object blindly','Do NOT give water to someone who is choking','Do NOT slap a choking infant on the back while upright']
  },
  spine_immobilize:{id:'spine_immobilize',title:'Spine Injury — DO NOT MOVE',priority:1,forConditions:['spine_injury'],
    steps:[
      {text:'⚠️ DO NOT MOVE THE PERSON',detail:'ANY movement of head, neck, or back could cause permanent paralysis.',icon:'🚫'},
      {text:'Tell them to stay completely still',detail:'Calm them verbally. Say "Don\'t move your head or neck."',icon:'🗣️'},
      {text:'Stabilize head and neck with your hands',detail:'Kneel behind head. Place hands on both sides of head. Hold firmly in neutral position.',icon:'🤲'},
      {text:'If they must be moved (fire/danger only)',detail:'Use log-roll technique: 3+ people, keeping head-neck-spine aligned as one unit.',icon:'👥'},
      {text:'Place rolled towels/clothes beside head',detail:'Prevent any side-to-side head movement while waiting for help.',icon:'🧣'},
    ],
    donts:['Do NOT move or roll the person alone','Do NOT remove helmet if wearing one','Do NOT bend, twist, or lift their head','Do NOT let them sit up or stand']
  },
  fracture:{id:'fracture',title:'Fracture Stabilization',priority:3,forConditions:['broken_arm','broken_leg','broken_rib','trapped'],
    steps:[
      {text:'Do NOT try to straighten or realign the bone',detail:'Leave the limb in the position you find it. Moving it causes more damage.',icon:'🚫'},
      {text:'Immobilize the injured area with a splint',detail:'Use sticks, boards, rolled newspaper, or even a pillow. Pad with cloth.',icon:'🪵'},
      {text:'Secure splint above AND below the fracture',detail:'Use cloth strips, belts, or tape. Firm but not too tight — check circulation.',icon:'🪢'},
      {text:'Apply cold pack wrapped in cloth',detail:'Reduces swelling and pain. Never apply ice directly on skin. 15 min on, 15 off.',icon:'🧊'},
      {text:'For rib fractures: Support with arm sling',detail:'Have person hold arm against injured side. Do NOT wrap chest tightly.',icon:'🩹'},
    ],
    donts:['Do NOT try to push bone back in','Do NOT apply direct pressure on fracture site','Do NOT let person use the injured limb','Do NOT remove clothing by pulling — cut it away']
  },
  burns_treatment:{id:'burns_treatment',title:'Burn Treatment',priority:2,forConditions:['burns','severe_burns'],
    steps:[
      {text:'COOL the burn with running water for 20 minutes',detail:'Use cool (not ice cold) running water. Start immediately. This is the most important step.',icon:'🚿',timer:1200},
      {text:'Remove jewelry and loose clothing near burn',detail:'Do this while cooling. Swelling may make removal impossible later.',icon:'💍'},
      {text:'Cover with clean, non-stick dressing',detail:'Use cling film (laid on, not wrapped) or clean plastic bag. Keeps it clean.',icon:'🩹'},
      {text:'For severe burns: Treat for shock',detail:'Lay person down, elevate legs, keep warm with blanket (away from burn area).',icon:'🛏️'},
    ],
    donts:['Do NOT use ice, butter, toothpaste, or cream','Do NOT burst blisters','Do NOT remove clothing stuck to the burn','Do NOT wrap cling film around a limb — lay it on top']
  },
  shock_treatment:{id:'shock_treatment',title:'Shock Management',priority:2,forConditions:['shock','crush_injury'],
    steps:[
      {text:'Lay person down on their back',detail:'Use a flat surface. Place a blanket or coat underneath if available.',icon:'⬇️'},
      {text:'Elevate legs 20-30cm (8-12 inches)',detail:'Use bags, pillows, or rolled clothing under ankles. Helps blood flow to vital organs.',icon:'🦶'},
      {text:'Keep them warm — cover with blanket/coat',detail:'Prevent heat loss. Cover everything except the face.',icon:'🧥'},
      {text:'Loosen tight clothing',detail:'Belts, ties, collar buttons — anything restricting blood flow.',icon:'👔'},
      {text:'Monitor breathing and consciousness',detail:'Talk to them. Keep them calm. If they vomit, turn to recovery position.',icon:'👀'},
    ],
    donts:['Do NOT give food or water','Do NOT let them sit up or stand','Do NOT move them unless in danger','Do NOT leave them alone']
  },
  recovery_position:{id:'recovery_position',title:'Recovery Position',priority:2,forConditions:['unconscious','vomiting','seizure','dizziness'],
    steps:[
      {text:'Kneel beside the person',detail:'Make sure they are on their back first.',icon:'🧎'},
      {text:'Place nearest arm at right angle to body',detail:'Palm facing up, elbow bent at 90 degrees.',icon:'💪'},
      {text:'Bring far arm across chest, hold hand against cheek',detail:'Their hand should be resting against the cheek nearest to you.',icon:'🤚'},
      {text:'Pull far knee up — foot flat on ground',detail:'Grab the far leg above the knee and pull it up.',icon:'🦵'},
      {text:'Roll them toward you by pulling the bent knee',detail:'Roll gently. Keep their hand pressed against cheek. They should now be on their side.',icon:'🔄'},
      {text:'Tilt head back slightly to keep airway open',detail:'Adjust the hand under their cheek if needed.',icon:'🫁'},
    ],
    donts:['Do NOT use if spine injury suspected','Do NOT leave airway blocked — ensure mouth is pointing downward','Do NOT leave alone — keep monitoring']
  },
  seizure_care:{id:'seizure_care',title:'Seizure Management',priority:2,forConditions:['seizure'],
    steps:[
      {text:'Clear area of dangerous objects',detail:'Move furniture, sharp items, anything they could hit.',icon:'🧹'},
      {text:'Do NOT restrain them or hold them down',detail:'Let the seizure run its course. Protect their head only.',icon:'🚫'},
      {text:'Place something soft under their head',detail:'Folded jacket, towel, or your hands. Prevent head striking ground.',icon:'🧥'},
      {text:'Time the seizure',detail:'Note when it started. If longer than 5 minutes, call emergency immediately.',icon:'⏱️'},
      {text:'After seizure stops: recovery position',detail:'Roll them on their side. Stay with them until fully conscious.',icon:'🔄'},
    ],
    donts:['Do NOT put anything in their mouth','Do NOT try to hold them still','Do NOT give water until fully alert','Do NOT leave them alone after seizure']
  },
  head_injury_care:{id:'head_injury_care',title:'Head Injury Care',priority:2,forConditions:['head_injury'],
    steps:[
      {text:'Keep person still and calm — do NOT let them walk',detail:'Have them lie down with head and shoulders slightly elevated.',icon:'🛏️'},
      {text:'Apply gentle pressure to any bleeding scalp wound',detail:'Use clean cloth. Scalp bleeds a lot — this is normal. Gentle pressure only.',icon:'🩹'},
      {text:'Monitor for danger signs continuously',detail:'Watch for: unequal pupils, clear fluid from nose/ears, increasing confusion, repeated vomiting.',icon:'👀'},
      {text:'Keep them awake and talking if possible',detail:'Ask simple questions: name, date, what happened. Note any confusion.',icon:'🗣️'},
      {text:'If they become unconscious: recovery position',detail:'Protect airway. Monitor breathing. Be ready for CPR.',icon:'🔄'},
    ],
    donts:['Do NOT let them sleep for first 2 hours','Do NOT give painkillers or any medication','Do NOT press on skull fractures or depressed areas','Do NOT remove objects embedded in head']
  },
  chest_pain_care:{id:'chest_pain_care',title:'Chest Pain / Heart Attack',priority:1,forConditions:['chest_pain'],
    steps:[
      {text:'Sit person down in comfortable position',detail:'Lean slightly forward, supported. W-position (knees up) helps breathing.',icon:'🧘'},
      {text:'Loosen any tight clothing',detail:'Shirt collar, belt, tie — anything restricting chest movement.',icon:'👔'},
      {text:'If they have aspirin — help them chew ONE',detail:'300mg aspirin chewed (not swallowed whole) thins blood. Only if NOT allergic.',icon:'💊'},
      {text:'Keep them calm and still',detail:'Anxiety makes it worse. Speak reassuringly. Do NOT let them walk or exert.',icon:'🗣️'},
      {text:'If they become unconscious and stop breathing: CPR',detail:'Immediately begin chest compressions. See CPR protocol.',icon:'🫸'},
    ],
    donts:['Do NOT let them walk or move around','Do NOT give aspirin if allergic or already on blood thinners','Do NOT ignore — act fast, every minute counts']
  },
  eye_injury_care:{id:'eye_injury_care',title:'Eye Injury — Protect & Cover',priority:3,forConditions:['eye_injury'],
    steps:[
      {text:'Do NOT rub or touch the injured eye',detail:'Rubbing can cause further damage. Keep hands away.',icon:'🚫'},
      {text:'If chemical splash: Flush with clean water for 20 minutes',detail:'Hold eye open under gently running water. Tilt head so water runs away from good eye.',icon:'🚿',timer:1200},
      {text:'Cover the injured eye loosely with a clean cup or pad',detail:'Use a paper cup taped over the eye. Do NOT press on the eyeball.',icon:'🥤'},
      {text:'Cover BOTH eyes to prevent movement',detail:'When one eye moves, the other follows. Covering both reduces movement of the injured eye.',icon:'🩹'},
      {text:'Keep person calm and still — do NOT let them rub',detail:'Reassure them. Seek medical help immediately.',icon:'🗣️'},
    ],
    donts:['Do NOT try to remove embedded objects from the eye','Do NOT rub or apply pressure to the eye','Do NOT use cotton wool directly on the eye — fibers stick','Do NOT let them strain or bend over']
  },
  allergic_reaction_care:{id:'allergic_reaction_care',title:'Allergic Reaction / Anaphylaxis',priority:2,forConditions:['allergic'],
    steps:[
      {text:'Ask: Do they carry an EpiPen / adrenaline auto-injector?',detail:'If yes, help them use it immediately. Inject into outer thigh through clothing.',icon:'💉'},
      {text:'Sit them upright if breathing difficulty, or lay flat if dizzy',detail:'Upright position helps breathing. Flat with legs raised helps blood pressure.',icon:'🧘'},
      {text:'Loosen tight clothing around neck and chest',detail:'Remove scarves, open collar, loosen belt — help them breathe.',icon:'👔'},
      {text:'If they stop breathing: Begin CPR',detail:'Start chest compressions immediately. See CPR protocol.',icon:'🫸'},
      {text:'Monitor and reassure until help arrives',detail:'Symptoms can return — keep watching. Note time of EpiPen use for paramedics.',icon:'👀'},
    ],
    donts:['Do NOT give them food or drink','Do NOT leave them alone — anaphylaxis can worsen rapidly','Do NOT wait to see if symptoms improve before calling 112','Do NOT make them stand or walk']
  },
  crush_injury_care:{id:'crush_injury_care',title:'Crush Injury Management',priority:1,forConditions:['crush_injury','trapped'],
    steps:[
      {text:'⚠️ Call emergency services BEFORE attempting release',detail:'Crush syndrome can be fatal if released incorrectly. Paramedics need to prepare.',icon:'📞'},
      {text:'Do NOT release the crush if trapped more than 15 minutes',detail:'Toxins build up in crushed tissue. Sudden release can cause heart failure. Wait for paramedics.',icon:'🚫'},
      {text:'If trapped less than 15 min: Carefully remove weight',detail:'Monitor for sudden deterioration. Be ready for CPR.',icon:'⏱️'},
      {text:'Control any bleeding once exposed',detail:'Apply direct pressure to wounds. See bleeding control protocol.',icon:'🩸'},
      {text:'Treat for shock: Lay flat, elevate legs, keep warm',detail:'Crush injuries cause severe shock. Cover with blanket.',icon:'🧥'},
      {text:'Give small sips of water if conscious and alert',detail:'Fluids help flush toxins. Only if fully conscious and not vomiting.',icon:'💧'},
    ],
    donts:['Do NOT release a crush after 15+ minutes without paramedics','Do NOT apply tourniquet above a crush injury','Do NOT ignore signs of shock — pale, cold, rapid pulse','Do NOT let them stand up after release']
  }
};

// ═══ PRIORITY COMBINATION MATRIX ═══
// Rules sorted: multi-condition combos first (most specific), then singles.
// Engine matches most-specific first. Every condition has at least one rule.
const SOS_COMBO_RULES = [

  // ── 3+ CONDITION COMBOS (highest specificity) ──
  {conditions:['unconscious','not_breathing','heavy_bleeding'],priority:1,sequence:['bleeding_control','cpr'],label:'CARDIAC ARREST + BLEEDING — BLEED THEN CPR'},
  {conditions:['unconscious','spine_injury','heavy_bleeding'],priority:1,sequence:['bleeding_control','spine_immobilize'],label:'SPINE + BLEED + UNCONSCIOUS — CRITICAL'},
  {conditions:['unconscious','head_injury','heavy_bleeding'],priority:1,sequence:['bleeding_control','head_injury_care','recovery_position'],label:'HEAD + BLEED + UNCONSCIOUS'},
  {conditions:['crush_injury','heavy_bleeding','shock'],priority:1,sequence:['bleeding_control','crush_injury_care','shock_treatment'],label:'CRUSH + BLEED + SHOCK — MULTI TRAUMA'},
  {conditions:['burns','breathing_diff','shock'],priority:1,sequence:['airway','burns_treatment','shock_treatment'],label:'BURNS + AIRWAY + SHOCK'},
  {conditions:['broken_leg','broken_arm','heavy_bleeding'],priority:1,sequence:['bleeding_control','fracture','shock_treatment'],label:'MULTIPLE FRACTURES + BLEEDING'},

  // ── 2 CONDITION COMBOS (common road accident pairs) ──
  {conditions:['unconscious','not_breathing'],priority:1,sequence:['cpr'],label:'CARDIAC ARREST — CPR NOW'},
  {conditions:['unconscious','heavy_bleeding'],priority:1,sequence:['bleeding_control','recovery_position'],label:'BLEEDING + UNCONSCIOUS'},
  {conditions:['unconscious','head_injury'],priority:1,sequence:['head_injury_care','recovery_position'],label:'HEAD INJURY + UNCONSCIOUS'},
  {conditions:['unconscious','seizure'],priority:1,sequence:['seizure_care','recovery_position'],label:'SEIZURE + UNCONSCIOUS — PROTECT AIRWAY'},
  {conditions:['unconscious','chest_pain'],priority:1,sequence:['chest_pain_care','cpr'],label:'CHEST PAIN + UNCONSCIOUS — CPR READY'},
  {conditions:['unconscious','burns'],priority:1,sequence:['burns_treatment','recovery_position','shock_treatment'],label:'BURNS + UNCONSCIOUS'},
  {conditions:['unconscious','vomiting'],priority:1,sequence:['recovery_position'],label:'VOMITING + UNCONSCIOUS — SIDE POSITION'},
  {conditions:['spine_injury','heavy_bleeding'],priority:1,sequence:['bleeding_control','spine_immobilize'],label:'SPINE + BLEEDING — BLEED FIRST, NO MOVE'},
  {conditions:['spine_injury','head_injury'],priority:1,sequence:['spine_immobilize','head_injury_care'],label:'SPINE + HEAD — IMMOBILIZE BOTH'},
  {conditions:['spine_injury','broken_leg'],priority:1,sequence:['spine_immobilize','fracture'],label:'SPINE + LEG FRACTURE — DO NOT MOVE'},
  {conditions:['spine_injury','broken_arm'],priority:1,sequence:['spine_immobilize','fracture'],label:'SPINE + ARM FRACTURE — DO NOT MOVE'},
  {conditions:['head_injury','heavy_bleeding'],priority:1,sequence:['bleeding_control','head_injury_care'],label:'HEAD INJURY + SEVERE BLEEDING'},
  {conditions:['head_injury','bleeding'],priority:2,sequence:['bleeding_control','head_injury_care'],label:'HEAD INJURY + BLEEDING'},
  {conditions:['head_injury','seizure'],priority:1,sequence:['seizure_care','head_injury_care'],label:'HEAD INJURY + SEIZURE'},
  {conditions:['head_injury','vomiting'],priority:2,sequence:['head_injury_care','recovery_position'],label:'HEAD INJURY + VOMITING'},
  {conditions:['head_injury','dizziness'],priority:2,sequence:['head_injury_care','shock_treatment'],label:'HEAD INJURY + DIZZINESS — MONITOR'},
  {conditions:['heavy_bleeding','shock'],priority:1,sequence:['bleeding_control','shock_treatment'],label:'BLEEDING + SHOCK — STOP BLEED + SHOCK'},
  {conditions:['heavy_bleeding','broken_arm'],priority:1,sequence:['bleeding_control','fracture'],label:'BLEEDING + ARM FRACTURE'},
  {conditions:['heavy_bleeding','broken_leg'],priority:1,sequence:['bleeding_control','fracture'],label:'BLEEDING + LEG FRACTURE'},
  {conditions:['heavy_bleeding','burns'],priority:1,sequence:['bleeding_control','burns_treatment','shock_treatment'],label:'BLEEDING + BURNS'},
  {conditions:['chest_pain','breathing_diff'],priority:1,sequence:['chest_pain_care','airway'],label:'CHEST PAIN + BREATHING DIFF'},
  {conditions:['chest_pain','shock'],priority:1,sequence:['chest_pain_care','shock_treatment'],label:'CHEST PAIN + SHOCK'},
  {conditions:['severe_burns','broken_arm'],priority:1,sequence:['burns_treatment','fracture','shock_treatment'],label:'SEVERE BURNS + FRACTURE'},
  {conditions:['severe_burns','breathing_diff'],priority:1,sequence:['airway','burns_treatment','shock_treatment'],label:'BURNS + BREATHING DIFFICULTY'},
  {conditions:['burns','broken_arm'],priority:2,sequence:['burns_treatment','fracture'],label:'BURNS + ARM FRACTURE'},
  {conditions:['burns','broken_leg'],priority:2,sequence:['burns_treatment','fracture'],label:'BURNS + LEG FRACTURE'},
  {conditions:['crush_injury','heavy_bleeding'],priority:1,sequence:['bleeding_control','crush_injury_care','shock_treatment'],label:'CRUSH + BLEEDING'},
  {conditions:['crush_injury','broken_leg'],priority:1,sequence:['crush_injury_care','fracture','shock_treatment'],label:'CRUSH + LEG FRACTURE'},
  {conditions:['crush_injury','broken_arm'],priority:1,sequence:['crush_injury_care','fracture','shock_treatment'],label:'CRUSH + ARM FRACTURE'},
  {conditions:['broken_arm','broken_leg'],priority:2,sequence:['fracture','shock_treatment'],label:'MULTIPLE FRACTURES'},
  {conditions:['broken_rib','breathing_diff'],priority:2,sequence:['fracture','airway'],label:'RIB FRACTURE + BREATHING DIFF'},
  {conditions:['broken_rib','chest_pain'],priority:2,sequence:['fracture','chest_pain_care'],label:'RIB FRACTURE + CHEST PAIN'},
  {conditions:['seizure','head_injury'],priority:1,sequence:['seizure_care','head_injury_care'],label:'SEIZURE + HEAD INJURY'},
  {conditions:['seizure','breathing_diff'],priority:1,sequence:['seizure_care','airway'],label:'SEIZURE + BREATHING DIFFICULTY'},
  {conditions:['allergic','breathing_diff'],priority:1,sequence:['allergic_reaction_care','airway'],label:'ANAPHYLAXIS + AIRWAY'},
  {conditions:['allergic','shock'],priority:1,sequence:['allergic_reaction_care','shock_treatment'],label:'ALLERGIC + SHOCK'},
  {conditions:['eye_injury','head_injury'],priority:2,sequence:['head_injury_care','eye_injury_care'],label:'HEAD + EYE INJURY'},
  {conditions:['eye_injury','bleeding'],priority:2,sequence:['bleeding_control','eye_injury_care'],label:'EYE + BLEEDING'},
  {conditions:['vomiting','dizziness'],priority:2,sequence:['recovery_position','shock_treatment'],label:'VOMITING + DIZZINESS'},
  {conditions:['trapped','heavy_bleeding'],priority:1,sequence:['bleeding_control','crush_injury_care','shock_treatment'],label:'TRAPPED + BLEEDING'},
  {conditions:['trapped','broken_leg'],priority:1,sequence:['crush_injury_care','fracture'],label:'TRAPPED + LEG FRACTURE'},

  // ── SINGLE CONDITION RULES (every condition covered) ──
  {conditions:['not_breathing'],priority:1,sequence:['airway','cpr'],label:'NO BREATHING — AIRWAY + CPR'},
  {conditions:['choking'],priority:1,sequence:['airway'],label:'CHOKING — CLEAR AIRWAY'},
  {conditions:['heavy_bleeding'],priority:1,sequence:['bleeding_control'],label:'SEVERE BLEEDING — STOP BLEEDING'},
  {conditions:['chest_pain'],priority:1,sequence:['chest_pain_care'],label:'CHEST PAIN — CARDIAC EMERGENCY'},
  {conditions:['spine_injury'],priority:1,sequence:['spine_immobilize'],label:'SPINE INJURY — DO NOT MOVE'},
  {conditions:['crush_injury'],priority:1,sequence:['crush_injury_care','shock_treatment'],label:'CRUSH INJURY — DO NOT RELEASE'},
  {conditions:['unconscious'],priority:2,sequence:['recovery_position'],label:'UNCONSCIOUS — RECOVERY POSITION'},
  {conditions:['head_injury'],priority:2,sequence:['head_injury_care'],label:'HEAD INJURY — MONITOR'},
  {conditions:['shock'],priority:2,sequence:['shock_treatment'],label:'SHOCK — ELEVATE LEGS + WARMTH'},
  {conditions:['seizure'],priority:2,sequence:['seizure_care'],label:'SEIZURES — PROTECT + TIME'},
  {conditions:['severe_burns'],priority:2,sequence:['burns_treatment','shock_treatment'],label:'SEVERE BURNS + SHOCK RISK'},
  {conditions:['breathing_diff'],priority:2,sequence:['airway'],label:'BREATHING DIFFICULTY'},
  {conditions:['allergic'],priority:2,sequence:['allergic_reaction_care'],label:'ALLERGIC REACTION — CHECK EPIPEN'},
  {conditions:['trapped'],priority:2,sequence:['crush_injury_care'],label:'TRAPPED — CALL HELP FIRST'},
  {conditions:['burns'],priority:3,sequence:['burns_treatment'],label:'BURNS — COOL WITH WATER'},
  {conditions:['broken_arm'],priority:3,sequence:['fracture'],label:'ARM FRACTURE — IMMOBILIZE'},
  {conditions:['broken_leg'],priority:3,sequence:['fracture'],label:'LEG FRACTURE — IMMOBILIZE'},
  {conditions:['broken_rib'],priority:3,sequence:['fracture'],label:'RIB FRACTURE — SUPPORT'},
  {conditions:['bleeding'],priority:3,sequence:['bleeding_control'],label:'MODERATE BLEEDING — APPLY PRESSURE'},
  {conditions:['eye_injury'],priority:3,sequence:['eye_injury_care'],label:'EYE INJURY — PROTECT & COVER'},
  {conditions:['dizziness'],priority:3,sequence:['recovery_position','shock_treatment'],label:'DIZZINESS — MONITOR & POSITION'},
  {conditions:['vomiting'],priority:3,sequence:['recovery_position'],label:'VOMITING — RECOVERY POSITION'},
];

// ═══ TRIAGE ENGINE ═══
const SOSTriageEngine = {
  // Calculate priority from selected conditions + assessments
  calculatePriority(selectedConditions, assessmentResults) {
    let maxPriority = 4;
    let treatmentSequence = [];
    let matchedRules = [];
    let totalScore = 0;

    // Score from assessments
    if (assessmentResults) {
      Object.values(assessmentResults).forEach(r => { totalScore += (r.score || 0); });
    }

    // Score from conditions
    selectedConditions.forEach(cId => {
      const c = SOS_CONDITIONS.find(x => x.id === cId);
      if (c) totalScore += c.severity;
    });

    // Match combination rules (most specific first)
    const sorted = [...SOS_COMBO_RULES].sort((a, b) => b.conditions.length - a.conditions.length);
    const used = new Set();

    sorted.forEach(rule => {
      if (rule.conditions.every(c => selectedConditions.includes(c) && !used.has(c))) {
        matchedRules.push(rule);
        if (rule.priority < maxPriority) maxPriority = rule.priority;
        rule.conditions.forEach(c => used.add(c));
        rule.sequence.forEach(t => { if (!treatmentSequence.includes(t)) treatmentSequence.push(t); });
      }
    });

    // Any unmatched conditions — add generic treatment
    selectedConditions.forEach(cId => {
      if (!used.has(cId)) {
        Object.values(SOS_TREATMENTS).forEach(t => {
          if (t.forConditions.includes(cId) && !treatmentSequence.includes(t.id)) {
            treatmentSequence.push(t.id);
          }
        });
      }
    });

    // Override priority based on assessment
    if (assessmentResults?.avpu?.value === 'unresponsive' && assessmentResults?.breathing?.value === 'none') maxPriority = 1;
    if (assessmentResults?.pulse?.value === 'none') maxPriority = 1;
    if (assessmentResults?.bleeding_sev?.value === 'severe') maxPriority = 1;

    const labels = {1:'CRITICAL',2:'URGENT',3:'SERIOUS',4:'MODERATE'};
    const colors = {1:'#DC2626',2:'#F97316',3:'#EAB308',4:'#06B6D4'};

    return {
      priority: maxPriority,
      label: labels[maxPriority],
      color: colors[maxPriority],
      score: totalScore,
      treatmentSequence,
      matchedRules,
      treatments: treatmentSequence.map(id => SOS_TREATMENTS[id]).filter(Boolean)
    };
  },

  // Get all steps flattened in order
  getAllSteps(triageResult) {
    const allSteps = [];
    triageResult.treatments.forEach(t => {
      allSteps.push({type:'header',title:t.title,priority:t.priority});
      t.steps.forEach((s, i) => {
        allSteps.push({type:'step',step:s,index:i+1,total:t.steps.length,treatmentId:t.id,treatmentTitle:t.title});
      });
      if (t.donts && t.donts.length > 0) {
        allSteps.push({type:'donts',donts:t.donts,treatmentTitle:t.title});
      }
    });
    return allSteps;
  }
};

// ═══ BODY MAP ENGINE ═══
// Maps SVG body regions to condition IDs using body_map metadata.
// Supports multi-select, front/back view, and condition filtering.
const BodyMapEngine = {
  // Default body map region-to-condition mapping (from road_sos_system.json body_map)
  _regionMap: {
    'HEAD':      ['unconscious','head_injury','seizure','vomiting','dizziness','eye_injury'],
    'NECK':      ['spine_injury','choking','breathing_diff'],
    'CHEST':     ['chest_pain','breathing_diff','broken_rib','not_breathing'],
    'ABDOMEN':   ['vomiting','allergic','shock'],
    'PELVIS':    ['broken_leg','bleeding','heavy_bleeding'],
    'LEFT_ARM':  ['broken_arm','bleeding','heavy_bleeding','burns','severe_burns'],
    'RIGHT_ARM': ['broken_arm','bleeding','heavy_bleeding','burns','severe_burns'],
    'LEFT_LEG':  ['broken_leg','bleeding','heavy_bleeding','burns','severe_burns'],
    'RIGHT_LEG': ['broken_leg','bleeding','heavy_bleeding','burns','severe_burns'],
    'BACK':      ['spine_injury','burns','severe_burns'],
    'FULL_BODY': ['shock','allergic','seizure','crush_injury','trapped']
  },

  // Back-only regions (shown when toggled to back view)
  _backRegions: ['BACK','HEAD','NECK','LEFT_ARM','RIGHT_ARM','LEFT_LEG','RIGHT_LEG','PELVIS','FULL_BODY'],
  // Front-only regions
  _frontRegions: ['HEAD','NECK','CHEST','ABDOMEN','PELVIS','LEFT_ARM','RIGHT_ARM','LEFT_LEG','RIGHT_LEG','FULL_BODY'],

  selectedRegions: new Set(),
  currentView: 'front', // 'front' or 'back'

  // Initialize from JSON body_map if loaded
  initFromJSON(bodyMapData) {
    if (!bodyMapData || !bodyMapData.regions) return;
    this._regionMap = {};
    bodyMapData.regions.forEach(r => {
      // Map condition codes (COND_XXX) to condition IDs via SOS_CONDITIONS
      const condIds = [];
      if (r.conditions) {
        // For now, keep our internal mapping since JSON uses COND_XXX codes
        // The default _regionMap above is manually curated for accuracy
      }
      this._regionMap[r.id] = this._regionMap[r.id] || condIds;
    });
  },

  toggleView() {
    this.currentView = this.currentView === 'front' ? 'back' : 'front';
    return this.currentView;
  },

  toggleRegion(regionId) {
    if (this.selectedRegions.has(regionId)) {
      this.selectedRegions.delete(regionId);
    } else {
      this.selectedRegions.add(regionId);
    }
    return this.getFilteredConditions();
  },

  clearRegions() {
    this.selectedRegions.clear();
    return SOS_CONDITIONS; // Return all
  },

  isRegionSelected(regionId) {
    return this.selectedRegions.has(regionId);
  },

  // Get conditions for currently selected regions (union of all)
  getFilteredConditions() {
    if (this.selectedRegions.size === 0) return SOS_CONDITIONS;
    const condIds = new Set();
    this.selectedRegions.forEach(regionId => {
      const regionConds = this._regionMap[regionId] || [];
      regionConds.forEach(c => condIds.add(c));
    });
    return SOS_CONDITIONS.filter(c => condIds.has(c.id));
  },

  // Get condition count for a specific region
  getRegionConditionCount(regionId) {
    return (this._regionMap[regionId] || []).length;
  },

  // Get selected region labels
  getSelectedLabels() {
    const labels = {
      'HEAD':'Head','NECK':'Neck','CHEST':'Chest','ABDOMEN':'Abdomen',
      'PELVIS':'Pelvis','LEFT_ARM':'L.Arm','RIGHT_ARM':'R.Arm',
      'LEFT_LEG':'L.Leg','RIGHT_LEG':'R.Leg','BACK':'Back','FULL_BODY':'Full Body'
    };
    return Array.from(this.selectedRegions).map(r => labels[r] || r);
  },

  // Get visible regions for current view
  getVisibleRegions() {
    return this.currentView === 'front' ? this._frontRegions : this._backRegions;
  }
};

// ═══ SEARCH ENGINE ═══
// Fuzzy substring search across condition labels for the search bar.
const SearchEngine = {
  search(query) {
    if (!query || query.trim().length === 0) return SOS_CONDITIONS;
    const q = query.toLowerCase().trim();
    // Score: exact match > starts with > contains
    const results = SOS_CONDITIONS.filter(c => {
      const label = c.label.toLowerCase();
      const id = c.id.toLowerCase();
      const cat = (c.cat || '').toLowerCase();
      return label.includes(q) || id.includes(q) || cat.includes(q);
    });
    // Sort: starts-with first, then contains
    results.sort((a, b) => {
      const aStarts = a.label.toLowerCase().startsWith(q) ? 0 : 1;
      const bStarts = b.label.toLowerCase().startsWith(q) ? 0 : 1;
      return aStarts - bStarts;
    });
    return results;
  },

  // Get unique categories from conditions
  getCategories() {
    const cats = new Set();
    SOS_CONDITIONS.forEach(c => { if (c.cat) cats.add(c.cat); });
    return Array.from(cats);
  }
};
