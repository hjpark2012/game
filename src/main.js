import './style.css';

const canvas = document.querySelector('#space');
const ctx = canvas.getContext('2d');
const game = document.querySelector('#game');
const ui = {
  start: document.querySelector('#startScreen'), end: document.querySelector('#endScreen'), launch: document.querySelector('#launch'), restart: document.querySelector('#restart'),
  clock: document.querySelector('#clock'), speed: document.querySelector('#speed'), vector: document.querySelector('#vector'), score: document.querySelector('#score'),
  objective: document.querySelector('#objective'), hostileCount: document.querySelector('#hostileCount'), targetName: document.querySelector('#targetName'), targetDist: document.querySelector('#targetDist'), targetState: document.querySelector('#targetState'), targetHealth: document.querySelector('#targetHealth'), reticleDistance: document.querySelector('#reticleDistance'),
  hullBar: document.querySelector('#hullBar'), hullText: document.querySelector('#hullText'), boostBar: document.querySelector('#boostBar'), boostText: document.querySelector('#boostText'), missileCount: document.querySelector('#missileCount'), radarDots: document.querySelector('#radarDots'), hit: document.querySelector('#hitMarker'), resultLabel: document.querySelector('#resultLabel'), resultTitle: document.querySelector('#resultTitle'), resultText: document.querySelector('#resultText'), finalScore: document.querySelector('#finalScore')
};

let W, H, dpr, running = false, last = 0, elapsed = 0, score = 0, hull = 100, boost = 100, missiles = 4, wave = 1, shots = [], particles = [], enemies = [], stars = [], aim = {x: 0, y: 0}, keys = {}, shootCooldown = 0, missileCooldown = 0, shake = 0;
const ship = { x: 0, y: 0, roll: 0, speed: 580 };

function resize() { dpr = Math.min(devicePixelRatio, 2); W = innerWidth; H = innerHeight; canvas.width = W * dpr; canvas.height = H * dpr; canvas.style.width = W + 'px'; canvas.style.height = H + 'px'; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); }
addEventListener('resize', resize); resize();

function reset() {
  elapsed = score = 0; hull = boost = 100; missiles = 4; wave = 1; shots = []; particles = []; aim = {x: 0, y: 0}; ship.x = ship.y = ship.roll = 0; ship.speed = 580;
  stars = Array.from({length: 240}, () => ({ x: Math.random() * W, y: Math.random() * H, z: 0.12 + Math.random() * .88, p: Math.random() }));
  spawnWave();
}
function spawnWave() { const count = 7 + wave; enemies = Array.from({length: count}, (_, i) => newEnemy(i)); }
function newEnemy(i) { const a = (i / (7 + wave)) * Math.PI * 2 + Math.random() * .5; const d = 900 + Math.random() * 2300; return { a, d, x: Math.cos(a) * d, y: Math.sin(a) * d * .6, z: d, hp: 100, maxHp: 100, phase: Math.random() * Math.PI * 2, type: Math.random() > .72 ? 'RAVAGER' : 'MARAUDER', firing: Math.random() * 3, dead: false, flash: 0 }; }
function project(obj) { const scale = Math.min(1.3, 560 / Math.max(100, obj.z)); return { x: W / 2 + (obj.x - ship.x) * scale + aim.x * .18, y: H / 2 + (obj.y - ship.y) * scale + aim.y * .18, s: scale }; }
function getTarget() { let best = null, bd = Infinity; enemies.forEach(e => { if (e.dead) return; const p = project(e); const d = Math.hypot(p.x - W / 2 - aim.x, p.y - H / 2 - aim.y); if (d < bd) { bd = d; best = e; } }); return bd < 190 ? best : null; }
function fire(missile = false) {
  if (!running || (missile ? missileCooldown > 0 || missiles < 1 : shootCooldown > 0)) return;
  const target = getTarget();
  if (missile) { missiles--; missileCooldown = .75; shots.push({ kind: 'missile', x: W / 2, y: H - 80, vx: 0, vy: -900, life: 2.2, target }); }
  else { shootCooldown = .1; shots.push({ kind: 'plasma', x: W / 2, y: H - 100, vx: aim.x * .25, vy: aim.y * .25 - 1500, life: .7, target }); }
}
function burst(x,y,color,n=15) { for(let i=0;i<n;i++) { const a=Math.random()*Math.PI*2, sp=80+Math.random()*420; particles.push({x,y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,life:.35+Math.random()*.45,color,size:1+Math.random()*3}); } }
function damageEnemy(e, dmg, p) { if (!e || e.dead) return; e.hp -= dmg; e.flash = .18; burst(p.x,p.y, '#b9feff', 7); if (e.hp <= 0) { e.dead = true; score += e.type === 'RAVAGER' ? 1800 : 1000; shake = .4; burst(p.x,p.y, '#ff8a4c', 34); } }
function enemyDraw(e, p, t) {
  const size = Math.max(8, 38 * p.s); ctx.save(); ctx.translate(p.x,p.y); ctx.rotate(Math.sin(t * .001 + e.phase) * .3); ctx.globalAlpha = Math.min(1, p.s * 2.5);
  ctx.shadowBlur = 17; ctx.shadowColor = e.flash > 0 ? '#fff' : '#ff4c62'; ctx.fillStyle = e.flash > 0 ? '#e7ffff' : '#b51e3a';
  ctx.beginPath(); ctx.moveTo(0,-size*1.1);ctx.lineTo(size*.34,-size*.12);ctx.lineTo(size*1.4,size*.5);ctx.lineTo(size*.27,size*.48);ctx.lineTo(0,size*.82);ctx.lineTo(-size*.27,size*.48);ctx.lineTo(-size*1.4,size*.5);ctx.lineTo(-size*.34,-size*.12);ctx.closePath();ctx.fill();
  ctx.fillStyle='#07101d';ctx.beginPath();ctx.moveTo(0,-size*.55);ctx.lineTo(size*.18,size*.24);ctx.lineTo(-size*.18,size*.24);ctx.closePath();ctx.fill(); ctx.restore();
  if (p.s > .48) { ctx.fillStyle='rgba(255,70,96,.82)'; ctx.fillRect(p.x-size,p.y+size+7,size*2*(e.hp/e.maxHp),2); }
}
function drawShip() { const cx=W/2, cy=H/2; ctx.save();ctx.translate(cx,cy);ctx.globalAlpha=.34;ctx.strokeStyle='#b8e8fb';ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(-230,H*.42);ctx.lineTo(-125,H*.16);ctx.lineTo(-45,H*.1);ctx.lineTo(-20,H*.31);ctx.moveTo(230,H*.42);ctx.lineTo(125,H*.16);ctx.lineTo(45,H*.1);ctx.lineTo(20,H*.31);ctx.stroke();ctx.restore(); }
function drawBackground(dt, t) {
  ctx.fillStyle = '#02050d'; ctx.fillRect(0,0,W,H);
  const g=ctx.createRadialGradient(W*.72,H*.2,0,W*.72,H*.2,Math.max(W,H)*.7);g.addColorStop(0,'rgba(43,75,154,.22)');g.addColorStop(.45,'rgba(16,28,65,.07)');g.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
  for(const s of stars) { s.y += (ship.speed * s.z * dt * .18); s.x += aim.x*s.z*dt*.1; if(s.y>H+4){s.y=-4;s.x=Math.random()*W;} if(s.x<-4)s.x=W+4;if(s.x>W+4)s.x=-4; const len=Math.max(1,ship.speed/330*s.z);ctx.strokeStyle=`rgba(180,225,255,${.2+s.z*.6})`;ctx.lineWidth=s.z*1.8;ctx.beginPath();ctx.moveTo(s.x,s.y);ctx.lineTo(s.x-aim.x*.001*len,s.y-len*8);ctx.stroke(); }
}
function update(dt, t) {
  const turn = 420 * dt; if(keys['a']||keys['arrowleft']) ship.x -= turn; if(keys['d']||keys['arrowright']) ship.x += turn; if(keys['w']||keys['arrowup']) ship.y -= turn; if(keys['s']||keys['arrowdown']) ship.y += turn;
  const boosting = keys['shift'] && boost > 0; ship.speed += ((boosting ? 1280 : 580) - ship.speed) * Math.min(1, dt * 5); boost = Math.max(0, Math.min(100, boost + (boosting ? -30 : 16) * dt)); ship.roll += (((keys.a||keys.arrowleft)?-.2:(keys.d||keys.arrowright)?.2:0)-ship.roll)*dt*5;
  shootCooldown -= dt; missileCooldown -= dt; shake = Math.max(0,shake-dt*1.9);
  enemies.forEach(e=>{ if(e.dead)return; e.phase+=dt; e.z-=dt*(38+wave*7);e.x+=Math.sin(e.phase*1.2)*dt*36;e.y+=Math.cos(e.phase*.8)*dt*23;e.flash=Math.max(0,e.flash-dt);e.firing-=dt;if(e.firing<0&&e.z<1500){e.firing=1.2+Math.random()*2;const p=project(e);shots.push({kind:'enemy',x:p.x,y:p.y,vx:(W/2-p.x)*.14,vy:(H/2-p.y)*.14,life:2});} if(e.z<100){hull-=14; e.z=1100+Math.random()*800;} });
  shots.forEach(s=>{s.life-=dt;if(s.kind==='missile'&&s.target&&!s.target.dead){const p=project(s.target);s.vx+=(p.x-s.x)*dt*3;s.vy+=(p.y-s.y)*dt*3;}s.x+=s.vx*dt;s.y+=s.vy*dt;if(s.kind!=='enemy'){enemies.forEach(e=>{if(e.dead)return;const p=project(e);if(Math.hypot(s.x-p.x,s.y-p.y)<Math.max(18,42*p.s)){damageEnemy(e,s.kind==='missile'?100:23,p);s.life=0;}})}else if(Math.hypot(s.x-W/2,s.y-H/2)<42){hull-=8;s.life=0;shake=.15;burst(W/2,H/2,'#ef314f',10);}}); shots=shots.filter(s=>s.life>0&&s.x>-100&&s.x<W+100&&s.y>-100&&s.y<H+100);
  particles.forEach(p=>{p.life-=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.vx*=.94;p.vy*=.94;});particles=particles.filter(p=>p.life>0);
  enemies=enemies.filter(e=>!e.dead);if(!enemies.length){wave++;score+=2500;spawnWave();} if(hull<=0) finish(false);
}
function draw(t,dt) { drawBackground(dt,t); const jx=(Math.random()-.5)*shake*18,jy=(Math.random()-.5)*shake*18;ctx.save();ctx.translate(jx,jy); enemies.forEach(e=>enemyDraw(e,project(e),t)); for(const s of shots){ctx.strokeStyle=s.kind==='enemy'?'#ff445e':s.kind==='missile'?'#ffb85c':'#71f6ff';ctx.lineWidth=s.kind==='missile'?3:2;ctx.shadowBlur=12;ctx.shadowColor=ctx.strokeStyle;ctx.beginPath();ctx.moveTo(s.x-s.vx*.018,s.y-s.vy*.018);ctx.lineTo(s.x,s.y);ctx.stroke();}for(const p of particles){ctx.fillStyle=p.color;ctx.globalAlpha=Math.min(1,p.life*2);ctx.fillRect(p.x,p.y,p.size,p.size);}ctx.restore();drawShip(); }
function renderUI() { const target=getTarget(), p=target&&project(target); ui.clock.textContent=`${String(Math.floor(elapsed/60)).padStart(2,'0')}:${String(Math.floor(elapsed%60)).padStart(2,'0')}.${String(Math.floor((elapsed%1)*10))}`;ui.speed.textContent=Math.round(ship.speed);ui.vector.textContent=String(Math.round((Math.atan2(aim.y,aim.x)*180/Math.PI+360)%360)).padStart(3,'0');ui.score.textContent=String(score).padStart(6,'0');ui.hullBar.style.width=`${Math.max(0,hull)}%`;ui.hullText.textContent=Math.max(0,Math.ceil(hull));ui.boostBar.style.width=`${boost}%`;ui.boostText.textContent=Math.ceil(boost);ui.missileCount.textContent=`${String(missiles).padStart(2,'0')} ORDNANCE`;ui.objective.textContent=`CLEAR WAVE ${wave}`;ui.hostileCount.textContent=`HOSTILES: ${String(enemies.length).padStart(2,'0')}`;
  ui.targetName.textContent=target?target.type:'NO TARGET';ui.targetDist.textContent=target?`${(target.z/1000).toFixed(1)} KM`:'—';ui.targetState.textContent=target?'WEAPONS FREE':'SCANNING';ui.targetHealth.style.width=target?`${target.hp}%`:'0%';ui.reticleDistance.textContent=target?`${(target.z/1000).toFixed(1)}KM`:'—';ui.radarDots.innerHTML=enemies.slice(0,12).map(e=>{const x=50+Math.max(-41,Math.min(41,e.x/70)),y=50+Math.max(-41,Math.min(41,e.y/70));return `<i style="left:${x}%;top:${y}%"></i>`}).join(''); }
function loop(t) { if(!running) return; const dt=Math.min(.033,(t-last)/1000||0);last=t;elapsed+=dt;update(dt,t);draw(t,dt);renderUI();requestAnimationFrame(loop); }
function start() { reset();running=true;ui.start.classList.add('hidden');ui.end.classList.add('hidden');last=performance.now();game.requestPointerLock?.();requestAnimationFrame(loop); }
function finish(win) { if(!running)return;running=false;document.exitPointerLock?.();ui.resultLabel.textContent=win?'SECTOR SECURED':'CRAFT LOST';ui.resultTitle.innerHTML=win?'MISSION<br><span>COMPLETE</span>':'MISSION<br><span>FAILED</span>';ui.resultText.textContent=win?'침입 함대를 격퇴했습니다.':'함체가 붕괴했습니다. 다시 진입해 복수하십시오.';ui.finalScore.textContent=String(score).padStart(6,'0');ui.end.classList.remove('hidden'); }
ui.launch.addEventListener('click',start);ui.restart.addEventListener('click',start);addEventListener('keydown',e=>{keys[e.key.toLowerCase()]=true;if(e.key.toLowerCase()==='q')fire(true);if(e.key.toLowerCase()==='r'&&!running)start();});addEventListener('keyup',e=>keys[e.key.toLowerCase()]=false);addEventListener('mousedown',e=>{if(e.button===0)fire();});addEventListener('mousemove',e=>{if(running){aim.x=Math.max(-240,Math.min(240,aim.x+e.movementX*1.8));aim.y=Math.max(-150,Math.min(150,aim.y+e.movementY*1.8));}});
reset(); draw(0,.016); renderUI();
