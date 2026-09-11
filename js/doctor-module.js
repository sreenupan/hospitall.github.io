/* Doctor module worklists — UX prototype mock interactions only.
   This layer never changes the approved consultation screen or its data-entry flow. */
(function(){
  const baseShowPage = window.showPage;
  const topbar=document.querySelector('.topbar');
  if(topbar)new ResizeObserver(()=>document.documentElement.style.setProperty('--doctor-topbar-height',topbar.getBoundingClientRect().height+'px')).observe(topbar);
  const state = {
    queueFilter:'all', queueReadiness:'all', search:'', patientFilter:'all', patientSearch:'',
    results:[
      {id:'R-01',uhid:'HSP24-00123',test:'HbA1c',value:'8.2%',flag:'High',received:'Today, 08:42',status:'new',report:{number:'LAB-2026-004821',laboratory:'CityCare Diagnostics',collected:'05 Sep 2026, 07:50 AM',reported:'05 Sep 2026, 08:42 AM',sections:[{title:'Glycaemic control',items:[['HbA1c','8.2','%','4.0–5.6','High'],['Estimated average glucose','189','mg/dL','—','']]}],impression:'Elevated HbA1c. Interpret with the patient’s clinical context and current treatment plan.'}},
      {id:'R-02',uhid:'HSP24-00125',test:'Chest X-ray',value:'Mild hyperinflation',flag:'Review',received:'Today, 09:05',status:'new',report:{number:'RAD-2026-001946',laboratory:'CityCare Radiology',collected:'05 Sep 2026, 08:20 AM',reported:'05 Sep 2026, 09:05 AM',sections:[{title:'Radiology report',items:[['Examination','Chest X-ray PA view','','',''],['Findings','Mild hyperinflation. No focal consolidation or pleural effusion.','','',''],['Impression','Mild hyperinflation. Correlate clinically.','','','Review']]}],impression:'Radiologist report available for clinical correlation.'}},
      {id:'R-03',uhid:'HSP24-00124',test:'TSH',value:'3.1 mIU/L',flag:'Normal',received:'Yesterday',status:'new',report:{number:'LAB-2026-004790',laboratory:'CityCare Diagnostics',collected:'04 Sep 2026, 09:10 AM',reported:'04 Sep 2026, 04:20 PM',sections:[{title:'Thyroid function',items:[['TSH','3.1','mIU/L','0.4–4.0','Normal']]}],impression:'Result is within the supplied reference interval.'}}
    ],
    followups:[
      {id:'F-01',uhid:'HSP24-00123',reason:'Review HbA1c and diabetic control',due:'Today',priority:'Due today',status:'open',appointment:{status:'Not booked'}},
      {id:'F-02',uhid:'HSP24-00125',reason:'COPD inhaler technique review',due:'06 Sep 2026',priority:'Upcoming',status:'open',appointment:{status:'Booked',date:'06 Sep 2026',time:'10:30 AM',mode:'In clinic',bookedBy:'Reception'}},
      {id:'F-03',uhid:'HSP24-00126',reason:'First-visit clinical review',due:'10 Sep 2026',priority:'Upcoming',status:'open',appointment:{status:'Not booked'}}
    ],
    referrals:[
      {id:'RF-01',uhid:'HSP24-00125',to:'Pulmonology',reason:'COPD review',status:'Awaiting response'},
      {id:'RF-02',uhid:'HSP24-00123',to:'Diabetology',reason:'HbA1c review',status:'Awaiting response'}
    ],
    availability:{Mon:true,Tue:true,Wed:true,Thu:true,Fri:true,Sat:true,Sun:false},
    bookingPreferences:{duration:'15',advance:'30',clinic:true,video:true,audio:true},
    activeResultId:null, reportPage:1, reportZoom:100, resultDrafts:{}, consultationDrafts:{}, currentPage:'dashboard', profileOrigin:null, inboxView:'needs', availabilityDirty:false, lastCompletedId:null,
    consultationView:'consultations', consultationQuery:'', consultationSort:'newest', activeAmendment:null,
    completedConsultations:[
      {id:'CON-2026-000177',uhid:'HSP24-00123',date:'18 Mar 2026',type:'In clinic',reason:'Hypertension review',diagnosis:'Hypertension',status:'Signed',version:1,summary:'Blood-pressure review with medication plan.',prescriptionIds:[-3],clinicalContent:{complaints:'Routine blood-pressure review.',history:'Hypertension on regular treatment.',findings:'BP within the recorded treatment range.',diagnosis:'Hypertension',treatment:'Continue current antihypertensive treatment.',medications:[]}},
      {id:'CON-2026-000178',uhid:'HSP24-00123',date:'02 May 2026',type:'Video',reason:'Diabetes follow-up',diagnosis:'Type 2 diabetes',status:'Signed',version:1,summary:'Diabetes follow-up and counselling.',prescriptionIds:[-2],clinicalContent:{complaints:'Diabetes follow-up by video.',history:'Type 2 diabetes under ongoing review.',findings:'Home glucose readings discussed.',diagnosis:'Type 2 diabetes',treatment:'Continue diabetic diet and medicine plan.',medications:[]}},
      {id:'CON-2026-000179',uhid:'HSP24-00123',date:'12 Jun 2026',type:'In clinic',reason:'Chest tightness review',diagnosis:'Hypertension review',status:'Signed',version:1,summary:'Clinical review, treatment advice, and follow-up planning.',prescriptionIds:[-1],clinicalContent:{complaints:'Chest tightness on exertion reviewed.',history:'Hypertension and diabetes history noted.',findings:'Cardiac evaluation advised.',diagnosis:'Hypertension review',treatment:'Continue medicine plan and arrange follow-up.',medications:[]}},
      {id:'CON-2026-000180',uhid:'HSP24-00125',date:'20 Aug 2026',type:'In clinic',reason:'Breathlessness review',diagnosis:'COPD review',status:'Signed',version:1,summary:'Clinical review with inhaler technique assessment.',prescriptionIds:[],clinicalContent:{complaints:'Breathlessness follow-up.',history:'COPD on inhaler treatment.',findings:'Inhaler technique reviewed.',diagnosis:'COPD review',treatment:'Continue inhaler plan and reinforce technique.',medications:[]}}
    ]
  };
  const moduleNames = ['doctorQueue','doctorPatients','doctorProfile','doctorInbox','doctorResult','doctorFollowups','doctorAvailability','doctorConsultations'];
  const todayQueue = () => typeof queue !== 'undefined' ? queue : [];
  const known = () => typeof getKnownPatients==='function' ? getKnownPatients() : todayQueue();
  const patient = uhid => known().find(p=>p.uhid===uhid) || todayQueue().find(p=>p.uhid===uhid);
  const esc = s => String(s || '').replace(/[&<>'"]/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
  const byUhid = u => { const p=patient(u)||{}; return p; };
  const visitRows = () => todayQueue().filter(p=>p.date===todayISO()&&p.action!=='completed'&&p.status!=='completed').map(p=>Object.assign({status:p.action==='upcoming'?'Scheduled':'Ready'},p));
  const visitReason = uhid => ({'HSP24-00123':'Chest tightness on exertion','HSP24-00124':'Thyroid follow-up','HSP24-00125':'Breathlessness review','HSP24-00126':'First clinical review','HSP24-00127':'Quarterly follow-up'}[uhid] || 'Clinical consultation');
  const clinical = uhid => (typeof MOCK_PATIENTS!=='undefined' && MOCK_PATIENTS[uhid]) || {};
  const hasVitals = record => !!(record && record.vitals && record.vitals.bp);
  const allergyState = record => {
    if((record.allergies||[]).length) return {label:'Drug allergy recorded',kind:'alert'};
    if(record.allergiesConfirmed) return {label:'No known drug allergies',kind:'ready'};
    return {label:'Allergy status not recorded',kind:'waiting'};
  };
  const readiness = (visit,record) => visit.action==='upcoming' ? {label:'Scheduled',kind:'waiting'} : hasVitals(record) ? {label:'Vitals ready',kind:'ready'} : {label:'Vitals pending',kind:'alert'};
  const nextVisit = uhid => todayQueue().filter(v=>v.uhid===uhid&&v.status!=='completed'&&v.date>=todayISO()).sort((a,b)=>a.date.localeCompare(b.date))[0] || null;
  const latestActivity = record => (record.records||[]).slice().sort((a,b)=>dateTime(b.date)-dateTime(a.date))[0] || null;
  const hasRecentActivity = record => {const latest=latestActivity(record);return !!latest&&dateTime(latest.date)>=dateTime('01 Jan 2026');};
  const patientFlags = (p,record) => {
    const flags=[];
    (record.conditions||[]).slice(0,2).forEach(c=>flags.push(c.name));
    if(state.followups.some(f=>f.uhid===p.uhid&&f.status==='open'&&f.priority==='Due today')) flags.push('Follow-up due');
    return flags;
  };

  function activate(page){
    ['navDashboard','navReception','navPatients','navPrescriptions','navReports','navSettings','navAvailability'].forEach(id=>{const el=document.getElementById(id);if(el)el.classList.remove('active');});
    const map={dashboard:'navDashboard',doctorQueue:'navReception',doctorPatients:'navPatients',doctorProfile:'navPatients',doctorInbox:'navReports',doctorResult:'navReports',doctorFollowups:'navSettings',doctorAvailability:'navAvailability',doctorConsultations:'navPrescriptions'};
    const el=document.getElementById(map[page]); if(el)el.classList.add('active');
  }
  function hideBase(){
    ['dashboard','consultation','queue','reception','adminOverview','patients','prescriptions','reports','settings'].forEach(n=>{const el=document.getElementById('page-'+n);if(el)el.style.display='none';});
    const module=document.getElementById('page-doctorModule'); if(module)module.style.display='';
  }
  function doctorDashboard(){
    ['consultation','queue','reception','adminOverview','patients','prescriptions','reports','settings'].forEach(n=>{const el=document.getElementById('page-'+n);if(el)el.style.display='none';});
    const module=document.getElementById('page-doctorModule');if(module)module.style.display='none';
    const root=document.getElementById('page-dashboard'); root.style.display='block'; root.className='content-wrap doctor-dashboard';
    const rows=visitRows(); const openResults=state.results.filter(r=>r.status==='new'); const recentRx=typeof prescriptionsList!=='undefined'?prescriptionsList.slice(0,3):[]; const readyVisits=rows.filter(p=>readiness(p,clinical(p.uhid)).kind==='ready').length; const pendingVitals=rows.filter(p=>readiness(p,clinical(p.uhid)).label==='Vitals pending').length; const dueFollowups=state.followups.filter(f=>f.status==='open'&&f.priority==='Due today').length; const abnormalResults=openResults.filter(r=>r.flag!=='Normal').length;
    root.innerHTML=`<div class="dd-head"><div><h1>Dashboard</h1><div class="dd-sub">${new Date().toLocaleDateString('en-GB',{weekday:'long',day:'2-digit',month:'long',year:'numeric'})} · Your clinical workday at a glance</div></div><div class="dd-spacer"></div><button class="dw-btn primary" onclick="doctorModule.schedule()">Schedule appointment</button></div>
      <div class="dd-stat-grid dd-stat-grid-priority"><div class="dd-stat"><div class="dd-stat-num">${rows.length}</div><div class="dd-stat-label">Today's appointments</div></div><div class="dd-stat ready"><div class="dd-stat-num">${readyVisits}</div><div class="dd-stat-label">Ready to consult</div></div><div class="dd-stat waiting"><div class="dd-stat-num">${pendingVitals}</div><div class="dd-stat-label">Vitals pending</div></div><div class="dd-stat alert"><div class="dd-stat-num">${openResults.length}</div><div class="dd-stat-label">Results need review</div></div><div class="dd-stat alert"><div class="dd-stat-num">${dueFollowups}</div><div class="dd-stat-label">Follow-ups due today</div></div></div>
      <div class="dd-main-grid"><div class="dd-card"><div class="dd-card-head"><h2>Upcoming appointments</h2><button class="dw-link" onclick="showPage('doctorQueue')">Open today’s queue</button></div><table class="dd-queue"><thead><tr><th>Time</th><th>Patient</th><th>Clinical context</th><th>Vitals</th><th>Readiness</th><th>Action</th></tr></thead><tbody>${rows.map(p=>{const c=clinical(p.uhid),allergy=allergyState(c),visitReadiness=readiness(p,c),visitLabel=p.freq==='First Visit'?'First visit':p.type==='clinic'?'In clinic':p.type==='video'?'Video':p.type==='audio'?'Audio':'Visit';return `<tr><td class="dd-time">${esc(p.time)}</td><td><div class="dd-person">${esc(p.name)}</div><div class="dd-mini">${esc(p.uhid)} · ${p.age}Y · ${esc(p.gender||'')}</div></td><td><div>${esc(visitReason(p.uhid))}</div><div class="dd-mini"><span class="dd-visit">${visitLabel}</span>${allergy.kind==='alert'?' · <span class="dd-safety">Drug allergy</span>':''}</div></td><td><div>${hasVitals(c)?'BP '+esc(c.vitals.bp):'Not recorded'}</div><div class="dd-mini">${hasVitals(c)?'P '+esc(c.vitals.pulse)+' · SpO₂ '+esc(c.vitals.spo2)+'%':'Record vitals before consultation'}</div></td><td><span class="dw-chip ${visitReadiness.kind}">${visitReadiness.label}</span></td><td>${p.action==='upcoming'?'<button class="dw-link" onclick="doctorModule.record(\''+p.uhid+'\')">View record</button>':`<button class="dw-btn primary" onclick="doctorModule.start('${p.visitId}','${p.type}')">${p.type==='video'?'Join Video':p.type==='audio'?'Join Audio':'Start Consultation'}</button>`}</td></tr>`;}).join('')}</tbody></table></div>
      <aside class="dd-card"><div class="dd-card-head"><h2>Clinical priorities</h2><button class="dw-link" onclick="showPage('doctorInbox')">Open inbox</button></div><div class="dd-side-row"><div class="dd-side-title">${openResults.length} results need review</div><div class="dd-side-copy">${abnormalResults} abnormal · ${openResults.length-abnormalResults} routine result${openResults.length===1?'':'s'} awaiting a clinical decision.</div></div><div class="dd-side-row"><div class="dd-side-title">${dueFollowups} follow-up due today</div><div class="dd-side-copy">Review HbA1c and diabetic control for Rahul Sharma.</div><button class="dw-link" onclick="showPage('doctorFollowups')">View follow-ups</button></div><div class="dd-side-row"><div class="dd-side-title">${state.referrals.length} referrals awaiting response</div><div class="dd-side-copy">Keep referrals visible until accepted or actioned.</div><button class="dw-link" onclick="showPage('doctorInbox')">View referrals</button></div></aside></div>
      <div class="dd-bottom-grid"><section class="dd-card"><div class="dd-card-head"><h2>Pending lab results</h2><button class="dw-link" onclick="showPage('doctorInbox')">Review all</button></div>${openResults.map(r=>{const p=byUhid(r.uhid);return `<div class="dd-item"><div class="dd-item-copy"><div class="dd-item-title">${esc(r.test)} · ${esc(p.name)}</div><div class="dd-item-sub">${esc(r.value)} · received ${esc(r.received)}</div></div><span class="dd-state ${r.flag==='Normal'?'':'urgent'}">${esc(r.flag)}</span></div>`}).join('')||'<div class="dw-empty">No pending results.</div>'}</section><section class="dd-card"><div class="dd-card-head"><h2>Recent prescriptions</h2><button class="dw-link" onclick="showPage('prescriptions')">View all</button></div>${recentRx.length?recentRx.map(r=>`<div class="dd-item"><div class="dd-item-copy"><button class="dw-link dd-item-title" onclick="doctorModule.rxDetail('${r.id}')">${esc(rxId(r))} · ${esc(r.patientName)}</button><div class="dd-item-sub">${esc(r.date||'Today')} · ${esc(r.status||'Signed')}</div></div><button class="dw-link" onclick="doctorModule.rxDetail('${r.id}')">View prescription</button></div>`).join(''):'<div class="dw-empty">No recent prescriptions.</div>'}</section></div>`;
    root.querySelector('.dd-bottom-grid section:first-child h2').textContent='Results awaiting review';
    root.querySelectorAll('.dd-bottom-grid section:first-child .dd-item').forEach((row,index)=>{const title=row.querySelector('.dd-item-title');if(!title||!openResults[index])return;const button=document.createElement('button');button.className='dw-link dd-item-title';button.textContent=title.textContent;button.onclick=()=>doctorModule.openResult(openResults[index].id);title.replaceWith(button);});
    const prescriptionsAll=root.querySelector('.dd-bottom-grid section:last-child .dd-card-head button');if(prescriptionsAll)prescriptionsAll.onclick=()=>doctorModule.openPrescriptions();
    // Summary cards are shortcuts to an actionable worklist, never decorative totals.
    root.querySelectorAll('.dd-stat').forEach((card,index)=>{card.tabIndex=0;card.setAttribute('role','button');card.setAttribute('aria-label',['Today’s appointments','Ready to consult','Vitals pending','Results awaiting review','Follow-ups due today'][index]);const go=()=>doctorModule.openDashboardMetric(index);card.onclick=go;card.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();go();}};});
    activate('dashboard'); window.scrollTo(0,0);
  }
  window.showPage = function(name){
    state.currentDetail=null;
    if(!moduleNames.includes(name)){
      if(name==='queue') name='doctorQueue';
      else if(name==='patients') name='doctorPatients';
      else if(name==='prescriptions') name='doctorConsultations';
      else if(name==='reports') name='doctorInbox';
      else if(name==='settings') name='doctorAvailability';
      else if(name==='reception') name='doctorQueue';
    }
    if(name==='dashboard'){state.currentPage='dashboard';doctorDashboard();return;}
    if(moduleNames.includes(name)){ state.currentPage=name;hideBase(); activate(name); render(name); window.scrollTo(0,0); return; }
    const module=document.getElementById('page-doctorModule');if(module)module.style.display='none';
    state.currentPage=name; baseShowPage(name); activate(name);
  };

  function layout(title,sub,actions,body){
    document.getElementById('doctorModuleContent').innerHTML=`<div class="dw-header"><div><div class="dw-title">${title}</div><div class="dw-sub">${sub}</div></div><div class="dw-spacer"></div><div class="dw-actions">${actions||''}</div></div>${body}`;
  }
  function resetCompletionCopy(){
    const title=document.querySelector('#completeOverlay .complete-title'),sub=document.querySelector('#completeOverlay .complete-sub');
    if(title)title.textContent='Consultation Completed Successfully!';
    if(sub)sub.textContent='The consultation has been marked as completed. All details have been saved to the patient record.';
  }
  function queuePage(){
    const rows=visitRows().filter(p=>{
      const query=state.search.toLowerCase(); const match=!query||p.name.toLowerCase().includes(query)||p.uhid.toLowerCase().includes(query);
      const readinessMatch=state.queueReadiness==='all'||readiness(p,clinical(p.uhid)).kind===state.queueReadiness;
      return match && readinessMatch && (state.queueFilter==='all'||p.type===state.queueFilter);
    });
    layout("Today's Queue",'Choose a visit to review the record or begin the approved consultation.','<button class="dw-btn" onclick="doctorModule.schedule()">Schedule appointment</button>',`
      <div class="dw-toolbar"><input class="dw-search" value="${esc(state.search)}" oninput="doctorModule.search(this.value)" placeholder="Search name or UHID"><button class="dw-filter ${state.queueFilter==='all'&&state.queueReadiness==='all'?'active':''}" onclick="doctorModule.filter('all')">All</button><button class="dw-filter ${state.queueFilter==='clinic'?'active':''}" onclick="doctorModule.filter('clinic')">In clinic</button><button class="dw-filter ${state.queueFilter==='video'?'active':''}" onclick="doctorModule.filter('video')">Video</button><button class="dw-filter ${state.queueFilter==='audio'?'active':''}" onclick="doctorModule.filter('audio')">Audio</button><button class="dw-filter ${state.queueReadiness==='alert'?'active':''}" onclick="doctorModule.readinessFilter('alert')">Vitals pending</button></div>
      <div class="dw-table-wrap"><table class="dw-table"><thead><tr><th>Time</th><th>Patient</th><th>Reason / alert</th><th>Visit</th><th>Latest vitals</th><th>Readiness</th><th>Action</th></tr></thead><tbody>${rows.map(p=>{const c=clinical(p.uhid),hasAlert=(c.allergies||[]).length>0,visitReadiness=readiness(p,c);return `<tr onclick="doctorModule.record('${p.uhid}')"><td><b>${esc(p.time)}</b></td><td><div class="dw-person">${esc(p.name)}</div><div class="dw-muted">${esc(p.uhid)} · ${p.age}Y · ${esc(p.gender)}</div></td><td><div>${esc(visitReason(p.uhid))}</div>${hasAlert?'<div class="dw-muted" style="color:#b91c1c">Drug allergy recorded</div>':'<div class="dw-muted">No alert recorded</div>'}</td><td><span class="dw-chip">${p.type==='clinic'?'In clinic':esc(p.type)}</span><div class="dw-muted">${esc(p.freq||'')}</div></td><td><div>${hasVitals(c)?'BP '+esc(c.vitals.bp)+' · P '+esc(c.vitals.pulse):'Not recorded'}</div><div class="dw-muted">${hasVitals(c)?'SpO₂ '+esc(c.vitals.spo2)+'%':'Record vitals before consultation'}</div></td><td><span class="dw-chip ${visitReadiness.kind}">${visitReadiness.label}</span></td><td>${p.action==='upcoming'?`<button class="dw-link" onclick="event.stopPropagation();doctorModule.record('${p.uhid}')">View record</button>`:`<button class="dw-btn primary" onclick="event.stopPropagation();doctorModule.start('${p.visitId}','${p.type}')">${p.type==='video'?'Join Video':p.type==='audio'?'Join Audio':'Start Consultation'}</button>`}</td></tr>`;}).join('')||'<tr><td colspan="7" class="dw-empty">No visits match this filter.</td></tr>'}</tbody></table></div>`);
    document.querySelectorAll('#doctorModuleContent .dw-table tbody tr').forEach((row,index)=>{
      const visit=rows[index];if(!visit)return;
      row.removeAttribute('onclick');row.onclick=null;row.style.cursor='default';
      const name=row.querySelector('.dw-person');if(name){const link=document.createElement('button');link.className='dw-link dw-person';link.textContent=name.textContent;link.onclick=()=>doctorModule.record(visit.uhid);name.replaceWith(link);}
    });
  }
  function patientsPage(){
    layout('My Patients','Find a patient record and review only the clinical context needed to select it safely.','<button class="dw-btn" onclick="doctorModule.schedule()">Schedule appointment</button>',`<div class="dw-toolbar dw-directory-toolbar"><input class="dw-search" value="${esc(state.patientSearch)}" oninput="doctorModule.patientSearch(this.value)" placeholder="Search name, UHID, or phone" aria-label="Search patients"><button class="dw-filter ${state.patientFilter==='all'?'active':''}" onclick="doctorModule.patientFilter('all')">All patients</button><button class="dw-filter ${state.patientFilter==='recent'?'active':''}" onclick="doctorModule.patientFilter('recent')">Recent</button><button class="dw-filter ${state.patientFilter==='upcoming'?'active':''}" onclick="doctorModule.patientFilter('upcoming')">Upcoming visit</button><button class="dw-filter ${state.patientFilter==='safety'?'active':''}" onclick="doctorModule.patientFilter('safety')">Safety alert</button><button class="dw-filter ${state.patientFilter==='followup'?'active':''}" onclick="doctorModule.patientFilter('followup')">Follow-up due</button></div><div class="dw-directory-meta" id="doctorPatientCount"></div><div id="doctorPatientList" class="dw-table-wrap"></div>`);
    renderPatientList();
  }
  function filteredPatients(){
    const query=state.patientSearch.toLowerCase();
    return known().filter(p=>{
      const c=clinical(p.uhid), allergy=allergyState(c), visit=nextVisit(p.uhid), due=state.followups.some(f=>f.uhid===p.uhid&&f.status==='open'&&f.priority==='Due today');
      const match=!query||[p.name,p.uhid,p.phone].some(x=>String(x||'').toLowerCase().includes(query));
      const byFilter=state.patientFilter==='all'||(state.patientFilter==='recent'&&hasRecentActivity(c))||(state.patientFilter==='upcoming'&&!!visit)||(state.patientFilter==='safety'&&allergy.kind==='alert')||(state.patientFilter==='followup'&&due);
      return match&&byFilter;
    });
  }
  function renderPatientList(){
    const records=filteredPatients();
    const target=document.getElementById('doctorPatientList'); if(!target)return;
    const count=document.getElementById('doctorPatientCount'); if(count)count.textContent=`Showing ${records.length} of ${known().length} patients`;
    target.innerHTML=records.length?`<table class="dw-table dw-patient-table"><thead><tr><th>Patient</th><th>Clinical flags</th><th>Last clinical activity</th><th>Next visit</th><th>Safety status</th></tr></thead><tbody>${records.map(p=>{const c=clinical(p.uhid),allergy=allergyState(c),visit=nextVisit(p.uhid),flags=patientFlags(p,c),last=latestActivity(c);return `<tr><td><button class="dw-link dw-person" onclick="doctorModule.record('${p.uhid}')">${esc(p.name)}</button><div class="dw-muted">${esc(p.uhid)} · ${p.age||'—'}Y · ${esc(p.gender||'')}</div></td><td>${flags.length?flags.map(flag=>`<span class="dw-chip ${flag==='Follow-up due'?'alert':''}">${esc(flag)}</span>`).join(' '):'<span class="dw-muted">No active flags</span>'}</td><td>${last?`<div>${esc(last.name)}</div><div class="dw-muted">${esc(last.date)}</div>`:'<span class="dw-muted">No clinical activity recorded</span>'}</td><td>${visit?`<div>${visit.date===todayISO()?'Today':esc(visit.date)} · ${esc(visit.time)} · ${visit.type==='clinic'?'In clinic':esc(visit.type)}</div><div class="dw-muted">${esc(visit.freq||'Scheduled')}</div>`:'<span class="dw-muted">No visit scheduled</span>'}</td><td><span class="dw-chip ${allergy.kind}">${esc(allergy.label)}</span></td></tr>`;}).join('')}</tbody></table>`:'<div class="dw-empty">No patient records match the selected filters.</div>';
    target.querySelectorAll('tbody tr').forEach((row,index)=>{const visit=nextVisit(records[index]?.uhid);if(!visit)return;const cell=row.cells[3],line=cell?.querySelector('div');if(line&&!line.textContent.startsWith('Today'))line.textContent=`Today · ${line.textContent}`;});
  }
  const patientRecordTabs = new Map();
  function patientProfilePage(){
    const p=state.profileUhid ? byUhid(state.profileUhid) : null;
    if(!p){showPage('doctorPatients');return;}
    const c=clinical(p.uhid), active=todayQueue().find(v=>v.uhid===p.uhid && v.action!=='upcoming');
    const allergies=(c.allergies||[]), meds=(c.currentMeds||[]), conditions=(c.conditions||[]), vitals=c.vitals||{};
    layout('Patient record','Read the patient’s longitudinal context before starting a new visit.',`<button class="dw-btn" onclick="showPage('doctorPatients')">Back to My Patients</button>${active?`<button class="dw-btn primary" onclick="doctorModule.start('${p.uhid}','${active.type}')">${active.type==='video'?'Join Video':active.type==='audio'?'Join Audio':'Start Consultation'}</button>`:''}`,`
      <div class="dp-summary"><div class="dp-hero"><div class="dp-name">${esc(p.name)}</div><div class="dp-meta">${esc(p.uhid)} · ${p.age||'—'}Y · ${esc(p.gender||'')} · ${esc(p.phone||'')}</div><div class="dp-meta">ABHA: ${esc(c.abhaId||'Not linked')} · Blood group: ${esc(c.bloodGroup||'Not recorded')}</div></div><div class="dp-hero"><div class="dp-label">Allergy status</div>${allergies.length?allergies.map(a=>`<div class="dp-pill alert">${esc(a.substance)} · ${esc(a.severity)}</div>`).join(''):`<div class="dp-value">${c.allergiesConfirmed?'No known drug allergies confirmed':'Not recorded'}</div>`}</div><div class="dp-hero"><div class="dp-label">Latest vitals</div><div class="dp-value">BP ${esc(vitals.bp||'—')} · Pulse ${esc(vitals.pulse||'—')}</div><div class="dp-meta">SpO₂ ${esc(vitals.spo2||'—')}% · ${esc(vitals.measuredAt||'Not recorded')}</div></div></div>
      <div class="dp-grid"><section class="dp-card"><h2>Active conditions</h2><div class="dp-list">${conditions.length?conditions.map(x=>`<span class="dp-pill">${esc(x.name)} · ${esc(x.since)}</span>`).join(''):'<div class="dw-muted">No conditions recorded.</div>'}</div></section><section class="dp-card"><h2>Current medications</h2><div class="dp-list">${meds.length?meds.map(x=>`<div><div class="dp-value">${esc(x.drug)} ${esc(x.strength)}</div><div class="dw-muted">${esc(x.frequency)} · since ${esc(x.since)}</div></div>`).join(''):'<div class="dw-muted">No current medication recorded.</div>'}</div></section><section class="dp-card"><h2>Recent clinical activity</h2><div class="dp-list"><div><div class="dp-value">Today’s reason</div><div class="dw-muted">${esc(visitReason(p.uhid))}</div></div><div><div class="dp-value">Follow-up status</div><div class="dw-muted">${state.followups.filter(f=>f.uhid===p.uhid&&f.status==='open').length} open follow-up task(s)</div></div></div></section><section class="dp-card"><h2>Records</h2><div class="dp-list">${(c.records||[]).map(r=>`<div><div class="dp-value">${esc(r.name)}</div><div class="dw-muted">${esc(r.date)}</div></div>`).join('')||'<div class="dw-muted">No records available.</div>'}</div></section></div><section class="dp-card" style="margin-top:18px"><h2>Consultation history</h2><div class="dw-list">${consultationRowsFor(p.uhid).length?consultationRowsFor(p.uhid).map(x=>`<div class="dw-list-row"><div class="grow"><div class="dp-value">${esc(x.date)} · ${esc(x.reason)}</div><div class="dw-muted">${esc(x.id)} · Version ${x.version} · ${esc(x.status)} · ${esc(x.diagnosis)}</div></div><button class="dw-link" onclick="doctorModule.consultationDetail('${x.id}')">View consultation</button></div>`).join(''):'<div class="dw-muted">No completed consultations on record.</div>'}</div></section><section class="dp-card" style="margin-top:18px"><h2>Prescription history</h2><div class="dw-list">${(typeof prescriptionsList!=='undefined'?prescriptionsList:[]).filter(r=>r.uhid===p.uhid).length?(typeof prescriptionsList!=='undefined'?prescriptionsList:[]).filter(r=>r.uhid===p.uhid).map(r=>`<div class="dw-list-row"><div class="grow"><div class="dp-value">${esc(rxId(r))}</div><div class="dw-muted">${esc(r.date||'Date not recorded')} · ${esc(rxContext(r))}</div></div><button class="dw-link" onclick="doctorModule.rxDetail('${r.id}')">View prescription</button></div>`).join(''):'<div class="dw-muted">No prescriptions on record.</div>'}</div></section>`);
    const back=document.querySelector('#doctorModuleContent button[onclick="showPage(\'doctorPatients\')"]');
    if(back){back.onclick=()=>doctorModule.backToProfileOrigin();if(state.profileOrigin?.consultation||state.profileOrigin?.page==='consultation')back.textContent='Back to Consultation';else if(state.profileOrigin?.page==='dashboard')back.textContent='Back to Dashboard';else if(state.profileOrigin?.page==='doctorAvailability')back.textContent='Back to Availability';else if(state.profileOrigin?.page==='doctorFollowups')back.textContent='Back to Follow-ups';else if(state.profileOrigin?.page==='doctorResult')back.textContent='Back to Report review';else if(state.profileOrigin?.page==='doctorInbox')back.textContent='Back to Clinical Inbox';}
    document.querySelectorAll('#doctorModuleContent .dp-card h2').forEach(heading=>{
      if(heading.textContent==='Records')heading.parentElement.querySelectorAll('.dp-value').forEach(item=>{item.classList.add('dw-link');item.tabIndex=0;item.setAttribute('role','button');item.setAttribute('aria-label',`Open document preview: ${item.textContent}`);item.onclick=()=>doctorModule.documentPreview(item.textContent,p.uhid);item.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();item.click();}};});
    });
    const root=document.getElementById('doctorModuleContent');
    const reportEntries=state.results.filter(r=>r.uhid===p.uhid);
    const recordsCard=Array.from(root.querySelectorAll('.dp-card')).find(card=>card.querySelector('h2')?.textContent==='Records');
    if(reportEntries.length){
      const list=document.createElement('div');list.className='dw-list';
      list.innerHTML=reportEntries.map(r=>`<div class="dw-list-row"><div class="grow"><button class="dw-link" onclick="doctorModule.openResult('${r.id}',true)">${esc(r.test)} · ${esc(r.report.number)}</button><div class="dw-muted">${esc(r.report.reported)} · ${r.status==='reviewed'?'Reviewed':'Needs review'}</div></div></div>`).join('');
      recordsCard.querySelector('h2').after(list);
    }
    const overview=root.querySelector('.dp-grid');
    const sections=Array.from(root.querySelectorAll('.dp-card'));
    const section=title=>sections.find(card=>card.querySelector('h2').textContent===title);
    const definitions=[
      ['overview','Overview',null,overview],
      ['consultations','Consultations',consultationRowsFor(p.uhid).length,section('Consultation history')],
      ['prescriptions','Prescriptions',(typeof prescriptionsList!=='undefined'?prescriptionsList:[]).filter(r=>r.uhid===p.uhid).length,section('Prescription history')],
      ['documents','Reports & documents',(c.records||[]).length+reportEntries.length,section('Records')]
    ];
    const tabs=document.createElement('div');
    tabs.className='dp-record-tabs';tabs.setAttribute('role','tablist');tabs.setAttribute('aria-label','Patient record sections');
    root.querySelector('.dp-summary').after(tabs);
    const panels=document.createElement('div');panels.className='dp-record-panels';tabs.after(panels);
    definitions.forEach(([id,label,count,content])=>{
      const button=document.createElement('button');button.type='button';button.id=`record-tab-${id}`;
      button.setAttribute('role','tab');button.setAttribute('aria-controls',`record-panel-${id}`);
      button.textContent=count===null?label:`${label} (${count})`;tabs.append(button);
      const panel=document.createElement('div');panel.id=`record-panel-${id}`;panel.className='dp-record-panel';
      panel.setAttribute('role','tabpanel');panel.setAttribute('aria-labelledby',button.id);panel.tabIndex=0;
      content.style.removeProperty('margin-top');panel.append(content);panels.append(panel);
      button.onclick=()=>select(id);
      button.onkeydown=e=>{
        const index=definitions.findIndex(x=>x[0]===id);
        const next=e.key==='ArrowRight'?(index+1)%4:e.key==='ArrowLeft'?(index+3)%4:e.key==='Home'?0:e.key==='End'?3:null;
        if(next!==null){e.preventDefault();select(definitions[next][0]);tabs.children[next].focus();}
      };
    });
    function select(id){
      patientRecordTabs.set(p.uhid,id);
      definitions.forEach(([key],index)=>{
        const selected=key===id;tabs.children[index].setAttribute('aria-selected',String(selected));
        tabs.children[index].tabIndex=selected?0:-1;panels.children[index].hidden=!selected;
      });
    }
    select(patientRecordTabs.get(p.uhid)||'overview');
  }
  const rxId = r => r.prescriptionId || `RX-2026-${String(180+(Number(r.id)||0)).padStart(6,'0')}`;
  const rxVersion = r => r.version || 1;
  const rxStatus = r => r.status || 'Issued';
  const rxMeds = r => (r.medsList&&r.medsList.length?r.medsList:[]).map(m=>({drug:m.name||m.drug||'Medicine',form:m.form||'Tablet',strength:m.strength||'—',frequency:m.frequency||m.dose||'As advised',duration:m.duration||'—',route:m.route||'Oral',instructions:m.instructions||'As advised'}));
  const rxContext = r => r.diagnosis || (r.patientName==='Rahul Sharma'?'Hypertension review':'Clinical consultation');
  const dateTime = value => {const time=Date.parse(value);return Number.isNaN(time)?0:time;};
  function rxById(id){return (typeof prescriptionsList!=='undefined'?prescriptionsList:[]).find(r=>String(r.id)===String(id));}
  const consultationFor = id => state.completedConsultations.find(c=>String(c.id)===String(id));
  const consultationRowsFor = uhid => state.completedConsultations.filter(c=>c.uhid===uhid).slice().sort((a,b)=>String(b.date).localeCompare(String(a.date)));
  // Explicit mock-data relationships: a prescription never resolves by patient name alone.
  function connectHistoricalPrescriptions(){
    if(typeof prescriptionsList==='undefined') return;
    const links={ '-3':'CON-2026-000177','-2':'CON-2026-000178','-1':'CON-2026-000179' };
    prescriptionsList.forEach(rx=>{if(links[String(rx.id)])rx.consultationId=links[String(rx.id)];const c=consultationFor(rx.consultationId);if(c){rx.uhid=c.uhid;rx.diagnosis=c.diagnosis;}rx.rootPrescriptionId=rx.rootPrescriptionId||rx.id;rx.medications=rxMeds(rx).map(m=>`${m.drug} ${m.strength} — ${m.frequency}, ${m.duration}`).join('; ');});
  }

  state.completedConsultations.forEach(c=>{if(!c.clinicalContent)c.clinicalContent={complaints:c.summary,history:'',medications:[]};});
  function completedConsultationsPage(){
    const view=state.consultationView||'consultations';
    const tabs=`<div class="dw-toolbar dw-rx-toolbar"><button class="dw-filter ${view==='consultations'?'active':''}" onclick="doctorModule.consultationView('consultations')">Consultations</button><button class="dw-filter ${view==='prescriptions'?'active':''}" onclick="doctorModule.consultationView('prescriptions')">Issued Prescriptions</button></div>`;
    if(view==='prescriptions'){
      const items=(typeof prescriptionsList!=='undefined'?prescriptionsList:[]).slice().reverse();
      layout('Completed Consultations','Find a completed encounter or its issued prescription. Clinical changes always start from the consultation.','',`${tabs}<div class="dw-note">Prescriptions are outputs of a completed consultation. Use the patient record for longitudinal history or open the linked consultation to create an amendment.</div><div class="dw-panel"><div class="dw-list">${items.map(r=>{const p=byUhid(r.uhid),linked=consultationFor(r.consultationId)||state.completedConsultations.find(c=>(c.prescriptionIds||[]).some(rxId=>String(rxId)===String(r.id)));return `<div class="dw-list-row rx-list-row"><div class="grow"><div class="dw-person">${esc(r.patientName)} <span class="dw-muted">· ${esc(p.uhid||'UHID not recorded')}</span></div><div class="dw-muted"><b>${esc(rxId(r))}</b> · Issued ${esc(r.date||'Date not recorded')} · ${esc(r.doctor||'Dr. Arjun Patel')}</div><div class="dw-muted">${esc(rxContext(r))} · ${rxMeds(r).length||1} medicine${(rxMeds(r).length||1)===1?'':'s'}</div></div><div class="dw-row-actions"><button class="dw-btn" onclick="doctorModule.rxDetail('${r.id}')">View prescription</button>${linked?`<button class="dw-link" onclick="doctorModule.consultationDetail('${linked.id}')">View consultation</button>`:''}<button class="dw-link" onclick="doctorModule.record('${r.uhid}')">Patient record</button></div></div>`;}).join('')||'<div class="dw-empty">No prescriptions have been issued.</div>'}</div></div>`);
      return;
    }
    const query=(state.consultationQuery||'').toLowerCase();
    const rows=state.completedConsultations.filter(c=>{const p=byUhid(c.uhid);return !query||[p.name,p.uhid,c.reason,c.diagnosis,c.date].join(' ').toLowerCase().includes(query);}).slice().sort((a,b)=>state.consultationSort==='patient'?byUhid(a.uhid).name.localeCompare(byUhid(b.uhid).name):dateTime(b.date)-dateTime(a.date));
    layout('Completed Consultations','Review signed clinical encounters. Create an amendment only from the complete consultation record.','',`${tabs}<div class="dw-toolbar"><input class="dw-search" value="${esc(state.consultationQuery||'')}" placeholder="Search patient, UHID, reason, or diagnosis" oninput="doctorModule.consultationSearch(this.value)"><button class="dw-filter ${state.consultationSort==='newest'?'active':''}" onclick="doctorModule.consultationSort('newest')">Newest first</button><button class="dw-filter ${state.consultationSort==='patient'?'active':''}" onclick="doctorModule.consultationSort('patient')">Patient name</button></div><div class="dw-directory-meta">${rows.length} completed consultation${rows.length===1?'':'s'} shown</div><div class="dw-panel"><div class="dw-list">${rows.map(c=>{const p=byUhid(c.uhid),statusLabel=c.status==='Superseded'&&c.supersededBy?`Superseded by ${c.supersededBy}`:c.status;return `<div class="dw-list-row rx-list-row"><div class="grow"><div class="dw-person">${esc(p.name)} <span class="dw-muted">· ${esc(p.uhid)}</span></div><div class="dw-muted">${esc(c.date)} · ${esc(c.type)} · ${esc(c.id)} · Version ${c.version}</div><div class="dw-muted"><b>${esc(c.reason)}</b> · ${esc(c.diagnosis)}</div></div><span class="dw-chip ${c.status==='Superseded'?'waiting':'reviewed'}">${esc(statusLabel)}</span><div class="dw-row-actions"><button class="dw-btn" onclick="doctorModule.consultationDetail('${c.id}')">View consultation</button><button class="dw-link" onclick="doctorModule.record('${c.uhid}')">Patient record</button></div></div>`;}).join('')||'<div class="dw-empty">No completed consultations match the search.</div>'}</div></div>`);
  }
  function completedConsultationDetailPage(id){
    const c=consultationFor(id);if(!c){showPage('doctorConsultations');return;}
    const p=byUhid(c.uhid),record=clinical(c.uhid),allergies=record.allergies||[],rxs=(typeof prescriptionsList!=='undefined'?prescriptionsList:[]).filter(r=>r.consultationId===c.id||(c.prescriptionIds||[]).some(rxId=>String(rxId)===String(r.id)));
    const safety=currentAllergySummary(record);
    const related=state.completedConsultations.filter(x=>x.rootConsultationId===c.rootConsultationId).slice().sort((a,b)=>a.version-b.version);
    const signedBy=c.signedBy||'Dr. Arjun Patel',signedAt=c.signedAt||c.date;
    const versionRows=related.map(x=>`<div class="dw-list-row"><div class="grow"><div class="dp-value">Version ${x.version} · ${esc(x.status)}${x.supersededBy?` · superseded by ${esc(x.supersededBy)}`:''}</div><div class="dw-muted">Signed by ${esc(x.signedBy||'Dr. Arjun Patel')} · ${esc(x.signedAt||x.date)}${x.amendmentReason?` · Reason: ${esc(x.amendmentReason)}`:''}${x.changeSummary?` · Changes: ${esc(x.changeSummary)}`:''}</div></div>${x.id!==c.id?`<button class="dw-link" onclick="doctorModule.consultationDetail('${x.id}')">View</button>`:''}</div>`).join('')||'<div class="dw-muted">Version history is not available.</div>';
    layout('Consultation details',`${esc(c.id)} · Version ${c.version} · ${esc(c.status)} · signed ${esc(signedAt)}`,`<button class="dw-btn" onclick="showPage('doctorConsultations')">Back to Completed Consultations</button><button class="dw-btn" onclick="doctorModule.record('${c.uhid}')">Patient record</button>${c.status!=='Superseded'?`<button class="dw-btn primary" onclick="doctorModule.requestAmendment('${c.id}')">Create consultation amendment</button>`:''}`,`<div class="dp-summary"><div class="dp-hero"><div class="dp-label">Patient</div><div class="dp-name">${esc(p.name)}</div><div class="dp-meta">${esc(p.uhid)} · ${esc(p.age)}Y · ${esc(p.gender)}</div></div><div class="dp-hero"><div class="dp-label">Encounter</div><div class="dp-value">${esc(c.type)} · ${esc(c.reason)}</div><div class="dp-meta">Diagnosis: ${esc(c.diagnosis)}</div></div><div class="dp-hero"><div class="dp-label">Current allergy status</div>${safety}</div></div><div class="dp-grid"><section class="dp-card"><h2>Clinical summary</h2><div class="dp-value">${esc(c.summary)}</div><div class="dw-muted" style="margin-top:8px">Signed by ${esc(signedBy)} · ${esc(signedAt)}. This record is read-only; changes are documented as a linked amendment.</div></section><section class="dp-card"><h2>Issued prescriptions</h2><div class="dw-list">${rxs.length?rxs.map(r=>`<div class="dw-list-row"><div class="grow"><div class="dp-value">${esc(rxId(r))}</div><div class="dw-muted">${esc(r.medications||'Medication details available in prescription')}</div></div><button class="dw-link" onclick="doctorModule.rxDetail('${r.id}')">View prescription</button></div>`).join(''):'<div class="dw-muted">No prescription was issued for this consultation.</div>'}</div></section></div>${c.changeDetails?.length?`<section class="dp-card" style="margin-top:18px"><h2>What changed in this amendment</h2><div class="dw-list">${c.changeDetails.map(d=>`<div class="dw-list-row"><div class="grow"><div class="dp-value">${esc(d.label)}</div><div class="dw-muted">Version ${c.version-1}: ${esc(d.from)}</div><div class="dw-muted">Version ${c.version}: ${esc(d.to)}</div></div></div>`).join('')}</div></section>`:''}<section class="dp-card" style="margin-top:18px"><h2>Version history & audit</h2><div class="dw-list">${versionRows}</div></section>`);
    renderConsultationSections(c);
  }
  function renderConsultationSections(c){
    const root=document.getElementById('doctorModuleContent'),data=c.clinicalContent||{};
    const cards=Array.from(root.querySelectorAll('.dp-card'));
    const card=title=>cards.find(x=>x.querySelector('h2')?.textContent===title);
    const intro=card('Clinical summary'),prescriptions=card('Issued prescriptions'),history=card('Version history & audit'),changes=card('What changed in this amendment');
    const grid=intro.parentElement;grid.before(intro);grid.remove();
    intro.classList.add('cd-intro');
    const missing='<p class="dw-muted">Not recorded for this consultation.</p>';
    const text=value=>value?`<div class="cd-text">${esc(value)}</div>`:missing;
    const field=(label,value)=>`<div class="cd-field"><h3>${label}</h3>${text(value)}</div>`;
    const list=(items,render)=>items?.length?`<div class="cd-items">${items.map(x=>`<div class="cd-item">${render(x)}</div>`).join('')}</div>`:missing;
    const follow=data.followup||{};
    const sections=[
      ['notes','Clinical Notes',field('Complaints',data.complaints)+field('History',data.history)],
      ['diagnostics','Diagnostics',list(data.tests,x=>text(x.name)+text([x.urgent?'Urgent':'',x.status].filter(Boolean).join(' · ')))],
      ['findings','Findings',text(data.findings)],
      ['diagnosis','Diagnosis',data.diagnoses?.length?list(data.diagnoses,x=>text(x.desc)+text([x.code,x.primary?'Primary':'',x.status].filter(Boolean).join(' · '))):text(data.diagnosis||c.diagnosis)],
      ['medications','Medications',list(data.medications,x=>text([x.drug,x.strength].filter(Boolean).join(' '))+text([x.form,x.frequency,x.route,x.duration,x.sos?'SOS':''].filter(Boolean).join(' · '))+(x.instructions?field('Instructions',x.instructions):''))+field('Patient instructions',(data.instructions||[]).join('\n'))],
      ['procedures','Procedures',list(data.procedures,x=>text(x.name))],
      ['treatment','Treatment Plan',field('Treatment plan & referrals',data.treatment)+field('Follow-up',[follow.date&&follow.date!=='Select date'?follow.date:'',follow.type&&follow.type!=='Select type'?follow.type:'',follow.purpose,follow.purpose?follow.priority:''].filter(Boolean).join(' · '))]
    ];
    const workspace=document.createElement('div');workspace.className='cd-workspace';intro.after(workspace);
    const toolbar=document.createElement('div');toolbar.className='cd-toolbar';
    toolbar.innerHTML='<span class="dw-muted">Signed consultation record · Read-only</span><button type="button" class="dw-btn" aria-pressed="false">View full consultation</button>';workspace.append(toolbar);
    const body=document.createElement('div');body.className='cd-body';workspace.append(body);
    const tabs=document.createElement('div');tabs.className='cd-tabs';tabs.setAttribute('role','tablist');tabs.setAttribute('aria-label','Consultation sections');body.append(tabs);
    const panels=document.createElement('div');panels.className='cd-panels';body.append(panels);
    let selected=0,full=false;
    sections.forEach(([id,title,html],index)=>{
      const button=document.createElement('button');button.type='button';button.id=`cd-tab-${id}`;button.textContent=title;button.setAttribute('role','tab');button.setAttribute('aria-controls',`cd-panel-${id}`);tabs.append(button);
      const panel=document.createElement('section');panel.id=`cd-panel-${id}`;panel.className='dp-card cd-panel';panel.tabIndex=0;panel.innerHTML=`<h2>${title}</h2>${html}`;panels.append(panel);
      if(id==='medications'){prescriptions.classList.add('cd-prescriptions');panel.append(prescriptions);}
      button.onclick=()=>{selected=index;update();};
      button.onkeydown=e=>{const next=e.key==='Home'?0:e.key==='End'?6:['ArrowRight','ArrowDown'].includes(e.key)?(index+1)%7:['ArrowLeft','ArrowUp'].includes(e.key)?(index+6)%7:null;if(next!==null){e.preventDefault();selected=next;update();tabs.children[next].focus();}};
    });
    function update(){
      workspace.classList.toggle('cd-full',full);tabs.hidden=full;
      toolbar.querySelector('button').textContent=full?'Return to tabs':'View full consultation';toolbar.querySelector('button').setAttribute('aria-pressed',String(full));
      sections.forEach(([id],index)=>{const button=tabs.children[index],panel=panels.children[index];button.setAttribute('aria-selected',String(index===selected));button.tabIndex=index===selected?0:-1;panel.hidden=!full&&index!==selected;panel.setAttribute('role',full?'region':'tabpanel');panel.setAttribute('aria-label',sections[index][1]);if(full)panel.removeAttribute('aria-labelledby');else panel.setAttribute('aria-labelledby',button.id);});
    }
    toolbar.querySelector('button').onclick=()=>{full=!full;update();};update();
    const audit=document.createElement('details');audit.className='dp-card cd-audit';audit.innerHTML='<summary>Version history & audit</summary>';
    history.querySelector('h2').remove();audit.append(history);if(changes)audit.append(changes);workspace.after(audit);
  }
  function prescriptionsPage(){
    const query=(state.rxQuery||'').toLowerCase(), filter=state.rxFilter||'active';
    const items=(typeof prescriptionsList!=='undefined'?prescriptionsList:[]).filter(r=>{const hay=[r.patientName,rxId(r),r.medications,rxContext(r)].join(' ').toLowerCase();return (!query||hay.includes(query))&&(filter==='all'||(filter==='active'?rxStatus(r)!=='Superseded':rxStatus(r)===filter));}).slice().reverse();
    layout('Prescriptions','Issued prescriptions remain traceable. Amendments create a new re-signed version; the original is never overwritten.','<button class="dw-btn" onclick="showPage(\'doctorQueue\')">Open today’s queue</button>',`<div class="dw-note">Create prescriptions only in Consultation. This register is for review, printing, patient context, and controlled amendment/reissue.</div><div class="dw-toolbar dw-rx-toolbar"><input class="dw-search" value="${esc(state.rxQuery||'')}" placeholder="Search patient, UHID, prescription ID, or medicine" oninput="doctorModule.rxSearch(this.value)"><button class="dw-filter ${(filter==='active')?'active':''}" onclick="doctorModule.rxFilter('active')">Current</button><button class="dw-filter ${(filter==='all')?'active':''}" onclick="doctorModule.rxFilter('all')">All versions</button><button class="dw-filter ${(filter==='Superseded')?'active':''}" onclick="doctorModule.rxFilter('Superseded')">Superseded</button></div><div class="dw-directory-meta">${items.length} prescription${items.length===1?'':'s'} shown · Issued, printed, and amended records are retained in this mock register.</div><div class="dw-panel"><div class="dw-list">${items.map(r=>{const p=byUhid(r.uhid),meds=rxMeds(r),status=rxStatus(r);return `<div class="dw-list-row rx-list-row"><div class="grow"><div class="dw-person">${esc(r.patientName)} <span class="dw-muted">· ${esc(p.uhid||'UHID not recorded')}</span></div><div class="dw-muted"><b>${esc(rxId(r))}</b> · ${esc(r.date||'Date not recorded')} · ${esc(r.doctor||'Dr. Arjun Patel')}</div><div class="dw-muted">${esc(rxContext(r))} · ${meds.length||1} medicine${(meds.length||1)===1?'':'s'} · ${esc(r.duration||meds[0]?.duration||'Duration not recorded')}</div></div><span class="dw-chip ${status==='Superseded'?'waiting':'reviewed'}">${esc(status)}</span><div class="dw-row-actions"><button class="dw-btn" onclick="doctorModule.rxDetail('${r.id}')">View prescription</button><button class="dw-link" onclick="doctorModule.record('${r.uhid}')">Patient record</button></div></div>`;}).join('')||'<div class="dw-empty">No prescriptions match the selected filters.</div>'}</div></div>`);
  }
  function prescriptionDetailPage(id){
    const r=rxById(id); if(!r){prescriptionsPage();return;}
    const p=byUhid(r.uhid),c=clinical(p.uhid||''),meds=rxMeds(r),status=rxStatus(r);
    const history=(typeof prescriptionsList!=='undefined'?prescriptionsList:[]).filter(x=>x.uhid===r.uhid&&((r.rootPrescriptionId&&x.rootPrescriptionId===r.rootPrescriptionId)||rxId(x)===rxId(r)||x.id===r.parentPrescriptionId||r.id===x.parentPrescriptionId));
    const safety=currentAllergySummary(c);
    const medRows=meds.length ? meds.map(m=>`<div class="rx-med-row"><div><div class="dp-value">${esc(m.drug)} ${esc(m.strength)}</div><div class="dw-muted">${esc(m.form)}</div></div><div><div class="dp-value">${esc(m.frequency)}</div><div class="dw-muted">${esc(m.route)}</div></div><div><div class="dp-value">${esc(m.duration)}</div><div class="dw-muted">${esc(m.instructions)}</div></div></div>`).join('') : '<div class="dw-empty">No medicine detail is available for this historical mock record.</div>';
    const historyRows=history.length ? history.map(x=>{const reason=x.amendmentReason?` · ${esc(x.amendmentReason)}`:'';const view=x.id!==r.id?`<button class="dw-link" onclick="doctorModule.rxDetail('${x.id}')">View</button>`:'';return `<div class="dw-list-row"><div class="grow"><div class="dp-value">${esc(rxId(x))} · ${esc(rxStatus(x))}</div><div class="dw-muted">${esc(x.date||'Date not recorded')}${reason}</div></div>${view}</div>`;}).join('') : '<div class="dw-muted">Version 1 · Issued during consultation</div>';
    const linked=consultationFor(r.consultationId)||state.completedConsultations.find(x=>(x.prescriptionIds||[]).some(rxId=>String(rxId)===String(r.id)));
    const actions=`<button class="dw-btn" onclick="showPage('doctorConsultations')">Back to Completed Consultations</button><button class="dw-btn" onclick="doctorModule.printRx('${r.id}')">Print / Reprint</button>${linked?`<button class="dw-btn primary" onclick="doctorModule.consultationDetail('${linked.id}')">View consultation</button>`:''}`;
    layout('Prescription details',`${rxId(r)} · ${status}`,actions,`<div class="dp-summary"><div class="dp-hero"><div class="dp-label">Patient</div><div class="dp-name">${esc(r.patientName)}</div><div class="dp-meta">${esc(p.uhid||'UHID not recorded')} · ${esc(p.age||'—')}Y · ${esc(p.gender||'')}</div></div><div class="dp-hero"><div class="dp-label">Clinical context</div><div class="dp-value">${esc(rxContext(r))}</div><div class="dp-meta">${esc(r.date||'Date not recorded')} · ${esc(r.doctor||'Dr. Arjun Patel')}</div></div><div class="dp-hero"><div class="dp-label">Current allergy status</div>${safety}</div></div><section class="dp-card"><h2>Medication order</h2><div class="rx-med-head"><span>Medicine</span><span>Dose & route</span><span>Duration / instructions</span></div>${medRows}</section><div class="dp-grid" style="margin-top:18px"><section class="dp-card"><h2>Instructions & follow-up</h2><div class="dp-value">${esc(r.instructions||'No additional patient instructions recorded.')}</div><div class="dw-muted" style="margin-top:8px">Follow-up: ${esc(r.followUp||'Not specified')}</div></section>${history.length>1?`<section class="dp-card"><h2>Replacement history</h2><div class="dw-list">${historyRows}</div></section>`:''}</div>`);
  }
  function inboxPage(){
    const open=state.results.filter(r=>r.status==='new');
    layout('Clinical Inbox','Open the complete report before recording a clinical decision or next action.','<button class="dw-btn primary" onclick="doctorModule.newReferral()">Create referral</button>',`<div class="dw-grid"><div class="dw-card"><h3>Needs review</h3><div class="dw-number">${open.length}</div><p>Reports awaiting a documented clinical decision</p></div><div class="dw-card"><h3>Abnormal / urgent</h3><div class="dw-number">${open.filter(r=>r.flag==='High'||r.flag==='Review').length}</div><p>Open the full report before marking reviewed</p></div><div class="dw-card"><h3>Referrals</h3><div class="dw-number">${state.referrals.length}</div><p>Open referrals awaiting specialist response</p></div></div><div class="dw-section"><div class="dw-section-head"><h2>Incoming results</h2></div><div class="dw-panel"><div class="dw-list">${state.results.map(r=>{const p=byUhid(r.uhid),reviewed=r.status==='reviewed';return `<div class="dw-list-row" style="padding:13px 17px"><div class="grow"><div class="dw-person">${esc(r.test)} <span class="dw-chip ${r.flag==='Normal'?'reviewed':'alert'}">${esc(r.flag)}</span></div><div class="dw-muted">${esc(p.name)} · ${esc(r.value)} · received ${esc(r.received)}${reviewed?` · reviewed by ${esc(r.reviewedBy||'Dr. Arjun Patel')}`:''}</div></div><button class="dw-btn ${reviewed?'':'primary'}" onclick="doctorModule.openResult('${r.id}')">${reviewed?'View report':'Open report'}</button>${reviewed?'<span class="dw-chip reviewed">Reviewed</span>':''}<button class="dw-link" onclick="doctorModule.record('${r.uhid}')">Patient record</button></div>`}).join('')}</div></div></div><div class="dw-section"><div class="dw-section-head"><h2>Open referrals</h2></div><div class="dw-panel"><div class="dw-list">${state.referrals.map(r=>{const p=byUhid(r.uhid);return `<div class="dw-list-row" style="padding:13px 17px"><div class="grow"><div class="dw-person">${esc(p.name)} → ${esc(r.to)}</div><div class="dw-muted">${esc(r.reason)} · ${esc(r.status)}</div></div><button class="dw-link" onclick="doctorModule.record('${r.uhid}')">Patient record</button></div>`}).join('')}</div></div></div>`);
    const incoming=document.querySelector('#doctorModuleContent .dw-section .dw-panel .dw-list');
    if(incoming){const views=document.createElement('div');views.className='dw-toolbar';views.innerHTML=`<button class="dw-filter ${state.inboxView==='needs'?'active':''}" onclick="doctorModule.inboxView('needs')">Needs review</button><button class="dw-filter ${state.inboxView==='reviewed'?'active':''}" onclick="doctorModule.inboxView('reviewed')">Reviewed</button>`;incoming.parentElement.before(views);Array.from(incoming.children).forEach((row,index)=>{const reviewed=state.results[index]?.status==='reviewed';row.hidden=state.inboxView==='needs'?reviewed:!reviewed;});}
  }
  function resultReportPage(){
    const r=state.results.find(x=>x.id===state.activeResultId); if(!r){showPage('doctorInbox');return;}
    const draft=state.resultDrafts[r.id]||{decision:'',followup:false,followupPurpose:`Review ${r.test} result`,followupDue:'',referral:false,referralTo:'',referralReason:''};
    const p=byUhid(r.uhid),report=r.report||{number:'Not recorded',laboratory:'Not recorded',collected:'Not recorded',reported:r.received,sections:[],impression:'No interpretation supplied.'};
    const pages=[...report.sections.map(s=>({title:s.title,items:s.items})),{title:'Reporting impression',items:[['Impression',report.impression,'','','']]}];
    const pageCount=pages.length,selected=Math.min(Math.max(state.reportPage,1),pageCount),page=pages[selected-1];
    const pdfRows=page.items.map(item=>`<div class="dw-pdf-row"><div>${esc(item[0])}</div><div>${esc(item[1])}${item[2]?` <span>${esc(item[2])}</span>`:''}</div><div>${esc(item[3]||'—')}</div><div>${item[4]?`<b class="${item[4]==='Normal'?'normal':'abnormal'}">${esc(item[4])}</b>`:'—'}</div></div>`).join('');
    const keyValues=report.sections.flatMap(s=>s.items).filter(item=>item[4]||item[3]).map(item=>`<div class="dw-key-row"><span>${esc(item[0])}</span><b>${esc(item[1])}${item[2]?` ${esc(item[2])}`:''}</b>${item[4]?`<span class="dw-chip ${item[4]==='Normal'?'reviewed':'alert'}">${esc(item[4])}</span>`:''}</div>`).join('')||'<div class="dw-muted">No extracted values are available for this document.</div>';
    const decisionNeeded=r.flag!=='Normal';
    layout('Report review',`${esc(r.test)} · ${esc(r.id)} · received ${esc(r.received)}`,`<button class="dw-btn" onclick="doctorModule.backFromReport()">${state.reportOrigin?'Back to Patient Record':'Back to Clinical Inbox'}</button><button class="dw-btn" onclick="doctorModule.record('${r.uhid}')">Patient record</button>`,`
      <div class="dp-summary"><div class="dp-hero"><div class="dp-label">Patient</div><div class="dp-name">${esc(p.name)}</div><div class="dp-meta">${esc(p.uhid)} · ${esc(p.age)}Y · ${esc(p.gender)}</div></div><div class="dp-hero"><div class="dp-label">Report source</div><div class="dp-value">${esc(report.laboratory)}</div><div class="dp-meta">${esc(report.number)} · collected ${esc(report.collected)}</div></div><div class="dp-hero"><div class="dp-label">Report status</div><div class="dp-value"><span class="dw-chip ${r.flag==='Normal'?'reviewed':'alert'}">${esc(r.flag)}</span></div><div class="dp-meta">Reported ${esc(report.reported)}</div></div></div>
      <div class="dw-pdf-review-layout"><section class="dw-pdf-viewer" aria-label="Original PDF report preview"><div class="dw-pdf-toolbar"><div><b>Original PDF</b><span>Mock document preview · ${pageCount} ${pageCount===1?'page':'pages'}</span></div><div class="dw-pdf-tools"><button class="dw-btn" onclick="doctorModule.changeReportZoom(-10)" aria-label="Zoom out">−</button><span>${state.reportZoom}%</span><button class="dw-btn" onclick="doctorModule.changeReportZoom(10)" aria-label="Zoom in">+</button><button class="dw-btn" onclick="doctorModule.downloadReport('${r.id}')">Download PDF</button></div></div><div class="dw-pdf-body"><nav class="dw-pdf-thumbnails" aria-label="Report pages">${pages.map((item,index)=>`<button class="dw-pdf-thumb ${selected===index+1?'active':''}" onclick="doctorModule.setReportPage(${index+1})" aria-current="${selected===index+1?'page':'false'}"><span>Page ${index+1}</span><small>${esc(item.title)}</small></button>`).join('')}</nav><div class="dw-pdf-stage"><article class="dw-pdf-paper" style="font-size:${state.reportZoom}%"><header><div><b>${esc(report.laboratory)}</b><span>Diagnostic report</span></div><div><b>${esc(report.number)}</b><span>Page ${selected} of ${pageCount}</span></div></header><section class="dw-pdf-patient"><div><span>Patient</span><b>${esc(p.name)}</b><small>${esc(p.uhid)} · ${esc(p.age)}Y · ${esc(p.gender)}</small></div><div><span>Collected</span><b>${esc(report.collected)}</b><small>Reported ${esc(report.reported)}</small></div></section><h2>${esc(page.title)}</h2><div class="dw-pdf-table"><div class="dw-pdf-head"><span>Test / observation</span><span>Result</span><span>Reference range</span><span>Flag</span></div>${pdfRows}</div><footer>Electronically generated mock PDF preview · Verify the original source document before making a clinical decision.</footer></article></div></div></section><aside class="dp-card dw-decision-card"><details class="dw-key-values"><summary>Key values (extracted)</summary><div>${keyValues}</div><p>Supporting summary only. The original PDF remains the source of truth.</p></details><h2>Clinical decision</h2>${r.status==='reviewed'?`<div class="dw-note"><b>Reviewed by ${esc(r.reviewedBy||'Dr. Arjun Patel')}</b><br>${esc(r.reviewedAt||'Time not recorded')}<br>${esc(r.clinicalDecision||'No additional decision note recorded.')}</div>`:`<div class="dw-muted">Review the original PDF, then record your decision. ${decisionNeeded?'A decision note is required because this report is flagged for review.':'A decision note is optional for this normal result.'}</div><label for="dwResultDecision">Clinical decision${decisionNeeded?' <span class="required">*</span>':' (optional)'}</label><textarea id="dwResultDecision" placeholder="e.g. Discuss glycaemic control and continue treatment plan"></textarea><label class="dw-check"><input id="dwResultFollowup" type="checkbox" onchange="doctorModule.toggleResultAction('followup')"> Create a clinical follow-up</label><div id="dwResultFollowupFields" class="dw-conditional" hidden><label for="dwResultFollowupPurpose">Follow-up purpose</label><input id="dwResultFollowupPurpose" value="Review ${esc(r.test)} result"><label for="dwResultFollowupDue">Due date (optional)</label><input id="dwResultFollowupDue" type="date"></div><label class="dw-check"><input id="dwResultReferral" type="checkbox" onchange="doctorModule.toggleResultAction('referral')"> Create a referral</label><div id="dwResultReferralFields" class="dw-conditional" hidden><label for="dwResultReferralTo">Refer to</label><input id="dwResultReferralTo" placeholder="e.g. Diabetology"><label for="dwResultReferralReason">Referral reason</label><input id="dwResultReferralReason" placeholder="Clinical reason for referral"></div><button class="dw-btn primary dw-decision-submit" onclick="doctorModule.markResultReviewed('${r.id}')">Mark report reviewed</button>`}</aside></div>`);
    // Navigation inside the PDF must never discard an in-progress clinical decision.
    if(r.status!=='reviewed'){
      const bind=(id,field)=>{const el=document.getElementById(id);if(!el)return;el.value=draft[field]||'';el.addEventListener('input',()=>doctorModule.saveResultDraft(r.id,field,el.value));};
      bind('dwResultDecision','decision');bind('dwResultFollowupPurpose','followupPurpose');bind('dwResultFollowupDue','followupDue');bind('dwResultReferralTo','referralTo');bind('dwResultReferralReason','referralReason');
      const follow=document.getElementById('dwResultFollowup'),refer=document.getElementById('dwResultReferral');
      if(follow){follow.checked=!!draft.followup;document.getElementById('dwResultFollowupFields').hidden=!follow.checked;}
      if(refer){refer.checked=!!draft.referral;document.getElementById('dwResultReferralFields').hidden=!refer.checked;}
    }
  }
  function currentAllergySummary(record){
    return (record.allergies||[]).length?record.allergies.map(a=>`<span class="dp-pill alert">${esc(a.substance)} · ${esc(a.severity)}</span>`).join(' '):`<div class="dp-value">${record.allergiesConfirmed?'No known drug allergies confirmed':'Not recorded'}</div>`;
  }
  function followupDueState(f){
    if(f.status==='closed')return 'Closed';
    if(f.due==='Today')return 'Due today';
    const due=new Date(f.due),today=new Date(todayISO()+'T00:00:00');
    if(Number.isNaN(due.getTime()))return 'Date not set';
    due.setHours(0,0,0,0);
    return due<today?'Overdue':due>today?'Upcoming':'Due today';
  }
  function followupsPage(){
    const open=state.followups.filter(f=>f.status==='open'), booked=open.filter(f=>f.appointment?.status==='Booked').length, unbooked=open.length-booked;
      layout('Follow-ups','Clinical follow-up requirements created during consultation. Appointment booking can be completed by the doctor, reception, nurse, or patient.','',`<div class="dw-followup-summary"><div><b>${open.length} open clinical follow-up${open.length===1?'':'s'}</b><span>${unbooked} need${unbooked===1?'s':''} an appointment · ${booked} booked</span></div><div class="dw-muted">Create or change the clinical requirement from the Consultation; manage appointment status here.</div></div><div class="dw-panel"><div class="dw-followup-head"><span>Patient & clinical purpose</span><span>Appointment status</span><span>Clinical status</span><span>Actions</span></div><div class="dw-list dw-followup-list">${state.followups.map(f=>{const p=byUhid(f.uhid),a=f.appointment||{status:'Not booked'},booked=a.status==='Booked',closure=f.closure;return `<div class="dw-followup-row"><div><div class="dw-person">${esc(p.name)}</div><div class="dw-muted">${esc(f.reason)} · due ${esc(f.due)}</div></div><div>${booked?`<div class="dw-person">${esc(a.date)} · ${esc(a.time)}</div><div class="dw-muted">${esc(a.mode)} · booked by ${esc(a.bookedBy)}</div>`:'<div class="dw-person">Not booked</div><div class="dw-muted">Scheduling can be completed by reception, nurse, patient, or doctor.</div>'}</div><div><span class="dw-chip ${f.status==='closed'?'reviewed':['Overdue','Due today'].includes(followupDueState(f))?'alert':'waiting'}">${esc(followupDueState(f))}</span>${closure?`<div class="dw-muted" style="margin-top:6px">Closed by ${esc(closure.by)} · ${esc(closure.at)}<br>${esc(closure.note)}</div>`:''}</div><div class="dw-followup-actions">${f.status==='closed'?'<span class="dw-muted">No further action</span>':booked?`<button class="dw-btn" onclick="doctorModule.viewFollowupAppointment('${f.id}')">View appointment</button>`:`<button class="dw-btn primary" onclick="doctorModule.bookFollowup('${f.id}')">Book appointment</button>`}<button class="dw-link" onclick="doctorModule.record('${f.uhid}')">Record</button>${f.status==='open'?`<button class="dw-link" onclick="doctorModule.closeFollowup('${f.id}')">Close follow-up</button>`:''}</div></div>`;}).join('')}</div></div>`);
    document.querySelectorAll('#doctorModuleContent .dw-followup-row').forEach((row,index)=>{const f=state.followups[index],name=row.querySelector(':scope > div:first-child .dw-person');if(f&&name){const link=document.createElement('button');link.className='dw-link dw-person';link.textContent=name.textContent;link.onclick=()=>doctorModule.record(f.uhid);name.replaceWith(link);}Array.from(row.querySelectorAll('button.dw-link')).filter(button=>button.textContent.trim()==='Record').forEach(button=>button.remove());});
  }
  function availabilityPage(){
    const days=Object.keys(state.availability), prefs=state.bookingPreferences; layout('Availability','Set when and how patients can book with you. Clinic-wide constraints remain visible as read-only context.','<button class="dw-btn primary" onclick="doctorModule.saveAvailability()">Save availability</button>',`<div class="dw-availability"><div class="dw-panel" style="padding:5px 17px">${days.map(d=>`<div class="dw-day"><div class="dw-day-name">${d}</div><div class="dw-slot">${d==='Sun'?'Not available':'10:00 AM – 1:00 PM · 5:00 PM – 8:00 PM'}</div><button class="dw-toggle ${state.availability[d]?'on':''}" onclick="doctorModule.toggleDay('${d}')" aria-label="Toggle ${d}"></button></div>`).join('')}</div><div class="dw-card"><h3>Your booking preferences</h3><div class="dw-form-grid"><label>Appointment duration<select id="dwDuration"><option value="15" ${prefs.duration==='15'?'selected':''}>15 minutes</option><option value="20" ${prefs.duration==='20'?'selected':''}>20 minutes</option><option value="30" ${prefs.duration==='30'?'selected':''}>30 minutes</option></select></label><label>Accept bookings up to<select id="dwAdvance"><option value="7" ${prefs.advance==='7'?'selected':''}>7 days ahead</option><option value="14" ${prefs.advance==='14'?'selected':''}>14 days ahead</option><option value="30" ${prefs.advance==='30'?'selected':''}>30 days ahead</option></select></label></div><div class="dw-mode-list"><label><input type="checkbox" id="dwModeClinic" ${prefs.clinic?'checked':''}> In-clinic consultations</label><label><input type="checkbox" id="dwModeVideo" ${prefs.video?'checked':''}> Video consultations</label><label><input type="checkbox" id="dwModeAudio" ${prefs.audio?'checked':''}> Audio consultations</label></div><div class="dw-readonly-note"><b>Clinic constraints</b><br>CityCare Clinic is open 9:00 AM–8:00 PM. Urgent slots and clinic closures are managed by the Organization Admin.</div></div></div>`);
    const saveButton=document.querySelector('#doctorModuleContent .dw-header .dw-btn.primary');
    if(saveButton&&saveButton.textContent.includes('Save availability')){const status=document.createElement('span');status.className='dw-muted';status.textContent=state.availabilityDirty?'Unsaved changes':'All changes saved';saveButton.before(status);}
    document.querySelectorAll('#doctorModuleContent .dw-day').forEach((row,index)=>{const day=days[index],slot=row.querySelector('.dw-slot');if(slot&&!state.availability[day])slot.textContent='Not available';});
    document.querySelectorAll('#doctorModuleContent #dwDuration,#doctorModuleContent #dwAdvance,#doctorModuleContent #dwModeClinic,#doctorModuleContent #dwModeVideo,#doctorModuleContent #dwModeAudio').forEach(control=>control.addEventListener('change',doctorModule.markAvailabilityDirty));
  }
  function render(name){({doctorQueue:queuePage,doctorPatients:patientsPage,doctorProfile:patientProfilePage,doctorInbox:inboxPage,doctorResult:resultReportPage,doctorFollowups:followupsPage,doctorAvailability:availabilityPage,doctorConsultations:completedConsultationsPage}[name])();}
  function enhanceDashboard(){
    const side=document.querySelector('#page-dashboard .side-col');if(!side||document.getElementById('doctorDashboardPulse'))return;
    const card=document.createElement('div');card.className='card';card.id='doctorDashboardPulse';card.innerHTML=`<div class="card-title" style="margin-bottom:10px">Clinical priorities</div><div class="dw-list-row"><div class="grow"><b style="font-size:13px">${state.results.filter(r=>r.status==='new').length} results need review</b><div class="dw-muted">Includes 2 abnormal / clinical-review items</div></div><button class="dw-link" onclick="showPage('doctorInbox')">Open inbox</button></div><div class="dw-list-row"><div class="grow"><b style="font-size:13px">1 follow-up due today</b><div class="dw-muted">Rahul Sharma · HbA1c review</div></div><button class="dw-link" onclick="showPage('doctorFollowups')">View</button></div>`;side.appendChild(card);
  }
  function modal(title,fields,onSave,submitLabel){
    const labels={
      'Schedule appointment':'Book appointment','Book follow-up appointment':'Book appointment',
      'Create referral':'Create referral','Add follow-up':'Create follow-up',
      'Add walk-in visit':'Add walk-in visit','Close clinical follow-up':'Close follow-up',
      'Review & sign amendment':'Sign amendment','Create consultation amendment':'Open amendment workspace'
    };
    const content=document.createElement('div');content.className='dw-modal';content.id='doctorModuleModal';
    content.innerHTML=`<div class="dw-modal-box" role="dialog" aria-modal="true" aria-labelledby="dwModalTitle"><button class="dw-icon-btn dw-modal-close" aria-label="Close dialog" onclick="doctorModule.closeModal()">×</button><h2 id="dwModalTitle">${title}</h2>${fields}<div class="dw-modal-foot"><button class="dw-btn" onclick="doctorModule.closeModal()">Cancel</button><button class="dw-btn primary" id="dwModalSave">${submitLabel||labels[title]||'Save changes'}</button></div></div>`;
    document.body.appendChild(content);document.getElementById('dwModalSave').onclick=onSave;
    const first=content.querySelector('select,input,textarea,button');if(first)first.focus();
    content.addEventListener('keydown',event=>{if(event.key==='Escape'){event.preventDefault();doctorModule.closeModal();}if(event.key==='Tab'){const controls=Array.from(content.querySelectorAll('button,input,select,textarea')).filter(el=>!el.disabled);if(!controls.length)return;const current=controls.indexOf(document.activeElement);if(event.shiftKey&&current===0){event.preventDefault();controls.at(-1).focus();}else if(!event.shiftKey&&current===controls.length-1){event.preventDefault();controls[0].focus();}}});
  }
  window.doctorModule={
    filter:v=>{state.queueFilter=v;state.queueReadiness='all';queuePage();},readinessFilter:v=>{state.queueFilter='all';state.queueReadiness=v;queuePage();},search:v=>{state.search=v;queuePage();const input=document.querySelector('#doctorModuleContent .dw-search');if(input){input.focus();input.setSelectionRange(input.value.length,input.value.length);}},
    patientFilter:v=>{state.patientFilter=v;patientsPage();},patientSearch:v=>{state.patientSearch=v;renderPatientList();},
    start:(uhid,mode)=>{const p=visitRows().find(x=>x.visitId===uhid)||visitRows().find(x=>x.uhid===uhid);if(!p){window.showToast&&showToast('This patient has no active visit today.',true);return;}state.activeAmendment=null;resetCompletionCopy();if(mode==='clinic'||mode==='walkin'||mode==='notes'){populateConsultation(p);return;}requestStartConsultation(p,mode);},
    openDashboardMetric:index=>{if(index===3){state.inboxView='needs';showPage('doctorInbox');return;}if(index===4){showPage('doctorFollowups');return;}state.queueFilter='all';state.queueReadiness=index===1?'ready':index===2?'alert':'all';showPage('doctorQueue');},
    openPrescriptions:()=>{state.consultationView='prescriptions';showPage('doctorConsultations');},
    record:uhid=>{state.profileOrigin={page:state.currentPage,detail:state.currentDetail,scrollY:window.scrollY};state.profileUhid=uhid;showPage('doctorProfile');},
    consultationHistory:()=>{saveWorkspace();state.profileOrigin={consultation:true,scrollY:window.scrollY};state.profileUhid=currentPatientUhid;patientRecordTabs.set(currentPatientUhid,'consultations');showPage('doctorProfile');},
    backToProfileOrigin:()=>{const origin=state.profileOrigin||{page:'doctorPatients',scrollY:0};if(origin.consultation)showPage('consultation');else if(origin.detail)doctorModule[origin.detail.kind](origin.detail.id);else showPage(origin.page);setTimeout(()=>window.scrollTo(0,origin.scrollY||0),0);},
    documentPreview:(title,uhid)=>{const p=byUhid(uhid);modal('Document preview',`<div class="dw-note"><b>${esc(title)}</b><br>${esc(p.name)} · ${esc(p.uhid)}</div><div class="dw-readonly-note">Representative mock document preview. In the implemented product this opens the linked source document or report.</div>`,()=>doctorModule.closeModal(),'Close');},
    recordByName:name=>{const p=known().find(x=>x.name===name);if(p)doctorModule.record(p.uhid);},
    consultationView:v=>{state.consultationView=v;completedConsultationsPage();},
    consultationSearch:v=>{state.consultationQuery=v;completedConsultationsPage();},
    consultationSort:v=>{state.consultationSort=v;completedConsultationsPage();},
    consultationDetail:id=>{hideBase();state.currentPage='doctorConsultations';state.currentDetail={kind:'consultationDetail',id};activate('doctorConsultations');completedConsultationDetailPage(id);window.scrollTo(0,0);},
    rxSearch:v=>{state.rxQuery=v;completedConsultationsPage();},
    rxFilter:v=>{state.rxFilter=v;completedConsultationsPage();},
    rxDetail:id=>{hideBase();state.currentPage='doctorConsultations';state.currentDetail={kind:'rxDetail',id};activate('doctorConsultations');prescriptionDetailPage(id);window.scrollTo(0,0);},
    printRx:id=>{const r=rxById(id);if(!r)return;r.printedAt=stamp();modal('Prescription print preview',`<div class="dw-note"><b>${esc(rxId(r))}</b><br>${esc(r.patientName)} · Issued ${esc(r.date||'Date not recorded')}<br>Printed ${esc(r.printedAt)}</div><div class="dw-readonly-note">${rxMeds(r).map(m=>`${esc(m.drug)} ${esc(m.strength)} · ${esc(m.frequency)} · ${esc(m.duration)} · ${esc(m.instructions)}`).join('<br>')||'No medicine details available.'}<br><br>Representative print output for this signed prescription version.</div>`,()=>doctorModule.closeModal(),'Close');},
    requestAmendment:id=>{const c=consultationFor(id);if(!c)return;modal('Create consultation amendment',`<div class="dw-note"><b>${esc(c.id)} · Version ${c.version}</b><br>The signed consultation will remain unchanged. You will edit a pre-filled amendment workspace and sign a new version.</div><label>Amendment reason <span class="required">*</span></label><input id="dwAmendmentReason" placeholder="e.g. Medication plan needs correction">`,()=>{const reason=document.getElementById('dwAmendmentReason').value.trim();if(!reason){window.showToast&&showToast('Enter an amendment reason before continuing.',true);return;}doctorModule.closeModal();doctorModule.beginAmendment(id,reason);});const submit=document.getElementById('dwModalSave');if(submit)submit.textContent='Open amendment workspace';},
    beginAmendment:(id,reason)=>{const c=consultationFor(id),p=byUhid(c?.uhid);if(!c||!p)return;state.activeAmendment={id,reason,initiatedAt:new Date().toLocaleString('en-IN',{day:'2-digit',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'})};populateConsultation({...p,time:'Amendment',type:'clinic',paid:true,doctor:'Dr. Arjun Patel'});setTimeout(()=>{const page=document.getElementById('page-consultation');if(!page)return;document.getElementById('consultationAmendmentBanner')?.remove();const banner=document.createElement('div');banner.id='consultationAmendmentBanner';banner.style.cssText='margin:0 0 10px;padding:12px 16px;background:#fff7ed;border:1px solid #fed7aa;border-radius:10px;color:#9a3412;font-size:13px;font-weight:600;line-height:1.45;';banner.innerHTML=`<b>Amendment workspace</b> · Source: ${esc(c.id)} Version ${c.version} (unchanged)<br><span style="font-weight:500">Reason: ${esc(reason)} · Initiated by Dr. Arjun Patel at ${esc(state.activeAmendment.initiatedAt)}</span>`;page.firstElementChild?.prepend(banner);const button=page.querySelector('button[onclick="confirmCompleteConsultation()"]');if(button){button.innerHTML='Review & sign amendment';button.onclick=()=>doctorModule.signAmendment();}},0);},
    signAmendment:()=>{const amendment=state.activeAmendment;if(!amendment)return;const source=consultationFor(amendment.id),changes=contentDiff(source?.clinicalContent,captureConsultationContent());if(!changes.length){window.showToast&&showToast('Make a clinical change before signing an amendment.',true);return;}modal('Review & sign amendment',`<div class="dw-note"><b>Source record:</b> ${esc(amendment.id)}<br><b>Reason:</b> ${esc(amendment.reason)}<br><br>${changes.map(change=>`<b>${esc(change.label)}:</b> ${esc(change.from)} → ${esc(change.to)}`).join('<br>')}<br><br>You are creating a new signed version. The original remains in the patient record with its original date, signer, and content.</div>`,()=>{doctorModule.closeModal();completeConsultation();});const submit=document.getElementById('dwModalSave');if(submit)submit.textContent='Sign amendment';},
    openResult:(id,fromRecord=false)=>{state.reportOrigin=fromRecord?{uhid:state.profileUhid,profileOrigin:state.profileOrigin}:null;state.activeResultId=id;state.reportPage=1;state.reportZoom=100;showPage('doctorResult');},
    backFromReport:()=>{if(state.reportOrigin){const origin=state.reportOrigin;state.profileUhid=origin.uhid;state.profileOrigin=origin.profileOrigin;patientRecordTabs.set(origin.uhid,'documents');showPage('doctorProfile');}else showPage('doctorInbox');},
    inboxView:v=>{state.inboxView=v;inboxPage();},
    saveResultDraft:(id,field,value)=>{state.resultDrafts[id]=Object.assign({decision:'',followup:false,followupPurpose:'',followupDue:'',referral:false,referralTo:'',referralReason:''},state.resultDrafts[id]||{}, {[field]:value});},
    setReportPage:page=>{state.reportPage=page;resultReportPage();},
    changeReportZoom:delta=>{state.reportZoom=Math.max(80,Math.min(130,state.reportZoom+delta));resultReportPage();},
    downloadReport:id=>{const r=state.results.find(x=>x.id===id);if(!r)return;window.showToast&&showToast(`${r.report?.number||r.id} PDF download prepared in the prototype.`);},
    toggleResultAction:type=>{const fields=document.getElementById(type==='followup'?'dwResultFollowupFields':'dwResultReferralFields'),check=document.getElementById(type==='followup'?'dwResultFollowup':'dwResultReferral');if(fields&&check){fields.hidden=!check.checked;doctorModule.saveResultDraft(state.activeResultId,type,check.checked);}},
    markResultReviewed:id=>{const r=state.results.find(x=>x.id===id);if(!r)return;['decision','followupPurpose','followupDue','referralTo','referralReason'].forEach(field=>{const el=document.getElementById('dwResult'+({decision:'Decision',followupPurpose:'FollowupPurpose',followupDue:'FollowupDue',referralTo:'ReferralTo',referralReason:'ReferralReason'}[field]));if(el)doctorModule.saveResultDraft(id,field,el.value);});const draft=state.resultDrafts[id]||{},decision=(draft.decision||'').trim(),followup=!!draft.followup,referral=!!draft.referral;if(r.flag!=='Normal'&&!decision){window.showToast&&showToast('Record a clinical decision before marking this flagged report reviewed.',true);return;}if(followup&&!(draft.followupPurpose||'').trim()){window.showToast&&showToast('Enter a follow-up purpose or remove the follow-up action.',true);return;}if(referral&&(!(draft.referralTo||'').trim()||!(draft.referralReason||'').trim())){window.showToast&&showToast('Enter the referral destination and clinical reason or remove the referral action.',true);return;}r.status='reviewed';r.reviewedBy='Dr. Arjun Patel';r.reviewedAt=new Date().toLocaleString('en-IN',{day:'2-digit',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'});r.clinicalDecision=decision;if(followup){state.followups.unshift({id:'F-'+Date.now(),uhid:r.uhid,reportId:r.id,consultationId:r.consultationId||null,reason:draft.followupPurpose.trim(),due:draft.followupDue||'Not scheduled',priority:'New task',status:'open',appointment:{status:'Not booked'}});}if(referral){state.referrals.unshift({id:'RF-'+Date.now(),uhid:r.uhid,reportId:r.id,consultationId:r.consultationId||null,to:draft.referralTo.trim(),reason:draft.referralReason.trim(),status:'Awaiting response'});}delete state.resultDrafts[id];doctorModule.backFromReport();window.showToast&&showToast(`Report reviewed${followup?' and follow-up created':''}${referral?' and referral created':''}.`);},
    bookFollowup:id=>{const f=state.followups.find(x=>x.id===id);if(!f)return;const p=byUhid(f.uhid);modal('Book follow-up appointment',`<div class="dw-note">${esc(p.name)} · ${esc(f.reason)}<br>Clinical due date: ${esc(f.due)}</div><label for="dwFollowupDate">Date</label><input id="dwFollowupDate" type="date"><label for="dwFollowupTime">Time</label><input id="dwFollowupTime" type="time" value="10:30"><label for="dwFollowupMode">Consultation mode</label><select id="dwFollowupMode"><option value="clinic">In clinic</option><option value="video">Video</option><option value="audio">Audio</option></select><div id="dwFollowupBookingError" class="dw-form-error" aria-live="polite"></div>`,()=>{const date=document.getElementById('dwFollowupDate').value,time=document.getElementById('dwFollowupTime').value,mode=document.getElementById('dwFollowupMode').value,error=document.getElementById('dwFollowupBookingError');if(!date||!time){error.textContent='Choose an appointment date and time.';return;}const conflict=bookingError(date,time,mode);if(conflict){error.textContent=conflict;return;}if(f.appointmentId){error.textContent='This follow-up already has an appointment.';return;}const visit=createAppointment(p,date,time,mode,false,f);f.appointmentId=visit.visitId;const displayDate=new Date(date+'T00:00:00').toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'}),[hour,minute]=time.split(':').map(Number),displayTime=String(((hour+11)%12)+1).padStart(2,'0')+':'+String(minute).padStart(2,'0')+' '+(hour>=12?'PM':'AM');f.appointment={id:visit.visitId,dateISO:date,status:'Booked',date:displayDate,time:displayTime,mode:mode==='clinic'?'In clinic':mode[0].toUpperCase()+mode.slice(1),bookedBy:'Dr. Arjun Patel'};doctorModule.closeModal();followupsPage();window.showToast&&showToast('Follow-up appointment booked by Dr. Arjun Patel in the prototype.');});},
    viewFollowupAppointment:id=>{const f=state.followups.find(x=>x.id===id),a=f?.appointment;if(!f||!a)return;const p=byUhid(f.uhid);const existing=document.getElementById('doctorModuleModal');if(existing)existing.remove();const content=document.createElement('div');content.className='dw-modal';content.id='doctorModuleModal';content.innerHTML=`<div class="dw-modal-box" role="dialog" aria-modal="true"><h2>Follow-up appointment</h2><p class="dw-sub">${esc(p.name)} · ${esc(f.reason)}</p><div class="dw-appointment-detail"><b>${esc(a.date)} · ${esc(a.time)}</b><span>${esc(a.mode)} · booked by ${esc(a.bookedBy)}</span></div><div class="dw-modal-foot"><button class="dw-btn primary" onclick="doctorModule.closeModal()">Close</button></div></div>`;document.body.appendChild(content);},
    closeFollowup:id=>{const f=state.followups.find(x=>x.id===id);if(!f)return;modal('Close clinical follow-up',`<div class="dw-note">Close this only when no further clinical review is required. Appointment scheduling alone does not close a follow-up.</div><label>Closure note</label><input id="dwClosureNote" placeholder="Reason clinical follow-up is no longer required">`,()=>{const note=document.getElementById('dwClosureNote').value.trim();if(!note){window.showToast&&showToast('Enter a closure note.',true);return;}f.status='closed';f.closure={note,by:'Dr. Arjun Patel',at:new Date().toLocaleString('en-IN',{day:'2-digit',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'})};doctorModule.closeModal();followupsPage();window.showToast&&showToast('Clinical follow-up closed and recorded in the prototype.');});},
    toggleDay:d=>{doctorModule.captureAvailability();state.availability[d]=!state.availability[d];state.availabilityDirty=true;availabilityPage();},
    markAvailabilityDirty:()=>{doctorModule.captureAvailability();state.availabilityDirty=true;availabilityPage();},
    captureAvailability:()=>{state.bookingPreferences={duration:document.getElementById('dwDuration')?.value||state.bookingPreferences.duration,advance:document.getElementById('dwAdvance')?.value||state.bookingPreferences.advance,clinic:document.getElementById('dwModeClinic')?.checked??state.bookingPreferences.clinic,video:document.getElementById('dwModeVideo')?.checked??state.bookingPreferences.video,audio:document.getElementById('dwModeAudio')?.checked??state.bookingPreferences.audio};},
    saveAvailability:()=>{
      doctorModule.captureAvailability();
      savedAvailability={...state.availability};savedPreferences={...state.bookingPreferences};state.availabilityDirty=false;
      availabilityPage();
      window.showToast&&showToast('Your availability and booking preferences were saved for the prototype.');
    },
    showPatientDetails:uhid=>{
      const p=byUhid(uhid),c=clinical(uhid),allergies=c.allergies||[],conditions=c.conditions||[],meds=c.currentMeds||[],records=c.records||[];
      const existing=document.getElementById('doctorPatientDetailsModal'); if(existing)existing.remove();
      const modal=document.createElement('div'); modal.className='dw-modal'; modal.id='doctorPatientDetailsModal'; modal.innerHTML=`<div class="dw-modal-box dw-patient-details" role="dialog" aria-modal="true" aria-labelledby="patientDetailsTitle"><div class="dw-modal-head"><div><h2 id="patientDetailsTitle">Patient details</h2><p class="dw-sub">Read-only context for this consultation.</p></div><button class="dw-icon-btn" aria-label="Close patient details" onclick="doctorModule.closePatientDetails()">×</button></div><div class="dw-detail-grid"><section><div class="dw-detail-label">Patient</div><div class="dw-person">${esc(p.name)}</div><div class="dw-muted">${esc(p.uhid)} · ${esc(p.age)}Y · ${esc(p.gender)} · ${esc(p.phone||'Not recorded')}</div><div class="dw-muted">ABHA: ${esc(c.abhaId||'Not linked')} · Blood group: ${esc(c.bloodGroup||'Not recorded')}</div></section><section><div class="dw-detail-label">Allergy status</div>${allergies.length?allergies.map(a=>`<span class="dw-chip alert">${esc(a.substance)} · ${esc(a.severity)}</span>`).join(' '):`<div class="dw-muted">${c.allergiesConfirmed?'No known drug allergies confirmed':'Allergy status not recorded'}</div>`}</section><section><div class="dw-detail-label">Active conditions</div>${conditions.length?conditions.map(x=>`<div class="dw-muted">${esc(x.name)} · ${esc(x.since)}</div>`).join(''):'<div class="dw-muted">No active conditions recorded.</div>'}</section><section><div class="dw-detail-label">Current medications</div>${meds.length?meds.map(x=>`<div class="dw-muted">${esc(x.drug)} ${esc(x.strength)} · ${esc(x.frequency)}</div>`).join(''):'<div class="dw-muted">No current medication recorded.</div>'}</section><section><div class="dw-detail-label">Recent records</div>${records.length?records.slice(0,3).map(x=>`<div class="dw-muted">${esc(x.name)} · ${esc(x.date)}</div>`).join(''):'<div class="dw-muted">No records available.</div>'}</section></div><div class="dw-modal-foot"><button class="dw-btn primary" onclick="doctorModule.closePatientDetails()">Close</button></div></div>`; document.body.appendChild(modal);
    },
    closePatientDetails:()=>{const el=document.getElementById('doctorPatientDetailsModal');if(el)el.remove();},
    schedule:()=>modal('Schedule appointment','<label>Patient</label><select id="dwAppointmentPatient">'+known().map(p=>`<option value="${p.uhid}">${esc(p.name)} — ${esc(p.uhid)}</option>`).join('')+'</select><label>Date</label><input id="dwAppointmentDate" type="date"><label>Consultation mode</label><select id="dwAppointmentType"><option value="clinic">In clinic</option><option value="video">Video</option><option value="audio">Audio</option></select><label>Time</label><input id="dwAppointmentTime" type="time" value="11:30"><label class="dw-check"><input id="dwAppointmentOverride" type="checkbox"> Allow one-time availability override</label><div id="dwBookingError" class="dw-form-error" aria-live="polite"></div>',()=>{const uhid=document.getElementById('dwAppointmentPatient').value,p=byUhid(uhid),date=document.getElementById('dwAppointmentDate').value,type=document.getElementById('dwAppointmentType').value,time=document.getElementById('dwAppointmentTime').value,override=document.getElementById('dwAppointmentOverride').checked,error=document.getElementById('dwBookingError');if(!date||!time){error.textContent='Choose an appointment date and time.';return;}const conflict=bookingError(date,time,type);if(conflict&&!override){error.textContent=conflict+' Choose another slot or allow a one-time override.';return;}createAppointment(p,date,time,type,override);doctorModule.closeModal();showPage('doctorQueue');window.showToast&&showToast(override?'Appointment scheduled with a one-time availability override.':date===todayISO()?'Appointment scheduled and added to today’s queue.':'Future appointment saved. It will appear in the queue on its appointment date.');}),
    newReferral:()=>modal('Create referral','<label>Patient</label><select id="dwPatient">'+known().map(p=>`<option value="${p.uhid}">${esc(p.name)} — ${esc(p.uhid)}</option>`).join('')+'</select><label>Refer to</label><input id="dwReferralTo" placeholder="e.g. Pulmonology"><label>Clinical reason</label><input id="dwReferralReason" placeholder="Reason for referral">',()=>{const to=document.getElementById('dwReferralTo').value.trim(),reason=document.getElementById('dwReferralReason').value.trim();if(!to||!reason){window.showToast&&showToast('Enter the referral destination and clinical reason.',true);return;}state.referrals.unshift({id:'RF-'+Date.now(),uhid:document.getElementById('dwPatient').value,to,reason,status:'Awaiting response'});doctorModule.closeModal();inboxPage();window.showToast&&showToast('Referral created and added to the clinical inbox.');}),
    newFollowup:()=>modal('Add follow-up','<label>Patient</label><select id="dwPatient">'+known().map(p=>`<option value="${p.uhid}">${esc(p.name)}</option>`).join('')+'</select><label>Clinical reason</label><input id="dwReason" placeholder="e.g. Review blood pressure"><label>Due date</label><input id="dwDue" type="date">',()=>{const reason=document.getElementById('dwReason').value.trim();if(!reason){window.showToast&&showToast('Enter the clinical reason.',true);return;}state.followups.unshift({id:'F-'+Date.now(),uhid:document.getElementById('dwPatient').value,reason,due:document.getElementById('dwDue').value||'Not scheduled',priority:'New task',status:'open'});doctorModule.closeModal();followupsPage();window.showToast&&showToast('Follow-up added.');}),
    newWalkin:()=>modal('Add walk-in visit','<label>Patient</label><select id="dwWalkinPatient">'+known().map(p=>`<option value="${p.uhid}">${esc(p.name)} — ${esc(p.uhid)}</option>`).join('')+'</select><label>Arrival time</label><input id="dwWalkinTime" type="time" value="12:00">',()=>{const uhid=document.getElementById('dwWalkinPatient').value,p=byUhid(uhid),time=document.getElementById('dwWalkinTime').value;if(!time){window.showToast&&showToast('Choose an arrival time.',true);return;}const [h,m]=time.split(':').map(Number),suffix=h>=12?'PM':'AM',hour=((h+11)%12)+1;todayQueue().push({visitId:entityId('VISIT'),date:todayISO(),time:String(hour).padStart(2,'0')+':'+String(m).padStart(2,'0')+' '+suffix,name:p.name,uhid:p.uhid,age:p.age,gender:p.gender,phone:p.phone,type:'clinic',freq:'Walk-in',freqIcon:'walkin',action:'active',caption:'Walk-in visit',paid:true,doctor:'Dr. Arjun Patel',paymentMethod:'Pending'});doctorModule.closeModal();showPage('doctorQueue');window.showToast&&showToast('Walk-in visit added to today’s queue.');}),
    closeModal:()=>{const el=document.getElementById('doctorModuleModal');if(el)el.remove();}
  };
  const followupsNav = document.getElementById('navSettings');
  if(followupsNav){
    followupsNav.title='Follow-ups';
    const label=followupsNav.querySelector('.nav-label'); if(label) label.textContent='Follow-ups';
  }
  // Encounter-scoped mock state. Signed snapshots are copied, never used as editable objects.
  const clone = value => JSON.parse(JSON.stringify(value));
  const todayISO = () => {const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;};
  const stamp = () => new Date().toLocaleString('en-IN',{day:'2-digit',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'});
  let entitySequence=0;
  const entityId = prefix => `${prefix}-${Date.now()}-${++entitySequence}`;
  let savedAvailability={...state.availability},savedPreferences={...state.bookingPreferences};
  function bookingError(date,time,mode){
    if(!date||!time)return 'Choose an appointment date and time.';
    const day=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][new Date(date+'T00:00:00').getDay()];
    const days=Math.round((new Date(date+'T00:00:00')-new Date(todayISO()+'T00:00:00'))/86400000);
    const [h,m]=time.split(':').map(Number),minutes=h*60+m,duration=Number(savedPreferences.duration);
    if(days<0)return 'Choose today or a future appointment date.';
    if(days>Number(savedPreferences.advance))return `Bookings are limited to ${savedPreferences.advance} days ahead.`;
    if(!savedAvailability[day])return `${day} is unavailable in your saved availability.`;
    if(!savedPreferences[mode])return 'This consultation mode is disabled in saved Availability.';
    if(![[600,780],[1020,1200]].some(([start,end])=>minutes>=start&&minutes+duration<=end&&(minutes-start)%duration===0))return `Choose a ${duration}-minute slot within 10:00 AM–1:00 PM or 5:00 PM–8:00 PM.`;
    return '';
  }
  function createAppointment(p,date,time,type,override=false,followup=null){
    const [h,m]=time.split(':').map(Number),display=String((h+11)%12+1).padStart(2,'0')+':'+String(m).padStart(2,'0')+' '+(h>=12?'PM':'AM');
    const visit={...p,visitId:entityId('VISIT'),date,time:display,type,freq:'Scheduled',freqIcon:'cal',action:date===todayISO()?'active':'upcoming',status:date===todayISO()?'Ready':'Scheduled',paid:true,doctor:'Dr. Arjun Patel',paymentMethod:'Pending',reason:followup?.reason||'Clinical consultation',followupId:followup?.id||null,duration:Number(savedPreferences.duration)};
    if(override)visit.availabilityOverride={by:'Dr. Arjun Patel',at:stamp(),constraint:bookingError(date,time,type)};
    queue.push(visit);fullQueueData.push({...visit});return visit;
  }
  let workspaceKey=null, workspaceVisit=null, workspaceSigned=false;
  const completionButton=document.querySelector('#page-consultation button[onclick="confirmCompleteConsultation()"]');
  const completionButtonHTML=completionButton?.innerHTML;
  function resetWorkspaceAction(){
    document.getElementById('consultationAmendmentBanner')?.remove();
    if(completionButton){completionButton.innerHTML=completionButtonHTML;completionButton.onclick=()=>confirmCompleteConsultation();}
    resetCompletionCopy();
  }
  function consultTextareas(){return Array.from(document.querySelectorAll('#panelClinicalNotes textarea'));}
  function captureConsultationContent(){
    const fields=consultTextareas();
    return {
      complaints:fields[0]?.value.trim()||'',history:fields[1]?.value.trim()||'',
      findings:document.querySelector('#panelFindings textarea')?.value.trim()||'',
      treatment:document.querySelector('#panelTreatment textarea')?.value.trim()||'',
      diagnosis:getDxForUhid(currentPatientUhid).map(d=>d.desc).join('; '),
      diagnoses:clone(getDxForUhid(currentPatientUhid).map(({code,desc,primary,status})=>({code,desc,primary,status}))),
      medications:Array.from(document.querySelectorAll('#medCardsWrap .med-card')).map(card=>({
        drug:card.querySelector('.med-card-name')?.value.trim()||'',form:card.querySelector('.med-form')?.value||'Tablet',
        strength:card.querySelector('.med-strength')?.value.trim()||'',frequency:card.querySelector('.med-freq-input')?.value.trim()||'',
        duration:card.querySelector('.med-duration')?.value.trim()||'',route:card.querySelector('.med-route-input')?.value.trim()||'',
        instructions:card.querySelector('.med-card-instr')?.value.trim()||'',sos:card.querySelector('.med-sos-check')?.checked||false
      })).filter(m=>m.drug),
      instructions:Array.from(document.querySelectorAll('#piList input')).map(i=>i.value.trim()).filter(Boolean),
      tests:getLabOrdersForUhid(currentPatientUhid).map(({name,urgent,status})=>({name,urgent,status})),
      procedures:getProceduresForUhid(currentPatientUhid).map(({name})=>({name})),
      followup:{date:document.getElementById('dateValue')?.textContent.trim()||'Select date',type:document.getElementById('typeValue')?.textContent.trim()||'Select type',purpose:document.getElementById('followPurpose')?.value.trim()||'',priority:document.getElementById('followPriority')?.value||'Normal'}
    };
  }
  function applyConsultationContent(content={}){
    const fields=consultTextareas();if(fields[0])fields[0].value=content.complaints||'';if(fields[1])fields[1].value=content.history||'';
    document.querySelector('#panelFindings textarea').value=content.findings||'';
    document.querySelector('#panelTreatment textarea').value=content.treatment||'';
    dxAddedAll=dxAddedAll.filter(d=>d.uhid!==currentPatientUhid);
    const diagnoses=content.diagnoses||(content.diagnosis?[{code:'LOCAL',desc:content.diagnosis,primary:true,status:'provisional'}]:[]);
    diagnoses.forEach(d=>dxAddedAll.push({...clone(d),uhid:currentPatientUhid}));renderDxChips();
    labOrdersAll=labOrdersAll.filter(d=>d.uhid!==currentPatientUhid);
    (content.tests||[]).forEach(d=>labOrdersAll.push({...clone(d),id:labOrderIdCounter++,uhid:currentPatientUhid,patientName:byUhid(currentPatientUhid).name,date:stamp()}));renderLabOrders();
    proceduresAll=proceduresAll.filter(d=>d.uhid!==currentPatientUhid);
    (content.procedures||[]).forEach(d=>proceduresAll.push({...clone(d),id:procedureIdCounter++,uhid:currentPatientUhid,date:stamp()}));renderProcedures();
    document.getElementById('medCardsWrap').innerHTML='';medRowCounter=0;
    (content.medications||[]).forEach(m=>{addMedRow();const card=Array.from(document.querySelectorAll('#medCardsWrap .med-card')).pop();
      for(const [key,selector] of Object.entries({drug:'.med-card-name',form:'.med-form',strength:'.med-strength',frequency:'.med-freq-input',duration:'.med-duration',route:'.med-route-input',instructions:'.med-card-instr'})){const el=card.querySelector(selector);if(el)el.value=m[key]||'';}
      const sos=card.querySelector('.med-sos-check');if(sos)sos.checked=!!m.sos;
      syncCustomFrequency(Number(card.id.replace('medCard','')),m.frequency||'');
    });
    if(!(content.medications||[]).length)addMedRow();
    document.getElementById('piList').innerHTML='';(content.instructions?.length?content.instructions:['']).forEach(addInstructionRow);
    clearFollowUpDate();clearFollowUpType();
    const f=content.followup||{};
    document.getElementById('dateValue').textContent=f.date||'Select date';document.getElementById('typeValue').textContent=f.type||'Select type';
    document.getElementById('followPurpose').value=f.purpose||'';document.getElementById('followPriority').value=f.priority||'Normal';
  }
  const normalize = value => typeof value==='string'?value.trim().replace(/\s+/g,' '):Array.isArray(value)?value.map(normalize):value&&typeof value==='object'?Object.fromEntries(Object.keys(value).sort().map(k=>[k,normalize(value[k])])):value;
  const orderSignature = content => JSON.stringify(normalize({medications:content?.medications||[],instructions:content?.instructions||[]}));
  function readableClinicalValue(key,value){
    if(typeof value==='string')return value||'—';
    if(key==='medications')return value.map(m=>[m.drug,m.strength,m.form,m.frequency,m.route,m.duration,m.instructions,m.sos?'As needed':''].filter(Boolean).join(' · ')).join('; ')||'No medications';
    if(key==='diagnoses')return value.map(d=>[d.desc,d.status,d.primary?'Primary':''].filter(Boolean).join(' · ')).join('; ')||'No diagnoses';
    if(key==='tests')return value.map(t=>[t.name,t.urgent?'Urgent':'',t.status].filter(Boolean).join(' · ')).join('; ')||'No tests';
    if(key==='procedures')return value.map(p=>p.name).join('; ')||'No procedures';
    if(key==='followup')return [value.date,value.type,value.purpose,value.priority].filter(Boolean).join(' · ');
    return value.join('; ')||'None recorded';
  }
  function contentDiff(before={},after={}){
    const fields=[['Clinical notes','complaints'],['History','history'],['Findings','findings'],['Diagnosis','diagnoses'],['Treatment plan','treatment'],['Medication plan','medications'],['Patient instructions','instructions'],['Tests','tests'],['Procedures','procedures'],['Follow-up','followup']];
    return fields.flatMap(([label,key])=>{const fallback=key==='followup'?{date:'Select date',type:'Select type',purpose:'',priority:'Normal'}:['diagnoses','medications','instructions','tests','procedures'].includes(key)?[]:'';
      const from=normalize(before[key]??fallback),to=normalize(after[key]??fallback);
      return JSON.stringify(from)===JSON.stringify(to)?[]:[{label,from:readableClinicalValue(key,from),to:readableClinicalValue(key,to)}];});
  }
  function contentSummary(c){return [c.complaints,c.findings,c.diagnosis,c.treatment,c.history].filter(Boolean).join(' · ')||'Clinical consultation completed.';}
  function contentChanges(a,b){return contentDiff(a,b).map(d=>`${d.label} updated`).join('; ');}
  const basePopulateConsultation=window.populateConsultation;
  function saveWorkspace(){if(workspaceKey&&!workspaceSigned)state.consultationDrafts[workspaceKey]=captureConsultationContent();}
  window.populateConsultation=function(p){
    saveWorkspace();
    const amendment=state.activeAmendment;
    workspaceKey=amendment?'amendment:'+amendment.id:p.visitId||'visit:'+p.uhid;
    workspaceVisit=amendment?null:p;workspaceSigned=false;
    const result=basePopulateConsultation.apply(this,arguments);
    renderConsultHeaderVitals(currentPatientRecord?.vitals||null);
    const source=amendment?consultationFor(amendment.id):null;
    const content=clone(state.consultationDrafts[workspaceKey]||source?.clinicalContent||{});
    const call=window.callConsultationDrafts?.[p.visitId||p.uhid];
    if(call&&!amendment){
      for(const key of ['complaints','findings','treatment'])if(call[key])content[key]=content[key]&&content[key]!==call[key]?content[key]+'\n'+call[key]:call[key];
      if(call.diagnosis){content.diagnoses=content.diagnoses||[];if(!content.diagnoses.some(d=>d.desc===call.diagnosis))content.diagnoses.push({code:entityId('LOCAL'),desc:call.diagnosis,primary:!content.diagnoses.length,status:'provisional'});}
      delete window.callConsultationDrafts[p.visitId||p.uhid];
    }
    applyConsultationContent(content);
    document.activeElement?.blur();window.scrollTo(0,0);
    if(!amendment)resetWorkspaceAction();
    if(call)showToast('Call notes were copied into Consultation Notes. Review and complete the record.');
    return result;
  };
  const baseSaveConsultationDraft=window.saveConsultationDraft;
  window.saveConsultationDraft=function(){saveWorkspace();return baseSaveConsultationDraft.apply(this,arguments);};
  window.completeConsultation=function(){
    if(workspaceSigned)return;
    const amendment=state.activeAmendment,source=amendment?consultationFor(amendment.id):null;
    const content=captureConsultationContent(),uhid=currentPatientUhid;
    if(source&&!contentDiff(source.clinicalContent,content).length){showToast('Make a clinical change before signing an amendment.',true);return;}
    if(source&&source.uhid!==uhid){showToast('Patient context does not match the amendment.',true);return;}
    const id=entityId('CON'),signedAt=stamp();
    const record={id,uhid,visitId:source?.visitId||workspaceVisit?.visitId||null,rootConsultationId:source?.rootConsultationId||source?.id||id,date:new Date().toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'numeric'}),signedAt,signedBy:'Dr. Arjun Patel',type:source?.type||({video:'Video',audio:'Audio'}[workspaceVisit?.type]||'In clinic'),reason:source?.reason||workspaceVisit?.reason||visitReason(uhid),diagnosis:content.diagnosis||'Clinical review',status:'Signed',version:source?source.version+1:1,summary:contentSummary(content),clinicalContent:clone(content),prescriptionIds:source?[...source.prescriptionIds]:[]};
    if(source){record.supersedesId=source.id;record.amendmentReason=amendment.reason;record.changeDetails=contentDiff(source.clinicalContent,content);record.changeSummary=contentChanges(source.clinicalContent,content);source.status='Superseded';source.supersededBy=id;}
    const changedOrder=!source||orderSignature(source.clinicalContent)!==orderSignature(content);
    if(changedOrder&&(content.medications.length||source?.prescriptionIds.length)){
      const previous=source?.prescriptionIds.map(rxById).filter(Boolean)||[],rxIdValue=entityId('RX');
      const rx={id:rxIdValue,prescriptionId:rxIdValue,uhid,patientName:byUhid(uhid).name,consultationId:id,rootPrescriptionId:previous[0]?.rootPrescriptionId||previous[0]?.id||rxIdValue,parentPrescriptionId:previous[0]?.id||null,date:record.date,issuedAt:signedAt,doctor:record.signedBy,status:previous.length?'Revised':'Issued',diagnosis:record.diagnosis,medsList:clone(content.medications),medications:content.medications.map(m=>`${m.drug} ${m.strength} — ${m.frequency}, ${m.duration}`).join('; '),instructions:content.instructions.join('; '),followUp:content.followup.date==='Select date'?'':content.followup.date};
      previous.forEach(p=>{p.status='Superseded';p.replacementPrescriptionId=rx.id;});prescriptionsList.unshift(rx);record.prescriptionIds=[rx.id];
    }
    if(!source){
      const visit=workspaceVisit||{},fee=typeof FEE_BY_TYPE!=='undefined'?(FEE_BY_TYPE[visit.type]||500):500;
      const charges=typeof getBillCharges==='function'?clone(getBillCharges(uhid)):[];
      record.bill={id:'BILL-'+id,consultationId:id,uhid,patientName:byUhid(uhid).name,date:signedAt,items:[{desc:record.type+' consultation',amount:fee},...charges],paymentStatus:visit.exceptionApproved?'Deferred':visit.paid&&visit.paymentMethod!=='Pending'?'Paid':'Pending',paymentMethod:visit.paymentMethod||'Not recorded'};
    }else record.bill=source.bill?clone(source.bill):null;
    state.completedConsultations.unshift(record);state.lastCompletedId=id;
    const f=content.followup;
    if(f.date!=='Select date'&&(!source||JSON.stringify(source.clinicalContent.followup)!==JSON.stringify(f)))state.followups.unshift({id:entityId('F'),uhid,consultationId:id,reportId:null,reason:f.purpose||'Follow-up consultation',due:f.date,priority:f.priority,status:'open',appointment:{status:'Not booked'}});
    if(!source&&workspaceVisit){[queue,fullQueueData].forEach(arr=>arr.forEach(v=>{if(v.visitId===workspaceVisit.visitId){v.status='completed';v.action='completed';}}));const followup=state.followups.find(f=>f.appointmentId===workspaceVisit.visitId);if(followup){followup.status='closed';followup.closure={note:'Follow-up consultation completed',by:record.signedBy,at:signedAt};}}
    workspaceSigned=true;delete state.consultationDrafts[workspaceKey];state.activeAmendment=null;resetWorkspaceAction();
    document.getElementById('ccDuration').textContent='—';document.getElementById('ccDateTime').textContent=signedAt;document.getElementById('ccDoctor').textContent=record.signedBy;
    if(source){document.querySelector('#completeOverlay .complete-title').textContent='Consultation Amendment Signed';document.querySelector('#completeOverlay .complete-sub').textContent='A new signed consultation version has been saved. The original record remains available in the patient history.';}
    document.getElementById('completeOverlay').classList.add('open');
  };
  window.ccViewSummary=function(){closeCompleteModal();if(state.lastCompletedId)doctorModule.consultationDetail(state.lastCompletedId);};
  window.ccGenerateBill=function(){
    const record=consultationFor(state.lastCompletedId),bill=record?.bill;
    if(!bill){showToast('No bill is recorded for this historical consultation.',true);return;}
    closeCompleteModal();document.getElementById('doctorBillModal')?.remove();
    const overlay=document.createElement('div');overlay.id='doctorBillModal';overlay.className='dw-modal';
    const money=value=>Number(value).toLocaleString('en-IN',{style:'currency',currency:'INR'});
    overlay.innerHTML=`<div class="dw-modal-box" role="dialog" aria-modal="true" aria-labelledby="doctorBillTitle"><h2 id="doctorBillTitle">Consultation bill</h2><p class="dw-sub">CityCare Clinic · Mock bill</p><div class="doctor-bill-meta"><div><b>${esc(bill.patientName)}</b><br>${esc(bill.uhid)}</div><div>${esc(bill.id)}<br>${esc(bill.date)}</div><div>Consultation<br>${esc(bill.consultationId)}</div><div>Payment: ${esc(bill.paymentStatus)}<br>${esc(bill.paymentMethod)}</div></div>${bill.items.map(item=>`<div class="doctor-bill-row"><span>${esc(item.desc)}</span><span>${money(item.amount)}</span></div>`).join('')}<div class="doctor-bill-row doctor-bill-total"><span>Total</span><span>${money(bill.items.reduce((total,item)=>total+Number(item.amount),0))}</span></div><div class="dw-modal-foot"><button class="dw-btn" id="doctorBillClose">Close</button><button class="dw-btn primary" id="doctorBillPrint">Print bill</button></div></div>`;
    document.body.append(overlay);
    const close=()=>{overlay.remove();document.getElementById('completeOverlay').classList.add('open');};
    overlay.querySelector('#doctorBillClose').onclick=close;
    overlay.onkeydown=event=>{if(event.key==='Escape')close();};
    overlay.querySelector('#doctorBillPrint').onclick=()=>{overlay.querySelector('h2').textContent='Bill print preview';overlay.querySelector('#doctorBillPrint').textContent='Print';overlay.querySelector('#doctorBillPrint').onclick=()=>window.print();};
    overlay.querySelector('#doctorBillClose').focus();
  };
  document.addEventListener('click',event=>{const row=event.target.closest?.('#completeOverlay .wn-row');if(row?.textContent.includes('View Consultation Summary')){event.preventDefault();event.stopImmediatePropagation();window.ccViewSummary();}},true);
  connectHistoricalPrescriptions();
  const visitIds=new Map();
  [queue,fullQueueData].forEach(arr=>arr.forEach(v=>{v.date=v.date||todayISO();const key=[v.uhid,v.date,v.time,v.type].join('|');if(!visitIds.has(key))visitIds.set(key,entityId('VISIT'));v.visitId=v.visitId||visitIds.get(key);}));
  state.completedConsultations.forEach(c=>{
    c.visitId=c.visitId||'VISIT-'+c.id;c.rootConsultationId=c.rootConsultationId||c.id;
    const r=c.prescriptionIds.map(rxById).find(Boolean),content=c.clinicalContent;
    content.diagnoses=[{code:'LOCAL',desc:content.diagnosis,primary:true,status:'provisional'}];
    content.medications=r?rxMeds(r).map(m=>({...m,sos:false})):[];
    content.instructions=r?.instructions?[r.instructions]:[];content.tests=[];content.procedures=[];
    content.followup={date:'Select date',type:'Select type',purpose:'',priority:'Normal'};
  });
  doctorDashboard();
})();
