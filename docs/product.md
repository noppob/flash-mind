# FlashMind プロダクト仕様書

> このドキュメントは、現状のコード（Next.js フロントエンドのみ）から読み取れるプロダクト仕様をまとめたものです。
> セットアップ手順や開発ルールは [../README.md](../README.md) と [../CLAUDE.md](../CLAUDE.md) を参照してください。

---

## 1. プロダクト概要

**FlashMind** は AI 機能を組み合わせた **間隔反復学習（SRS: Spaced Repetition System）** 型の単語帳アプリです。学習者が外部ソース（PDF / Podcast / YouTube）から取り込んだ語彙や、公開デッキの語彙を、フラッシュカード・4 択クイズで反復しながら定着させることを目的としています。

- **形態**: モバイルファースト（iPhone 風シェルでラップした単一カラムの Web アプリ）
- **最終ターゲット**: iPhone アプリ化（**Capacitor** 想定）。Web 版はそこに到るまでの開発・検証フェーズの実装でもある
- **AI の役割**: カード編集時に **意味 / 語源 / 解説** を生成、インポート時に書き起こし / 翻訳 / 単語抽出（[card-edit-screen.tsx](../components/screens/card-edit-screen.tsx)、[import-screen.tsx](../components/screens/import-screen.tsx) で UI のみ実装済み）

---

## 2. 想定ユーザー / ユースケース

| ペルソナ | 主要ユースケース |
| --- | --- |
| 試験対策の学習者（TOEIC / 英検 / 資格） | 既製のデッキ（ホーム画面に出るもの・[explore-screen.tsx](../components/screens/explore-screen.tsx) の公開デッキ）を学習する |
| 自分の関心領域を伸ばしたい学習者 | Podcast / YouTube / PDF を取り込み、出てきた語彙からデッキを作る（[import-screen.tsx](../components/screens/import-screen.tsx)） |
| 苦手をつぶしたい人 | 苦手フラグ（`flagged`）と SRS の「復習待ち（dueToday）」をもとに集中復習する（[home-screen.tsx](../components/screens/home-screen.tsx) の AI おすすめ復習） |

UI 文言・モックデータが日本語ベースの英単語学習を想定しているため、当面は **日本語話者向けの英語語彙学習** が第一ターゲット。

---

## 3. 機能一覧（実装ステータス付き）

凡例: ✅ UI 実装済み（モック動作）　🟡 UI のみ・実データ非接続　❌ 未実装

| 機能 | ステータス | 主要画面 | 備考 |
| --- | :---: | --- | --- |
| ホームの今日のサマリー（連続日数 / 復習待ち / 習得率） | 🟡 | [home-screen.tsx](../components/screens/home-screen.tsx) | 数値はハードコード |
| デッキ一覧 / デッキ詳細 | 🟡 | [home-screen.tsx](../components/screens/home-screen.tsx) / [deck-detail-screen.tsx](../components/screens/deck-detail-screen.tsx) | デッキは静的配列 |
| カード一覧（検索 / 列切替 / 苦手フィルタ） | ✅ | [card-list-screen.tsx](../components/screens/card-list-screen.tsx) | 検索とフィルタはクライアント側で動作 |
| カード編集（単語 / 意味 / 例文 / 語源 / 解説 / 苦手フラグ） | 🟡 | [card-edit-screen.tsx](../components/screens/card-edit-screen.tsx) | 保存処理は未実装 |
| AI 生成（意味 / 語源 / 解説） | 🟡 | [card-edit-screen.tsx](../components/screens/card-edit-screen.tsx) | 1.5 秒の `setTimeout` で固定文字列を返すモック |
| フラッシュカード学習（フリップ / スワイプ / 表示切替 / メモ / お気に入り） | ✅ | [flashcard-screen.tsx](../components/screens/flashcard-screen.tsx) | カード詳細データはコード内 `WORDS` 配列 |
| 4 択クイズ | ✅ | [quiz-screen.tsx](../components/screens/quiz-screen.tsx) | 5 問固定 |
| 学習結果（正答率 / 習熟度の変化 / 苦手カード） | 🟡 | [results-screen.tsx](../components/screens/results-screen.tsx) | 学習結果と無関係な固定値 |
| 統計（連続日数 / 週間学習量 / デッキ別習得率 / 苦手 TOP5） | 🟡 | [stats-screen.tsx](../components/screens/stats-screen.tsx) | 全数値ハードコード |
| 公開デッキの探索 / カテゴリフィルタ / 検索 | ✅ | [explore-screen.tsx](../components/screens/explore-screen.tsx) | フィルタはクライアント動作。「追加」は未実装 |
| 外部ソース取込（PDF / Podcast / YouTube） | 🟡 | [import-screen.tsx](../components/screens/import-screen.tsx) | URL 入力 → 1.5 秒で固定トランスクリプトを表示するモック |
| 取込画面で単語タップ → 辞書プレビュー / 登録 | ✅ | [import-screen.tsx](../components/screens/import-screen.tsx) | 辞書は `mockMeanings` の手書きマップ |
| 設定（プロフィール / リマインダー / TTS / ダークモード / インポート / ログアウト） | 🟡 | [settings-screen.tsx](../components/screens/settings-screen.tsx) | ダークモードのトグルはローカル state のみで実反映なし |
| 認証（メール / Google / Apple Sign In） | ❌ | — | 画面・処理ともになし |
| データ永続化（DB / クラウド同期） | ❌ | — | バックエンド未着手 |
| SRS アルゴリズム本体 | ❌ | — | UI 上に「復習待ち」「EF」「習熟度」の数値があるだけ |
| プッシュ通知（学習リマインダー） | ❌ | — | iOS 化以降に検討 |

---

## 4. 用語集

| 用語 | 説明 |
| --- | --- |
| **デッキ** (`Deck`) | カードの集合。学習対象の単位（例: 「TOEIC 頻出 800 語」）。色とテンプレートを持つ |
| **カード** (`Card`) | 1 単語を表す学習単位。単語・発音・品詞・意味・例文・語源などを保持 |
| **テンプレート** | カードに含まれるフィールドの構成プリセット（コード上は文字列。「スタンダード」「英単語拡張」「詳細解説付き」が観測される） |
| **習熟度** (`mastery`) | カード単位の暗記度。`1` 未学習 / `2` 学習中 / `3` 復習中 / `4` ほぼ暗記 / `5` 完全暗記（[deck-detail-screen.tsx](../components/screens/deck-detail-screen.tsx#L17-L37) `getMasteryLabel` 参照） |
| **苦手フラグ** (`flagged`) | ユーザーが意図的に「苦手」とマークしたカード。一覧で絞り込みできる |
| **EF** (Ease Factor) | SRS で次回復習間隔を決める係数。[stats-screen.tsx](../components/screens/stats-screen.tsx) の苦手カードに `ef: 1.5` 等として表示。アルゴリズム本体は **TBD** |
| **dueToday / 復習待ち** | 今日復習対象になっているカード数。デッキ単位（[home-screen.tsx](../components/screens/home-screen.tsx)）と全体合計の両方で表示 |
| **連続日数** (`streak`) | 連続学習日数。ホームと統計で表示 |
| **公開デッキ** (`PublicDeck`) | [explore-screen.tsx](../components/screens/explore-screen.tsx) で配信される、著者・DL 数・評価を持つデッキ |
| **トランスクリプト** | インポート時に表示される、外部ソースの書き起こしテキスト。タイムスタンプ付き行の配列 |

---

## 5. 技術スタック

詳細は [../CLAUDE.md](../CLAUDE.md) と [../package.json](../package.json) を参照。

| 領域 | 技術 |
| --- | --- |
| フレームワーク | Next.js 16.1.6（App Router、RSC 有効） |
| 言語 | TypeScript 5.7（`strict: true`、ただし `next.config.mjs` でビルド時の型エラーは握り潰し） |
| UI | React 19 / Tailwind CSS 3.4 / shadcn/ui（Radix UI ベース） |
| アイコン | lucide-react |
| フォーム | react-hook-form + zod |
| グラフ | recharts（依存に含まれるが、現状の画面コードでは未使用。統計画面は素の Tailwind バーで描画） |
| 日付 | date-fns |
| パッケージマネージャ | **pnpm**（npm / yarn は使わない） |
| フォント | Inter + Noto Sans JP |
| テーマトークン | HSL ベースの CSS 変数（[../app/globals.css](../app/globals.css)） |

将来導入候補:
- バックエンド: Supabase / Next.js Route Handlers + Prisma / Cloudflare Workers + D1（**TBD**）
- AI: Anthropic Claude API（例文 / 語源 / 解説の生成、書き起こし）
- iOS: Capacitor

---

## 6. 現状ステータス（2026-04-30 時点）

- 画面遷移は [../app/page.tsx](../app/page.tsx) の `Screen` ローカル state による **擬似ルーティング**。App Router の segment には分割されていない
- データはすべて各画面のファイル内に **ハードコードされたモック**
- バックエンド・認証・永続化・SRS ロジックは **未着手**
- GitHub リモート未登録（`git remote -v` で確認可）
- `next.config.mjs` で `typescript.ignoreBuildErrors: true` のため、ビルドが型エラーを通す。型整合は `pnpm typecheck` で別途確認する運用

---

## 7. 関連ドキュメント

- **[screens.md](./screens.md)** — 11 画面の構成・props・state・遷移図
- **[data-model.md](./data-model.md)** — エンティティ定義・ER 図・DB スキーマ案

未確定の意思決定（バックエンド方式 / SRS アルゴリズム / 認証 / AI 統合範囲 / iOS 化方針 / ライセンス）は [data-model.md の TBD セクション](./data-model.md#10-未確定事項tbd) に集約しています。
