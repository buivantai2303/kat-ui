/**
 * Kat UI - レンジコンポーネント
 * レンジスライダーの値・スタイリング・インタラクションを管理
 */

import { KAT_UI } from '../core/constants.js';
import { utils } from '../core/utils.js';
import { customEvents } from '../core/events.js';

export const range = {
  /**
   * レンジの初期化
   */
  init: function() {
    this.bindEvents();
  },

  /**
   * イベントのバインド
   */
  bindEvents: function() {
    // レンジスライダーのイベント
    utils.delegate(document, 'input', '.kat-range__input', (e) => {
      const range = e.target.closest('.kat-range');
      if (range) {
        this.handleInput(e.target, range);
      }
    });

    // レンジスライダーのマウスダウンイベント
    utils.delegate(document, 'mousedown', '.kat-range__input', (e) => {
      const range = e.target.closest('.kat-range');
      if (range) {
        utils.addClass(range, 'kat-range--dragging');
      }
    });

    // レンジスライダーのマウスアップイベント
    utils.delegate(document, 'mouseup', '.kat-range__input', (e) => {
      const range = e.target.closest('.kat-range');
      if (range) {
        utils.removeClass(range, 'kat-range--dragging');
      }
    });

    // レンジスライダーのフォーカスイベント
    utils.delegate(document, 'focus', '.kat-range__input', (e) => {
      const range = e.target.closest('.kat-range');
      if (range) {
        utils.addClass(range, 'kat-range--focused');
      }
    });

    // レンジスライダーのブラーイベント
    utils.delegate(document, 'blur', '.kat-range__input', (e) => {
      const range = e.target.closest('.kat-range');
      if (range) {
        utils.removeClass(range, 'kat-range--focused');
      }
    });
  },

  /**
   * レンジ入力の処理
   * @param {Element} input - レンジ入力要素
   * @param {Element} range - レンジ要素
   */
  handleInput: function(input, range) {
    const value = parseFloat(input.value);
    const min = parseFloat(input.min) || 0;
    const max = parseFloat(input.max) || 100;
    const step = parseFloat(input.step) || 1;

    // 値の検証
    const validValue = Math.max(min, Math.min(max, value));
    
    // ステップに合わせて値を調整
    const steppedValue = Math.round(validValue / step) * step;
    
    // 入力値を更新
    input.value = steppedValue;

    // プログレスバーの更新
    this.updateProgress(input, range);

    // 値表示の更新
    this.updateValueDisplay(range, steppedValue);

    // カスタムイベントを発火
    customEvents.dispatch(range, KAT_UI.EVENTS.RANGE_CHANGE, {
      range: range,
      input: input,
      value: steppedValue,
      min: min,
      max: max,
      step: step
    });
  },

  /**
   * プログレスバーの更新
   * @param {Element} input - レンジ入力要素
   * @param {Element} range - レンジ要素
   */
  updateProgress: function(input, range) {
    const value = parseFloat(input.value);
    const min = parseFloat(input.min) || 0;
    const max = parseFloat(input.max) || 100;
    
    const percentage = ((value - min) / (max - min)) * 100;
    
    const progress = range.querySelector('.kat-range__progress');
    if (progress) {
      progress.style.width = percentage + '%';
    }

    const thumb = range.querySelector('.kat-range__thumb');
    if (thumb) {
      thumb.style.left = percentage + '%';
    }
  },

  /**
   * 値表示の更新
   * @param {Element} range - レンジ要素
   * @param {number} value - 現在の値
   */
  updateValueDisplay: function(range, value) {
    const valueDisplay = range.querySelector('.kat-range__value');
    if (valueDisplay) {
      const format = range.getAttribute('data-format') || 'number';
      
      switch (format) {
        case 'percentage':
          const min = parseFloat(range.querySelector('.kat-range__input').min) || 0;
          const max = parseFloat(range.querySelector('.kat-range__input').max) || 100;
          const percentage = ((value - min) / (max - min)) * 100;
          valueDisplay.textContent = Math.round(percentage) + '%';
          break;
        case 'currency':
          valueDisplay.textContent = '$' + value.toFixed(2);
          break;
        case 'decimal':
          const decimals = parseInt(range.getAttribute('data-decimals')) || 2;
          valueDisplay.textContent = value.toFixed(decimals);
          break;
        default:
          valueDisplay.textContent = value;
      }
    }
  },

  /**
   * レンジの作成
   * @param {Object} options - レンジオプション
   * @returns {Element} 作成されたレンジ要素
   */
  create: function(options = {}) {
    const config = { ...DEFAULT_CONFIG.range, ...options };
    
    const range = document.createElement('div');
    range.className = 'kat-range';
    
    // サイズクラスの追加
    if (config.size && config.size !== 'md') {
      utils.addClass(range, `kat-range--${config.size}`);
    }

    // バリアントクラスの追加
    if (config.variant && config.variant !== 'default') {
      utils.addClass(range, `kat-range--${config.variant}`);
    }

    // データ属性の設定
    if (config.format) {
      range.setAttribute('data-format', config.format);
    }
    if (config.decimals) {
      range.setAttribute('data-decimals', config.decimals);
    }
    if (config.showLabels) {
      range.setAttribute('data-show-labels', 'true');
    }
    if (config.showValue) {
      range.setAttribute('data-show-value', 'true');
    }

    // レンジの内容を作成
    let content = '';

    // ラベルの追加
    if (config.showLabels && config.label) {
      content += `<label class="kat-range__label">${config.label}</label>`;
    }

    // レンジコンテナ
    content += '<div class="kat-range__container">';
    
    // プログレスバー
    content += '<div class="kat-range__track">';
    content += '<div class="kat-range__progress"></div>';
    content += '<div class="kat-range__thumb"></div>';
    content += '</div>';

    // レンジ入力
    content += `<input type="range" class="kat-range__input" min="${config.min}" max="${config.max}" step="${config.step}" value="${config.value}"`;
    if (config.disabled) {
      content += ' disabled';
    }
    content += '>';

    // 値表示
    if (config.showValue) {
      content += `<div class="kat-range__value">${config.value}</div>`;
    }

    content += '</div>';

    // 最小・最大値の表示
    if (config.showLabels) {
      content += '<div class="kat-range__limits">';
      content += `<span class="kat-range__min">${config.min}</span>`;
      content += `<span class="kat-range__max">${config.max}</span>`;
      content += '</div>';
    }

    range.innerHTML = content;

    // 初期値の設定
    const input = range.querySelector('.kat-range__input');
    if (input) {
      this.updateProgress(input, range);
      this.updateValueDisplay(range, config.value);
    }

    return range;
  },

  /**
   * レンジの値を設定
   * @param {Element} range - レンジ要素
   * @param {number} value - 設定する値
   */
  setValue: function(range, value) {
    if (!range) return;

    const input = range.querySelector('.kat-range__input');
    if (input) {
      const min = parseFloat(input.min) || 0;
      const max = parseFloat(input.max) || 100;
      const step = parseFloat(input.step) || 1;

      // 値の検証
      const validValue = Math.max(min, Math.min(max, value));
      
      // ステップに合わせて値を調整
      const steppedValue = Math.round(validValue / step) * step;
      
      // 入力値を更新
      input.value = steppedValue;

      // プログレスバーと値表示を更新
      this.updateProgress(input, range);
      this.updateValueDisplay(range, steppedValue);

      // カスタムイベントを発火
      customEvents.dispatch(range, KAT_UI.EVENTS.RANGE_SET, {
        range: range,
        value: steppedValue
      });
    }
  },

  /**
   * レンジの値を取得
   * @param {Element} range - レンジ要素
   * @returns {number} 現在の値
   */
  getValue: function(range) {
    if (!range) return 0;

    const input = range.querySelector('.kat-range__input');
    return input ? parseFloat(input.value) : 0;
  },

  /**
   * レンジの設定を更新
   * @param {Element} range - レンジ要素
   * @param {Object} options - 設定オプション
   */
  updateOptions: function(range, options = {}) {
    if (!range) return;

    const config = { ...DEFAULT_CONFIG.range, ...options };

    // 最小値の更新
    if (config.min !== undefined) {
      const input = range.querySelector('.kat-range__input');
      if (input) {
        input.min = config.min;
        const minLabel = range.querySelector('.kat-range__min');
        if (minLabel) {
          minLabel.textContent = config.min;
        }
      }
    }

    // 最大値の更新
    if (config.max !== undefined) {
      const input = range.querySelector('.kat-range__input');
      if (input) {
        input.max = config.max;
        const maxLabel = range.querySelector('.kat-range__max');
        if (maxLabel) {
          maxLabel.textContent = config.max;
        }
      }
    }

    // ステップの更新
    if (config.step !== undefined) {
      const input = range.querySelector('.kat-range__input');
      if (input) {
        input.step = config.step;
      }
    }

    // 無効化の更新
    if (config.disabled !== undefined) {
      const input = range.querySelector('.kat-range__input');
      if (input) {
        input.disabled = config.disabled;
        if (config.disabled) {
          utils.addClass(range, 'kat-range--disabled');
        } else {
          utils.removeClass(range, 'kat-range--disabled');
        }
      }
    }

    // フォーマットの更新
    if (config.format !== undefined) {
      range.setAttribute('data-format', config.format);
      this.updateValueDisplay(range, this.getValue(range));
    }

    // 小数点以下の更新
    if (config.decimals !== undefined) {
      range.setAttribute('data-decimals', config.decimals);
      this.updateValueDisplay(range, this.getValue(range));
    }
  },

  /**
   * レンジの状態を取得
   * @param {Element} range - レンジ要素
   * @returns {Object} レンジの状態情報
   */
  getState: function(range) {
    if (!range) return null;

    const input = range.querySelector('.kat-range__input');
    if (!input) return null;

    return {
      value: parseFloat(input.value),
      min: parseFloat(input.min),
      max: parseFloat(input.max),
      step: parseFloat(input.step),
      disabled: input.disabled,
      format: range.getAttribute('data-format'),
      decimals: range.getAttribute('data-decimals'),
      showLabels: range.getAttribute('data-show-labels') === 'true',
      showValue: range.getAttribute('data-show-value') === 'true'
    };
  },

  /**
   * レンジの破棄
   * @param {Element} range - レンジ要素
   */
  destroy: function(range) {
    if (!range) return;

    // イベントリスナーを削除
    const input = range.querySelector('.kat-range__input');
    if (input) {
      input.removeEventListener('input', this.handleInput);
      input.removeEventListener('mousedown', this.handleMouseDown);
      input.removeEventListener('mouseup', this.handleMouseUp);
      input.removeEventListener('focus', this.handleFocus);
      input.removeEventListener('blur', this.handleBlur);
    }

    // レンジ要素を削除
    if (range.parentNode) {
      range.parentNode.removeChild(range);
    }
  }
};

// デフォルト設定
const DEFAULT_CONFIG = {
  range: {
    min: 0,
    max: 100,
    step: 1,
    value: 50,
    size: 'md',
    variant: 'default',
    format: 'number',
    decimals: 2,
    showLabels: true,
    showValue: true,
    label: '',
    disabled: false
  }
};
