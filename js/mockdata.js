/* =====================================================================
   MOCK DATA — Doctor OPD Consultation (UX prototype only)
   ---------------------------------------------------------------------
   DEVELOPER NOTE: This file supplies realistic, per-patient MOCK data so
   the UX shows patient-specific clinical content. In the real app the
   backend returns this shape per patient (GET /api/patients/{uhid}/clinical),
   the drug lookups come from a formulary / interaction service, and
   `regCouncil` comes from Org Admin configuration. Nothing here is real
   logic — it only drives the prototype's visual states.
   ===================================================================== */

/* ---- Doctor identity (used on the prescription) ----
   DEV: regCouncil is a PLACEHOLDER ('NABH'). The real issuing-body label
   becomes an Org-Admin configurable value in a later module. Do not hardcode. */
const MOCK_DOCTOR = {
  name: 'Dr. Arjun Patel',
  qualifications: 'MBBS, MD (General Medicine)',
  specialization: 'Cardiologist',
  regNo: 'REG/FMR/12345',
  regCouncil: 'NABH'   // placeholder — org-configured in production
};

/* ---- Per-patient clinical records, keyed by UHID ----
   allergiesConfirmed:
     true  + empty allergies[]  -> "No known allergies (confirmed)" (green)
     false + empty allergies[]  -> "Allergies not recorded" (amber)
     any allergies[]            -> red banner regardless */
const MOCK_PATIENTS = {
  'HSP24-00123': {
    uhid:'HSP24-00123', name:'Rahul Sharma', age:34, gender:'Male', bloodGroup:'B+', phone:'98765 43210',
    abhaId:'14-1234-5678-9012',
    scheme:'Aarogyasri', schemeCardNo:'ARG-TS-0098765', networkHospitalId:'NH-TS-00456',
    allergiesConfirmed:true,
    allergies:[
      {substance:'Penicillin', reaction:'Rash, breathing difficulty', severity:'severe'},
      {substance:'Sulfa drugs', reaction:'Skin rash', severity:'moderate'}
    ],
    currentMeds:[
      {drug:'Metformin', strength:'500mg', frequency:'1-0-1', since:'Jan 2024'},
      {drug:'Telmisartan', strength:'40mg', frequency:'1-0-0', since:'2023'},
      {drug:'Atorvastatin', strength:'10mg', frequency:'0-0-1', since:'2023'}
    ],
    conditions:[
      {name:'Type 2 Diabetes', since:'2 years'},
      {name:'Hypertension', since:'3 years'}
    ],
    vitals:{ temp:'98.6', pulse:'72', bp:'120/80', spo2:'98', weight:'70', height:'170', bmi:'24.2', measuredAt:'Today, 09:10' },
    records:[
      {name:'CBP Report', type:'lab', date:'12 Jun 2026'},
      {name:'Diabetic Prescription', type:'rx', date:'08 May 2026'},
      {name:'ECG Report', type:'lab', date:'02 May 2026'},
      {name:'HbA1c Report', type:'lab', date:'28 Jan 2026'}
    ],
    habits:[
      {substance:'Tobacco (Smoking)', status:'Former', frequency:'10/day', duration:'2010-2020', note:'Quit 6 years ago'},
      {substance:'Alcohol', status:'Occasional', frequency:'2-3 drinks/week', duration:'Social', note:'Weekend only'}
    ]
  },

  'HSP24-00124': {
    uhid:'HSP24-00124', name:'Priya Mehta', age:31, gender:'Female', bloodGroup:'O+', phone:'91234 56780',
    abhaId:'14-2233-4455-6677',
    scheme:'Private',
    allergiesConfirmed:true,
    allergies:[],   // confirmed none -> green banner
    currentMeds:[
      {drug:'Thyronorm', strength:'50mcg', frequency:'1-0-0', since:'2022'}
    ],
    conditions:[
      {name:'Hypothyroidism', since:'4 years'}
    ],
    vitals:{ temp:'98.4', pulse:'78', bp:'118/76', spo2:'99', weight:'58', height:'162', bmi:'22.1', measuredAt:'Today, 09:35' },
    records:[
      {name:'Thyroid Profile', type:'lab', date:'18 Mar 2026'},
      {name:'CBP Report', type:'lab', date:'18 Mar 2026'}
    ],
    habits:[
      {substance:'Tobacco', status:'Never', frequency:'—', duration:'—', note:'Non-smoker'},
      {substance:'Alcohol', status:'Never', frequency:'—', duration:'—', note:'—'}
    ]
  },

  'HSP24-00125': {
    uhid:'HSP24-00125', name:'Amit Verma', age:52, gender:'Male', bloodGroup:'A+', phone:'99887 66554',
    abhaId:'14-8899-0011-2233',
    scheme:'Ayushman Bharat', schemeCardNo:'PMJAY-TS-0044556', networkHospitalId:'NH-TS-00789',
    allergiesConfirmed:false,
    allergies:[],   // not recorded -> amber banner
    currentMeds:[
      {drug:'Formoterol + Budesonide', strength:'Inhaler', frequency:'1-0-1', since:'2021'},
      {drug:'Montelukast', strength:'10mg', frequency:'0-0-1', since:'2022'}
    ],
    conditions:[
      {name:'COPD', since:'5 years'}
    ],
    vitals:{ temp:'99.1', pulse:'88', bp:'134/86', spo2:'94', weight:'74', height:'168', bmi:'26.2', measuredAt:'Today, 10:05' },
    records:[
      {name:'Chest X-Ray', type:'lab', date:'15 Dec 2025'},
      {name:'Spirometry Report', type:'lab', date:'15 Dec 2025'}
    ],
    habits:[
      {substance:'Tobacco (Smoking)', status:'Current', frequency:'15/day', duration:'25 years', note:'Advised cessation'},
      {substance:'Alcohol', status:'Occasional', frequency:'1-2 drinks/week', duration:'Social', note:'—'}
    ]
  }
};

/* ---- Shared clinical lookups (MOCK) ---- */

/* DEV: real app resolves brand -> generic from a national formulary. */
const BRAND_TO_GENERIC = {
  'Dolo 650':'Paracetamol 650mg',
  'Crocin':'Paracetamol',
  'Amlodac':'Amlodipine',
  'Augmentin':'Amoxicillin + Clavulanic acid',
  'Amoxil':'Amoxicillin',
  'Pan 40':'Pantoprazole 40mg',
  'Pan-D':'Pantoprazole + Domperidone',
  'Azithral':'Azithromycin',
  'Telma':'Telmisartan',
  'Ecosprin':'Aspirin',
  'Glycomet':'Metformin',
  'Thyronorm':'Thyroxine'
};

/* DEV: Schedule classification per Drugs & Cosmetics Rules; real app from drug master.
   Values: 'H' | 'H1' | 'X' */
const SCHEDULE_DRUGS = {
  'Alprazolam':'H1',
  'Diazepam':'H1',
  'Tramadol':'H1',
  'Codeine':'H',
  'Azithromycin':'H',
  'Amoxicillin':'H',
  'Augmentin':'H',
  'Zolpidem':'X',
  'Morphine':'X'
};

/* DEV: real app runs prescribed drug against a drug-allergy + drug-drug
   interaction service. Here, a scripted map drives the warning UX.
   - allergyClass: the allergy family this drug belongs to
   - interactsWith: current-med names it conflicts with */
const DRUG_CONFLICTS = {
  'Amoxicillin':{ allergyClass:'Penicillin' },
  'Augmentin':{ allergyClass:'Penicillin' },
  'Amoxil':{ allergyClass:'Penicillin' },
  'Cotrimoxazole':{ allergyClass:'Sulfa' },
  'Ibuprofen':{ interactsWith:['Telmisartan'] },
  'Diclofenac':{ interactsWith:['Telmisartan','Aspirin'] },
  'Aspirin':{ interactsWith:['Ibuprofen'] }
};

/* DEV: 1-0-1 (morning-noon-night) is the primary Indian OPD convention,
   listed first; OD/BD/TDS abbreviations follow. */
const FREQ_OPTIONS = [
  {token:'1-0-1',   label:'Morning - Night'},
  {token:'1-1-1',   label:'Morning - Noon - Night'},
  {token:'1-0-0',   label:'Morning only'},
  {token:'0-0-1',   label:'Night only'},
  {token:'0-1-0',   label:'Noon only'},
  {token:'1-1-1-1', label:'Four times a day'},
  {token:'OD',      label:'Once daily'},
  {token:'BD',      label:'Twice daily'},
  {token:'TID',     label:'Thrice daily'},
  {token:'QID',     label:'Four times daily'},
  {token:'HS',      label:'At bedtime'},
  {token:'STAT',    label:'Immediately'}
];

/* DEV: real app localizes via i18n. Sample Telugu strings for seeded advice. */
const TELUGU_ADVICE = {
  'Low-salt diet':'తక్కువ ఉప్పు ఆహారం తీసుకోండి',
  'Walk 30 min daily':'ప్రతిరోజూ 30 నిమిషాలు నడవండి',
  'Monitor blood sugar daily':'ప్రతిరోజూ రక్తంలో చక్కెరను తనిఖీ చేయండి',
  'Take medicines regularly':'మందులను క్రమం తప్పకుండా తీసుకోండి',
  'Avoid smoking':'ధూమపానం మానేయండి',
  'Drink plenty of water':'పుష్కలంగా నీరు త్రాగండి'
};

/* Helper: schedule class for a typed drug name (case-insensitive contains). */
function scheduleClassFor(drugName){
  if(!drugName) return null;
  const n = drugName.toLowerCase();
  for(const key in SCHEDULE_DRUGS){
    if(n.indexOf(key.toLowerCase())!==-1) return SCHEDULE_DRUGS[key];
  }
  return null;
}

/* Helper: generic name for a typed brand (case-insensitive contains). */
function genericFor(drugName){
  if(!drugName) return null;
  const n = drugName.toLowerCase();
  for(const key in BRAND_TO_GENERIC){
    if(n.indexOf(key.toLowerCase())!==-1) return BRAND_TO_GENERIC[key];
  }
  return null;
}

/* Helper: returns a conflict object {type,message} for a drug against a patient,
   or null. type = 'allergy' | 'interaction'. */
function conflictFor(drugName, patient){
  if(!drugName || !patient) return null;
  const n = drugName.toLowerCase();
  for(const key in DRUG_CONFLICTS){
    if(n.indexOf(key.toLowerCase())===-1) continue;
    const c = DRUG_CONFLICTS[key];
    if(c.allergyClass && patient.allergies){
      const hit = patient.allergies.find(a=> a.substance.toLowerCase().indexOf(c.allergyClass.toLowerCase())!==-1);
      if(hit){
        return {type:'allergy', message:'Patient is allergic to '+hit.substance+' \u2014 '+key+' is a '+c.allergyClass+'.'};
      }
    }
    if(c.interactsWith && patient.currentMeds){
      const hit = patient.currentMeds.find(m=> c.interactsWith.some(x=> m.drug.toLowerCase().indexOf(x.toLowerCase())!==-1));
      if(hit){
        return {type:'interaction', message:'May interact with '+hit.drug+' (current medication).'};
      }
    }
  }
  return null;
}

/* Currently-open patient record (set by populateConsultation). */
let currentPatientRecord = null;
function getPatientRecord(uhid){ return MOCK_PATIENTS[uhid] || null; }
