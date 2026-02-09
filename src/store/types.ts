// Global state types for the solar roof analyzer
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

export interface DetectedRoofArea {
  id: string;
  name: string;
  position: Position;
  size: Size;
  rotation: number;
  confidence: number;
  roofType: 'main' | 'secondary' | 'garage' | 'extension';
  isDeletable?: boolean;
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

export interface ShadeSource {
  id: string;
  name: string;
  type: 'building' | 'tree' | 'roof-feature' | 'terrain' | 'chimney' | 'utility-line';
  position: Position;
  size: Size;
  height: number; // in feet
  color: string;
}

export interface ShadePattern {
  timeOfDay: string;
  season: 'summer' | 'winter' | 'spring-fall';
  shadeAreas: Array<{
    position: Position;
    size: Size;
    intensity: 'full' | 'partial' | 'light';
  }>;
  sunAngle: number;
  sunAzimuth: number;
}

export interface SolarPanel {
  id: string;
  position: Position; // Position in percentage relative to container
  rotation: number;
  areaId: string;
  row: number;
  col: number;
  efficiency: number;
  shaded: boolean;
  wattage: number;
  isDragging?: boolean;
}

export interface PanelLayout {
  areaId: string;
  areaName: string;
  panels: SolarPanel[];
  rows: number;
  cols: number;
  totalPanels: number;
  totalWattage: number;
  efficiency: number;
  spacing: { x: number; y: number };
}

export interface PanelSpecs {
  width: number; // in feet
  height: number; // in feet
  wattage: number;
  efficiency: number;
  color: 'blue' | 'black' | 'silver';
  type: 'monocrystalline' | 'polycrystalline' | 'thin-film';
}

export interface SunPosition {
  time: string;
  season: 'summer' | 'winter' | 'equinox';
  azimuth: number; // 0-360 degrees (0 = North, 90 = East, 180 = South, 270 = West)
  elevation: number; // 0-90 degrees above horizon
  irradiance: number; // Relative solar irradiance (0-1)
  peakSunHours: boolean; // Whether this time is in peak sun hours
}

export interface OptimalOrientation {
  azimuth: number; // Optimal panel azimuth
  tilt: number; // Optimal panel tilt
  efficiency: number; // Expected efficiency percentage
  reason: string;
}

export interface ProjectSettings {
  address: string;
  latitude: number;
  longitude: number;
  magneticDeclination: number;
  pixelsPerFoot: number;
  units: 'feet' | 'meters';
  quality: 'high' | 'medium' | 'low';
  roofPitch: string;
  roofMaterial: string;
  dataSource: 'ai' | 'manual';
}

// Auto Panel Configuration types
export interface RoofSegmentSummary {
  azimuthDegrees: number;
  panelsCount: number;
  pitchDegrees: number;
  segmentIndex: number;
  yearlyEnergyDcKwh: number;
}

export interface AutoPanelConfig {
  panelsCount: number;
  yearlyEnergyDcKwh: number;
  roofSegmentSummaries: RoofSegmentSummary[];
}

export interface AnalysisState {
  // Project Information
  projectId: string;
  projectName: string;
  createdAt: string;
  lastModified: string;
  settings: ProjectSettings;
  
  // Roof Analysis
  roofAnalysis: RoofAnalysis | null;
  detectedRoofAreas: DetectedRoofArea[];
  measurementAreas: MeasurementArea[];
  
  // Shade Analysis
  shadeSources: ShadeSource[];
  shadePatterns: ShadePattern[];
  currentShadeTime: string;
  currentShadeSeason: 'summer' | 'winter' | 'spring-fall';
  
  // Sun Direction Analysis
  sunPositions: SunPosition[];
  currentSunTime: string;
  currentSunSeason: 'summer' | 'winter' | 'equinox';
  optimalOrientation: OptimalOrientation | null;
  
  // Panel Positioning
  solarPanels: SolarPanel[];
  panelLayouts: PanelLayout[];
  panelSpecs: PanelSpecs;
  layoutMode: 'auto' | 'manual';
  optimizationMode: 'maximum' | 'efficiency' | 'cost';
  
  // Auto Design Panel Settings
  totalPanels: number;
  autoSystemSize: number; // in kW
  autoEstimatedAnnualGeneration: number; // in kWh
  autoPanelWattage: number; // in watts
  autoShowPanels: boolean;
  autoShowIrradianceAnimation: boolean;
  autoShowRoofOnly: boolean; // Added this property
  autoPanelConfig: AutoPanelConfig[]; // Array of panel configurations
  
  // UI State
  selectedArea: string | null;
  selectedDetectedRoof: string | null;
  selectedShadeSource: string | null;
  selectedPanel: string | null;
  currentView: 'measurement' | 'shade' | 'sunDirection' | 'panelPositioning' | null;
  
  // Analysis Results
  calculations: {
    totalRoofArea: number;
    totalUsableArea: number;
    totalExcludedArea: number;
    roofUtilization: number;
    estimatedPanels: number;
    totalSystemWattage: number;
    estimatedAnnualGeneration: number;
    shadeImpact: number;
    systemEfficiency: number;
  };
}

export interface RootState {
  analysis: AnalysisState;
}