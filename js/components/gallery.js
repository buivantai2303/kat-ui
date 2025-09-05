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

    // thumbsListの高度なスクロール設定とパフォーマンス最適化
    if (thumbsList) {
      // スムーズスクロールの初期設定
      thumbsList.style.scrollBehavior = 'smooth';
      thumbsList.style.overflowY = 'auto';
      thumbsList.style.overflowX = 'hidden';

      // 高度なイージングカーブで超自然な動きを実現
      thumbsList.style.transition = 'transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)';

      // スクロールバーを完全に非表示
      thumbsList.style.scrollbarWidth = 'none';
      thumbsList.style.msOverflowStyle = 'none';
      thumbsList.style.setProperty('-webkit-scrollbar', 'display: none');

      // 超高度なGPUアクセラレーション
      thumbsList.style.willChange = 'transform, scroll-position';
      thumbsList.style.backfaceVisibility = 'hidden';
      thumbsList.style.perspective = '1000px';
      thumbsList.style.transform = 'translateZ(0)';

      // モーメンタムスクロールの最適化
      thumbsList.style.webkitOverflowScrolling = 'touch';

      // スクロールイベントでボタン状態をリアルタイム更新（パッシブリスナーでパフォーマンス向上）
      thumbsList.addEventListener('scroll', () => {
        // デバウンス処理でパフォーマンスを最適化
        clearTimeout(state.scrollTimeout);
        state.scrollTimeout = setTimeout(() => {
          this.updateNavigationButtons(galleryId);
        }, 100);
      }, { passive: true }); // パッシブイベントでスクロールパフォーマンスを向上
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
   * 超スムーズなサムネイルスクロール処理
   * 高度なイージングとGPUアクセラレーションを使用した滑らかなスクロールを実現
   * @param {string} galleryId - ギャラリーID
   * @param {string} direction - スクロール方向（prev/next）
   */
  scrollThumbs(galleryId, direction) {
    const state = this.galleries.get(galleryId);
    if (!state || !state.thumbs || !state.thumbsList) return;

    const { thumbs, thumbsList } = state;
    const totalThumbs = thumbs.length;
    const itemsPerView = 6;

    // 6枚以下の場合はスクロール不要
    if (totalThumbs <= itemsPerView) return;

    // 動的にサムネイルの高さとギャップを計算
    const firstThumb = thumbs[0];
    if (!firstThumb) return;

    const thumbHeight = firstThumb.offsetHeight;
    const computedStyle = window.getComputedStyle(thumbsList);
    const gap = parseFloat(computedStyle.gap) || 8; // デフォルト8px

    const scrollStep = thumbHeight + gap;
    const currentScrollTop = thumbsList.scrollTop;
    const maxScrollTop = thumbsList.scrollHeight - thumbsList.clientHeight;

    // スクロール方向の決定
    let newScrollTop = currentScrollTop;

    if (direction === 'prev') {
      // 前へボタン：最初の位置の場合は移動しない
      if (currentScrollTop <= 0) return;

      // 1つ前のサムネイル位置までスクロール
      const targetScrollTop = Math.max(0, currentScrollTop - scrollStep);

      // より自然なスクロールのために、スクロール位置を調整
      const adjustedScrollTop = Math.floor(targetScrollTop / scrollStep) * scrollStep;
      newScrollTop = Math.max(0, adjustedScrollTop);
    } else {
      // 次へボタン：最後の位置の場合は移動しない
      if (currentScrollTop >= maxScrollTop) return;

      // 1つ次のサムネイル位置までスクロール
      const targetScrollTop = currentScrollTop + scrollStep;

      // より自然なスクロールのために、スクロール位置を調整
      const adjustedScrollTop = Math.ceil(targetScrollTop / scrollStep) * scrollStep;
      newScrollTop = Math.min(maxScrollTop, adjustedScrollTop);
    }

    // スクロール中のクラスを追加して高度なアニメーションを適用
    thumbsList.classList.add('kat-gallery-scrolling');

    // 最適化されたスクロール設定
    thumbsList.style.scrollBehavior = 'smooth';

    // 高度なイージングカーブで超スムーズな動きを実現
    thumbsList.style.transition = 'transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)';

    // GPUアクセラレーションの最適化
    thumbsList.style.willChange = 'transform, scroll-position';
    thumbsList.style.backfaceVisibility = 'hidden';
    thumbsList.style.perspective = '1000px';

    // モーメンタム効果を追加
    const momentumFactor = 0.8;
    const momentumScrollTop = newScrollTop + (newScrollTop - currentScrollTop) * momentumFactor;

    // ダブルrequestAnimationFrameでよりスムーズなアニメーション
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        thumbsList.scrollTo({
          top: momentumScrollTop,
          behavior: 'smooth'
        });

        // 軽微なtransformアニメーションで追加の滑らかさを確保
        thumbsList.style.transform = 'translateY(-1px)';
        setTimeout(() => {
          thumbsList.style.transform = 'translateY(0)';
        }, 50);
      });
    });

    // ボタンの状態更新（アニメーション完了後に）
    setTimeout(() => {
      this.updateNavigationButtons(galleryId);

      // スクロール中のクラスを削除
      thumbsList.classList.remove('kat-gallery-scrolling');

      // トランジションとスタイルをリセット
      thumbsList.style.transition = '';
      thumbsList.style.willChange = 'transform, scroll-position';
      thumbsList.style.transform = 'translateZ(0)';
    }, 900); // 超スムーズなアニメーション時間を考慮
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
