(() => {
  const id=new URLSearchParams(location.search).get('id'),data=window.__MOCK_BOOTSTRAP__?.data;
  if(!id||!data)return;
  const invoice=data.invoices[id];
  if(!invoice){document.querySelector('.page')?.replaceChildren(Object.assign(document.createElement('p'),{textContent:'Invoice not found. Return to the dispense queue.'}));return;}
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const money=n=>'₹'+Number(n).toFixed(2);
  document.querySelector('.inv-header .num').textContent=invoice.id;
  document.querySelector('.inv-header .right').lastElementChild.textContent='Date: '+invoice.date;
  document.querySelectorAll('.cust-info .val').forEach((e,i)=>e.textContent=[invoice.patientName,invoice.phone,invoice.method,invoice.rx+' ('+invoice.doctor+')'][i]);
  document.querySelector('.rx-note').textContent=invoice.verified?'Prescription and patient identity verification recorded for '+invoice.rx+'. Mock dispensing only.':'Mock invoice linked to '+invoice.rx+'.';
  document.querySelector('tbody').innerHTML=invoice.lines.map((l,i)=>'<tr>'+[i+1,l.name+' '+(l.strength||''),l.batch,l.expiry,'3004',l.restricted?'H':'—',l.qty,l.rate,l.rate,l.discount+'%',money(l.tax/2),money(l.tax/2),money(l.total)].map(x=>'<td>'+esc(x)+'</td>').join('')+'</tr>').join('');
  const taxable=invoice.lines.reduce((n,l)=>n+l.taxable,0),tax=invoice.lines.reduce((n,l)=>n+l.tax,0),discount=invoice.lines.reduce((n,l)=>n+l.qty*l.rate-l.taxable,0);
  document.querySelectorAll('.totals-table tr').forEach(row=>{const label=row.cells[0]?.textContent||'';const value=label.includes('Grand')?invoice.total:label.includes('CGST')||label.includes('SGST')?tax/2:label.includes('Discount')?-discount:label.includes('Taxable')?taxable:taxable+discount;if(row.cells[1])row.cells[1].textContent=money(value);});
  document.querySelector('.totals-section + div')?.replaceChildren(document.createTextNode('Invoice total: '+money(invoice.total)));
  const heading=document.querySelector('.no-print > span');if(heading)heading.firstChild.textContent='Invoice Preview — '+invoice.id+' | ';
})();
