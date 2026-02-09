import React, { useEffect, useRef, useState, useCallback } from "react";
import Calendar from "../components/Calendar";
import Dropdown from "../components/Dropdown";
import Expandable from "../components/Expandable";
import InputBool from "../components/InputBool";
import Show from "../components/Show";
import SummaryCard from "../components/SummaryCard";
// Import your utility functions and types
import { getLayer } from "../utils/layer";
import { getDataLayerUrls } from "../utils/solar";
import { useAutoDesignData } from '../store/hooks';
import { useAppDispatch } from '../store/hooks';
import { setAutoPanelConfig, addAutoPanelConfig } from '../store/analysisSlice';
import { setTotalPanels, updateAutoDesignSettings } from '../store/analysisSlice';

const icon = "layers";
const title = "Data Layers endpoint";

const dataLayerOptions = {
  none: "No layer",
  mask: "Roof mask",
  dsm: "Digital Surface Model",
  rgb: "Aerial image",
  annualFlux: "Annual sunshine",
  monthlyFlux: "Monthly sunshine",
  hourlyShade: "Hourly shade",
};

const monthNames = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

const DataLayersSection = ({
  expandedSection,
  setExpandedSection,
  googleMapsApiKey,
  buildingInsights,
  geometryLibrary,
  map,
}: {
  expandedSection: string;
  setExpandedSection: (s: string) => void;
  googleMapsApiKey: string;
  buildingInsights: any;
  geometryLibrary: google.maps.GeometryLibrary;
  map: google.maps.Map;
}) => {
  const dispatch = useAppDispatch();
  const [dataLayersResponse, setDataLayersResponse] = useState<any>(undefined);
  const [requestError, setRequestError] = useState<any>(undefined);
  const apiResponseDialog = useRef<HTMLDialogElement>(null);
  const [layerId, setLayerId] = useState<any>("monthlyFlux");
  const [layer, setLayer] = useState<any>(undefined);
  const [imageryQuality, setImageryQuality] = useState<"HIGH" | "MEDIUM" | "LOW">("HIGH");
  const [tick, setTick] = useState(0);
  const [month, setMonth] = useState(0);
  const [day, setDay] = useState(14);
  const [hour, setHour] = useState(0);
  const [overlays, setOverlays] = useState<google.maps.GroundOverlay[]>([]);

  const { 
    totalPanels, 
    autoSystemSize, 
    autoEstimatedAnnualGeneration,
    autoPanelWattage,
    autoShowPanels,
    autoShowIrradianceAnimation,
    autoShowRoofOnly,
    autoPanelConfig 
  } = useAutoDesignData();

  const setShowPanels = (value: boolean) => {
    dispatch(updateAutoDesignSettings({ autoShowPanels: value }));
  };

  const setPlayAnimation = (value: boolean) => {
    dispatch(updateAutoDesignSettings({ autoShowIrradianceAnimation: value }));
  };
  
  const setShowRoofOnly = (value: boolean) => {
    dispatch(updateAutoDesignSettings({ autoShowRoofOnly: value }));
  };

  // Show data layer logic
  const showDataLayer = useCallback(async (reset = false) => {
    if (reset) {
      setDataLayersResponse(undefined);
      setRequestError(undefined);
      setLayer(undefined);
      setShowRoofOnly(["annualFlux", "monthlyFlux", "hourlyShade"].includes(layerId));
      map.setMapTypeId(layerId === "rgb" ? "roadmap" : "satellite");
      overlays.forEach((overlay) => overlay.setMap(null));
      setMonth(layerId === "hourlyShade" ? 3 : 0);
      setDay(14);// change this to current day later
      setHour(5); // change this to current hour later
      // Don't set animation state here, let the user control it
    }
    if (layerId === "none") return;

    if (!layer) {
      const center = buildingInsights.center;
      const ne = buildingInsights.boundingBox.ne;
      const sw = buildingInsights.boundingBox.sw;
      const diameter = geometryLibrary.spherical.computeDistanceBetween(
        new google.maps.LatLng(ne.latitude, ne.longitude),
        new google.maps.LatLng(sw.latitude, sw.longitude)
      );
      const radius = Math.ceil(diameter / 2);
      try {
        const response = await getDataLayerUrls(center, radius, googleMapsApiKey);
        setDataLayersResponse(response);
        setImageryQuality(response.imageryQuality);
        const loadedLayer = await getLayer(layerId, response, googleMapsApiKey);
        setLayer(loadedLayer);
      } catch (e: any) {
        setRequestError(e);
        return;
      }
    }
    // overlays logic is handled in useEffect below
  }, [layerId, buildingInsights, geometryLibrary, googleMapsApiKey, map, overlays, layer, dispatch]);

  // Render overlays when layer changes
  useEffect(() => {
    if (!layer) return;
    const bounds = layer.bounds;
    overlays.forEach((overlay) => overlay.setMap(null));
    let newOverlays: google.maps.GroundOverlay[] = [];
    if (layer.render) {
      newOverlays = layer
        .render(autoShowRoofOnly, month, day)
        .map((canvas: HTMLCanvasElement) => new google.maps.GroundOverlay(canvas.toDataURL(), bounds));
      setOverlays(newOverlays);
      if (!["monthlyFlux", "hourlyShade"].includes(layer.id)) {
        newOverlays[0]?.setMap(map);
      }
    }
  }, [layer, autoShowRoofOnly, month, day, map]);

  // Animation logic - only create interval if animation is enabled
  useEffect(() => {
    if (!layer) return;
    let interval: NodeJS.Timeout | undefined;
    
    if (autoShowIrradianceAnimation) {
      interval = setInterval(() => setTick((t) => t + 1), 1000);
    } else {
      // Reset tick to current month/hour when animation is disabled
      if (layer.id === "monthlyFlux") {
        setTick(month);
      } else if (layer.id === "hourlyShade") {
        setTick(hour);
      }
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoShowIrradianceAnimation, layer, month, hour]);

  // Update overlays for animation - only update if animation is enabled or manual change
  useEffect(() => {
    if (!layer) return;
    
    if (layer.id === "monthlyFlux") {
      if (autoShowIrradianceAnimation) {
        setMonth(tick % 12);
      } else {
        // When animation is off, only update tick when month changes manually
        if (tick !== month) {
          setTick(month);
        }
      }
      
      // Only show overlay if it's the current month
      overlays.forEach((overlay, i) => {
        overlay.setMap(i === month ? map : null);
      });
    } else if (layer.id === "hourlyShade") {
      if (autoShowIrradianceAnimation) {
        setHour(tick % 24);
      } else {
        // When animation is off, only update tick when hour changes manually
        if (tick !== hour) {
          setTick(hour);
        }
      }
      
      // Only show overlay if it's the current hour
      overlays.forEach((overlay, i) => {
        overlay.setMap(i === hour ? map : null);
      });
    }
  }, [tick, month, hour, autoShowIrradianceAnimation, layer, map, overlays]);

  // On mount, show data layer
  useEffect(() => {
    showDataLayer(true);
  }, []);

  // Slider change handler
  const onSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    if (layer?.id === "monthlyFlux") {
      setMonth(value);
      setTick(value);
    } else if (layer?.id === "hourlyShade") {
      setHour(value);
      setTick(value);
    }
  };

  // Dialog open/close handlers
  const openDialog = () => {
    if (apiResponseDialog.current) apiResponseDialog.current.showModal();
  };
  const closeDialog = () => {
    if (apiResponseDialog.current) apiResponseDialog.current.close();
  };

  // Layer info for SummaryCard
  const layerInfo = () => {
    switch (layerId) {
      case "mask":
        return "The building mask image: one bit per pixel saying whether that pixel is considered to be part of a rooftop or not.";
      case "dsm":
        return "An image of the DSM (Digital Surface Model) of the region. Values are in meters above EGM96 geoid (i.e., sea level). Invalid locations (where we don't have data) are stored as -9999.";
      case "rgb":
        return "An image of RGB data (aerial photo) of the region.";
      case "annualFlux":
        return "The annual flux map (annual sunlight on roofs) of the region. Values are kWh/kW/year. This is unmasked flux: flux is computed for every location, not just building rooftops. Invalid locations are stored as -9999: locations outside our coverage area will be invalid, and a few locations inside the coverage area, where we were unable to calculate flux, will also be invalid.";
      case "monthlyFlux":
        return "The monthly flux map (sunlight on roofs, broken down by month) of the region. Values are kWh/kW/year. The GeoTIFF imagery file pointed to by this URL will contain twelve bands, corresponding to January...December, in order.";
      case "hourlyShade":
        return "Twelve URLs for hourly shade, corresponding to January...December, in order. Each GeoTIFF imagery file will contain 24 bands, corresponding to the 24 hours of the day. Each pixel is a 32 bit integer, corresponding to the (up to) 31 days of that month; a 1 bit means that the corresponding location is able to see the sun at that day, of that hour, of that month. Invalid locations are stored as -9999 (since this is negative, it has bit 31 set, and no valid value could have bit 31 set as that would correspond to the 32nd day of the month).";
      default:
        return "";
    }
  };

  return (
    <>
     
  

     
    </>
  );
};

export default DataLayersSection;