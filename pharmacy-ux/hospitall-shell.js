/* Pharmacy shell. Existing workflow nodes and their handlers are preserved. */
(() => {
  function mount(){
    document.body.classList.add('ph-themed');
    const header=document.querySelector('body > .header'),nav=document.querySelector('body > .nav');
    const svg=path=>`<svg class="ph-nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${path}"/></svg>`;
    const icons=['M3 10 12 3l9 7v11h-6v-7H9v7H3Z','M4 5h16v15H4Zm0 5h16m-8-5v15','M4 21v-9h16v9M6 12V4h12v8','M8 10a3 3 0 1 0 0-6 3 3 0 0 0 0 6M2 21v-3a6 6 0 0 1 12 0v3m3-8a5 5 0 0 1 5 5v3','M5 3h14v18H5Zm3 5h8m-8 4h8m-8 4h5','M3 8h18v13H3Zm9-5v12m-4-4 4 4 4-4','M3 5h18v14H3Zm0 5h18m-5 5h3','M5 3h14v18H5Zm4 7h6m-3-3v6','M9 7H3m0 0 4-4M3 7l4 4m-2 5h11a5 5 0 0 0 0-10h-3','M12 3 2 21h20ZM12 9v5m0 3v1','M4 6h16M4 12h16M4 18h16M8 3v6m8 0v6m-8 0v6','M4 21V3m0 18h17M8 16v-5m5 5V7m5 9V4','M4 5h16v16H4Zm4 4h8m-8 4h8m-8 4h5','M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8M12 3v3m0 12v3M3 12h3m12 0h3','M5 3h14v18H5Zm4 5h6m-6 4h6m-6 4h4'];
    if(header&&nav){
      const shell=document.createElement('div');shell.className='ph-shell';const sidebar=document.createElement('aside');sidebar.className='ph-sidebar';sidebar.innerHTML='<div class="ph-brand"><div class="ph-brand-mark">H</div><span class="ph-brand-name">Hospitall</span><button class="ph-collapse" type="button"></button></div>';
      const main=document.createElement('main');main.className='ph-main';
      // Move the original nodes without changing their content, ids, order or listeners.
      const original=[...document.body.childNodes];document.body.prepend(shell);shell.append(sidebar,main);
      original.forEach(node=>{if(node===nav)sidebar.append(node);else main.append(node);});
      nav.id='ph-visual-navigation';nav.setAttribute('role','navigation');nav.setAttribute('aria-label','Pharmacy navigation');
      nav.querySelectorAll('a').forEach((a,i)=>{const label=a.textContent.trim();const span=document.createElement('span');span.className='ph-nav-label';while(a.firstChild)span.append(a.firstChild);a.append(span);a.insertAdjacentHTML('afterbegin',svg(icons[i]||icons[4]));a.title=label;a.setAttribute('aria-label',label);if(a.classList.contains('active'))a.setAttribute('aria-current','page');});
      const top=document.createElement('button');top.type='button';top.className='ph-toggle';top.innerHTML=svg('M4 6h16M4 12h16M4 18h16');header.prepend(top);
      const collapse=sidebar.querySelector('.ph-collapse');collapse.innerHTML=svg('m14 6-6 6 6 6');
      const resize=document.createElement('div');resize.className='ph-resize';resize.tabIndex=0;resize.textContent='↔';resize.setAttribute('role','separator');resize.setAttribute('aria-label','Resize navigation panel');resize.setAttribute('aria-orientation','vertical');resize.setAttribute('aria-valuemin','180');resize.setAttribute('aria-valuemax','360');shell.append(resize);
      const scrim=document.createElement('button');scrim.className='ph-scrim';scrim.type='button';scrim.tabIndex=-1;scrim.setAttribute('aria-label','Close navigation');shell.append(scrim);
      let width=212;try{const saved=Number(localStorage.getItem('pharmacyVisualSidebarWidth'));if(saved>=180&&saved<=360)width=saved;}catch(_){}
      const apply=()=>{shell.style.setProperty('--ph-width',width+'px');resize.setAttribute('aria-valuenow',String(width));};apply();
      const phone=()=>matchMedia('(max-width:700px)').matches;
      function sync(){const closed=shell.classList.contains('ph-collapsed');main.inert=phone()&&!closed;[top,collapse].forEach(b=>{b.setAttribute('aria-label',closed?'Expand navigation':'Collapse navigation');b.title=closed?'Expand navigation':'Collapse navigation';b.setAttribute('aria-expanded',String(!closed));b.setAttribute('aria-controls',nav.id);});}
      function toggle(){shell.classList.toggle('ph-collapsed');sync();(shell.classList.contains('ph-collapsed')?top:collapse).focus();}
      top.addEventListener('click',toggle);collapse.addEventListener('click',toggle);scrim.addEventListener('click',()=>{shell.classList.add('ph-collapsed');sync();top.focus();});
      if(phone())shell.classList.add('ph-collapsed');sync();window.addEventListener('resize',sync);
      document.addEventListener('keydown',e=>{if(e.key==='Escape'&&phone()&&!shell.classList.contains('ph-collapsed')){shell.classList.add('ph-collapsed');sync();top.focus();}});
      const setWidth=n=>{width=Math.max(180,Math.min(360,Math.round(n)));apply();try{localStorage.setItem('pharmacyVisualSidebarWidth',String(width));}catch(_){}};
      let dragging=false;resize.addEventListener('pointerdown',e=>{if(e.button!==0)return;e.preventDefault();shell.classList.remove('ph-collapsed');sync();dragging=true;resize.setPointerCapture(e.pointerId);});resize.addEventListener('pointermove',e=>{if(dragging)setWidth(e.clientX);});['pointerup','pointercancel','lostpointercapture'].forEach(name=>resize.addEventListener(name,()=>dragging=false));resize.addEventListener('keydown',e=>{if(!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;e.preventDefault();shell.classList.remove('ph-collapsed');sync();setWidth(e.key==='Home'?180:e.key==='End'?360:width+(e.key==='ArrowLeft'?-10:10));});
    }
    const invoice=document.querySelector('body > .page');if(invoice&&!header){document.body.classList.add('ph-invoice');const wrapper=document.createElement('div');wrapper.className='ph-invoice-scroll';wrapper.tabIndex=0;wrapper.setAttribute('role','region');wrapper.setAttribute('aria-label','Invoice preview; scroll horizontally to see all columns');invoice.before(wrapper);wrapper.append(invoice);}
    function tables(){document.querySelectorAll('.ph-main table').forEach(table=>{if(table.parentElement.classList.contains('ph-table-scroll'))return;const wrapper=document.createElement('div');wrapper.className='ph-table-scroll';wrapper.tabIndex=0;wrapper.setAttribute('role','region');wrapper.setAttribute('aria-label','Scrollable table');table.before(wrapper);wrapper.append(table);});}
    tables();const main=document.querySelector('.ph-main');if(main)new MutationObserver(tables).observe(main,{childList:true,subtree:true});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount);else mount();
})();

/* Runs after the shared presentation pass, without changing other role shells. */
(() => {
  function alignPharmacyShell() {
    const header = document.querySelector('.ph-main > .header');
    const sidebar = document.querySelector('.ph-sidebar');
    if (!header || !sidebar || header.classList.contains('ph-doctor-shell')) return;
    header.classList.add('ph-doctor-shell');
    const icon = path => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${path}"/></svg>`;
    const right = header.querySelector('.aligned-topbar-right');
    const oldProfile = header.querySelector('.aligned-profile');
    const actions = header.querySelector('.header-actions');
    const profile = document.createElement('button');
    profile.type = 'button'; profile.className = 'ph-profile';
    profile.setAttribute('aria-label', 'Pharmacy Admin account');
    profile.innerHTML = '<span class="ph-avatar">Rx</span><span class="ph-profile-copy"><strong>Pharmacy Admin</strong><small>Pharmacy</small></span>';
    oldProfile.replaceWith(profile);

    const footer = document.createElement('div'); footer.className = 'ph-sidebar-footer';
    footer.innerHTML = `<a class="ph-switch-role" href="../index.html" title="Switch Role" aria-label="Switch Role">${icon('M4 7h16m-4-4 4 4-4 4M20 17H4m4-4-4 4 4 4')}<span>Switch Role</span></a><div class="ph-organisation" title="MedPlus Pharmacy · Retail pharmacy · Online"><span class="ph-org-icon">${icon('M12 22s8-4.5 8-11V5l-8-3-8 3v6c0 6.5 8 11 8 11Z')}</span><div><strong>MedPlus Pharmacy</strong><span>Retail pharmacy</span><span><i></i>Online</span></div></div>`;
    sidebar.append(footer);

    const clock = document.createElement('div'); clock.className = 'ph-clock';
    const updateClock = () => {
      const now = new Date();
      clock.replaceChildren();
      for (const text of [now.toLocaleDateString('en-IN', {weekday:'short', month:'short', day:'numeric'}), now.toLocaleTimeString('en-IN', {hour:'2-digit', minute:'2-digit', hour12:true}).toUpperCase()]) {
        const line = document.createElement('div'); line.textContent = text; clock.append(line);
      }
    };
    updateClock(); const clockTimer = setInterval(updateClock, 30000);
    window.addEventListener('pagehide', () => clearInterval(clockTimer), {once:true});
    right.insertBefore(clock, profile);

    let opened = null, restoringFocus = false;
    const closePanel = (restoreFocus = false) => {
      if (!opened) return;
      const current = opened; opened = null;
      current.panel.hidden = true; current.trigger.setAttribute('aria-expanded','false');
      if (restoreFocus) { restoringFocus = true; current.trigger.focus(); restoringFocus = false; }
    };
    const makePanel = (trigger, title, id) => {
      const panel = document.createElement('section'); panel.className = 'ph-shell-panel'; panel.id = id; panel.hidden = true;
      panel.setAttribute('role','region'); panel.setAttribute('aria-label',title);
      const heading = document.createElement('div'); heading.className = 'ph-panel-heading';
      const label = document.createElement('strong'); label.textContent = title;
      const close = document.createElement('button'); close.type = 'button'; close.className = 'ph-panel-close'; close.setAttribute('aria-label','Close '+title); close.innerHTML = icon('M6 6l12 12M18 6 6 18'); close.onclick = () => closePanel(true);
      heading.append(label, close); panel.append(heading);
      const body = document.createElement('div'); body.className = 'ph-panel-body'; panel.append(body); header.append(panel);
      trigger.setAttribute('aria-controls',id); trigger.setAttribute('aria-expanded','false');
      const open = () => { closePanel(); panel.hidden = false; trigger.setAttribute('aria-expanded','true'); opened = {panel,trigger}; };
      trigger.addEventListener('click', () => { if (opened?.panel === panel) closePanel(); else open(); });
      return {panel,body,open};
    };
    const utility = (title, path, id) => {
      const button = document.createElement('button'); button.type = 'button'; button.className = 'ph-utility'; button.title = title; button.setAttribute('aria-label',title); button.innerHTML = icon(path); right.insertBefore(button,profile);
      return makePanel(button,title,id);
    };
    const notifications = utility('Notifications','M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M10 21h4','ph-notifications');
    notifications.body.innerHTML = '<p class="ph-panel-note">Pharmacy demo alerts</p><a href="products.html">Review low-stock products<span>Check stock before creating a purchase order.</span></a><a href="reports.html">Review expiry report<span>Review batches approaching expiry.</span></a><a href="prescription-dispense.html">Open prescription queue<span>Review prescriptions awaiting dispensing.</span></a>';
    const messages = utility('Quick Message','M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2Z','ph-messages');
    messages.body.innerHTML = '<p class="ph-panel-note">Demo conversation with the care team. Messages stay in this page.</p><div class="ph-message-thread" aria-live="polite"><p>Care team: Please review the prescription queue for pending dispensing.</p></div><form><label for="ph-message-text">Message to care team</label><textarea id="ph-message-text" rows="3" required maxlength="500" placeholder="Write a message…"></textarea><button class="ph-panel-primary" type="submit">Send demo message</button></form>';
    messages.body.querySelector('form').addEventListener('submit', event => {
      event.preventDefault(); const input = messages.body.querySelector('textarea');
      if (!input.value.trim()) { input.setCustomValidity('Enter a message.'); input.reportValidity(); return; }
      const message = document.createElement('p'); message.textContent = 'You (demo): '+input.value.trim(); messages.body.querySelector('.ph-message-thread').append(message); input.value = ''; message.scrollIntoView({block:'nearest'});
    });
    messages.body.querySelector('textarea').addEventListener('input', event => event.target.setCustomValidity(''));
    const schedule = utility("Today's Schedule",'M3 5h18v16H3ZM8 2v6m8-6v6M3 10h18', 'ph-schedule');
    schedule.body.innerHTML = '<p class="ph-panel-note">Pharmacy demo worklist</p><a href="prescription-dispense.html">Prescription dispensing<span>Review the current prescription queue.</span></a><a href="purchase-orders.html">Purchase orders<span>Review outstanding supplier orders.</span></a><a href="overview.html">Day-end reconciliation<span>Count cash and reconcile after today’s transactions.</span></a>';
    const account = makePanel(profile,'Pharmacy account','ph-account');
    account.body.innerHTML = '<p class="ph-panel-note">Pharmacy Admin · MedPlus Pharmacy</p>';
    if (actions) account.body.append(actions); // Preserve Reset/Logout nodes and handlers.

    const search = document.createElement('div'); search.className = 'ph-global-search';
    search.innerHTML = `${icon('M21 21l-4.3-4.3M11 3a8 8 0 1 0 0 16 8 8 0 0 0 0-16')}<input aria-label="Search pharmacy" placeholder="Search customers or pharmacy pages" autocomplete="off"><kbd>Ctrl K</kbd>`;
    header.insertBefore(search,right);
    const input = search.querySelector('input');
    const results = makePanel(input,'Search pharmacy','ph-search-results');
    results.panel.classList.add('ph-search-results');
    const pages = [...sidebar.querySelectorAll('.nav a')].map(link=>({name:link.textContent.trim(),href:link.getAttribute('href')}));
    // The customer directory uses the same fictional fixtures as customers.html.
    const customers = [
      ['C001','Srinivas Reddy','9876543210','Banjara Hills, Rd 12'],
      ['C002','Lakshmi Devi','9876501234','Jubilee Hills'],
      ['C003','Rajesh Kumar','8765432109','Somajiguda'],
      ['C004','Priya Sharma','9012345678','Ameerpet'],
      ['C005','Anil Reddy','7654321098','Kukatpally']
    ];
    const renderResults = () => {
      results.body.replaceChildren(); const query = input.value.trim().toLowerCase();
      const hint = document.createElement('p'); hint.className = 'ph-panel-note'; hint.textContent = 'Find a customer by name, customer ID or phone, or open a Pharmacy page.'; results.body.append(hint);
      for (const customer of customers.filter(row => query && row.join(' ').toLowerCase().includes(query))) {
        const button = document.createElement('button'); button.type = 'button'; button.className = 'ph-search-result'; button.textContent = customer[1]+' · '+customer[0];
        button.onclick = () => {
          results.body.replaceChildren();
          const title = document.createElement('h3'); title.textContent = customer[1]; results.body.append(title);
          for (const text of ['Customer ID: '+customer[0],'Phone: '+customer[2],'Address: '+customer[3],'Mock customer directory']) { const line = document.createElement('p'); line.textContent = text; results.body.append(line); }
          const back = document.createElement('button'); back.type = 'button'; back.className = 'ph-panel-primary'; back.textContent = 'Back to search results'; back.onclick = renderResults; results.body.append(back); back.focus();
        }; results.body.append(button);
      }
      for (const page of pages.filter(page=>!query || page.name.toLowerCase().includes(query))) { const link = document.createElement('a'); link.href = page.href; link.textContent = page.name; results.body.append(link); }
      if (results.body.children.length === 1) { const empty = document.createElement('p'); empty.textContent = 'No matching customers or pages.'; results.body.append(empty); }
    };
    input.addEventListener('focus', () => { if (!restoringFocus) { renderResults(); results.open(); } });
    // Input clicks should keep results open, unlike toggle buttons.
    input.addEventListener('click', () => { if (results.panel.hidden) results.open(); });
    input.addEventListener('input', () => { renderResults(); results.open(); });
    input.addEventListener('keydown', event => { if (event.key === 'ArrowDown') { event.preventDefault(); results.body.querySelector('a,button')?.focus(); } });
    document.addEventListener('keydown', event => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); input.focus(); renderResults(); results.open(); }
      if (event.key === 'Escape') closePanel(true);
    });
    document.addEventListener('click', event => { if (opened && !event.composedPath().includes(opened.panel) && !event.composedPath().includes(opened.trigger)) closePanel(); });
  }
  if (document.readyState === 'complete') alignPharmacyShell();
  else window.addEventListener('load', alignPharmacyShell, {once:true});
})();
