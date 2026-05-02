/* eslint-disable no-console */
import { Prisma } from "@prisma/client"
import bcrypt from "bcryptjs"
import { createPrismaClient } from "../lib/prisma"

const prisma = createPrismaClient()

const FLASHCARD_DETAILS = [
  {
    word: "premium",
    pronunciation: "/ˈpriːmiəm/",
    pos: "名",
    meaning: "保険料",
    category: "ビジネス問題",
    example: "I paid over $3,000 in annual life insurance premiums.",
    exampleHighlight: "premiums",
    exampleJa: "私は年間の生命保険の保険料に3000ドル以上を払った",
    etymology:
      "ラテン語 praemium（報酬、戦利品）が語源。pre-（前に）+ emere（買う）で「先に買い取るもの」→「割増金・保険料」",
    mnemonic: "「プレミアム」なビールは価格が割増されている→割増金・保険料",
    rootImage:
      "「pre-（前に）+ emere（買う）」→ 事前に支払うお金。「先払い」が根本イメージ。",
    explanation: "ビジネス文脈で「保険料・割増金」、形容詞では「高級な」",
    flagged: false,
    definitions: [
      { pos: "名", items: ["保険料", "割増金、プレミアム", "ハイオクガソリン"] },
      { pos: "形", items: ["高級な", "プレミアムのついた"] },
    ],
    phrases: [
      { en: "car insurance premiums", ja: "自動車保険の保険料" },
      { en: "at a premium", ja: "プレミアつきで、額面以上で；品不足で" },
      { en: "premium quality", ja: "最高品質の" },
    ],
    relatedWords: [
      { word: "premium", pos: "名/形" },
      { word: "premiere", pos: "名" },
      { word: "preempt", pos: "動" },
    ],
    otherPos: [{ pos: "形", meaning: "高級な、プレミアムのついた" }],
    confusables: [
      { word: "premier", meaning: "首相、第一の", why: "スペルが似ている" },
    ],
  },
  {
    word: "comprehensive",
    pronunciation: "/ˌkɒmprɪˈhensɪv/",
    pos: "形",
    meaning: "包括的な",
    category: "ビジネス問題",
    example: "We need a comprehensive analysis of the market.",
    exampleHighlight: "comprehensive",
    exampleJa: "市場の包括的な分析が必要だ",
    etymology: "com-（共に）+ prehendere（つかむ）→「全てをつかむ」",
    mnemonic: "「コンプリ」を全部「ヘン」で「シブ」っとつかむ→包括的",
    rootImage: "「com-（全て）+ prehend（つかむ）」→ 全てをつかみ取る。",
    explanation: "全てを含む",
    flagged: false,
    definitions: [{ pos: "形", items: ["包括的な", "総合的な", "理解力のある"] }],
    phrases: [
      { en: "comprehensive insurance", ja: "総合保険" },
      { en: "comprehensive review", ja: "包括的なレビュー" },
    ],
    relatedWords: [
      { word: "comprehend", pos: "動" },
      { word: "apprehend", pos: "動" },
    ],
    otherPos: [],
    confusables: [{ word: "comprise", meaning: "構成する", why: "「comp-」が共通" }],
  },
  {
    word: "deteriorate",
    pronunciation: "/dɪˈtɪəriəreɪt/",
    pos: "動",
    meaning: "悪化する",
    category: "ビジネス問題",
    example: "The patient's condition began to deteriorate rapidly.",
    exampleHighlight: "deteriorate",
    exampleJa: "患者の容態は急速に悪化し始めた",
    etymology: "de-（下に）+ terior（より悪い）→「より悪い方へ」",
    mnemonic: "「デテ」が「リオ」の「レート」を下げる→悪化",
    rootImage: "「de-（下へ）+ terior（悪い）」→ 下に悪くなる。",
    explanation: "状態が悪くなる",
    flagged: true,
    definitions: [{ pos: "動", items: ["悪化する", "劣化する", "衰退する"] }],
    phrases: [
      { en: "deteriorate rapidly", ja: "急速に悪化する" },
      { en: "health deteriorated", ja: "健康が悪化した" },
    ],
    relatedWords: [
      { word: "deter", pos: "動" },
      { word: "determination", pos: "名" },
    ],
    otherPos: [{ pos: "名", meaning: "deterioration（悪化）" }],
    confusables: [{ word: "determine", meaning: "決定する", why: "「deter-」が共通" }],
  },
] as const

const CARD_LIST_BASICS = [
  {
    word: "unprecedented",
    meaning: "前例のない",
    example: "an unprecedented crisis",
    explanation: "前例が全くないこと",
    mastery: 4,
    flagged: true,
  },
  {
    word: "substantial",
    meaning: "かなりの",
    example: "a substantial increase",
    explanation: "量が多い",
    mastery: 5,
    flagged: false,
  },
  {
    word: "acquire",
    meaning: "取得する",
    example: "acquire skills",
    explanation: "手に入れる",
    mastery: 2,
    flagged: false,
  },
  {
    word: "implement",
    meaning: "実装する",
    example: "implement a plan",
    explanation: "実行する",
    mastery: 4,
    flagged: false,
  },
  {
    word: "ambiguous",
    meaning: "曖昧な",
    example: "an ambiguous answer",
    explanation: "はっきりしない",
    mastery: 1,
    flagged: true,
  },
  {
    word: "profound",
    meaning: "深い",
    example: "a profound impact",
    explanation: "非常に深い",
    mastery: 3,
    flagged: false,
  },
  {
    word: "eloquent",
    meaning: "雄弁な",
    example: "an eloquent speech",
    explanation: "話がうまい",
    mastery: 2,
    flagged: false,
  },
  {
    word: "pragmatic",
    meaning: "実用的な",
    example: "a pragmatic approach",
    explanation: "現実的な",
    mastery: 3,
    flagged: false,
  },
] as const

const DECKS = [
  { name: "TOEIC 頻出 800語", template: "スタンダード", color: "bg-blue-500" },
  { name: "英検準1級", template: "英単語拡張", color: "bg-emerald-500" },
  { name: "経済用語 基礎", template: "詳細解説付き", color: "bg-amber-500" },
  { name: "IT用語辞典", template: "詳細解説付き", color: "bg-rose-500" },
] as const

const PUBLIC_DECK_CARDS: Record<
  string,
  ReadonlyArray<{
    word: string
    meaning: string
    example?: string
    explanation?: string
  }>
> = {
  "TOEIC 900点突破 必須単語": [
    { word: "comprehensive", meaning: "包括的な", example: "a comprehensive review" },
    { word: "substantial", meaning: "かなりの", example: "a substantial increase" },
    { word: "subsequent", meaning: "その後の", example: "subsequent meetings" },
    { word: "preliminary", meaning: "予備の、暫定的な", example: "a preliminary report" },
    { word: "forecast", meaning: "予測する／予測", example: "the sales forecast" },
    { word: "allocate", meaning: "割り当てる", example: "allocate resources" },
    { word: "diversify", meaning: "多様化する", example: "diversify the portfolio" },
    { word: "procurement", meaning: "調達", example: "procurement department" },
    { word: "compliance", meaning: "順守", example: "regulatory compliance" },
    { word: "quarterly", meaning: "四半期ごとの", example: "quarterly earnings" },
  ],
  "英検1級 語彙完全攻略": [
    { word: "ubiquitous", meaning: "どこにでもある、遍在する" },
    { word: "nefarious", meaning: "極悪な、ひどく邪悪な" },
    { word: "ephemeral", meaning: "つかの間の、はかない" },
    { word: "pernicious", meaning: "有害な、致命的な" },
    { word: "dichotomy", meaning: "二分法、二項対立" },
    { word: "esoteric", meaning: "難解な、秘伝の" },
    { word: "ostensible", meaning: "表面上の、見せかけの" },
    { word: "vicissitude", meaning: "移り変わり、変遷" },
    { word: "truculent", meaning: "粗暴な、攻撃的な" },
    { word: "magnanimous", meaning: "寛大な、度量の大きい" },
  ],
  "基本情報技術者 用語集": [
    { word: "algorithm", meaning: "アルゴリズム、解法手順" },
    { word: "compiler", meaning: "コンパイラ" },
    { word: "recursion", meaning: "再帰" },
    { word: "inheritance", meaning: "継承（OOP）" },
    { word: "polymorphism", meaning: "多態性、ポリモーフィズム" },
    { word: "abstraction", meaning: "抽象化" },
    { word: "middleware", meaning: "ミドルウェア" },
    { word: "normalization", meaning: "正規化" },
    { word: "redundancy", meaning: "冗長性" },
    { word: "throughput", meaning: "スループット、処理能力" },
  ],
  "マクロ経済学 基礎用語": [
    { word: "inflation", meaning: "インフレーション、物価上昇" },
    { word: "deflation", meaning: "デフレーション、物価下落" },
    { word: "recession", meaning: "景気後退" },
    { word: "aggregate demand", meaning: "総需要" },
    { word: "fiscal policy", meaning: "財政政策" },
    { word: "monetary policy", meaning: "金融政策" },
    { word: "gross domestic product", meaning: "国内総生産（GDP）" },
    { word: "elasticity", meaning: "弾力性、弾性" },
    { word: "equilibrium", meaning: "均衡、平衡" },
    { word: "liquidity", meaning: "流動性" },
  ],
  "ビジネス英語 頻出フレーズ 200": [
    { word: "circle back", meaning: "後で戻る、改めて連絡する" },
    { word: "touch base", meaning: "連絡を取る、近況を共有する" },
    { word: "align", meaning: "足並みを揃える、合わせる" },
    { word: "streamline", meaning: "効率化する" },
    { word: "leverage", meaning: "活用する、てこ入れする" },
    { word: "bandwidth", meaning: "余力、対応キャパ" },
    { word: "deliverable", meaning: "成果物" },
    { word: "stakeholder", meaning: "関係者、利害関係者" },
    { word: "synergy", meaning: "相乗効果、シナジー" },
    { word: "onboarding", meaning: "新規受け入れ、オンボーディング" },
  ],
  "医学用語 基礎 400": [
    { word: "diagnosis", meaning: "診断" },
    { word: "prognosis", meaning: "予後" },
    { word: "chronic", meaning: "慢性の" },
    { word: "acute", meaning: "急性の" },
    { word: "benign", meaning: "良性の" },
    { word: "malignant", meaning: "悪性の" },
    { word: "inflammation", meaning: "炎症" },
    { word: "pathology", meaning: "病理（学）" },
    { word: "symptom", meaning: "症状" },
    { word: "remission", meaning: "寛解" },
  ],
}

const PUBLIC_DECKS = [
  {
    name: "TOEIC 900点突破 必須単語",
    author: "StudyMaster",
    totalCards: 500,
    downloads: 12400,
    rating: 4.8,
    category: "英語",
  },
  {
    name: "英検1級 語彙完全攻略",
    author: "EikenPro",
    totalCards: 1200,
    downloads: 8700,
    rating: 4.7,
    category: "英語",
  },
  {
    name: "基本情報技術者 用語集",
    author: "IT_tanaka",
    totalCards: 350,
    downloads: 5200,
    rating: 4.6,
    category: "IT",
  },
  {
    name: "マクロ経済学 基礎用語",
    author: "EconStudy",
    totalCards: 180,
    downloads: 3100,
    rating: 4.5,
    category: "ビジネス",
  },
  {
    name: "ビジネス英語 頻出フレーズ 200",
    author: "BizEnglish",
    totalCards: 200,
    downloads: 9800,
    rating: 4.9,
    category: "英語",
  },
  {
    name: "医学用語 基礎 400",
    author: "MedStudent22",
    totalCards: 400,
    downloads: 4300,
    rating: 4.4,
    category: "医学",
  },
] as const

const DAY_MS = 86_400_000

function masteryToSrs(mastery: number): {
  easeFactor: number
  intervalDays: number
  repetitions: number
} {
  switch (mastery) {
    case 5:
      return { easeFactor: 2.7, intervalDays: 30, repetitions: 5 }
    case 4:
      return { easeFactor: 2.5, intervalDays: 14, repetitions: 4 }
    case 3:
      return { easeFactor: 2.3, intervalDays: 6, repetitions: 3 }
    case 2:
      return { easeFactor: 2.4, intervalDays: 1, repetitions: 1 }
    default:
      return { easeFactor: 2.5, intervalDays: 0, repetitions: 0 }
  }
}

async function main() {
  console.log("Cleaning database…")
  await prisma.reviewLog.deleteMany({})
  await prisma.cardSrsState.deleteMany({})
  await prisma.memo.deleteMany({})
  await prisma.importedWord.deleteMany({})
  await prisma.importedContent.deleteMany({})
  await prisma.card.deleteMany({})
  await prisma.deck.deleteMany({})
  await prisma.session.deleteMany({})
  await prisma.account.deleteMany({})
  await prisma.user.deleteMany({})
  await prisma.publicDeck.deleteMany({})

  console.log("Creating user…")
  const passwordHash = await bcrypt.hash("password123", 10)
  const user = await prisma.user.create({
    data: {
      email: "tanaka@email.com",
      passwordHash,
      displayName: "Tanaka Yuki",
      plan: "premium",
      darkMode: false,
      ttsLanguage: "en-US",
      reminderTime: "08:00",
      cloudSyncEnabled: true,
    },
  })

  console.log("Creating decks…")
  const decks = await Promise.all(
    DECKS.map((d) =>
      prisma.deck.create({
        data: { ...d, userId: user.id },
      }),
    ),
  )
  const toeicDeck = decks[0]

  console.log("Creating cards…")
  const createdCards: { id: string; mastery: number }[] = []

  for (const c of FLASHCARD_DETAILS) {
    const card = await prisma.card.create({
      data: {
        deckId: toeicDeck.id,
        word: c.word,
        pronunciation: c.pronunciation,
        pos: c.pos,
        meaning: c.meaning,
        category: c.category,
        example: c.example,
        exampleHighlight: c.exampleHighlight,
        exampleJa: c.exampleJa,
        etymology: c.etymology,
        mnemonic: c.mnemonic,
        rootImage: c.rootImage,
        explanation: c.explanation,
        flagged: c.flagged,
        definitions: c.definitions as Prisma.InputJsonValue,
        phrases: c.phrases as Prisma.InputJsonValue,
        relatedWords: c.relatedWords as Prisma.InputJsonValue,
        otherPos: c.otherPos as Prisma.InputJsonValue,
        confusables: c.confusables as Prisma.InputJsonValue,
      },
    })
    createdCards.push({
      id: card.id,
      mastery: c.word === "deteriorate" ? 1 : c.word === "comprehensive" ? 3 : 2,
    })
  }

  for (const c of CARD_LIST_BASICS) {
    const card = await prisma.card.create({
      data: {
        deckId: toeicDeck.id,
        word: c.word,
        meaning: c.meaning,
        example: c.example,
        explanation: c.explanation,
        flagged: c.flagged,
      },
    })
    createdCards.push({ id: card.id, mastery: c.mastery })
  }

  console.log("Initialising SRS states…")
  const now = new Date()
  for (const c of createdCards) {
    const srs = masteryToSrs(c.mastery)
    // Stagger nextReviewAt: lower mastery → due now/today, higher mastery → due later
    const offsetDays = c.mastery <= 2 ? -1 : c.mastery === 3 ? 0 : c.mastery === 4 ? 2 : 7
    const nextReviewAt = new Date(now.getTime() + offsetDays * DAY_MS)
    await prisma.cardSrsState.create({
      data: {
        cardId: c.id,
        userId: user.id,
        easeFactor: srs.easeFactor,
        intervalDays: srs.intervalDays,
        repetitions: srs.repetitions,
        reviewsTotal: srs.repetitions + 2,
        nextReviewAt,
        mastery: c.mastery,
      },
    })
  }

  console.log("Creating review history (last 7 days)…")
  const reviewLogs: Awaited<ReturnType<typeof prisma.reviewLog.create>>[] = []
  for (let dayOffset = 6; dayOffset >= 0; dayOffset--) {
    const dayStart = new Date(now.getTime() - dayOffset * DAY_MS)
    dayStart.setHours(20, 0, 0, 0)
    const cardsThisDay = 25 + Math.floor(Math.random() * 20)
    for (let i = 0; i < cardsThisDay; i++) {
      const target = createdCards[Math.floor(Math.random() * createdCards.length)]
      const correct = Math.random() > (target.mastery <= 2 ? 0.4 : 0.2)
      const rating = correct ? 5 : 2
      const masteryBefore = target.mastery
      const masteryAfter = correct
        ? Math.min(5, masteryBefore + (Math.random() > 0.7 ? 1 : 0))
        : Math.max(1, masteryBefore - 1)
      const log = await prisma.reviewLog.create({
        data: {
          userId: user.id,
          cardId: target.id,
          mode: Math.random() > 0.5 ? "quiz" : "flashcard",
          rating,
          correct,
          masteryBefore,
          masteryAfter,
          reviewedAt: new Date(dayStart.getTime() + Math.random() * 60 * 60 * 1000),
        },
      })
      reviewLogs.push(log)
    }
  }
  console.log(`  → ${reviewLogs.length} review logs`)

  console.log("Creating public decks…")
  for (const pd of PUBLIC_DECKS) {
    const cards = PUBLIC_DECK_CARDS[pd.name] ?? []
    await prisma.publicDeck.create({
      data: {
        ...pd,
        description: `${pd.author} による${pd.category}デッキ。${pd.totalCards}枚収録（うち${cards.length}枚をサンプル収録）。`,
        cards: cards as unknown as Prisma.InputJsonValue,
      },
    })
  }

  console.log("Done.")
  console.log(`  user:        ${user.email}`)
  console.log(`  decks:       ${decks.length}`)
  console.log(`  cards:       ${createdCards.length}`)
  console.log(`  reviewLogs:  ${reviewLogs.length}`)
  console.log(`  publicDecks: ${PUBLIC_DECKS.length}`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
