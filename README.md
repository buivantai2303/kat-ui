# Kat UI - Japanese-Inspired Component Framework

**Kat UI** は、日本のデザイン美学にインスパイアされたモダンで軽量なUIコンポーネントフレームワークです。完全なアクセシビリティ対応と美しい日本風のデザインを兼ね備えています。

![KatUI](https://github.com/user-attachments/assets/b43971fd-04b5-4e64-b199-e311e3010d3e)


## 特徴

- **完全アクセシビリティ対応**: WCAG 2.1準拠のアクセシビリティ機能  
- **レスポンシブ設計**: モバイルファーストのレスポンシブデザイン  
- **軽量**: バニラJavaScript、依存関係なし  
- **モジュラー**: 必要なコンポーネントのみを使用可能  
- **BEM命名規則**: `kat-`プレフィックスを使った明確なクラス名  
- **カスタマイズ可能**: SCSS変数で簡単にテーマ変更  
- **高性能**: 滑らかなアニメーションと最適化されたホバー状態  
- **包括的**: 50以上のプロダクション対応コンポーネント  

## インストール

### ダウンロード

このリポジトリをクローンまたはダウンロードしてください:

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
│   └── kat-ui.js           # JavaScriptコンポーネント
├── index.html              # デモページ
└── README.md
```

## 使用方法

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

Node.js 環境で Sass を使用してビルドします:

```bash
# Sass のインストール
npm install -g sass

# CSS のコンパイル
sass scss/kat-ui.scss css/kat-ui.css --style=expanded

# ミニファイ版の作成
sass scss/kat-ui.scss css/kat-ui.min.css --style=compressed
```

## コンポーネント例

### ボタン

```html
<button class="kat-btn kat-btn--primary">保存</button>
<button class="kat-btn kat-btn--secondary">キャンセル</button>
<button class="kat-btn kat-btn--outline">詳細</button>
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

## アクセシビリティ

Kat UI は以下のアクセシビリティ機能を提供します:

- **キーボードナビゲーション**: Tab, Enter, Escape, 矢印キーによる操作  
- **スクリーンリーダー対応**: 適切なARIAラベルとロールを付与  
- **フォーカス管理**: モーダル内でのフォーカストラップ、視覚的なフォーカスインジケーター  

## カスタマイズ

### SCSS 変数

`scss/_variables.scss` を編集することでテーマを簡単に変更できます:

```scss
$kat-primary-600: #475569;
$kat-success-600: #16a34a;
$kat-error-600: #dc2626;

$kat-font-family-base: 'Noto Sans JP', sans-serif;
$kat-font-size-base: 1rem;

$kat-space-4: 1rem;
$kat-space-6: 1.5rem;

$kat-radius-md: 0.375rem;
$kat-radius-lg: 0.5rem;
```

## レスポンシブデザイン

モバイルファーストのブレークポイントを提供しています:

```scss
$kat-breakpoint-sm: 640px;
$kat-breakpoint-md: 768px;
$kat-breakpoint-lg: 1024px;
$kat-breakpoint-xl: 1280px;
$kat-breakpoint-2xl: 1536px;
```

## ブラウザサポート

- Chrome, Firefox, Safari, Edge (最新2バージョン)  
- JavaScript: ES6+  
- CSS: CSS Grid, Flexbox, CSS カスタムプロパティ  

## コントリビューション

コントリビューションを歓迎します。手順:

1. リポジトリをフォーク  
2. 機能ブランチを作成 (`git checkout -b feature/amazing-feature`)  
3. 変更をコミット (`git commit -m 'Add amazing feature'`)  
4. ブランチにプッシュ (`git push origin feature/amazing-feature`)  
5. プルリクエストを作成  

### 開発ガイドライン

- **BEM命名規則**: `kat-block__element--modifier`  
- **日本語コメント**: コードコメントは日本語で記述  
- **アクセシビリティ**: 新機能は必ずアクセシビリティテストを実施  
- **レスポンシブ**: モバイルファーストで設計  

## ライセンス

このプロジェクトは MIT ライセンスの下で公開されています。詳細は [LICENSE](LICENSE) をご覧ください。

## 謝辞

- **Noto Sans JP**: Google Fonts  
- **デザインインスピレーション**: 日本の伝統的なデザイン原則  
- **アクセシビリティガイドライン**: WCAG 2.1  

---

**Kat UI** を使って、美しくアクセシブルなWebインターフェースを構築してください。
