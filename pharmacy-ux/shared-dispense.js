/* Persisted prescription dispensing, retaining the approved three-view structure. */
(() => {
  const data=window.__MOCK_BOOTSTRAP__?.data;
  if(!data)return;
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const money=n=>'₹'+Number(n).toLocaleString('en-IN',{minimumFractionDigits:2,maximumFractionDigits:2});
  let selected,invoice;
  const view=id=>{document.querySelectorAll('.view').forEach(v=>v.classList.toggle('active',v.id===id));window.scrollTo(0,0);};
  const queue=document.querySelector('#view-queue tbody');
  function renderQueue(){
    queue.innerHTML=data.prescriptions.map(rx=>`<tr class="row-clickable" tabindex="0" data-rx="${esc(rx.id)}"><td><strong>${esc(rx.id)}</strong></td><td>${esc(rx.patientName)}</td><td>${esc(rx.doctor)}</td><td>${esc(rx.date)}</td><td>${rx.items.length} items</td><td>${rx.items.some(m=>data.stock.find(p=>p.id===m.product)?.restricted)?'H drug':'—'}</td><td><span class="badge badge-${rx.status==='Dispensed'?'dispensed':rx.status==='Partial'?'partial':'pending'}">${esc(rx.status)}</span></td></tr>`).join('');
    const counts=[data.prescriptions.filter(r=>r.status==='Pending').length,data.prescriptions.filter(r=>r.status==='Dispensed').length,data.prescriptions.filter(r=>r.status==='Partial').length];
    document.querySelectorAll('#view-queue .stat-card .val').forEach((e,i)=>e.textContent=counts[i]);
    queue.querySelectorAll('[data-rx]').forEach(row=>{row.onclick=()=>open(row.dataset.rx);row.onkeydown=e=>{if(['Enter',' '].includes(e.key)){e.preventDefault();open(row.dataset.rx);}};});
  }
  function open(id){
    selected=data.prescriptions.find(r=>r.id===id);invoice=selected.invoice?data.invoices[selected.invoice]:null;
    if(selected.status==='Dispensed'){if(invoice)return success();window.pharmacyToast('This historical sample prescription is already dispensed; no editable sale remains.');return;}
    document.querySelector('.rx-card-header .title').textContent='📋 Prescription '+id;
    document.querySelectorAll('.rx-meta .val').forEach((e,i)=>e.textContent=[selected.patientName,selected.doctor,selected.diagnosis||'Not recorded',selected.date][i]);
    const body=document.querySelector('#view-dispense .card .card-body');
    body.innerHTML=selected.items.map((m,i)=>{
      const p=data.stock.find(p=>p.id===m.product),batches=(p?.batches||[]).filter(b=>b.stock>0&&b.expiry>=DemoStore.date).sort((a,b)=>a.expiry.localeCompare(b.expiry));
      return `<div class="dispense-line"><div class="top"><div><div class="drug-name">${esc(m.name+' '+(m.strength||''))}${p?.restricted?' <span class="badge badge-h">Schedule H</span>':''}</div><div class="prescribed">${m.quantityKnown===false?'Quantity to dispense: confirm from prescription':'Prescribed: '+m.quantity} | ${esc([m.frequency,m.duration,m.route,m.instructions].filter(Boolean).join(' | '))}</div></div><span>${p?'In Stock ('+batches.reduce((n,b)=>n+b.stock,0)+')':'Not available in mock inventory'}</span></div><div class="fields"><div><label for="batch-${i}">Batch</label><select id="batch-${i}" data-batch>${batches.map(b=>`<option value="${esc(b.id)}">${esc(b.id)} (Exp: ${b.expiry}, Stock: ${b.stock})</option>`).join('')}</select></div><div><label for="qty-${i}">Qty</label><input id="qty-${i}" data-qty type="number" min="1" step="1" value="${m.quantityKnown===false?'':m.quantity}"></div><div><label for="rate-${i}">Rate (₹)</label><input id="rate-${i}" data-rate type="number" min="0" step="0.01" value="${p?.rate||0}"></div><div><label for="discount-${i}">Disc %</label><input id="discount-${i}" data-discount type="number" min="0" max="100" value="0"></div></div>${p?.restricted?'<div class="schedule-h-warning"><label><input type="checkbox" data-verify> ⚠ Schedule H Verification: I confirm this medicine is dispensed against the selected prescription and patient identity is verified.</label></div>':''}</div>`;
    }).join('');
    body.oninput=()=>{document.getElementById('dispense-error').textContent='';totals();};body.onchange=body.oninput;
    document.getElementById('dispense-error')?.remove();
    const error=document.createElement('p');error.id='dispense-error';error.setAttribute('role','alert');error.style.color='#b91c1c';document.querySelector('#view-dispense .btn-success').parentElement.after(error);
    totals();view('view-dispense');
  }
  const lines=()=>Array.from(document.querySelectorAll('.dispense-line')).map(el=>({batch:el.querySelector('[data-batch]').value,qty:Number(el.querySelector('[data-qty]').value),rate:Number(el.querySelector('[data-rate]').value),discount:Number(el.querySelector('[data-discount]').value)}));
  function totals(){const values=lines();let taxable=0,tax=0;values.forEach((l,i)=>{const amount=Math.round(l.qty*l.rate*(1-l.discount/100)*100)/100;taxable+=amount;tax+=Math.round(amount*(data.stock.find(p=>p.id===selected.items[i].product)?.tax||0))/100;});const nodes=document.querySelectorAll('#view-dispense .card:last-child .card-body > div:first-child > div > div:last-child');[taxable,tax/2,tax/2,taxable+tax].forEach((v,i)=>{if(nodes[i])nodes[i].textContent=money(v);});}

  async function dispense(){
    const button=document.querySelector('#view-dispense .btn-success');button.disabled=true;
    try {
      const selects=document.querySelectorAll('#view-dispense select');const method=selects[selects.length-1].value;
      const reference=document.querySelector('#view-dispense input[placeholder]')?.value||'';
      const result=await DemoStore.transaction('dispense',{id:selected.id,lines:lines(),method,reference,verified:document.querySelectorAll('[data-verify]').length>0&&Array.from(document.querySelectorAll('[data-verify]')).every(e=>e.checked)});
      invoice=result.invoice;selected.status='Dispensed';selected.invoice=invoice.id;data.invoices[invoice.id]=invoice;
      for(const line of invoice.lines)data.stock.find(p=>p.id===line.product).batches.find(b=>b.id===line.batch).stock-=line.qty;
      renderQueue();success();
    }catch(e){document.getElementById('dispense-error').textContent=e.message;document.getElementById('dispense-error').scrollIntoView({block:'center'});}finally{button.disabled=false;}
  }
  function success(){
    const done=document.getElementById('view-done');
    done.querySelector('div[style*="font-size:13px"]').innerHTML=`Invoice <strong>${esc(invoice.id)}</strong> generated for <strong>${esc(invoice.patientName)}</strong><br>Prescription ${esc(invoice.rx)} · ${invoice.lines.length} items dispensed · ${money(invoice.total)} paid via ${esc(invoice.method)}`;
    done.querySelector('.btn-primary').onclick=()=>window.open('invoice-print.html?id='+encodeURIComponent(invoice.id));
    done.querySelector('.btn-outline').onclick=()=>window.pharmacyToast('Mock sharing preview: '+invoice.id+' · '+money(invoice.total)+'. No message sent.');view('view-done');
  }
  window.showView=id=>{if(id==='view-done')return dispense();if(id==='view-queue')renderQueue();view(id);};
  document.querySelector('#view-dispense .btn-success').onclick=dispense;
  document.querySelector('.btn-reset')?.addEventListener('click',e=>{e.stopImmediatePropagation();if(confirm('Reset the shared mock data across all modules?'))DemoStore.reset();},true);
  document.querySelector('#view-queue .page-title')?.parentElement.querySelector('button')?.addEventListener('click',()=>location.reload());
  renderQueue();
})();
