/* Navigation/presentation only. Existing module actions and draft guards remain the owners. */
(() => {
 function mount(){
  const pharmacy=location.pathname.includes('/pharmacy-ux/');
  const header=document.querySelector('.topbar,.ph-main>.header,.no-print');
  const icon=path=>`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${path}"/></svg>`;
  document.querySelectorAll('.brand-icon,.brand-mark,.ph-brand-mark').forEach(mark=>{mark.innerHTML=icon('M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78ZM3.5 12h4l1.5-3 2 6 1.5-3h8');});
  const home=document.createElement('a');home.className='module-home';home.href=pharmacy?'../index.html':'index.html';home.title='Home — switch roles';home.setAttribute('aria-label','Home — switch roles');home.innerHTML=icon('m3 10 9-7 9 7v11h-6v-7H9v7H3Z')+'<span>Home</span>';
  if(header){const menu=header.querySelector('[data-rec-toggle],[data-nur-toggle],#menu,.ph-toggle,button');if(menu&&menu.parentElement===header)menu.after(home);else header.prepend(home);}else document.body.prepend(home);
  const existing=document.querySelector('a.switch-role');
  if(existing)home.addEventListener('click',event=>{if(event.ctrlKey||event.metaKey||event.shiftKey||event.altKey)return;event.preventDefault();existing.click();});
  // Earlier staff shells used a narrow permanent rail on phones. Keep their
  // existing desktop resize/collapse handlers and present a drawer on phones.
  if(document.body.matches('.nurse-module,.receptionist-module')){
   const shell=document.querySelector('.app'),nav=shell.querySelector('.nav'),main=shell.querySelector('main'),toggle=header.querySelector('[data-rec-toggle],[data-nur-toggle]'),collapse=nav.querySelector('[data-nur-toggle],[data-rec-toggle]')||nav.querySelector('.brand button');
   const scrim=document.createElement('button');scrim.className='module-nav-scrim';scrim.tabIndex=-1;scrim.setAttribute('aria-label','Close navigation');shell.append(scrim);
   const phone=()=>matchMedia('(max-width:700px)').matches;
   const sync=()=>{const closed=shell.classList.contains('collapsed');main.inert=phone()&&!closed;document.body.style.overflow=phone()&&!closed?'hidden':'';[toggle,collapse].filter(Boolean).forEach(b=>{b.setAttribute('aria-expanded',String(!closed));b.setAttribute('aria-label',closed?'Expand navigation':'Collapse navigation');});};
   const close=()=>{shell.classList.add('collapsed');sync();toggle.focus();};
   scrim.onclick=close;document.addEventListener('keydown',e=>{if(e.key==='Escape'&&phone()&&!shell.classList.contains('collapsed'))close();});
   nav.querySelectorAll('[data-screen]').forEach(b=>b.addEventListener('click',()=>{if(phone()){shell.classList.add('collapsed');sync();}}));
   new MutationObserver(sync).observe(shell,{attributes:true,attributeFilter:['class']});let wasPhone=phone();if(wasPhone)shell.classList.add('collapsed');sync();window.addEventListener('resize',()=>{if(phone()&&!wasPhone)shell.classList.add('collapsed');wasPhone=phone();sync();});
  }
  if(pharmacy&&location.pathname.endsWith('/overview.html')){
   const content=document.querySelector('.content'),intro=content?.firstElementChild,metrics=content?.querySelector('.kpi-row'),revenue=content?.querySelector('.revenue-banner');
   if(intro?.textContent.includes('Your store at a glance')){const help=document.createElement('details');help.className='ph-overview-help';help.innerHTML='<summary>About this overview</summary>';intro.before(help);help.append(intro);const license=help.nextElementSibling;if(license?.textContent.includes('Drug License:'))help.append(license);}
   if(metrics&&matchMedia('(max-width:700px)').matches){const totals=document.createElement('details');totals.className='ph-overview-totals';totals.innerHTML='<summary>Store totals and activity</summary>';metrics.before(totals);totals.append(metrics);if(revenue)totals.append(revenue);}
   const heading=document.createElement('div');heading.className='ph-page-head';heading.innerHTML='<div><h1>Overview</h1><p>Your pharmacy activity, stock alerts, and daily reconciliation</p></div>';content.prepend(heading);
   const sentence=text=>text.toLowerCase().replace(/[a-z]/,value=>value.toUpperCase()).replace(/\b(?:grn|rx|upi|gstin)\b|schedule h/gi,value=>value.toLowerCase()==='schedule h'?'Schedule H':value.toUpperCase());
   content.querySelectorAll('[class^="card-header"],.kpi-label,.revenue-banner .label').forEach(element=>{const walker=document.createTreeWalker(element,NodeFilter.SHOW_TEXT);while(walker.nextNode()){const node=walker.currentNode;if(node.textContent.trim()&&/[A-Z]{3}/.test(node.textContent)&&node.parentElement.closest('.card-badge')===null)node.textContent=sentence(node.textContent);}});

  }
  if(pharmacy){document.querySelectorAll('.ph-table-scroll').forEach(table=>{const hint=document.createElement('p');hint.className='table-scroll-hint';hint.textContent='Scroll horizontally to see all columns and actions →';hint.hidden=true;table.before(hint);new ResizeObserver(()=>{hint.hidden=!(table.clientWidth&&table.scrollWidth>table.clientWidth+1);}).observe(table);});}
  if(!document.body.classList.contains('patient-module'))return;
  const sidebar=document.querySelector('nav.nav'),toggle=document.querySelector('.topbar button'),main=document.querySelector('main');
  const bottom=document.createElement('nav');bottom.className='patient-mobile-nav';bottom.setAttribute('aria-label','Patient quick navigation');
  const items=[['dashboard','Overview','M3 10 12 3l9 7v11h-6v-7H9v7H3Z'],['appointments','Appointments','M4 5h16v16H4ZM8 3v4m8-4v4M4 10h16'],['records','Records','M5 3h14v18H5Zm4 5h6m-6 4h6m-6 4h4'],['more','More','M4 6h16M4 12h16M4 18h16']];
  items.forEach(([screen,label,path])=>{const button=document.createElement('button');button.type='button';button.innerHTML=icon(path)+`<span>${label}</span>`;button.dataset.quickScreen=screen;button.onclick=()=>screen==='more'?toggle.click():sidebar.querySelector(`[data-screen="${screen}"]`).click();bottom.append(button);});main.append(bottom);
  const sync=()=>{const active=sidebar.querySelector('[aria-current=page]')?.dataset.screen;bottom.querySelectorAll('button').forEach(button=>{const selected=button.dataset.quickScreen===active||(button.dataset.quickScreen==='more'&&active&&!items.slice(0,3).some(i=>i[0]===active));if(selected)button.setAttribute('aria-current','page');else button.removeAttribute('aria-current');});};
  new MutationObserver(sync).observe(sidebar,{attributes:true,subtree:true,attributeFilter:['aria-current']});sync();
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount);else mount();
})();

/* Shared top-bar presentation. Move existing controls, preserving their handlers. */
(() => {
 function alignHeader(){
  if(!document.body.classList.contains('module-design'))return;
  const header=document.querySelector('.topbar,.ph-main>.header');
  if(!header)return;
  const svg=path=>`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${path}"/></svg>`;
  const bell='M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M10 21h4';
  const menu=header.querySelector('[data-rec-toggle],[data-nur-toggle],[data-pat-toggle],[data-oa-toggle],#menu,.ph-toggle,button[aria-controls]');
  const home=header.querySelector('.module-home');
  const title=header.querySelector('#page-title');
  const search=header.querySelector('.topbar-search,#global-search');
  const context=header.querySelector('.person-select,.persona-label');
  const right=document.createElement('div');right.className='aligned-topbar-right';
  const profile=document.createElement('div');profile.className='aligned-profile';
  const makeProfile=(initials,name,role)=>{profile.innerHTML=`<span class="aligned-avatar">${initials}</span><span class="aligned-profile-copy"><strong>${name}</strong><small>${role}</small></span>`;};
  header.classList.add('aligned-topbar');
  if(menu)menu.classList.add('aligned-menu');
  if(title){title.classList.add('aligned-page-title');header.after(title);}
  header.querySelectorAll('.topbar-spacer,.top-spacer').forEach(n=>n.remove());
  if(search){
   search.classList.add('aligned-search');header.prepend(search);
   if(search.id==='global-search'){
    const decoration=document.createElement('span');decoration.className='aligned-search-symbol';decoration.innerHTML=svg('M21 21l-4.3-4.3M11 3a8 8 0 1 0 0 16 8 8 0 0 0 0-16');search.prepend(decoration);
   }
  }else if(context){context.classList.add('aligned-context');header.prepend(context);}
  if(menu)header.prepend(menu);
  if(home){home.classList.add('aligned-icon');right.append(home);}
  const alert=header.querySelector('#alerts,#notifications,[title="Notifications"]');
  if(alert){
   alert.classList.add('aligned-icon');
   if(!alert.querySelector('svg')){const label=alert.textContent.trim();alert.setAttribute('aria-label',alert.getAttribute('aria-label')||label);alert.title=label;alert.innerHTML=svg(bell)+`<span class="aligned-sr-only">${label}</span>`;}
   right.append(alert);
  }
  if(document.body.classList.contains('receptionist-module')){
   const oldProfile=[...header.children].find(n=>n.textContent.includes('Receptionist |'));
   const clock=[...header.children].find(n=>n.textContent.includes('04 Aug 2026'));
   if(clock){clock.classList.add('aligned-clock');right.prepend(clock);}
   makeProfile('RC','Receptionist','City Health Clinic');oldProfile?.remove();header.querySelector('.avatar')?.remove();
  }else if(document.body.classList.contains('nurse-module')){
   const staff=header.querySelector('.staff');makeProfile('NA','Nurse Anita','City Health Clinic');
   if(staff){const date=document.createElement('div');date.className='aligned-clock';date.textContent='04 Aug 2026';right.prepend(date);staff.remove();}header.querySelector('.avatar')?.remove();
  }else if(document.body.classList.contains('patient-module')){
   makeProfile('RK','Ravi Kumar','Patient account');const member=document.querySelector('#member');
   const sync=()=>{const name=member.querySelector('option[value="ravi"]')?.textContent.replace(/\s*\(Self\)\s*$/,'')||'Patient';profile.querySelector('strong').textContent=name;profile.querySelector('.aligned-avatar').textContent=name.split(/\s+/).map(s=>s[0]).slice(0,2).join('');};
   new MutationObserver(sync).observe(member,{childList:true,subtree:true,characterData:true});sync();
  }else if(document.body.classList.contains('admin-module')){
   makeProfile('OA','Organization Admin','');const name=document.querySelector('#org-name');const sync=()=>profile.querySelector('small').textContent=name.textContent;new MutationObserver(sync).observe(name,{childList:true,characterData:true,subtree:true});sync();
  }else if(document.body.classList.contains('inpatient-module')){
   makeProfile('IP','Inpatient team','');const select=document.querySelector('#persona');const sync=()=>profile.querySelector('small').textContent=select.value;select.addEventListener('change',sync);sync();
   header.querySelector(':scope > strong')?.remove();const reset=header.querySelector('[data-action="reset"]');if(reset)right.append(reset);
  }else{
   const brand=header.querySelector('.header-brand');if(brand){brand.classList.add('aligned-pharmacy-identity');profile.append(brand);}
   const actions=header.querySelector('.header-actions');if(actions)right.append(actions);
  }
  right.append(profile);header.append(right);
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>queueMicrotask(alignHeader));else queueMicrotask(alignHeader);
})();
