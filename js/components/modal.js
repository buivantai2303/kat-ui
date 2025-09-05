/**
 * Kat UI - モーダルコンポーネント
 * モーダルダイアログの表示・非表示を管理
 */

import { KAT_UI } from '../core/constants.js';
import { utils } from '../core/utils.js';
import { customEvents } from '../core/events.js';

export const modal = {
  /**
   * モーダルの初期化
   */
  init: function() {
    this.calculateScrollbarWidth();
    this.bindEvents();
  },

  /**
   * イベントのバインド
   */
  bindEvents: function() {
    // モーダルを開くトリガー
    utils.delegate(document, 'click', `[${KAT_UI.DATA_ATTRIBUTES.TOGGLE}="modal"]`, (e) => {
      e.preventDefault();
      const targetId = e.target.getAttribute(KAT_UI.DATA_ATTRIBUTES.TARGET);
      const modal = document.getElementById(targetId);
      if (modal) this.open(modal);
    });

    // モーダルを閉じるトリガー
    utils.delegate(document, 'click', `[${KAT_UI.DATA_ATTRIBUTES.CLOSE}="modal"]`, (e) => {
      const modal = e.target.closest('.kat-modal');
      if (modal) this.close(modal);
    });

    // ESCキーでモーダルを閉じる
    document.addEventListener('keydown', (e) => {
      if (e.key === KAT_UI.KEYS.ESCAPE) {
        const openModal = document.querySelector('.kat-modal.kat-modal--open');
        if (openModal) this.close(openModal);
      }
    });

    // モーダルの背景クリックで閉じる
    utils.delegate(document, 'click', '.kat-modal__backdrop', (e) => {
      if (e.target === e.currentTarget) {
        const modal = e.target.closest('.kat-modal');
        if (modal) this.close(modal);
      }
    });
  },

  /**
   * スクロールバーの幅を計算
   */
  calculateScrollbarWidth: function() {
    const scrollbarWidth = utils.getScrollbarWidth();
    utils.setCSSVariable('--scrollbar-width', scrollbarWidth + 'px');
  },

  /**
   * モーダルを開く
   * @param {Element} modal - モーダル要素
   */
  open: function(modal) {
    if (!modal) return;

    // 他のモーダルを閉じる
    this.closeAll();

    // モーダルを開く
    utils.addClass(modal, 'kat-modal--open');
    utils.addClass(document.body, 'kat-modal-open');

    // フォーカストラップ
    utils.trapFocus(modal);

    // カスタムイベントを発火
    customEvents.dispatch(modal, KAT_UI.EVENTS.MODAL_OPEN, { modal });

    // スクロールを無効化
    this.disableScroll();
  },

  /**
   * モーダルを閉じる
   * @param {Element} modal - モーダル要素
   */
  close: function(modal) {
    if (!modal) return;

    // 閉じるアニメーションクラスを追加
    utils.addClass(modal, 'kat-modal--closing');

    // アニメーション完了後にモーダルを閉じる
    setTimeout(() => {
      utils.removeClass(modal, 'kat-modal--open', 'kat-modal--closing');
      utils.removeClass(document.body, 'kat-modal-open');

      // カスタムイベントを発火
      customEvents.dispatch(modal, KAT_UI.EVENTS.MODAL_CLOSE, { modal });

      // スクロールを有効化
      this.enableScroll();

      // フォーカスを戻す
      this.restoreFocus(modal);
    }, KAT_UI.TIMING.ANIMATION_DURATION);
  },

  /**
   * すべてのモーダルを閉じる
   */
  closeAll: function() {
    const openModals = document.querySelectorAll('.kat-modal.kat-modal--open');
    openModals.forEach(modal => this.close(modal));
  },

  /**
   * スクロールを無効化
   */
  disableScroll: function() {
    const scrollbarWidth = utils.getCSSVariable('--scrollbar-width');
    if (scrollbarWidth) {
      document.body.style.paddingRight = scrollbarWidth;
    }
    document.body.style.overflow = 'hidden';
  },

  /**
   * スクロールを有効化
   */
  enableScroll: function() {
    document.body.style.paddingRight = '';
    document.body.style.overflow = '';
  },

  /**
   * フォーカスを復元
   * @param {Element} modal - モーダル要素
   */
  restoreFocus: function(modal) {
    const trigger = document.querySelector(`[${KAT_UI.DATA_ATTRIBUTES.TARGET}="${modal.id}"]`);
    if (trigger) {
      utils.focus(trigger);
    }
  },

  /**
   * モーダルの状態を取得
   * @param {Element} modal - モーダル要素
   * @returns {boolean} 開いているかどうか
   */
  isOpen: function(modal) {
    return modal && utils.hasClass(modal, 'kat-modal--open');
  },

  /**
   * モーダルの設定を更新
   * @param {Element} modal - モーダル要素
   * @param {Object} options - 設定オプション
   */
  updateOptions: function(modal, options = {}) {
    if (!modal) return;

    const config = { ...DEFAULT_CONFIG.modal, ...options };

    // バックドロップの設定
    if (config.backdrop !== undefined) {
      const backdrop = modal.querySelector('.kat-modal__backdrop');
      if (backdrop) {
        utils.toggleClass(backdrop, 'kat-modal__backdrop--hidden', !config.backdrop);
      }
    }

    // キーボード制御の設定
    if (config.keyboard !== undefined) {
      modal.dataset.keyboard = config.keyboard.toString();
    }

    // フォーカストラップの設定
    if (config.focusTrap !== undefined) {
      modal.dataset.focusTrap = config.focusTrap.toString();
    }
  },

  /**
   * モーダルのサイズを設定
   * @param {Element} modal - モーダル要素
   * @param {string} size - サイズ（sm, md, lg, xl, full）
   */
  setSize: function(modal, size) {
    if (!modal) return;

    // 既存のサイズクラスを削除
    const sizeClasses = ['kat-modal--sm', 'kat-modal--md', 'kat-modal--lg', 'kat-modal--xl', 'kat-modal--full'];
    sizeClasses.forEach(className => utils.removeClass(modal, className));

    // 新しいサイズクラスを追加
    if (size && size !== 'md') {
      utils.addClass(modal, `kat-modal--${size}`);
    }
  },

  /**
   * モーダルの位置を設定
   * @param {Element} modal - モーダル要素
   * @param {string} position - 位置（center, top, bottom, left, right）
   */
  setPosition: function(modal, position) {
    if (!modal) return;

    // 既存の位置クラスを削除
    const positionClasses = ['kat-modal--top', 'kat-modal--bottom', 'kat-modal--left', 'kat-modal--right'];
    positionClasses.forEach(className => utils.removeClass(modal, className));

    // 新しい位置クラスを追加
    if (position && position !== 'center') {
      utils.addClass(modal, `kat-modal--${position}`);
    }
  },

  /**
   * モーダルのコンテンツを更新
   * @param {Element} modal - モーダル要素
   * @param {string} content - 新しいコンテンツ
   */
  updateContent: function(modal, content) {
    if (!modal) return;

    const contentElement = modal.querySelector('.kat-modal__content');
    if (contentElement) {
      utils.setHTML(contentElement, content);
    }
  },

  /**
   * モーダルのタイトルを更新
   * @param {Element} modal - モーダル要素
   * @param {string} title - 新しいタイトル
   */
  updateTitle: function(modal, title) {
    if (!modal) return;

    const titleElement = modal.querySelector('.kat-modal__title');
    if (titleElement) {
      utils.setText(titleElement, title);
    }
  },

  /**
   * モーダルのフッターを更新
   * @param {Element} modal - モーダル要素
   * @param {string} footer - 新しいフッター
   */
  updateFooter: function(modal, footer) {
    if (!modal) return;

    const footerElement = modal.querySelector('.kat-modal__footer');
    if (footerElement) {
      utils.setHTML(footerElement, footer);
    }
  },

  /**
   * モーダルの表示・非表示を切り替え
   * @param {Element} modal - モーダル要素
   */
  toggle: function(modal) {
    if (!modal) return;

    if (this.isOpen(modal)) {
      this.close(modal);
    } else {
      this.open(modal);
    }
  },

  /**
   * モーダルの破棄
   * @param {Element} modal - モーダル要素
   */
  destroy: function(modal) {
    if (!modal) return;

    // モーダルが開いている場合は閉じる
    if (this.isOpen(modal)) {
      this.close(modal);
    }

    // イベントリスナーを削除
    const triggers = document.querySelectorAll(`[${KAT_UI.DATA_ATTRIBUTES.TARGET}="${modal.id}"]`);
    triggers.forEach(trigger => {
      trigger.removeEventListener('click', this.open);
    });

    // モーダル要素を削除
    if (modal.parentNode) {
      modal.parentNode.removeChild(modal);
    }
  }
};

// デフォルト設定
const DEFAULT_CONFIG = {
  modal: {
    backdrop: true,
    keyboard: true,
    focusTrap: true
  }
};
