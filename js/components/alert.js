/**
 * Kat UI - アラートコンポーネント
 * アラートの表示・非表示・スタイリングを管理
 */

import { KAT_UI } from '../core/constants.js';
import { utils } from '../core/utils.js';
import { customEvents } from '../core/events.js';

export const alert = {
  /**
   * アラートの初期化
   */
  init: function() {
    this.bindEvents();
  },

  /**
   * イベントのバインド
   */
  bindEvents: function() {
    // アラートを閉じるボタンのイベント
    utils.delegate(document, 'click', '.kat-alert__close', (e) => {
      const alert = e.target.closest('.kat-alert');
      if (alert) {
        this.close(alert);
      }
    });

    // アラートの自動非表示
    this.initAutoHide();
  },

  /**
   * 自動非表示の初期化
   */
  initAutoHide: function() {
    const alerts = document.querySelectorAll('.kat-alert[data-auto-hide]');
    
    alerts.forEach(alert => {
      const delay = parseInt(alert.getAttribute('data-auto-hide')) || 5000;
      setTimeout(() => {
        if (alert.parentNode) {
          this.close(alert);
        }
      }, delay);
    });
  },

  /**
   * アラートの作成
   * @param {Object} options - アラートオプション
   * @returns {Element} 作成されたアラート要素
   */
  create: function(options = {}) {
    const config = { ...DEFAULT_CONFIG.alert, ...options };
    
    const alert = document.createElement('div');
    alert.className = 'kat-alert';
    
    // バリアントクラスの追加
    if (config.variant && config.variant !== 'default') {
      utils.addClass(alert, `kat-alert--${config.variant}`);
    }

    // サイズクラスの追加
    if (config.size && config.size !== 'md') {
      utils.addClass(alert, `kat-alert--${config.size}`);
    }

    // 閉じるボタンの設定
    if (config.dismissible) {
      utils.addClass(alert, 'kat-alert--dismissible');
    }

    // アイコンの設定
    if (config.icon) {
      utils.addClass(alert, 'kat-alert--with-icon');
    }

    // アラートの内容を作成
    let content = '';

    // アイコンの追加
    if (config.icon) {
      content += `<div class="kat-alert__icon">${config.icon}</div>`;
    }

    // メッセージの追加
    content += `<div class="kat-alert__message">${config.message}</div>`;

    // 閉じるボタンの追加
    if (config.dismissible) {
      content += `<button class="kat-alert__close" aria-label="閉じる">×</button>`;
    }

    alert.innerHTML = content;

    // 自動非表示の設定
    if (config.autoHide) {
      alert.setAttribute('data-auto-hide', config.autoHide);
    }

    // カスタムクラスの追加
    if (config.className) {
      utils.addClass(alert, config.className);
    }

    return alert;
  },

  /**
   * アラートを表示
   * @param {Element|Object} alertOrOptions - アラート要素またはオプション
   * @param {Element} container - 表示するコンテナ
   */
  show: function(alertOrOptions, container = document.body) {
    let alertElement;

    if (alertOrOptions instanceof Element) {
      alertElement = alertOrOptions;
    } else {
      alertElement = this.create(alertOrOptions);
    }

    // コンテナに追加
    if (container === document.body) {
      // bodyの場合は固定位置で表示
      utils.addClass(alertElement, 'kat-alert--fixed');
      container.appendChild(alertElement);
    } else {
      container.appendChild(alertElement);
    }

    // 表示アニメーション
    requestAnimationFrame(() => {
      utils.addClass(alertElement, 'kat-alert--visible');
    });

    // カスタムイベントを発火
    customEvents.dispatch(alertElement, KAT_UI.EVENTS.ALERT_SHOW, {
      alert: alertElement,
      container: container
    });

    return alertElement;
  },

  /**
   * アラートを閉じる
   * @param {Element} alert - アラート要素
   */
  close: function(alert) {
    if (!alert) return;

    // 閉じるアニメーションクラスを追加
    utils.addClass(alert, 'kat-alert--closing');

    // アニメーション完了後にアラートを削除
    setTimeout(() => {
      if (alert.parentNode) {
        alert.parentNode.removeChild(alert);
      }

      // カスタムイベントを発火
      customEvents.dispatch(alert, KAT_UI.EVENTS.ALERT_CLOSE, {
        alert: alert
      });
    }, KAT_UI.TIMING.ANIMATION_DURATION);
  },

  /**
   * すべてのアラートを閉じる
   * @param {Element} container - 対象コンテナ
   */
  closeAll: function(container = document.body) {
    const alerts = container.querySelectorAll('.kat-alert');
    alerts.forEach(alert => this.close(alert));
  },

  /**
   * アラートの更新
   * @param {Element} alert - アラート要素
   * @param {Object} options - 更新オプション
   */
  update: function(alert, options = {}) {
    if (!alert) return;

    // メッセージの更新
    if (options.message !== undefined) {
      const messageElement = alert.querySelector('.kat-alert__message');
      if (messageElement) {
        utils.setHTML(messageElement, options.message);
      }
    }

    // アイコンの更新
    if (options.icon !== undefined) {
      let iconElement = alert.querySelector('.kat-alert__icon');
      
      if (options.icon) {
        if (!iconElement) {
          iconElement = document.createElement('div');
          iconElement.className = 'kat-alert__icon';
          alert.insertBefore(iconElement, alert.firstChild);
          utils.addClass(alert, 'kat-alert--with-icon');
        }
        iconElement.innerHTML = options.icon;
      } else {
        if (iconElement) {
          iconElement.remove();
          utils.removeClass(alert, 'kat-alert--with-icon');
        }
      }
    }

    // バリアントの更新
    if (options.variant !== undefined) {
      const variantClasses = ['kat-alert--primary', 'kat-alert--secondary', 'kat-alert--success', 'kat-alert--warning', 'kat-alert--danger'];
      variantClasses.forEach(className => utils.removeClass(alert, className));
      
      if (options.variant && options.variant !== 'default') {
        utils.addClass(alert, `kat-alert--${options.variant}`);
      }
    }

    // サイズの更新
    if (options.size !== undefined) {
      const sizeClasses = ['kat-alert--sm', 'kat-alert--md', 'kat-alert--lg', 'kat-alert--xl'];
      sizeClasses.forEach(className => utils.removeClass(alert, className));
      
      if (options.size && options.size !== 'md') {
        utils.addClass(alert, `kat-alert--${options.size}`);
      }
    }
  },

  /**
   * アラートの設定を更新
   * @param {Element} alert - アラート要素
   * @param {Object} options - 設定オプション
   */
  updateOptions: function(alert, options = {}) {
    if (!alert) return;

    const config = { ...DEFAULT_CONFIG.alert, ...options };

    // 閉じる可能の更新
    if (config.dismissible !== undefined) {
      if (config.dismissible) {
        utils.addClass(alert, 'kat-alert--dismissible');
        
        // 閉じるボタンが存在しない場合は追加
        if (!alert.querySelector('.kat-alert__close')) {
          const closeButton = document.createElement('button');
          closeButton.className = 'kat-alert__close';
          closeButton.setAttribute('aria-label', '閉じる');
          closeButton.textContent = '×';
          alert.appendChild(closeButton);
        }
      } else {
        utils.removeClass(alert, 'kat-alert--dismissible');
        
        // 閉じるボタンを削除
        const closeButton = alert.querySelector('.kat-alert__close');
        if (closeButton) {
          closeButton.remove();
        }
      }
    }

    // 自動非表示の更新
    if (config.autoHide !== undefined) {
      if (config.autoHide) {
        alert.setAttribute('data-auto-hide', config.autoHide);
        
        // 自動非表示のタイマーを設定
        setTimeout(() => {
          if (alert.parentNode) {
            this.close(alert);
          }
        }, config.autoHide);
      } else {
        alert.removeAttribute('data-auto-hide');
      }
    }
  },

  /**
   * アラートの状態を取得
   * @param {Element} alert - アラート要素
   * @returns {Object} アラートの状態情報
   */
  getState: function(alert) {
    if (!alert) return null;

    return {
      isVisible: utils.hasClass(alert, 'kat-alert--visible'),
      isClosing: utils.hasClass(alert, 'kat-alert--closing'),
      variant: this.getVariant(alert),
      size: this.getSize(alert),
      dismissible: utils.hasClass(alert, 'kat-alert--dismissible'),
      hasIcon: utils.hasClass(alert, 'kat-alert--with-icon'),
      message: alert.querySelector('.kat-alert__message')?.textContent || ''
    };
  },

  /**
   * アラートのバリアントを取得
   * @param {Element} alert - アラート要素
   * @returns {string} バリアント
   */
  getVariant: function(alert) {
    if (!alert) return 'default';

    const variants = ['primary', 'secondary', 'success', 'warning', 'danger'];
    for (const variant of variants) {
      if (utils.hasClass(alert, `kat-alert--${variant}`)) {
        return variant;
      }
    }
    return 'default';
  },

  /**
   * アラートのサイズを取得
   * @param {Element} alert - アラート要素
   * @returns {string} サイズ
   */
  getSize: function(alert) {
    if (!alert) return 'md';

    const sizes = ['sm', 'md', 'lg', 'xl'];
    for (const size of sizes) {
      if (utils.hasClass(alert, `kat-alert--${size}`)) {
        return size;
      }
    }
    return 'md';
  },

  /**
   * アラートの破棄
   * @param {Element} alert - アラート要素
   */
  destroy: function(alert) {
    if (!alert) return;

    // アラートを閉じる
    this.close(alert);
  }
};

// デフォルト設定
const DEFAULT_CONFIG = {
  alert: {
    variant: 'default',
    size: 'md',
    message: '',
    icon: null,
    dismissible: true,
    autoHide: false,
    className: null
  }
};
