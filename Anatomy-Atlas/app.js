'use strict';
// Marker coordinates use the original worksheet coordinate system.
const regions = [
['Forehead','frons|frontal|forehead',847,164],
['Skull','cranium|cranial|skull',838,184],
['Face','facies|facial|face',823,227],
['Mouth','oris|oral|mouth',789,273],
['Chin','mentis|mental|chin',764,294],
['Armpit','axilla|axillary|armpit',769,325],
['Upper arm','brachium|brachial|upper arm|arm',758,360],
['Front of elbow','antecubitis|antecubital|front of elbow|anterior elbow',754,391],
['Forearm','antebrachium|antebrachial|forearm',766,435],
['Wrist','carpus|carpal|wrist',732,477],
['Thumb','pollex|thumb',725,522],
['Palm','palma|palmar|palm',738,551],
['Fingers','digits|phalanges|digital|phalangeal|fingers',762,575],
['Kneecap','patella|patellar|kneecap|knee cap',798,620],
['Leg','crus|crural|leg|shin|lower leg',787,668],
['Ankle','tarsus|tarsal|ankle',787,703],
['Toes','digits|phalanges|digital|phalangeal|toes',788,746],
['Great toe','hallux|great toe|big toe',840,798],
['Eye','oculus|ocular|orbital|eye',930,163],
['Cheek','bucca|buccal|cheek',930,200],
['Ear','auris|otic|ear',930,227],
['Nose','nasus|nasal|nose',930,242],
['Neck','cervicis|cervical|neck',930,265],
['Chest','thorax|thoracic|thoracis|chest',994,292],
['Breast','mamma|mammary|breast',994,338],
['Abdomen','abdomen|abdominal',994,381],
['Navel','umbilicus|umbilical|navel|belly button|bellybutton',994,414],
['Hip','hip|coxal|coxa',994,456],
['Pelvis','pelvis|pelvic',1017,525],
['Groin','inguen|inguinal|groin',960,558],
['Pubic region','pubis|pubic|pubic region',960,603],
['Thigh','femur|femoral|thigh',960,642],
['Foot','pes|pedal|foot',952,761],
['Trunk','trunk|torso',1066,377],
['Shoulder','acromial|acromion|shoulder',1199,244],
['Back','dorsum|dorsal|back',1157,258],
['Upper arm','brachium|brachial|arm|upper arm',1168,302],
['Back of elbow','olecranon|olecranal|back of elbow|posterior elbow',1171,341],
['Lower back','lumbus|lumbar|loin|lower back',1159,392],
['Sacral region','sacrum|sacral|sacral region',1157,433],
['Forearm','antebrachium|antebrachial|forearm',1144,464],
['Hand','manus|manual|hand',1136,512],
['Buttock','gluteus|gluteal|buttock|buttocks',1172,558],
['Thigh','femur|femoral|thigh',1165,599],
['Back of knee','popliteus|popliteal|back of knee|posterior knee|popliteal fossa',1193,642],
['Calf','sura|sural|calf',1156,681],
['Heel','calcaneus|calcaneal|heel|heel of foot',1215,731],
['Sole of foot','planta|plantar|sole|sole of foot|foot sole',1199,772],
['Head','cephalon|cephalic|head',1328,206],
['Neck','cervicis|cervical|neck',1328,260],
['Upper limb','upper limb|upper extremity',1420,420],
['Lower limb','lower limb|lower extremity',1354,637]
].map((r,i)=>({id:i+1,name:r[0],aliases:r[1].split('|'),x:r[2],y:r[3],view:i<34?'Anterior':'Posterior'}));
const $=s=>document.querySelector(s), ns='http://www.w3.org/2000/svg';
const storageKey='anatomy-atlas-progress-v1';
const blankAnswers=()=>regions.map(()=>'');
function loadProgress(){try{const saved=JSON.parse(localStorage.getItem(storageKey));return saved&&typeof saved==='object'?saved:null}catch{return null}}
const savedProgress=loadProgress();
let answers=Array.isArray(savedProgress?.answers)&&savedProgress.answers.length===regions.length?savedProgress.answers.map(answer=>typeof answer==='string'?answer:''):blankAnswers();
let selected=Number.isInteger(savedProgress?.selected)?Math.min(regions.length-1,Math.max(0,savedProgress.selected)):0, graded=false, revealed=false, subset=null, zoom=1;
let viewMode=['both','front','back'].includes(savedProgress?.viewMode)?savedProgress.viewMode:innerWidth<=760?'front':'both', manualView=Boolean(savedProgress?.manualView);
function storeProgress(){try{localStorage.setItem(storageKey,JSON.stringify({answers,selected,viewMode,manualView}))}catch{}}
function clearProgress(){try{localStorage.removeItem(storageKey)}catch{}}
const normal=s=>s.toLowerCase().trim().replace(/[’']/g,'').replace(/[-_]/g,' ').replace(/[^a-z0-9 ]/g,'').replace(/\s+/g,' ');
const correct=(r,a)=>r.aliases.some(alias=>normal(alias)===normal(a));
// Adjacent transpositions count as one spelling edit.
function editDistance(a,b){const d=Array.from({length:a.length+1},()=>Array(b.length+1).fill(0));for(let i=0;i<=a.length;i++)d[i][0]=i;for(let j=0;j<=b.length;j++)d[0][j]=j;for(let i=1;i<=a.length;i++)for(let j=1;j<=b.length;j++){d[i][j]=Math.min(d[i-1][j]+1,d[i][j-1]+1,d[i-1][j-1]+(a[i-1]===b[j-1]?0:1));if(i>1&&j>1&&a[i-1]===b[j-2]&&a[i-2]===b[j-1])d[i][j]=Math.min(d[i][j],d[i-2][j-2]+1)}return d[a.length][b.length]}
function assess(i){const r=regions[i],a=normal(answers[i]);if(!a)return {kind:'blank'};if(correct(r,a))return {kind:'correct'};
// A valid name for another region is not automatically a typo.
const other=regions.find(q=>q.aliases.some(alias=>normal(alias)===a));if(other)return {kind:'wrong',other:other.name};
const candidates=r.aliases.map(term=>({term,d:editDistance(a,normal(term))})).sort((x,y)=>x.d-y.d||x.term.length-y.term.length);const best=candidates[0],length=Math.max(a.length,best.term.length),limit=length<4?0:length<=7?1:length<=12?2:3;
if(best.d<=limit&&best.d/length<=.26)return {kind:'close',term:best.term};return {kind:'wrong'}}
const status=i=>assess(i).kind;
function spellingMessage(i,result){const a=normal(answers[i]),b=result.term;if(a==='corpus'&&b==='carpus')return 'Use “carpus” for the wrist: change the o to a. “Corpus” means body, so it is a different anatomical word.';if((a.endsWith('us')&&b.endsWith('is'))||(a.endsWith('is')&&b.endsWith('us')))return `The ending is -${b.slice(-2)}, not -${a.slice(-2)}: ${b}. Learn this word’s ending; -is and -us are not interchangeable.`;return `Possible spelling mix-up: “${answers[i]}” → “${b}”. Compare the highlighted letters below.`}
function letterDifference(a,b){a=normal(a);let start=0,end=0;while(start<Math.min(a.length,b.length)&&a[start]===b[start])start++;while(end<Math.min(a.length-start,b.length-start)&&a[a.length-1-end]===b[b.length-1-end])end++;const part=(word,tag)=>escape(word.slice(0,start))+'<'+tag+'>'+escape(word.slice(start,word.length-end)||'∅')+'</'+tag+'>'+escape(end?word.slice(-end):'');return `<div class="letterdiff"><span>${part(a,'del')}</span><span aria-hidden="true"> → </span><span>${part(b,'mark')}</span></div>`}
function learningCard(i,result,full=false){const note=studyNotes[regions[i].name];let html='';if(result.kind==='close')html=`<p class="correction">${escape(spellingMessage(i,result))}</p>${letterDifference(answers[i],result.term)}`;if(result.kind==='close'||full)html+=`<div class="learning"><p><b>Spelling tip</b>${escape(note[0])}</p><p><b>Memory hook</b>${escape(note[1])}</p><p><b>Location & role</b>${escape(note[2])}</p></div>`;return html}

const escape=s=>s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const nodes=regions.map((r,i)=>{const g=document.createElementNS(ns,'g');g.classList.add('marker');g.setAttribute('role','button');g.setAttribute('tabindex','0');g.setAttribute('aria-label',`Region ${r.id}, ${r.view.toLowerCase()} view`);g.innerHTML=`<circle cx="${r.x}" cy="${r.y}" r="${r.id===21||r.id===22?6.5:9}"/><text x="${r.x}" y="${r.y}" style="font-size:${r.id===21||r.id===22?7.5:9}px">${r.id}</text>`;g.onclick=()=>choose(i,true);g.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();choose(i,true)}};$('#markers').append(g);return g});
function followSelected(){if(studyEnabled){followStudySelection();return}const viewport=$('#viewport'),box=viewport.getBoundingClientRect(),marker=(studyEnabled?$('#studysurface').querySelector('.studylabel[data-study-region="'+selected+'"]'):nodes[selected])?.getBoundingClientRect()??box,x=marker.left+marker.width/2,y=marker.top+marker.height/2,margin=45;const behavior=matchMedia('(prefers-reduced-motion: reduce)').matches||document.body.classList.contains('reduce')?'instant':'smooth';let left=viewport.scrollLeft,top=viewport.scrollTop;if(x<box.left+margin||x>box.right-margin)left+=x-(box.left+box.width/2);if(y<box.top+margin||y>box.bottom-margin)top+=y-(box.top+box.height/2);viewport.scrollTo({left:Math.max(0,left),top:Math.max(0,top),behavior});if(box.top<0||box.top>innerHeight-100)window.scrollBy({top:box.top-20,behavior})}
function choose(i,focus=false){selected=i;if(viewMode!=='both'&&!(viewMode==='head'&&headIds.includes(i)))viewMode=regions[i].view==='Anterior'?'front':'back';updateView();fitCanvas();$('#number').textContent=String(i+1).padStart(2,'0');$('#viewlabel').textContent=regions[i].view.toUpperCase()+' VIEW';$('#answer').value=answers[i];paint();storeProgress();if(focus&&!studyEnabled)$('#answer').focus({preventScroll:true});requestAnimationFrame(followSelected);if(!matchMedia('(prefers-reduced-motion: reduce)').matches&&!document.body.classList.contains('reduce'))$('.answercard').animate([{opacity:.55,transform:'translateY(5px)'},{opacity:1,transform:'translateY(0)'}],{duration:220})}

function paint(){document.body.classList.toggle('has-grade',graded);$('#review').disabled=!graded;if(!graded)$('#review').textContent='Review';nodes.forEach((g,i)=>{g.setAttribute('class',`marker ${answers[i]?'answered':''} ${graded?status(i):''} ${selected===i?'active':''}`);g.setAttribute('aria-pressed',String(selected===i));g.setAttribute('aria-label',`Region ${i+1}, ${regions[i].view} view, ${graded?status(i):answers[i]?'answered':'unanswered'}`)});const count=answers.filter(a=>a.trim()).length;$('#count').textContent=`${count} / ${regions.length}`;$('#bar').style.width=count/regions.length*100+'%';const result=assess(selected),labels={correct:'✓ Correct',blank:'○ Unanswered',close:'≈ Close spelling — not counted correct',wrong:'× Different or unrecognized answer'};$('#feedback').innerHTML=graded?`<strong>${labels[result.kind]}</strong>${revealed?'<p>'+escape(regions[selected].name+' · '+regions[selected].aliases.join(', '))+'</p>':''}${learningCard(selected,result,revealed)}`:'';if(graded)renderScore();renderStudy()}

function save(){answers[selected]=$('#answer').value.trim();paint();storeProgress()}
function move(delta){const list=subset??regions.map((_,i)=>i);const pos=list.indexOf(selected);choose(list[(pos+delta+list.length)%list.length],true)}
$('#answerform').onsubmit=e=>{e.preventDefault();save();move(1)};$('#answer').oninput=()=>{answers[selected]=$('#answer').value;if(graded){graded=false;revealed=false;$('#results').hidden=true;$('#retry').hidden=true;$('#reveal').hidden=true;$('#scorecard').innerHTML='<div class="eyebrow">ANSWERS UPDATED</div><h3>Ready for another look?</h3><p>Check again to score your changes.</p>'}paint();storeProgress()};$('#previous').onclick=()=>{save();move(-1)};$('#next').onclick=()=>{save();move(1)};
function renderScore(){const tally={correct:0,close:0,wrong:0,blank:0};regions.forEach((_,i)=>tally[status(i)]++);$('#review').textContent='Review · '+Math.round(tally.correct/regions.length*100)+'%';$('#scorecard').innerHTML=`<div class="eyebrow">${labelsUsed?'PRACTICED WITH LABELS':subset?'PRACTICE CHECK':'YOUR RESULTS'}</div><div class="score">${Math.round(tally.correct/regions.length*100)}<small>%</small></div><p>✓ ${tally.correct} correct · ≈ ${tally.close} close spelling<br>× ${tally.wrong} incorrect · ○ ${tally.blank} unanswered</p><p>Near-misses remain in your practice set.</p>`;renderResults()}

function grade(){save();graded=true;revealed=false;$('#reveal').textContent='Reveal answers';$('#results').hidden=true;$('#retry').hidden=false;$('#reveal').hidden=false;paint();if(!document.body.classList.contains('reduce')&&!matchMedia('(prefers-reduced-motion: reduce)').matches){for(let j=0;j<34;j++){const el=document.createElement('i');el.style.left=Math.random()*100+'%';el.style.background=j%2?'#b6a2ff':'#77f6d5';el.style.animationDelay=Math.random()*.7+'s';$('#confetti').append(el);setTimeout(()=>el.remove(),3400)}}$('#scorecard').setAttribute('role','status');return {correct:regions.filter((_,i)=>status(i)==='correct').length,total:regions.length}}
$('#check').onclick=grade;
function renderResults(){$('#results').hidden=false;const labels={correct:'✓ Correct',close:'≈ Close spelling',wrong:'× Incorrect',blank:'○ Unanswered'};$('#results').innerHTML=`<div class="reviewheading"><h2>Review & remember</h2>${labelsUsed?'<p class="studyattempt">Practiced with labels · This attempt included study mode.</p>':''}<p>Spelling suggestions are possibilities, not automatic credit. Memory hooks are study aids, not word origins.</p><a href="https://openstax.org/books/anatomy-and-physiology-2e/pages/1-6-anatomical-terminology" target="_blank" rel="noopener">Regional terminology reference · OpenStax ↗</a></div>`+regions.map((r,i)=>{const result=assess(i);return `<div class="result ${result.kind}" style="animation-delay:${Math.min(i*.015,.6)}s"><button class="reviewjump" data-region="${i}" aria-label="Go to region ${r.id}">Region ${r.id} ↗</button><b>${labels[result.kind]}${revealed?' · '+escape(r.name):''}</b><small>${r.view} · Your answer: ${escape(answers[i]||'—')}</small>${result.other?'<small>This names another region: '+escape(result.other)+'.</small>':''}${learningCard(i,result,revealed)}${revealed?'<small>Accepted: '+escape(r.aliases.join(', '))+'</small>':''}</div>`}).join('')}
$('#results').onclick=e=>{const button=e.target.closest('[data-region]');if(button){$('#reviewdialog').close();choose(Number(button.dataset.region),true)}};
$('#reveal').onclick=()=>{revealed=!revealed;$('#reveal').textContent=revealed?'Hide answers':'Reveal answers';paint();$('#reviewdialog').showModal()};

$('#retry').onclick=()=>{$('#reviewdialog').close();subset=regions.map((_,i)=>i).filter(i=>status(i)!=='correct');if(!subset.length){$('#feedback').textContent='✓ Every region is correct. Start over for a fresh round.';subset=null;return}subset.forEach(i=>answers[i]='');graded=false;revealed=false;$('#results').hidden=true;$('#retry').hidden=true;$('#reveal').hidden=true;$('#reveal').textContent='Reveal answers';$('#scorecard').innerHTML=`<div class="eyebrow">FOCUSED PRACTICE</div><h3>${subset.length} regions.<br>Another chance.</h3><p>Correct answers stay saved. Next moves through your missed regions.</p>`;choose(subset[0],true)};
$('#reset').onclick=()=>{if(answers.some(Boolean)&&!confirm('Clear all saved answers and start a new quiz?'))return;answers=blankAnswers();labelsUsed=studyEnabled;graded=false;revealed=false;subset=null;$('#results').hidden=true;$('#retry').hidden=true;$('#reveal').hidden=true;$('#reveal').textContent='Reveal answers';$('#scorecard').innerHTML='<div class="eyebrow">A FRESH START</div><h3>Find your rhythm.</h3><p>All regions. Both views.<br>One answer at a time.</p>';choose(0);clearProgress()};
function updateView(){const boxes={both:'660 110 840 720',front:'690 130 400 700',back:'1100 130 370 700',head:'735 145 285 155'};$('#map').setAttribute('viewBox',boxes[viewMode]);for(const [id,mode]of [['viewboth','both'],['viewfront','front'],['viewback','back'],['headview','head']])$('#'+id).setAttribute('aria-pressed',String(mode===viewMode));nodes.forEach((node,i)=>{const visible=viewMode==='head'?headIds.includes(i):viewMode==='both'||(viewMode==='front')===(regions[i].view==='Anterior');node.style.display=visible?'':'none';node.setAttribute('tabindex',visible?'0':'-1')})}
function fitCanvas(){if(studyEnabled){$('#studysurface').style.setProperty('--study-scale',zoom);$('#fit').textContent=zoom===1?'Fit':Math.round(zoom*100)+'%';return}const viewport=$('#viewport'),ratio=viewMode==='both'?840/720:viewMode==='front'?400/700:370/700;const base=Math.min(viewport.clientWidth,viewport.clientHeight*ratio);$('#canvas').style.width=Math.max(1,base*zoom)+'px';$('#fit').textContent=zoom===1?'Fit':Math.round(zoom*100)+'%'}
function setView(mode){manualView=true;viewMode=mode;zoom=1;const target=mode==='head'&&!headIds.includes(selected)?0:mode==='front'&&selected>=34?0:mode==='back'&&selected<34?34:selected;choose(target);requestAnimationFrame(followSelected)}
$('#viewboth').onclick=()=>setView('both');$('#viewfront').onclick=()=>setView('front');$('#viewback').onclick=()=>setView('back');$('#detail').onclick=()=>setZoom(Math.max(2,zoom));

function setZoom(z){zoom=Math.min(3,Math.max(1,z));fitCanvas();requestAnimationFrame(followSelected)}$('#plus').onclick=()=>setZoom(zoom+.25);$('#minus').onclick=()=>setZoom(zoom-.25);$('#fit').onclick=()=>setZoom(1);
let drag=null;$('#viewport').onpointerdown=e=>{if(studyEnabled||e.target.closest('.marker, button, input, a, [role=button]')||e.pointerType==='touch')return;drag={x:e.clientX,y:e.clientY,l:$('#viewport').scrollLeft,t:$('#viewport').scrollTop};$('#viewport').setPointerCapture(e.pointerId)};$('#viewport').onpointermove=e=>{if(drag){$('#viewport').scrollLeft=drag.l+drag.x-e.clientX;$('#viewport').scrollTop=drag.t+drag.y-e.clientY}};$('#viewport').onpointerup=()=>drag=null;$('#viewport').onpointercancel=()=>drag=null;$('#viewport').onlostpointercapture=()=>drag=null;
// Resolve imprecise taps to the nearest visible marker; ignore pans and pinches.
let touchStart=null,touchCount=0;
$('#map').addEventListener('pointerdown',e=>{if(e.pointerType==='touch'){touchCount++;touchStart=touchCount===1?{x:e.clientX,y:e.clientY}:null}});
$('#map').addEventListener('pointerup',e=>{if(e.pointerType!=='touch')return;const start=touchStart;touchCount=Math.max(0,touchCount-1);touchStart=null;if(!start||Math.hypot(e.clientX-start.x,e.clientY-start.y)>10||e.target.closest('.marker'))return;let nearest=-1,distance=25;nodes.forEach((node,i)=>{if(node.style.display==='none')return;const b=node.getBoundingClientRect(),d=Math.hypot(e.clientX-b.left-b.width/2,e.clientY-b.top-b.height/2);if(d<distance){distance=d;nearest=i}});if(nearest>=0)choose(nearest,true)});
$('#map').addEventListener('pointercancel',()=>{touchStart=null;touchCount=0});
$('#motion').onclick=()=>{const reduce=document.body.classList.toggle('reduce');$('#motion').textContent=reduce?'Motion off':'Motion on';$('#motion').setAttribute('aria-pressed',String(reduce))};if(matchMedia('(prefers-reduced-motion: reduce)').matches){document.body.classList.add('reduce');$('#motion').textContent='Motion off';$('#motion').setAttribute('aria-pressed','true')}
$('#review').onclick=()=>{if(graded)$('#reviewdialog').showModal()};
$('#closereview').onclick=()=>$('#reviewdialog').close();
function syncViewport(){const height=window.visualViewport?.height??innerHeight;document.documentElement.style.setProperty('--app-height',height+'px');document.body.classList.toggle('short-viewport',height<520);if(!manualView&&!studyEnabled&&viewMode!=='head'){viewMode=innerWidth<=760?(regions[selected].view==='Anterior'?'front':'back'):'both';updateView()}fitCanvas();requestAnimationFrame(followSelected)}
window.visualViewport?.addEventListener('resize',syncViewport);addEventListener('resize',syncViewport);
const canvasObserver=new ResizeObserver(()=>{fitCanvas();requestAnimationFrame(followSelected)});canvasObserver.observe($('#viewport'));
wireStudy();syncViewport();choose(selected);
if(document.modelContext?.registerTool){const lifecycle=new AbortController();const register=t=>{try{Promise.resolve(document.modelContext.registerTool(t,{signal:lifecycle.signal})).catch(()=>{})}catch{}};register({name:'get_quiz_progress',description:'Read region IDs, views, entered answers, and current quiz progress without revealing the answer key.',inputSchema:{type:'object',properties:{},additionalProperties:false},annotations:{readOnlyHint:true},execute:()=>({regions:regions.map((r,i)=>({id:r.id,view:r.view,answer:answers[i]})),graded})});register({name:'set_quiz_answers',description:'Enter answers for one or more region IDs in the visible quiz. Does not grade them.',inputSchema:{type:'object',properties:{answers:{type:'array',items:{type:'object',properties:{id:{type:'integer'},answer:{type:'string'}},required:['id','answer'],additionalProperties:false}}},required:['answers'],additionalProperties:false},execute:input=>{if(!Array.isArray(input?.answers)||input.answers.some(a=>!Number.isInteger(a.id)||a.id<1||a.id>regions.length||typeof a.answer!=='string'))throw Error('Valid region IDs and text answers are required.');input.answers.forEach(a=>answers[a.id-1]=a.answer.trim());graded=false;revealed=false;$('#results').hidden=true;$('#retry').hidden=true;$('#reveal').hidden=true;choose(selected);return {updated:input.answers.length}}});register({name:'check_quiz_answers',description:'Submit and grade the currently entered answers, updating the visible score.',inputSchema:{type:'object',properties:{},additionalProperties:false},execute:grade});addEventListener('pagehide',()=>lifecycle.abort(),{once:true})}
