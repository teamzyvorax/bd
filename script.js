const surpriseBtn=document.getElementById('surpriseBtn');const surprise=document.getElementById('surprise');const shareBtn=document.getElementById('shareBtn');const musicBtn=document.getElementById('musicBtn');const music=document.getElementById('music');const nameEl=document.getElementById('name');

const params=new URLSearchParams(location.search);const person=params.get('name');if(person){nameEl.textContent=person.replace(/[<>]/g,'').slice(0,40)}

surpriseBtn.addEventListener('click',()=>{surprise.classList.remove('hidden');surprise.classList.add('pop');surprise.scrollIntoView({behavior:'smooth',block:'center'});launchConfetti();hearts(22);surpriseBtn.textContent='Surprise Opened 💖'});

shareBtn.addEventListener('click',async()=>{const url=new URL(location.href);url.searchParams.set('name',nameEl.textContent);const data={title:'A Birthday Surprise 💖',text:`Happy Birthday, ${nameEl.textContent}! 🎂💖`,url:url.toString()};try{if(navigator.share)await navigator.share(data);else{await navigator.clipboard.writeText(url.toString());shareBtn.textContent='Link Copied! 💌';setTimeout(()=>shareBtn.textContent='Share 💌',1800)}}catch(e){}});

let playing=false;musicBtn.addEventListener('click',async()=>{try{if(!playing){await music.play();playing=true;musicBtn.textContent='🔊 Music On'}else{music.pause();playing=false;musicBtn.textContent='🔇 Music'}}catch(e){musicBtn.textContent='🎵 Tap again'}});

function hearts(count){for(let i=0;i<count;i++){const h=document.createElement('div');h.className='heart';h.textContent=['💗','💖','💕','✨','🌸'][Math.floor(Math.random()*5)];h.style.left=Math.random()*100+'vw';h.style.fontSize=12+Math.random()*25+'px';h.style.animationDuration=4+Math.random()*5+'s';document.getElementById('hearts').appendChild(h);setTimeout(()=>h.remove(),9500)}}

function launchConfetti(){const c=document.getElementById('confetti'),ctx=c.getContext('2d');c.width=innerWidth;c.height=innerHeight;const pieces=Array.from({length:180},()=>({x:innerWidth/2,y:innerHeight*.42,vx:(Math.random()-.5)*12,vy:-Math.random()*13-4,size:4+Math.random()*7,rot:Math.random()*6,spin:(Math.random()-.5)*.25}));let frame=0;function draw(){ctx.clearRect(0,0,c.width,c.height);pieces.forEach(p=>{p.x+=p.vx;p.vy+=.28;p.y+=p.vy;p.rot+=p.spin;ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.rot);ctx.fillStyle=`hsl(${Math.random()*360},90%,70%)`;ctx.fillRect(-p.size/2,-p.size/2,p.size,p.size*1.8);ctx.restore()});if(frame++<170)requestAnimationFrame(draw);else ctx.clearRect(0,0,c.width,c.height)}draw()}

hearts(8);addEventListener('resize',()=>{const c=document.getElementById('confetti');c.width=innerWidth;c.height=innerHeight});
