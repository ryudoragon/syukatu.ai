import { createContext, useContext, useState, useEffect } from 'react'

const DataContext = createContext()

const initialCompanies = [
  {
    id: '1',
    name: '株式会社リクルート',
    industry: '人材',
    status: 'ES提出済',
    priority: 5,
    image: 'https://picsum.photos/seed/recruit/400/300',
    url: 'https://www.recruit.co.jp/',
    myPageId: '',
    myPagePassword: '',
    selectionFlow: '書類選考 → 一次面接 → 二次面接 → 最終面接',
    currentStatus: 'ES提出済',
    nextSelectionDate: '2025-11-01',
    esDeadline: '2025-10-25',
    webTestType: 'SPI',
    memo: '人材業界のリーディングカンパニー',
    tasks: [],
    analysis: {},
    essays: [],
    interviews: [],
  },
  {
    id: '2',
    name: '株式会社サイバーエージェント',
    industry: 'IT・広告',
    status: '一次面接通過',
    priority: 4,
    image: 'https://picsum.photos/seed/cyber/400/300',
    url: 'https://www.cyberagent.co.jp/',
    myPageId: '',
    myPagePassword: '',
    selectionFlow: '書類選考 → 一次面接 → 二次面接 → 最終面接',
    currentStatus: '一次面接通過',
    nextSelectionDate: '2025-11-05',
    esDeadline: '',
    webTestType: '玉手箱',
    memo: 'インターネット広告とゲーム事業',
    tasks: [],
    analysis: {},
    essays: [],
    interviews: [],
  },
  {
    id: '3',
    name: '株式会社三菱UFJ銀行',
    industry: '金融',
    status: '企業研究中',
    priority: 3,
    image: 'https://picsum.photos/seed/mufg/400/300',
    url: 'https://www.bk.mufg.jp/',
    myPageId: '',
    myPagePassword: '',
    selectionFlow: 'ES → Webテスト → GD → 面接複数回',
    currentStatus: '企業研究中',
    nextSelectionDate: '',
    esDeadline: '2025-11-10',
    webTestType: 'TG-WEB',
    memo: 'メガバンク、安定性重視',
    tasks: [],
    analysis: {},
    essays: [],
    interviews: [],
  },
  {
    id: '4',
    name: '株式会社トヨタ自動車',
    industry: '自動車',
    status: 'エントリー前',
    priority: 4,
    image: 'https://picsum.photos/seed/toyota/400/300',
    url: 'https://global.toyota/',
    myPageId: '',
    myPagePassword: '',
    selectionFlow: 'ES → 適性検査 → 面接3回',
    currentStatus: 'エントリー前',
    nextSelectionDate: '',
    esDeadline: '2025-11-15',
    webTestType: 'SPI',
    memo: '世界的自動車メーカー',
    tasks: [],
    analysis: {},
    essays: [],
    interviews: [],
  },
  {
    id: '5',
    name: '株式会社資生堂',
    industry: '化粧品',
    status: 'ES作成中',
    priority: 5,
    image: 'https://picsum.photos/seed/shiseido/400/300',
    url: 'https://www.shiseido.co.jp/',
    myPageId: '',
    myPagePassword: '',
    selectionFlow: 'ES → Webテスト → 面接3回',
    currentStatus: 'ES作成中',
    nextSelectionDate: '',
    esDeadline: '2025-10-30',
    webTestType: 'GAB',
    memo: 'グローバル化粧品企業',
    tasks: [],
    analysis: {},
    essays: [],
    interviews: [],
  },
  {
    id: '6',
    name: '株式会社キーエンス',
    industry: '電子機器',
    status: '企業研究中',
    priority: 4,
    image: 'https://picsum.photos/seed/keyence/400/300',
    url: 'https://www.keyence.co.jp/',
    myPageId: '',
    myPagePassword: '',
    selectionFlow: 'ES → 筆記試験 → 面接5回',
    currentStatus: '企業研究中',
    nextSelectionDate: '',
    esDeadline: '2025-11-20',
    webTestType: '独自試験',
    memo: '高年収で知られるセンサーメーカー',
    tasks: [],
    analysis: {},
    essays: [],
    interviews: [],
  },
  {
    id: '7',
    name: '株式会社電通',
    industry: '広告',
    status: 'エントリー前',
    priority: 3,
    image: 'https://picsum.photos/seed/dentsu/400/300',
    url: 'https://www.dentsu.co.jp/',
    myPageId: '',
    myPagePassword: '',
    selectionFlow: 'ES → Webテスト → GD → 面接',
    currentStatus: 'エントリー前',
    nextSelectionDate: '',
    esDeadline: '2025-11-12',
    webTestType: 'SPI',
    memo: '国内最大手広告代理店',
    tasks: [],
    analysis: {},
    essays: [],
    interviews: [],
  },
  {
    id: '8',
    name: 'ソニーグループ株式会社',
    industry: '電機',
    status: '企業研究中',
    priority: 4,
    image: 'https://picsum.photos/seed/sony/400/300',
    url: 'https://www.sony.com/ja/',
    myPageId: '',
    myPagePassword: '',
    selectionFlow: 'ES → 適性検査 → 面接3回',
    currentStatus: '企業研究中',
    nextSelectionDate: '',
    esDeadline: '2025-11-08',
    webTestType: 'SPI',
    memo: 'エンタメとエレクトロニクスの融合',
    tasks: [],
    analysis: {},
    essays: [],
    interviews: [],
  },
  {
    id: '9',
    name: '楽天グループ株式会社',
    industry: 'IT・EC',
    status: 'エントリー前',
    priority: 3,
    image: 'https://picsum.photos/seed/rakuten/400/300',
    url: 'https://corp.rakuten.co.jp/',
    myPageId: '',
    myPagePassword: '',
    selectionFlow: 'ES → Webテスト → 面接複数回',
    currentStatus: 'エントリー前',
    nextSelectionDate: '',
    esDeadline: '2025-11-18',
    webTestType: '玉手箱',
    memo: 'ECとフィンテックの複合企業',
    tasks: [],
    analysis: {},
    essays: [],
    interviews: [],
  },
  {
    id: '10',
    name: 'アクセンチュア株式会社',
    industry: 'コンサル',
    status: '企業研究中',
    priority: 5,
    image: 'https://picsum.photos/seed/accenture/400/300',
    url: 'https://www.accenture.com/jp-ja',
    myPageId: '',
    myPagePassword: '',
    selectionFlow: 'ES → Webテスト → ケース面接 → 最終面接',
    currentStatus: '企業研究中',
    nextSelectionDate: '',
    esDeadline: '2025-11-05',
    webTestType: 'TG-WEB',
    memo: '世界最大級の総合コンサルティング企業',
    tasks: [],
    analysis: {},
    essays: [],
    interviews: [],
  },
]

const initialRoadmapItems = [
  {
    id: '1',
    title: '自己分析',
    period: '3月〜4月',
    category: '自己理解',
    description: '自分の強み・価値観を整理',
    details: '過去の経験を振り返り、自分の強みや価値観を明確にする。モチベーショングラフを作成し、自己PRの軸を定める。',
  },
  {
    id: '2',
    title: '業界研究',
    period: '4月〜5月',
    category: '業界',
    description: '興味ある業界の企業比較を行う',
    details: '各業界の特徴、ビジネスモデル、将来性を調査。企業ごとの強み・弱みを比較し、志望業界を絞り込む。',
  },
  {
    id: '3',
    title: 'サマーインターンES作成',
    period: '5月〜6月',
    category: 'ES',
    description: '締切に合わせてESを書いて提出',
    details: '各企業の設問に合わせたESを作成。自己PRと志望動機を軸に、具体的なエピソードを盛り込む。',
  },
  {
    id: '4',
    title: '面接対策',
    period: '7月〜8月',
    category: '面接',
    description: '過去質問リストを整理し練習',
    details: '想定質問に対する回答を準備。模擬面接を繰り返し、話し方や表情も改善する。',
  },
  {
    id: '5',
    title: '内定承諾',
    period: '10月〜11月',
    category: '内定',
    description: '複数内定時の意思決定・承諾連絡',
    details: '各社の条件を比較検討し、自分のキャリアプランに最も合致する企業を選択。承諾の連絡を行う。',
  },
]

export function DataProvider({ children }) {
  const [companies, setCompanies] = useState(() => {
    const saved = localStorage.getItem('companies')
    if (saved) {
      return JSON.parse(saved)
    }
    // Initialize with dummy data
    localStorage.setItem('companies', JSON.stringify(initialCompanies))
    return initialCompanies
  })

  const [roadmapItems, setRoadmapItems] = useState(() => {
    const saved = localStorage.getItem('roadmapItems')
    if (saved) {
      return JSON.parse(saved)
    }
    // Initialize with dummy data
    localStorage.setItem('roadmapItems', JSON.stringify(initialRoadmapItems))
    return initialRoadmapItems
  })

  useEffect(() => {
    localStorage.setItem('companies', JSON.stringify(companies))
  }, [companies])

  useEffect(() => {
    localStorage.setItem('roadmapItems', JSON.stringify(roadmapItems))
  }, [roadmapItems])

  const addCompany = (company) => {
    const newCompany = {
      ...company,
      id: Date.now().toString(),
      tasks: [],
      analysis: {},
      essays: [],
      interviews: [],
    }
    setCompanies([...companies, newCompany])
  }

  const updateCompany = (id, updates) => {
    setCompanies(companies.map((c) => (c.id === id ? { ...c, ...updates } : c)))
  }

  const deleteCompany = (id) => {
    setCompanies(companies.filter((c) => c.id !== id))
  }

  const getCompanyById = (id) => {
    return companies.find((c) => c.id === id)
  }

  const addRoadmapItem = (item) => {
    const newItem = {
      ...item,
      id: Date.now().toString(),
    }
    setRoadmapItems([...roadmapItems, newItem])
  }

  const updateRoadmapItem = (id, updates) => {
    setRoadmapItems(roadmapItems.map((item) => (item.id === id ? { ...item, ...updates } : item)))
  }

  const deleteRoadmapItem = (id) => {
    setRoadmapItems(roadmapItems.filter((item) => item.id !== id))
  }

  return (
    <DataContext.Provider
      value={{
        companies,
        addCompany,
        updateCompany,
        deleteCompany,
        getCompanyById,
        roadmapItems,
        addRoadmapItem,
        updateRoadmapItem,
        deleteRoadmapItem,
      }}
    >
      {children}
    </DataContext.Provider>
  )
}

export function useData() {
  const context = useContext(DataContext)
  if (!context) {
    throw new Error('useData must be used within DataProvider')
  }
  return context
}

