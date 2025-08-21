/**
 * Kat UI - アコーディオンコンポーネント
 * アコーディオンアイテムの展開・折りたたみを管理
 */

import { KAT_UI } from '../core/constants.js';
import { utils } from '../core/utils.js';
import { customEvents } from '../core/events.js';

export const accordion = {
  /**
   * アコーディオンの初期化
   */
  init: function() {
    this.bindEvents();
  },

  /**
   * イベントのバインド
   */
  bindEvents: function() {
    utils.delegate(document, 'click', `[${KAT_UI.DATA_ATTRIBUTES.TOGGLE}="accordion-item"]`, (e) => {
      this.toggle(e.target);
    });
  },

  /**
   * アコーディオンアイテムの切り替え
   * @param {Element} trigger - トリガー要素
   */
  toggle: function(trigger) {
    const targetId = trigger.getAttribute(KAT_UI.DATA_ATTRIBUTES.TARGET);
    const content = document.getElementById(targetId);
    
    if (!content) return;

    const isOpen = trigger.getAttribute(KAT_UI.ARIA.EXPANDED) === 'true';

    if (isOpen) {
      this.close(trigger, content);
    } else {
      this.open(trigger, content);
    }
  },

  /**
   * アコーディオンアイテムを開く
   * @param {Element} trigger - トリガー要素
   * @param {Element} content - コンテンツ要素
   */
  open: function(trigger, content) {
    utils.setAttribute(trigger, KAT_UI.ARIA.EXPANDED, 'true');
    
    const scrollHeight = content.scrollHeight;
    content.style.maxHeight = scrollHeight + 'px';
    utils.addClass(content, 'kat-accordion__content--open');
    
    // カスタムイベントを発火
    customEvents.dispatch(trigger, KAT_UI.EVENTS.ACCORDION_OPEN, {
      trigger: trigger,
      content: content
    });
  },

  /**
   * アコーディオンアイテムを閉じる
   * @param {Element} trigger - トリガー要素
   * @param {Element} content - コンテンツ要素
   */
  close: function(trigger, content) {
    utils.setAttribute(trigger, KAT_UI.ARIA.EXPANDED, 'false');
    content.style.maxHeight = '0px';
    utils.removeClass(content, 'kat-accordion__content--open');
    
    // カスタムイベントを発火
    customEvents.dispatch(trigger, KAT_UI.EVENTS.ACCORDION_CLOSE, {
      trigger: trigger,
      content: content
    });
  },

  /**
   * すべてのアコーディオンアイテムを開く
   * @param {Element} accordion - アコーディオン要素
   */
  openAll: function(accordion) {
    const triggers = accordion.querySelectorAll(`[${KAT_UI.DATA_ATTRIBUTES.TOGGLE}="accordion-item"]`);
    
    triggers.forEach(trigger => {
      const targetId = trigger.getAttribute(KAT_UI.DATA_ATTRIBUTES.TARGET);
      const content = document.getElementById(targetId);
      
      if (content && trigger.getAttribute(KAT_UI.ARIA.EXPANDED) === 'false') {
        this.open(trigger, content);
      }
    });
  },

  /**
   * すべてのアコーディオンアイテムを閉じる
   * @param {Element} accordion - アコーディオン要素
   */
  closeAll: function(accordion) {
    const triggers = accordion.querySelectorAll(`[${KAT_UI.DATA_ATTRIBUTES.TOGGLE}="accordion-item"]`);
    
    triggers.forEach(trigger => {
      const targetId = trigger.getAttribute(KAT_UI.DATA_ATTRIBUTES.TARGET);
      const content = document.getElementById(targetId);
      
      if (content && trigger.getAttribute(KAT_UI.ARIA.EXPANDED) === 'true') {
        this.close(trigger, content);
      }
    });
  },

  /**
   * 特定のアコーディオンアイテムを開く
   * @param {Element} accordion - アコーディオン要素
   * @param {number} index - アイテムのインデックス
   */
  openItem: function(accordion, index) {
    const triggers = accordion.querySelectorAll(`[${KAT_UI.DATA_ATTRIBUTES.TOGGLE}="accordion-item"]`);
    
    if (triggers[index]) {
      const targetId = triggers[index].getAttribute(KAT_UI.DATA_ATTRIBUTES.TARGET);
      const content = document.getElementById(targetId);
      
      if (content) {
        this.open(triggers[index], content);
      }
    }
  },

  /**
   * 特定のアコーディオンアイテムを閉じる
   * @param {Element} accordion - アコーディオン要素
   * @param {number} index - アイテムのインデックス
   */
  closeItem: function(accordion, index) {
    const triggers = accordion.querySelectorAll(`[${KAT_UI.DATA_ATTRIBUTES.TOGGLE}="accordion-item"]`);
    
    if (triggers[index]) {
      const targetId = triggers[index].getAttribute(KAT_UI.DATA_ATTRIBUTES.TARGET);
      const content = document.getElementById(targetId);
      
      if (content) {
        this.close(triggers[index], content);
      }
    }
  },

  /**
   * アコーディオンアイテムの状態を取得
   * @param {Element} accordion - アコーディオン要素
   * @returns {Array} アイテムの状態情報
   */
  getItemsState: function(accordion) {
    const triggers = accordion.querySelectorAll(`[${KAT_UI.DATA_ATTRIBUTES.TOGGLE}="accordion-item"]`);
    const states = [];
    
    triggers.forEach((trigger, index) => {
      const targetId = trigger.getAttribute(KAT_UI.DATA_ATTRIBUTES.TARGET);
      const content = document.getElementById(targetId);
      const isOpen = trigger.getAttribute(KAT_UI.ARIA.EXPANDED) === 'true';
      
      states.push({
        index: index,
        trigger: trigger,
        content: content,
        isOpen: isOpen,
        label: trigger.textContent || trigger.innerText
      });
    });
    
    return states;
  },

  /**
   * アコーディオンアイテムの追加
   * @param {Element} accordion - アコーディオン要素
   * @param {Object} itemData - アイテムデータ
   */
  addItem: function(accordion, itemData) {
    const accordionList = accordion.querySelector('.kat-accordion__list');
    
    if (!accordionList) return;

    const itemIndex = accordion.querySelectorAll(`[${KAT_UI.DATA_ATTRIBUTES.TOGGLE}="accordion-item"]`).length;
    const itemId = `accordion-item-${Date.now()}-${itemIndex}`;
    const contentId = `accordion-content-${Date.now()}-${itemIndex}`;

    // アイテム要素を作成
    const item = document.createElement('div');
    item.className = 'kat-accordion__item';
    
    // トリガー要素を作成
    const trigger = document.createElement('button');
    trigger.setAttribute(KAT_UI.DATA_ATTRIBUTES.TOGGLE, 'accordion-item');
    trigger.setAttribute(KAT_UI.DATA_ATTRIBUTES.TARGET, contentId);
    trigger.setAttribute(KAT_UI.ARIA.EXPANDED, 'false');
    trigger.className = 'kat-accordion__trigger';
    trigger.innerHTML = `
      <span class="kat-accordion__label">${itemData.label}</span>
      <span class="kat-accordion__icon">+</span>
    `;

    // コンテンツ要素を作成
    const content = document.createElement('div');
    content.id = contentId;
    content.className = 'kat-accordion__content';
    content.style.maxHeight = '0px';
    content.innerHTML = itemData.content;

    // 要素を組み立て
    item.appendChild(trigger);
    item.appendChild(content);
    accordionList.appendChild(item);

    // イベントリスナーを追加
    trigger.addEventListener('click', (e) => this.toggle(e.target));

    return { item, trigger, content, itemId, contentId };
  },

  /**
   * アコーディオンアイテムの削除
   * @param {Element} accordion - アコーディオン要素
   * @param {number} index - 削除するアイテムのインデックス
   */
  removeItem: function(accordion, index) {
    const items = accordion.querySelectorAll('.kat-accordion__item');
    
    if (items[index]) {
      items[index].remove();
    }
  },

  /**
   * アコーディオンアイテムの更新
   * @param {Element} accordion - アコーディオン要素
   * @param {number} index - 更新するアイテムのインデックス
   * @param {Object} itemData - 新しいアイテムデータ
   */
  updateItem: function(accordion, index, itemData) {
    const items = accordion.querySelectorAll('.kat-accordion__item');
    
    if (items[index]) {
      const trigger = items[index].querySelector('.kat-accordion__trigger');
      const content = items[index].querySelector('.kat-accordion__content');
      
      if (itemData.label && trigger) {
        const label = trigger.querySelector('.kat-accordion__label');
        if (label) {
          utils.setText(label, itemData.label);
        }
      }
      
      if (itemData.content && content) {
        utils.setHTML(content, itemData.content);
      }
    }
  },

  /**
   * アコーディオンの設定を更新
   * @param {Element} accordion - アコーディオン要素
   * @param {Object} options - 設定オプション
   */
  updateOptions: function(accordion, options = {}) {
    const config = { ...DEFAULT_CONFIG.accordion, ...options };

    // 一度に開けるアイテム数の制限
    if (config.allowMultiple !== undefined) {
      accordion.dataset.allowMultiple = config.allowMultiple.toString();
    }

    // アニメーションの設定
    if (config.animation !== undefined) {
      accordion.dataset.animation = config.animation.toString();
    }
  },

  /**
   * アコーディオンの破棄
   * @param {Element} accordion - アコーディオン要素
   */
  destroy: function(accordion) {
    const triggers = accordion.querySelectorAll(`[${KAT_UI.DATA_ATTRIBUTES.TOGGLE}="accordion-item"]`);
    
    triggers.forEach(trigger => {
      trigger.removeEventListener('click', this.toggle);
    });
  }
};

// デフォルト設定
const DEFAULT_CONFIG = {
  accordion: {
    allowMultiple: false,
    animation: true
  }
};
