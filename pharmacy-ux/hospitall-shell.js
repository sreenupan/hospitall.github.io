/* Presentation shell only. Does not read/write Pharmacy workflow state or replace handlers. */
(() => {
  function mount(){
    document.body.classList.add('ph-themed');
    const header=document.querySelector('body > .header'),nav=document.querySelector('body > .nav');
    const svg=path=>`<svg class="ph-nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${path}"/></svg>`;
    const icons=['M3 10 12 3l9 7v11h-6v-7H9v7H3Z','M4 5h16v15H4Zm0 5h16m-8-5v15','M4 21v-9h16v9M6 12V4h12v8','M8 10a3 3 0 1 0 0-6 3 3 0 0 0 0 6M2 21v-3a6 6 0 0 1 12 0v3m3-8a5 5 0 0 1 5 5v3','M5 3h14v18H5Zm3 5h8m-8 4h8m-8 4h5','M3 8h18v13H3Zm9-5v12m-4-4 4 4 4-4','M3 5h18v14H3Zm0 5h18m-5 5h3','M5 3h14v18H5Zm4 7h6m-3-3v6','M9 7H3m0 0 4-4M3 7l4 4m-2 5h11a5 5 0 0 0 0-10h-3','M12 3 2 21h20ZM12 9v5m0 3v1','M4 6h16M4 12h16M4 18h16M8 3v6m8 0v6m-8 0v6','M4 21V3m0 18h17M8 16v-5m5 5V7m5 9V4','M4 5h16v16H4Zm4 4h8m-8 4h8m-8 4h5','M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8M12 3v3m0 12v3M3 12h3m12 0h3','M5 3h14v18H5Zm4 5h6m-6 4h6m-6 4h4'];
    if(header&&nav){
      const shell=document.createElement('div');shell.className='ph-shell';const sidebar=document.createElement('aside');sidebar.className='ph-sidebar';sidebar.innerHTML='<div class="ph-brand"><div class="ph-brand-mark">H</div><span class="ph-brand-name">HospitAll</span><button class="ph-collapse" type="button"></button></div>';
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
