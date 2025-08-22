/**
 * Product Actions コンポーネント
 * 商品アクションの管理（カート追加・購入など）
 * 
 * @project: Kat UI
 * @author: Bui Van Tai, 2024-12-15
 * @version: 1.0.0
 */

import { eventBus } from '../core/events.js';

/**
 * Product Actions コンポーネント
 */
export const productActions = {
  /**
   * コンポーネントの初期化
   */
  init() {
    this.actions = new Map();
    this.setupProductActions();
  },

  /**
   * 商品アクションの設定
   */
  setupProductActions() {
    const actionElements = document.querySelectorAll('.kat-product-actions');
    
    actionElements.forEach((actions, index) => {
      const actionId = `product-actions-${index}`;
      actions.dataset.actionId = actionId;
      
      const state = this.createProductActionsState(actions);
      this.actions.set(actionId, state);
      this.setupProductAction(actionId);
    });
  },

  /**
   * 商品アクションの状態を作成
   * @param {HTMLElement} actions - アクション要素
   * @returns {Object} 状態オブジェクト
   */
  createProductActionsState(actions) {
    const addToCartBtn = actions.querySelector('.kat-btn--primary');
    const checkStoreBtn = actions.querySelector('.kat-btn--secondary');
    const buyNowBtn = actions.querySelector('.kat-btn--outline:last-of-type');
    const favoriteBtn = actions.querySelector('.kat-product-info__favorite');
    
    return {
      actions,
      addToCartBtn,
      checkStoreBtn,
      buyNowBtn,
      favoriteBtn
    };
  },

  /**
   * 個別商品アクションの設定
   * @param {string} actionId - アクションID
   */
  setupProductAction(actionId) {
    const state = this.actions.get(actionId);
    if (!state) return;
    
    const { addToCartBtn, checkStoreBtn, buyNowBtn, favoriteBtn } = state;
    
    // カートに追加ボタンの設定
    if (addToCartBtn) {
      addToCartBtn.addEventListener('click', () => {
        this.addToCart(actionId);
      });
    }
    
    // 店舗在庫確認ボタンの設定
    if (checkStoreBtn) {
      checkStoreBtn.addEventListener('click', () => {
        this.checkStoreStock(actionId);
      });
    }
    
    // 今すぐ購入ボタンの設定
    if (buyNowBtn) {
      buyNowBtn.addEventListener('click', () => {
        this.buyNow(actionId);
      });
    }
    
    // お気に入りボタンの設定
    if (favoriteBtn) {
      favoriteBtn.addEventListener('click', () => {
        this.toggleFavorite(actionId);
      });
    }
  },

  /**
   * カートに追加
   * @param {string} actionId - アクションID
   */
  addToCart(actionId) {
    const state = this.actions.get(actionId);
    if (!state) return;
    
    // 選択されたバリエーション情報を取得
    const variants = this.getSelectedVariants();
    const quantity = this.getSelectedQuantity();
    
    // バリエーションの検証
    if (!this.validateVariants(variants)) {
      this.showError('カラーとサイズを選択してください');
      return;
    }
    
    // カート追加の処理
    const cartData = {
      productId: this.getProductId(),
      variants: variants,
      quantity: quantity
    };
    
    // イベントの発火
    this.dispatchAddToCartEvent(actionId, cartData);
    
    // 成功メッセージの表示
    this.showSuccess('商品をカートに追加しました');
  },

  /**
   * 店舗在庫確認
   * @param {string} actionId - アクションID
   */
  checkStoreStock(actionId) {
    const state = this.actions.get(actionId);
    if (!state) return;
    
    // 選択されたバリエーション情報を取得
    const variants = this.getSelectedVariants();
    
    // バリエーションの検証
    if (!this.validateVariants(variants)) {
      this.showError('カラーとサイズを選択してください');
      return;
    }
    
    // 店舗在庫確認の処理
    const stockData = {
      productId: this.getProductId(),
      variants: variants
    };
    
    // イベントの発火
    this.dispatchCheckStoreStockEvent(actionId, stockData);
    
    // 店舗在庫確認ページへの遷移
    this.redirectToStoreStock(stockData);
  },

  /**
   * 今すぐ購入
   * @param {string} actionId - アクションID
   */
  buyNow(actionId) {
    const state = this.actions.get(actionId);
    if (!state) return;
    
    // 選択されたバリエーション情報を取得
    const variants = this.getSelectedVariants();
    const quantity = this.getSelectedQuantity();
    
    // バリエーションの検証
    if (!this.validateVariants(variants)) {
      this.showError('カラーとサイズを選択してください');
      return;
    }
    
    // 購入ページへの遷移データ
    const purchaseData = {
      productId: this.getProductId(),
      variants: variants,
      quantity: quantity
    };
    
    // イベントの発火
    this.dispatchBuyNowEvent(actionId, purchaseData);
    
    // 購入ページへの遷移
    this.redirectToPurchase(purchaseData);
  },

  /**
   * お気に入りの切り替え
   * @param {string} actionId - アクションID
   */
  toggleFavorite(actionId) {
    const state = this.actions.get(actionId);
    if (!state || !state.favoriteBtn) return;
    
    const isFavorite = state.favoriteBtn.classList.contains('kat-product-info__favorite--active');
    
    if (isFavorite) {
      // お気に入りから削除
      state.favoriteBtn.classList.remove('kat-product-info__favorite--active');
      this.dispatchRemoveFavoriteEvent(actionId);
      this.showSuccess('お気に入りから削除しました');
    } else {
      // お気に入りに追加
      state.favoriteBtn.classList.add('kat-product-info__favorite--active');
      this.dispatchAddFavoriteEvent(actionId);
      this.showSuccess('お気に入りに追加しました');
    }
  },

  /**
   * 選択されたバリエーション情報の取得
   * @returns {Object} バリエーション情報
   */
  getSelectedVariants() {
    // 他のコンポーネントから情報を取得
    const colorSwatches = document.querySelectorAll('.kat-product-variants__color-swatch');
    const sizeButtons = document.querySelectorAll('.kat-product-variants__group:last-child .kat-btn');
    
    const selectedColor = Array.from(colorSwatches).findIndex(swatch => 
      swatch.classList.contains('kat-product-variants__color-swatch--active')
    );
    
    const selectedSize = Array.from(sizeButtons).findIndex(button => 
      button.classList.contains('kat-btn--checked')
    );
    
    return {
      color: selectedColor >= 0 ? selectedColor : null,
      size: selectedSize >= 0 ? selectedSize : null
    };
  },

  /**
   * 選択された数量の取得
   * @returns {number} 数量
   */
  getSelectedQuantity() {
    const quantityInput = document.querySelector('.kat-quantity-selector__input');
    return quantityInput ? parseInt(quantityInput.value) || 1 : 1;
  },

  /**
   * 商品IDの取得
   * @returns {string} 商品ID
   */
  getProductId() {
    // 商品コードから取得
    const productCode = document.querySelector('.kat-product-info__code');
    if (productCode) {
      return productCode.textContent.replace('商品番号 ', '');
    }
    return null;
  },

  /**
   * バリエーションの検証
   * @param {Object} variants - バリエーション情報
   * @returns {boolean} 検証結果
   */
  validateVariants(variants) {
    return variants.color !== null && variants.size !== null;
  },

  /**
   * 店舗在庫確認ページへの遷移
   * @param {Object} stockData - 在庫確認データ
   */
  redirectToStoreStock(stockData) {
    // 店舗在庫確認ページへの遷移処理
    // 実際の実装では適切なURLに遷移
    console.log('店舗在庫確認ページに遷移:', stockData);
  },

  /**
   * 購入ページへの遷移
   * @param {Object} purchaseData - 購入データ
   */
  redirectToPurchase(purchaseData) {
    // 購入ページへの遷移処理
    // 実際の実装では適切なURLに遷移
    console.log('購入ページに遷移:', purchaseData);
  },

  /**
   * 成功メッセージの表示
   * @param {string} message - メッセージ
   */
  showSuccess(message) {
    // 成功メッセージの表示処理
    // 実際の実装では適切なUIコンポーネントを使用
    console.log('成功:', message);
  },

  /**
   * エラーメッセージの表示
   * @param {string} message - メッセージ
   */
  showError(message) {
    // エラーメッセージの表示処理
    // 実際の実装では適切なUIコンポーネントを使用
    console.log('エラー:', message);
  },

  /**
   * カート追加イベントの発火
   * @param {string} actionId - アクションID
   * @param {Object} cartData - カートデータ
   */
  dispatchAddToCartEvent(actionId, cartData) {
    eventBus.emit('kat:product-actions:add-to-cart', { actionId, cartData });
    
    document.dispatchEvent(new CustomEvent('kat:product-actions:add-to-cart', {
      detail: { actionId, cartData }
    }));
  },

  /**
   * 店舗在庫確認イベントの発火
   * @param {string} actionId - アクションID
   * @param {Object} stockData - 在庫確認データ
   */
  dispatchCheckStoreStockEvent(actionId, stockData) {
    eventBus.emit('kat:product-actions:check-store-stock', { actionId, stockData });
    
    document.dispatchEvent(new CustomEvent('kat:product-actions:check-store-stock', {
      detail: { actionId, stockData }
    }));
  },

  /**
   * 今すぐ購入イベントの発火
   * @param {string} actionId - アクションID
   * @param {Object} purchaseData - 購入データ
   */
  dispatchBuyNowEvent(actionId, purchaseData) {
    eventBus.emit('kat:product-actions:buy-now', { actionId, purchaseData });
    
    document.dispatchEvent(new CustomEvent('kat:product-actions:buy-now', {
      detail: { actionId, purchaseData }
    }));
  },

  /**
   * お気に入り追加イベントの発火
   * @param {string} actionId - アクションID
   */
  dispatchAddFavoriteEvent(actionId) {
    eventBus.emit('kat:product-actions:add-favorite', { actionId });
    
    document.dispatchEvent(new CustomEvent('kat:product-actions:add-favorite', {
      detail: { actionId }
    }));
  },

  /**
   * お気に入り削除イベントの発火
   * @param {string} actionId - アクションID
   */
  dispatchRemoveFavoriteEvent(actionId) {
    eventBus.emit('kat:product-actions:remove-favorite', { actionId });
    
    document.dispatchEvent(new CustomEvent('kat:product-actions:remove-favorite', {
      detail: { actionId }
    }));
  },

  /**
   * コンポーネントの破棄
   */
  destroy() {
    this.actions.forEach((state, actionId) => {
      const { addToCartBtn, checkStoreBtn, buyNowBtn, favoriteBtn } = state;
      
      // イベントリスナーの削除
      if (addToCartBtn) {
        addToCartBtn.removeEventListener('click', () => {});
      }
      
      if (checkStoreBtn) {
        checkStoreBtn.removeEventListener('click', () => {});
      }
      
      if (buyNowBtn) {
        buyNowBtn.removeEventListener('click', () => {});
      }
      
      if (favoriteBtn) {
        favoriteBtn.removeEventListener('click', () => {});
      }
    });
    
    this.actions.clear();
  }
};
