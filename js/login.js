  let pendingOtpTarget = null; // 'staff' | 'patient' â€” which flow is currently verifying an OTP
  let currentPinInput = '';
  let currentPinStaff = null;
  let otpCountdownTimer = null;

  function showLoginStep(stepId){
    document.querySelectorAll('.login-step').forEach(s=>s.classList.remove('active'));
    document.getElementById(stepId).classList.add('active');
  }

  function setRoleAccent(role){
    const card = document.getElementById('loginCard');
    card.classList.remove('role-accent-doctor','role-accent-admin','role-accent-reception','role-accent-patient');
    if(role) card.classList.add('role-accent-'+role);
  }

  let selectedStaffRole = 'doctor';
  function selectLoginRole(role){
    history.replaceState(null, '', '#'+role);
    setRoleAccent(role);
    if(role==='doctor' || role==='admin'){
      selectedStaffRole = role;
      document.getElementById('staffLoginTitle').textContent = (role==='doctor' ? 'Doctor' : 'Admin')+' Sign In';
      document.getElementById('staffLoginSub').textContent = role==='admin'
        ? 'Admin access is logged for audit purposes'
        : 'Enter your credentials to continue';
      setStaffAuthMode('password');
      showLoginStep('loginStepStaff');
    }else if(role==='reception'){
      renderStaffPicker();
      document.getElementById('staffPickerView').style.display='block';
      document.getElementById('pinPadView').style.display='none';
      showLoginStep('loginStepReception');
    }else if(role==='patient'){
      document.getElementById('patientPhoneView').style.display='block';
      document.getElementById('patientOtpView').style.display='none';
      document.getElementById('patientRegisterView').style.display='none';
      showLoginStep('loginStepPatient');
    }
  }

  function backToRolePicker(){
    history.replaceState(null, '', location.pathname+location.search);
    try{ localStorage.removeItem('hospitall_device_role'); }catch(e){}
    setRoleAccent(null);
    document.getElementById('unifiedLoginError').classList.remove('show');
    showLoginStep('loginStepRole');
  }

  // ================= UNIFIED LOGIN: detect role from what was typed, no role-card needed =================
  function continueUnifiedLogin(){
    const raw = document.getElementById('unifiedIdentifier').value.trim();
    const err = document.getElementById('unifiedLoginError');
    err.classList.remove('show');
    if(!raw){ err.textContent='Please enter your email, phone number, or name.'; err.classList.add('show'); return; }

    const digitsOnly = raw.replace(/\D/g,'');

    if(raw.includes('@')){
      // email -> Doctor if it matches a known doctor, otherwise treat as Admin (both use email/password login)
      const doc = doctorList.find(d=>d.email.toLowerCase()===raw.toLowerCase());
      if(doc){
        selectLoginRole('doctor');
        document.getElementById('staffEmail').value = doc.email;
      }else{
        selectLoginRole('admin');
        document.getElementById('staffEmail').value = raw;
      }
      return;
    }

    if(digitsOnly.length===10){
      // 10-digit number -> Patient (phone + OTP is self-serve, no pre-existing match required)
      selectLoginRole('patient');
      document.getElementById('patientPhone').value = raw;
      return;
    }

    // otherwise, treat as a staff name and look up the PIN-based staff list (reception & admin-on-PIN)
    const nameMatches = staffList.filter(s=>s.name.toLowerCase().includes(raw.toLowerCase()));
    if(nameMatches.length===1){
      selectLoginRole('reception');
      selectReceptionStaff(nameMatches[0].name, nameMatches[0].roleLabel, nameMatches[0].color);
    }else if(nameMatches.length>1){
      selectLoginRole('reception'); // ambiguous â€” let them pick from the staff list
    }else{
      err.textContent = 'We couldn\u2019t find an account matching "'+raw+'". Check for typos, or contact your clinic admin.';
      err.classList.add('show');
    }
  }

  // ---- Doctor / Admin ----
  function setStaffAuthMode(mode){
    document.getElementById('tabPassword').classList.toggle('active', mode==='password');
    document.getElementById('tabOtp').classList.toggle('active', mode==='otp');
    document.getElementById('staffPasswordMode').style.display = mode==='password' ? 'block' : 'none';
    document.getElementById('staffOtpMode').style.display = mode==='otp' ? 'block' : 'none';
    document.getElementById('staffLoginError').classList.remove('show');
    document.getElementById('staffOtpRequestView').style.display='block';
    document.getElementById('staffOtpVerifyView').style.display='none';
  }

  function togglePwVisibility(inputId, el){
    const input = document.getElementById(inputId);
    input.type = input.type==='password' ? 'text' : 'password';
  }

  function resolveStaffLogin(role, enteredEmail){
    if(role==='doctor'){
      const match = doctorList.find(d=>d.email.toLowerCase()===enteredEmail.toLowerCase().trim());
      const d = match || doctorList[0];
      return {name:d.name, roleLabel:d.specialization, color:d.color};
    }
    return {name:'Ravi Krishnan', roleLabel:'Clinic Admin', color:'#7C3AED'};
  }

  function submitStaffPasswordLogin(){
    const email = document.getElementById('staffEmail').value.trim();
    const pw = document.getElementById('staffPassword').value;
    const err = document.getElementById('staffLoginError');
    if(!email || !pw){
      err.textContent = 'Please enter both email/phone and password.';
      err.classList.add('show');
      return;
    }
    err.classList.remove('show');
    const u = resolveStaffLogin(selectedStaffRole, email);
    completeLogin(selectedStaffRole, u.name, u.roleLabel, initials(u.name), u.color);
  }

  function requestStaffOtp(){
    const phone = document.getElementById('staffOtpPhone').value.trim();
    if(!phone){ showToast('Enter your registered phone number.', true); return; }
    document.getElementById('staffOtpPhoneShown').textContent = phone;
    document.getElementById('staffOtpRequestView').style.display='none';
    document.getElementById('staffOtpVerifyView').style.display='block';
    document.querySelectorAll('#staffOtpVerifyView .otp-box').forEach(b=>b.value='');
    document.querySelector('#staffOtpVerifyView .otp-box').focus();
    startOtpCountdown('staffOtpResend', requestStaffOtp);
  }

  function verifyStaffOtp(){
    const boxes = document.querySelectorAll('#staffOtpVerifyView .otp-box');
    const code = Array.from(boxes).map(b=>b.value).join('');
    if(code.length<6){ showToast('Enter the full 6-digit code.', true); return; }
    const email = document.getElementById('staffOtpPhone').value.trim(); // reused as identity hint for doctor lookup
    const u = resolveStaffLogin(selectedStaffRole, email);
    completeLogin(selectedStaffRole, u.name, u.roleLabel, initials(u.name), u.color);
  }

  function otpAutoAdvance(el){
    if(el.value.length>=1){
      const next = el.nextElementSibling;
      if(next && next.classList.contains('otp-box')) next.focus();
    }
  }

  function startOtpCountdown(labelId, onResend){
    let secs = 30;
    const el = document.getElementById(labelId);
    clearInterval(otpCountdownTimer);
    function tick(){
      if(secs<=0){
        el.innerHTML = '<span onclick="'+(onResend.name)+'()">Resend code</span>';
        clearInterval(otpCountdownTimer);
      }else{
        el.innerHTML = 'Resend code in <b>'+secs+'s</b>';
        secs--;
      }
    }
    tick();
    otpCountdownTimer = setInterval(tick, 1000);
  }

  // ---- Receptionist ----
  // single source of truth for staff accounts â€” this is what "Add Staff Member" actually writes to
  let staffList = [
    {name:'Meena Iyer', roleLabel:'Front Desk Lead', role:'reception', color:'#2563EB', pin:'1234'},
    {name:'Ravi Krishnan', roleLabel:'Clinic Manager', role:'admin', color:'#7C3AED', pin:'5678'}
  ];
  let doctorList = [
    {name:'Dr. Arjun Patel', specialization:'Cardiologist', email:'arjun.patel@citycareclinic.com', color:'#1E40AF'}
  ];
  const staffColorCycle = ['#2563EB','#7C3AED','#0D9488','#D97706','#DC2626','#4F46E5'];

  function renderStaffPicker(){
    // only reception & admin staff use the shared front-desk PIN pad â€” doctors sign in via email/password instead
    const grid = document.getElementById('staffPickerGrid');
    if(!grid) return;
    grid.innerHTML = staffList.map(s=>`
      <div class="staff-card" onclick="selectReceptionStaff('${s.name}','${s.roleLabel}','${s.color}')">
        <div class="sc-avatar" style="background:${s.color};">${initials(s.name)}</div>
        <div class="sc-name">${s.name}</div>
        <div class="sc-role">${s.roleLabel}</div>
      </div>`).join('');
  }

  function renderAdminStaffList(){
    const list = document.getElementById('staffManageList');
    if(!list) return;
    const staffRows = staffList.map(s=>`
      <div class="rc-recent-row">
        <div class="rc-chip" style="background:${s.color};">${initials(s.name)}</div>
        <div><div class="rr-name">${s.name}</div><div class="rr-sub">${s.roleLabel} Â· ${s.role==='admin'?'Admin':'Receptionist'} access</div></div>
        <div class="rr-badge"><span style="width:6px;height:6px;border-radius:50%;background:var(--success);display:inline-block;"></span>Active</div>
      </div>`).join('');
    const doctorRows = doctorList.map(d=>`
      <div class="rc-recent-row">
        <div class="rc-chip" style="background:${d.color};">${initials(d.name)}</div>
        <div><div class="rr-name">${d.name}</div><div class="rr-sub">${d.specialization} Â· Doctor access</div></div>
        <div class="rr-badge"><span style="width:6px;height:6px;border-radius:50%;background:var(--success);display:inline-block;"></span>Active</div>
      </div>`).join('');
    list.innerHTML = doctorRows + staffRows;
  }

  function toggleAddStaffFields(){
    const role = document.getElementById('newStaffRole').value;
    const isDoctor = role==='doctor';
    document.getElementById('staffFieldsWrap').style.display = isDoctor ? 'none' : 'block';
    document.getElementById('doctorFieldsWrap').style.display = isDoctor ? 'block' : 'none';
    document.getElementById('addStaffFormMsg').textContent = isDoctor
      ? 'They\u2019ll sign in from the Doctor tab using the email below â€” no PIN needed.'
      : 'They\u2019ll use these details to sign in â€” share the PIN with them securely afterward.';
  }

  function openAddStaffModal(){
    document.getElementById('newStaffName').value='';
    document.getElementById('newStaffTitle').value='';
    document.getElementById('newDoctorSpecialization').value='';
    document.getElementById('newDoctorEmail').value='';
    document.getElementById('newStaffRole').value='reception';
    document.getElementById('newStaffLink').value='';
    toggleAddStaffFields();
    document.getElementById('addStaffFormView').style.display='block';
    document.getElementById('addStaffSuccessView').style.display='none';
    document.getElementById('addStaffOverlay').classList.add('open');
  }
  function copyNewStaffLink(){
    const val = document.getElementById('newStaffLink').value;
    if(!val) return;
    navigator.clipboard.writeText(val).then(()=>showToast('Link copied to clipboard.')).catch(()=>showToast('Could not copy â€” select and copy manually.', true));
  }
  function closeAddStaffModal(){
    document.getElementById('addStaffOverlay').classList.remove('open');
  }

  function createStaffMember(){
    const name = document.getElementById('newStaffName').value.trim();
    const role = document.getElementById('newStaffRole').value;
    if(!name){ showToast('Please enter a name.', true); return; }

    const color = staffColorCycle[(staffList.length+doctorList.length) % staffColorCycle.length];

    if(role==='doctor'){
      const specialization = document.getElementById('newDoctorSpecialization').value.trim();
      const email = document.getElementById('newDoctorEmail').value.trim();
      if(!specialization || !email){ showToast('Please fill in specialization and email.', true); return; }
      const displayName = name.startsWith('Dr.') ? name : 'Dr. '+name;
      doctorList.push({name:displayName, specialization, email, color});

      renderAdminStaffList();
      document.getElementById('adminStaffCount').textContent = staffList.length + doctorList.length;

      document.getElementById('addStaffFormView').style.display='none';
      document.getElementById('addStaffSuccessView').style.display='block';
      document.getElementById('newStaffSummary').innerHTML = displayName+' can now sign in as Doctor.';
      document.getElementById('newStaffPinWrap').style.display='none';
      document.getElementById('newDoctorEmailWrap').style.display='flex';
      document.getElementById('newDoctorEmailShown').textContent = email;
      document.getElementById('newStaffLink').value = location.origin+location.pathname+'#doctor';
      return;
    }

    const title = document.getElementById('newStaffTitle').value.trim();
    if(!title){ showToast('Please enter a job title.', true); return; }
    const pin = String(Math.floor(1000+Math.random()*9000));
    staffList.push({name, roleLabel:title, role, color, pin});

    renderStaffPicker();
    renderAdminStaffList();
    document.getElementById('adminStaffCount').textContent = staffList.length + doctorList.length;

    document.getElementById('addStaffFormView').style.display='none';
    document.getElementById('addStaffSuccessView').style.display='block';
    document.getElementById('newStaffSummary').innerHTML = name+' can now sign in as '+(role==='admin'?'Admin':'Receptionist')+'.';
    document.getElementById('newStaffPinWrap').style.display='block';
    document.getElementById('newDoctorEmailWrap').style.display='none';
    document.getElementById('newStaffPin').textContent = pin;
    document.getElementById('newStaffLink').value = location.origin+location.pathname+'#reception='+encodeURIComponent(name);
  }

  function selectReceptionStaff(name, roleLabel, color){
    currentPinStaff = {name, roleLabel, color};
    currentPinInput = '';
    document.getElementById('pinAvatarChip').textContent = initials(name);
    document.getElementById('pinAvatarChip').style.background = color;
    document.getElementById('pinStaffName').textContent = name;
    document.getElementById('pinStaffRole').textContent = roleLabel;
    updatePinDots(false);
    document.getElementById('staffPickerView').style.display='none';
    document.getElementById('pinPadView').style.display='block';
  }

  function backToStaffPicker(){
    document.getElementById('staffPickerView').style.display='block';
    document.getElementById('pinPadView').style.display='none';
  }

  function updatePinDots(errorState){
    document.querySelectorAll('#pinDots .pin-dot').forEach((d,i)=>{
      d.classList.toggle('filled', i<currentPinInput.length && !errorState);
      d.classList.toggle('error', !!errorState);
    });
  }

  function pressPinDigit(d){
    if(currentPinInput.length>=4) return;
    currentPinInput += d;
    updatePinDots(false);
    if(currentPinInput.length===4){
      setTimeout(()=>{
        // prototype: any 4 digits succeeds
        completeLogin('reception', currentPinStaff.name, currentPinStaff.roleLabel, initials(currentPinStaff.name), currentPinStaff.color);
      }, 200);
    }
  }
  function clearPin(){ currentPinInput=''; updatePinDots(false); }
  function backspacePin(){ currentPinInput = currentPinInput.slice(0,-1); updatePinDots(false); }

  // ---- Patient ----
  let pendingPatientProfile = null;

  function requestPatientOtp(){
    const phone = document.getElementById('patientPhone').value.trim();
    if(!/^\d{10}$|^\d{5}\s?\d{5}$/.test(phone.replace(/\s/g,''))){
      showToast('Enter a valid 10-digit mobile number.', true); return;
    }
    pendingPatientProfile = pendingPatientProfile || {name:'Patient', phone};
    document.getElementById('patientOtpPhoneShown').textContent = phone;
    document.getElementById('patientPhoneView').style.display='none';
    document.getElementById('patientRegisterView').style.display='none';
    document.getElementById('patientOtpView').style.display='block';
    document.querySelectorAll('#patientOtpView .otp-box').forEach(b=>b.value='');
    document.querySelector('#patientOtpView .otp-box').focus();
    startOtpCountdown('patientOtpResend', requestPatientOtp);
  }

  function verifyPatientOtp(){
    const boxes = document.querySelectorAll('#patientOtpView .otp-box');
    const code = Array.from(boxes).map(b=>b.value).join('');
    if(code.length<6){ showToast('Enter the full 6-digit code.', true); return; }
    const name = pendingPatientProfile ? pendingPatientProfile.name : 'Patient';
    completeLogin('patient', name, 'Patient', initials(name), '#16A34A');
  }

  function showPatientRegister(){
    document.getElementById('patientPhoneView').style.display='none';
    document.getElementById('patientRegisterView').style.display='block';
  }

  function submitPatientRegister(){
    const name = document.getElementById('regName').value.trim();
    const phone = document.getElementById('regPhone').value.trim();
    const age = document.getElementById('regAge').value;
    if(!name || !phone || !age){ showToast('Please fill in all fields.', true); return; }
    pendingPatientProfile = {name, phone, age, gender: document.getElementById('regGender').value};
    document.getElementById('patientPhone').value = phone;
    requestPatientOtp();
  }

  // ---- Patient Portal: online appointment booking ----
  let currentPatientIdentity = null; // {name, phone} for whoever is logged into the Patient Portal
  let bookingIdCounter = 1;
  let bookSelectedDoctor = null;
  let bookSelectedType = 'clinic';
  let bookSelectedSlot = null;

  function openBookAppointment(){
    bookSelectedType = 'clinic';
    bookSelectedSlot = null;
    document.getElementById('bookApptFormView').style.display='block';
    document.getElementById('bookApptSuccessView').style.display='none';
    document.querySelectorAll('#bookApptOverlay .rc-type-pill').forEach((t,i)=>t.classList.toggle('active', i===0));

    const list = document.getElementById('bookDoctorList');
    list.innerHTML = doctorList.map((d,i)=>`
      <div class="doc-pick${i===0?' active':''}" onclick="selectBookDoctor(this,'${d.name}')">
        <div class="dp-chip" style="background:${d.color};">${initials(d.name)}</div>
        <div><div class="dp-name">${d.name}</div><div class="dp-spec">${d.specialization}</div></div>
      </div>`).join('');
    bookSelectedDoctor = doctorList[0] ? doctorList[0].name : null;

    renderBookSlots();
    document.getElementById('bookApptOverlay').classList.add('open');
  }
  function closeBookAppointment(){
    document.getElementById('bookApptOverlay').classList.remove('open');
  }
  function selectBookDoctor(el, doctorName){
    bookSelectedDoctor = doctorName;
    document.querySelectorAll('#bookDoctorList .doc-pick').forEach(d=>d.classList.remove('active'));
    el.classList.add('active');
    renderBookSlots();
  }
  function selectBookType(el, type){
    bookSelectedType = type;
    document.querySelectorAll('#bookApptOverlay .rc-type-pill').forEach(t=>t.classList.remove('active'));
    el.classList.add('active');
  }
  function renderBookSlots(){
    const grid = document.getElementById('bookSlotGrid');
    bookSelectedSlot = null;
    if(!bookSelectedDoctor){ grid.innerHTML='<div class="slot-empty-note">No doctors available.</div>'; return; }
    const slots = getAvailableSlots(bookSelectedDoctor);
    if(slots.length===0){ grid.innerHTML='<div class="slot-empty-note">No open slots left today â€” try another doctor.</div>'; return; }
    grid.innerHTML = slots.map(s=>`<div class="slot-chip" onclick="selectBookSlot(this,'${s}')">${s}</div>`).join('');
  }
  function selectBookSlot(el, slot){
    bookSelectedSlot = slot;
    document.querySelectorAll('#bookSlotGrid .slot-chip').forEach(c=>c.classList.remove('active'));
    el.classList.add('active');
  }
  let lastConfirmedBooking = null;
  function confirmBookAppointment(){
    if(!bookSelectedDoctor || !bookSelectedSlot){ showToast('Please pick a doctor and a time slot.', true); return; }
    const booking = {
      id: bookingIdCounter++,
      patientName: currentPatientIdentity ? currentPatientIdentity.name : 'Patient',
      phone: currentPatientIdentity ? currentPatientIdentity.phone : '',
      doctor: bookSelectedDoctor, type: bookSelectedType, time: bookSelectedSlot, reason:'Online booking'
    };
    onlineBookings.push(booking);
    lastConfirmedBooking = booking;
    renderPatientNextAppointment();
    renderUpcomingBookings();
    renderNotifications();
    renderSchedule();

    document.getElementById('bookApptFormView').style.display='none';
    document.getElementById('bookApptSuccessView').style.display='block';
    document.getElementById('bookSuccessMsg').textContent = 'We\u2019ll see you at '+bookSelectedSlot+' with '+bookSelectedDoctor+'.';
  }

  function buildBookingMessage(b){
    return `Hi ${b.patientName}, your ${(TYPE_LABEL_FOR_FEE[b.type]||b.type).toLowerCase()} appointment with ${b.doctor} at ${clinicName} is confirmed for today at ${b.time}. Please arrive (or call in) a few minutes early to complete check-in and payment. â€” ${clinicName}`;
  }
  function shareBookingWhatsApp(){
    if(!lastConfirmedBooking) return;
    openWhatsApp(lastConfirmedBooking.phone, buildBookingMessage(lastConfirmedBooking));
  }
  function shareBookingSms(){
    if(!lastConfirmedBooking) return;
    openSms(lastConfirmedBooking.phone, buildBookingMessage(lastConfirmedBooking));
  }

  function renderPatientNextAppointment(){
    if(!currentPatientIdentity) return;
    const upcoming = onlineBookings.find(b=>b.patientName.toLowerCase()===currentPatientIdentity.name.toLowerCase());
    const nextCard = document.getElementById('ppNextCard');
    const noneCard = document.getElementById('ppNoAppointmentCard');
    if(upcoming){
      const doc = doctorList.find(d=>d.name===upcoming.doctor);
      document.getElementById('ppNextDoctor').textContent = upcoming.doctor+(doc?' â€” '+doc.specialization:'');
      document.getElementById('ppNextDetails').textContent = 'Today Â· '+upcoming.time+' Â· '+(TYPE_LABEL_FOR_FEE[upcoming.type]||upcoming.type);
      nextCard.style.display='block';
      noneCard.style.display='none';
    }else{
      nextCard.style.display='none';
      noneCard.style.display='block';
    }
  }

  // ---- session / routing ----
  let currentSessionRole = null;
  let currentDoctorIdentity = null; // the specific doctor's name, when role==='doctor' â€” scopes their queue view
  function completeLogin(role, displayName, roleLabel, avatarInitials, avatarColor){
    currentSessionRole = role;
    currentDoctorIdentity = (role==='doctor') ? displayName : null;
    try{ localStorage.setItem('hospitall_device_role', role); }catch(e){}
    document.getElementById('loginScreen').classList.add('hidden');
    clearInterval(otpCountdownTimer);

    if(role==='patient'){
      currentPatientIdentity = { name: displayName, phone: pendingPatientProfile ? pendingPatientProfile.phone : '' };
      document.getElementById('mainApp').style.display='none';
      document.getElementById('patientPortal').classList.add('open');
      document.getElementById('ppGreeting').textContent = 'Hi, '+displayName.split(' ')[0]+'!';
      renderPatientNextAppointment();
      return;
    }

    document.getElementById('patientPortal').classList.remove('open');
    document.getElementById('mainApp').style.display='';
    document.getElementById('topUserName').textContent = displayName;
    document.getElementById('topUserRole').textContent = roleLabel;
    document.getElementById('topUserAvatar').textContent = avatarInitials;
    document.getElementById('topUserAvatar').style.background = avatarColor;

    if(role==='doctor') showPage('dashboard');
    else if(role==='admin') showPage('adminOverview');
    else if(role==='reception') showPage('reception');
    renderNotifications();
    renderSchedule();
  }

  function goHome(){
    if(currentSessionRole==='admin') showPage('adminOverview');
    else if(currentSessionRole==='reception') showPage('reception');
    else showPage('dashboard');
  }

  function logout(){
    closeAllFloatMenus();
    currentSessionRole = null;
    currentDoctorIdentity = null;
    currentPatientIdentity = null;
    document.getElementById('mainApp').style.display='none';
    document.getElementById('patientPortal').classList.remove('open');
    document.getElementById('loginScreen').classList.remove('hidden');
    initLoginFromHash(); // if this device has a role-specific link (#doctor, #reception, etc.), go straight back to it
    // reset all login forms for the next person
    document.getElementById('staffEmail').value='arjun.patel@citycareclinic.com';
    document.getElementById('staffPassword').value='';
    document.getElementById('patientPhone').value='';
    pendingPatientProfile = null;
    currentPinInput=''; currentPinStaff=null;
  }

  function toggleTopUserMenu(e){
    e.stopPropagation();
    const menu = document.getElementById('topUserMenu');
    if(menu.classList.contains('open')){ menu.classList.remove('open'); return; }
    closeAllTopPanels();
    const r = e.currentTarget.getBoundingClientRect();
    menu.style.top = (r.bottom+8)+'px';
    menu.style.left = Math.max(12, r.right-200)+'px';
    menu.classList.add('open');
  }

  // ================= SIDEBAR COLLAPSE (icon-only mode, toggled by the header hamburger) =================