# FlashMind

AI を活用した間隔反復学習（SRS: Spaced Repetition System）型の単語帳アプリです。
現在は Web フロントエンド（Next.js）のみ実装されています。今後バックエンドの追加と、Capacitor 等を用いた iPhone アプリ化を予定しています。

> ステータス: 🚧 開発初期 — UI のみ（v0 で生成したフロントエンドを起点に開発中）。バックエンド・データ永続化・認証は未実装。

---

## 主な機能（UI 実装済み）

- ホーム / デッキ一覧
- デッキ詳細・カード一覧・カード編集
- フラッシュカード学習画面
- クイズ形式の学習画面
- 学習結果の表示
- 統計・設定・インポート画面
- iPhone 風のシェル（`components/iphone-shell.tsx`）でラップしたモバイルファーストのレイアウト

> 現状はモックデータでの表示確認のみで、学習進捗の永続化・SRS ロジック・AI 連携は未実装です。

---

## 技術スタック

| 領域 | 利用技術 |
| --- | --- |
| フレームワーク | Next.js 16 (App Router) |
| UI | React 19 / TypeScript / Tailwind CSS / shadcn/ui (Radix UI) |
| アイコン | lucide-react |
| フォーム | react-hook-form + zod |
| グラフ | recharts |
| パッケージ管理 | pnpm（`pnpm-lock.yaml` 同梱） |

iOS アプリ化に向けては [Capacitor](https://capacitorjs.com/) を本命候補として検討中（後述）。

---

## ディレクトリ構成

```
flash-mind/
├── app/                    # Next.js App Router (page.tsx がエントリー)
├── components/
│   ├── iphone-shell.tsx    # iPhone 風フレーム（開発時の見た目の枠）
│   ├── bottom-tabs.tsx     # 下部ナビ
│   ├── screens/            # 画面単位のコンポーネント
│   └── ui/                 # shadcn/ui コンポーネント
├── hooks/                  # カスタムフック
├── lib/                    # ユーティリティ (cn 等)
├── public/                 # 静的アセット
├── styles/                 # 追加スタイル
├── tailwind.config.ts
├── next.config.mjs
└── tsconfig.json
```

画面遷移は `app/page.tsx` 内のローカル state（`screen` / `activeTab`）で擬似ルーティングしています。本格的な遷移は今後 App Router の `app/<segment>/page.tsx` へ分割する想定です。

---

## セットアップ

前提: Node.js 20+ / pnpm 9+

```bash
# 依存関係のインストール
pnpm install

# 開発サーバー
pnpm dev
# → http://localhost:3000 で表示
```

その他のスクリプト:

```bash
pnpm build       # 本番ビルド
pnpm start       # 本番サーバー起動
pnpm lint        # Lint
pnpm typecheck   # 型チェックのみ (tsc --noEmit)
```

> 注意: `next.config.mjs` で `typescript.ignoreBuildErrors: true` になっているため、ビルド時に型エラーを検出しません。バックエンド着手のタイミングで `false` に戻すことを推奨します。

---

## 仕様書

コードから書き起こした仕様書を `docs/` 配下に置いています。バックエンド着手や多プラットフォーム化の際に参照してください。

- [docs/product.md](docs/product.md) — プロダクト概要・機能一覧・用語集・現状ステータス
- [docs/screens.md](docs/screens.md) — 11 画面の構成・props・state・遷移図（Mermaid）
- [docs/data-model.md](docs/data-model.md) — エンティティ定義・ER 図・DB スキーマ案・TBD 一覧

---

## ロードマップ

### フェーズ 1: UI 整備（現在地）
- [x] v0 で生成した画面を取り込み
- [ ] 画面遷移を App Router のルートへ分割
- [ ] `screens/*` の props 経由ナビゲーションを `next/link` / Server Component ベースへ整理
- [ ] モックデータを `lib/mock/` 等に集約

### フェーズ 2: データ層・バックエンド
- [ ] バックエンド方式の選定（候補）
  - Supabase（PostgreSQL + Auth + Realtime、最短）
  - Next.js Route Handlers + Prisma + PostgreSQL（自前運用）
  - Cloudflare Workers + D1（軽量・低コスト寄り）
- [ ] スキーマ設計（User / Deck / Card / Review / Stat）
- [ ] SRS アルゴリズム（SM-2 もしくは FSRS）の実装
- [ ] 認証（メール / Google / Apple Sign In）
- [ ] AI 機能（例文生成・解説・発音）— Anthropic Claude API を想定

### フェーズ 3: iPhone アプリ化
本命候補は **Capacitor**（既存の Next.js コードをほぼそのまま流用できる）。

- [ ] Next.js の export 対応（`output: 'export'` の検討）または Capacitor 用ビルドの構成
- [ ] `@capacitor/core` / `@capacitor/ios` の導入
- [ ] iOS プロジェクト生成 (`npx cap add ios`)
- [ ] App Store Connect 準備（証明書・プロビジョニング・アイコン・スプラッシュ）
- [ ] プッシュ通知（学習リマインダー）

> 純ネイティブ志向なら React Native / Expo への移植も選択肢ですが、その場合は UI を作り直す必要があります。

### フェーズ 4: 公開・運用
- [ ] GitHub リポジトリ公開
- [ ] CI（GitHub Actions: lint / typecheck / build）
- [ ] Vercel デプロイ
- [ ] エラー監視 / アナリティクス

---

## GitHub への登録（未実施）

ローカルリポジトリは初期化済みです。GitHub に上げる際の手順例:

```bash
# 例: gh CLI を使う場合
gh repo create flash-mind --private --source=. --remote=origin
git add -A
git commit -m "chore: bootstrap project with v0 frontend"
git push -u origin main
```

`gh` を使わない場合は、GitHub 上で空のリポジトリを作成 → `git remote add origin <URL>` → `git push -u origin main`。

---

## ライセンス

未設定（あとで決定）。公開するまでは All Rights Reserved として扱ってください。
