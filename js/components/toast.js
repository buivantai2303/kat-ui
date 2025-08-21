/**
 * Kat UI - トーストコンポーネント
 * トースト通知の表示・非表示・スタイリングを管理
 */

import { KAT_UI } from '../core/constants.js';
import { utils } from '../core/utils.js';
import { customEvents } from '../core/events.js';

export const toast = {
  /**
   * トーストの初期化
   */
  init: function() {
    this.createContainer();
    this.bindEvents();
  },

  /**
   * トーストコンテナの作成
   */
  createContainer: function() {
    // 既存のコンテナがあるかチェック
    if (document.querySelector('.kat-toast-container')) return;

    const container = document.createElement('div');
    container.className = 'kat-toast-container';
    container.setAttribute('aria-live', 'polite');
    container.setAttribute('aria-atomic', 'true');
    
    document.body.appendChild(container);
  },

  /**
   * イベントのバインド
   */
  bindEvents: function() {
    // トーストを閉じるボタンのイベント
    utils.delegate(document, 'click', '.kat-toast__close', (e) => {
      const toast = e.target.closest('.kat-toast');
      if (toast) {
        this.close(toast);
      }
    });

    // トーストのホバーイベント（一時停止）
    utils.delegate(document, 'mouseenter', '.kat-toast', (e) => {
      const toast = e.currentTarget;
      this.pauseTimer(toast);
    });

    utils.delegate(document, 'mouseleave', '.kat-toast', (e) => {
      const toast = e.currentTarget;
      this.resumeTimer(toast);
    });
  },

  /**
   * トーストの作成
   * @param {Object} options - トーストオプション
   * @returns {Element} 作成されたトースト要素
   */
  create: function(options = {}) {
    const config = { ...DEFAULT_CONFIG.toast, ...options };
    
    const toast = document.createElement('div');
    toast.className = 'kat-toast';
    
    // バリアントクラスの追加
    if (config.variant && config.variant !== 'default') {
      utils.addClass(toast, `kat-toast--${config.variant}`);
    }

    // サイズクラスの追加
    if (config.size && config.size !== 'md') {
      utils.addClass(toast, `kat-toast--${config.size}`);
    }

    // 位置クラスの追加
    if (config.position && config.position !== 'top-right') {
      utils.addClass(toast, `kat-toast--${config.position.replace('-', '--')}`);
    }

    // トーストの内容を作成
    let content = '';

    // アイコンの追加
    if (config.icon) {
      content += `<div class="kat-toast__icon">${config.icon}</div>`;
    }

    // メッセージの追加
    content += `<div class="kat-toast__message">${config.message}</div>`;

    // 閉じるボタンの追加
    if (config.dismissible) {
      content += `<button class="kat-toast__close" aria-label="閉じる">×</button>`;
    }

    toast.innerHTML = content;

    // データ属性の設定
    if (config.duration) {
      toast.setAttribute('data-duration', config.duration);
    }

    if (config.id) {
      toast.id = config.id;
    }

    // カスタムクラスの追加
    if (config.className) {
      utils.addClass(toast, config.className);
    }

    return toast;
  },

  /**
   * トーストを表示
   * @param {Element|Object} toastOrOptions - トースト要素またはオプション
   * @param {Object} options - 表示オプション
   */
  show: function(toastOrOptions, options = {}) {
    let toastElement;
    let config;

    if (toastOrOptions instanceof Element) {
      toastElement = toastOrOptions;
      config = { ...DEFAULT_CONFIG.toast, ...options };
    } else {
      config = { ...DEFAULT_CONFIG.toast, ...toastOrOptions, ...options };
      toastElement = this.create(config);
    }

    // コンテナを取得または作成
    let container = document.querySelector('.kat-toast-container');
    if (!container) {
      this.createContainer();
      container = document.querySelector('.kat-toast-container');
    }

    // 位置に応じてコンテナクラスを設定
    if (config.position) {
      const positionClasses = ['kat-toast-container--top-right', 'kat-toast-container--top-left', 'kat-toast-container--top-center', 'kat-toast-container--bottom-right', 'kat-toast-container--bottom-left', 'kat-toast-container--bottom-center'];
      positionClasses.forEach(className => utils.removeClass(container, className));
      utils.addClass(container, `kat-toast-container--${config.position.replace('-', '--')}`);
    }

    // コンテナに追加
    container.appendChild(toastElement);

    // 表示アニメーション
    requestAnimationFrame(() => {
      utils.addClass(toastElement, 'kat-toast--visible');
    });

    // 自動非表示のタイマーを設定
    if (config.duration && config.duration > 0) {
      this.startTimer(toastElement, config.duration);
    }

    // カスタムイベントを発火
    customEvents.dispatch(toastElement, KAT_UI.EVENTS.TOAST_SHOW, {
      toast: toastElement,
      config: config
    });

    return toastElement;
  },

  /**
   * タイマーを開始
   * @param {Element} toast - トースト要素
   * @param {number} duration - 表示時間（ミリ秒）
   */
  startTimer: function(toast, duration) {
    const timer = setTimeout(() => {
      if (toast.parentNode) {
        this.close(toast);
      }
    }, duration);

    toast.setAttribute('data-timer', timer);
  },

  /**
   * タイマーを一時停止
   * @param {Element} toast - トースト要素
   */
  pauseTimer: function(toast) {
    const timer = toast.getAttribute('data-timer');
    if (timer) {
      clearTimeout(parseInt(timer));
      toast.removeAttribute('data-timer');
    }
  },

  /**
   * タイマーを再開
   * @param {Element} toast - トースト要素
   */
  resumeTimer: function(toast) {
    const duration = toast.getAttribute('data-duration');
    if (duration && duration > 0) {
      this.startTimer(toast, parseInt(duration));
    }
  },

  /**
   * トーストを閉じる
   * @param {Element} toast - トースト要素
   */
  close: function(toast) {
    if (!toast) return;

    // タイマーをクリア
    this.pauseTimer(toast);

    // 閉じるアニメーションクラスを追加
    utils.addClass(toast, 'kat-toast--closing');

    // アニメーション完了後にトーストを削除
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }

      // カスタムイベントを発火
      customEvents.dispatch(toast, KAT_UI.EVENTS.TOAST_CLOSE, {
        toast: toast
      });
    }, KAT_UI.TIMING.ANIMATION_DURATION);
  },

  /**
   * すべてのトーストを閉じる
   */
  closeAll: function() {
    const toasts = document.querySelectorAll('.kat-toast');
    toasts.forEach(toast => this.close(toast));
  },

  /**
   * 特定のトーストを閉じる
   * @param {string} id - トーストのID
   */
  closeById: function(id) {
    const toast = document.getElementById(id);
    if (toast) {
      this.close(toast);
    }
  },

  /**
   * トーストの更新
   * @param {Element} toast - トースト要素
   * @param {Object} options - 更新オプション
   */
  update: function(toast, options = {}) {
    if (!toast) return;

    // メッセージの更新
    if (options.message !== undefined) {
      const messageElement = toast.querySelector('.kat-toast__message');
      if (messageElement) {
        utils.setHTML(messageElement, options.message);
      }
    }

    // アイコンの更新
    if (options.icon !== undefined) {
      let iconElement = toast.querySelector('.kat-toast__icon');
      
      if (options.icon) {
        if (!iconElement) {
          iconElement = document.createElement('div');
          iconElement.className = 'kat-toast__icon';
          toast.insertBefore(iconElement, toast.firstChild);
        }
        iconElement.innerHTML = options.icon;
      } else {
        if (iconElement) {
          iconElement.remove();
        }
      }
    }

    // バリアントの更新
    if (options.variant !== undefined) {
      const variantClasses = ['kat-toast--primary', 'kat-toast--secondary', 'kat-toast--success', 'kat-toast--warning', 'kat-toast--danger'];
      variantClasses.forEach(className => utils.removeClass(toast, className));
      
      if (options.variant && options.variant !== 'default') {
        utils.addClass(toast, `kat-toast--${options.variant}`);
      }
    }

    // サイズの更新
    if (options.size !== undefined) {
      const sizeClasses = ['kat-toast--sm', 'kat-toast--md', 'kat-toast--lg', 'kat-toast--xl'];
      sizeClasses.forEach(className => utils.removeClass(toast, className));
      
      if (options.size && options.size !== 'md') {
        utils.addClass(toast, `kat-toast--${options.size}`);
      }
    }
  },

  /**
   * トーストの設定を更新
   * @param {Element} toast - トースト要素
   * @param {Object} options - 設定オプション
   */
  updateOptions: function(toast, options = {}) {
    if (!toast) return;

    const config = { ...DEFAULT_CONFIG.toast, ...options };

    // 閉じる可能の更新
    if (config.dismissible !== undefined) {
      if (config.dismissible) {
        // 閉じるボタンが存在しない場合は追加
        if (!toast.querySelector('.kat-toast__close')) {
          const closeButton = document.createElement('button');
          closeButton.className = 'kat-toast__close';
          closeButton.setAttribute('aria-label', '閉じる');
          closeButton.textContent = '×';
          toast.appendChild(closeButton);
        }
      } else {
        // 閉じるボタンを削除
        const closeButton = toast.querySelector('.kat-toast__close');
        if (closeButton) {
          closeButton.remove();
        }
      }
    }

    // 表示時間の更新
    if (config.duration !== undefined) {
      toast.setAttribute('data-duration', config.duration);
      
      // 既存のタイマーをリセット
      this.pauseTimer(toast);
      if (config.duration > 0) {
        this.startTimer(toast, config.duration);
      }
    }
  },

  /**
   * トーストの状態を取得
   * @param {Element} toast - トースト要素
   * @returns {Object} トーストの状態情報
   */
  getState: function(toast) {
    if (!toast) return null;

    return {
      isVisible: utils.hasClass(toast, 'kat-toast--visible'),
      isClosing: utils.hasClass(toast, 'kat-toast--closing'),
      variant: this.getVariant(toast),
      size: this.getSize(toast),
      dismissible: !!toast.querySelector('.kat-toast__close'),
      hasIcon: !!toast.querySelector('.kat-toast__icon'),
      message: toast.querySelector('.kat-toast__message')?.textContent || '',
      duration: toast.getAttribute('data-duration'),
      id: toast.id
    };
  },

  /**
   * トーストのバリアントを取得
   * @param {Element} toast - トースト要素
   * @returns {string} バリアント
   */
  getVariant: function(toast) {
    if (!toast) return 'default';

    const variants = ['primary', 'secondary', 'success', 'warning', 'danger'];
    for (const variant of variants) {
      if (utils.hasClass(toast, `kat-toast--${variant}`)) {
        return variant;
      }
    }
    return 'default';
  },

  /**
   * トーストのサイズを取得
   * @param {Element} toast - トースト要素
   * @returns {string} サイズ
   */
  getSize: function(toast) {
    if (!toast) return 'md';

    const sizes = ['sm', 'md', 'lg', 'xl'];
    for (const size of sizes) {
      if (utils.hasClass(toast, `kat-toast--${size}`)) {
        return size;
      }
    }
    return 'md';
  },

  /**
   * トーストの破棄
   * @param {Element} toast - トースト要素
   */
  destroy: function(toast) {
    if (!toast) return;

    // トーストを閉じる
    this.close(toast);
  }
};

// デフォルト設定
const DEFAULT_CONFIG = {
  toast: {
    variant: 'default',
    size: 'md',
    message: '',
    icon: null,
    dismissible: true,
    duration: 5000,
    position: 'top-right',
    id: null,
    className: null
  }
};
