/**
 * Kat UI - イベント管理システム
 * アプリケーション全体のイベント処理を一元管理
 */

import { KAT_UI } from './constants.js';

export const eventBus = {
  /**
   * イベントリスナーの登録
   * @param {string} event - イベント名
   * @param {Function} callback - コールバック関数
   * @param {Object} options - オプション
   */
  on: function(event, callback, options = {}) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    
    const listener = {
      callback,
      options,
      id: this.generateId()
    };
    
    this.events[event].push(listener);
    return listener.id;
  },

  /**
   * イベントリスナーの削除
   * @param {string} event - イベント名
   * @param {Function|string} callback - コールバック関数またはリスナーID
   */
  off: function(event, callback) {
    if (!this.events[event]) return;
    
    if (typeof callback === 'string') {
      // IDで削除
      this.events[event] = this.events[event].filter(listener => listener.id !== callback);
    } else {
      // コールバック関数で削除
      this.events[event] = this.events[event].filter(listener => listener.callback !== callback);
    }
  },

  /**
   * イベントの発火
   * @param {string} event - イベント名
   * @param {*} data - イベントデータ
   */
  emit: function(event, data = null) {
    if (!this.events[event]) return;
    
    this.events[event].forEach(listener => {
      try {
        listener.callback(data);
      } catch (error) {
        console.error(`Error in event listener for ${event}:`, error);
      }
    });
  },

  /**
   * イベントの一度だけ実行
   * @param {string} event - イベント名
   * @param {Function} callback - コールバック関数
   */
  once: function(event, callback) {
    const onceCallback = (data) => {
      callback(data);
      this.off(event, onceCallback);
    };
    
    this.on(event, onceCallback);
  },

  /**
   * イベントリスナーの存在確認
   * @param {string} event - イベント名
   * @returns {boolean} 存在するかどうか
   */
  has: function(event) {
    return this.events[event] && this.events[event].length > 0;
  },

  /**
   * イベントリスナーの数を取得
   * @param {string} event - イベント名
   * @returns {number} リスナーの数
   */
  count: function(event) {
    return this.events[event] ? this.events[event].length : 0;
  },

  /**
   * すべてのイベントリスナーを削除
   * @param {string} event - イベント名（省略時はすべて）
   */
  clear: function(event = null) {
    if (event) {
      delete this.events[event];
    } else {
      this.events = {};
    }
  },

  /**
   * イベントリスナーIDの生成
   * @returns {string} ユニークID
   */
  generateId: function() {
    return 'kat_' + Math.random().toString(36).substr(2, 9);
  },

  // イベントストレージ
  events: {}
};

/**
 * カスタムイベントの作成と発火
 */
export const customEvents = {
  /**
   * カスタムイベントを作成
   * @param {string} eventName - イベント名
   * @param {Object} detail - イベント詳細
   * @returns {CustomEvent} カスタムイベント
   */
  create: function(eventName, detail = {}) {
    return new CustomEvent(eventName, {
      detail,
      bubbles: true,
      cancelable: true
    });
  },

  /**
   * カスタムイベントを発火
   * @param {Element} target - ターゲット要素
   * @param {string} eventName - イベント名
   * @param {Object} detail - イベント詳細
   */
  dispatch: function(target, eventName, detail = {}) {
    const event = this.create(eventName, detail);
    target.dispatchEvent(event);
  },

  /**
   * ドキュメント全体にカスタムイベントを発火
   * @param {string} eventName - イベント名
   * @param {Object} detail - イベント詳細
   */
  dispatchGlobal: function(eventName, detail = {}) {
    this.dispatch(document, eventName, detail);
  }
};

/**
 * イベントヘルパー関数
 */
export const eventHelpers = {
  /**
   * 要素のイベントリスナーを安全に追加
   * @param {Element} element - ターゲット要素
   * @param {string} eventType - イベントタイプ
   * @param {Function} handler - イベントハンドラー
   * @param {Object} options - オプション
   */
  safeAddEventListener: function(element, eventType, handler, options = {}) {
    if (element && typeof element.addEventListener === 'function') {
      element.addEventListener(eventType, handler, options);
      return true;
    }
    return false;
  },

  /**
   * 要素のイベントリスナーを安全に削除
   * @param {Element} element - ターゲット要素
   * @param {string} eventType - イベントタイプ
   * @param {Function} handler - イベントハンドラー
   * @param {Object} options - オプション
   */
  safeRemoveEventListener: function(element, eventType, handler, options = {}) {
    if (element && typeof element.removeEventListener === 'function') {
      element.removeEventListener(eventType, handler, options);
      return true;
    }
    return false;
  },

  /**
   * イベントのデフォルト動作を防止
   * @param {Event} event - イベントオブジェクト
   */
  preventDefault: function(event) {
    if (event && typeof event.preventDefault === 'function') {
      event.preventDefault();
    }
  },

  /**
   * イベントの伝播を停止
   * @param {Event} event - イベントオブジェクト
   */
  stopPropagation: function(event) {
    if (event && typeof event.stopPropagation === 'function') {
      event.stopPropagation();
    }
  },

  /**
   * イベントの即座の伝播を停止
   * @param {Event} event - イベントオブジェクト
   */
  stopImmediatePropagation: function(event) {
    if (event && typeof event.stopImmediatePropagation === 'function') {
      event.stopImmediatePropagation();
    }
  },

  /**
   * イベントがキャンセル可能かチェック
   * @param {Event} event - イベントオブジェクト
   * @returns {boolean} キャンセル可能かどうか
   */
  isCancelable: function(event) {
    return event && event.cancelable === true;
  },

  /**
   * イベントがバブルするかチェック
   * @param {Event} event - イベントオブジェクト
   * @returns {boolean} バブルするかどうか
   */
  isBubbling: function(event) {
    return event && event.bubbles === true;
  }
};

/**
 * キーボードイベントヘルパー
 */
export const keyboardEvents = {
  /**
   * 特定のキーが押されたかチェック
   * @param {KeyboardEvent} event - キーボードイベント
   * @param {string|Array} keys - チェックするキー
   * @returns {boolean} マッチするかどうか
   */
  isKey: function(event, keys) {
    if (!event || !event.key) return false;
    
    if (Array.isArray(keys)) {
      return keys.includes(event.key);
    }
    
    return event.key === keys;
  },

  /**
   * 修飾キーが押されているかチェック
   * @param {KeyboardEvent} event - キーボードイベント
   * @param {string|Array} modifiers - 修飾キー
   * @returns {boolean} 修飾キーが押されているかどうか
   */
  hasModifier: function(event, modifiers) {
    if (!event) return false;
    
    if (Array.isArray(modifiers)) {
      return modifiers.some(mod => event[mod]);
    }
    
    return event[modifiers];
  },

  /**
   * キーボードショートカットのチェック
   * @param {KeyboardEvent} event - キーボードイベント
   * @param {Object} shortcut - ショートカット設定
   * @returns {boolean} ショートカットが一致するかどうか
   */
  isShortcut: function(event, shortcut) {
    if (!event || !shortcut) return false;
    
    const keyMatch = this.isKey(event, shortcut.key);
    const ctrlMatch = !shortcut.ctrl || event.ctrlKey;
    const shiftMatch = !shortcut.shift || event.shiftKey;
    const altMatch = !shortcut.alt || event.altKey;
    const metaMatch = !shortcut.meta || event.metaKey;
    
    return keyMatch && ctrlMatch && shiftMatch && altMatch && metaMatch;
  }
};

/**
 * マウスイベントヘルパー
 */
export const mouseEvents = {
  /**
   * マウスボタンの種類を取得
   * @param {MouseEvent} event - マウスイベント
   * @returns {string} ボタンの種類
   */
  getButtonType: function(event) {
    if (!event) return 'unknown';
    
    switch (event.button) {
      case 0: return 'left';
      case 1: return 'middle';
      case 2: return 'right';
      default: return 'unknown';
    }
  },

  /**
   * マウスが要素内にあるかチェック
   * @param {Element} element - チェックする要素
   * @param {MouseEvent} event - マウスイベント
   * @returns {boolean} 要素内にあるかどうか
   */
  isInsideElement: function(element, event) {
    if (!element || !event) return false;
    
    const rect = element.getBoundingClientRect();
    const x = event.clientX;
    const y = event.clientY;
    
    return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
  }
};

/**
 * タッチイベントヘルパー
 */
export const touchEvents = {
  /**
   * タッチポイントの数を取得
   * @param {TouchEvent} event - タッチイベント
   * @returns {number} タッチポイントの数
   */
  getTouchCount: function(event) {
    return event ? event.touches.length : 0;
  },

  /**
   * タッチの移動距離を計算
   * @param {TouchEvent} startEvent - 開始タッチイベント
   * @param {TouchEvent} endEvent - 終了タッチイベント
   * @returns {Object} 移動距離
   */
  getTouchDistance: function(startEvent, endEvent) {
    if (!startEvent || !endEvent || !startEvent.touches[0] || !endEvent.touches[0]) {
      return { x: 0, y: 0, total: 0 };
    }
    
    const start = startEvent.touches[0];
    const end = endEvent.touches[0];
    
    const deltaX = end.clientX - start.clientX;
    const deltaY = end.clientY - start.clientY;
    const total = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    
    return { x: deltaX, y: deltaY, total };
  }
};

/**
 * イベントの初期化
 */
export const initEvents = function() {
  // グローバルイベントの設定
  eventBus.on(KAT_UI.EVENTS.READY, function() {
    console.log('Kat UI Events initialized');
  });
  
  // エラーハンドリング
  window.addEventListener('error', function(event) {
    eventBus.emit('kat:error', {
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      error: event.error
    });
  });
  
  // 未処理のPromise拒否
  window.addEventListener('unhandledrejection', function(event) {
    eventBus.emit('kat:unhandledrejection', {
      reason: event.reason,
      promise: event.promise
    });
  });
};
