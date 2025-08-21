/**
 * Kat UI - ツールチップコンポーネント
 * ツールチップの表示・非表示と位置調整を管理
 */

import { KAT_UI } from '../core/constants.js';
import { utils } from '../core/utils.js';
import { customEvents } from '../core/events.js';

export const tooltip = {
  /**
   * ツールチップの初期化
   */
  init: function() {
    this.bindEvents();
  },

  /**
   * イベントのバインド
   */
  bindEvents: function() {
    const tooltipTriggers = document.querySelectorAll(`[${KAT_UI.DATA_ATTRIBUTES.TOOLTIP}]`);
    
    tooltipTriggers.forEach(trigger => {
      trigger.addEventListener('mouseenter', (e) => {
        this.show(e.target);
      });
      
      trigger.addEventListener('mouseleave', (e) => {
        this.hide();
      });
      
      trigger.addEventListener('focus', (e) => {
        this.show(e.target);
      });
      
      trigger.addEventListener('blur', (e) => {
        this.hide();
      });
    });
  },

  /**
   * ツールチップを表示
   * @param {Element} trigger - トリガー要素
   */
  show: function(trigger) {
    const text = trigger.getAttribute(KAT_UI.DATA_ATTRIBUTES.TOOLTIP);
    const position = trigger.getAttribute(KAT_UI.DATA_ATTRIBUTES.TOOLTIP_POSITION) || 'top';
    
    this.hide();
    
    const tooltip = document.createElement('div');
    tooltip.id = 'kat-tooltip';
    tooltip.className = `kat-tooltip kat-tooltip--${position}`;
    tooltip.setAttribute('role', KAT_UI.ROLES.TOOLTIP);
    tooltip.textContent = text;
    
    document.body.appendChild(tooltip);
    this.position(trigger, tooltip, position);
    
    requestAnimationFrame(() => {
      utils.addClass(tooltip, 'kat-tooltip--visible');
    });
    
    // カスタムイベントを発火
    customEvents.dispatch(trigger, KAT_UI.EVENTS.TOOLTIP_SHOW, {
      trigger: trigger,
      tooltip: tooltip,
      position: position
    });
  },

  /**
   * ツールチップを非表示
   */
  hide: function() {
    const tooltip = document.getElementById('kat-tooltip');
    if (tooltip) {
      utils.removeClass(tooltip, 'kat-tooltip--visible');
      
      setTimeout(() => {
        if (tooltip.parentNode) {
          tooltip.parentNode.removeChild(tooltip);
        }
      }, KAT_UI.TIMING.TOOLTIP_DELAY);
    }
  },

  /**
   * ツールチップの位置を調整
   * @param {Element} trigger - トリガー要素
   * @param {Element} tooltip - ツールチップ要素
   * @param {string} position - 位置
   */
  position: function(trigger, tooltip, position) {
    const triggerRect = trigger.getBoundingClientRect();
    const tooltipRect = tooltip.getBoundingClientRect();
    
    let top, left;
    
    switch (position) {
      case 'top':
        top = triggerRect.top - tooltipRect.height - 8;
        left = triggerRect.left + (triggerRect.width - tooltipRect.width) / 2;
        break;
      case 'bottom':
        top = triggerRect.bottom + 8;
        left = triggerRect.left + (triggerRect.width - tooltipRect.width) / 2;
        break;
      case 'left':
        top = triggerRect.top + (triggerRect.height - tooltipRect.height) / 2;
        left = triggerRect.left - tooltipRect.width - 8;
        break;
      case 'right':
        top = triggerRect.top + (triggerRect.height - tooltipRect.height) / 2;
        left = triggerRect.right + 8;
        break;
      default:
        top = triggerRect.top - tooltipRect.height - 8;
        left = triggerRect.left + (triggerRect.width - tooltipRect.width) / 2;
    }
    
    // ビューポート内に収める
    const viewport = { width: window.innerWidth, height: window.innerHeight };
    top = Math.max(8, Math.min(top, viewport.height - tooltipRect.height - 8));
    left = Math.max(8, Math.min(left, viewport.width - tooltipRect.width - 8));
    
    utils.setPosition(tooltip, { top, left });
  },

  /**
   * ツールチップの設定を更新
   * @param {Element} trigger - トリガー要素
   * @param {Object} options - 設定オプション
   */
  updateOptions: function(trigger, options = {}) {
    const config = { ...DEFAULT_CONFIG.tooltip, ...options };

    // テキストの更新
    if (config.text !== undefined) {
      trigger.setAttribute(KAT_UI.DATA_ATTRIBUTES.TOOLTIP, config.text);
    }

    // 位置の更新
    if (config.position !== undefined) {
      trigger.setAttribute(KAT_UI.DATA_ATTRIBUTES.TOOLTIP_POSITION, config.position);
    }

    // 遅延の更新
    if (config.delay !== undefined) {
      trigger.dataset.tooltipDelay = config.delay.toString();
    }
  },

  /**
   * ツールチップの動的作成
   * @param {Element} element - 対象要素
   * @param {Object} options - ツールチップオプション
   */
  create: function(element, options = {}) {
    const config = { ...DEFAULT_CONFIG.tooltip, ...options };
    
    element.setAttribute(KAT_UI.DATA_ATTRIBUTES.TOOLTIP, config.text);
    
    if (config.position) {
      element.setAttribute(KAT_UI.DATA_ATTRIBUTES.TOOLTIP_POSITION, config.position);
    }
    
    if (config.delay) {
      element.dataset.tooltipDelay = config.delay.toString();
    }
    
    // イベントリスナーを追加
    element.addEventListener('mouseenter', (e) => this.show(e.target));
    element.addEventListener('mouseleave', (e) => this.hide());
    element.addEventListener('focus', (e) => this.show(e.target));
    element.addEventListener('blur', (e) => this.hide());
    
    return element;
  },

  /**
   * ツールチップの削除
   * @param {Element} element - 対象要素
   */
  destroy: function(element) {
    element.removeAttribute(KAT_UI.DATA_ATTRIBUTES.TOOLTIP);
    element.removeAttribute(KAT_UI.DATA_ATTRIBUTES.TOOLTIP_POSITION);
    delete element.dataset.tooltipDelay;
    
    // イベントリスナーを削除
    element.removeEventListener('mouseenter', this.show);
    element.removeEventListener('mouseleave', this.hide);
    element.removeEventListener('focus', this.show);
    element.removeEventListener('blur', this.hide);
  },

  /**
   * すべてのツールチップを非表示
   */
  hideAll: function() {
    const tooltips = document.querySelectorAll('.kat-tooltip');
    tooltips.forEach(tooltip => {
      if (tooltip.parentNode) {
        tooltip.parentNode.removeChild(tooltip);
      }
    });
  },

  /**
   * ツールチップの状態を取得
   * @param {Element} trigger - トリガー要素
   * @returns {Object} ツールチップの状態情報
   */
  getState: function(trigger) {
    const tooltip = document.getElementById('kat-tooltip');
    const isVisible = tooltip && utils.hasClass(tooltip, 'kat-tooltip--visible');
    
    return {
      isVisible: isVisible,
      text: trigger.getAttribute(KAT_UI.DATA_ATTRIBUTES.TOOLTIP),
      position: trigger.getAttribute(KAT_UI.DATA_ATTRIBUTES.TOOLTIP_POSITION) || 'top',
      delay: parseInt(trigger.dataset.tooltipDelay) || KAT_UI.TIMING.TOOLTIP_DELAY
    };
  },

  /**
   * ツールチップの位置を再計算
   * @param {Element} trigger - トリガー要素
   */
  reposition: function(trigger) {
    const tooltip = document.getElementById('kat-tooltip');
    if (tooltip && utils.hasClass(tooltip, 'kat-tooltip--visible')) {
      const position = trigger.getAttribute(KAT_UI.DATA_ATTRIBUTES.TOOLTIP_POSITION) || 'top';
      this.position(trigger, tooltip, position);
    }
  },

  /**
   * ウィンドウリサイズ時の位置調整
   */
  handleResize: function() {
    const tooltip = document.getElementById('kat-tooltip');
    if (tooltip && utils.hasClass(tooltip, 'kat-tooltip--visible')) {
      const trigger = document.querySelector(`[${KAT_UI.DATA_ATTRIBUTES.TOOLTIP}="${tooltip.textContent}"]`);
      if (trigger) {
        this.reposition(trigger);
      }
    }
  }
};

// デフォルト設定
const DEFAULT_CONFIG = {
  tooltip: {
    text: '',
    position: 'top',
    delay: KAT_UI.TIMING.TOOLTIP_DELAY
  }
};

// ウィンドウリサイズイベントの監視
window.addEventListener('resize', () => {
  tooltip.handleResize();
});
