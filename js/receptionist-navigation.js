// Receptionist-only navigation. Doctor assets and preferences are independent.
(() => {
  'use strict';
  const shell = document.querySelector('.app');
  const nav = document.querySelector('.nav');
  nav.id = 'receptionist-navigation';
  const paths = {
    dashboard:'M3 10 12 3l9 7v11h-6v-7H9v7H3Z',
    appointments:'M5 5h14v16H5ZM8 3v4m8-4v4M5 10h14',
    'book-appointment':'M5 5h14v16H5ZM8 3v4m8-4v4m-4 5v6m-3-3h6',
    checkin:'M9 6h12M9 12h12M9 18h12M3 6h1m-1 6h1m-1 6h1',
    doctors:'M8 3v5a4 4 0 0 0 8 0V3M6 3h4m4 0h4m-6 9v3a5 5 0 0 0 10 0v-2m-2-2h4v2h-4Z',
    patients:'M8 10a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm8 0a3 3 0 1 0 0-6M2 21v-3a6 6 0 0 1 12 0v3m3-8a5 5 0 0 1 5 5v3',
    'register-patient':'M8 10a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM2 21v-3a6 6 0 0 1 12 0v3m4-14v8m-4-4h8',
    payments:'M3 5h18v14H3ZM3 10h18m-5 5h3',
    switch:'M4 7h16m-4-4 4 4-4 4M20 17H4m4-4-4 4 4 4'
  };
  const icon = path => `<svg class="rec-nav-icon" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="${path}"/></svg>`;
  nav.querySelectorAll('.nav-item,.switch-role').forEach(item => {
    const badge = item.querySelector('.nav-badge');
    const label = item.firstChild.textContent.trim();
    item.firstChild.remove();
    const span = document.createElement('span'); span.className='rec-nav-label'; span.textContent=label;
    item.insertAdjacentHTML('afterbegin',icon(paths[item.dataset.screen || 'switch']));
    item.insertBefore(span,badge);
    item.dataset.tooltip=label;
    item.setAttribute('aria-label',label);
  });
  const topToggle = document.querySelector('[title="Toggle sidebar"]');
  topToggle.dataset.recToggle='';
  const collapse = document.createElement('button');
  collapse.type='button'; collapse.className='rec-nav-collapse'; collapse.dataset.recToggle='';
  collapse.innerHTML=icon('m14 6-6 6 6 6');
  nav.querySelector('.brand').append(collapse);
  const handle = document.createElement('div');
  handle.className='rec-nav-resizer'; handle.tabIndex=0;
  handle.setAttribute('role','separator'); handle.setAttribute('aria-orientation','vertical');
  handle.setAttribute('aria-label','Resize navigation panel'); handle.setAttribute('aria-controls',nav.id);
  handle.setAttribute('aria-valuemin','180');handle.setAttribute('aria-valuemax','360');
  handle.title='Drag to resize navigation; use arrow keys when focused';
  handle.textContent='↔'; shell.append(handle);
  const key='receptionistNavigationWidth';
  let width=null;
  try { const saved=Number(localStorage.getItem(key)); if(saved>=180&&saved<=360)width=saved; } catch (_) {}
  function applyWidth(value,persist=true){
    width=Math.max(180,Math.min(360,Math.round(value)));
    shell.style.setProperty('--rec-nav-width',width+'px');
    handle.setAttribute('aria-valuenow',String(width));
    if(persist)try{localStorage.setItem(key,String(width));}catch(_){}
  }
  function sync(){
    const collapsed=shell.classList.contains('collapsed');
    [topToggle,collapse].forEach(button=>{
      const label=collapsed?'Expand navigation':'Collapse navigation';
      button.title=label;button.setAttribute('aria-label',label);
      button.setAttribute('aria-expanded',String(!collapsed));button.setAttribute('aria-controls',nav.id);
    });
    handle.setAttribute('aria-valuenow',String(width||(window.matchMedia('(max-width:1023px)').matches?210:248)));
  }
  [topToggle,collapse].forEach(button=>{
    button.setAttribute('role','button'); button.tabIndex=0;
    button.onclick=()=>{shell.classList.toggle('collapsed');sync();(shell.classList.contains('collapsed')?topToggle:collapse).focus();};
  });
  topToggle.onkeydown=event=>{if(['Enter',' '].includes(event.key)){event.preventDefault();topToggle.click();}};
  const expand=()=>{shell.classList.remove('collapsed');sync();};
  let dragging=false;
  handle.addEventListener('pointerdown',event=>{
    if(event.button!==0)return;
    event.preventDefault();expand();dragging=true;handle.setPointerCapture(event.pointerId);handle.classList.add('dragging');
  });
  handle.addEventListener('pointermove',event=>{if(dragging)applyWidth(event.clientX);});
  function end(){dragging=false;handle.classList.remove('dragging');}
  handle.addEventListener('pointerup',end);handle.addEventListener('pointercancel',end);handle.addEventListener('lostpointercapture',end);
  handle.addEventListener('keydown',event=>{
    if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;
    event.preventDefault();expand();const current=width||nav.getBoundingClientRect().width;
    const step=event.shiftKey?40:10;
    applyWidth(event.key==='Home'?180:event.key==='End'?360:current+(event.key==='ArrowLeft'?-step:step));
  });
  if(width)applyWidth(width,false);
  sync();window.addEventListener('resize',sync);
})();
