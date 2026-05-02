# Postgres スキーマ保管

2026-05-02 に Turso (SQLite/libSQL) へ移行する前まで、Neon / Supabase で運用していた際の Postgres 用スキーマとマイグレーション履歴を保管している。**現在のアプリは参照しない**（Prisma も認識しない場所）。

## 将来 Postgres に戻したい場合

1. `prisma/postgres/schema.prisma` を `prisma/schema.prisma` にコピー（上書き）
2. `prisma/schema.prisma` の generator から `previewFeatures = ["driverAdapters"]` を削除
3. 現在の `prisma/migrations/` を退避し、`prisma/postgres/migrations/` を `prisma/migrations/` にコピー
4. `lib/prisma.ts` の Driver Adapter 関連コードを除去（`new PrismaClient()` に戻す）
5. `pnpm remove @libsql/client @prisma/adapter-libsql`
6. `.env` の `DATABASE_URL` / `DIRECT_URL` を Postgres URL に設定
7. `pnpm db:generate && pnpm db:deploy`

## なぜ移行したか

- Vercel デプロイ時に Neon (シンガポール) のレイテンシが大きく不満
- Supabase 東京に切り替えたが、Free Tier 500MB に英辞郎辞書 (~1.5GB) が入らず DB クラッシュ
- Turso は 9GB 無料・東京リージョン対応・Driver Adapter で Prisma そのまま動く
