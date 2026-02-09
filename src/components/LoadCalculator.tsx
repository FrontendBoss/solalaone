import { useEffect } from 'react';
import { Plus, Trash2, Zap, Battery, Info, Loader2, AlertTriangle, RefreshCw, RotateCcw } from 'lucide-react';
import { LoadItem } from '../types/solar';
import {
  calculateTotalLoad,
  calculateDailyEnergy,
  calculateInverterSize,
  calculateChargeController,
  calculateBatteries,
  getBatteryConfiguration,
  getPanelConfiguration,
  STANDARD_WATTAGES,
  SOLAR_CONSTANTS,
} from '../utils/calculations';
import { getSystemRecommendations } from '../services/aiService';
import { validateSystem, getWarningColor, getWarningIcon } from '../utils/validation';
import ExportActions from './ExportActions';
import { ProposalData } from '../services/exportService';
import { Proposal } from '../lib/supabase';
import LockedInput from './LockedInput';
import LoadChart from './LoadChart';

interface LoadCalculatorState {
  systemSize: number;
  numberOfPanels: number;
  panelCapacity: number;
  backupMode: 'hours' | 'days';
  backupHours: number;
  backupDays: number;
  aiRecommendation: string;
  loadingAI: boolean;
  lockedFields: {
    systemSize: boolean;
    numberOfPanels: boolean;
    panelCapacity: boolean;
    backupHours: boolean;
    backupDays: boolean;
  };
  loads: {
    lights: LoadItem[];
    tvs: LoadItem[];
    fans: LoadItem[];
    refrigerators: LoadItem[];
    freezers: LoadItem[];
    washingMachines: LoadItem[];
    waterPumps: LoadItem[];
    airConditioners: LoadItem[];
    laptops: LoadItem[];
    routers: LoadItem[];
    cctvCameras: LoadItem[];
  };
}

interface LoadCalculatorProps {
  loadedProposal: Proposal | null;
  state: LoadCalculatorState;
  setState: React.Dispatch<React.SetStateAction<LoadCalculatorState>>;
}

const getDefaultState = (): LoadCalculatorState => ({
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

export default function LoadCalculator({ loadedProposal, state, setState }: LoadCalculatorProps) {
  const {
    systemSize,
    numberOfPanels,
    panelCapacity,
    backupMode,
    backupHours,
    backupDays,
    aiRecommendation,
    loadingAI,
    lockedFields,
    loads,
  } = state;

  const setSystemSize = (value: number) => setState(prev => ({ ...prev, systemSize: value }));
  const setNumberOfPanels = (value: number) => setState(prev => ({ ...prev, numberOfPanels: value }));
  const setPanelCapacity = (value: number) => setState(prev => ({ ...prev, panelCapacity: value }));
  const setBackupMode = (value: 'hours' | 'days') => setState(prev => ({ ...prev, backupMode: value }));
  const setBackupHours = (value: number) => setState(prev => ({ ...prev, backupHours: value }));
  const setBackupDays = (value: number) => setState(prev => ({ ...prev, backupDays: value }));
  const setAiRecommendation = (value: string) => setState(prev => ({ ...prev, aiRecommendation: value }));
  const setLoadingAI = (value: boolean) => setState(prev => ({ ...prev, loadingAI: value }));
  const setLockedFields = (value: any) => setState(prev => ({ ...prev, lockedFields: value }));
  const setLoads = (value: any) => setState(prev => ({ ...prev, loads: value }));

  const toggleLock = (field: keyof typeof lockedFields) => {
    setState(prev => ({
      ...prev,
      lockedFields: { ...prev.lockedFields, [field]: !prev.lockedFields[field] }
    }));
  };

  const handleResetToDefaults = () => {
    setState(getDefaultState());
  };

  const allLoads = Object.values(loads).flat();
  const totalLoad = calculateTotalLoad(allLoads);
  const dailyEnergy = calculateDailyEnergy(totalLoad);
  const inverterSize = calculateInverterSize(totalLoad);
  const chargeControllerSize = calculateChargeController(numberOfPanels * panelCapacity);
  const actualBackupHours = backupMode === 'hours' ? backupHours : backupDays * 24;
  const numberOfBatteries = calculateBatteries(dailyEnergy, actualBackupHours, totalLoad);
  const batteryConfig = getBatteryConfiguration(numberOfBatteries);
  const panelConfig = getPanelConfiguration(numberOfPanels);

  const validationWarnings = validateSystem(
    totalLoad,
    inverterSize,
    numberOfPanels,
    panelCapacity,
    chargeControllerSize,
    actualBackupHours
  );

  const proposalData: ProposalData = {
    clientName: '',
    systemSize,
    totalLoad,
    inverterSize,
    numberOfPanels,
    panelCapacity,
    batteries: numberOfBatteries,
    chargeController: chargeControllerSize,
    backupHours: actualBackupHours,
    dailyEnergy,
    loads,
  };

  const addLoad = (category: keyof typeof loads, defaultWattage: number = 100) => {
    const newLoad: LoadItem = {
      id: Date.now().toString(),
      name: category.charAt(0).toUpperCase() + category.slice(1),
      quantity: 1,
      wattage: defaultWattage,
    };
    setLoads({ ...loads, [category]: [...loads[category], newLoad] });
  };

  const updateLoad = (category: keyof typeof loads, id: string, field: keyof LoadItem, value: any) => {
    setLoads({
      ...loads,
      [category]: loads[category].map(load =>
        load.id === id ? { ...load, [field]: value } : load
      ),
    });
  };

  const removeLoad = (category: keyof typeof loads, id: string) => {
    setLoads({
      ...loads,
      [category]: loads[category].filter(load => load.id !== id),
    });
  };

  const fetchAIRecommendations = async () => {
    setLoadingAI(true);
    const recommendation = await getSystemRecommendations({
      totalLoad,
      dailyEnergy,
      numberOfPanels,
      panelCapacity,
      backupHours: backupMode === 'hours' ? backupHours : undefined,
      backupDays: backupMode === 'days' ? backupDays : undefined,
    });
    setAiRecommendation(recommendation);
    setLoadingAI(false);
  };

  // Removed auto-fetching AI recommendations to prevent continuous API calls
  // Users can manually trigger AI recommendations by clicking the button

  useEffect(() => {
    if (loadedProposal && loadedProposal.proposal_type === 'calculator') {
      const data = loadedProposal.proposal_data;
      if (data.systemSize) setSystemSize(data.systemSize);
      if (data.numberOfPanels) setNumberOfPanels(data.numberOfPanels);
      if (data.panelCapacity) setPanelCapacity(data.panelCapacity);
      if (data.backupHours) {
        setBackupMode('hours');
        setBackupHours(data.backupHours);
      }
      if (data.loads) setLoads(data.loads);
    }
  }, [loadedProposal]);

  const handleRecalculate = () => {
    if (!lockedFields.systemSize) {
      const calculatedSize = (numberOfPanels * panelCapacity) / 1000;
      setSystemSize(calculatedSize);
    }
    if (!lockedFields.numberOfPanels && !lockedFields.panelCapacity && !lockedFields.systemSize) {
      const calculatedPanels = Math.ceil((systemSize * 1000) / panelCapacity);
      setNumberOfPanels(calculatedPanels);
    }
  };

  const handleAutoAdjustSystem = () => {
    const recommendedInverterSize = inverterSize;
    const recommendedPanelWattage = Math.max(dailyEnergy * 1000 / SOLAR_CONSTANTS.sunHours, totalLoad * 1.5);
    const recommendedPanels = Math.ceil(recommendedPanelWattage / panelCapacity);
    const recommendedSystemSize = (recommendedPanels * panelCapacity) / 1000;

    if (!lockedFields.numberOfPanels) {
      setNumberOfPanels(recommendedPanels);
    }
    if (!lockedFields.systemSize) {
      setSystemSize(recommendedSystemSize);
    }
  };

  const LoadCategorySection = ({
    title,
    category,
    defaultWattage,
    useHP = false,
  }: {
    title: string;
    category: keyof typeof loads;
    defaultWattage: number;
    useHP?: boolean;
  }) => (
    <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
        <button
          onClick={() => addLoad(category, defaultWattage)}
          className="flex items-center gap-1 px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
        >
          <Plus size={16} />
          Add
        </button>
      </div>
      {loads[category].length > 0 && (
        <>
          <div className="flex gap-2 mb-2 px-1">
            <div className="w-20 text-xs font-semibold text-gray-600">Quantity</div>
            <div className="w-24 text-xs font-semibold text-gray-600">{useHP ? 'HP' : 'Watts'}</div>
            <div className="flex-1 text-xs font-semibold text-gray-600">Appliance Name</div>
            <div className="w-8"></div>
          </div>
          {loads[category].map(load => (
            <div key={load.id} className="flex gap-2 mb-2">
              <input
                type="number"
                value={load.quantity}
                onChange={e => updateLoad(category, load.id, 'quantity', parseInt(e.target.value) || 0)}
                className="w-20 px-2 py-1 border rounded"
                placeholder="e.g., 3"
                min="1"
              />
              <input
                type="number"
                value={useHP ? load.horsepower : load.wattage}
                onChange={e =>
                  updateLoad(category, load.id, useHP ? 'horsepower' : 'wattage', parseFloat(e.target.value) || 0)
                }
                className="w-24 px-2 py-1 border rounded"
                placeholder={useHP ? 'e.g., 1.5' : 'e.g., 100'}
                step={useHP ? '0.5' : '1'}
              />
              <input
                type="text"
                value={load.name}
                onChange={e => updateLoad(category, load.id, 'name', e.target.value)}
                className="flex-1 px-2 py-1 border rounded"
                placeholder="e.g., Living Room Fan"
              />
              <button
                onClick={() => removeLoad(category, load.id)}
                className="px-2 py-1 text-red-600 hover:bg-red-50 rounded"
                title="Remove item"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </>
      )}
      {loads[category].length === 0 && (
        <p className="text-sm text-gray-500 text-center py-2">No items added. Click "Add" to add {title.toLowerCase()}.</p>
      )}
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <Zap className="text-yellow-500" />
                System Overview
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={handleResetToDefaults}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors text-sm"
                  title="Reset all values to defaults"
                >
                  <RotateCcw size={16} />
                  Reset
                </button>
                <button
                  onClick={handleAutoAdjustSystem}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm"
                  title="Automatically adjust system size based on current load"
                >
                  <RefreshCw size={16} />
                  Auto-adjust
                </button>
                <button
                  onClick={handleRecalculate}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
                >
                  <RefreshCw size={16} />
                  Recalculate
                </button>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <LockedInput
                label="System Size (kW)"
                value={systemSize}
                onChange={setSystemSize}
                locked={lockedFields.systemSize}
                onToggleLock={() => toggleLock('systemSize')}
                step="0.01"
              />
              <LockedInput
                label="Number of Panels"
                value={numberOfPanels}
                onChange={setNumberOfPanels}
                locked={lockedFields.numberOfPanels}
                onToggleLock={() => toggleLock('numberOfPanels')}
              />
              <LockedInput
                label="Panel Capacity (W)"
                value={panelCapacity}
                onChange={setPanelCapacity}
                locked={lockedFields.panelCapacity}
                onToggleLock={() => toggleLock('panelCapacity')}
              />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Battery className="text-green-500" />
              Battery Backup Settings
            </h2>
            <div className="flex gap-4 mb-4">
              <button
                onClick={() => setBackupMode('hours')}
                className={`flex-1 py-2 px-4 rounded-md font-medium ${
                  backupMode === 'hours'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Backup Hours
              </button>
              <button
                onClick={() => setBackupMode('days')}
                className={`flex-1 py-2 px-4 rounded-md font-medium ${
                  backupMode === 'days'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Backup Days
              </button>
            </div>
            {backupMode === 'hours' ? (
              <LockedInput
                label="Number of Hours"
                value={backupHours}
                onChange={setBackupHours}
                locked={lockedFields.backupHours}
                onToggleLock={() => toggleLock('backupHours')}
                min="1"
              />
            ) : (
              <LockedInput
                label="Number of Days"
                value={backupDays}
                onChange={setBackupDays}
                locked={lockedFields.backupDays}
                onToggleLock={() => toggleLock('backupDays')}
                min="1"
              />
            )}
          </div>

          <div className="bg-blue-50 border-l-4 border-blue-600 p-4 mb-4 rounded-r-lg">
            <div className="flex items-start gap-3">
              <Info className="text-blue-600 flex-shrink-0 mt-0.5" size={20} />
              <div>
                <h3 className="font-semibold text-blue-900 mb-1">How to Configure Your Loads</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li><strong>Quantity:</strong> Number of appliances (e.g., 5 fans, 10 bulbs)</li>
                  <li><strong>Watts/HP:</strong> Power rating per appliance (check the label or manual)</li>
                  <li><strong>Appliance Name:</strong> Optional - give it a descriptive name (e.g., "Bedroom Fan")</li>
                </ul>
                <p className="text-sm text-blue-800 mt-2 italic">Tip: Most appliances show their wattage on a label. For motors and pumps, you may see HP (horsepower) instead.</p>
              </div>
            </div>
          </div>

          <h2 className="text-xl font-bold text-gray-800 mb-4">Load Configuration</h2>
          <LoadCategorySection title="Lights" category="lights" defaultWattage={15} />
          <LoadCategorySection title="Televisions" category="tvs" defaultWattage={80} />
          <LoadCategorySection title="Fans" category="fans" defaultWattage={75} />
          <LoadCategorySection title="Refrigerators" category="refrigerators" defaultWattage={150} />
          <LoadCategorySection title="Freezers" category="freezers" defaultWattage={200} />
          <LoadCategorySection title="Washing Machines" category="washingMachines" defaultWattage={500} />
          <LoadCategorySection title="Water Pumps" category="waterPumps" defaultWattage={746} useHP />
          <LoadCategorySection title="Air Conditioners" category="airConditioners" defaultWattage={1492} useHP />
          <LoadCategorySection title="Laptops" category="laptops" defaultWattage={STANDARD_WATTAGES.laptop} />
          <LoadCategorySection title="Routers" category="routers" defaultWattage={STANDARD_WATTAGES.router} />
          <LoadCategorySection title="CCTV Cameras" category="cctvCameras" defaultWattage={STANDARD_WATTAGES.cctv} />

          <LoadChart loads={loads} />
        </div>

        <div className="lg:col-span-1">
          <div className="sticky top-6">
            <div className={`bg-gradient-to-br rounded-lg shadow-lg p-6 text-white mb-6 ${
              totalLoad > inverterSize ? 'from-red-600 to-red-700' : 'from-blue-600 to-blue-700'
            }`}>
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                System Summary
                {totalLoad > inverterSize && <AlertTriangle size={24} />}
              </h2>
              <div className="space-y-3">
                <div className="border-b border-opacity-40 pb-2" style={{ borderColor: 'currentColor' }}>
                  <div className="text-sm opacity-90">Total Connected Load</div>
                  <div className="text-3xl font-bold">{totalLoad.toLocaleString()}W</div>
                  <div className="text-lg">{(totalLoad / 1000).toFixed(2)} kW</div>
                  {totalLoad > inverterSize && (
                    <div className="text-sm mt-1 bg-white bg-opacity-20 px-2 py-1 rounded">
                      Exceeds inverter capacity!
                    </div>
                  )}
                </div>
                <div className="border-b border-opacity-40 pb-2" style={{ borderColor: 'currentColor' }}>
                  <div className="text-sm opacity-90">Daily Energy Consumption</div>
                  <div className="text-2xl font-bold">{dailyEnergy.toFixed(2)} kWh</div>
                </div>
                <div>
                  <div className="text-sm opacity-90">Recommended Inverter</div>
                  <div className="text-xl font-bold">{(inverterSize / 1000).toFixed(1)} kW</div>
                </div>
                <div>
                  <div className="text-sm opacity-90">Charge Controller</div>
                  <div className="text-xl font-bold">{chargeControllerSize}A MPPT</div>
                </div>
                <div>
                  <div className="text-sm opacity-90">Batteries Required</div>
                  <div className="text-xl font-bold">{numberOfBatteries} × 200Ah</div>
                  <div className="text-sm mt-1">{batteryConfig}</div>
                </div>
                <div>
                  <div className="text-sm opacity-90">Panel Configuration</div>
                  <div className="text-sm mt-1">{panelConfig}</div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                <Info className="text-blue-600" />
                System Assumptions
              </h3>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Sun Hours:</span>
                  <span className="font-medium">{SOLAR_CONSTANTS.sunHours}h/day</span>
                </div>
                <div className="flex justify-between">
                  <span>Battery Efficiency:</span>
                  <span className="font-medium">{(SOLAR_CONSTANTS.batteryEfficiency * 100).toFixed(0)}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Inverter Efficiency:</span>
                  <span className="font-medium">{(SOLAR_CONSTANTS.inverterEfficiency * 100).toFixed(0)}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Depth of Discharge:</span>
                  <span className="font-medium">{(SOLAR_CONSTANTS.depthOfDischarge * 100).toFixed(0)}%</span>
                </div>
                <div className="flex justify-between">
                  <span>System Voltage:</span>
                  <span className="font-medium">{SOLAR_CONSTANTS.systemVoltage}V</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6 mt-6">
              <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                <Info className="text-purple-600" />
                AI Recommendations
              </h3>
              {loadingAI ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="animate-spin text-blue-600" size={32} />
                </div>
              ) : (
                <div className="text-sm text-gray-700 whitespace-pre-line">{aiRecommendation}</div>
              )}
            </div>

            {validationWarnings.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6 mt-6">
                <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <AlertTriangle className="text-yellow-600" />
                  System Warnings
                </h3>
                <div className="space-y-2">
                  {validationWarnings.map((warning, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded-lg border ${getWarningColor(warning.type)} text-sm`}
                    >
                      <div className="flex items-start gap-2">
                        <span className="text-lg">{getWarningIcon(warning.type)}</span>
                        <div>
                          <div className="font-semibold capitalize">{warning.field}</div>
                          <div>{warning.message}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {validationWarnings.some(w => w.field === 'inverter' || w.field === 'panels') && (
                  <button
                    onClick={handleAutoAdjustSystem}
                    className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 font-medium"
                  >
                    <RefreshCw size={18} />
                    Auto-adjust System to Match Load
                  </button>
                )}
              </div>
            )}

            <div className="mt-6">
              <ExportActions proposalData={proposalData} proposalType="calculator" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
