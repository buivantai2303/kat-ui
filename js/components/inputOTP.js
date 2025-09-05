/**
 * Input OTP コンポーネント
 * ワンタイムパスワード入力フィールドの管理
 * 
 * @project: Kat UI
 * @author: Bui Van Tai, 2024-12-15
 * @version: 2.0.0
 */

import { eventBus } from '../core/events.js';

/**
 * Input OTP コンポーネント
 */
export const inputOTP = {
  /**
   * コンポーネントの初期化
   */
  init() {
    this.setupInputOTP();
    this.bindEvents();
  },

  /**
   * Input OTP フィールドの設定
   */
  setupInputOTP() {
    const otpInputs = document.querySelectorAll('.kat-input-otp__input');
    
    otpInputs.forEach((input, index) => {
      // 入力フィールドの設定
      input.setAttribute('maxlength', '1');
      input.setAttribute('inputmode', 'numeric');
      input.setAttribute('pattern', '[0-9]*');
      
      // データ属性の設定
      input.dataset.otpIndex = index;
      
      // フォーカス時の動作
      input.addEventListener('focus', () => {
        input.select();
      });
      
      // 入力時の動作
      input.addEventListener('input', (e) => {
        this.handleInput(e, index);
      });
      
      // キーダウンの動作
      input.addEventListener('keydown', (e) => {
        this.handleKeydown(e, index);
      });
      
      // ペースト時の動作
      input.addEventListener('paste', (e) => {
        this.handlePaste(e);
      });
    });
  },

  /**
   * イベントのバインド
   */
  bindEvents() {
    // フォーム送信時の処理
    document.addEventListener('submit', (e) => {
      if (e.target.closest('.kat-input-otp')) {
        this.handleSubmit(e);
      }
    });
  },

  /**
   * 入力処理
   * @param {Event} e - 入力イベント
   * @param {number} index - 入力フィールドのインデックス
   */
  handleInput(e, index) {
    const input = e.target;
    const value = input.value;
    
    // 数字以外の入力を無効化
    if (!/^[0-9]$/.test(value)) {
      input.value = '';
      return;
    }
    
    // 次のフィールドにフォーカス
    if (value && index < this.getMaxIndex()) {
      const nextInput = this.getInputByIndex(index + 1);
      if (nextInput) {
        nextInput.focus();
      }
    }
    
    // 入力完了イベントの発火
    this.dispatchInputEvent(index, value);
    
    // 全フィールドが入力されたかチェック
    this.checkCompletion();
  },

  /**
   * キーダウン処理
   * @param {Event} e - キーダウンイベント
   * @param {number} index - 入力フィールドのインデックス
   */
  handleKeydown(e, index) {
    const input = e.target;
    
    // バックスペースキーの処理
    if (e.key === 'Backspace' && !input.value && index > 0) {
      const prevInput = this.getInputByIndex(index - 1);
      if (prevInput) {
        prevInput.focus();
        prevInput.select();
      }
    }
    
    // 矢印キーの処理
    if (e.key === 'ArrowLeft' && index > 0) {
      const prevInput = this.getInputByIndex(index - 1);
      if (prevInput) {
        prevInput.focus();
      }
    }
    
    if (e.key === 'ArrowRight' && index < this.getMaxIndex()) {
      const nextInput = this.getInputByIndex(index + 1);
      if (nextInput) {
        nextInput.focus();
      }
    }
  },

  /**
   * ペースト処理
   * @param {Event} e - ペーストイベント
   */
  handlePaste(e) {
    e.preventDefault();
    
    const pastedData = (e.clipboardData || window.clipboardData).getData('text');
    const numbers = pastedData.replace(/\D/g, '').split('').slice(0, this.getMaxIndex() + 1);
    
    if (numbers.length > 0) {
      numbers.forEach((number, index) => {
        const input = this.getInputByIndex(index);
        if (input) {
          input.value = number;
          this.dispatchInputEvent(index, number);
        }
      });
      
      // 最後の入力フィールドにフォーカス
      const lastIndex = Math.min(numbers.length - 1, this.getMaxIndex());
      const lastInput = this.getInputByIndex(lastIndex);
      if (lastInput) {
        lastInput.focus();
      }
      
      this.checkCompletion();
    }
  },

  /**
   * フォーム送信処理
   * @param {Event} e - 送信イベント
   */
  handleSubmit(e) {
    const otpValue = this.getOTPValue();
    
    if (otpValue.length === this.getMaxIndex() + 1) {
      // 送信イベントの発火
      this.dispatchSubmitEvent(otpValue);
    } else {
      e.preventDefault();
      this.showError('OTPコードを完全に入力してください');
    }
  },

  /**
   * 完了チェック
   */
  checkCompletion() {
    const otpValue = this.getOTPValue();
    
    if (otpValue.length === this.getMaxIndex() + 1) {
      // 完了イベントの発火
      this.dispatchCompleteEvent(otpValue);
      
      // 完了状態の表示
      this.showCompleteState();
    }
  },

  /**
   * OTP値の取得
   * @returns {string} OTP値
   */
  getOTPValue() {
    const inputs = document.querySelectorAll('.kat-input-otp__input');
    return Array.from(inputs)
      .map(input => input.value)
      .join('');
  },

  /**
   * 最大インデックスの取得
   * @returns {number} 最大インデックス
   */
  getMaxIndex() {
    const inputs = document.querySelectorAll('.kat-input-otp__input');
    return inputs.length - 1;
  },

  /**
   * インデックスによる入力フィールドの取得
   * @param {number} index - インデックス
   * @returns {HTMLElement|null} 入力フィールド
   */
  getInputByIndex(index) {
    return document.querySelector(`[data-otp-index="${index}"]`);
  },

  /**
   * 入力イベントの発火
   * @param {number} index - インデックス
   * @param {string} value - 値
   */
  dispatchInputEvent(index, value) {
    eventBus.emit('kat:input-otp:input', { index, value });
    
    document.dispatchEvent(new CustomEvent('kat:input-otp:input', {
      detail: { index, value }
    }));
  },

  /**
   * 完了イベントの発火
   * @param {string} value - OTP値
   */
  dispatchCompleteEvent(value) {
    eventBus.emit('kat:input-otp:complete', { value });
    
    document.dispatchEvent(new CustomEvent('kat:input-otp:complete', {
      detail: { value }
    }));
  },

  /**
   * 送信イベントの発火
   * @param {string} value - OTP値
   */
  dispatchSubmitEvent(value) {
    eventBus.emit('kat:input-otp:submit', { value });
    
    document.dispatchEvent(new CustomEvent('kat:input-otp:submit', {
      detail: { value }
    }));
  },

  /**
   * 完了状態の表示
   */
  showCompleteState() {
    const container = document.querySelector('.kat-input-otp');
    if (container) {
      container.classList.add('kat-input-otp--complete');
    }
  },

  /**
   * エラーメッセージの表示
   * @param {string} message - エラーメッセージ
   */
  showError(message) {
    const container = document.querySelector('.kat-input-otp');
    if (container) {
      // 既存のエラーメッセージを削除
      const existingError = container.querySelector('.kat-input-otp__error');
      if (existingError) {
        existingError.remove();
      }
      
      // 新しいエラーメッセージを追加
      const errorElement = document.createElement('div');
      errorElement.className = 'kat-input-otp__error';
      errorElement.textContent = message;
      container.appendChild(errorElement);
      
      // エラー状態の表示
      container.classList.add('kat-input-otp--error');
      
      // 3秒後にエラーメッセージを削除
      setTimeout(() => {
        if (errorElement.parentNode) {
          errorElement.remove();
        }
        container.classList.remove('kat-input-otp--error');
      }, 3000);
    }
  },

  /**
   * コンポーネントの破棄
   */
  destroy() {
    const otpInputs = document.querySelectorAll('.kat-input-otp__input');
    
    otpInputs.forEach(input => {
      input.removeEventListener('input', this.handleInput);
      input.removeEventListener('keydown', this.handleKeydown);
      input.removeEventListener('paste', this.handlePaste);
      input.removeEventListener('focus', () => input.select());
    });
    
    document.removeEventListener('submit', this.handleSubmit);
  }
};
