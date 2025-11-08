import { useState, useEffect } from 'react';
import { Search, Building2, Plus, Calendar, CheckCircle, ArrowUpDown, Filter, ChevronDown, ChevronUp, TrendingUp, FileText, Users } from 'lucide-react';
import { supabase, Company, Task } from '../lib/supabase';

type TopPageProps = {
  onCompanySelect: (company: Company) => void;
  onAddCompany: () => void;
};

type TaskWithCompany = Task & {
  company_name: string;
};

type SortOption = 'created_at' | 'es_deadline' | 'motivation_level';

export default function TopPage({ onCompanySelect, onAddCompany }: TopPageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [companies, setCompanies] = useState<Company[]>([]);
  const [filteredCompanies, setFilteredCompanies] = useState<Company[]>([]);
  const [upcomingTasks, setUpcomingTasks] = useState<TaskWithCompany[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('created_at');
  const [selectedIndustry, setSelectedIndustry] = useState<string>('all');
  const [isStatsExpanded, setIsStatsExpanded] = useState(false);
  const [stats, setStats] = useState({
    activeCompanies: 0,
    selectionSteps: {} as Record<string, number>,
    esCount: 0,
    analysisCount: 0,
    interviewCount: 0,
  });
  const [upcomingDeadlines, setUpcomingDeadlines] = useState<Array<{
    type: 'task' | 'next_selection';
    company_id: string;
    company_name: string;
    date: string;
    title: string;
  }>>([]);

  useEffect(() => {
    loadCompanies();
    loadUpcomingTasks();
    loadStats();
    loadUpcomingDeadlines();
  }, []);

  useEffect(() => {
    let filtered = [...companies];

    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (company) =>
          company.name.toLowerCase().includes(query) ||
          company.industry.toLowerCase().includes(query) ||
          company.location.toLowerCase().includes(query)
      );
    }

    if (selectedIndustry !== 'all') {
      filtered = filtered.filter(
        (company) => company.industry === selectedIndustry
      );
    }

    filtered.sort((a, b) => {
      if (sortBy === 'created_at') {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      } else if (sortBy === 'es_deadline') {
        const aDate = a.es_deadline ? new Date(a.es_deadline).getTime() : Infinity;
        const bDate = b.es_deadline ? new Date(b.es_deadline).getTime() : Infinity;
        return aDate - bDate;
      } else if (sortBy === 'motivation_level') {
        return b.motivation_level - a.motivation_level;
      }
      return 0;
    });

    setFilteredCompanies(filtered);
  }, [searchQuery, companies, sortBy, selectedIndustry]);

  const loadCompanies = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('companies')
      .select('*');

    if (error) {
      console.error('Error loading companies:', error);
    } else {
      setCompanies(data || []);
    }
    setIsLoading(false);
  };

  const industries = ['all', ...Array.from(new Set(companies.map(c => c.industry).filter(Boolean)))].sort();

  const loadUpcomingTasks = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const today = new Date().toISOString().split('T')[0];

    const { data: tasks, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', user.id)
      .eq('completed', false)
      .gte('due_date', today)
      .order('due_date', { ascending: true })
      .limit(5);

    if (error) {
      console.error('Error loading upcoming tasks:', error);
      return;
    }

    if (!tasks || tasks.length === 0) {
      setUpcomingTasks([]);
      return;
    }

    const companyIds = [...new Set(tasks.map(t => t.company_id).filter(Boolean))];

    const { data: companies } = await supabase
      .from('companies')
      .select('id, name')
      .in('id', companyIds);

    const companyMap = new Map(companies?.map(c => [c.id, c.name]) || []);

    const tasksWithCompany = tasks.map(task => ({
      ...task,
      company_name: companyMap.get(task.company_id) || '不明',
    }));

    setUpcomingTasks(tasksWithCompany);
  };

  const toggleTaskComplete = async (taskId: string) => {
    const { error } = await supabase
      .from('tasks')
      .update({ completed: true })
      .eq('id', taskId);

    if (error) {
      console.error('Error updating task:', error);
    } else {
      loadUpcomingTasks();
    }
  };

  const loadStats = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: companiesData } = await supabase
      .from('companies')
      .select('id')
      .eq('user_id', user.id);
    const activeCompanies = companiesData?.length || 0;

    const { data: stepsData } = await supabase
      .from('selection_steps')
      .select('step_name');
    const selectionSteps: Record<string, number> = {};
    stepsData?.forEach((step) => {
      const stepName = step.step_name || '未設定';
      selectionSteps[stepName] = (selectionSteps[stepName] || 0) + 1;
    });

    const { data: esData } = await supabase
      .from('entry_sheets')
      .select('id')
      .eq('user_id', user.id);
    const esCount = esData?.length || 0;

    const { data: companiesWithAnalysis } = await supabase
      .from('companies')
      .select('id')
      .eq('user_id', user.id)
      .neq('business_content', '')
      .neq('business_content', null);
    const analysisCount = companiesWithAnalysis?.length || 0;

    const { data: interviewData } = await supabase
      .from('interviews')
      .select('id')
      .eq('user_id', user.id);
    const interviewCount = interviewData?.length || 0;

    setStats({
      activeCompanies,
      selectionSteps,
      esCount,
      analysisCount,
      interviewCount,
    });
  };

  const loadUpcomingDeadlines = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const today = new Date().toISOString().split('T')[0];

    const { data: tasksData } = await supabase
      .from('tasks')
      .select('id, title, due_date, company_id, companies(name)')
      .eq('user_id', user.id)
      .eq('completed', false)
      .gte('due_date', today)
      .order('due_date', { ascending: true })
      .limit(10);

    const { data: companiesData } = await supabase
      .from('companies')
      .select('id, name, next_selection_date')
      .eq('user_id', user.id)
      .gte('next_selection_date', today)
      .order('next_selection_date', { ascending: true })
      .limit(10);

    const deadlines: Array<{
      type: 'task' | 'next_selection';
      company_id: string;
      company_name: string;
      date: string;
      title: string;
    }> = [];

    tasksData?.forEach((task) => {
      if (task.due_date && task.companies) {
        deadlines.push({
          type: 'task',
          company_id: task.company_id,
          company_name: (task.companies as any).name,
          date: task.due_date,
          title: task.title,
        });
      }
    });

    companiesData?.forEach((company) => {
      if (company.next_selection_date) {
        deadlines.push({
          type: 'next_selection',
          company_id: company.id,
          company_name: company.name,
          date: company.next_selection_date,
          title: '次回選考',
        });
      }
    });

    deadlines.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    setUpcomingDeadlines(deadlines.slice(0, 10));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            <div className="text-center mb-8">
              <div className="flex items-center justify-center mb-4">
                <Building2 className="w-12 h-12 text-blue-600" />
              </div>
              <h1 className="text-4xl font-bold text-slate-800 mb-3">
                就活タスク管理
              </h1>
              <p className="text-slate-600 text-lg">
                企業情報を検索して、就職活動を効率的に管理しましょう
              </p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <button
              onClick={() => setIsStatsExpanded(!isStatsExpanded)}
              className="flex items-center justify-between w-full mb-4 hover:opacity-80 transition-opacity"
            >
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-red-600" />
                <h2 className="text-lg font-bold text-slate-800">直近の締切</h2>
              </div>
              {isStatsExpanded ? <ChevronUp className="w-5 h-5 text-slate-600" /> : <ChevronDown className="w-5 h-5 text-slate-600" />}
            </button>

            {isStatsExpanded && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="w-5 h-5 text-blue-600" />
                      <h3 className="text-sm font-bold text-slate-800">選考中企業数</h3>
                    </div>
                    <div className="text-3xl font-bold text-blue-600">
                      {stats.activeCompanies}
                      <span className="text-sm font-normal text-slate-600 ml-2">社</span>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="w-5 h-5 text-orange-600" />
                      <h3 className="text-sm font-bold text-slate-800">活動量</h3>
                    </div>
                    <div className="space-y-1 text-xs text-slate-700">
                      <div>ES: <span className="font-bold text-slate-800">{stats.esCount}</span></div>
                      <div>分析: <span className="font-bold text-slate-800">{stats.analysisCount}</span></div>
                      <div>面接: <span className="font-bold text-slate-800">{stats.interviewCount}</span></div>
                    </div>
                  </div>
                </div>

                {upcomingDeadlines.length === 0 ? (
                  <p className="text-slate-500 text-sm text-center py-4">
                    直近の締切はありません
                  </p>
                ) : (
                  <div className="space-y-2">
                    {upcomingDeadlines.map((deadline, index) => (
                      <div
                        key={`${deadline.company_id}-${deadline.type}-${index}`}
                        className="flex items-center justify-between p-3 bg-slate-50 hover:bg-slate-100 rounded-lg cursor-pointer transition-colors border border-slate-200"
                        onClick={() => {
                          const company = companies.find(c => c.id === deadline.company_id);
                          if (company) onCompanySelect(company);
                        }}
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-slate-800">{deadline.company_name}</span>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${
                              deadline.type === 'task'
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-green-100 text-green-700'
                            }`}>
                              {deadline.type === 'task' ? 'タスク' : '次回選考'}
                            </span>
                          </div>
                          <p className="text-sm text-slate-600">{deadline.title}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-red-600">
                            {new Date(deadline.date).toLocaleDateString('ja-JP')}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <div className="relative mb-6">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="text"
              placeholder="企業名、業界、場所で検索..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 transition-colors text-lg"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                <ArrowUpDown className="w-4 h-4" />
                並び順
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 transition-colors bg-white"
              >
                <option value="created_at">登録順（新しい順）</option>
                <option value="es_deadline">ES締切順（近い順）</option>
                <option value="motivation_level">志望度順（高い順）</option>
              </select>
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                <Filter className="w-4 h-4" />
                業界
              </label>
              <select
                value={selectedIndustry}
                onChange={(e) => setSelectedIndustry(e.target.value)}
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 transition-colors bg-white"
              >
                {industries.map((industry) => (
                  <option key={industry} value={industry}>
                    {industry === 'all' ? 'すべての業界' : industry}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            onClick={onAddCompany}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" />
            新しい企業を追加
          </button>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredCompanies.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <Building2 className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 text-lg">
              {searchQuery
                ? '検索結果が見つかりませんでした'
                : '企業が登録されていません。上のボタンから追加してください。'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCompanies.map((company) => (
              <div
                key={company.id}
                onClick={() => onCompanySelect(company)}
                className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all cursor-pointer p-6 border-2 border-transparent hover:border-blue-500 group"
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className="bg-blue-100 p-2 rounded-lg group-hover:bg-blue-600 transition-colors">
                    <Building2 className="w-5 h-5 text-blue-600 group-hover:text-white transition-colors" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-lg text-slate-800 truncate group-hover:text-blue-600 transition-colors">
                      {company.name}
                    </h3>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  {company.industry && (
                    <p className="text-slate-600">
                      <span className="font-semibold">業界:</span> {company.industry}
                    </p>
                  )}
                  {company.location && (
                    <p className="text-slate-600">
                      <span className="font-semibold">場所:</span> {company.location}
                    </p>
                  )}
                  {company.description && (
                    <p className="text-slate-500 line-clamp-2">
                      {company.description}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
