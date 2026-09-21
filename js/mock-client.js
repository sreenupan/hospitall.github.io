/* Static JSON seed and browser-only demonstration persistence. */
(() => {
  'use strict';
  const clone = value => JSON.parse(JSON.stringify(value));
  const seedMode = new URLSearchParams(location.search).has('capture-seed');
  const siteRoot = new URL('../', document.currentScript.src);
  const storageKey = 'hospitall-demo:v1:' + siteRoot.pathname;
  const core = window.HospitallMockCore;
  // Prevent an early click from acting on an unhydrated fixture.
  document.documentElement.inert = true;
  let boot, binding, saved, chain = Promise.resolve(), failure;
  const roleFiles = {'patient.html':'patient','patient-mobile.html':'patient','receptionist.html':'reception','nurse.html':'nurse','doctor.html':'doctor','inpatient.html':'inpatient','emergency.html':'emergency','prescription-dispense.html':'pharmacy','invoice-print.html':'invoice','reports.html':'pharmacyReports','admin.html':'admin'};
  // IndexedDB read/write transactions serialize the complete update across tabs.
  // Unlike separate localStorage reads/writes, this also prevents lost updates.
  const database = new Promise((resolve, reject) => {
    const request = indexedDB.open(storageKey, 1);
    request.onupgradeneeded = () => request.result.createObjectStore('state');
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
  database.catch(() => {});
  async function accessDatabase(update) {
    const db = await database;
    return new Promise((resolve, reject) => {
      const tx = db.transaction('state', update ? 'readwrite' : 'readonly');
      const records = tx.objectStore('state'), request = records.get('current');
      let value, failure;
      request.onsuccess = () => {
        try {
          const current = request.result || null;
          if (current && (current.version !== 1 || !current.epoch || !current.roles || !current.workflow)) throw new Error('Saved demo data is incompatible. Clear this site’s browser data to restore its fixtures.');
          if (update) { const result=update(current);records.put(result.next,'current');value=result.value; }
          else value=current;
        } catch(e) { failure=e;tx.abort(); }
      };
      tx.oncomplete = () => resolve(value);
      tx.onabort = tx.onerror = () => reject(failure || tx.error || new Error('Browser storage transaction failed.'));
    });
  }
  const readDatabase = () => accessDatabase();
  async function seed() {
    const response = await fetch(new URL('mock/seed.json', siteRoot), {cache:'no-store'});
    if (!response.ok) throw new Error('Unable to load mock/seed.json. Include that file when copying the prototype.');
    return core.initialize(await response.json());
  }
  const ready = (async () => {
    if (seedMode) return;
    let db = await readDatabase();
    if (!db) { const initial=await seed();db=await accessDatabase(current=>({next:current||initial,value:current||initial})); }
    const role = roleFiles[location.pathname.split('/').pop()];
    boot = window.__MOCK_BOOTSTRAP__ = {role,epoch:db.epoch,revision:db.revision,demoDate:db.demoDate,data:core.project(db,role),workflow:db.workflow};
  })();
  const replace = (target, source) => {
    if (Array.isArray(target)) target.splice(0, target.length, ...clone(source));
    else { Object.keys(target).forEach(k => delete target[k]); Object.assign(target, clone(source)); }
  };
  function error(message) {
    failure = message;
    document.documentElement.inert = false;
    if (!document.body) { document.addEventListener('DOMContentLoaded', () => error(message), {once:true}); return; }
    let box = document.getElementById('mock-save-error');
    if (!box) { box = document.createElement('div'); box.id = 'mock-save-error'; box.setAttribute('role', 'alert'); box.style.cssText = 'position:fixed;bottom:12px;left:12px;right:12px;padding:14px;background:#fff1f2;color:#991b1b;border:2px solid #991b1b;z-index:100000'; document.body.append(box); }
    box.textContent = message + ' Your screen has not been saved. Keep this page open, allow browser storage and retry, or reload to retrieve saved data.';
  }
  async function persist(action, data) {
    const resetData = action==='reset' ? await seed() : null;
    return accessDatabase(current => {
      if (!current || data.epoch !== current.epoch) throw new Error('Demo was reset in another tab. Reload this page before making changes.');
      let next = clone(current), result;
      if (action === 'reset') { next = resetData; result = {reset:true}; }
      else if (action === 'save') result = core.commit(next, data);
      else result = core.transaction(next, action, data);
      next.revision = current.revision + 1;
      return {next,value:{...result,revision:next.revision}};
    });
  }
  function flush() {
    if (seedMode || !binding || !boot) return chain;
    chain = chain.catch(() => {}).then(async () => {
      const data = clone(binding.get());
      if (JSON.stringify(data) === JSON.stringify(saved)) return;
      const result = await persist('save', {role:binding.role,epoch:boot.epoch,base:saved,data});
      saved = data; boot.revision = result.revision; failure = null;
      document.getElementById('mock-save-error')?.remove();
    }).catch(e => { error(e.message); throw e; });
    return chain;
  }
  window.DemoStore = {
    ready, showError:error, storageKey, readSaved:readDatabase, mode:'browser',
    get date() { return boot?.demoDate || '2026-08-04'; }, replace,
    get enabled() { return !!boot; },
    get snapshot() { return binding ? clone(binding.get()) : null; },
    get role() { return binding?.role; },
    attach(role, get, set) {
      binding = {role,get,set};
      window.__demoSeed = clone(get());
      if (boot?.role === role && boot.data) set(clone(boot.data));
      saved = clone(get());
      if (!boot && !seedMode) error('Shared demo data could not be loaded.');
    },
    flush,
    async reset() {
      try { await ready; } catch(e) { return error(e.message); }
      if (!boot) return error('Shared demo data could not be loaded.');
      await chain.catch(() => {});
      try { await persist('reset', {epoch:boot.epoch});failure=null;if(binding)saved=clone(binding.get());location.href=new URL('index.html',siteRoot).href; } catch(e) { error(e.message); }
    },
    async transaction(action, data) {
      await flush();
      return persist(action, {...data,epoch:boot.epoch});
    },
    get workflow() { return boot?.workflow || {}; },
  };
  ready.catch(e => error(e.message));
  if (location.pathname.endsWith('/index.html') || location.pathname.endsWith('/')) ready.then(() => { document.documentElement.inert=false; window.DemoStore.loaded=true; }).catch(() => {});
  // Capture after existing handlers have applied their mock action; serialize writes.
  // A microtask can run between capture and target listeners. Wait until the
  // entire event dispatch has finished so the final click saves its own update.
  for (const event of ['click','change','submit']) document.addEventListener(event, () => setTimeout(() => flush().catch(() => {}), 0), true);
  document.addEventListener('click', event => {
    const link = event.target.closest('a[href]');
    if (!link || event.defaultPrevented || link.target || link.download || event.ctrlKey || event.metaKey) return;
    const url = new URL(link.href, location.href);
    if (url.origin !== location.origin || (url.pathname === location.pathname && url.search === location.search)) return;
    event.preventDefault(); flush().then(() => { location.href = url.href; }).catch(() => {});
  });
  window.addEventListener('beforeunload', event => {
    if (failure || (binding && boot && JSON.stringify(binding.get()) !== JSON.stringify(saved))) { event.preventDefault(); event.returnValue = ''; }
  });
})();
