/* ========================================================
   LOVE LETTER WEBSITE - JAVASCRIPT
   Pixel Cat, Cupid's Bow Mechanics, Evasive "NO" Button, 
   Web Audio Synthesizer, Confetti & Heart Particles
======================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // ==========================================
  // 1. STATE & CONFIGURATION
  // ==========================================
  const state = {
    sender: 'Irfan',
    receiver: 'You',
    message: 'Do you want to be my girlfriend?',
    isCatHappy: false,
    soundEnabled: false,
    noEscapeCount: 0,
    isShooting: false,
    hasOpened: false
  };

  // Fun phrases when the "NO" button dodges
  const noPhrases = [
    "NO",
    "Are you sure? 🥺",
    "Wrong button! 👉",
    "Nice try! 😜",
    "Can't click me! 🏃💨",
    "Think again! 💕",
    "You can't say no! 🥰",
    "Try clicking YES! ✨",
    "Why not? 😭",
    "Error 404: NO unavailable! ❌",
    "Only YES allowed! 💖",
    "Pleeease? 🥺",
    "Forever YES! 💍"
  ];

  // Parse URL search params for instant sharing (e.g., ?from=Romeo&to=Juliet)
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('from')) state.sender = urlParams.get('from');
  if (urlParams.get('to')) state.receiver = urlParams.get('to');
  if (urlParams.get('msg')) state.message = urlParams.get('msg');

  // DOM Elements
  const sceneEnvelope = document.getElementById('sceneEnvelope');
  const sceneWindow = document.getElementById('sceneWindow');
  const envelope = document.getElementById('envelope');
  const heartSeal = document.getElementById('heartSeal');
  const bowContainer = document.getElementById('bowContainer');
  const bowString = document.getElementById('bowString');
  const loadedArrow = document.getElementById('loadedArrow');
  const flyingArrow = document.getElementById('flyingArrow');
  const bowHint = document.getElementById('bowHint');
  const senderDisplayName = document.getElementById('senderDisplayName');
  const receiverDisplayName = document.getElementById('receiverDisplayName');
  const loveQuestion = document.getElementById('loveQuestion');
  const btnYes = document.getElementById('btnYes');
  const btnNo = document.getElementById('btnNo');
  const proposalActions = document.getElementById('proposalActions');
  const successContent = document.getElementById('successContent');
  const sweetMessage = document.getElementById('sweetMessage');
  const heartFloater = document.getElementById('heartFloater');
  const replayBtn = document.getElementById('replayBtn');
  const pixelCatCanvas = document.getElementById('pixelCatCanvas');
  const audioToggleBtn = document.getElementById('audioToggleBtn');
  const audioIcon = document.getElementById('audioIcon');
  const audioText = document.getElementById('audioText');

  // Customization Modal Elements
  const editNameBtn = document.getElementById('editNameBtn');
  const customizeModal = document.getElementById('customizeModal');
  const closeModalBtn = document.getElementById('closeModalBtn');
  const saveNamesBtn = document.getElementById('saveNamesBtn');
  const senderInput = document.getElementById('senderInput');
  const receiverInput = document.getElementById('receiverInput');
  const customMessageInput = document.getElementById('customMessageInput');

  // Initialize Text
  function updateDisplays() {
    senderDisplayName.textContent = state.sender;
    receiverDisplayName.textContent = state.receiver;
    loveQuestion.textContent = `${state.message} ♡`;
    senderInput.value = state.sender;
    receiverInput.value = state.receiver;
    customMessageInput.value = state.message;
  }
  updateDisplays();


  // ==========================================
  // 2. WEB AUDIO SYNTHESIZER (Pure Web Audio)
  // ==========================================
  let audioCtx = null;

  function initAudio() {
    if (!audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        audioCtx = new AudioContext();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }

  // Play tone helper
  function playTone(freq, type, duration, startTime = 0, gainVal = 0.15) {
    if (!state.soundEnabled || !audioCtx) return;
    try {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime + startTime);
      gain.gain.setValueAtTime(gainVal, audioCtx.currentTime + startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + startTime + duration);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(audioCtx.currentTime + startTime);
      osc.stop(audioCtx.currentTime + startTime + duration);
    } catch (e) {
      console.warn('Audio play error:', e);
    }
  }

  // Bow Shoot Twang Sound
  function playBowSound() {
    if (!state.soundEnabled || !audioCtx) return;
    try {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(380, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(140, audioCtx.currentTime + 0.22);
      gain.gain.setValueAtTime(0.35, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.22);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.22);
    } catch (e) {}
  }

  // Heart Hit / Pop Sparkle Sound
  function playHitSound() {
    if (!state.soundEnabled || !audioCtx) return;
    const chords = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    chords.forEach((note, idx) => {
      playTone(note, 'sine', 0.4, idx * 0.06, 0.2);
    });
  }

  // Runaway NO squeak
  function playDodgedSound() {
    if (!state.soundEnabled || !audioCtx) return;
    playTone(587.33, 'sine', 0.1, 0, 0.15); // D5
    playTone(880.00, 'sine', 0.12, 0.08, 0.12); // A5
  }

  // YES Celebration Victory Chime Fanfare
  function playYesFanfare() {
    if (!state.soundEnabled || !audioCtx) return;
    // Cheerful romantic arpeggio melody
    const notes = [
      { f: 523.25, d: 0.15, t: 0 },       // C5
      { f: 659.25, d: 0.15, t: 0.12 },    // E5
      { f: 783.99, d: 0.15, t: 0.24 },    // G5
      { f: 1046.50, d: 0.35, t: 0.36 },   // C6
      { f: 880.00, d: 0.2, t: 0.6 },      // A5
      { f: 1046.50, d: 0.6, t: 0.8 }      // C6 long
    ];
    notes.forEach(n => {
      playTone(n.f, 'triangle', n.d, n.t, 0.25);
    });

    // Start background gentle romantic loop
    startRomanticBGM();
  }

  // Gentle Lo-Fi Romantic Music Generator (8-bit style)
  let bgmTimer = null;
  function startRomanticBGM() {
    if (!state.soundEnabled || !audioCtx || bgmTimer) return;
    const progression = [
      [261.63, 329.63, 392.00], // C
      [220.00, 261.63, 329.63], // Am
      [174.61, 220.00, 261.63], // F
      [196.00, 246.94, 293.66]  // G
    ];
    let step = 0;
    bgmTimer = setInterval(() => {
      if (!state.soundEnabled) {
        clearInterval(bgmTimer);
        bgmTimer = null;
        return;
      }
      const chord = progression[step % progression.length];
      chord.forEach((freq, idx) => {
        playTone(freq * 1.5, 'sine', 0.7, idx * 0.15, 0.05);
      });
      step++;
    }, 1800);
  }

  function toggleAudio() {
    initAudio();
    state.soundEnabled = !state.soundEnabled;
    if (state.soundEnabled) {
      audioIcon.textContent = '🔊';
      audioText.textContent = 'Music: ON';
      audioToggleBtn.style.borderColor = 'var(--pink-deep)';
      if (state.isCatHappy) startRomanticBGM();
      playTone(523.25, 'sine', 0.2, 0, 0.2);
    } else {
      audioIcon.textContent = '🔇';
      audioText.textContent = 'Music: OFF';
      audioToggleBtn.style.borderColor = 'var(--pink-accent)';
      if (bgmTimer) {
        clearInterval(bgmTimer);
        bgmTimer = null;
      }
    }
  }
  audioToggleBtn.addEventListener('click', toggleAudio);


  // ==========================================
  // 3. PIXEL ART CAT RENDERER (Screenshots 2 & 3)
  // ==========================================
  // 16x16 pixel grid for the iconic pixel cat (matching screenshot 2)
  // 0: transparent, 1: black cat fur, 2: white eye, 3: red heart, 4: pink blush/nose
  const catNormalGrid = [
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,1,1,0,0,0,0,0,0,0,0,1,1,0,0],
    [0,1,1,1,1,0,0,0,0,0,0,1,1,1,1,0],
    [0,1,1,1,1,0,0,0,0,0,0,1,1,1,1,0],
    [0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,1,2,2,2,1,1,1,1,1,1,2,2,2,1,1],
    [1,1,2,1,2,1,1,1,1,1,1,2,1,2,1,1],
    [1,1,2,2,2,1,1,1,1,1,1,2,2,2,1,1],
    [1,1,1,1,1,1,1,4,4,1,1,1,1,1,1,1],
    [0,1,1,1,3,3,1,1,1,1,3,3,1,1,1,0],
    [0,1,1,3,3,3,3,1,1,3,3,3,3,1,1,0],
    [0,0,1,3,3,3,3,3,3,3,3,3,3,1,0,0],
    [0,0,1,1,3,3,3,3,3,3,3,3,1,1,0,0],
    [0,0,0,1,1,3,3,3,3,3,3,1,1,0,0,0],
    [0,0,0,0,0,1,3,3,3,3,1,0,0,0,0,0]
  ];

  // When YES is clicked: Cat has happy closed squint eyes (> <) (matching screenshot 3)
  const catHappyGrid = [
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,1,1,0,0,0,0,0,0,0,0,1,1,0,0],
    [0,1,1,1,1,0,0,0,0,0,0,1,1,1,1,0],
    [0,1,1,1,1,0,0,0,0,0,0,1,1,1,1,0],
    [0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,1,2,1,1,1,1,1,1,1,1,1,1,2,1,1],
    [1,1,1,2,1,1,1,1,1,1,1,1,2,1,1,1],
    [1,1,2,1,1,1,1,4,4,1,1,1,1,2,1,1],
    [1,1,4,4,1,1,1,4,4,1,1,1,4,4,1,1],
    [0,1,1,1,3,3,1,1,1,1,3,3,1,1,1,0],
    [0,1,1,3,3,3,3,1,1,3,3,3,3,1,1,0],
    [0,0,1,3,3,3,3,3,3,3,3,3,3,1,0,0],
    [0,0,1,1,3,3,3,3,3,3,3,3,1,1,0,0],
    [0,0,0,1,1,3,3,3,3,3,3,1,1,0,0,0],
    [0,0,0,0,0,1,3,3,3,3,1,0,0,0,0,0]
  ];

  const colorPalette = {
    0: 'transparent',
    1: '#1b1b22', // Black cat fur
    2: '#ffffff', // White eyes
    3: '#e62446', // Vibrant red pixel heart
    4: '#ff8da1'  // Pink blush / nose
  };

  function drawPixelCat(isHappy = false) {
    if (!pixelCatCanvas) return;
    const ctx = pixelCatCanvas.getContext('2d');
    const grid = isHappy ? catHappyGrid : catNormalGrid;
    const pixelSize = pixelCatCanvas.width / 16;

    ctx.clearRect(0, 0, pixelCatCanvas.width, pixelCatCanvas.height);
    ctx.imageSmoothingEnabled = false;

    for (let r = 0; r < 16; r++) {
      for (let c = 0; c < 16; c++) {
        const val = grid[r][c];
        if (val !== 0) {
          ctx.fillStyle = colorPalette[val];
          ctx.fillRect(c * pixelSize, r * pixelSize, pixelSize, pixelSize);
        }
      }
    }
  }

  // Initial draw
  drawPixelCat(false);


  // ==========================================
  // 4. AMBIENT FLOATING HEARTS BACKGROUND
  // ==========================================
  const heartCanvas = document.getElementById('heartCanvas');
  const hCtx = heartCanvas.getContext('2d');
  let hearts = [];

  function resizeHeartCanvas() {
    heartCanvas.width = window.innerWidth;
    heartCanvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resizeHeartCanvas);
  resizeHeartCanvas();

  class HeartParticle {
    constructor() {
      this.reset(true);
    }
    reset(initial = false) {
      this.x = Math.random() * heartCanvas.width;
      this.y = initial ? Math.random() * heartCanvas.height : heartCanvas.height + 20;
      this.size = Math.random() * 8 + 6;
      this.speedY = Math.random() * 0.8 + 0.4;
      this.speedX = (Math.random() - 0.5) * 0.4;
      this.opacity = Math.random() * 0.45 + 0.2;
      this.color = Math.random() > 0.4 ? '#ff758f' : '#ffb3c1';
      this.wobble = Math.random() * Math.PI * 2;
    }
    update() {
      this.y -= this.speedY;
      this.wobble += 0.02;
      this.x += Math.sin(this.wobble) * 0.5 + this.speedX;
      if (this.y < -20) this.reset();
    }
    draw() {
      hCtx.save();
      hCtx.globalAlpha = this.opacity;
      hCtx.fillStyle = this.color;
      hCtx.translate(this.x, this.y);
      hCtx.beginPath();
      const s = this.size / 2;
      hCtx.moveTo(0, s / 2);
      hCtx.bezierCurveTo(-s, -s / 2, -s * 1.5, s / 3, 0, s * 1.5);
      hCtx.bezierCurveTo(s * 1.5, s / 3, s, -s / 2, 0, s / 2);
      hCtx.fill();
      hCtx.restore();
    }
  }

  for (let i = 0; i < 28; i++) {
    hearts.push(new HeartParticle());
  }

  function animateHearts() {
    hCtx.clearRect(0, 0, heartCanvas.width, heartCanvas.height);
    hearts.forEach(h => {
      h.update();
      h.draw();
    });
    requestAnimationFrame(animateHearts);
  }
  animateHearts();


  // ==========================================
  // 5. CUPID'S BOW SHOOTING INTERACTION
  // ==========================================
  function shootCupidBow() {
    if (state.isShooting || state.hasOpened) return;
    state.isShooting = true;

    initAudio();
    playBowSound();

    // Pull string back visual
    bowString.setAttribute('d', 'M 28 85 Q 80 115 132 85');
    loadedArrow.style.transform = 'translateY(12px)';

    setTimeout(() => {
      // Snap string forward
      bowString.setAttribute('d', 'M 28 85 Q 80 85 132 85');
      loadedArrow.style.opacity = '0';

      // Launch Flying Arrow towards the envelope's heart seal
      const sealRect = heartSeal.getBoundingClientRect();
      const bowRect = bowContainer.getBoundingClientRect();

      const deltaX = (sealRect.left + sealRect.width / 2) - (bowRect.left + bowRect.width / 2);
      const deltaY = (sealRect.top + sealRect.height / 2) - (bowRect.top + bowRect.height / 2);

      flyingArrow.style.opacity = '1';
      flyingArrow.style.transition = 'transform 0.45s cubic-bezier(0.25, 0.46, 0.45, 0.94), opacity 0.1s';
      flyingArrow.style.transform = `translate(calc(-50% + ${deltaX}px), ${deltaY + 20}px) scale(0.9)`;

      setTimeout(() => {
        // Arrow Hit Envelope!
        playHitSound();
        createSparkles(sealRect.left + sealRect.width / 2, sealRect.top + sealRect.height / 2);
        
        envelope.classList.add('hit');
        flyingArrow.style.opacity = '0';

        setTimeout(() => {
          // Open Envelope Flap & reveal letter
          envelope.classList.add('open');

          setTimeout(() => {
            // Transition smoothly to Scene 2 (Retro Love Window)
            transitionToWindowScene();
          }, 950);

        }, 400);

      }, 420);

    }, 160);
  }

  // Click & Touch events for the Bow
  bowContainer.addEventListener('click', shootCupidBow);
  heartSeal.addEventListener('click', shootCupidBow);

  // Transition from Scene 1 to Scene 2
  function transitionToWindowScene() {
    state.hasOpened = true;
    sceneEnvelope.classList.remove('active');

    setTimeout(() => {
      sceneWindow.classList.add('active');
      drawPixelCat(false);
    }, 300);
  }


  // Sparkles Particle Effect when Arrow hits Heart
  function createSparkles(x, y) {
    for (let i = 0; i < 16; i++) {
      const spark = document.createElement('div');
      spark.className = 'spark-particle';
      spark.style.position = 'fixed';
      spark.style.left = `${x}px`;
      spark.style.top = `${y}px`;
      spark.style.width = '8px';
      spark.style.height = '8px';
      spark.style.borderRadius = '50%';
      spark.style.backgroundColor = i % 2 === 0 ? '#ff3b5c' : '#ffb703';
      spark.style.zIndex = '999';
      spark.style.pointerEvents = 'none';

      const angle = (Math.PI * 2 * i) / 16;
      const dist = Math.random() * 60 + 30;
      const targetX = Math.cos(angle) * dist;
      const targetY = Math.sin(angle) * dist;

      spark.style.transition = 'all 0.5s ease-out';
      document.body.appendChild(spark);

      requestAnimationFrame(() => {
        spark.style.transform = `translate(${targetX}px, ${targetY}px) scale(0)`;
        spark.style.opacity = '0';
      });

      setTimeout(() => spark.remove(), 550);
    }
  }


  // ==========================================
  // 6. EVASIVE "NO" BUTTON LOGIC (Screenshot 2)
  // ==========================================
  function moveNoButton() {
    state.noEscapeCount++;
    initAudio();
    playDodgedSound();

    // Change text to funny remarks
    const phraseIndex = state.noEscapeCount % noPhrases.length;
    btnNo.textContent = noPhrases[phraseIndex];

    // Make the YES button grow larger & more inviting each time
    const newScale = Math.min(1 + state.noEscapeCount * 0.08, 1.6);
    btnYes.style.transform = `scale(${newScale})`;

    // Get boundaries of the gingham window content
    const windowContent = document.querySelector('.window-content');
    const contentRect = windowContent.getBoundingClientRect();
    const btnRect = btnNo.getBoundingClientRect();

    // Ensure button stays well within the visible gingham box
    const padding = 12;
    const maxX = contentRect.width - btnRect.width - padding;
    const maxY = contentRect.height - btnRect.height - padding;

    // Pick a new position (away from the center bottom where YES sits)
    let randomX = Math.floor(Math.random() * (maxX - padding)) + padding;
    let randomY = Math.floor(Math.random() * (maxY - 40)) + 40;

    btnNo.style.position = 'absolute';
    btnNo.style.left = `${randomX}px`;
    btnNo.style.top = `${randomY}px`;
  }

  // Trigger dodge on hover / touch / pointer down
  btnNo.addEventListener('mouseenter', moveNoButton);
  btnNo.addEventListener('touchstart', (e) => {
    e.preventDefault();
    moveNoButton();
  }, { passive: false });
  btnNo.addEventListener('click', (e) => {
    e.preventDefault();
    moveNoButton();
  });


  // ==========================================
  // 7. "YES" BUTTON CELEBRATION (Screenshot 3)
  // ==========================================
  function handleYesClick() {
    state.isCatHappy = true;
    initAudio();
    playYesFanfare();

    // 1. Update Love Question text to: "Yayyy! I love you ♡"
    loveQuestion.textContent = 'Yayyy! I love you ♡';
    loveQuestion.style.color = 'var(--pink-deep)';

    // 2. Transform Cat to happy squint eyes & show floating heart
    drawPixelCat(true);
    heartFloater.classList.remove('hidden');

    // 3. Hide proposal buttons, show success content (Screenshot 3)
    proposalActions.classList.add('hidden');
    btnNo.style.display = 'none';
    successContent.classList.remove('hidden');

    // 4. Massive Heart Confetti Shower
    launchHeartConfetti();
  }

  btnYes.addEventListener('click', handleYesClick);


  // Custom Heart & Confetti Fireworks
  function launchHeartConfetti() {
    const colors = ['#ff3b5c', '#ff758f', '#ff8da1', '#ffd166', '#06d6a0', '#2563eb'];
    for (let i = 0; i < 90; i++) {
      setTimeout(() => {
        const conf = document.createElement('div');
        conf.className = 'confetti-heart';
        conf.innerHTML = Math.random() > 0.4 ? '♥' : '✨';
        conf.style.position = 'fixed';
        conf.style.left = `${Math.random() * 95 + 2.5}vw`;
        conf.style.top = '-20px';
        conf.style.fontSize = `${Math.random() * 20 + 14}px`;
        conf.style.color = colors[Math.floor(Math.random() * colors.length)];
        conf.style.zIndex = '1000';
        conf.style.pointerEvents = 'none';
        conf.style.transition = `top ${Math.random() * 2.5 + 2}s cubic-bezier(0.25, 0.46, 0.45, 0.94), transform ${Math.random() * 2 + 1.5}s ease-in-out, opacity 1s`;
        
        document.body.appendChild(conf);

        requestAnimationFrame(() => {
          conf.style.top = '105vh';
          conf.style.transform = `rotate(${Math.random() * 720 - 360}deg) translateX(${Math.random() * 60 - 30}px)`;
        });

        setTimeout(() => conf.remove(), 4200);
      }, i * 35);
    }
  }


  // Replay Button: Reset back to Scene 1
  replayBtn.addEventListener('click', () => {
    state.hasOpened = false;
    state.isShooting = false;
    state.isCatHappy = false;
    state.noEscapeCount = 0;

    // Reset NO button
    btnNo.style.position = '';
    btnNo.style.left = '';
    btnNo.style.top = '';
    btnNo.style.display = 'inline-block';
    btnNo.textContent = 'NO';
    btnYes.style.transform = 'scale(1)';

    // Reset Scenes
    sceneWindow.classList.remove('active');
    proposalActions.classList.remove('hidden');
    successContent.classList.add('hidden');
    heartFloater.classList.add('hidden');
    loveQuestion.style.color = 'var(--text-dark)';
    updateDisplays();

    // Reset envelope
    envelope.classList.remove('hit', 'open');
    loadedArrow.style.opacity = '1';
    loadedArrow.style.transform = 'translateY(0)';
    flyingArrow.style.opacity = '0';
    flyingArrow.style.transform = 'translateX(-50%)';

    setTimeout(() => {
      sceneEnvelope.classList.add('active');
      drawPixelCat(false);
    }, 400);
  });


  // ==========================================
  // 8. CUSTOMIZATION MODAL
  // ==========================================
  editNameBtn.addEventListener('click', () => {
    customizeModal.classList.remove('hidden');
  });

  closeModalBtn.addEventListener('click', () => {
    customizeModal.classList.add('hidden');
  });

  saveNamesBtn.addEventListener('click', () => {
    state.sender = senderInput.value.trim() || 'Irfan';
    state.receiver = receiverInput.value.trim() || 'You';
    state.message = customMessageInput.value.trim() || 'Do you want to be my girlfriend?';
    updateDisplays();
    customizeModal.classList.add('hidden');
  });

  // Close modal when clicking backdrop
  customizeModal.addEventListener('click', (e) => {
    if (e.target === customizeModal) {
      customizeModal.classList.add('hidden');
    }
  });

});
