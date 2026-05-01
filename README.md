# FlashMind

AI を活用した間隔反復学習（SRS: Spaced Repetition System）型の単語帳アプリです。
Next.js + Prisma + PostgreSQL のフルスタック構成で、OpenAI による AI カード生成・翻訳と Whisper API による Podcast 書き起こしに対応しています。今後 Capacitor 等を用いた iPhone アプリ化を予定。

> ステータス: ✅ Phase 2 完了 — バックエンド + 認証 + SRS + AI + 非同期コンテンツ取込。次は Vercel デプロイと App Router 移行。

---

## 主な機能

- ホーム / デッキ一覧 / デッキ詳細
- カード一覧・編集（AI による意味/語源/解説の自動生成 — OpenAI gpt-4.1-mini）
- フラッシュカード学習・クイズ学習（SM-2 アルゴリズムで間隔反復）
- 学習結果・統計・設定
- コンテンツ取込（PDF / YouTube / Podcast）
  - PDF: テキスト抽出 → 翻訳
  - YouTube: 字幕取得 → 10 秒バケット化 → 翻訳
  - Podcast: OpenAI Whisper で書き起こし → 翻訳
  - すべて非同期ジョブ化されており、UI が進捗をポーリング表示
- iPhone 風のシェル（`components/iphone-shell.tsx`）でラップしたモバイルファーストのレイアウト

---

## 技術スタック

| 領域 | 利用技術 |
| --- | --- |
| フレームワーク | Next.js 16 (App Router) |
| UI | React 19 / TypeScript / Tailwind CSS / shadcn/ui (Radix UI) |
| DB / ORM | PostgreSQL (Neon) + Prisma 6（並列で SQLite も維持） |
| 認証 | Auth.js v5 (Credentials Provider) |
| AI | OpenAI gpt-4.1-mini（Chat）+ Whisper（音声書き起こし） |
| アイコン | lucide-react |
| フォーム | react-hook-form + zod |
| グラフ | recharts |
| テスト | Playwright (e2e スモーク) |
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

前提: Node.js 20+ / pnpm 9+ / Neon アカウント（または Docker Postgres）

```bash
# 1. 依存関係のインストール
pnpm install

# 2. .env.local を作成して環境変数を設定
cp .env.example .env.local
# 以下を埋める:
#   DATABASE_URL  : Neon の pooled URL (?pgbouncer=true&connection_limit=1)
#   DIRECT_URL    : Neon の direct URL (migrate 用)
#   AUTH_SECRET   : `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
#   OPENAI_API_KEY : OpenAI API（Chat = カード生成 / 辞書 / 翻訳、Whisper = Podcast 書き起こし）

# 3. DB マイグレーション + シード投入
pnpm db:migrate
pnpm db:seed

# 4. 開発サーバー
pnpm dev
# → http://localhost:3000
```

### オフライン作業（SQLite）

Neon に接続できない環境では SQLite に切り替えられます。

```bash
# .env.local の DATABASE_URL を file:./dev.db に書き換え
pnpm db:generate:sqlite     # Prisma Client を SQLite 用に切替
pnpm db:migrate:sqlite      # 必要なら（dev.db を作り直す場合）
pnpm dev
```

戻すときは `DATABASE_URL` を Neon URL に戻して `pnpm db:generate`。

### その他のスクリプト

```bash
pnpm build       # 本番ビルド (prisma generate + next build)
pnpm start       # 本番サーバー起動
pnpm typecheck   # 型チェックのみ (tsc --noEmit)
pnpm e2e         # Playwright スモーク
```

---

## 仕様書

コードから書き起こした仕様書を `docs/` 配下に置いています。バックエンド着手や多プラットフォーム化の際に参照してください。

- [docs/product.md](docs/product.md) — プロダクト概要・機能一覧・用語集・現状ステータス
- [docs/screens.md](docs/screens.md) — 11 画面の構成・props・state・遷移図（Mermaid）
- [docs/data-model.md](docs/data-model.md) — エンティティ定義・ER 図・DB スキーマ案・TBD 一覧

---

## ロードマップ

### フェーズ 1: UI 整備
- [x] v0 で生成した画面を取り込み
- [ ] 画面遷移を App Router のルートへ分割（未着手）
- [ ] モックデータを `lib/mock/` 等に集約（一部完了。バックエンドに置換済み）

### フェーズ 2: データ層・バックエンド ✅ 完了
- [x] バックエンド方式: Next.js Route Handlers + Prisma + PostgreSQL (Neon)
- [x] スキーマ設計（User / Deck / Card / Review / SrsState / Memo / ImportedContent / ImportJob）
- [x] SRS アルゴリズム（SM-2）実装
- [x] 認証（Auth.js v5 + Credentials Provider）
- [x] AI 連携: OpenAI gpt-4.1-mini（カード生成・辞書・翻訳）+ Whisper（Podcast 書き起こし）
- [x] コンテンツ取込の非同期ジョブ化（ImportJob テーブル + `next/server` `after()` ワーカー）

### フェーズ 3: iPhone アプリ化（現在地）
本命候補は **Capacitor**（既存の Next.js コードをほぼそのまま流用できる）。

- [ ] Next.js の export 対応（`output: 'export'` の検討）または Capacitor 用ビルドの構成
- [ ] `@capacitor/core` / `@capacitor/ios` の導入
- [ ] iOS プロジェクト生成 (`npx cap add ios`)
- [ ] App Store Connect 準備（証明書・プロビジョニング・アイコン・スプラッシュ）
- [ ] プッシュ通知（学習リマインダー）

> 純ネイティブ志向なら React Native / Expo への移植も選択肢ですが、その場合は UI を作り直す必要があります。

### フェーズ 4: 公開・運用
- [ ] GitHub リポジトリ公開
- [ ] CI（GitHub Actions: typecheck / build / e2e）
- [ ] Vercel デプロイ（`maxDuration = 300` を使うため Pro 以上）
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
