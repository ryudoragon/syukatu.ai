import { useState, useEffect } from 'react';
import { supabase, Company } from './lib/supabase';
import TopPage from './components/TopPage';
import CompanyPage from './components/CompanyPage';
import CompanyAnalysisPage from './components/CompanyAnalysisPage';
import ESPage from './components/ESPage';
import InterviewPage from './components/InterviewPage';
import AddCompanyModal from './components/AddCompanyModal';
import AuthModal from './components/AuthModal';
import { LogOut, User } from 'lucide-react';

type Page = 'top' | 'company' | 'analysis' | 'es' | 'interview';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('top');
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [showAddCompany, setShowAddCompany] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      (async () => {
        setUser(session?.user ?? null);
      })();
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
    setIsLoading(false);
  };

  const handleCompanySelect = (company: Company) => {
    setSelectedCompany(company);
    setCurrentPage('company');
  };

  const handleBack = () => {
    setCurrentPage('top');
    setSelectedCompany(null);
  };

  const handleBackToCompany = () => {
    setCurrentPage('company');
  };

  const handleAnalysis = () => {
    setCurrentPage('analysis');
  };

  const handleCompanyUpdate = (updatedCompany: Company) => {
    setSelectedCompany(updatedCompany);
  };

  const handleES = () => {
    setCurrentPage('es');
  };

  const handleInterview = () => {
    setCurrentPage('interview');
  };

  const handleCompanyDelete = () => {
    setCurrentPage('top');
    setSelectedCompany(null);
    window.location.reload();
  };

  const handleAddCompanySuccess = () => {
    setCurrentPage('top');
    window.location.reload();
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-slate-800 mb-4">就活タスク管理</h1>
          <p className="text-slate-600 mb-8">ログインして始めましょう</p>
          <button
            onClick={() => setShowAuth(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-lg transition-colors"
          >
            ログイン / 新規登録
          </button>
        </div>
        {showAuth && (
          <AuthModal
            onClose={() => setShowAuth(false)}
            onSuccess={() => setShowAuth(false)}
          />
        )}
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="fixed top-4 right-4 z-50">
        <button
          onClick={handleLogout}
          className="bg-white hover:bg-slate-100 text-slate-700 p-2 rounded-lg shadow-md transition-colors"
          title="ログアウト"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>

      {currentPage === 'top' && (
        <TopPage
          onCompanySelect={handleCompanySelect}
          onAddCompany={() => setShowAddCompany(true)}
        />
      )}

      {currentPage === 'company' && selectedCompany && (
        <CompanyPage
          company={selectedCompany}
          onBack={handleBack}
          onAnalysis={handleAnalysis}
          onES={handleES}
          onInterview={handleInterview}
          onDelete={handleCompanyDelete}
        />
      )}

      {currentPage === 'analysis' && selectedCompany && (
        <CompanyAnalysisPage
          company={selectedCompany}
          onBack={handleBackToCompany}
          onUpdate={handleCompanyUpdate}
        />
      )}

      {currentPage === 'es' && selectedCompany && (
        <ESPage company={selectedCompany} onBack={handleBackToCompany} />
      )}

      {currentPage === 'interview' && selectedCompany && (
        <InterviewPage company={selectedCompany} onBack={handleBackToCompany} />
      )}

      {showAddCompany && (
        <AddCompanyModal
          onClose={() => setShowAddCompany(false)}
          onSuccess={handleAddCompanySuccess}
        />
      )}
    </div>
  );
}

export default App;
