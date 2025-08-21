/**
 * Kat UI - カードコンポーネント
 * カードの表示・スタイリング・インタラクションを管理
 */

import { KAT_UI } from '../core/constants.js';
import { utils } from '../core/utils.js';
import { customEvents } from '../core/events.js';

export const card = {
  /**
   * カードの初期化
   */
  init: function() {
    this.bindEvents();
  },

  /**
   * イベントのバインド
   */
  bindEvents: function() {
    // カードのクリックイベント
    utils.delegate(document, 'click', '.kat-card', (e) => {
      if (e.target.closest('.kat-card__action')) return;
      
      const card = e.currentTarget;
      if (utils.hasClass(card, 'kat-card--clickable')) {
        this.handleClick(card, e);
      }
    });

    // カードアクションボタンのイベント
    utils.delegate(document, 'click', '.kat-card__action', (e) => {
      e.stopPropagation();
      const action = e.target.closest('.kat-card__action');
      const card = action.closest('.kat-card');
      
      if (action && card) {
        this.handleAction(card, action, e);
      }
    });

    // カードのホバーイベント
    utils.delegate(document, 'mouseenter', '.kat-card--hoverable', (e) => {
      const card = e.currentTarget;
      this.handleHover(card, 'enter');
    });

    utils.delegate(document, 'mouseleave', '.kat-card--hoverable', (e) => {
      const card = e.currentTarget;
      this.handleHover(card, 'leave');
    });
  },

  /**
   * カードクリックの処理
   * @param {Element} card - カード要素
   * @param {Event} event - クリックイベント
   */
  handleClick: function(card, event) {
    const href = card.getAttribute('data-href');
    const target = card.getAttribute('data-target');
    
    if (href) {
      if (target === '_blank') {
        window.open(href, '_blank');
      } else {
        window.location.href = href;
      }
    }

    // カスタムイベントを発火
    customEvents.dispatch(card, KAT_UI.EVENTS.CARD_CLICK, {
      card: card,
      event: event,
      href: href,
      target: target
    });
  },

  /**
   * カードアクションの処理
   * @param {Element} card - カード要素
   * @param {Element} action - アクション要素
   * @param {Event} event - クリックイベント
   */
  handleAction: function(card, action, event) {
    const actionType = action.getAttribute('data-action');
    const actionData = action.getAttribute('data-action-data');

    // カスタムイベントを発火
    customEvents.dispatch(card, KAT_UI.EVENTS.CARD_ACTION, {
      card: card,
      action: action,
      actionType: actionType,
      actionData: actionData,
      event: event
    });
  },

  /**
   * カードホバーの処理
   * @param {Element} card - カード要素
   * @param {string} type - ホバータイプ（enter/leave）
   */
  handleHover: function(card, type) {
    if (type === 'enter') {
      utils.addClass(card, 'kat-card--hovered');
    } else {
      utils.removeClass(card, 'kat-card--hovered');
    }

    // カスタムイベントを発火
    customEvents.dispatch(card, KAT_UI.EVENTS.CARD_HOVER, {
      card: card,
      type: type
    });
  },

  /**
   * カードの作成
   * @param {Object} options - カードオプション
   * @returns {Element} 作成されたカード要素
   */
  create: function(options = {}) {
    const config = { ...DEFAULT_CONFIG.card, ...options };
    
    const card = document.createElement('div');
    card.className = 'kat-card';
    
    // バリアントクラスの追加
    if (config.variant && config.variant !== 'default') {
      utils.addClass(card, `kat-card--${config.variant}`);
    }

    // サイズクラスの追加
    if (config.size && config.size !== 'md') {
      utils.addClass(card, `kat-card--${config.size}`);
    }

    // クリック可能なカード
    if (config.clickable) {
      utils.addClass(card, 'kat-card--clickable');
      if (config.href) {
        card.setAttribute('data-href', config.href);
      }
      if (config.target) {
        card.setAttribute('data-target', config.target);
      }
    }

    // ホバー可能なカード
    if (config.hoverable) {
      utils.addClass(card, 'kat-card--hoverable');
    }

    // ヘッダーの作成
    if (config.header) {
      const header = document.createElement('div');
      header.className = 'kat-card__header';
      
      if (typeof config.header === 'string') {
        header.innerHTML = config.header;
      } else {
        header.innerHTML = config.header.content || '';
        if (config.header.className) {
          utils.addClass(header, config.header.className);
        }
      }
      
      card.appendChild(header);
    }

    // 画像の作成
    if (config.image) {
      const image = document.createElement('div');
      image.className = 'kat-card__image';
      
      if (typeof config.image === 'string') {
        image.innerHTML = `<img src="${config.image}" alt="">`;
      } else {
        image.innerHTML = `<img src="${config.image.src}" alt="${config.image.alt || ''}">`;
        if (config.image.className) {
          utils.addClass(image, config.image.className);
        }
      }
      
      card.appendChild(image);
    }

    // ボディの作成
    if (config.body) {
      const body = document.createElement('div');
      body.className = 'kat-card__body';
      
      if (typeof config.body === 'string') {
        body.innerHTML = config.body;
      } else {
        body.innerHTML = config.body.content || '';
        if (config.body.className) {
          utils.addClass(body, config.body.className);
        }
      }
      
      card.appendChild(body);
    }

    // フッターの作成
    if (config.footer) {
      const footer = document.createElement('div');
      footer.className = 'kat-card__footer';
      
      if (typeof config.footer === 'string') {
        footer.innerHTML = config.footer;
      } else {
        footer.innerHTML = config.footer.content || '';
        if (config.footer.className) {
          utils.addClass(footer, config.footer.className);
        }
      }
      
      card.appendChild(footer);
    }

    // アクションボタンの作成
    if (config.actions && Array.isArray(config.actions)) {
      config.actions.forEach(action => {
        const actionElement = document.createElement('button');
        actionElement.className = 'kat-card__action';
        actionElement.setAttribute('data-action', action.type || 'default');
        actionElement.setAttribute('data-action-data', action.data || '');
        actionElement.textContent = action.label || 'Action';
        
        if (action.className) {
          utils.addClass(actionElement, action.className);
        }
        
        if (action.onClick) {
          actionElement.addEventListener('click', action.onClick);
        }
        
        card.appendChild(actionElement);
      });
    }

    return card;
  },

  /**
   * カードの更新
   * @param {Element} card - カード要素
   * @param {Object} options - 更新オプション
   */
  update: function(card, options = {}) {
    if (!card) return;

    // ヘッダーの更新
    if (options.header !== undefined) {
      const header = card.querySelector('.kat-card__header');
      if (header) {
        if (typeof options.header === 'string') {
          utils.setHTML(header, options.header);
        } else {
          utils.setHTML(header, options.header.content || '');
          if (options.header.className) {
            utils.addClass(header, options.header.className);
          }
        }
      }
    }

    // 画像の更新
    if (options.image !== undefined) {
      const image = card.querySelector('.kat-card__image');
      if (image) {
        if (typeof options.image === 'string') {
          image.innerHTML = `<img src="${options.image}" alt="">`;
        } else {
          image.innerHTML = `<img src="${options.image.src}" alt="${options.image.alt || ''}">`;
          if (options.image.className) {
            utils.addClass(image, options.image.className);
          }
        }
      }
    }

    // ボディの更新
    if (options.body !== undefined) {
      const body = card.querySelector('.kat-card__body');
      if (body) {
        if (typeof options.body === 'string') {
          utils.setHTML(body, options.body);
        } else {
          utils.setHTML(body, options.body.content || '');
          if (options.body.className) {
            utils.addClass(body, options.body.className);
          }
        }
      }
    }

    // フッターの更新
    if (options.footer !== undefined) {
      const footer = card.querySelector('.kat-card__footer');
      if (footer) {
        if (typeof options.footer === 'string') {
          utils.setHTML(footer, options.footer);
        } else {
          utils.setHTML(footer, options.footer.content || '');
          if (options.footer.className) {
            utils.addClass(footer, options.footer.className);
          }
        }
      }
    }
  },

  /**
   * カードの設定を更新
   * @param {Element} card - カード要素
   * @param {Object} options - 設定オプション
   */
  updateOptions: function(card, options = {}) {
    if (!card) return;

    const config = { ...DEFAULT_CONFIG.card, ...options };

    // バリアントの更新
    if (config.variant !== undefined) {
      const variantClasses = ['kat-card--primary', 'kat-card--secondary', 'kat-card--success', 'kat-card--warning', 'kat-card--danger'];
      variantClasses.forEach(className => utils.removeClass(card, className));
      
      if (config.variant && config.variant !== 'default') {
        utils.addClass(card, `kat-card--${config.variant}`);
      }
    }

    // サイズの更新
    if (config.size !== undefined) {
      const sizeClasses = ['kat-card--sm', 'kat-card--md', 'kat-card--lg', 'kat-card--xl'];
      sizeClasses.forEach(className => utils.removeClass(card, className));
      
      if (config.size && config.size !== 'md') {
        utils.addClass(card, `kat-card--${config.size}`);
      }
    }

    // クリック可能の更新
    if (config.clickable !== undefined) {
      if (config.clickable) {
        utils.addClass(card, 'kat-card--clickable');
        if (config.href) {
          card.setAttribute('data-href', config.href);
        }
        if (config.target) {
          card.setAttribute('data-target', config.target);
        }
      } else {
        utils.removeClass(card, 'kat-card--clickable');
        card.removeAttribute('data-href');
        card.removeAttribute('data-target');
      }
    }

    // ホバー可能の更新
    if (config.hoverable !== undefined) {
      if (config.hoverable) {
        utils.addClass(card, 'kat-card--hoverable');
      } else {
        utils.removeClass(card, 'kat-card--hoverable');
        utils.removeClass(card, 'kat-card--hovered');
      }
    }
  },

  /**
   * カードの破棄
   * @param {Element} card - カード要素
   */
  destroy: function(card) {
    if (!card) return;

    // アクションボタンのイベントリスナーを削除
    const actions = card.querySelectorAll('.kat-card__action');
    actions.forEach(action => {
      action.removeEventListener('click', this.handleAction);
    });

    // カード要素を削除
    if (card.parentNode) {
      card.parentNode.removeChild(card);
    }
  }
};

// デフォルト設定
const DEFAULT_CONFIG = {
  card: {
    variant: 'default',
    size: 'md',
    clickable: false,
    hoverable: false,
    header: null,
    image: null,
    body: null,
    footer: null,
    actions: []
  }
};
