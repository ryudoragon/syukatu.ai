import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useData } from '../contexts/DataContext'
import { ChevronLeft, ChevronRight, Upload, Eye, EyeOff, Plus, Trash2, Building2, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'

export default function CompanyPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { getCompanyById, updateCompany, companies, addCompany, deleteCompany } = useData()
  const [company, setCompany] = useState(null)
  const [selectedTabs, setSelectedTabs] = useState(['info'])
  const [showPassword, setShowPassword] = useState(false)
  const [customFields, setCustomFields] = useState([])
  const [essays, setEssays] = useState([])
  const [interviews, setInterviews] = useState([])
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [newCompany, setNewCompany] = useState({
    name: '',
    industry: '',
    image: '',
    priority: 3,
    status: '企業研究中',
  })
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  useEffect(() => {
    if (id) {
      const foundCompany = getCompanyById(id)
      if (foundCompany) {
        setCompany(foundCompany)
        setCustomFields(foundCompany.analysis?.customFields || [])
        setEssays(foundCompany.essays || [])
        setInterviews(foundCompany.interviews || [])
      }
    } else {
      // Default to first company if no ID
      if (companies.length > 0) {
        setCompany(companies[0])
        navigate(`/company/${companies[0].id}`, { replace: true })
      }
    }
  }, [id, getCompanyById, companies, navigate])

  const handleUpdateField = (field, value) => {
    const updated = { ...company, [field]: value }
    setCompany(updated)
    // Remove auto-save - user needs to click save button
  }

  const handleSaveCompanyInfo = () => {
    updateCompany(company.id, company)
    // Show success feedback (you can add a toast notification here)
    alert('企業情報を保存しました')
  }

  const handleUpdateAnalysis = (field, value) => {
    const updated = {
      ...company,
      analysis: { ...company.analysis, [field]: value },
    }
    setCompany(updated)
    // Remove auto-save - user needs to click save button
  }

  const handleSaveAnalysis = () => {
    updateCompany(company.id, { analysis: company.analysis })
    alert('企業分析を保存しました')
  }

  const addCustomField = () => {
    const newFields = [...customFields, { key: '', value: '' }]
    setCustomFields(newFields)
    // Update local state only, save when user clicks save button
    const updated = {
      ...company,
      analysis: { ...company.analysis, customFields: newFields },
    }
    setCompany(updated)
  }

  const updateCustomField = (index, key, value) => {
    const newFields = [...customFields]
    newFields[index] = { ...newFields[index], [key]: value }
    setCustomFields(newFields)
    // Update local state only, save when user clicks save button
    const updated = {
      ...company,
      analysis: { ...company.analysis, customFields: newFields },
    }
    setCompany(updated)
  }

  const deleteCustomField = (index) => {
    const newFields = customFields.filter((_, i) => i !== index)
    setCustomFields(newFields)
    // Update local state only, save when user clicks save button
    const updated = {
      ...company,
      analysis: { ...company.analysis, customFields: newFields },
    }
    setCompany(updated)
  }

  const addEssay = () => {
    const newEssays = [...essays, { theme: '', content: '', maxLength: 400, id: Date.now() }]
    setEssays(newEssays)
    // Update local state only, save when user clicks save button
  }

  const updateEssay = (index, field, value) => {
    const newEssays = [...essays]
    newEssays[index] = { ...newEssays[index], [field]: value }
    setEssays(newEssays)
    // Update local state only, save when user clicks save button
  }

  const handleSaveEssays = () => {
    updateCompany(company.id, { essays: essays })
    alert('ESを保存しました')
  }

  const deleteEssay = (index) => {
    const newEssays = essays.filter((_, i) => i !== index)
    setEssays(newEssays)
    // Update local state only, save when user clicks save button
  }

  const addInterview = () => {
    const newInterviews = [...interviews, { notes: '', questions: '', id: Date.now() }]
    setInterviews(newInterviews)
    // Update local state only, save when user clicks save button
  }

  const updateInterview = (index, field, value) => {
    const newInterviews = [...interviews]
    newInterviews[index] = { ...newInterviews[index], [field]: value }
    setInterviews(newInterviews)
    // Update local state only, save when user clicks save button
  }

  const handleSaveInterviews = () => {
    updateCompany(company.id, { interviews: interviews })
    alert('面接情報を保存しました')
  }

  const deleteInterview = (index) => {
    const newInterviews = interviews.filter((_, i) => i !== index)
    setInterviews(newInterviews)
    // Update local state only, save when user clicks save button
  }

  const toggleTab = (tab) => {
    if (selectedTabs.includes(tab)) {
      if (selectedTabs.length > 1) {
        setSelectedTabs(selectedTabs.filter((t) => t !== tab))
      }
    } else {
      if (selectedTabs.length < 4) {
        setSelectedTabs([...selectedTabs, tab])
      }
    }
  }

  const rotateTabsLeft = () => {
    const allTabs = ['info', 'analysis', 'es', 'interview']
    const currentIndex = allTabs.indexOf(selectedTabs[0])
    const newIndex = (currentIndex - 1 + allTabs.length) % allTabs.length
    setSelectedTabs([allTabs[newIndex]])
  }

  const rotateTabsRight = () => {
    const allTabs = ['info', 'analysis', 'es', 'interview']
    const currentIndex = allTabs.indexOf(selectedTabs[0])
    const newIndex = (currentIndex + 1) % allTabs.length
    setSelectedTabs([allTabs[newIndex]])
  }

  const handleAddCompany = () => {
    if (newCompany.name && newCompany.industry) {
      const company = {
        id: Date.now().toString(),
        name: newCompany.name,
        industry: newCompany.industry,
        image: newCompany.image || `https://picsum.photos/seed/${newCompany.name}/400/300`,
        priority: newCompany.priority,
        status: newCompany.status,
        homepage: '',
        myPageId: '',
        myPagePassword: '',
        selectionFlow: '',
        currentStatus: newCompany.status,
        nextSelectionDate: '',
        esDeadline: '',
        tasks: [],
        analysis: {},
        essays: [],
        interviews: [],
      }
      addCompany(company)
      setNewCompany({
        name: '',
        industry: '',
        image: '',
        priority: 3,
        status: '企業研究中',
      })
      setIsAddDialogOpen(false)
      // Navigate to the new company
      navigate(`/company/${company.id}`)
    }
  }

  const handleDeleteCompany = () => {
    deleteCompany(company.id)
    setIsDeleteDialogOpen(false)
    // Navigate to home or first company
    if (companies.length > 1) {
      const otherCompanies = companies.filter(c => c.id !== company.id)
      navigate(`/company/${otherCompanies[0].id}`)
    } else {
      navigate('/')
    }
  }

  if (!company) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>企業情報を読み込んでいます...</p>
      </div>
    )
  }

  const gridClass =
    selectedTabs.length === 1
      ? 'grid-cols-1'
      : selectedTabs.length === 2
      ? 'grid-cols-2'
      : selectedTabs.length === 3
      ? 'grid-cols-3'
      : 'grid-cols-2 grid-rows-2'

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header with Add and Delete Buttons */}
        <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
            <h1 className="text-2xl sm:text-3xl font-bold">企業情報</h1>
            <span className="text-base sm:text-lg text-muted-foreground">- {company.name}</span>
          </div>
          <div className="flex gap-2">
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="destructive" className="gap-2">
                  <Trash2 className="w-4 h-4" />
                  この企業を削除
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>企業を削除</DialogTitle>
                </DialogHeader>
                <div className="py-4">
                  <p className="text-sm text-muted-foreground">
                    <span className="font-bold text-foreground">{company.name}</span>を削除しますか？
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    この操作は元に戻せません。
                  </p>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                    キャンセル
                  </Button>
                  <Button variant="destructive" onClick={handleDeleteCompany}>
                    削除する
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                新規企業追加
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>新規企業を追加</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <Label htmlFor="company-name">企業名 *</Label>
                  <Input
                    id="company-name"
                    value={newCompany.name}
                    onChange={(e) => setNewCompany({ ...newCompany, name: e.target.value })}
                    placeholder="例: 株式会社〇〇"
                  />
                </div>
                <div>
                  <Label htmlFor="industry">業界 *</Label>
                  <Input
                    id="industry"
                    value={newCompany.industry}
                    onChange={(e) => setNewCompany({ ...newCompany, industry: e.target.value })}
                    placeholder="例: IT・EC"
                  />
                </div>
                <div>
                  <Label htmlFor="image-url">画像URL（オプション）</Label>
                  <Input
                    id="image-url"
                    value={newCompany.image}
                    onChange={(e) => setNewCompany({ ...newCompany, image: e.target.value })}
                    placeholder="空欄の場合は自動生成されます"
                  />
                </div>
                <div>
                  <Label htmlFor="priority">志望度</Label>
                  <Select
                    value={String(newCompany.priority)}
                    onValueChange={(value) => setNewCompany({ ...newCompany, priority: parseInt(value) })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5</SelectItem>
                      <SelectItem value="4">4</SelectItem>
                      <SelectItem value="3">3</SelectItem>
                      <SelectItem value="2">2</SelectItem>
                      <SelectItem value="1">1</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="status">現状</Label>
                  <Input
                    id="status"
                    value={newCompany.status}
                    onChange={(e) => setNewCompany({ ...newCompany, status: e.target.value })}
                    placeholder="例: 企業研究中"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  キャンセル
                </Button>
                <Button onClick={handleAddCompany}>
                  追加
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex gap-2 flex-wrap">
            <Button
              variant={selectedTabs.includes('info') ? 'default' : 'outline'}
              onClick={() => toggleTab('info')}
            >
              企業情報
            </Button>
            <Button
              variant={selectedTabs.includes('analysis') ? 'default' : 'outline'}
              onClick={() => toggleTab('analysis')}
            >
              企業分析
            </Button>
            <Button
              variant={selectedTabs.includes('es') ? 'default' : 'outline'}
              onClick={() => toggleTab('es')}
            >
              ES
            </Button>
            <Button
              variant={selectedTabs.includes('interview') ? 'default' : 'outline'}
              onClick={() => toggleTab('interview')}
            >
              面接
            </Button>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="icon" onClick={rotateTabsLeft}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={rotateTabsRight}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Tab Content Grid */}
        <div className={`grid ${gridClass} gap-6`}>
          {selectedTabs.includes('info') && (
            <Card className="overflow-auto max-h-[80vh]">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>企業情報</CardTitle>
                  <Button onClick={handleSaveCompanyInfo} className="gap-2">
                    <Save className="w-4 h-4" />
                    保存
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Image Upload */}
                <div>
                  <Label>企業画像</Label>
                  <div className="mt-2">
                    <img src={company.image} alt={company.name} className="w-full h-48 object-cover rounded-lg" />
                    <Button variant="outline" size="sm" className="mt-2">
                      <Upload className="w-4 h-4 mr-2" />
                      画像を変更
                    </Button>
                  </div>
                </div>

                <div>
                  <Label>企業名</Label>
                  <Input
                    value={company.name}
                    onChange={(e) => handleUpdateField('name', e.target.value)}
                  />
                </div>

                <div>
                  <Label>業界</Label>
                  <Input
                    value={company.industry}
                    onChange={(e) => handleUpdateField('industry', e.target.value)}
                  />
                </div>

                <div>
                  <Label>ホームページURL</Label>
                  <Input
                    value={company.url}
                    onChange={(e) => handleUpdateField('url', e.target.value)}
                  />
                </div>

                <div>
                  <Label>マイページID</Label>
                  <Input
                    value={company.myPageId}
                    onChange={(e) => handleUpdateField('myPageId', e.target.value)}
                  />
                </div>

                <div>
                  <Label>マイページパスワード</Label>
                  <div className="flex gap-2">
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      value={company.myPagePassword}
                      onChange={(e) => handleUpdateField('myPagePassword', e.target.value)}
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>

                <div>
                  <Label>選考フロー</Label>
                  <Textarea
                    value={company.selectionFlow}
                    onChange={(e) => handleUpdateField('selectionFlow', e.target.value)}
                  />
                </div>

                <div>
                  <Label>現状</Label>
                  <Input
                    value={company.currentStatus}
                    onChange={(e) => handleUpdateField('currentStatus', e.target.value)}
                  />
                </div>

                <div>
                  <Label>次回選考日</Label>
                  <Input
                    type="date"
                    value={company.nextSelectionDate}
                    onChange={(e) => handleUpdateField('nextSelectionDate', e.target.value)}
                  />
                </div>

                <div>
                  <Label>ES・Webテスト締切</Label>
                  <Input
                    type="date"
                    value={company.esDeadline}
                    onChange={(e) => handleUpdateField('esDeadline', e.target.value)}
                  />
                </div>

                <div>
                  <Label>Webテスト形式</Label>
                  <Input
                    value={company.webTestType}
                    onChange={(e) => handleUpdateField('webTestType', e.target.value)}
                  />
                </div>

                <div>
                  <Label>志望度 (1-5)</Label>
                  <Select
                    value={company.priority?.toString()}
                    onValueChange={(value) => handleUpdateField('priority', parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5].map((num) => (
                        <SelectItem key={num} value={num.toString()}>
                          {num}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>メモ</Label>
                  <Textarea
                    value={company.memo}
                    onChange={(e) => handleUpdateField('memo', e.target.value)}
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {selectedTabs.includes('analysis') && (
            <Card className="overflow-auto max-h-[80vh]">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>企業分析</CardTitle>
                  <Button onClick={handleSaveAnalysis} className="gap-2">
                    <Save className="w-4 h-4" />
                    保存
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { key: 'revenue', label: '売上' },
                  { key: 'employees', label: '従業員数' },
                  { key: 'capital', label: '資本金' },
                  { key: 'philosophy', label: '理念' },
                  { key: 'products', label: '製品' },
                  { key: 'business', label: '事業内容' },
                  { key: 'csr', label: 'CSR' },
                  { key: 'history', label: '沿革' },
                  { key: 'departments', label: '部門業務' },
                  { key: 'career', label: 'キャリアプラン' },
                  { key: 'culture', label: '社風' },
                  { key: 'competitors', label: '競合比較' },
                  { key: 'growth', label: '成長性' },
                  { key: 'recruitment', label: '採用数' },
                  { key: 'salary', label: '年収' },
                  { key: 'benefits', label: '福利厚生' },
                  { key: 'tenure', label: '平均勤続年数' },
                  { key: 'overtime', label: '残業時間' },
                  { key: 'cm', label: 'CM確認' },
                ].map((field) => (
                  <div key={field.key}>
                    <Label>{field.label}</Label>
                    <Textarea
                      value={company.analysis?.[field.key] || ''}
                      onChange={(e) => handleUpdateAnalysis(field.key, e.target.value)}
                      rows={2}
                    />
                  </div>
                ))}

                <div className="pt-4 border-t">
                  <div className="flex items-center justify-between mb-3">
                    <Label>カスタム項目</Label>
                    <Button variant="outline" size="sm" onClick={addCustomField}>
                      <Plus className="w-4 h-4 mr-2" />
                      追加
                    </Button>
                  </div>
                  {customFields.map((field, index) => (
                    <div key={index} className="flex gap-2 mb-2">
                      <Input
                        placeholder="項目名"
                        value={field.key}
                        onChange={(e) => updateCustomField(index, 'key', e.target.value)}
                      />
                      <Input
                        placeholder="内容"
                        value={field.value}
                        onChange={(e) => updateCustomField(index, 'value', e.target.value)}
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => deleteCustomField(index)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {selectedTabs.includes('es') && (
            <Card className="overflow-auto max-h-[80vh]">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>ES</CardTitle>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={addEssay}>
                      <Plus className="w-4 h-4 mr-2" />
                      追加
                    </Button>
                    <Button onClick={handleSaveEssays} className="gap-2">
                      <Save className="w-4 h-4" />
                      保存
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {essays.map((essay, index) => (
                  <div key={essay.id} className="border-b pb-4">
                    <div className="flex items-center justify-between mb-2">
                      <Label>ES #{index + 1}</Label>
                      <Button variant="outline" size="sm" onClick={() => deleteEssay(index)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <Label>テーマ</Label>
                        <Input
                          value={essay.theme}
                          onChange={(e) => updateEssay(index, 'theme', e.target.value)}
                          placeholder="例: 学生時代に最も力を入れたこと"
                        />
                      </div>
                      <div>
                        <Label>文字数上限</Label>
                        <Input
                          type="number"
                          value={essay.maxLength}
                          onChange={(e) => updateEssay(index, 'maxLength', parseInt(e.target.value))}
                        />
                      </div>
                      <div>
                        <Label>
                          本文 ({essay.content?.length || 0}/{essay.maxLength}文字)
                        </Label>
                        <Textarea
                          value={essay.content}
                          onChange={(e) => updateEssay(index, 'content', e.target.value)}
                          rows={6}
                          maxLength={essay.maxLength}
                        />
                      </div>
                    </div>
                  </div>
                ))}
                {essays.length === 0 && (
                  <p className="text-muted-foreground text-center py-8">
                    ESを追加してください
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          {selectedTabs.includes('interview') && (
            <Card className="overflow-auto max-h-[80vh]">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>面接</CardTitle>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={addInterview}>
                      <Plus className="w-4 h-4 mr-2" />
                      追加
                    </Button>
                    <Button onClick={handleSaveInterviews} className="gap-2">
                      <Save className="w-4 h-4" />
                      保存
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {interviews.map((interview, index) => (
                  <div key={interview.id} className="border-b pb-4">
                    <div className="flex items-center justify-between mb-2">
                      <Label>面接 #{index + 1}</Label>
                      <Button variant="outline" size="sm" onClick={() => deleteInterview(index)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <Label>話す内容メモ</Label>
                        <Textarea
                          value={interview.notes}
                          onChange={(e) => updateInterview(index, 'notes', e.target.value)}
                          rows={4}
                          placeholder="面接で話したいポイントをメモ"
                        />
                      </div>
                      <div>
                        <Label>過去に聞かれた質問</Label>
                        <Textarea
                          value={interview.questions}
                          onChange={(e) => updateInterview(index, 'questions', e.target.value)}
                          rows={4}
                          placeholder="実際に聞かれた質問を記録"
                        />
                      </div>
                    </div>
                  </div>
                ))}
                {interviews.length === 0 && (
                  <p className="text-muted-foreground text-center py-8">
                    面接情報を追加してください
                  </p>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

