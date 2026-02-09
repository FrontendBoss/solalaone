import React, { useState, useMemo, useEffect } from "react";
import BuildingInsightsSection from "./BuildingInsightsSection";
import DataLayersSection from "./DataLayersSection";
import SolarPotentialSection from "./SolarPotentialSection";
// Import your types and utilities
// import { BuildingInsightsResponse } from "../solar";
import { findSolarConfig } from "../utils/util";
import { setTotalPanels, updateAutoDesignSettings } from '../store/analysisSlice';
import { useAppDispatch } from '../store/hooks';
import { useAutoDesignData } from '../store/hooks';
interface SectionsProps {
  location: google.maps.LatLng;
  map: google.maps.Map;
  geometryLibrary: google.maps.GeometryLibrary;
  googleMapsApiKey: string;
}

const Sections: React.FC<SectionsProps> = ({
  location,
  map,
  geometryLibrary,
  googleMapsApiKey,
}) => {
  // State
   const dispatch = useAppDispatch();
  const [buildingInsights, setBuildingInsights] = useState<any>(undefined);
  const [expandedSection, setExpandedSection] = useState<string>("");
  //const [showPanels, setShowPanels] = useState(true);
  const { 
    totalPanels, 
    autoSystemSize, 
    autoEstimatedAnnualGeneration,
    autoPanelWattage,
    autoShowPanels,
    autoShowIrradianceAnimation 
  } = useAutoDesignData();

  // User settings
  const [monthlyAverageEnergyBillInput, setMonthlyAverageEnergyBillInput] = useState(300);
  const [panelCapacityWattsInput, setPanelCapacityWattsInput] = useState(400);
  const [energyCostPerKwhInput, setEnergyCostPerKwhInput] = useState(0.31);
  const [dcToAcDerateInput, setDcToAcDerateInput] = useState(0.85);

  // Derived values
  const yearlyKwhEnergyConsumption = useMemo(
    () => (monthlyAverageEnergyBillInput / energyCostPerKwhInput) * 12,
    [monthlyAverageEnergyBillInput, energyCostPerKwhInput]
  );

  const [configId, setConfigId] = useState<number | undefined>(undefined);

  // Find configId when buildingInsights is loaded
  useEffect(() => {
    if (
      configId === undefined &&
      buildingInsights &&
      buildingInsights.solarPotential
    ) {
      const defaultPanelCapacity = buildingInsights.solarPotential.panelCapacityWatts;
      const panelCapacityRatio = panelCapacityWattsInput / defaultPanelCapacity;
      const id = findSolarConfig(
        buildingInsights.solarPotential.solarPanelConfigs,
        yearlyKwhEnergyConsumption,
        panelCapacityRatio,
        dcToAcDerateInput
      );
      setConfigId(id);
    }
    // eslint-disable-next-line
  }, [
    buildingInsights,
    configId,
    panelCapacityWattsInput,
    yearlyKwhEnergyConsumption,
    dcToAcDerateInput,
  ]);
//update the panel capacity in redux store when panel capacity input changes
  useEffect(()=>{
    dispatch(updateAutoDesignSettings({
      autoPanelWattage: panelCapacityWattsInput,

    }))
  },[panelCapacityWattsInput])

  const setShowPanels = (value) => {
  dispatch(updateAutoDesignSettings({ autoShowPanels: value }));
};
  return (
    <div className="flex flex-col rounded-md shadow-md">
      {geometryLibrary && map && (
        <BuildingInsightsSection
          expandedSection={expandedSection}
          setExpandedSection={setExpandedSection}
          buildingInsights={buildingInsights}
          setBuildingInsights={setBuildingInsights}
          configId={configId}
          setConfigId={setConfigId}
        
          panelCapacityWatts={panelCapacityWattsInput}
          setPanelCapacityWatts={setPanelCapacityWattsInput}
          googleMapsApiKey={googleMapsApiKey}
          geometryLibrary={geometryLibrary}
          location={location}
          map={map}
        />
      )}

      {buildingInsights && configId !== undefined && (
        <>
          <hr className="my-2" />
          {/* <DataLayersSection
            expandedSection={expandedSection}
            setExpandedSection={setExpandedSection}

            googleMapsApiKey={googleMapsApiKey}
            buildingInsights={buildingInsights}
            geometryLibrary={geometryLibrary}
            map={map}
          /> */}
          <hr className="my-2" />
          <SolarPotentialSection
            expandedSection={expandedSection}
            setExpandedSection={setExpandedSection}
            configId={configId}
            setConfigId={setConfigId}
            monthlyAverageEnergyBillInput={monthlyAverageEnergyBillInput}
            setMonthlyAverageEnergyBillInput={setMonthlyAverageEnergyBillInput}
            energyCostPerKwhInput={energyCostPerKwhInput}
            setEnergyCostPerKwhInput={setEnergyCostPerKwhInput}
            panelCapacityWattsInput={panelCapacityWattsInput}
            setPanelCapacityWattsInput={setPanelCapacityWattsInput}
            dcToAcDerateInput={dcToAcDerateInput}
            setDcToAcDerateInput={setDcToAcDerateInput}
            solarPanelConfigs={buildingInsights.solarPotential.solarPanelConfigs}
            defaultPanelCapacityWatts={buildingInsights.solarPotential.panelCapacityWatts}
          />
        </>
      )}
    </div>
  );
};

export default Sections;