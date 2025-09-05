/**
 * Product Variants コンポーネント
 * 商品バリエーションの管理（カラー・サイズ選択）
 * 
 * @project: Kat UI
 * @author: Bui Van Tai, 2024-12-15
 * @version: 1.0.0
 */

import { eventBus } from '../core/events.js';

/**
 * Product Variants コンポーネント
 */
export const productVariants = {
  /**
   * コンポーネントの初期化
   */
  init() {
    this.variants = new Map();
    this.setupProductVariants();
  },

  /**
   * 商品バリエーションの設定
   */
  setupProductVariants() {
    const variantElements = document.querySelectorAll('.kat-product-variants');
    
    variantElements.forEach((variant, index) => {
      const variantId = `product-variant-${index}`;
      variant.dataset.variantId = variantId;
      
      const state = this.createProductVariantState(variant);
      this.variants.set(variantId, state);
      this.setupProductVariant(variantId);
    });
  },

  /**
   * 商品バリエーションの状態を作成
   * @param {HTMLElement} variant - バリエーション要素
   * @returns {Object} 状態オブジェクト
   */
  createProductVariantState(variant) {
    const colorSwatches = Array.from(variant.querySelectorAll('.kat-product-variants__color-swatch'));
    const sizeButtons = Array.from(variant.querySelectorAll('.kat-product-variants__group:last-child .kat-btn'));
    const sizeChartLink = variant.querySelector('.kat-product-variants__size-chart');
    
    return {
      variant,
      colorSwatches,
      sizeButtons,
      sizeChartLink,
      selectedColor: null,
      selectedSize: null
    };
  },

  /**
   * 個別商品バリエーションの設定
   * @param {string} variantId - バリエーションID
   */
  setupProductVariant(variantId) {
    const state = this.variants.get(variantId);
    if (!state) return;
    
    const { colorSwatches, sizeButtons, sizeChartLink } = state;
    
    // カラースウォッチの設定
    colorSwatches.forEach((swatch, index) => {
      swatch.addEventListener('click', () => {
        this.selectColor(variantId, index);
      });
      
      // 初期選択状態の設定
      if (swatch.classList.contains('kat-product-variants__color-swatch--active')) {
        state.selectedColor = index;
      }
    });
    
    // サイズボタンの設定
    sizeButtons.forEach((button, index) => {
      button.addEventListener('click', () => {
        // 利用不可のサイズは選択できない
        if (!button.classList.contains('kat-size-btn--unavailable')) {
          this.selectSize(variantId, index);
        }
      });
      
      // 初期選択状態の設定
      if (button.classList.contains('kat-btn--checked')) {
        state.selectedSize = index;
      }
    });
    
    // サイズ表リンクの設定
    if (sizeChartLink) {
      sizeChartLink.addEventListener('click', (e) => {
        e.preventDefault();
        this.openSizeChart(variantId);
      });
    }
  },

  /**
   * カラーの選択
   * @param {string} variantId - バリエーションID
   * @param {number} index - カラーインデックス
   */
  selectColor(variantId, index) {
    const state = this.variants.get(variantId);
    if (!state) return;
    
    const { colorSwatches } = state;
    
    // 既存の選択をクリア
    colorSwatches.forEach(swatch => {
      swatch.classList.remove('kat-product-variants__color-swatch--active');
    });
    
    // 新しい選択を設定
    const selectedSwatch = colorSwatches[index];
    if (selectedSwatch) {
      selectedSwatch.classList.add('kat-product-variants__color-swatch--active');
      state.selectedColor = index;
      
      // イベントの発火
      this.dispatchColorChangeEvent(variantId, index, selectedSwatch);
    }
  },

  /**
   * サイズの選択
   * @param {string} variantId - バリエーションID
   * @param {number} index - サイズインデックス
   */
  selectSize(variantId, index) {
    const state = this.variants.get(variantId);
    if (!state) return;
    
    const { sizeButtons } = state;
    
    // 既存の選択をクリア
    sizeButtons.forEach(button => {
      button.classList.remove('kat-btn--checked');
    });
    
    // 新しい選択を設定
    const selectedButton = sizeButtons[index];
    if (selectedButton) {
      selectedButton.classList.add('kat-btn--checked');
      state.selectedSize = index;
      
      // イベントの発火
      this.dispatchSizeChangeEvent(variantId, index, selectedButton);
    }
  },

  /**
   * サイズ表を開く
   * @param {string} variantId - バリエーションID
   */
  openSizeChart(variantId) {
    const state = this.variants.get(variantId);
    if (!state) return;
    
    // サイズ表タブに移動
    const sizeTab = document.querySelector('[data-kat-target="tab2"]');
    if (sizeTab) {
      // タブコンポーネントが存在する場合は、そちらに委譲
      eventBus.emit('kat:tabs:switch', { target: 'tab2' });
    }
    
    // イベントの発火
    this.dispatchSizeChartOpenEvent(variantId);
  },

  /**
   * 選択されたカラーの取得
   * @param {string} variantId - バリエーションID
   * @returns {number|null} 選択されたカラーのインデックス
   */
  getSelectedColor(variantId) {
    const state = this.variants.get(variantId);
    return state?.selectedColor ?? null;
  },

  /**
   * 選択されたサイズの取得
   * @param {string} variantId - バリエーションID
   * @returns {number|null} 選択されたサイズのインデックス
   */
  getSelectedSize(variantId) {
    const state = this.variants.get(variantId);
    return state?.selectedSize ?? null;
  },

  /**
   * 選択されたバリエーション情報の取得
   * @param {string} variantId - バリエーションID
   * @returns {Object} 選択されたバリエーション情報
   */
  getSelectedVariants(variantId) {
    const state = this.variants.get(variantId);
    if (!state) return { color: null, size: null };
    
    const colorIndex = state.selectedColor;
    const sizeIndex = state.selectedSize;
    
    const color = colorIndex !== null ? {
      index: colorIndex,
      element: state.colorSwatches[colorIndex],
      label: state.colorSwatches[colorIndex]?.getAttribute('aria-label') || ''
    } : null;
    
    const size = sizeIndex !== null ? {
      index: sizeIndex,
      element: state.sizeButtons[sizeIndex],
      label: state.sizeButtons[sizeIndex]?.textContent || ''
    } : null;
    
    return { color, size };
  },

  /**
   * カラー変更イベントの発火
   * @param {string} variantId - バリエーションID
   * @param {number} index - カラーインデックス
   * @param {HTMLElement} swatch - 選択されたスウォッチ
   */
  dispatchColorChangeEvent(variantId, index, swatch) {
    eventBus.emit('kat:product-variants:color-change', { variantId, index, swatch });
    
    document.dispatchEvent(new CustomEvent('kat:product-variants:color-change', {
      detail: { variantId, index, swatch }
    }));
  },

  /**
   * サイズ変更イベントの発火
   * @param {string} variantId - バリエーションID
   * @param {number} index - サイズインデックス
   * @param {HTMLElement} button - 選択されたボタン
   */
  dispatchSizeChangeEvent(variantId, index, button) {
    eventBus.emit('kat:product-variants:size-change', { variantId, index, button });
    
    document.dispatchEvent(new CustomEvent('kat:product-variants:size-change', {
      detail: { variantId, index, button }
    }));
  },

  /**
   * サイズ表オープンイベントの発火
   * @param {string} variantId - バリエーションID
   */
  dispatchSizeChartOpenEvent(variantId) {
    eventBus.emit('kat:product-variants:size-chart-open', { variantId });
    
    document.dispatchEvent(new CustomEvent('kat:product-variants:size-chart-open', {
      detail: { variantId }
    }));
  },

  /**
   * コンポーネントの破棄
   */
  destroy() {
    this.variants.forEach((state, variantId) => {
      const { colorSwatches, sizeButtons, sizeChartLink } = state;
      
      // カラースウォッチのイベントリスナーを削除
      colorSwatches.forEach(swatch => {
        swatch.removeEventListener('click', () => {});
      });
      
      // サイズボタンのイベントリスナーを削除
      sizeButtons.forEach(button => {
        button.removeEventListener('click', () => {});
      });
      
      // サイズ表リンクのイベントリスナーを削除
      if (sizeChartLink) {
        sizeChartLink.removeEventListener('click', () => {});
      }
    });
    
    this.variants.clear();
  }
};
