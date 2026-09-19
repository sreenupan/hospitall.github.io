/* Nurse-only UX expansion. All records and policy labels are mock data. */
window.createNurseExpansion = function (c) {
  const {db,root,dialog,ui,admissions,meds,tasks,e,full,patient,doctor,visit,stamp,btn,badge,head,table,field,select,area,errorsBox,errors,modal,toast,render,go,openAssessment,guarded,editable}=c;
  const escalations=[],handoffs=[],cases=[];
  const now='12:00';
  const clock=s=>{const [h,m]=s.split(':').map(Number);return h*60+m;};
  const queueContext=v=>{
    const waiting=v.arrived&&v.channel==='IN_PERSON'?Math.max(0,clock(now)-clock(v.time))+' min':'Not waiting';
    const risk=v.shared?(v.reason|| (v.arrived?'Checked in':'Awaiting arrival')):v.id==='APT-1042'?'Fever/cough reported':v.id==='APT-1089'?'Follow-up preparation':v.channel==='ONLINE'?'Online visit':'Awaiting arrival';
    const next=editable(v)?v.intake==='Ready'?'Await doctor':'Record assessment':v.channel==='ONLINE'?'Consultation in progress':'Await check-in';
    return {waiting,risk,next};
  };
  const rows=list=>table(['Time / Visit','Patient','Assigned doctor','Arrival / Consultation','Assessment','Waiting / context','Next nursing action','Action'],list.map(v=>{
    const x=queueContext(v);
    return [`${e(v.time)}<br><small>${e(v.id)}</small>`,`<b>${e(full(patient(v.patient)))}</b><br><small>${e(v.patient)}</small>`,e(doctor(v.doctor).name),`${e(v.channel==='ONLINE'?'Online':v.arrived?'Checked in':'Not arrived')}<br><small>${e(v.consultation)}</small>`,badge(v.intake),`${e(x.waiting)}<br><small>${e(x.risk)} · mock context</small>`,e(x.next),btn(editable(v)?v.intake==='Not started'?'Record Vitals':'View Assessment':'View Visit','assessment',v.id,editable(v)?'primary':'ghost')];
  }));
  const appointments=()=>head("Today's Appointments",'Schedule and arrival overview for City Health Clinic.',btn('Book Appointment','book','','primary'))+
    `<section class="card"><p class="muted">Appointments remain clinic-locked. Select a visit to see its patient context.</p>${table(['Time / Visit','Patient','Assigned doctor','Channel','Arrival','Consultation','Action'],db.visits.filter(v=>v.consultation!=='Cancelled').sort((a,b)=>a.time.localeCompare(b.time)).map(v=>[`${e(v.time)}<br><small>${e(v.id)}</small>`,`<b>${e(full(patient(v.patient)))}</b><br><small>${e(v.patient)}</small>`,e(doctor(v.doctor).name),e(v.channel==='ONLINE'?'Online':'In person'),e(v.arrived?'Checked in':'Not arrived'),e(v.consultation),btn(editable(v)&&v.intake==='Not started'?'Record Vitals':'View Visit','assessment',v.id)]))}</section>`;
  const tasksPage=()=>head('Nursing Tasks','Track assigned work for the selected visit.',btn('Create Nursing Task','task-create','','primary'))+
    `<section class="card">${table(['Patient / Visit','Task','Owner / due','Priority','Status','Action'],tasks.map(t=>{
      const v=visit(t.visit);
      return [`<b>${e(full(patient(v.patient)))}</b><br>${e(v.id)}`,e(t.title),`${e(t.owner||'Nurse Anita')}<br><small>${e(t.due||'This shift')}</small>`,e(t.priority||'Routine'),badge(t.done?'Completed':t.deferred?'Deferred':'Pending'),`<div class="actions">${btn('View Assessment','assessment',v.id)}${!t.done?btn('Complete Task','task',t.id,'primary'):e(t.at||'')}${!t.done?btn('Defer Task','task-defer',t.id):''}${!t.done?btn('Escalate Task','task-escalate',t.id):''}</div>`];
    }))}</section>`;
  const contextOptions=()=>[['','Select patient visit or admission'],...db.visits.filter(v=>v.consultation!=='Cancelled').map(v=>[v.id,`${full(patient(v.patient))} · ${v.id}`]),...admissions.map(a=>[a.id,`${a.name} · ${a.id}`])];
  const contextName=id=>id.startsWith('APT-')?`${full(patient(visit(id).patient))} · ${id}`:`${admissions.find(a=>a.id===id)?.name||'Admission'} · ${id}`;
  const escalationsPage=()=>head('Escalations','Nurse-raised concerns and recipient acknowledgement in this mock shift.',btn('Raise Concern','escalation-create','','primary'))+
    `<section class="card">${escalations.length?table(['Patient / context','Concern','Recipient','Status','Action'],escalations.map(x=>[e(contextName(x.context)),e(x.concern),e(x.recipient),badge(x.ack?'Acknowledged':'Awaiting acknowledgement'),x.ack?e(x.ack):btn('Simulate Recipient Acknowledgement','escalation-ack',x.id,'primary')])):'<p class="empty">No concerns raised in this mock shift.</p>'}</section>`;
  const handoffsPage=()=>head('Shift Handoffs','Admission-specific handoff and receiving nurse acknowledgement.',btn('Create Handoff','handoff-create','','primary'))+
    `<section class="card">${handoffs.length?table(['Admission','Risks / pending work','Receiving nurse','Status','Action'],handoffs.map(x=>[e(contextName(x.admission)),`${e(x.risks)}<br><small>${e(x.pending)}</small>`,e(x.recipient),badge(x.ack?'Acknowledged':'Awaiting acknowledgement'),x.ack?e(x.ack):btn('Simulate Receiving Nurse Acknowledgement','handoff-ack',x.id,'primary')])):'<p class="empty">No shift handoffs recorded yet.</p>'}</section>`;
  const triagePage=()=>head('Emergency Triage','Select a patient only when creating a mock triage case.',btn('Create Triage Case','triage-create','','primary'))+
    `<section class="card"><p class="notice">Prototype triage levels are unapproved examples. No automatic triage recommendation or real emergency dispatch occurs.</p>${cases.length?table(['Case','Patient','Presenting concern','Level','Status'],cases.map(x=>[e(x.id),e(full(patient(x.patient))),e(x.concern),e(x.level),badge('Recorded')])):'<p class="empty">No emergency triage cases in this mock shift.</p>'}</section>`;
  function decorate(){
    if(ui.page!=='assessment'||ui.tab!=='assessment')return;
    const v=visit(ui.id),prior={
      'PAT-1042':{at:'03 Aug 2026 · City Health Clinic',temperature:'37.4 °C',pulse:'84 beats/min',spo2:'97%',systolic:'126 mmHg',diastolic:'82 mmHg'},
      'PAT-1089':{at:'01 Aug 2026 · City Health Clinic',temperature:'36.7 °C',pulse:'76 beats/min',spo2:'99%',systolic:'118 mmHg',diastolic:'78 mmHg'}
    }[v.patient];
    const assessmentCard=root.querySelector('.workspace>.card');
    if(assessmentCard){const section=document.createElement('section');section.className='prior-observation';section.innerHTML=`<h2>Previous recorded vitals</h2><p class="muted">${prior?e(prior.at):'No previous measurements in this mock record.'}</p>${prior?`<dl class="prior-grid">${[['Temperature',prior.temperature],['Pulse',prior.pulse],['SpO2',prior.spo2],['Blood pressure',prior.systolic+' / '+prior.diastolic]].map(([k,x])=>`<div><dt>${e(k)}</dt><dd>${e(x)}</dd></div>`).join('')}</dl>`:''}`;assessmentCard.prepend(section);}
    const rail=root.querySelector('.workspace>aside');
    if(rail){const section=document.createElement('section');section.className='card';section.innerHTML=`<h2>Concern escalation</h2><p class="muted">A concern is sent to a named mock recipient and remains open until acknowledged.</p>${btn('Raise Concern','escalation-create',v.id,'primary')}`;rail.append(section);}
  }
  function openEscalation(context=''){
    modal('Raise Concern',errorsBox()+select('escalation-context','Patient visit or admission',contextOptions(),context)+area('escalation-concern','Clinical or operational concern','')+select('escalation-recipient','Recipient',[['','Select recipient'],...db.doctors.filter(d=>!d.unavailable).map(d=>[d.name,d.name]),['Duty doctor','Duty doctor']])+`<p class="muted">Prototype only. No real clinician is notified.</p>`,[{label:'Cancel'},{label:'Record Escalation',style:'primary',run:()=>{
      const id=dialog.querySelector('#escalation-context').value,concern=dialog.querySelector('#escalation-concern').value.trim(),recipient=dialog.querySelector('#escalation-recipient').value;
      const errs=[];if(!id)errs.push(['escalation-context','Select the affected patient context.']);if(!concern)errs.push(['escalation-concern','Describe the concern to escalate.']);if(!recipient)errs.push(['escalation-recipient','Select a recipient.']);if(errors(errs,dialog))return false;
      const record={id:'ESC-'+(escalations.length+1),context:id,concern,recipient,at:stamp(),ack:''};escalations.push(record);
      if(id.startsWith('APT-'))visit(id).audit.push({title:'Concern escalated',detail:`${concern} → ${recipient}`,at:record.at});
      render();toast('Concern recorded for '+contextName(id)+'.');
    }}]);
  }
  function createTask(){modal('Create Nursing Task',errorsBox()+select('task-visit','Patient visit',[['','Select visit'],...db.visits.filter(v=>v.consultation!=='Cancelled').map(v=>[v.id,`${full(patient(v.patient))} · ${v.id}`])])+field('task-title','Task to complete')+select('task-owner','Assigned nurse',['Nurse Anita','Nurse Riya'])+select('task-priority','Priority',['Routine','Soon'])+field('task-due','Due time','12:30','time'),[{label:'Cancel'},{label:'Create Task',style:'primary',run:()=>{
    const id=dialog.querySelector('#task-visit').value,title=dialog.querySelector('#task-title').value.trim(),due=dialog.querySelector('#task-due').value,err=[];
    if(!id)err.push(['task-visit','Select a visit.']);if(!title)err.push(['task-title','Describe the task.']);if(!due)err.push(['task-due','Choose a due time.']);if(errors(err,dialog))return false;
    tasks.push({id:'T'+(tasks.length+1),visit:id,title,owner:dialog.querySelector('#task-owner').value,priority:dialog.querySelector('#task-priority').value,due,done:false});render();toast('Nursing task created for '+contextName(id)+'.');
  }}]);}
  function deferTask(id){const t=tasks.find(x=>x.id===id);modal('Defer Nursing Task',`<p><b>${e(contextName(t.visit))}</b></p><p>${e(t.title)}</p>`+errorsBox()+area('defer-reason','Reason for deferral'),[{label:'Cancel'},{label:'Confirm Deferral',style:'primary',run:()=>{const reason=dialog.querySelector('#defer-reason').value.trim();if(errors(reason?[]:[['defer-reason','Record why the task is deferred.']],dialog))return false;t.deferred=true;t.deferReason=reason;t.at=stamp();render();toast('Task deferred for '+contextName(t.visit)+'.');}}]);}
  function createHandoff(){modal('Create Shift Handoff',errorsBox()+select('handoff-admission','Patient / Admission',[['','Select admission'],...admissions.map(a=>[a.id,`${a.name} · ${a.id} · ${a.bed}`])])+area('handoff-risks','Current risks or watch items')+area('handoff-pending','Pending nursing work')+select('handoff-recipient','Receiving nurse',[['','Select nurse'],['Nurse Riya','Nurse Riya'],['Nurse Anita','Nurse Anita']])+`<p class="muted">Actor and timestamp are recorded automatically. Mock handoff only.</p>`,[{label:'Cancel'},{label:'Record Handoff',style:'primary',run:()=>{
    const admission=dialog.querySelector('#handoff-admission').value,risks=dialog.querySelector('#handoff-risks').value.trim(),pending=dialog.querySelector('#handoff-pending').value.trim(),recipient=dialog.querySelector('#handoff-recipient').value,err=[];
    if(!admission)err.push(['handoff-admission','Select an admission.']);if(!risks&&!pending)err.push(['handoff-risks','Record a risk or pending work.']);if(!recipient)err.push(['handoff-recipient','Select the receiving nurse.']);if(errors(err,dialog))return false;
    handoffs.push({id:'H-'+(handoffs.length+1),admission,risks:risks||'None stated',pending:pending||'None stated',recipient,at:stamp(),ack:''});render();toast('Handoff recorded for '+contextName(admission)+'.');
  }}]);}
  function createTriage(){modal('Create Triage Case',`<p class="notice">Prototype policy only: triage categories require clinical approval. No automatic clinical decision is made.</p>`+errorsBox()+select('triage-patient','Patient',[['','Select patient'],...db.patients.map(p=>[p.id,`${full(p)} · ${p.id}`])])+area('triage-concern','Presenting concern')+select('triage-level','Provisional triage level',[['','Select level'],['Immediate','Immediate'],['Urgent','Urgent'],['Standard','Standard']])+area('triage-note','Additional observations (optional)'),[{label:'Cancel'},{label:'Record Triage Case',style:'primary',run:()=>{
    const pid=dialog.querySelector('#triage-patient').value,concern=dialog.querySelector('#triage-concern').value.trim(),level=dialog.querySelector('#triage-level').value,err=[];
    if(!pid)err.push(['triage-patient','Select a patient.']);if(!concern)err.push(['triage-concern','Record the presenting concern.']);if(!level)err.push(['triage-level','Select a provisional level.']);if(errors(err,dialog))return false;
    cases.push({id:'TRI-'+(cases.length+1),patient:pid,concern,level,note:dialog.querySelector('#triage-note').value.trim(),at:stamp()});render();toast('Mock triage case recorded for '+full(patient(pid))+'.');
  }}]);}
  function book(){modal('Book Appointment',`<p class="notice">Clinic: City Health Clinic · Nurse booking is locked to this organization.</p>`+errorsBox()+select('book-patient','Patient',[['','Select patient'],...db.patients.map(p=>[p.id,`${full(p)} · ${p.id}`])])+select('book-doctor','Doctor',[['','Select doctor'],...db.doctors.filter(d=>!d.unavailable).map(d=>[d.id,`${d.name} · ${d.specialty}`])])+select('book-slot','Available mock slot',[['','Select slot'],['12:30','04 Aug 2026 · 12:30'],['13:00','04 Aug 2026 · 13:00'],['15:00','04 Aug 2026 · 15:00']])+field('book-reason','Visit reason'),[{label:'Cancel'},{label:'Confirm Booking',style:'primary',run:()=>{
    const pid=dialog.querySelector('#book-patient').value,did=dialog.querySelector('#book-doctor').value,time=dialog.querySelector('#book-slot').value,reason=dialog.querySelector('#book-reason').value.trim(),err=[];
    if(!pid)err.push(['book-patient','Select a patient.']);if(!did)err.push(['book-doctor','Select a doctor.']);if(!time)err.push(['book-slot','Select a slot.']);if(!reason)err.push(['book-reason','Record the visit reason.']);if(errors(err,dialog))return false;
    if(db.visits.some(v=>v.doctor===did&&v.time===time&&v.consultation!=='Cancelled'))return !errors([['book-slot','That clinician slot is already booked.']],dialog);
    db.visits.push({id:'APT-'+db.nextVisit++,patient:pid,doctor:did,date:db.date,time,type:'CONSULTATION',channel:'IN_PERSON',reason,status:'SCHEDULED',arrived:false,fee:doctor(did).fee,paid:0,intake:'Not started',assessment:{},audit:[{title:'Appointment booked',detail:'By Nurse Anita · City Health Clinic',at:stamp()}],consultation:'Pending'});render();toast('Appointment booked for '+full(patient(pid))+'.');
  }}]);}
  function handle(action,id){
    if(action==='book'){book();return true;}
    if(action==='task-create'){createTask();return true;}
    if(action==='task-defer'){deferTask(id);return true;}
    if(action==='task-escalate'){openEscalation(tasks.find(t=>t.id===id).visit);return true;}
    if(action==='escalation-create'){guarded(()=>openEscalation(id));return true;}
    if(action==='escalation-ack'){const x=escalations.find(x=>x.id===id);modal('Simulate Recipient Acknowledgement',`<p><b>${e(contextName(x.context))}</b></p><p>${e(x.concern)}</p><p>Mock recipient: ${e(x.recipient)}</p><p class="notice">Simulation only. The Nurse cannot acknowledge on behalf of a doctor in a real workflow.</p>`,[{label:'Cancel'},{label:'Confirm Mock Acknowledgement',style:'primary',run:()=>{x.ack=stamp()+' · simulated '+x.recipient;if(x.context.startsWith('APT-'))visit(x.context).audit.push({title:'Concern acknowledged (simulation)',detail:x.recipient,at:x.ack});render();toast('Mock concern acknowledgement recorded.');}}]);return true;}
    if(action==='handoff-create'){createHandoff();return true;}
    if(action==='handoff-ack'){const x=handoffs.find(x=>x.id===id);modal('Simulate Receiving Nurse Acknowledgement',`<p><b>${e(contextName(x.admission))}</b></p><p>Mock receiving nurse: ${e(x.recipient)}</p><p class="notice">Simulation only. The receiving nurse must acknowledge a real handoff.</p>`,[{label:'Cancel'},{label:'Confirm Mock Acknowledgement',style:'primary',run:()=>{x.ack=stamp()+' · simulated '+x.recipient;render();toast('Mock handoff acknowledgement recorded.');}}]);return true;}
    if(action==='triage-create'){createTriage();return true;}
    return false;
  }
  return {snapshot:()=>({escalations,handoffs,cases}),restore:data=>{for(const [key,target] of Object.entries({escalations,handoffs,cases}))if(data?.[key])DemoStore.replace(target,data[key]);},rows,appointments,tasks:tasksPage,escalations:escalationsPage,handoffs:handoffsPage,triage:triagePage,decorate,bind(){},handle};
};
