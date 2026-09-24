/* Atomic, shared walk-in rules. All availability values are demo fixtures. */
(function(){
 'use strict';
 const facilities=[{id:'city',name:'City Health Clinic',address:'MG Road, Bengaluru'},{id:'lakeside',name:'Lakeside Hospital',address:'Whitefield, Bengaluru'}];
 const sessions=[{doctor:'priya',facility:'city',capacity:12,hours:'9:00 AM–1:00 PM',open:true},{doctor:'amit',facility:'city',capacity:8,hours:'10:00 AM–2:00 PM',open:true},{doctor:'neha',facility:'city',capacity:0,hours:'9:00 AM–12:00 PM',open:true},{doctor:'sara',facility:'city',capacity:6,hours:'Session closed',open:false},{doctor:'meera',facility:'lakeside',capacity:10,hours:'9:00 AM–1:00 PM',open:true}];
 const roles={patient:'Patient',reception:'Receptionist',admin:'Org Admin',nurse:'Nurse'};
 const active=v=>!['CANCELED','NO_SHOW','COMPLETED'].includes(v.status);
 const name=p=>p.name||[p.first,p.last].filter(Boolean).join(' ');
 function view(db,role,patient){
  if(!roles[role])throw Error('This role cannot access walk-ins.');
  const w=db.workflow,people=new Map();
  for(const r of ['reception','nurse'])for(const p of db.roles[r]?.db?.patients||[])people.set(p.id,{...p,name:name(p)});
  for(const p of Object.values(db.roles.patient?.people||{}))people.set(p.id,{...p,name:name(p)});
  for(const p of Object.values(w.patients))people.set(p.id,{...p,name:name(p)});
  const allowed=Object.values(db.roles.patient?.people||{}).map(p=>p.id);
  if(role==='patient'&&!allowed.includes(patient))throw Error('Choose your own or a linked family profile.');
  const visits=Object.values(w.visits),doctors=db.roles.patient?.doctors||[];
  const rows=visits.filter(v=>v.walkin&&(role!=='patient'||v.patient===patient)).map(v=>({...v,patientName:people.get(v.patient)?.name||v.patient,doctorName:w.doctors[v.doctor]?.name||doctors.find(d=>d.id===v.doctor)?.name||v.doctor,facilityName:facilities.find(f=>f.id===v.facility)?.name,statusLabel:v.status==='COMPLETED'?'Completed':['CANCELED','NO_SHOW'].includes(v.status)?'Cancelled':v.arrived?'Checked in':'Awaiting check-in',ahead:visits.filter(a=>a.id!==v.id&&a.date===v.date&&a.doctor===v.doctor&&a.arrived&&active(a)&&(!v.arrivalAt||a.arrivalAt<v.arrivalAt)).length}));
  return {date:db.demoDate,facilities,people:[...people.values()].filter(p=>role!=='patient'||p.id===patient),sessions:sessions.map(s=>({...s,...doctors.find(d=>d.id===s.doctor),id:s.doctor,facility:s.facility,remaining:Math.max(0,s.capacity-visits.filter(v=>v.walkin&&v.date===db.demoDate&&v.doctor===s.doctor&&v.facility===s.facility&&active(v)).length)})),rows};
 }
 function transact(db,action,input){
  const {role}=input,model=view(db,role,input.patient),w=db.workflow,now=new Date().toISOString();
  if(action==='walkin-create'){
   const session=model.sessions.find(s=>s.id===input.doctor&&s.facility===input.facility);
   if(!session||!session.open)throw Error('Walk-ins are closed for this doctor. Choose another doctor.');
   if(!session.remaining)throw Error('Walk-in capacity is full. Choose another doctor.');
   let p=model.people.find(p=>p.id===input.patient);
   if(input.newPatient){
    if(!['reception','admin'].includes(role))throw Error('Select an existing patient.');
    const n=input.newPatient,nm=String(n.name||'').trim(),dob=String(n.dob||''),phone=String(n.phone||'').trim();
    if(nm.length<2||nm.length>100||!/^\d{4}-\d{2}-\d{2}$/.test(dob)||Number.isNaN(Date.parse(dob))||dob>db.demoDate)throw Error('Enter the patient name and a valid date of birth.');
    if(phone&&!/^\d{10}$/.test(phone))throw Error('Enter a 10-digit phone number or leave it empty.');
    const duplicate=model.people.find(x=>x.name.toLowerCase()===nm.toLowerCase()&&x.dob===dob);
    if(duplicate)throw Error('Patient already exists: '+duplicate.name+' · '+duplicate.id+'. Search and select that record.');
    p={id:'PAT-W-'+crypto.randomUUID().slice(0,8).toUpperCase(),name:nm,first:nm.split(' ')[0],last:nm.split(' ').slice(1).join(' '),dob,phone,gender:'Not recorded'};
   }
   if(!p)throw Error('Search and select a patient first.');
   if(Object.values(w.visits).some(v=>v.walkin&&active(v)&&v.patient===p.id&&v.doctor===session.id&&v.date===db.demoDate&&v.facility===session.facility))throw Error('An active walk-in already exists for this patient and doctor today.');
   const id='WI-'+crypto.randomUUID().slice(0,8).toUpperCase();
   const v={id,patient:p.id,doctor:session.id,facility:session.facility,hospital:session.facility,date:db.demoDate,time:'Walk-in',walkin:true,type:'CONSULTATION',channel:'IN_PERSON',reason:String(input.reason||'').trim().slice(0,500),fee:session.fee,paid:0,status:'SCHEDULED',arrived:false,intake:'Not started',assessment:{},consultation:'Pending',audit:[],createdBy:roles[role],createdAt:now};
   w.patients[p.id]=p;w.doctors[session.id]={...session,id:session.id};w.visits[id]=v;
   v.audit.push({at:now,actor:roles[role],text:'Walk-in registered'});
   if(role!=='patient'&&input.arrived)checkin(db,v,roles[role],now);
   return {id};
  }
  const v=w.visits[input.id];
  if(!v?.walkin||role==='patient'&&v.patient!==input.patient)throw Error('Walk-in not found for this patient.');
  if(!active(v))throw Error('This walk-in is already closed. Refresh the list.');
  if(action==='walkin-checkin'){
   if(role==='patient')throw Error('Reception or clinical staff must confirm arrival.');
   if(v.date!==db.demoDate)throw Error('Check-in is only available on the walk-in date.');
   if(v.arrived)throw Error('Patient is already checked in. Refresh the list.');
   checkin(db,v,roles[role],now);
  }else if(action==='walkin-cancel'){
   if(v.consultation&&v.consultation!=='Pending')throw Error('Clinical work has started; contact the care team.');
   v.status='CANCELED';v.audit.push({at:now,actor:roles[role],text:'Walk-in cancelled'});
  }else throw Error('Unknown walk-in action');
  return {id:v.id};
 }
 function checkin(db,v,actor,now){
  const tokens=Object.values(db.workflow.visits).filter(a=>a.walkin&&a.date===v.date&&a.facility===v.facility).map(a=>a.tokenNumber||0);
  v.tokenNumber=Math.max(0,...tokens)+1;v.token='W'+String(v.tokenNumber).padStart(3,'0');v.arrived=true;v.arrivalAt=now;v.handoff='SENT';v.audit.push({at:now,actor,text:'Arrival confirmed · token '+v.token});
 }
 const api={view,transact};if(typeof module==='object'&&module.exports)module.exports=api;else window.WalkinCore=api;
})();
