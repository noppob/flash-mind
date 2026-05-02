# AGENTS.md

このファイルは Codex（および類似の AI コーディングエージェント）がこのリポジトリで作業する際の前提情報・運用ルールをまとめたものです。

---

## プロジェクト概要

- **名前**: FlashMind
- **目的**: AI を活用した間隔反復学習（SRS）型の単語帳アプリ
- **状態**: Phase 2 完了（バックエンド + AI 連携 + 非同期コンテンツ取込）。次は Vercel デプロイと App Router への画面分割、最終的に Capacitor で iPhone 化
- **言語**: コミュニケーションは日本語、コードのコメント・識別子は英語が基本（UI 文言は日本語）

詳細なロードマップは [README.md](README.md) を参照。

---

## 技術スタック

| 領域 | 技術 |
| --- | --- |
| フレームワーク | Next.js 16 (App Router, RSC 有効) |
| 言語 | TypeScript (strict) |
| UI | React 19 / Tailwind CSS / shadcn/ui (Radix UI ベース) |
| アイコン | lucide-react |
| フォーム | react-hook-form + zod |
| グラフ | recharts |
| DB / ORM | PostgreSQL (Neon) + Prisma 6（オフライン用に SQLite も並列維持） |
| 認証 | Auth.js v5 (NextAuth) + Credentials Provider（メール/パスワード） |
| AI | OpenAI gpt-4.1-mini — カード生成・辞書・翻訳。OpenAI Whisper — Podcast 書き起こし |
| パッケージマネージャ | **pnpm**（npm / yarn は使わない） |

将来計画:
- iOS 化: Capacitor（既存 Web を流用）
- App Router への画面分割（現在は単一ページの擬似ルーティング）
- Vercel デプロイ + CI（GitHub Actions）

---

## ディレクトリ構成

```
app/
  api/                # Route Handlers（auth / decks / cards / reviews / imports / ai / stats）
  page.tsx            # 全画面を擬似ルーティングで集約
components/
  iphone-shell.tsx    # 開発時のプレビュー枠（iPhone 風フレーム）
  bottom-tabs.tsx
  screens/            # 画面コンポーネント (home/quiz/flashcard など)
  ui/                 # shadcn/ui — 基本いじらない
hooks/                # use-mobile, use-toast, use-tts
lib/
  openai.ts           # OpenAI クライアント集中管理（Chat + Whisper）
  api/                # クライアント側 fetch ラッパ
  auth.ts             # Auth.js 設定
  auth-helpers.ts     # withUser / jsonError / HttpError
  imports/            # PDF / YouTube / Podcast 取込本体 + worker.ts（非同期処理）
  prisma.ts           # Prisma Client シングルトン
  srs.ts              # SM-2 アルゴリズム
  validation/         # zod スキーマ
prisma/
  schema.prisma       # PostgreSQL（メイン）
  migrations/         # PostgreSQL マイグレーション
  sqlite/             # SQLite 並列スキーマ + マイグレーション（オプション）
  seed.ts             # 共通 seed
public/               # 静的アセット
styles/               # 追加スタイル
e2e/                  # Playwright スモークテスト
```

### パスエイリアス
- `@/*` がプロジェクトルート（`tsconfig.json` の `paths` 設定）
- インポート例: `import { Button } from "@/components/ui/button"`

---

## 重要な現状認識（作業前に必ず読む）

1. **画面遷移はローカル state で擬似的に行っている**
   - `app/page.tsx` の `screen` / `activeTab` state でハンドリング
   - 本来 App Router で扱うべきだが、v0 出力の都合で単一ページ構成
   - 画面追加・遷移修正の際はこの構造を踏まえて `app/page.tsx` の `Screen` 型と `renderScreen` の switch を更新する必要がある

2. **DB プロバイダは 2 系統**
   - メイン: `prisma/schema.prisma`（PostgreSQL / Neon）— 本番・通常開発
   - 並列: `prisma/sqlite/schema.prisma`（SQLite）— オフライン作業用のオプション
   - **モデル定義は 2 ファイルで同期する義務がある**。datasource block 以外は完全一致させること
   - 切替: `pnpm db:generate:sqlite && DATABASE_URL=file:./dev.db pnpm dev`
   - `@db.JsonB` のような Postgres 専用注釈は使わない（SQLite 側と差が出る）

3. **コンテンツ取込は非同期処理**
   - POST `/api/imports` は `ImportJob` レコードを作って 202 + jobId を返すのみ
   - 実処理は `lib/imports/worker.ts` が `next/server` の `after()` で実行
   - 進捗は `prisma.importJob` に書き戻し、UI が GET `/api/imports/[jobId]` をポーリング
   - Vercel 本番では `maxDuration = 300`（Pro プラン以上が必要）

4. **AI モデルは集中管理**
   - `lib/openai.ts` の `AI_MODEL`（現行 `gpt-4.1-mini`）と `WHISPER_MODEL`（現行 `whisper-1`）
   - モデル切替はこの 1 ファイルで完了する

5. **`hooks/use-toast.ts` と `components/ui/use-toast.ts` が重複**
   - shadcn の生成都合。新規参照は `hooks/` を使う方針で統一

6. **iPhone シェルは切り替え可能（既定はビューポート連動）**
   - `IPhoneShell` は固定サイズ (390x844) の iPhone 風枠
   - 既定では `md` (≥768px) で枠あり、それ未満ではフルスクリーン表示
   - URL クエリで上書き可能: `?frame=on` で常に枠表示、`?frame=off` で常に枠なし
   - Capacitor 等で実機ラップする際は `?frame=off` を初期 URL にする想定

7. **GitHub 未登録**
   - リモートはまだない（`git remote -v` で確認可）。Vercel デプロイ前に登録する

---

## 開発コマンド

```bash
pnpm install                # 依存関係インストール（npm/yarn は使わない）
pnpm dev                    # 開発サーバー (http://localhost:3000)
pnpm build                  # 本番ビルド
pnpm start                  # 本番サーバー
pnpm typecheck              # 型チェックのみ (tsc --noEmit)
pnpm e2e                    # Playwright スモーク

# Database (PostgreSQL = デフォルト)
pnpm db:migrate             # 開発用マイグレーション (prisma migrate dev)
pnpm db:deploy              # 本番マイグレーション (prisma migrate deploy)
pnpm db:seed                # シードデータ投入
pnpm db:generate            # Prisma Client 再生成

# Database (SQLite = opt-in、オフライン作業用)
DATABASE_URL=file:./dev.db pnpm db:migrate:sqlite
pnpm db:generate:sqlite     # Prisma Client を SQLite 用に切替（Postgres 用は上書きされる）
```

`pnpm typecheck` は UI 変更後にも通すこと。`next.config.mjs` の `ignoreBuildErrors` は `false`（本番ビルドで型エラーが出る）。

---

## コーディング規約

### TypeScript / React
- `"use client"` ディレクティブは Client Component に必要なものだけ付ける
- props は型エイリアスではなく inline 型 or interface を画面コンポーネントに合わせる（既存スタイル踏襲）
- React 19 のため、`use` API や Server Actions など新機能を使ってよい

### スタイリング
- Tailwind が一次選択。CSS-in-JS は使わない
- 色はテーマトークン（`bg-primary`, `text-muted-foreground` など）を優先。生 Hex は避ける
- `cn()` を使ったクラス結合（`lib/utils.ts`）

### shadcn/ui
- `components/ui/*` は基本変更しない（再生成で消えるため）
- 必要なら派生コンポーネントを `components/` 直下や `components/<feature>/` に作る
- 追加コンポーネントは `pnpm dlx shadcn@latest add <name>` で導入（`components.json` 設定済み）

### 画面追加時の手順
1. `components/screens/<new>-screen.tsx` を作成
2. `app/page.tsx` の `Screen` 型に追加
3. `renderScreen()` の switch にケースを追加
4. 必要なら `BottomTabs` の `tabScreens` を更新

---

## 作業時の方針（Codex へのお願い）

- **UI を変更したら、必ずブラウザで動作確認する**（`pnpm dev` で起動 → 画面遷移を実際に踏む）。型チェックの成功は動作の保証ではない。
- **モックデータと実装の境界を明確にする** — 将来のバックエンド差し替えを意識して、フェッチ層を関数で切り出しておくと後で楽。
- **新規ファイルは最小限に** — 既存ファイルを編集できるならそちらを優先。
- **コメントは控えめに** — 自明な what は書かず、why（なぜこの実装にしたか）が必要なときだけ書く。
- **不要な"親切"はしない** — 1 行の TODO で済むことを抽象化したり、想定されない入力へのバリデーションを足さない。
- **破壊的操作は確認を取る** — `git push -f`, `git reset --hard`, ファイル一括削除などの前に必ず確認。

---

## 今後の意思決定が必要なポイント

ここに書いてある項目は、まだ確定していないものです。ユーザーと相談した上で進めること。

- iOS 化のアプローチ（Capacitor 本命 / React Native 書き直し）
- 認証プロバイダの拡張（現状 Credentials のみ。Google / Apple Sign In を入れるか）
- AI 機能の範囲拡張（例文生成は実装済み。発音 / 個別の苦手分析など）
- GitHub リポジトリの公開範囲（private / public）
- ライセンス（MIT / 独自 / 非公開）
- Vercel プラン（`maxDuration = 300` を使うため Pro 以上が前提）

---

## 関連ドキュメント

- [README.md](README.md) — プロジェクト概要・セットアップ・ロードマップ
- [components.json](components.json) — shadcn/ui の設定
- [next.config.mjs](next.config.mjs) — Next.js 設定
- [tsconfig.json](tsconfig.json) — TypeScript 設定
