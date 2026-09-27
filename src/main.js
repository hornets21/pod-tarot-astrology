import './style.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { ESIIMSI_DATA } from './data/esiimsiData.js';
import { TAROT_DECK } from './data/tarotData.js';
import { toggleAudio, playRattleSound, playTempleGong } from './audio/soundManager.js';
import {
  initThreeScene,
  switchSceneMode,
  resetEsiimsiView,
  triggerEsiimsiShakeAnimation,
  triggerTarotShuffleAnimation,
  triggerTarotCardDrawAnimation,
  resetDrawnTarotCards,
  setTarotCardClickHandler,
  hideDrawnStick
} from './scene/threeScene.js';

// Application State
let currentMode = 'esiimsi';
let selectedTarotSpread = 1;
let drawnTarotCards = [];
let isShakingEsiimsi = false;
let isDrawingTarotUI = false;

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('canvas-container');
  if (container) {
    initThreeScene(container);
  }
  setupUIEvents();
});

function setupUIEvents() {
  // Mode tabs
  const tabEsiimsi = document.getElementById('tab-esiimsi');
  const tabTarot = document.getElementById('tab-tarot');
  if (tabEsiimsi) tabEsiimsi.addEventListener('click', () => switchMode('esiimsi'));
  if (tabTarot) tabTarot.addEventListener('click', () => switchMode('tarot'));

  // Direct 3D Tarot Card Click
  setTarotCardClickHandler(() => {
    drawTarotCard();
  });

  // Sound toggle button
  const soundToggleBtn = document.getElementById('btn-sound-toggle');
  if (soundToggleBtn) soundToggleBtn.addEventListener('click', handleToggleAudio);

  // Esiimsi actions
  const btnShake = document.getElementById('btn-shake');
  if (btnShake) btnShake.addEventListener('click', shakeEsiimsi);

  const btnResetView = document.getElementById('btn-reset-view');
  if (btnResetView) {
    btnResetView.addEventListener('click', () => {
      resetEsiimsiView();
      showToast("ปรับตำแหน่งมุมมองตรงกลางเรียบร้อย");
    });
  }

  // Backdrop dismissal
  const backdrop = document.getElementById('overlay-backdrop');
  if (backdrop) {
    backdrop.addEventListener('click', () => {
      closeAllOverlays();
    });
  }

  // Esiimsi Overlay buttons
  const btnCloseEsiimsi = document.getElementById('btn-close-esiimsi');
  if (btnCloseEsiimsi) btnCloseEsiimsi.addEventListener('click', closeEsiimsiOverlay);

  const btnShareFortune = document.getElementById('btn-share-fortune');
  if (btnShareFortune) btnShareFortune.addEventListener('click', shareFortune);

  const btnShakeAgain = document.getElementById('btn-shake-again');
  if (btnShakeAgain) btnShakeAgain.addEventListener('click', shakeAgainFromOverlay);

  // Tarot Spread selection buttons
  const spread1 = document.getElementById('spread-1');
  const spread3 = document.getElementById('spread-3');
  const spreadLife = document.getElementById('spread-life');

  if (spread1) spread1.addEventListener('click', () => setTarotSpread(1));
  if (spread3) spread3.addEventListener('click', () => setTarotSpread(3));
  if (spreadLife) spreadLife.addEventListener('click', () => setTarotSpread('life'));

  // Tarot draw & shuffle
  const btnDrawTarot = document.getElementById('btn-draw-tarot');
  if (btnDrawTarot) btnDrawTarot.addEventListener('click', drawTarotCard);

  const btnShuffleTarot = document.getElementById('btn-shuffle-tarot');
  if (btnShuffleTarot) btnShuffleTarot.addEventListener('click', shuffleTarotDeck);

  // Tarot Overlay buttons
  const btnCloseTarot = document.getElementById('btn-close-tarot');
  if (btnCloseTarot) btnCloseTarot.addEventListener('click', closeTarotOverlay);

  const btnCopyTarot = document.getElementById('btn-copy-tarot');
  if (btnCopyTarot) btnCopyTarot.addEventListener('click', copyTarotReading);

  const btnDrawAgain = document.getElementById('btn-draw-again');
  if (btnDrawAgain) btnDrawAgain.addEventListener('click', drawAgainFromOverlay);
}

// Mode Switching
function switchMode(mode) {
  closeAllOverlays();
  currentMode = mode;
  const tabEsiimsi = document.getElementById('tab-esiimsi');
  const tabTarot = document.getElementById('tab-tarot');
  const esiimsiCtrl = document.getElementById('esiimsi-controls');
  const tarotCtrl = document.getElementById('tarot-controls');
  const tipText = document.getElementById('tip-text');

  if (mode === 'esiimsi') {
    tabEsiimsi.className = 'flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-300 bg-mystic-gold text-mystic-900 shadow-[0_0_12px_#e6c87566]';
    tabTarot.className = 'flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-300 text-slate-300 hover:text-mystic-gold hover:bg-mystic-700/60';
    esiimsiCtrl.classList.remove('hidden');
    tarotCtrl.classList.add('hidden');
    tipText.innerHTML = '<i class="fa-solid fa-hands-praying text-mystic-gold mr-1.5"></i> ตั้งจิตอธิษฐาน รำลึกถึงสิ่งศักดิ์สิทธิ์และเรื่องที่ต้องการคำแนะนำ แล้วกดปุ่มเขย่าเซียมซี';
  } else {
    tabTarot.className = 'flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-300 bg-mystic-gold text-mystic-900 shadow-[0_0_12px_#e6c87566]';
    tabEsiimsi.className = 'flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-300 text-slate-300 hover:text-mystic-gold hover:bg-mystic-700/60';
    tarotCtrl.classList.remove('hidden');
    esiimsiCtrl.classList.add('hidden');
    tipText.innerHTML = '<i class="fa-solid fa-sun text-purple-400 mr-1.5"></i> เลือกรูปแบบการวางไพ่ จากนั้นตั้งสมาธิกดปุ่มเปิดไพ่พยากรณ์ชะตาชีวิต';
  }

  switchSceneMode(mode);
}

// Audio Toggle
async function handleToggleAudio() {
  const isEnabled = await toggleAudio();
  const icon = document.getElementById('sound-icon');
  const btn = document.getElementById('btn-sound-toggle');

  if (isEnabled) {
    icon.className = 'fa-solid fa-volume-high text-emerald-400 text-xs';
    btn.classList.add('border-emerald-500/50', 'bg-emerald-950/30');
    showToast("เปิดเสียงบรรยากาศแล้ว");
  } else {
    icon.className = 'fa-solid fa-volume-xmark text-mystic-gold text-xs';
    btn.classList.remove('border-emerald-500/50', 'bg-emerald-950/30');
    showToast("ปิดเสียงแล้ว");
  }
}

// Esiimsi Shake
function shakeEsiimsi() {
  if (isShakingEsiimsi) return;
  isShakingEsiimsi = true;
  closeAllOverlays();

  const shakeBtn = document.getElementById('btn-shake');
  shakeBtn.disabled = true;
  shakeBtn.classList.add('opacity-70', 'cursor-not-allowed');

  const luckyNumber = Math.floor(Math.random() * 40) + 1;

  triggerEsiimsiShakeAnimation(
    luckyNumber,
    () => playRattleSound(),
    () => {
      playTempleGong();
      setTimeout(() => {
        showEsiimsiOverlay(luckyNumber);
        isShakingEsiimsi = false;
        shakeBtn.disabled = false;
        shakeBtn.classList.remove('opacity-70', 'cursor-not-allowed');
      }, 400);
    }
  );
}

function showEsiimsiOverlay(number) {
  const data = ESIIMSI_DATA.find(item => item.no === number) || ESIIMSI_DATA[0];
  const thaiNum = number.toString().replace(/\d/g, d => "๐๑๒๓๔๕๖๗๘๙"[d]);

  document.getElementById('esiimsi-num-badge').innerText = thaiNum;
  document.getElementById('esiimsi-title').innerText = data.title;
  document.getElementById('esiimsi-poem').innerText = data.poem;
  document.getElementById('esiimsi-career').innerText = data.career;
  document.getElementById('esiimsi-wealth').innerText = data.wealth;
  document.getElementById('esiimsi-love').innerText = data.love;
  document.getElementById('esiimsi-full-detail').innerText = data.full;
  document.getElementById('esiimsi-direction').innerText = data.direction;

  const luckyDiv = document.getElementById('esiimsi-lucky-nums');
  luckyDiv.innerHTML = data.lucky.map(n => `
    <span class="w-6 h-6 rounded-md bg-mystic-gold text-mystic-900 font-bold text-xs flex items-center justify-center shadow">
      ${n}
    </span>
  `).join('');

  // Open overlay & backdrop
  const overlay = document.getElementById('overlay-esiimsi');
  const backdrop = document.getElementById('overlay-backdrop');
  if (overlay) overlay.classList.remove('translate-x-full');
  if (backdrop) {
    backdrop.classList.remove('opacity-0', 'pointer-events-none');
    backdrop.classList.add('opacity-100');
  }
}

function closeEsiimsiOverlay() {
  const overlay = document.getElementById('overlay-esiimsi');
  const backdrop = document.getElementById('overlay-backdrop');
  if (overlay) overlay.classList.add('translate-x-full');
  if (backdrop) {
    backdrop.classList.remove('opacity-100');
    backdrop.classList.add('opacity-0', 'pointer-events-none');
  }
  hideDrawnStick();
}

function shakeAgainFromOverlay() {
  closeEsiimsiOverlay();
  setTimeout(() => {
    shakeEsiimsi();
  }, 350);
}

// Tarot Handling
function setTarotSpread(type) {
  selectedTarotSpread = type;
  closeAllOverlays();
  resetDrawnTarotCards();
  ['spread-1', 'spread-3', 'spread-life'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.className = 'px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white transition-colors';
  });

  if (type === 1) {
    document.getElementById('spread-1').className = 'px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-mystic-gold text-mystic-900 shadow-md';
  } else if (type === 3) {
    document.getElementById('spread-3').className = 'px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-mystic-gold text-mystic-900 shadow-md';
  } else {
    document.getElementById('spread-life').className = 'px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-mystic-gold text-mystic-900 shadow-md';
  }
  showToast("เลือกรูปแบบการเปิดไพ่เรียบร้อย");
}

function shuffleTarotDeck() {
  closeAllOverlays();
  resetDrawnTarotCards();
  triggerTarotShuffleAnimation(
    () => playRattleSound(),
    () => {
      showToast("สับไพ่ในสำรับเรียบร้อยแล้ว");
    }
  );
}

function drawTarotCard() {
  if (isDrawingTarotUI) return;
  isDrawingTarotUI = true;
  closeAllOverlays();

  const count = selectedTarotSpread === 1 ? 1 : 3;
  const shuffled = [...TAROT_DECK].sort(() => 0.5 - Math.random());
  drawnTarotCards = shuffled.slice(0, count);

  playTempleGong();

  // Play smooth 3D card levitation and flip animation for 1 or 3 cards
  triggerTarotCardDrawAnimation(drawnTarotCards, () => {
    showTarotOverlay();
    isDrawingTarotUI = false;
  });
}

function showTarotOverlay() {
  const container = document.getElementById('tarot-cards-container');
  container.innerHTML = '';

  let labels = ["สถานการณ์ / คำตอบฉับพลัน"];
  if (selectedTarotSpread === 3) {
    labels = ["อดีต / รากเหง้า", "ปัจจุบัน / สถานการณ์", "อนาคต / ทิศทาง"];
  } else if (selectedTarotSpread === 'life') {
    labels = ["การงานและเป้าหมาย", "การเงินและโชคลาภ", "ความรักและความสัมพันธ์"];
  }

  drawnTarotCards.forEach((card, idx) => {
    const cardCol = document.createElement('div');
    cardCol.className = 'glass-panel p-3.5 rounded-xl border border-purple-500/25 flex flex-col items-center text-center space-y-2.5';

    cardCol.innerHTML = `
      <span class="text-[10px] font-bold text-amber-300 uppercase tracking-wider bg-mystic-900/90 px-2.5 py-0.5 rounded-full border border-mystic-gold/25">
        ${labels[idx]}
      </span>

      <!-- Styled Card Mockup -->
      <div class="w-32 h-52 rounded-xl bg-gradient-to-b from-[#22133e] to-[#10081e] border border-mystic-gold/60 p-2.5 flex flex-col justify-between items-center shadow-[0_0_15px_rgba(192,132,252,0.25)]">
        <span class="text-[10px] font-cinzel text-mystic-gold">— ${card.id} —</span>
        <div class="w-12 h-12 rounded-full bg-purple-900/40 flex items-center justify-center border border-purple-400/30 text-mystic-gold text-2xl">
          <i class="fa-solid ${card.symbol}"></i>
        </div>
        <div>
          <p class="font-bold text-xs text-slate-100 font-cinzel">${card.nameEn}</p>
          <p class="text-[11px] text-purple-300 font-sarabun">${card.nameTh}</p>
        </div>
      </div>

      <!-- Description -->
      <div class="space-y-1 text-left w-full mt-1 font-sarabun">
        <p class="text-[11px] text-amber-200/90"><strong class="text-white">พลัง:</strong> ${card.keywords}</p>
        <p class="text-xs text-slate-300 leading-relaxed">${card.uprightMeaning}</p>
        <div class="pt-1.5 border-t border-white/10 text-[11px] text-purple-200 space-y-0.5">
          <div><i class="fa-solid fa-briefcase text-mystic-gold text-[9px] mr-1"></i><strong>งาน:</strong> ${card.career}</div>
          <div><i class="fa-solid fa-coins text-mystic-gold text-[9px] mr-1"></i><strong>เงิน:</strong> ${card.finance}</div>
          <div><i class="fa-solid fa-heart text-pink-400 text-[9px] mr-1"></i><strong>รัก:</strong> ${card.love}</div>
        </div>
      </div>
    `;
    container.appendChild(cardCol);
  });

  // Oracle Grand Summary
  let summaryText = "";
  if (drawnTarotCards.length === 1) {
    summaryText = `ไพ่ ${drawnTarotCards[0].nameTh} สะท้อนว่าในเวลานี้พลังงานของคุณสอดคล้องกับ "${drawnTarotCards[0].keywords}" ขอให้มีสติ มั่นใจในวิจารณญาณ และก้าวไปข้างหน้าอย่างเด็ดเดี่ยว`;
  } else {
    summaryText = `พลังรวมของไพ่ (${drawnTarotCards.map(c => c.nameTh).join(', ')}) ชี้ว่า สิ่งที่คุณตั้งใจกำลังค่อยๆ ก่อร่างสร้างผล การสร้างสมดุลระหว่างความคิดและการกระทำจะนำทิศทางที่ดีมาสู่ชีวิต`;
  }
  document.getElementById('tarot-grand-summary').innerText = summaryText;

  const overlay = document.getElementById('overlay-tarot');
  const backdrop = document.getElementById('overlay-backdrop');
  if (overlay) overlay.classList.remove('translate-x-full');
  if (backdrop) {
    backdrop.classList.remove('opacity-0', 'pointer-events-none');
    backdrop.classList.add('opacity-100');
  }
}

function closeTarotOverlay() {
  const overlay = document.getElementById('overlay-tarot');
  const backdrop = document.getElementById('overlay-backdrop');
  if (overlay) overlay.classList.add('translate-x-full');
  if (backdrop) {
    backdrop.classList.remove('opacity-100');
    backdrop.classList.add('opacity-0', 'pointer-events-none');
  }
  resetDrawnTarotCards();
}

function drawAgainFromOverlay() {
  closeTarotOverlay();
  setTimeout(() => {
    drawTarotCard();
  }, 350);
}

function closeAllOverlays() {
  closeEsiimsiOverlay();
  closeTarotOverlay();
}

// Toast & Copy
function showToast(message) {
  const toast = document.getElementById('toast');
  const msg = document.getElementById('toast-message');
  if (!toast || !msg) return;
  msg.innerText = message;
  toast.classList.remove('translate-y-20', 'opacity-0');
  setTimeout(() => {
    toast.classList.add('translate-y-20', 'opacity-0');
  }, 2500);
}

function copyToClipboard(text) {
  navigator.clipboard.writeText(text).then(() => {
    showToast("คัดลอกคำทำนายลงคลิปบอร์ดแล้ว");
  }).catch(() => {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand('copy');
      showToast("คัดลอกคำทำนายลงคลิปบอร์ดแล้ว");
    } catch (err) {
      showToast("ไม่สามารถคัดลอกได้");
    }
    document.body.removeChild(textArea);
  });
}

function shareFortune() {
  const title = document.getElementById('esiimsi-title').innerText;
  const poem = document.getElementById('esiimsi-poem').innerText;
  const career = document.getElementById('esiimsi-career').innerText;
  const wealth = document.getElementById('esiimsi-wealth').innerText;
  const love = document.getElementById('esiimsi-love').innerText;
  const full = document.getElementById('esiimsi-full-detail').innerText;

  const shareText = `คำทำนายเซียมซี ๔๐ ใบ — เรือนพยากรณ์ พ่อหมอ SARABEST\n\n✦ ${title}\n\nบทกลอนเสี่ยงทาย:\n${poem}\n\n• การงาน: ${career}\n• การเงิน: ${wealth}\n• ความรัก: ${love}\n\nคำทำนายฉบับเต็ม:\n${full}`;
  copyToClipboard(shareText);
}

function copyTarotReading() {
  const cardNames = drawnTarotCards.map(c => `${c.nameEn} (${c.nameTh})`).join(', ');
  const summary = document.getElementById('tarot-grand-summary').innerText;
  const shareText = `คำทำนายไพ่ยิปซี ทาโรต์ (Major Arcana) — เรือนพยากรณ์ พ่อหมอ SARABEST\n\n✦ ไพ่ที่เปิดได้: ${cardNames}\n\n✦ สาส์นพยากรณ์:\n${summary}`;
  copyToClipboard(shareText);
}
