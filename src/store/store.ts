import { configureStore, combineReducers } from '@reduxjs/toolkit';
import analysisReducer from './analysisSlice';
import authReducer from './authSlice';
import createUndoRedoSlice from './undoRedoSlice';
import { AnalysisState } from './types';

// Get initial state for undo/redo
const initialAnalysisState: AnalysisState = {
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
  roofAnalysis: null,
  detectedRoofAreas: [],
  measurementAreas: [],
  shadeSources: [],
  shadePatterns: [],
  currentShadeTime: '12:00 PM',
  currentShadeSeason: 'summer',
  sunPositions: [],
  currentSunTime: '12:00 PM',
  currentSunSeason: 'summer',
  optimalOrientation: null,
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
  totalPanels: 0,
  autoSystemSize: 0,
  autoEstimatedAnnualGeneration: 0,
  autoPanelWattage: 400,
  autoShowPanels: true,
  autoShowIrradianceAnimation: false,
  autoPanelConfig: [],
  selectedArea: null,
  selectedDetectedRoof: null,
  selectedShadeSource: null,
  selectedPanel: null,
  currentView: null,
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

// Create undo/redo slice
const undoRedoSlice = createUndoRedoSlice(initialAnalysisState, 50);

// Enhanced analysis reducer that works with undo/redo
const enhancedAnalysisReducer = (state: any, action: any) => {
  const newState = analysisReducer(state?.present || initialAnalysisState, action);
  
  // Actions that should trigger undo/redo history
  const historyActions = [
    'analysis/setRoofAnalysis',
    'analysis/addDetectedRoofArea',
    'analysis/updateDetectedRoofArea',
    'analysis/removeDetectedRoofArea',
    'analysis/addMeasurementArea',
    'analysis/updateMeasurementArea',
    'analysis/removeMeasurementArea',
    'analysis/addShadeSource',
    'analysis/updateShadeSource',
    'analysis/removeShadeSource',
    'analysis/addSolarPanel',
    'analysis/updateSolarPanel',
    'analysis/removeSolarPanel',
    'analysis/updatePanelSpecs',
    'analysis/setLayoutMode',
    'analysis/setOptimizationMode',
    'analysis/setTotalPanels',
    'analysis/setAutoSystemSize',
    'analysis/setAutoEstimatedAnnualGeneration',
    'analysis/setAutoPanelWattage',
    'analysis/updateAutoDesignSettings',
    'analysis/setAutoPanelConfig',
    'analysis/addAutoPanelConfig',
    'analysis/updateAutoPanelConfig',
    'analysis/removeAutoPanelConfig',
    'analysis/clearAutoPanelConfig',
    'analysis/clearAllData'
  ];
  
  // Handle undo/redo state management
  if (action.type === 'undoRedo/undo' || action.type === 'undoRedo/redo' || action.type === 'undoRedo/jumpToState') {
    return undoRedoSlice.reducer(state, action);
  }
  
  if (historyActions.includes(action.type)) {
    // Save to history before applying the change
    const undoRedoState = undoRedoSlice.reducer(state, undoRedoSlice.actions.executeAction({ type: action.type, payload: action.payload }));
    // Update present state
    return undoRedoSlice.reducer(undoRedoState, undoRedoSlice.actions.updatePresent(newState));
  }
  
  // For non-history actions, just update present state
  if (state?.present) {
    return undoRedoSlice.reducer(state, undoRedoSlice.actions.updatePresent(newState));
  }
  
  // Initial state
  return {
    past: [],
    present: newState,
    future: [],
    maxHistorySize: 50
  };
};

const rootReducer = combineReducers({
  auth: authReducer,
  analysis: enhancedAnalysisReducer
});

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types for serialization checks
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
        // Ignore these field paths in all actions
        ignoredActionsPaths: ['meta.arg', 'payload.timestamp'],
        // Ignore these paths in the state
        ignoredPaths: ['analysis.present.createdAt', 'analysis.present.lastModified']
      }
    }),
  devTools: process.env.NODE_ENV !== 'production'
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Export undo/redo actions
export const { undo, redo, clearHistory, jumpToState } = undoRedoSlice.actions;