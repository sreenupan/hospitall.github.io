  const statusMeta={
    yts:{cls:'yts', label:'Yet to Start'},
    progress:{cls:'progress', label:'In Progress'},
    completed:{cls:'completed', label:'Completed'},
    cancelled:{cls:'cancelled', label:'Cancelled'}
  };

  const fullQueueData = [
    {time:'09:00 AM', name:'Rahul Sharma', uhid:'HSP24-00123', age:34, gender:'Male', phone:'98765 43210', type:'clinic', freq:'Twice / Year', freqIcon:'cal', status:'yts', reason:'Chest Pain, Shortness of Breath', paid:true, doctor:'Dr. Arjun Patel', paymentMethod:'Cash'},
    {time:'09:30 AM', name:'Priya Mehta', uhid:'HSP24-00124', age:31, gender:'Female', phone:'91234 56780', type:'video', freq:'Monthly (1 visit)', freqIcon:'cal', status:'progress', reason:'Follow-up Consultation', paid:true, doctor:'Dr. Arjun Patel', paymentMethod:'Card'},
    {time:'10:00 AM', name:'Amit Verma', uhid:'HSP24-00125', age:52, gender:'Male', phone:'99887 66554', type:'audio', freq:'Monthly (1 visit)', freqIcon:'cal', status:'completed', reason:'Hypertension Management', paid:true, doctor:'Dr. Arjun Patel', paymentMethod:'UPI'},
    {time:'10:30 AM', name:'Sunita Rao', uhid:'HSP24-00126', age:38, gender:'Female', phone:'90909 12345', type:'clinic', freq:'First Visit', freqIcon:'star', status:'yts', reason:'Regular Health Checkup', paid:true, doctor:'Dr. Arjun Patel', paymentMethod:'Cash'},
    {time:'11:00 AM', name:'Vikram Singh', uhid:'HSP24-00127', age:29, gender:'Male', phone:'98123 45670', type:'video', freq:'Quarterly', freqIcon:'cal', status:'progress', reason:'Review Test Reports', paid:true, doctor:'Dr. Arjun Patel', paymentMethod:'Card'},
    {time:'11:30 AM', name:'Neha Kapoor', uhid:'HSP24-00128', age:27, gender:'Female', phone:'93456 78901', type:'clinic', freq:'Quarterly', freqIcon:'cal', status:'cancelled', reason:'Fever, Body Ache', paid:true, doctor:'Dr. Arjun Patel', paymentMethod:'UPI'},
    {time:'12:00 PM', name:'Arjun Reddy', uhid:'HSP24-00129', age:41, gender:'Male', phone:'92345 67890', type:'walkin', freq:'First Visit', freqIcon:'star', status:'yts', reason:'Skin Rash', paid:true, doctor:'Dr. Arjun Patel', paymentMethod:'Cash'},
    {time:'12:30 PM', name:'Kavita Iyer', uhid:'HSP24-00130', age:47, gender:'Female', phone:'97654 32109', type:'audio', freq:'Monthly (1 visit)', freqIcon:'cal', status:'completed', reason:'Diabetes Follow-up', paid:true, doctor:'Dr. Arjun Patel', paymentMethod:'Card'},
    {time:'01:00 PM', name:'Rohan Gupta', uhid:'HSP24-00131', age:36, gender:'Male', phone:'96543 21098', type:'clinic', freq:'Twice / Year', freqIcon:'cal', status:'yts', reason:'Back Pain', paid:true, doctor:'Dr. Arjun Patel', paymentMethod:'UPI'},
    {time:'01:30 PM', name:'Meera Nair', uhid:'HSP24-00132', age:44, gender:'Female', phone:'95432 10987', type:'video', freq:'Quarterly', freqIcon:'cal', status:'completed', reason:'Thyroid Review', paid:true, doctor:'Dr. Arjun Patel', paymentMethod:'Cash'},
    {time:'02:00 PM', name:'Sanjay Joshi', uhid:'HSP24-00133', age:58, gender:'Male', phone:'94321 09876', type:'clinic', freq:'Monthly (1 visit)', freqIcon:'cal', status:'yts', reason:'Post-Surgery Checkup', paid:true, doctor:'Dr. Arjun Patel', paymentMethod:'Card'},
    {time:'02:30 PM', name:'Ananya Das', uhid:'HSP24-00134', age:25, gender:'Female', phone:'93210 98765', type:'walkin', freq:'First Visit', freqIcon:'star', status:'yts', reason:'Migraine', paid:true, doctor:'Dr. Arjun Patel', paymentMethod:'UPI'},
    {time:'03:00 PM', name:'Karan Malhotra', uhid:'HSP24-00135', age:49, gender:'Male', phone:'92109 87654', type:'audio', freq:'Twice / Year', freqIcon:'cal', status:'completed', reason:'Cholesterol Review', paid:true, doctor:'Dr. Arjun Patel', paymentMethod:'Cash'},
    {time:'03:30 PM', name:'Divya Menon', uhid:'HSP24-00136', age:33, gender:'Female', phone:'91098 76543', type:'clinic', freq:'Quarterly', freqIcon:'cal', status:'cancelled', reason:'Joint Pain', paid:true, doctor:'Dr. Arjun Patel', paymentMethod:'Card'},
    {time:'04:00 PM', name:'Farhan Ali', uhid:'HSP24-00137', age:30, gender:'Male', phone:'90987 65432', type:'video', freq:'Monthly (1 visit)', freqIcon:'cal', status:'yts', reason:'Anxiety Consultation', paid:true, doctor:'Dr. Arjun Patel', paymentMethod:'UPI'},
    {time:'04:30 PM', name:'Ritu Bhatia', uhid:'HSP24-00138', age:28, gender:'Female', phone:'89876 54321', type:'clinic', freq:'First Visit', freqIcon:'star', status:'yts', reason:'General Checkup', paid:true, doctor:'Dr. Arjun Patel', paymentMethod:'Cash'},
    {time:'05:00 PM', name:'Manish Kumar', uhid:'HSP24-00139', age:55, gender:'Male', phone:'88765 43210', type:'audio', freq:'Quarterly', freqIcon:'cal', status:'yts', reason:'Diabetes Follow-up', paid:true, doctor:'Dr. Arjun Patel', paymentMethod:'Card'},
    {time:'05:30 PM', name:'Pooja Shah', uhid:'HSP24-00140', age:39, gender:'Female', phone:'87654 32109', type:'video', freq:'Twice / Year', freqIcon:'cal', status:'yts', reason:'Cardiac Review', paid:true, doctor:'Dr. Arjun Patel', paymentMethod:'UPI'},
    {time:'06:00 PM', name:'Vivek Rao', uhid:'HSP24-00141', age:46, gender:'Male', phone:'86543 21098', type:'clinic', freq:'Monthly (1 visit)', freqIcon:'cal', status:'yts', reason:'Knee Pain', paid:true, doctor:'Dr. Arjun Patel', paymentMethod:'Cash'},
    {time:'06:30 PM', name:'Shreya Pillai', uhid:'HSP24-00142', age:22, gender:'Female', phone:'85432 10987', type:'walkin', freq:'First Visit', freqIcon:'star', status:'yts', reason:'Fever', paid:true, doctor:'Dr. Arjun Patel', paymentMethod:'Card'},
    {time:'07:00 PM', name:'Aditya Chopra', uhid:'HSP24-00143', age:51, gender:'Male', phone:'84321 09876', type:'clinic', freq:'Quarterly', freqIcon:'cal', status:'yts', reason:'Blood Pressure Check', paid:true, doctor:'Dr. Arjun Patel', paymentMethod:'UPI'},
    {time:'07:30 PM', name:'Isha Kapoor', uhid:'HSP24-00144', age:35, gender:'Female', phone:'83210 98765', type:'video', freq:'Monthly (1 visit)', freqIcon:'cal', status:'yts', reason:'Follow-up Consultation', paid:true, doctor:'Dr. Arjun Patel', paymentMethod:'Cash'},
    {time:'08:00 PM', name:'Nikhil Bansal', uhid:'HSP24-00145', age:32, gender:'Male', phone:'82109 87654', type:'audio', freq:'First Visit', freqIcon:'star', status:'yts', reason:'Cough, Cold', paid:true, doctor:'Dr. Arjun Patel', paymentMethod:'Card'},
    {time:'08:30 PM', name:'Tanvi Desai', uhid:'HSP24-00146', age:40, gender:'Female', phone:'81098 76543', type:'clinic', freq:'Twice / Year', freqIcon:'cal', status:'yts', reason:'Annual Physical', paid:true, doctor:'Dr. Arjun Patel', paymentMethod:'UPI'}
  ];

  let fqTypeFilter='all'; // quick top-tab filter (single dimension, independent shortcut)
  let fqSearch='';
  let fqPage=1;
  let fqPageSize=10;

  // committed filter state from the Filters panel (only takes effect after "Apply Filters")
  function defaultFqFilters(){
    return {
      types: new Set(['clinic','video','audio','walkin']),
      statuses: new Set(['yts','progress','completed','cancelled']),
      freq: new Set(['first','monthly','quarterly','twiceyear']),
      reasons: new Set(['checkup','fever','cough','body ache','chest pain','breath','hypertension','diabetes','cardiac','back pain','skin','migraine','anxiety','follow-up','other']),
      ageMin: null, ageMax: null, gender: 'all', timeRange: 'all', doctor: 'all'
    };
  }
  let fqFilters = defaultFqFilters();

  function freqCategoryOf(freqText){
    if(freqText==='First Visit') return 'first';
    if(freqText.indexOf('Monthly')===0) return 'monthly';
    if(freqText==='Quarterly') return 'quarterly';
    if(freqText==='Twice / Year') return 'twiceyear';
    return null;
  }
  const REASON_KEYWORDS = {
    checkup:['checkup','physical'], fever:['fever'], cough:['cough','cold'],
    'body ache':['body ache'], 'chest pain':['chest pain'], breath:['breath'],
    hypertension:['hypertension','blood pressure'], diabetes:['diabetes'],
    cardiac:['cardiac','palpitation','heart'], 'back pain':['back pain','joint pain','knee'],
    skin:['skin','rash'], migraine:['migraine'], anxiety:['anxiety'],
    'follow-up':['follow-up','review','management']
  };
  function reasonMatchesAny(reasonText, selectedKeys){
    const txt = reasonText.toLowerCase();
    const allKnown = Object.values(REASON_KEYWORDS).flat();
    const matchesKnownKeyword = allKnown.some(kw=>txt.includes(kw));
    for(const key of selectedKeys){
      if(key==='other'){ if(!matchesKnownKeyword) return true; continue; }
      const kws = REASON_KEYWORDS[key]||[];
      if(kws.some(kw=>txt.includes(kw))) return true;
    }
    return false;
  }
  function timeRangeOf(timeStr){
    const m = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
    if(!m) return 'all';
    let h = parseInt(m[1],10);
    const ap = m[3].toUpperCase();
    if(ap==='PM' && h!==12) h+=12;
    if(ap==='AM' && h===12) h=0;
    if(h<12) return 'morning';
    if(h<17) return 'afternoon';
    return 'evening';
  }

  function matchesFilters(p, filters){
    if(!filters.types.has(p.type)) return false;
    if(!filters.statuses.has(p.status)) return false;
    const fc = freqCategoryOf(p.freq);
    if(fc && !filters.freq.has(fc)) return false;
    if(!reasonMatchesAny(p.reason, filters.reasons)) return false;
    if(filters.ageMin!=null && p.age < filters.ageMin) return false;
    if(filters.ageMax!=null && p.age > filters.ageMax) return false;
    if(filters.gender!=='all' && p.gender!==filters.gender) return false;
    if(filters.timeRange!=='all' && timeRangeOf(p.time)!==filters.timeRange) return false;
    if(filters.doctor && filters.doctor!=='all' && p.doctor!==filters.doctor) return false;
    return true;
  }

  function getFilteredQueue(){
    return fullQueueData.filter(p=>{
      if(!(p.paid || p.exceptionApproved)) return false; // doctor never sees an unpaid patient â€” full stop
      if(currentSessionRole==='doctor' && p.doctor!==currentDoctorIdentity) return false; // each doctor sees only their own patients
      if(fqTypeFilter!=='all' && p.type!==fqTypeFilter) return false;
      if(!matchesFilters(p, fqFilters)) return false;
      if(fqSearch){
        const s=fqSearch.toLowerCase();
        if(!p.name.toLowerCase().includes(s) && !p.uhid.toLowerCase().includes(s)) return false;
      }
      return true;
    });
  }

  function actionButtonHtml(p, idx){
    if(p.status==='completed'){
      return `<div class="abtn abtn-ghost" onclick="openFullQueueConsultation(${idx})">View Summary</div>`;
    }
    if(p.status==='cancelled'){
      return `<div class="abtn abtn-ghost" onclick="openFullQueueConsultation(${idx})">View Details</div>`;
    }
    if(p.status==='progress'){
      // already underway â€” payment was gated at the start, so Resume skips straight back in
      if(p.type==='video'){
        return `<div class="abtn abtn-video" onclick="startCall(fullQueueData[${idx}],'video')">Resume Video</div>`;
      }else if(p.type==='audio'){
        return `<div class="abtn abtn-audio" onclick="startCall(fullQueueData[${idx}],'audio')">Resume Audio</div>`;
      }else{
        return `<div class="abtn abtn-primary" onclick="openFullQueueConsultation(${idx})">Resume Consultation</div>`;
      }
    }
    // status === 'yts' â€” fresh start, must pass the payment gate first
    if(p.type==='clinic'||p.type==='walkin'){
      return `<div class="abtn abtn-primary" onclick="requestStartConsultation(fullQueueData[${idx}],'notes')">Start Consultation</div>`;
    }else if(p.type==='video'){
      return `<div class="abtn abtn-video" onclick="requestStartConsultation(fullQueueData[${idx}],'video')">Join Video</div>`;
    }else{
      return `<div class="abtn abtn-audio" onclick="requestStartConsultation(fullQueueData[${idx}],'audio')">Join Audio</div>`;
    }
  }

  function renderFullQueue(){
    const all = fullQueueData.filter(p=>(p.paid||p.exceptionApproved) && (currentSessionRole!=='doctor' || p.doctor===currentDoctorIdentity)); // only what the doctor is actually allowed to see
    document.getElementById('statTotal').textContent = all.length;
    document.getElementById('statCompleted').textContent = all.filter(p=>p.status==='completed').length;
    document.getElementById('statProgress').textContent = all.filter(p=>p.status==='progress').length;
    document.getElementById('statYts').textContent = all.filter(p=>p.status==='yts').length;
    document.getElementById('statCancelled').textContent = all.filter(p=>p.status==='cancelled').length;
    document.getElementById('queueTitle').textContent = 'Consultation Queue ('+all.length+')';
    document.getElementById('fqCountAll').textContent = all.length;
    document.getElementById('fqCountClinic').textContent = all.filter(p=>p.type==='clinic').length;
    document.getElementById('fqCountVideo').textContent = all.filter(p=>p.type==='video').length;
    document.getElementById('fqCountAudio').textContent = all.filter(p=>p.type==='audio').length;
    document.getElementById('fqCountWalkin').textContent = all.filter(p=>p.type==='walkin').length;

    const filtered = getFilteredQueue();
    const totalPages = Math.max(1, Math.ceil(filtered.length / fqPageSize));
    if(fqPage>totalPages) fqPage=totalPages;
    const startIdx = (fqPage-1)*fqPageSize;
    const pageItems = filtered.slice(startIdx, startIdx+fqPageSize);

    const body=document.getElementById('fullQueueBody');
    body.innerHTML='';
    pageItems.forEach(p=>{
      const idx = fullQueueData.indexOf(p);
      const tm=typeMeta[p.type];
      const sm=statusMeta[p.status];
      const isFirst = p.freqIcon==='star';
      const isSel = fqSelected.has(p.uhid);
      const row=document.createElement('tr');
      if(isSel) row.classList.add('row-selected');
      row.innerHTML=`
        <td class="sel-cell"><input type="checkbox" class="row-check" ${isSel?'checked':''} onclick="toggleRowSelect('${p.uhid}')"></td>
        <td><div class="cell-time">${p.time}</div></td>
        <td>
          <div class="p-row">
            <div class="p-chip" style="background:${chipColor(p.name)}">${initials(p.name)}</div>
            <div>
              <div class="p-name link-name" onclick="event.stopPropagation();openMedicalProfile('${p.uhid}')">${p.name}</div>
              <div class="p-sub"><span class="link-uhid" onclick="event.stopPropagation();openAdminProfile('${p.uhid}')">UHID: ${p.uhid}</span> &nbsp;Â·&nbsp; ${p.age}Y &nbsp;Â·&nbsp; ${p.gender}</div>
            </div>
          </div>
        </td>
        <td><div style="font-size:12.5px;font-weight:600;color:var(--ink-700);">${p.doctor||''}</div></td>
        <td><span class="mtag ${tm.cls}">${tm.icon}${tm.label}</span></td>
        <td><span class="ftag ${isFirst?'first':''}">${isFirst?'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.9 6.6L22 9.3l-5 4.9L18.2 22 12 18.3 5.8 22 7 14.2l-5-4.9 7.1-.7z"/></svg>':''}${p.freq}</span></td>
        <td><span class="stag ${sm.cls}"><span class="sdot"></span>${sm.label}</span></td>
        <td><div class="reason-cell">${p.reason}</div></td>
        <td>${actionButtonHtml(p, idx)}</td>
        <td><div class="dots-btn" onclick="openRowMenu(event, fullQueueData[${idx}])"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="5" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="19" r="1.5"/></svg></div></td>
      `;
      body.appendChild(row);
    });
    updateSelectAllCheckbox(pageItems);
    updateSelectionBar();

    const from = filtered.length===0 ? 0 : startIdx+1;
    const to = Math.min(startIdx+fqPageSize, filtered.length);
    document.getElementById('pgInfo').textContent = `Showing ${from} to ${to} of ${filtered.length} results`;
    document.getElementById('pgSizeLabel').textContent = fqPageSize+' / page';

    const controls=document.getElementById('pgControls');
    controls.innerHTML='';
    const prevBtn=document.createElement('div');
    prevBtn.className='pg-btn'+(fqPage<=1?'':''); prevBtn.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3"><path d="M15 18l-6-6 6-6"/></svg>';
    if(fqPage<=1){ prevBtn.setAttribute('disabled','true'); prevBtn.style.opacity=.4; prevBtn.style.cursor='not-allowed'; } else { prevBtn.onclick=()=>{fqPage--;renderFullQueue();}; }
    controls.appendChild(prevBtn);

    for(let pnum=1; pnum<=totalPages; pnum++){
      const b=document.createElement('div');
      b.className='pg-btn'+(pnum===fqPage?' active':'');
      b.textContent=pnum;
      b.onclick=()=>{fqPage=pnum;renderFullQueue();};
      controls.appendChild(b);
    }

    const nextBtn=document.createElement('div');
    nextBtn.className='pg-btn'; nextBtn.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3"><path d="M9 18l6-6-6-6"/></svg>';
    if(fqPage>=totalPages){ nextBtn.style.opacity=.4; nextBtn.style.cursor='not-allowed'; } else { nextBtn.onclick=()=>{fqPage++;renderFullQueue();}; }
    controls.appendChild(nextBtn);
  }

  function filterFullQueue(el,type){
    document.querySelectorAll('#page-queue .qtab').forEach(t=>t.classList.remove('active'));
    el.classList.add('active');
    fqTypeFilter=type;
    fqFilters = defaultFqFilters(); // quick tab takes over as the single active filter mechanism
    fqPage=1;
    renderFullQueue();
  }

  function onQueueSearch(){
    fqSearch=document.getElementById('queueSearchInput').value;
    fqPage=1;
    renderFullQueue();
  }

  // ---- read current DOM state of the filter panel into a plain filters object ----
  function readFilterPanelDom(){
    const f = {
      types: new Set(Array.from(document.querySelectorAll('.fp-type:checked')).map(b=>b.value)),
      statuses: new Set(Array.from(document.querySelectorAll('.fp-status:checked')).map(b=>b.value)),
      freq: new Set(Array.from(document.querySelectorAll('.fp-freq:checked')).map(b=>b.value)),
      reasons: new Set(Array.from(document.querySelectorAll('.fp-reason:checked')).map(b=>b.value)),
      ageMin: document.getElementById('ageMinInput').value ? parseInt(document.getElementById('ageMinInput').value,10) : null,
      ageMax: document.getElementById('ageMaxInput').value ? parseInt(document.getElementById('ageMaxInput').value,10) : null,
      gender: (document.querySelector('input[name=fpGender]:checked')||{value:'all'}).value,
      timeRange: document.getElementById('timeRangeSelect').value,
      doctor: document.getElementById('doctorSelect').value
    };
    return f;
  }

  // ---- sync the panel's controls to reflect the last-committed fqFilters (so reopening shows real state) ----
  function populateDoctorFilterOptions(selectEl, currentValue){
    selectEl.innerHTML = '<option value="all">All Doctors</option>' +
      doctorList.map(d=>`<option value="${d.name}">${d.name}${d.name===currentDoctorIdentity?' (You)':''}</option>`).join('');
    selectEl.value = currentValue || 'all';
  }

  function syncFilterPanelFromState(){
    document.querySelectorAll('.fp-type').forEach(b=>b.checked=fqFilters.types.has(b.value));
    document.querySelectorAll('.fp-status').forEach(b=>b.checked=fqFilters.statuses.has(b.value));
    document.querySelectorAll('.fp-freq').forEach(b=>b.checked=fqFilters.freq.has(b.value));
    document.querySelectorAll('.fp-reason').forEach(b=>b.checked=fqFilters.reasons.has(b.value));
    document.getElementById('ageMinInput').value = fqFilters.ageMin ?? '';
    document.getElementById('ageMaxInput').value = fqFilters.ageMax ?? '';
    const genderRadio = document.querySelector('input[name=fpGender][value="'+fqFilters.gender+'"]');
    if(genderRadio) genderRadio.checked=true;
    document.getElementById('timeRangeSelect').value = fqFilters.timeRange;
    populateDoctorFilterOptions(document.getElementById('doctorSelect'), fqFilters.doctor);
  }

  function previewFilterCount(){
    const draft = readFilterPanelDom();
    const n = fullQueueData.filter(p=>matchesFilters(p, draft)).length;
    document.getElementById('filterMatchCount').innerHTML = '<b>'+n+'</b> patient'+(n===1?'':'s')+' match these filters';
  }

  function applyAllFilters(){
    fqFilters = readFilterPanelDom();
    fqTypeFilter='all'; // detailed panel now governs; clear the quick-tab shortcut
    document.querySelectorAll('#page-queue .qtab').forEach(t=>t.classList.remove('active'));
    document.querySelector('#page-queue .qtab[data-filter="all"]').classList.add('active');
    fqPage=1;
    closeFloatMenu('filterMenu');
    renderFullQueue();
  }

  function clearAllFilters(){
    document.querySelectorAll('.fp-type, .fp-status, .fp-freq, .fp-reason').forEach(b=>b.checked=true);
    document.getElementById('ageMinInput').value='';
    document.getElementById('ageMaxInput').value='';
    document.querySelector('input[name=fpGender][value="all"]').checked=true;
    document.getElementById('timeRangeSelect').value='all';
    document.getElementById('doctorSelect').value='all';
    document.getElementById('reasonSearchInput').value='';
    filterReasonList();
    previewFilterCount();
  }

  function toggleMoreFilters(){
    document.getElementById('moreFiltersBody').classList.toggle('open');
    document.getElementById('moreFiltersToggle').classList.toggle('open');
  }

  function filterReasonList(){
    const q = document.getElementById('reasonSearchInput').value.toLowerCase();
    document.querySelectorAll('#reasonList [data-reason-row]').forEach(row=>{
      row.style.display = row.textContent.toLowerCase().includes(q) ? '' : 'none';
    });
  }

  function setPageSize(n){
    fqPageSize=n;
    fqPage=1;
    closeFloatMenu('pageSizeMenu');
    renderFullQueue();
  }

  function openFullQueueConsultation(i){
    populateConsultation(fullQueueData[i]);
  }

  // ---- generic floating menu open/close (Export / Filter / Page size) ----
  function openFloatMenuNear(id, targetEl, alignRight){
    closeAllFloatMenus();
    const menu=document.getElementById(id);
    menu.classList.add('open'); // make visible first so offsetHeight is measurable
    const r=targetEl.getBoundingClientRect();
    const menuH = menu.offsetHeight;
    const menuW = menu.offsetWidth;
    let top = r.bottom+8;
    if(top + menuH > window.innerHeight - 12){
      top = Math.max(12, r.top - menuH - 8); // flip above the trigger if it would overflow the bottom
    }
    let left = alignRight ? (r.right - menuW) : r.left;
    left = Math.min(Math.max(12, left), window.innerWidth - menuW - 12);
    menu.style.top = top+'px';
    menu.style.left = left+'px';
  }
  function closeFloatMenu(id){ document.getElementById(id).classList.remove('open'); }
  function closeAllFloatMenus(){
    ['exportMenu','filterMenu','pageSizeMenu','dashFilterMenu'].forEach(id=>document.getElementById(id).classList.remove('open'));
  }
  function toggleExportMenu(e){
    e.stopPropagation();
    const menu=document.getElementById('exportMenu');
    if(menu.classList.contains('open')){ closeFloatMenu('exportMenu'); return; }
    openFloatMenuNear('exportMenu', e.currentTarget, true);
  }
  function toggleFilterMenu(e){
    e.stopPropagation();
    const menu=document.getElementById('filterMenu');
    if(menu.classList.contains('open')){ closeFloatMenu('filterMenu'); return; }
    syncFilterPanelFromState();
    previewFilterCount();
    openFloatMenuNear('filterMenu', e.currentTarget, true);
  }
  function togglePageSizeMenu(e){
    e.stopPropagation();
    const menu=document.getElementById('pageSizeMenu');
    if(menu.classList.contains('open')){ closeFloatMenu('pageSizeMenu'); return; }
    openFloatMenuNear('pageSizeMenu', e.currentTarget, true);
  }
  document.addEventListener('click', function(e){
    if(!e.target.closest('.float-menu') && !e.target.closest('.toolbar-btn') && !e.target.closest('.pg-size')){
      closeAllFloatMenus();
    }
  });

  // ================= ROW SELECTION (for Export Selected Patients) =================
  let fqSelected = new Set(); // stores UHIDs, persists across pagination/filter changes

  function toggleRowSelect(uhid){
    if(fqSelected.has(uhid)) fqSelected.delete(uhid); else fqSelected.add(uhid);
    renderFullQueue();
  }

  function toggleSelectAll(box){
    const filtered = getFilteredQueue();
    const startIdx = (fqPage-1)*fqPageSize;
    const pageItems = filtered.slice(startIdx, startIdx+fqPageSize);
    if(box.checked){ pageItems.forEach(p=>fqSelected.add(p.uhid)); }
    else { pageItems.forEach(p=>fqSelected.delete(p.uhid)); }
    renderFullQueue();
  }

  function updateSelectAllCheckbox(pageItems){
    const box=document.getElementById('selectAllBox');
    if(!box) return;
    const allSelected = pageItems.length>0 && pageItems.every(p=>fqSelected.has(p.uhid));
    box.checked = allSelected;
  }

  function updateSelectionBar(){
    const bar=document.getElementById('selectionBar');
    const n=fqSelected.size;
    document.getElementById('selCountLabel').textContent = n+' selected';
    bar.classList.toggle('open', n>0);
  }

  function clearSelection(){
    fqSelected = new Set();
    renderFullQueue();
  }

  // ================= EXPORT MODAL =================
  let exportFormat='pdf';
  let exportSourceList=[];

  function requestExportSelected(){
    if(fqSelected.size===0){
      showToast('Select at least one patient first, then try again.', true);
      return;
    }
    openExportModal('selected');
  }

  function openExportModal(source, presetFormat){
    exportSourceList = source==='selected'
      ? fullQueueData.filter(p=>fqSelected.has(p.uhid))
      : getFilteredQueue();

    exportFormat = presetFormat || 'pdf';
    setExportFormat(exportFormat);

    const n = exportSourceList.length;
    document.getElementById('emTitle').textContent = source==='selected' ? 'Export Selected Patients' : 'Export Queue';
    document.getElementById('emSub').textContent = n+' patient'+(n===1?'':'s')+' will be included'+(source==='selected' ? '' : ' (matching current filters)');
    document.getElementById('emExportBtn').textContent = 'Export '+n+' Patient'+(n===1?'':'s');

    const preview=document.getElementById('exportPreviewList');
    preview.innerHTML = exportSourceList.map(p=>`
      <div class="preview-row">
        <div class="preview-chip" style="background:${chipColor(p.name)}">${initials(p.name)}</div>
        <div><div class="preview-name">${p.name}</div><div class="preview-sub">UHID: ${p.uhid} &nbsp;Â·&nbsp; ${p.time}</div></div>
      </div>`).join('') || '<div style="padding:10px;font-size:12.5px;color:var(--ink-500);">No patients match the current filters.</div>';

    document.getElementById('exportModalOverlay').classList.add('open');
  }

  function closeExportModal(){
    document.getElementById('exportModalOverlay').classList.remove('open');
  }

  function setExportFormat(fmt){
    exportFormat=fmt;
    document.getElementById('fmtCardPdf').classList.toggle('active', fmt==='pdf');
    document.getElementById('fmtCardCsv').classList.toggle('active', fmt==='csv');
  }

  const EXPORT_FIELD_LABELS = {
    time:'Time', name:'Patient Name', uhid:'UHID', agegender:'Age / Gender',
    type:'Consultation Type', freq:'Patient Frequency', status:'Status',
    reason:'Reason for Visit', phone:'Phone Number'
  };
  function exportFieldValue(p, key){
    switch(key){
      case 'time': return p.time;
      case 'name': return p.name;
      case 'uhid': return p.uhid;
      case 'agegender': return p.age+'Y / '+p.gender;
      case 'type': return typeMeta[p.type].label;
      case 'freq': return p.freq;
      case 'status': return statusMeta[p.status].label;
      case 'reason': return p.reason;
      case 'phone': return p.phone;
      default: return '';
    }
  }
  function getSelectedExportFields(){
    return Array.from(document.querySelectorAll('.ef-field:checked')).map(b=>b.value);
  }

  function runExport(){
    const fields = getSelectedExportFields();
    if(exportSourceList.length===0){
      showToast('Nothing to export â€” no patients match.', true);
      return;
    }
    if(exportFormat==='csv'){
      downloadCsv(exportSourceList, fields);
    }else{
      openPrintableView(exportSourceList, fields);
    }
    closeExportModal();
    showToast(exportSourceList.length+' patient'+(exportSourceList.length===1?'':'s')+' exported as '+(exportFormat==='csv'?'CSV':'PDF')+'.');
  }

  function downloadCsv(list, fields){
    const headers = fields.map(f=>EXPORT_FIELD_LABELS[f]);
    const rows = list.map(p=>fields.map(f=>{
      let v = String(exportFieldValue(p,f));
      if(v.includes(',')||v.includes('"')){ v = '"'+v.replace(/"/g,'""')+'"'; }
      return v;
    }).join(','));
    const csv = [headers.join(','), ...rows].join('\r\n');
    const blob = new Blob([csv], {type:'text/csv;charset=utf-8;'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'consultation_queue_export_'+list.length+'_patients.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(()=>URL.revokeObjectURL(url), 2000);
  }

  function openPrintableView(list, fields){
    const headers = fields.map(f=>EXPORT_FIELD_LABELS[f]);
    const rowsHtml = list.map(p=>'<tr>'+fields.map(f=>'<td>'+exportFieldValue(p,f)+'</td>').join('')+'</tr>').join('');
    const win = window.open('', '_blank');
    win.document.write(`
      <html><head><title>Consultation Queue Export</title>
      <style>
        body{font-family:Arial,sans-serif;padding:32px;color:#0F172A;}
        h1{font-size:18px;margin-bottom:2px;}
        .sub{font-size:12px;color:#64748B;margin-bottom:18px;}
        table{width:100%;border-collapse:collapse;font-size:12px;}
        th{background:#F1F5F9;text-align:left;padding:8px 10px;border-bottom:2px solid #E2E8F0;text-transform:uppercase;font-size:10px;color:#64748B;letter-spacing:.04em;}
        td{padding:8px 10px;border-bottom:1px solid #F1F5F9;}
      </style></head><body>
      <h1>${clinicName} â€” Consultation Queue Export</h1>
      <div class="sub">Dr. Arjun Patel Â· Thursday, 30 July 2026 Â· ${list.length} patient${list.length===1?'':'s'}</div>
      <table><thead><tr>${headers.map(h=>'<th>'+h+'</th>').join('')}</tr></thead><tbody>${rowsHtml}</tbody></table>
      </body></html>
    `);
    win.document.close();
    win.focus();
    setTimeout(()=>{ try{ win.print(); }catch(e){} }, 300);
  }

  function printQueueNow(){
    const fields = ['time','name','uhid','agegender','type','freq','status','reason'];
    openPrintableView(getFilteredQueue(), fields);
  }

  // ================= TOAST =================
  let toastTimer=null;
  function showToast(text, warn){
    const toast=document.getElementById('toast');
    document.getElementById('toastText').textContent=text;
    toast.classList.toggle('warn', !!warn);
    toast.classList.add('open');
    clearTimeout(toastTimer);
    toastTimer=setTimeout(()=>toast.classList.remove('open'), 3200);
  }

  // ================= VIDEO / AUDIO CALL SCREENS =================