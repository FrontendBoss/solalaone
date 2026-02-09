import { useState } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { Calculator, DollarSign, TrendingUp, Sun, LogOut, FileText, Settings as SettingsIcon, Presentation, Home, CreditCard } from 'lucide-react';
import { useAuth } from './contexts/AuthContext';
import Auth from './components/Auth';
import LoadCalculator from './components/LoadCalculator';
import CostEstimation from './components/CostEstimation';
import BudgetRecommendation from './components/BudgetRecommendation';
import ProposalsList from './components/ProposalsList';
import Settings from './components/Settings';
import MarketingSales from './components/MarketingSales';
import Pricing from './pages/Pricing';
import Success from './pages/Success';
import { PricingPage } from './pages/PricingPage';
import { SuccessPage } from './pages/SuccessPage';
import { PublicLandingPage } from './pages/PublicLandingPage';
import { Proposal } from './lib/supabase';
import { LoadItem, CostItem } from './types/solar';
import { STANDARD_WATTAGES } from './utils/calculations';
import {AutoDesignMain} from './pages/AutoDesignMain';

type Tab = 'calculator' | 'cost' | 'budget' | 'proposals' |'marketing'|'design';

function App() {
  const { user, installer, userSettings, loading, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('design');
  const [loadedProposal, setLoadedProposal] = useState<Proposal | null>(null);
  const [showSettings, setShowSettings] = useState(false);

  const [calculatorState, setCalculatorState] = useState({
    systemSize: 7.25,
    numberOfPanels: 20,
    panelCapacity: 400,
    backupMode: 'hours' as 'hours' | 'days',
    backupHours: 6,
    backupDays: 1,
    aiRecommendation: '',
    loadingAI: false,
    lockedFields: {
      systemSize: false,
      numberOfPanels: false,
      panelCapacity: false,
      backupHours: false,
      backupDays: false,
    },
    loads: {
      lights: [{ id: '1', name: 'LED Bulb', quantity: 10, wattage: 15 }] as LoadItem[],
      tvs: [{ id: '2', name: 'LED TV', quantity: 2, wattage: 80 }] as LoadItem[],
      fans: [{ id: '3', name: 'Ceiling Fan', quantity: 5, wattage: 75 }] as LoadItem[],
      refrigerators: [{ id: '4', name: 'Refrigerator', quantity: 1, wattage: 150 }] as LoadItem[],
      freezers: [] as LoadItem[],
      washingMachines: [] as LoadItem[],
      waterPumps: [] as LoadItem[],
      airConditioners: [] as LoadItem[],
      laptops: [{ id: '5', name: 'Laptop', quantity: 2, wattage: STANDARD_WATTAGES.laptop }] as LoadItem[],
      routers: [{ id: '6', name: 'Router', quantity: 1, wattage: STANDARD_WATTAGES.router }] as LoadItem[],
      cctvCameras: [] as LoadItem[],
    },
  });

  const [costEstimationState, setCostEstimationState] = useState({
    defaultPrices: {
      battery: 250,
      inverter: 800,
      chargeController: 350,
      dcBreaker: 25,
      acBreaker: 30,
      solarPanel: 180,
    },
    systemComponents: {
      batteries: 8,
      inverter: 1,
      chargeController: 1,
      dcBreakers: 4,
      acBreakers: 2,
      solarPanels: 20,
    },
    customItems: [] as CostItem[],
    lockedFields: {
      solarPanels: false,
      batteries: false,
      inverter: false,
      chargeController: false,
      dcBreakers: false,
      acBreakers: false,
    },
  });

  const [budgetRecommendationState, setBudgetRecommendationState] = useState({
    budget: 10000,
    recommendation: '',
    hasGenerated: false,
    editablePrices: {
      solarPanel: 180,
      battery: 250,
      inverterPerKw: 250,
      chargeController: 350,
      installation: 0.2,
    },
    lockedFields: {
      solarPanel: false,
      battery: false,
      inverterPerKw: false,
      chargeController: false,
      installation: false,
    },
  });

  const handleLoadProposal = (proposal: Proposal) => {
    setLoadedProposal(proposal);
    setActiveTab(proposal.proposal_type);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <Sun className="animate-spin text-yellow-500 mx-auto mb-4" size={48} />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user || !installer) {
    return (
      <Routes>
        <Route path="/" element={<PublicLandingPage />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/success" element={<Success />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    );
  }

  const tabs = [
    { id: 'design' as Tab, name: 'Solar assessement', icon: FileText },
    { id: 'calculator' as Tab, name: 'Load & System Calculator', icon: Calculator },
    { id: 'cost' as Tab, name: 'Cost Estimation', icon: DollarSign },
    { id: 'budget' as Tab, name: 'Budget Recommendation', icon: TrendingUp },
    { id: 'marketing' as Tab, name: 'Marketing & Sales', icon: Presentation },
    { id: 'proposals' as Tab, name: 'Saved Proposals', icon: FileText },

  ];

  const DashboardContent = () => {
    const navigate = useNavigate();

    return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="print-only bg-white border-b-2 border-gray-800 mb-6">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              {userSettings?.company_logo_url && (
                <img
                  src={userSettings.company_logo_url}
                  alt={userSettings.company_name || installer?.company_name || 'Company'}
                  className="h-16 mb-2 object-contain"
                />
              )}
              <h1 className="text-2xl font-bold text-gray-900">
                {userSettings?.company_name || installer?.company_name || 'Solar Company'}
              </h1>
              {userSettings?.company_tagline && (
                <p className="text-sm text-gray-600 mt-1">{userSettings.company_tagline}</p>
              )}
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-gray-900">Solar System Proposal</p>
              <p className="text-xs text-gray-600">{new Date().toLocaleDateString()}</p>
            </div>
          </div>
        </div>
      </div>

      <header className="no-print bg-white shadow-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-yellow-400 to-orange-500 p-3 rounded-lg shadow-lg">
                <Sun className="text-white" size={32} />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">SolalaSolar</h1>
                <p className="text-sm text-gray-600">Design, Estimate and generate proposal</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden md:block text-right text-sm">
                <div className="font-semibold text-gray-900">{installer.company_name}</div>
                <div className="text-gray-600">{installer.full_name}</div>
              </div>
              <button
                onClick={() => navigate('/')}
                className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                title="Home"
              >
                <Home size={18} />
                <span className="hidden sm:inline">Home</span>
              </button>
              <button
                onClick={() => navigate('/pricing')}
                className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                title="Pricing"
              >
                <CreditCard size={18} />
                <span className="hidden sm:inline">Pricing</span>
              </button>
              <button
                onClick={() => setShowSettings(true)}
                className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                title="Settings"
              >
                <SettingsIcon size={18} />
                <span className="hidden sm:inline">Settings</span>
              </button>
              <button
                onClick={() => signOut()}
                className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
              >
                <LogOut size={18} />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <nav className="no-print bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-4 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                  }`}
                >
                  <Icon size={20} />
                  {tab.name}
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {activeTab === 'design' && <AutoDesignMain />}
        {activeTab === 'calculator' && (
          <LoadCalculator
            loadedProposal={loadedProposal}
            state={calculatorState}
            setState={setCalculatorState}
          />
        )}
        {activeTab === 'cost' && (
          <CostEstimation
            loadedProposal={loadedProposal}
            state={costEstimationState}
            setState={setCostEstimationState}
          />
        )}
        {activeTab === 'budget' && (
          <BudgetRecommendation
            loadedProposal={loadedProposal}
            state={budgetRecommendationState}
            setState={setBudgetRecommendationState}
          />
        )}
        {activeTab === 'marketing' && <MarketingSales />}
        {activeTab === 'proposals' && <ProposalsList onLoadProposal={handleLoadProposal} />}
           
      </main>

      <footer className="no-print bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center text-sm text-gray-600">
            <p className="font-semibold text-gray-900 mb-1">SolalaSolar</p>
            <p>Professional solar system design and costing tool for installers and engineers</p>
            <p className="mt-2 text-xs">
              All calculations based on industry-standard assumptions. Consult certified professionals for installations.
            </p>
          </div>
        </div>
      </footer>

      {showSettings && <Settings onClose={() => setShowSettings(false)} />}
    </div>
    );
  };

  return (
    <Routes>
      <Route path="/" element={<PublicLandingPage />} />
      <Route path="/dashboard" element={<DashboardContent />} />
      <Route path="/pricing" element={<Pricing />} />
      <Route path="/success" element={<Success />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
