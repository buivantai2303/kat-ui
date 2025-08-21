/**
 * Kat UI - ドロップダウンコンポーネント
 * ドロップダウンメニューの表示・非表示を管理
 */

import { KAT_UI } from '../core/constants.js';
import { utils } from '../core/utils.js';
import { customEvents } from '../core/events.js';

export const dropdown = {
  /**
   * ドロップダウンの初期化
   */
  init: function() {
    this.bindEvents();
  },

  /**
   * イベントのバインド
   */
  bindEvents: function() {
    // ドロップダウンの開閉トリガー
    utils.delegate(document, 'click', `[${KAT_UI.DATA_ATTRIBUTES.TOGGLE}="dropdown"]`, (e) => {
      e.stopPropagation();
      const dropdown = e.target.closest('.kat-dropdown');
      const menu = dropdown.querySelector('.kat-dropdown__menu');
      
      if (utils.hasClass(menu, 'kat-dropdown__menu--open')) {
        this.close(dropdown);
      } else {
        this.closeAll();
        this.open(dropdown);
      }
    });

    // ドキュメントクリックでドロップダウンを閉じる
    document.addEventListener('click', () => this.closeAll());

    // ESCキーでドロップダウンを閉じる
    document.addEventListener('keydown', (e) => {
      if (e.key === KAT_UI.KEYS.ESCAPE) {
        this.closeAll();
      }
    });

    // ドロップダウンメニュー内のクリックで閉じないようにする
    utils.delegate(document, 'click', '.kat-dropdown__menu', (e) => {
      e.stopPropagation();
    });
  },

  /**
   * ドロップダウンを開く
   * @param {Element} dropdown - ドロップダウン要素
   */
  open: function(dropdown) {
    if (!dropdown) return;

    const menu = dropdown.querySelector('.kat-dropdown__menu');
    if (!menu) return;

    // メニューを開く
    utils.addClass(menu, 'kat-dropdown__menu--open');
    utils.addClass(dropdown, 'kat-dropdown--open');

    // トリガーのaria-expandedを更新
    const trigger = dropdown.querySelector(`[${KAT_UI.DATA_ATTRIBUTES.TOGGLE}="dropdown"]`);
    if (trigger) {
      utils.setAttribute(trigger, KAT_UI.ARIA.EXPANDED, 'true');
    }

    // カスタムイベントを発火
    customEvents.dispatch(dropdown, KAT_UI.EVENTS.DROPDOWN_OPEN, { dropdown, menu });

    // メニューの位置を調整
    this.positionMenu(dropdown);
  },

  /**
   * ドロップダウンを閉じる
   * @param {Element} dropdown - ドロップダウン要素
   */
  close: function(dropdown) {
    if (!dropdown) return;

    const menu = dropdown.querySelector('.kat-dropdown__menu');
    if (!menu) return;

    // メニューを閉じる
    utils.removeClass(menu, 'kat-dropdown__menu--open');
    utils.removeClass(dropdown, 'kat-dropdown--open');

    // トリガーのaria-expandedを更新
    const trigger = dropdown.querySelector(`[${KAT_UI.DATA_ATTRIBUTES.TOGGLE}="dropdown"]`);
    if (trigger) {
      utils.setAttribute(trigger, KAT_UI.ARIA.EXPANDED, 'false');
    }

    // カスタムイベントを発火
    customEvents.dispatch(dropdown, KAT_UI.EVENTS.DROPDOWN_CLOSE, { dropdown, menu });
  },

  /**
   * すべてのドロップダウンを閉じる
   */
  closeAll: function() {
    const openDropdowns = document.querySelectorAll('.kat-dropdown__menu--open');
    openDropdowns.forEach(menu => {
      const dropdown = menu.closest('.kat-dropdown');
      if (dropdown) {
        this.close(dropdown);
      }
    });
  },

  /**
   * メニューの位置を調整
   * @param {Element} dropdown - ドロップダウン要素
   */
  positionMenu: function(dropdown) {
    const menu = dropdown.querySelector('.kat-dropdown__menu');
    if (!menu) return;

    const dropdownRect = dropdown.getBoundingClientRect();
    const menuRect = menu.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // デフォルト位置（下に表示）
    let top = dropdownRect.bottom + 8;
    let left = dropdownRect.left;

    // 右端のオーバーフローをチェック
    if (left + menuRect.width > viewportWidth) {
      left = viewportWidth - menuRect.width - 16;
    }

    // 左端のオーバーフローをチェック
    if (left < 16) {
      left = 16;
    }

    // 下端のオーバーフローをチェック
    if (top + menuRect.height > viewportHeight) {
      // 上に表示
      top = dropdownRect.top - menuRect.height - 8;
      utils.addClass(menu, 'kat-dropdown__menu--up');
    } else {
      utils.removeClass(menu, 'kat-dropdown__menu--up');
    }

    // 位置を適用
    utils.setPosition(menu, { top, left });
  },

  /**
   * ドロップダウンの状態を取得
   * @param {Element} dropdown - ドロップダウン要素
   * @returns {boolean} 開いているかどうか
   */
  isOpen: function(dropdown) {
    if (!dropdown) return false;
    const menu = dropdown.querySelector('.kat-dropdown__menu');
    return menu && utils.hasClass(menu, 'kat-dropdown__menu--open');
  },

  /**
   * ドロップダウンの表示・非表示を切り替え
   * @param {Element} dropdown - ドロップダウン要素
   */
  toggle: function(dropdown) {
    if (!dropdown) return;

    if (this.isOpen(dropdown)) {
      this.close(dropdown);
    } else {
      this.closeAll();
      this.open(dropdown);
    }
  },

  /**
   * ドロップダウンの設定を更新
   * @param {Element} dropdown - ドロップダウン要素
   * @param {Object} options - 設定オプション
   */
  updateOptions: function(dropdown, options = {}) {
    if (!dropdown) return;

    const config = { ...DEFAULT_CONFIG.dropdown, ...options };

    // ホバーでの開閉設定
    if (config.hover !== undefined) {
      dropdown.dataset.hover = config.hover.toString();
    }

    // 自動位置調整の設定
    if (config.autoPosition !== undefined) {
      dropdown.dataset.autoPosition = config.autoPosition.toString();
    }

    // アニメーションの設定
    if (config.animation !== undefined) {
      dropdown.dataset.animation = config.animation.toString();
    }
  },

  /**
   * ドロップダウンのサイズを設定
   * @param {Element} dropdown - ドロップダウン要素
   * @param {string} size - サイズ（sm, md, lg, xl）
   */
  setSize: function(dropdown, size) {
    if (!dropdown) return;

    const menu = dropdown.querySelector('.kat-dropdown__menu');
    if (!menu) return;

    // 既存のサイズクラスを削除
    const sizeClasses = ['kat-dropdown__menu--sm', 'kat-dropdown__menu--md', 'kat-dropdown__menu--lg', 'kat-dropdown__menu--xl'];
    sizeClasses.forEach(className => utils.removeClass(menu, className));

    // 新しいサイズクラスを追加
    if (size && size !== 'md') {
      utils.addClass(menu, `kat-dropdown__menu--${size}`);
    }
  },

  /**
   * ドロップダウンの位置を設定
   * @param {Element} dropdown - ドロップダウン要素
   * @param {string} position - 位置（bottom, top, left, right）
   */
  setPosition: function(dropdown, position) {
    if (!dropdown) return;

    const menu = dropdown.querySelector('.kat-dropdown__menu');
    if (!menu) return;

    // 既存の位置クラスを削除
    const positionClasses = ['kat-dropdown__menu--top', 'kat-dropdown__menu--left', 'kat-dropdown__menu--right'];
    positionClasses.forEach(className => utils.removeClass(menu, className));

    // 新しい位置クラスを追加
    if (position && position !== 'bottom') {
      utils.addClass(menu, `kat-dropdown__menu--${position}`);
    }
  },

  /**
   * ドロップダウンのコンテンツを更新
   * @param {Element} dropdown - ドロップダウン要素
   * @param {string} content - 新しいコンテンツ
   */
  updateContent: function(dropdown, content) {
    if (!dropdown) return;

    const menu = dropdown.querySelector('.kat-dropdown__menu');
    if (menu) {
      utils.setHTML(menu, content);
    }
  },

  /**
   * ドロップダウンの項目を追加
   * @param {Element} dropdown - ドロップダウン要素
   * @param {Object} item - 追加する項目
   */
  addItem: function(dropdown, item) {
    if (!dropdown) return;

    const menu = dropdown.querySelector('.kat-dropdown__menu');
    if (!menu) return;

    const itemElement = document.createElement('div');
    itemElement.className = 'kat-dropdown__item';
    
    if (item.href) {
      itemElement.innerHTML = `<a href="${item.href}" class="kat-dropdown__link">${item.text}</a>`;
    } else if (item.button) {
      itemElement.innerHTML = `<button class="kat-dropdown__button">${item.text}</button>`;
    } else {
      itemElement.textContent = item.text;
    }

    if (item.className) {
      utils.addClass(itemElement, item.className);
    }

    if (item.onClick) {
      itemElement.addEventListener('click', item.onClick);
    }

    menu.appendChild(itemElement);
  },

  /**
   * ドロップダウンの項目を削除
   * @param {Element} dropdown - ドロップダウン要素
   * @param {number} index - 削除する項目のインデックス
   */
  removeItem: function(dropdown, index) {
    if (!dropdown) return;

    const menu = dropdown.querySelector('.kat-dropdown__menu');
    if (!menu) return;

    const items = menu.querySelectorAll('.kat-dropdown__item');
    if (items[index]) {
      items[index].remove();
    }
  },

  /**
   * ドロップダウンの項目をクリア
   * @param {Element} dropdown - ドロップダウン要素
   */
  clearItems: function(dropdown) {
    if (!dropdown) return;

    const menu = dropdown.querySelector('.kat-dropdown__menu');
    if (menu) {
      menu.innerHTML = '';
    }
  },

  /**
   * ドロップダウンの破棄
   * @param {Element} dropdown - ドロップダウン要素
   */
  destroy: function(dropdown) {
    if (!dropdown) return;

    // ドロップダウンが開いている場合は閉じる
    if (this.isOpen(dropdown)) {
      this.close(dropdown);
    }

    // イベントリスナーを削除
    const trigger = dropdown.querySelector(`[${KAT_UI.DATA_ATTRIBUTES.TOGGLE}="dropdown"]`);
    if (trigger) {
      trigger.removeEventListener('click', this.toggle);
    }

    // ドロップダウン要素を削除
    if (dropdown.parentNode) {
      dropdown.parentNode.removeChild(dropdown);
    }
  }
};

// デフォルト設定
const DEFAULT_CONFIG = {
  dropdown: {
    hover: false,
    autoPosition: true,
    animation: true
  }
};
