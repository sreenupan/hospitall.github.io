/* New-role fixtures only. Doctor does not load or share this store. */
window.createRoleMockStore = function () {
  return {
    date: '2026-08-04', clinic: 'City Health Clinic', nextPatient: 1200, nextVisit: 2000, nextReceipt: 500,
    doctors: [{id:'priya',name:'Dr. Priya Sharma',specialty:'General Medicine',fee:500},{id:'amit',name:'Dr. Amit Joshi',specialty:'Cardiology',fee:700},{id:'neha',name:'Dr. Neha Gupta',specialty:'Dermatology',fee:600}],
    patients: [
      {id:'PAT-1042',first:'Ravi',last:'Kumar',phone:'9876543210',gender:'MALE',dob:'1992-04-10',blood:'B+',lastVisit:'2026-08-04'},
      {id:'PAT-1089',first:'Meera',last:'Devi',phone:'9123456789',gender:'FEMALE',dob:'1981-02-16',blood:'A+',lastVisit:'2026-08-01'},
      {id:'PAT-1103',first:'Arjun',last:'Patel',phone:'9988776655',gender:'MALE',dob:'1998-01-12',blood:'O+',lastVisit:'2026-08-04'},
      {id:'PAT-0812',first:'Vikram',last:'Singh',phone:'9876500012',gender:'MALE',dob:'1972-03-11',blood:'',lastVisit:'2026-07-28'},
      {id:'PAT-1120',first:'Lakshmi',last:'Iyer',phone:'9876511120',gender:'FEMALE',dob:'1986-01-03',blood:'',lastVisit:'2026-07-20'},
      {id:'PAT-0823',first:'Ravi',last:'Sharma',phone:'9123400823',gender:'MALE',dob:'1985-06-06',blood:'',lastVisit:'2026-07-19'}
    ],
    visits: [
      {id:'APT-1042',patient:'PAT-1042',doctor:'priya',date:'2026-08-04',time:'09:30',type:'CONSULTATION',channel:'IN_PERSON',reason:'Fever and cough',status:'CONFIRMED',arrived:false,fee:500,paid:500},
      {id:'APT-1089',patient:'PAT-1089',doctor:'priya',date:'2026-08-04',time:'10:00',type:'CONSULTATION',channel:'IN_PERSON',reason:'Follow-up',status:'SCHEDULED',arrived:false,fee:500,paid:0},
      {id:'APT-1103',patient:'PAT-1103',doctor:'priya',date:'2026-08-04',time:'10:30',type:'CONSULTATION',channel:'ONLINE',reason:'Review',status:'CONFIRMED',arrived:false,fee:500,paid:500},
      {id:'APT-0812',patient:'PAT-0812',doctor:'amit',date:'2026-08-04',time:'14:00',type:'CONSULTATION',channel:'IN_PERSON',reason:'Review',status:'CANCELED',arrived:false,fee:700,paid:0,refunded:true},
      {id:'APT-1120',patient:'PAT-1120',doctor:'amit',date:'2026-08-04',time:'11:30',type:'CONSULTATION',channel:'IN_PERSON',reason:'Review',status:'SCHEDULED',arrived:false,fee:700,paid:0}
    ], receipts: []
  };
};
