/**
 * Kat UI - 定数と設定
 * アプリケーション全体で使用される定数、アイコン、設定値を管理
 */

export const KAT_UI = {
  // CSSクラス名
  CLASSES: {
    OPEN: '--open',
    CLOSED: '--closed',
    ACTIVE: '--active',
    HIDDEN: '--hidden',
    VISIBLE: '--visible',
    SHOW: '--show',
    HIDE: '--hide',
    COLLAPSED: '--collapsed',
    EXPANDED: '--expanded',
    SELECTED: '--selected',
    DISABLED: '--disabled',
    LOADING: '--loading',
    SUCCESS: '--success',
    ERROR: '--error',
    WARNING: '--warning',
    INFO: '--info'
  },

  // アイコンSVG
  ICONS: {
    CLOSE: '<svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>',
    SUCCESS: '<svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path></svg>',
    ERROR: '<svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path></svg>',
    WARNING: '<svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path></svg>',
    INFO: '<svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"></path></svg>',
    CHEVRON_DOWN: '<svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>',
    CHEVRON_UP: '<svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7"></path></svg>',
    CHEVRON_LEFT: '<svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path></svg>',
    CHEVRON_RIGHT: '<svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>',
    PLUS: '+',
    MINUS: '-',
    CHECK: '<svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>'
  },

  // イベント名
  EVENTS: {
    READY: 'kat:ready',
    MODAL_OPEN: 'kat:modal:open',
    MODAL_CLOSE: 'kat:modal:close',
    DROPDOWN_OPEN: 'kat:dropdown:open',
    DROPDOWN_CLOSE: 'kat:dropdown:close',
    TABS_CHANGE: 'kat:tabs:change',
    ACCORDION_OPEN: 'kat:accordion:open',
    ACCORDION_CLOSE: 'kat:accordion:close',
    SIDEBAR_OPEN: 'kat:sidebar:open',
    SIDEBAR_CLOSE: 'kat:sidebar:close',
    TOOLTIP_SHOW: 'kat:tooltip:show',
    TOOLTIP_HIDE: 'kat:tooltip:hide',
    CARD_TOGGLE: 'kat:card:toggle',
    ALERT_REMOVE: 'kat:alert:remove',
    TOGGLE_GROUP_CHANGE: 'kat:toggle-group:change',
    TOAST_SHOW: 'kat:toast:show',
    TOAST_HIDE: 'kat:toast:hide',
    OTP_COMPLETE: 'kat:otp:complete',
    CAROUSEL_CHANGE: 'kat:carousel:change',
    FILTER_CHANGE: 'kat:filter:change',
    NAVIGATION_DROPDOWN_OPEN: 'kat:navigation:dropdown:open',
    NAVIGATION_DROPDOWN_CLOSE: 'kat:navigation:dropdown:close'
  },

  // タイミング設定
  TIMING: {
    HOVER_DELAY: 200,
    ANIMATION_DURATION: 250,
    TOAST_DURATION: 5000,
    CAROUSEL_INTERVAL: 5000,
    TOOLTIP_DELAY: 300,
    DEBOUNCE_DELAY: 16
  },

  // キーコード
  KEYS: {
    ESCAPE: 'Escape',
    ENTER: 'Enter',
    SPACE: ' ',
    TAB: 'Tab',
    ARROW_LEFT: 'ArrowLeft',
    ARROW_RIGHT: 'ArrowRight',
    ARROW_UP: 'ArrowUp',
    ARROW_DOWN: 'ArrowDown',
    HOME: 'Home',
    END: 'End',
    BACKSPACE: 'Backspace'
  },

  // データ属性
  DATA_ATTRIBUTES: {
    TOGGLE: 'data-kat-toggle',
    TARGET: 'data-kat-target',
    CLOSE: 'data-kat-close',
    COMPONENT: 'data-kat-component',
    TOOLTIP: 'data-kat-tooltip',
    TOOLTIP_POSITION: 'data-kat-tooltip-position',
    AUTOPLAY: 'data-kat-autoplay',
    INTERVAL: 'data-kat-interval',
    FILTER: 'data-filter'
  },

  // ロール属性
  ROLES: {
    TAB: 'tab',
    TABPANEL: 'tabpanel',
    BUTTON: 'button',
    MENU: 'menu',
    MENUITEM: 'menuitem',
    DIALOG: 'dialog',
    TOOLTIP: 'tooltip'
  },

  // アクセシビリティ属性
  ARIA: {
    EXPANDED: 'aria-expanded',
    SELECTED: 'aria-selected',
    HIDDEN: 'aria-hidden',
    LABEL: 'aria-label',
    PRESSED: 'aria-pressed',
    CONTROLS: 'aria-controls',
    DESCRIBEDBY: 'aria-describedby'
  },

  // カラー設定
  COLORS: {
    PRIMARY: '#171717',
    SECONDARY: '#e5e5e5',
    SUCCESS: '#10b981',
    ERROR: '#ef4444',
    WARNING: '#f59e0b',
    INFO: '#3b82f6'
  },

  // ブレークポイント
  BREAKPOINTS: {
    SM: 640,
    MD: 768,
    LG: 1024,
    XL: 1280,
    XXL: 1536
  }
};

// デフォルト設定
export const DEFAULT_CONFIG = {
  toast: {
    position: 'top-right',
    duration: 5000,
    closable: true
  },
  modal: {
    backdrop: true,
    keyboard: true,
    focusTrap: true
  },
  tooltip: {
    position: 'top',
    delay: 300
  },
  carousel: {
    autoplay: true,
    interval: 5000,
    pauseOnHover: true
  }
};
