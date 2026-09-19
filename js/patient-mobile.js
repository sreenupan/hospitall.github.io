(() => {
  'use strict';
  const root = document.getElementById('screen-content');
  const sourceNav = document.querySelector('.nav');
  const tabs = document.querySelector('.mobile-tabs');
  const paths = {
    dashboard:'M3 10 12 3l9 7v11h-6v-7H9v7H3Z',
    appointments:'M5 5h14v16H5ZM8 3v4m8-4v4M5 10h14',
    doctors:'M4 20h16M6 20V8h12v12M9 8V4h6v4m-3 4v5m-2.5-2.5h5',
    records:'M6 3h9l4 4v14H6Zm9 0v5h4M9 12h7m-7 4h7',
    profile:'M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM4 21v-2a8 8 0 0 1 16 0v2'
  };
  const items = [['dashboard','Home'],['appointments','Appointments'],['doctors','Find Care'],['records','Records'],['profile','Profile']];
  const icon = key => `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${paths[key]}"></path></svg>`;
  tabs.innerHTML = items.map(([key,label]) => `<button type="button" data-tab="${key}">${icon(key)}<span>${label}</span></button>`).join('');
  const navTo = key => sourceNav.querySelector(`[data-screen="${key}"]`)?.click();
  tabs.addEventListener('click', event => {const button=event.target.closest('[data-tab]');if(button)navTo(button.dataset.tab);});
  function shortcuts() {
    if(!root.querySelector('.patient-dashboard') || root.querySelector('.mobile-shortcuts')) return;
    const card=document.createElement('section');card.className='card';card.innerHTML='<h2>Care and support</h2><div class="mobile-shortcuts"><button type="button" data-mobile-dest="labs">Lab Orders</button><button type="button" data-mobile-dest="prescriptions">Prescriptions</button><button type="button" data-mobile-dest="health">Health Profile</button><button type="button" data-mobile-dest="support">Support</button></div>';
    root.querySelector('.patient-dashboard').append(card);
  }
  function profileLinks() {
    if(!root.querySelector('h1')?.textContent.includes('Profile & Family') || root.querySelector('.mobile-profile-links')) return;
    const section=document.createElement('section');section.className='card mobile-profile-links';section.innerHTML='<h2>More services</h2><div class="mobile-shortcuts"><button type="button" data-mobile-dest="followups">Follow-ups</button><button type="button" data-mobile-dest="claim">Claim Records</button><button type="button" data-mobile-dest="support">Support</button><button type="button" data-mobile-dest="emergency">Emergency</button></div><p><a href="index.html">Back to modules</a></p>';
    root.append(section);
  }
  function sync(){
    const current=sourceNav.querySelector('.nav-item[aria-current="page"]')?.dataset.screen;
    const parent={doctor:'doctors',booking:'doctors',success:'appointments',appointment:'appointments',room:'appointments',prescriptions:'records',health:'records',labs:'records',followups:'appointments',claim:'profile',support:'profile',emergency:'profile'}[current]||current;
    tabs.querySelectorAll('button').forEach(button=>{if(button.dataset.tab===parent)button.setAttribute('aria-current','page');else button.removeAttribute('aria-current');});
    shortcuts();profileLinks();
  }
  root.addEventListener('click',event=>{const target=event.target.closest('[data-mobile-dest]');if(target)navTo(target.dataset.mobileDest);});
  new MutationObserver(sync).observe(root,{childList:true,subtree:false});
  sync();
})();
