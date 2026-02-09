export interface ValidationWarning {
  type: 'error' | 'warning';
  message: string;
  field: string;
}

export const validateSystem = (
  totalLoad: number,
  inverterSize: number,
  numberOfPanels: number,
  panelCapacity: number,
  chargeControllerSize: number,
  backupHours: number
): ValidationWarning[] => {
  const warnings: ValidationWarning[] = [];

  if (totalLoad > inverterSize) {
    warnings.push({
      type: 'error',
      message: `Total load (${totalLoad}W) exceeds inverter capacity (${inverterSize}W). System will overload! Increase inverter size or reduce load.`,
      field: 'inverter',
    });
  }

  if (totalLoad > inverterSize * 0.8) {
    warnings.push({
      type: 'warning',
      message: `Total load is at ${Math.round((totalLoad / inverterSize) * 100)}% of inverter capacity. Consider upgrading inverter for better efficiency and headroom.`,
      field: 'inverter',
    });
  }

  const totalPanelWattage = numberOfPanels * panelCapacity;
  const systemVoltage = 48;
  const requiredMPPTRating = (totalPanelWattage * 1.25) / systemVoltage;

  if (requiredMPPTRating > chargeControllerSize) {
    warnings.push({
      type: 'error',
      message: `Panel array requires ${Math.ceil(requiredMPPTRating)}A charge controller, but selected controller is only ${chargeControllerSize}A. Risk of controller damage!`,
      field: 'chargeController',
    });
  }

  if (requiredMPPTRating > chargeControllerSize * 0.8) {
    warnings.push({
      type: 'warning',
      message: `Panel array is at ${Math.round((requiredMPPTRating / chargeControllerSize) * 100)}% of charge controller capacity. Consider upgrading for safety margin.`,
      field: 'chargeController',
    });
  }

  if (backupHours > 72) {
    warnings.push({
      type: 'warning',
      message: `Backup duration of ${backupHours} hours (${Math.round(backupHours / 24)} days) may require an unrealistically large battery bank. Consider reducing backup requirements or adding generator backup.`,
      field: 'battery',
    });
  }

  if (backupHours > 120) {
    warnings.push({
      type: 'error',
      message: `Backup duration of ${backupHours} hours (${Math.round(backupHours / 24)} days) is not practical for battery-only systems. Maximum recommended: 3 days (72 hours). Consider hybrid system with generator.`,
      field: 'battery',
    });
  }

  const dailyProductionKWh = (totalPanelWattage * 5) / 1000;
  const dailyConsumptionKWh = (totalLoad * 6) / 1000;

  if (dailyProductionKWh < dailyConsumptionKWh * 0.7) {
    warnings.push({
      type: 'warning',
      message: `Solar panels may not generate enough energy to meet daily consumption. Daily production: ${dailyProductionKWh.toFixed(1)}kWh, Daily consumption: ${dailyConsumptionKWh.toFixed(1)}kWh. Consider adding more panels.`,
      field: 'panels',
    });
  }

  if (numberOfPanels > 50) {
    warnings.push({
      type: 'warning',
      message: `Large panel array (${numberOfPanels} panels) may require multiple charge controllers and complex wiring. Consult with installation team.`,
      field: 'panels',
    });
  }

  return warnings;
};

export const getWarningColor = (type: 'error' | 'warning'): string => {
  return type === 'error' ? 'bg-red-50 border-red-300 text-red-800' : 'bg-yellow-50 border-yellow-300 text-yellow-800';
};

export const getWarningIcon = (type: 'error' | 'warning'): string => {
  return type === 'error' ? '🚫' : '⚠️';
};
