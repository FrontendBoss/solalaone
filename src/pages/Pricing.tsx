import { useEffect, useState } from 'react';
import { CreditCard, Check, Zap } from 'lucide-react';
import { creditService, CreditBalance } from '../services/creditService';
import { useNavigate } from 'react-router-dom';

interface SubscriptionTier {
  id: 'basic' | 'professional' | 'premier';
  name: string;
  price: number;
  credits: number;
  features: string[];
  popular?: boolean;
}

interface TopUpPack {
  credits: number;
  price: number;
  savings?: string;
}

const SUBSCRIPTION_TIERS: SubscriptionTier[] = [
  {
    id: 'basic',
    name: 'Basic',
    price: 49,
    credits: 120,
    features: [
      '120 credits per month',
      'Google Solar API access',
      'Basic support',
      'Export to PDF',
    ],
  },
  {
    id: 'professional',
    name: 'Professional',
    price: 99,
    credits: 250,
    features: [
      '250 credits per month',
      'Google Solar API access',
      'Priority support',
      'Export to PDF',
      'Advanced analytics',
    ],
    popular: true,
  },
  {
    id: 'premier',
    name: 'Premier',
    price: 349,
    credits: 1000,
    features: [
      '1000 credits per month',
      'Google Solar API access',
      'Dedicated support',
      'Export to PDF',
      'Advanced analytics',
      'API access',
    ],
  },
];

const TOPUP_PACKS: TopUpPack[] = [
  { credits: 15, price: 10 },
  { credits: 30, price: 20 },
  { credits: 70, price: 50, savings: 'Save $10' },
  { credits: 150, price: 100, savings: 'Best Value' },
];

export default function Pricing() {
  const [balance, setBalance] = useState<CreditBalance | null>(null);
  const [loading, setLoading] = useState(true);
  const [processingCheckout, setProcessingCheckout] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadBalance();
  }, []);

  const loadBalance = async () => {
    setLoading(true);
    const data = await creditService.getBalance();
    setBalance(data);
    setLoading(false);
  };

  const handleSubscribe = async (tier: 'basic' | 'professional' | 'premier') => {
    try {
      setProcessingCheckout(tier);
      const result = await creditService.createCheckoutSession({
        type: 'subscription',
        tier,
      });
      if (result?.url) {
        window.location.href = result.url;
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Failed to create checkout session. Please try again.');
    } finally {
      setProcessingCheckout(null);
    }
  };

  const handleTopUp = async (credits: number) => {
    try {
      setProcessingCheckout(`topup-${credits}`);
      const result = await creditService.createCheckoutSession({
        type: 'topup',
        credits,
      });
      if (result?.url) {
        window.location.href = result.url;
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Failed to create checkout session. Please try again.');
    } finally {
      setProcessingCheckout(null);
    }
  };

  const isSubscribed = balance?.subscription_tier !== null;
  const hasCredits = (balance?.total ?? 0) > 0;
  const showTopUpPrimary = isSubscribed && !hasCredits;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-slate-800 mb-4">
            {showTopUpPrimary ? 'Need More Credits?' : 'Choose Your Plan'}
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            {showTopUpPrimary
              ? 'Top up your credits instantly to continue your solar assessments'
              : isSubscribed
              ? 'Manage your subscription and add-on credits'
              : 'Get started with solar planning and design'}
          </p>

          {balance && (
            <div className="mt-8 inline-flex items-center gap-4 bg-white rounded-2xl px-8 py-4 shadow-lg">
              <div className="text-left">
                <p className="text-sm text-slate-500">Your Credits</p>
                <p className="text-3xl font-bold text-blue-600">{balance.total}</p>
                <p className="text-xs text-slate-400">
                  {balance.monthly_allowance} monthly + {balance.purchased_credits} purchased
                </p>
              </div>
              {isSubscribed && (
                <div className="text-left border-l border-slate-200 pl-4">
                  <p className="text-sm text-slate-500">Current Plan</p>
                  <p className="text-lg font-semibold text-slate-800 capitalize">
                    {balance.subscription_tier}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {showTopUpPrimary && (
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-center text-slate-800 mb-8">
              Top-Up Credit Packs
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
              {TOPUP_PACKS.map((pack) => (
                <div
                  key={pack.credits}
                  className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all border-2 border-slate-200 hover:border-blue-500"
                >
                  {pack.savings && (
                    <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-full inline-block mb-4">
                      {pack.savings}
                    </div>
                  )}
                  <div className="flex items-baseline gap-2 mb-4">
                    <span className="text-4xl font-bold text-slate-800">${pack.price}</span>
                  </div>
                  <div className="mb-6">
                    <p className="text-2xl font-semibold text-blue-600">{pack.credits} Credits</p>
                    <p className="text-sm text-slate-500">
                      ${(pack.price / pack.credits).toFixed(2)} per credit
                    </p>
                  </div>
                  <button
                    onClick={() => handleTopUp(pack.credits)}
                    disabled={processingCheckout === `topup-${pack.credits}`}
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {processingCheckout === `topup-${pack.credits}` ? 'Processing...' : 'Buy Now'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {!isSubscribed && (
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-center text-slate-800 mb-8">
              Subscription Plans
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {SUBSCRIPTION_TIERS.map((tier) => (
                <div
                  key={tier.id}
                  className={`bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all ${
                    tier.popular
                      ? 'border-4 border-blue-500 transform scale-105'
                      : 'border-2 border-slate-200'
                  }`}
                >
                  {tier.popular && (
                    <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm font-bold px-4 py-2 rounded-full inline-block mb-4">
                      Most Popular
                    </div>
                  )}
                  <h3 className="text-2xl font-bold text-slate-800 mb-2">{tier.name}</h3>
                  <div className="flex items-baseline gap-2 mb-6">
                    <span className="text-5xl font-bold text-slate-800">${tier.price}</span>
                    <span className="text-slate-500">/month</span>
                  </div>
                  <div className="mb-6">
                    <p className="text-lg font-semibold text-blue-600">{tier.credits} credits/month</p>
                  </div>
                  <ul className="space-y-3 mb-8">
                    {tier.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-slate-600">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={() => handleSubscribe(tier.id)}
                    disabled={processingCheckout === tier.id}
                    className={`w-full py-4 rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                      tier.popular
                        ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800'
                        : 'bg-slate-100 text-slate-800 hover:bg-slate-200'
                    }`}
                  >
                    {processingCheckout === tier.id ? 'Processing...' : 'Get Started'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {isSubscribed && hasCredits && (
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-center text-slate-800 mb-8">
              Add-On Credit Packs
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
              {TOPUP_PACKS.map((pack) => (
                <div
                  key={pack.credits}
                  className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all border-2 border-slate-200 hover:border-blue-500"
                >
                  {pack.savings && (
                    <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-full inline-block mb-4">
                      {pack.savings}
                    </div>
                  )}
                  <div className="flex items-baseline gap-2 mb-4">
                    <span className="text-4xl font-bold text-slate-800">${pack.price}</span>
                  </div>
                  <div className="mb-6">
                    <p className="text-2xl font-semibold text-blue-600">{pack.credits} Credits</p>
                    <p className="text-sm text-slate-500">
                      ${(pack.price / pack.credits).toFixed(2)} per credit
                    </p>
                  </div>
                  <button
                    onClick={() => handleTopUp(pack.credits)}
                    disabled={processingCheckout === `topup-${pack.credits}`}
                    className="w-full bg-slate-100 text-slate-800 py-3 rounded-xl font-semibold hover:bg-slate-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {processingCheckout === `topup-${pack.credits}` ? 'Processing...' : 'Buy Credits'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="text-center mt-12">
          <button
            onClick={() => navigate('/')}
            className="text-slate-600 hover:text-slate-800 font-medium"
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
