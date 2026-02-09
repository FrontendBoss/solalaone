import React, { useEffect, useState, useRef, useCallback } from "react";
import { Zap,Loader } from "lucide-react";


import Expandable from "../components/Expandable";
import Show from "../components/Show";
import SummaryCard from "../components/SummaryCard";
import InputBool from "../components/InputBool";
import InputPanelsCount from "../components/InputPanelsCount";
import NumberInput from "../components/InputNumber";
import Gauge from "../components/Gauge";
// Import your utility functions and palettes
import { createPalette, normalize, rgbToColor } from "../utils/visualize";
import { panelsPalette } from "../utils/colors";
import { findClosestBuilding } from "../utils/solar";
import { showNumber } from "../utils/util";
import { useAutoDesignData } from '../store/hooks';
import { useAppDispatch } from '../store/hooks';
import { setAutoPanelConfig, addAutoPanelConfig } from '../store/analysisSlice';
import { setTotalPanels, updateAutoDesignSettings } from '../store/analysisSlice';

const icon = "home";
const title = "Building Insights endpoint";

const BuildingInsightsSection = ({
  expandedSection,
  setExpandedSection,
  buildingInsights,
  setBuildingInsights,
  configId,
  setConfigId,
  panelCapacityWatts,
  setPanelCapacityWatts,

  googleMapsApiKey,
  geometryLibrary,
  location,
  map,
}: {
  expandedSection: string;
  setExpandedSection: (s: string) => void;
  buildingInsights: any;
  setBuildingInsights: (b: any) => void;
  configId: number | undefined;
  setConfigId: (id: number | undefined) => void;
  panelCapacityWatts: number;
  setPanelCapacityWatts: (w: number) => void;

  googleMapsApiKey: string;
  geometryLibrary: google.maps.GeometryLibrary;
  location: google.maps.LatLng;
  map: google.maps.Map;
}) => {
  const dispatch = useAppDispatch();
  const [requestSent, setRequestSent] = useState(false);
  const [requestError, setRequestError] = useState<any>(undefined);
  const [panelConfig, setPanelConfig] = useState<any>(undefined);
  const [solarPanels, setSolarPanels] = useState<google.maps.Polygon[]>([]);
  const apiResponseDialog = useRef<HTMLDialogElement>(null);
  const { 
    totalPanels, 
    autoSystemSize, 
    autoEstimatedAnnualGeneration,
    autoPanelWattage,
    autoShowPanels,
    autoShowIrradianceAnimation,
    autoPanelConfig 
  } = useAutoDesignData();

  const setShowPanels = (value: boolean) => {
    dispatch(updateAutoDesignSettings({ autoShowPanels: value }));
  };

  // Panel capacity ratio
  const panelCapacityRatio = React.useMemo(() => {
    if (!buildingInsights) return 1.0;
    const defaultPanelCapacity = buildingInsights.solarPotential.panelCapacityWatts;
    return panelCapacityWatts / defaultPanelCapacity;
  }, [buildingInsights, panelCapacityWatts]);

  // Update panelConfig when buildingInsights or configId changes
  useEffect(() => {
    if (buildingInsights && configId !== undefined) {
      setPanelConfig(buildingInsights.solarPotential.solarPanelConfigs[configId]);
      dispatch(setAutoPanelConfig(buildingInsights.solarPotential.solarPanelConfigs[configId]));
    }
  }, [buildingInsights, configId, dispatch]);

  // Show/hide solar panels on map
  useEffect(() => {
    solarPanels.forEach((panel, i) => {
      panel.setMap(
        autoShowPanels && panelConfig && i < panelConfig.panelsCount ? map : null
      );
    });
    // Clean up on unmount
    return () => {
      solarPanels.forEach((panel) => panel.setMap(null));
    };
    // eslint-disable-next-line
  }, [solarPanels, autoShowPanels, panelConfig, map]);

  // Create solar panels polygons
  const createSolarPanels = useCallback(
    (buildingInsights: any) => {
      const solarPotential = buildingInsights.solarPotential;
      const palette = createPalette(panelsPalette).map(rgbToColor);
      const minEnergy = solarPotential.solarPanels.slice(-1)[0].yearlyEnergyDcKwh;
      const maxEnergy = solarPotential.solarPanels[0].yearlyEnergyDcKwh;
      return solarPotential.solarPanels.map((panel: any) => {
        const [w, h] = [
          solarPotential.panelWidthMeters / 2,
          solarPotential.panelHeightMeters / 2,
        ];
        const points = [
          { x: +w, y: +h }, // top right
          { x: +w, y: -h }, // bottom right
          { x: -w, y: -h }, // bottom left
          { x: -w, y: +h }, // top left
          { x: +w, y: +h }, // top right
        ];
        const orientation = panel.orientation === "PORTRAIT" ? 90 : 0;
        const azimuth =
          solarPotential.roofSegmentStats[panel.segmentIndex].azimuthDegrees;
        const colorIndex = Math.round(
          normalize(panel.yearlyEnergyDcKwh, maxEnergy, minEnergy) * 255
        );
        return new google.maps.Polygon({
          paths: points.map(({ x, y }) =>
            geometryLibrary.spherical.computeOffset(
              { lat: panel.center.latitude, lng: panel.center.longitude },
              Math.sqrt(x * x + y * y),
              Math.atan2(y, x) * (180 / Math.PI) + orientation + azimuth
            )
          ),
          strokeColor: "#B0BEC5",
          strokeOpacity: 0.9,
          strokeWeight: 1,
          fillColor: palette[colorIndex],
          fillOpacity: 0.9,
        });
      });
    },
    [geometryLibrary]
  );

  // Fetch building insights and create solar panels
  const showSolarPotential = useCallback(
    async (loc: google.maps.LatLng) => {
      if (requestSent) return;
      setRequestSent(true);
      setBuildingInsights(undefined);
      setRequestError(undefined);
      solarPanels.forEach((panel) => panel.setMap(null));
      setSolarPanels([]);
      try {
        const insights = await findClosestBuilding(loc, googleMapsApiKey);
        setBuildingInsights(insights);
        const panels = createSolarPanels(insights);
        setSolarPanels(panels);
      } catch (e: any) {
        setRequestError(e);
      } finally {
        setRequestSent(false);
      }
    },
    [
      requestSent,
      setBuildingInsights,
      setRequestError,
      googleMapsApiKey,
      createSolarPanels,
      solarPanels,
    ]
  );

  // Call showSolarPotential when location changes
  useEffect(() => {
    showSolarPotential(location);
    // eslint-disable-next-line
  }, [location]);

  // Dialog open/close handlers
  const openDialog = () => {
    if (apiResponseDialog.current) apiResponseDialog.current.showModal();
  };
  const closeDialog = () => {
    if (apiResponseDialog.current) apiResponseDialog.current.close();
  };

  // Section rendering logic
  if (requestError) {
    return (
      <div className="error-container on-error-container-text">
        <Expandable section={title} icon="error" title={title} subtitle={requestError.error.status}>
          <div className="grid place-items-center py-2 space-y-4">
            <div className="grid place-items-center">
              <p className="body-medium">
                Error on <code>buildingInsights</code> request
              </p>
              <p className="title-large">ERROR {requestError.error.code}</p>
              <p className="body-medium">
                <code>{requestError.error.status}</code>
              </p>
              <p className="label-medium">{requestError.error.message}</p>
            </div>
            <button className="md-filled-button" onClick={() => showSolarPotential(location)}>
              Retry
              <span className="material-icons ml-2">refresh</span>
            </button>
          </div>
        </Expandable>
      </div>
    );
  }

  if (!buildingInsights) {
    return (
     <div className="flex justify-center items-center py-8">
  <Loader className="h-10 w-10 animate-spin text-gray-600" />
</div>
    );
  }

  if (configId !== undefined && panelConfig) {
    return (
      <>
        <div className="bg-white p-8 rounded-xl shadow-lg space-y-8">
          <InputPanelsCount
            configId={configId}
            setConfigId={setConfigId}
            solarPanelConfigs={buildingInsights.solarPotential.solarPanelConfigs}
          />
          <NumberInput
            icon="Zap"
            label="Panel capacity"
            value={panelCapacityWatts}
            onChange={setPanelCapacityWatts}
            suffix="Watts"
          />
     
        
        </div>
        

      
      </>
    );
  }

  return null;
};

export default BuildingInsightsSection;