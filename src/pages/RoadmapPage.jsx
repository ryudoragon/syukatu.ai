import { useState } from 'react'
import { useData } from '../contexts/DataContext'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'

export default function RoadmapPage() {
  const { roadmapItems } = useData()
  const [expandedId, setExpandedId] = useState(null)
  const [filterCategory, setFilterCategory] = useState('all')
  const [sortBy, setSortBy] = useState('period')

  const categories = [...new Set(roadmapItems.map((item) => item.category))]

  const filteredItems = roadmapItems
    .filter((item) => filterCategory === 'all' || item.category === filterCategory)
    .sort((a, b) => {
      if (sortBy === 'period') {
        return a.period.localeCompare(b.period)
      }
      return a.category.localeCompare(b.category)
    })

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id)
  }

  const getCategoryColor = (category) => {
    const colors = {
      '自己理解': 'bg-blue-500',
      '業界': 'bg-green-500',
      'ES': 'bg-yellow-500',
      '面接': 'bg-purple-500',
      '内定': 'bg-red-500',
    }
    return colors[category] || 'bg-gray-500'
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">選考ロードマップ</h1>

        {/* Filters */}
        <div className="flex gap-4 mb-6">
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="カテゴリ" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">すべて</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="並び替え" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="period">期間順</SelectItem>
              <SelectItem value="category">カテゴリ順</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Timeline */}
        <div className="relative">
          {/* Vertical Line */}
          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border"></div>

          {/* Items */}
          <div className="space-y-8">
            {filteredItems.map((item, index) => (
              <div key={item.id} className="relative pl-12">
                {/* Dot */}
                <div
                  className={`absolute left-2 top-2 w-4 h-4 rounded-full ${getCategoryColor(
                    item.category
                  )}`}
                ></div>

                {/* Card */}
                <Card
                  className="cursor-pointer hover:shadow-lg transition-all"
                  onClick={() => toggleExpand(item.id)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="secondary">{item.period}</Badge>
                          <Badge variant="outline">{item.category}</Badge>
                        </div>
                        <CardTitle className="text-xl">{item.title}</CardTitle>
                      </div>
                      {expandedId === item.id ? (
                        <ChevronUp className="w-5 h-5 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-muted-foreground" />
                      )}
                    </div>
                  </CardHeader>
                  {expandedId === item.id && (
                    <CardContent>
                      <p className="text-muted-foreground mb-2">{item.description}</p>
                      <div className="mt-4 p-4 bg-muted rounded-lg">
                        <h4 className="font-semibold mb-2">詳細</h4>
                        <p className="text-sm">{item.details}</p>
                      </div>
                    </CardContent>
                  )}
                </Card>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

