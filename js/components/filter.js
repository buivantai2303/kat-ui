/**
 * Filter コンポーネント
 * フィルターとポップオーバーの管理
 * 
 * @project: Kat UI
 * @author: Bui Van Tai, 2024-12-15
 * @version: 2.0.0
 */

import { eventBus } from '../core/events.js';

/**
 * Filter コンポーネント
 */
export const filter = {
  /**
   * コンポーネントの初期化
   */
  init() {
    this.filters = new Map();
    this.activeFilter = null;
    this.popovers = new Map();
    this.setupFilters();
    this.bindEvents();
    this.setupScrollHandler();
  },

  /**
   * フィルターの設定
   */
  setupFilters() {
    const filterElements = document.querySelectorAll('.kat-product-filter');
    
    filterElements.forEach((filter, index) => {
      const filterId = `filter-${index}`;
      filter.dataset.filterId = filterId;
      
      const config = this.getFilterConfig(filter);
      const state = this.createFilterState(filter, config);
      
      this.filters.set(filterId, state);
      this.setupFilter(filterId);
    });
  },

  /**
   * フィルターの設定を取得
   * @param {HTMLElement} filter - フィルター要素
   * @returns {Object} 設定オブジェクト
   */
  getFilterConfig(filter) {
    return {
      multiple: filter.hasAttribute('data-kat-multiple'),
      clearable: filter.hasAttribute('data-kat-clearable') !== false,
      searchable: filter.hasAttribute('data-kat-searchable'),
      maxSelections: parseInt(filter.dataset.katMaxSelections) || null,
      autoClose: filter.hasAttribute('data-kat-auto-close') !== false
    };
  },

  /**
   * フィルターの状態を作成
   * @param {HTMLElement} filter - フィルター要素
   * @param {Object} config - 設定オブジェクト
   * @returns {Object} 状態オブジェクト
   */
  createFilterState(filter, config) {
    const filterBtns = Array.from(filter.querySelectorAll('.kat-filter-btn'));
    const filterPopovers = Array.from(filter.querySelectorAll('.kat-filter-popover'));
    const clearBtn = filter.querySelector('.kat-filter-clear');
    const applyBtn = filter.querySelector('.kat-filter-apply');
    
    return {
      filter,
      filterBtns,
      filterPopovers,
      clearBtn,
      applyBtn,
      config,
      selectedValues: new Map(),
      isOpen: false
    };
  },

  /**
   * 個別フィルターの設定
   * @param {string} filterId - フィルターID
   */
  setupFilter(filterId) {
    const state = this.filters.get(filterId);
    if (!state) return;
    
    const { filterBtns, filterPopovers, clearBtn, applyBtn, config } = state;
    
    // フィルターボタンの設定
    filterBtns.forEach((btn, index) => {
      const filterType = btn.dataset.filter;
      const popover = filterPopovers.find(p => p.id === `${filterType}-popover`);
      
      if (popover) {
        this.popovers.set(filterType, popover);
        this.setupFilterButton(filterId, btn, filterType, popover);
      }
    });
    
    // クリアボタンの設定
    if (clearBtn && config.clearable) {
      this.setupClearButton(filterId);
    }
    
    // 適用ボタンの設定
    if (applyBtn) {
      this.setupApplyButton(filterId);
    }
    
    // ポップオーバーの設定
    filterPopovers.forEach(popover => {
      this.setupPopover(filterId, popover);
    });
    
    // 初期状態の設定
    this.updateFilterState(filterId);
  },

  /**
   * フィルターボタンの設定
   * @param {string} filterId - フィルターID
   * @param {HTMLElement} btn - ボタン要素
   * @param {string} filterType - フィルタータイプ
   * @param {HTMLElement} popover - ポップオーバー要素
   */
  setupFilterButton(filterId, btn, filterType, popover) {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      this.toggleFilter(filterId, filterType, btn);
    });
    
    // アクセシビリティの設定
    btn.setAttribute('aria-haspopup', 'true');
    btn.setAttribute('aria-expanded', 'false');
    btn.setAttribute('aria-controls', popover.id);
  },

  /**
   * クリアボタンの設定
   * @param {string} filterId - フィルターID
   */
  setupClearButton(filterId) {
    const state = this.filters.get(filterId);
    if (!state || !state.clearBtn) return;
    
    state.clearBtn.addEventListener('click', (e) => {
      e.preventDefault();
      this.clearFilter(filterId);
    });
  },

  /**
   * 適用ボタンの設定
   * @param {string} filterId - フィルターID
   */
  setupApplyButton(filterId) {
    const state = this.filters.get(filterId);
    if (!state || !state.applyBtn) return;
    
    state.applyBtn.addEventListener('click', (e) => {
      e.preventDefault();
      this.applyFilter(filterId);
    });
  },

  /**
   * ポップオーバーの設定
   * @param {string} filterId - フィルターID
   * @param {HTMLElement} popover - ポップオーバー要素
   */
  setupPopover(filterId, popover) {
    const state = this.filters.get(filterId);
    if (!state) return;
    
    // ポップオーバーの初期設定
    popover.style.display = 'none';
    popover.setAttribute('role', 'dialog');
    popover.setAttribute('aria-modal', 'true');
    
    // オプションの設定
    const options = popover.querySelectorAll('.kat-filter-option');
    options.forEach(option => {
      this.setupFilterOption(filterId, option);
    });
    
    // 検索機能の設定
    if (state.config.searchable) {
      this.setupSearchFunctionality(filterId, popover);
    }
    
    // スクロール時の処理
    this.setupScrollHandling(filterId, popover);
  },

  /**
   * フィルターオプションの設定
   * @param {string} filterId - フィルターID
   * @param {HTMLElement} option - オプション要素
   */
  setupFilterOption(filterId, option) {
    const state = this.filters.get(filterId);
    if (!state) return;
    
    const checkbox = option.querySelector('input[type="checkbox"]');
    const label = option.querySelector('.kat-filter-option__label');
    const count = option.querySelector('.kat-filter-option__count');
    
    if (checkbox) {
      checkbox.addEventListener('change', () => {
        this.handleOptionChange(filterId, option, checkbox);
      });
      
      // アクセシビリティの設定
      if (label) {
        label.setAttribute('for', checkbox.id);
      }
    }
    
    // カウントの表示
    if (count && option.dataset.count) {
      count.textContent = option.dataset.count;
    }
  },

  /**
   * 検索機能の設定
   * @param {string} filterId - フィルターID
   * @param {HTMLElement} popover - ポップオーバー要素
   */
  setupSearchFunctionality(filterId, popover) {
    const state = this.filters.get(filterId);
    if (!state) return;
    
    const searchInput = popover.querySelector('.kat-filter-search');
    if (!searchInput) return;
    
    searchInput.addEventListener('input', (e) => {
      this.handleSearch(filterId, e.target.value);
    });
    
    searchInput.setAttribute('placeholder', '検索...');
    searchInput.setAttribute('aria-label', 'フィルターオプションを検索');
  },

  /**
   * スクロール処理の設定
   * @param {string} filterId - フィルターID
   * @param {HTMLElement} popover - ポップオーバー要素
   */
  setupScrollHandling(filterId, popover) {
    const state = this.filters.get(filterId);
    if (!state) return;
    
    const handleScroll = () => {
      if (state.isOpen) {
        popover.classList.add('kat-filter-popover--scrolling');
        
        // スクロール終了後の処理
        clearTimeout(state.scrollTimeout);
        state.scrollTimeout = setTimeout(() => {
          popover.classList.remove('kat-filter-popover--scrolling');
        }, 150);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    state.scrollHandler = handleScroll;
  },

  /**
   * フィルターのトグル
   * @param {string} filterId - フィルターID
   * @param {string} filterType - フィルタータイプ
   * @param {HTMLElement} btn - ボタン要素
   */
  toggleFilter(filterId, filterType, btn) {
    const state = this.filters.get(filterId);
    if (!state) return;
    
    const isCurrentlyOpen = btn.classList.contains('kat-filter-btn--open');
    
    if (isCurrentlyOpen) {
      this.closeFilter(filterId, filterType);
    } else {
      this.openFilter(filterId, filterType, btn);
    }
  },

  /**
   * フィルターを開く
   * @param {string} filterId - フィルターID
   * @param {string} filterType - フィルタータイプ
   * @param {HTMLElement} btn - ボタン要素
   */
  openFilter(filterId, filterType, btn) {
    const state = this.filters.get(filterId);
    if (!state) return;
    
    // 他のフィルターを閉じる
    this.closeAllFilters(filterId);
    
    // フィルターボタンの状態を更新
    btn.classList.add('kat-filter-btn--open');
    btn.setAttribute('aria-expanded', 'true');
    
    // ポップオーバーを表示
    const popover = this.popovers.get(filterType);
    if (popover) {
      this.showPopover(filterId, filterType, popover, btn);
      state.isOpen = true;
      this.activeFilter = filterType;
      
      // フィルター開始イベントの発火
      this.dispatchFilterOpenEvent(filterId, filterType);
    }
  },

  /**
   * フィルターを閉じる
   * @param {string} filterId - フィルターID
   * @param {string} filterType - フィルタータイプ
   */
  closeFilter(filterId, filterType) {
    const state = this.filters.get(filterId);
    if (!state) return;
    
    // フィルターボタンの状態を更新
    const btn = state.filterBtns.find(b => b.dataset.filter === filterType);
    if (btn) {
      btn.classList.remove('kat-filter-btn--open');
      btn.setAttribute('aria-expanded', 'false');
    }
    
    // ポップオーバーを非表示
    const popover = this.popovers.get(filterType);
    if (popover) {
      this.hidePopover(filterId, filterType, popover);
      state.isOpen = false;
      this.activeFilter = null;
      
      // フィルター終了イベントの発火
      this.dispatchFilterCloseEvent(filterId, filterType);
    }
  },

  /**
   * すべてのフィルターを閉じる
   * @param {string} filterId - フィルターID
   */
  closeAllFilters(filterId) {
    const state = this.filters.get(filterId);
    if (!state) return;
    
    state.filterBtns.forEach(btn => {
      btn.classList.remove('kat-filter-btn--open');
      btn.setAttribute('aria-expanded', 'false');
    });
    
    this.popovers.forEach((popover, filterType) => {
      this.hidePopover(filterId, filterType, popover);
    });
    
    state.isOpen = false;
    this.activeFilter = null;
  },

  /**
   * ポップオーバーを表示
   * @param {string} filterId - フィルターID
   * @param {string} filterType - フィルタータイプ
   * @param {HTMLElement} popover - ポップオーバー要素
   * @param {HTMLElement} btn - ボタン要素
   */
  showPopover(filterId, filterType, popover, btn) {
    // ポップオーバーの位置を調整
    this.positionPopover(filterId, filterType, popover, btn);
    
    // 表示してからアニメーションを開始
    popover.style.display = 'block';
    
    // 少し遅延してアニメーションを開始（位置計算後に）
    requestAnimationFrame(() => {
      popover.classList.add('kat-popover--open');
    });
    
    // フォーカス管理
    this.managePopoverFocus(filterId, popover);
    
    // 外側クリック時の処理
    this.setupOutsideClickHandling(filterId, filterType);
  },

  /**
   * ポップオーバーを非表示
   * @param {string} filterId - フィルターID
   * @param {string} filterType - フィルタータイプ
   * @param {HTMLElement} popover - ポップオーバー要素
   */
  hidePopover(filterId, filterType, popover) {
    // アニメーション終了後に非表示
    popover.classList.remove('kat-popover--open');
    
    // アニメーション完了後にdisplayをnoneに（CSS transition duration + buffer）
    setTimeout(() => {
      if (!popover.classList.contains('kat-popover--open')) {
        popover.style.display = 'none';
      }
    }, 350); // CSS transition duration + 50ms buffer
  },

  /**
   * ポップオーバーの位置を調整
   * @param {string} filterId - フィルターID
   * @param {string} filterType - フィルタータイプ
   * @param {HTMLElement} popover - ポップオーバー要素
   * @param {HTMLElement} btn - ボタン要素
   */
  positionPopover(filterId, filterType, popover, btn) {
    const btnRect = btn.getBoundingClientRect();
    const popoverRect = popover.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;
    
    // デフォルト位置（下）
    let top = btnRect.bottom + window.pageYOffset;
    let left = btnRect.left + window.pageXOffset;
    
    // 下に表示できない場合は上に表示
    if (btnRect.bottom + popoverRect.height > viewportHeight) {
      top = btnRect.top + window.pageYOffset - popoverRect.height;
      popover.classList.add('kat-filter-popover--top');
    } else {
      popover.classList.remove('kat-filter-popover--top');
    }
    
    // 右に表示できない場合は左に調整
    if (left + popoverRect.width > viewportWidth) {
      left = viewportWidth - popoverRect.width - 10;
    }
    
    // 位置を適用（absolute positioningでscrollに追従）
    popover.style.position = 'absolute';
    popover.style.top = `${top + 10}px`;
    popover.style.left = `${left}px`;
    popover.style.zIndex = '1000';
  },

  /**
   * ポップオーバーのフォーカス管理
   * @param {string} filterId - フィルターID
   * @param {HTMLElement} popover - ポップオーバー要素
   */
  managePopoverFocus(filterId, popover) {
    const focusableElements = popover.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    if (focusableElements.length > 0) {
      // 最初のフォーカス可能要素にフォーカス
      focusableElements[0].focus();
      
      // Tabキーでのフォーカス管理
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];
      
      popover.addEventListener('keydown', (e) => {
        if (e.key === 'Tab') {
          if (e.shiftKey) {
            if (document.activeElement === firstElement) {
              e.preventDefault();
              lastElement.focus();
            }
          } else {
            if (document.activeElement === lastElement) {
              e.preventDefault();
              firstElement.focus();
            }
          }
        } else if (e.key === 'Escape') {
          // Escapeキーでフィルターを閉じる
          this.closeActiveFilter(filterId);
        }
      });
    }
  },

  /**
   * 外側クリック時の処理を設定
   * @param {string} filterId - フィルターID
   * @param {string} filterType - フィルタータイプ
   */
  setupOutsideClickHandling(filterId, filterType) {
    const state = this.filters.get(filterId);
    if (!state) return;
    
    const handleOutsideClick = (e) => {
      const popover = this.popovers.get(filterType);
      if (popover && !popover.contains(e.target) && !e.target.closest('.kat-filter-btn')) {
        this.closeFilter(filterId, filterType);
        document.removeEventListener('click', handleOutsideClick);
      }
    };
    
    // 少し遅延してイベントリスナーを追加（現在のクリックイベントを無視するため）
    setTimeout(() => {
      document.addEventListener('click', handleOutsideClick);
      state.outsideClickHandler = handleOutsideClick;
    }, 0);
  },

  /**
   * アクティブフィルターを閉じる
   * @param {string} filterId - フィルターID
   */
  closeActiveFilter(filterId) {
    if (this.activeFilter) {
      this.closeFilter(filterId, this.activeFilter);
    }
  },

  /**
   * オプション変更の処理
   * @param {string} filterId - フィルターID
   * @param {HTMLElement} option - オプション要素
   * @param {HTMLElement} checkbox - チェックボックス要素
   */
  handleOptionChange(filterId, filterType, option, checkbox) {
    const state = this.filters.get(filterId);
    if (!state) return;
    
    const value = checkbox.value;
    const isChecked = checkbox.checked;
    
    if (isChecked) {
      // 選択値の追加
      if (!state.config.multiple) {
        // 単一選択の場合は他の選択をクリア
        state.selectedValues.clear();
      }
      
      // 最大選択数のチェック
      if (state.config.maxSelections && state.selectedValues.size >= state.config.maxSelections) {
        checkbox.checked = false;
        return;
      }
      
      state.selectedValues.set(value, option);
    } else {
      // 選択値の削除
      state.selectedValues.delete(value);
    }
    
    // 選択変更イベントの発火
    this.dispatchOptionChangeEvent(filterId, filterType, value, isChecked);
    
    // 自動クローズの処理
    if (state.config.autoClose && !state.config.multiple) {
      this.closeFilter(filterId, filterType);
    }
    
    // フィルター状態の更新
    this.updateFilterState(filterId);
  },

  /**
   * 検索の処理
   * @param {string} filterId - フィルターID
   * @param {string} searchTerm - 検索語
   */
  handleSearch(filterId, searchTerm) {
    const state = this.filters.get(filterId);
    if (!state) return;
    
    this.popovers.forEach((popover, filterType) => {
      const options = popover.querySelectorAll('.kat-filter-option');
      
      options.forEach(option => {
        const label = option.querySelector('.kat-filter-option__label');
        if (label) {
          const text = label.textContent.toLowerCase();
          const matches = text.includes(searchTerm.toLowerCase());
          
          option.style.display = matches ? 'block' : 'none';
        }
      });
    });
  },

  /**
   * フィルターのクリア
   * @param {string} filterId - フィルターID
   */
  clearFilter(filterId) {
    const state = this.filters.get(filterId);
    if (!state) return;
    
    // 選択値をクリア
    state.selectedValues.clear();
    
    // チェックボックスをリセット
    const checkboxes = state.filter.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
      checkbox.checked = false;
    });
    
    // フィルター状態の更新
    this.updateFilterState(filterId);
    
    // クリアイベントの発火
    this.dispatchFilterClearEvent(filterId);
  },

  /**
   * フィルターの適用
   * @param {string} filterId - フィルターID
   */
  applyFilter(filterId) {
    const state = this.filters.get(filterId);
    if (!state) return;
    
    const selectedValues = Array.from(state.selectedValues.keys());
    
    // 適用イベントの発火
    this.dispatchFilterApplyEvent(filterId, selectedValues);
    
    // フィルターを閉じる
    if (this.activeFilter) {
      this.closeFilter(filterId, this.activeFilter);
    }
  },

  /**
   * フィルター状態の更新
   * @param {string} filterId - フィルターID
   */
  updateFilterState(filterId) {
    const state = this.filters.get(filterId);
    if (!state) return;
    
    const { filterBtns, selectedValues, config } = state;
    
    // フィルターボタンの状態更新
    filterBtns.forEach(btn => {
      const filterType = btn.dataset.filter;
      const hasSelections = selectedValues.size > 0;
      
      if (hasSelections) {
        btn.classList.add('kat-filter-btn--has-selections');
        btn.setAttribute('data-selections', selectedValues.size);
      } else {
        btn.classList.remove('kat-filter-btn--has-selections');
        btn.removeAttribute('data-selections');
      }
    });
    
    // クリアボタンの状態更新
    if (state.clearBtn) {
      state.clearBtn.disabled = selectedValues.size === 0;
    }
    
    // 適用ボタンの状態更新
    if (state.applyBtn) {
      state.applyBtn.disabled = selectedValues.size === 0;
    }
  },

  /**
   * オプション変更イベントの発火
   * @param {string} filterId - フィルターID
   * @param {string} filterType - フィルタータイプ
   * @param {string} value - 値
   * @param {boolean} isChecked - チェック状態
   */
  dispatchOptionChangeEvent(filterId, filterType, value, isChecked) {
    eventBus.emit('kat:filter:option-change', { filterId, filterType, value, isChecked });
    
    document.dispatchEvent(new CustomEvent('kat:filter:option-change', {
      detail: { filterId, filterType, value, isChecked }
    }));
  },

  /**
   * フィルター開始イベントの発火
   * @param {string} filterId - フィルターID
   * @param {string} filterType - フィルタータイプ
   */
  dispatchFilterOpenEvent(filterId, filterType) {
    eventBus.emit('kat:filter:open', { filterId, filterType });
    
    document.dispatchEvent(new CustomEvent('kat:filter:open', {
      detail: { filterId, filterType }
    }));
  },

  /**
   * フィルター終了イベントの発火
   * @param {string} filterId - フィルターID
   * @param {string} filterType - フィルタータイプ
   */
  dispatchFilterCloseEvent(filterId, filterType) {
    eventBus.emit('kat:filter:close', { filterId, filterType });
    
    document.dispatchEvent(new CustomEvent('kat:filter:close', {
      detail: { filterId, filterType }
    }));
  },

  /**
   * フィルター適用イベントの発火
   * @param {string} filterId - フィルターID
   * @param {Array} selectedValues - 選択された値
   */
  dispatchFilterApplyEvent(filterId, selectedValues) {
    eventBus.emit('kat:filter:apply', { filterId, selectedValues });
    
    document.dispatchEvent(new CustomEvent('kat:filter:apply', {
      detail: { filterId, selectedValues }
    }));
  },

  /**
   * フィルタークリアイベントの発火
   * @param {string} filterId - フィルターID
   */
  dispatchFilterClearEvent(filterId) {
    eventBus.emit('kat:filter:clear', { filterId });
    
    document.dispatchEvent(new CustomEvent('kat:filter:clear', {
      detail: { filterId }
    }));
  },

  /**
   * イベントのバインド
   */
  bindEvents() {
    // ウィンドウリサイズ時の処理
    window.addEventListener('resize', () => {
      this.filters.forEach((state, filterId) => {
        if (state.isOpen && this.activeFilter) {
          const btn = state.filterBtns.find(b => b.dataset.filter === this.activeFilter);
          const popover = this.popovers.get(this.activeFilter);
          if (btn && popover) {
            this.positionPopover(filterId, this.activeFilter, popover, btn);
          }
        }
      });
    });
  },

  /**
   * スクロールハンドラーの設定
   */
  setupScrollHandler() {
    // スクロール時に開いているフィルターの位置を更新
    const handleScroll = () => {
      if (this.activeFilter) {
        this.filters.forEach((state, filterId) => {
          if (state.isOpen) {
            const btn = state.filterBtns.find(b => b.dataset.filter === this.activeFilter);
            const popover = this.popovers.get(this.activeFilter);
            if (btn && popover) {
              this.positionPopover(filterId, this.activeFilter, popover, btn);
            }
          }
        });
      }
    };

    // スクロールイベントを最適化（throttle）
    let ticking = false;
    const optimizedScrollHandler = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', optimizedScrollHandler, { passive: true });
    
    // スクロールハンドラーを保存して後で削除できるようにする
    this.scrollHandler = optimizedScrollHandler;
  },

  /**
   * コンポーネントの破棄
   */
  destroy() {
    // スクロールハンドラーの削除
    if (this.scrollHandler) {
      window.removeEventListener('scroll', this.scrollHandler);
    }

    this.filters.forEach((state, filterId) => {
      // 外側クリックハンドラーの削除
      if (state.outsideClickHandler) {
        document.removeEventListener('click', state.outsideClickHandler);
      }
      
      // フィルターボタンのイベントリスナーを削除
      state.filterBtns.forEach(btn => {
        btn.removeEventListener('click', () => {});
      });
      
      // クリアボタンのイベントリスナーを削除
      if (state.clearBtn) {
        state.clearBtn.removeEventListener('click', () => {});
      }
      
      // 適用ボタンのイベントリスナーを削除
      if (state.applyBtn) {
        state.applyBtn.removeEventListener('click', () => {});
      }
      
      // オプションのイベントリスナーを削除
      const options = state.filter.querySelectorAll('.kat-filter-option input[type="checkbox"]');
      options.forEach(checkbox => {
        checkbox.removeEventListener('change', () => {});
      });
    });
    
    this.filters.clear();
    this.popovers.clear();
    
    // グローバルイベントの削除
    window.removeEventListener('resize', () => {});
  }
};
