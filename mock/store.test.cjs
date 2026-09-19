const {test}=require('node:test');
const assert=require('node:assert/strict');
const {initialize,project,commit,transaction,merge}=require('../js/mock-core.js');
const seed=require('./seed.json');
test('shared clinicians have all patient discovery fields',()=>{
 const db=initialize(seed);db.workflow.doctors['external-demo']={id:'external-demo',name:'Mock clinician',specialty:'General Medicine',fee:500};
 const doctor=project(db,'patient').doctors.find(d=>d.id==='external-demo');
 assert.ok(Array.isArray(doctor.conditions));assert.ok(Array.isArray(doctor.types));assert.equal(doctor.hospital,'city');
});
test('independent edits merge and overlapping edits are rejected',()=>{
 assert.deepEqual(merge({a:2,b:1},{a:1,b:1},{a:1,b:3}),{a:2,b:3});
 assert.throws(()=>merge({a:2},{a:1},{a:3}),/Another tab/);
});
test('patient booking reaches Reception without changing other appointments',()=>{
 const db=initialize(seed),base=project(db,'patient'),data=structuredClone(base);
 data.appointments.push({id:'QA-1',person:'ravi',doctor:'priya',date:'2026-08-04',time:'11:00',type:'In person',status:'Scheduled',payment:'Pending',reason:'QA',fee:500});
 commit(db,{role:'patient',base,data});
 const reception=project(db,'reception');assert.equal(reception.db.visits.find(v=>v.id==='QA-1').patient,'PAT-1042');assert.equal(reception.db.visits.length,seed.roles.reception.db.visits.length+1);
});
test('dispensing checks verification, quantity, price, stock and duplicate commits',()=>{
 const db=initialize(seed),rx=db.workflow.pharmacy[0];
 const input={id:rx.id,method:'Cash',verified:false,lines:rx.items.map(m=>({batch:db.workflow.stock.find(p=>p.id===m.product).batches[0].id,qty:1,rate:2,discount:0}))};
 assert.throws(()=>transaction(db,'dispense',input),/verification/);
 input.verified=true;input.lines[0].qty=999;assert.throws(()=>transaction(db,'dispense',input),/stock/);
 input.lines[0].qty=1;input.lines[0].rate=-1;assert.throws(()=>transaction(db,'dispense',input),/price/);
 input.lines[0].rate=2;const before=db.workflow.stock[0].batches[0].stock;
 const result=transaction(db,'dispense',input);assert.equal(result.invoice.method,'Cash');assert.equal(result.invoice.total,8.4);assert.equal(db.workflow.stock[0].batches[0].stock,before-1);assert.equal(rx.status,'Dispensed');assert.throws(()=>transaction(db,'dispense',input),/already dispensed/);
});
test('stale role snapshot cannot overwrite an updated visit',()=>{
 const db=initialize(seed),base=project(db,'reception'),first=structuredClone(base),second=structuredClone(base);
 first.db.visits[0].reason='first change';second.db.visits[0].reason='conflicting change';
 commit(db,{role:'reception',base,data:first});assert.throws(()=>commit(db,{role:'reception',base,data:second}),/Another tab/);
});
test('seed reset restores original inventory and uses a fresh epoch',()=>{
 const a=initialize(seed),b=initialize(seed);assert.notEqual(a.epoch,b.epoch);a.workflow.stock[0].batches[0].stock=0;assert.equal(b.workflow.stock[0].batches[0].stock,48);
});
