# 就活タスク管理アプリ

就職活動を効率的に管理するためのWebアプリケーションです。企業情報の管理、タスク管理、ES作成、面接準備など、就活に必要な機能を一つのアプリで管理できます。
て、て、てすと～

## 主な機能

### 1. ホームページ
- 企業カードの一覧表示（画像付き）
- 企業名での検索機能
- 並び替え（登録順・更新順）
- 業界別絞り込み
- モチベーション管理
- 直近の締切・タスク表示

### 2. 企業情報管理
- **新規企業追加**：企業名、業界、画像URL、志望度、現状を入力
- **企業情報編集**：すべてのフィールドをリアルタイム編集
- **企業削除**：確認ダイアログ付きの安全な削除機能
- **4つのタブ**：
  - 企業情報：基本情報、マイページ情報、選考フローなど
  - 企業分析：売上、従業員数、事業内容、カスタムフィールド
  - ES：エントリーシートの作成・管理
  - 面接：面接記録の管理

### 3. タスク管理
- タスクの追加・編集・削除
- 優先度設定（高・中・低）
- ステータス管理（未着手・進行中・完了）
- カテゴリ分類（ES・面接・企業研究・Webテストなど）
- 締切日の設定と期限超過の警告
- フィルタリング・ソート機能
- 統計ダッシュボード

### 4. メール生成
- キーワード、希望日程、自由記述からメールを生成
- 生成されたメールのコピー機能

### 5. ロードマップ
- 就活プロセスのタイムライン表示
- カテゴリ別の絞り込み
- 期間順・カテゴリ順の並び替え

### 6. その他の機能
- ダーク/ライトモード切り替え
- アカウント登録・ログイン機能
- レスポンシブデザイン
- データの永続化（localStorage）

## 技術スタック

- **フロントエンド**: React 18
- **ビルドツール**: Vite
- **スタイリング**: Tailwind CSS
- **UIコンポーネント**: shadcn/ui
- **アイコン**: Lucide React
- **ルーティング**: React Router
- **状態管理**: React Context API
- **データ永続化**: localStorage

## セットアップ方法

### 前提条件
- Node.js 18以上
- pnpm（推奨）またはnpm

### インストール手順

1. プロジェクトのクローン
```bash
cd job-hunting-app
```

2. 依存関係のインストール
```bash
pnpm install
# または
npm install
```

3. 開発サーバーの起動
```bash
pnpm run dev
# または
npm run dev
```

4. ブラウザで開く
```
http://localhost:5173
```

### ビルド

本番環境用にビルドする場合：
```bash
pnpm run build
# または
npm run build
```

ビルドされたファイルは`dist`フォルダに出力されます。

### プレビュー

ビルドしたアプリをプレビューする場合：
```bash
pnpm run preview
# または
npm run preview
```

## プロジェクト構造

```
job-hunting-app/
├── public/              # 静的ファイル
├── src/
│   ├── components/      # UIコンポーネント（shadcn/ui）
│   │   └── ui/
│   ├── contexts/        # React Context
│   │   ├── AuthContext.jsx
│   │   ├── DataContext.jsx
│   │   └── ThemeContext.jsx
│   ├── pages/           # ページコンポーネント
│   │   ├── HomePage.jsx
│   │   ├── CompanyPage.jsx
│   │   ├── TaskPage.jsx
│   │   ├── EmailGeneratorPage.jsx
│   │   ├── RoadmapPage.jsx
│   │   ├── SettingsPage.jsx
│   │   └── LoginPage.jsx
│   ├── hooks/           # カスタムフック
│   ├── lib/             # ユーティリティ関数
│   ├── App.jsx          # メインアプリコンポーネント
│   ├── App.css          # グローバルスタイル
│   ├── main.jsx         # エントリーポイント
│   └── index.css        # Tailwind CSSの設定
├── index.html           # HTMLテンプレート
├── vite.config.js       # Vite設定
├── tailwind.config.js   # Tailwind CSS設定
├── postcss.config.js    # PostCSS設定
├── components.json      # shadcn/ui設定
└── package.json         # 依存関係
```

## 初期データ

アプリには以下のダミーデータが含まれています：

### 企業データ（10社）
- 株式会社リクルート
- 株式会社サイバーエージェント
- 楽天グループ株式会社
- トヨタ自動車株式会社
- 株式会社資生堂
- 株式会社キーエンス
- ソニーグループ株式会社
- 株式会社電通
- 三菱商事株式会社
- アクセンチュア株式会社

### ロードマップデータ（5項目）
- 自己分析
- 業界研究
- サマーインターンES作成
- 面接対策
- 内定承諾

### タスクデータ（5項目）
- リクルートのES作成
- サイバーエージェント二次面接準備
- 資生堂の企業研究
- トヨタ自動車のWebテスト対策
- アクセンチュアのケース面接対策

## カスタマイズ

### テーマの変更
`src/contexts/ThemeContext.jsx`でダーク/ライトモードの設定を変更できます。

### データの永続化
現在はlocalStorageを使用していますが、バックエンドAPIと連携する場合は`src/contexts/DataContext.jsx`を修正してください。

### UIコンポーネントの追加
shadcn/uiのコンポーネントを追加する場合：
```bash
pnpm dlx shadcn@latest add [component-name]
```

## VSCodeでの開発

### 推奨拡張機能
- ESLint
- Prettier - Code formatter
- Tailwind CSS IntelliSense
- ES7+ React/Redux/React-Native snippets

### 設定ファイル
`.vscode/settings.json`を作成して以下を追加：
```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "tailwindCSS.experimental.classRegex": [
    ["cva\\(([^)]*)\\)", "[\"'`]([^\"'`]*).*?[\"'`]"]
  ]
}
```

## トラブルシューティング

### ポート5173が既に使用されている
別のポートで起動する場合：
```bash
pnpm run dev -- --port 3000
```

### 依存関係のエラー
node_modulesを削除して再インストール：
```bash
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

### ビルドエラー
キャッシュをクリアしてビルド：
```bash
pnpm run build --force
```

## ライセンス

このプロジェクトはMITライセンスの下で公開されています。

## 作者

Manus AI Agent

## バージョン

1.0.0

