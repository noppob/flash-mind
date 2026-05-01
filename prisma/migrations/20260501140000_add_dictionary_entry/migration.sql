-- Enable pg_trgm for similarity / partial match search on headwords.
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- CreateTable
CREATE TABLE "DictionaryEntry" (
    "id" SERIAL NOT NULL,
    "headword" TEXT NOT NULL,
    "headwordLower" TEXT NOT NULL,
    "pos" TEXT,
    "definition" TEXT NOT NULL,
    "note" TEXT,
    "aliasOf" TEXT,
    "raw" TEXT NOT NULL,

    CONSTRAINT "DictionaryEntry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DictionaryEntry_headwordLower_idx" ON "DictionaryEntry"("headwordLower");

-- CreateIndex
CREATE INDEX "DictionaryEntry_headword_idx" ON "DictionaryEntry"("headword");

-- Trigram GIN index to power partial / similarity search via the % operator.
CREATE INDEX "DictionaryEntry_headwordLower_trgm_idx"
    ON "DictionaryEntry" USING GIN ("headwordLower" gin_trgm_ops);
