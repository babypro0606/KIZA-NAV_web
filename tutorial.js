// tutorial.js
// ============================================================================
// INTERACTIVE ONBOARDING TUTORIAL WITH MASCOT CAPTAIN FERIT (FLUENT DESIGN)
// ============================================================================

import { t, onLangChange } from './i18n.js';

let tutorialCard = null;
let tutorialPill = null;
let currentStep = 1; // 1: Jezero, 2: Route, 3: Layers & Imagery, 4: Done
let isTutorialActive = true;

const ICONS = {
    close: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`,
    arrowLeft: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>`,
    arrowRight: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>`,
    check: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`,
    astronaut: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a8 8 0 0 0-8 8c0 3.3 2 6.2 5 7.4L9 22h6l0-4.6c3-1.2 5-4.1 5-7.4a8 8 0 0 0-8-8z"></path><circle cx="12" cy="10" r="3.5"></circle></svg>`
};

/**
 * Initializes the Captain Ferit tutorial UI, styles, progress bar, and floating launcher.
 */
export function initTutorial() {
    const style = document.createElement('style');
    style.innerHTML = `
        /* Captain Ferit Fluent Tutorial Dialogue Card */
        .kiza-tutorial-card {
            position: fixed; bottom: 24px; right: 24px; width: 440px; max-width: calc(100vw - 32px);
            background: rgba(18, 22, 31, 0.88); backdrop-filter: blur(28px) saturate(180%);
            -webkit-backdrop-filter: blur(28px) saturate(180%);
            border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 16px;
            box-shadow: 0 16px 44px rgba(0, 0, 0, 0.65), 0 0 0 1px rgba(255, 255, 255, 0.06);
            display: flex; gap: 14px; padding: 16px 18px; z-index: 10001;
            color: #f8fafc; font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, 'Inter', sans-serif;
            user-select: none;
            animation: kizaTutorialSlideIn 0.28s cubic-bezier(0.16, 1, 0.3, 1);
            transition: opacity 0.22s ease, transform 0.22s ease;
        }
        @keyframes kizaTutorialSlideIn {
            from { opacity: 0; transform: translateY(18px) scale(0.96); }
            to { opacity: 1; transform: translateY(0) scale(1); }
        }

        /* Mascot avatar column */
        .kiza-tutorial-mascot {
            flex-shrink: 0; display: flex; flex-direction: column; align-items: center; justify-content: flex-start;
            gap: 7px; width: 96px;
        }
        .kiza-ferit-frame {
            width: 96px; height: 122px; border-radius: 12px; overflow: hidden; position: relative;
            border: 1px solid rgba(255, 255, 255, 0.12);
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
            background: #141822; flex-shrink: 0;
        }
        .kiza-ferit-img {
            width: 100%; height: 100%; object-fit: cover; object-position: center 18%;
            display: block; transition: transform 0.35s ease;
        }
        .kiza-tutorial-card:hover .kiza-ferit-img {
            transform: scale(1.05);
        }
        .kiza-ferit-badge {
            font-family: 'JetBrains Mono', monospace; font-size: 9px; font-weight: 700;
            letter-spacing: 0.6px; color: #94a3b8;
            background: rgba(255, 255, 255, 0.04); border: 1px solid rgba(255, 255, 255, 0.08);
            border-radius: 999px; padding: 2px 7px; display: flex; align-items: center; gap: 5px;
            white-space: nowrap;
        }
        .kiza-ferit-live-dot {
            width: 6px; height: 6px; border-radius: 50%; background: #10b981;
            box-shadow: 0 0 8px #10b981; flex-shrink: 0;
            animation: kizaLiveBlink 2s infinite ease-in-out;
        }
        @keyframes kizaLiveBlink {
            0%, 100% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.45; transform: scale(0.85); }
        }

        /* Content column */
        .kiza-tutorial-body {
            flex: 1; display: flex; flex-direction: column; justify-content: space-between; gap: 9px;
            min-width: 0;
        }
        .kiza-tutorial-header {
            display: flex; justify-content: space-between; align-items: center; gap: 8px;
        }
        .kiza-tutorial-title-area {
            display: flex; align-items: center; gap: 7px; min-width: 0;
        }
        .kiza-tutorial-dot {
            width: 7px; height: 7px; border-radius: 50%; background: #e87348;
            box-shadow: 0 0 8px rgba(232, 115, 72, 0.6); flex-shrink: 0;
        }
        .kiza-tutorial-name {
            font-family: 'JetBrains Mono', monospace; font-size: 11px; font-weight: 700;
            letter-spacing: 0.8px; color: #ffb79d; text-transform: uppercase;
            white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .kiza-tutorial-header-right {
            display: flex; align-items: center; gap: 8px; flex-shrink: 0;
        }
        .kiza-tutorial-badge {
            font-family: 'JetBrains Mono', monospace; font-size: 9.5px; font-weight: 700;
            padding: 2px 8px; border-radius: 999px;
            background: rgba(232, 115, 72, 0.16); color: #ffb79d;
            border: 1px solid rgba(232, 115, 72, 0.3);
        }
        .kiza-tutorial-badge.done {
            background: rgba(16, 185, 129, 0.16); color: #6ee7b7;
            border-color: rgba(16, 185, 129, 0.35);
        }
        .kiza-tutorial-close-btn {
            background: transparent; border: 1px solid transparent;
            color: #94a3b8; font-size: 11px; width: 22px; height: 22px; border-radius: 6px;
            display: flex; align-items: center; justify-content: center; cursor: pointer;
            transition: all 0.16s ease; padding: 0; line-height: 1;
        }
        .kiza-tutorial-close-btn:hover {
            background: rgba(255, 255, 255, 0.1); color: #fff;
        }

        /* 3-Step Interactive Progress Track */
        .kiza-tutorial-progress-track {
            display: flex; align-items: center; gap: 6px; padding: 2px 0 3px 0;
        }
        .kiza-prog-seg {
            flex: 1; display: flex; align-items: center; gap: 6px; padding: 5px 8px;
            background: rgba(255, 255, 255, 0.04); border: 1px solid rgba(255, 255, 255, 0.08);
            border-radius: 8px; cursor: pointer; transition: all 0.18s ease;
        }
        .kiza-prog-seg:hover {
            background: rgba(255, 255, 255, 0.08); border-color: rgba(255, 255, 255, 0.16);
        }
        .kiza-prog-seg.active {
            background: rgba(232, 115, 72, 0.14); border-color: rgba(232, 115, 72, 0.45);
        }
        .kiza-prog-seg.completed {
            background: rgba(16, 185, 129, 0.12); border-color: rgba(16, 185, 129, 0.3);
        }
        .kiza-prog-num {
            width: 16px; height: 16px; border-radius: 50%; display: flex; align-items: center;
            justify-content: center; font-size: 9px; font-weight: 700;
            font-family: 'JetBrains Mono', monospace; flex-shrink: 0;
            background: rgba(255, 255, 255, 0.08); color: #94a3b8;
        }
        .kiza-prog-seg.active .kiza-prog-num {
            background: #e87348; color: #fff; box-shadow: 0 0 8px rgba(232, 115, 72, 0.6);
        }
        .kiza-prog-seg.completed .kiza-prog-num {
            background: #10b981; color: #fff;
        }
        .kiza-prog-label {
            font-size: 10px; font-weight: 600; color: #94a3b8; white-space: nowrap;
        }
        .kiza-prog-seg.active .kiza-prog-label {
            color: #ffb79d;
        }
        .kiza-prog-seg.completed .kiza-prog-label {
            color: #a7f3d0;
        }

        .kiza-tutorial-text {
            font-size: 12.5px; line-height: 1.55; color: #d8dee9; min-height: 48px;
        }
        .kiza-tutorial-text b {
            color: #ffffff; font-weight: 600;
        }

        .kiza-tutorial-footer {
            display: flex; justify-content: space-between; align-items: center; gap: 8px;
            padding-top: 8px; border-top: 1px solid rgba(255, 255, 255, 0.08); margin-top: 2px;
        }
        .kiza-tutorial-footer-left, .kiza-tutorial-footer-right {
            display: flex; align-items: center; gap: 6px;
        }
        .kiza-tutorial-btn-skip {
            background: transparent; border: 1px solid transparent; color: #94a3b8;
            font-size: 11.5px; font-weight: 500; cursor: pointer; padding: 6px 10px; border-radius: 8px;
            transition: color 0.15s, background 0.15s; font-family: inherit;
        }
        .kiza-tutorial-btn-skip:hover {
            color: #ffffff; background: rgba(255, 255, 255, 0.08);
        }
        .kiza-tutorial-btn-nav {
            background: rgba(255, 255, 255, 0.05); color: #cbd5e1;
            border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 8px;
            font-size: 12px; font-weight: 500; padding: 6px 13px; cursor: pointer;
            transition: all 0.16s ease; font-family: inherit;
            display: inline-flex; align-items: center; gap: 6px;
        }
        .kiza-tutorial-btn-nav:hover {
            background: rgba(255, 255, 255, 0.1); color: #fff; border-color: rgba(255, 255, 255, 0.16);
        }
        .kiza-tutorial-btn-nav.primary {
            background: rgba(232, 115, 72, 0.16); color: #ffb79d;
            border-color: rgba(232, 115, 72, 0.35); font-weight: 600;
        }
        .kiza-tutorial-btn-nav.primary:hover {
            background: rgba(232, 115, 72, 0.28); color: #fff; border-color: rgba(232, 115, 72, 0.55);
        }
        .kiza-tutorial-btn-finish {
            background: rgba(16, 185, 129, 0.2); color: #6ee7b7;
            border: 1px solid rgba(16, 185, 129, 0.45); border-radius: 8px;
            font-size: 12px; font-weight: 600; padding: 6px 15px; cursor: pointer;
            transition: all 0.16s ease; font-family: inherit;
            display: inline-flex; align-items: center; gap: 6px;
        }
        .kiza-tutorial-btn-finish:hover {
            background: rgba(16, 185, 129, 0.32); color: #fff; border-color: rgba(16, 185, 129, 0.65);
        }

        /* Pulsing button highlight for guided tutorial targets */
        .kiza-tutorial-highlight {
            position: relative !important;
            z-index: 550 !important;
            outline: 2px solid #e87348 !important;
            box-shadow: 0 0 0 0 rgba(232, 115, 72, 0.85), 0 0 20px rgba(232, 115, 72, 0.6) !important;
            animation: kizaTutorialPulse 1.6s infinite ease-in-out !important;
        }
        @keyframes kizaTutorialPulse {
            0% {
                box-shadow: 0 0 0 0 rgba(232, 115, 72, 0.85), 0 0 14px rgba(232, 115, 72, 0.5);
            }
            70% {
                box-shadow: 0 0 0 12px rgba(232, 115, 72, 0), 0 0 26px rgba(232, 115, 72, 0.2);
            }
            100% {
                box-shadow: 0 0 0 0 rgba(232, 115, 72, 0), 0 0 14px rgba(232, 115, 72, 0);
            }
        }

        /* Floating quick launcher pill button (visible whenever tutorial is closed/skipped) */
        .kiza-tutorial-floating-pill {
            position: fixed; bottom: 24px; right: 24px; z-index: 9999;
            display: flex; align-items: center; gap: 10px;
            padding: 6px 14px 6px 6px;
            background: rgba(18, 22, 31, 0.88);
            backdrop-filter: blur(28px) saturate(180%);
            -webkit-backdrop-filter: blur(28px) saturate(180%);
            border: 1px solid rgba(255, 255, 255, 0.08);
            border-radius: 999px;
            box-shadow: 0 12px 36px rgba(0, 0, 0, 0.55);
            color: #f8fafc; font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, 'Inter', sans-serif;
            cursor: pointer; user-select: none;
            transition: all 0.22s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .kiza-tutorial-floating-pill:hover {
            transform: translateY(-2px);
            background: rgba(26, 32, 44, 0.94);
            border-color: rgba(255, 255, 255, 0.18);
            box-shadow: 0 16px 44px rgba(0, 0, 0, 0.65);
        }
        .kiza-pill-avatar {
            width: 36px; height: 36px; border-radius: 50%; overflow: hidden; position: relative;
            border: 1.5px solid rgba(232, 115, 72, 0.5); flex-shrink: 0;
            background: #141722;
        }
        .kiza-pill-avatar img {
            width: 100%; height: 100%; object-fit: cover; object-position: center 20%;
        }
        .kiza-pill-dot {
            position: absolute; bottom: 0; right: 0; width: 8px; height: 8px;
            border-radius: 50%; background: #10b981; border: 1.5px solid #10141e;
        }
        .kiza-pill-content {
            display: flex; flex-direction: column; align-items: flex-start; gap: 1px;
        }
        .kiza-pill-title {
            font-family: 'JetBrains Mono', monospace; font-size: 11.5px; font-weight: 700;
            color: #ffb79d; letter-spacing: 0.3px; line-height: 1.2;
        }
        .kiza-pill-sub {
            font-size: 10px; color: #94a3b8; line-height: 1.2;
        }
        .kiza-pill-badge {
            font-size: 9.5px; font-weight: 600; color: #ffb79d;
            background: rgba(232, 115, 72, 0.14); border: 1px solid rgba(232, 115, 72, 0.28);
            padding: 3px 8px; border-radius: 999px;
            margin-left: 2px;
        }
    `;
    document.head.appendChild(style);

    // Build the dialogue card in the DOM
    tutorialCard = document.createElement('div');
    tutorialCard.id = 'kizaTutorialCard';
    tutorialCard.className = 'kiza-tutorial-card';
    tutorialCard.innerHTML = `
        <div class="kiza-tutorial-mascot">
            <div class="kiza-ferit-frame">
                <img src="./captain_ferit.jpg" alt="Captain Ferit" class="kiza-ferit-img" />
            </div>
            <div class="kiza-ferit-badge">
                <span class="kiza-ferit-live-dot"></span>COMMS
            </div>
        </div>
        <div class="kiza-tutorial-body">
            <div class="kiza-tutorial-header">
                <div class="kiza-tutorial-title-area">
                    <span class="kiza-tutorial-dot"></span>
                    <span class="kiza-tutorial-name" id="kizaTutorialName">${t('tutorialTitle')}</span>
                </div>
                <div class="kiza-tutorial-header-right">
                    <span class="kiza-tutorial-badge" id="kizaTutorialBadge">STEP 1/3</span>
                    <button class="kiza-tutorial-close-btn" id="kizaTutorialCloseBtn" title="${t('tutorialSkip')}">
                        ${ICONS.close}
                    </button>
                </div>
            </div>

            <!-- 3-Segment Step Progress Bar -->
            <div class="kiza-tutorial-progress-track" id="kizaTutorialProgressTrack">
                <div class="kiza-prog-seg active" data-step="1">
                    <span class="kiza-prog-num" id="kizaProgNum1">1</span>
                    <span class="kiza-prog-label" id="kizaProgLabel1">${t('tutorialStep1Title')}</span>
                </div>
                <div class="kiza-prog-seg" data-step="2">
                    <span class="kiza-prog-num" id="kizaProgNum2">2</span>
                    <span class="kiza-prog-label" id="kizaProgLabel2">${t('tutorialStep2Title')}</span>
                </div>
                <div class="kiza-prog-seg" data-step="3">
                    <span class="kiza-prog-num" id="kizaProgNum3">3</span>
                    <span class="kiza-prog-label" id="kizaProgLabel3">${t('tutorialStep3Title')}</span>
                </div>
            </div>

            <div class="kiza-tutorial-text" id="kizaTutorialText"></div>

            <div class="kiza-tutorial-footer">
                <div class="kiza-tutorial-footer-left">
                    <button class="kiza-tutorial-btn-skip" id="kizaTutorialSkipBtn">${t('tutorialSkip')}</button>
                    <button class="kiza-tutorial-btn-nav" id="kizaTutorialBackBtn" style="display:none;">
                        ${ICONS.arrowLeft}
                        <span id="kizaTutorialBackText">${t('tutorialBack')}</span>
                    </button>
                </div>
                <div class="kiza-tutorial-footer-right">
                    <button class="kiza-tutorial-btn-nav primary" id="kizaTutorialNextBtn">
                        <span id="kizaTutorialNextText">${t('tutorialNext')}</span>
                        ${ICONS.arrowRight}
                    </button>
                    <button class="kiza-tutorial-btn-finish" id="kizaTutorialFinishBtn" style="display:none;">
                        ${ICONS.check}
                        <span id="kizaTutorialFinishText">${t('tutorialFinish')}</span>
                    </button>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(tutorialCard);

    // Build the persistent floating launcher pill (shown whenever the tutorial card is dismissed)
    tutorialPill = document.createElement('div');
    tutorialPill.id = 'kizaTutorialFloatingPill';
    tutorialPill.className = 'kiza-tutorial-floating-pill';
    tutorialPill.style.display = 'none';
    tutorialPill.innerHTML = `
        <div class="kiza-pill-avatar">
            <img src="./captain_ferit.jpg" alt="Captain Ferit" />
            <span class="kiza-pill-dot"></span>
        </div>
        <div class="kiza-pill-content">
            <span class="kiza-pill-title">Captain Ferit</span>
            <span class="kiza-pill-sub" id="kizaPillSub">${t('tutorialFloatingLabel')}</span>
        </div>
        <span class="kiza-pill-badge">${t('tutorialReplay')}</span>
    `;
    document.body.appendChild(tutorialPill);

    // Clicking the floating pill reopens the tutorial card
    tutorialPill.addEventListener('click', () => {
        openTutorial(currentStep <= 3 ? currentStep : 1);
    });

    // Bind Close & Skip buttons
    document.getElementById('kizaTutorialCloseBtn').addEventListener('click', () => {
        dismissTutorial();
    });

    document.getElementById('kizaTutorialSkipBtn').addEventListener('click', () => {
        dismissTutorial();
    });

    document.getElementById('kizaTutorialFinishBtn').addEventListener('click', () => {
        dismissTutorial();
    });

    // Bind Back & Next buttons
    document.getElementById('kizaTutorialBackBtn').addEventListener('click', () => {
        if (currentStep > 1) setTutorialStep(currentStep - 1);
    });

    document.getElementById('kizaTutorialNextBtn').addEventListener('click', () => {
        if (currentStep < 4) setTutorialStep(currentStep + 1);
    });

    // Interactive clicking directly on progress bar segments
    document.querySelectorAll('.kiza-prog-seg').forEach(seg => {
        seg.addEventListener('click', () => {
            const targetStep = parseInt(seg.dataset.step, 10);
            if (!isNaN(targetStep)) setTutorialStep(targetStep);
        });
    });

    // Update text and progress indicators dynamically on language changes
    onLangChange(() => {
        renderTutorialStep();
        document.getElementById('kizaTutorialSkipBtn').textContent = t('tutorialSkip');
        const finishText = document.getElementById('kizaTutorialFinishText');
        if (finishText) finishText.textContent = t('tutorialFinish');
        const backText = document.getElementById('kizaTutorialBackText');
        if (backText) backText.textContent = t('tutorialBack');
        const nextText = document.getElementById('kizaTutorialNextText');
        if (nextText) nextText.textContent = t('tutorialNext');
        document.getElementById('kizaTutorialCloseBtn').title = t('tutorialSkip');
        document.getElementById('kizaProgLabel1').textContent = t('tutorialStep1Title');
        document.getElementById('kizaProgLabel2').textContent = t('tutorialStep2Title');
        document.getElementById('kizaProgLabel3').textContent = t('tutorialStep3Title');
        const pillSub = document.getElementById('kizaPillSub');
        if (pillSub) pillSub.textContent = t('tutorialFloatingLabel');
        const pillBadge = tutorialPill ? tutorialPill.querySelector('.kiza-pill-badge') : null;
        if (pillBadge) pillBadge.textContent = t('tutorialReplay');
    });

    // Start on Step 1
    setTutorialStep(1);
}

/**
 * Sets the active tutorial step and updates highlights, dialogue, and progress track.
 * @param {number} step - Step number (1, 2, 3, 4).
 */
export function setTutorialStep(step) {
    currentStep = step;
    isTutorialActive = true;

    if (tutorialCard) tutorialCard.style.display = 'flex';
    if (tutorialPill) tutorialPill.style.display = 'none';

    clearAllTutorialHighlights();
    renderTutorialStep();

    // Apply target highlights based on step
    if (step === 1) {
        // Highlight Jezero Crater button in Explore Mars
        const jezeroBtn = document.querySelector('[data-landmark="jezero"]');
        if (jezeroBtn) jezeroBtn.classList.add('kiza-tutorial-highlight');
    } else if (step === 3) {
        // Highlight rover and helicopter layer toggles
        const rows = document.querySelectorAll('.kiza-row');
        rows.forEach(r => r.classList.add('kiza-tutorial-highlight'));
    }
}

/**
 * Renders the localized text, badge, and step controls for the current step.
 */
function renderTutorialStep() {
    if (!tutorialCard) return;

    const nameEl = document.getElementById('kizaTutorialName');
    const badgeEl = document.getElementById('kizaTutorialBadge');
    const textEl = document.getElementById('kizaTutorialText');
    const skipBtn = document.getElementById('kizaTutorialSkipBtn');
    const backBtn = document.getElementById('kizaTutorialBackBtn');
    const nextBtn = document.getElementById('kizaTutorialNextBtn');
    const finishBtn = document.getElementById('kizaTutorialFinishBtn');

    nameEl.textContent = t('tutorialTitle');

    // Update progress track segments
    for (let s = 1; s <= 3; s++) {
        const seg = document.querySelector(`.kiza-prog-seg[data-step="${s}"]`);
        const num = document.getElementById(`kizaProgNum${s}`);
        if (!seg || !num) continue;

        if (s < currentStep) {
            seg.className = 'kiza-prog-seg completed';
            num.textContent = '✓';
        } else if (s === currentStep) {
            seg.className = 'kiza-prog-seg active';
            num.textContent = s.toString();
        } else {
            seg.className = 'kiza-prog-seg';
            num.textContent = s.toString();
        }
    }

    if (currentStep === 1) {
        badgeEl.textContent = t('tutorialStepBadge', { curr: 1 });
        badgeEl.className = 'kiza-tutorial-badge';
        textEl.innerHTML = t('tutorialStep1');
        backBtn.style.display = 'none';
        nextBtn.style.display = 'inline-flex';
        finishBtn.style.display = 'none';
    } else if (currentStep === 2) {
        badgeEl.textContent = t('tutorialStepBadge', { curr: 2 });
        badgeEl.className = 'kiza-tutorial-badge';
        textEl.innerHTML = t('tutorialStep2');
        backBtn.style.display = 'inline-flex';
        nextBtn.style.display = 'inline-flex';
        finishBtn.style.display = 'none';
    } else if (currentStep === 3) {
        badgeEl.textContent = t('tutorialStepBadge', { curr: 3 });
        badgeEl.className = 'kiza-tutorial-badge';
        textEl.innerHTML = t('tutorialStep3');
        backBtn.style.display = 'inline-flex';
        nextBtn.style.display = 'inline-flex';
        finishBtn.style.display = 'none';
    } else if (currentStep === 4) {
        badgeEl.textContent = t('tutorialStepDone');
        badgeEl.className = 'kiza-tutorial-badge done';
        textEl.innerHTML = t('tutorialStep4');
        backBtn.style.display = 'inline-flex';
        nextBtn.style.display = 'none';
        finishBtn.style.display = 'inline-flex';
    }
}

/**
 * Removes all highlight glow outlines from interactive elements.
 */
function clearAllTutorialHighlights() {
    document.querySelectorAll('.kiza-tutorial-highlight').forEach(el => {
        el.classList.remove('kiza-tutorial-highlight');
    });
}

/**
 * Dismisses/skips the tutorial card and reveals the floating launcher pill so the user can reopen anytime.
 */
export function dismissTutorial() {
    isTutorialActive = false;
    clearAllTutorialHighlights();
    if (tutorialCard) tutorialCard.style.display = 'none';
    if (tutorialPill) tutorialPill.style.display = 'flex';
}

/**
 * Opens the tutorial card at a specific step (or current step).
 * @param {number} [step] - Target step (defaults to currentStep or 1).
 */
export function openTutorial(step) {
    const target = step || (currentStep <= 3 ? currentStep : 1);
    setTutorialStep(target);
}

/**
 * Restarts the tutorial from Step 1.
 */
export function restartTutorial() {
    setTutorialStep(1);
}

/**
 * Helper to advance the tutorial when the expected action is triggered.
 * @param {number} fromStep - Expected current step before advancing.
 */
export function advanceTutorialFrom(fromStep) {
    if (!isTutorialActive) return;
    if (currentStep === fromStep) {
        setTutorialStep(fromStep + 1);
    }
}
