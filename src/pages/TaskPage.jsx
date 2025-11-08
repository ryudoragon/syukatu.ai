import { useState, useMemo } from 'react'
import { useData } from '../contexts/DataContext'
import { Plus, CheckCircle2, Circle, Calendar, Clock, AlertCircle, Trash2, Edit2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'

export default function TaskPage() {
  const { companies } = useData()
  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem('tasks')
    if (saved) {
      return JSON.parse(saved)
    }
    // Initial dummy tasks
    const initialTasks = [
      {
        id: '1',
        title: 'リクルートのES作成',
        description: '志望動機と自己PRを800字以内で作成',
        dueDate: '2025-10-25',
        priority: 'high',
        status: 'in-progress',
        companyId: '1',
        category: 'ES',
      },
      {
        id: '2',
        title: 'サイバーエージェント二次面接準備',
        description: '過去の質問リストを確認し、回答を準備',
        dueDate: '2025-11-05',
        priority: 'high',
        status: 'todo',
        companyId: '2',
        category: '面接',
      },
      {
        id: '3',
        title: '資生堂の企業研究',
        description: '事業内容、競合分析、最近のニュースをまとめる',
        dueDate: '2025-10-28',
        priority: 'medium',
        status: 'todo',
        companyId: '5',
        category: '企業研究',
      },
      {
        id: '4',
        title: 'トヨタ自動車のWebテスト対策',
        description: 'SPI問題集を1章分解く',
        dueDate: '2025-11-10',
        priority: 'medium',
        status: 'todo',
        companyId: '4',
        category: 'Webテスト',
      },
      {
        id: '5',
        title: 'アクセンチュアのケース面接対策',
        description: 'ケース問題を3問解いて、フレームワークを復習',
        dueDate: '2025-11-03',
        priority: 'high',
        status: 'todo',
        companyId: '10',
        category: '面接',
      },
    ]
    localStorage.setItem('tasks', JSON.stringify(initialTasks))
    return initialTasks
  })

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingTask, setEditingTask] = useState(null)
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterPriority, setFilterPriority] = useState('all')
  const [sortBy, setSortBy] = useState('dueDate')
  const [newTask, setNewTask] = useState({
    company: '',
    task: '',
    time: '',
    priority: 'medium',
    status: 'todo',
  })

  // Save tasks to localStorage whenever they change
  const saveTasksToStorage = (updatedTasks) => {
    localStorage.setItem('tasks', JSON.stringify(updatedTasks))
    setTasks(updatedTasks)
  }

  const handleAddTask = () => {
    if (newTask.company && newTask.task && newTask.time) {
      const task = {
        ...newTask,
        id: Date.now().toString(),
      }
      saveTasksToStorage([...tasks, task])
      setNewTask({
        company: '',
        task: '',
        time: '',
        priority: 'medium',
        status: 'todo',
      })
      setIsAddDialogOpen(false)
    }
  }

  const toggleTaskStatus = (taskId) => {
    const updatedTasks = tasks.map((task) =>
      task.id === taskId
        ? { ...task, status: task.status === 'completed' ? 'todo' : 'completed' }
        : task
    )
    saveTasksToStorage(updatedTasks)
  }

  const deleteTask = (taskId) => {
    saveTasksToStorage(tasks.filter((task) => task.id !== taskId))
  }

  const handleEditTask = (task) => {
    setEditingTask(task)
    setIsEditDialogOpen(true)
  }

  const handleUpdateTask = () => {
    if (editingTask && editingTask.company && editingTask.task && editingTask.time) {
      const updatedTasks = tasks.map((task) =>
        task.id === editingTask.id ? editingTask : task
      )
      saveTasksToStorage(updatedTasks)
      setEditingTask(null)
      setIsEditDialogOpen(false)
    }
  }

  // Filter and sort tasks
  const filteredTasks = useMemo(() => {
    let result = tasks.filter((task) => {
      const matchesStatus = filterStatus === 'all' || task.status === filterStatus
      const matchesPriority = filterPriority === 'all' || task.priority === filterPriority
      return matchesStatus && matchesPriority
    })

    // Sort
    result.sort((a, b) => {
      if (sortBy === 'dueDate') {
        return new Date(a.dueDate) - new Date(b.dueDate)
      } else if (sortBy === 'priority') {
        const priorityOrder = { high: 0, medium: 1, low: 2 }
        return priorityOrder[a.priority] - priorityOrder[b.priority]
      }
      return 0
    })

    return result
  }, [tasks, filterStatus, filterPriority, sortBy])

  const getCompanyName = (companyId) => {
    const company = companies.find((c) => c.id === companyId)
    return company ? company.name : '未設定'
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'destructive'
      case 'medium':
        return 'default'
      case 'low':
        return 'secondary'
      default:
        return 'default'
    }
  }

  const getPriorityLabel = (priority) => {
    switch (priority) {
      case 'high':
        return '高'
      case 'medium':
        return '中'
      case 'low':
        return '低'
      default:
        return '中'
    }
  }

  const getStatusLabel = (status) => {
    switch (status) {
      case 'todo':
        return '未着手'
      case 'in-progress':
        return '進行中'
      case 'completed':
        return '完了'
      default:
        return '未着手'
    }
  }

  const getDaysUntilDue = (task) => {
    const time = task.time || task.dueDate
    if (!time) return 0
    const today = new Date()
    const due = new Date(time)
    const diffTime = due - today
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const taskStats = useMemo(() => {
    const total = tasks.length
    const completed = tasks.filter((t) => t.status === 'completed').length
    const inProgress = tasks.filter((t) => t.status === 'in-progress').length
    const todo = tasks.filter((t) => t.status === 'todo').length
    const overdue = tasks.filter((t) => {
      const daysUntil = getDaysUntilDue(t)
      return daysUntil < 0 && t.status !== 'completed'
    }).length

    return { total, completed, inProgress, todo, overdue }
  }, [tasks])

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold mb-2">タスク管理</h1>
            <p className="text-muted-foreground">やるべきことを明確にして、効率的に就活を進めましょう</p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button size="lg" className="gap-2">
                <Plus className="w-5 h-5" />
                新規タスク追加
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>新規タスクを追加</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <Label htmlFor="task-company">会社名 *</Label>
                  <Input
                    id="task-company"
                    value={newTask.company}
                    onChange={(e) => setNewTask({ ...newTask, company: e.target.value })}
                    placeholder="例: 株式会社リクルート"
                  />
                </div>
                <div>
                  <Label htmlFor="task-task">やる事 *</Label>
                  <Input
                    id="task-task"
                    value={newTask.task}
                    onChange={(e) => setNewTask({ ...newTask, task: e.target.value })}
                    placeholder="例: ESを作成する"
                  />
                </div>
                <div>
                  <Label htmlFor="task-time">時間 *</Label>
                  <Input
                    id="task-time"
                    value={newTask.time}
                    onChange={(e) => setNewTask({ ...newTask, time: e.target.value })}
                    placeholder="例: 2025-10-20 14:00"
                  />
                </div>
                <div>
                  <Label htmlFor="task-priority">優先度</Label>
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
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  キャンセル
                </Button>
                <Button onClick={handleAddTask}>追加</Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Edit Task Dialog */}
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>タスクを編集</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <Label htmlFor="edit-task-company">会社名 *</Label>
                  <Input
                    id="edit-task-company"
                    value={editingTask?.company || ''}
                    onChange={(e) => setEditingTask({ ...editingTask, company: e.target.value })}
                    placeholder="例: 株式会社リクルート"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-task-task">やる事 *</Label>
                  <Input
                    id="edit-task-task"
                    value={editingTask?.task || ''}
                    onChange={(e) => setEditingTask({ ...editingTask, task: e.target.value })}
                    placeholder="例: ESを作成する"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-task-time">時間 *</Label>
                  <Input
                    id="edit-task-time"
                    value={editingTask?.time || ''}
                    onChange={(e) => setEditingTask({ ...editingTask, time: e.target.value })}
                    placeholder="例: 2025-10-20 14:00"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-task-priority">優先度</Label>
                  <Select
                    value={editingTask?.priority || 'medium'}
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
                <div>
                  <Label htmlFor="edit-task-status">ステータス</Label>
                  <Select
                    value={editingTask?.status || 'todo'}
                    onValueChange={(value) => setEditingTask({ ...editingTask, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todo">未着手</SelectItem>
                      <SelectItem value="in-progress">進行中</SelectItem>
                      <SelectItem value="completed">完了</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  キャンセル
                </Button>
                <Button onClick={handleUpdateTask}>更新</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">全タスク</p>
                  <p className="text-2xl font-bold">{taskStats.total}</p>
                </div>
                <CheckCircle2 className="w-8 h-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">未着手</p>
                  <p className="text-2xl font-bold">{taskStats.todo}</p>
                </div>
                <Circle className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">進行中</p>
                  <p className="text-2xl font-bold">{taskStats.inProgress}</p>
                </div>
                <Clock className="w-8 h-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">完了</p>
                  <p className="text-2xl font-bold">{taskStats.completed}</p>
                </div>
                <CheckCircle2 className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">期限超過</p>
                  <p className="text-2xl font-bold text-red-500">{taskStats.overdue}</p>
                </div>
                <AlertCircle className="w-8 h-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex gap-4 mb-6 flex-wrap">
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="ステータス" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">すべて</SelectItem>
              <SelectItem value="todo">未着手</SelectItem>
              <SelectItem value="in-progress">進行中</SelectItem>
              <SelectItem value="completed">完了</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterPriority} onValueChange={setFilterPriority}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="優先度" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">すべて</SelectItem>
              <SelectItem value="high">高</SelectItem>
              <SelectItem value="medium">中</SelectItem>
              <SelectItem value="low">低</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="並び替え" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="dueDate">締切順</SelectItem>
              <SelectItem value="priority">優先度順</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Task List */}
        <div className="space-y-4">
          {filteredTasks.length > 0 ? (
            filteredTasks.map((task) => {
              const daysUntil = getDaysUntilDue(task)
              const isOverdue = daysUntil < 0 && task.status !== 'completed'
              const isDueSoon = daysUntil >= 0 && daysUntil <= 3 && task.status !== 'completed'

              return (
                <Card
                  key={task.id}
                  className={`transition-all hover:shadow-md ${
                    task.status === 'completed' ? 'opacity-60' : ''
                  } ${isOverdue ? 'border-red-500' : ''}`}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="pt-1">
                        <Checkbox
                          checked={task.status === 'completed'}
                          onCheckedChange={() => toggleTaskStatus(task.id)}
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3
                              className={`text-lg font-semibold mb-1 ${
                                task.status === 'completed' ? 'line-through' : ''
                              }`}
                            >
                              {task.task || task.title}
                            </h3>
                            <div className="text-sm text-muted-foreground mb-2">
                              <div>会社: {task.company || getCompanyName(task.companyId) || '未設定'}</div>
                              <div>時間: {task.time || task.dueDate || '未設定'}</div>
                              {task.description && <div>詳細: {task.description}</div>}
                            </div>
                          </div>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditTask(task)}
                              className="text-blue-500 hover:text-blue-700"
                            >
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteTask(task.id)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        <div className="flex gap-2 flex-wrap items-center">
                          <Badge variant={getPriorityColor(task.priority)}>
                            優先度: {getPriorityLabel(task.priority)}
                          </Badge>
                          <Badge variant="secondary">{getStatusLabel(task.status)}</Badge>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground ml-auto">
                            <Calendar className="w-4 h-4" />
                            <span>{task.time || task.dueDate || '未設定'}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <p className="text-muted-foreground">タスクがありません</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

