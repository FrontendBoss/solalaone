import React, { useEffect, useRef, useState } from "react";
import { Loader } from "@googlemaps/js-api-loader";
import { ArrowLeft, Zap, Grid, RotateCw, Move, Eye, EyeOff, Download, Settings, Play, Pause, RefreshCw, Calculator, Sun, AlertTriangle, CheckCircle, Info, Trash2, Plus } from 'lucide-react';
import SearchBar from "../components/SearchBar";
import Sections from "./Sections";
//import "./App.css";
//import "./theme/theme.css";
import { useAutoDesignData } from '../store/hooks';
import { useAppDispatch } from '../store/hooks';
import { setTotalPanels, updateAutoDesignSettings } from '../store/analysisSlice';

const googleMapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string;
const defaultPlace = {
  name: "Jubilee Library",
  address: "Jubilee Library, Jubilee St, Brighton and Hove, Brighton BN1 1GE, United Kingdom",
};
const zoom = 19;

export const AutoDesignMain: React.FC = () => {
  const dispatch = useAppDispatch();
  
  const mapElement = useRef<HTMLDivElement>(null);
  const [location, setLocation] = useState<google.maps.LatLng | undefined>(undefined);
  const [map, setMap] = useState<google.maps.Map | undefined>(undefined);
  const [geometryLibrary, setGeometryLibrary] = useState<any>(undefined);
  const [mapsLibrary, setMapsLibrary] = useState<any>(undefined);
  const [placesLibrary, setPlacesLibrary] = useState<any>(undefined);
const { 
    totalPanels, 
    autoSystemSize, 
    autoEstimatedAnnualGeneration,
    autoPanelWattage,
    autoShowPanels,autoShowRoofOnly,
    autoShowIrradianceAnimation,autoPanelConfig 
  } = useAutoDesignData();

  useEffect(() => {
    const loadMap = async () => {
      const loader = new Loader({ apiKey: googleMapsApiKey });
      const geometry = await loader.importLibrary("geometry");
      const maps = await loader.importLibrary("maps");
      const places = await loader.importLibrary("places");
      setGeometryLibrary(geometry);
      setMapsLibrary(maps);
      setPlacesLibrary(places);

      // Geocode default address
      const geocoder = new window.google.maps.Geocoder();
      const geocoderResponse = await geocoder.geocode({ address: defaultPlace.address });
      const geocoderResult = geocoderResponse.results[0];
      const loc = geocoderResult.geometry.location;
      setLocation(loc);

      // Initialize map
      if (mapElement.current) {
        const m = new maps.Map(mapElement.current, {
          center: loc,
          zoom: zoom,
          tilt: 0,
          mapTypeId: "satellite",
          mapTypeControl: false,
          fullscreenControl: false,
          rotateControl: false,
          streetViewControl: false,
          zoomControl: false,
        });
        setMap(m);
      }
    };
    loadMap();
  }, []);
  const setPlayAnimation = (value: boolean) => {
    dispatch(updateAutoDesignSettings({ autoShowIrradianceAnimation: value }));
  };
   const setShowPanels = (value: boolean) => {
    dispatch(updateAutoDesignSettings({ autoShowPanels: value }));
  };

   const setShowRoofOnly = (value: boolean) => {
    dispatch(updateAutoDesignSettings({ autoShowRoofOnly: value }));
  };
  return (
    <div className="flex flex-col lg:flex-row h-full min-h-screen">
     <div className="flex flex-col flex-1 h-[50vh] lg:h-screen lg:w-1/2 bg-white rounded-none lg:rounded-xl shadow-md border-b lg:border border-gray-200 overflow-hidden lg:mt-1">
       <div className="px-3 sm:px-4 md:px-6 py-3 md:py-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100">
         <h3 className="text-xs sm:text-sm font-semibold text-blue-800 leading-relaxed">
           AI automatically analyzes billions of data points to measure how much sunlight actually reaches your roof, factoring in both direct sunlight and shading from trees, buildings, and other obstructions.
         </h3>
       </div>
      <div className="bg-gray-50 px-3 sm:px-4 md:px-6 py-2 md:py-4 border-b border-gray-200">
  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
    <h4 className="font-semibold text-gray-900 text-sm md:text-base">Panel Layout Visualization</h4>
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-2">
      <button onClick={()=>setShowPanels(!autoShowPanels)}
        className={`flex items-center justify-center px-2 sm:px-3 py-1.5 sm:py-1 rounded-lg text-xs sm:text-sm transition-colors duration-200 ${
          autoShowPanels
            ? 'bg-green-600 text-white'
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
        }`}
      >
        <Eye className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
        <span className="whitespace-nowrap">Show Panels</span>
      </button>
      


      

    </div>
  </div>
</div>

      {/* Main map */}
     <div  ref={mapElement}  className="w-full flex-1 min-h-[200px]" ></div>
          <div className="p-2 sm:p-3 md:p-4 bg-gray-50 border-t border-gray-200">
           <div className="bg-white rounded-xl shadow-md border border-gray-200 p-3 md:p-4">
            <h4 className="font-semibold text-gray-900 mb-2 flex items-center space-x-2 text-sm md:text-base">
              <Zap className="h-4 w-4 text-orange-600" />
              <span>System Summary</span>
            </h4>
             <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-xs sm:text-sm text-gray-600 gap-2">

                <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 sm:gap-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-1">
                    <span className="text-gray-600">Panels:</span>
                    <span className="font-medium text-blue-600">{autoPanelConfig.panelsCount}</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-1">
                    <span>System Size:</span>
                   <span className="font-medium text-green-600">{(autoPanelWattage * autoPanelConfig.panelsCount)/1000} kW</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-1">
                    <span>Est Annual:</span>
                   <span className="font-medium text-orange-600">{((
            autoPanelConfig.yearlyEnergyDcKwh * (autoPanelWattage/400)) /
            1000)
          .toFixed(2)} MWh</span>
                  </div>
               <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-1">
                 <span>Panel rating:</span>
                 <span className="font-medium text-purple-600">{autoPanelWattage} W</span>
               </div>
                </div>
              </div>
            </div>
</div>

       <div className="px-3 sm:px-4 md:px-6 py-3 md:py-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-t border-blue-100">
         <p className="text-xs sm:text-sm font-semibold text-blue-800 leading-relaxed">
           Solar panels are first placed on the roof areas that receive the most sunlight, offer the highest efficiency, and have the least shading throughout the year.
         </p>
       </div>
</div>
      {/* Side bar */}
      <aside className="flex-none w-full lg:w-96 p-3 sm:p-4 lg:p-6 lg:pt-3 overflow-auto min-h-[50vh] lg:min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="flex flex-col space-y-2 h-full">
          {placesLibrary && map && (
            <SearchBar
              location={location}
              onLocationChange={setLocation}
              placesLibrary={placesLibrary}
              map={map}
              initialValue={defaultPlace.name}
            />
          )}



          {location && map && geometryLibrary && (
            <Sections
              location={location}
              map={map}
              geometryLibrary={geometryLibrary}
              googleMapsApiKey={googleMapsApiKey}
            />
          )}






        </div>
      </aside>
    </div>
  );
};

//export default AutoDesignApp;