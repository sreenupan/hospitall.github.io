/* Shared mock workflow rules for Node and static GitHub Pages. */
(() => {
'use strict';
const crypto = typeof module === 'object' && module.exports ? require('node:crypto') : globalThis.crypto;
const copy = v => v === undefined ? undefined : structuredClone(v);
const same = (a,b) => JSON.stringify(a) === JSON.stringify(b);
const put = (list,item,key='id') => { const i=list.findIndex(x=>String(x[key])===String(item[key])); if(i<0)list.push(copy(item));else list[i]=copy(item); };
const changed = (base,list,key='id') => (list||[]).filter(x=>!same((base||[]).find(y=>String(y[key])===String(x[key])),x));
const bad = message => {const e=new Error(message);e.status=409;throw e;};
function merge(current,base,next,at='record') {
  if(same(base,next))return copy(current);
  if(same(current,base)||same(current,next))return copy(next);
  if(Array.isArray(base)&&Array.isArray(next)&&Array.isArray(current)) {
    const key=['id','visitId','uhid'].find(k=>[...base,...next,...current].every(x=>x&&typeof x==='object'&&x[k]!==undefined)&&[base,next,current].every(a=>new Set(a.map(x=>x[k])).size===a.length));
    if(key){const result=copy(current);for(const item of next){const old=base.find(x=>x[key]===item[key]);if(!same(old,item))put(result,merge(current.find(x=>x[key]===item[key]),old,item,at+'.'+item[key]),key);}for(const old of base.filter(x=>!next.some(y=>y[key]===x[key]))){const i=result.findIndex(x=>x[key]===old[key]);if(i>=0){if(!same(result[i],old))bad('Conflicting edit to '+at);result.splice(i,1);}}return result;}
  }
  if(current&&base&&next&&!Array.isArray(next)&&typeof next==='object'&&typeof base==='object'&&typeof current==='object') {
    const result=copy(current);for(const k of new Set([...Object.keys(base),...Object.keys(next)])){if(['__proto__','constructor','prototype'].includes(k))throw new Error('Invalid key');if(!same(base[k],next[k])){const value=merge(current[k],base[k],next[k],at+'.'+k);if(value===undefined)delete result[k];else result[k]=value;}}return result;
  }
  bad('Another tab changed '+at+'. Reload to use the latest saved data.');
}
function initialize(seed) {
  return {version:1,epoch:crypto.randomUUID(),revision:0,demoDate:seed.demoDate||'2026-08-04',roles:copy(seed.roles||{}),workflow:{patients:{},doctors:{},visits:{},consultations:{},prescriptions:{},requests:{},invoices:{},stock:copy(seed.stock||[]),pharmacy:copy(seed.pharmacy||[])}};
}
function clinicalPatient(p,assessment={}) {
  return {uhid:p.id,name:p.name||[p.first,p.last].filter(Boolean).join(' '),age:p.age||(p.dob?Math.floor((new Date('2026-08-04')-new Date(p.dob))/31557600000):''),gender:p.gender||'Not recorded',bloodGroup:p.blood||'',phone:p.phone||'',allergiesConfirmed:assessment.allergy==='No known allergies',allergies:assessment.allergy==='Known allergies'?[{substance:assessment.allergyDetails||'Recorded allergy',reaction:assessment.allergyDetails||'',severity:'Recorded'}]:[],conditions:[],currentMeds:[],records:[],habits:[],vitals:assessment.systolic?{temp:assessment.temperature?String((Number(assessment.temperature)*9/5+32).toFixed(1)):'',pulse:assessment.pulse||'',bp:assessment.systolic+'/'+assessment.diastolic,spo2:assessment.spo2||'',weight:assessment.weight||'',height:assessment.height||'',bmi:assessment.weight&&assessment.height?String((assessment.weight/(assessment.height/100)**2).toFixed(1)):'',measuredAt:assessment.measured||''}:null};
}
function patientKey(data,id) {return Object.keys(data.people||{}).find(k=>data.people[k].id===id);}
function project(db,role) {
  if(role==='pharmacy'||role==='invoice') return {prescriptions:[...db.workflow.pharmacy,...Object.values(db.workflow.prescriptions)],stock:db.workflow.stock,invoices:db.workflow.invoices};
  const data=copy(db.roles[role]);if(!data)return null;
  const w=db.workflow,visits=Object.values(w.visits);
  if(role==='patient') {
    for(const d of Object.values(w.doctors))if(!data.doctors.some(x=>x.id===d.id))data.doctors.push({...d,hospital:'city',types:['In person','Online'],conditions:d.conditions||[],initials:'DR',qualification:'Mock clinician',experience:'Demo'});
    for(const v of visits){const key=patientKey(data,v.patient);if(!key)continue;const old=data.appointments.find(a=>a.id===v.id)||{};put(data.appointments,{...old,id:v.id,person:key,doctor:v.doctor,date:v.date,time:v.time,type:v.channel==='ONLINE'?'Online':'In person',status:v.status==='COMPLETED'?'Completed':['CANCELED','NO_SHOW'].includes(v.status)?'Cancelled':'Scheduled',payment:v.paid>=v.fee?'Paid':'Pending',reason:v.reason,fee:v.fee,...(v.summary?{summary:v.summary,rx:v.rx}:{}),shared:true});}
    for(const c of Object.values(w.consultations)){const key=patientKey(data,c.uhid);if(!key)continue;const v=w.visits[c.visitId];if(!v)continue;put(data.reports,{id:'DOC-'+c.id,person:key,consultation:v.id,title:'Signed consultation summary',date:v.date,category:'Consultation',source:c.signedBy,body:summary(c)});}
    for(const rx of Object.values(w.prescriptions)){const key=patientKey(data,rx.patientId);if(!key)continue;put(data.prescriptions,{id:rx.id,person:key,date:rx.date,doctor:rx.doctorId,consultation:rx.visitId,body:rx.items.map(m=>`${m.name} ${m.strength||''} — ${m.frequency||''} · ${m.route||''} · ${m.duration||''}${m.instructions?' · '+m.instructions:''}`).join('\n')+'\n'+(rx.instructions||'')});}
    for(const a of db.roles.inpatient?.admissions||[]){const key=patientKey(data,a.patient);if(!key||a.status!=='Discharged')continue;put(data.reports,{id:'DISCHARGE-'+a.id,person:key,title:'Discharge summary · '+a.id,date:db.demoDate,category:'Discharge',source:a.doctor,body:Object.entries(a.summary).map(([k,v])=>k+': '+v).join('\n')});}
  }
  if(role==='reception'||role==='nurse') {
    data.db.date=db.demoDate;
    for(const p of Object.values(w.patients)){const name=(p.name||'').split(' ');put(data.db.patients,{...p,first:p.first||name.shift(),last:p.last||name.join(' '),dob:p.dob||'1992-04-10',gender:p.gender||'MALE'});}
    for(const d of Object.values(w.doctors))put(data.db.doctors,d);
    for(const v of visits){const old=data.db.visits.find(x=>x.id===v.id)||{};put(data.db.visits,{intake:'Not started',assessment:{},audit:[],consultation:'Pending',...old,...v,shared:true});}
    if(role==='nurse'){
      for(const v of data.db.visits){if(v.status==='COMPLETED')v.consultation='Completed';if(['CANCELED','NO_SHOW'].includes(v.status))v.consultation='Cancelled';}
      for(const a of db.roles.inpatient?.admissions||[]){const p=db.roles.inpatient.patients.find(p=>p.id===a.patient);const previous=data.admissions.find(x=>x.id===a.id);put(data.admissions,{id:a.id,patient:a.patient,bed:a.bed,name:p?.name||a.patient,vitals:previous?.vitals||[],notes:previous?.notes||[],shared:true,status:a.status});for(const m of a.meds)put(data.meds,{id:m.id,admission:a.id,time:m.time,drug:m.name,dose:m.dose,route:m.route,state:a.status==='Discharged'?'Closed':m.status,note:m.reason,at:m.recorded,shared:true});}
    }
  }
  if(role==='doctor') {
    for(const v of visits){const p=w.patients[v.patient];if(!p)continue;
      const prior=data.patients[v.patient]||clinicalPatient(p);const mapped=clinicalPatient(p,v.assessment);
      if(v.assessment){prior.vitals=mapped.vitals;prior.allergies=mapped.allergies;prior.allergiesConfirmed=mapped.allergiesConfirmed;}
      data.patients[v.patient]=prior;
      const completed=['COMPLETED','CANCELED','NO_SHOW'].includes(v.status),ready=v.channel==='ONLINE'?v.paid>=v.fee:v.arrived;
      const row={visitId:v.id,uhid:v.patient,name:mapped.name,age:mapped.age,gender:mapped.gender,phone:p.phone||'',date:v.date,time:v.time,type:v.channel==='ONLINE'?'video':'clinic',freq:'Shared visit',freqIcon:'cal',action:completed?'completed':ready?'active':'upcoming',status:completed?'completed':ready?'Ready':'Scheduled',paid:v.paid>=v.fee,paymentMethod:v.paymentMethod||'Mock payment',doctor:w.doctors[v.doctor]?.name||'Doctor',reason:v.reason,shared:true};
      put(data.queue,row,'visitId');put(data.fullQueueData,row,'visitId');
    }
  }
  if(role==='inpatient') {
    data.requests=Object.values(w.requests).filter(r=>!data.admissions.some(a=>a.requestId===r.id||a.patient===r.patient&&a.status==='Active'));
    for(const p of Object.values(w.patients)){const existing=data.patients.find(x=>x.id===p.id);if(!existing){const clinical=clinicalPatient(p);data.patients.push({id:p.id,name:clinical.name,age:clinical.age+'Y · '+clinical.gender,allergy:clinical.allergiesConfirmed?'No known allergies (recorded)':'Not recorded'});}}
    for(const r of data.requests)if(!data.doctors.includes(r.doctor))data.doctors.push(r.doctor);
    importEmergency(data,db.roles.emergency?.state);
  }
  if(role==='emergency')data.occupiedBeds=(db.roles.inpatient?.beds||[]).filter(b=>b.status!=='Available').map(b=>b.id);
  return data;
}
function summary(c){const x=c.clinicalContent;return ['Complaints: '+x.complaints,'History: '+(x.history||''),'Findings: '+(x.findings||''),'Diagnosis: '+(c.diagnosis||''),'Treatment plan: '+x.treatment,'Disposition: '+(c.disposition||''),'Signed by: '+c.signedBy].join('\n');}
function importEmergency(data,state) {
  for(const e of state?.encounters||[]){const d=e.disposition;if(!e.closed||d?.type!=='Admission'||d.status!=='Handover completed'||data.admissions.some(a=>a.id==='IPD-'+e.id))continue;
    const bed=data.beds.find(b=>b.id===d.bed);if(!bed||bed.status!=='Available'||data.admissions.some(a=>a.patient===e.patient.id&&a.status==='Active'))continue;
    if(!data.patients.some(p=>p.id===e.patient.id))data.patients.push({...e.patient});
    data.admissions.push({id:'IPD-'+e.id,patient:e.patient.id,bed:d.bed,doctor:d.doctor,reason:d.reason,date:d.completedAt,status:'Active',emergencySource:e.id,notes:[{at:d.completedAt,actor:d.receiver,kind:'Emergency handover',text:'Complaint: '+e.reason+'\nAssessment: '+e.assessment+'\nImpression: '+e.impression+'\nAllergies: '+e.patient.allergy}],vitals:e.observations.map(o=>({...o,note:o.text})),orders:e.orders.map(o=>({...o,id:'ER-'+o.id,type:'Investigation',detail:[o.result,o.review].filter(Boolean).join('\n'),reviewed:o.status==='Reviewed',status:o.status==='Reviewed'?'Result available':o.status})),meds:e.meds.filter(m=>['Given','Held'].includes(m.status)).map(m=>({...m,id:'ER-'+m.id,frequency:'Emergency event — historical',time:m.at,instruction:m.note||'Historical Emergency event'})),events:[{at:d.completedAt,actor:d.receiver,text:'Received from '+e.id},...e.events],charges:[],payments:[],insurance:null,summary:{diagnosis:'',course:'',treatment:'',advice:'',followup:''},signed:false,handover:false,dischargePlanned:false});bed.status='Occupied';
  }
}
function commit(db,{role,base,data}) {
  if(!['patient','reception','nurse','doctor','inpatient','emergency'].includes(role)||!data||!base)throw new Error('Invalid role snapshot');
  const latest=project(db,role);if(!latest)throw new Error('Missing seeded role');
  const next=merge(latest,base,data,role);const w=db.workflow;
  if(role==='patient') {
    for(const [key,p]of Object.entries(next.people))if(!w.patients[p.id]||!same(base.people[key],data.people[key])){w.patients[p.id]={...w.patients[p.id],...p,first:p.name.split(' ')[0],last:p.name.split(' ').slice(1).join(' ')};}
    for(const d of next.doctors)if(!w.doctors[d.id]||changed(base.doctors,data.doctors).some(x=>x.id===d.id))w.doctors[d.id]=copy(d);
    for(const a of changed(base.appointments,data.appointments)){const p=next.people[a.person];if(!p)throw new Error('Unknown patient');const old=w.visits[a.id]||{};if(old.status==='COMPLETED'&&a.status!=='Completed')bad('Signed consultation cannot be reopened');w.visits[a.id]={...old,id:a.id,patient:p.id,doctor:a.doctor,date:a.date,time:a.time,channel:a.type==='Online'?'ONLINE':'IN_PERSON',type:'CONSULTATION',fee:a.fee,paid:a.payment==='Paid'?a.fee:old.paid||0,status:a.status==='Completed'?'COMPLETED':a.status==='Cancelled'?'CANCELED':'SCHEDULED',reason:a.reason,arrived:old.arrived||false,summary:a.summary||old.summary,rx:a.rx||old.rx};}
  }
  if(role==='reception'||role==='nurse') {
    for(const p of next.db.patients)if(!w.patients[p.id]||changed(base.db.patients,data.db.patients).some(x=>x.id===p.id))w.patients[p.id]={...p,name:[p.first,p.last].join(' ')};
    for(const d of next.db.doctors)if(!w.doctors[d.id]||changed(base.db.doctors,data.db.doctors).some(x=>x.id===d.id))w.doctors[d.id]=copy(d);
    for(const v of changed(base.db.visits,data.db.visits)){
      const old=w.visits[v.id]||{};
      if(old.status==='COMPLETED'&&v.status!=='COMPLETED')bad('Visit has already been completed. Reload.');
      w.visits[v.id]={...old,...copy(next.db.visits.find(x=>x.id===v.id))};
    }
  }
  if(role==='nurse'&&db.roles.inpatient){
    for(const a of changed(base.admissions,data.admissions).filter(a=>a.shared)){
      const ip=db.roles.inpatient.admissions.find(x=>x.id===a.id),old=base.admissions.find(x=>x.id===a.id);if(!ip)continue;if(ip.status==='Discharged')bad('This admission is discharged and read-only.');
      for(const item of a.vitals.slice(old?.vitals.length||0)){const m=item.measurements||{};ip.vitals.unshift({at:item.at,actor:'Ward nurse',bp:m.systolic+'/'+m.diastolic,pulse:m.pulse,spo2:m.spo2,temp:m.temperature,note:item.detail});}
      for(const item of a.notes.slice(old?.notes.length||0))ip.notes.unshift({at:item.at,actor:'Ward nurse',kind:item.title,text:item.detail});
    }
    for(const m of changed(base.meds,data.meds).filter(m=>m.shared)){const ip=db.roles.inpatient.admissions.find(a=>a.id===m.admission),order=ip?.meds.find(x=>x.id===m.id);if(order&&order.status!==m.state){if(ip.status==='Discharged'||order.status!=='Due')bad('Medication outcome already recorded or admission closed.');order.status=m.state;order.reason=m.note;order.recorded=m.at;}}
  }
  if(role==='doctor') {
    for(const rx of changed(base.prescriptions,data.prescriptions))if(rx.status==='Superseded'&&w.prescriptions[rx.id])w.prescriptions[rx.id].status='Superseded';
    for(const c of changed(base.state.completedConsultations,data.state.completedConsultations)){
      if(c.status==='Superseded')continue;
      const v=w.visits[c.visitId],p=next.patients[c.uhid]||{};w.patients[c.uhid]={...w.patients[c.uhid],id:c.uhid,name:p.name,age:p.age,gender:p.gender,phone:p.phone};
      w.consultations[c.id]=copy(c);
      for(const id of c.prescriptionIds){const rx=next.prescriptions.find(r=>r.id===id);if(!rx)continue;const previous=w.prescriptions[id];w.prescriptions[id]={...previous,id,patientId:c.uhid,patientName:p.name,phone:p.phone||'',doctor:c.signedBy,doctorId:v?.doctor||'doctor-demo',visitId:c.visitId,consultationId:c.id,date:v?.date||db.demoDate,diagnosis:c.diagnosis,status:previous?.status||'Pending',instructions:rx.instructions||'',items:rx.medsList.map((m,i)=>({id:id+'-'+i,name:m.drug,strength:m.strength,frequency:m.frequency,route:m.route,duration:m.duration,instructions:m.instructions||'',product:findProduct(w.stock,m.drug,m.strength)?.id||null,quantity:1,quantityKnown:false}))};}
      if(v){v.status='COMPLETED';v.consultation='Completed';v.summary=summary(c);v.rx=c.prescriptionIds[0];}
      if(c.disposition==='Admit to inpatient')w.requests[c.rootConsultationId||c.id]={id:c.rootConsultationId||c.id,patient:c.uhid,name:p.name,doctor:c.signedBy,reason:c.dispositionNote||c.clinicalContent.treatment,consultation:c.id,status:'Requested'};
    }
  }
  if(role==='inpatient') {
    const occupied=new Set();const active=new Set();for(const a of next.admissions.filter(a=>a.status==='Active')){if(occupied.has(a.bed)||active.has(a.patient))bad('Bed or patient already admitted');occupied.add(a.bed);active.add(a.patient);}
    const erBeds=(db.roles.emergency?.state.encounters||[]).filter(e=>!e.closed&&e.disposition?.bed).map(e=>e.disposition.bed);
    for(const a of changed(base.admissions,data.admissions))if(a.status==='Active'&&erBeds.includes(a.bed))bad('Bed reserved for Emergency handover');
  }
  if(role==='emergency')for(const e of changed(base.state.encounters,data.state.encounters)){const bed=e.disposition?.bed;if(bed&&!base.state.encounters.find(x=>x.id===e.id)?.disposition?.bed&&(db.roles.inpatient?.beds||[]).some(b=>b.id===bed&&b.status!=='Available'))bad('Bed no longer available');}
  db.roles[role]=next;
  if(role==='emergency'&&db.roles.inpatient)db.roles.inpatient=project(db,'inpatient');
  return {saved:true};
}
function findProduct(stock,name,strength){const n=name.toLowerCase().replace(/[^a-z]/g,'');return stock.find(p=>(n.includes(p.match)||p.match.includes(n))&&(!strength||p.strength.replace(/\s/g,'').toLowerCase()===strength.replace(/\s/g,'').toLowerCase()));}
function transaction(db,action,input) {
  if(action!=='dispense')throw new Error('Unknown mock action');
  const w=db.workflow,rx=w.prescriptions[input.id]||w.pharmacy.find(r=>r.id===input.id);
  if(!rx||!['Pending','Partial'].includes(rx.status))bad('Prescription unavailable or already dispensed');
  if(!Array.isArray(input.lines)||input.lines.length!==rx.items.length)throw new Error('All prescription lines must be accounted for');
  if(!['Cash','UPI','Card'].includes(input.method))throw new Error('Choose a payment method');
  if(input.method!=='Cash'&&!String(input.reference||'').trim())throw new Error('Enter a mock payment reference');
  const lines=input.lines.map((line,i)=>{
    const item=rx.items[i],product=w.stock.find(p=>p.id===item.product),batch=product?.batches.find(b=>b.id===line.batch);
    if(!batch||batch.expiry<db.demoDate)throw new Error('Choose an available non-expired batch for every medicine');
    const qty=Number(line.qty),discount=Number(line.discount),rate=Number(line.rate);
    if(!Number.isInteger(qty)||qty<=0||qty>batch.stock)throw new Error('Quantity must be a positive whole number within available stock');
    if(!Number.isFinite(rate)||rate<0||!Number.isFinite(discount)||discount<0||discount>100)throw new Error('Invalid price or discount');
    if(product.restricted&&!input.verified)throw new Error('Confirm prescription and patient identity verification');
    const taxable=Math.round(qty*rate*(1-discount/100)*100)/100,tax=Math.round(taxable*product.tax)/100;
    return {name:item.name,strength:item.strength,product:product.id,batch:batch.id,expiry:batch.expiry,qty,rate,discount,taxable,tax,total:Math.round((taxable+tax)*100)/100,restricted:product.restricted};
  });
  const used={};for(const l of lines){const k=l.product+'|'+l.batch;used[k]=(used[k]||0)+l.qty;const b=w.stock.find(p=>p.id===l.product).batches.find(b=>b.id===l.batch);if(used[k]>b.stock)throw new Error('Combined medicine quantities exceed stock');}
  for(const l of lines)w.stock.find(p=>p.id===l.product).batches.find(b=>b.id===l.batch).stock-=l.qty;
  const id='INV-'+crypto.randomUUID().slice(0,8).toUpperCase();const invoice={id,rx:rx.id,patientName:rx.patientName,patientId:rx.patientId,doctor:rx.doctor,phone:rx.phone||'',method:input.method,reference:input.reference||'',date:new Date().toISOString(),lines,total:Math.round(lines.reduce((n,l)=>n+l.total,0)*100)/100,verified:!!input.verified};
  w.invoices[id]=invoice;rx.status='Dispensed';rx.invoice=id;return {invoice};
}
const core={initialize,project,commit,transaction,merge};
if(typeof module === 'object' && module.exports)module.exports=core;
else globalThis.HospitallMockCore=core;
})();
