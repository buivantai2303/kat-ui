/** @project: Kat UI */
/** @author: Bui Van Tai, 2024-12-15, JavaScriptコンポーネントライブラリ */

/**
 * Kat UI - JavaScriptコンポーネントライブラリ
 * インタラクティブなUIコンポーネントのためのVanilla JavaScriptモジュールのコレクション。
 */
window.katUI = {};

/**
 * ユーティリティ関数
 */
katUI.utils = {
  getElements: function(selector) {
    return typeof selector === 'string' ? document.querySelectorAll(selector) : [selector];
  },

  delegate: function(element, eventType, selector, handler) {
    element.addEventListener(eventType, function(e) {
      const target = e.target.closest(selector);
      if (target) handler.call(target, e);
    });
  },

  trapFocus: function(element) {
    const focusableElements = element.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    element.addEventListener('keydown', function(e) {
      if (e.key === 'Tab') {
        if (e.shiftKey && document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        } else if (!e.shiftKey && document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    });

    if (firstElement) firstElement.focus();
  }
};

/**
 * モーダルコンポーネント
 */
katUI.modal = {
  init: function() {
    /* 初期化時にスクロールバーの幅を計算 */
    this.calculateScrollbarWidth();
    
    katUI.utils.delegate(document, 'click', '[data-kat-toggle="modal"]', function(e) {
      e.preventDefault();
      const targetId = this.getAttribute('data-kat-target');
      const modal = document.getElementById(targetId);
      if (modal) katUI.modal.open(modal);
    });

    katUI.utils.delegate(document, 'click', '[data-kat-close="modal"]', function(e) {
      const modal = this.closest('.kat-modal');
      if (modal) katUI.modal.close(modal);
    });

    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') {
        const openModal = document.querySelector('.kat-modal.kat-modal--open');
        if (openModal) katUI.modal.close(openModal);
      }
    });
  },

  calculateScrollbarWidth: function() {
    const scrollDiv = document.createElement('div');
    scrollDiv.style.cssText = 'width: 100px; height: 100px; overflow: scroll; position: absolute; top: -9999px;';
    document.body.appendChild(scrollDiv);
    const scrollbarWidth = scrollDiv.offsetWidth - scrollDiv.clientWidth;
    document.body.removeChild(scrollDiv);
    document.documentElement.style.setProperty('--scrollbar-width', scrollbarWidth + 'px');
  },

  open: function(modal) {
    modal.classList.add('kat-modal--open');
    document.body.classList.add('kat-modal-open');
    katUI.utils.trapFocus(modal);
    modal.dispatchEvent(new CustomEvent('kat:modal:open'));
  },

  close: function(modal) {
    modal.classList.add('kat-modal--closing');
    setTimeout(() => {
      modal.classList.remove('kat-modal--open', 'kat-modal--closing');
      document.body.classList.remove('kat-modal-open');
      modal.dispatchEvent(new CustomEvent('kat:modal:close'));
    }, 250);
  }
};

/**
 * ドロップダウンコンポーネント
 */
katUI.dropdown = {
  init: function() {
    katUI.utils.delegate(document, 'click', '[data-kat-toggle="dropdown"]', function(e) {
      e.stopPropagation();
      const dropdown = this.closest('.kat-dropdown');
      const menu = dropdown.querySelector('.kat-dropdown__menu');
      
      if (menu.classList.contains('kat-dropdown__menu--open')) {
        katUI.dropdown.close(dropdown);
      } else {
        katUI.dropdown.closeAll();
        katUI.dropdown.open(dropdown);
      }
    });

    document.addEventListener('click', () => katUI.dropdown.closeAll());
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') katUI.dropdown.closeAll();
    });
  },

  open: function(dropdown) {
    const menu = dropdown.querySelector('.kat-dropdown__menu');
    menu.classList.add('kat-dropdown__menu--open');
    dropdown.dispatchEvent(new CustomEvent('kat:dropdown:open'));
  },

  close: function(dropdown) {
    const menu = dropdown.querySelector('.kat-dropdown__menu');
    menu.classList.remove('kat-dropdown__menu--open');
    dropdown.dispatchEvent(new CustomEvent('kat:dropdown:close'));
  },

  closeAll: function() {
    document.querySelectorAll('.kat-dropdown__menu--open').forEach(menu => {
      const dropdown = menu.closest('.kat-dropdown');
      this.close(dropdown);
    });
  }
};

/**
 * タブコンポーネント
 */
katUI.tabs = {
  init: function() {
    const tabsContainers = document.querySelectorAll('[data-kat-component="tabs"]');
    
    tabsContainers.forEach(container => {
      const tabs = container.querySelectorAll('[role="tab"]');
      
      tabs.forEach(tab => {
        tab.addEventListener('click', function() {
          katUI.tabs.switchTab(this);
        });
        
        tab.addEventListener('keydown', function(e) {
          katUI.tabs.handleKeydown(e, tabs);
        });
      });
    });
  },

  switchTab: function(activeTab) {
    const container = activeTab.closest('[data-kat-component="tabs"]');
    const tabs = container.querySelectorAll('[role="tab"]');
    const panels = container.querySelectorAll('[role="tabpanel"]');
    const targetPanelId = activeTab.getAttribute('data-kat-target');
    const targetPanel = document.getElementById(targetPanelId);

    tabs.forEach(tab => {
      tab.classList.remove('kat-tabs__tab--active');
      tab.setAttribute('aria-selected', 'false');
      tab.setAttribute('tabindex', '-1');
    });

    activeTab.classList.add('kat-tabs__tab--active');
    activeTab.setAttribute('aria-selected', 'true');
    activeTab.setAttribute('tabindex', '0');

    panels.forEach(panel => {
      panel.classList.remove('kat-tabs__panel--active');
      panel.setAttribute('hidden', '');
    });

    if (targetPanel) {
      targetPanel.classList.add('kat-tabs__panel--active');
      targetPanel.removeAttribute('hidden');
    }

    container.dispatchEvent(new CustomEvent('kat:tabs:change', {
      detail: { activeTab: activeTab, activePanel: targetPanel }
    }));
  },

  handleKeydown: function(e, tabs) {
    const currentIndex = Array.from(tabs).indexOf(e.target);
    let nextIndex;

    switch (e.key) {
      case 'ArrowLeft':
        e.preventDefault();
        nextIndex = currentIndex > 0 ? currentIndex - 1 : tabs.length - 1;
        break;
      case 'ArrowRight':
        e.preventDefault();
        nextIndex = currentIndex < tabs.length - 1 ? currentIndex + 1 : 0;
        break;
      case 'Home':
        e.preventDefault();
        nextIndex = 0;
        break;
      case 'End':
        e.preventDefault();
        nextIndex = tabs.length - 1;
        break;
      default:
        return;
    }
    
    tabs[nextIndex].focus();
    katUI.tabs.switchTab(tabs[nextIndex]);
  }
};

/**
 * アコーディオンコンポーネント
 */
katUI.accordion = {
  init: function() {
    katUI.utils.delegate(document, 'click', '[data-kat-toggle="accordion-item"]', function() {
      katUI.accordion.toggle(this);
    });
  },

  toggle: function(trigger) {
    const targetId = trigger.getAttribute('data-kat-target');
    const content = document.getElementById(targetId);
    const isOpen = trigger.getAttribute('aria-expanded') === 'true';

    if (isOpen) {
      trigger.setAttribute('aria-expanded', 'false');
      content.style.maxHeight = '0px';
      content.classList.remove('kat-accordion__content--open');
      trigger.dispatchEvent(new CustomEvent('kat:accordion:close'));
    } else {
      trigger.setAttribute('aria-expanded', 'true');
      const scrollHeight = content.scrollHeight;
      content.style.maxHeight = scrollHeight + 'px';
      content.classList.add('kat-accordion__content--open');
      trigger.dispatchEvent(new CustomEvent('kat:accordion:open'));
    }
  }
};

/**
 * サイドバーコンポーネント
 */
katUI.sidebar = {
  init: function() {
    katUI.utils.delegate(document, 'click', '[data-kat-toggle="sidebar"]', function() {
      const sidebar = document.getElementById('sidebar') || document.querySelector('.kat-sidebar');
      if (sidebar) katUI.sidebar.toggle(sidebar);
    });

    katUI.utils.delegate(document, 'click', '[data-kat-toggle="submenu"]', function() {
      const targetId = this.getAttribute('data-kat-target');
      const submenu = document.getElementById(targetId);
      if (submenu) katUI.sidebar.toggleSubmenu(this, submenu);
    });
  },

  toggle: function(sidebar) {
    sidebar.classList.toggle('kat-sidebar--open');
    const eventType = sidebar.classList.contains('kat-sidebar--open') ? 'open' : 'close';
    sidebar.dispatchEvent(new CustomEvent('kat:sidebar:' + eventType));
  },

  toggleSubmenu: function(trigger, submenu) {
    const isOpen = trigger.getAttribute('aria-expanded') === 'true';
    
    if (isOpen) {
      trigger.setAttribute('aria-expanded', 'false');
      submenu.classList.remove('kat-sidebar__submenu--open');
    } else {
      trigger.setAttribute('aria-expanded', 'true');
      submenu.classList.add('kat-sidebar__submenu--open');
    }
  }
};

/**
 * ツールチップコンポーネント
 */
katUI.tooltip = {
  init: function() {
    const tooltipTriggers = document.querySelectorAll('[data-kat-tooltip]');
    
    tooltipTriggers.forEach(trigger => {
      trigger.addEventListener('mouseenter', function() {
        katUI.tooltip.show(this);
      });
      
      trigger.addEventListener('mouseleave', function() {
        katUI.tooltip.hide();
      });
      
      trigger.addEventListener('focus', function() {
        katUI.tooltip.show(this);
      });
      
      trigger.addEventListener('blur', function() {
        katUI.tooltip.hide();
      });
    });
  },

  show: function(trigger) {
    const text = trigger.getAttribute('data-kat-tooltip');
    const position = trigger.getAttribute('data-kat-tooltip-position') || 'top';
    
    katUI.tooltip.hide();
    
    const tooltip = document.createElement('div');
    tooltip.id = 'kat-tooltip';
    tooltip.className = `kat-tooltip kat-tooltip--${position}`;
    tooltip.textContent = text;
    
    document.body.appendChild(tooltip);
    katUI.tooltip.position(trigger, tooltip, position);
    
    requestAnimationFrame(() => {
      tooltip.classList.add('kat-tooltip--visible');
    });
  },

  hide: function() {
    const tooltip = document.getElementById('kat-tooltip');
    if (tooltip) tooltip.remove();
  },

  position: function(trigger, tooltip, position) {
    const triggerRect = trigger.getBoundingClientRect();
    const tooltipRect = tooltip.getBoundingClientRect();
    
    let top, left;
    
    switch (position) {
      case 'top':
        top = triggerRect.top - tooltipRect.height - 8;
        left = triggerRect.left + (triggerRect.width - tooltipRect.width) / 2;
        break;
      case 'bottom':
        top = triggerRect.bottom + 8;
        left = triggerRect.left + (triggerRect.width - tooltipRect.width) / 2;
        break;
      case 'left':
        top = triggerRect.top + (triggerRect.height - tooltipRect.height) / 2;
        left = triggerRect.left - tooltipRect.width - 8;
        break;
      case 'right':
        top = triggerRect.top + (triggerRect.height - tooltipRect.height) / 2;
        left = triggerRect.right + 8;
        break;
    }
    
    const viewport = { width: window.innerWidth, height: window.innerHeight };
    top = Math.max(8, Math.min(top, viewport.height - tooltipRect.height - 8));
    left = Math.max(8, Math.min(left, viewport.width - tooltipRect.width - 8));
    
    tooltip.style.top = top + 'px';
    tooltip.style.left = left + 'px';
  }
};

// カードコンポーネント
katUI.card = {
  init: function() {
    katUI.utils.delegate(document, 'click', '.kat-card__header--collapsible', function() {
      const header = this;
      const card = header.closest('.kat-card');
      const content = card.querySelector('.kat-card__content--collapsible');
      
      if (content) {
        const isCollapsed = header.classList.contains('kat-card__header--collapsed');
        
        if (isCollapsed) {
          header.classList.remove('kat-card__header--collapsed');
          content.classList.remove('kat-card__content--collapsed');
        } else {
          header.classList.add('kat-card__header--collapsed');
          content.classList.add('kat-card__content--collapsed');
        }
        
        card.dispatchEvent(new CustomEvent('kat:card:toggle', {
          detail: { collapsed: !isCollapsed, card: card }
        }));
      }
    });
  }
};

// アラートコンポーネント
katUI.alert = {
  init: function() {
    katUI.utils.delegate(document, 'click', '.kat-alert__close', function() {
      const alert = this.closest('.kat-alert');
      alert.classList.add('kat-alert--removing');
      setTimeout(() => alert.remove(), 200);
    });
  }
};

// トグルグループコンポーネント
katUI.toggleGroup = {
  init: function() {
    katUI.utils.delegate(document, 'click', '.kat-toggle-group__item', function() {
      const group = this.closest('.kat-toggle-group');
      const isMulti = group.classList.contains('kat-toggle-group--multi');
      
      if (!isMulti) {
        // Single selection
        group.querySelectorAll('.kat-toggle-group__item').forEach(item => {
          item.classList.remove('kat-toggle-group__item--selected');
          item.setAttribute('aria-pressed', 'false');
        });
        
        this.classList.add('kat-toggle-group__item--selected');
        this.setAttribute('aria-pressed', 'true');
      } else {
        // Multi selection
        const isSelected = this.classList.contains('kat-toggle-group__item--selected');
        if (isSelected) {
          this.classList.remove('kat-toggle-group__item--selected');
          this.setAttribute('aria-pressed', 'false');
        } else {
          this.classList.add('kat-toggle-group__item--selected');
          this.setAttribute('aria-pressed', 'true');
        }
      }
      
      group.dispatchEvent(new CustomEvent('kat:toggle-group:change', {
        detail: { item: this, group: group }
      }));
    });
  }
};

// レンジ入力コンポーネント
katUI.range = {
  init: function() {
    const ranges = document.querySelectorAll('.kat-range');
    
    ranges.forEach(range => {
      this.updateRangeBackground(range);
      
      range.addEventListener('input', function() {
        katUI.range.updateRangeBackground(this);
        
        // Update value display if exists
        const valueDisplay = this.parentNode.querySelector('.kat-range__value');
        if (valueDisplay) {
          valueDisplay.textContent = this.value + '%';
        }
      });
    });
  },
  
  updateRangeBackground: function(range) {
    const value = ((range.value - range.min) / (range.max - range.min)) * 100;
    range.style.background = `linear-gradient(to right, #171717 0%, #171717 ${value}%, #e5e5e5 ${value}%, #e5e5e5 100%)`;
    range.style.backgroundSize = '100% 0.125rem';
    range.style.backgroundPosition = 'center';
  }
};

// トーストコンポーネント
katUI.toast = {
  container: null,
  toasts: [],
  
  init: function(position = 'top-right') {
    if (!this.container) {
      this.container = document.createElement('div');
      this.container.className = `kat-toast-container kat-toast-container--${position}`;
      document.body.appendChild(this.container);
    }
  },
  
  show: function(options = {}) {
    this.init();
    
    const defaults = {
      title: '',
      description: '',
      type: 'info',
      duration: 5000,
      closable: true,
      actions: [],
      position: 'top-right'
    };
    
    const config = Object.assign({}, defaults, options);
    
    const toast = document.createElement('div');
    toast.className = `kat-toast kat-toast--${config.type}`;
    
    let iconSvg = '';
    switch (config.type) {
      case 'success':
        iconSvg = '<svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path></svg>';
        break;
      case 'error':
        iconSvg = '<svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path></svg>';
        break;
      case 'warning':
        iconSvg = '<svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path></svg>';
        break;
      default:
        iconSvg = '<svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"></path></svg>';
    }
    
    toast.innerHTML = `
      <div class="kat-toast__icon">${iconSvg}</div>
      <div class="kat-toast__content">
        ${config.title ? `<div class="kat-toast__title">${config.title}</div>` : ''}
        ${config.description ? `<div class="kat-toast__description">${config.description}</div>` : ''}
        ${config.actions.length ? '<div class="kat-toast__actions">' + config.actions.map(action => `<button class="kat-btn kat-btn--${action.style || 'outline'} kat-btn--xs" onclick="${action.handler}">${action.text}</button>`).join('') + '</div>' : ''}
      </div>
      ${config.closable ? '<button class="kat-toast__close" aria-label="閉じる"><svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg></button>' : ''}
      ${config.duration > 0 ? '<div class="kat-toast__progress"></div>' : ''}
    `;
    
    this.container.appendChild(toast);
    this.toasts.push(toast);
    
    // 表示アニメーション
    setTimeout(() => {
      toast.classList.add('kat-toast--show');
    }, 10);
    
    // プログレスバーのアニメーション
    if (config.duration > 0) {
      const progressBar = toast.querySelector('.kat-toast__progress');
      if (progressBar) {
        progressBar.style.width = '100%';
        progressBar.style.transitionDuration = '0ms';
        setTimeout(() => {
          progressBar.style.width = '0%';
          progressBar.style.transitionDuration = config.duration + 'ms';
        }, 100);
      }
    }
    
    // 閉じるボタンの機能
    if (config.closable) {
      const closeBtn = toast.querySelector('.kat-toast__close');
      closeBtn.addEventListener('click', () => this.hide(toast));
    }
    
    // 自動非表示
    if (config.duration > 0) {
      setTimeout(() => this.hide(toast), config.duration);
    }
    
    toast.dispatchEvent(new CustomEvent('kat:toast:show', { detail: { toast, config } }));
    
    return toast;
  },
  
  hide: function(toast) {
    if (!toast || !toast.parentNode) return;
    
    toast.classList.add('kat-toast--hide');
    
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
        const index = this.toasts.indexOf(toast);
        if (index > -1) {
          this.toasts.splice(index, 1);
        }
      }
    }, 300);
    
    toast.dispatchEvent(new CustomEvent('kat:toast:hide', { detail: { toast } }));
  },
  
  success: function(title, description, options = {}) {
    return this.show(Object.assign({ type: 'success', title, description }, options));
  },
  
  error: function(title, description, options = {}) {
    return this.show(Object.assign({ type: 'error', title, description }, options));
  },
  
  warning: function(title, description, options = {}) {
    return this.show(Object.assign({ type: 'warning', title, description }, options));
  },
  
  info: function(title, description, options = {}) {
    return this.show(Object.assign({ type: 'info', title, description }, options));
  },
  
  clear: function() {
    this.toasts.forEach(toast => this.hide(toast));
  }
};

// 入力OTPコンポーネント
katUI.inputOTP = {
  init: function() {
    const otpGroups = document.querySelectorAll('.kat-input-otp');
    
    otpGroups.forEach(group => {
      const inputs = group.querySelectorAll('.kat-input-otp__field');
      
      inputs.forEach((input, index) => {
        input.addEventListener('input', function(e) {
          let value = e.target.value;
          
          // 数字のみ許可し、1桁に制限
          if (!/^\d*$/.test(value)) {
            value = value.replace(/\D/g, '');
          }
          
          // 1文字に制限
          if (value.length > 1) {
            value = value.slice(-1);
          }
          
          e.target.value = value;
          
          // 値が入力された場合、次の入力に移動
          if (value && index < inputs.length - 1) {
            inputs[index + 1].focus();
          }
          
          // 入力された場合、塗りつぶしクラスを追加
          if (value) {
            e.target.classList.add('kat-input-otp__field--filled');
          } else {
            e.target.classList.remove('kat-input-otp__field--filled');
          }
          
          /* すべてのフィールドが入力されたかどうかを確認 */
          const allFilled = Array.from(inputs).every(inp => inp.value);
          if (allFilled) {
            const otpValue = Array.from(inputs).map(inp => inp.value).join('');
            group.dispatchEvent(new CustomEvent('kat:otp:complete', {
              detail: { value: otpValue }
            }));
          }
        });
        
        input.addEventListener('keydown', function(e) {
          /* バックスペースが押された場合、前の入力に移動 */
          if (e.key === 'Backspace' && !e.target.value && index > 0) {
            inputs[index - 1].focus();
          }
          
          /* 矢印キーで移動 */
          if (e.key === 'ArrowLeft' && index > 0) {
            inputs[index - 1].focus();
          }
          
          if (e.key === 'ArrowRight' && index < inputs.length - 1) {
            inputs[index + 1].focus();
          }
        });
        
        input.addEventListener('paste', function(e) {
          e.preventDefault();
          const paste = (e.clipboardData || window.clipboardData).getData('text');
          const numbers = paste.replace(/\D/g, '');
          
          for (let i = 0; i < numbers.length && index + i < inputs.length; i++) {
            inputs[index + i].value = numbers[i];
            inputs[index + i].classList.add('kat-input-otp__field--filled');
          }
          
          /* 次の空のフィールドまたは最後のフィールドにフォーカス */
          const nextIndex = Math.min(index + numbers.length, inputs.length - 1);
          inputs[nextIndex].focus();
        });
      });
    });
  }
};

/**
 * カテゴリナビゲーションコンポーネント
 */
katUI.categoryNav = {
  init: function() {
    const categoryToggles = document.querySelectorAll('.kat-category-nav__toggle');
    
    categoryToggles.forEach(toggle => {
        toggle.addEventListener('click', function() {
            const item = this.closest('.kat-category-nav__item');
            const submenu = item.querySelector('.kat-category-nav__submenu');
            const icon = this.querySelector('.kat-category-nav__icon');
            const isExpanded = this.getAttribute('aria-expanded') === 'true';
            
            /* 展開状態を切り替え */
            this.setAttribute('aria-expanded', !isExpanded);
            
            /* サブメニューの表示を切り替え */
            if (isExpanded) {
                submenu.classList.remove('kat-category-nav__submenu--open');
                icon.textContent = '+';
                icon.className = 'kat-category-nav__icon kat-category-nav__icon--plus';
                /* 閉じた時にアクティブ状態を削除 */
                item.classList.remove('kat-category-nav__item--active');
            } else {
                submenu.classList.add('kat-category-nav__submenu--open');
                icon.textContent = '-';
                icon.className = 'kat-category-nav__icon kat-category-nav__icon--minus';
                /* 開いた時にアクティブ状態を追加 */
                item.classList.add('kat-category-nav__item--active');
            }
        });
    });
  }
};

/**
 * フィルターコンポーネント
 */
katUI.filter = {
  activeFilter: null,
  popovers: new Map(),
  
  init: function() {
    this.bindEvents();
    this.mapPopovers();
  },

  bindEvents: function() {
    /* フィルターボタン */
    document.addEventListener('click', (e) => {
      const filterBtn = e.target.closest('.kat-filter-btn');
      if (filterBtn) {
        this.toggleFilter(filterBtn);
        return;
      }

      /* フィルターポップオーバー */
      if (!e.target.closest('.kat-filter-popover')) {
        this.closeAllPopovers();
      }
    });

    /* フィルター閉じるボタン */
    document.addEventListener('click', (e) => {
      if (e.target.closest('.kat-filter-close')) {
        this.closeAllPopovers();
      }
    });

    /* フィルター閉じるボタン */
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.closeAllPopovers();
      }
    });

    /* フィルター適用ボタン */
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('kat-filter-apply')) {
        const popover = e.target.closest('.kat-filter-popover');
        if (popover) {
          /* フィルターポップオーバー */
          for (const [filterType, pop] of this.popovers) {
            if (pop === popover) {
              this.handleFilterApply(filterType);
              break;
            }
          }
        }
      }
      
      if (e.target.classList.contains('kat-filter-clear')) {
        const popover = e.target.closest('.kat-filter-popover');
        if (popover) {
          for (const [filterType, pop] of this.popovers) {
            if (pop === popover) {
              this.handleFilterClear(filterType);
              break;
            }
          }
        }
      }
    });
  },

  mapPopovers: function() {
    const popoverMap = {
      'filter-1': 'filter-1-popover',
      'filter-2': 'filter-2-popover', 
      'filter-3': 'filter-3-popover',
      'filter-4': 'filter-4-popover',
      'filter-5': 'filter-5-popover',
      'filter-6': 'filter-6-popover'
    };
    
    /* フィルターポップオーバー */
    Object.entries(popoverMap).forEach(([filterType, popoverId]) => {
      const popover = document.getElementById(popoverId);
      if (popover) {
        this.popovers.set(filterType, popover);
      }
    });
  },

  toggleFilter: function(filterBtn) {
    const filterType = filterBtn.dataset.filter;
    const isCurrentlyOpen = filterBtn.classList.contains('kat-filter-btn--open');

    /* フィルターポップオーバー */
    this.closeAllPopovers();

    if (!isCurrentlyOpen) {
      this.openFilter(filterBtn, filterType);
    }
  },

  openFilter: function(filterBtn, filterType) {
    /* フィルターボタン */
    document.querySelectorAll('.kat-filter-btn').forEach(btn => {
      btn.classList.remove('kat-filter-btn--open');
    });

    /* フィルターボタン */
    filterBtn.classList.add('kat-filter-btn--open');

    /* フィルターポップオーバー */
    const popover = this.popovers.get(filterType);
    if (popover) {
      /* フィルターポップオーバー */
      this.positionPopover(filterBtn, popover);
      
      /* フィルターポップオーバー */
      popover.style.display = 'block';
      popover.classList.add('kat-popover--open');

      this.activeFilter = filterType;
    }
  },

  positionPopover: function(button, popover) {
    this.updatePopoverPosition(button, popover);
  },

  updatePopoverPosition: function(button, popover) {
    const buttonRect = button.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    /* フィルターポップオーバーの位置を計算 */
    let top = buttonRect.bottom + 8;
    let left = buttonRect.left;
    
    /* 右端のオーバーフローをチェック */
    const popoverRight = left + popover.offsetWidth;
    if (popoverRight > viewportWidth) {
      left = viewportWidth - popover.offsetWidth - 16;
    }
    
    /* 左端のオーバーフローをチェック */
    if (left < 16) {
      left = 16;
    }
    
    /* 下端のオーバーフローをチェック */
    const popoverBottom = top + popover.offsetHeight;
    if (popoverBottom > viewportHeight) {
      /* 上に表示 */
      top = buttonRect.top - popover.offsetHeight - 8;
      popover.classList.add('kat-filter-popover--top');
    } else {
      popover.classList.remove('kat-filter-popover--top');
    }
    
    /* 位置を適用 */
    popover.style.position = 'fixed';
    popover.style.top = `${top}px`;
    popover.style.left = `${left}px`;
    
    /* スクロール中の位置更新を最適化 */
    if (!this.scrollHandler) {
      this.scrollHandler = this.debounce(() => {
        this.updateAllPopoverPositions();
      }, 16); // 60fps
      
      window.addEventListener('scroll', this.scrollHandler, { passive: true });
      window.addEventListener('resize', this.scrollHandler, { passive: true });
    }
  },

  updateAllPopoverPositions: function() {
    /* 開いているポップオーバーの位置を更新 */
    this.popovers.forEach((popover, filterType) => {
      if (popover && popover.style.display === 'block') {
        const button = document.querySelector(`[data-filter="${filterType}"]`);
        if (button) {
          popover.classList.add('kat-filter-popover--scrolling');
          this.updatePopoverPosition(button, popover);
          /* スクロール終了後にtransitionを復活 */
          setTimeout(() => {
            popover.classList.remove('kat-filter-popover--scrolling');
          }, 100);
        }
      }
    });
  },

  debounce: function(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },

  closeAllPopovers: function() {
    /* フィルターボタン */
    document.querySelectorAll('.kat-filter-btn').forEach(btn => {
      btn.classList.remove('kat-filter-btn--open');
    });

    /* フィルターポップオーバー */
    this.popovers.forEach(popover => {
      if (popover && popover.style) {
        popover.style.display = 'none';
        popover.classList.remove('kat-popover--open');
      }
    });

    this.activeFilter = null;
  },

  /* フィルター変更 */
  handleFilterChange: function(filterType, selectedValues) {
    console.log(`Filter changed: ${filterType}`, selectedValues);
    /* フィルター変更 */
    
    /* フィルター変更 */
    document.dispatchEvent(new CustomEvent('kat:filter:change', {
      detail: { filterType, selectedValues }
    }));
  },

  /* フィルター適用 */
  handleFilterApply: function(filterType) {
    const popover = this.popovers.get(filterType);
    if (popover) {
      const checkboxes = popover.querySelectorAll('.kat-checkbox__input:checked');
      const selectedValues = Array.from(checkboxes).map(cb => cb.value);
      this.handleFilterChange(filterType, selectedValues);
    }
    this.closeAllPopovers();
  },

  /* フィルタークリア */
  handleFilterClear: function(filterType) {
    const popover = this.popovers.get(filterType);
    if (popover) {
      const checkboxes = popover.querySelectorAll('.kat-checkbox__input');
      checkboxes.forEach(cb => cb.checked = false);
    }
  }
};

// ナビゲーションドロップダウンコンポーネント
katUI.navigationDropdown = {
  init: function() {
    this.initNavigationDropdowns();
    this.initScrollHide();
  },

  initNavigationDropdowns: function() {
    const dropdownTriggers = document.querySelectorAll('.kat-ecommerce-header__nav-link[aria-expanded]');
    
    dropdownTriggers.forEach(trigger => {
      const dropdown = trigger.nextElementSibling;
      if (!dropdown || !dropdown.classList.contains('kat-ecommerce-header__nav-dropdown')) return;

      // ホバーでドロップダウンを開く
      trigger.addEventListener('mouseenter', () => {
        // 他のドロップダウンを閉じる
        this.closeAllDropdowns();
        // 現在のドロップダウンを開く
        this.openDropdown(trigger, dropdown);
      });

      // ドロップダウンから離れたら閉じる
      dropdown.addEventListener('mouseleave', () => {
        this.closeDropdown(trigger, dropdown);
      });

      // クリックでドロップダウンを開閉
      trigger.addEventListener('click', (e) => {
        e.preventDefault();
        const isExpanded = trigger.getAttribute('aria-expanded') === 'true';
        
        // 他のドロップダウンを閉じる
        this.closeAllDropdowns();
        
        if (!isExpanded) {
          this.openDropdown(trigger, dropdown);
        }
      });
    });

    // ドキュメントクリックでドロップダウンを閉じる
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.kat-ecommerce-header__nav-item')) {
        this.closeAllDropdowns();
      }
    });
  },

  openDropdown: function(trigger, dropdown) {
    trigger.setAttribute('aria-expanded', 'true');
    dropdown.classList.add('kat-ecommerce-header__nav-dropdown--open');
  },

  closeDropdown: function(trigger, dropdown) {
    trigger.setAttribute('aria-expanded', 'false');
    dropdown.classList.remove('kat-ecommerce-header__nav-dropdown--open');
  },

  closeAllDropdowns: function() {
    const openDropdowns = document.querySelectorAll('.kat-ecommerce-header__nav-dropdown--open');
    openDropdowns.forEach(dropdown => {
      const trigger = dropdown.previousElementSibling;
      if (trigger && trigger.classList.contains('kat-ecommerce-header__nav-link')) {
        this.closeDropdown(trigger, dropdown);
      }
    });
  },

  initScrollHide: function() {
    let lastScrollTop = 0;
    const navigation = document.querySelector('.kat-ecommerce-header__nav');
    if (!navigation) return;

    const handleScroll = () => {
      const currentScrollTop = window.pageYOffset || document.documentElement.scrollTop;
      
      // スクロール方向を判定
      if (currentScrollTop > lastScrollTop && currentScrollTop > 100) {
        // 下にスクロール - ナビゲーションを隠す
        navigation.classList.add('kat-ecommerce-header__nav--hidden');
      } else if (currentScrollTop < lastScrollTop) {
        // 上にスクロール - ナビゲーションを表示
        navigation.classList.remove('kat-ecommerce-header__nav--hidden');
      }
      
      lastScrollTop = currentScrollTop;
    };

    // スクロールイベントを最適化
    const debouncedHandleScroll = this.debounce(handleScroll, 10);
    window.addEventListener('scroll', debouncedHandleScroll, { passive: true });
  },

  debounce: function(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }
};

// すべてのコンポーネントを初期化
function initKatUI() {
  katUI.modal.init();
  katUI.dropdown.init();
  katUI.tabs.init();
  katUI.accordion.init();
  katUI.sidebar.init();
  katUI.tooltip.init();
  katUI.card.init();
  katUI.alert.init();
  katUI.toggleGroup.init();
  katUI.range.init();
  katUI.toast.init();
  katUI.inputOTP.init();
  katUI.categoryNav.init();
  katUI.filter.init();
  katUI.navigationDropdown.init();
  
  document.dispatchEvent(new CustomEvent('kat:ready'));
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initKatUI);
} else {
  initKatUI();
}
