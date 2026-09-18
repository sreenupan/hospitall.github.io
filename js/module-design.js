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
