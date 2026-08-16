  function toggleSidebar(){
    document.querySelector('.app').classList.toggle('nav-collapsed');
  }

  // ================= LIVE TOPBAR CLOCK =================
  function updateTopbarClock(){
    const el = document.getElementById('topbarClock');
    if(!el) return;
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-US', {weekday:'short', day:'2-digit', month:'short'});
    let h = now.getHours(), m = now.getMinutes();
    const ap = h>=12 ? 'PM':'AM';
    h = h%12; if(h===0) h=12;
    const timeStr = String(h).padStart(2,'0')+':'+String(m).padStart(2,'0')+' '+ap;
    el.querySelector('.tc-date').textContent = dateStr;
    el.querySelector('.tc-time').textContent = timeStr;
  }
  setInterval(updateTopbarClock, 1000);
  updateTopbarClock();

  function toggleTopPanel(e, panelId){
    e.stopPropagation();
    const panel = document.getElementById(panelId);
    const wasOpen = panel.classList.contains('open');
    closeAllTopPanels();
    if(wasOpen) return;
    const r = e.currentTarget.getBoundingClientRect();
    panel.style.top = (r.bottom+8)+'px';
    panel.style.left = Math.max(12, r.right-360)+'px';
    panel.classList.add('open');
    if(panelId==='notifPanel') renderNotifications();
    if(panelId==='quickMsgPanel') renderQuickMsgResults();
    if(panelId==='schedulePanel') renderSchedule();
  }
  function closeAllTopPanels(){
    ['topUserMenu','notifPanel','quickMsgPanel','schedulePanel'].forEach(id=>{
      const el=document.getElementById(id);
      if(el) el.classList.remove('open');
    });
  }
  document.addEventListener('click', function(e){
    if(!e.target.closest('#topUserMenu') && !e.target.closest('#notifPanel') && !e.target.closest('#quickMsgPanel') && !e.target.closest('#schedulePanel')
       && !e.target.closest('.doctor') && !e.target.closest('.icon-btn')){
      closeAllTopPanels();
    }
    if(!e.target.closest('.search')){
      document.getElementById('gsResults').classList.remove('open');
    }
  });

  renderQueue('all');

  // ================= PATIENTS DIRECTORY =================
  function getAllPatientVisits(uhid){
    return fullQueueData.filter(p=>p.uhid===uhid);
  }
  function togglePatientRow(uhid){
    const row = document.getElementById('ptRow-'+uhid);
    document.querySelectorAll('.pt-row').forEach(r=>{ if(r!==row) r.classList.remove('open'); });
    if(row) row.classList.toggle('open');
  }
  function renderPatientsDirectory(){
    const q = (document.getElementById('ptSearchInput').value||'').toLowerCase().trim();
    const known = getKnownPatients();
    const filtered = known.filter(p=>!q || p.name.toLowerCase().includes(q) || p.uhid.toLowerCase().includes(q) || (p.phone||'').includes(q));
    document.getElementById('ptCountSub').textContent = filtered.length+' patient'+(filtered.length===1?'':'s')+(q?' matching your search':' on file');
    const list = document.getElementById('ptList');
    if(filtered.length===0){ list.innerHTML='<div class="rx-empty">No patients found.</div>'; return; }
    list.innerHTML = filtered.map(p=>{
      const visits = getAllPatientVisits(p.uhid);
      const visitCount = visits.length || 1;
      const visitRows = visits.length
        ? visits.map(v=>`<div class="pt-visit-row"><div class="pv-date">${v.time}</div><div class="pv-desc">${v.reason||v.freq}</div><div class="pv-doc">${v.doctor||''}</div></div>`).join('')
        : '<div class="pt-visit-row"><div class="pv-desc">No detailed visit records yet.</div></div>';
      return `
        <div class="pt-row" id="ptRow-${p.uhid}">
          <div class="pt-row-head" onclick="togglePatientRow('${p.uhid}')">
            <div class="rc-chip" style="background:${chipColor(p.name)}">${initials(p.name)}</div>
            <div><div class="pt-name link-name" onclick="event.stopPropagation();openMedicalProfile('${p.uhid}')">${p.name}</div><div class="pt-sub"><span class="link-uhid" onclick="event.stopPropagation();openAdminProfile('${p.uhid}')">UHID: ${p.uhid}</span> &nbsp;Â·&nbsp; ${p.age}Y &nbsp;Â·&nbsp; ${p.gender} &nbsp;Â·&nbsp; ${p.phone}</div></div>
            <div class="pt-meta">${visitCount} visit${visitCount===1?'':'s'}</div>
            <svg class="pt-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3"><path d="M6 9l6 6 6-6"/></svg>
          </div>
          <div class="pt-row-detail">
            <div class="pt-detail-grid">
              <div><div class="snap-label">Doctor</div><div class="snap-value">${p.doctor||'â€”'}</div></div>
              <div><div class="snap-label">Phone</div><div class="snap-value">${p.phone}</div></div>
            </div>
            <div class="snap-label" style="margin-bottom:6px;">Visit History</div>
            ${visitRows}
          </div>
        </div>`;
    }).join('');
  }

  // ================= PRESCRIPTIONS =================
  let prescriptionsList = [
    {id:-3, patientName:'Rahul Sharma', doctor:'Dr. Arjun Patel',
      medications:'Telmisartan 40mg â€” OD, 90 days (Morning); Aspirin 75mg â€” OD, 90 days (After food)',
      medsList:[
        {drug:'Telmisartan', strength:'40mg', frequency:'OD (Once daily)', duration:'90 days', instructions:'Morning'},
        {drug:'Aspirin', strength:'75mg', frequency:'OD (Once daily)', duration:'90 days', instructions:'After food'}
      ],
      instructions:'', followUp:'', date:'18 Mar 2026'},
    {id:-2, patientName:'Rahul Sharma', doctor:'Dr. Arjun Patel',
      medications:'Vitamin D3 60,000 IU â€” Weekly, 6 weeks (After food)',
      medsList:[{drug:'Vitamin D3', strength:'60,000 IU', frequency:'OD (Once daily)', duration:'6 weeks', instructions:'Once weekly, after food'}],
      instructions:'', followUp:'', date:'02 May 2026'},
    {id:-1, patientName:'Rahul Sharma', doctor:'Dr. Arjun Patel',
      medications:'Amlodipine 5mg â€” OD, 30 days (Morning, before food); Atorvastatin 10mg â€” OD, 30 days (Night, after food)',
      medsList:[
        {drug:'Amlodipine', strength:'5mg', frequency:'OD (Once daily)', duration:'30 days', instructions:'Morning, before food'},
        {drug:'Atorvastatin', strength:'10mg', frequency:'OD (Once daily)', duration:'30 days', instructions:'Night, after food'}
      ],
      instructions:'', followUp:'', date:'12 Jun 2026'}
  ];
  let prescriptionIdCounter = 1;

  function openPrescriptionModal(patientName){
    document.getElementById('rxPatientName').value = patientName || '';
    document.getElementById('rxMedications').value = '';
    document.getElementById('rxInstructions').value = '';
    document.getElementById('rxFollowUp').value = '';
    document.getElementById('rxModalSub').textContent = patientName ? 'For '+patientName : 'Enter the patient\u2019s name below';
    document.getElementById('rxModalOverlay').classList.add('open');
  }
  function closeRxModal(){
    document.getElementById('rxModalOverlay').classList.remove('open');
  }
  function savePrescription(){
    const patientName = document.getElementById('rxPatientName').value.trim();
    const meds = document.getElementById('rxMedications').value.trim();
    if(!patientName || !meds){ showToast('Please enter patient name and medications.', true); return; }
    const doctor = currentDoctorIdentity || 'Dr. Arjun Patel';
    prescriptionsList.push({
      id: prescriptionIdCounter++,
      patientName, doctor,
      medications: meds,
      instructions: document.getElementById('rxInstructions').value.trim(),
      followUp: document.getElementById('rxFollowUp').value.trim(),
      date: nowTimeLabel()
    });
    closeRxModal();
    showToast('Prescription saved for '+patientName+'.');
    renderPrescriptionsList();
  }
  function renderPrescriptionsList(){
    const list = document.getElementById('rxList');
    if(!list) return;
    const q = (document.getElementById('rxSearchInput').value||'').toLowerCase().trim();
    const filtered = prescriptionsList.filter(r=>!q || r.patientName.toLowerCase().includes(q)).slice().reverse();
    if(filtered.length===0){
      list.innerHTML = '<div class="rx-empty">No prescriptions yet. Use "Write Prescription" here, or the Prescription quick action during a consultation.</div>';
      return;
    }
    list.innerHTML = filtered.map(r=>`
      <div class="rx-row">
        <div class="rc-chip" style="background:${chipColor(r.patientName)}">${initials(r.patientName)}</div>
        <div style="min-width:150px;"><div class="rx-name">${r.patientName}</div><div class="rx-sub">${r.doctor}</div></div>
        <div class="rx-meds">${r.medications}</div>
        <div class="rx-date">${r.date}</div>
      </div>`).join('');
  }

  // ================= REPORTS (today's clinic-wide picture, for oversight) =================
  function computeByField(all, keyFn){
    const counts = {};
    all.forEach(p=>{ const k=keyFn(p); counts[k]=(counts[k]||0)+1; });
    return counts;
  }
  function computeByMethod(all){
    const counts = {};
    all.forEach(p=>{
      const key = p.exceptionApproved ? 'Exception (Deferred)' : (p.paymentMethod || 'Unknown');
      counts[key] = (counts[key]||0)+1;
    });
    return counts;
  }
  function computeTopReasons(all){
    const counts = {};
    all.forEach(p=>{
      const r = (p.reason||'Other').split(',')[0].trim();
      counts[r] = (counts[r]||0)+1;
    });
    return counts;
  }
  function renderBarGroup(elId, counts, limit){
    const el = document.getElementById(elId);
    let entries = Object.entries(counts).sort((a,b)=>b[1]-a[1]);
    if(limit) entries = entries.slice(0,limit);
    if(entries.length===0){ el.innerHTML='<div class="rx-empty" style="padding:10px;">No data yet.</div>'; return; }
    const max = Math.max(...entries.map(e=>e[1]), 1);
    el.innerHTML = entries.map(([label,val])=>`
      <div class="rp-bar-row">
        <div class="rp-bar-label">${label}</div>
        <div class="rp-bar-track"><div class="rp-bar-fill" style="width:${Math.round(val/max*100)}%"></div></div>
        <div class="rp-bar-value">${val}</div>
      </div>`).join('');
  }
  function renderReports(){
    const all = fullQueueData; // clinic-wide, not scoped to a single doctor â€” Reports is an oversight view
    const revenue = all.filter(p=>p.paid).reduce((s,p)=>s+(FEE_BY_TYPE[p.type]||500),0);
    document.getElementById('rpStatRow').innerHTML = `
      <div class="qstat-tile"><div class="qstat-icon completed"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg></div><div><div class="qstat-val">â‚¹${revenue.toLocaleString('en-IN')}</div><div class="qstat-label">Total Revenue</div></div></div>
      <div class="qstat-tile"><div class="qstat-icon total"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg></div><div><div class="qstat-val">${all.length}</div><div class="qstat-label">Total Consultations</div></div></div>
      <div class="qstat-tile"><div class="qstat-icon progress"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/></svg></div><div><div class="qstat-val">${all.filter(p=>p.status==='completed').length}</div><div class="qstat-label">Completed</div></div></div>
      <div class="qstat-tile"><div class="qstat-icon yts"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/></svg></div><div><div class="qstat-val">${prescriptionsList.length}</div><div class="qstat-label">Prescriptions Issued</div></div></div>
    `;
    renderBarGroup('rpByMethod', computeByMethod(all));
    renderBarGroup('rpByType', computeByField(all, p=>typeMeta[p.type]?typeMeta[p.type].label:p.type));
    renderBarGroup('rpByStatus', computeByField(all, p=>statusMeta[p.status]?statusMeta[p.status].label:p.status));
    renderBarGroup('rpByDoctor', computeByField(all, p=>p.doctor||'Unknown'));
    renderBarGroup('rpByReason', computeTopReasons(all), 5);
  }

  // ================= SETTINGS =================
  let clinicName = 'CityCare Clinic';
  let clinicAddress = '250, Hitech City, Hyderabad \u2013 500081';

  function saveClinicInfo(){
    const name = document.getElementById('stClinicName').value.trim();
    const addr = document.getElementById('stClinicAddress').value.trim();
    if(!name || !addr){ showToast('Please fill in both fields.', true); return; }
    clinicName = name; clinicAddress = addr;
    const idsToUpdateName = ['receiptClinicName','sidebarClinicName','loginTenantName','ppBrandClinicName','adminOverviewClinicName','reportsClinicName','rcUpiClinicName'];
    idsToUpdateName.forEach(id=>{ const el=document.getElementById(id); if(el) el.textContent = clinicName; });
    const addrEl = document.getElementById('receiptClinicAddr');
    if(addrEl) addrEl.textContent = clinicAddress;
    showToast('Clinic info saved â€” updated everywhere it appears.');
  }
  function saveFees(){
    const c = parseInt(document.getElementById('stFeeClinic').value,10);
    const v = parseInt(document.getElementById('stFeeVideo').value,10);
    const a = parseInt(document.getElementById('stFeeAudio').value,10);
    const w = parseInt(document.getElementById('stFeeWalkin').value,10);
    if([c,v,a,w].some(n=>isNaN(n)||n<0)){ showToast('Please enter valid fee amounts.', true); return; }
    FEE_BY_TYPE.clinic = c; FEE_BY_TYPE.video = v; FEE_BY_TYPE.audio = a; FEE_BY_TYPE.walkin = w;
    showToast('Consultation fees updated â€” will apply to new check-ins and bookings.');
  }

  // ================= TOPBAR: GLOBAL SEARCH =================
  function onGlobalSearch(){
    const q = document.getElementById('globalSearchInput').value.trim().toLowerCase();
    const box = document.getElementById('gsResults');
    if(!q){ box.classList.remove('open'); box.innerHTML=''; return; }
    const matches = getKnownPatients().filter(p=>
      p.name.toLowerCase().includes(q) || p.uhid.toLowerCase().includes(q) || (p.phone||'').includes(q)
    ).slice(0,7);
    if(matches.length===0){
      box.innerHTML = '<div class="gs-empty">No patients found.</div>';
    }else{
      box.innerHTML = matches.map(p=>`
        <div class="gs-result-row" onclick="selectGlobalSearchResult('${p.uhid}')">
          <div class="rc-chip" style="background:${chipColor(p.name)}">${initials(p.name)}</div>
          <div><div class="gs-name">${p.name}</div><div class="gs-sub">UHID: ${p.uhid} &nbsp;Â·&nbsp; ${p.phone}</div></div>
        </div>`).join('');
    }
    box.classList.add('open');
  }
  function selectGlobalSearchResult(uhid){
    document.getElementById('gsResults').classList.remove('open');
    document.getElementById('globalSearchInput').value='';
    showPage('patients');
    setTimeout(()=>{
      const row = document.getElementById('ptRow-'+uhid);
      if(row){
        document.querySelectorAll('.pt-row').forEach(r=>{ if(r!==row) r.classList.remove('open'); });
        row.classList.add('open');
        row.scrollIntoView({behavior:'smooth', block:'center'});
      }
    }, 80);
  }
  document.addEventListener('keydown', function(e){
    if((e.metaKey||e.ctrlKey) && e.key.toLowerCase()==='k'){
      const input = document.getElementById('globalSearchInput');
      if(input && document.getElementById('mainApp').style.display!=='none'){
        e.preventDefault();
        input.focus();
      }
    }
    if(e.key==='Escape'){
      document.getElementById('gsResults').classList.remove('open');
      closeAllTopPanels();
    }
  });

  // ================= TOPBAR: NOTIFICATIONS (real, computed from live data) =================
  function renderNotifications(){
    const body = document.getElementById('notifBody');
    const items = [];

    onlineBookings.forEach(b=>{
      items.push({
        icon:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>',
        color:'primary', time:b.time,
        html:'<b>'+b.patientName+'</b> booked '+(TYPE_LABEL_FOR_FEE[b.type]||b.type)+' with '+b.doctor+' â€” not yet checked in'
      });
    });

    const scope = currentSessionRole==='doctor' ? fullQueueData.filter(p=>p.doctor===currentDoctorIdentity) : fullQueueData;
    scope.filter(p=>(p.paid||p.exceptionApproved) && p.status==='yts').slice(0,6).forEach(p=>{
      items.push({
        icon:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/></svg>',
        color:'success', time:p.time,
        html:'<b>'+p.name+'</b> is up next â€” '+(typeMeta[p.type]?typeMeta[p.type].label:p.type)+' at '+p.time
      });
    });

    document.getElementById('notifCount').textContent = items.length;
    const badge = document.getElementById('notifBadge');
    if(items.length>0){ badge.style.display='flex'; badge.textContent = items.length>9?'9+':items.length; }
    else { badge.style.display='none'; }

    if(items.length===0){ body.innerHTML='<div class="gs-empty">You\u2019re all caught up â€” nothing new.</div>'; return; }
    body.innerHTML = items.map(n=>`
      <div class="notif-row">
        <div class="nf-icon" style="background:var(--${n.color}-50);color:var(--${n.color});">${n.icon}</div>
        <div><div class="nf-text">${n.html}</div><div class="nf-time">${n.time}</div></div>
      </div>`).join('');
  }

  // ================= TOPBAR: TODAY'S SCHEDULE =================
  function renderSchedule(){
    const scope = currentSessionRole==='doctor' ? fullQueueData.filter(p=>p.doctor===currentDoctorIdentity) : fullQueueData;
    const paid = scope.filter(p=>p.paid||p.exceptionApproved).sort((a,b)=>a.time.localeCompare(b.time));
    const remaining = paid.filter(p=>p.status==='yts'||p.status==='progress').length;
    const pendingBookings = (currentSessionRole==='doctor' ? onlineBookings.filter(b=>b.doctor===currentDoctorIdentity) : onlineBookings)
      .slice().sort((a,b)=>a.time.localeCompare(b.time));

    document.getElementById('scheduleCount').textContent = paid.length;
    const badge = document.getElementById('scheduleBadge');
    const badgeCount = remaining + pendingBookings.length;
    if(badgeCount>0){ badge.style.display='flex'; badge.textContent = badgeCount>9?'9+':badgeCount; }
    else { badge.style.display='none'; }

    const body = document.getElementById('scheduleBody');
    if(paid.length===0 && pendingBookings.length===0){ body.innerHTML='<div class="gs-empty">Nothing scheduled yet today.</div>'; return; }

    const pendingHtml = pendingBookings.map(b=>`
      <div class="sched-row pending">
        <div class="sr-time">${b.time}</div>
        <div style="flex:1;"><div class="sr-name">${b.patientName}</div><div class="sr-sub">${typeMeta[b.type]?typeMeta[b.type].label:b.type} &nbsp;Â·&nbsp; ${b.doctor}</div></div>
        <div class="sr-checkin" onclick="closeFloatMenu('schedulePanel');showPage('reception');checkInFromBooking(${b.id});">Check In</div>
      </div>`).join('');

    const paidHtml = paid.slice(0,10).map(p=>{
      const sm = statusMeta[p.status] || {cls:'yts', label:p.status};
      return `<div class="sched-row">
        <div class="sr-time">${p.time}</div>
        <div style="flex:1;"><div class="sr-name">${p.name}</div><div class="sr-sub">${typeMeta[p.type]?typeMeta[p.type].label:p.type} &nbsp;Â·&nbsp; ${p.doctor||''}</div></div>
        <span class="stag ${sm.cls}" style="font-size:10.5px;padding:3px 8px;"><span class="sdot"></span>${sm.label}</span>
      </div>`;
    }).join('');

    body.innerHTML = pendingHtml + paidHtml;
  }

  // ================= TOPBAR: QUICK MESSAGE (WhatsApp/SMS to any known patient) =================
  let qmSelectedPatient = null;
  function renderQuickMsgResults(){
    const q = document.getElementById('qmSearchInput').value.trim().toLowerCase();
    const box = document.getElementById('qmResults');
    document.getElementById('qmComposeWrap').style.display='none';
    qmSelectedPatient = null;
    if(!q){ box.innerHTML=''; return; }
    const matches = getKnownPatients().filter(p=>
      p.name.toLowerCase().includes(q) || p.uhid.toLowerCase().includes(q) || (p.phone||'').includes(q)
    ).slice(0,6);
    box.innerHTML = matches.length ? matches.map(p=>`
      <div class="qm-contact-row" onclick='selectQuickMsgContact(${JSON.stringify(p.uhid)})'>
        <div class="rc-chip" style="background:${chipColor(p.name)}">${initials(p.name)}</div>
        <div><div class="gs-name">${p.name}</div><div class="gs-sub">${p.phone}</div></div>
      </div>`).join('') : '<div class="gs-empty">No patients found.</div>';
  }
  function selectQuickMsgContact(uhid){
    const p = getKnownPatients().find(k=>k.uhid===uhid);
    if(!p) return;
    qmSelectedPatient = p;
    document.getElementById('qmComposeTo').textContent = 'To: '+p.name+' ('+p.phone+')';
    document.getElementById('qmMessageText').value = 'Hi '+p.name+', this is '+clinicName+'. ';
    document.getElementById('qmComposeWrap').style.display='block';
  }
  function sendQuickMsgWhatsApp(){
    if(!qmSelectedPatient) return;
    openWhatsApp(qmSelectedPatient.phone, document.getElementById('qmMessageText').value.trim());
    closeAllTopPanels();
  }
  function sendQuickMsgSms(){
    if(!qmSelectedPatient) return;
    openSms(qmSelectedPatient.phone, document.getElementById('qmMessageText').value.trim());
    closeAllTopPanels();
  }

  // ================= HASH-BASED ROLE DEEP LINKS =================
  // Lets each role bookmark/be given a direct link (e.g. clinic_app.html#doctor) that skips
  // the role picker entirely â€” the receptionist's front-desk PC only ever needs #reception, etc.
  function initLoginFromHash(){
    const raw = location.hash.replace('#','').trim();
    const [role, personParam] = raw.split('=');
    if(['doctor','admin','reception','patient'].includes(role)){
      selectLoginRole(role);
      if(role==='reception' && personParam){
        const person = staffList.find(s=>s.name===decodeURIComponent(personParam));
        if(person) selectReceptionStaff(person.name, person.roleLabel, person.color);
      }
      return;
    }
    let remembered = null;
    try{ remembered = localStorage.getItem('hospitall_device_role'); }catch(e){}
    if(remembered && ['doctor','admin','reception','patient'].includes(remembered)){
      selectLoginRole(remembered);
    }else{
      backToRolePicker();
    }
  }
  initLoginFromHash();

  // ================= ADMINISTRATIVE PROFILE (click UHID) =================
  let patientExtendedInfo = {}; // uhid -> {dob, maritalStatus, nationality, idProofType, idNumber, email, address, insurance..., emergency..., admin..., family:[], occupation, employer, incomeRange, referredBy, lastUpdated}
  let apCurrentUhid = null;

  function extInfo(uhid){
    if(!patientExtendedInfo[uhid]) patientExtendedInfo[uhid] = {family:[]};
    return patientExtendedInfo[uhid];
  }
  function saveExtField(uhid, field, value){
    extInfo(uhid)[field] = value;
    extInfo(uhid).lastUpdated = nowTimeLabel();
    const lu = document.getElementById('apLastUpdated');
    if(lu) lu.textContent = extInfo(uhid).lastUpdated;
  }
  function pfField(label, uhid, key, value, placeholder, type){
    type = type || 'text';
    const val = (value||'').toString().replace(/"/g,'&quot;');
    return `<div class="profile-field"><div class="pf-label">${label}</div><input class="pf-input" type="${type}" value="${val}" placeholder="${placeholder||'Not on file'}" onblur="saveExtField('${uhid}','${key}',this.value)"></div>`;
  }
  function pfSelect(label, uhid, key, value, options){
    const opts = ['', ...options];
    return `<div class="profile-field"><div class="pf-label">${label}</div><select class="pf-input" onchange="saveExtField('${uhid}','${key}',this.value)">${opts.map(o=>`<option value="${o}" ${o===value?'selected':''}>${o||'Not on file'}</option>`).join('')}</select></div>`;
  }

  function openAdminProfile(uhid){
    const p = getKnownPatients().find(k=>k.uhid===uhid);
    if(!p){ showToast('Patient record not found.', true); return; }
    apCurrentUhid = uhid;
    const ext = extInfo(uhid);

    document.getElementById('apChip').textContent = initials(p.name);
    document.getElementById('apChip').style.background = chipColor(p.name);
    document.getElementById('apName').innerHTML = p.name+'<span class="ph-status">Active</span>';
    document.getElementById('apUhid').textContent = 'UHID: '+p.uhid;
    document.getElementById('apMetaRow').innerHTML = `<span>${p.age} Yrs / ${p.gender}</span><span>Blood Group <b>${ext.bloodGroup||'â€”'}</b></span><span>Doctor <b>${p.doctor||'Unassigned'}</b></span>`;

    document.getElementById('apBody').innerHTML = `
      <div class="profile-section">
        <div class="profile-section-title">Personal Information</div>
        <div class="profile-grid">
          <div class="profile-field"><div class="pf-label">Full Name</div><div class="pf-value">${p.name}</div></div>
          ${pfField('Date of Birth', uhid, 'dob', ext.dob, 'DD MMM YYYY', 'text')}
          <div class="profile-field"><div class="pf-label">Gender</div><div class="pf-value">${p.gender}</div></div>
          ${pfSelect('Marital Status', uhid, 'maritalStatus', ext.maritalStatus, ['Single','Married','Widowed','Divorced'])}
          ${pfField('Blood Group', uhid, 'bloodGroup', ext.bloodGroup, 'e.g. O+')}
          ${pfField('Nationality', uhid, 'nationality', ext.nationality, 'e.g. Indian')}
          ${pfSelect('ID Proof', uhid, 'idProofType', ext.idProofType, ['Aadhaar Card','PAN Card','Passport','Voter ID','Driving Licence'])}
          ${pfField('ID Number', uhid, 'idNumber', ext.idNumber, 'Not on file')}
        </div>
      </div>
      <div class="profile-section">
        <div class="profile-section-title">Contact Information</div>
        <div class="profile-grid">
          <div class="profile-field"><div class="pf-label">Mobile</div><div class="pf-value">${p.phone}</div></div>
          ${pfField('Email', uhid, 'email', ext.email, 'name@email.com', 'email')}
        </div>
        <div style="margin-top:10px;">${pfField('Address', uhid, 'address', ext.address, 'Not on file')}</div>
      </div>
      <div class="profile-section">
        <div class="profile-section-title">Insurance Information</div>
        <div class="profile-grid">
          ${pfField('Provider', uhid, 'insProvider', ext.insProvider, 'e.g. Star Health')}
          ${pfField('Policy Number', uhid, 'insPolicy', ext.insPolicy, 'Not on file')}
          ${pfField('Policy Holder', uhid, 'insHolder', ext.insHolder, p.name)}
          ${pfField('Relationship', uhid, 'insRelationship', ext.insRelationship, 'e.g. Self')}
          ${pfSelect('Coverage', uhid, 'insCoverage', ext.insCoverage, ['Individual','Family Floater'])}
          ${pfField('Valid From', uhid, 'insValidFrom', ext.insValidFrom, 'DD MMM YYYY')}
          ${pfField('Valid To', uhid, 'insValidTo', ext.insValidTo, 'DD MMM YYYY')}
        </div>
      </div>
      <div class="profile-section">
        <div class="profile-section-title">Emergency Contact</div>
        <div class="profile-grid">
          ${pfField('Name', uhid, 'emName', ext.emName, 'Not on file')}
          ${pfField('Relationship', uhid, 'emRelationship', ext.emRelationship, 'e.g. Spouse')}
          ${pfField('Mobile', uhid, 'emMobile', ext.emMobile, 'Not on file')}
          ${pfField('Alternate Number', uhid, 'emAlt', ext.emAlt, 'Not on file')}
        </div>
      </div>
      <div class="profile-section">
        <div class="profile-section-title">Administrative Information</div>
        <div class="profile-grid">
          ${pfField('Registration Date', uhid, 'regDate', ext.regDate, 'DD MMM YYYY')}
          ${pfField('Registered By', uhid, 'regBy', ext.regBy, 'e.g. Meena Iyer')}
          ${pfField('Registration Branch', uhid, 'regBranch', ext.regBranch, clinicName)}
          ${pfSelect('Patient Category', uhid, 'category', ext.category, ['General','VIP','Senior Citizen'])}
          ${pfField('Preferred Language', uhid, 'language', ext.language, 'e.g. English')}
          ${pfSelect('Communication Preference', uhid, 'commPref', ext.commPref, ['SMS','Email','WhatsApp','Phone Call'])}
          ${pfSelect('Consent Status', uhid, 'consentStatus', ext.consentStatus, ['Consent Taken','Pending'])}
          <div class="profile-field"><div class="pf-label">Last Updated</div><div class="pf-value" id="apLastUpdated">${ext.lastUpdated||'â€”'}</div></div>
        </div>
      </div>
      <div class="profile-section">
        <div class="profile-section-title">Family Members (Linked)</div>
        <div id="apFamilyList">${renderFamilyRows(uhid)}</div>
        <div class="fam-add-row">
          <input id="apFamName" placeholder="Name">
          <input id="apFamRel" placeholder="Relationship">
          <input id="apFamPhone" placeholder="Phone">
          <div class="fam-add-btn" onclick="addFamilyMember('${uhid}')">Add</div>
        </div>
      </div>
      <div class="profile-section">
        <div class="profile-section-title">Documents</div>
        <div class="doc-note">Document upload isn't available in this prototype yet.</div>
      </div>
      <div class="profile-section">
        <div class="profile-section-title">Additional Information</div>
        <div class="profile-grid">
          ${pfField('Occupation', uhid, 'occupation', ext.occupation, 'Not on file')}
          ${pfField('Employer', uhid, 'employer', ext.employer, 'Not on file')}
          ${pfField('Annual Income Range', uhid, 'incomeRange', ext.incomeRange, 'e.g. \u20B910\u201315 LPA')}
          ${pfField('Referred By', uhid, 'referredBy', ext.referredBy, 'Not on file')}
        </div>
      </div>
      <div class="profile-foot-note">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3"><circle cx="12" cy="12" r="9"/><path d="M12 8v4M12 17h.01"/></svg>
        <div>Fields shown as "Not on file" are editable \u2014 click into any field to add it. Changes are saved for this session.</div>
      </div>
    `;
    document.getElementById('adminProfileOverlay').classList.add('open');
  }
  function closeAdminProfile(){ document.getElementById('adminProfileOverlay').classList.remove('open'); }

  function renderFamilyRows(uhid){
    const fam = extInfo(uhid).family || [];
    if(fam.length===0) return '<div class="ctab-empty" style="padding:8px 0;">No family members linked yet.</div>';
    return fam.map((f,i)=>`
      <div class="fam-row">
        <div><div class="fr-name">${f.name}</div><div class="fr-rel">${f.relationship}</div></div>
        <div class="fr-phone">${f.phone}</div>
        <div class="fr-remove" onclick="removeFamilyMember('${uhid}',${i})"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3"><path d="M18 6L6 18M6 6l12 12"/></svg></div>
      </div>`).join('');
  }
  function addFamilyMember(uhid){
    const name = document.getElementById('apFamName').value.trim();
    const rel = document.getElementById('apFamRel').value.trim();
    const phone = document.getElementById('apFamPhone').value.trim();
    if(!name || !rel){ showToast('Enter at least a name and relationship.', true); return; }
    extInfo(uhid).family.push({name, relationship:rel, phone});
    document.getElementById('apFamilyList').innerHTML = renderFamilyRows(uhid);
    document.getElementById('apFamName').value='';
    document.getElementById('apFamRel').value='';
    document.getElementById('apFamPhone').value='';
  }
  function removeFamilyMember(uhid, idx){
    extInfo(uhid).family.splice(idx,1);
    document.getElementById('apFamilyList').innerHTML = renderFamilyRows(uhid);
  }

  function printAdminProfile(){
    const p = getKnownPatients().find(k=>k.uhid===apCurrentUhid);
    if(!p) return;
    const ext = extInfo(apCurrentUhid);
    const win = window.open('', '_blank');
    win.document.write(`
      <html><head><title>Patient Profile - ${p.name}</title>
      <style>body{font-family:Arial,sans-serif;padding:28px;color:#0F172A;max-width:480px;}
      h1{font-size:16px;margin-bottom:2px;}
      .sub{font-size:11px;color:#64748B;margin-bottom:16px;}
      table{width:100%;border-collapse:collapse;font-size:12px;margin-bottom:16px;}
      td{padding:5px 0;border-bottom:1px dashed #E2E8F0;}
      td:last-child{text-align:right;}
      h2{font-size:12px;margin:14px 0 6px;color:#334155;}</style></head><body>
      <h1>${p.name}</h1>
      <div class="sub">UHID: ${p.uhid} \u00B7 ${clinicName}</div>
      <h2>PERSONAL</h2>
      <table>
        <tr><td>Age / Gender</td><td>${p.age}Y / ${p.gender}</td></tr>
        <tr><td>Blood Group</td><td>${ext.bloodGroup||'\u2014'}</td></tr>
        <tr><td>Phone</td><td>${p.phone}</td></tr>
        <tr><td>Email</td><td>${ext.email||'\u2014'}</td></tr>
        <tr><td>Address</td><td>${ext.address||'\u2014'}</td></tr>
      </table>
      <h2>EMERGENCY CONTACT</h2>
      <table><tr><td>${ext.emName||'\u2014'}</td><td>${ext.emMobile||''}</td></tr></table>
      </body></html>
    `);
    win.document.close();
    win.focus();
    setTimeout(()=>{ try{ win.print(); }catch(e){} }, 300);
  }

  function startConsultationFromProfile(){
    const uhid = apCurrentUhid;
    closeAdminProfile();
    const p = queue.find(x=>x.uhid===uhid) || fullQueueData.find(x=>x.uhid===uhid);
    if(!p){ showToast('This patient is not in todayâ€™s active queue.', true); return; }
    requestStartConsultation(p, 'notes');
  }

  // ================= MEDICAL / CLINICAL PROFILE (click Name) =================
  function openMedicalProfile(uhid){
    const p = getKnownPatients().find(k=>k.uhid===uhid);
    if(!p){ showToast('Patient record not found.', true); return; }
    document.getElementById('mpChip').textContent = initials(p.name);
    document.getElementById('mpChip').style.background = chipColor(p.name);
    document.getElementById('mpName').textContent = p.name;
    document.getElementById('mpUhid').textContent = 'UHID: '+p.uhid;

    const visits = fullQueueData.filter(v=>v.uhid===uhid).sort((a,b)=>a.time.localeCompare(b.time));
    document.getElementById('mpVisits').textContent = visits.length;
    document.getElementById('mpLastVisit').textContent = visits.length ? visits[visits.length-1].time : '\u2014';
    document.getElementById('mpDoctor').textContent = p.doctor || '\u2014';

    const upcoming = onlineBookings.find(b=>b.patientName.toLowerCase()===p.name.toLowerCase());
    document.getElementById('mpUpcoming').textContent = upcoming ? (upcoming.time+' today') : 'None';

    document.getElementById('mpRxCount').textContent = prescriptionsList.filter(r=>r.patientName===p.name).length;
    document.getElementById('mpLabCount').textContent = getLabOrdersForUhid(uhid).length;
    document.getElementById('mpDxCount').textContent = getDxForUhid(uhid).length;

    const histBody = document.getElementById('mpVisitHistory');
    if(visits.length===0){
      histBody.innerHTML = '<div class="ctab-empty">No visit history yet.</div>';
    }else{
      histBody.innerHTML = visits.slice().reverse().slice(0,6).map(v=>`
        <div class="profile-visit-row">
          <div class="pv-time">${v.time}</div>
          <div class="pv-desc">${v.reason || (typeMeta[v.type]?typeMeta[v.type].label:v.type)}</div>
          <div class="pv-doc">${v.doctor||''}</div>
        </div>`).join('');
    }
    document.getElementById('medicalProfileOverlay').classList.add('open');
  }
  function closeMedicalProfile(){ document.getElementById('medicalProfileOverlay').classList.remove('open'); }