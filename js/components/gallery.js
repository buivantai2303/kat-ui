/**
 * Gallery コンポーネント
 * 商品ギャラリーの管理（メイン画像とサムネイル）
 * 
 * @project: Kat UI
 * @author: Bui Van Tai, 2024-12-15
 * @version: 1.0.0
 */

import { eventBus } from '../core/events.js';

/**
 * Gallery コンポーネント
 */
export const gallery = {
  /**
   * コンポーネントの初期化
   */
  init() {
    this.galleries = new Map();
    this.setupGalleries();
  },

  /**
   * ギャラリーの設定
   */
  setupGalleries() {
    const galleryElements = document.querySelectorAll('.kat-product-gallery');
    
    galleryElements.forEach((gallery, index) => {
      const galleryId = `gallery-${index}`;
      gallery.dataset.galleryId = galleryId;
      
      const state = this.createGalleryState(gallery);
      this.galleries.set(galleryId, state);
      this.setupGallery(galleryId);
    });
  },

  /**
   * ギャラリーの状態を作成
   * @param {HTMLElement} gallery - ギャラリー要素
   * @returns {Object} 状態オブジェクト
   */
  createGalleryState(gallery) {
    const mainImg = gallery.querySelector('.kat-product-gallery__main img');
    const thumbs = Array.from(gallery.querySelectorAll('.kat-product-gallery__thumb'));
    const thumbsList = gallery.querySelector('.kat-product-gallery__thumbs-list');
    const btnPrev = gallery.querySelector('.kat-product-gallery__thumbs-btn--prev');
    const btnNext = gallery.querySelector('.kat-product-gallery__thumbs-btn--next');
    
    return {
      gallery,
      mainImg,
      thumbs,
      thumbsList,
      btnPrev,
      btnNext,
      currentIndex: 0
    };
  },

  /**
   * 個別ギャラリーの設定
   * @param {string} galleryId - ギャラリーID
   */
  setupGallery(galleryId) {
    const state = this.galleries.get(galleryId);
    if (!state) return;
    
    const { mainImg, thumbs, thumbsList, btnPrev, btnNext } = state;
    
    // サムネイルクリックイベントの設定
    thumbs.forEach((thumb, index) => {
      thumb.addEventListener('click', () => {
        this.switchMainImage(galleryId, index);
      });
    });
    
    // ナビゲーションボタンの設定
    if (btnPrev && thumbsList) {
      btnPrev.addEventListener('click', () => {
        this.scrollThumbs(galleryId, 'prev');
      });
    }
    
    if (btnNext && thumbsList) {
      btnNext.addEventListener('click', () => {
        this.scrollThumbs(galleryId, 'next');
      });
    }
    
    // 初期状態の設定
    this.updateGalleryState(galleryId);
  },

  /**
   * メイン画像の切り替え
   * @param {string} galleryId - ギャラリーID
   * @param {number} index - サムネイルインデックス
   */
  switchMainImage(galleryId, index) {
    const state = this.galleries.get(galleryId);
    if (!state) return;
    
    const { mainImg, thumbs } = state;
    const thumb = thumbs[index];
    
    if (!thumb || !mainImg) return;
    
    // メイン画像の更新
    const fullImageUrl = thumb.getAttribute('data-full');
    if (fullImageUrl) {
      mainImg.src = fullImageUrl;
    }
    
    // サムネイルの状態更新
    thumbs.forEach((t, i) => {
      t.classList.remove('kat-product-gallery__thumb--active');
      t.setAttribute('aria-selected', 'false');
    });
    
    thumb.classList.add('kat-product-gallery__thumb--active');
    thumb.setAttribute('aria-selected', 'true');
    
    // 状態の更新
    state.currentIndex = index;
    
    // イベントの発火
    this.dispatchImageChangeEvent(galleryId, index);
  },

  /**
   * サムネイルのスクロール
   * @param {string} galleryId - ギャラリーID
   * @param {string} direction - スクロール方向（prev/next）
   */
  scrollThumbs(galleryId, direction) {
    const state = this.galleries.get(galleryId);
    if (!state || !state.thumbs || !state.thumbsList) return;
    
    const { thumbs } = state;
    const totalThumbs = thumbs.length;
    const itemsPerView = 6;
    
    // 6枚以下の場合はスクロール不要
    if (totalThumbs <= itemsPerView) return;
    
    const thumbHeight = 64; // 4rem
    const gap = 8; // 0.5rem
    const scrollStep = thumbHeight + gap;
    const currentScrollTop = state.thumbsList.scrollTop;
    
    let newScrollTop = currentScrollTop;
    
    if (direction === 'prev') {
      // 前へボタン：最初の位置の場合は移動しない
      if (currentScrollTop <= 0) return;
      newScrollTop = Math.max(0, currentScrollTop - scrollStep);
    } else {
      // 次へボタン：最後の位置の場合は移動しない
      const maxScrollTop = state.thumbsList.scrollHeight - state.thumbsList.clientHeight;
      if (currentScrollTop >= maxScrollTop) return;
      newScrollTop = Math.min(maxScrollTop, currentScrollTop + scrollStep);
    }
    
    // カスタムスムーズスクロール効果を適用
    this.smoothScrollTo(state.thumbsList, newScrollTop, 400);
    
    // ボタンの状態更新
    setTimeout(() => {
      this.updateNavigationButtons(galleryId);
    }, 450);
  },

  /**
   * カスタムスムーズスクロール関数
   * @param {Element} element - スクロール対象の要素
   * @param {number} target - ターゲット位置
   * @param {number} duration - アニメーション時間（ms）
   */
  smoothScrollTo(element, target, duration) {
    const start = element.scrollTop;
    const change = target - start;
    const startTime = performance.now();
    
    // Ease out cubic easing function
    const easeOutCubic = t => 1 - Math.pow(1 - t, 3);
    
    const animateScroll = currentTime => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeOutCubic(progress);
      
      element.scrollTop = start + change * easedProgress;
      
      if (progress < 1) {
        requestAnimationFrame(animateScroll);
      }
    };
    
    requestAnimationFrame(animateScroll);
  },

  /**
   * ナビゲーションボタンの状態更新
   * @param {string} galleryId - ギャラリーID
   */
  updateNavigationButtons(galleryId) {
    const state = this.galleries.get(galleryId);
    if (!state || !state.thumbs || !state.thumbsList) return;
    
    const { btnPrev, btnNext, thumbs } = state;
    const totalThumbs = thumbs.length;
    const itemsPerView = 6;
    
    // 6枚以下の場合は両方のボタンを無効化
    if (totalThumbs <= itemsPerView) {
      if (btnPrev) btnPrev.disabled = true;
      if (btnNext) btnNext.disabled = true;
      return;
    }
    
    const currentScrollTop = state.thumbsList.scrollTop;
    const maxScrollTop = state.thumbsList.scrollHeight - state.thumbsList.clientHeight;
    
    // ボタンの状態更新
    if (btnPrev) {
      btnPrev.disabled = currentScrollTop <= 0;
    }
    
    if (btnNext) {
      btnNext.disabled = currentScrollTop >= maxScrollTop;
    }
  },

  /**
   * ギャラリー状態の更新
   * @param {string} galleryId - ギャラリーID
   */
  updateGalleryState(galleryId) {
    const state = this.galleries.get(galleryId);
    if (!state) return;
    
    // ナビゲーションボタンの初期状態
    this.updateNavigationButtons(galleryId);
  },

  /**
   * 画像変更イベントの発火
   * @param {string} galleryId - ギャラリーID
   * @param {number} index - インデックス
   */
  dispatchImageChangeEvent(galleryId, index) {
    eventBus.emit('kat:gallery:image-change', { galleryId, index });
    
    document.dispatchEvent(new CustomEvent('kat:gallery:image-change', {
      detail: { galleryId, index }
    }));
  },

  /**
   * コンポーネントの破棄
   */
  destroy() {
    this.galleries.forEach((state, galleryId) => {
      const { thumbs, btnPrev, btnNext } = state;
      
      // イベントリスナーの削除
      thumbs.forEach(thumb => {
        thumb.removeEventListener('click', () => {});
      });
      
      if (btnPrev) {
        btnPrev.removeEventListener('click', () => {});
      }
      
      if (btnNext) {
        btnNext.removeEventListener('click', () => {});
      }
    });
    
    this.galleries.clear();
  }
};
