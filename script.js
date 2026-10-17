const setup=document.getElementById('setup');
const page=document.getElementById('birthdayPage');
const form=document.getElementById('setupForm');
const nameInput=document.getElementById('nameInput');
const ageInput=document.getElementById('ageInput');
const dateInput=document.getElementById('dateInput');
const photoInput=document.getElementById('photoInput');
const photoPreview=document.getElementById('photoPreview');
const nameEl=document.getElementById('name');
const ageLine=document.getElementById('ageLine');
const photoFrame=document.getElementById('photoFrame');
const heroPhoto=document.getElementById('heroPhoto');
const surprise=document.getElementById('surprise');
const surpriseBtn=document.getElementById('surpriseBtn');
const shareBtn=document.getElementById('shareBtn');
const editBtn=document.getElementById('editBtn');
const giftStage=document.getElementById('giftStage');
const giftBtn=document.getElementById('giftBtn');
const giftMessage=document.getElementById('giftMessage');
const musicBtn=document.getElementById('musicBtn');
const music=document.getElementById('music');

const params=new URLSearchParams(location.search);
const clean=v=>String(v||'').replace(/[<>]/g,'').trim().slice(0,40);
const savedName=clean(params.get('name'));
const savedAge=clean(params.get('age'));
const savedDate=params.get('date');
const savedPhoto=params.get('photo');

function showBirthday(){setup.style.display='none';page.classList.remove('hidden-page');nameEl.textContent=clean(nameInput.value)||'Beautiful';ageLine.textContent=ageInput.value?`Celebrating ${ageInput.value} wonderful years ✨`:'';startCountdown(dateInput.value)}

function loadFromUrl(){
  if(!savedName&&!savedDate)return;
  nameInput.value=savedName||'';ageInput.value=savedAge||'';dateInput.value=savedDate||'';
  if(savedPhoto){try{heroPhoto.src=savedPhoto;photoFrame.classList.remove('hidden')}catch(e){}}
  showBirthday();
}

photoInput.addEventListener('change',()=>{
  const file=photoInput.files?.[0];
  if(!file)return;
  const reader=new FileReader();
  reader.onload=()=>{photoPreview.src=reader.result;photoPreview.classList.remove('hidden');heroPhoto.src=reader.result;photoFrame.classList.remove('hidden');window.currentPhoto=reader.result};
  reader.readAsDataURL(file);
});

form.addEventListener('submit',e=>{
  e.preventDefault();
  const name=clean(nameInput.value)||'Beautiful';
  const age=clean(ageInput.value);
  const date=dateInput.value;
  const url=new URL(location.href);
  url.searchParams.set('name',name);
  if(age)url.searchParams.set('age',age);else url.searchParams.delete('age');
  if(date)url.searchParams.set('date',date);else url.searchParams.delete('date');
  if(window.currentPhoto)url.searchParams.set('photo',window.currentPhoto);else url.searchParams.delete('photo');
  history.replaceState({},'',url);
  showBirthday();
  window.scrollTo({top:0,behavior:'smooth'});
});

editBtn.addEventListener('click',()=>{page.classList.add('hidden-page');setup.style.display='grid';window.scrollTo({top:0,behavior:'smooth'})});

surpriseBtn.addEventListener('click',()=>{
  surprise.classList.remove('hidden');surprise.classList.add('pop');surprise.scrollIntoView({behavior:'smooth',block:'center'});launchConfetti();hearts(22);surpriseBtn.textContent='Surprise Ready 💖';
});

giftBtn.addEventListener('click',()=>{
  giftStage.classList.add('open');giftBtn.textContent='Gift Opened 💖';
  setTimeout(()=>{giftMessage.classList.remove('hidden');giftMessage.classList.add('pop');launchConfetti();hearts(30)},650);
});

shareBtn.addEventListener('click',async()=>{
  const url=new URL(location.href);
  url.searchParams.set('name',nameEl.textContent);
  if(ageInput.value)url.searchParams.set('age',ageInput.value);
  if(dateInput.value)url.searchParams.set('date',dateInput.value);
  if(window.currentPhoto&&window.currentPhoto.length<180000)url.searchParams.set('photo',window.currentPhoto);else url.searchParams.delete('photo');
  const data={title:'A Birthday Surprise 💖',text:`Happy Birthday, ${nameEl.textContent}! 🎂💖`,url:url.toString()};
  try{if(navigator.share)await navigator.share(data);else{await navigator.clipboard.writeText(url.toString());shareBtn.textContent='Link Copied! 💌';setTimeout(()=>shareBtn.textContent='Share 💌',1800)}}catch(e){}
});

function startCountdown(dateValue){
  if(window.countdownTimer)clearInterval(window.countdownTimer);
  const text=document.getElementById('countdownText');
  if(!dateValue){text.textContent='Add a birthday date to start the countdown.';return}
  function tick(){
    const now=new Date();const target=new Date(`${dateValue}T00:00:00`);
    if(target<now)target.setFullYear(now.getFullYear()+1);
    const diff=Math.max(0,target-now);
    const d=Math.floor(diff/86400000),h=Math.floor(diff%86400000/3600000),m=Math.floor(diff%3600000/60000),s=Math.floor(diff%60000/1000);
    document.getElementById('days').textContent=String(d).padStart(2,'0');document.getElementById('hours').textContent=String(h).padStart(2,'0');document.getElementById('minutes').textContent=String(m).padStart(2,'0');document.getElementById('seconds').textContent=String(s).padStart(2,'0');
    text.textContent=diff<86400000?'🎉 It is almost your birthday!':`Counting down to ${target.toLocaleDateString(undefined,{month:'long',day:'numeric'})} 🎂`;
  }
  tick();window.countdownTimer=setInterval(tick,1000);
}

let playing=false;
musicBtn.addEventListener('click',async()=>{try{if(!playing){await music.play();playing=true;musicBtn.textContent='🔊 Music On'}else{music.pause();playing=false;musicBtn.textContent='🔇 Music'}}catch(e){musicBtn.textContent='🎵 Tap again'}});

function hearts(count){for(let i=0;i<count;i++){const h=document.createElement('div');h.className='heart';h.textContent=['💗','💖','💕','✨','🌸'][Math.floor(Math.random()*5)];h.style.left=Math.random()*100+'vw';h.style.fontSize=12+Math.random()*25+'px';h.style.animationDuration=4+Math.random()*5+'s';document.getElementById('hearts').appendChild(h);setTimeout(()=>h.remove(),9500)}}

function launchConfetti(){const c=document.getElementById('confetti'),ctx=c.getContext('2d');c.width=innerWidth;c.height=innerHeight;const pieces=Array.from({length:180},()=>({x:innerWidth/2,y:innerHeight*.42,vx:(Math.random()-.5)*12,vy:-Math.random()*13-4,size:4+Math.random()*7,rot:Math.random()*6,spin:(Math.random()-.5)*.25}));let frame=0;function draw(){ctx.clearRect(0,0,c.width,c.height);pieces.forEach(p=>{p.x+=p.vx;p.vy+=.28;p.y+=p.vy;p.rot+=p.spin;ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.rot);ctx.fillStyle=`hsl(${Math.random()*360},90%,70%)`;ctx.fillRect(-p.size/2,-p.size/2,p.size,p.size*1.8);ctx.restore()});if(frame++<170)requestAnimationFrame(draw);else ctx.clearRect(0,0,c.width,c.height)}draw()}

hearts(8);addEventListener('resize',()=>{const c=document.getElementById('confetti');c.width=innerWidth;c.height=innerHeight});
loadFromUrl();
