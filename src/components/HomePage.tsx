import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sun, Calculator, DollarSign, TrendingUp, Zap, Shield, BarChart3, ArrowRight, CreditCard } from 'lucide-react';
import { creditService, CreditBalance } from '../services/creditService';

interface HomePageProps {
  onGetStarted: () => void;
  companyName: string;
  installerName: string;
}

export default function HomePage({ onGetStarted, companyName, installerName }: HomePageProps) {
  const [balance, setBalance] = useState<CreditBalance | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadBalance();
  }, []);

  const loadBalance = async () => {
    const data = await creditService.getBalance();
    setBalance(data);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center bg-gradient-to-br from-yellow-400 to-orange-500 p-4 rounded-2xl shadow-2xl mb-6">
            <Sun className="text-white" size={64} />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-4">
            SolalaSolar
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-2">
            Professional Solar System Design & Costing Platform
          </p>
          <p className="text-lg text-gray-500 mb-6">
            Welcome, <span className="font-semibold text-gray-700">{installerName}</span> from <span className="font-semibold text-gray-700">{companyName}</span>
          </p>

          {balance && (
            <div className="flex items-center justify-center gap-4 mb-4">
              <div className="inline-flex items-center gap-3 bg-white rounded-xl px-6 py-3 shadow-lg border-2 border-blue-200">
                <CreditCard className="text-blue-600" size={24} />
                <div className="text-left">
                  <p className="text-xs text-gray-500">Your Credits</p>
                  <p className="text-2xl font-bold text-blue-600">{balance.total}</p>
                </div>
              </div>
              <button
                onClick={() => navigate('/pricing')}
                className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg"
              >
                {balance.subscription_tier ? 'Manage Credits' : 'Get Credits'}
              </button>
            </div>
          )}
        </div>

        <div className="max-w-4xl mx-auto mb-12">
          <div className="bg-gradient-to-br from-blue-600 to-orange-500 rounded-2xl shadow-2xl p-8 mb-8 text-white">
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-white/20 p-3 rounded-xl">
                <Zap className="text-white" size={32} />
              </div>
              <div>
                <div className="inline-flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full mb-2">
                  <span className="text-xs font-semibold">NEW FEATURE</span>
                </div>
                <h3 className="text-2xl font-bold">AI-Powered Solar Design</h3>
              </div>
            </div>
            <p className="text-lg mb-4 text-white/90">
              Create highly accurate solar designs without site visits. Analyze any property instantly with real satellite data, roof measurements, and shading analysis.
            </p>
            <button
              onClick={onGetStarted}
              className="inline-flex items-center gap-2 bg-white text-blue-600 px-6 py-3 rounded-xl font-bold hover:scale-105 transition-transform shadow-lg"
            >
              Try Solar Design Now
              <ArrowRight size={20} />
            </button>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow border border-gray-100">
              <div className="bg-blue-100 w-14 h-14 rounded-lg flex items-center justify-center mb-4">
                <Calculator className="text-blue-600" size={28} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Load Calculator</h3>
              <p className="text-gray-600">
                Calculate precise power requirements and design optimal solar systems based on client load profiles.
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow border border-gray-100">
              <div className="bg-green-100 w-14 h-14 rounded-lg flex items-center justify-center mb-4">
                <DollarSign className="text-green-600" size={28} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Cost Estimation</h3>
              <p className="text-gray-600">
                Generate detailed cost breakdowns with customizable pricing for accurate client quotations.
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow border border-gray-100">
              <div className="bg-orange-100 w-14 h-14 rounded-lg flex items-center justify-center mb-4">
                <TrendingUp className="text-orange-600" size={28} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Budget Planning</h3>
              <p className="text-gray-600">
                Get AI-powered recommendations for optimal system configurations within client budgets.
              </p>
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl shadow-2xl p-8 md:p-12 text-white mb-12">
            <div className="grid md:grid-cols-3 gap-8 mb-8">
              <div className="text-center">
                <Zap className="mx-auto mb-3 text-yellow-300" size={40} />
                <div className="text-3xl font-bold mb-1">Fast</div>
                <p className="text-blue-100">Generate proposals in minutes</p>
              </div>
              <div className="text-center">
                <Shield className="mx-auto mb-3 text-yellow-300" size={40} />
                <div className="text-3xl font-bold mb-1">Accurate</div>
                <p className="text-blue-100">Industry-standard calculations</p>
              </div>
              <div className="text-center">
                <BarChart3 className="mx-auto mb-3 text-yellow-300" size={40} />
                <div className="text-3xl font-bold mb-1">Professional</div>
                <p className="text-blue-100">Client-ready PDF proposals</p>
              </div>
            </div>

            <div className="text-center">
              <button
                onClick={onGetStarted}
                className="inline-flex items-center gap-3 bg-white text-blue-600 px-8 py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all"
              >
                Get Started
                <ArrowRight size={24} />
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
            <h3 className="text-2xl font-bold text-gray-900 mb-4 text-center">Key Features</h3>
            <ul className="grid md:grid-cols-2 gap-4">
              <li className="flex items-start gap-3">
                <div className="bg-green-100 rounded-full p-1 mt-1">
                  <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                </div>
                <span className="text-gray-700">Comprehensive load analysis with multiple appliance categories</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="bg-green-100 rounded-full p-1 mt-1">
                  <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                </div>
                <span className="text-gray-700">Automated battery, inverter, and panel sizing calculations</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="bg-green-100 rounded-full p-1 mt-1">
                  <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                </div>
                <span className="text-gray-700">Customizable component pricing and cost breakdowns</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="bg-green-100 rounded-full p-1 mt-1">
                  <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                </div>
                <span className="text-gray-700">AI-powered budget recommendations and optimization</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="bg-green-100 rounded-full p-1 mt-1">
                  <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                </div>
                <span className="text-gray-700">Professional PDF proposals with custom branding</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="bg-green-100 rounded-full p-1 mt-1">
                  <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                </div>
                <span className="text-gray-700">Save and manage multiple client proposals</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="bg-green-100 rounded-full p-1 mt-1">
                  <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                </div>
                <span className="text-gray-700">Export options via WhatsApp, email, and PDF</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="bg-green-100 rounded-full p-1 mt-1">
                  <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                </div>
                <span className="text-gray-700">Marketing materials and visual charts for clients</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="text-center text-gray-500 text-sm">
          <p>Designed for solar professionals who demand precision and professionalism</p>
        </div>
      </div>
    </div>
  );
}
