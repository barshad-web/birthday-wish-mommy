const $ = (selector, scope = document) => scope.querySelector(selector);
const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];

const CONFIG = {
  name: 'Mommy',
  message: "Happy Birthday My Dear Mommy. You are the Best and the Most Valuable Person in my Life. Today is the most special day for your life. Be always what you are because You are the Best."
};

const defaultMemories = [
  { src: 'images/mome/FB_IMG_1789849102824.jpg', caption: 'A kinda sweet soul', date: 'a little while ago' },
  { src: 'images/mome/IMG-20240324-WA0005.jpg', caption: 'more Gorgeous , Day by Day', date: 'Every Day' },
  { src: 'images/mome/IMG_20220506_100309.jpg', caption: 'Angel of this world', date: 'my favorite ' },
  { src: 'images/mome/FB_IMG_1789849086332.jpg', caption: 'kindest person ever', date: 'today & always' },
  { src: 'images/mome/Videoframe_20240628_121234_com.huawei.himovie.overseas.jpg', caption: 'the person who love you', date: 'always nearby' }
];

let candles = [true, true, true];
let candlesComplete = false;
let selectedSticker = '✦';
let audioContext;
let masterGain;
let musicTimer;
let musicStarted = false;
let musicMuted = false;
let audio;
let toastTimer;
let lightboxIndex = 0;
let microphoneStream;
let analyser;
let micFrame;
let blowCooldown = false;

const galleryKey = 'little-moment-memories';
const wishesKey = 'little-moment-wishes';

function loadLocal(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key)) || fallback; } catch { return fallback; }
}
function saveLocal(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { showToast('Could not save on this device'); }
}
function showToast(message) {
  const toast = $('#toast');
  $('#toastText').textContent = message;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2800);
}

function setupTheme() {
  const saved = localStorage.getItem('little-moment-theme');
  if (saved) document.documentElement.dataset.theme = saved;
  $('#themeToggle').addEventListener('click', () => {
    const dark = document.documentElement.dataset.theme === 'dark';
    document.documentElement.dataset.theme = dark ? 'light' : 'dark';
    localStorage.setItem('little-moment-theme', dark ? 'light' : 'dark');
    $('#themeToggle').setAttribute('aria-label', dark ? 'Switch to dark mode' : 'Switch to light mode');
  });
}

function burstCelebration(intensity = 1) {
  const layer = $('#celebrationLayer');
  const colors = ['#ff9ab1', '#ffbd71', '#b8a3ff', '#b5d8c5', '#fff4cb', '#ff7c73'];
  const count = Math.round(75 * intensity);
  for (let i = 0; i < count; i += 1) {
    const piece = document.createElement('span');
    piece.className = `confetti-piece ${i % 4 === 0 ? 'circle' : ''}`;
    piece.style.setProperty('--c', colors[i % colors.length]);
    piece.style.setProperty('--x', `${(Math.random() - .5) * 110}vw`);
    piece.style.setProperty('--y', `${(Math.random() - .5) * 105}vh`);
    piece.style.setProperty('--r', `${Math.random() * 1000 - 500}deg`);
    piece.style.setProperty('--d', `${Math.random() * .18}s`);
    layer.appendChild(piece);
    setTimeout(() => piece.remove(), 2400);
  }
  for (let i = 0; i < 12; i += 1) {
    const sparkle = document.createElement('span');
    sparkle.className = 'confetti-piece circle';
    sparkle.textContent = '✦';
    sparkle.style.background = 'transparent';
    sparkle.style.color = '#fff7cf';
    sparkle.style.fontSize = `${10 + Math.random() * 18}px`;
    sparkle.style.setProperty('--x', `${(Math.random() - .5) * 70}vw`);
    sparkle.style.setProperty('--y', `${(Math.random() - .5) * 70}vh`);
    sparkle.style.setProperty('--r', `${Math.random() * 180}deg`);
    sparkle.style.setProperty('--d', `${Math.random() * .25}s`);
    layer.appendChild(sparkle);
    setTimeout(() => sparkle.remove(), 2400);
  }
}

function setupHero() {
  $('#startButton').addEventListener('click', () => {
    burstCelebration(1.25);
    startMusic();
    $('#startButton').innerHTML = 'The magic has started <span>✦</span>';
    $('#startButton').disabled = true;
    document.body.classList.add('celebration-started');
    setTimeout(() => $('#message').scrollIntoView({ behavior: 'smooth', block: 'start' }), 520);
  });
}

function setupMessage() {
  const text = $('#messageText');
  const button = $('#readMessageButton');
  let revealed = false;
  button.addEventListener('click', () => {
    if (revealed) { text.classList.remove('typing'); text.textContent = CONFIG.message; button.innerHTML = 'Read it again <span>↻</span>'; return; }
    revealed = true;
    const fullText = text.textContent;
    text.textContent = '';
    text.classList.add('typing');
    button.disabled = true;
    let i = 0;
    const type = () => {
      if (i < fullText.length) { text.textContent += fullText[i]; i += 1; setTimeout(type, 18); }
      else { button.disabled = false; button.innerHTML = 'Read it again <span>↻</span>'; }
    };
    type();
  });
}

function extinguishCandle(index) {
  if (!candles[index]) return;
  candles[index] = false;
  const candle = $(`[data-candle="${index}"]`);
  candle.classList.add('is-out');
  candle.setAttribute('aria-label', `Candle ${index + 1}, extinguished`);
  burstMiniSparkles(candle);
  const remaining = candles.filter(Boolean).length;
  if (remaining > 0) $('#candleStatus').textContent = `${remaining} little flame${remaining > 1 ? 's' : ''} still glowing`;
  if (remaining === 0) completeCandles();
}
function burstMiniSparkles(anchor) {
  for (let i = 0; i < 5; i += 1) {
    const spark = document.createElement('span');
    spark.textContent = i % 2 ? '·' : '✦';
    spark.className = 'mini-spark';
    spark.style.cssText = `left:${anchor.offsetLeft + 10}px;top:${anchor.offsetTop + 14}px;--mx:${(Math.random() - .5) * 70}px;--my:${-20 - Math.random() * 45}px;`;
    $('.interactive-cake-body').appendChild(spark);
    setTimeout(() => spark.remove(), 900);
  }
}
function completeCandles() {
  if (candlesComplete) return;
  candlesComplete = true;
  $('.candle-stage').classList.add('is-complete');
  $('#candleStatus').textContent = 'your wish is on its way ✦';
  $('#wishGate').hidden = false;
  $('#micButton').disabled = true;
  $('#tapButton').disabled = true;
  if (microphoneStream) microphoneStream.getTracks().forEach(track => track.stop());
  burstCelebration(.85);
}
function setupCandles() {
  $$('.interactive-candle').forEach((candle) => {
    const blow = () => extinguishCandle(Number(candle.dataset.candle));
    candle.addEventListener('click', blow);
    candle.addEventListener('keydown', (event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); blow(); } });
  });
  $('#tapButton').addEventListener('click', () => {
    const next = candles.findIndex(Boolean);
    if (next >= 0) extinguishCandle(next);
  });
  $('#wishButton').addEventListener('click', () => {
    $('#surprise').scrollIntoView({ behavior: 'smooth', block: 'center' });
    setTimeout(revealSurprise, 700);
  });
  $('#micButton').addEventListener('click', startMicrophone);
}
async function startMicrophone() {
  if (!navigator.mediaDevices?.getUserMedia) { microphoneFallback('Microphone is not available here. Tap each candle instead.'); return; }
  $('#micButton').disabled = true;
  $('#micStatus').textContent = 'Listening… give a little birthday blow toward your microphone.';
  try {
    microphoneStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    audioContext = audioContext || new (window.AudioContext || window.webkitAudioContext)();
    const source = audioContext.createMediaStreamSource(microphoneStream);
    analyser = audioContext.createAnalyser();
    analyser.fftSize = 256;
    source.connect(analyser);
    const data = new Uint8Array(analyser.fftSize);
    let strongFrames = 0;
    const listen = () => {
      if (!analyser || candlesComplete) return;
      analyser.getByteTimeDomainData(data);
      let sum = 0;
      for (let i = 0; i < data.length; i += 1) { const normalized = (data[i] - 128) / 128; sum += normalized * normalized; }
      const volume = Math.sqrt(sum / data.length);
      if (volume > .13) strongFrames += 1; else strongFrames = Math.max(0, strongFrames - 1);
      if (strongFrames > 7 && !blowCooldown) {
        const next = candles.findIndex(Boolean);
        if (next >= 0) {
          extinguishCandle(next);
          blowCooldown = true;
          strongFrames = 0;
          $('#micStatus').textContent = candles.filter(Boolean).length ? 'Beautiful. Give the next one a little blow.' : 'Perfect. Your wish is floating upward.';
          setTimeout(() => { blowCooldown = false; }, 900);
        }
      }
      micFrame = requestAnimationFrame(listen);
    };
    listen();
  } catch (error) {
    microphoneFallback(error.name === 'NotAllowedError' ? 'Microphone access was declined — no worries, tap-to-blow is ready.' : 'We could not access the microphone. Tap each candle instead.');
  }
}
function microphoneFallback(message) {
  $('#micButton').disabled = false;
  $('#micStatus').textContent = message;
  $('#micStatus').classList.add('error');
  $('#tapButton').classList.add('button-primary');
}

function setupSurprise() {
  $('#giftBox').addEventListener('click', () => {
    const gift = $('#giftBox');
    if (gift.classList.contains('opened')) return;
    gift.classList.add('opened');
    $('#finalMessage').hidden = false;
    burstCelebration(1.4);
    playChime([523.25, 659.25, 783.99, 1046.5]);
    setTimeout(() => $('#finalMessage').scrollIntoView({ behavior: 'smooth', block: 'center' }), 500);
  });
  $('#replayButton').addEventListener('click', () => {
    burstCelebration(1.5);
    playChime([392, 523.25, 659.25, 783.99]);
    showToast('A little more magic, coming right up');
  });
}
function revealSurprise() {
  const content = $('.surprise-content');
  if (!content.hidden) return;
  $('#surpriseLock').hidden = true;
  content.hidden = false;
  $('#surprise').scrollIntoView({ behavior: 'smooth', block: 'center' });
  playChime([392, 523.25, 659.25]);
}

function createImage(src, alt) {
  const image = new Image();
  image.src = src;
  image.alt = alt;
  image.loading = 'lazy';
  image.decoding = 'async';
  return image;
}
function getMemories() { return loadLocal(galleryKey, defaultMemories); }
function renderGallery() {
  const memories = getMemories();
  const grid = $('#galleryGrid');
  grid.innerHTML = '';
  $('#galleryEmpty').hidden = memories.length > 0;
  memories.forEach((memory, index) => {
    const item = document.createElement('div');
    item.className = 'gallery-item reveal is-visible';
    item.tabIndex = 0;
    item.setAttribute('role', 'button');
    item.setAttribute('aria-label', `Open memory: ${memory.caption || 'untitled'}`);
    const image = createImage(memory.src, memory.caption || 'Birthday memory');
    image.className = 'gallery-photo';
    const overlay = document.createElement('div');
    overlay.className = 'gallery-overlay';
    overlay.innerHTML = `<span>${escapeHtml(memory.caption || 'a beautiful moment')}<small>${escapeHtml(memory.date || '')}</small></span>`;
    item.append(image, overlay);
    item.addEventListener('click', () => openLightbox(index));
    item.addEventListener('keydown', (event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); openLightbox(index); } });
    grid.appendChild(item);
  });
}
function setupMemoryModal() {
  const open = () => { $('#memoryModal').hidden = false; $('#memoryFile').focus(); };
  $('#addMemoryButton').addEventListener('click', open);
  $('#emptyAddMemory').addEventListener('click', open);
  $$('.modal-backdrop').forEach((backdrop) => backdrop.addEventListener('click', (event) => { if (event.target === backdrop) backdrop.hidden = true; }));
  $$('[data-close-modal]').forEach((button) => button.addEventListener('click', () => { $(`#${button.dataset.closeModal}`).hidden = true; }));
  $('#memoryFile').addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/') || file.size > 5 * 1024 * 1024) {
      $('#memoryError').textContent = 'Please choose an image smaller than 5MB.';
      event.target.value = '';
      return;
    }
    $('#memoryError').textContent = '';
    $('#uploadLabel').textContent = file.name;
    const reader = new FileReader();
    reader.onload = () => { $('#memoryPreview').src = reader.result; $('#memoryPreviewWrap').hidden = false; };
    reader.readAsDataURL(file);
  });
  $('#memoryForm').addEventListener('submit', (event) => {
    event.preventDefault();
    const file = $('#memoryFile').files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const memories = getMemories();
      memories.unshift({ src: reader.result, caption: $('#memoryCaption').value.trim() || 'a moment to keep', date: $('#memoryDate').value || 'just now' });
      saveLocal(galleryKey, memories);
      renderGallery();
      $('#memoryModal').hidden = true;
      event.target.reset();
      $('#memoryPreviewWrap').hidden = true;
      $('#uploadLabel').textContent = 'Choose a photo';
      showToast('Memory tucked away ✦');
    };
    reader.readAsDataURL(file);
  });
}
function openLightbox(index) {
  const memories = getMemories();
  if (!memories[index]) return;
  lightboxIndex = index;
  updateLightbox();
  $('#lightbox').hidden = false;
}
function updateLightbox() {
  const memory = getMemories()[lightboxIndex];
  if (!memory) return;
  $('#lightboxImage').src = memory.src;
  $('#lightboxImage').alt = memory.caption || 'Birthday memory';
  $('#lightboxCaption').textContent = memory.caption || 'a beautiful moment';
  $('#lightboxDate').textContent = memory.date || '';
}
function setupLightbox() {
  $('#lightboxPrev').addEventListener('click', () => { const length = getMemories().length; lightboxIndex = (lightboxIndex - 1 + length) % length; updateLightbox(); });
  $('#lightboxNext').addEventListener('click', () => { const length = getMemories().length; lightboxIndex = (lightboxIndex + 1) % length; updateLightbox(); });
  document.addEventListener('keydown', (event) => {
    if ($('#lightbox').hidden) return;
    if (event.key === 'ArrowLeft') $('#lightboxPrev').click();
    if (event.key === 'ArrowRight') $('#lightboxNext').click();
    if (event.key === 'Escape') $('#lightbox').hidden = true;
  });
}

function escapeHtml(value) { const div = document.createElement('div'); div.textContent = value; return div.innerHTML; }
function getWishes() { return loadLocal(wishesKey, [
  { name: 'Barshad', message: 'Be happy and makemore reasons to laugh until your cheeks hurt.', sticker: '♡', accent: '#e55d88', tilt: '-2deg' },
  { name: 'Indra', message: 'The world got luckier the day you arrived. Have the most wonderful birthday.', sticker: '✦', accent: '#8e76e7', tilt: '2deg' },
]); }
function renderWishes() {
  const wall = $('#wishWall');
  wall.innerHTML = '';
  getWishes().forEach((wish) => {
    const card = document.createElement('article');
    card.className = 'wish-card';
    card.style.setProperty('--accent', wish.accent || '#e55d88');
    card.style.setProperty('--tilt', wish.tilt || '0deg');
    card.innerHTML = `<span class="wish-sticker">${escapeHtml(wish.sticker)}</span><strong>${escapeHtml(wish.name)}</strong><p>${escapeHtml(wish.message)}</p><small>with love ✦</small>`;
    wall.appendChild(card);
  });
}
function setupGuestbook() {
  $$('.sticker-option').forEach((button) => button.addEventListener('click', () => {
    $$('.sticker-option').forEach((option) => { option.classList.remove('selected'); option.setAttribute('aria-checked', 'false'); });
    button.classList.add('selected'); button.setAttribute('aria-checked', 'true'); selectedSticker = button.dataset.sticker;
  }));
  $('#guestMessage').addEventListener('input', (event) => { $('#charCount').textContent = `${event.target.value.length} / 180`; });
  $('#wishForm').addEventListener('submit', (event) => {
    event.preventDefault();
    const name = $('#guestName').value.trim();
    const message = $('#guestMessage').value.trim();
    if (name.length < 2 || message.length < 4) { showToast('Add your name and a little wish first'); return; }
    const wishes = getWishes();
    wishes.unshift({ name, message, sticker: selectedSticker, accent: ['#e55d88', '#8e76e7', '#e79b3f', '#57917b'][wishes.length % 4], tilt: `${(Math.random() * 4 - 2).toFixed(1)}deg` });
    saveLocal(wishesKey, wishes);
    renderWishes();
    event.target.reset();
    $('#charCount').textContent = '0 / 180';
    showToast('Your wish is pinned ✦');
  });
}

function playNote(frequency, startTime, duration = .45) {
  if (!audioContext || !masterGain) return;
  const oscillator = audioContext.createOscillator();
  const gain = audioContext.createGain();
  oscillator.type = 'sine';
  oscillator.frequency.setValueAtTime(frequency, startTime);
  gain.gain.setValueAtTime(0, startTime);
  gain.gain.linearRampToValueAtTime(.12, startTime + .025);
  gain.gain.exponentialRampToValueAtTime(.001, startTime + duration);
  oscillator.connect(gain).connect(masterGain);
  oscillator.start(startTime);
  oscillator.stop(startTime + duration + .04);
}
function playChime(notes) {
  if (!audioContext) return;
  const now = audioContext.currentTime;
  notes.forEach((note, index) => playNote(note, now + index * .09, .7));
}
function startMusic() {
  if (!audio) {
    audio = new Audio('music/YTDown.com_YouTube_Maya-Le-John-Rai-Lyrics-Video_Media_M-3Bz0DFimk_009_128k.mp3');
    audio.loop = true;
    audio.volume = 0.5;
  }
  const playPromise = audio.play();
  if (playPromise && typeof playPromise.then === 'function') {
    playPromise
      .then(() => { musicStarted = true; musicMuted = false; setMusicPlaying(true); })
      .catch(() => { $('#musicFallback').classList.add('visible'); });
  } else {
    musicStarted = true;
    musicMuted = false;
    setMusicPlaying(true);
  }
}
function armMusicAutoplay() {
  const unbind = () => {
    document.removeEventListener('pointerdown', trigger);
    document.removeEventListener('keydown', trigger);
    document.removeEventListener('scroll', trigger);
  };
  const trigger = () => {
    unbind();
    if (!musicStarted) startMusic();
  };
  document.addEventListener('pointerdown', trigger, { passive: true });
  document.addEventListener('keydown', trigger);
  document.addEventListener('scroll', trigger, { passive: true });
}
function setMusicPlaying(playing) {
  $('#musicPlayer').classList.toggle('is-playing', playing && !musicMuted);
  $('#musicPlayButton').textContent = playing && !musicMuted ? 'Ⅱ' : '▶';
  $('#musicPlayButton').setAttribute('aria-label', playing && !musicMuted ? 'Pause birthday music' : 'Play birthday music');
  $('#musicFallback').classList.toggle('visible', !playing || musicMuted);
}
function setupMusic() {
  $('#musicPlayButton').addEventListener('click', () => {
    if (!audio) {
      startMusic();
      return;
    }

    if (audio.paused) {
      audio.play();
      musicStarted = true;
      musicMuted = false;
      setMusicPlaying(true);
    } else {
      audio.pause();
      musicStarted = false;
      setMusicPlaying(false);
    }
  });

  $('#musicFallback').addEventListener('click', () => {
    musicMuted = false;
    startMusic();
  });

  $('#musicMuteButton').addEventListener('click', () => {
    if (!audio) {
      startMusic();
      return;
    }

    musicMuted = !musicMuted;

    if (musicMuted) {
      audio.muted = true;
      setMusicPlaying(false);
      $('#musicMuteButton').textContent = '🔇';
    } else {
      audio.muted = false;
      audio.play();
      musicStarted = true;
      setMusicPlaying(true);
      $('#musicMuteButton').textContent = '🔊';
    }
  });

  setInterval(() => {
    $('#musicProgress').style.transform =
      `scaleX(${(Date.now() % 18000) / 18000})`;
  }, 120);
    startMusic();
  armMusicAutoplay();
}

function setupScrollEffects() {
  const revealObserver = new IntersectionObserver((entries) => entries.forEach((entry) => { if (entry.isIntersecting) entry.target.classList.add('is-visible'); }), { threshold: .12 });
  $$('.reveal').forEach((element) => revealObserver.observe(element));
  const sections = [...document.querySelectorAll('main > section')];
  const labels = ['beginning', 'the note', 'the wish', 'memories', 'your wishes', 'the surprise'];
  const onScroll = () => {
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    $('#progressBar').style.transform = `scaleX(${Math.min(1, Math.max(0, window.scrollY / scrollable))})`;
    let current = 0;
    sections.forEach((section, index) => { if (window.scrollY + window.innerHeight * .4 >= section.offsetTop) current = index; });
    $('#progressLabel').textContent = labels[current] || 'the surprise';
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}
function setupShare() {
  $('#shareButton').addEventListener('click', async () => {
    const shareData = { title: 'A little birthday moment for Mommy', text: 'There is a birthday surprise waiting for you ✦', url: window.location.href };
    if (navigator.share) { try { await navigator.share(shareData); } catch { /* share dismissed */ } }
    else if (navigator.clipboard) { await navigator.clipboard.writeText(window.location.href); showToast('Link copied to your clipboard ✦'); }
    else showToast('Copy this page link from your browser');
  });
}

function init() {
  $('#heroTitle').nextElementSibling.textContent = CONFIG.name + ' ✦';
  $('#messageText').textContent = CONFIG.message;
  setupTheme(); setupHero(); setupMessage(); setupCandles(); setupSurprise();
  renderGallery(); setupMemoryModal(); setupLightbox(); renderWishes(); setupGuestbook(); setupMusic(); setupScrollEffects(); setupShare();
}

document.addEventListener('DOMContentLoaded', init);
