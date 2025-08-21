/**
 * Kat UI - ユーティリティ関数
 * アプリケーション全体で使用される共通のヘルパー関数
 */

import { KAT_UI } from './constants.js';

// closest()メソッドのポリフィル（古いブラウザ対応）
if (!Element.prototype.closest) {
  Element.prototype.closest = function(s) {
    var el = this;
    do {
      if (el.matches && el.matches(s)) return el;
      el = el.parentElement || el.parentNode;
    } while (el !== null && el.nodeType === 1);
    return null;
  };
}

export const utils = {
  /**
   * DOM要素の取得
   * @param {string|Element} selector - セレクターまたは要素
   * @returns {NodeList|Array} 要素のコレクション
   */
  getElements: function(selector) {
    return typeof selector === 'string' ? document.querySelectorAll(selector) : [selector];
  },

  /**
   * イベント委譲
   * @param {Element} element - 親要素
   * @param {string} eventType - イベントタイプ
   * @param {string} selector - ターゲットセレクター
   * @param {Function} handler - イベントハンドラー
   */
  delegate: function(element, eventType, selector, handler) {
    element.addEventListener(eventType, function(e) {
      // e.targetがDOM要素であることを確認し、closestメソッドが利用可能かチェック
      if (e.target && e.target.closest && typeof e.target.closest === 'function') {
        const target = e.target.closest(selector);
        if (target) handler.call(target, e);
      }
    });
  },

  /**
   * フォーカストラップ
   * @param {Element} element - フォーカスを閉じ込める要素
   */
  trapFocus: function(element) {
    const focusableElements = element.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (!firstElement) return;

    element.addEventListener('keydown', function(e) {
      if (e.key === KAT_UI.KEYS.TAB) {
        if (e.shiftKey && document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        } else if (!e.shiftKey && document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    });

    firstElement.focus();
  },

  /**
   * デバウンス関数
   * @param {Function} func - 実行する関数
   * @param {number} wait - 待機時間（ミリ秒）
   * @returns {Function} デバウンスされた関数
   */
  debounce: function(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },

  /**
   * スロットル関数
   * @param {Function} func - 実行する関数
   * @param {number} limit - 制限時間（ミリ秒）
   * @returns {Function} スロットルされた関数
   */
  throttle: function(func, limit) {
    let inThrottle;
    return function() {
      const args = arguments;
      const context = this;
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  },

  /**
   * 要素の可視性チェック
   * @param {Element} element - チェックする要素
   * @returns {boolean} 可視かどうか
   */
  isElementVisible: function(element) {
    if (!element) return false;
    
    const rect = element.getBoundingClientRect();
    const style = window.getComputedStyle(element);
    
    return rect.width > 0 && 
           rect.height > 0 && 
           style.visibility !== 'hidden' && 
           style.display !== 'none' &&
           rect.top < window.innerHeight &&
           rect.bottom > 0;
  },

  /**
   * 要素の位置を取得
   * @param {Element} element - 位置を取得する要素
   * @returns {Object} 位置情報
   */
  getElementPosition: function(element) {
    const rect = element.getBoundingClientRect();
    return {
      top: rect.top + window.pageYOffset,
      left: rect.left + window.pageXOffset,
      right: rect.right + window.pageXOffset,
      bottom: rect.bottom + window.pageYOffset,
      width: rect.width,
      height: rect.height
    };
  },

  /**
   * スクロールバーの幅を計算
   * @returns {number} スクロールバーの幅
   */
  getScrollbarWidth: function() {
    const scrollDiv = document.createElement('div');
    scrollDiv.style.cssText = 'width: 100px; height: 100px; overflow: scroll; position: absolute; top: -9999px;';
    document.body.appendChild(scrollDiv);
    const scrollbarWidth = scrollDiv.offsetWidth - scrollDiv.clientWidth;
    document.body.removeChild(scrollDiv);
    return scrollbarWidth;
  },

  /**
   * CSS変数を設定
   * @param {string} property - CSS変数名
   * @param {string} value - 値
   */
  setCSSVariable: function(property, value) {
    document.documentElement.style.setProperty(property, value);
  },

  /**
   * CSS変数を取得
   * @param {string} property - CSS変数名
   * @returns {string} 値
   */
  getCSSVariable: function(property) {
    return getComputedStyle(document.documentElement).getPropertyValue(property);
  },

  /**
   * 要素にクラスを追加
   * @param {Element} element - 対象要素
   * @param {string} className - クラス名
   */
  addClass: function(element, className) {
    if (element && element.classList) {
      element.classList.add(className);
    }
  },

  /**
   * 要素からクラスを削除
   * @param {Element} element - 対象要素
   * @param {string} className - クラス名
   */
  removeClass: function(element, className) {
    if (element && element.classList) {
      element.classList.remove(className);
    }
  },

  /**
   * 要素のクラスを切り替え
   * @param {Element} element - 対象要素
   * @param {string} className - クラス名
   */
  toggleClass: function(element, className) {
    if (element && element.classList) {
      element.classList.toggle(className);
    }
  },

  /**
   * 要素にクラスが含まれているかチェック
   * @param {Element} element - 対象要素
   * @param {string} className - クラス名
   * @returns {boolean} 含まれているかどうか
   */
  hasClass: function(element, className) {
    return element && element.classList && element.classList.contains(className);
  },

  /**
   * 要素の属性を設定
   * @param {Element} element - 対象要素
   * @param {string} attribute - 属性名
   * @param {string} value - 値
   */
  setAttribute: function(element, attribute, value) {
    if (element) {
      element.setAttribute(attribute, value);
    }
  },

  /**
   * 要素の属性を取得
   * @param {Element} element - 対象要素
   * @param {string} attribute - 属性名
   * @returns {string} 属性値
   */
  getAttribute: function(element, attribute) {
    return element ? element.getAttribute(attribute) : null;
  },

  /**
   * 要素の属性を削除
   * @param {Element} element - 対象要素
   * @param {string} attribute - 属性名
   */
  removeAttribute: function(element, attribute) {
    if (element) {
      element.removeAttribute(attribute);
    }
  },

  /**
   * 要素を表示
   * @param {Element} element - 対象要素
   */
  show: function(element) {
    if (element) {
      element.style.display = '';
      this.removeClass(element, 'kat-hidden');
    }
  },

  /**
   * 要素を非表示
   * @param {Element} element - 対象要素
   */
  hide: function(element) {
    if (element) {
      element.style.display = 'none';
      this.addClass(element, 'kat-hidden');
    }
  },

  /**
   * 要素の表示状態を切り替え
   * @param {Element} element - 対象要素
   */
  toggle: function(element) {
    if (element) {
      if (this.isElementVisible(element)) {
        this.hide(element);
      } else {
        this.show(element);
      }
    }
  },

  /**
   * 要素を有効化
   * @param {Element} element - 対象要素
   */
  enable: function(element) {
    if (element) {
      element.disabled = false;
      this.removeClass(element, 'kat-disabled');
    }
  },

  /**
   * 要素を無効化
   * @param {Element} element - 対象要素
   */
  disable: function(element) {
    if (element) {
      element.disabled = true;
      this.addClass(element, 'kat-disabled');
    }
  },

  /**
   * 要素の無効状態を切り替え
   * @param {Element} element - 対象要素
   */
  toggleDisabled: function(element) {
    if (element) {
      if (element.disabled) {
        this.enable(element);
      } else {
        this.disable(element);
      }
    }
  },

  /**
   * 要素のテキストを設定
   * @param {Element} element - 対象要素
   * @param {string} text - テキスト
   */
  setText: function(element, text) {
    if (element) {
      element.textContent = text;
    }
  },

  /**
   * 要素のHTMLを設定
   * @param {Element} element - 対象要素
   * @param {string} html - HTML
   */
  setHTML: function(element, html) {
    if (element) {
      element.innerHTML = html;
    }
  },

  /**
   * 要素の値を設定
   * @param {Element} element - 対象要素
   * @param {string} value - 値
   */
  setValue: function(element, value) {
    if (element) {
      element.value = value;
    }
  },

  /**
   * 要素の値を取得
   * @param {Element} element - 対象要素
   * @returns {string} 値
   */
  getValue: function(element) {
    return element ? element.value : '';
  },

  /**
   * 要素をフォーカス
   * @param {Element} element - 対象要素
   */
  focus: function(element) {
    if (element && typeof element.focus === 'function') {
      element.focus();
    }
  },

  /**
   * 要素からフォーカスを外す
   * @param {Element} element - 対象要素
   */
  blur: function(element) {
    if (element && typeof element.blur === 'function') {
      element.blur();
    }
  },

  /**
   * 要素をクリック
   * @param {Element} element - 対象要素
   */
  click: function(element) {
    if (element && typeof element.click === 'function') {
      element.click();
    }
  },

  /**
   * 要素をスクロール
   * @param {Element} element - 対象要素
   * @param {Object} options - スクロールオプション
   */
  scrollTo: function(element, options = {}) {
    if (element && typeof element.scrollIntoView === 'function') {
      element.scrollIntoView({
        behavior: options.behavior || 'smooth',
        block: options.block || 'start',
        inline: options.inline || 'nearest'
      });
    }
  },

  /**
   * 要素のサイズを取得
   * @param {Element} element - 対象要素
   * @returns {Object} サイズ情報
   */
  getSize: function(element) {
    if (!element) return { width: 0, height: 0 };
    
    const rect = element.getBoundingClientRect();
    return {
      width: rect.width,
      height: rect.height
    };
  },

  /**
   * 要素のサイズを設定
   * @param {Element} element - 対象要素
   * @param {Object} size - サイズ情報
   */
  setSize: function(element, size) {
    if (element) {
      if (size.width !== undefined) {
        element.style.width = typeof size.width === 'number' ? size.width + 'px' : size.width;
      }
      if (size.height !== undefined) {
        element.style.height = typeof size.height === 'number' ? size.height + 'px' : size.height;
      }
    }
  },

  /**
   * 要素の位置を設定
   * @param {Element} element - 対象要素
   * @param {Object} position - 位置情報
   */
  setPosition: function(element, position) {
    if (element) {
      if (position.top !== undefined) {
        element.style.top = typeof position.top === 'number' ? position.top + 'px' : position.top;
      }
      if (position.left !== undefined) {
        element.style.left = typeof position.left === 'number' ? position.left + 'px' : position.left;
      }
      if (position.right !== undefined) {
        element.style.right = typeof position.right === 'number' ? position.right + 'px' : position.right;
      }
      if (position.bottom !== undefined) {
        element.style.bottom = typeof position.bottom === 'number' ? position.bottom + 'px' : position.bottom;
      }
    }
  }
};
