import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, CreditCard, AlertCircle, X } from 'lucide-react';
import { creditService, CreditBalance } from '../services/creditService';

declare global {
  interface Window {
    google: typeof google;
  }
}

interface SearchBarProps {
  location?: google.maps.LatLng;
  placesLibrary: typeof google.maps.places;
  map: google.maps.Map;
  initialValue?: string;
  zoom?: number;
  onLocationChange?: (loc: google.maps.LatLng) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({
  location,
  placesLibrary,
  map,
  initialValue = "",
  zoom = 19,
  onLocationChange = () => {},
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [balance, setBalance] = useState<CreditBalance | null>(null);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadBalance();

    // Refresh balance every 5 seconds to catch updates from API calls
    const interval = setInterval(loadBalance, 5000);

    // Also refresh when window regains focus
    const handleFocus = () => loadBalance();
    window.addEventListener('focus', handleFocus);

    // Listen for custom credit update events
    const handleCreditUpdate = () => loadBalance();
    window.addEventListener('creditsUpdated', handleCreditUpdate);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('creditsUpdated', handleCreditUpdate);
    };
  }, []);

  const loadBalance = async () => {
    const data = await creditService.getBalance();
    setBalance(data);
  };

  useEffect(() => {
    if (!inputRef.current || !placesLibrary) return;

    const autocomplete = new placesLibrary.Autocomplete(inputRef.current, {
      fields: ["formatted_address", "geometry", "name"],
    });

    autocomplete.addListener("place_changed", () => {
      const place = autocomplete.getPlace();
      if (!place.geometry || !place.geometry.location) {
        inputRef.current!.value = "";
        return;
      }

      if (balance && balance.total === 0) {
        setShowModal(true);
        return;
      }

      if (place.geometry.viewport) {
        map.setCenter(place.geometry.location);
        map.setZoom(zoom);
      } else {
        map.setCenter(place.geometry.location);
        map.setZoom(zoom);
      }
      if (onLocationChange) {
        onLocationChange(place.geometry.location);
      }
      if (place.name) {
        inputRef.current!.value = place.name;
      } else if (place.formatted_address) {
        inputRef.current!.value = place.formatted_address;
      }
    });
  }, [placesLibrary, map, zoom, onLocationChange, balance]);

  return (
    <>
      <div className="relative flex flex-col bg-white rounded-xl shadow-md p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <MapPin className="h-5 w-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900">Property Address</h2>
          </div>
          {balance && (
            <div className="flex items-center gap-2 bg-gradient-to-r from-blue-50 to-blue-100 px-3 py-1.5 rounded-lg border border-blue-200">
              <CreditCard className="h-4 w-4 text-blue-600" />
              <div className="text-right">
                <p className="text-xs text-blue-600 font-medium">Credits</p>
                <p className="text-sm font-bold text-blue-700">{balance.total}</p>
              </div>
            </div>
          )}
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            ref={inputRef}
            type="text"
            defaultValue={initialValue}
            placeholder={balance && balance.total === 0 ? "No credits available" : "Search an address"}
            className={`pl-10 pr-4 py-2 rounded border w-full ${
              balance && balance.total === 0 ? 'bg-gray-100 cursor-not-allowed' : ''
            }`}
            disabled={balance?.total === 0}
          />
        </div>
        {balance && balance.total > 0 && (
          <p className="text-xs text-gray-500 mt-2">
            {balance.monthly_allowance} monthly + {balance.purchased_credits} purchased credits
          </p>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="bg-red-100 rounded-full p-3">
                  <AlertCircle className="h-6 w-6 text-red-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Out of Credits</h2>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <p className="text-gray-600 mb-6">
              You've used all your available credits. Purchase more credits to continue performing solar assessments.
            </p>
            <div className="space-y-3">
              <button
                onClick={() => navigate('/pricing')}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all"
              >
                Buy Credits Now
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="w-full bg-gray-100 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-200 transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SearchBar;
