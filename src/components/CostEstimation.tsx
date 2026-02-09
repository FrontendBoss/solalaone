import { useState, useEffect } from 'react';
import { Plus, Trash2, DollarSign, Calculator, RefreshCw, RotateCcw, ListFilter } from 'lucide-react';
import { CostItem } from '../types/solar';
import { formatCurrency, calculateChargeController, getCurrencySymbol } from '../utils/calculations';
import ExportActions from './ExportActions';
import { ProposalData } from '../services/exportService';
import { Proposal, supabase } from '../lib/supabase';
import LockedInput from './LockedInput';
import { useAuth } from '../contexts/AuthContext';
import PriceListModal from './PriceListModal';
import { PriceList } from '../services/priceListService';
import CostChart from './CostChart';

interface CostEstimationState {
  defaultPrices: {
    battery: number;
    inverter: number;
    chargeController: number;
    dcBreaker: number;
    acBreaker: number;
    solarPanel: number;
  };
  systemComponents: {
    batteries: number;
    inverter: number;
    chargeController: number;
    dcBreakers: number;
    acBreakers: number;
    solarPanels: number;
  };
  customItems: CostItem[];
  lockedFields: {
    solarPanels: boolean;
    batteries: boolean;
    inverter: boolean;
    chargeController: boolean;
    dcBreakers: boolean;
    acBreakers: boolean;
  };
}

interface CostEstimationProps {
  loadedProposal: Proposal | null;
  state: CostEstimationState;
  setState: React.Dispatch<React.SetStateAction<CostEstimationState>>;
}

const getDefaultState = (): CostEstimationState => ({
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

export default function CostEstimation({ loadedProposal, state, setState }: CostEstimationProps) {
  const { user, userSettings } = useAuth();
  const [currency, setCurrency] = useState('USD');
  const [showPriceListModal, setShowPriceListModal] = useState(false);

  const { defaultPrices, systemComponents, customItems, lockedFields } = state;

  const setDefaultPrices = (value: any) => setState(prev => ({ ...prev, defaultPrices: value }));
  const setSystemComponents = (value: any) => setState(prev => ({ ...prev, systemComponents: value }));
  const setCustomItems = (value: any) => setState(prev => ({ ...prev, customItems: value }));
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
    setDefaultPrices({
      battery: priceList.battery_price,
      inverter: priceList.inverter_price,
      chargeController: priceList.charge_controller_price,
      dcBreaker: defaultPrices.dcBreaker,
      acBreaker: defaultPrices.acBreaker,
      solarPanel: priceList.panel_price,
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
        battery: Number(userSettings.default_battery_price) || 250,
        inverter: (Number(userSettings.default_inverter_per_kw_price) || 250) * 3.2,
        chargeController: Number(userSettings.default_charge_controller_price) || 350,
        dcBreaker: Number(userSettings.default_dc_breaker_price) || 25,
        acBreaker: Number(userSettings.default_ac_breaker_price) || 30,
        solarPanel: Number(userSettings.default_solar_panel_price) || 180,
      };

      // Only update if prices have actually changed
      const pricesChanged =
        defaultPrices.battery !== newPrices.battery ||
        defaultPrices.inverter !== newPrices.inverter ||
        defaultPrices.chargeController !== newPrices.chargeController ||
        defaultPrices.dcBreaker !== newPrices.dcBreaker ||
        defaultPrices.acBreaker !== newPrices.acBreaker ||
        defaultPrices.solarPanel !== newPrices.solarPanel;

      if (pricesChanged) {
        setDefaultPrices(newPrices);
      }
    }
  }, [userSettings, loadedProposal, defaultPrices]);

  useEffect(() => {
    if (loadedProposal && loadedProposal.proposal_type === 'cost') {
      const data = loadedProposal.proposal_data;
      if (data.systemComponents) setSystemComponents(data.systemComponents);
      if (data.defaultPrices) setDefaultPrices(data.defaultPrices);
      if (data.customItems) setCustomItems(data.customItems);
    }
  }, [loadedProposal]);

  const handleRecalculate = () => {
    if (!lockedFields.solarPanels) {
      const batteries = Number(systemComponents.batteries) || 8;
      const calculatedPanels = Math.ceil((batteries * 200 * 48) / (5 * 400));
      setSystemComponents({ ...systemComponents, solarPanels: calculatedPanels });
    }
  };

  const addCustomItem = () => {
    const newItem: CostItem = {
      id: Date.now().toString(),
      name: 'Custom Item',
      quantity: 1,
      pricePerUnit: 0,
      subtotal: 0,
    };
    setCustomItems([...customItems, newItem]);
  };

  const updateCustomItem = (id: string, field: keyof CostItem, value: any) => {
    setCustomItems(
      customItems.map(item => {
        if (item.id === id) {
          const updated = { ...item, [field]: value };
          if (field === 'quantity' || field === 'pricePerUnit') {
            updated.subtotal = updated.quantity * updated.pricePerUnit;
          }
          return updated;
        }
        return item;
      })
    );
  };

  const removeCustomItem = (id: string) => {
    setCustomItems(customItems.filter(item => item.id !== id));
  };

  const componentCosts = [
    {
      name: 'Solar Panels',
      quantity: Number(systemComponents.solarPanels) || 0,
      pricePerUnit: Number(defaultPrices.solarPanel) || 0,
      subtotal: (Number(systemComponents.solarPanels) || 0) * (Number(defaultPrices.solarPanel) || 0),
    },
    {
      name: 'Batteries (200Ah, 12V)',
      quantity: Number(systemComponents.batteries) || 0,
      pricePerUnit: Number(defaultPrices.battery) || 0,
      subtotal: (Number(systemComponents.batteries) || 0) * (Number(defaultPrices.battery) || 0),
    },
    {
      name: 'Inverter',
      quantity: Number(systemComponents.inverter) || 0,
      pricePerUnit: Number(defaultPrices.inverter) || 0,
      subtotal: (Number(systemComponents.inverter) || 0) * (Number(defaultPrices.inverter) || 0),
    },
    {
      name: 'MPPT Charge Controller',
      quantity: Number(systemComponents.chargeController) || 0,
      pricePerUnit: Number(defaultPrices.chargeController) || 0,
      subtotal: (Number(systemComponents.chargeController) || 0) * (Number(defaultPrices.chargeController) || 0),
    },
    {
      name: 'DC Breakers',
      quantity: Number(systemComponents.dcBreakers) || 0,
      pricePerUnit: Number(defaultPrices.dcBreaker) || 0,
      subtotal: (Number(systemComponents.dcBreakers) || 0) * (Number(defaultPrices.dcBreaker) || 0),
    },
    {
      name: 'AC Breakers',
      quantity: Number(systemComponents.acBreakers) || 0,
      pricePerUnit: Number(defaultPrices.acBreaker) || 0,
      subtotal: (Number(systemComponents.acBreakers) || 0) * (Number(defaultPrices.acBreaker) || 0),
    },
  ];

  const componentTotal = componentCosts.reduce((sum, item) => sum + (Number(item.subtotal) || 0), 0);
  const customTotal = customItems.reduce((sum, item) => sum + (Number(item.subtotal) || 0), 0);
  const installationFees = Math.round((componentTotal + customTotal) * 0.2);
  const totalCost = componentTotal + customTotal + installationFees;

  const systemSize = ((Number(systemComponents.solarPanels) || 0) * 400) / 1000;
  const totalPanelWattage = (Number(systemComponents.solarPanels) || 0) * 400;

  const proposalData: ProposalData = {
    clientName: '',
    systemSize,
    totalLoad: 0,
    inverterSize: defaultPrices.inverter,
    numberOfPanels: systemComponents.solarPanels,
    panelCapacity: 400,
    batteries: systemComponents.batteries,
    chargeController: calculateChargeController(totalPanelWattage),
    totalCost,
    currency,
    componentCosts,
    defaultPrices,
    customItems,
    installationFees,
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <DollarSign className="text-green-500" />
                Default Component Prices
              </h2>
              <button
                onClick={() => setShowPriceListModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                <ListFilter size={18} />
                Select Price List
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Battery (200Ah, 12V)</label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-gray-500">{getCurrencySymbol(currency)}</span>
                  <input
                    type="number"
                    value={Number(defaultPrices.battery) || 0}
                    onChange={e => setDefaultPrices({ ...defaultPrices, battery: Number(e.target.value) || 0 })}
                    className="w-full pl-12 pr-3 py-2 border rounded-md"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Inverter</label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-gray-500">{getCurrencySymbol(currency)}</span>
                  <input
                    type="number"
                    value={Number(defaultPrices.inverter) || 0}
                    onChange={e => setDefaultPrices({ ...defaultPrices, inverter: Number(e.target.value) || 0 })}
                    className="w-full pl-12 pr-3 py-2 border rounded-md"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Charge Controller</label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-gray-500">{getCurrencySymbol(currency)}</span>
                  <input
                    type="number"
                    value={Number(defaultPrices.chargeController) || 0}
                    onChange={e =>
                      setDefaultPrices({ ...defaultPrices, chargeController: Number(e.target.value) || 0 })
                    }
                    className="w-full pl-12 pr-3 py-2 border rounded-md"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Solar Panel (400W)</label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-gray-500">{getCurrencySymbol(currency)}</span>
                  <input
                    type="number"
                    value={Number(defaultPrices.solarPanel) || 0}
                    onChange={e =>
                      setDefaultPrices({ ...defaultPrices, solarPanel: Number(e.target.value) || 0 })
                    }
                    className="w-full pl-12 pr-3 py-2 border rounded-md"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">DC Breaker</label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-gray-500">{getCurrencySymbol(currency)}</span>
                  <input
                    type="number"
                    value={Number(defaultPrices.dcBreaker) || 0}
                    onChange={e => setDefaultPrices({ ...defaultPrices, dcBreaker: Number(e.target.value) || 0 })}
                    className="w-full pl-12 pr-3 py-2 border rounded-md"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">AC Breaker</label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-gray-500">{getCurrencySymbol(currency)}</span>
                  <input
                    type="number"
                    value={Number(defaultPrices.acBreaker) || 0}
                    onChange={e => setDefaultPrices({ ...defaultPrices, acBreaker: Number(e.target.value) || 0 })}
                    className="w-full pl-12 pr-3 py-2 border rounded-md"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-800">System Component Quantities</h2>
              <div className="flex gap-2">
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
                label="Solar Panels"
                value={systemComponents.solarPanels}
                onChange={value => setSystemComponents({ ...systemComponents, solarPanels: value })}
                locked={lockedFields.solarPanels}
                onToggleLock={() => toggleLock('solarPanels')}
              />
              <LockedInput
                label="Batteries"
                value={systemComponents.batteries}
                onChange={value => setSystemComponents({ ...systemComponents, batteries: value })}
                locked={lockedFields.batteries}
                onToggleLock={() => toggleLock('batteries')}
              />
              <LockedInput
                label="Inverters"
                value={systemComponents.inverter}
                onChange={value => setSystemComponents({ ...systemComponents, inverter: value })}
                locked={lockedFields.inverter}
                onToggleLock={() => toggleLock('inverter')}
              />
              <LockedInput
                label="Charge Controllers"
                value={systemComponents.chargeController}
                onChange={value => setSystemComponents({ ...systemComponents, chargeController: value })}
                locked={lockedFields.chargeController}
                onToggleLock={() => toggleLock('chargeController')}
              />
              <LockedInput
                label="DC Breakers"
                value={systemComponents.dcBreakers}
                onChange={value => setSystemComponents({ ...systemComponents, dcBreakers: value })}
                locked={lockedFields.dcBreakers}
                onToggleLock={() => toggleLock('dcBreakers')}
              />
              <LockedInput
                label="AC Breakers"
                value={systemComponents.acBreakers}
                onChange={value => setSystemComponents({ ...systemComponents, acBreakers: value })}
                locked={lockedFields.acBreakers}
                onToggleLock={() => toggleLock('acBreakers')}
              />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-800">Custom Items</h2>
              <button
                onClick={addCustomItem}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                <Plus size={18} />
                Add Item
              </button>
            </div>
            {customItems.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No custom items added</p>
            ) : (
              <div className="space-y-3">
                {customItems.map(item => (
                  <div key={item.id} className="flex gap-2 items-center">
                    <input
                      type="text"
                      value={item.name}
                      onChange={e => updateCustomItem(item.id, 'name', e.target.value)}
                      className="flex-1 px-3 py-2 border rounded-md"
                      placeholder="Item name"
                    />
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={e => updateCustomItem(item.id, 'quantity', parseInt(e.target.value) || 0)}
                      className="w-24 px-3 py-2 border rounded-md"
                      placeholder="Qty"
                    />
                    <div className="relative w-32">
                      <span className="absolute left-3 top-2 text-gray-500">{getCurrencySymbol(currency)}</span>
                      <input
                        type="number"
                        value={item.pricePerUnit}
                        onChange={e => updateCustomItem(item.id, 'pricePerUnit', parseFloat(e.target.value) || 0)}
                        className="w-full pl-12 pr-3 py-2 border rounded-md"
                        placeholder="Price"
                      />
                    </div>
                    <button
                      onClick={() => removeCustomItem(item.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <CostChart
            componentCosts={componentCosts}
            customTotal={customTotal}
            installationFees={installationFees}
          />
        </div>

        <div className="lg:col-span-1">
          <div className="sticky top-6">
            <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Calculator className="text-blue-600" />
                Cost Breakdown
              </h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-700 mb-2">Standard Components</h3>
                  <div className="space-y-2 text-sm">
                    {componentCosts.map((item, index) => (
                      <div key={index} className="flex justify-between text-gray-600">
                        <span>
                          {item.name} ({item.quantity})
                        </span>
                        <span className="font-medium">{formatCurrency(item.subtotal, currency)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="border-t mt-2 pt-2 flex justify-between font-semibold">
                    <span>Subtotal</span>
                    <span>{formatCurrency(componentTotal, currency)}</span>
                  </div>
                </div>

                {customItems.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-gray-700 mb-2">Custom Items</h3>
                    <div className="space-y-2 text-sm">
                      {customItems.map(item => (
                        <div key={item.id} className="flex justify-between text-gray-600">
                          <span>
                            {item.name} ({item.quantity})
                          </span>
                          <span className="font-medium">{formatCurrency(item.subtotal, currency)}</span>
                        </div>
                      ))}
                    </div>
                    <div className="border-t mt-2 pt-2 flex justify-between font-semibold">
                      <span>Subtotal</span>
                      <span>{formatCurrency(customTotal, currency)}</span>
                    </div>
                  </div>
                )}

                <div className="border-t pt-4">
                  <div className="flex justify-between text-gray-600 mb-2">
                    <span>Installation & BOS (20%)</span>
                    <span className="font-medium">{formatCurrency(installationFees, currency)}</span>
                  </div>
                  <div className="flex justify-between text-xl font-bold text-gray-800 bg-blue-50 p-3 rounded-lg">
                    <span>Total Cost</span>
                    <span className="text-blue-600">{formatCurrency(totalCost, currency)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-lg shadow-lg p-6 text-white mb-6">
              <h3 className="text-lg font-bold mb-3">Installer Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>System Size:</span>
                  <span className="font-semibold">
                    {systemSize.toFixed(2)} kW
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Total Components:</span>
                  <span className="font-semibold">{formatCurrency(componentTotal, currency)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Installation:</span>
                  <span className="font-semibold">{formatCurrency(installationFees, currency)}</span>
                </div>
                <div className="border-t border-green-400 pt-2 mt-2">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Project Total:</span>
                    <span>{formatCurrency(totalCost, currency)}</span>
                  </div>
                </div>
              </div>
            </div>

            <ExportActions proposalData={proposalData} proposalType="cost" />
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
