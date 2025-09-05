/**
 * Header Popups コンポーネント
 * ヘッダーのポップアップ（通知、カート、ウィッシュリスト）の管理
 * 
 * @project: Kat UI
 * @author: Bui Van Tai, 2024-12-15
 * @version: 2.0.0
 */

import { eventBus } from '../core/events.js';

/**
 * Header Popups コンポーネント
 */
export const headerPopups = {
  /**
   * コンポーネントの初期化
   */
  init() {
    this.initNotificationPopup();
    this.initCartPopup();
    this.initWishlistPopup();
    this.initSearchPopup();
    this.initExternalClickHandlers();
  },

  /**
   * 通知ポップアップ（クリック）
   */
  initNotificationPopup() {
    const trigger = document.getElementById('notification-trigger');
    const popup = document.getElementById('notification-popup');
    
    if (!trigger || !popup) return;

    trigger.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      
      // 他のポップアップを閉じる
      headerPopups.closeAllPopups();
      
      // ポップアップの表示切り替え
      const isCurrentlyOpen = popup.classList.contains('kat-header-popup--open');
      if (isCurrentlyOpen) {
        popup.classList.remove('kat-header-popup--open');
        trigger.setAttribute('aria-expanded', 'false');
      } else {
        popup.classList.add('kat-header-popup--open');
        trigger.setAttribute('aria-expanded', 'true');
      }
    });

    // すべて既読にするボタン
    const markReadBtn = popup.querySelector('.kat-notification-popup__mark-read');
    if (markReadBtn) {
      markReadBtn.addEventListener('click', function(e) {
        e.preventDefault();
        const unreadItems = popup.querySelectorAll('.kat-notification-popup__item--unread');
        unreadItems.forEach(item => {
          item.classList.remove('kat-notification-popup__item--unread');
        });
        
        // バッジを更新
        const badge = trigger.querySelector('.kat-ecommerce-header__action-badge');
        if (badge) {
          badge.textContent = '0';
          badge.style.display = 'none';
        }
      });
    }
  },

  /**
   * カートポップアップ（ホバー）
   */
  initCartPopup() {
    const trigger = document.getElementById('cart-trigger');
    const popup = document.getElementById('cart-popup');
    
    if (!trigger || !popup) return;

    let hoverTimeout;

    trigger.addEventListener('mouseenter', function() {
      clearTimeout(hoverTimeout);
      hoverTimeout = setTimeout(() => {
        headerPopups.closeAllPopups();
        popup.classList.add('kat-header-popup--open');
        trigger.setAttribute('aria-expanded', 'true');
      }, 200);
    });

    trigger.addEventListener('mouseleave', function() {
      clearTimeout(hoverTimeout);
      hoverTimeout = setTimeout(() => {
        if (!popup.matches(':hover')) {
          popup.classList.remove('kat-header-popup--open');
          trigger.setAttribute('aria-expanded', 'false');
        }
      }, 200);
    });

    popup.addEventListener('mouseenter', function() {
      clearTimeout(hoverTimeout);
    });

    popup.addEventListener('mouseleave', function() {
      clearTimeout(hoverTimeout);
      hoverTimeout = setTimeout(() => {
        popup.classList.remove('kat-header-popup--open');
        trigger.setAttribute('aria-expanded', 'false');
      }, 200);
    });
  },

  /**
   * ウィッシュリストポップアップ（ホバー）
   */
  initWishlistPopup() {
    const trigger = document.getElementById('wishlist-trigger');
    const popup = document.getElementById('wishlist-popup');
    
    if (!trigger || !popup) return;

    let hoverTimeout;

    trigger.addEventListener('mouseenter', function() {
      clearTimeout(hoverTimeout);
      hoverTimeout = setTimeout(() => {
        headerPopups.closeAllPopups();
        popup.classList.add('kat-header-popup--open');
        trigger.setAttribute('aria-expanded', 'true');
      }, 200);
    });

    trigger.addEventListener('mouseleave', function() {
      clearTimeout(hoverTimeout);
      hoverTimeout = setTimeout(() => {
        if (!popup.matches(':hover')) {
          popup.classList.remove('kat-header-popup--open');
          trigger.setAttribute('aria-expanded', 'false');
        }
      }, 200);
    });

    popup.addEventListener('mouseenter', function() {
      clearTimeout(hoverTimeout);
    });

    popup.addEventListener('mouseleave', function() {
      clearTimeout(hoverTimeout);
      hoverTimeout = setTimeout(() => {
        popup.classList.remove('kat-header-popup--open');
        trigger.setAttribute('aria-expanded', 'false');
      }, 200);
    });
  },

  /**
   * 検索ポップアップ（クリックで開閉）
   */
  initSearchPopup() {
    const trigger = document.getElementById('search-trigger');
    const popup = document.getElementById('search-popup');
    if (!trigger || !popup) return;

    const closeBtn = popup.querySelector('.kat-search-popup__close');
    const form = popup.querySelector('.kat-search-popup__form');
    const input = popup.querySelector('.kat-search-popup__input');

    // ポップアップを開く
    const open = () => {
      this.closeAllPopups();
      popup.classList.add('kat-search-popup--open');
      popup.setAttribute('aria-hidden', 'false');
      trigger.setAttribute('aria-expanded', 'true');
      document.body.classList.add('kat-search-open');
      if (input) input.focus();
    };

    // ポップアップを閉じる
    const close = () => {
      popup.classList.remove('kat-search-popup--open');
      popup.setAttribute('aria-hidden', 'true');
      trigger.setAttribute('aria-expanded', 'false');
      document.body.classList.remove('kat-search-open');
    };

    // トリガークリックで開閉
    trigger.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (popup.classList.contains('kat-search-popup--open')) {
        close();
      } else {
        open();
      }
    });

    // 閉じるボタン
    if (closeBtn) {
      closeBtn.addEventListener('click', (e) => {
        e.preventDefault();
        close();
      });
    }

    // 背景クリックで閉じる（フォーム領域外）
    popup.addEventListener('click', (e) => {
      if (e.target === popup) close();
    });

    // ESCキーで閉じる
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') close();
    });

    // ハッシュタグクリック：入力に反映して送信
    const tags = popup.querySelectorAll('.kat-search-hashtag');
    tags.forEach(tag => {
      tag.addEventListener('click', (e) => {
        e.preventDefault();
        const value = tag.getAttribute('data-tag') || tag.textContent || '';
        if (input) input.value = value.trim();
        if (form) form.requestSubmit ? form.requestSubmit() : form.submit();
      });
    });

    // 最近の検索クリック：入力に反映して送信
    const recents = popup.querySelectorAll('.kat-search-recent__item');
    recents.forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        const value = item.getAttribute('data-query') || item.textContent || '';
        if (input) input.value = value.trim();
        if (form) form.requestSubmit ? form.requestSubmit() : form.submit();
      });
    });
  },

  /**
   * すべてのポップアップを閉じる
   */
  closeAllPopups() {
    // 既存のヘッダーポップアップを閉じる
    const headerPopups = document.querySelectorAll('.kat-header-popup');
    headerPopups.forEach(p => p.classList.remove('kat-header-popup--open'));

    // 通知・カート・ウィッシュリストを閉じる
    const notificationPopup = document.querySelector('.kat-notification-popup');
    if (notificationPopup) notificationPopup.classList.remove('kat-header-popup--open');
    const cartPopup = document.querySelector('.kat-cart-popup');
    if (cartPopup) cartPopup.classList.remove('kat-header-popup--open');
    const wishlistPopup = document.querySelector('.kat-wishlist-popup');
    if (wishlistPopup) wishlistPopup.classList.remove('kat-header-popup--open');

    // 検索ポップアップも閉じる
    const searchPopup = document.getElementById('search-popup');
    if (searchPopup) {
      searchPopup.classList.remove('kat-search-popup--open');
      searchPopup.setAttribute('aria-hidden', 'true');
    }

    // aria-expandedを初期化
    const triggers = document.querySelectorAll('[aria-expanded]');
    triggers.forEach(trigger => {
      trigger.setAttribute('aria-expanded', 'false');
    });
  },

  /**
   * 外部クリックハンドラーを初期化
   */
  initExternalClickHandlers() {
    // 通知ポップアップの外部クリック処理
    const notificationTrigger = document.getElementById('notification-trigger');
    const notificationPopup = document.getElementById('notification-popup');
    
    if (notificationTrigger && notificationPopup) {
      document.addEventListener('click', function(e) {
        // 通知トリガーまたはポップアップ内をクリックした場合は何もしない
        if (notificationTrigger.contains(e.target) || notificationPopup.contains(e.target)) {
          return;
        }
        
        // 外部をクリックした場合はポップアップを閉じる
        if (notificationPopup.classList.contains('kat-header-popup--open')) {
          notificationPopup.classList.remove('kat-header-popup--open');
          notificationTrigger.setAttribute('aria-expanded', 'false');
        }
      });
    }

    // カートポップアップの外部クリック処理
    const cartTrigger = document.getElementById('cart-trigger');
    const cartPopup = document.getElementById('cart-popup');
    
    if (cartTrigger && cartPopup) {
      document.addEventListener('click', function(e) {
        if (cartTrigger.contains(e.target) || cartPopup.contains(e.target)) {
          return;
        }
        
        if (cartPopup.classList.contains('kat-header-popup--open')) {
          cartPopup.classList.remove('kat-header-popup--open');
          cartTrigger.setAttribute('aria-expanded', 'false');
        }
      });
    }

    // ウィッシュリストポップアップの外部クリック処理
    const wishlistTrigger = document.getElementById('wishlist-trigger');
    const wishlistPopup = document.getElementById('wishlist-popup');
    
    if (wishlistTrigger && wishlistPopup) {
      document.addEventListener('click', function(e) {
        if (wishlistTrigger.contains(e.target) || wishlistPopup.contains(e.target)) {
          return;
        }
        
        if (wishlistPopup.classList.contains('kat-header-popup--open')) {
          wishlistPopup.classList.remove('kat-header-popup--open');
          wishlistTrigger.setAttribute('aria-expanded', 'false');
        }
      });
    }
  },

  /**
   * コンポーネントの破棄
   */
  destroy() {
    // イベントリスナーの削除は必要に応じて実装
  }
};

// 外部クリックでポップアップを閉じる
document.addEventListener('click', function(e) {
  const headerAction = e.target.closest('.kat-ecommerce-header__action');
  const headerPopup = e.target.closest('.kat-header-popup');
  const notificationPopup = e.target.closest('.kat-notification-popup');
  const cartPopup = e.target.closest('.kat-cart-popup');
  const wishlistPopup = e.target.closest('.kat-wishlist-popup');
  const searchPopup = e.target.closest('#search-popup');
  
  if (!headerAction && !headerPopup && !notificationPopup && !cartPopup && !wishlistPopup && !searchPopup) {
    headerPopups.closeAllPopups();
  }
});

// ESCキーでポップアップを閉じる
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') {
    headerPopups.closeAllPopups();
  }
});
