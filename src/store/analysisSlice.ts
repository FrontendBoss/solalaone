import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { 
  AnalysisState, 
  DetectedRoofArea, 
  MeasurementArea, 
  ShadeSource, 
  ShadePattern,
  SolarPanel,
  PanelLayout,
  PanelSpecs,
  SunPosition,
  OptimalOrientation,
  ProjectSettings,
  RoofAnalysis,
  AutoPanelConfig
} from './types';

const initialState: AnalysisState = {
  // Project Information
  projectId: '',
  projectName: 'Untitled Solar Project',
  createdAt: new Date().toISOString(),
  lastModified: new Date().toISOString(),
  settings: {
    address: '',
    latitude: 40.7128,
    longitude: -74.0060,
    magneticDeclination: -13.2,
    pixelsPerFoot: 10,
    units: 'feet',
    quality: 'medium',
    roofPitch: 'moderate',
    roofMaterial: 'asphalt-shingles',
    dataSource: 'ai'
  },
  
  // Roof Analysis
  roofAnalysis: null,
  detectedRoofAreas: [],
  measurementAreas: [],
  
  // Shade Analysis
  shadeSources: [],
  shadePatterns: [],
  currentShadeTime: '12:00 PM',
  currentShadeSeason: 'summer',
  
  // Sun Direction Analysis
  sunPositions: [],
  currentSunTime: '12:00 PM',
  currentSunSeason: 'summer',
  optimalOrientation: null,
  
  // Panel Positioning
  solarPanels: [],
  panelLayouts: [],
  panelSpecs: {
    width: 3.25,
    height: 5.4,
    wattage: 400,
    efficiency: 20.5,
    color: 'blue',
    type: 'monocrystalline'
  },
  layoutMode: 'auto',
  optimizationMode: 'maximum',
  
  // Auto Design Panel Settings
  totalPanels: 0,
  autoSystemSize: 0,
  autoEstimatedAnnualGeneration: 0,
  autoPanelWattage: 400,
  autoShowPanels: false,
  autoShowIrradianceAnimation: false,
  autoShowRoofOnly: false, // Added with default value true
  autoPanelConfig: [],
  
  // UI State
  selectedArea: null,
  selectedDetectedRoof: null,
  selectedShadeSource: null,
  selectedPanel: null,
  currentView: null,
  
  // Analysis Results
  calculations: {
    totalRoofArea: 0,
    totalUsableArea: 0,
    totalExcludedArea: 0,
    roofUtilization: 0,
    estimatedPanels: 0,
    totalSystemWattage: 0,
    estimatedAnnualGeneration: 0,
    shadeImpact: 0,
    systemEfficiency: 0
  }
};

const analysisSlice = createSlice({
  name: 'analysis',
  initialState,
  reducers: {
    // Project Management
    setProjectInfo: (state, action: PayloadAction<{ id: string; name: string }>) => {
      state.projectId = action.payload.id;
      state.projectName = action.payload.name;
      state.lastModified = new Date().toISOString();
    },
    
    updateProjectSettings: (state, action: PayloadAction<Partial<ProjectSettings>>) => {
      state.settings = { ...state.settings, ...action.payload };
      state.lastModified = new Date().toISOString();
    },
    
    // Roof Analysis Actions
    setRoofAnalysis: (state, action: PayloadAction<RoofAnalysis>) => {
      state.roofAnalysis = action.payload;
      state.lastModified = new Date().toISOString();
    },
    
    setDetectedRoofAreas: (state, action: PayloadAction<DetectedRoofArea[]>) => {
      state.detectedRoofAreas = action.payload;
      state.lastModified = new Date().toISOString();
    },
    
    addDetectedRoofArea: (state, action: PayloadAction<DetectedRoofArea>) => {
      state.detectedRoofAreas.push(action.payload);
      state.lastModified = new Date().toISOString();
    },
    
    updateDetectedRoofArea: (state, action: PayloadAction<{ id: string; updates: Partial<DetectedRoofArea> }>) => {
      const index = state.detectedRoofAreas.findIndex(area => area.id === action.payload.id);
      if (index !== -1) {
        state.detectedRoofAreas[index] = { ...state.detectedRoofAreas[index], ...action.payload.updates };
        state.lastModified = new Date().toISOString();
      }
    },
    
    removeDetectedRoofArea: (state, action: PayloadAction<string>) => {
      state.detectedRoofAreas = state.detectedRoofAreas.filter(area => area.id !== action.payload);
      if (state.selectedDetectedRoof === action.payload) {
        state.selectedDetectedRoof = null;
      }
      state.lastModified = new Date().toISOString();
    },
    
    setMeasurementAreas: (state, action: PayloadAction<MeasurementArea[]>) => {
      state.measurementAreas = action.payload;
      state.lastModified = new Date().toISOString();
    },
    
    addMeasurementArea: (state, action: PayloadAction<MeasurementArea>) => {
      state.measurementAreas.push(action.payload);
      state.lastModified = new Date().toISOString();
    },
    
    updateMeasurementArea: (state, action: PayloadAction<{ id: string; updates: Partial<MeasurementArea> }>) => {
      const index = state.measurementAreas.findIndex(area => area.id === action.payload.id);
      if (index !== -1) {
        state.measurementAreas[index] = { ...state.measurementAreas[index], ...action.payload.updates };
        state.lastModified = new Date().toISOString();
      }
    },
    
    removeMeasurementArea: (state, action: PayloadAction<string>) => {
      state.measurementAreas = state.measurementAreas.filter(area => area.id !== action.payload);
      if (state.selectedArea === action.payload) {
        state.selectedArea = null;
      }
      state.lastModified = new Date().toISOString();
    },
    
    // Shade Analysis Actions
    setShadeSources: (state, action: PayloadAction<ShadeSource[]>) => {
      state.shadeSources = action.payload;
      state.lastModified = new Date().toISOString();
    },
    
    addShadeSource: (state, action: PayloadAction<ShadeSource>) => {
      state.shadeSources.push(action.payload);
      state.lastModified = new Date().toISOString();
    },
    
    updateShadeSource: (state, action: PayloadAction<{ id: string; updates: Partial<ShadeSource> }>) => {
      const index = state.shadeSources.findIndex(source => source.id === action.payload.id);
      if (index !== -1) {
        state.shadeSources[index] = { ...state.shadeSources[index], ...action.payload.updates };
        state.lastModified = new Date().toISOString();
      }
    },
    
    removeShadeSource: (state, action: PayloadAction<string>) => {
      state.shadeSources = state.shadeSources.filter(source => source.id !== action.payload);
      if (state.selectedShadeSource === action.payload) {
        state.selectedShadeSource = null;
      }
      state.lastModified = new Date().toISOString();
    },
    
    setShadePatterns: (state, action: PayloadAction<ShadePattern[]>) => {
      state.shadePatterns = action.payload;
      state.lastModified = new Date().toISOString();
    },
    
    setCurrentShadeTime: (state, action: PayloadAction<string>) => {
      state.currentShadeTime = action.payload;
    },
    
    setCurrentShadeSeason: (state, action: PayloadAction<'summer' | 'winter' | 'spring-fall'>) => {
      state.currentShadeSeason = action.payload;
    },
    
    // Sun Direction Analysis Actions
    setSunPositions: (state, action: PayloadAction<SunPosition[]>) => {
      state.sunPositions = action.payload;
      state.lastModified = new Date().toISOString();
    },
    
    setCurrentSunTime: (state, action: PayloadAction<string>) => {
      state.currentSunTime = action.payload;
    },
    
    setCurrentSunSeason: (state, action: PayloadAction<'summer' | 'winter' | 'equinox'>) => {
      state.currentSunSeason = action.payload;
    },
    
    setOptimalOrientation: (state, action: PayloadAction<OptimalOrientation>) => {
      state.optimalOrientation = action.payload;
      state.lastModified = new Date().toISOString();
    },
    
    // Panel Positioning Actions
    setSolarPanels: (state, action: PayloadAction<SolarPanel[]>) => {
      state.solarPanels = action.payload;
      state.lastModified = new Date().toISOString();
    },
    
    addSolarPanel: (state, action: PayloadAction<SolarPanel>) => {
      state.solarPanels.push(action.payload);
      state.lastModified = new Date().toISOString();
    },
    
    updateSolarPanel: (state, action: PayloadAction<{ id: string; updates: Partial<SolarPanel> }>) => {
      const index = state.solarPanels.findIndex(panel => panel.id === action.payload.id);
      if (index !== -1) {
        state.solarPanels[index] = { ...state.solarPanels[index], ...action.payload.updates };
        state.lastModified = new Date().toISOString();
      }
    },
    
    removeSolarPanel: (state, action: PayloadAction<string>) => {
      state.solarPanels = state.solarPanels.filter(panel => panel.id !== action.payload);
      if (state.selectedPanel === action.payload) {
        state.selectedPanel = null;
      }
      state.lastModified = new Date().toISOString();
    },
    
    setPanelLayouts: (state, action: PayloadAction<PanelLayout[]>) => {
      state.panelLayouts = action.payload;
      state.lastModified = new Date().toISOString();
    },
    
    updatePanelSpecs: (state, action: PayloadAction<Partial<PanelSpecs>>) => {
      state.panelSpecs = { ...state.panelSpecs, ...action.payload };
      state.lastModified = new Date().toISOString();
    },
    
    setLayoutMode: (state, action: PayloadAction<'auto' | 'manual'>) => {
      state.layoutMode = action.payload;
      state.lastModified = new Date().toISOString();
    },
    
    setOptimizationMode: (state, action: PayloadAction<'maximum' | 'efficiency' | 'cost'>) => {
      state.optimizationMode = action.payload;
      state.lastModified = new Date().toISOString();
    },
    
    // Auto Design Panel Settings Actions
    setTotalPanels: (state, action: PayloadAction<number>) => {
      state.totalPanels = action.payload;
      state.lastModified = new Date().toISOString();
    },
    
    setAutoSystemSize: (state, action: PayloadAction<number>) => {
      state.autoSystemSize = action.payload;
      state.lastModified = new Date().toISOString();
    },
    
    setAutoEstimatedAnnualGeneration: (state, action: PayloadAction<number>) => {
      state.autoEstimatedAnnualGeneration = action.payload;
      state.lastModified = new Date().toISOString();
    },
    
    setAutoPanelWattage: (state, action: PayloadAction<number>) => {
      state.autoPanelWattage = action.payload;
      state.lastModified = new Date().toISOString();
    },
    
    setAutoShowPanels: (state, action: PayloadAction<boolean>) => {
      state.autoShowPanels = action.payload;
    },
    
    setAutoShowIrradianceAnimation: (state, action: PayloadAction<boolean>) => {
      state.autoShowIrradianceAnimation = action.payload;
    },
    
    setAutoShowRoofOnly: (state, action: PayloadAction<boolean>) => {
      state.autoShowRoofOnly = action.payload;
    },
    
    // Auto Panel Config Actions
    setAutoPanelConfig: (state, action: PayloadAction<AutoPanelConfig[]>) => {
      state.autoPanelConfig = action.payload;
      state.lastModified = new Date().toISOString();
    },
    
    addAutoPanelConfig: (state, action: PayloadAction<AutoPanelConfig>) => {
      state.autoPanelConfig.push(action.payload);
      state.lastModified = new Date().toISOString();
    },
    
    updateAutoPanelConfig: (state, action: PayloadAction<{ index: number; updates: Partial<AutoPanelConfig> }>) => {
      const { index, updates } = action.payload;
      if (index >= 0 && index < state.autoPanelConfig.length) {
        state.autoPanelConfig[index] = { ...state.autoPanelConfig[index], ...updates };
        state.lastModified = new Date().toISOString();
      }
    },
    
    removeAutoPanelConfig: (state, action: PayloadAction<number>) => {
      const index = action.payload;
      if (index >= 0 && index < state.autoPanelConfig.length) {
        state.autoPanelConfig.splice(index, 1);
        state.lastModified = new Date().toISOString();
      }
    },
    
    clearAutoPanelConfig: (state) => {
      state.autoPanelConfig = [];
      state.lastModified = new Date().toISOString();
    },
    
    // Bulk Auto Design Settings Update
    updateAutoDesignSettings: (state, action: PayloadAction<{
      totalPanels?: number;
      autoSystemSize?: number;
      autoEstimatedAnnualGeneration?: number;
      autoPanelWattage?: number;
      autoShowPanels?: boolean;
      autoShowIrradianceAnimation?: boolean;
      autoShowRoofOnly?: boolean;
      autoPanelConfig?: AutoPanelConfig[];
    }>) => {
      const updates = action.payload;
      if (updates.totalPanels !== undefined) state.totalPanels = updates.totalPanels;
      if (updates.autoSystemSize !== undefined) state.autoSystemSize = updates.autoSystemSize;
      if (updates.autoEstimatedAnnualGeneration !== undefined) state.autoEstimatedAnnualGeneration = updates.autoEstimatedAnnualGeneration;
      if (updates.autoPanelWattage !== undefined) state.autoPanelWattage = updates.autoPanelWattage;
      if (updates.autoShowPanels !== undefined) state.autoShowPanels = updates.autoShowPanels;
      if (updates.autoShowIrradianceAnimation !== undefined) state.autoShowIrradianceAnimation = updates.autoShowIrradianceAnimation;
      if (updates.autoShowRoofOnly !== undefined) state.autoShowRoofOnly = updates.autoShowRoofOnly;
      if (updates.autoPanelConfig !== undefined) state.autoPanelConfig = updates.autoPanelConfig;
      state.lastModified = new Date().toISOString();
    },
    
    // UI State Actions
    setSelectedArea: (state, action: PayloadAction<string | null>) => {
      state.selectedArea = action.payload;
    },
    
    setSelectedDetectedRoof: (state, action: PayloadAction<string | null>) => {
      state.selectedDetectedRoof = action.payload;
    },
    
    setSelectedShadeSource: (state, action: PayloadAction<string | null>) => {
      state.selectedShadeSource = action.payload;
    },
    
    setSelectedPanel: (state, action: PayloadAction<string | null>) => {
      state.selectedPanel = action.payload;
    },
    
    setCurrentView: (state, action: PayloadAction<'measurement' | 'shade' | 'sunDirection' | 'panelPositioning' | null>) => {
      state.currentView = action.payload;
    },
    
    // Calculations Actions
    updateCalculations: (state, action: PayloadAction<Partial<AnalysisState['calculations']>>) => {
      state.calculations = { ...state.calculations, ...action.payload };
      state.lastModified = new Date().toISOString();
    },
    
    // Bulk Actions
    clearAllData: (state) => {
      return { ...initialState, projectId: state.projectId, projectName: state.projectName };
    },
    
    loadProjectData: (state, action: PayloadAction<AnalysisState>) => {
      return action.payload;
    }
  }
});

export const {
  // Project Management
  setProjectInfo,
  updateProjectSettings,
  
  // Roof Analysis
  setRoofAnalysis,
  setDetectedRoofAreas,
  addDetectedRoofArea,
  updateDetectedRoofArea,
  removeDetectedRoofArea,
  setMeasurementAreas,
  addMeasurementArea,
  updateMeasurementArea,
  removeMeasurementArea,
  
  // Shade Analysis
  setShadeSources,
  addShadeSource,
  updateShadeSource,
  removeShadeSource,
  setShadePatterns,
  setCurrentShadeTime,
  setCurrentShadeSeason,
  
  // Sun Direction Analysis
  setSunPositions,
  setCurrentSunTime,
  setCurrentSunSeason,
  setOptimalOrientation,
  
  // Panel Positioning
  setSolarPanels,
  addSolarPanel,
  updateSolarPanel,
  removeSolarPanel,
  setPanelLayouts,
  updatePanelSpecs,
  setLayoutMode,
  setOptimizationMode,
  
  // Auto Design Panel Settings
  setTotalPanels,
  setAutoSystemSize,
  setAutoEstimatedAnnualGeneration,
  setAutoPanelWattage,
  setAutoShowPanels,
  setAutoShowIrradianceAnimation,
  setAutoShowRoofOnly,
  updateAutoDesignSettings,
  
  // Auto Panel Config
  setAutoPanelConfig,
  addAutoPanelConfig,
  updateAutoPanelConfig,
  removeAutoPanelConfig,
  clearAutoPanelConfig,
  
  // UI State
  setSelectedArea,
  setSelectedDetectedRoof,
  setSelectedShadeSource,
  setSelectedPanel,
  setCurrentView,
  
  // Calculations
  updateCalculations,
  
  // Bulk Actions
  clearAllData,
  loadProjectData
} = analysisSlice.actions;

export default analysisSlice.reducer;