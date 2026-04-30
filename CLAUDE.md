# CLAUDE.md

このファイルは Claude Code（および類似の AI コーディングエージェント）がこのリポジトリで作業する際の前提情報・運用ルールをまとめたものです。

---

## プロジェクト概要

- **名前**: FlashMind
- **目的**: AI を活用した間隔反復学習（SRS）型の単語帳アプリ
- **状態**: 開発初期。v0 で生成した Next.js フロントエンドを起点に、これからバックエンドを追加し、最終的に iPhone アプリ化を目指す
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
| パッケージマネージャ | **pnpm**（npm / yarn は使わない） |

将来的な追加候補:
- バックエンド: Supabase または Next.js Route Handlers + Prisma
- AI: Anthropic Claude API（例文生成・解説）
- iOS 化: Capacitor（既存 Web を流用）

---

## ディレクトリ構成

```
app/                  # Next.js App Router (現状 page.tsx に全画面集約)
components/
  iphone-shell.tsx    # 開発時のプレビュー枠（iPhone 風フレーム）
  bottom-tabs.tsx
  screens/            # 画面コンポーネント (home/quiz/flashcard など)
  ui/                 # shadcn/ui — 基本いじらない
hooks/                # use-mobile, use-toast
lib/utils.ts          # cn 等の汎用ユーティリティ
public/               # 静的アセット
styles/               # 追加スタイル
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

2. **データはすべてモック**
   - 各 `components/screens/*.tsx` 内にハードコードされたデータがある（例: `home-screen.tsx` の `decks`）
   - バックエンド着手時は `lib/mock/` などに集約してから差し替えると差分が綺麗

3. **`next.config.mjs` で型エラーを無視している**
   - `typescript.ignoreBuildErrors: true`
   - 型エラーを潰したい場面では `pnpm typecheck` を別途実行する
   - バックエンド着手時に `false` へ戻したい

4. **`hooks/use-toast.ts` と `components/ui/use-toast.ts` が重複**
   - shadcn の生成都合。新規参照は `hooks/` を使う方針で統一

5. **iPhone シェルは"開発時の見た目用"**
   - `IPhoneShell` は固定サイズ (390x844) の枠を画面中央に表示するだけ
   - 実機 / 実ブラウザ向けには将来的に外す or 切り替え可能にする想定

6. **GitHub 未登録 / バックエンド未実装**
   - リモートはまだない（`git remote -v` で確認可）
   - 認証・永続化・SRS ロジック等はゼロから実装する

---

## 開発コマンド

```bash
pnpm install     # 依存関係インストール（npm/yarn は使わない）
pnpm dev         # 開発サーバー (http://localhost:3000)
pnpm build       # 本番ビルド
pnpm start       # 本番サーバー
pnpm lint        # Lint
pnpm typecheck   # 型チェックのみ (tsc --noEmit)
```

UI 変更を行ったら `pnpm typecheck` で型エラーがないことを確認するのが望ましい（ビルドでは握り潰されるため）。

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

## 作業時の方針（Claude へのお願い）

- **UI を変更したら、必ずブラウザで動作確認する**（`pnpm dev` で起動 → 画面遷移を実際に踏む）。型チェックの成功は動作の保証ではない。
- **モックデータと実装の境界を明確にする** — 将来のバックエンド差し替えを意識して、フェッチ層を関数で切り出しておくと後で楽。
- **新規ファイルは最小限に** — 既存ファイルを編集できるならそちらを優先。
- **コメントは控えめに** — 自明な what は書かず、why（なぜこの実装にしたか）が必要なときだけ書く。
- **不要な"親切"はしない** — 1 行の TODO で済むことを抽象化したり、想定されない入力へのバリデーションを足さない。
- **破壊的操作は確認を取る** — `git push -f`, `git reset --hard`, ファイル一括削除などの前に必ず確認。

---

## 今後の意思決定が必要なポイント

ここに書いてある項目は、まだ確定していないものです。ユーザーと相談した上で進めること。

- バックエンド選定（Supabase / 自前 Next.js API / Cloudflare）
- SRS アルゴリズム（SM-2 / FSRS / 自作）
- iOS 化のアプローチ（Capacitor / React Native への書き直し）
- 認証プロバイダ（メール / Google / Apple Sign In）
- AI 機能の範囲（例文生成のみ / 発音 / 個別の苦手分析 等）
- GitHub リポジトリの公開範囲（private / public）
- ライセンス（MIT / 独自 / 非公開）

---

## 関連ドキュメント

- [README.md](README.md) — プロジェクト概要・セットアップ・ロードマップ
- [components.json](components.json) — shadcn/ui の設定
- [next.config.mjs](next.config.mjs) — Next.js 設定
- [tsconfig.json](tsconfig.json) — TypeScript 設定
