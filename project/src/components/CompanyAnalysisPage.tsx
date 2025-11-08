import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Building2, Save, ChevronDown, ChevronUp } from 'lucide-react';
import { supabase, Company } from '../lib/supabase';

type CompanyAnalysisPageProps = {
  company: Company;
  onBack: () => void;
  onUpdate?: (updatedCompany: Company) => void;
};

type AnalysisField = {
  key: keyof Company;
  label: string;
  placeholder: string;
};

const analysisFields: AnalysisField[] = [
  { key: 'revenue', label: '売上', placeholder: '売上を入力' },
  { key: 'employee_count', label: '従業員数', placeholder: '従業員数を入力' },
  { key: 'capital', label: '資本金', placeholder: '資本金を入力' },
  { key: 'philosophy', label: '理念', placeholder: '企業理念を入力' },
  { key: 'products', label: '製品', placeholder: '製品情報を入力' },
  { key: 'business_content', label: '事業内容', placeholder: '事業内容を入力' },
  { key: 'department_operations', label: '部門業務', placeholder: '部門業務を入力' },
  { key: 'career_plan', label: 'キャリアプラン', placeholder: 'キャリアプランを入力' },
  { key: 'company_culture', label: '社風', placeholder: '社風を入力' },
  { key: 'competitive_comparison', label: '競合比較', placeholder: '競合比較を入力' },
  { key: 'growth_potential', label: '成長性', placeholder: '成長性を入力' },
  { key: 'hiring_count', label: '採用数', placeholder: '採用数を入力' },
  { key: 'average_salary', label: '年収', placeholder: '年収を入力' },
  { key: 'benefits', label: '福利厚生', placeholder: '福利厚生を入力' },
  { key: 'average_tenure', label: '平均勤続年数', placeholder: '平均勤続年数を入力' },
  { key: 'overtime_hours', label: '残業時間', placeholder: '残業時間を入力' },
  { key: 'commercials', label: 'CM', placeholder: 'CM情報を入力' },
  { key: 'mid_term_plan', label: '中期経営計画', placeholder: '中期経営計画を入力' },
];

export default function CompanyAnalysisPage({ company, onBack, onUpdate }: CompanyAnalysisPageProps) {
  const [formData, setFormData] = useState<Partial<Company>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const textareaRefs = useRef<{ [key: string]: HTMLTextAreaElement | null }>({});

  useEffect(() => {
    const initialData: Record<string, string> = {};
    analysisFields.forEach(field => {
      const value = company[field.key];
      initialData[field.key] = (typeof value === 'string' ? value : '') || '';
    });
    setFormData(initialData);
  }, [company]);

  useEffect(() => {
    expandedSections.forEach(key => {
      adjustTextareaHeight(key as keyof Company);
    });
  }, [formData, expandedSections]);

  const toggleSection = (key: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(key)) {
        newSet.delete(key);
      } else {
        newSet.add(key);
      }
      return newSet;
    });
  };

  const adjustTextareaHeight = (key: keyof Company) => {
    const textarea = textareaRefs.current[key];
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.max(textarea.scrollHeight, 100)}px`;
    }
  };

  const handleChange = (key: keyof Company, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      alert('ログインが必要です');
      setIsSaving(false);
      return;
    }

    const updateData: Record<string, string | null> = {};
    analysisFields.forEach(field => {
      const value = formData[field.key];
      updateData[field.key] = (typeof value === 'string' && value.trim() !== '') ? value : null;
    });

    const { data, error } = await supabase
      .from('companies')
      .update(updateData)
      .eq('id', company.id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      console.error('Error saving company analysis:', error);
      alert(`保存に失敗しました: ${error.message}`);
    } else if (!data) {
      alert('保存に失敗しました: データが見つかりません');
    } else {
      console.log('Save successful:', data);
      alert('保存しました');
      if (onUpdate) {
        onUpdate(data as Company);
      }
    }

    setIsSaving(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-semibold">戻る</span>
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-slate-300 text-white px-4 py-2 rounded-lg transition-colors font-semibold"
          >
            <Save className="w-5 h-5" />
            {isSaving ? '保存中...' : '保存'}
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="bg-blue-100 p-3 rounded-xl">
              <Building2 className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-800">{company.name}</h1>
              <p className="text-slate-600 mt-1">企業分析</p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {analysisFields.map((field) => (
            <div key={field.key} className="bg-white rounded-lg shadow-md overflow-hidden">
              <button
                onClick={() => toggleSection(field.key)}
                className="w-full flex items-center justify-between px-6 py-4 hover:bg-slate-50 transition-colors"
              >
                <span className="text-lg font-semibold text-slate-800">{field.label}</span>
                {expandedSections.has(field.key) ? (
                  <ChevronUp className="w-5 h-5 text-slate-600" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-slate-600" />
                )}
              </button>

              {expandedSections.has(field.key) && (
                <div className="px-6 pb-6 pt-2">
                  <textarea
                    ref={(el) => (textareaRefs.current[field.key] = el)}
                    value={(formData[field.key] as string) || ''}
                    onChange={(e) => handleChange(field.key, e.target.value)}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 resize-none"
                    placeholder={field.placeholder}
                    style={{ minHeight: '100px' }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
