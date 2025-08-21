/**
 * Category Navigation コンポーネント
 * カテゴリーナビゲーションの管理
 * 
 * @project: Kat UI
 * @author: Bui Van Tai, 2024-12-15
 * @version: 2.0.0
 */

import { eventBus } from '../core/events.js';

/**
 * Category Navigation コンポーネント
 */
export const categoryNav = {
  /**
   * コンポーネントの初期化
   */
  init() {
    this.setupCategoryNavs();
  },

  /**
   * カテゴリーナビゲーションの設定
   */
  setupCategoryNavs() {
    const categoryToggles = document.querySelectorAll('.kat-category-nav__toggle');
    
    categoryToggles.forEach(toggle => {
      toggle.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        const item = this.closest('.kat-category-nav__item');
        const submenu = item.querySelector('.kat-category-nav__submenu');
        const icon = this.querySelector('.kat-category-nav__icon');
        const isExpanded = this.getAttribute('aria-expanded') === 'true';
        
        // 展開状態を切り替え
        const newExpandedState = !isExpanded;
        this.setAttribute('aria-expanded', newExpandedState);
        
        // サブメニューの表示を切り替え
        if (newExpandedState) {
          // 開く
          submenu.classList.add('kat-category-nav__submenu--open');
          icon.textContent = '-';
          icon.className = 'kat-category-nav__icon kat-category-nav__icon--minus';
          item.classList.add('kat-category-nav__item--active');
        } else {
          // 閉じる
          submenu.classList.remove('kat-category-nav__submenu--open');
          icon.textContent = '+';
          icon.className = 'kat-category-nav__icon kat-category-nav__icon--plus';
          item.classList.remove('kat-category-nav__item--active');
        }
      });
    });
  },

  /**
   * コンポーネントの破棄
   */
  destroy() {
    // イベントリスナーの削除は必要に応じて実装
  }
};
