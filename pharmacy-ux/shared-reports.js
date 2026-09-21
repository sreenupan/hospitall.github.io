/* The restricted dispensing register uses the same saved invoices as dispensing. */
(() => {
  const panel=document.getElementById('tab-schedule-h');
  const dates=panel.querySelectorAll('input[type="date"]');
  const buttons=panel.querySelectorAll('.filter-row button');
  const body=panel.querySelector('tbody');
  const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const error=document.createElement('p');error.setAttribute('role','alert');panel.querySelector('.filter-row').after(error);
  dates[0].setAttribute('aria-label','Schedule H from date');
  dates[1].setAttribute('aria-label','Schedule H to date');
  dates[1].value=new Date().toISOString().slice(0,10);
  async function generate(){
    error.textContent='';
    if(!dates[0].value||!dates[1].value||dates[0].value>dates[1].value){error.textContent='Choose a valid date range.';return null;}
    try {
      const saved=await DemoStore.readSaved();
      const rows=Object.values(saved.workflow.invoices).filter(i=>i.date.slice(0,10)>=dates[0].value&&i.date.slice(0,10)<=dates[1].value).sort((a,b)=>a.date.localeCompare(b.date)).flatMap(i=>i.lines.filter(l=>l.restricted).map(l=>[i.date.slice(0,10),i.id,i.patientName,[l.name,l.strength].filter(Boolean).join(' '),'H',l.qty,i.rx,i.doctor,i.pharmacist||'Pharmacy Admin (mock)']));
      body.innerHTML=rows.length?rows.map(r=>'<tr>'+r.map(v=>'<td>'+esc(v)+'</td>').join('')+'</tr>').join(''):'<tr><td colspan="9">No saved restricted dispensing in this date range.</td></tr>';
      return rows;
    }catch(e){error.textContent='Unable to read saved dispensing: '+e.message;return null;}
  }
  buttons[0].onclick=generate;
  buttons[1].onclick=async()=>{
    const rows=await generate();if(!rows)return;
    const cell=v=>'"'+String(v??'').replace(/^[=+@-]/,"'$&").replace(/"/g,'""')+'"';
    const csv=[['Date','Invoice','Patient','Drug','Schedule','Qty','Prescription #','Doctor','Pharmacist'],...rows].map(r=>r.map(cell).join(',')).join('\r\n');
    const url=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'}));
    const link=document.createElement('a');link.href=url;link.download='schedule-h.csv';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
  };
  generate();
})();
