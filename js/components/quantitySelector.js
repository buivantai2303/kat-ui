/**
 * Quantity Selector コンポーネント
 * 数量選択の管理（増加・減少・入力）
 * 
 * @project: Kat UI
 * @author: Bui Van Tai, 2024-12-15
 * @version: 1.0.0
 */

import { eventBus } from '../core/events.js';

/**
 * Quantity Selector コンポーネント
 */
export const quantitySelector = {
  /**
   * コンポーネントの初期化
   */
  init() {
    this.selectors = new Map();
    this.setupQuantitySelectors();
  },

  /**
   * 数量選択の設定
   */
  setupQuantitySelectors() {
    const selectorElements = document.querySelectorAll('.kat-quantity-selector');
    
    selectorElements.forEach((selector, index) => {
      const selectorId = `quantity-selector-${index}`;
      selector.dataset.selectorId = selectorId;
      
      const state = this.createQuantitySelectorState(selector);
      this.selectors.set(selectorId, state);
      this.setupQuantitySelector(selectorId);
    });
  },

  /**
   * 数量選択の状態を作成
   * @param {HTMLElement} selector - 数量選択要素
   * @returns {Object} 状態オブジェクト
   */
  createQuantitySelectorState(selector) {
    const input = selector.querySelector('.kat-quantity-selector__input');
    const decreaseBtn = selector.querySelector('.kat-quantity-selector__controls .kat-btn:first-child');
    const increaseBtn = selector.querySelector('.kat-quantity-selector__controls .kat-btn:last-child');
    
    return {
      selector,
      input,
      decreaseBtn,
      increaseBtn,
      min: parseInt(input?.getAttribute('min')) || 1,
      max: parseInt(input?.getAttribute('max')) || 999,
      step: parseInt(input?.getAttribute('step')) || 1
    };
  },

  /**
   * 個別数量選択の設定
   * @param {string} selectorId - 数量選択ID
   */
  setupQuantitySelector(selectorId) {
    const state = this.selectors.get(selectorId);
    if (!state) return;
    
    const { input, decreaseBtn, increaseBtn } = state;
    
    // 減少ボタンの設定
    if (decreaseBtn) {
      decreaseBtn.addEventListener('click', () => {
        this.decreaseQuantity(selectorId);
      });
    }
    
    // 増加ボタンの設定
    if (increaseBtn) {
      increaseBtn.addEventListener('click', () => {
        this.increaseQuantity(selectorId);
      });
    }
    
    // 入力フィールドの設定
    if (input) {
      input.addEventListener('input', () => {
        this.handleInputChange(selectorId);
      });
      
      input.addEventListener('blur', () => {
        this.validateInput(selectorId);
      });
    }
    
    // 初期状態の設定
    this.updateQuantitySelectorState(selectorId);
  },

  /**
   * 数量の減少
   * @param {string} selectorId - 数量選択ID
   */
  decreaseQuantity(selectorId) {
    const state = this.selectors.get(selectorId);
    if (!state || !state.input) return;
    
    const currentValue = parseInt(state.input.value) || state.min;
    const newValue = Math.max(currentValue - state.step, state.min);
    
    if (newValue !== currentValue) {
      state.input.value = newValue;
      this.updateQuantitySelectorState(selectorId);
      this.dispatchQuantityChangeEvent(selectorId, newValue);
    }
  },

  /**
   * 数量の増加
   * @param {string} selectorId - 数量選択ID
   */
  increaseQuantity(selectorId) {
    const state = this.selectors.get(selectorId);
    if (!state || !state.input) return;
    
    const currentValue = parseInt(state.input.value) || state.min;
    const newValue = Math.min(currentValue + state.step, state.max);
    
    if (newValue !== currentValue) {
      state.input.value = newValue;
      this.updateQuantitySelectorState(selectorId);
      this.dispatchQuantityChangeEvent(selectorId, newValue);
    }
  },

  /**
   * 入力変更の処理
   * @param {string} selectorId - 数量選択ID
   */
  handleInputChange(selectorId) {
    const state = this.selectors.get(selectorId);
    if (!state || !state.input) return;
    
    const value = state.input.value;
    
    // 数字以外の入力を無効化
    if (!/^\d*$/.test(value)) {
      state.input.value = value.replace(/\D/g, '');
    }
  },

  /**
   * 入力値の検証
   * @param {string} selectorId - 数量選択ID
   */
  validateInput(selectorId) {
    const state = this.selectors.get(selectorId);
    if (!state || !state.input) return;
    
    let value = parseInt(state.input.value) || state.min;
    
    // 範囲内に収める
    value = Math.max(Math.min(value, state.max), state.min);
    
    // ステップに合わせる
    const remainder = (value - state.min) % state.step;
    if (remainder !== 0) {
      value = Math.round((value - state.min) / state.step) * state.step + state.min;
    }
    
    state.input.value = value;
    this.updateQuantitySelectorState(selectorId);
    this.dispatchQuantityChangeEvent(selectorId, value);
  },

  /**
   * 数量選択状態の更新
   * @param {string} selectorId - 数量選択ID
   */
  updateQuantitySelectorState(selectorId) {
    const state = this.selectors.get(selectorId);
    if (!state) return;
    
    const { input, decreaseBtn, increaseBtn, min, max } = state;
    const currentValue = parseInt(input?.value) || min;
    
    // ボタンの有効/無効状態
    if (decreaseBtn) {
      decreaseBtn.disabled = currentValue <= min;
    }
    
    if (increaseBtn) {
      increaseBtn.disabled = currentValue >= max;
    }
  },

  /**
   * 数量変更イベントの発火
   * @param {string} selectorId - 数量選択ID
   * @param {number} value - 新しい数量
   */
  dispatchQuantityChangeEvent(selectorId, value) {
    eventBus.emit('kat:quantity-selector:change', { selectorId, value });
    
    document.dispatchEvent(new CustomEvent('kat:quantity-selector:change', {
      detail: { selectorId, value }
    }));
  },

  /**
   * 数量の設定
   * @param {string} selectorId - 数量選択ID
   * @param {number} value - 設定する数量
   */
  setQuantity(selectorId, value) {
    const state = this.selectors.get(selectorId);
    if (!state || !state.input) return;
    
    const validatedValue = Math.max(Math.min(value, state.max), state.min);
    state.input.value = validatedValue;
    
    this.updateQuantitySelectorState(selectorId);
    this.dispatchQuantityChangeEvent(selectorId, validatedValue);
  },

  /**
   * 数量の取得
   * @param {string} selectorId - 数量選択ID
   * @returns {number} 現在の数量
   */
  getQuantity(selectorId) {
    const state = this.selectors.get(selectorId);
    if (!state || !state.input) return state?.min || 1;
    
    return parseInt(state.input.value) || state.min;
  },

  /**
   * コンポーネントの破棄
   */
  destroy() {
    this.selectors.forEach((state, selectorId) => {
      const { input, decreaseBtn, increaseBtn } = state;
      
      // イベントリスナーの削除
      if (decreaseBtn) {
        decreaseBtn.removeEventListener('click', () => {});
      }
      
      if (increaseBtn) {
        increaseBtn.removeEventListener('click', () => {});
      }
      
      if (input) {
        input.removeEventListener('input', () => {});
        input.removeEventListener('blur', () => {});
      }
    });
    
    this.selectors.clear();
  }
};
