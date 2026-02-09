import { useState, useEffect } from 'react';
import { DollarSign, Zap, Battery, Sun, Loader2, TrendingUp, RefreshCw, RotateCcw, ListFilter } from 'lucide-react';
import { getBudgetBasedRecommendation } from '../services/aiService';
import { formatCurrency, calculateChargeController, getCurrencySymbol } from '../utils/calculations';
import ExportActions from './ExportActions';
import { ProposalData } from '../services/exportService';
import { Proposal, supabase } from '../lib/supabase';
import LockedInput from './LockedInput';
import { useAuth } from '../contexts/AuthContext';
import PriceListModal from './PriceListModal';
import { PriceList } from '../services/priceListService';

interface BudgetRecommendationState {
  budget: number;
  recommendation: string;
  hasGenerated: boolean;
  editablePrices: {
    solarPanel: number;
    battery: number;
    inverterPerKw: number;
    chargeController: number;
    installation: number;
  };
  lockedFields: {
    solarPanel: boolean;
    battery: boolean;
    inverterPerKw: boolean;
    chargeController: boolean;
    installation: boolean;
  };
}

interface BudgetRecommendationProps {
  loadedProposal: Proposal | null;
  state: BudgetRecommendationState;
  setState: React.Dispatch<React.SetStateAction<BudgetRecommendationState>>;
}

const getDefaultState = (): BudgetRecommendationState => ({
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

export default function BudgetRecommendation({ loadedProposal, state, setState }: BudgetRecommendationProps) {
  const { user, userSettings } = useAuth();
  const [currency, setCurrency] = useState('USD');
  const [loading, setLoading] = useState(false);
  const [showPriceListModal, setShowPriceListModal] = useState(false);

  const { budget, recommendation, hasGenerated, editablePrices, lockedFields } = state;

  const setBudget = (value: number) => setState(prev => ({ ...prev, budget: value }));
  const setRecommendation = (value: string) => setState(prev => ({ ...prev, recommendation: value }));
  const setHasGenerated = (value: boolean) => setState(prev => ({ ...prev, hasGenerated: value }));
  const setEditablePrices = (value: any) => setState(prev => ({ ...prev, editablePrices: value }));
  const setLockedFields = (value: any) => setState(prev => ({ ...prev, lockedFields: value }));

  const toggleLock = (field: keyof typeof lockedFields) => {
    setState(prev => ({
      ...prev,
      lockedFields: { ...prev.lockedFields, [field]: !prev.lockedFields[field] }
    }));
  };

  const handleResetToDefaults = () => {
    setState(getDefaultState());
  };

  const handleSelectPriceList = (priceList: PriceList) => {
    setEditablePrices({
      solarPanel: priceList.panel_price,
      battery: priceList.battery_price,
      inverterPerKw: priceList.inverter_price / 3.2,
      chargeController: priceList.charge_controller_price,
      installation: editablePrices.installation,
    });
  };

  useEffect(() => {
    const fetchCurrency = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('user_settings')
          .select('currency')
          .eq('user_id', user.id)
          .maybeSingle();

        if (data && !error) {
          setCurrency(data.currency);
        }
      } catch (error) {
        console.error('Error fetching currency:', error);
      }
    };

    fetchCurrency();
  }, [user]);

  useEffect(() => {
    if (userSettings && !loadedProposal) {
      const newPrices = {
        solarPanel: userSettings.default_solar_panel_price || 180,
        battery: userSettings.default_battery_price || 250,
        inverterPerKw: userSettings.default_inverter_per_kw_price || 250,
        chargeController: userSettings.default_charge_controller_price || 350,
        installation: userSettings.default_installation_percentage || 0.2,
      };

      // Only update if prices have actually changed
      const pricesChanged =
        editablePrices.solarPanel !== newPrices.solarPanel ||
        editablePrices.battery !== newPrices.battery ||
        editablePrices.inverterPerKw !== newPrices.inverterPerKw ||
        editablePrices.chargeController !== newPrices.chargeController ||
        editablePrices.installation !== newPrices.installation;

      if (pricesChanged) {
        setEditablePrices(newPrices);
      }
    }
  }, [userSettings, loadedProposal, editablePrices]);

  useEffect(() => {
    if (loadedProposal && loadedProposal.proposal_type === 'budget') {
      const data = loadedProposal.proposal_data;
      if (data.budget) setBudget(data.budget);
      if (data.editablePrices) setEditablePrices(data.editablePrices);
      if (data.recommendation) {
        setRecommendation(data.recommendation);
        setHasGenerated(true);
      }
    }
  }, [loadedProposal]);

  const handleRecalculate = () => {
  };

  const generateRecommendation = async () => {
    setLoading(true);
    const currencySymbol = getCurrencySymbol(currency);
    const result = await getBudgetBasedRecommendation({
      budget,
      currency,
      currencySymbol,
      prices: editablePrices,
    });
    setRecommendation(result);
    setLoading(false);
    setHasGenerated(true);
  };

  const availableForComponents = budget * (1 - editablePrices.installation);
  const avgCostPerKw = editablePrices.solarPanel * 2.5 + editablePrices.inverterPerKw + editablePrices.battery * 1.5 + editablePrices.chargeController / 3;
  const systemSize = Math.max(1, Math.floor(availableForComponents / avgCostPerKw));
  const numberOfPanels = Math.ceil(systemSize * 1000 / 400);
  const inverterKw = Math.ceil(systemSize * 1.2);
  const numberOfBatteries = Math.max(4, Math.floor((availableForComponents * 0.3) / editablePrices.battery));

  const estimatedCosts = {
    panels: numberOfPanels * editablePrices.solarPanel,
    inverter: inverterKw * editablePrices.inverterPerKw,
    batteries: numberOfBatteries * editablePrices.battery,
    chargeController: editablePrices.chargeController,
    installation: budget * editablePrices.installation,
  };

  const totalEstimated =
    estimatedCosts.panels +
    estimatedCosts.inverter +
    estimatedCosts.batteries +
    estimatedCosts.chargeController +
    estimatedCosts.installation;

  const supportedLoad = systemSize * 800;
  const backupHours = Math.floor((numberOfBatteries * 200 * 48) / (supportedLoad * 2));

  const sampleLoads = [
    { name: 'LED Lights', quantity: Math.floor(supportedLoad / 200), wattage: 15 },
    { name: 'Ceiling Fans', quantity: Math.floor(supportedLoad / 600), wattage: 75 },
    { name: 'LED TV', quantity: Math.floor(supportedLoad / 1500), wattage: 80 },
    { name: 'Refrigerator', quantity: 1, wattage: 150 },
    { name: 'Laptop', quantity: Math.floor(supportedLoad / 1000), wattage: 65 },
    { name: 'Router', quantity: 1, wattage: 10 },
  ].filter(load => load.quantity > 0);

  const proposalData: ProposalData = {
    clientName: '',
    systemSize,
    totalLoad: supportedLoad,
    inverterSize: inverterKw * 1000,
    numberOfPanels,
    panelCapacity: 400,
    batteries: numberOfBatteries,
    chargeController: calculateChargeController(numberOfPanels * 400),
    totalCost: totalEstimated,
    backupHours,
    dailyEnergy: (numberOfPanels * 400 * 5) / 1000,
    costBreakdown: estimatedCosts,
    sampleLoads,
    currency,
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg shadow-lg p-8 text-white">
            <h2 className="text-3xl font-bold mb-2 flex items-center gap-3">
              <DollarSign size={36} />
              Budget-Based System Designer
            </h2>
            <p className="text-blue-100 mb-6">
              Enter your budget and get an AI-powered solar system recommendation tailored to your investment
            </p>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <label className="block text-lg font-semibold mb-3">Total Budget Available</label>
              <div className="relative">
                <span className="absolute left-4 top-4 text-2xl text-white">{getCurrencySymbol(currency)}</span>
                <input
                  type="number"
                  value={budget}
                  onChange={e => setBudget(parseInt(e.target.value) || 0)}
                  className="w-full pl-20 pr-4 py-4 text-2xl font-bold bg-white/20 border-2 border-white/30 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-white"
                  placeholder="10000"
                />
              </div>
              <button
                onClick={generateRecommendation}
                disabled={loading || budget <= 0}
                className="w-full mt-4 bg-white text-blue-600 py-4 px-6 rounded-lg font-bold text-lg hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin" size={24} />
                    Generating Recommendation...
                  </>
                ) : (
                  <>
                    <TrendingUp size={24} />
                    Generate AI Recommendation
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-800">Adjust Component Prices</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowPriceListModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                >
                  <ListFilter size={18} />
                  Select Price List
                </button>
                <button
                  onClick={handleResetToDefaults}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                  title="Reset all values to defaults"
                >
                  <RotateCcw size={18} />
                  Reset
                </button>
                <button
                  onClick={handleRecalculate}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  <RefreshCw size={18} />
                  Recalculate
                </button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <LockedInput
                label="Solar Panel (400W)"
                value={editablePrices.solarPanel}
                onChange={value => setEditablePrices({ ...editablePrices, solarPanel: value })}
                locked={lockedFields.solarPanel}
                onToggleLock={() => toggleLock('solarPanel')}
                prefix={getCurrencySymbol(currency)}
              />
              <LockedInput
                label="Battery (200Ah, 12V)"
                value={editablePrices.battery}
                onChange={value => setEditablePrices({ ...editablePrices, battery: value })}
                locked={lockedFields.battery}
                onToggleLock={() => toggleLock('battery')}
                prefix={getCurrencySymbol(currency)}
              />
              <LockedInput
                label="Inverter (per kW)"
                value={editablePrices.inverterPerKw}
                onChange={value => setEditablePrices({ ...editablePrices, inverterPerKw: value })}
                locked={lockedFields.inverterPerKw}
                onToggleLock={() => toggleLock('inverterPerKw')}
                prefix={getCurrencySymbol(currency)}
              />
              <LockedInput
                label="Charge Controller"
                value={editablePrices.chargeController}
                onChange={value => setEditablePrices({ ...editablePrices, chargeController: value })}
                locked={lockedFields.chargeController}
                onToggleLock={() => toggleLock('chargeController')}
                prefix={getCurrencySymbol(currency)}
              />
              <div className="col-span-2">
                <LockedInput
                  label="Installation & BOS (% of budget)"
                  value={editablePrices.installation * 100}
                  onChange={value => setEditablePrices({ ...editablePrices, installation: value / 100 })}
                  locked={lockedFields.installation}
                  onToggleLock={() => toggleLock('installation')}
                  suffix="%"
                  step="1"
                />
              </div>
            </div>
          </div>

          {hasGenerated && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Zap className="text-yellow-500" />
                AI-Generated Recommendation
              </h3>
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="animate-spin text-blue-600" size={48} />
                </div>
              ) : (
                <div className="prose max-w-none">
                  <div className="bg-gray-50 rounded-lg p-6 text-gray-700 whitespace-pre-line">{recommendation}</div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="lg:col-span-1">
          <div className="sticky top-6 space-y-6">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Sun className="text-yellow-500" />
                Quick Estimate
              </h3>
              <div className="space-y-4">
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="text-sm text-gray-600 mb-1">System Size</div>
                  <div className="text-2xl font-bold text-blue-600">{systemSize} kW</div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="text-xs text-gray-600 mb-1">Solar Panels</div>
                    <div className="text-lg font-bold">{numberOfPanels}</div>
                    <div className="text-xs text-gray-500">400W each</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="text-xs text-gray-600 mb-1">Inverter</div>
                    <div className="text-lg font-bold">{inverterKw} kW</div>
                    <div className="text-xs text-gray-500">Pure sine</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="text-xs text-gray-600 mb-1">Batteries</div>
                    <div className="text-lg font-bold">{numberOfBatteries}</div>
                    <div className="text-xs text-gray-500">200Ah, 12V</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="text-xs text-gray-600 mb-1">Backup</div>
                    <div className="text-lg font-bold">{backupHours}h</div>
                    <div className="text-xs text-gray-500">Full load</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Battery className="text-green-500" />
                Supported Load
              </h3>
              <div className="mb-4">
                <div className="text-sm text-gray-600">Total Capacity</div>
                <div className="text-2xl font-bold text-gray-800">{supportedLoad.toLocaleString()}W</div>
                <div className="text-sm text-gray-500">{(supportedLoad / 1000).toFixed(2)} kW</div>
              </div>
              <div className="space-y-2">
                <div className="text-sm font-semibold text-gray-700 mb-2">Sample Load Breakdown:</div>
                {sampleLoads.map((load, index) => (
                  <div key={index} className="flex justify-between text-sm text-gray-600 bg-gray-50 p-2 rounded">
                    <span>
                      {load.quantity}× {load.name}
                    </span>
                    <span className="font-medium">{load.quantity * load.wattage}W</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-lg shadow-lg p-6 text-white">
              <h3 className="text-lg font-bold mb-4">Cost Breakdown</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Solar Panels</span>
                  <span className="font-semibold">{formatCurrency(estimatedCosts.panels, currency)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Inverter</span>
                  <span className="font-semibold">{formatCurrency(estimatedCosts.inverter, currency)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Batteries</span>
                  <span className="font-semibold">{formatCurrency(estimatedCosts.batteries, currency)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Charge Controller</span>
                  <span className="font-semibold">{formatCurrency(estimatedCosts.chargeController, currency)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Installation & BOS</span>
                  <span className="font-semibold">{formatCurrency(estimatedCosts.installation, currency)}</span>
                </div>
                <div className="border-t border-green-400 pt-2 mt-2">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Estimated Total</span>
                    <span>{formatCurrency(totalEstimated, currency)}</span>
                  </div>
                </div>
                {totalEstimated > budget && (
                  <div className="bg-red-500 text-white p-2 rounded text-xs mt-2">
                    Budget exceeded! Adjust component prices or increase budget.
                  </div>
                )}
                {totalEstimated < budget * 0.8 && (
                  <div className="bg-yellow-500 text-white p-2 rounded text-xs mt-2">
                    Budget underutilized. Consider upgrading components.
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6">
              <ExportActions proposalData={proposalData} proposalType="budget" />
            </div>
          </div>
        </div>
      </div>

      <PriceListModal
        isOpen={showPriceListModal}
        onClose={() => setShowPriceListModal(false)}
        onSelect={handleSelectPriceList}
        currencySymbol={getCurrencySymbol(currency)}
      />
    </div>
  );
}
