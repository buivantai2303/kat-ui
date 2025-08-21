/**
 * Carousel コンポーネント
 * スライドショーとカルーセルの管理
 * 
 * @project: Kat UI
 * @author: Bui Van Tai, 2024-12-15
 * @version: 2.0.0
 */

import { eventBus } from '../core/events.js';

/**
 * Carousel コンポーネント
 */
export const carousel = {
  /**
   * コンポーネントの初期化
   */
  init() {
    this.carousels = new Map();
    this.setupCarousels();
    this.bindEvents();
  },

  /**
   * カルーセルの設定
   */
  setupCarousels() {
    const carouselElements = document.querySelectorAll('.kat-carousel');
    
    carouselElements.forEach((carousel, index) => {
      const carouselId = `carousel-${index}`;
      carousel.dataset.carouselId = carouselId;
      
      const config = this.getCarouselConfig(carousel);
      const state = this.createCarouselState(carousel, config);
      
      this.carousels.set(carouselId, state);
      this.setupCarousel(carouselId);
    });
  },

  /**
   * カルーセルの設定を取得
   * @param {HTMLElement} carousel - カルーセル要素
   * @returns {Object} 設定オブジェクト
   */
  getCarouselConfig(carousel) {
    return {
      autoplay: carousel.hasAttribute('data-kat-autoplay'),
      interval: parseInt(carousel.dataset.katInterval) || 4000,
      loop: carousel.hasAttribute('data-kat-loop') !== false,
      pauseOnHover: carousel.hasAttribute('data-kat-pause-on-hover') !== false,
      showDots: carousel.hasAttribute('data-kat-show-dots') !== false,
      showArrows: carousel.hasAttribute('data-kat-show-arrows') !== false,
      transition: carousel.dataset.katTransition || 'slide'
    };
  },

  /**
   * カルーセルの状態を作成
   * @param {HTMLElement} carousel - カルーセル要素
   * @param {Object} config - 設定オブジェクト
   * @returns {Object} 状態オブジェクト
   */
  createCarouselState(carousel, config) {
    const viewport = carousel.querySelector('.kat-carousel__viewport');
    const container = carousel.querySelector('.kat-carousel__container');
    const slides = Array.from(carousel.querySelectorAll('.kat-carousel__slide'));
    const prevBtn = carousel.querySelector('.kat-carousel__nav--prev .kat-carousel__nav-btn');
    const nextBtn = carousel.querySelector('.kat-carousel__nav--next .kat-carousel__nav-btn');
    const dotsWrap = carousel.querySelector('.kat-carousel__dots');
    
    return {
      carousel,
      viewport,
      container,
      slides,
      prevBtn,
      nextBtn,
      dotsWrap,
      config,
      currentIndex: 0,
      totalSlides: slides.length,
      autoplayTimer: null,
      isTransitioning: false
    };
  },

  /**
   * 個別カルーセルの設定
   * @param {string} carouselId - カルーセルID
   */
  setupCarousel(carouselId) {
    const state = this.carousels.get(carouselId);
    if (!state) return;
    
    const { carousel, slides, prevBtn, nextBtn, dotsWrap, config } = state;

    // インタラクション用のクラス付与（カーソル表示など）
    carousel.classList.add('kat-carousel--touch');
    
    // Debug logging
    console.log(`Carousel ${carouselId} setup:`, {
      slides: slides.length,
      prevBtn: !!prevBtn,
      nextBtn: !!nextBtn,
      dotsWrap: !!dotsWrap,
      config: config
    });
    
    // スライドの初期設定
    slides.forEach((slide, index) => {
      slide.style.transform = `translateX(${index * 100}%)`;
      slide.dataset.slideIndex = index;
    });
    
    // ナビゲーションボタンの設定
    console.log(`Setting up navigation buttons:`, {
      prevBtn: !!prevBtn,
      nextBtn: !!nextBtn,
      showArrows: config.showArrows
    });
    
    if (prevBtn && config.showArrows) {
      prevBtn.addEventListener('click', () => this.goToPrevious(carouselId));
      console.log('Prev button event listener added');
    }
    
    if (nextBtn && config.showArrows) {
      nextBtn.addEventListener('click', () => this.goToNext(carouselId));
      console.log('Next button event listener added');
    }
    
    // ドットの設定
    if (dotsWrap && config.showDots) {
      this.setupDots(carouselId);
    }
    
    // タッチ/スワイプの設定
    this.setupTouchEvents(carouselId);
    // マウスドラッグの設定（デスクトップ向け）
    this.setupMouseEvents(carouselId);
    
    // キーボードナビゲーションの設定
    this.setupKeyboardEvents(carouselId);
    
    // 自動再生の設定
    if (config.autoplay) {
      this.startAutoplay(carouselId);
    }
    
    // ホバー時の一時停止
    if (config.pauseOnHover) {
      carousel.addEventListener('mouseenter', () => this.pauseAutoplay(carouselId));
      carousel.addEventListener('mouseleave', () => this.resumeAutoplay(carouselId));
    }
    
    // 初期状態の設定
    this.updateCarouselState(carouselId);
  },

  /**
   * ドットの設定
   * @param {string} carouselId - カルーセルID
   */
  setupDots(carouselId) {
    const state = this.carousels.get(carouselId);
    if (!state || !state.dotsWrap) return;
    
    const { dotsWrap, totalSlides } = state;
    
    // 既存のドットをクリア
    dotsWrap.innerHTML = '';
    
    // 新しいドットを作成
    for (let i = 0; i < totalSlides; i++) {
      const dot = document.createElement('button');
      dot.className = 'kat-carousel__dot' + (i === 0 ? ' kat-carousel__dot--active' : '');
      dot.setAttribute('aria-label', `スライド${i + 1}`);
      dot.dataset.slideIndex = i;
      
      dot.addEventListener('click', () => {
        this.goToSlide(carouselId, i);
      });
      
      dotsWrap.appendChild(dot);
    }
  },

  /**
   * タッチイベントの設定
   * @param {string} carouselId - カルーセルID
   */
  setupTouchEvents(carouselId) {
    const state = this.carousels.get(carouselId);
    if (!state) return;
    
    const { viewport } = state;
    let startX = 0;
    let startY = 0;
    let isDragging = false;
    
    viewport.addEventListener('touchstart', (e) => {
      // クリック可能要素の場合はドラッグ処理をスキップ
      const interactive = e.target.closest('a, button, input, textarea, select, [role="button"]');
      if (interactive) return;
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
      isDragging = true;
      // ドラッグ中クラスを付与（カーソル表示制御）
      state.carousel.classList.add('kat-carousel--dragging');
      // ドラッグ時はトランジションを無効化
      if (state.container) {
        state.container.style.transition = 'none';
      }
      
      // 自動再生を一時停止
      this.pauseAutoplay(carouselId);
    });
    
    viewport.addEventListener('touchmove', (e) => {
      if (!isDragging) return;
      
      const currentX = e.touches[0].clientX;
      const currentY = e.touches[0].clientY;
      const diffX = startX - currentX;
      const diffY = startY - currentY;
      
      // 水平方向のスワイプのみを処理
      if (Math.abs(diffX) > Math.abs(diffY)) {
        e.preventDefault();
        
        const { container } = state;
        const translateX = -state.currentIndex * 100 - (diffX / viewport.offsetWidth) * 100;
        container.style.transform = `translateX(${translateX}%)`;
      }
    });
    
    viewport.addEventListener('touchend', (e) => {
      if (!isDragging) return;
      
      const currentX = e.changedTouches[0].clientX;
      const diffX = startX - currentX;
      const threshold = viewport.offsetWidth * 0.3;
      
      if (Math.abs(diffX) > threshold) {
        if (diffX > 0) {
          this.goToNext(carouselId);
        } else {
          this.goToPrevious(carouselId);
        }
      } else {
        // 元の位置に戻す（現在のインデックスへスナップ）
        this.executeTransition(carouselId, state.currentIndex);
      }
      
      isDragging = false;
      // ドラッグ中クラスを削除
      state.carousel.classList.remove('kat-carousel--dragging');
      // トランジションを元に戻す
      if (state.container) {
        state.container.style.transition = '';
      }
      
      // 自動再生を再開
      this.resumeAutoplay(carouselId);
    });
  },

  /**
   * マウスイベントの設定（デスクトップ向けドラッグ操作）
   * @param {string} carouselId - カルーセルID
   */
  setupMouseEvents(carouselId) {
    const state = this.carousels.get(carouselId);
    if (!state) return;
    
    const { viewport } = state;
    let startX = 0;
    let startY = 0;
    let isDragging = false;
    
    // マウスダウン開始
    viewport.addEventListener('mousedown', (e) => {
      // 左クリックのみ
      if (e.button !== 0) return;
      // クリック可能要素の場合はドラッグ処理をスキップ
      const interactive = e.target.closest('a, button, input, textarea, select, [role="button"]');
      if (interactive) return;
      startX = e.clientX;
      startY = e.clientY;
      isDragging = true;
      // ドラッグ中クラスを付与（カーソル表示制御）
      state.carousel.classList.add('kat-carousel--dragging');
      // ドラッグ時はトランジションを無効化
      if (state.container) {
        state.container.style.transition = 'none';
      }
      // 自動再生を一時停止
      this.pauseAutoplay(carouselId);
      // テキスト選択防止
      e.preventDefault();
    });
    
    // マウス移動（ウィンドウ全体で追跡）
    const onMouseMove = (e) => {
      if (!isDragging) return;
      const currentX = e.clientX;
      const currentY = e.clientY;
      const diffX = startX - currentX;
      const diffY = startY - currentY;
      // 水平ドラッグのみ処理
      if (Math.abs(diffX) > Math.abs(diffY)) {
        const { container } = state;
        const translateX = -state.currentIndex * 100 - (diffX / viewport.offsetWidth) * 100;
        container.style.transform = `translateX(${translateX}%)`;
      }
    };
    
    // マウスアップ/終了
    const endDrag = (e) => {
      if (!isDragging) return;
      const endX = e.clientX;
      const diffX = startX - endX;
      const threshold = viewport.offsetWidth * 0.3;
      if (Math.abs(diffX) > threshold) {
        if (diffX > 0) {
          this.goToNext(carouselId);
        } else {
          this.goToPrevious(carouselId);
        }
      } else {
        // 元の位置に戻す（現在のインデックスへスナップ）
        this.executeTransition(carouselId, state.currentIndex);
      }
      isDragging = false;
      // ドラッグ中クラスを削除
      state.carousel.classList.remove('kat-carousel--dragging');
      // トランジションを元に戻す
      if (state.container) {
        state.container.style.transition = '';
      }
      // 自動再生を再開
      this.resumeAutoplay(carouselId);
    };
    
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', endDrag);
    viewport.addEventListener('mouseleave', endDrag);
  },

  /**
   * キーボードイベントの設定
   * @param {string} carouselId - カルーセルID
   */
  setupKeyboardEvents(carouselId) {
    const state = this.carousels.get(carouselId);
    if (!state) return;
    
    const { carousel } = state;
    
    carousel.addEventListener('keydown', (e) => {
      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          this.goToPrevious(carouselId);
          break;
        case 'ArrowRight':
          e.preventDefault();
          this.goToNext(carouselId);
          break;
        case 'Home':
          e.preventDefault();
          this.goToSlide(carouselId, 0);
          break;
        case 'End':
          e.preventDefault();
          this.goToSlide(carouselId, state.totalSlides - 1);
          break;
      }
    });
    
    // フォーカス可能な要素を設定
    carousel.setAttribute('tabindex', '0');
  },

  /**
   * 前のスライドに移動
   * @param {string} carouselId - カルーセルID
   */
  goToPrevious(carouselId) {
    const state = this.carousels.get(carouselId);
    if (!state || state.isTransitioning) return;
    
    const newIndex = state.currentIndex > 0 ? state.currentIndex - 1 : 
                    (state.config.loop ? state.totalSlides - 1 : 0);
    
    this.goToSlide(carouselId, newIndex);
  },

  /**
   * 次のスライドに移動
   * @param {string} carouselId - カルーセルID
   */
  goToNext(carouselId) {
    const state = this.carousels.get(carouselId);
    if (!state || state.isTransitioning) return;
    
    const newIndex = state.currentIndex < state.totalSlides - 1 ? state.currentIndex + 1 : 
                    (state.config.loop ? 0 : state.totalSlides - 1);
    
    this.goToSlide(carouselId, newIndex);
  },

  /**
   * 指定したスライドに移動
   * @param {string} carouselId - カルーセルID
   * @param {number} index - スライドインデックス
   */
  goToSlide(carouselId, index) {
    const state = this.carousels.get(carouselId);
    if (!state || state.isTransitioning || index === state.currentIndex) return;
    
    // 範囲チェック
    if (index < 0 || index >= state.totalSlides) return;
    
    state.isTransitioning = true;
    
    // トランジションの実行
    this.executeTransition(carouselId, index);
    
    // 状態の更新
    state.currentIndex = index;
    this.updateCarouselState(carouselId);
    
    // イベントの発火
    this.dispatchSlideChangeEvent(carouselId, index);
    
    // トランジション完了後の処理
    setTimeout(() => {
      state.isTransitioning = false;
    }, 60000);
  },

  /**
   * トランジションの実行
   * @param {string} carouselId - カルーセルID
   * @param {number} index - スライドインデックス
   */
  executeTransition(carouselId, index) {
    const state = this.carousels.get(carouselId);
    if (!state) return;
    
    const { container, config } = state;
    
    if (config.transition === 'slide') {
      container.style.transform = `translateX(-${index * 100}%)`;
    } else if (config.transition === 'fade') {
      // フェードトランジション
      state.slides.forEach((slide, i) => {
        slide.style.opacity = i === index ? '1' : '0';
      });
    }
  },

  /**
   * カルーセル状態の更新
   * @param {string} carouselId - カルーセルID
   */
  updateCarouselState(carouselId) {
    const state = this.carousels.get(carouselId);
    if (!state) return;
    
    const { currentIndex, totalSlides, prevBtn, nextBtn, dotsWrap, config } = state;
    
    // ナビゲーションボタンの状態更新
    if (prevBtn) {
      prevBtn.disabled = !config.loop && currentIndex === 0;
      prevBtn.setAttribute('aria-hidden', (!config.loop && currentIndex === 0).toString());
    }
    
    if (nextBtn) {
      nextBtn.disabled = !config.loop && currentIndex === totalSlides - 1;
      nextBtn.setAttribute('aria-hidden', (!config.loop && currentIndex === totalSlides - 1).toString());
    }
    
    // ドットの状態更新
    if (dotsWrap) {
      const dots = dotsWrap.querySelectorAll('.kat-carousel__dot');
      dots.forEach((dot, i) => {
        dot.classList.toggle('kat-carousel__dot--active', i === currentIndex);
        dot.setAttribute('aria-current', i === currentIndex ? 'true' : 'false');
      });
    }
    
    // スライドの状態更新
    state.slides.forEach((slide, i) => {
      slide.setAttribute('aria-hidden', (i !== currentIndex).toString());
      slide.classList.toggle('kat-carousel__slide--active', i === currentIndex);
    });
    
    // アクセシビリティの更新
    state.viewport.setAttribute('aria-label', `スライド${currentIndex + 1} / ${totalSlides}`);
  },

  /**
   * 自動再生の開始
   * @param {string} carouselId - カルーセルID
   */
  startAutoplay(carouselId) {
    const state = this.carousels.get(carouselId);
    if (!state || !state.config.autoplay) return;
    
    this.resumeAutoplay(carouselId);
  },

  /**
   * 自動再生の一時停止
   * @param {string} carouselId - カルーセルID
   */
  pauseAutoplay(carouselId) {
    const state = this.carousels.get(carouselId);
    if (!state || !state.autoplayTimer) return;
    
    clearInterval(state.autoplayTimer);
    state.autoplayTimer = null;
  },

  /**
   * 自動再生の再開
   * @param {string} carouselId - カルーセルID
   */
  resumeAutoplay(carouselId) {
    const state = this.carousels.get(carouselId);
    if (!state || !state.config.autoplay || state.autoplayTimer) return;
    
    state.autoplayTimer = setInterval(() => {
      this.goToNext(carouselId);
    }, state.config.interval);
  },

  /**
   * スライド変更イベントの発火
   * @param {string} carouselId - カルーセルID
   * @param {number} index - スライドインデックス
   */
  dispatchSlideChangeEvent(carouselId, index) {
    const state = this.carousels.get(carouselId);
    if (!state) return;
    
    eventBus.emit('kat:carousel:slide-change', { carouselId, index, total: state.totalSlides });
    
    document.dispatchEvent(new CustomEvent('kat:carousel:slide-change', {
      detail: { carouselId, index, total: state.totalSlides }
    }));
  },

  /**
   * イベントのバインド
   */
  bindEvents() {
    // ウィンドウリサイズ時の処理
    window.addEventListener('resize', () => {
      this.carousels.forEach((state, carouselId) => {
        this.updateCarouselState(carouselId);
      });
    });
    
    // ページ可視性変更時の処理
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        // ページが非表示の時は自動再生を一時停止
        this.carousels.forEach((state, carouselId) => {
          this.pauseAutoplay(carouselId);
        });
      } else {
        // ページが表示された時は自動再生を再開
        this.carousels.forEach((state, carouselId) => {
          if (state.config.autoplay) {
            this.resumeAutoplay(carouselId);
          }
        });
      }
    });
  },

  /**
   * コンポーネントの破棄
   */
  destroy() {
    this.carousels.forEach((state, carouselId) => {
      // 自動再生タイマーのクリア
      if (state.autoplayTimer) {
        clearInterval(state.autoplayTimer);
      }
      
      // イベントリスナーの削除
      if (state.prevBtn) {
        state.prevBtn.removeEventListener('click', () => this.goToPrevious(carouselId));
      }
      
      if (state.nextBtn) {
        state.nextBtn.removeEventListener('click', () => this.goToNext(carouselId));
      }
      
      // タッチイベントの削除
      if (state.viewport) {
        state.viewport.removeEventListener('touchstart', () => {});
        state.viewport.removeEventListener('touchmove', () => {});
        state.viewport.removeEventListener('touchend', () => {});
      }
      
      // キーボードイベントの削除
      if (state.carousel) {
        state.carousel.removeEventListener('keydown', () => {});
      }
    });
    
    this.carousels.clear();
    
    // グローバルイベントの削除
    window.removeEventListener('resize', () => {});
    document.removeEventListener('visibilitychange', () => {});
  }
};
