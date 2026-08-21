import './style.css';
import {
  loadCloudProgress,
  loginWithGoogle,
  logoutUser,
  observeUser,
  saveCloudProgress,
} from './firebase.js';

const decks = {
  beginner: { track: 'general', icon: '◌', label: '초급', subtitle: '기초를 단단하게', range: 'A1 · 기초', color: 'peach', words: [
    ['achieve', '성취하다, 이루다', 'verb', 'She achieved her goal.', '그녀는 목표를 이루었다.'], ['borrow', '빌리다', 'verb', 'Can I borrow your pen?', '펜을 빌려도 될까요?'], ['choose', '선택하다', 'verb', 'Choose the best answer.', '가장 좋은 답을 선택하세요.'], ['decide', '결정하다', 'verb', 'I decided to walk home.', '나는 걸어서 집에 가기로 결정했다.'], ['enough', '충분한', 'adjective', 'We have enough time.', '우리에게는 충분한 시간이 있다.'], ['future', '미래', 'noun', 'The future looks bright.', '미래는 밝아 보인다.'], ['happy', '행복한', 'adjective', 'This song makes me happy.', '이 노래는 나를 행복하게 한다.'], ['important', '중요한', 'adjective', 'Sleep is important for health.', '잠은 건강에 중요하다.'], ['journey', '여행', 'noun', 'The journey was fun.', '그 여행은 즐거웠다.'], ['kind', '친절한', 'adjective', 'He is kind to everyone.', '그는 모두에게 친절하다.'] ] },
  intermediate: { track: 'general', icon: '✦', label: '중급', subtitle: '표현의 폭을 넓게', range: 'B1 · 실전', color: 'mint', words: [
    ['anxious', '불안해하는', 'adjective', 'She felt anxious before the test.', '그녀는 시험 전에 불안했다.'], ['benefit', '이점, 혜택', 'noun', 'Exercise has many benefits.', '운동에는 많은 이점이 있다.'], ['challenge', '도전, 과제', 'noun', 'Learning a language is a challenge.', '언어 학습은 도전 과제다.'], ['describe', '묘사하다, 설명하다', 'verb', 'Can you describe the place?', '그 장소를 설명해 줄 수 있나요?'], ['essential', '필수적인', 'adjective', 'Water is essential for life.', '물은 생명에 필수적이다.'], ['familiar', '익숙한', 'adjective', 'Her voice sounded familiar.', '그녀의 목소리는 익숙하게 들렸다.'], ['generous', '관대한', 'adjective', 'It was a generous offer.', '그것은 관대한 제안이었다.'], ['hesitate', '망설이다', 'verb', 'Do not hesitate to ask.', '주저하지 말고 물어보세요.'], ['influence', '영향을 미치다', 'verb', 'Music can influence our mood.', '음악은 기분에 영향을 줄 수 있다.'], ['maintain', '유지하다', 'verb', 'Maintain a healthy balance.', '건강한 균형을 유지하세요.'] ] },
  advanced: { track: 'general', icon: '♢', label: '고급', subtitle: '정교하게 다듬기', range: 'C1 · 심화', color: 'lilac', words: [
    ['ambiguous', '애매한, 모호한', 'adjective', 'His answer was ambiguous.', '그의 답변은 모호했다.'], ['coherent', '일관성 있는, 논리적인', 'adjective', 'Write a coherent argument.', '논리적인 주장을 작성하세요.'], ['deteriorate', '악화되다', 'verb', 'The weather began to deteriorate.', '날씨가 악화되기 시작했다.'], ['elaborate', '상세히 설명하다', 'verb', 'Please elaborate on your idea.', '당신의 생각을 자세히 설명해 주세요.'], ['fundamental', '근본적인', 'adjective', 'Trust is fundamental to teamwork.', '신뢰는 팀워크의 근본이다.'], ['inevitable', '피할 수 없는', 'adjective', 'Change is inevitable.', '변화는 피할 수 없다.'], ['perspective', '관점', 'noun', 'Try to see a new perspective.', '새로운 관점을 보려고 해보세요.'], ['profound', '깊은, 심오한', 'adjective', 'The book had a profound effect.', '그 책은 깊은 영향을 주었다.'], ['reluctant', '꺼리는', 'adjective', 'He was reluctant to leave.', '그는 떠나기를 꺼렸다.'], ['versatile', '다재다능한', 'adjective', 'It is a versatile tool.', '그것은 다재다능한 도구다.'] ] },
  toeic500: { track: 'toeic', icon: '500', label: 'TOEIC 500', subtitle: '업무 기초 어휘', range: '목표 500+ · 입문', color: 'peach', deckTitle: '필수 비즈니스', words: [
    ['applicant', '지원자', 'noun', 'Each applicant must submit a résumé.', '각 지원자는 이력서를 제출해야 합니다.', 'job applicant · 구직 지원자'],
    ['appointment', '약속, 예약', 'noun', 'I made an appointment with the manager.', '관리자와 약속을 잡았습니다.', 'make an appointment · 약속을 잡다'],
    ['available', '이용 가능한', 'adjective', 'The meeting room is available after two.', '회의실은 2시 이후 이용 가능합니다.', 'be available for · ~에 시간이 되다'],
    ['confirm', '확인하다', 'verb', 'Please confirm your reservation by Friday.', '금요일까지 예약을 확인해 주세요.', 'confirm a reservation · 예약을 확인하다'],
    ['department', '부서', 'noun', 'Contact the sales department for details.', '자세한 내용은 영업부에 문의하세요.', 'sales department · 영업부'],
    ['equipment', '장비', 'noun', 'The office equipment will be replaced.', '사무 장비가 교체될 예정입니다.', 'office equipment · 사무 장비'],
    ['invoice', '송장, 청구서', 'noun', 'The invoice is attached to this email.', '청구서가 이 이메일에 첨부되어 있습니다.', 'issue an invoice · 청구서를 발행하다'],
    ['purchase', '구매하다, 구매', 'verb', 'Customers can purchase tickets online.', '고객은 온라인으로 표를 구매할 수 있습니다.', 'purchase online · 온라인 구매'],
    ['schedule', '일정, 예정하다', 'noun', 'The interview schedule has changed.', '면접 일정이 변경되었습니다.', 'ahead of schedule · 예정보다 일찍'],
    ['shipment', '배송품, 선적', 'noun', 'Your shipment will arrive tomorrow.', '배송품은 내일 도착합니다.', 'track a shipment · 배송을 조회하다']
  ] },
  toeic700: { track: 'toeic', icon: '700', label: 'TOEIC 700', subtitle: 'Part 5·7 핵심 어휘', range: '목표 700+ · 중급', color: 'mint', deckTitle: '빈출 실전', words: [
    ['accommodate', '수용하다, 편의를 제공하다', 'verb', 'The hall can accommodate 300 guests.', '그 홀은 손님 300명을 수용할 수 있습니다.', 'accommodate guests · 손님을 수용하다'],
    ['complimentary', '무료의', 'adjective', 'Complimentary breakfast is included.', '무료 아침 식사가 포함됩니다.', 'complimentary service · 무료 서비스'],
    ['consecutive', '연속적인', 'adjective', 'Sales rose for three consecutive months.', '매출이 3개월 연속 증가했습니다.', 'consecutive months · 연속된 달'],
    ['designate', '지정하다', 'verb', 'This area is designated for visitors.', '이 구역은 방문객용으로 지정되어 있습니다.', 'designated area · 지정 구역'],
    ['eligible', '자격이 있는', 'adjective', 'Employees are eligible for paid leave.', '직원들은 유급 휴가를 받을 자격이 있습니다.', 'be eligible for · ~할 자격이 있다'],
    ['facilitate', '촉진하다, 용이하게 하다', 'verb', 'The new system facilitates communication.', '새 시스템은 의사소통을 원활하게 합니다.', 'facilitate communication · 소통을 촉진하다'],
    ['itinerary', '여행 일정표', 'noun', 'Your travel itinerary is attached.', '여행 일정표를 첨부했습니다.', 'travel itinerary · 여행 일정표'],
    ['mandatory', '의무적인', 'adjective', 'Safety training is mandatory for all staff.', '안전 교육은 전 직원에게 의무입니다.', 'mandatory training · 의무 교육'],
    ['postpone', '연기하다', 'verb', 'We had to postpone the conference.', '회의를 연기해야 했습니다.', 'postpone a meeting · 회의를 연기하다'],
    ['reimbursement', '변제, 비용 상환', 'noun', 'Submit receipts for reimbursement.', '비용 상환을 위해 영수증을 제출하세요.', 'expense reimbursement · 비용 상환']
  ] },
  toeic850: { track: 'toeic', icon: '850', label: 'TOEIC 850+', subtitle: '고득점 변별 어휘', range: '목표 850+ · 고급', color: 'lilac', deckTitle: '고득점 심화', words: [
    ['contingency', '만일의 사태, 비상 상황', 'noun', 'We prepared a contingency plan.', '우리는 비상 대책을 마련했습니다.', 'contingency plan · 비상 대책'],
    ['discrepancy', '불일치, 차이', 'noun', 'The auditor found a discrepancy in the report.', '감사관이 보고서에서 불일치를 발견했습니다.', 'resolve a discrepancy · 불일치를 해결하다'],
    ['expedite', '신속히 처리하다', 'verb', 'Please expedite the delivery process.', '배송 절차를 신속히 처리해 주세요.', 'expedite delivery · 배송을 앞당기다'],
    ['fluctuate', '변동하다', 'verb', 'Fuel prices fluctuate throughout the year.', '연료 가격은 연중 변동합니다.', 'prices fluctuate · 가격이 변동하다'],
    ['incumbent', '현직의, 재직자', 'adjective', 'The incumbent director will retire in June.', '현직 이사는 6월에 은퇴합니다.', 'incumbent director · 현직 이사'],
    ['meticulous', '꼼꼼한, 세심한', 'adjective', 'She keeps meticulous financial records.', '그녀는 재무 기록을 꼼꼼하게 관리합니다.', 'meticulous records · 꼼꼼한 기록'],
    ['procurement', '조달, 구매', 'noun', 'He oversees the procurement of materials.', '그는 자재 조달을 감독합니다.', 'procurement process · 조달 절차'],
    ['prospective', '장래의, 잠재적인', 'adjective', 'Prospective clients attended the seminar.', '잠재 고객들이 세미나에 참석했습니다.', 'prospective client · 잠재 고객'],
    ['rectify', '바로잡다, 시정하다', 'verb', 'We will rectify the billing error promptly.', '청구 오류를 즉시 바로잡겠습니다.', 'rectify an error · 오류를 시정하다'],
    ['stringent', '엄격한', 'adjective', 'The factory follows stringent safety rules.', '공장은 엄격한 안전 규정을 따릅니다.', 'stringent requirements · 엄격한 요건']
  ] }
};

const state = JSON.parse(localStorage.getItem('wordly-state') || '{}');
state.level ||= 'beginner'; state.track ||= decks[state.level]?.track || 'general'; state.learned ||= []; state.score ||= 0; state.streak ||= 3; state.index ??= 0; state.gameIndex ??= 0;
const $ = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];
let currentUser = null, syncTimer = null, applyingCloudState = false;
const cloudPayload = () => ({ level: state.level, track: state.track, learned: state.learned, score: state.score, streak: state.streak, index: state.index });
const queueCloudSave = () => {
  if (!currentUser || applyingCloudState) return;
  clearTimeout(syncTimer);
  syncTimer = setTimeout(() => saveCloudProgress(currentUser.uid, cloudPayload()).catch(() => toast('기록은 기기에 저장했어요. 온라인에서 다시 동기화할게요.')), 650);
};
const save = () => { localStorage.setItem('wordly-state', JSON.stringify(state)); queueCloudSave(); };
let cardFlipped = false, answered = false, quizWords = [];

function getDeck(){ return decks[state.level]; }
function currentWord(){ return getDeck().words[state.index % getDeck().words.length]; }
function learnedForLevel(){ return state.learned.filter(x => x.startsWith(`${state.level}:`)).length; }
function setView(view){ $$('.view').forEach(v => v.classList.toggle('active', v.id === `${view}View`)); $$('.nav-link').forEach(n => n.classList.toggle('active', n.dataset.view === view)); document.querySelector('.sidebar').classList.remove('open'); if(view === 'study') renderStudy(); if(view === 'game') startGame(); if(view === 'words') renderWords(); window.scrollTo({top: 0, behavior: 'smooth'}); }
function toast(text){ const el=$('#toast'); el.textContent=text; el.classList.add('show'); setTimeout(()=>el.classList.remove('show'), 2200); }

function renderLevels(){
  const visibleDecks = Object.entries(decks).filter(([, deck]) => deck.track === state.track);
  if (!visibleDecks.some(([key]) => key === state.level)) state.level = visibleDecks[0][0];
  $('#levelGrid').innerHTML = visibleDecks.map(([key, deck]) => `<button class="level-card ${deck.color} ${state.level === key ? 'selected' : ''}" data-level="${key}"><span class="level-icon ${deck.track === 'toeic' ? 'toeic-icon' : ''}">${deck.icon}</span><span class="level-name">${deck.label}</span><span class="level-sub">${deck.subtitle}</span><span class="level-range">${deck.range}</span><span class="select-mark">${state.level === key ? '✓' : '→'}</span></button>`).join('');
  $$('#trackTabs button').forEach(button => {
    const active = button.dataset.track === state.track;
    button.classList.toggle('active', active);
    button.setAttribute('aria-selected', active);
  });
  $$('.level-card').forEach(el=>el.addEventListener('click',()=>{state.level=el.dataset.level;state.index=0;save();renderLevels();renderHomeStats();toast(`${decks[state.level].label} 난이도로 준비했어요`);}));
}
function renderHomeStats(){ const total=state.learned.length; const count=Math.min(10,total); $('#goalCount').textContent=`${count} / 10 단어`; $('#goalProgress').style.width=`${count*10}%`; $('#goalNote').textContent=count?`오늘 ${count}개의 단어를 기억했어요. 아주 좋아요!`:'첫 단어를 만나러 가볼까요?'; $('#streakNumber').textContent=state.streak; $('#sidebarStreak').textContent=`🔥 ${state.streak}일째 이어가는 중`;
  const today=new Date(); $('#todayDate').textContent=`${today.getMonth()+1}월 ${today.getDate()}일, 오늘도 한 걸음`;
  $('#weekDays').innerHTML=['월','화','수','목','금','토','일'].map((d,i)=>`<span class="${i<state.streak?'done':''}"><b>${i<state.streak?'✓':'·'}</b>${d}</span>`).join('');
}
function renderStudy(){ const d=getDeck(), w=currentWord(), done=learnedForLevel(); cardFlipped=false; $('#flashCard').classList.remove('flipped'); $('#studyLevelName').textContent=d.label; const generalTitle=d.label==='초급'?'필수 100':d.label==='중급'?'표현력 100':'심화 100'; $('#currentDeck').textContent=d.track==='toeic'?`${d.label} · ${d.deckTitle}`:`${d.label} · ${generalTitle}`; $('#wordText').textContent=w[0]; $('#wordType').textContent=w[2]; $('#meaningText').textContent=w[1]; $('#collocationText').textContent=w[5]||''; $('#collocationText').hidden=!w[5]; $('#exampleText').textContent=w[3]; $('#exampleMeaning').textContent=w[4]; $('#sessionNumber').textContent=`${state.index % d.words.length + 1} / ${d.words.length}`; $('#deckLearned').textContent=done; $('#deckProgress').style.width=`${Math.min(100, done*10)}%`; }
function flip(){cardFlipped=!cardFlipped;$('#flashCard').classList.toggle('flipped',cardFlipped);}
function rate(rating){ const key=`${state.level}:${currentWord()[0]}`; if(!state.learned.includes(key)) state.learned.push(key); if(rating==='easy') state.score+=3; if(rating==='good') state.score+=2; state.index=(state.index+1)%getDeck().words.length; save(); renderStudy();renderHomeStats(); toast(rating==='hard'?'다음에 한 번 더 만나요.':'기억 상자에 저장했어요!'); }
function speak(){ if(!('speechSynthesis' in window)){toast('이 브라우저는 발음을 지원하지 않아요.');return;} const u=new SpeechSynthesisUtterance(currentWord()[0]);u.lang='en-US';u.rate=.78;speechSynthesis.cancel();speechSynthesis.speak(u); }

function shuffled(arr){return [...arr].sort(()=>Math.random()-.5);}
function startGame(){ const words=shuffled(getDeck().words); quizWords=words.slice(0,10); state.gameIndex=0; state.roundScore=0; answered=false; renderQuestion(); }
function renderQuestion(){ if(state.gameIndex>=quizWords.length){ $('#quizMeaning').textContent=`완료! ${state.roundScore}점을 얻었어요.`;$('#answers').innerHTML='<div class="game-complete">🎉<br><b>오늘의 점검을 마쳤어요!</b><span>새 게임을 시작해 복습해 보세요.</span></div>';$('#roundNumber').textContent='10';$('#roundProgress').style.width='100%';$('#nextQuestion').hidden=false;$('#nextQuestion').textContent='새 게임 시작 →';$('#feedback').textContent='';return; } answered=false;const word=quizWords[state.gameIndex], options=shuffled([word,...shuffled(getDeck().words.filter(w=>w[0]!==word[0])).slice(0,3)]);$('#roundNumber').textContent=String(state.gameIndex+1).padStart(2,'0');$('#roundProgress').style.width=`${state.gameIndex*10}%`;$('#quizMeaning').textContent=word[1];$('#answers').innerHTML=options.map((w,i)=>`<button class="answer" data-word="${w[0]}"><span>${String.fromCharCode(65+i)}</span>${w[0]}</button>`).join('');$('#feedback').textContent='';$('#nextQuestion').hidden=true;$$('.answer').forEach(btn=>btn.addEventListener('click',()=>answer(btn,word)));}
function answer(btn,correct){if(answered)return;answered=true;const isCorrect=btn.dataset.word===correct[0];$$('.answer').forEach(b=>{if(b.dataset.word===correct[0])b.classList.add('correct');else if(b===btn)b.classList.add('wrong');b.disabled=true;}); if(isCorrect){state.roundScore+=10;state.score+=10;$('#feedback').textContent='정답이에요! 멋져요 ✦';$('#feedback').className='feedback correct-text';} else {$('#feedback').textContent=`아쉬워요. 정답은 ${correct[0]}예요.`;$('#feedback').className='feedback wrong-text';} $('#gameScore').textContent=state.score; save();$('#nextQuestion').hidden=false; }
function nextQuestion(){if(state.gameIndex>=quizWords.length){startGame();return;}state.gameIndex++;renderQuestion();}
function renderWords(){ const order=[...Object.entries(decks)]; $('#wordList').innerHTML=order.map(([key,d])=>{const ws=state.learned.filter(x=>x.startsWith(`${key}:`)).map(x=>x.split(':')[1]);return `<section class="word-group"><div><span class="dot ${d.color}"></span><h3>${d.label}</h3><small>${ws.length}개 학습함</small></div>${ws.length?`<ul>${ws.map(word=>`<li><b>${word}</b><span>${d.words.find(w=>w[0]===word)?.[1]}</span><i>✓</i></li>`).join('')}</ul>`:'<p class="empty-words">아직 학습한 단어가 없어요.</p>'}</section>`}).join(''); }

const authButton = $('#googleAuth');
const authLabel = $('#authLabel');
const userPhoto = $('#userPhoto');
const userGreeting = $('#userGreeting');

function renderUser(user) {
  currentUser = user;
  authButton.classList.toggle('signed-in', Boolean(user));
  authLabel.textContent = user ? `${user.displayName?.split(' ')[0] || '학습자'}님` : 'Google 로그인';
  authButton.title = user ? '클릭하여 로그아웃' : 'Google 계정으로 기록 동기화';
  userPhoto.hidden = !user?.photoURL;
  if (user?.photoURL) userPhoto.src = user.photoURL;
  userGreeting.textContent = user ? `${user.displayName?.split(' ')[0] || '학습자'}님, 이어서 공부해요` : '오늘도 한 걸음 시작해요';
}

async function mergeCloudProgress(user) {
  try {
    const remote = await loadCloudProgress(user.uid);
    if (remote) {
      applyingCloudState = true;
      state.learned = [...new Set([...(state.learned || []), ...(remote.learned || [])])];
      state.score = Math.max(state.score || 0, remote.score || 0);
      state.streak = Math.max(state.streak || 0, remote.streak || 0);
      if (decks[remote.level]) { state.level = remote.level; state.track = decks[remote.level].track; }
      state.index = Number.isInteger(remote.index) ? remote.index : state.index;
      localStorage.setItem('wordly-state', JSON.stringify(state));
      applyingCloudState = false;
      renderLevels(); renderHomeStats(); renderStudy(); renderWords(); $('#gameScore').textContent=state.score;
      toast('Google 계정의 학습 기록을 불러왔어요.');
    } else {
      await saveCloudProgress(user.uid, cloudPayload());
      toast('현재 학습 기록을 Google 계정에 저장했어요.');
    }
    await saveCloudProgress(user.uid, cloudPayload());
  } catch {
    applyingCloudState = false;
    toast(navigator.onLine ? '클라우드 연결을 확인해 주세요.' : '오프라인 기록은 기기에 안전하게 저장돼요.');
  }
}

async function handleGoogleAuth() {
  try {
    if (currentUser) { await logoutUser(); toast('로그아웃했어요. 기록은 기기에 남아 있어요.'); }
    else await loginWithGoogle();
  } catch (error) {
    if (error?.code !== 'auth/popup-closed-by-user') toast('Google 로그인에 실패했어요. 잠시 후 다시 시도해 주세요.');
  }
}

observeUser(async (user) => {
  renderUser(user);
  if (user) await mergeCloudProgress(user);
});

let installPrompt = null;
const installButton = $('#installApp');
function updateConnectivity(){ const online=navigator.onLine; $('#offlineStatus').innerHTML=`<b></b> ${online?'오프라인 학습 준비됨':'오프라인 학습 중'}`; $('#offlineStatus').classList.toggle('is-offline',!online); }
async function installApp(){
  if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone) { toast('이미 앱으로 설치되어 있어요.'); return; }
  if (installPrompt) { installPrompt.prompt(); const result=await installPrompt.userChoice; installPrompt=null; if(result.outcome==='accepted') toast('wordly 앱 설치를 시작했어요!'); return; }
  const isIOS=/iphone|ipad|ipod/i.test(navigator.userAgent);
  toast(isIOS?'Safari 공유 버튼 → 홈 화면에 추가를 눌러주세요.':'브라우저 메뉴에서 앱 설치 또는 홈 화면에 추가를 선택해 주세요.');
}
window.addEventListener('beforeinstallprompt',(event)=>{event.preventDefault();installPrompt=event;installButton.classList.add('ready');});
window.addEventListener('appinstalled',()=>{installPrompt=null;installButton.classList.add('installed');installButton.innerHTML='<span>✓</span> 설치됨';toast('이제 홈 화면에서 오프라인으로 학습할 수 있어요!');});
window.addEventListener('online',updateConnectivity);window.addEventListener('offline',updateConnectivity);
if('serviceWorker' in navigator){window.addEventListener('load',()=>navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`,{scope:import.meta.env.BASE_URL}).catch(()=>toast('오프라인 준비 중 문제가 발생했어요.')));}

$$('.nav-link').forEach(n=>n.addEventListener('click',()=>setView(n.dataset.view)));$$('[data-view-target]').forEach(n=>n.addEventListener('click',()=>setView(n.dataset.viewTarget)));$$('#trackTabs button').forEach(button=>button.addEventListener('click',()=>{state.track=button.dataset.track;state.index=0;renderLevels();save();toast(state.track==='toeic'?'TOEIC 목표 점수를 골라보세요.':'일반 영어 난이도를 골라보세요.');}));$('.logo').addEventListener('click',e=>{e.preventDefault();setView('home')});$('#flashCard').addEventListener('click',flip);$('#flashCard').addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();flip();}});$$('.rating').forEach(b=>b.addEventListener('click',()=>rate(b.dataset.rating)));$('#listenWord').addEventListener('click',e=>{e.stopPropagation();speak();});$('#soundToggle').addEventListener('click',speak);$('#nextQuestion').addEventListener('click',nextQuestion);$('#mobileMenu').addEventListener('click',()=>document.querySelector('.sidebar').classList.toggle('open'));installButton.addEventListener('click',installApp);authButton.addEventListener('click',handleGoogleAuth);
renderLevels();renderHomeStats();renderStudy();updateConnectivity();$('#gameScore').textContent=state.score;
