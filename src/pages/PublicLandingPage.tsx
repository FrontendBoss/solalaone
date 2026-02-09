import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import {
  Sun,
  Zap,
  MapPin,
  Building2,
  TrendingUp,
  Shield,
  ArrowRight,
  CheckCircle,
  Sparkles,
  BarChart3,
  Calculator,
  FileText,
  Clock,
  DollarSign
} from 'lucide-react';

export function PublicLandingPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null);

  const handleGetStarted = () => {
    if (user) {
      navigate('/dashboard');
    } else {
      navigate('/auth');
    }
  };

  const features = [
    {
      icon: MapPin,
      title: 'AI-Powered Site Analysis',
      description: 'Analyze any property instantly using Google Solar API with billions of data points',
      color: 'blue',
      gradient: 'from-blue-500 to-cyan-500'
    },
    {
      icon: Building2,
      title: 'Zero Site Visits Required',
      description: 'Create highly accurate solar designs without ever visiting the property',
      color: 'green',
      gradient: 'from-green-500 to-emerald-500'
    },
    {
      icon: Sun,
      title: 'Real Solar Data',
      description: 'Get actual sunlight measurements, shading analysis, and roof geometry',
      color: 'yellow',
      gradient: 'from-yellow-500 to-orange-500'
    },
    {
      icon: Calculator,
      title: 'Instant Calculations',
      description: 'Automatic system sizing, energy production, and cost estimation',
      color: 'red',
      gradient: 'from-red-500 to-pink-500'
    },
    {
      icon: FileText,
      title: 'Professional Proposals',
      description: 'Generate client-ready PDF proposals with detailed specifications',
      color: 'purple',
      gradient: 'from-purple-500 to-indigo-500'
    },
    {
      icon: Clock,
      title: 'Save Time & Money',
      description: 'Complete assessments in minutes instead of hours or days',
      color: 'teal',
      gradient: 'from-teal-500 to-cyan-500'
    }
  ];

  const benefits = [
    'Access real satellite imagery and solar data',
    'Measure exact roof dimensions and pitch',
    'Calculate shading from trees and buildings',
    'Visualize monthly solar irradiance patterns',
    'Optimize panel placement automatically',
    'Generate accurate energy production forecasts',
    'Create detailed financial projections',
    'Export professional proposals instantly'
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 bg-white/90 backdrop-blur-md border-b border-gray-200 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="bg-gradient-to-br from-yellow-400 to-orange-500 p-2 rounded-lg">
                <Sun className="text-white" size={24} />
              </div>
              <span className="text-xl font-bold text-gray-900">SolalaSolar</span>
            </div>
            <button
              onClick={handleGetStarted}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition-all shadow-lg hover:shadow-xl"
            >
              {user ? 'Design View' : 'Sign In'}
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 bg-gradient-to-br from-blue-50 via-white to-orange-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full mb-6">
                <Sparkles size={16} />
                <span className="text-sm font-semibold">Powered by Google Gemini</span>
              </div>
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight">
                Design Solar Systems
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-orange-500">
                  Without Site Visits
                </span>
              </h1>
              <p className="text-xl md:text-2xl text-gray-600 mb-8 leading-relaxed">
                Create highly accurate solar designs using AI-powered satellite data and real solar measurements. Save time, reduce costs, and impress clients.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={handleGetStarted}
                  className="group inline-flex items-center justify-center gap-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-xl hover:shadow-2xl transition-all transform hover:scale-105"
                >
                  {user ? 'Design View' : 'Get Started Free'}
                  <ArrowRight className="group-hover:translate-x-1 transition-transform" size={24} />
                </button>
                <button
                  onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                  className="inline-flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-gray-900 px-8 py-4 rounded-xl font-bold text-lg border-2 border-gray-200 shadow-lg hover:shadow-xl transition-all"
                >
                  Learn More
                </button>
              </div>
              <div className="flex items-center gap-8 mt-8 text-gray-600">
                <div>
                  <div className="text-3xl font-bold text-gray-900">10x</div>
                  <div className="text-sm">Faster Assessments</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-gray-900">$0</div>
                  <div className="text-sm">Site Visit Costs</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-gray-900">99%</div>
                  <div className="text-sm">Accuracy</div>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-orange-500 rounded-3xl blur-3xl opacity-20"></div>
              <div className="relative bg-white rounded-2xl shadow-2xl p-6 border border-gray-200">
                <div className="aspect-video bg-gradient-to-br from-blue-100 to-orange-100 rounded-xl overflow-hidden mb-4 relative">
                  <img
                    src="/solar_6.png"
                    alt="Solar Design Dashboard"
                    className="w-full h-full object-cover rounded-xl"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/solar_7.png';
                      target.onerror = () => {
                        target.style.display = 'none';
                      };
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-6">
                    <div className="text-white">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                        <span className="text-sm font-semibold">Live Solar Analysis</span>
                      </div>
                   
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-blue-50 rounded-lg p-3 text-center border border-blue-200">
                    <div className="text-2xl font-bold text-blue-600">24</div>
                    <div className="text-xs text-gray-600">Panels</div>
                  </div>
                  <div className="bg-green-50 rounded-lg p-3 text-center border border-green-200">
                    <div className="text-2xl font-bold text-green-600">9.6kW</div>
                    <div className="text-xs text-gray-600">System Size</div>
                  </div>
                  <div className="bg-orange-50 rounded-lg p-3 text-center border border-orange-200">
                    <div className="text-2xl font-bold text-orange-600">12.5k</div>
                    <div className="text-xs text-gray-600">kWh/year</div>
                  </div>
                </div>
                <div className="mt-4 bg-gradient-to-r from-blue-50 to-orange-50 rounded-lg p-4 border border-gray-200">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="text-green-600 flex-shrink-0" size={16} />
                      <span className="text-sm text-gray-700">Roof geometry detected</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="text-green-600 flex-shrink-0" size={16} />
                      <span className="text-sm text-gray-700">Shading analysis complete</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="text-green-600 flex-shrink-0" size={16} />
                      <span className="text-sm text-gray-700">System optimized</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Everything You Need in One Platform
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Professional solar planning tools powered by cutting-edge technology
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              const isHovered = hoveredFeature === index;

              return (
                <div
                  key={index}
                  onMouseEnter={() => setHoveredFeature(index)}
                  onMouseLeave={() => setHoveredFeature(null)}
                  className={`group bg-white rounded-2xl p-8 border-2 transition-all duration-300 cursor-pointer ${
                    isHovered
                      ? 'border-transparent shadow-2xl scale-105'
                      : 'border-gray-200 shadow-lg hover:shadow-xl'
                  }`}
                  style={{
                    background: isHovered
                      ? `linear-gradient(135deg, var(--tw-gradient-stops))`
                      : 'white'
                  }}
                >
                  <div className={`inline-flex items-center justify-center w-14 h-14 rounded-xl mb-4 transition-all duration-300 ${
                    isHovered
                      ? 'bg-white'
                      : `bg-gradient-to-br ${feature.gradient}`
                  }`}>
                    <Icon
                      className={`transition-all duration-300 ${
                        isHovered ? `text-${feature.color}-600` : 'text-white'
                      }`}
                      size={28}
                    />
                  </div>
                  <h3 className={`text-xl font-bold mb-2 transition-colors ${
                    isHovered ? 'text-white' : 'text-gray-900'
                  }`}>
                    {feature.title}
                  </h3>
                  <p className={`transition-colors ${
                    isHovered ? 'text-white/90' : 'text-gray-600'
                  }`}>
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600">
              From address to proposal in minutes
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              { icon: MapPin, title: 'Enter Address', desc: 'Simply type in any property address' },
              { icon: Sparkles, title: 'AI Analysis', desc: 'Our AI analyzes satellite data instantly' },
              { icon: Sun, title: 'Design System', desc: 'Get optimized panel layout and sizing' },
              { icon: FileText, title: 'Generate Proposal', desc: 'Export professional PDF proposals' }
            ].map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={index} className="relative">
                  {index < 3 && (
                    <div className="hidden md:block absolute top-12 left-full w-full h-0.5 bg-gradient-to-r from-blue-600 to-orange-500 -z-10"></div>
                  )}
                  <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-orange-500 rounded-full mb-4">
                      <Icon className="text-white" size={32} />
                    </div>
                    <div className="text-3xl font-bold text-blue-600 mb-2">{index + 1}</div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">{step.title}</h3>
                    <p className="text-gray-600 text-sm">{step.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Complete Solar Design Platform
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                Every tool you need to create professional solar proposals, all powered by real data from Google's Solar API.
              </p>
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mt-0.5">
                      <CheckCircle className="text-green-600" size={16} />
                    </div>
                    <span className="text-gray-700 text-lg">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 border border-blue-200">
                <BarChart3 className="text-blue-600 mb-3" size={32} />
                <div className="text-3xl font-bold text-gray-900 mb-1">500+</div>
                <div className="text-gray-600">Projects Designed</div>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6 border border-green-200">
                <TrendingUp className="text-green-600 mb-3" size={32} />
                <div className="text-3xl font-bold text-gray-900 mb-1">95%</div>
                <div className="text-gray-600">Customer Satisfaction</div>
              </div>
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl p-6 border border-orange-200">
                <Clock className="text-orange-600 mb-3" size={32} />
                <div className="text-3xl font-bold text-gray-900 mb-1">5 min</div>
                <div className="text-gray-600">Average Design Time</div>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-6 border border-purple-200">
                <DollarSign className="text-purple-600 mb-3" size={32} />
                <div className="text-3xl font-bold text-gray-900 mb-1">70%</div>
                <div className="text-gray-600">Cost Reduction</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-blue-600 to-blue-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Shield className="mx-auto text-white mb-6" size={64} />
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Transform Your Solar Business?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join hundreds of solar professionals who are saving time and closing more deals with accurate, data-driven solar designs.
          </p>
          <button
            onClick={handleGetStarted}
            className="inline-flex items-center gap-3 bg-white text-blue-600 px-8 py-4 rounded-xl font-bold text-lg shadow-2xl hover:shadow-3xl hover:scale-105 transition-all"
          >
            {user ? 'Design View' : 'Start Designing Today'}
            <ArrowRight size={24} />
          </button>
          {!user && <p className="text-blue-100 mt-4">No credit card required</p>}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="bg-gradient-to-br from-yellow-400 to-orange-500 p-2 rounded-lg">
                <Sun className="text-white" size={20} />
              </div>
              <span className="font-bold">SolalaSolar</span>
            </div>
            <div className="text-gray-400 text-sm">
              Powered by Google Gemini
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
