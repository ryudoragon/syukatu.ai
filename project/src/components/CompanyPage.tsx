import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Globe, Image, Eye, EyeOff, Calendar, FileText, Clock, Star, BarChart3, Save, Edit2, Plus, CheckCircle, Circle, Trash2, MessageSquare, Upload, ChevronDown, ChevronUp, MoveUp, MoveDown } from 'lucide-react';
import { supabase, Company, Task, SelectionStep } from '../lib/supabase';

type CompanyPageProps = {
  company: Company;
  onBack: () => void;
  onAnalysis: () => void;
  onES: () => void;
  onInterview: () => void;
  onDelete: () => void;
};

export default function CompanyPage({ company: initialCompany, onBack, onAnalysis, onES, onInterview, onDelete }: CompanyPageProps) {
  const [company, setCompany] = useState<Company>(initialCompany);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectionSteps, setSelectionSteps] = useState<SelectionStep[]>([]);
  const [expandedSteps, setExpandedSteps] = useState<Set<string>>(new Set());
  const [showAddStep, setShowAddStep] = useState(false);
  const [newStepName, setNewStepName] = useState('');
  const [isCustomStep, setIsCustomStep] = useState(false);

  const presetSteps = [
    'ES提出',
    'Webテスト',
    '書類選考',
    '一次面接',
    '二次面接',
    '三次面接',
    '最終面接',
    'グループディスカッション',
    'インターンシップ',
    '内々定',
  ];
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showAddTask, setShowAddTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDueDate, setNewTaskDueDate] = useState('');
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [showImageResizer, setShowImageResizer] = useState(false);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [editForm, setEditForm] = useState({
    name: company.name,
    industry: company.industry,
    image_url: company.image_url,
    website: company.website,
    mypage_id: company.mypage_id,
    mypage_password: company.mypage_password,
    selection_process: company.selection_process,
    current_status: company.current_status,
    next_selection_date: company.next_selection_date || '',
    es_deadline: company.es_deadline || '',
    webtest_deadline: company.webtest_deadline || '',
    webtest_format: company.webtest_format,
    memo: company.memo,
    motivation_level: company.motivation_level,
  });

  useEffect(() => {
    loadTasks();
    loadSelectionSteps();
  }, [company.id]);

  const loadTasks = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', user.id)
      .eq('company_id', company.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading tasks:', error);
    } else {
      setTasks(data || []);
    }
  };

  const loadSelectionSteps = async () => {
    const { data, error } = await supabase
      .from('selection_steps')
      .select('*')
      .eq('company_id', company.id)
      .order('order_index', { ascending: true });

    if (error) {
      console.error('Error loading selection steps:', error);
    } else {
      setSelectionSteps(data || []);
    }
  };

  const toggleStep = (stepId: string) => {
    setExpandedSteps(prev => {
      const newSet = new Set(prev);
      if (newSet.has(stepId)) {
        newSet.delete(stepId);
      } else {
        newSet.add(stepId);
      }
      return newSet;
    });
  };

  const addSelectionStep = async (stepName?: string) => {
    const name = stepName || newStepName;
    if (!name.trim()) return;

    const maxOrder = selectionSteps.length > 0
      ? Math.max(...selectionSteps.map(s => s.order_index))
      : -1;

    const { error } = await supabase.from('selection_steps').insert({
      company_id: company.id,
      step_name: name,
      memo: '',
      order_index: maxOrder + 1,
    });

    if (error) {
      console.error('Error adding selection step:', error);
      alert('選考フローの追加に失敗しました');
    } else {
      setNewStepName('');
      setShowAddStep(false);
      setIsCustomStep(false);
      loadSelectionSteps();
    }
  };

  const moveStep = async (stepId: string, direction: 'up' | 'down') => {
    const stepIndex = selectionSteps.findIndex(s => s.id === stepId);
    if (stepIndex === -1) return;
    if (direction === 'up' && stepIndex === 0) return;
    if (direction === 'down' && stepIndex === selectionSteps.length - 1) return;

    const newIndex = direction === 'up' ? stepIndex - 1 : stepIndex + 1;
    const currentStep = selectionSteps[stepIndex];
    const swapStep = selectionSteps[newIndex];

    const updates = [
      supabase.from('selection_steps').update({ order_index: swapStep.order_index }).eq('id', currentStep.id),
      supabase.from('selection_steps').update({ order_index: currentStep.order_index }).eq('id', swapStep.id),
    ];

    const results = await Promise.all(updates);
    const hasError = results.some(r => r.error);

    if (hasError) {
      console.error('Error moving step');
    } else {
      loadSelectionSteps();
    }
  };

  const updateStepMemo = async (stepId: string, memo: string) => {
    const { error } = await supabase
      .from('selection_steps')
      .update({ memo })
      .eq('id', stepId);

    if (error) {
      console.error('Error updating step memo:', error);
    } else {
      loadSelectionSteps();
    }
  };

  const deleteSelectionStep = async (stepId: string) => {
    const { error } = await supabase
      .from('selection_steps')
      .delete()
      .eq('id', stepId);

    if (error) {
      console.error('Error deleting selection step:', error);
    } else {
      loadSelectionSteps();
    }
  };

  const handleSave = async () => {
    setIsSaving(true);

    const { error } = await supabase
      .from('companies')
      .update({
        name: editForm.name,
        industry: editForm.industry,
        image_url: editForm.image_url,
        website: editForm.website,
        mypage_id: editForm.mypage_id,
        mypage_password: editForm.mypage_password,
        selection_process: editForm.selection_process,
        current_status: editForm.current_status,
        next_selection_date: editForm.next_selection_date || null,
        es_deadline: editForm.es_deadline || null,
        webtest_deadline: editForm.webtest_deadline || null,
        webtest_format: editForm.webtest_format,
        memo: editForm.memo,
        motivation_level: editForm.motivation_level,
        updated_at: new Date().toISOString(),
      })
      .eq('id', company.id);

    if (error) {
      console.error('Error updating company:', error);
      alert('保存に失敗しました');
    } else {
      const { data } = await supabase
        .from('companies')
        .select('*')
        .eq('id', company.id)
        .maybeSingle();

      if (data) {
        setCompany(data);
      }
      setIsEditing(false);
    }

    setIsSaving(false);
  };

  const handleCancel = () => {
    setEditForm({
      name: company.name,
      industry: company.industry,
      image_url: company.image_url,
      website: company.website,
      mypage_id: company.mypage_id,
      mypage_password: company.mypage_password,
      selection_process: company.selection_process,
      current_status: company.current_status,
      next_selection_date: company.next_selection_date || '',
      es_deadline: company.es_deadline || '',
      webtest_deadline: company.webtest_deadline || '',
      webtest_format: company.webtest_format,
      memo: company.memo,
      motivation_level: company.motivation_level,
    });
    setIsEditing(false);
  };

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('画像ファイルを選択してください');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('ファイルサイズは5MB以下にしてください');
      return;
    }

    setSelectedImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
      setShowImageResizer(true);
    };
    reader.readAsDataURL(file);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const resizeImage = async (file: File): Promise<File> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new window.Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const maxWidth = 800;
          const maxHeight = 600;
          let width = img.width;
          let height = img.height;

          if (width > maxWidth) {
            height = (maxWidth / width) * height;
            width = maxWidth;
          }
          if (height > maxHeight) {
            width = (maxHeight / height) * width;
            height = maxHeight;
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
          }

          canvas.toBlob(
            (blob) => {
              if (blob) {
                const resizedFile = new File([blob], file.name, {
                  type: file.type,
                  lastModified: Date.now(),
                });
                resolve(resizedFile);
              } else {
                resolve(file);
              }
            },
            file.type,
            0.92
          );
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  const handleConfirmUpload = async () => {
    if (!selectedImageFile) return;

    setIsUploadingImage(true);
    setShowImageResizer(false);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        alert('ログインが必要です');
        return;
      }

      const fileExt = selectedImageFile.name.split('.').pop();
      const fileName = `${company.id}-${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      if (company.image_url) {
        const oldPath = company.image_url.split('/').slice(-2).join('/');
        await supabase.storage.from('company-images').remove([oldPath]);
      }

      const resizedFile = await resizeImage(selectedImageFile);

      const { error: uploadError } = await supabase.storage
        .from('company-images')
        .upload(filePath, resizedFile, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) {
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('company-images')
        .getPublicUrl(filePath);

      setEditForm({ ...editForm, image_url: publicUrl });
      setSelectedImageFile(null);
      setImagePreview('');
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('画像のアップロードに失敗しました');
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleCancelUpload = () => {
    setShowImageResizer(false);
    setSelectedImageFile(null);
    setImagePreview('');
  };

  const addTask = async () => {
    if (!newTaskTitle.trim()) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from('tasks').insert({
      company_id: company.id,
      user_id: user.id,
      title: newTaskTitle,
      due_date: newTaskDueDate || null,
      completed: false,
    });

    if (error) {
      console.error('Error adding task:', error);
      alert('タスクの追加に失敗しました');
    } else {
      setNewTaskTitle('');
      setNewTaskDueDate('');
      setShowAddTask(false);
      loadTasks();
    }
  };

  const toggleTaskComplete = async (taskId: string, completed: boolean) => {
    const { error } = await supabase
      .from('tasks')
      .update({ completed: !completed })
      .eq('id', taskId);

    if (error) {
      console.error('Error updating task:', error);
    } else {
      loadTasks();
    }
  };

  const deleteTask = async (taskId: string) => {
    const { error } = await supabase.from('tasks').delete().eq('id', taskId);

    if (error) {
      console.error('Error deleting task:', error);
    } else {
      loadTasks();
    }
  };

  const deleteCompany = async () => {
    if (!confirm(`「${company.name}」を削除してもよろしいですか？\nこの操作は取り消せません。`)) {
      return;
    }

    const { error } = await supabase
      .from('companies')
      .delete()
      .eq('id', company.id);

    if (error) {
      console.error('Error deleting company:', error);
      alert('企業の削除に失敗しました');
    } else {
      onDelete();
    }
  };

  const renderStars = (level: number) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star
            key={i}
            className={`w-5 h-5 ${
              i <= level ? 'text-yellow-400 fill-yellow-400' : 'text-slate-300'
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-semibold">戻る</span>
          </button>
          <div className="flex gap-3">
            {isEditing ? (
              <>
                <button
                  onClick={handleCancel}
                  className="flex items-center gap-2 bg-slate-200 hover:bg-slate-300 text-slate-700 px-4 py-2 rounded-lg transition-colors font-semibold"
                >
                  キャンセル
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-slate-300 text-white px-4 py-2 rounded-lg transition-colors font-semibold"
                >
                  <Save className="w-5 h-5" />
                  {isSaving ? '保存中...' : '保存'}
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={deleteCompany}
                  className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors font-semibold"
                >
                  <Trash2 className="w-5 h-5" />
                  削除
                </button>
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 bg-slate-600 hover:bg-slate-700 text-white px-4 py-2 rounded-lg transition-colors font-semibold"
                >
                  <Edit2 className="w-5 h-5" />
                  編集
                </button>
                <button
                  onClick={onES}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors font-semibold"
                >
                  <FileText className="w-5 h-5" />
                  ES
                </button>
                <button
                  onClick={onInterview}
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors font-semibold"
                >
                  <MessageSquare className="w-5 h-5" />
                  面接
                </button>
                <button
                  onClick={onAnalysis}
                  className="flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg transition-colors font-semibold"
                >
                  <BarChart3 className="w-5 h-5" />
                  企業分析
                </button>
              </>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="flex flex-col items-center">
              {isEditing ? (
                <div className="w-full">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    企業画像
                  </label>
                  <div className="w-full h-48 bg-slate-100 rounded-lg flex items-center justify-center overflow-hidden mb-3 border-2 border-dashed border-slate-300">
                    {editForm.image_url ? (
                      <img
                        src={editForm.image_url}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Image className="w-16 h-16 text-slate-300" />
                    )}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploadingImage}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <Upload className="w-4 h-4" />
                    {isUploadingImage ? 'アップロード中...' : '画像を選択'}
                  </button>
                  {editForm.image_url && (
                    <button
                      type="button"
                      onClick={() => setEditForm({ ...editForm, image_url: '' })}
                      className="w-full mt-2 bg-red-100 hover:bg-red-200 text-red-700 px-4 py-2 rounded-lg transition-colors text-sm"
                    >
                      画像を削除
                    </button>
                  )}
                </div>
              ) : (
                <div className="w-full h-48 bg-slate-100 rounded-lg flex items-center justify-center overflow-hidden">
                  {company.image_url ? (
                    <img
                      src={company.image_url}
                      alt={company.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Image className="w-16 h-16 text-slate-300" />
                  )}
                </div>
              )}
            </div>

            <div className="lg:col-span-2">
              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      企業名
                    </label>
                    <input
                      type="text"
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      業界
                    </label>
                    <input
                      type="text"
                      value={editForm.industry}
                      onChange={(e) => setEditForm({ ...editForm, industry: e.target.value })}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <h1 className="text-3xl font-bold text-slate-800 mb-2">{company.name}</h1>
                  {company.industry && (
                    <div className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
                      {company.industry}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Globe className="w-5 h-5 text-blue-600" />
              基本情報
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">HP URL</label>
                {isEditing ? (
                  <input
                    type="url"
                    value={editForm.website}
                    onChange={(e) => setEditForm({ ...editForm, website: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500"
                  />
                ) : (
                  <a
                    href={company.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline break-all"
                  >
                    {company.website || '未設定'}
                  </a>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">マイページID</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editForm.mypage_id}
                    onChange={(e) => setEditForm({ ...editForm, mypage_id: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500"
                  />
                ) : (
                  <p className="text-slate-600">{company.mypage_id || '未設定'}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">マイページPW</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editForm.mypage_password}
                    onChange={(e) => setEditForm({ ...editForm, mypage_password: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500"
                  />
                ) : (
                  <div className="flex items-center gap-2">
                    <p className="text-slate-600 font-mono">
                      {showPassword ? company.mypage_password || '未設定' : '••••••••'}
                    </p>
                    {company.mypage_password && (
                      <button
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-slate-500 hover:text-slate-700"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <FileText className="w-5 h-5 text-green-600" />
                選考フロー
              </h2>
              <button
                onClick={() => setShowAddStep(!showAddStep)}
                className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-lg flex items-center gap-2 transition-colors text-sm"
              >
                <Plus className="w-4 h-4" />
                追加
              </button>
            </div>

            {showAddStep && (
              <div className="bg-slate-50 rounded-lg p-4 mb-4">
                {!isCustomStep ? (
                  <>
                    <p className="text-sm font-semibold text-slate-700 mb-3">よく使う項目を選択</p>
                    <div className="grid grid-cols-2 gap-2 mb-3">
                      {presetSteps.map((preset) => (
                        <button
                          key={preset}
                          onClick={() => addSelectionStep(preset)}
                          className="px-4 py-2 bg-white border border-slate-300 rounded-lg hover:bg-green-50 hover:border-green-500 transition-colors text-sm font-medium text-slate-700"
                        >
                          {preset}
                        </button>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setIsCustomStep(true)}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors text-sm"
                      >
                        カスタム入力
                      </button>
                      <button
                        onClick={() => setShowAddStep(false)}
                        className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-700 px-4 py-2 rounded-lg transition-colors text-sm"
                      >
                        キャンセル
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <input
                      type="text"
                      placeholder="フロー名を入力"
                      value={newStepName}
                      onChange={(e) => setNewStepName(e.target.value)}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg mb-3 focus:outline-none focus:border-green-500"
                      autoFocus
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => addSelectionStep()}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
                      >
                        保存
                      </button>
                      <button
                        onClick={() => {
                          setIsCustomStep(false);
                          setNewStepName('');
                        }}
                        className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-700 px-4 py-2 rounded-lg transition-colors"
                      >
                        戻る
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}

            {selectionSteps.length === 0 ? (
              <p className="text-slate-500 text-center py-4">選考フローがありません</p>
            ) : (
              <div className="space-y-2">
                {selectionSteps.map((step, index) => (
                  <div key={step.id} className="border border-slate-200 rounded-lg overflow-hidden">
                    <button
                      onClick={() => toggleStep(step.id)}
                      className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex flex-col gap-0">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              moveStep(step.id, 'up');
                            }}
                            disabled={index === 0}
                            className="text-slate-400 hover:text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors p-0"
                          >
                            <MoveUp className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              moveStep(step.id, 'down');
                            }}
                            disabled={index === selectionSteps.length - 1}
                            className="text-slate-400 hover:text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors p-0"
                          >
                            <MoveDown className="w-4 h-4" />
                          </button>
                        </div>
                        <span className="font-semibold text-slate-800">{step.step_name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm('この選考フローを削除しますか?')) {
                              deleteSelectionStep(step.id);
                            }
                          }}
                          className="text-red-500 hover:text-red-700 transition-colors p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        {expandedSteps.has(step.id) ? (
                          <ChevronUp className="w-5 h-5 text-slate-600" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-slate-600" />
                        )}
                      </div>
                    </button>

                    {expandedSteps.has(step.id) && (
                      <div className="px-4 pb-4">
                        <textarea
                          value={step.memo}
                          onChange={(e) => updateStepMemo(step.id, e.target.value)}
                          placeholder="メモを入力..."
                          rows={4}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-green-500 resize-none"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            <div className="mt-4 pt-4 border-t border-slate-200">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">現状</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editForm.current_status}
                    onChange={(e) => setEditForm({ ...editForm, current_status: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500"
                  />
                ) : (
                  <p className="text-slate-600">{company.current_status || '未設定'}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-600" />
              次回選考日
            </h3>
            {isEditing ? (
              <input
                type="date"
                value={editForm.next_selection_date}
                onChange={(e) => setEditForm({ ...editForm, next_selection_date: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500"
              />
            ) : (
              <p className="text-slate-800 font-semibold">
                {company.next_selection_date
                  ? new Date(company.next_selection_date).toLocaleDateString('ja-JP')
                  : '未設定'}
              </p>
            )}
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
              <Clock className="w-4 h-4 text-red-600" />
              ES・Webテスト締切
            </h3>
            {isEditing ? (
              <div className="space-y-2">
                <input
                  type="date"
                  value={editForm.es_deadline}
                  onChange={(e) => setEditForm({ ...editForm, es_deadline: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 text-sm"
                  placeholder="ES締切"
                />
                <input
                  type="date"
                  value={editForm.webtest_deadline}
                  onChange={(e) => setEditForm({ ...editForm, webtest_deadline: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 text-sm"
                  placeholder="Webテスト締切"
                />
              </div>
            ) : (
              <div className="space-y-1 text-sm">
                <p className="text-slate-800">
                  ES: {company.es_deadline
                    ? new Date(company.es_deadline).toLocaleDateString('ja-JP')
                    : '未設定'}
                </p>
                <p className="text-slate-800">
                  Web: {company.webtest_deadline
                    ? new Date(company.webtest_deadline).toLocaleDateString('ja-JP')
                    : '未設定'}
                </p>
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-sm font-bold text-slate-700 mb-3">Webテスト形式</h3>
            {isEditing ? (
              <input
                type="text"
                value={editForm.webtest_format}
                onChange={(e) => setEditForm({ ...editForm, webtest_format: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500"
              />
            ) : (
              <p className="text-slate-800 font-semibold">{company.webtest_format || '未設定'}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-lg font-bold text-slate-800 mb-4">メモ</h2>
            {isEditing ? (
              <textarea
                value={editForm.memo}
                onChange={(e) => setEditForm({ ...editForm, memo: e.target.value })}
                rows={6}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 resize-none"
                placeholder="メモを入力..."
              />
            ) : (
              <p className="text-slate-600 whitespace-pre-wrap">{company.memo || 'メモなし'}</p>
            )}
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-500" />
              志望度
            </h2>
            {isEditing ? (
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((level) => (
                  <button
                    key={level}
                    onClick={() => setEditForm({ ...editForm, motivation_level: level })}
                    className="p-2 hover:bg-slate-100 rounded transition-colors"
                  >
                    <Star
                      className={`w-8 h-8 ${
                        level <= editForm.motivation_level
                          ? 'text-yellow-400 fill-yellow-400'
                          : 'text-slate-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
            ) : (
              renderStars(company.motivation_level)
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-800">タスク・締切</h2>
            <button
              onClick={() => setShowAddTask(!showAddTask)}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <Plus className="w-4 h-4" />
              追加
            </button>
          </div>

          {showAddTask && (
            <div className="bg-slate-50 rounded-lg p-4 mb-4">
              <input
                type="text"
                placeholder="タスク名"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg mb-3 focus:outline-none focus:border-green-500"
              />
              <input
                type="date"
                value={newTaskDueDate}
                onChange={(e) => setNewTaskDueDate(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg mb-3 focus:outline-none focus:border-green-500"
              />
              <div className="flex gap-2">
                <button
                  onClick={addTask}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  保存
                </button>
                <button
                  onClick={() => setShowAddTask(false)}
                  className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-700 px-4 py-2 rounded-lg transition-colors"
                >
                  キャンセル
                </button>
              </div>
            </div>
          )}

          {tasks.length === 0 ? (
            <p className="text-slate-500 text-center py-8">タスクがありません</p>
          ) : (
            <div className="space-y-3">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className="p-4 rounded-lg border border-slate-200 hover:border-slate-300 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <button
                      onClick={() => toggleTaskComplete(task.id, task.completed)}
                      className="mt-1"
                    >
                      {task.completed ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : (
                        <Circle className="w-5 h-5 text-slate-400" />
                      )}
                    </button>
                    <div className="flex-1">
                      <h3
                        className={`font-semibold ${
                          task.completed ? 'text-slate-400 line-through' : 'text-slate-800'
                        }`}
                      >
                        {task.title}
                      </h3>
                      {task.due_date && (
                        <p className="text-sm text-slate-600 mt-1">
                          期限: {new Date(task.due_date).toLocaleDateString('ja-JP')}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => deleteTask(task.id)}
                      className="text-red-500 hover:text-red-700 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showImageResizer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full p-6">
            <h2 className="text-2xl font-bold text-slate-800 mb-4">画像プレビュー</h2>

            <div className="mb-6">
              <div className="w-full bg-slate-100 rounded-lg flex items-center justify-center p-8" style={{ maxHeight: '500px' }}>
                {imagePreview && (
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="max-w-full max-h-full object-contain rounded-lg"
                    style={{ maxHeight: '450px' }}
                  />
                )}
              </div>

              <div className="text-center text-sm text-slate-500 mt-4">
                画像は自動的に適切なサイズに調整されます
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleConfirmUpload}
                disabled={isUploadingImage}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                {isUploadingImage ? 'アップロード中...' : 'アップロード'}
              </button>
              <button
                onClick={handleCancelUpload}
                disabled={isUploadingImage}
                className="flex-1 bg-slate-200 hover:bg-slate-300 disabled:bg-slate-100 text-slate-700 font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                キャンセル
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
