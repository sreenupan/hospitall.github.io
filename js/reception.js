  let nextUhidNum = 147; // continues on from HSP24-00146, the last seeded patient
  let rcSelectedExistingPatient = null; // set when picking an existing patient from search
  let rcIsNewPatient = false;
  let rcVisitType = 'clinic';
  let rcMethod = 'Cash';
  let rcWhenMode = 'now';
  let rcScheduledTime = null;
  let rcFulfillingBookingId = null;
  let onlineBookings = []; // appointments requested via the Patient Portal, not yet checked in / paid

  // ---- shared time-slot system (used by both Reception scheduling and Patient Portal booking) ----
  function generateTimeSlots(){
    const slots=[];
    for(let h=8; h<20; h++){
      slots.push(formatSlot(h,0));
      slots.push(formatSlot(h,15));
      slots.push(formatSlot(h,30));
      slots.push(formatSlot(h,45));
    }
    return slots;
  }
  function formatSlot(h,m){
    const ap = h>=12 ? 'PM':'AM';
    let hh = h%12; if(hh===0) hh=12;
    return String(hh).padStart(2,'0')+':'+String(m).padStart(2,'0')+' '+ap;
  }
  function takenSlotsForDoctor(doctorName){
    const taken = new Set();
    queue.forEach(p=>{ if(p.doctor===doctorName) taken.add(p.time); });
    fullQueueData.forEach(p=>{ if(p.doctor===doctorName && p.status!=='completed' && p.status!=='cancelled') taken.add(p.time); });
    onlineBookings.forEach(b=>{ if(b.doctor===doctorName) taken.add(b.time); });
    return taken;
  }
  function getAvailableSlots(doctorName){
    const taken = takenSlotsForDoctor(doctorName);
    return generateTimeSlots().filter(s=>!taken.has(s));
  }

  function getKnownPatients(){
    // merge both data sources, de-duplicated by UHID, so reception can find anyone already in the system
    const map = new Map();
    queue.forEach(p=>map.set(p.uhid, p));
    fullQueueData.forEach(p=>{ if(!map.has(p.uhid)) map.set(p.uhid, p); });
    return Array.from(map.values());
  }

  function searchReceptionPatients(){
    const q = document.getElementById('rcSearchInput').value.trim().toLowerCase();
    const resultsEl = document.getElementById('rcResults');
    resultsEl.innerHTML='';
    if(!q){ return; }
    const matches = getKnownPatients().filter(p=>
      p.name.toLowerCase().includes(q) || p.uhid.toLowerCase().includes(q) || (p.phone||'').includes(q)
    ).slice(0,6);
    matches.forEach(p=>{
      const row=document.createElement('div');
      row.className='rc-result';
      row.innerHTML=`<div class="rc-chip" style="background:${chipColor(p.name)}">${initials(p.name)}</div>
        <div><div class="rc-r-name">${p.name}</div><div class="rc-r-sub">UHID: ${p.uhid} &nbsp;Â·&nbsp; ${p.age}Y &nbsp;Â·&nbsp; ${p.gender} &nbsp;Â·&nbsp; ${p.phone}</div></div>`;
      row.onclick=()=>selectExistingPatient(p);
      resultsEl.appendChild(row);
    });
    if(matches.length===0){
      resultsEl.innerHTML = '<div style="padding:8px;font-size:12.5px;color:var(--ink-500);">No matches â€” try Add Patient below.</div>';
    }
  }

  function selectExistingPatient(p){
    rcSelectedExistingPatient = p;
    rcIsNewPatient = false;
    document.getElementById('rcSearchInput').value='';
    document.getElementById('rcResults').innerHTML='';
    document.getElementById('rcNewForm').classList.remove('open');
    showSelectedPatientBanner(p.name, p.uhid+' Â· '+p.age+'Y Â· '+p.gender);
    validateReceptionForm();
  }

  function toggleNewPatientForm(){
    document.getElementById('rcNewForm').classList.toggle('open');
    document.getElementById('rcResults').innerHTML='';
    document.getElementById('rcSearchInput').value='';
  }

  // ---- Dashboard Quick Actions: same Check-In screen, pre-configured for two different intents ----
  function quickAddPatient(){
    showPage('reception');
    toggleNewPatientForm(); // jump straight to the new-patient fields, since that's the express intent
    setTimeout(()=>{ const el=document.getElementById('rcNewName'); if(el) el.focus(); }, 50);
  }
  function quickScheduleAppointment(){
    showPage('reception');
    setRcWhenMode('later'); // jump straight to the time-slot picker instead of defaulting to "Now"
  }

  function showSelectedPatientBanner(name, sub){
    const ini = initials(name);
    document.getElementById('rcSelChip').textContent = ini;
    document.getElementById('rcSelChip').style.background = chipColor(name);
    document.getElementById('rcSelName').textContent = name;
    document.getElementById('rcSelSub').textContent = sub;
    document.getElementById('rcSelectedPatient').classList.add('open');
  }

  function clearSelectedPatient(){
    rcSelectedExistingPatient=null;
    rcIsNewPatient=false;
    document.getElementById('rcSelectedPatient').classList.remove('open');
    document.getElementById('rcNewForm').classList.remove('open');
    document.getElementById('rcNewName').value='';
    document.getElementById('rcNewAge').value='';
    document.getElementById('rcNewPhone').value='';
    validateReceptionForm();
  }

  function selectVisitType(el, type){
    rcVisitType = type;
    document.querySelectorAll('.rc-type-pill').forEach(t=>t.classList.remove('active'));
    el.classList.add('active');
    const fee = FEE_BY_TYPE[type] || 500;
    document.getElementById('rcFeeAmount').textContent = 'â‚¹'+fee;
    document.getElementById('rcFeeSub').textContent = TYPE_LABEL_FOR_FEE[type];
    document.getElementById('rcUpiAmt').textContent = fee;
    validateReceptionForm();
  }

  function setRcWhenMode(mode, includeSlot){
    rcWhenMode = mode;
    rcScheduledTime = null;
    document.getElementById('whenNowBtn').classList.toggle('active', mode==='now');
    document.getElementById('whenLaterBtn').classList.toggle('active', mode==='later');
    document.getElementById('rcSlotWrap').style.display = mode==='later' ? 'block' : 'none';
    if(mode==='later') renderRcSlots(includeSlot);
    validateReceptionForm();
  }

  function onRcDoctorChange(){
    if(rcWhenMode==='later') renderRcSlots();
    validateReceptionForm();
  }

  function renderRcSlots(includeSlot){
    const doctorName = document.getElementById('rcDoctorSelect').value;
    let slots = getAvailableSlots(doctorName);
    // when fulfilling an online booking, that booking's own slot is technically "taken" by itself â€”
    // it must still appear (and be pre-selected) rather than vanish from the grid
    if(includeSlot && !slots.includes(includeSlot)) slots = [includeSlot, ...slots];
    const grid = document.getElementById('rcSlotGrid');
    rcScheduledTime = null;
    if(slots.length===0){
      grid.innerHTML = '<div class="slot-empty-note">No open slots left today for this doctor.</div>';
      return;
    }
    grid.innerHTML = slots.map(s=>`<div class="slot-chip" onclick="selectRcSlot(this,'${s}')">${s}</div>`).join('');
    if(includeSlot){
      const chip = Array.from(grid.querySelectorAll('.slot-chip')).find(c=>c.textContent===includeSlot);
      if(chip) selectRcSlot(chip, includeSlot);
    }
  }
  function selectRcSlot(el, slot){
    rcScheduledTime = slot;
    document.querySelectorAll('#rcSlotGrid .slot-chip').forEach(c=>c.classList.remove('active'));
    el.classList.add('active');
    validateReceptionForm();
  }

  function pickReasonChip(el, text){
    document.getElementById('rcReasonInput').value = text;
    document.querySelectorAll('.rc-chip-btn').forEach(c=>c.classList.remove('active'));
    el.classList.add('active');
    validateReceptionForm();
  }

  function selectRcMethod(el, method){
    rcMethod = method;
    document.querySelectorAll('#rcPayMainView .pm-method').forEach(m=>m.classList.remove('active'));
    el.classList.add('active');
    document.getElementById('rcUpiBox').style.display = (method==='UPI') ? 'flex' : 'none';
  }

  function showRcException(){
    document.getElementById('rcPayMainView').style.display='none';
    document.getElementById('rcPayExceptionView').style.display='block';
    validateReceptionForm();
  }
  function showRcMainPay(){
    document.getElementById('rcPayMainView').style.display='block';
    document.getElementById('rcPayExceptionView').style.display='none';
    validateReceptionForm();
  }

  function usingExceptionPath(){
    return document.getElementById('rcPayExceptionView').style.display==='block';
  }

  function validateReceptionForm(){
    const btn = document.getElementById('rcSubmitBtn');
    const hasPatient = !!rcSelectedExistingPatient || (document.getElementById('rcNewForm').classList.contains('open') && document.getElementById('rcNewName').value.trim());
    const hasReason = document.getElementById('rcReasonInput').value.trim().length>0;

    if(!hasPatient){
      btn.classList.add('disabled'); btn.textContent='Select or add a patient first'; return;
    }
    if(!hasReason){
      btn.classList.add('disabled'); btn.textContent='Add a reason for visit'; return;
    }
    if(rcWhenMode==='later' && !rcScheduledTime){
      btn.classList.add('disabled'); btn.textContent='Pick a time slot'; return;
    }
    btn.classList.remove('disabled');
    if(usingExceptionPath()){
      btn.textContent='Approve Exception & Check In Patient';
    }else{
      const fee = FEE_BY_TYPE[rcVisitType] || 500;
      btn.textContent = 'Collect â‚¹'+fee+' & Check In Patient';
    }
  }

  function nowTimeLabel(){
    const d = new Date();
    let h = d.getHours(), m = d.getMinutes();
    const ap = h>=12 ? 'PM' : 'AM';
    h = h%12; if(h===0) h=12;
    return String(h).padStart(2,'0')+':'+String(m).padStart(2,'0')+' '+ap;
  }

  function submitCheckIn(){
    if(document.getElementById('rcSubmitBtn').classList.contains('disabled')) return;

    // resolve patient (existing or newly registered)
    let patientBase;
    if(rcSelectedExistingPatient){
      patientBase = rcSelectedExistingPatient;
    }else{
      const name = document.getElementById('rcNewName').value.trim();
      const age = parseInt(document.getElementById('rcNewAge').value,10) || 0;
      const gender = document.getElementById('rcNewGender').value;
      const phone = document.getElementById('rcNewPhone').value.trim() || 'â€”';
      const uhid = 'HSP24-'+String(nextUhidNum++).padStart(5,'0');
      patientBase = {name, age, gender, phone, uhid};
    }

    const reason = document.getElementById('rcReasonInput').value.trim();
    const selectedDoctor = document.getElementById('rcDoctorSelect').value || (doctorList[0] && doctorList[0].name);
    const time = rcScheduledTime || nowTimeLabel();
    const isException = usingExceptionPath();

    let paid=false, exceptionApproved=false, exceptionAdmin=null, exceptionReason=null;
    if(isException){
      const admin = document.getElementById('rcAdminSelect').value;
      const pin = document.getElementById('rcAdminPin').value;
      const exReason = document.getElementById('rcAdminReason').value.trim();
      if(!admin){ showToast('Select the authorizing admin first.', true); return; }
      if(!/^\d{4}$/.test(pin)){ showToast('Enter a valid 4-digit admin PIN.', true); return; }
      if(!exReason){ showToast('A reason is required for the exception.', true); return; }
      exceptionApproved=true; exceptionAdmin=admin; exceptionReason=exReason;
    }else{
      paid=true; // collected at reception, via rcMethod
    }

    const isNewPatientRecord = !rcSelectedExistingPatient;
    const freq = isNewPatientRecord ? 'First Visit' : (patientBase.freq || 'Twice / Year');
    const freqIcon = isNewPatientRecord ? 'star' : (patientBase.freqIcon || 'cal');

    const newEntryDash = {
      time, name: patientBase.name, uhid: patientBase.uhid, age: patientBase.age, gender: patientBase.gender,
      phone: patientBase.phone, type: rcVisitType, freq, freqIcon, action:'active', doctor: selectedDoctor,
      paid, exceptionApproved, exceptionAdmin, exceptionReason, paymentMethod: isException?null:rcMethod
    };
    const newEntryFull = {
      time, name: patientBase.name, uhid: patientBase.uhid, age: patientBase.age, gender: patientBase.gender,
      phone: patientBase.phone, type: rcVisitType, freq, freqIcon, status:'yts', reason, doctor: selectedDoctor,
      paid, exceptionApproved, exceptionAdmin, exceptionReason, paymentMethod: isException?null:rcMethod
    };

    // avoid duplicating an already-known patient's row if they're re-checking in â€” just add the fresh visit entries
    queue.push(newEntryDash);
    fullQueueData.push(newEntryFull);

    if(rcFulfillingBookingId!=null){
      onlineBookings = onlineBookings.filter(b=>b.id!==rcFulfillingBookingId);
      rcFulfillingBookingId = null;
      renderUpcomingBookings();
    }

    addToRecentCheckins(patientBase.name, patientBase.uhid, rcVisitType, isException);
    renderNotifications();
    renderSchedule();

    // refresh whichever queue views exist so the new patient shows up immediately
    renderQueue(dashTypeFilter);
    renderFullQueue();

    const fee = FEE_BY_TYPE[rcVisitType] || 500;
    openReceiptModal({
      patient: newEntryFull, fee, method: rcMethod, isException,
      exceptionAdmin, exceptionReason,
      subtitle: isException ? 'Exception approved â€” patient is now in the queue' : 'Patient is now in the queue'
    });

    resetReceptionForm();
  }

  function addToRecentCheckins(name, uhid, type, isException){
    const card = document.getElementById('rcRecentCard');
    const list = document.getElementById('rcRecentList');
    card.style.display='block';
    const row=document.createElement('div');
    row.className='rc-recent-row';
    row.innerHTML=`<div class="rc-chip" style="background:${chipColor(name)}">${initials(name)}</div>
      <div><div class="rr-name">${name}</div><div class="rr-sub">${uhid} &nbsp;Â·&nbsp; ${TYPE_LABEL_FOR_FEE[type]}</div></div>
      <div class="rr-badge"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M20 6L9 17l-5-5"/></svg>${isException?'Exception':'Paid'}</div>`;
    list.insertBefore(row, list.firstChild);
  }

  function resetReceptionForm(){
    rcSelectedExistingPatient=null;
    rcIsNewPatient=false;
    rcVisitType='clinic';
    rcMethod='Cash';
    rcWhenMode='now';
    rcScheduledTime=null;
    document.getElementById('whenNowBtn').classList.add('active');
    document.getElementById('whenLaterBtn').classList.remove('active');
    document.getElementById('rcSlotWrap').style.display='none';
    document.getElementById('rcSearchInput').value='';
    document.getElementById('rcResults').innerHTML='';
    document.getElementById('rcNewForm').classList.remove('open');
    document.getElementById('rcNewName').value='';
    document.getElementById('rcNewAge').value='';
    document.getElementById('rcNewGender').value='Male';
    document.getElementById('rcNewPhone').value='';
    document.getElementById('rcSelectedPatient').classList.remove('open');
    document.querySelectorAll('.rc-type-pill').forEach((t,i)=>t.classList.toggle('active', i===0));
    document.getElementById('rcFeeAmount').textContent='â‚¹500';
    document.getElementById('rcFeeSub').textContent='In Clinic visit';
    const docSel = document.getElementById('rcDoctorSelect');
    docSel.innerHTML = doctorList.map(d=>`<option value="${d.name}">${d.name} â€” ${d.specialization}</option>`).join('');
    document.getElementById('rcReasonInput').value='';
    document.querySelectorAll('.rc-chip-btn').forEach(c=>c.classList.remove('active'));
    document.querySelectorAll('#rcPayMainView .pm-method').forEach((m,i)=>m.classList.toggle('active', i===0));
    document.getElementById('rcUpiBox').style.display='none';
    showRcMainPay();
    document.getElementById('rcAdminSelect').value='';
    document.getElementById('rcAdminPin').value='';
    document.getElementById('rcAdminReason').value='';
    renderUpcomingBookings();
    validateReceptionForm();
  }

  // ---- Upcoming Online Bookings (requested via Patient Portal, awaiting reception check-in) ----
  function renderUpcomingBookings(){
    const card = document.getElementById('rcBookingsCard');
    const list = document.getElementById('rcBookingsList');
    if(!card || !list) return;
    if(onlineBookings.length===0){ card.style.display='none'; list.innerHTML=''; return; }
    card.style.display='block';
    list.innerHTML = onlineBookings.map(b=>`
      <div class="rc-booking-row">
        <div class="rc-chip" style="background:${chipColor(b.patientName)}">${initials(b.patientName)}</div>
        <div><div class="rb-name">${b.patientName}</div><div class="rb-sub">${b.time} &nbsp;Â·&nbsp; ${TYPE_LABEL_FOR_FEE[b.type]||b.type} &nbsp;Â·&nbsp; ${b.doctor}</div></div>
        <div class="rb-remind" onclick="sendBookingReminder(${b.id})" title="Send WhatsApp reminder"><svg viewBox="0 0 24 24" fill="currentColor" width="15" height="15"><path d="M17.6 6.32A7.85 7.85 0 0 0 12.05 4a7.94 7.94 0 0 0-6.9 11.9L4 20l4.2-1.1a7.9 7.9 0 0 0 3.8 1h.05A7.94 7.94 0 0 0 20 12.05a7.85 7.85 0 0 0-2.4-5.73z"/></svg></div>
        <div class="rb-checkin" onclick="checkInFromBooking(${b.id})">Check In</div>
      </div>`).join('');
  }
  function sendBookingReminder(id){
    const booking = onlineBookings.find(b=>b.id===id);
    if(!booking) return;
    openWhatsApp(booking.phone, buildBookingMessage(booking));
  }

  function checkInFromBooking(id){
    const booking = onlineBookings.find(b=>b.id===id);
    if(!booking) return;
    rcFulfillingBookingId = id;

    // pre-fill: try to match an existing patient by name, else register as new
    const known = getKnownPatients().find(p=>p.name.toLowerCase()===booking.patientName.toLowerCase());
    if(known){
      selectExistingPatient(known);
    }else{
      document.getElementById('rcNewForm').classList.add('open');
      document.getElementById('rcNewName').value = booking.patientName;
      document.getElementById('rcNewPhone').value = booking.phone || '';
    }

    document.querySelectorAll('.rc-type-pill').forEach(t=>t.classList.toggle('active', t.dataset.type===booking.type));
    selectVisitType(document.querySelector('.rc-type-pill[data-type="'+booking.type+'"]'), booking.type);
    document.getElementById('rcDoctorSelect').value = booking.doctor;
    setRcWhenMode('later', booking.time); // renders the slot grid with their exact booked time included and pre-selected
    document.getElementById('rcReasonInput').value = booking.reason || 'Online booking';
    validateReceptionForm();
    window.scrollTo(0,0);
    showToast('Pre-filled from '+booking.patientName+"'s online booking â€” confirm payment to check in.");
  }


  let tokenCounter = 12; // continues today's token sequence (11 patients already seen/queued before this session)
  let receiptCounter = 8241;
  let lastReceiptData = null;

  function openReceiptModal(opts){
    const { patient, fee, method, isException, exceptionAdmin, exceptionReason, subtitle } = opts;
    const token = tokenCounter++;
    const receiptNo = 'RCP-2607-'+(receiptCounter++);
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-IN', {day:'2-digit', month:'short', year:'numeric'});

    lastReceiptData = { patient, fee, method, isException, exceptionAdmin, exceptionReason, token, receiptNo, dateStr, time: patient.time || nowTimeLabel() };

    const band = document.getElementById('receiptBand');
    band.classList.toggle('exception', !!isException);
    document.getElementById('receiptIcon').innerHTML = isException
      ? '<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.3"><path d="M12 9v4M12 17h.01M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/></svg>'
      : '<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3"><path d="M20 6L9 17l-5-5"/></svg>';
    document.getElementById('receiptTitle').textContent = isException ? 'Exception Approved' : 'Payment Received';
    document.getElementById('receiptSubtitle').textContent = subtitle || '';
    document.getElementById('receiptNo').textContent = 'Receipt No. '+receiptNo;
    document.getElementById('receiptToken').textContent = '#'+String(token).padStart(2,'0');
    document.getElementById('receiptPatientName').textContent = patient.name;
    document.getElementById('receiptUhid').textContent = patient.uhid;
    document.getElementById('receiptType').textContent = TYPE_LABEL_FOR_FEE[patient.type] || patient.type;
    document.getElementById('receiptDoctor').textContent = patient.doctor || 'Dr. Arjun Patel';
    document.getElementById('receiptDateTime').textContent = dateStr+', '+(patient.time || nowTimeLabel());

    document.getElementById('receiptPaidRows').style.display = isException ? 'none' : 'block';
    document.getElementById('receiptExceptionRows').style.display = isException ? 'block' : 'none';
    if(isException){
      document.getElementById('receiptExAdmin').textContent = exceptionAdmin || 'â€”';
      document.getElementById('receiptExReason').textContent = exceptionReason || 'â€”';
    }else{
      document.getElementById('receiptMethod').textContent = method;
      document.getElementById('receiptAmount').textContent = 'â‚¹'+fee;
    }

    document.getElementById('receiptOverlay').classList.add('open');
  }

  function closeReceiptModal(){
    document.getElementById('receiptOverlay').classList.remove('open');
  }

  function printReceipt(){
    if(!lastReceiptData) return;
    const d = lastReceiptData;
    const win = window.open('', '_blank');
    const paidBlock = d.isException
      ? `<tr><td>Approved By</td><td>${d.exceptionAdmin}</td></tr><tr><td>Reason</td><td>${d.exceptionReason}</td></tr><tr><td><b>Amount</b></td><td><b>â‚¹0 (Deferred â€” Exception)</b></td></tr>`
      : `<tr><td>Payment Method</td><td>${d.method}</td></tr><tr><td><b>Amount Paid</b></td><td><b>â‚¹${d.fee}</b></td></tr>`;
    win.document.write(`
      <html><head><title>Receipt ${d.receiptNo}</title>
      <style>
        body{font-family:Arial,sans-serif;padding:28px;color:#0F172A;max-width:360px;}
        h1{font-size:16px;margin-bottom:2px;text-align:center;}
        .addr{font-size:11px;color:#64748B;text-align:center;margin-bottom:4px;}
        .no{font-size:10px;color:#94A3B8;text-align:center;margin-bottom:16px;}
        .token{text-align:center;background:#F1F5F9;border-radius:8px;padding:10px;margin-bottom:16px;}
        .token .lbl{font-size:10px;color:#64748B;}
        .token .val{font-size:26px;font-weight:800;color:#2563EB;}
        table{width:100%;border-collapse:collapse;font-size:12px;}
        td{padding:5px 0;border-bottom:1px dashed #E2E8F0;}
        td:last-child{text-align:right;}
      </style></head><body>
      <h1>${clinicName}</h1>
      <div class="addr">${clinicAddress}</div>
      <div class="no">Receipt No. ${d.receiptNo}</div>
      <div class="token"><div class="lbl">TOKEN NUMBER</div><div class="val">#${String(d.token).padStart(2,'0')}</div></div>
      <table>
        <tr><td>Patient</td><td>${d.patient.name}</td></tr>
        <tr><td>UHID</td><td>${d.patient.uhid}</td></tr>
        <tr><td>Doctor</td><td>${d.patient.doctor||'Dr. Arjun Patel'}</td></tr>
        <tr><td>Consultation</td><td>${TYPE_LABEL_FOR_FEE[d.patient.type]||d.patient.type}</td></tr>
        <tr><td>Date &amp; Time</td><td>${d.dateStr}, ${d.time}</td></tr>
        ${paidBlock}
      </table>
      </body></html>
    `);
    win.document.close();
    win.focus();
    setTimeout(()=>{ try{ win.print(); }catch(e){} }, 300);
  }

  // ================= WHATSAPP / SMS SHARING =================
  // Real, working click-to-chat links â€” no business API needed. Opens WhatsApp Web/App or the
  // device's SMS composer with the message pre-filled; staff (or the patient) still hits Send themselves.
  function toWhatsAppNumber(phone){
    const digits = String(phone||'').replace(/\D/g,'');
    if(!digits) return null;
    return digits.length===10 ? '91'+digits : digits; // assume Indian numbers when no country code given
  }
  function openWhatsApp(phone, message){
    const num = toWhatsAppNumber(phone);
    if(!num){ showToast('No phone number on file for this patient.', true); return; }
    window.open('https://wa.me/'+num+'?text='+encodeURIComponent(message), '_blank');
  }
  function openSms(phone, message){
    if(!phone){ showToast('No phone number on file for this patient.', true); return; }
    window.open('sms:'+phone.replace(/\s/g,'')+'?&body='+encodeURIComponent(message), '_blank');
  }

  function buildReceiptMessage(d){
    if(d.isException){
      return `Hi ${d.patient.name}, your ${(TYPE_LABEL_FOR_FEE[d.patient.type]||d.patient.type).toLowerCase()} with ${d.patient.doctor||'your doctor'} at ${clinicName} is confirmed for ${d.time} today. Your token number is #${String(d.token).padStart(2,'0')}. See you soon! â€” ${clinicName}`;
    }
    return `Hi ${d.patient.name}, we've received your payment of â‚¹${d.fee} (${d.method}) for your ${(TYPE_LABEL_FOR_FEE[d.patient.type]||d.patient.type).toLowerCase()} with ${d.patient.doctor||'your doctor'} at ${clinicName}. Your token number is #${String(d.token).padStart(2,'0')}, appointment at ${d.time}. Receipt No. ${d.receiptNo}. Thank you!`;
  }
  function shareReceiptWhatsApp(){
    if(!lastReceiptData) return;
    openWhatsApp(lastReceiptData.patient.phone, buildReceiptMessage(lastReceiptData));
  }
  function shareReceiptSms(){
    if(!lastReceiptData) return;
    openSms(lastReceiptData.patient.phone, buildReceiptMessage(lastReceiptData));
  }

  // ================= LOGIN SYSTEM =================