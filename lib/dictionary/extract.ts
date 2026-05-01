// 取り込み済みテキストから「学習価値のありそうな英単語」候補を抽出する。
// 純関数で、辞書/DB アクセスは含まない（呼び出し側で組み合わせる）。

const STOPWORDS = new Set<string>([
  // 冠詞・代名詞・基本動詞・前置詞・接続詞など
  "the", "a", "an", "and", "or", "but", "if", "then", "than", "so", "as",
  "is", "are", "was", "were", "be", "been", "being", "am", "do", "does",
  "did", "have", "has", "had", "having", "of", "to", "for", "in", "on",
  "at", "by", "from", "with", "about", "into", "over", "under", "out",
  "up", "down", "off", "above", "below", "before", "after", "during",
  "this", "that", "these", "those", "it", "its", "i", "you", "he", "she",
  "we", "they", "him", "her", "them", "us", "me", "my", "your", "his",
  "our", "their", "mine", "yours", "hers", "ours", "theirs", "myself",
  "yourself", "himself", "herself", "itself", "ourselves", "themselves",
  "not", "no", "yes", "any", "all", "each", "every", "some", "such",
  "only", "own", "same", "very", "just", "more", "most", "less", "least",
  "can", "could", "will", "would", "shall", "should", "may", "might",
  "must", "ought", "let", "lets", "got", "get", "gets", "going", "go",
  "goes", "went", "gone", "make", "makes", "made", "making", "say",
  "says", "said", "saying", "see", "sees", "saw", "seen", "seeing",
  "know", "knows", "knew", "known", "knowing", "think", "thinks",
  "thought", "thinking", "look", "looks", "looked", "looking", "come",
  "comes", "came", "coming", "want", "wants", "wanted", "wanting",
  "use", "uses", "used", "using", "find", "finds", "found", "finding",
  "give", "gives", "gave", "given", "giving", "tell", "tells", "told",
  "telling", "ask", "asks", "asked", "asking", "work", "works", "worked",
  "working", "seem", "seems", "seemed", "feel", "feels", "felt", "try",
  "tries", "tried", "trying", "leave", "leaves", "left", "call", "calls",
  "called",
  "yeah", "ok", "okay", "right", "well", "now", "then", "here", "there",
  "where", "when", "what", "who", "whom", "whose", "which", "why", "how",
  "also", "too", "again", "still", "yet", "ever", "never", "always",
  "often", "sometimes", "usually", "really", "quite", "rather", "much",
  "many", "few", "little", "lot", "lots", "one", "two", "three", "four",
  "five", "six", "seven", "eight", "nine", "ten", "first", "second",
  "third", "next", "last", "new", "old", "good", "bad", "big", "small",
  "great", "long", "short", "high", "low", "best", "worst", "sure",
])

export type TokenCount = { word: string; count: number }

// 英単語トークンを抽出して頻度カウントを返す。
// - 3 文字以上のアルファベット連続のみ
// - lowercase 正規化
// - apostrophe (don't, it's など) は丸ごと削る前提でアルファベットのみ拾う
export function extractEnglishTokens(text: string): Map<string, number> {
  const counts = new Map<string, number>()
  if (!text) return counts
  const re = /[A-Za-z]{3,}/g
  let m: RegExpExecArray | null
  while ((m = re.exec(text)) !== null) {
    const w = m[0].toLowerCase()
    if (STOPWORDS.has(w)) continue
    counts.set(w, (counts.get(w) ?? 0) + 1)
  }
  return counts
}

export function sortedByCount(counts: Map<string, number>): TokenCount[] {
  return Array.from(counts, ([word, count]) => ({ word, count })).sort(
    (a, b) => b.count - a.count || a.word.localeCompare(b.word),
  )
}
