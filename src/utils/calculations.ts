import { LoadItem } from '../types/solar';

export const STANDARD_WATTAGES = {
  laptop: 65,
  router: 10,
  cctv: 5,
};

export const SOLAR_CONSTANTS = {
  sunHours: 5,
  batteryEfficiency: 0.85,
  inverterEfficiency: 0.9,
  depthOfDischarge: 0.5,
  batteryVoltage: 12,
  systemVoltage: 48,
};

export const hpToWatts = (hp: number): number => {
  return hp * 746;
};

export const calculateTotalLoad = (loads: LoadItem[]): number => {
  return loads.reduce((total, load) => {
    const wattage = load.horsepower ? hpToWatts(load.horsepower) : load.wattage;
    return total + (wattage * load.quantity);
  }, 0);
};

export const calculateDailyEnergy = (totalLoad: number, hoursPerDay: number = 6): number => {
  return (totalLoad * hoursPerDay) / 1000;
};

export const calculateInverterSize = (totalLoad: number): number => {
  const inverterSize = totalLoad * 1.25;
  const standardSizes = [1000, 1500, 2000, 3000, 3500, 5000, 7500, 10000, 15000, 20000];
  return standardSizes.find(size => size >= inverterSize) || Math.ceil(inverterSize / 1000) * 1000;
};

export const calculateChargeController = (panelWattage: number, systemVoltage: number = 48): number => {
  const current = (panelWattage * 1.25) / systemVoltage;
  const standardSizes = [30, 40, 50, 60, 80, 100, 120, 150];
  return standardSizes.find(size => size >= current) || Math.ceil(current / 10) * 10;
};

export const calculateRequiredPanels = (dailyEnergy: number, panelCapacity: number = 400): number => {
  const { sunHours, inverterEfficiency } = SOLAR_CONSTANTS;
  const adjustedDailyEnergy = dailyEnergy / inverterEfficiency;
  const panelsNeeded = Math.ceil(adjustedDailyEnergy / (panelCapacity * sunHours / 1000));
  return Math.max(panelsNeeded, 1);
};

export const calculateBatteries = (
  dailyEnergy: number,
  backupHours: number,
  totalLoad: number
): number => {
  const { batteryEfficiency, depthOfDischarge, batteryVoltage, systemVoltage } = SOLAR_CONSTANTS;

  const energyRequired = (totalLoad * backupHours) / 1000;
  const adjustedEnergy = energyRequired / (batteryEfficiency * depthOfDischarge);

  const batteryCapacityAh = 200;
  const batteriesInSeries = systemVoltage / batteryVoltage;
  const batteryBankCapacity = (batteryCapacityAh * systemVoltage) / 1000;

  const parallelStrings = Math.ceil(adjustedEnergy / batteryBankCapacity);

  return Math.max(batteriesInSeries * parallelStrings, batteriesInSeries);
};

export const getBatteryConfiguration = (numberOfBatteries: number): string => {
  const batteriesInSeries = SOLAR_CONSTANTS.systemVoltage / SOLAR_CONSTANTS.batteryVoltage;
  const parallelStrings = numberOfBatteries / batteriesInSeries;

  if (parallelStrings === 1) {
    return `${batteriesInSeries} batteries in series`;
  }
  return `${Math.round(parallelStrings)} strings of ${batteriesInSeries} batteries in series`;
};

export const getPanelConfiguration = (numberOfPanels: number, systemVoltage: number = 48): string => {
  const panelVoltage = 24;
  const panelsInSeries = Math.ceil(systemVoltage / panelVoltage);
  const parallelStrings = Math.ceil(numberOfPanels / panelsInSeries);

  if (parallelStrings === 1) {
    return `${numberOfPanels} panels in series`;
  }
  return `${parallelStrings} strings of ${panelsInSeries} panels in series`;
};

export const formatCurrency = (amount: number, currencyCode: string = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currencyCode,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const getCurrencySymbol = (currencyCode: string = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currencyCode,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })
    .formatToParts(0)
    .find(part => part.type === 'currency')?.value || '$';
};

export const parseBatteryCapacity = (value: string): number => {
  const match = value.match(/(\d+(?:\.\d+)?)\s*(?:Ah|AH|ah)/i);
  return match ? parseFloat(match[1]) : 200;
};

export const parseInverterPower = (value: string): number => {
  const match = value.match(/(\d+(?:\.\d+)?)\s*(?:KVA|kva|KW|kw)/i);
  if (!match) return 3200;
  const num = parseFloat(match[1]);
  if (value.toUpperCase().includes('KVA')) {
    return num * 1000;
  }
  return num * 1000;
};

export const parsePanelWattage = (value: string): number => {
  const match = value.match(/(\d+(?:\.\d+)?)\s*(?:W|w|watt|watts)/i);
  return match ? parseFloat(match[1]) : 400;
};

export const parseChargeControllerAmperage = (value: string): number => {
  const match = value.match(/(\d+(?:\.\d+)?)\s*(?:A|a|amp|amps)/i);
  return match ? parseFloat(match[1]) : 60;
};
