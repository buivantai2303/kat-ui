/**
 * Kat UI - サイドバーコンポーネント
 * サイドバーの表示・非表示とサブメニューの管理
 */

import { KAT_UI } from '../core/constants.js';
import { utils } from '../core/utils.js';
import { customEvents } from '../core/events.js';

export const sidebar = {
  /**
   * サイドバーの初期化
   */
  init: function() {
    this.bindEvents();
  },

  /**
   * イベントのバインド
   */
  bindEvents: function() {
    // サイドバーの開閉
    utils.delegate(document, 'click', `[${KAT_UI.DATA_ATTRIBUTES.TOGGLE}="sidebar"]`, (e) => {
      const sidebar = document.getElementById('sidebar') || document.querySelector('.kat-sidebar');
      if (sidebar) this.toggle(sidebar);
    });

    // サブメニューの開閉
    utils.delegate(document, 'click', `[${KAT_UI.DATA_ATTRIBUTES.TOGGLE}="submenu"]`, (e) => {
      const targetId = e.target.getAttribute(KAT_UI.DATA_ATTRIBUTES.TARGET);
      const submenu = document.getElementById(targetId);
      if (submenu) this.toggleSubmenu(e.target, submenu);
    });

    // ESCキーでサイドバーを閉じる
    document.addEventListener('keydown', (e) => {
      if (e.key === KAT_UI.KEYS.ESCAPE) {
        const openSidebar = document.querySelector('.kat-sidebar.kat-sidebar--open');
        if (openSidebar) this.close(openSidebar);
      }
    });

    // 外部クリックでサイドバーを閉じる
    document.addEventListener('click', (e) => {
      const sidebar = document.querySelector('.kat-sidebar.kat-sidebar--open');
      if (sidebar && !sidebar.contains(e.target) && !e.target.closest(`[${KAT_UI.DATA_ATTRIBUTES.TOGGLE}="sidebar"]`)) {
        this.close(sidebar);
      }
    });
  },

  /**
   * サイドバーの開閉切り替え
   * @param {Element} sidebar - サイドバー要素
   */
  toggle: function(sidebar) {
    if (utils.hasClass(sidebar, 'kat-sidebar--open')) {
      this.close(sidebar);
    } else {
      this.open(sidebar);
    }
  },

  /**
   * サイドバーを開く
   * @param {Element} sidebar - サイドバー要素
   */
  open: function(sidebar) {
    utils.addClass(sidebar, 'kat-sidebar--open');
    utils.addClass(document.body, 'kat-sidebar-open');
    
    // フォーカストラップ
    utils.trapFocus(sidebar);
    
    // カスタムイベントを発火
    customEvents.dispatch(sidebar, KAT_UI.EVENTS.SIDEBAR_OPEN, { sidebar });
  },

  /**
   * サイドバーを閉じる
   * @param {Element} sidebar - サイドバー要素
   */
  close: function(sidebar) {
    utils.removeClass(sidebar, 'kat-sidebar--open');
    utils.removeClass(document.body, 'kat-sidebar-open');
    
    // カスタムイベントを発火
    customEvents.dispatch(sidebar, KAT_UI.EVENTS.SIDEBAR_CLOSE, { sidebar });
  },

  /**
   * サブメニューの開閉切り替え
   * @param {Element} trigger - トリガー要素
   * @param {Element} submenu - サブメニュー要素
   */
  toggleSubmenu: function(trigger, submenu) {
    const isOpen = trigger.getAttribute(KAT_UI.ARIA.EXPANDED) === 'true';
    
    if (isOpen) {
      this.closeSubmenu(trigger, submenu);
    } else {
      this.openSubmenu(trigger, submenu);
    }
  },

  /**
   * サブメニューを開く
   * @param {Element} trigger - トリガー要素
   * @param {Element} submenu - サブメニュー要素
   */
  openSubmenu: function(trigger, submenu) {
    utils.setAttribute(trigger, KAT_UI.ARIA.EXPANDED, 'true');
    utils.addClass(submenu, 'kat-sidebar__submenu--open');
    utils.addClass(trigger.closest('.kat-sidebar__item'), 'kat-sidebar__item--active');
  },

  /**
   * サブメニューを閉じる
   * @param {Element} trigger - トリガー要素
   * @param {Element} submenu - サブメニュー要素
   */
  closeSubmenu: function(trigger, submenu) {
    utils.setAttribute(trigger, KAT_UI.ARIA.EXPANDED, 'false');
    utils.removeClass(submenu, 'kat-sidebar__submenu--open');
    utils.removeClass(trigger.closest('.kat-sidebar__item'), 'kat-sidebar__item--active');
  },

  /**
   * すべてのサブメニューを閉じる
   * @param {Element} sidebar - サイドバー要素
   */
  closeAllSubmenus: function(sidebar) {
    const openSubmenus = sidebar.querySelectorAll('.kat-sidebar__submenu--open');
    const activeItems = sidebar.querySelectorAll('.kat-sidebar__item--active');
    
    openSubmenus.forEach(submenu => {
      utils.removeClass(submenu, 'kat-sidebar__submenu--open');
    });
    
    activeItems.forEach(item => {
      utils.removeClass(item, 'kat-sidebar__item--active');
    });
    
    const expandedTriggers = sidebar.querySelectorAll(`[${KAT_UI.ARIA.EXPANDED}="true"]`);
    expandedTriggers.forEach(trigger => {
      utils.setAttribute(trigger, KAT_UI.ARIA.EXPANDED, 'false');
    });
  },

  /**
   * サイドバーの状態を取得
   * @param {Element} sidebar - サイドバー要素
   * @returns {Object} サイドバーの状態情報
   */
  getState: function(sidebar) {
    const isOpen = utils.hasClass(sidebar, 'kat-sidebar--open');
    const openSubmenus = sidebar.querySelectorAll('.kat-sidebar__submenu--open');
    
    return {
      isOpen: isOpen,
      openSubmenusCount: openSubmenus.length,
      openSubmenus: Array.from(openSubmenus)
    };
  },

  /**
   * サイドバーの設定を更新
   * @param {Element} sidebar - サイドバー要素
   * @param {Object} options - 設定オプション
   */
  updateOptions: function(sidebar, options = {}) {
    const config = { ...DEFAULT_CONFIG.sidebar, ...options };

    // オーバーレイの設定
    if (config.overlay !== undefined) {
      sidebar.dataset.overlay = config.overlay.toString();
    }

    // 位置の設定
    if (config.position !== undefined) {
      const positionClasses = ['kat-sidebar--left', 'kat-sidebar--right', 'kat-sidebar--top', 'kat-sidebar--bottom'];
      positionClasses.forEach(className => utils.removeClass(sidebar, className));
      utils.addClass(sidebar, `kat-sidebar--${config.position}`);
    }

    // サイズの設定
    if (config.size !== undefined) {
      const sizeClasses = ['kat-sidebar--sm', 'kat-sidebar--md', 'kat-sidebar--lg', 'kat-sidebar--xl'];
      sizeClasses.forEach(className => utils.removeClass(sidebar, className));
      utils.addClass(sidebar, `kat-sidebar--${config.size}`);
    }
  },

  /**
   * サイドバーアイテムの追加
   * @param {Element} sidebar - サイドバー要素
   * @param {Object} itemData - アイテムデータ
   */
  addItem: function(sidebar, itemData) {
    const sidebarList = sidebar.querySelector('.kat-sidebar__list');
    
    if (!sidebarList) return;

    const item = document.createElement('div');
    item.className = 'kat-sidebar__item';
    
    if (itemData.submenu) {
      // サブメニュー付きアイテム
      const trigger = document.createElement('button');
      trigger.setAttribute(KAT_UI.DATA_ATTRIBUTES.TOGGLE, 'submenu');
      trigger.setAttribute(KAT_UI.ARIA.EXPANDED, 'false');
      trigger.className = 'kat-sidebar__trigger';
      trigger.innerHTML = `
        <span class="kat-sidebar__label">${itemData.label}</span>
        <span class="kat-sidebar__icon">+</span>
      `;

      const submenu = document.createElement('div');
      submenu.className = 'kat-sidebar__submenu';
      submenu.innerHTML = itemData.submenu;

      item.appendChild(trigger);
      item.appendChild(submenu);
    } else {
      // 通常のアイテム
      const link = document.createElement('a');
      link.href = itemData.href || '#';
      link.className = 'kat-sidebar__link';
      link.textContent = itemData.label;
      
      if (itemData.icon) {
        const icon = document.createElement('span');
        icon.className = 'kat-sidebar__icon';
        icon.innerHTML = itemData.icon;
        link.insertBefore(icon, link.firstChild);
      }

      item.appendChild(link);
    }

    sidebarList.appendChild(item);
    return item;
  },

  /**
   * サイドバーアイテムの削除
   * @param {Element} sidebar - サイドバー要素
   * @param {number} index - 削除するアイテムのインデックス
   */
  removeItem: function(sidebar, index) {
    const items = sidebar.querySelectorAll('.kat-sidebar__item');
    
    if (items[index]) {
      items[index].remove();
    }
  },

  /**
   * サイドバーアイテムの更新
   * @param {Element} sidebar - サイドバー要素
   * @param {number} index - 更新するアイテムのインデックス
   * @param {Object} itemData - 新しいアイテムデータ
   */
  updateItem: function(sidebar, index, itemData) {
    const items = sidebar.querySelectorAll('.kat-sidebar__item');
    
    if (items[index]) {
      const link = items[index].querySelector('.kat-sidebar__link');
      const trigger = items[index].querySelector('.kat-sidebar__trigger');
      
      if (itemData.label) {
        if (link) {
          utils.setText(link, itemData.label);
        } else if (trigger) {
          const label = trigger.querySelector('.kat-sidebar__label');
          if (label) {
            utils.setText(label, itemData.label);
          }
        }
      }
      
      if (itemData.href && link) {
        link.href = itemData.href;
      }
    }
  },

  /**
   * サイドバーの破棄
   * @param {Element} sidebar - サイドバー要素
   */
  destroy: function(sidebar) {
    const triggers = sidebar.querySelectorAll(`[${KAT_UI.DATA_ATTRIBUTES.TOGGLE}="sidebar"], [${KAT_UI.DATA_ATTRIBUTES.TOGGLE}="submenu"]`);
    
    triggers.forEach(trigger => {
      trigger.removeEventListener('click', this.toggle);
      trigger.removeEventListener('click', this.toggleSubmenu);
    });
  }
};

// デフォルト設定
const DEFAULT_CONFIG = {
  sidebar: {
    overlay: true,
    position: 'left',
    size: 'md'
  }
};
