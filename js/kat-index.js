/**
 * Kat UI - JavaScriptコンポーネントライブラリ
 * モジュラーアーキテクチャを使用した最新版
 * 
 * @project: Kat UI
 * @author: Bui Van Tai, 2024-12-15
 * @version: 2.0.0
 */

// Core modules
import { KAT_UI, DEFAULT_CONFIG } from './core/constants.js';
import { utils } from './core/utils.js';
import { eventBus, customEvents, initEvents } from './core/events.js';

// Component modules
import { modal } from './components/modal.js';
import { dropdown } from './components/dropdown.js';
import { tabs } from './components/tabs.js';
import { accordion } from './components/accordion.js';
import { sidebar } from './components/sidebar.js';
import { tooltip } from './components/tooltip.js';
import { card } from './components/card.js';
import { alert } from './components/alert.js';
import { toast } from './components/toast.js';
import { toggleGroup } from './components/toggleGroup.js';
import { range } from './components/range.js';
import { inputOTP } from './components/inputOTP.js';
import { carousel } from './components/carousel.js';
import { categoryNav } from './components/categoryNav.js';
import { filter } from './components/filter.js';
import { navigationDropdown } from './components/navigationDropdown.js';
import { headerPopups } from './components/headerPopups.js';
import { headerAnnouncement } from './components/headerAnnouncement.js';

/**
 * Kat UI メインクラス
 */
class KatUI {
  constructor() {
    this.version = '2.0.0';
    this.components = new Map();
    this.config = { ...DEFAULT_CONFIG };
    this.isInitialized = false;
    
    // コンポーネントの登録
    this.registerComponents();
  }

  /**
   * コンポーネントの登録
   */
  registerComponents() {
    // Core components
    this.components.set('modal', modal);
    this.components.set('dropdown', dropdown);
    this.components.set('tabs', tabs);
    this.components.set('accordion', accordion);
    this.components.set('sidebar', sidebar);
    this.components.set('tooltip', tooltip);
    this.components.set('card', card);
    this.components.set('alert', alert);
    this.components.set('toast', toast);
    this.components.set('toggleGroup', toggleGroup);
    this.components.set('range', range);

    // 追加コンポーネント
    this.components.set('inputOTP', inputOTP);
    this.components.set('carousel', carousel);
    this.components.set('categoryNav', categoryNav);
    this.components.set('filter', filter);
    this.components.set('navigationDropdown', navigationDropdown);
    this.components.set('headerPopups', headerPopups);
    this.components.set('headerAnnouncement', headerAnnouncement);
  }

  
  /**
   * ライブラリの初期化
   */
  init() {
    if (this.isInitialized) {
      console.warn('Kat UI is already initialized');
      return;
    }

    try {
      // イベントシステムの初期化
      initEvents();
      
      // 各コンポーネントの初期化
      this.components.forEach((component, name) => {
        if (component && typeof component.init === 'function') {
          try {
            component.init();
            console.log(`Kat UI: ${name} component initialized`);
          } catch (error) {
            console.error(`Kat UI: Error initializing ${name} component:`, error);
          }
        }
      });

      this.isInitialized = true;
      
      // 初期化完了イベントを発火
      customEvents.dispatchGlobal(KAT_UI.EVENTS.READY, {
        version: this.version,
        components: Array.from(this.components.keys())
      });

      console.log('Kat UI initialized successfully');
    } catch (error) {
      console.error('Kat UI initialization failed:', error);
    }
  }

  /**
   * コンポーネントの取得
   * @param {string} name - コンポーネント名
   * @returns {Object|null} コンポーネント
   */
  getComponent(name) {
    return this.components.get(name) || null;
  }

  /**
   * コンポーネントの存在確認
   * @param {string} name - コンポーネント名
   * @returns {boolean} 存在するかどうか
   */
  hasComponent(name) {
    return this.components.has(name);
  }

  /**
   * コンポーネントの追加
   * @param {string} name - コンポーネント名
   * @param {Object} component - コンポーネントオブジェクト
   */
  addComponent(name, component) {
    if (this.components.has(name)) {
      console.warn(`Kat UI: Component '${name}' already exists, overwriting`);
    }
    
    this.components.set(name, component);
    
    // 初期化済みの場合は即座に初期化
    if (this.isInitialized && component && typeof component.init === 'function') {
      try {
        component.init();
        console.log(`Kat UI: ${name} component added and initialized`);
      } catch (error) {
        console.error(`Kat UI: Error initializing added component ${name}:`, error);
      }
    }
  }

  /**
   * コンポーネントの削除
   * @param {string} name - コンポーネント名
   */
  removeComponent(name) {
    const component = this.components.get(name);
    if (component && typeof component.destroy === 'function') {
      try {
        component.destroy();
      } catch (error) {
        console.error(`Kat UI: Error destroying component ${name}:`, error);
      }
    }
    
    this.components.delete(name);
    console.log(`Kat UI: ${name} component removed`);
  }

  /**
   * 設定の更新
   * @param {Object} newConfig - 新しい設定
   */
  updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
    
    // 設定変更イベントを発火
    eventBus.emit('kat:config:update', this.config);
  }

  /**
   * 設定の取得
   * @returns {Object} 現在の設定
   */
  getConfig() {
    return { ...this.config };
  }

  /**
   * 特定の設定を取得
   * @param {string} key - 設定キー
   * @returns {*} 設定値
   */
  getConfigValue(key) {
    return this.config[key];
  }

  /**
   * 特定の設定を設定
   * @param {string} key - 設定キー
   * @param {*} value - 設定値
   */
  setConfigValue(key, value) {
    this.config[key] = value;
    
    // 設定変更イベントを発火
    eventBus.emit('kat:config:update', { [key]: value });
  }

  /**
   * ライブラリの破棄
   */
  destroy() {
    try {
      // 各コンポーネントの破棄
      this.components.forEach((component, name) => {
        if (component && typeof component.destroy === 'function') {
          try {
            component.destroy();
          } catch (error) {
            console.error(`Kat UI: Error destroying ${name} component:`, error);
          }
        }
      });

      // コンポーネントマップをクリア
      this.components.clear();
      
      // イベントシステムのクリア
      eventBus.clear();
      
      this.isInitialized = false;
      
      console.log('Kat UI destroyed successfully');
    } catch (error) {
      console.error('Kat UI destruction failed:', error);
    }
  }

  /**
   * バージョン情報の取得
   * @returns {Object} バージョン情報
   */
  getVersion() {
    return {
      version: this.version,
      constants: KAT_UI,
      utils: utils,
      events: eventBus
    };
  }

  /**
   * デバッグ情報の取得
   * @returns {Object} デバッグ情報
   */
  getDebugInfo() {
    return {
      version: this.version,
      initialized: this.isInitialized,
      components: Array.from(this.components.keys()),
      config: this.config,
      constants: KAT_UI
    };
  }
}

// グローバルインスタンスの作成
const katUI = new KatUI();

// グローバルオブジェクトに公開
window.katUI = katUI;

// ユーティリティとイベントシステムも公開
window.katUtils = utils;
window.katEvents = eventBus;
window.katConstants = KAT_UI;

// 自動初期化
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    katUI.init();
  });
} else {
  katUI.init();
}

// エクスポート
export default katUI;
export { utils, eventBus, KAT_UI };
