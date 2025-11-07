import React, { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useData } from '../contexts/DataContext'
import { Search, Calendar, CheckSquare, Smile, Meh, Frown, TrendingDown, Plus, X, Edit2, Trash2, ChevronLeft, ChevronRight, ClipboardList } from 'lucide-react'
import { TextLogo } from '../components/Logo'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

export default function HomePage() {
  const { companies, addCompany } = useData()
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('updated')
  const [filterIndustry, setFilterIndustry] = useState('all')
  const [motivation, setMotivation] = useState('high')
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isTaskPanelOpen, setIsTaskPanelOpen] = useState(false)
  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem('tasks')
    return saved ? JSON.parse(saved) : []
  })
  const [editingTask, setEditingTask] = useState(null)
  const [isAddTaskDialogOpen, setIsAddTaskDialogOpen] = useState(false)
  const [newTask, setNewTask] = useState({
    company: '',
    task: '',
    time: '',
    priority: 'medium',
  })
  const [taskButtonPosition, setTaskButtonPosition] = useState(() => {
    const saved = localStorage.getItem('taskButtonPosition')
    return saved ? JSON.parse(saved) : { x: 50, y: 50 } // Default position (percentage)
  })
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [newCompany, setNewCompany] = useState({
    name: '',
    industry: '',
    image: '',
    priority: 3,
    status: '企業研究中',
  })

  // Get unique industries
  const industries = useMemo(() => {
    const unique = [...new Set(companies.map((c) => c.industry))]
    return unique
  }, [companies])

  // Filter and sort companies
  const filteredCompanies = useMemo(() => {
    let result = companies.filter((company) => {
      const matchesSearch = company.name.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesIndustry = filterIndustry === 'all' || company.industry === filterIndustry
      return matchesSearch && matchesIndustry
    })

    // Sort
    if (sortBy === 'updated') {
      result = [...result].reverse() // Mock: assume last items are most recently updated
    }
    // 'registered' is default order

    return result
  }, [companies, searchQuery, filterIndustry, sortBy])


  const motivationIcons = {
    high: { icon: Smile, label: '高い', color: 'text-green-500' },
    'slightly-high': { icon: Smile, label: '少し高い', color: 'text-blue-500' },
    'slightly-low': { icon: Meh, label: '少し低い', color: 'text-yellow-500' },
    low: { icon: Frown, label: '低い', color: 'text-red-500' },
  }

  const MotivationIcon = motivationIcons[motivation].icon

  const handleAddCompany = () => {
    if (newCompany.name && newCompany.industry) {
      const company = {
        id: companies.length + 1,
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
    }
  }

  const handleEditTask = (task) => {
    setEditingTask(task)
  }

  const handleSaveTask = () => {
    if (editingTask) {
      const updatedTasks = tasks.map(t => 
        t.id === editingTask.id ? editingTask : t
      )
      setTasks(updatedTasks)
      localStorage.setItem('tasks', JSON.stringify(updatedTasks))
      setEditingTask(null)
    }
  }

  const handleAddTask = () => {
    if (newTask.company && newTask.task && newTask.time) {
      const task = {
        ...newTask,
        id: Date.now().toString(),
        status: 'todo',
      }
      const updatedTasks = [...tasks, task]
      setTasks(updatedTasks)
      localStorage.setItem('tasks', JSON.stringify(updatedTasks))
      setNewTask({
        company: '',
        task: '',
        time: '',
        priority: 'medium',
      })
      setIsAddTaskDialogOpen(false)
    }
  }

  const handleDeleteTask = (taskId) => {
    const updatedTasks = tasks.filter(t => t.id !== taskId)
    setTasks(updatedTasks)
    localStorage.setItem('tasks', JSON.stringify(updatedTasks))
  }

  const toggleTaskStatus = (taskId) => {
    const updatedTasks = tasks.map(task =>
      task.id === taskId
        ? { ...task, status: task.status === 'completed' ? 'todo' : 'completed' }
        : task
    )
    setTasks(updatedTasks)
    localStorage.setItem('tasks', JSON.stringify(updatedTasks))
  }

  const handleMouseDown = (e) => {
    e.preventDefault()
    setIsDragging(true)
    const rect = e.currentTarget.getBoundingClientRect()
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    })
  }

  const handleMouseMove = (e) => {
    if (!isDragging) return
    
    const x = ((e.clientX - dragOffset.x) / window.innerWidth) * 100
    const y = ((e.clientY - dragOffset.y) / window.innerHeight) * 100
    
    // Keep button within screen bounds
    const clampedX = Math.max(0, Math.min(95, x))
    const clampedY = Math.max(0, Math.min(90, y))
    
    setTaskButtonPosition({ x: clampedX, y: clampedY })
  }

  const handleMouseUp = () => {
    if (isDragging) {
      setIsDragging(false)
      localStorage.setItem('taskButtonPosition', JSON.stringify(taskButtonPosition))
    }
  }

  // Add global mouse event listeners
  React.useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [isDragging, dragOffset, taskButtonPosition])

  return (
    <div className="min-h-screen bg-background p-8">
      {/* Main Content */}
      <div className="max-w-6xl mx-auto">
        {/* Search Bar - Google-like centered */}
        <div className="flex flex-col items-center justify-center min-h-[40vh]">
          {/* Header with Logo positioned above the title */}
          <div className="mb-4 text-center">
            <div className="font-bold text-black dark:text-white text-2xl mb-2">
              法律問題研究部
            </div>
          </div>
          <h1 className="text-3xl md:text-5xl font-bold mb-8 text-center">就活タスク管理</h1>
          <div className="w-full max-w-2xl relative px-4">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <Input
              type="text"
              placeholder="企業名で検索..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-14 text-lg shadow-lg"
            />
          </div>
        </div>

        {/* Filters and Add Button */}
        <div className="flex gap-4 mb-6 flex-wrap items-center justify-between px-4">
          <div className="flex gap-4 flex-wrap">
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="並び替え" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="registered">登録順</SelectItem>
              <SelectItem value="updated">更新順</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterIndustry} onValueChange={setFilterIndustry}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="業界" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">すべて</SelectItem>
              {industries.map((industry) => (
                <SelectItem key={industry} value={industry}>
                  {industry}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          </div>

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

        {/* Company Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-20 px-4">
          {filteredCompanies.map((company) => (
            <Card
              key={company.id}
              className="cursor-pointer hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden"
              onClick={() => navigate(`/company/${company.id}`)}
            >
              <div className="h-48 overflow-hidden">
                <img
                  src={company.image}
                  alt={company.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-bold text-lg mb-1">{company.name}</h3>
                    <div className="flex gap-2 flex-wrap">
                      <Badge variant="secondary">{company.industry}</Badge>
                      <Badge variant="outline">{company.status}</Badge>
                      <Badge variant="default">志望度: {company.priority}</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Bottom Right: Motivation Selector */}
      <div className="fixed bottom-8 right-8 hidden lg:block">
        <Card className="w-64">
          <CardContent className="p-4">
            <h3 className="font-semibold mb-3 text-sm">今日のモチベーション</h3>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(motivationIcons).map(([key, { icon: Icon, label, color }]) => (
                <button
                  key={key}
                  onClick={() => setMotivation(key)}
                  className={`flex items-center gap-2 p-2 rounded-lg border transition-all ${
                    motivation === key
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:bg-accent'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${color}`} />
                  <span className="text-sm">{label}</span>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Task Panel - Collapsible Side Panel */}
      <div className={`fixed right-0 top-0 h-screen w-96 bg-background border-l border-border shadow-lg transform transition-transform duration-300 z-50 ${
        isTaskPanelOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        <div className="flex flex-col h-full">
          {/* Panel Header */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h2 className="text-lg font-semibold">タスク管理</h2>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsAddTaskDialogOpen(true)}
              >
                <Plus className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsTaskPanelOpen(false)}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Task List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {tasks.length > 0 ? (
              tasks.map((task) => (
                <Card key={task.id} className="relative">
                  <CardContent className="p-3">
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={task.status === 'completed'}
                        onChange={() => toggleTaskStatus(task.id)}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <h4 className={`font-medium text-sm ${
                          task.status === 'completed' ? 'line-through text-muted-foreground' : ''
                        }`}>
                          {task.task || task.title}
                        </h4>
                        <div className="text-xs text-muted-foreground mt-1">
                          <div>会社: {task.company || '未設定'}</div>
                          <div>時間: {task.time || '未設定'}</div>
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline" className="text-xs">
                            {task.priority === 'high' ? '高' : task.priority === 'medium' ? '中' : '低'}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditTask(task)}
                        >
                          <Edit2 className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteTask(task.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center text-muted-foreground py-8">
                <ClipboardList className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
                <p className="text-sm mb-4">タスクがありません</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsAddTaskDialogOpen(true)}
                  className="gap-2"
                >
                  <Plus className="w-4 h-4" />
                  タスクを追加
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Draggable Task Panel Toggle Button */}
      <Button
        className={`fixed z-50 transition-all duration-200 ${
          isDragging ? 'scale-110 shadow-2xl' : 'hover:scale-105 shadow-lg'
        }`}
        style={{
          left: `${taskButtonPosition.x}%`,
          top: `${taskButtonPosition.y}%`,
          transform: 'translate(-50%, -50%)',
          cursor: isDragging ? 'grabbing' : 'grab'
        }}
        onMouseDown={handleMouseDown}
        onClick={(e) => {
          if (!isDragging) {
            setIsTaskPanelOpen(!isTaskPanelOpen)
          }
        }}
        size="lg"
        variant="default"
      >
        <ClipboardList className="w-6 h-6 mr-2" />
        <span className="font-medium">タスク</span>
        {tasks.length > 0 && (
          <Badge 
            variant="destructive" 
            className="ml-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
          >
            {tasks.filter(t => t.status !== 'completed').length}
          </Badge>
        )}
      </Button>

      {/* Task Edit Dialog */}
      <Dialog open={!!editingTask} onOpenChange={() => setEditingTask(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>タスクを編集</DialogTitle>
          </DialogHeader>
          {editingTask && (
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="edit-task-company">会社名</Label>
                <Input
                  id="edit-task-company"
                  value={editingTask.company || ''}
                  onChange={(e) => setEditingTask({ ...editingTask, company: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-task-task">やる事</Label>
                <Input
                  id="edit-task-task"
                  value={editingTask.task || editingTask.title || ''}
                  onChange={(e) => setEditingTask({ ...editingTask, task: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-task-time">時間</Label>
                <Input
                  id="edit-task-time"
                  value={editingTask.time || ''}
                  onChange={(e) => setEditingTask({ ...editingTask, time: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-task-priority">優先度</Label>
                <Select
                  value={editingTask.priority}
                  onValueChange={(value) => setEditingTask({ ...editingTask, priority: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">高</SelectItem>
                    <SelectItem value="medium">中</SelectItem>
                    <SelectItem value="low">低</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setEditingTask(null)}>
              キャンセル
            </Button>
            <Button onClick={handleSaveTask}>
              保存
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Task Dialog */}
      <Dialog open={isAddTaskDialogOpen} onOpenChange={setIsAddTaskDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>新規タスクを追加</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="add-task-company">会社名 *</Label>
              <Input
                id="add-task-company"
                value={newTask.company}
                onChange={(e) => setNewTask({ ...newTask, company: e.target.value })}
                placeholder="例: 株式会社リクルート"
              />
            </div>
            <div>
              <Label htmlFor="add-task-task">やる事 *</Label>
              <Input
                id="add-task-task"
                value={newTask.task}
                onChange={(e) => setNewTask({ ...newTask, task: e.target.value })}
                placeholder="例: ESを作成する"
              />
            </div>
            <div>
              <Label htmlFor="add-task-time">時間 *</Label>
              <Input
                id="add-task-time"
                value={newTask.time}
                onChange={(e) => setNewTask({ ...newTask, time: e.target.value })}
                placeholder="例: 2025-10-20 14:00"
              />
            </div>
            <div>
              <Label htmlFor="add-task-priority">優先度</Label>
              <Select
                value={newTask.priority}
                onValueChange={(value) => setNewTask({ ...newTask, priority: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">高</SelectItem>
                  <SelectItem value="medium">中</SelectItem>
                  <SelectItem value="low">低</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsAddTaskDialogOpen(false)}>
              キャンセル
            </Button>
            <Button onClick={handleAddTask}>
              追加
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

