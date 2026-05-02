-- CreateTable
CREATE TABLE "DictionaryEntry" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "headword" TEXT NOT NULL,
    "headwordLower" TEXT NOT NULL,
    "pos" TEXT,
    "definition" TEXT NOT NULL,
    "note" TEXT,
    "aliasOf" TEXT,
    "raw" TEXT NOT NULL
);

-- CreateIndex
CREATE INDEX "DictionaryEntry_headwordLower_idx" ON "DictionaryEntry"("headwordLower");

-- CreateIndex
CREATE INDEX "DictionaryEntry_headword_idx" ON "DictionaryEntry"("headword");
