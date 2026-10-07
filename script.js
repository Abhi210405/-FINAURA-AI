const cases = [
 {id:"CLM-2026-1041",type:"Claim",risk:18,decision:"Auto-approved",amount:"₹72,000"},
 {id:"CLM-2026-1042",type:"Claim",risk:71,decision:"Human review",amount:"₹4,80,000"},
 {id:"AUD-2026-0217",type:"Audit",risk:42,decision:"Flagged",amount:"₹12,40,000"},
 {id:"FRD-2026-0089",type:"Fraud",risk:83,decision:"Escalated",amount:"₹2,15,000"},
 {id:"CLM-2026-1047",type:"Claim",risk:24,decision:"Auto-approved",amount:"₹1,05,000"}
];
const reviews = [
 {id:"CLM-2026-1042",reason:"High claim amount + repeated claim history",risk:71},
 {id:"FRD-2026-0089",reason:"Duplicate / suspicious transaction pattern",risk:83},
 {id:"AUD-2026-0217",reason:"Unusual transaction cluster requires evidence review",risk:68}
];
const ledger = [
 {time:"21:31",id:"CLM-2026-1041",action:"AUTO_APPROVE",risk:18,evidence:"6 sources"},
 {time:"21:28",id:"FRD-2026-0089",action:"ESCALATE",risk:83,evidence:"9 sources"},
 {time:"21:21",id:"AUD-2026-0217",action:"HUMAN_REVIEW",risk:68,evidence:"7 sources"},
 {time:"21:12",id:"CLM-2026-1047",action:"AUTO_APPROVE",risk:24,evidence:"5 sources"}
];

function riskClass(r){return r>=65?'high':r>=35?'medium':'low'}
function renderCases(){
 const el=document.getElementById('caseTable');
 el.innerHTML=cases.map(c=>`<tr><td><b>${c.id}</b></td><td>${c.type}</td><td><span class="badge ${riskClass(c.risk)}">${c.risk}%</span></td><td>${c.decision}</td><td><button class="btn" style="padding:6px 9px;font-size:10px" onclick="openCase('${c.id}')">View</button></td></tr>`).join('');
}
function reviewHTML(){
 return reviews.map(r=>`<div class="review-item"><div class="row"><b>${r.id}</b><span class="badge ${riskClass(r.risk)}">Risk ${r.risk}%</span></div><p>${r.reason}</p><div class="review-actions"><button onclick="reviewAction('${r.id}','Approved')">Approve</button><button onclick="reviewAction('${r.id}','Rejected')">Reject</button><button onclick="reviewAction('${r.id}','More evidence')">More evidence</button></div></div>`).join('');
}
function renderReviews(){document.getElementById('reviewList').innerHTML=reviewHTML();document.getElementById('reviewPage').innerHTML=reviewHTML();}
function renderLedger(){document.getElementById('ledgerList').innerHTML=ledger.map(x=>`<div class="ledger-item"><div>${x.time}</div><div><b>${x.id}</b><br><span class="sub">${x.action} · ${x.evidence}</span></div><div><span class="badge ${riskClass(x.risk)}">${x.risk}%</span></div></div>`).join('');}
function switchView(id){
 document.querySelectorAll('.view').forEach(v=>v.classList.remove('active'));
 document.getElementById(id).classList.add('active');
 document.querySelectorAll('.nav button').forEach(b=>b.classList.toggle('active',b.dataset.view===id));
 window.scrollTo({top:0,behavior:'smooth'});
}
document.querySelectorAll('.nav button').forEach(b=>b.addEventListener('click',()=>switchView(b.dataset.view)));

function runAnalysis(){
 const amount=Number(document.getElementById('amount').value)||0;
 const history=document.getElementById('history').value;
 const docs=document.getElementById('docs').value;
 const pattern=document.getElementById('pattern').value;
 const description=(document.getElementById('caseDescription')?.value || '').toLowerCase();
 let risk=18;
 // Free-text context signals: intentionally transparent, deterministic demo logic.
 if(/missing|incomplete|invoice absent|document absent/.test(description)) risk+=12;
 if(/duplicate|suspicious|fraud|forged|fake|unusual/.test(description)) risk+=18;
 if(/previous claim|repeated claim|multiple claim/.test(description)) risk+=12;
 if(/urgent|high value|large amount/.test(description)) risk+=6;
 if(amount>100000) risk+=12;
 if(amount>300000) risk+=18;
 if(history==='Repeated claims') risk+=22;
 if(history==='High-risk pattern') risk+=30;
 if(docs==='Missing evidence') risk+=20;
 if(docs==='Contradictory evidence') risk+=30;
 if(pattern==='Unusual value') risk+=15;
 if(pattern==='Duplicate / suspicious') risk+=35;
 risk=Math.min(96,risk);
 const confidence=Math.max(72,Math.min(98,99-Math.round(risk*.2)));
 const human=risk>=65 || docs==='Contradictory evidence';
 const decision=human?'HUMAN REVIEW':risk<35?'AUTO-APPROVE':'CONDITIONAL REVIEW';
 const badge=document.getElementById('decisionBadge');
 badge.textContent=decision;
 badge.className='badge '+(human?'high':risk<35?'low':'medium');
 document.getElementById('riskScore').textContent=risk+'%';
 document.getElementById('riskRing').style.background=`conic-gradient(${human?'var(--red)':'var(--primary)'} 0 ${risk}%,#e8ebf2 ${risk}% 100%)`;
 document.getElementById('decisionText').textContent=human?'Escalate to authorized reviewer':risk<35?'Permitted low-risk automation':'Hold for additional validation';
 document.getElementById('confidence').textContent=`Decision confidence: ${confidence}% · Evidence completeness: ${docs==='Complete & consistent'?'Complete':'Needs attention'}`;
 const ev=[];
 ev.push(`<div><strong>Claims / Intake Agent</strong>Input classified as ${document.getElementById('workflow').value.toLowerCase()} and fields normalized.</div>`);
 ev.push(`<div><strong>Fraud Agent</strong>${pattern==='Normal'?'No seeded suspicious pattern detected.':'Suspicious pattern signal detected from the supplied synthetic case.'}</div>`);
 ev.push(`<div><strong>Compliance Agent</strong>${docs==='Complete & consistent'?'Mandatory evidence checks passed.':'Evidence completeness / consistency check requires attention.'}</div>`);
 ev.push(`<div><strong>Decision Engine</strong>Risk ${risk}% with ${human?'human escalation':'controlled automation'} under prototype thresholds.</div>`);
 ev.push(`<div><strong>Audit Trail</strong>Case, inputs, factors, confidence and final action will be recorded in the Decision Ledger.</div>`);
 document.getElementById('evidence').innerHTML=ev.join('');
 document.getElementById('passport').innerHTML = `
   <div class="passport-card"><b>Risk Signal</b><span>${risk}% · ${risk>=65?'High':'Controlled'}</span></div>
   <div class="passport-card"><b>Rule Gate</b><span>${human?'Escalation required':'Low-risk rule path eligible'}</span></div>
   <div class="passport-card"><b>Evidence</b><span>${docs==='Complete & consistent'?'Complete':'Attention required'}</span></div>
   <div class="passport-card"><b>Escalation</b><span>${human?'Human reviewer':'No escalation'}</span></div>`;
 showToast('Analysis completed — '+decision);
}
function openCase(id){
 const c=cases.find(x=>x.id===id); if(!c)return;
 document.getElementById('modalTitle').textContent=c.id;
 document.getElementById('modalSub').textContent=`${c.type} · ${c.amount} · Synthetic demonstration`;
 document.getElementById('modalBody').innerHTML=`<div class="score"><div class="ring" style="background:conic-gradient(var(--${c.risk>=65?'red':c.risk>=35?'amber':'green'}) 0 ${c.risk}%,#e8ebf2 ${c.risk}%)"><b>${c.risk}%</b></div><div><b style="font-size:18px">${c.decision}</b><p class="sub">Decision generated from risk signals, rules and evidence.</p></div></div><hr style="border:0;border-top:1px solid var(--line);margin:18px 0"><div class="evidence"><div><strong>Input evidence</strong>Synthetic claim / transaction record and supporting documents.</div><div><strong>Model signals</strong>Risk and anomaly signals were combined by the Decision Engine.</div><div><strong>Rule controls</strong>Low-risk automation is permitted only when configured evidence and thresholds are satisfied.</div><div><strong>Auditability</strong>Decision path, evidence, confidence and reviewer action are retained.</div></div>`;
 document.getElementById('caseModal').classList.add('show');
}
function closeModal(){document.getElementById('caseModal').classList.remove('show')}
function reviewAction(id,action){
 const idx=reviews.findIndex(r=>r.id===id);
 if(idx>-1){reviews.splice(idx,1);renderReviews();ledger.unshift({time:new Date().toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'}),id,action:action.toUpperCase().replaceAll(' ','_'),risk:68,evidence:"Reviewer action"});renderLedger();}
 showToast(`${id}: ${action}`);
}
function showToast(msg){const t=document.getElementById('toast');t.textContent=msg;t.style.display='block';clearTimeout(window.toastTimer);window.toastTimer=setTimeout(()=>t.style.display='none',2600)}
renderCases();renderReviews();renderLedger();
