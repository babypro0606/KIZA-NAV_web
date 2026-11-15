// ui.js
// ============================================================================
// FLUENT DESIGN SYSTEM UI: COMMAND BAR, HAMBURGER DRAWER & MINIMALIST ICONS
// ============================================================================

import { t, getLang, setLang, onLangChange, applyTranslations, LANGUAGES, L } from './i18n.js';
import { MARS_LANDMARKS } from './constants.js';

let waypointPopupEl = null;
let currentPopupCallbacks = { onStart: null, onFinish: null };
let pinPopupEl = null;
let currentPinDeleteCallback = null;
let currentPinInfo = null;

let recenterMarsHandler = null;
let clearRouteHandler = null;
let openTutorialHandler = null;

// ============================================================================
// MINIMALIST SVG LINE ICONS (Stroke-based, zero emojis)
// ============================================================================
const ICONS = {
    menu: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>`,
    close: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`,
    planet: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#e87348" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="8"></circle><path d="M2.5 14.5c4-2 15-7 19-3"></path><path d="M5 9c2-1 9-3 14 0"></path></svg>`,
    center: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="22" y1="12" x2="18" y2="12"></line><line x1="6" y1="12" x2="2" y2="12"></line><line x1="12" y1="6" x2="12" y2="2"></line><line x1="12" y1="22" x2="12" y2="18"></line><circle cx="12" cy="12" r="3"></circle></svg>`,
    compass: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"></polygon></svg>`,
    trash: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>`,
    layers: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg>`,
    rover: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="7" width="18" height="9" rx="2"></rect><circle cx="7" cy="18" r="2.5"></circle><circle cx="17" cy="18" r="2.5"></circle><line x1="8" y1="7" x2="8" y2="3"></line><line x1="6" y1="3" x2="10" y2="3"></line><circle cx="12" cy="11.5" r="1.5"></circle></svg>`,
    heli: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="4" x2="21" y2="4"></line><line x1="12" y1="4" x2="12" y2="9"></line><ellipse cx="12" cy="13" rx="6" ry="4"></ellipse><line x1="6" y1="20" x2="18" y2="20"></line><line x1="8" y1="17" x2="6" y2="20"></line><line x1="16" y1="17" x2="18" y2="20"></line></svg>`,
    astronaut: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a8 8 0 0 0-8 8c0 3.3 2 6.2 5 7.4L9 22h6l0-4.6c3-1.2 5-4.1 5-7.4a8 8 0 0 0-8-8z"></path><circle cx="12" cy="10" r="3.5"></circle></svg>`,
    target: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"></circle><line x1="12" y1="3" x2="12" y2="7"></line><line x1="12" y1="17" x2="12" y2="21"></line><line x1="3" y1="12" x2="7" y2="12"></line><line x1="17" y1="12" x2="21" y2="12"></line></svg>`,
    mountain: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m8 3 4 8 5-5 5 15H2L8 3z"></path></svg>`,
    canyon: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 4v16M21 4v16M3 10c4 0 5 4 9 4s5-4 9-4M3 16c4 0 5 4 9 4s5-4 9-4"></path></svg>`,
    crater: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="12" cy="12" rx="9" ry="6"></ellipse><ellipse cx="12" cy="12" rx="4" ry="2.5"></ellipse></svg>`,
    polar: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="2" x2="12" y2="22"></line><line x1="2" y1="12" x2="22" y2="12"></line><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line><line x1="19.07" y1="4.93" x2="4.93" y2="19.07"></line></svg>`,
    flag: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path><line x1="4" y1="22" x2="4" y2="15"></line></svg>`,
    checkered: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"></rect><line x1="12" y1="3" x2="12" y2="21"></line><line x1="3" y1="12" x2="21" y2="12"></line></svg>`,
    warning: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>`,
    info: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`
};

function getLandmarkIcon(id) {
    switch (id) {
        case 'jezero': return ICONS.target;
        case 'olympus':
        case 'tharsis': return ICONS.mountain;
        case 'valles': return ICONS.canyon;
        case 'hellas':
        case 'gale': return ICONS.crater;
        case 'boreum':
        case 'australe': return ICONS.polar;
        default: return ICONS.compass;
    }
}

/**
 * Dynamically injects Fluent Design System styles and builds the Command Bar,
 * slide-out Navigation Drawer, resolution warning infobar, and waypoint context flyouts.
 */
export function initControlPanel() {
    const uiStyle = document.createElement('style');
    uiStyle.innerHTML = `
        :root {
            --kz-bg: rgba(18, 22, 31, 0.76);
            --kz-bg-card: rgba(255, 255, 255, 0.04);
            --kz-bg-card-hover: rgba(255, 255, 255, 0.08);
            --kz-bg-card-active: rgba(255, 255, 255, 0.12);
            --kz-border: rgba(255, 255, 255, 0.08);
            --kz-border-hover: rgba(255, 255, 255, 0.16);
            --kz-text: #f8fafc;
            --kz-muted: #94a3b8;
            --kz-subtle: #64748b;
            --kz-accent: #e87348;
            --kz-accent-glow: rgba(232, 115, 72, 0.35);
            --kz-accent-soft: rgba(232, 115, 72, 0.14);
            --kz-accent-hover: #f1875f;
            --kz-start: #10b981;
            --kz-finish: #ef4444;
            --kz-font: 'Segoe UI', -apple-system, BlinkMacSystemFont, 'Inter', sans-serif;
            --kz-mono: 'JetBrains Mono', monospace;
            --kz-blur: blur(28px) saturate(180%);
            --kz-radius-sm: 8px;
            --kz-radius: 12px;
            --kz-radius-pill: 999px;
            --kz-shadow: 0 12px 36px rgba(0, 0, 0, 0.45);
            --kz-shadow-flyout: 0 16px 44px rgba(0, 0, 0, 0.65), 0 0 0 1px rgba(255, 255, 255, 0.08);
        }

        /* Top Floating Fluent Command Bar */
        .kiza-command-bar {
            position: fixed; top: 16px; left: 16px; z-index: 500;
            display: flex; align-items: center; gap: 8px;
            padding: 6px 10px; border-radius: var(--kz-radius);
            background: var(--kz-bg); backdrop-filter: var(--kz-blur);
            -webkit-backdrop-filter: var(--kz-blur);
            border: 1px solid var(--kz-border);
            box-shadow: var(--kz-shadow);
            color: var(--kz-text); font-family: var(--kz-font);
            user-select: none; transition: all 0.2s ease;
        }

        .kiza-bar-btn {
            display: inline-flex; align-items: center; gap: 7px;
            padding: 7px 12px; border-radius: var(--kz-radius-sm);
            background: transparent; border: 1px solid transparent;
            color: var(--kz-text); font-family: var(--kz-font);
            font-size: 12.5px; font-weight: 500; cursor: pointer;
            transition: all 0.18s ease; line-height: 1;
        }
        .kiza-bar-btn:hover {
            background: var(--kz-bg-card-hover);
            border-color: var(--kz-border);
            color: #ffffff;
        }
        .kiza-bar-btn:active {
            transform: scale(0.97);
            background: var(--kz-bg-card-active);
        }
        .kiza-bar-btn.active {
            background: var(--kz-accent-soft);
            color: #ffb79d;
            border-color: rgba(232, 115, 72, 0.35);
        }

        .kiza-bar-btn.icon-only {
            padding: 8px; border-radius: var(--kz-radius-sm);
        }

        .kiza-bar-divider {
            width: 1px; height: 18px;
            background: rgba(255, 255, 255, 0.1);
            margin: 0 2px;
        }

        .kiza-bar-brand {
            display: flex; align-items: center; gap: 8px;
            font-family: var(--kz-mono); font-weight: 700; font-size: 13.5px;
            letter-spacing: 0.8px; padding-right: 4px; color: #fff;
        }

        /* Language Switcher Segmented Pill */
        .kiza-lang-pill {
            display: inline-flex; padding: 2px; gap: 2px;
            border-radius: var(--kz-radius-pill);
            background: rgba(0, 0, 0, 0.25);
            border: 1px solid var(--kz-border);
        }
        .kiza-lang-pill button {
            border: none; background: transparent; color: var(--kz-muted);
            font: 600 10.5px var(--kz-font); letter-spacing: 0.3px;
            padding: 4px 8px; border-radius: var(--kz-radius-pill);
            cursor: pointer; transition: all 0.18s ease;
        }
        .kiza-lang-pill button:hover { color: #ffffff; }
        .kiza-lang-pill button.active {
            background: var(--kz-accent-soft);
            color: #ffb79d; font-weight: 700;
        }

        /* Drawer Overlay Backdrop */
        .kiza-drawer-backdrop {
            position: fixed; top: 0; left: 0; right: 0; bottom: 0;
            background: rgba(0, 0, 0, 0.45);
            backdrop-filter: blur(4px); -webkit-backdrop-filter: blur(4px);
            z-index: 699; opacity: 0; pointer-events: none;
            transition: opacity 0.24s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .kiza-drawer-backdrop.open {
            opacity: 1; pointer-events: auto;
        }

        /* Fluent Navigation Drawer */
        .kiza-drawer {
            position: fixed; top: 0; left: 0; bottom: 0; width: 345px; max-width: calc(100vw - 32px);
            background: rgba(16, 20, 28, 0.88); backdrop-filter: var(--kz-blur);
            -webkit-backdrop-filter: var(--kz-blur);
            border-right: 1px solid var(--kz-border);
            box-shadow: 16px 0 50px rgba(0, 0, 0, 0.7);
            z-index: 700; display: flex; flex-direction: column;
            color: var(--kz-text); font-family: var(--kz-font);
            transform: translateX(-100%);
            transition: transform 0.28s cubic-bezier(0.16, 1, 0.3, 1);
            user-select: none;
        }
        .kiza-drawer.open {
            transform: translateX(0);
        }

        .kiza-drawer-header {
            display: flex; justify-content: space-between; align-items: center;
            padding: 16px 18px; border-bottom: 1px solid var(--kz-border);
            flex-shrink: 0;
        }
        .kiza-drawer-title-group {
            display: flex; align-items: center; gap: 9px;
            font-size: 13.5px; font-weight: 600; color: #fff;
        }
        .kiza-drawer-close {
            background: transparent; border: none; color: var(--kz-muted);
            padding: 6px; border-radius: var(--kz-radius-sm);
            cursor: pointer; display: flex; align-items: center; justify-content: center;
            transition: all 0.18s ease;
        }
        .kiza-drawer-close:hover {
            color: #fff; background: var(--kz-bg-card-hover);
        }

        .kiza-drawer-body {
            padding: 16px; overflow-y: auto; display: flex; flex-direction: column; gap: 14px;
        }
        .kiza-drawer-body::-webkit-scrollbar { width: 5px; }
        .kiza-drawer-body::-webkit-scrollbar-thumb {
            background: rgba(255, 255, 255, 0.12); border-radius: 3px;
        }

        /* Section Titles */
        .kiza-section-title {
            display: flex; align-items: center; gap: 7px;
            font-size: 11px; font-weight: 600; text-transform: uppercase;
            letter-spacing: 0.9px; color: var(--kz-muted);
            margin-bottom: -4px; padding-left: 2px;
        }

        /* Landmarks Grid (Fluent cards) */
        .kiza-landmarks {
            display: grid; grid-template-columns: 1fr 1fr; gap: 8px;
        }
        .kiza-landmark {
            display: flex; flex-direction: column; align-items: flex-start; gap: 4px;
            padding: 10px 11px; text-align: left; cursor: pointer;
            background: var(--kz-bg-card); border: 1px solid var(--kz-border);
            border-radius: var(--kz-radius); color: var(--kz-text);
            font-family: var(--kz-font); transition: all 0.18s ease;
        }
        .kiza-landmark:hover {
            background: var(--kz-bg-card-hover);
            border-color: color-mix(in srgb, var(--lm-color) 55%, transparent);
            transform: translateY(-1.5px);
            box-shadow: 0 4px 14px rgba(0, 0, 0, 0.35);
        }
        .kiza-landmark:active { transform: translateY(0); }
        .kiza-landmark-name {
            display: flex; align-items: center; gap: 7px;
            font-size: 12px; font-weight: 600; color: #fff;
        }
        .kiza-landmark-icon {
            display: flex; align-items: center; justify-content: center;
            color: var(--lm-color); flex-shrink: 0;
        }
        .kiza-landmark-sub {
            font-size: 10px; color: var(--kz-muted); line-height: 1.25;
            padding-left: 20px;
        }

        /* Fluent Layer Row Component */
        .kiza-row {
            display: flex; justify-content: space-between; align-items: center;
            padding: 10px 13px; background: var(--kz-bg-card);
            border: 1px solid var(--kz-border); border-radius: var(--kz-radius);
            font-size: 12.5px; font-weight: 500; transition: background 0.18s ease;
        }
        .kiza-row:hover { background: var(--kz-bg-card-hover); }
        .kiza-row-left {
            display: flex; align-items: center; gap: 9px; color: #fff;
        }

        /* Fluent iOS/WinUI Switch */
        .kiza-switch {
            position: relative; display: inline-block; width: 38px; height: 20px;
            flex-shrink: 0;
        }
        .kiza-switch input { opacity: 0; width: 0; height: 0; }
        .kiza-slider {
            position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0;
            background-color: rgba(255, 255, 255, 0.14); transition: 0.2s cubic-bezier(0.16, 1, 0.3, 1);
            border-radius: 20px; border: 1px solid rgba(255, 255, 255, 0.1);
        }
        .kiza-slider:before {
            position: absolute; content: ""; height: 14px; width: 14px; left: 2px; bottom: 2px;
            background-color: #ffffff; transition: 0.2s cubic-bezier(0.16, 1, 0.3, 1);
            border-radius: 50%; box-shadow: 0 1px 4px rgba(0, 0, 0, 0.4);
        }
        input:checked + .kiza-slider {
            background-color: var(--kz-accent); border-color: var(--kz-accent);
        }
        input:checked + .kiza-slider:before {
            transform: translateX(18px);
        }

        /* Action Buttons */
        .kiza-btn {
            display: inline-flex; align-items: center; justify-content: center; gap: 8px;
            width: 100%; padding: 10px 14px;
            background: var(--kz-accent-soft); color: #ffb79d;
            border: 1px solid rgba(232, 115, 72, 0.3); border-radius: var(--kz-radius);
            font-weight: 600; font-size: 12.5px; cursor: pointer;
            transition: all 0.18s ease; font-family: var(--kz-font);
        }
        .kiza-btn:hover {
            background: rgba(232, 115, 72, 0.26); color: #ffffff;
            border-color: rgba(232, 115, 72, 0.5);
        }
        .kiza-btn:active { transform: scale(0.98); }

        .kiza-btn-secondary {
            background: var(--kz-bg-card); color: #cbd5e1;
            border: 1px solid var(--kz-border);
        }
        .kiza-btn-secondary:hover {
            background: var(--kz-bg-card-hover); color: #fff;
            border-color: var(--kz-border-hover);
        }

        /* Fluent Hint Card */
        .kiza-hint-card {
            display: flex; gap: 9px; padding: 12px 13px;
            background: rgba(255, 255, 255, 0.03); border: 1px solid var(--kz-border);
            border-radius: var(--kz-radius); font-size: 11px; color: var(--kz-muted);
            line-height: 1.5;
        }
        .kiza-hint-card b { color: #e2e8f0; font-weight: 600; }
        .kiza-hint-icon {
            color: var(--kz-accent); flex-shrink: 0; margin-top: 1px;
        }

        /* Bottom-left Fluent Warning Banner */
        .kiza-warning {
            position: fixed; bottom: 24px; left: 24px; max-width: 440px;
            z-index: 650; display: none; align-items: flex-start; gap: 10px;
            background: rgba(26, 20, 24, 0.92); backdrop-filter: var(--kz-blur);
            -webkit-backdrop-filter: var(--kz-blur);
            color: #ffe4e6; padding: 11px 16px; border-radius: var(--kz-radius);
            font-size: 12px; font-weight: 500; font-family: var(--kz-font); line-height: 1.45;
            border: 1px solid rgba(244, 63, 94, 0.38);
            box-shadow: 0 16px 40px rgba(0, 0, 0, 0.65), 0 0 0 1px rgba(244, 63, 94, 0.15);
            pointer-events: none; animation: kizaWarningSlideUp 0.28s cubic-bezier(0.16, 1, 0.3, 1);
        }
        @keyframes kizaWarningSlideUp {
            from { opacity: 0; transform: translateY(16px) scale(0.96); }
            to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .kiza-warning-tag { color: #f43f5e; font-weight: 700; margin-right: 4px; }

        /* Fluent Context Flyouts (Waypoint & Pin Menus) */
        .kiza-flyout {
            position: fixed; z-index: 800;
            background: rgba(18, 22, 31, 0.94);
            backdrop-filter: var(--kz-blur); -webkit-backdrop-filter: var(--kz-blur);
            border: 1px solid rgba(255, 255, 255, 0.12);
            border-radius: var(--kz-radius);
            box-shadow: var(--kz-shadow-flyout);
            padding: 7px; width: 220px;
            display: flex; flex-direction: column; gap: 6px;
            user-select: none; font-family: var(--kz-font);
            animation: kizaFlyoutIn 0.16s cubic-bezier(0.16, 1, 0.3, 1);
        }
        @keyframes kizaFlyoutIn {
            from { opacity: 0; transform: scale(0.93) translateY(-4px); }
            to { opacity: 1; transform: scale(1) translateY(0); }
        }

        .kiza-flyout-header {
            display: flex; justify-content: space-between; align-items: center;
            padding: 4px 6px 6px 6px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.08);
            font-family: var(--kz-mono); font-size: 10.5px; color: var(--kz-muted);
        }
        .kiza-flyout-badge {
            padding: 2px 7px; border-radius: var(--kz-radius-pill); font-size: 9px; font-weight: 700;
            background: rgba(232, 115, 72, 0.18); color: #ffb79d;
        }
        .kiza-flyout-badge.hirise {
            background: rgba(16, 185, 129, 0.2); color: #6ee7b7;
        }

        .kiza-flyout-btn {
            width: 100%; display: flex; align-items: center; gap: 8px;
            padding: 8px 10px; border-radius: var(--kz-radius-sm);
            background: transparent; border: 1px solid transparent;
            color: var(--kz-text); font-family: var(--kz-font);
            font-size: 12px; font-weight: 500; cursor: pointer;
            transition: all 0.16s ease;
        }
        .kiza-flyout-btn:hover {
            background: var(--kz-bg-card-hover); border-color: var(--kz-border); color: #fff;
        }
        .kiza-flyout-btn:active { transform: scale(0.98); }

        .kiza-flyout-btn.start:hover {
            background: rgba(16, 185, 129, 0.16); border-color: rgba(16, 185, 129, 0.35); color: #6ee7b7;
        }
        .kiza-flyout-btn.finish:hover {
            background: rgba(239, 68, 68, 0.16); border-color: rgba(239, 68, 68, 0.35); color: #fca5a5;
        }
        .kiza-flyout-btn.delete:hover {
            background: rgba(239, 68, 68, 0.2); border-color: rgba(239, 68, 68, 0.4); color: #fca5a5;
        }

        .kiza-pin-dot {
            width: 17px; height: 17px; border-radius: 50%;
            display: inline-flex; align-items: center; justify-content: center;
            font-family: var(--kz-mono); font-size: 9.5px; font-weight: 700; color: #fff;
            flex-shrink: 0;
        }
        .kiza-pin-dot.start {
            background: #10b981; box-shadow: 0 0 8px rgba(16, 185, 129, 0.6);
        }
        .kiza-pin-dot.finish {
            background: #ef4444; box-shadow: 0 0 8px rgba(239, 68, 68, 0.6);
        }

        .kiza-flyout-close {
            background: transparent; border: none; color: var(--kz-muted);
            padding: 3px 5px; border-radius: 4px; cursor: pointer;
            transition: all 0.15s ease; display: flex; align-items: center; justify-content: center;
        }
        .kiza-flyout-close:hover {
            color: #fff; background: rgba(255, 255, 255, 0.1);
        }
    `;
    document.head.appendChild(uiStyle);

    // ========================================================================
    // 1. TOP FLOATING FLUENT COMMAND BAR
    // ========================================================================
    const langButtons = LANGUAGES.map(l =>
        `<button data-lang="${l.code}" title="${l.label}">${l.label}</button>`).join('');

    const commandBar = document.createElement('div');
    commandBar.className = 'kiza-command-bar';
    commandBar.innerHTML = `
        <button class="kiza-bar-btn icon-only" id="kizaHamburgerBtn" title="${t('toggleMenu')}">
            ${ICONS.menu}
        </button>
        <div class="kiza-bar-brand">
            ${ICONS.planet}
            <span>KIZA-NAV</span>
        </div>
        <div class="kiza-bar-divider"></div>
        <button class="kiza-bar-btn" id="kizaRecenterBtn" title="${t('recenterMars')}">
            ${ICONS.center}
            <span data-i18n="recenterMars"></span>
        </button>
        <button class="kiza-bar-btn" id="kizaClearRouteBtn" title="${t('clearRoute')}">
            ${ICONS.trash}
            <span data-i18n="clearRoute"></span>
        </button>
        <button class="kiza-bar-btn" id="kizaBarTutorialBtn" title="${t('tutorialTitleShort')}">
            ${ICONS.astronaut}
            <span data-i18n="tutorialFloatingLabel"></span>
        </button>
        <div class="kiza-bar-divider"></div>
        <div class="kiza-lang-pill" id="kizaLangSwitch">${langButtons}</div>
    `;
    document.body.appendChild(commandBar);

    // ========================================================================
    // 2. FLUENT NAVIGATION DRAWER & BACKDROP
    // ========================================================================
    const backdrop = document.createElement('div');
    backdrop.className = 'kiza-drawer-backdrop';
    backdrop.id = 'kizaDrawerBackdrop';
    document.body.appendChild(backdrop);

    const landmarkButtons = MARS_LANDMARKS.map(lm => `
        <button class="kiza-landmark" data-landmark="${lm.id}" style="--lm-color:${lm.color};">
            <span class="kiza-landmark-name">
                <span class="kiza-landmark-icon">${getLandmarkIcon(lm.id)}</span>
                ${lm.name}
            </span>
            <span class="kiza-landmark-sub" data-landmark-sub="${lm.id}"></span>
        </button>`).join('');

    const drawer = document.createElement('div');
    drawer.className = 'kiza-drawer';
    drawer.id = 'kizaDrawer';
    drawer.innerHTML = `
        <div class="kiza-drawer-header">
            <div class="kiza-drawer-title-group">
                ${ICONS.compass}
                <span data-i18n="menuTitle"></span>
            </div>
            <button class="kiza-drawer-close" id="kizaDrawerCloseBtn" title="${t('closeMenu')}">
                ${ICONS.close}
            </button>
        </div>
        <div class="kiza-drawer-body">
            <div class="kiza-section-title">
                ${ICONS.compass}
                <span data-i18n="exploreTitle"></span>
            </div>
            <div class="kiza-landmarks">${landmarkButtons}</div>

            <div class="kiza-section-title">
                ${ICONS.layers}
                <span data-i18n="layersTitle"></span>
            </div>

            <div class="kiza-row">
                <div class="kiza-row-left">
                    <span style="color:#f5b971; display:flex;">${ICONS.rover}</span>
                    <span data-i18n="roverLayer"></span>
                </div>
                <label class="kiza-switch">
                    <input type="checkbox" id="toggleRoverCheck">
                    <span class="kiza-slider"></span>
                </label>
            </div>

            <div class="kiza-row">
                <div class="kiza-row-left">
                    <span style="color:#7cc8f0; display:flex;">${ICONS.heli}</span>
                    <span data-i18n="heliLayer"></span>
                </div>
                <label class="kiza-switch">
                    <input type="checkbox" id="toggleHeliCheck">
                    <span class="kiza-slider"></span>
                </label>
            </div>

            <div class="kiza-section-title">
                ${ICONS.trash}
                <span data-i18n="routeTitle"></span>
            </div>

            <button class="kiza-btn kiza-btn-secondary" id="kizaDrawerClearRouteBtn">
                ${ICONS.trash}
                <span data-i18n="clearRoute"></span>
            </button>

            <button class="kiza-btn kiza-btn-secondary" id="kizaPanelTutorialBtn">
                ${ICONS.astronaut}
                <span data-i18n="tutorialTitleShort"></span>
            </button>

            <div class="kiza-hint-card">
                <div class="kiza-hint-icon">${ICONS.info}</div>
                <div data-i18n-html="hint"></div>
            </div>
        </div>
    `;
    document.body.appendChild(drawer);

    // Hamburger button and backdrop interactions
    const toggleDrawer = (force) => {
        const isOpen = drawer.classList.contains('open');
        const next = (typeof force === 'boolean') ? force : !isOpen;
        drawer.classList.toggle('open', next);
        backdrop.classList.toggle('open', next);
        document.getElementById('kizaHamburgerBtn').classList.toggle('active', next);
    };

    document.getElementById('kizaHamburgerBtn').addEventListener('click', () => toggleDrawer());
    document.getElementById('kizaDrawerCloseBtn').addEventListener('click', () => toggleDrawer(false));
    backdrop.addEventListener('click', () => toggleDrawer(false));

    // Recenter Mars button
    document.getElementById('kizaRecenterBtn').addEventListener('click', () => {
        if (recenterMarsHandler) recenterMarsHandler();
    });

    // Clear Route buttons
    const triggerClearRoute = () => {
        if (clearRouteHandler) clearRouteHandler();
    };
    document.getElementById('kizaClearRouteBtn').addEventListener('click', triggerClearRoute);
    document.getElementById('kizaDrawerClearRouteBtn').addEventListener('click', () => {
        triggerClearRoute();
        toggleDrawer(false);
    });

    // Mission Guide tutorial buttons
    const triggerTutorial = () => {
        if (openTutorialHandler) openTutorialHandler();
    };
    document.getElementById('kizaBarTutorialBtn').addEventListener('click', triggerTutorial);
    document.getElementById('kizaPanelTutorialBtn').addEventListener('click', () => {
        triggerTutorial();
        toggleDrawer(false);
    });

    // Language switcher
    const langSwitch = document.getElementById('kizaLangSwitch');
    langSwitch.addEventListener('click', (e) => {
        e.stopPropagation();
        const btn = e.target.closest('button[data-lang]');
        if (btn) setLang(btn.dataset.lang);
    });

    // ========================================================================
    // 3. TOP RESOLUTION WARNING INFOBAR
    // ========================================================================
    const warningBanner = document.createElement('div');
    warningBanner.id = 'resolutionWarning';
    warningBanner.className = 'kiza-warning';
    warningBanner.innerHTML = `
        <span style="display:flex; align-items:center; color:#f43f5e;">${ICONS.warning}</span>
        <span data-i18n-html="warning"></span>
    `;
    document.body.appendChild(warningBanner);

    // ========================================================================
    // 4. WAYPOINT CONTEXT FLYOUT MENU (Long Press)
    // ========================================================================
    waypointPopupEl = document.createElement('div');
    waypointPopupEl.id = 'kizaWaypointPopup';
    waypointPopupEl.className = 'kiza-flyout';
    waypointPopupEl.style.display = 'none';
    waypointPopupEl.innerHTML = `
        <div class="kiza-flyout-header">
            <span id="kizaPopupCoords">0.00°, 0.00°</span>
            <span id="kizaPopupBadge" class="kiza-flyout-badge">MOLA</span>
        </div>
        <button class="kiza-flyout-btn start" id="kizaPopupStartBtn">
            <span class="kiza-pin-dot start">A</span>
            <span data-i18n="setStart"></span>
        </button>
        <button class="kiza-flyout-btn finish" id="kizaPopupFinishBtn">
            <span class="kiza-pin-dot finish">B</span>
            <span data-i18n="setFinish"></span>
        </button>
    `;
    document.body.appendChild(waypointPopupEl);

    // ========================================================================
    // 5. PIN ACTION FLYOUT MENU (Left Click Pin)
    // ========================================================================
    pinPopupEl = document.createElement('div');
    pinPopupEl.id = 'kizaPinPopup';
    pinPopupEl.className = 'kiza-flyout';
    pinPopupEl.style.display = 'none';
    pinPopupEl.innerHTML = `
        <div class="kiza-flyout-header">
            <div style="display:flex; align-items:center; gap:6px;">
                <span id="kizaPinPopupDot" class="kiza-pin-dot start">A</span>
                <span id="kizaPinPopupTitle" style="font-weight:700; color:#f1f5f9; font-size:11.5px; font-family:var(--kz-mono);">START (A)</span>
            </div>
            <button id="kizaPinPopupCloseBtn" class="kiza-flyout-close" title="${t('close')}">${ICONS.close}</button>
        </div>
        <div id="kizaPinPopupCoords" style="font-family:var(--kz-mono); font-size:10px; color:#94a3b8; padding: 2px 6px;">0.00°N, 0.00°E</div>
        <button class="kiza-flyout-btn delete" id="kizaPinPopupDeleteBtn">
            <span style="color:#f87171; display:flex;">${ICONS.trash}</span>
            <span id="kizaPinPopupDeleteText" data-i18n="deletePin"></span>
        </button>
    `;
    document.body.appendChild(pinPopupEl);

    // Bind pin popup actions
    document.getElementById('kizaPinPopupDeleteBtn').addEventListener('click', (e) => {
        e.stopPropagation();
        if (currentPinDeleteCallback) currentPinDeleteCallback();
        hidePinPopup();
    });

    document.getElementById('kizaPinPopupCloseBtn').addEventListener('click', (e) => {
        e.stopPropagation();
        hidePinPopup();
    });

    // Bind waypoint popup actions
    document.getElementById('kizaPopupStartBtn').addEventListener('click', (e) => {
        e.stopPropagation();
        if (currentPopupCallbacks.onStart) currentPopupCallbacks.onStart();
        hideWaypointPopup();
    });

    document.getElementById('kizaPopupFinishBtn').addEventListener('click', (e) => {
        e.stopPropagation();
        if (currentPopupCallbacks.onFinish) currentPopupCallbacks.onFinish();
        hideWaypointPopup();
    });

    // Dismiss popups and drawer on outside click or Escape
    window.addEventListener('mousedown', (e) => {
        if (waypointPopupEl && waypointPopupEl.style.display !== 'none' && !waypointPopupEl.contains(e.target)) {
            hideWaypointPopup();
        }
        if (pinPopupEl && pinPopupEl.style.display !== 'none' && !pinPopupEl.contains(e.target)) {
            hidePinPopup();
        }
    });

    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            hideWaypointPopup();
            hidePinPopup();
            toggleDrawer(false);
        }
    });

    // Auto-close drawer when clicking any landmark shortcut
    document.querySelectorAll('.kiza-landmark').forEach(btn => {
        btn.addEventListener('click', () => {
            toggleDrawer(false);
        });
    });

    // Localized render helper
    const renderDynamic = () => {
        langSwitch.querySelectorAll('button').forEach(b => b.classList.toggle('active', b.dataset.lang === getLang()));
        MARS_LANDMARKS.forEach(lm => {
            const el = drawer.querySelector(`[data-landmark-sub="${lm.id}"]`);
            if (el) el.textContent = L(lm.sub);
        });
        if (currentPinInfo) {
            renderPinPopupContent(currentPinInfo);
        }
    };
    applyTranslations();
    renderDynamic();
    onLangChange(renderDynamic);
}

/**
 * Registers callback for Recenter Mars action.
 */
export function onRecenterMars(fn) {
    recenterMarsHandler = fn;
}

/**
 * Registers callback for Clear Route action.
 */
export function onClearRoute(fn) {
    clearRouteHandler = fn;
}

/**
 * Registers callback for Open Tutorial action.
 */
export function onOpenTutorial(fn) {
    openTutorialHandler = fn;
}

/**
 * Displays the waypoint selection popup near cursor coordinates.
 */
export function showWaypointPopup(screenPos, info, onStart, onFinish) {
    if (!waypointPopupEl) return;
    currentPopupCallbacks = { onStart, onFinish };

    const coordsEl = document.getElementById('kizaPopupCoords');
    const badgeEl = document.getElementById('kizaPopupBadge');

    const latStr = `${Math.abs(info.lat).toFixed(2)}°${info.lat >= 0 ? 'N' : 'S'}`;
    const lonStr = `${Math.abs(info.lon).toFixed(2)}°${info.lon >= 0 ? 'E' : 'W'}`;
    coordsEl.textContent = `${latStr}, ${lonStr}`;

    if (info.inHiRise) {
        badgeEl.textContent = 'HiRISE';
        badgeEl.className = 'kiza-flyout-badge hirise';
    } else {
        badgeEl.textContent = 'MOLA';
        badgeEl.className = 'kiza-flyout-badge';
    }

    applyTranslations(waypointPopupEl);

    const popupW = 220;
    const popupH = 110;
    const left = Math.max(12, Math.min(window.innerWidth - popupW - 14, screenPos.x + 12));
    const top = Math.max(12, Math.min(window.innerHeight - popupH - 14, screenPos.y - 20));

    waypointPopupEl.style.left = `${left}px`;
    waypointPopupEl.style.top = `${top}px`;
    waypointPopupEl.style.display = 'flex';
}

/**
 * Hides the waypoint selection popup.
 */
export function hideWaypointPopup() {
    if (waypointPopupEl) {
        waypointPopupEl.style.display = 'none';
        currentPopupCallbacks = { onStart: null, onFinish: null };
    }
}

/**
 * Displays the pin action popup near the clicked waypoint pin.
 */
export function showPinPopup(screenPos, info, onDelete) {
    if (!pinPopupEl) return;
    currentPinDeleteCallback = onDelete;
    currentPinInfo = info;
    hideWaypointPopup();

    renderPinPopupContent(info);

    const popupW = 225;
    const popupH = 110;
    const left = Math.max(12, Math.min(window.innerWidth - popupW - 14, screenPos.x + 12));
    const top = Math.max(12, Math.min(window.innerHeight - popupH - 14, screenPos.y - 20));

    pinPopupEl.style.left = `${left}px`;
    pinPopupEl.style.top = `${top}px`;
    pinPopupEl.style.display = 'flex';
}

function renderPinPopupContent(info) {
    if (!pinPopupEl) return;
    const dotEl = document.getElementById('kizaPinPopupDot');
    const titleEl = document.getElementById('kizaPinPopupTitle');
    const coordsEl = document.getElementById('kizaPinPopupCoords');
    const deleteTextEl = document.getElementById('kizaPinPopupDeleteText');

    const isA = (info.type === 'A');
    dotEl.className = `kiza-pin-dot ${isA ? 'start' : 'finish'}`;
    dotEl.textContent = info.type;

    titleEl.textContent = t(isA ? 'startPin' : 'finishPin');
    deleteTextEl.textContent = t(isA ? 'deletePinA' : 'deletePinB');

    const latStr = `${Math.abs(info.lat).toFixed(3)}°${info.lat >= 0 ? 'N' : 'S'}`;
    const lonStr = `${Math.abs(info.lon).toFixed(3)}°${info.lon >= 0 ? 'E' : 'W'}`;
    coordsEl.textContent = `${latStr}, ${lonStr}`;
}

/**
 * Hides the pin action popup.
 */
export function hidePinPopup() {
    if (pinPopupEl) {
        pinPopupEl.style.display = 'none';
        currentPinDeleteCallback = null;
        currentPinInfo = null;
    }
}

/**
 * Toggles the visibility of the top resolution warning infobar.
 */
export function showResolutionWarning(show) {
    const banner = document.getElementById('resolutionWarning');
    if (banner) {
        banner.style.display = show ? 'inline-flex' : 'none';
    }
}
