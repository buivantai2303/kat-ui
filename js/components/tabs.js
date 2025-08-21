/**
 * Kat UI - タブコンポーネント
 * タブナビゲーションの表示・切り替えを管理
 */

import { KAT_UI } from '../core/constants.js';
import { utils } from '../core/utils.js';
import { customEvents } from '../core/events.js';

export const tabs = {
  /**
   * タブの初期化
   */
  init: function() {
    this.bindEvents();
  },

  /**
   * イベントのバインド
   */
  bindEvents: function() {
    const tabsContainers = document.querySelectorAll(`[${KAT_UI.DATA_ATTRIBUTES.COMPONENT}="tabs"]`);
    
    tabsContainers.forEach(container => {
      const tabs = container.querySelectorAll(`[role="${KAT_UI.ROLES.TAB}"]`);
      
      tabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
          this.switchTab(e.target);
        });
        
        tab.addEventListener('keydown', (e) => {
          this.handleKeydown(e, tabs);
        });
      });
    });
  },

  /**
   * タブの切り替え
   * @param {Element} activeTab - アクティブにするタブ
   */
  switchTab: function(activeTab) {
    const container = activeTab.closest(`[${KAT_UI.DATA_ATTRIBUTES.COMPONENT}="tabs"]`);
    const tabs = container.querySelectorAll(`[role="${KAT_UI.ROLES.TAB}"]`);
    const panels = container.querySelectorAll(`[role="${KAT_UI.ROLES.TABPANEL}"]`);
    const targetPanelId = activeTab.getAttribute(KAT_UI.DATA_ATTRIBUTES.TARGET);
    const targetPanel = document.getElementById(targetPanelId);

    // すべてのタブを非アクティブにする
    tabs.forEach(tab => {
      utils.removeClass(tab, 'kat-tabs__tab--active');
      utils.setAttribute(tab, KAT_UI.ARIA.SELECTED, 'false');
      utils.setAttribute(tab, 'tabindex', '-1');
    });

    // アクティブタブを設定
    utils.addClass(activeTab, 'kat-tabs__tab--active');
    utils.setAttribute(activeTab, KAT_UI.ARIA.SELECTED, 'true');
    utils.setAttribute(activeTab, 'tabindex', '0');

    // すべてのパネルを非表示にする
    panels.forEach(panel => {
      utils.removeClass(panel, 'kat-tabs__panel--active');
      utils.setAttribute(panel, KAT_UI.ARIA.HIDDEN, '');
    });

    // ターゲットパネルを表示
    if (targetPanel) {
      utils.addClass(targetPanel, 'kat-tabs__panel--active');
      targetPanel.removeAttribute(KAT_UI.ARIA.HIDDEN);
    }

    // カスタムイベントを発火
    customEvents.dispatch(container, KAT_UI.EVENTS.TABS_CHANGE, {
      activeTab: activeTab,
      activePanel: targetPanel
    });
  },

  /**
   * キーボードナビゲーションの処理
   * @param {KeyboardEvent} e - キーボードイベント
   * @param {NodeList} tabs - タブのコレクション
   */
  handleKeydown: function(e, tabs) {
    const currentIndex = Array.from(tabs).indexOf(e.target);
    let nextIndex;

    switch (e.key) {
      case KAT_UI.KEYS.ARROW_LEFT:
        e.preventDefault();
        nextIndex = currentIndex > 0 ? currentIndex - 1 : tabs.length - 1;
        break;
      case KAT_UI.KEYS.ARROW_RIGHT:
        e.preventDefault();
        nextIndex = currentIndex < tabs.length - 1 ? currentIndex + 1 : 0;
        break;
      case KAT_UI.KEYS.HOME:
        e.preventDefault();
        nextIndex = 0;
        break;
      case KAT_UI.KEYS.END:
        e.preventDefault();
        nextIndex = tabs.length - 1;
        break;
      default:
        return;
    }
    
    utils.focus(tabs[nextIndex]);
    this.switchTab(tabs[nextIndex]);
  },

  /**
   * 特定のタブをアクティブにする
   * @param {Element} container - タブコンテナ
   * @param {number} index - タブのインデックス
   */
  activateTab: function(container, index) {
    const tabs = container.querySelectorAll(`[role="${KAT_UI.ROLES.TAB}"]`);
    if (tabs[index]) {
      this.switchTab(tabs[index]);
    }
  },

  /**
   * タブの状態を取得
   * @param {Element} container - タブコンテナ
   * @returns {Object} タブの状態情報
   */
  getTabState: function(container) {
    const activeTab = container.querySelector('.kat-tabs__tab--active');
    const activePanel = container.querySelector('.kat-tabs__panel--active');
    
    return {
      activeTab: activeTab,
      activePanel: activePanel,
      activeIndex: activeTab ? Array.from(container.querySelectorAll(`[role="${KAT_UI.ROLES.TAB}"]`)).indexOf(activeTab) : -1
    };
  },

  /**
   * タブの追加
   * @param {Element} container - タブコンテナ
   * @param {Object} tabData - タブデータ
   */
  addTab: function(container, tabData) {
    const tabsList = container.querySelector('.kat-tabs__list');
    const panelsContainer = container.querySelector('.kat-tabs__panels');
    
    if (!tabsList || !panelsContainer) return;

    const tabIndex = container.querySelectorAll(`[role="${KAT_UI.ROLES.TAB}"]`).length;
    const tabId = `tab-${Date.now()}-${tabIndex}`;
    const panelId = `panel-${Date.now()}-${tabIndex}`;

    // タブ要素を作成
    const tab = document.createElement('button');
    tab.setAttribute('role', KAT_UI.ROLES.TAB);
    tab.setAttribute('aria-selected', 'false');
    tab.setAttribute('aria-controls', panelId);
    tab.setAttribute('tabindex', '-1');
    tab.setAttribute(KAT_UI.DATA_ATTRIBUTES.TARGET, panelId);
    tab.className = 'kat-tabs__tab';
    tab.textContent = tabData.label;

    // パネル要素を作成
    const panel = document.createElement('div');
    panel.setAttribute('role', KAT_UI.ROLES.TABPANEL);
    panel.setAttribute('aria-labelledby', tabId);
    panel.setAttribute(KAT_UI.ARIA.HIDDEN, '');
    panel.className = 'kat-tabs__panel';
    panel.innerHTML = tabData.content;

    // 要素を追加
    tabsList.appendChild(tab);
    panelsContainer.appendChild(panel);

    // イベントリスナーを追加
    tab.addEventListener('click', (e) => this.switchTab(e.target));
    tab.addEventListener('keydown', (e) => {
      const allTabs = container.querySelectorAll(`[role="${KAT_UI.ROLES.TAB}"]`);
      this.handleKeydown(e, allTabs);
    });

    return { tab, panel, tabId, panelId };
  },

  /**
   * タブの削除
   * @param {Element} container - タブコンテナ
   * @param {number} index - 削除するタブのインデックス
   */
  removeTab: function(container, index) {
    const tabs = container.querySelectorAll(`[role="${KAT_UI.ROLES.TAB}"]`);
    const panels = container.querySelectorAll(`[role="${KAT_UI.ROLES.TABPANEL}"]`);
    
    if (tabs[index] && panels[index]) {
      const isActive = utils.hasClass(tabs[index], 'kat-tabs__tab--active');
      
      // 要素を削除
      tabs[index].remove();
      panels[index].remove();
      
      // アクティブタブが削除された場合、最初のタブをアクティブにする
      if (isActive && tabs.length > 1) {
        this.activateTab(container, 0);
      }
    }
  },

  /**
   * タブの更新
   * @param {Element} container - タブコンテナ
   * @param {number} index - 更新するタブのインデックス
   * @param {Object} tabData - 新しいタブデータ
   */
  updateTab: function(container, index, tabData) {
    const tabs = container.querySelectorAll(`[role="${KAT_UI.ROLES.TAB}"]`);
    const panels = container.querySelectorAll(`[role="${KAT_UI.ROLES.TABPANEL}"]`);
    
    if (tabs[index] && panels[index]) {
      if (tabData.label) {
        utils.setText(tabs[index], tabData.label);
      }
      
      if (tabData.content) {
        utils.setHTML(panels[index], tabData.content);
      }
    }
  },

  /**
   * タブの破棄
   * @param {Element} container - タブコンテナ
   */
  destroy: function(container) {
    const tabs = container.querySelectorAll(`[role="${KAT_UI.ROLES.TAB}"]`);
    
    tabs.forEach(tab => {
      tab.removeEventListener('click', this.switchTab);
      tab.removeEventListener('keydown', this.handleKeydown);
    });
  }
};
