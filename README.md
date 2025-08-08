# Kat UI - Japanese-Inspired Component Framework

**Kat UI** は、日本のデザイン美学にインスパイアされたモダンで軽量なUIコンポーネントフレームワークです。完全なアクセシビリティ対応と美しい日本風のデザインを兼ね備えています。

## 🌸 特徴

- **Apple風デザイン**: 清潔で美しい黒白ベースのモダンデザイン
- **完全アクセシビリティ対応**: WCAG 2.1準拠のアクセシビリティ機能
- **レスポンシブ設計**: モバイルファーストのレスポンシブデザイン
- **軽量**: バニラJavaScript、依存関係なし
- **モジュラー**: 必要なコンポーネントのみを使用可能
- **BEM命名規則**: `kat-`プレフィックスを使った明確なクラス名
- **カスタマイズ可能**: SCSS変数で簡単にテーマ変更
- **高性能**: 滑らかなアニメーションと最適化されたホバー状態
- **包括的**: 50+のプロダクション対応コンポーネント

## 📦 インストール

### ダウンロード

このリポジトリをクローンまたはダウンロード：

```bash
git clone https://github.com/your-username/kat-ui.git
cd kat-ui
```

### ファイル構成

```
kat-ui/
├── css/
│   └── kat-ui.css          # コンパイル済みCSS
├── scss/
│   ├── _variables.scss     # デザイントークン
│   ├── _mixins.scss        # ユーティリティミックスイン
│   ├── base/               # ベーススタイル
│   ├── components/         # コンポーネントスタイル
│   ├── layout/             # レイアウトシステム
│   ├── utilities/          # ユーティリティクラス
│   └── kat-ui.scss         # メインSCSSファイル
├── js/
│   └── kat-ui.js          # JavaScriptコンポーネント
├── index.html             # デモページ
└── README.md
```

## 🚀 使用方法

### 基本的なHTMLテンプレート

```html
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Kat UI Example</title>
    <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@300;400;500;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="css/kat-ui.css">
</head>
<body>
    <!-- コンテンツ -->
    
    <script src="js/kat-ui.js"></script>
</body>
</html>
```

### SCSS からビルド

Node.js 環境で Sass を使用してビルド：

```bash
# Sass のインストール
npm install -g sass

# CSS のコンパイル
sass scss/kat-ui.scss css/kat-ui.css --style=expanded

# ミニファイ版の作成
sass scss/kat-ui.scss css/kat-ui.min.css --style=compressed
```

## 🧩 コンポーネント

### ボタン

```html
<!-- プライマリボタン -->
<button class="kat-btn kat-btn--primary">保存</button>

<!-- セカンダリボタン -->
<button class="kat-btn kat-btn--secondary">キャンセル</button>

<!-- アウトラインボタン -->
<button class="kat-btn kat-btn--outline">詳細</button>

<!-- アイコンボタン -->
<button class="kat-btn kat-btn--icon" aria-label="編集">
    <svg><!-- アイコン --></svg>
</button>
```

### フォーム

```html
<form class="kat-form">
    <div class="kat-form__group">
        <label for="email" class="kat-label">メールアドレス</label>
        <input type="email" id="email" class="kat-input" required>
    </div>
    
    <div class="kat-form__group">
        <div class="kat-checkbox">
            <input type="checkbox" id="agree" class="kat-checkbox__input">
            <label for="agree" class="kat-checkbox__label">利用規約に同意する</label>
        </div>
    </div>
    
    <div class="kat-form__actions">
        <button type="submit" class="kat-btn kat-btn--primary">送信</button>
    </div>
</form>
```

### カード

```html
<div class="kat-card">
    <div class="kat-card__header">
        <h3 class="kat-card__title">カードタイトル</h3>
        <p class="kat-card__subtitle">サブタイトル</p>
    </div>
    <div class="kat-card__content">
        <p>カードのコンテンツ</p>
    </div>
    <div class="kat-card__footer">
        <button class="kat-btn kat-btn--primary">アクション</button>
    </div>
</div>
```

### アラート

```html
<!-- 成功アラート -->
<div class="kat-alert kat-alert--success" role="alert">
    <svg class="kat-alert__icon"><!-- アイコン --></svg>
    <div class="kat-alert__content">
        <p class="kat-alert__title">成功</p>
        <p class="kat-alert__description">操作が完了しました。</p>
    </div>
    <button class="kat-alert__close" aria-label="閉じる">×</button>
</div>
```

### モーダル

```html
<!-- トリガーボタン -->
<button class="kat-btn kat-btn--primary" data-kat-toggle="modal" data-kat-target="my-modal">
    モーダルを開く
</button>

<!-- モーダル -->
<div class="kat-modal" id="my-modal" role="dialog" aria-modal="true">
    <div class="kat-modal__backdrop" data-kat-close="modal"></div>
    <div class="kat-modal__content">
        <div class="kat-modal__header">
            <h2 class="kat-modal__title">モーダルタイトル</h2>
            <button class="kat-modal__close" data-kat-close="modal" aria-label="閉じる">×</button>
        </div>
        <div class="kat-modal__body">
            <p>モーダルのコンテンツ</p>
        </div>
        <div class="kat-modal__footer">
            <button class="kat-btn kat-btn--outline" data-kat-close="modal">キャンセル</button>
            <button class="kat-btn kat-btn--primary">確認</button>
        </div>
    </div>
</div>
```

### タブ

```html
<div class="kat-tabs" data-kat-component="tabs">
    <div class="kat-tabs__list" role="tablist">
        <button class="kat-tabs__tab kat-tabs__tab--active" role="tab" data-kat-target="tab1" aria-selected="true">タブ1</button>
        <button class="kat-tabs__tab" role="tab" data-kat-target="tab2" aria-selected="false">タブ2</button>
    </div>
    <div class="kat-tabs__content">
        <div class="kat-tabs__panel kat-tabs__panel--active" id="tab1" role="tabpanel">
            <p>タブ1のコンテンツ</p>
        </div>
        <div class="kat-tabs__panel" id="tab2" role="tabpanel" hidden>
            <p>タブ2のコンテンツ</p>
        </div>
    </div>
</div>
```

### アコーディオン

```html
<div class="kat-accordion" data-kat-component="accordion">
    <div class="kat-accordion__item">
        <button class="kat-accordion__trigger" data-kat-toggle="accordion-item" data-kat-target="item1" aria-expanded="false">
            <span>質問1</span>
            <svg class="kat-accordion__icon"><!-- アイコン --></svg>
        </button>
        <div class="kat-accordion__content" id="item1" role="region">
            <div class="kat-accordion__body">
                <p>回答1</p>
            </div>
        </div>
    </div>
</div>
```

## ♿ アクセシビリティ

Kat UI は完全なアクセシビリティ対応を提供します：

### キーボードナビゲーション
- **Tab**: フォーカス移動
- **Enter/Space**: ボタン・リンクのアクティベート
- **Escape**: モーダル・ドロップダウンを閉じる
- **矢印キー**: タブ間のナビゲーション

### スクリーンリーダー対応
- 適切なARIAラベルとロール
- `aria-expanded`, `aria-selected` などの状態管理
- `aria-live` によるライブアップデート
- セマンティックなHTML構造

### フォーカス管理
- 視覚的なフォーカスインジケーター
- モーダル内でのフォーカストラップ
- 論理的なタブ順序

## 🎨 カスタマイズ

### SCSS 変数

`scss/_variables.scss` でデザイントークンをカスタマイズ：

```scss
// カラーパレット
$kat-primary-600: #475569;
$kat-success-600: #16a34a;
$kat-error-600: #dc2626;

// フォント
$kat-font-family-base: 'Noto Sans JP', sans-serif;
$kat-font-size-base: 1rem;

// スペーシング
$kat-space-4: 1rem;
$kat-space-6: 1.5rem;

// ボーダーラディウス
$kat-radius-md: 0.375rem;
$kat-radius-lg: 0.5rem;
```

### 新しいコンポーネントの追加

1. `scss/components/` に新しい SCSS ファイルを作成
2. `scss/kat-ui.scss` にインポートを追加
3. 必要に応じて JavaScript 機能を `js/kat-ui.js` に追加

```scss
// scss/components/_my-component.scss
.kat-my-component {
  // スタイル
}
```

## 📱 レスポンシブデザイン

モバイルファーストのブレークポイント：

```scss
$kat-breakpoint-sm: 640px;   // タブレット
$kat-breakpoint-md: 768px;   // 小さなデスクトップ
$kat-breakpoint-lg: 1024px;  // デスクトップ
$kat-breakpoint-xl: 1280px;  // 大きなデスクトップ
$kat-breakpoint-2xl: 1536px; // 特大スクリーン
```

### ユーティリティクラス

```html
<!-- グリッドシステム -->
<div class="kat-grid kat-grid--cols-1 kat-grid--md-cols-2 kat-grid--lg-cols-3">
    <!-- アイテム -->
</div>

<!-- スペーシング -->
<div class="kat-p--4 kat-m--2">
    <!-- 内容 -->
</div>

<!-- フレックスボックス -->
<div class="kat-flex kat-items--center kat-justify--between">
    <!-- 内容 -->
</div>
```

## 🌐 ブラウザサポート

- **モダンブラウザ**: Chrome, Firefox, Safari, Edge (最新2バージョン)
- **JavaScript**: ES6+ 機能を使用
- **CSS**: CSS Grid, Flexbox, CSS カスタムプロパティ

## 📖 APIリファレンス

### JavaScript イベント

```javascript
// モーダルイベント
document.addEventListener('kat:modal:open', function(e) {
    console.log('モーダルが開かれました:', e.target);
});

document.addEventListener('kat:modal:close', function(e) {
    console.log('モーダルが閉じられました:', e.target);
});

// タブイベント
document.addEventListener('kat:tabs:change', function(e) {
    console.log('タブが変更されました:', e.detail);
});

// アコーディオンイベント
document.addEventListener('kat:accordion:open', function(e) {
    console.log('アコーディオンが開かれました:', e.target);
});
```

### プログラマティックな制御

```javascript
// モーダルを開く
const modal = document.getElementById('my-modal');
katUI.modal.open(modal);

// モーダルを閉じる
katUI.modal.close(modal);

// タブを切り替える
const tab = document.querySelector('[data-kat-target="tab2"]');
katUI.tabs.switchTab(tab);
```

## 🤝 コントリビューション

コントリビューションを歓迎します！以下の手順でご協力ください：

1. このリポジトリをフォーク
2. 機能ブランチを作成 (`git checkout -b feature/amazing-feature`)
3. 変更をコミット (`git commit -m 'Add amazing feature'`)
4. ブランチにプッシュ (`git push origin feature/amazing-feature`)
5. プルリクエストを作成

### 開発ガイドライン

- **BEM命名規則**: `kat-block__element--modifier`
- **日本語コメント**: コードコメントは日本語で記述
- **アクセシビリティ**: 新機能は必ずアクセシビリティテストを実施
- **レスポンシブ**: モバイルファーストで設計

## 📄 ライセンス

このプロジェクトは MIT ライセンスの下で公開されています。詳細は [LICENSE](LICENSE) ファイルをご覧ください。

## 🙏 謝辞

- **Noto Sans JP**: Google Fonts
- **デザインインスピレーション**: 日本の伝統的なデザイン原則
- **アクセシビリティガイドライン**: WCAG 2.1

---

**Kat UI** で美しく、アクセシブルなWebインターフェースを構築しましょう！ 🌸

## 📞 サポート

質問やサポートが必要な場合：

- [Issues](https://github.com/your-username/kat-ui/issues) でバグ報告や機能リクエスト
- [Discussions](https://github.com/your-username/kat-ui/discussions) で一般的な質問や議論

**楽しい開発を！** ✨
