/**
 * Navigation Dropdown コンポーネント
 * ナビゲーションドロップダウンの管理
 * 
 * @project: Kat UI
 * @author: Bui Van Tai, 2024-12-15
 * @version: 2.0.0
 */

import { eventBus } from '../core/events.js';

/**
 * Navigation Dropdown コンポーネント
 */
export const navigationDropdown = {
  /**
   * コンポーネントの初期化
   */
  init() {
    this.navigationDropdowns = new Map();
    this.activeDropdown = null;
    this.setupNavigationDropdowns();
    this.bindEvents();
  },

  /**
   * ナビゲーションドロップダウンの設定
   */
  setupNavigationDropdowns() {
    const dropdownElements = document.querySelectorAll('.kat-navigation-dropdown');
    
    dropdownElements.forEach((dropdown, index) => {
      const dropdownId = `navigation-dropdown-${index}`;
      dropdown.dataset.navigationDropdownId = dropdownId;
      
      const config = this.getNavigationDropdownConfig(dropdown);
      const state = this.createNavigationDropdownState(dropdown, config);
      
      this.navigationDropdowns.set(dropdownId, state);
      this.setupNavigationDropdown(dropdownId);
    });
  },

  /**
   * ナビゲーションドロップダウンの設定を取得
   * @param {HTMLElement} dropdown - ドロップダウン要素
   * @returns {Object} 設定オブジェクト
   */
  getNavigationDropdownConfig(dropdown) {
    return {
      hover: dropdown.hasAttribute('data-kat-hover'),
      delay: parseInt(dropdown.dataset.katDelay) || 200,
      autoClose: dropdown.hasAttribute('data-kat-auto-close') !== false,
      position: dropdown.dataset.katPosition || 'bottom',
      animation: dropdown.dataset.katAnimation || 'fade',
      mobileBreakpoint: parseInt(dropdown.dataset.katMobileBreakpoint) || 768
    };
  },

  /**
   * ナビゲーションドロップダウンの状態を作成
   * @param {HTMLElement} dropdown - ドロップダウン要素
   * @param {Object} config - 設定オブジェクト
   * @returns {Object} 状態オブジェクト
   */
  createNavigationDropdownState(dropdown, config) {
    const trigger = dropdown.querySelector('.kat-navigation-dropdown__trigger');
    const menu = dropdown.querySelector('.kat-navigation-dropdown__menu');
    const items = Array.from(dropdown.querySelectorAll('.kat-navigation-dropdown__item'));
    const links = Array.from(dropdown.querySelectorAll('.kat-navigation-dropdown__link'));
    
    return {
      dropdown,
      trigger,
      menu,
      items,
      links,
      config,
      isOpen: false,
      hoverTimer: null,
      closeTimer: null
    };
  },

  /**
   * 個別ナビゲーションドロップダウンの設定
   * @param {string} dropdownId - ドロップダウンID
   */
  setupNavigationDropdown(dropdownId) {
    const state = this.navigationDropdowns.get(dropdownId);
    if (!state) return;
    
    const { trigger, menu, items, links, config } = state;
    
    // トリガーの設定
    if (trigger) {
      this.setupTrigger(dropdownId, trigger);
    }
    
    // メニューの設定
    if (menu) {
      this.setupMenu(dropdownId, menu);
    }
    
    // アイテムの設定
    items.forEach((item, index) => {
      this.setupDropdownItem(dropdownId, item, index);
    });
    
    // リンクの設定
    links.forEach((link, index) => {
      this.setupDropdownLink(dropdownId, link, index);
    });
    
    // ホバー機能の設定
    if (config.hover) {
      this.setupHoverFunctionality(dropdownId);
    }
    
    // 初期状態の設定
    this.updateNavigationDropdownState(dropdownId);
  },

  /**
   * トリガーの設定
   * @param {string} dropdownId - ドロップダウンID
   * @param {HTMLElement} trigger - トリガー要素
   */
  setupTrigger(dropdownId, trigger) {
    const state = this.navigationDropdowns.get(dropdownId);
    if (!state) return;
    
    // クリックイベントの設定
    trigger.addEventListener('click', (e) => {
      e.preventDefault();
      this.toggleDropdown(dropdownId);
    });
    
    // キーボードイベントの設定
    trigger.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        this.toggleDropdown(dropdownId);
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        this.openDropdown(dropdownId);
        this.focusFirstItem(dropdownId);
      }
    });
    
    // アクセシビリティの設定
    trigger.setAttribute('aria-haspopup', 'true');
    trigger.setAttribute('aria-expanded', 'false');
    trigger.setAttribute('aria-controls', state.menu?.id || '');
  },

  /**
   * メニューの設定
   * @param {string} dropdownId - ドロップダウンID
   * @param {HTMLElement} menu - メニュー要素
   */
  setupMenu(dropdownId, menu) {
    const state = this.navigationDropdowns.get(dropdownId);
    if (!state) return;
    
    // メニューの初期設定
    menu.style.display = 'none';
    menu.setAttribute('role', 'menu');
    menu.setAttribute('aria-label', 'ナビゲーションメニュー');
    
    // キーボードナビゲーションの設定
    this.setupKeyboardNavigation(dropdownId, menu);
    
    // アニメーションの設定
    if (state.config.animation) {
      this.setupAnimation(dropdownId, menu);
    }
  },

  /**
   * ドロップダウンアイテムの設定
   * @param {string} dropdownId - ドロップダウンID
   * @param {HTMLElement} item - アイテム要素
   * @param {number} index - インデックス
   */
  setupDropdownItem(dropdownId, item, index) {
    const state = this.navigationDropdowns.get(dropdownId);
    if (!state) return;
    
    // アクセシビリティの設定
    item.setAttribute('role', 'none');
    
    // サブメニューの設定
    const submenu = item.querySelector('.kat-navigation-dropdown__submenu');
    if (submenu) {
      this.setupSubmenu(dropdownId, item, submenu);
    }
  },

  /**
   * ドロップダウンリンクの設定
   * @param {string} dropdownId - ドロップダウンID
   * @param {HTMLElement} link - リンク要素
   * @param {number} index - インデックス
   */
  setupDropdownLink(dropdownId, link, index) {
    const state = this.navigationDropdowns.get(dropdownId);
    if (!state) return;
    
    // アクセシビリティの設定
    link.setAttribute('role', 'menuitem');
    link.setAttribute('tabindex', '-1');
    
    // クリックイベントの設定
    link.addEventListener('click', (e) => {
      this.handleLinkClick(dropdownId, index, link, e);
    });
    
    // キーボードイベントの設定
    link.addEventListener('keydown', (e) => {
      this.handleLinkKeydown(dropdownId, index, link, e);
    });
    
    // フォーカスイベントの設定
    link.addEventListener('focus', () => {
      this.handleLinkFocus(dropdownId, index, link);
    });
    
    link.addEventListener('blur', () => {
      this.handleLinkBlur(dropdownId, index, link);
    });
  },

  /**
   * サブメニューの設定
   * @param {string} dropdownId - ドロップダウンID
   * @param {HTMLElement} item - アイテム要素
   * @param {HTMLElement} submenu - サブメニュー要素
   */
  setupSubmenu(dropdownId, item, submenu) {
    const state = this.navigationDropdowns.get(dropdownId);
    if (!state) return;
    
    // サブメニューの初期設定
    submenu.style.display = 'none';
    submenu.setAttribute('role', 'menu');
    submenu.setAttribute('aria-label', 'サブメニュー');
    
    // サブメニューのトリガー設定
    const submenuTrigger = item.querySelector('.kat-navigation-dropdown__submenu-trigger');
    if (submenuTrigger) {
      submenuTrigger.addEventListener('click', (e) => {
        e.preventDefault();
        this.toggleSubmenu(dropdownId, item, submenu);
      });
      
      submenuTrigger.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this.toggleSubmenu(dropdownId, item, submenu);
        }
      });
      
      submenuTrigger.setAttribute('aria-haspopup', 'true');
      submenuTrigger.setAttribute('aria-expanded', 'false');
    }
    
    // サブメニューアイテムの設定
    const submenuItems = submenu.querySelectorAll('.kat-navigation-dropdown__submenu-item');
    submenuItems.forEach((submenuItem, subIndex) => {
      this.setupSubmenuItem(dropdownId, submenuItem, subIndex);
    });
  },

  /**
   * サブメニューアイテムの設定
   * @param {string} dropdownId - ドロップダウンID
   * @param {HTMLElement} submenuItem - サブメニューアイテム要素
   * @param {number} subIndex - サブインデックス
   */
  setupSubmenuItem(dropdownId, submenuItem, subIndex) {
    const state = this.navigationDropdowns.get(dropdownId);
    if (!state) return;
    
    const submenuLink = submenuItem.querySelector('.kat-navigation-dropdown__submenu-link');
    
    if (submenuLink) {
      submenuLink.setAttribute('role', 'menuitem');
      submenuLink.setAttribute('tabindex', '-1');
      
      submenuLink.addEventListener('click', (e) => {
        this.handleSubmenuLinkClick(dropdownId, subIndex, submenuLink, e);
      });
      
      submenuLink.addEventListener('keydown', (e) => {
        this.handleSubmenuLinkKeydown(dropdownId, subIndex, submenuLink, e);
      });
    }
  },

  /**
   * ホバー機能の設定
   * @param {string} dropdownId - ドロップダウンID
   */
  setupHoverFunctionality(dropdownId) {
    const state = this.navigationDropdowns.get(dropdownId);
    if (!state) return;
    
    const { dropdown, config } = state;
    
    // マウスエンター時の処理
    dropdown.addEventListener('mouseenter', () => {
      this.handleMouseEnter(dropdownId);
    });
    
    // マウスリーブ時の処理
    dropdown.addEventListener('mouseleave', () => {
      this.handleMouseLeave(dropdownId);
    });
  },

  /**
   * キーボードナビゲーションの設定
   * @param {string} dropdownId - ドロップダウンID
   * @param {HTMLElement} menu - メニュー要素
   */
  setupKeyboardNavigation(dropdownId, menu) {
    const state = this.navigationDropdowns.get(dropdownId);
    if (!state) return;
    
    menu.addEventListener('keydown', (e) => {
      const { items, links } = state;
      
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          this.focusNextItem(dropdownId);
          break;
        case 'ArrowUp':
          e.preventDefault();
          this.focusPreviousItem(dropdownId);
          break;
        case 'Home':
          e.preventDefault();
          this.focusFirstItem(dropdownId);
          break;
        case 'End':
          e.preventDefault();
          this.focusLastItem(dropdownId);
          break;
        case 'Escape':
          e.preventDefault();
          this.closeDropdown(dropdownId);
          break;
        case 'Tab':
          // Tabキーでのフォーカス管理
          this.handleTabNavigation(dropdownId, e);
          break;
      }
    });
  },

  /**
   * アニメーションの設定
   * @param {string} dropdownId - ドロップダウンID
   * @param {HTMLElement} menu - メニュー要素
   */
  setupAnimation(dropdownId, menu) {
    const state = this.navigationDropdowns.get(dropdownId);
    if (!state) return;
    
    const { config } = state;
    
    if (config.animation === 'fade') {
      menu.style.transition = 'opacity 0.2s ease-in-out';
    } else if (config.animation === 'slide') {
      menu.style.transition = 'transform 0.2s ease-in-out, opacity 0.2s ease-in-out';
    }
  },

  /**
   * ドロップダウンのトグル
   * @param {string} dropdownId - ドロップダウンID
   */
  toggleDropdown(dropdownId) {
    const state = this.navigationDropdowns.get(dropdownId);
    if (!state) return;
    
    if (state.isOpen) {
      this.closeDropdown(dropdownId);
    } else {
      this.openDropdown(dropdownId);
    }
  },

  /**
   * ドロップダウンを開く
   * @param {string} dropdownId - ドロップダウンID
   */
  openDropdown(dropdownId) {
    const state = this.navigationDropdowns.get(dropdownId);
    if (!state) return;
    
    // 他のドロップダウンを閉じる
    this.closeAllDropdowns();
    
    // ドロップダウンの状態を更新
    state.isOpen = true;
    state.dropdown.classList.add('kat-navigation-dropdown--open');
    
    // トリガーの状態を更新
    if (state.trigger) {
      state.trigger.setAttribute('aria-expanded', 'true');
      state.trigger.classList.add('kat-navigation-dropdown__trigger--open');
    }
    
    // メニューを表示
    if (state.menu) {
      this.showMenu(dropdownId);
    }
    
    // アクティブドロップダウンの設定
    this.activeDropdown = dropdownId;
    
    // ドロップダウン開始イベントの発火
    this.dispatchDropdownOpenEvent(dropdownId);
  },

  /**
   * ドロップダウンを閉じる
   * @param {string} dropdownId - ドロップダウンID
   */
  closeDropdown(dropdownId) {
    const state = this.navigationDropdowns.get(dropdownId);
    if (!state) return;
    
    // ドロップダウンの状態を更新
    state.isOpen = false;
    state.dropdown.classList.remove('kat-navigation-dropdown--open');
    
    // トリガーの状態を更新
    if (state.trigger) {
      state.trigger.setAttribute('aria-expanded', 'false');
      state.trigger.classList.remove('kat-navigation-dropdown__trigger--open');
    }
    
    // メニューを非表示
    if (state.menu) {
      this.hideMenu(dropdownId);
    }
    
    // アクティブドロップダウンのクリア
    if (this.activeDropdown === dropdownId) {
      this.activeDropdown = null;
    }
    
    // ドロップダウン終了イベントの発火
    this.dispatchDropdownCloseEvent(dropdownId);
  },

  /**
   * すべてのドロップダウンを閉じる
   */
  closeAllDropdowns() {
    this.navigationDropdowns.forEach((state, dropdownId) => {
      if (state.isOpen) {
        this.closeDropdown(dropdownId);
      }
    });
  },

  /**
   * メニューを表示
   * @param {string} dropdownId - ドロップダウンID
   */
  showMenu(dropdownId) {
    const state = this.navigationDropdowns.get(dropdownId);
    if (!state || !state.menu) return;
    
    const { menu, trigger, config } = state;
    
    // メニューの位置を調整
    this.positionMenu(dropdownId);
    
    // メニューを表示
    menu.style.display = 'block';
    
    // アニメーションの適用
    if (config.animation === 'fade') {
      menu.style.opacity = '0';
      setTimeout(() => {
        menu.style.opacity = '1';
      }, 10);
    } else if (config.animation === 'slide') {
      menu.style.opacity = '0';
      menu.style.transform = 'translateY(-10px)';
      setTimeout(() => {
        menu.style.opacity = '1';
        menu.style.transform = 'translateY(0)';
      }, 10);
    }
    
    // フォーカス管理
    this.manageMenuFocus(dropdownId);
  },

  /**
   * メニューを非表示
   * @param {string} dropdownId - ドロップダウンID
   */
  hideMenu(dropdownId) {
    const state = this.navigationDropdowns.get(dropdownId);
    if (!state || !state.menu) return;
    
    const { menu, config } = state;
    
    // アニメーションの適用
    if (config.animation === 'fade') {
      menu.style.opacity = '0';
      setTimeout(() => {
        menu.style.display = 'none';
      }, 200);
    } else if (config.animation === 'slide') {
      menu.style.opacity = '0';
      menu.style.transform = 'translateY(-10px)';
      setTimeout(() => {
        menu.style.display = 'none';
      }, 200);
    } else {
      menu.style.display = 'none';
    }
  },

  /**
   * メニューの位置を調整
   * @param {string} dropdownId - ドロップダウンID
   */
  positionMenu(dropdownId) {
    const state = this.navigationDropdowns.get(dropdownId);
    if (!state || !state.menu || !state.trigger) return;
    
    const { menu, trigger, config } = state;
    const triggerRect = trigger.getBoundingClientRect();
    const menuRect = menu.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;
    
    // デフォルト位置（下）
    let top = triggerRect.bottom + window.pageYOffset;
    let left = triggerRect.left + window.pageXOffset;
    
    // 位置の調整
    if (config.position === 'top') {
      top = triggerRect.top + window.pageYOffset - menuRect.height;
    } else if (config.position === 'left') {
      left = triggerRect.left + window.pageXOffset - menuRect.width;
    } else if (config.position === 'right') {
      left = triggerRect.right + window.pageXOffset;
    }
    
    // ビューポート内に収める
    if (top + menuRect.height > viewportHeight) {
      top = triggerRect.top + window.pageYOffset - menuRect.height;
    }
    
    if (left + menuRect.width > viewportWidth) {
      left = viewportWidth - menuRect.width - 10;
    }
    
    if (left < 0) {
      left = 10;
    }
    
    menu.style.top = `${top}px`;
    menu.style.left = `${left}px`;
  },

  /**
   * メニューのフォーカス管理
   * @param {string} dropdownId - ドロップダウンID
   */
  manageMenuFocus(dropdownId) {
    const state = this.navigationDropdowns.get(dropdownId);
    if (!state || !state.menu) return;
    
    // 最初のフォーカス可能要素にフォーカス
    const firstFocusableElement = state.menu.querySelector(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    if (firstFocusableElement) {
      firstFocusableElement.focus();
    }
  },

  /**
   * 次のアイテムにフォーカス
   * @param {string} dropdownId - ドロップダウンID
   */
  focusNextItem(dropdownId) {
    const state = this.navigationDropdowns.get(dropdownId);
    if (!state) return;
    
    const { links } = state;
    const currentIndex = links.findIndex(link => document.activeElement === link);
    const nextIndex = (currentIndex + 1) % links.length;
    
    links[nextIndex].focus();
  },

  /**
   * 前のアイテムにフォーカス
   * @param {string} dropdownId - ドロップダウンID
   */
  focusPreviousItem(dropdownId) {
    const state = this.navigationDropdowns.get(dropdownId);
    if (!state) return;
    
    const { links } = state;
    const currentIndex = links.findIndex(link => document.activeElement === link);
    const prevIndex = currentIndex > 0 ? currentIndex - 1 : links.length - 1;
    
    links[prevIndex].focus();
  },

  /**
   * 最初のアイテムにフォーカス
   * @param {string} dropdownId - ドロップダウンID
   */
  focusFirstItem(dropdownId) {
    const state = this.navigationDropdowns.get(dropdownId);
    if (!state || state.links.length === 0) return;
    
    state.links[0].focus();
  },

  /**
   * 最後のアイテムにフォーカス
   * @param {string} dropdownId - ドロップダウンID
   */
  focusLastItem(dropdownId) {
    const state = this.navigationDropdowns.get(dropdownId);
    if (!state || state.links.length === 0) return;
    
    state.links[state.links.length - 1].focus();
  },

  /**
   * Tabキーナビゲーションの処理
   * @param {string} dropdownId - ドロップダウンID
   * @param {Event} e - キーダウンイベント
   */
  handleTabNavigation(dropdownId, e) {
    const state = this.navigationDropdowns.get(dropdownId);
    if (!state) return;
    
    const { links } = state;
    const currentIndex = links.findIndex(link => document.activeElement === link);
    
    if (e.shiftKey) {
      // Shift+Tab: 前の要素にフォーカス
      if (currentIndex === 0) {
        e.preventDefault();
        this.closeDropdown(dropdownId);
        if (state.trigger) {
          state.trigger.focus();
        }
      }
    } else {
      // Tab: 次の要素にフォーカス
      if (currentIndex === links.length - 1) {
        e.preventDefault();
        this.closeDropdown(dropdownId);
        if (state.trigger) {
          state.trigger.focus();
        }
      }
    }
  },

  /**
   * サブメニューのトグル
   * @param {string} dropdownId - ドロップダウンID
   * @param {HTMLElement} item - アイテム要素
   * @param {HTMLElement} submenu - サブメニュー要素
   */
  toggleSubmenu(dropdownId, item, submenu) {
    const isOpen = submenu.style.display === 'block';
    const submenuTrigger = item.querySelector('.kat-navigation-dropdown__submenu-trigger');
    
    if (isOpen) {
      submenu.style.display = 'none';
      if (submenuTrigger) {
        submenuTrigger.setAttribute('aria-expanded', 'false');
      }
    } else {
      submenu.style.display = 'block';
      if (submenuTrigger) {
        submenuTrigger.setAttribute('aria-expanded', 'true');
      }
    }
  },

  /**
   * マウスエンターの処理
   * @param {string} dropdownId - ドロップダウンID
   */
  handleMouseEnter(dropdownId) {
    const state = this.navigationDropdowns.get(dropdownId);
    if (!state || !state.config.hover) return;
    
    // 既存のタイマーをクリア
    if (state.closeTimer) {
      clearTimeout(state.closeTimer);
      state.closeTimer = null;
    }
    
    // ドロップダウンを開く
    if (!state.isOpen) {
      state.hoverTimer = setTimeout(() => {
        this.openDropdown(dropdownId);
      }, state.config.delay);
    }
  },

  /**
   * マウスリーブの処理
   * @param {string} dropdownId - ドロップダウンID
   */
  handleMouseLeave(dropdownId) {
    const state = this.navigationDropdowns.get(dropdownId);
    if (!state || !state.config.hover) return;
    
    // 既存のタイマーをクリア
    if (state.hoverTimer) {
      clearTimeout(state.hoverTimer);
      state.hoverTimer = null;
    }
    
    // ドロップダウンを閉じる
    if (state.isOpen) {
      state.closeTimer = setTimeout(() => {
        this.closeDropdown(dropdownId);
      }, state.config.delay);
    }
  },

  /**
   * リンククリックの処理
   * @param {string} dropdownId - ドロップダウンID
   * @param {number} index - インデックス
   * @param {HTMLElement} link - リンク要素
   * @param {Event} e - クリックイベント
   */
  handleLinkClick(dropdownId, index, link, e) {
    // リンククリックイベントの発火
    this.dispatchLinkClickEvent(dropdownId, index, link);
    
    // 自動クローズの処理
    const state = this.navigationDropdowns.get(dropdownId);
    if (state && state.config.autoClose) {
      this.closeDropdown(dropdownId);
    }
  },

  /**
   * リンクキーダウンの処理
   * @param {string} dropdownId - ドロップダウンID
   * @param {number} index - インデックス
   * @param {HTMLElement} link - リンク要素
   * @param {Event} e - キーダウンイベント
   */
  handleLinkKeydown(dropdownId, index, link, e) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      this.handleLinkClick(dropdownId, index, link, e);
    }
  },

  /**
   * リンクフォーカスの処理
   * @param {string} dropdownId - ドロップダウンID
   * @param {number} index - インデックス
   * @param {HTMLElement} link - リンク要素
   */
  handleLinkFocus(dropdownId, index, link) {
    // フォーカスイベントの発火
    this.dispatchLinkFocusEvent(dropdownId, index, link);
  },

  /**
   * リンクブラーの処理
   * @param {string} dropdownId - ドロップダウンID
   * @param {number} index - インデックス
   * @param {HTMLElement} link - リンク要素
   */
  handleLinkBlur(dropdownId, index, link) {
    // ブラーイベントの発火
    this.dispatchLinkBlurEvent(dropdownId, index, link);
  },

  /**
   * サブメニューリンククリックの処理
   * @param {string} dropdownId - ドロップダウンID
   * @param {number} subIndex - サブインデックス
   * @param {HTMLElement} submenuLink - サブメニューリンク要素
   * @param {Event} e - クリックイベント
   */
  handleSubmenuLinkClick(dropdownId, subIndex, submenuLink, e) {
    // サブメニューリンククリックイベントの発火
    this.dispatchSubmenuLinkClickEvent(dropdownId, subIndex, submenuLink);
    
    // 自動クローズの処理
    const state = this.navigationDropdowns.get(dropdownId);
    if (state && state.config.autoClose) {
      this.closeDropdown(dropdownId);
    }
  },

  /**
   * サブメニューリンクキーダウンの処理
   * @param {string} dropdownId - ドロップダウンID
   * @param {number} subIndex - サブインデックス
   * @param {HTMLElement} submenuLink - サブメニューリンク要素
   * @param {Event} e - キーダウンイベント
   */
  handleSubmenuLinkKeydown(dropdownId, subIndex, submenuLink, e) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      this.handleSubmenuLinkClick(dropdownId, subIndex, submenuLink, e);
    }
  },

  /**
   * ナビゲーションドロップダウン状態の更新
   * @param {string} dropdownId - ドロップダウンID
   */
  updateNavigationDropdownState(dropdownId) {
    const state = this.navigationDropdowns.get(dropdownId);
    if (!state) return;
    
    const { dropdown, config } = state;
    
    // モバイル判定
    if (window.innerWidth <= config.mobileBreakpoint) {
      dropdown.classList.add('kat-navigation-dropdown--mobile');
    } else {
      dropdown.classList.remove('kat-navigation-dropdown--mobile');
    }
    
    // アクセシビリティの更新
    dropdown.setAttribute('role', 'navigation');
    dropdown.setAttribute('aria-label', 'ナビゲーションドロップダウン');
  },

  /**
   * ドロップダウン開始イベントの発火
   * @param {string} dropdownId - ドロップダウンID
   */
  dispatchDropdownOpenEvent(dropdownId) {
    eventBus.emit('kat:navigation-dropdown:open', { dropdownId });
    
    document.dispatchEvent(new CustomEvent('kat:navigation-dropdown:open', {
      detail: { dropdownId }
    }));
  },

  /**
   * ドロップダウン終了イベントの発火
   * @param {string} dropdownId - ドロップダウンID
   */
  dispatchDropdownCloseEvent(dropdownId) {
    eventBus.emit('kat:navigation-dropdown:close', { dropdownId });
    
    document.dispatchEvent(new CustomEvent('kat:navigation-dropdown:close', {
      detail: { dropdownId }
    }));
  },

  /**
   * リンククリックイベントの発火
   * @param {string} dropdownId - ドロップダウンID
   * @param {number} index - インデックス
   * @param {HTMLElement} link - リンク要素
   */
  dispatchLinkClickEvent(dropdownId, index, link) {
    eventBus.emit('kat:navigation-dropdown:link-click', { dropdownId, index, link });
    
    document.dispatchEvent(new CustomEvent('kat:navigation-dropdown:link-click', {
      detail: { dropdownId, index, link }
    }));
  },

  /**
   * リンクフォーカスイベントの発火
   * @param {string} dropdownId - ドロップダウンID
   * @param {number} index - インデックス
   * @param {HTMLElement} link - リンク要素
   */
  dispatchLinkFocusEvent(dropdownId, index, link) {
    eventBus.emit('kat:navigation-dropdown:link-focus', { dropdownId, index, link });
    
    document.dispatchEvent(new CustomEvent('kat:navigation-dropdown:link-focus', {
      detail: { dropdownId, index, link }
    }));
  },

  /**
   * リンクブラーイベントの発火
   * @param {string} dropdownId - ドロップダウンID
   * @param {number} index - インデックス
   * @param {HTMLElement} link - リンク要素
   */
  dispatchLinkBlurEvent(dropdownId, index, link) {
    eventBus.emit('kat:navigation-dropdown:link-blur', { dropdownId, index, link });
    
    document.dispatchEvent(new CustomEvent('kat:navigation-dropdown:link-blur', {
      detail: { dropdownId, index, link }
    }));
  },

  /**
   * サブメニューリンククリックイベントの発火
   * @param {string} dropdownId - ドロップダウンID
   * @param {number} subIndex - サブインデックス
   * @param {HTMLElement} submenuLink - サブメニューリンク要素
   */
  dispatchSubmenuLinkClickEvent(dropdownId, subIndex, submenuLink) {
    eventBus.emit('kat:navigation-dropdown:submenu-link-click', { dropdownId, subIndex, submenuLink });
    
    document.dispatchEvent(new CustomEvent('kat:navigation-dropdown:submenu-link-click', {
      detail: { dropdownId, subIndex, submenuLink }
    }));
  },

  /**
   * イベントのバインド
   */
  bindEvents() {
    // ウィンドウリサイズ時の処理
    window.addEventListener('resize', () => {
      this.navigationDropdowns.forEach((state, dropdownId) => {
        this.updateNavigationDropdownState(dropdownId);
      });
    });
    
    // 外側クリック時の処理
    document.addEventListener('click', (e) => {
      if (this.activeDropdown) {
        const state = this.navigationDropdowns.get(this.activeDropdown);
        if (state && !state.dropdown.contains(e.target)) {
          this.closeDropdown(this.activeDropdown);
        }
      }
    });
  },

  /**
   * コンポーネントの破棄
   */
  destroy() {
    this.navigationDropdowns.forEach((state, dropdownId) => {
      // タイマーのクリア
      if (state.hoverTimer) {
        clearTimeout(state.hoverTimer);
      }
      
      if (state.closeTimer) {
        clearTimeout(state.closeTimer);
      }
      
      // トリガーのイベントリスナーを削除
      if (state.trigger) {
        state.trigger.removeEventListener('click', () => {});
        state.trigger.removeEventListener('keydown', () => {});
      }
      
      // リンクのイベントリスナーを削除
      state.links.forEach(link => {
        link.removeEventListener('click', () => {});
        link.removeEventListener('keydown', () => {});
        link.removeEventListener('focus', () => {});
        link.removeEventListener('blur', () => {});
      });
      
      // サブメニューのイベントリスナーを削除
      const submenuTriggers = state.dropdown.querySelectorAll('.kat-navigation-dropdown__submenu-trigger');
      submenuTriggers.forEach(trigger => {
        trigger.removeEventListener('click', () => {});
        trigger.removeEventListener('keydown', () => {});
      });
      
      const submenuLinks = state.dropdown.querySelectorAll('.kat-navigation-dropdown__submenu-link');
      submenuLinks.forEach(link => {
        link.removeEventListener('click', () => {});
        link.removeEventListener('keydown', () => {});
      });
      
      // ホバーイベントの削除
      if (state.config.hover) {
        state.dropdown.removeEventListener('mouseenter', () => {});
        state.dropdown.removeEventListener('mouseleave', () => {});
      }
    });
    
    this.navigationDropdowns.clear();
    
    // グローバルイベントの削除
    window.removeEventListener('resize', () => {});
    document.removeEventListener('click', () => {});
  }
};
