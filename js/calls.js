  let callTimerInterval=null;
  let callSeconds=0;
  let activeCallPatient=null;
  let micOn=true, camOn=true, speakerOn=true;

  function startCall(patient, mode){
    activeCallPatient=patient;
    micOn=true; camOn=true; speakerOn=true;
    callSeconds=0;
    const ini = initials(patient.name);
    const color = chipColor(patient.name);

    if(mode==='video'){
      document.getElementById('vcPatientChip').textContent=ini;
      document.getElementById('vcPatientChip').style.background=color;
      document.getElementById('vcPatientName').textContent=patient.name;
      document.getElementById('vcPatientSub').textContent='UHID: '+patient.uhid+' Â· '+patient.age+'Y Â· '+patient.gender;
      document.getElementById('vcMainAvatar').textContent=ini;
      document.getElementById('vcMainAvatar').style.background=color;
      document.getElementById('vcMainName').textContent=patient.name;
      document.getElementById('vcTimer').textContent='00:00';
      document.getElementById('videoNotesPanel').classList.remove('open');
      document.getElementById('vcNotesToggleBtn').classList.remove('active');
      resetCallControls('video');
      document.getElementById('videoCallScreen').classList.add('open');
      const cw=document.getElementById('videoConnecting');
      cw.style.display='flex';
      document.getElementById('videoConnectingText').textContent='Connecting to '+patient.name+'â€¦';
      setTimeout(()=>{ cw.style.display='none'; }, 1100);
    }else{
      document.getElementById('acPatientChip').textContent=ini;
      document.getElementById('acPatientChip').style.background=color;
      document.getElementById('acPatientName').textContent=patient.name;
      document.getElementById('acPatientSub').textContent='UHID: '+patient.uhid+' Â· '+patient.age+'Y Â· '+patient.gender;
      document.getElementById('acMainAvatar').textContent=ini;
      document.getElementById('acMainAvatar').style.background=color;
      document.getElementById('acMainName').textContent=patient.name;
      document.getElementById('acTimer').textContent='00:00';
      document.getElementById('audioNotesPanel').classList.remove('open');
      document.getElementById('acNotesToggleBtn').classList.remove('active');
      buildWaveform();
      resetCallControls('audio');
      document.getElementById('audioCallScreen').classList.add('open');
      const cw=document.getElementById('audioConnecting');
      cw.style.display='flex';
      document.getElementById('audioConnectingText').textContent='Connecting to '+patient.name+'â€¦';
      setTimeout(()=>{ cw.style.display='none'; }, 1100);
    }

    clearInterval(callTimerInterval);
    callTimerInterval=setInterval(()=>{
      callSeconds++;
      const m=String(Math.floor(callSeconds/60)).padStart(2,'0');
      const s=String(callSeconds%60).padStart(2,'0');
      const el = mode==='video' ? document.getElementById('vcTimer') : document.getElementById('acTimer');
      if(el) el.textContent=m+':'+s;
    },1000);
  }

  function buildWaveform(){
    const wf=document.getElementById('acWaveform');
    wf.innerHTML='';
    for(let i=0;i<24;i++){
      const bar=document.createElement('span');
      bar.style.animationDelay=(Math.random()*1).toFixed(2)+'s';
      wf.appendChild(bar);
    }
  }

  function resetCallControls(mode){
    if(mode==='video'){
      document.getElementById('vcMicBtn').classList.remove('off');
      document.getElementById('vcCamBtn').classList.remove('off');
      document.getElementById('vcVideoTile').classList.remove('cam-off');
      document.getElementById('vcCamCaption').textContent='Camera on';
      document.getElementById('vcSelfView').classList.remove('cam-off');
    }else{
      document.getElementById('acMicBtn').classList.remove('off');
      document.getElementById('acSpeakerBtn').classList.remove('off');
    }
  }

  const MIC_ON_ICON='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v4"/></svg>';
  const MIC_OFF_ICON='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 1l22 22"/><path d="M9 9v3a3 3 0 0 0 4.6 2.53M15 9.34V4a3 3 0 0 0-5.94-.6"/><path d="M19 10v2a7 7 0 0 1-.11 1.23M12 19v4"/></svg>';
  const CAM_ON_ICON='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="6" width="14" height="12" rx="2"/><path d="M22 8.5l-6 3.5 6 3.5z"/></svg>';
  const CAM_OFF_ICON='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 1l22 22"/><path d="M16 16.72V18a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h1.34M9 6h5a2 2 0 0 1 2 2v5"/><path d="M22 8.5l-6 3.5"/></svg>';

  function toggleCallMic(mode){
    micOn=!micOn;
    const btn = mode==='video'?document.getElementById('vcMicBtn'):document.getElementById('acMicBtn');
    btn.classList.toggle('off', !micOn);
    btn.title = micOn?'Mute':'Unmute';
    btn.innerHTML = micOn ? MIC_ON_ICON : MIC_OFF_ICON;
  }

  function toggleCallCam(){
    camOn=!camOn;
    const btn=document.getElementById('vcCamBtn');
    btn.classList.toggle('off', !camOn);
    btn.title = camOn?'Turn off camera':'Turn on camera';
    document.getElementById('vcVideoTile').classList.toggle('cam-off', !camOn);
    document.getElementById('vcCamCaption').textContent = camOn ? 'Camera on' : 'Camera off';
    document.getElementById('vcSelfView').classList.toggle('cam-off', !camOn);
    btn.innerHTML = camOn ? CAM_ON_ICON : CAM_OFF_ICON;
  }

  function toggleCallSpeaker(){
    speakerOn=!speakerOn;
    const btn=document.getElementById('acSpeakerBtn');
    btn.classList.toggle('off', !speakerOn);
    btn.title = speakerOn?'Mute speaker':'Unmute speaker';
  }

  function toggleCallNotes(mode){
    const panel = mode==='video'?document.getElementById('videoNotesPanel'):document.getElementById('audioNotesPanel');
    const btn = mode==='video'?document.getElementById('vcNotesToggleBtn'):document.getElementById('acNotesToggleBtn');
    panel.classList.toggle('open');
    btn.classList.toggle('active');
  }

  // ---- generic confirm modal (reused for End Call) ----
  let confirmCallback=null;
  function openConfirmModal(title,msg,confirmLabel,cb){
    document.getElementById('cmTitle').textContent=title;
    document.getElementById('cmMsg').textContent=msg;
    document.getElementById('cmConfirmBtn').textContent=confirmLabel;
    confirmCallback=cb;
    document.getElementById('confirmModalOverlay').classList.add('open');
  }
  function closeConfirmModal(){
    document.getElementById('confirmModalOverlay').classList.remove('open');
    confirmCallback=null;
  }
  function confirmModalAction(){
    const cb=confirmCallback;
    closeConfirmModal();
    if(cb) cb();
  }

  function requestEndCall(mode){
    const name = activeCallPatient ? activeCallPatient.name : 'the patient';
    openConfirmModal(
      'End call with '+name+'?',
      'This will end the '+(mode==='video'?'video':'audio')+' call and take you to consultation notes to finish documentation.',
      'End Call',
      ()=>endCall(mode)
    );
  }

  function endCall(mode){
    clearInterval(callTimerInterval);
    document.getElementById(mode==='video'?'videoCallScreen':'audioCallScreen').classList.remove('open');
    const patient = activeCallPatient;
    activeCallPatient=null;
    if(patient) populateConsultation(patient);
  }

  // ================= PAYMENT GATE (doctor-facing: pass or blocked, never collects payment) =================
  const FEE_BY_TYPE = { clinic:500, walkin:500, video:400, audio:300 };
  const TYPE_LABEL_FOR_FEE = { clinic:'In Clinic visit', walkin:'Walk-in visit', video:'Video consultation', audio:'Audio consultation' };

  let pmPendingPatient=null;
  let pmPendingMode=null;

  function requestStartConsultation(patient, mode){
    const alreadyPaid = !!(patient.paid || patient.exceptionApproved);

    if(alreadyPaid){
      // the doctor's queue only ever contains paid/exception-approved patients (unpaid ones never
      // reach here at all) â€” so there's nothing left to confirm, go straight in
      pmPendingPatient = patient;
      pmPendingMode = mode;
      proceedAfterPayment();
      return;
    }

    // defensive fallback only â€” shouldn't be reachable from the doctor's own queue, but kept in case
    // this function is ever called from somewhere that hasn't already filtered for payment
    pmPendingPatient = patient;
    pmPendingMode = mode;

    const ini = initials(patient.name);
    const color = chipColor(patient.name);
    document.getElementById('pmChip').textContent = ini;
    document.getElementById('pmChip').style.background = color;
    document.getElementById('pmName').textContent = patient.name;
    document.getElementById('pmSub').textContent = 'UHID: '+patient.uhid+' Â· '+TYPE_LABEL_FOR_FEE[patient.type];

    const fee = FEE_BY_TYPE[patient.type] || 500;
    document.getElementById('pmFeeAmount').textContent = 'â‚¹'+fee;
    document.getElementById('pmFeeSub').textContent = TYPE_LABEL_FOR_FEE[patient.type];
    document.getElementById('pmPaidBanner').style.display = 'none';
    document.getElementById('pmUnpaidSection').style.display = 'block';

    const btn = document.getElementById('pmPrimaryBtn');
    btn.textContent = 'Awaiting Payment at Reception';
    btn.style.background = 'var(--ink-300)';
    btn.style.cursor = 'not-allowed';
    btn.onclick = ()=>showToast('This patient must pay at reception first, or have an admin apply an exception.', true);

    showMainPaymentView();
    document.getElementById('paymentModalOverlay').classList.add('open');
  }

  function showExceptionView(){
    document.getElementById('pmMainView').style.display='none';
    document.getElementById('pmExceptionView').style.display='block';
    document.getElementById('pmFootMain').style.display='none';
    document.getElementById('pmFootException').style.display='flex';
  }
  function showMainPaymentView(){
    document.getElementById('pmMainView').style.display='block';
    document.getElementById('pmExceptionView').style.display='none';
    document.getElementById('pmFootMain').style.display='flex';
    document.getElementById('pmFootException').style.display='none';
    document.getElementById('peAdminSelect').value='';
    document.getElementById('peAdminPin').value='';
    document.getElementById('peReason').value='';
  }

  // both queue[] and fullQueueData[] can hold separate object instances for the same real patient â€”
  // this keeps their payment status in sync so a patient isn't paid in one view and hidden in the other
  function syncPaidStatus(uhid, updates){
    [queue, fullQueueData].forEach(arr=>{
      arr.forEach(p=>{ if(p.uhid===uhid) Object.assign(p, updates); });
    });
  }

  function approveExceptionAndProceed(){
    const admin = document.getElementById('peAdminSelect').value;
    const pin = document.getElementById('peAdminPin').value;
    const reason = document.getElementById('peReason').value.trim();
    if(!admin){ showToast('Select the authorizing admin first.', true); return; }
    if(!/^\d{4}$/.test(pin)){ showToast('Enter a valid 4-digit admin PIN.', true); return; }
    if(!reason){ showToast('A reason is required for the exception.', true); return; }

    pmPendingPatient.exceptionApproved = true;
    pmPendingPatient.exceptionAdmin = admin;
    pmPendingPatient.exceptionReason = reason;
    syncPaidStatus(pmPendingPatient.uhid, {exceptionApproved:true, exceptionAdmin:admin, exceptionReason:reason});
    showToast('Exception approved by '+admin+' â€” proceeding without payment.', true);
    proceedAfterPayment();
  }

  function proceedAfterPayment(){
    document.getElementById('paymentModalOverlay').classList.remove('open');
    const patient = pmPendingPatient;
    const mode = pmPendingMode;
    pmPendingPatient=null; pmPendingMode=null;
    if(!patient) return;
    if(mode==='video') startCall(patient,'video');
    else if(mode==='audio') startCall(patient,'audio');
    else populateConsultation(patient);
  }

  function closePaymentModal(){
    document.getElementById('paymentModalOverlay').classList.remove('open');
    pmPendingPatient=null; pmPendingMode=null;
  }

  // ================= RECEPTION CHECK-IN (the ONLY entry point into the doctor's queue) =================