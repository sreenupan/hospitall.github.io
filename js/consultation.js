  function switchConsultTab(name){
    var el;
    el=document.getElementById('ctabNotes'); if(el) el.classList.toggle('active', name==='notes');
    el=document.getElementById('ctabVitals'); if(el) el.classList.toggle('active', name==='vitals');
    el=document.getElementById('ctabDx'); if(el) el.classList.toggle('active', name==='dx');
    el=document.getElementById('ctabMeds'); if(el) el.classList.toggle('active', name==='meds');
    el=document.getElementById('ctabLab'); if(el) el.classList.toggle('active', name==='lab');
    el=document.getElementById('ctabOldRx'); if(el) el.classList.toggle('active', name==='oldrx');
    el=document.getElementById('ctabBilling'); if(el) el.classList.toggle('active', name==='billing');
    // Panels are now always visible (single-page layout), so don't hide them
    el=document.getElementById('panelVitals'); if(el) el.style.display = name==='vitals' ? 'block' : 'none';
    el=document.getElementById('panelOldRx'); if(el) el.style.display = name==='oldrx' ? 'block' : 'none';
    el=document.getElementById('panelBilling'); if(el) el.style.display = name==='billing' ? 'block' : 'none';
    if(name==='meds' && document.getElementById('medCardsWrap') && document.getElementById('medCardsWrap').children.length===0) addMedRow();
    if(name==='meds' && document.getElementById('piList') && document.getElementById('piList').children.length===0) addInstructionRow();
    if(name==='oldrx') renderOldRxTab();
    if(name==='billing') renderBillingTab();
  }

  // ================= VITALS =================
  function vtStep(id, delta){
    const el = document.getElementById(id);
    const step = Math.abs(delta) < 1 ? delta : delta; // supports 0.1 steps for temp
    let val = parseFloat(el.value) || 0;
    val = Math.round((val + step) * 10) / 10;
    el.value = val;
    el.dispatchEvent(new Event('input'));
  }
  const VITAL_RANGES = {
    vtPulse:{min:60,max:100}, vtSpo2:{min:95,max:100}, vtTemp:{min:97,max:99},
    vtBpSys:{min:90,max:120}, vtBpDia:{min:60,max:80}
  };
  function vtCheck(inputId, cardId){
    const card = document.getElementById(cardId);
    let filled;
    if(cardId==='vtCardBp'){
      filled = document.getElementById('vtBpSys').value!=='' && document.getElementById('vtBpDia').value!=='';
    }else{
      filled = document.getElementById(inputId).value!=='';
    }
    card.classList.toggle('filled', filled);
    calcBmi();
  }
  function calcBmi(){
    const w = parseFloat(document.getElementById('vtWeight').value);
    const h = parseFloat(document.getElementById('vtHeight').value);
    const bmiEl = document.getElementById('vtBmi');
    if(w>0 && h>0){
      const bmi = w / ((h/100)*(h/100));
      bmiEl.value = bmi.toFixed(1);
    }else{
      bmiEl.value = 'â€”';
    }
  }
  function toggleVtMore(){
    document.getElementById('vtMoreBody').classList.toggle('open');
    document.getElementById('vtMoreToggle').classList.toggle('open');
  }
  let painScoreSelected = null;
  function buildPainScale(){
    const wrap = document.getElementById('painScale');
    wrap.innerHTML='';
    for(let i=0;i<=10;i++){
      const chip=document.createElement('div');
      chip.className='pain-chip'; chip.textContent=i;
      chip.onclick=()=>{
        document.querySelectorAll('.pain-chip').forEach(c=>c.classList.remove('active'));
        chip.classList.add('active');
        painScoreSelected = i;
      };
      wrap.appendChild(chip);
    }
  }
  function saveVitals(){
    const pulse = document.getElementById('vtPulse').value;
    const sys = document.getElementById('vtBpSys').value;
    const dia = document.getElementById('vtBpDia').value;
    if(!pulse || !sys || !dia){ showToast('Pulse and Blood Pressure are required to save.', true); return; }
    showToast('Vitals saved for this consultation.');
  }

  // ================= MEDICATIONS =================
  let medRowCounter = 0;
  function addMedRow(){
    medRowCounter++;
    const n = medRowCounter;
    const wrap = document.getElementById('medCardsWrap');
    // Show header row only once (before first card)
    if(wrap.children.length===0){
      const header = document.createElement('div');
      header.className = 'med-header-row';
      header.id = 'medHeaderRow';
      header.innerHTML = `
        <div style="display:flex;gap:6px;align-items:center;padding:0 12px 6px;">
          <div style="width:22px;flex-shrink:0;"></div>
          <div style="width:82px;flex-shrink:0;font-size:10px;font-weight:700;color:var(--ink-500);text-transform:uppercase;letter-spacing:.04em;">Form</div>
          <div style="flex:1;min-width:100px;font-size:10px;font-weight:700;color:var(--ink-500);text-transform:uppercase;letter-spacing:.04em;">Drug Name</div>
          <div style="width:72px;flex-shrink:0;font-size:10px;font-weight:700;color:var(--ink-500);text-transform:uppercase;letter-spacing:.04em;">Strength</div>
          <div style="width:80px;flex-shrink:0;font-size:10px;font-weight:700;color:var(--ink-500);text-transform:uppercase;letter-spacing:.04em;">Freq</div>
          <div style="width:72px;flex-shrink:0;font-size:10px;font-weight:700;color:var(--ink-500);text-transform:uppercase;letter-spacing:.04em;">Duration</div>
          <div style="width:80px;flex-shrink:0;font-size:10px;font-weight:700;color:var(--ink-500);text-transform:uppercase;letter-spacing:.04em;">Route</div>
          <div style="width:28px;flex-shrink:0;"></div>
        </div>`;
      wrap.appendChild(header);
    }
    const card = document.createElement('div');
    card.className = 'med-card';
    card.id = 'medCard'+n;
    card.style.cssText = 'border:1px solid var(--ink-200);border-radius:9px;padding:10px 12px;margin-bottom:8px;';
    card.innerHTML = `
      <div style="display:flex;gap:6px;align-items:center;">
        <div style="width:22px;height:22px;border-radius:50%;background:var(--primary);color:#fff;font-size:11px;font-weight:700;display:flex;align-items:center;justify-content:center;flex-shrink:0;">${n}</div>
        <select class="med-form" style="width:82px;flex-shrink:0;border:1px solid var(--ink-200);border-radius:6px;padding:7px 4px;font-size:12px;color:var(--ink-900);">
          <option value="Tablet">Tablet</option>
          <option value="Capsule">Capsule</option>
          <option value="Syrup">Syrup</option>
          <option value="Injection">Injection</option>
          <option value="Cream">Cream</option>
          <option value="Ointment">Ointment</option>
          <option value="Drops">Drops</option>
          <option value="Inhaler">Inhaler</option>
          <option value="Powder">Powder</option>
          <option value="Patch">Patch</option>
        </select>
        <input class="med-card-name" placeholder="Drug name" style="flex:1;min-width:100px;border:1px solid var(--ink-200);border-radius:6px;padding:7px 8px;font-size:12px;">
        <input class="med-strength" placeholder="Strength" style="width:72px;flex-shrink:0;border:1px solid var(--ink-200);border-radius:6px;padding:7px 8px;font-size:12px;">
        <input class="med-freq-input" list="freqOptions${n}" placeholder="Freq" style="width:80px;flex-shrink:0;border:1px solid var(--ink-200);border-radius:6px;padding:7px 8px;font-size:12px;">
        <datalist id="freqOptions${n}">
          <option value="QD - Once daily"><option value="BID - Twice daily"><option value="TID - Three times daily"><option value="QID - Four times daily"><option value="QHS - At bedtime"><option value="Q4H - Every 4 hours"><option value="Q6H - Every 6 hours"><option value="Q8H - Every 8 hours"><option value="PRN - As needed"><option value="STAT - Immediately"><option value="Weekly">
        </datalist>
        <input class="med-duration" placeholder="Duration" style="width:72px;flex-shrink:0;border:1px solid var(--ink-200);border-radius:6px;padding:7px 8px;font-size:12px;">
        <input class="med-route-input" list="routeOptions${n}" placeholder="Route" style="width:80px;flex-shrink:0;border:1px solid var(--ink-200);border-radius:6px;padding:7px 8px;font-size:12px;">
        <datalist id="routeOptions${n}">
          <option value="PO"><option value="IV"><option value="IM"><option value="SC"><option value="PR"><option value="SL"><option value="INH"><option value="IN"><option value="TOP"><option value="OPH"><option value="OTIC">
        </datalist>
        <div class="med-card-remove" onclick="removeMedRow(${n})" style="width:28px;height:28px;border-radius:6px;display:flex;align-items:center;justify-content:center;color:var(--danger);cursor:pointer;flex-shrink:0;" title="Remove"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6h14z"/></svg></div>
      </div>
      <div style="padding-left:28px;margin-top:4px;">
        <input class="med-card-instr" placeholder="Instructions, e.g. Take after food" style="width:100%;border:1px solid var(--ink-200);border-radius:6px;padding:6px 8px;font-size:11.5px;color:var(--ink-700);" onkeydown="medInstrKeydown(event,${n})">
      </div>
    `;
    wrap.appendChild(card);
    updateMedAddButton();
    // Focus drug name of the new row
    card.querySelector('.med-card-name').focus();
  }
  function medInstrKeydown(e, n){
    if(e.key==='Enter'){ e.preventDefault(); addMedRow(); }
    if(e.key==='Tab' && !e.shiftKey){
      // If this is the last row, tab goes to Add medication button
      const cards = document.querySelectorAll('.med-card');
      const lastCard = cards[cards.length-1];
      if(lastCard && lastCard.id === 'medCard'+n){
        e.preventDefault();
        document.getElementById('medAddBtn').querySelector('div').focus();
      }
    }
  }
  function updateMedAddButton(){
    // Remove existing add button if any
    const existing = document.getElementById('medAddBtn');
    if(existing) existing.remove();
    // Add + button after the last card
    const wrap = document.getElementById('medCardsWrap');
    const btn = document.createElement('div');
    btn.id = 'medAddBtn';
    btn.innerHTML = '<div tabindex="0" style="display:inline-flex;align-items:center;gap:6px;color:var(--primary);font-weight:600;font-size:12.5px;cursor:pointer;padding:6px 0;outline:none;" onclick="addMedRow()" onkeydown="if(event.key===\'Enter\'){event.preventDefault();addMedRow();}"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3"><path d="M12 5v14M5 12h14"/></svg>Add medication</div>';
    wrap.appendChild(btn);
  }
  function selectFreqPill(n, el, value){
    const card = document.getElementById('medCard'+n);
    if(!card) return;
    card.dataset.freq = value;
    card.querySelectorAll('.freq-pill').forEach(p=>p.classList.remove('active'));
    el.classList.add('active');
  }
  function removeMedRow(n){
    const card = document.getElementById('medCard'+n);
    if(card) card.remove();
    // If no cards left, remove header too
    const wrap = document.getElementById('medCardsWrap');
    if(wrap.querySelectorAll('.med-card').length===0){
      const hdr = document.getElementById('medHeaderRow');
      if(hdr) hdr.remove();
      const btn = document.getElementById('medAddBtn');
      if(btn) btn.remove();
      addMedRow();
    }
  }
  function saveMedications(){
    const cards = document.querySelectorAll('.med-card');
    const meds = [];
    const medsList = [];
    cards.forEach(card=>{
      const form = card.querySelector('.med-form') ? card.querySelector('.med-form').value : '';
      const drug = card.querySelector('.med-card-name').value.trim();
      const strength = card.querySelector('.med-strength').value.trim();
      const duration = card.querySelector('.med-duration').value.trim();
      const instructions = card.querySelector('.med-card-instr').value.trim();
      const frequency = card.querySelector('.med-freq-input') ? card.querySelector('.med-freq-input').value.trim() : '';
      const route = card.querySelector('.med-route-input') ? card.querySelector('.med-route-input').value.trim() : '';
      if(drug){
        meds.push(form+' '+drug+' '+strength+' \u2014 '+(frequency.split(' ')[0]||'\u2014')+', '+duration+(route?' ('+route+')':'')+(instructions?' \u2014 '+instructions:''));
        medsList.push({form, drug, strength, frequency, duration, route, instructions});
      }
    });
    if(meds.length===0){ showToast('Add at least one medication first.', true); return; }
    const patientName = document.getElementById('patientName').textContent;
    const instructionsList = Array.from(document.querySelectorAll('#piList input')).map(i=>i.value.trim()).filter(Boolean);
    const purposeEl = document.getElementById('followPurpose');
    prescriptionsList.push({
      id: prescriptionIdCounter++,
      patientName, doctor: currentDoctorIdentity || 'Dr. Arjun Patel',
      medications: meds.join('; '),
      medsList,
      instructions: instructionsList.join('; '),
      followUp: purposeEl ? purposeEl.value.trim() : '',
      date: nowTimeLabel()
    });
    showToast('Medications saved to prescription for '+patientName+'.');
    renderPrevConsultations(patientName);
  }

  // ================= PATIENT INSTRUCTIONS =================
  function addInstructionRow(text){
    const list = document.getElementById('piList');
    const row = document.createElement('div');
    row.className = 'pi-row';
    const safe = (text||'').replace(/"/g,'&quot;');
    row.innerHTML = `<div class="pi-dot"></div><input value="${safe}" placeholder="e.g. Monitor blood sugar daily"><div class="pi-remove" onclick="this.parentElement.remove()"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3"><path d="M18 6L6 18M6 6l12 12"/></svg></div>`;
    list.appendChild(row);
  }
  const INSTRUCTION_TEMPLATES = {
    diabetes: ['Monitor blood sugar daily','Reduce sugary foods','Walk 30 mins daily','Take medicines regularly','Follow up with reports'],
    hypertension: ['Monitor BP twice daily','Reduce salt intake','Avoid stress and get adequate sleep','Take medicines regularly at the same time'],
    general: ['Stay hydrated','Get 7\u20138 hours of sleep','Eat a balanced diet','Take medicines as prescribed']
  };
  function applyInstructionTemplate(){
    const key = document.getElementById('piTemplateSelect').value;
    if(!key) return;
    document.getElementById('piList').innerHTML = '';
    INSTRUCTION_TEMPLATES[key].forEach(t=>addInstructionRow(t));
    showToast('Template applied \u2014 edit any line before saving.');
  }

  // ================= PREVIOUS CONSULTATIONS (sidebar) =================
  function renderPrevConsultations(patientName){
    const list = document.getElementById('prevConsultList');
    const countEl = document.getElementById('prevConsultCount');
    if(!list) return;
    const history = prescriptionsList.filter(r=>r.patientName===patientName).slice().reverse();
    countEl.textContent = history.length;
    if(history.length===0){ list.innerHTML = '<div class="pc-empty-note">No previous consultations on file yet.</div>'; return; }
    list.innerHTML = history.map(r=>{
      const medCount = r.medsList ? r.medsList.length : (r.medications ? r.medications.split(';').length : 0);
      const canCopy = r.medsList && r.medsList.length>0;
      return `
      <div class="pc-row" id="pcRow-${r.id}">
        <div class="pc-head" onclick="togglePrevConsultRow(${r.id})">
          <div class="pc-date">${r.date}</div>
          <div class="pc-desc">${r.doctor} \u2014 ${medCount} med${medCount===1?'':'s'}</div>
          <svg class="pc-chev" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3"><path d="M6 9l6 6 6-6"/></svg>
        </div>
        <div class="pc-detail">
          <div class="pc-meds-title">Medications (${medCount})</div>
          ${r.medications ? r.medications.split(';').map(m=>`<div class="pc-med-line">\u2022 ${m.trim()}</div>`).join('') : '<div class="pc-med-line">No medications recorded.</div>'}
          ${canCopy ? `<div class="pc-copy-btn" onclick="copyPrescriptionToMeds(${r.id})"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3"><path d="M8 8h12v12H8z"/><path d="M4 16V4h12"/></svg>Copy to Prescription</div>` : ''}
        </div>
      </div>`;
    }).join('');
  }

  // ================= OLD PRESCRIPTIONS TAB (full history, not the sidebar summary) =================
  function renderOldRxTab(){
    const patientName = document.getElementById('patientName').textContent;
    const history = prescriptionsList.filter(r=>r.patientName===patientName).slice().reverse();
    const list = document.getElementById('oldRxList');
    if(history.length===0){ list.innerHTML = '<div class="ctab-empty">No prescription history for this patient yet.</div>'; return; }
    list.innerHTML = history.map(r=>{
      const meds = r.medications ? r.medications.split(';').map(m=>`<div class="oldrx-med-line">\u2022 ${m.trim()}</div>`).join('') : '<div class="oldrx-med-line">No medications recorded.</div>';
      const canCopy = r.medsList && r.medsList.length>0;
      return `
        <div class="oldrx-card">
          <div class="oldrx-head">
            <div><div class="oh-date">${r.date}</div><div class="oh-doc">${r.doctor}</div></div>
            <div class="oh-actions">
              ${canCopy?`<div class="oh-btn" onclick="copyPrescriptionToMeds(${r.id})"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3"><path d="M8 8h12v12H8z"/><path d="M4 16V4h12"/></svg>Copy Forward</div>`:''}
              <div class="oh-btn" onclick="printOldRx(${r.id})"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3"><path d="M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2M6 14h12v8H6z"/></svg>Print</div>
            </div>
          </div>
          <div class="oldrx-section-lbl">Medications</div>
          ${meds}
          ${r.instructions?`<div class="oldrx-section-lbl">Patient Instructions</div><div class="oldrx-med-line">${r.instructions.split(';').map(i=>i.trim()).join(', ')}</div>`:''}
          ${r.followUp?`<div class="oldrx-section-lbl">Follow-up</div><div class="oldrx-med-line">${r.followUp}</div>`:''}
        </div>`;
    }).join('');
  }
  function printOldRx(id){
    const r = prescriptionsList.find(x=>x.id===id);
    if(!r) return;
    const win = window.open('', '_blank');
    win.document.write(`
      <html><head><title>Prescription - ${r.patientName}</title>
      <style>body{font-family:Arial,sans-serif;padding:28px;color:#0F172A;max-width:480px;}
      h1{font-size:16px;margin-bottom:2px;} .sub{font-size:11px;color:#64748B;margin-bottom:16px;}
      h2{font-size:12px;margin:14px 0 6px;color:#334155;} .line{font-size:12px;padding:3px 0;}</style></head><body>
      <h1>${clinicName}</h1>
      <div class="sub">${r.patientName} \u2014 ${r.date} \u2014 ${r.doctor}</div>
      <h2>MEDICATIONS</h2>
      ${r.medications.split(';').map(m=>`<div class="line">\u2022 ${m.trim()}</div>`).join('')}
      ${r.instructions?`<h2>INSTRUCTIONS</h2><div class="line">${r.instructions}</div>`:''}
      </body></html>
    `);
    win.document.close();
    win.focus();
    setTimeout(()=>{ try{ win.print(); }catch(e){} }, 300);
  }

  // ================= BILLING & PAYMENTS TAB =================
  let billChargesAll = {}; // uhid -> [{desc, amount}]
  function getBillCharges(uhid){ if(!billChargesAll[uhid]) billChargesAll[uhid]=[]; return billChargesAll[uhid]; }

  function renderBillingTab(){
    const p = queue.find(x=>x.uhid===currentPatientUhid) || fullQueueData.find(x=>x.uhid===currentPatientUhid);
    const fee = p ? (FEE_BY_TYPE[p.type]||500) : 0;
    document.getElementById('billType').textContent = p ? (typeMeta[p.type]?typeMeta[p.type].label:p.type) : '\u2014';
    document.getElementById('billFee').textContent = '\u20B9'+fee;
    if(p && p.exceptionApproved){
      document.getElementById('billStatus').textContent = 'Exception Approved';
      document.getElementById('billMethod').textContent = 'Deferred \u2014 '+(p.exceptionAdmin||'Admin');
    }else if(p && p.paid){
      document.getElementById('billStatus').textContent = 'Paid';
      document.getElementById('billMethod').textContent = p.paymentMethod || '\u2014';
    }else{
      document.getElementById('billStatus').textContent = '\u2014';
      document.getElementById('billMethod').textContent = '\u2014';
    }
    renderBillCharges();
  }
  function renderBillCharges(){
    const charges = getBillCharges(currentPatientUhid);
    const list = document.getElementById('billChargesList');
    const p = queue.find(x=>x.uhid===currentPatientUhid) || fullQueueData.find(x=>x.uhid===currentPatientUhid);
    const baseFee = p ? (FEE_BY_TYPE[p.type]||500) : 0;
    if(charges.length===0){
      list.innerHTML = '<div class="ctab-empty" style="padding:8px 0;">No additional charges added.</div>';
    }else{
      list.innerHTML = charges.map((c,i)=>`
        <div class="bill-row"><div class="br-label">${c.desc}</div><div style="display:flex;align-items:center;gap:10px;"><div class="br-value">\u20B9${c.amount}</div><div class="med-remove" onclick="removeBillCharge(${i})"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3"><path d="M18 6L6 18M6 6l12 12"/></svg></div></div></div>`).join('');
    }
    const chargeTotal = charges.reduce((s,c)=>s+Number(c.amount||0),0);
    document.getElementById('billTotal').textContent = '\u20B9'+(baseFee+chargeTotal);
  }
  function addBillCharge(){
    const desc = document.getElementById('billChargeDesc').value.trim();
    const amt = parseFloat(document.getElementById('billChargeAmt').value);
    if(!desc || !amt || amt<=0){ showToast('Enter a description and a valid amount.', true); return; }
    getBillCharges(currentPatientUhid).push({desc, amount:amt});
    document.getElementById('billChargeDesc').value='';
    document.getElementById('billChargeAmt').value='';
    renderBillCharges();
    showToast('Charge added \u2014 will be collected at checkout.');
  }
  function removeBillCharge(i){
    getBillCharges(currentPatientUhid).splice(i,1);
    renderBillCharges();
  }

  // ================= COMPLETE CONSULTATION =================
  function completeConsultation(){
    const uhid = currentPatientUhid;
    // mark this visit completed in both data sources
    [queue, fullQueueData].forEach(arr=>arr.forEach(p=>{ if(p.uhid===uhid){ p.status='completed'; p.action='completed'; } }));

    const durationText = (document.querySelector('#page-consultation .s-row b')) ? document.querySelectorAll('#page-consultation .s-row b')[1].textContent : '\u2014';
    document.getElementById('ccDuration').textContent = durationText;
    const now = new Date();
    document.getElementById('ccDateTime').textContent = now.toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'numeric'})+', '+nowTimeLabel();
    document.getElementById('ccDoctor').textContent = currentDoctorIdentity || 'Dr. Arjun Patel';

    document.getElementById('completeOverlay').classList.add('open');
  }
  function closeCompleteModal(){
    document.getElementById('completeOverlay').classList.remove('open');
  }
  function ccViewSummary(){
    closeCompleteModal();
    switchConsultTab('notes');
    showToast('Showing the full consultation record for this visit.');
  }
  function ccGenerateBill(){
    closeCompleteModal();
    switchConsultTab('billing');
  }
  function ccBackToDashboard(){
    closeCompleteModal();
    showPage('dashboard');
  }

  function togglePrevConsultRow(id){
    const row = document.getElementById('pcRow-'+id);
    document.querySelectorAll('.pc-row').forEach(r=>{ if(r.id!=='pcRow-'+id) r.classList.remove('open'); });
    if(row) row.classList.toggle('open');
  }
  function copyPrescriptionToMeds(id){
    const record = prescriptionsList.find(r=>r.id===id);
    if(!record || !record.medsList || record.medsList.length===0) return;
    switchConsultTab('meds');
    document.getElementById('medCardsWrap').innerHTML = '';
    record.medsList.forEach(m=>{
      addMedRow();
      const card = document.getElementById('medCardsWrap').lastElementChild;
      card.querySelector('.med-card-name').value = m.drug;
      card.querySelector('.med-strength').value = m.strength;
      card.querySelector('.med-duration').value = m.duration;
      card.querySelector('.med-card-instr').value = m.instructions;
      card.dataset.freq = m.frequency;
      const pill = Array.from(card.querySelectorAll('.freq-pill')).find(p=>m.frequency && m.frequency.startsWith(p.textContent));
      if(pill) pill.classList.add('active');
    });
    showToast(record.medsList.length+' medication'+(record.medsList.length===1?'':'s')+' copied to current prescription. You can edit them before saving.');
  }

  // ================= LAB ORDERS (persisted per-patient, by UHID) =================
  let labOrdersAll = [];
  let labOrderIdCounter = 1;
  function quickAddLabOrder(name){ addLabOrder(name, false); }
  function addCustomLabOrder(){
    const name = document.getElementById('labCustomInput').value.trim();
    if(!name){ showToast('Type a test name first.', true); return; }
    addLabOrder(name, false);
    document.getElementById('labCustomInput').value='';
  }
  function addLabOrder(name, urgent){
    labOrdersAll.push({id:labOrderIdCounter++, uhid: currentPatientUhid, patientName: document.getElementById('patientName').textContent, name, urgent, status:'Ordered', date: nowTimeLabel()});
    renderLabOrders();
  }
  function removeLabOrder(id){
    labOrdersAll = labOrdersAll.filter(o=>o.id!==id);
    renderLabOrders();
  }
  function setLabOrderStatus(id, status){
    const o = labOrdersAll.find(x=>x.id===id);
    if(o) o.status = status;
  }
  function getLabOrdersForUhid(uhid){ return labOrdersAll.filter(o=>o.uhid===uhid); }
  function renderLabOrders(){
    const mine = getLabOrdersForUhid(currentPatientUhid);
    document.getElementById('labOrderCount').textContent = mine.length;
    const list = document.getElementById('labOrdersList');
    if(mine.length===0){ list.innerHTML = '<div class="ctab-empty">No tests prescribed yet for this patient.</div>'; return; }
    list.innerHTML = mine.map(o=>`
      <div class="lab-order-row">
        <div class="lo-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 2v6L4 20a1 1 0 0 0 1 2h14a1 1 0 0 0 1-2L15 8V2M9 2h6"/></svg></div>
        <div style="flex:1;"><div class="lo-name">${o.name}</div><div class="lo-sub">Prescribed ${o.date}</div></div>
        ${o.urgent?'<span class="lo-urgent">Urgent</span>':''}
        <a href="#" onclick="return false;" style="font-size:12px;color:var(--primary);font-weight:600;text-decoration:none;white-space:nowrap;">View Report</a>
        <div class="med-remove" onclick="removeLabOrder(${o.id})"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6h14z"/></svg></div>
      </div>`).join('');
  }

  // ================= DIAGNOSIS (persisted per-patient, by UHID â€” simplified common-code list, not a full ICD-10 database) =================
  const DX_CODES = [
    {code:'J06.9', desc:'Acute upper respiratory infection, unspecified'},
    {code:'R50.9', desc:'Fever, unspecified'},
    {code:'I10', desc:'Essential (primary) hypertension'},
    {code:'E11.9', desc:'Type 2 diabetes mellitus, without complications'},
    {code:'M54.5', desc:'Low back pain'},
    {code:'M25.50', desc:'Pain in unspecified joint'},
    {code:'R51', desc:'Headache'},
    {code:'G43.9', desc:'Migraine, unspecified'},
    {code:'J00', desc:'Acute nasopharyngitis (common cold)'},
    {code:'J45.909', desc:'Unspecified asthma, uncomplicated'},
    {code:'K59.00', desc:'Constipation, unspecified'},
    {code:'K21.9', desc:'Gastro-esophageal reflux disease without esophagitis'},
    {code:'R10.9', desc:'Abdominal pain, unspecified'},
    {code:'L30.9', desc:'Dermatitis, unspecified (skin rash)'},
    {code:'E03.9', desc:'Hypothyroidism, unspecified'},
    {code:'E78.5', desc:'Hyperlipidemia, unspecified'},
    {code:'F41.9', desc:'Anxiety disorder, unspecified'},
    {code:'F32.9', desc:'Major depressive disorder, single episode, unspecified'},
    {code:'N39.0', desc:'Urinary tract infection, site not specified'},
    {code:'R05', desc:'Cough'},
    {code:'J02.9', desc:'Acute pharyngitis, unspecified (sore throat)'},
    {code:'H10.9', desc:'Conjunctivitis, unspecified'},
    {code:'M79.1', desc:'Myalgia (body ache)'},
    {code:'Z00.00', desc:'General adult medical examination (routine checkup)'}
  ];
  let dxAddedAll = [];
  function getDxForUhid(uhid){ return dxAddedAll.filter(d=>d.uhid===uhid); }
  function renderDxResults(){
    const q = document.getElementById('dxSearchInput').value.trim();
    const ql = q.toLowerCase();
    const box = document.getElementById('dxResults');
    if(!q || q.length<2){ box.classList.remove('open'); box.innerHTML=''; return; }
    const matches = DX_CODES.filter(d=>d.code.toLowerCase().includes(ql) || d.desc.toLowerCase().includes(ql)).slice(0,8);
    const escapedQ = q.replace(/'/g, "\\'").replace(/"/g, '&quot;');
    const customBtn = `<div class="dx-result-row" style="border-top:1px solid var(--ink-100);margin-top:4px;padding-top:8px;" onclick="addDxCode('LOCAL','${escapedQ}')">
        <div class="dx-desc" style="color:var(--primary);font-weight:600;">+ Add &quot;${q}&quot; as custom diagnosis</div>
        <div class="dx-code" style="background:var(--ink-100);color:var(--ink-700);">LOCAL</div>
      </div>`;
    if(matches.length===0){ box.innerHTML='<div class="ctab-empty" style="padding:14px 14px 8px;">No matching codes found.</div>' + customBtn; box.classList.add('open'); return; }
    box.innerHTML = matches.map(d=>`
      <div class="dx-result-row" onclick='addDxCode(${JSON.stringify(d.code)},${JSON.stringify(d.desc)})'>
        <div class="dx-desc">${d.desc}</div>
        <div class="dx-code">${d.code}</div>
      </div>`).join('') + customBtn;
    box.classList.add('open');
  }
  function addDxCode(code, desc){
    const mine = getDxForUhid(currentPatientUhid);
    if(code!=='LOCAL' && mine.some(d=>d.code===code)){ showToast('That diagnosis is already added.', true); return; }
    if(code==='LOCAL' && mine.some(d=>d.code==='LOCAL' && d.desc===desc)){ showToast('That diagnosis is already added.', true); return; }
    dxAddedAll.push({uhid: currentPatientUhid, code, desc, primary: mine.length===0, date: nowTimeLabel()});
    document.getElementById('dxSearchInput').value='';
    document.getElementById('dxResults').classList.remove('open');
    renderDxChips();
  }
  function removeDxCode(code){
    dxAddedAll = dxAddedAll.filter(d=>!(d.uhid===currentPatientUhid && d.code===code));
    const mine = getDxForUhid(currentPatientUhid);
    if(mine.length && !mine.some(d=>d.primary)) mine[0].primary = true;
    renderDxChips();
  }
  function setPrimaryDx(code){
    getDxForUhid(currentPatientUhid).forEach(d=>d.primary = (d.code===code));
    renderDxChips();
  }
  function renderDxChips(){
    const mine = getDxForUhid(currentPatientUhid);
    document.getElementById('dxCount').textContent = mine.length;
    const list = document.getElementById('dxChipList');
    if(mine.length===0){ list.innerHTML='<div class="ctab-empty">No diagnosis codes added yet.</div>'; return; }
    list.innerHTML = mine.map(d=>`
      <div class="dx-chip ${d.primary?'primary':''}">
        <div class="dxc-code">${d.code}</div>
        <div class="dxc-desc">${d.desc}</div>
        ${d.primary?'<span class="dxc-tag">Primary</span>':`<span class="dxc-tag" style="background:var(--ink-100);color:var(--ink-500);cursor:pointer;" onclick="setPrimaryDx('${d.code}')">Set Primary</span>`}
        <div class="dxc-remove" onclick="removeDxCode('${d.code}')"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3"><path d="M18 6L6 18M6 6l12 12"/></svg></div>
      </div>`).join('');
  }

  // ================= SECTION NAV (scroll-spy + click) =================
  function scrollToPanel(e, id){
    e.preventDefault();
    var el = document.getElementById(id);
    var container = document.getElementById('consultSectionsScroll');
    if(el && container) container.scrollTo({top: el.offsetTop - container.offsetTop, behavior:'smooth'});
  }
  (function(){
    var ticking = false;
    var panels = ['panelClinicalNotes','panelLabOrders','panelFindings','panelDiagnosis','panelMedications','panelTreatment'];
    function updateProgressBar(){
      var nav = document.getElementById('consultSectionNav');
      var container = document.getElementById('consultSectionsScroll');
      if(!nav || !container) return;
      var currentIdx = 0;
      panels.forEach(function(id, i){
        var el = document.getElementById(id);
        if(el){
          var top = el.offsetTop - container.offsetTop - container.scrollTop;
          if(top <= 20) currentIdx = i;
        }
      });
      var steps = nav.querySelectorAll('.pbar-step');
      var lines = nav.querySelectorAll('.pbar-line');
      steps.forEach(function(step, i){
        step.classList.remove('done','current');
        if(i < currentIdx) step.classList.add('done');
        else if(i === currentIdx) step.classList.add('current');
      });
      lines.forEach(function(line, i){
        line.classList.remove('done','active');
        if(i < currentIdx) line.classList.add('done');
        else if(i === currentIdx) line.classList.add('active');
      });
    }
    function attachScrollSpy(){
      var container = document.getElementById('consultSectionsScroll');
      if(container){
        container.addEventListener('scroll', function(){
          if(!ticking){ requestAnimationFrame(function(){ updateProgressBar(); ticking=false; }); ticking=true; }
        });
      }
    }
    setTimeout(function(){ attachScrollSpy(); updateProgressBar(); }, 500);
  })();

  // ================= VITALS MODAL =================
  function openVitalsModal(){
    document.getElementById('vitalsModalOverlay').style.display = 'flex';
  }
  function closeVitalsModal(){
    document.getElementById('vitalsModalOverlay').style.display = 'none';
  }
  function vmStep(id, delta){
    const el = document.getElementById(id);
    let val = parseFloat(el.value) || 0;
    val = Math.round((val + delta) * 10) / 10;
    if(val < 0) val = 0;
    el.value = val;
  }
  function saveVitalsFromModal(){
    closeVitalsModal();
    showToast('Vitals updated successfully.');
  }

  function togglePanel(fieldId){
    const field=document.getElementById(fieldId);
    const panel=field.querySelector('.dropdown-panel');
    const trigger=field.querySelector('.select-like');
    const willOpen=!panel.classList.contains('open');
    closeAllPanels(fieldId);
    panel.classList.toggle('open',willOpen);
    trigger.classList.toggle('open',willOpen);
    if(fieldId==='dateField' && willOpen) renderCalendar();
  }
  document.addEventListener('click',function(e){
    if(!e.target.closest('.follow-field')) closeAllPanels(null);
  });

  function pickType(el,label){
    document.getElementById('typeValue').textContent=label;
    document.getElementById('typeTrigger').classList.add('filled');
    document.querySelectorAll('#typePanel .type-option').forEach(o=>o.classList.remove('selected'));
    el.classList.add('selected');
    togglePanel('typeField');
  }

  function pickQuickDate(el,label){
    document.getElementById('dateValue').textContent=label;
    document.getElementById('dateTrigger').classList.add('filled');
    togglePanel('dateField');
  }

  let calDate=new Date(2026,7,1);
  const monthNames=['January','February','March','April','May','June','July','August','September','October','November','December'];
  function shiftMonth(dir){
    calDate.setMonth(calDate.getMonth()+dir);
    renderCalendar();
  }
  function renderCalendar(){
    const label=document.getElementById('calMonthLabel');
    const grid=document.getElementById('calGrid');
    label.textContent=monthNames[calDate.getMonth()]+' '+calDate.getFullYear();
    grid.innerHTML='';
    ['S','M','T','W','T','F','S'].forEach(d=>{
      const el=document.createElement('div');
      el.className='cal-dow'; el.textContent=d; grid.appendChild(el);
    });
    const year=calDate.getFullYear(), month=calDate.getMonth();
    const firstDow=new Date(year,month,1).getDay();
    const daysInMonth=new Date(year,month+1,0).getDate();
    const daysInPrevMonth=new Date(year,month,0).getDate();
    const today=new Date(2026,6,30);
    for(let i=firstDow-1;i>=0;i--){
      addDay(grid,daysInPrevMonth-i,true,false,false);
    }
    for(let d=1;d<=daysInMonth;d++){
      const isToday=(year===today.getFullYear()&&month===today.getMonth()&&d===today.getDate());
      addDay(grid,d,false,isToday,false);
    }
    const remaining=(7-(grid.children.length-7)%7)%7;
    for(let d=1;d<=remaining;d++){
      addDay(grid,d,true,false,false);
    }
  }
  function addDay(grid,num,muted,isToday,selected){
    const el=document.createElement('div');
    el.className='cal-day'+(muted?' muted':'')+(isToday?' today':'')+(selected?' selected':'');
    el.textContent=num;
    if(!muted){
      el.onclick=function(){
        document.querySelectorAll('.cal-day').forEach(c=>c.classList.remove('selected'));
        el.classList.add('selected');
        const label=monthNames[calDate.getMonth()].slice(0,3)+' '+num+', '+calDate.getFullYear();
        document.getElementById('dateValue').textContent=label;
        document.getElementById('dateTrigger').classList.add('filled');
        setTimeout(()=>togglePanel('dateField'),120);
      };
    }
    grid.appendChild(el);
  }

  // ================= FULL QUEUE PAGE =================