import React, { useState } from "react";
import { Sun } from "lucide-react";

export interface SolarPanelConfig {
  panelsCount: number;
  // Add any other properties from your Svelte SolarPanelConfig type here
}

interface InputPanelsCountProps {
  configId: number;
  setConfigId: (id: number) => void;
  solarPanelConfigs: SolarPanelConfig[];
}

const InputPanelsCount: React.FC<InputPanelsCountProps> = ({
  configId,
  setConfigId,
  solarPanelConfigs,
}) => {
  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newId = Number(e.target.value);
    console.log("Slider changed to configId:", newId);
    setConfigId(newId);
  };

  const currentPanelsCount = solarPanelConfigs[configId]?.panelsCount || 0;
  const progressPercentage = solarPanelConfigs.length > 1 
    ? (configId / (solarPanelConfigs.length - 1)) * 100 
    : 0;

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
      {/* Header Section */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-orange-100 rounded-lg">
            <Sun size={20} className="text-orange-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Solar Panels</h3>
            <p className="text-sm text-gray-500">Configure panel count</p>
          </div>
        </div>
        
        {/* Current Value Display */}
        <div className="text-right">
          <div className="text-2xl font-bold text-orange-600">
            {currentPanelsCount}
          </div>
          <div className="text-sm text-gray-500">panels</div>
        </div>
      </div>

      {/* Slider Section */}
      <div className="space-y-4">
        <div className="relative px-2">
          {/* Custom Slider Track */}
          <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="absolute h-full bg-gradient-to-r from-orange-400 to-orange-600 transition-all duration-150 ease-out rounded-full"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          
          {/* Slider Input with Custom Styling */}
          <input
            type="range"
            className="absolute inset-0 w-full h-2 cursor-pointer slider-custom"
            value={configId}
            min={0}
            max={solarPanelConfigs.length - 1}
            onChange={handleSliderChange}
            style={{
              background: 'transparent',
              WebkitAppearance: 'none',
              appearance: 'none',
            }}
          />
        </div>
        
        {/* Custom CSS for slider thumb */}
        <style jsx>{`
          .slider-custom::-webkit-slider-thumb {
            -webkit-appearance: none;
            appearance: none;
            width: 20px;
            height: 20px;
            background: white;
            border: 2px solid #ea580c;
            border-radius: 50%;
            cursor: pointer;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            transition: transform 0.1s ease, box-shadow 0.1s ease;
          }
          
          .slider-custom::-webkit-slider-thumb:hover {
            transform: scale(1.1);
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
          }
          
          .slider-custom::-webkit-slider-thumb:active {
            transform: scale(1.05);
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
          }
          
          .slider-custom::-moz-range-thumb {
            width: 20px;
            height: 20px;
            background: white;
            border: 2px solid #ea580c;
            border-radius: 50%;
            cursor: pointer;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            transition: transform 0.1s ease, box-shadow 0.1s ease;
            -moz-appearance: none;
            appearance: none;
          }
          
          .slider-custom::-moz-range-thumb:hover {
            transform: scale(1.1);
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
          }
          
          .slider-custom::-moz-range-thumb:active {
            transform: scale(1.05);
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
          }
          
          .slider-custom::-moz-range-track {
            background: transparent;
            border: none;
            height: 8px;
          }
          
          .slider-custom:focus {
            outline: none;
          }
          
          .slider-custom:focus::-webkit-slider-thumb {
            box-shadow: 0 0 0 3px rgba(234, 88, 12, 0.2);
          }
          
          .slider-custom:focus::-moz-range-thumb {
            box-shadow: 0 0 0 3px rgba(234, 88, 12, 0.2);
          }
        `}</style>

        {/* Range Labels */}
        <div className="flex justify-between text-xs text-gray-500 px-1">
          <span>{solarPanelConfigs[0]?.panelsCount || 0} panels</span>
          <span>{solarPanelConfigs[solarPanelConfigs.length - 1]?.panelsCount || 0}  panels</span>
        </div>
         <div className="flex justify-between text-xs text-gray-500 px-1">
          <span> Min </span>
          <span> Max </span>
        </div>
      </div>

      {/* Configuration Info */}
      
    </div>
  );
};
export default InputPanelsCount;