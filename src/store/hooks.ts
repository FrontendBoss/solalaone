import { useDispatch, useSelector, TypedUseSelectorHook } from 'react-redux';
import type { RootState, AppDispatch } from './store';

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

// Custom hooks for common operations
export const useAnalysisState = () => {
  return useAppSelector(state => state.analysis.present);
};

export const useUndoRedoState = () => {
  return useAppSelector(state => ({
    canUndo: state.analysis.past.length > 0,
    canRedo: state.analysis.future.length > 0,
    historyLength: state.analysis.past.length,
    futureLength: state.analysis.future.length
  }));
};

export const useProjectInfo = () => {
  return useAppSelector(state => ({
    projectId: state.analysis.present.projectId,
    projectName: state.analysis.present.projectName,
    createdAt: state.analysis.present.createdAt,
    lastModified: state.analysis.present.lastModified
  }));
};

export const useProjectSettings = () => {
  return useAppSelector(state => state.analysis.present.settings);
};

export const useRoofData = () => {
  return useAppSelector(state => ({
    roofAnalysis: state.analysis.present.roofAnalysis,
    detectedRoofAreas: state.analysis.present.detectedRoofAreas,
    measurementAreas: state.analysis.present.measurementAreas,
    selectedArea: state.analysis.present.selectedArea,
    selectedDetectedRoof: state.analysis.present.selectedDetectedRoof
  }));
};

export const useShadeData = () => {
  return useAppSelector(state => ({
    shadeSources: state.analysis.present.shadeSources,
    shadePatterns: state.analysis.present.shadePatterns,
    currentShadeTime: state.analysis.present.currentShadeTime,
    currentShadeSeason: state.analysis.present.currentShadeSeason,
    selectedShadeSource: state.analysis.present.selectedShadeSource
  }));
};

export const useSunData = () => {
  return useAppSelector(state => ({
    sunPositions: state.analysis.present.sunPositions,
    currentSunTime: state.analysis.present.currentSunTime,
    currentSunSeason: state.analysis.present.currentSunSeason,
    optimalOrientation: state.analysis.present.optimalOrientation
  }));
};

export const usePanelData = () => {
  return useAppSelector(state => ({
    solarPanels: state.analysis.present.solarPanels,
    panelLayouts: state.analysis.present.panelLayouts,
    panelSpecs: state.analysis.present.panelSpecs,
    layoutMode: state.analysis.present.layoutMode,
    optimizationMode: state.analysis.present.optimizationMode,
    selectedPanel: state.analysis.present.selectedPanel
  }));
};

export const useAutoDesignData = () => {
  return useAppSelector(state => ({
    totalPanels: state.analysis.present.totalPanels,
    autoSystemSize: state.analysis.present.autoSystemSize,
    autoEstimatedAnnualGeneration: state.analysis.present.autoEstimatedAnnualGeneration,
    autoPanelWattage: state.analysis.present.autoPanelWattage,
    autoShowPanels: state.analysis.present.autoShowPanels,
    autoShowIrradianceAnimation: state.analysis.present.autoShowIrradianceAnimation,
    autoShowRoofOnly: state.analysis.present.autoShowRoofOnly,
    autoPanelConfig: state.analysis.present.autoPanelConfig
  }));
};

export const useCalculations = () => {
  return useAppSelector(state => state.analysis.present.calculations);
};

export const useCurrentView = () => {
  return useAppSelector(state => state.analysis.present.currentView);
};

// Auth-specific hooks
export const useAuthState = () => {
  return useAppSelector(state => state.auth);
};

export const useIsAuthenticated = () => {
  return useAppSelector(state => 
    !!state.auth.user && !!state.auth.session && state.auth.initialized
  );
};