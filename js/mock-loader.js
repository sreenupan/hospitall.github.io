/* Start dependent role scripts only after shared demo data has loaded. */
(() => {
  const scripts = JSON.parse(document.currentScript.dataset.scripts);
  DemoStore.ready.then(async () => {
    for (const src of scripts) await new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src; script.async = false;
      script.onload = resolve;
      script.onerror = () => reject(new Error('Unable to load ' + src + '. Reload after the site files are available.'));
      document.body.append(script);
    });
    DemoStore.loaded = true;
    document.documentElement.inert = false;
    document.dispatchEvent(new Event('demo-ready'));
  }).catch(error => DemoStore.showError(error.message));
})();
