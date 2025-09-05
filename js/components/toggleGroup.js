/**
 * Kat UI - トグルグループコンポーネント
 * トグルボタングループの選択・非選択状態を管理
 */

import { KAT_UI } from '../core/constants.js';
import { utils } from '../core/utils.js';
import { customEvents } from '../core/events.js';

export const toggleGroup = {
  /**
   * トグルグループの初期化
   */
  init: function() {
    this.bindEvents();
  },

  /**
   * イベントのバインド
   */
  bindEvents: function() {
    // トグルボタンのクリックイベント
    utils.delegate(document, 'click', '.kat-toggle-group__button', (e) => {
      const button = e.target.closest('.kat-toggle-group__button');
      const group = button.closest('.kat-toggle-group');
      
      if (button && group) {
        this.toggle(button, group);
      }
    });

    // キーボードナビゲーション
    utils.delegate(document, 'keydown', '.kat-toggle-group__button', (e) => {
      const button = e.target;
      const group = button.closest('.kat-toggle-group');
      
      if (group) {
        this.handleKeydown(e, button, group);
      }
    });
  },

  /**
   * トグルボタンの切り替え
   * @param {Element} button - トグルボタン要素
   * @param {Element} group - トグルグループ要素
   */
  toggle: function(button, group) {
    const isSelected = utils.hasClass(button, 'kat-toggle-group__button--selected');
    const allowMultiple = group.getAttribute('data-allow-multiple') === 'true';
    const required = group.getAttribute('data-required') === 'true';

    if (allowMultiple) {
      // 複数選択可能
      if (isSelected) {
        if (!required || group.querySelectorAll('.kat-toggle-group__button--selected').length > 1) {
          this.deselect(button);
        }
      } else {
        this.select(button);
      }
    } else {
      // 単一選択のみ
      if (!isSelected) {
        // 他のボタンを非選択にする
        const selectedButtons = group.querySelectorAll('.kat-toggle-group__button--selected');
        selectedButtons.forEach(btn => this.deselect(btn));
        
        // このボタンを選択する
        this.select(button);
      } else if (!required) {
        // 必須でない場合は選択解除可能
        this.deselect(button);
      }
    }

    // カスタムイベントを発火
    customEvents.dispatch(group, KAT_UI.EVENTS.TOGGLE_GROUP_CHANGE, {
      group: group,
      button: button,
      selectedButtons: this.getSelectedButtons(group)
    });
  },

  /**
   * ボタンを選択
   * @param {Element} button - トグルボタン要素
   */
  select: function(button) {
    utils.addClass(button, 'kat-toggle-group__button--selected');
    utils.setAttribute(button, KAT_UI.ARIA.PRESSED, 'true');
    
    // カスタムイベントを発火
    customEvents.dispatch(button, KAT_UI.EVENTS.TOGGLE_GROUP_SELECT, {
      button: button
    });
  },

  /**
   * ボタンの選択を解除
   * @param {Element} button - トグルボタン要素
   */
  deselect: function(button) {
    utils.removeClass(button, 'kat-toggle-group__button--selected');
    utils.setAttribute(button, KAT_UI.ARIA.PRESSED, 'false');
    
    // カスタムイベントを発火
    customEvents.dispatch(button, KAT_UI.EVENTS.TOGGLE_GROUP_DESELECT, {
      button: button
    });
  },

  /**
   * キーボードナビゲーションの処理
   * @param {KeyboardEvent} e - キーボードイベント
   * @param {Element} button - 現在のボタン要素
   * @param {Element} group - トグルグループ要素
   */
  handleKeydown: function(e, button, group) {
    const buttons = Array.from(group.querySelectorAll('.kat-toggle-group__button'));
    const currentIndex = buttons.indexOf(button);
    let nextIndex;

    switch (e.key) {
      case KAT_UI.KEYS.ARROW_LEFT:
        e.preventDefault();
        nextIndex = currentIndex > 0 ? currentIndex - 1 : buttons.length - 1;
        break;
      case KAT_UI.KEYS.ARROW_RIGHT:
        e.preventDefault();
        nextIndex = currentIndex < buttons.length - 1 ? currentIndex + 1 : 0;
        break;
      case KAT_UI.KEYS.HOME:
        e.preventDefault();
        nextIndex = 0;
        break;
      case KAT_UI.KEYS.END:
        e.preventDefault();
        nextIndex = buttons.length - 1;
        break;
      case KAT_UI.KEYS.SPACE:
      case KAT_UI.KEYS.ENTER:
        e.preventDefault();
        this.toggle(button, group);
        return;
      default:
        return;
    }

    utils.focus(buttons[nextIndex]);
  },

  /**
   * 選択されたボタンを取得
   * @param {Element} group - トグルグループ要素
   * @returns {Array} 選択されたボタンの配列
   */
  getSelectedButtons: function(group) {
    return Array.from(group.querySelectorAll('.kat-toggle-group__button--selected'));
  },

  /**
   * 選択されたボタンの値を取得
   * @param {Element} group - トグルグループ要素
   * @returns {Array} 選択されたボタンの値の配列
   */
  getSelectedValues: function(group) {
    const selectedButtons = this.getSelectedButtons(group);
    return selectedButtons.map(button => button.getAttribute('data-value') || button.textContent);
  },

  /**
   * 特定のボタンを選択
   * @param {Element} group - トグルグループ要素
   * @param {string|number} value - 選択するボタンの値またはインデックス
   */
  selectByValue: function(group, value) {
    const buttons = group.querySelectorAll('.kat-toggle-group__button');
    const allowMultiple = group.getAttribute('data-allow-multiple') === 'true';

    if (allowMultiple) {
      // 複数選択可能
      buttons.forEach(button => {
        const buttonValue = button.getAttribute('data-value') || button.textContent;
        if (buttonValue == value) {
          this.select(button);
        }
      });
    } else {
      // 単一選択のみ
      buttons.forEach(button => {
        const buttonValue = button.getAttribute('data-value') || button.textContent;
        if (buttonValue == value) {
          this.select(button);
        } else {
          this.deselect(button);
        }
      });
    }
  },

  /**
   * すべてのボタンを選択
   * @param {Element} group - トグルグループ要素
   */
  selectAll: function(group) {
    const allowMultiple = group.getAttribute('data-allow-multiple');
    if (allowMultiple !== 'true') return;

    const buttons = group.querySelectorAll('.kat-toggle-group__button');
    buttons.forEach(button => this.select(button));
  },

  /**
   * すべてのボタンの選択を解除
   * @param {Element} group - トグルグループ要素
   */
  deselectAll: function(group) {
    const required = group.getAttribute('data-required');
    if (required === 'true') return;

    const buttons = group.querySelectorAll('.kat-toggle-group__button');
    buttons.forEach(button => this.deselect(button));
  },

  /**
   * トグルグループの作成
   * @param {Object} options - トグルグループオプション
   * @returns {Element} 作成されたトグルグループ要素
   */
  create: function(options = {}) {
    const config = { ...DEFAULT_CONFIG.toggleGroup, ...options };
    
    const group = document.createElement('div');
    group.className = 'kat-toggle-group';
    
    // データ属性の設定
    if (config.allowMultiple) {
      group.setAttribute('data-allow-multiple', 'true');
    }
    if (config.required) {
      group.setAttribute('data-required', 'true');
    }
    if (config.size && config.size !== 'md') {
      utils.addClass(group, `kat-toggle-group--${config.size}`);
    }
    if (config.variant && config.variant !== 'default') {
      utils.addClass(group, `kat-toggle-group--${config.variant}`);
    }

    // ボタンの作成
    if (config.buttons && Array.isArray(config.buttons)) {
      config.buttons.forEach(buttonConfig => {
        const button = document.createElement('button');
        button.className = 'kat-toggle-group__button';
        button.setAttribute('type', 'button');
        button.setAttribute('role', 'button');
        button.setAttribute(KAT_UI.ARIA.PRESSED, 'false');
        
        if (buttonConfig.value) {
          button.setAttribute('data-value', buttonConfig.value);
        }
        if (buttonConfig.disabled) {
          button.disabled = true;
        }
        if (buttonConfig.selected) {
          utils.addClass(button, 'kat-toggle-group__button--selected');
          button.setAttribute(KAT_UI.ARIA.PRESSED, 'true');
        }
        
        button.textContent = buttonConfig.label || buttonConfig.value || '';
        
        group.appendChild(button);
      });
    }

    return group;
  },

  /**
   * トグルグループの更新
   * @param {Element} group - トグルグループ要素
   * @param {Object} options - 更新オプション
   */
  update: function(group, options = {}) {
    if (!group) return;

    // ボタンの更新
    if (options.buttons && Array.isArray(options.buttons)) {
      const existingButtons = group.querySelectorAll('.kat-toggle-group__button');
      
      // 既存のボタンを削除
      existingButtons.forEach(button => button.remove());
      
      // 新しいボタンを追加
      options.buttons.forEach(buttonConfig => {
        const button = document.createElement('button');
        button.className = 'kat-toggle-group__button';
        button.setAttribute('type', 'button');
        button.setAttribute('role', 'button');
        button.setAttribute(KAT_UI.ARIA.PRESSED, 'false');
        
        if (buttonConfig.value) {
          button.setAttribute('data-value', buttonConfig.value);
        }
        if (buttonConfig.disabled) {
          button.disabled = true;
        }
        if (buttonConfig.selected) {
          utils.addClass(button, 'kat-toggle-group__button--selected');
          button.setAttribute(KAT_UI.ARIA.PRESSED, 'true');
        }
        
        button.textContent = buttonConfig.label || buttonConfig.value || '';
        
        group.appendChild(button);
      });
    }
  },

  /**
   * トグルグループの設定を更新
   * @param {Element} group - トグルグループ要素
   * @param {Object} options - 設定オプション
   */
  updateOptions: function(group, options = {}) {
    if (!group) return;

    const config = { ...DEFAULT_CONFIG.toggleGroup, ...options };

    // 複数選択の設定
    if (config.allowMultiple !== undefined) {
      if (config.allowMultiple) {
        group.setAttribute('data-allow-multiple', 'true');
      } else {
        group.removeAttribute('data-allow-multiple');
        // 複数選択を無効にした場合、最初の選択されたボタンのみ残す
        const selectedButtons = this.getSelectedButtons(group);
        if (selectedButtons.length > 1) {
          selectedButtons.slice(1).forEach(button => this.deselect(button));
        }
      }
    }

    // 必須の設定
    if (config.required !== undefined) {
      if (config.required) {
        group.setAttribute('data-required', 'true');
      } else {
        group.removeAttribute('data-required');
      }
    }

    // サイズの設定
    if (config.size !== undefined) {
      const sizeClasses = ['kat-toggle-group--sm', 'kat-toggle-group--md', 'kat-toggle-group--lg', 'kat-toggle-group--xl'];
      sizeClasses.forEach(className => utils.removeClass(group, className));
      
      if (config.size && config.size !== 'md') {
        utils.addClass(group, `kat-toggle-group--${config.size}`);
      }
    }

    // バリアントの設定
    if (config.variant !== undefined) {
      const variantClasses = ['kat-toggle-group--outlined', 'kat-toggle-group--filled', 'kat-toggle-group--pill'];
      variantClasses.forEach(className => utils.removeClass(group, className));
      
      if (config.variant && config.variant !== 'default') {
        utils.addClass(group, `kat-toggle-group--${config.variant}`);
      }
    }
  },

  /**
   * トグルグループの破棄
   * @param {Element} group - トグルグループ要素
   */
  destroy: function(group) {
    if (!group) return;

    // イベントリスナーを削除
    const buttons = group.querySelectorAll('.kat-toggle-group__button');
    buttons.forEach(button => {
      button.removeEventListener('click', this.toggle);
      button.removeEventListener('keydown', this.handleKeydown);
    });

    // グループ要素を削除
    if (group.parentNode) {
      group.parentNode.removeChild(group);
    }
  }
};

// デフォルト設定
const DEFAULT_CONFIG = {
  toggleGroup: {
    allowMultiple: false,
    required: false,
    size: 'md',
    variant: 'default',
    buttons: []
  }
};
