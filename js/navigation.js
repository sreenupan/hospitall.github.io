  function showPage(name){
    document.getElementById('page-dashboard').style.display = (name==='dashboard') ? '' : 'none';
    document.getElementById('page-consultation').style.display = (name==='consultation') ? '' : 'none';
    document.getElementById('page-queue').style.display = (name==='queue') ? '' : 'none';
    document.getElementById('page-reception').style.display = (name==='reception') ? '' : 'none';
    document.getElementById('page-adminOverview').style.display = (name==='adminOverview') ? '' : 'none';
    document.getElementById('page-patients').style.display = (name==='patients') ? '' : 'none';
    document.getElementById('page-prescriptions').style.display = (name==='prescriptions') ? '' : 'none';
    document.getElementById('page-reports').style.display = (name==='reports') ? '' : 'none';
    document.getElementById('page-settings').style.display = (name==='settings') ? '' : 'none';
    document.getElementById('navDashboard').classList.toggle('active', name==='dashboard' || name==='queue' || name==='consultation');
    document.getElementById('navReception').classList.toggle('active', name==='reception' || name==='adminOverview');
    document.getElementById('navPatients').classList.toggle('active', name==='patients');
    document.getElementById('navPrescriptions').classList.toggle('active', name==='prescriptions');
    document.getElementById('navReports').classList.toggle('active', name==='reports');
    document.getElementById('navSettings').classList.toggle('active', name==='settings');
    if(name==='dashboard') renderQueue(dashTypeFilter);
    if(name==='queue') renderFullQueue();
    if(name==='reception'){ resetReceptionForm(); }
    if(name==='adminOverview'){ renderAdminOverview(); }
    if(name==='patients'){ renderPatientsDirectory(); }
    if(name==='prescriptions'){ renderPrescriptionsList(); }
    if(name==='reports'){ renderReports(); }
    window.scrollTo(0,0);
  }

  function renderAdminOverview(){
    const paidToday = fullQueueData.filter(p=>p.paid);
    const revenue = paidToday.reduce((sum,p)=> sum + (FEE_BY_TYPE[p.type]||500), 0);
    const exceptions = fullQueueData.filter(p=>p.exceptionApproved).length + queue.filter(p=>p.exceptionApproved).length;
    document.getElementById('adminRevenue').textContent = 'â‚¹'+revenue.toLocaleString('en-IN');
    document.getElementById('adminCheckedIn').textContent = paidToday.length;
    document.getElementById('adminExceptions').textContent = exceptions;
    document.getElementById('adminStaffCount').textContent = staffList.length + doctorList.length;
    renderAdminStaffList();
  }

  const queue = [
    {time:'09:00 AM', name:'Rahul Sharma', uhid:'HSP24-00123', age:34, gender:'Male', phone:'98765 43210', type:'clinic', freq:'Twice / Year', freqIcon:'cal', action:'active', paid:true, doctor:'Dr. Arjun Patel', paymentMethod:'Cash'},
    {time:'09:30 AM', name:'Priya Mehta', uhid:'HSP24-00124', age:31, gender:'Female', phone:'91234 56780', type:'video', freq:'Monthly (1 visit)', freqIcon:'cal', action:'active', paid:true, doctor:'Dr. Arjun Patel', paymentMethod:'Card'},
    {time:'10:00 AM', name:'Amit Verma', uhid:'HSP24-00125', age:52, gender:'Male', phone:'99887 66554', type:'audio', freq:'Monthly (1 visit)', freqIcon:'cal', action:'active', paid:true, doctor:'Dr. Arjun Patel', paymentMethod:'UPI'},
    {time:'10:30 AM', name:'Sunita Rao', uhid:'HSP24-00126', age:38, gender:'Female', phone:'90909 12345', type:'clinic', freq:'First Visit', freqIcon:'star', action:'active', paid:true, doctor:'Dr. Arjun Patel', paymentMethod:'Cash'},
    {time:'11:00 AM', name:'Vikram Singh', uhid:'HSP24-00127', age:29, gender:'Male', phone:'98123 45670', type:'video', freq:'Quarterly', freqIcon:'cal', action:'upcoming', caption:'Join opens 15 min before', paid:true, doctor:'Dr. Arjun Patel', paymentMethod:'Card'}
  ];

  const chipColors=['#2563EB','#7C3AED','#0D9488','#D97706','#DC2626','#4F46E5'];
  function initials(name){ return name.split(' ').map(w=>w[0]).slice(0,2).join('').toUpperCase(); }

  // Toggle a collapsible sidebar card. Updates the body visibility + the
  // header's aria-expanded so the chevron affordance rotates via CSS.
  function toggleCard(headEl, bodyId, displayWhenOpen){
    var body = document.getElementById(bodyId);
    if(!body) return;
    var isOpen = body.style.display !== 'none';
    body.style.display = isOpen ? 'none' : (displayWhenOpen || 'block');
    headEl.setAttribute('aria-expanded', isOpen ? 'false' : 'true');
  }

  // Clinical flag on the queue: red dot if the patient has recorded drug allergies (Task 10.1).
  function allergyDot(uhid){
    var rec = (typeof getPatientRecord==='function') ? getPatientRecord(uhid) : null;
    if(rec && rec.allergies && rec.allergies.length>0){
      return ' <span title="Has recorded drug allergies" style="display:inline-block;width:7px;height:7px;border-radius:50%;background:var(--danger);vertical-align:middle;margin-left:2px;"></span>';
    }
    return '';
  }
  function chipColor(name){ let h=0; for(const c of name) h+=c.charCodeAt(0); return chipColors[h%chipColors.length]; }

  const typeMeta={
    clinic:{cls:'clinic', label:'In Clinic', icon:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3"><path d="M3 10l9-7 9 7v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>'},
    video:{cls:'video', label:'Video', icon:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3"><rect x="2" y="6" width="14" height="12" rx="2"/><path d="M22 8.5l-6 3.5 6 3.5z"/></svg>'},
    audio:{cls:'audio', label:'Audio', icon:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.68 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.9.32 1.85.55 2.81.68A2 2 0 0 1 22 16.92z"/></svg>'},
    walkin:{cls:'walkin', label:'Walk-in', icon:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M15 12H3"/></svg>'}
  };

  let dashTypeFilter='all'; // quick tab shortcut, same override pattern as the Full Queue page
  let dashSearch='';
  function defaultDashFilters(){
    return { types: new Set(['clinic','video','audio']), freq: new Set(['first','monthly','quarterly','twiceyear']) };
  }
  let dashFilters = defaultDashFilters();

  function dashFreqCategoryOf(freqText){
    if(freqText==='First Visit') return 'first';
    if(freqText.indexOf('Monthly')===0) return 'monthly';
    if(freqText==='Quarterly') return 'quarterly';
    if(freqText==='Twice / Year') return 'twiceyear';
    return null;
  }
  function dashMatchesFilters(p, filters){
    if(!filters.types.has(p.type)) return false;
    const fc = dashFreqCategoryOf(p.freq);
    if(fc && !filters.freq.has(fc)) return false;
    return true;
  }
  function getFilteredDashQueue(tabFilter){
    return queue.filter(p=>{
      if(!(p.paid || p.exceptionApproved)) return false; // doctor never sees an unpaid patient â€” full stop
      if(currentSessionRole==='doctor' && p.doctor!==currentDoctorIdentity) return false; // each doctor sees only their own patients
      if(tabFilter!=='all' && p.type!==tabFilter) return false;
      if(!dashMatchesFilters(p, dashFilters)) return false;
      if(dashSearch){
        const s=dashSearch.toLowerCase();
        if(!p.name.toLowerCase().includes(s) && !p.uhid.toLowerCase().includes(s)) return false;
      }
      return true;
    });
  }

  function renderQueue(filter){
    dashTypeFilter = filter;
    const body=document.getElementById('queueBody');
    body.innerHTML='';

    const greetingEl = document.getElementById('dashGreeting');
    if(greetingEl){
      greetingEl.textContent = currentSessionRole==='doctor' ? ('Good morning, '+currentDoctorIdentity) : 'Good morning!';
    }

    const payable = queue.filter(p=>(p.paid||p.exceptionApproved) && (currentSessionRole!=='doctor' || p.doctor===currentDoctorIdentity));
    document.getElementById('dashCountAll').textContent = payable.length;
    document.getElementById('dashCountClinic').textContent = payable.filter(p=>p.type==='clinic').length;
    document.getElementById('dashCountVideo').textContent = payable.filter(p=>p.type==='video').length;
    document.getElementById('dashCountAudio').textContent = payable.filter(p=>p.type==='audio').length;

    const rows = getFilteredDashQueue(filter);
    rows.forEach(p=>{
      const i = queue.indexOf(p);
      const tm=typeMeta[p.type];
      const isFirst = p.freqIcon==='star';

      let actionHtml='';
      if(p.action==='active'){
        if(p.type==='clinic'){
          actionHtml=`<div class="abtn abtn-primary" onclick="requestStartConsultation(queue[${i}],'notes')">Start Consultation</div>`;
        }else if(p.type==='video'){
          actionHtml=`<div class="abtn abtn-video" onclick="requestStartConsultation(queue[${i}],'video')">Join Video</div>`;
        }else{
          actionHtml=`<div class="abtn abtn-audio" onclick="requestStartConsultation(queue[${i}],'audio')">Join Audio</div>`;
        }
      }else{
        actionHtml=`<div class="abtn abtn-ghost" onclick="requestStartConsultation(queue[${i}],'notes')">View Details</div><div class="abtn-caption">${p.caption||''}</div>`;
      }

      const row=document.createElement('tr');
      row.innerHTML=`
        <td><div class="cell-time">${p.time}${p.action==='upcoming'?'<span class="cap">Upcoming</span>':''}</div></td>
        <td>
          <div class="p-row">
            <div class="p-chip" style="background:${chipColor(p.name)}">${initials(p.name)}</div>
            <div>
              <div class="p-name link-name" onclick="event.stopPropagation();openMedicalProfile('${p.uhid}')">${p.name}${allergyDot(p.uhid)}</div>
              <div class="p-sub"><span class="link-uhid" onclick="event.stopPropagation();openAdminProfile('${p.uhid}')">UHID: ${p.uhid}</span> &nbsp;Â·&nbsp; ${p.age}Y &nbsp;Â·&nbsp; ${p.gender}</div>
            </div>
          </div>
        </td>
        <td><span class="mtag ${tm.cls}">${tm.icon}${tm.label}</span></td>
        <td><span class="ftag ${isFirst?'first':''}">${isFirst?'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.9 6.6L22 9.3l-5 4.9L18.2 22 12 18.3 5.8 22 7 14.2l-5-4.9 7.1-.7z"/></svg>':''}${p.freq}</span></td>
        <td>${actionHtml}</td>
        <td><div class="dots-btn" onclick="openRowMenu(event, queue[${i}])"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="5" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="19" r="1.5"/></svg></div></td>
      `;
      body.appendChild(row);
    });
  }

  function filterQueue(el,type){
    document.querySelectorAll('#page-dashboard .qtab').forEach(t=>t.classList.remove('active'));
    el.classList.add('active');
    dashFilters = defaultDashFilters(); // quick tab takes over as the sole filter, same pattern as Full Queue
    renderQueue(type);
  }

  function onDashSearch(){
    dashSearch = document.getElementById('dashSearchInput').value;
    renderQueue(dashTypeFilter);
  }

  function readDashFilterPanelDom(){
    return {
      types: new Set(Array.from(document.querySelectorAll('.dash-type:checked')).map(b=>b.value)),
      freq: new Set(Array.from(document.querySelectorAll('.dash-freq:checked')).map(b=>b.value))
    };
  }
  function syncDashFilterPanelFromState(){
    document.querySelectorAll('.dash-type').forEach(b=>b.checked=dashFilters.types.has(b.value));
    document.querySelectorAll('.dash-freq').forEach(b=>b.checked=dashFilters.freq.has(b.value));
  }
  function previewDashFilterCount(){
    const draft = readDashFilterPanelDom();
    const n = queue.filter(p=>dashMatchesFilters(p, draft)).length;
    document.getElementById('dashFilterMatchCount').innerHTML = '<b>'+n+'</b> patient'+(n===1?'':'s')+' match';
  }
  function applyDashFilters(){
    dashFilters = readDashFilterPanelDom();
    dashTypeFilter='all';
    document.querySelectorAll('#page-dashboard .qtab').forEach(t=>t.classList.remove('active'));
    document.querySelector('#page-dashboard .qtab[data-filter="all"]').classList.add('active');
    closeFloatMenu('dashFilterMenu');
    renderQueue('all');
  }
  function clearDashFilters(){
    document.querySelectorAll('.dash-type, .dash-freq').forEach(b=>b.checked=true);
    previewDashFilterCount();
  }
  function toggleDashFilterMenu(e){
    e.stopPropagation();
    const menu=document.getElementById('dashFilterMenu');
    if(menu.classList.contains('open')){ closeFloatMenu('dashFilterMenu'); return; }
    syncDashFilterPanelFromState();
    previewDashFilterCount();
    openFloatMenuNear('dashFilterMenu', e.currentTarget, true);
  }

  let currentPatientUhid = null;
  function populateConsultation(p){
    const name = p.name;
    currentPatientUhid = p.uhid;
    // Bind the per-patient MOCK clinical record (Task 1.3).
    currentPatientRecord = (typeof getPatientRecord==='function') ? getPatientRecord(p.uhid) : null;
    const rec = currentPatientRecord;
    const ini = initials(name);
    document.getElementById('patientName').textContent = name;
    document.getElementById('patientPhoto').textContent = ini;

    // Keep the header scan-friendly: detailed identity data is available from
    // the adjacent Patient details control in this UX prototype.
    const bits=['<span class="link-uhid" onclick="openAdminProfile(\''+p.uhid+'\')">'+p.uhid+'</span>', p.age+'Y', p.gender, (rec&&rec.bloodGroup?rec.bloodGroup:(p.bloodGroup||'B+'))];
    document.getElementById('patientSub').innerHTML = bits.join(' &nbsp;\u00B7&nbsp; ');

    // Inline vitals in header + allergy banner + sidebar sections
    if(rec) renderConsultHeaderVitals(rec.vitals);
    renderAllergyBanner(rec);
    renderCurrentMeds(rec);
    renderHealthConditions(rec);
    renderMedicalRecords(rec);
    renderHabits(rec);

    var startEl = document.getElementById('startedValue');
    if(startEl) startEl.textContent = p.time;
    const physEl = document.getElementById('patientPhysician');
    if(physEl) physEl.textContent = p.doctor || 'Dr. Arjun Patel';
    renderPrevConsultations(name);
    renderLabOrders();
    if(typeof renderProcedures==='function') renderProcedures();
    renderDxChips();
    if(document.getElementById('medCardsWrap') && document.getElementById('medCardsWrap').children.length===0) addMedRow();
    if(document.getElementById('piList') && document.getElementById('piList').children.length===0) addInstructionRow();

    const payEl = document.getElementById('patientPaymentStatus');
    if(payEl){
      if(p.exceptionApproved){
        payEl.innerHTML = '<span style="width:6px;height:6px;border-radius:50%;background:var(--warning);display:inline-block;"></span>Exception';
        payEl.style.color = 'var(--warning)';
        payEl.title = 'Approved by '+(p.exceptionAdmin||'admin')+': '+(p.exceptionReason||'');
      }else if(p.paid){
        payEl.innerHTML = '<span style="width:6px;height:6px;border-radius:50%;background:var(--success);display:inline-block;"></span>Paid';
        payEl.style.color = '';
        payEl.title = 'Payment already confirmed â€” paid at reception before visit';
      }else{
        payEl.innerHTML = '<span style="width:6px;height:6px;border-radius:50%;background:var(--danger);display:inline-block;"></span>Unpaid';
        payEl.style.color = 'var(--danger)';
        payEl.title = '';
      }
    }
    showPage('consultation');
  }
  function openConsultation(i){
    populateConsultation(queue[i]);
  }

  // ===== Per-patient consultation renderers (MOCK data driven) =====

  function schemeChipHtml(scheme){
    var color = scheme==='Aarogyasri' ? 'var(--teal)' : (scheme==='Ayushman Bharat' ? 'var(--violet)' : 'var(--ink-500)');
    var bg    = scheme==='Aarogyasri' ? 'var(--teal-50)' : (scheme==='Ayushman Bharat' ? 'var(--violet-50)' : 'var(--ink-100)');
    return '<span style="display:inline-block;font-size:10px;font-weight:700;color:'+color+';background:'+bg+';border-radius:99px;padding:1px 8px;">'+scheme+'</span>';
  }

  function renderConsultHeaderVitals(v){
    if(!v) return;
    var map = { hvTemp:v.temp+'\u00B0F', hvPulse:v.pulse, hvBp:v.bp, hvSpo2:v.spo2+'%', hvWt:v.weight+'kg', hvBmi:v.bmi };
    Object.keys(map).forEach(function(id){ var el=document.getElementById(id); if(el) el.textContent=map[id]; });
  }

  // Allergy banner — 3 states (Task 3.3, Correctness Property 1)
  function renderAllergyBanner(rec){
    var el = document.getElementById('allergyBanner');
    if(!el) return;
    var hasAllergies = rec && rec.allergies && rec.allergies.length>0;
    var confirmedNone = rec && rec.allergiesConfirmed && (!rec.allergies || rec.allergies.length===0);
    el.classList.remove('allergy-red','allergy-green','allergy-amber');
    var iconHtml, textHtml, actionLabel;
    if(hasAllergies){
      el.classList.add('allergy-red');
      iconHtml = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><path d="M12 9v4M12 17h.01"/></svg>';
      textHtml = '<b>Allergies:</b> ' + rec.allergies.map(function(a){ return a.substance+' <span style="opacity:.75;">('+a.severity+')</span>'; }).join(', ');
      actionLabel = 'Edit';
    }else if(confirmedNone){
      el.classList.add('allergy-green');
      iconHtml = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M20 6L9 17l-5-5"/></svg>';
      textHtml = 'No Known Drug Allergies <span style="opacity:.7;">(confirmed)</span>';
      actionLabel = 'Edit';
    }else{
      el.classList.add('allergy-amber');
      iconHtml = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>';
      textHtml = 'Allergies not recorded \u2014 please confirm with patient';
      actionLabel = 'Record';
    }
    el.innerHTML =
      '<div class="ab-icon">'+iconHtml+'</div>'+
      '<div class="ab-text">'+textHtml+'</div>'+
      '<div class="ab-action" onclick="openAllergyModal()">'+actionLabel+'</div>';
  }

  // Current Medications sidebar card (Task 6.1, Correctness Property 2)
  function renderCurrentMeds(rec){
    var body = document.getElementById('currentMedsBody');
    var countEl = document.getElementById('currentMedsCount');
    if(!body) return;
    var meds = (rec && rec.currentMeds) ? rec.currentMeds : [];
    if(countEl) countEl.textContent = meds.length;
    if(meds.length===0){ body.innerHTML = '<div class="pc-empty-note">No current medications on file.</div>'; return; }
    body.innerHTML = meds.map(function(m){
      return '<div style="display:flex;justify-content:space-between;gap:8px;padding:6px 0;border-bottom:1px solid var(--ink-100);font-size:12px;">'+
        '<span style="font-weight:600;color:var(--ink-900);">'+m.drug+' '+m.strength+'</span>'+
        '<span style="color:var(--ink-500);white-space:nowrap;">'+m.frequency+' \u00B7 '+m.since+'</span>'+
      '</div>';
    }).join('');
    // Also update the in-panel review strip if present
    var strip = document.getElementById('medReviewStrip');
    if(strip){
      if(meds.length>0){
        strip.style.display='flex';
        strip.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg>Patient is on '+meds.length+' chronic medication'+(meds.length===1?'':'s')+' \u2014 review before prescribing';
      }else{
        strip.style.display='none';
      }
    }
  }

  function renderHealthConditions(rec){
    var body = document.getElementById('healthCondBody');
    if(!body) return;
    var conds = (rec && rec.conditions) ? rec.conditions : [];
    var cnt = document.getElementById('healthCondCount'); if(cnt) cnt.textContent = conds.length;
    if(conds.length===0){ body.innerHTML='<div class="pc-empty-note">No chronic conditions on file.</div>'; return; }
    var palette=[['--warning-50','--warning-100','--warning'],['--danger-50','--danger-100','--danger'],['--violet-50','--violet-100','--violet']];
    body.innerHTML = '<div style="display:flex;flex-direction:column;gap:8px;">'+conds.map(function(c,i){
      var p=palette[i%palette.length];
      return '<div style="display:flex;align-items:center;justify-content:space-between;padding:8px 10px;background:var('+p[0]+');border:1px solid var('+p[1]+');border-radius:8px;">'+
        '<span style="font-size:12.5px;font-weight:600;color:var(--ink-900);">'+c.name+'</span>'+
        '<span style="font-size:11px;color:var(--ink-500);">Since '+c.since+'</span></div>';
    }).join('')+'</div>';
  }

  function renderMedicalRecords(rec){
    var body = document.getElementById('medicalRecordsBody');
    if(!body) return;
    var recs = (rec && rec.records) ? rec.records : [];
    var cnt = document.getElementById('medicalRecordsCount'); if(cnt) cnt.textContent = recs.length;
    if(recs.length===0){ body.innerHTML='<div class="pc-empty-note">No records uploaded.</div>'; return; }
    var color = {lab:['--primary-50','--primary'], rx:['--success-50','--success']};
    body.innerHTML = recs.map(function(r){
      var c = color[r.type]||['--ink-100','--ink-500'];
      return '<a href="#" onclick="return false;" style="display:flex;align-items:center;gap:10px;padding:8px 10px;border:1px solid var(--ink-100);border-radius:8px;text-decoration:none;">'+
        '<div style="width:30px;height:30px;border-radius:7px;background:var('+c[0]+');color:var('+c[1]+');display:flex;align-items:center;justify-content:center;flex-shrink:0;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/></svg></div>'+
        '<div style="flex:1;min-width:0;"><div style="font-size:12.5px;font-weight:600;color:var(--ink-900);">'+r.name+'</div><div style="font-size:11px;color:var(--ink-500);">'+r.date+'</div></div>'+
        '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--ink-400)" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg></a>';
    }).join('');
  }

  function renderHabits(rec){
    var body = document.getElementById('habitsBody');
    if(!body) return;
    var habits = (rec && rec.habits) ? rec.habits : [];
    var cnt = document.getElementById('habitsCount'); if(cnt) cnt.textContent = habits.length;
    if(habits.length===0){ body.innerHTML='<div class="pc-empty-note">No habit information on file.</div>'; return; }
    var statusColor = {Current:'--danger', Former:'--warning', Occasional:'--success', Never:'--ink-500'};
    body.innerHTML = habits.map(function(h){
      var col = statusColor[h.status]||'--ink-500';
      return '<div style="border:1px solid var(--ink-200);border-radius:9px;padding:10px 12px;">'+
        '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px;">'+
          '<span style="font-size:12.5px;font-weight:700;color:var(--ink-900);">'+h.substance+'</span>'+
          '<span style="font-size:11px;font-weight:700;color:var('+col+');">'+h.status+'</span></div>'+
        '<div style="font-size:11px;color:var(--ink-500);">'+h.frequency+' \u00B7 '+h.duration+(h.note&&h.note!=='\u2014'?' \u00B7 '+h.note:'')+'</div></div>';
    }).join('');
  }

  // Allergy modal (Task 3.3)
  function openAllergyModal(){
    var ov = document.getElementById('allergyModalOverlay');
    if(!ov) return;
    renderAllergyModalRows();
    var rec = currentPatientRecord;
    var chk = document.getElementById('allergyConfirmNone');
    if(chk) chk.checked = !!(rec && rec.allergiesConfirmed && (!rec.allergies || rec.allergies.length===0));
    ov.style.display='flex';
  }
  function closeAllergyModal(){ var ov=document.getElementById('allergyModalOverlay'); if(ov) ov.style.display='none'; }
  function renderAllergyModalRows(){
    var list = document.getElementById('allergyModalList');
    var rec = currentPatientRecord;
    if(!list) return;
    var rows = (rec && rec.allergies) ? rec.allergies : [];
    list.innerHTML = rows.map(function(a,i){
      return '<div class="allergy-row" data-i="'+i+'" style="display:grid;grid-template-columns:1fr 1fr 110px 28px;gap:8px;margin-bottom:8px;">'+
        '<input class="am-sub" value="'+ (a.substance||'').replace(/"/g,'&quot;') +'" placeholder="Substance">'+
        '<input class="am-react" value="'+ (a.reaction||'').replace(/"/g,'&quot;') +'" placeholder="Reaction">'+
        '<select class="am-sev"><option'+(a.severity==='mild'?' selected':'')+'>mild</option><option'+(a.severity==='moderate'?' selected':'')+'>moderate</option><option'+(a.severity==='severe'?' selected':'')+'>severe</option></select>'+
        '<div class="med-remove" onclick="this.parentElement.remove()" style="cursor:pointer;color:var(--danger);display:flex;align-items:center;justify-content:center;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3"><path d="M18 6L6 18M6 6l12 12"/></svg></div>'+
      '</div>';
    }).join('');
  }
  function addAllergyModalRow(){
    var list = document.getElementById('allergyModalList');
    if(!list) return;
    var div = document.createElement('div');
    div.className='allergy-row';
    div.style.cssText='display:grid;grid-template-columns:1fr 1fr 110px 28px;gap:8px;margin-bottom:8px;';
    div.innerHTML='<input class="am-sub" placeholder="Substance"><input class="am-react" placeholder="Reaction"><select class="am-sev"><option>mild</option><option>moderate</option><option>severe</option></select><div class="med-remove" onclick="this.parentElement.remove()" style="cursor:pointer;color:var(--danger);display:flex;align-items:center;justify-content:center;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3"><path d="M18 6L6 18M6 6l12 12"/></svg></div>';
    list.appendChild(div);
    var chk=document.getElementById('allergyConfirmNone'); if(chk) chk.checked=false;
  }
  function saveAllergyModal(){
    var rec = currentPatientRecord;
    if(!rec){ closeAllergyModal(); return; }
    var rows = Array.from(document.querySelectorAll('#allergyModalList .allergy-row'));
    var allergies = rows.map(function(r){
      return { substance:r.querySelector('.am-sub').value.trim(), reaction:r.querySelector('.am-react').value.trim(), severity:r.querySelector('.am-sev').value };
    }).filter(function(a){ return a.substance; });
    var confirmNone = document.getElementById('allergyConfirmNone');
    rec.allergies = allergies;
    rec.allergiesConfirmed = allergies.length===0 ? (confirmNone && confirmNone.checked) : true;
    renderAllergyBanner(rec);
    closeAllergyModal();
    if(typeof showToast==='function') showToast('Allergies updated.');
  }

  let currentRowMenuPatient=null;
  function openRowMenu(e,patient){
    e.stopPropagation();
    currentRowMenuPatient = patient;
    const menu=document.getElementById('rowMenu');
    document.getElementById('rmHead').textContent=patient.name;
    document.getElementById('rmPriorityLabel').textContent = patient.priority ? 'Remove Priority Flag' : 'Mark as Priority';
    const r=e.currentTarget.getBoundingClientRect();
    menu.style.top=(r.bottom+6)+'px';
    menu.style.left=Math.max(12,r.right-230)+'px';
    menu.classList.add('open');
  }
  document.addEventListener('click',function(e){
    if(!e.target.closest('#rowMenu')) document.getElementById('rowMenu').classList.remove('open');
  });

  // ---- Kebab menu actions ----
  function rmCloseMenu(){ document.getElementById('rowMenu').classList.remove('open'); }

  function rmViewProfile(){
    if(!currentRowMenuPatient) return;
    const uhid = currentRowMenuPatient.uhid;
    rmCloseMenu();
    showPage('patients');
    setTimeout(()=>{
      document.getElementById('ptSearchInput').value = currentRowMenuPatient.name;
      renderPatientsDirectory();
      const row = document.getElementById('ptRow-'+uhid);
      if(row) row.classList.add('open');
    }, 50);
  }
  function rmViewPrescriptions(){
    if(!currentRowMenuPatient) return;
    const name = currentRowMenuPatient.name;
    rmCloseMenu();
    showPage('prescriptions');
    setTimeout(()=>{
      document.getElementById('rxSearchInput').value = name;
      renderPrescriptionsList();
    }, 50);
  }
  function rmRescheduleAppointment(){
    if(!currentRowMenuPatient) return;
    const name = currentRowMenuPatient.name;
    rmCloseMenu();
    showToast('Opening reschedule for '+name+'\u2026');
    showPage('reception');
    setTimeout(()=>{
      document.getElementById('rcSearchInput').value = name;
      searchReceptionPatients();
      setRcWhenMode('later');
    }, 50);
  }
  function rmCancelAppointment(){
    if(!currentRowMenuPatient) return;
    const p = currentRowMenuPatient;
    rmCloseMenu();
    openConfirmModal(
      'Cancel appointment for '+p.name+'?',
      'This will mark their appointment as cancelled today. This can\u2019t be easily undone.',
      'Cancel Appointment',
      ()=>{
        [queue, fullQueueData].forEach(arr=>arr.forEach(x=>{ if(x.uhid===p.uhid) x.status='cancelled'; }));
        showToast(p.name+'\u2019s appointment has been cancelled.');
        if(document.getElementById('page-dashboard').style.display!=='none') renderQueue(dashTypeFilter);
        if(document.getElementById('page-queue').style.display!=='none') renderFullQueue();
      }
    );
  }
  function rmCallPatient(){
    if(!currentRowMenuPatient) return;
    const phone = (currentRowMenuPatient.phone||'').replace(/\s/g,'');
    rmCloseMenu();
    if(!phone){ showToast('No phone number on file.', true); return; }
    window.open('tel:'+phone, '_self');
  }
  function rmMessagePatient(){
    if(!currentRowMenuPatient) return;
    const p = currentRowMenuPatient;
    rmCloseMenu();
    toggleTopPanel({stopPropagation(){}, currentTarget:document.querySelector('[title="Quick Message"]')}, 'quickMsgPanel');
    setTimeout(()=>selectQuickMsgContact(p.uhid), 60);
  }
  function rmTogglePriority(){
    if(!currentRowMenuPatient) return;
    const p = currentRowMenuPatient;
    rmCloseMenu();
    const newState = !p.priority;
    [queue, fullQueueData].forEach(arr=>arr.forEach(x=>{ if(x.uhid===p.uhid) x.priority=newState; }));
    showToast(newState ? p.name+' marked as priority.' : 'Priority flag removed for '+p.name+'.');
    if(document.getElementById('page-dashboard').style.display!=='none') renderQueue(dashTypeFilter);
    if(document.getElementById('page-queue').style.display!=='none') renderFullQueue();
  }
  function rmMarkNoShow(){
    if(!currentRowMenuPatient) return;
    const p = currentRowMenuPatient;
    rmCloseMenu();
    openConfirmModal(
      'Mark '+p.name+' as a no-show?',
      'This records that the patient did not arrive for their scheduled visit today.',
      'Mark as No-Show',
      ()=>{
        [queue, fullQueueData].forEach(arr=>arr.forEach(x=>{ if(x.uhid===p.uhid) x.status='cancelled'; x.noShow=true; }));
        showToast(p.name+' marked as no-show.');
        if(document.getElementById('page-dashboard').style.display!=='none') renderQueue(dashTypeFilter);
        if(document.getElementById('page-queue').style.display!=='none') renderFullQueue();
      }
    );
  }

  function closeAllPanels(except){
    document.querySelectorAll('.follow-field').forEach(f=>{
      if(f.id!==except){
        const panel = f.querySelector('.dropdown-panel');
        const trigger = f.querySelector('.select-like');
        if(panel) panel.classList.remove('open');
        if(trigger) trigger.classList.remove('open');
      }
    });
  }
  // ================= CONSULTATION TABS: switching =================
