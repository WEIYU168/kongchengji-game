// script.js – 完全離線文字冒險 (嵌入式劇本與結局)

const STATE_KEY = 'adventureGameState';

// ---------- 劇本資料（直接嵌入） ----------
const scenesData = {
  "1": {
    "title": "第一幕：黎明之光",
    "text": "你站在古老的長城之上，晨曦初現，遠處傳來號角聲。眼前的路分為兩條——\n1. 前往城門尋求諸侯支援。\n2. 隱入山谷，暗中偵查敵情。",
    "image": "assets/images/scene1.jpg",
    "choices": [
      {"text": "前往城門", "next": "2", "statsDelta": {"智謀": 2, "鎮定": -1, "司馬懿疑心": 0}},
      {"text": "隱入山谷", "next": "2", "statsDelta": {"智謀": 0, "鎮定": 0, "司馬懿疑心": 3}}
    ],
    "quiz": {
      "question": "以下哪句出自《三國演義》？",
      "options": ["蜀中無大將，曹操不敢輕進", "青梅竹馬", "風起雲湧"],
      "answerIndex": 0
    }
  },
  "2": {
    "title": "第二幕：逆風而行",
    "text": "司馬懿的軍勢逼近，你的部隊尚未完全集結。山谷迂迴的道路上，風聲呼嘯，敵號角漸近。你必須在有限時間內作出決策。",
    "image": "assets/images/scene2.jpg",
    "choices": [
      {"text": "利用山谷隱蔽快速突襲", "next": "3", "statsDelta": {"智謀": 2, "鎮定": -1, "司馬懿疑心": 1}},
      {"text": "撤退至高地防守", "next": "3", "statsDelta": {"智謀": 0, "鎮定": 2, "司馬懿疑心": -2}}
    ],
    "quiz": {
      "question": "以下哪個詞語最能形容逆境中的奮鬥？",
      "options": ["苦盡甘來", "奮發向上", "屈原投江"],
      "answerIndex": 1
    }
  },
  "3": {
    "title": "第三幕：決戰前夜",
    "text": "夜幕降臨，兵營燃起篝火。你需要鼓舞士氣，決定最後的戰術布局。",
    "image": "assets/images/scene3.jpg",
    "choices": [
      {"text": "佈置伏兵", "next": "4", "statsDelta": {"智謀": 3, "鎮定": -1, "司馬懿疑心": 0}},
      {"text": "正面迎擊", "next": "4", "statsDelta": {"智謀": 0, "鎮定": 2, "司馬懿疑心": 1}}
    ],
    "quiz": {
      "question": "以下哪句描述夜戰的氛圍最貼切？",
      "options": ["星光燦爛，刀光劍影", "寂靜如死水", "煙火璀璨"],
      "answerIndex": 0
    }
  },
  "4": {
    "title": "第四幕：血戰之地",
    "text": "雙方在平原相遇，血光四濺。你的選擇將直接影響勝負。",
    "image": "assets/images/scene4.jpg",
    "choices": [
      {"text": "突擊敵陣中心", "next": "5", "statsDelta": {"智謀": 1, "鎮定": -2, "司馬懿疑心": 2}},
      {"text": "側翼迂回", "next": "5", "statsDelta": {"智謀": 2, "鎮定": 1, "司馬懿疑心": -1}}
    ],
    "quiz": {
      "question": "戰場上最重要的指揮原則是什麼？",
      "options": ["以逸待勞", "以靜制動", "以火制水"],
      "answerIndex": 1
    }
  },
  "5": {
    "title": "第五幕：勝負關鍵",
    "text": "戰事已久，雙方疲憊。你必須在最後一刻做出關鍵決策。",
    "image": "assets/images/scene5.jpg",
    "choices": [
      {"text": "全軍突圍", "next": "6", "statsDelta": {"智謀": 0, "鎮定": -3, "司馬懿疑心": 3}},
      {"text": "守勢待敵", "next": "6", "statsDelta": {"智謀": 2, "鎮定": 2, "司馬懿疑心": -2}}
    ],
    "quiz": {
      "question": "最後的勝負往往取決於什麼？",
      "options": ["勇氣", "智慧", "運氣"],
      "answerIndex": 1
    }
  },
  "6": {
    "title": "第六幕：終章",
    "text": "戰爭結束，天下歸於和平或混亂。你的數值將決定結局。",
    "image": "assets/images/scene6.jpg",
    "choices": [],
    "quiz": null
  }
};

// ---------- 結局資料 ----------
const endingsData = [
  {
    "type": "好",
    "condition": {"智謀 >= 10": true, "鎮定 >= 8": true},
    "title": "英勇凱旋",
    "text": "你以智慧與沉著取得勝利，天下歸於和平。",
    "image": "assets/images/good.jpg"
  },
  {
    "type": "平",
    "condition": {"智謀 >= 5": true, "司馬懿疑心 < 5": true},
    "title": "中庸之道",
    "text": "雖未盡善，但亦安然回家，天下仍保持穩定。",
    "image": "assets/images/neutral.jpg"
  },
  {
    "type": "壞",
    "condition": {},
    "title": "悲劇收場",
    "text": "疑心過重，最終喪命，天下陷入混亂。",
    "image": "assets/images/bad.jpg"
  }
];

// ---------- 遊戲狀態 ----------
let gameState = {
  currentScene: 1,
  stats: { 智謀: 0, 鎮定: 0, 司馬懿疑心: 0 },
  pendingQuiz: null
};

function loadState() {
  const saved = localStorage.getItem(STATE_KEY);
  if (saved) {
    try { gameState = JSON.parse(saved); } catch (e) { console.warn('state parse error', e); }
  }
}
function saveState() { localStorage.setItem(STATE_KEY, JSON.stringify(gameState)); }
function updateStatsDisplay() {
  document.getElementById('zhimou').textContent = `智謀值: ${gameState.stats.智謀}`;
  document.getElementById('zunding').textContent = `鎮定值: ${gameState.stats.鎮定}`;
  document.getElementById('sima').textContent = `司馬懿疑心值: ${gameState.stats.司馬懿疑心}`;
}

function renderCurrentScene() {
  const scene = scenesData[gameState.currentScene];
  if (!scene) { console.error('Missing scene', gameState.currentScene); return; }
  // 文字
  const textContainer = document.getElementById('scene-text');
  textContainer.innerHTML = '';
  scene.text.split('\n').forEach(p => {
    const pElem = document.createElement('p');
    pElem.textContent = p;
    textContainer.appendChild(pElem);
  });
  // 圖片
  document.getElementById('scene-img').src = scene.image;
  // 選項
  const optionsDiv = document.getElementById('options');
  optionsDiv.innerHTML = '';
  scene.choices.forEach((choice, idx) => {
    const btn = document.createElement('div');
    btn.className = 'option-card';
    btn.textContent = choice.text;
    btn.addEventListener('click', () => handleChoice(choice));
    optionsDiv.appendChild(btn);
  });
  // 判斷題
  const quizDiv = document.getElementById('quiz');
  if (scene.quiz) {
    quizDiv.style.display = 'block';
    document.getElementById('quiz-question').textContent = scene.quiz.question;
    const choicesContainer = document.getElementById('quiz-choices');
    choicesContainer.innerHTML = '';
    scene.quiz.options.forEach((opt, i) => {
      const optDiv = document.createElement('div');
      optDiv.className = 'quiz-choice';
      optDiv.textContent = opt;
      optDiv.addEventListener('click', () => {
        Array.from(choicesContainer.children).forEach(c => c.classList.remove('selected'));
        optDiv.classList.add('selected');
        quizDiv.dataset.chosen = i;
      });
      choicesContainer.appendChild(optDiv);
    });
    document.getElementById('quiz-submit').onclick = () => submitQuiz(scene);
  } else {
    quizDiv.style.display = 'none';
  }
}

function handleChoice(choice) {
  applyStatsDelta(choice.statsDelta);
  if (choice.next) gameState.currentScene = Number(choice.next);
  else gameState.currentScene += 1; // safety
  saveState();
  if (gameState.currentScene > 6) showEnding();
  else renderCurrentScene();
}

function applyStatsDelta(delta) {
  if (!delta) return;
  for (const key in delta) {
    if (Object.prototype.hasOwnProperty.call(gameState.stats, key)) {
      gameState.stats[key] += delta[key];
    }
  }
  updateStatsDisplay();
}

function submitQuiz(scene) {
  const quizDiv = document.getElementById('quiz');
  const chosen = Number(quizDiv.dataset.chosen);
  if (isNaN(chosen)) { alert('請先選擇答案'); return; }
  const correct = chosen === scene.quiz.answerIndex;
  if (correct) { applyStatsDelta({ 智謀: 2 }); alert('答對了！智謀值 +2'); }
  else {
    const keys = Object.keys(gameState.stats);
    const randKey = keys[Math.floor(Math.random() * keys.length)];
    applyStatsDelta({ [randKey]: -1 });
    alert(`答錯了！${randKey} -1`);
  }
  gameState.currentScene += 1;
  saveState();
  renderCurrentScene();
}

function evaluateCondition(condStr) {
  const match = condStr.match(/(智謀|鎮定|司馬懿疑心)\s*([<>]=?)\s*(\d+)/);
  if (!match) return false;
  const [, key, op, valStr] = match;
  const val = Number(valStr);
  const cur = gameState.stats[key];
  switch (op) {
    case '>=': return cur >= val;
    case '<=': return cur <= val;
    case '>': return cur > val;
    case '<': return cur < val;
    default: return false;
  }
}

function showEnding() {
  let chosen = null;
  for (const ending of endingsData) {
    const conds = ending.condition || {};
    const allOk = Object.keys(conds).every(k => evaluateCondition(k));
    if (allOk) { chosen = ending; break; }
  }
  if (!chosen) chosen = endingsData.find(e => e.type === '壞') || endingsData[0];
  // 隱藏 UI
  document.getElementById('game-container').style.display = 'none';
  document.querySelector('.footer').style.display = 'none';
  const footer = document.getElementById('game-footer');
  if (footer) footer.hidden = false;
  const endingDiv = document.getElementById('ending-content');
  endingDiv.innerHTML = `
    <h2>${chosen.title}</h2>
    <p>${chosen.text}</p>
    <img src="${chosen.image}" alt="${chosen.title}" style="max-width:100%;border-radius:12px;"/>
  `;
  document.getElementById('restart-button').onclick = () => { localStorage.removeItem(STATE_KEY); location.reload(); };
}

function init() {
  loadState();
  updateStatsDisplay();
  renderCurrentScene();
}
window.addEventListener('DOMContentLoaded', init);
