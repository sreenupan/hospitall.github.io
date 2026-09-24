/* Shared walk-in presentation; role pages keep their existing navigation. */
(() => {
 'use strict';
 const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const button=(text,action,id='',primary=false)=>`<button type="button" class="wi-button ${primary?'wi-primary':''}" data-wi="${action}" data-id="${esc(id)}">${text}</button>`;
 let options,model,host,dialog,opener,draft,busy=false,request=0,inline=null,embedding=null;
 const surface=()=>inline||dialog;
 const field=(id,label,value='',type='text')=>`<label class="wi-field">${label}<input id="${id}" type="${type}" value="${esc(value)}" ${type==='date'?`max="${model.date}"`:''}></label>`;
 const label=r=>`${r.patientName} · ${r.patient}`;
 async function read(){await DemoStore.flush();const db=await DemoStore.readSaved();return WalkinCore.view(db,options.role,options.patient);}
 async function mount(config){
  options=config;host=document.getElementById(config.summary?'dashboard-walkin':'walkin-panel');const n=++request;if(!host)return;
  host.innerHTML='<p role="status">Loading walk-in appointments…</p>';
  try{const next=await read();if(n!==request||!host?.isConnected)return;model=next;panel();}catch(e){if(n===request&&host?.isConnected)host.innerHTML=`<p role="alert">${esc(e.message)}</p>${button('Retry walk-ins','refresh')}`;}
 }
 function panel(){
  if(options.summary){const active=model.rows.filter(r=>r.date===model.date&&!['Cancelled','Completed'].includes(r.statusLabel));host.innerHTML=active.length?`<section class="card dashboard-today" aria-labelledby="dashboard-today-title"><div class="dashboard-today-head"><h2 id="dashboard-today-title">Today's care</h2><span class="muted">${active.length} active Walk-in${active.length===1?'':'s'} · ${esc(model.date)}</span></div>${active.map(r=>`<div class="dashboard-walkin-row"><div><strong>${esc(r.doctorName)}</strong><p>${esc(r.facilityName)} · Walk-in</p></div><div class="dashboard-walkin-status"><span class="badge ${r.arrived?'badge-blue':'badge-yellow'}">${esc(r.statusLabel)}</span><p>${r.arrived?'Token '+esc(r.token):'Check in at reception on arrival.'}</p></div>${button('View Walk-in','details',r.id)}</div>`).join('')}</section>`:'';return;}

  const scope=options.facility||'',rows=model.rows.filter(r=>(!scope||r.facility===scope)&&(!options.tab||(options.tab==='Upcoming'?!['Cancelled','Completed'].includes(r.statusLabel):options.tab==='Past'?r.statusLabel==='Completed':r.statusLabel==='Cancelled')));
  host.innerHTML=`<div class="wi-heading"><div><h2>Walk-in appointments</h2><p>${model.date} · In person · No reserved time slot</p></div><div class="wi-actions">${button('Refresh walk-ins','refresh')}</div></div><div class="wi-list">${rows.length?rows.slice().reverse().map(r=>`<article class="wi-row"><div><h3>${esc(options.role==='patient'?r.doctorName:label(r))}</h3><p>${esc(options.role==='patient'?r.facilityName:r.doctorName+' · '+r.facilityName)}</p><p><strong>${esc(r.statusLabel)}</strong>${r.arrived?' · Token '+esc(r.token):''} · ${esc(r.date)}</p></div>${button('View walk-in','details',r.id)}</article>`).join(''):'<p>No walk-in appointments in this view.</p>'}</div>`;
 }
 function ensureDialog(){if(dialog)return;dialog=document.createElement('dialog');dialog.className='wi-dialog';dialog.setAttribute('aria-labelledby','wi-title');document.body.append(dialog);dialog.addEventListener('cancel',e=>{if(busy)e.preventDefault();});dialog.addEventListener('close',()=>{if(opener?.isConnected)opener.focus();});dialog.addEventListener('click',handle);}
 function show(title,body,actions=''){
  if(inline){embedding?.onStage?.(title==='Review walk-in'?2:1);inline.innerHTML=`<h2 tabindex="-1">${title}</h2><div id="wi-error" role="alert"></div>${body}<div class="wi-actions wi-inline-actions">${actions}</div>`;inline.querySelector('h2').focus({preventScroll:true});return;}
  ensureDialog();if(!dialog.open)opener=document.activeElement;
  dialog.innerHTML=`<header><h2 id="wi-title">${title}</h2>${button('Close','close')}</header><div class="wi-body"><div id="wi-error" role="alert"></div>${body}</div><footer>${actions}</footer>`;
  if(!dialog.open)dialog.showModal();dialog.querySelector('header button').focus();
 }
 function selected(){return model.people.find(p=>p.id===draft.patient)||draft.newPatient;}
 function doctor(){return model.sessions.find(s=>s.id===draft.doctor&&s.facility===draft.facility);}
 function existingPatientWalkin(){return options.role==='patient'&&model.rows.find(r=>r.patient===draft.patient&&r.doctor===draft.doctor&&r.facility===draft.facility&&r.date===model.date&&!['Cancelled','Completed'].includes(r.statusLabel));}
 function existingPatientNotice(r){
  const d=doctor();
  show('Walk-in today',`<p class="wi-note" role="status"><strong>You already have a Walk-in with ${esc(r.doctorName)} today.</strong><br>View your existing registration for its status and queue details.</p><p><strong>${esc(label(r))}</strong></p><p>${esc(r.doctorName)} · ${esc(r.facilityName)}</p><p>${esc(r.date)} · ${esc(r.id)} · <strong>${esc(r.statusLabel)}</strong>${r.arrived?' · Token '+esc(r.token):''}</p>${d?`<p>${d.remaining} walk-in places remain for other registrations. You do not need to book again.</p>`:''}`,button('View existing Walk-in','existing-patient',r.id,true));
 }
 function newWalkin(){draft={patient:options.patient||'',facility:options.facility||model.facilities[0].id,doctor:'',reason:'',arrived:false,newPatient:null};form();}
 function form(){
  const existing=existingPatientWalkin();if(existing){existingPatientNotice(existing);return;}
  const p=selected();show('Walk-in today',
   `<p class="wi-note">Today: ${model.date} (demo date). Consultation time is not guaranteed. A queue token is assigned after staff confirm arrival.</p>${options.role==='patient'||embedding?.lockPatient?`<p><strong>${esc(p?.name)}</strong> · ${esc(p?.id)}</p>`:`<section><h3>1. Select patient</h3>${p?`<p><strong>${esc(p.name)}</strong> · ${esc(p.id||'New patient — created on confirmation')}</p>${button('Change patient','change-patient')}`:`${field('wi-search','Search patient by name, ID or phone')}<div id="wi-matches"></div>${['reception','admin'].includes(options.role)?button('Register new patient','register'):''}`}</section>`}
   <section><h3>${embedding?.lockDoctor?'Selected doctor and hospital':options.role==='patient'?'Choose hospital and doctor':'2. Choose hospital and doctor'}</h3>${embedding?.lockDoctor?sessionSummary():`<label class="wi-field">Walk-in facility<select id="wi-facility" ${options.facility?'disabled':''}>${model.facilities.filter(f=>!options.facility||f.id===options.facility).map(f=>`<option value="${f.id}" ${f.id===draft.facility?'selected':''}>${esc(f.name)}</option>`).join('')}</select></label><div id="wi-doctors">${doctorChoices()}</div>`}</section>
   ${field('wi-reason','Reason for visit (optional)',draft.reason)}${options.role!=='patient'?`<label class="wi-check"><input id="wi-arrived" type="checkbox" ${draft.arrived?'checked':''}>Patient has arrived at this facility</label><p>Leave unchecked when registering before arrival.</p>`:''}`,
   (embedding?.onCancel?button('Cancel booking','cancel-booking'):'')+button('Review walk-in','review','',true));
  if(embedding?.lockDoctor&&(!doctor()?.open||!doctor()?.remaining))surface().querySelector('[data-wi="review"]').disabled=true;
  surface().querySelector('#wi-search')?.addEventListener('input',e=>matches(e.target.value));
  surface().querySelector('#wi-facility') && (surface().querySelector('#wi-facility').onchange=e=>{capture();draft.facility=e.target.value;draft.doctor='';form();});
 }
 function doctorChoices(){return model.sessions.filter(s=>s.facility===draft.facility).map(s=>`<label class="wi-doctor"><input type="radio" name="wi-doctor" value="${s.id}" ${draft.doctor===s.id?'checked':''} ${!s.open||!s.remaining?'disabled':''}><span><strong>${esc(s.name||s.id)}</strong> · ${esc(s.specialty)}<br>${esc(s.hours)} · ₹${s.fee||0}<br><span>${!s.open?'Walk-ins closed':!s.remaining?'Walk-in capacity full':s.remaining+' walk-in places available'}</span></span></label>`).join('')||'<p>No doctors accept walk-ins at this facility today.</p>';}
 function matches(q){const term=q.trim().toLowerCase();const list=term?model.people.filter(p=>`${p.name} ${p.id} ${p.phone||''}`.toLowerCase().includes(term)).slice(0,8):[];surface().querySelector('#wi-matches').innerHTML=list.map(p=>button(`${esc(p.name)} · ${esc(p.id)} · DOB ${esc(p.dob||'not recorded')}`,'select',p.id)).join('')||(term?'<p>No matching patients.</p>':'');}
 function capture(){if(!draft)return;draft.reason=surface().querySelector('#wi-reason')?.value??draft.reason;draft.arrived=surface().querySelector('#wi-arrived')?.checked??draft.arrived;draft.doctor=surface().querySelector('[name="wi-doctor"]:checked')?.value??draft.doctor;}
 function review(){capture();if(!selected()||!doctor()?.open||!doctor()?.remaining)throw Error('Select a patient and an available doctor before reviewing.');const p=selected(),d=doctor();show('Review walk-in',`<dl><dt>Patient</dt><dd>${esc(p.name)} · ${esc(p.id||'New patient')}</dd><dt>Doctor</dt><dd>${esc(d.name)}</dd><dt>Facility</dt><dd>${esc(model.facilities.find(f=>f.id===draft.facility).name)}</dd><dt>Date / walk-in hours</dt><dd>${model.date} · ${esc(d.hours)}</dd><dt>Consultation fee</dt><dd>₹${d.fee} · Payment at clinic</dd><dt>Arrival</dt><dd>${draft.arrived?'Patient has arrived — assign token':'Awaiting check-in — no token yet'}</dd><dt>Reason</dt><dd>${esc(draft.reason||'Not provided')}</dd></dl><p>Consultation time is not guaranteed. No money is charged by this prototype.</p>`,button('Back to walk-in choices','back')+button('Confirm walk-in','confirm','',true));}
 function details(id,title='Walk-in details'){
  const r=model.rows.find(r=>r.id===id);if(!r)throw Error('This walk-in is no longer available. Refresh the list.');
  const active=!['Cancelled','Completed'].includes(r.statusLabel);
  show(title,`<p><strong>${esc(label(r))}</strong></p><dl><dt>Reference</dt><dd>${esc(r.id)}</dd><dt>Doctor / facility</dt><dd>${esc(r.doctorName)} · ${esc(r.facilityName)}</dd><dt>Date</dt><dd>${esc(r.date)} · Walk-in (no time slot)</dd><dt>Status</dt><dd>${esc(r.statusLabel)}</dd><dt>Queue</dt><dd>${r.arrived?`Token ${esc(r.token)}${active?' · '+r.ahead+' patients ahead · estimated '+(r.ahead*15)+'–'+(r.ahead*15+15)+' minutes (demo estimate)':''}`:'Token assigned after staff confirm arrival'}</dd><dt>Fee / payment</dt><dd>₹${r.fee} · ${r.paid>=r.fee?'Paid':'Payment pending at clinic'}</dd><dt>Created by</dt><dd>${esc(r.createdBy)} · ${esc(r.createdAt)}</dd></dl><p>Consultation order may change. The estimate is not a guaranteed consultation time.</p><details><summary>Walk-in activity</summary>${(r.audit||[]).map(a=>`<p>${esc(a.at)} · ${esc(a.actor||a.detail)} · ${esc(a.text||a.title)}</p>`).join('')}</details>`,
   (active&&!r.arrived&&options.role!=='patient'?button('Confirm patient arrival','arrival',id,true):'')+(active?button('Cancel walk-in','cancel',id):''));
 }
 async function save(action,data,title){
  const current=surface(),complete=embedding?.onSaved;const isEmbedded=!!inline;
  busy=true;current.querySelectorAll('button').forEach(b=>b.disabled=true);
  try{const result=await DemoStore.transaction(action,{...data,role:options.role,patient:options.role==='patient'?options.patient:data.patient});model=await read();await DemoStore.refresh();if(isEmbedded){inline=null;embedding=null;complete?.();}else options.render();details(result.id,title);}
  finally{busy=false;current.querySelectorAll('button').forEach(b=>b.disabled=false);dialog?.querySelectorAll('button').forEach(b=>b.disabled=false);}
 }
 async function handle(event){const b=event.target.closest('[data-wi]');if(!b||busy)return;event.preventDefault();const a=b.dataset.wi,id=b.dataset.id;
  try{
   if(a==='cancel-booking'){embedding?.onCancel();return;}if(a==='close'){dialog.close();return;}
   if(a==='refresh'){await DemoStore.refresh();options.render();return;}
   if(a==='new'){model=await read();newWalkin();return;}
   if(a==='select'){capture();draft.patient=id;draft.newPatient=null;form();return;}
   if(a==='change-patient'){capture();draft.patient='';draft.newPatient=null;form();return;}
   if(a==='back'){form();return;}
   if(a==='register'){capture();show('Register patient for walk-in',`<p>Use fictional details. Name and date of birth distinguish the patient; phone is optional for contact.</p>${field('wi-name','Full name')}${field('wi-dob','Date of birth','','date')}${field('wi-phone','Phone (optional)')}`,button('Back to patient search','back')+button('Use patient details','new-patient','',true));return;}
   if(a==='new-patient'){const name=surface().querySelector('#wi-name').value.trim(),dob=surface().querySelector('#wi-dob').value,phone=surface().querySelector('#wi-phone').value.trim();if(!name||!dob||dob>model.date||phone&&!/^\d{10}$/.test(phone))throw Error('Enter name, a valid date of birth and a 10-digit phone number if supplied.');draft.newPatient={name,dob,phone};draft.patient='';form();return;}
   if(a==='existing-patient'){model=await read();const existing=existingPatientWalkin();if(!existing){form();return;}const complete=embedding?.onSaved;inline=null;embedding=null;complete?.();details(existing.id);return;}
   if(a==='review'||a==='confirm'){
    if(options.role==='patient'){capture();model=await read();const existing=existingPatientWalkin();if(existing){existingPatientNotice(existing);return;}}
    if(a==='review')review();else await save('walkin-create',draft,'Walk-in registered');return;
   }
   if(a==='details'){inline=null;embedding=null;model=await read();details(id);return;}
   if(a==='arrival'){show('Confirm patient arrival',`<p>${esc(label(model.rows.find(r=>r.id===id)))}</p><p>Confirm the patient is physically present at the facility. This assigns a queue token and makes the visit available to nursing staff.</p>`,button('Back to walk-in','details',id)+button('Check in walk-in','checkin',id,true));return;}
   if(a==='checkin'){await save('walkin-checkin',{id},'Walk-in checked in');return;}
   if(a==='cancel'){show('Cancel walk-in?',`<p>${esc(label(model.rows.find(r=>r.id===id)))}</p><p>This releases the walk-in place. No refund is performed automatically.</p>`,button('Keep walk-in','details',id)+button('Confirm walk-in cancellation','cancel-confirm',id));return;}
   if(a==='cancel-confirm')await save('walkin-cancel',{id},'Walk-in cancelled');
  }catch(e){const error=inline?inline.querySelector('#wi-error'):dialog?.open?dialog.querySelector('#wi-error'):host;if(error){error.textContent=e.message;error.setAttribute('tabindex','-1');error.focus();}}
 }

 function sessionSummary(){
  const d=doctor(),f=model.facilities.find(f=>f.id===draft.facility);
  return `<p><strong>${esc(embedding.doctorName||d?.name||draft.doctor)}</strong><br>${esc(f?.name||draft.facility)}</p><p>${d?esc(d.hours)+' · ₹'+d.fee:''}</p><p class="wi-note">${!d||!d.open?'Walk-ins are not available for this doctor today.':!d.remaining?'Walk-in capacity is full for this doctor today.':d.remaining+' walk-in places available today.'}${!d||!d.open||!d.remaining?' Choose Scheduled appointment above to book an available date and time.':''}</p>`;
 }
 // Enhance the existing booking surface without rebuilding the scheduled form.
 function attach(config){
  const nodes=config.nodes.filter(Boolean);if(!nodes.length)return;
  options=config;inline=null;embedding=null;
  const wrap=document.createElement('section');wrap.className='wi-booking-choice';
  wrap.innerHTML='<fieldset class="wi-mode"><legend>Appointment type</legend><label><input type="radio" name="booking-mode" value="scheduled" checked><span><strong>Scheduled appointment</strong><small>Choose a date and time</small></span></label><label><input type="radio" name="booking-mode" value="walkin"><span><strong>Walk-in today</strong><small>In person · no reserved time slot</small></span></label></fieldset><div class="wi-inline" hidden></div>';
  nodes[0].before(wrap);const content=wrap.querySelector('.wi-inline');let previousDraft=null;content.addEventListener('click',handle);content.addEventListener('keydown',e=>{if(e.key==='Enter'&&e.target.matches('input')){e.preventDefault();const review=content.querySelector('[data-wi=review]');if(review&&!review.disabled)review.click();}});
  wrap.addEventListener('change',async event=>{
   if(event.target.name!=='booking-mode')return;
   const walkin=event.target.value==='walkin';
   if(!walkin){config.onStage?.(1);if(inline){capture();previousDraft={...draft};}config.onScheduled?.(previousDraft);inline=null;embedding=null;content.hidden=true;nodes.forEach(n=>n.hidden=false);config.footer&&(config.footer.hidden=false);return;}
   nodes.forEach(n=>n.hidden=true);config.footer&&(config.footer.hidden=true);content.hidden=false;content.innerHTML='<p role="status">Loading today’s availability…</p>';
   try{model=await read();if(!wrap.isConnected||!wrap.querySelector('[value="walkin"]').checked)return;
    embedding=config;inline=content;draft={patient:options.patient||'',facility:options.facility||'city',doctor:'',reason:'',arrived:false,newPatient:null,...previousDraft,...config.context()};form();
   }catch(e){content.innerHTML=`<p role="alert">${esc(e.message)}. Choose Scheduled appointment to return, or switch to Walk-in today to retry.</p>`;}
  });
 }
 document.addEventListener('click',e=>{if(e.target.closest('#walkin-panel,#dashboard-walkin'))handle(e);});
 window.WalkinUI={mount,attach,open:async()=>{model=await read();newWalkin();},slot:()=>'<section id="walkin-panel" class="wi-panel" aria-label="Walk-in appointments"></section>'};
})();
