/**
 * ヘッダーアナウンスメントのタイピング効果
 * - 指定要素のテキストをタイプライター風に表示/消去しながらループ
 */

export const headerAnnouncement = {
  /** タイマーID */
  _timer: null,

  /** 初期化 */
  init() {
    const el = document.querySelector('.kat-ecommerce-header__announcement');
    if (!el) return;

    // 設定値（data属性があれば使用）
    const messagesAttr = el.getAttribute('data-kat-messages');
    const messages = messagesAttr ? this._parseMessages(messagesAttr) : [el.textContent.trim()];
    const typeSpeed = parseInt(el.getAttribute('data-kat-type-speed') || '80', 10);
    const eraseSpeed = parseInt(el.getAttribute('data-kat-erase-speed') || '50', 10);
    const pauseMs = parseInt(el.getAttribute('data-kat-pause') || '8000', 10);

    if (!messages.length) return;

    el.classList.add('kat-typing');

    let msgIndex = 0;
    let charIndex = 0;
    let typing = true;

    const tick = () => {
      const text = messages[msgIndex];
      if (typing) {
        if (charIndex <= text.length) {
          el.textContent = text.slice(0, charIndex);
          charIndex += 1;
          this._timer = setTimeout(tick, typeSpeed);
        } else {
          typing = false;
          this._timer = setTimeout(tick, pauseMs);
        }
      } else {
        if (charIndex > 0) {
          charIndex -= 1;
          el.textContent = text.slice(0, charIndex);
          this._timer = setTimeout(tick, eraseSpeed);
        } else {
          typing = true;
          msgIndex = (msgIndex + 1) % messages.length;
          this._timer = setTimeout(tick, typeSpeed);
        }
      }
    };

    // 可視性変更で一時停止/再開
    const onVisibility = () => {
      if (document.hidden) {
        if (this._timer) clearTimeout(this._timer);
        this._timer = null;
      } else if (!this._timer) {
        this._timer = setTimeout(tick, typeSpeed);
      }
    };

    document.addEventListener('visibilitychange', onVisibility);
    // 最初の起動
    this._timer = setTimeout(tick, typeSpeed);

    // 破棄用に参照を保持
    this._cleanup = () => {
      document.removeEventListener('visibilitychange', onVisibility);
      if (this._timer) clearTimeout(this._timer);
      this._timer = null;
    };
  },

  /** 破棄処理 */
  destroy() {
    if (typeof this._cleanup === 'function') {
      this._cleanup();
    }
  },

  /** data-kat-messages 文字列を配列へ変換（カンマ区切り or JSON配列） */
  _parseMessages(raw) {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed.map((s) => String(s));
    } catch (_) {
      // JSONでない場合はカンマ区切りを想定
    }
    return raw
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
  }
};


