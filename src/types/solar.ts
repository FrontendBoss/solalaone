export interface LoadItem {
  id: string;
  name: string;
  quantity: number;
  wattage: number;
  horsepower?: number;
}

export interface LoadCategory {
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
}

export interface SystemCalculation {
  totalConnectedLoad: number;
  dailyEnergyConsumption: number;
  inverterSize: number;
  chargeControllerSize: number;
  numberOfBatteries: number;
  batteryConfiguration: string;
  panelConfiguration: string;
}

export interface CostItem {
  id: string;
  name: string;
  quantity: number;
  pricePerUnit: number;
  subtotal: number;
}

export interface BudgetRecommendation {
  installationSize: number;
  numberOfPanels: number;
  panelCapacity: number;
  inverterType: string;
  inverterCapacity: number;
  batteryType: string;
  batteryQuantity: number;
  chargeController: string;
  totalSupportedLoad: number;
  backupDuration: number;
  estimatedInstallationFees: number;
  totalCost: number;
  loadBreakdown: LoadItem[];
}
export interface Position {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface RoofAnalysis {
  captured: boolean;
  timestamp: string;
  position: Position;
  size: Size;
  rotation: number;
  orientation: string;
  shape: string;
  features: string[];
}

export interface MeasurementArea {
  id: string;
  name: string;
  position: Position;
  size: Size;
  rotation: number;
  type: 'usable' | 'excluded';
  reason?: string;
  color: string;
}

export interface DetectedRoofArea {
  id: string;
  name: string;
  position: Position;
  size: Size;
  rotation: number;
  confidence: number;
  roofType: 'main' | 'secondary' | 'garage' | 'extension';
  realData?: {
    pitchDegrees: number;
    azimuthDegrees: number;
    areaMeters2: number;
    sunshineQuantiles: number[];
    groundAreaMeters2: number;
    center: {
      latitude: number;
      longitude: number;
    };
    boundingBox: {
      sw: { latitude: number; longitude: number };
      ne: { latitude: number; longitude: number };
    };
  };
}