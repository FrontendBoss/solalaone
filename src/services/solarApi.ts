import { Position, Size } from '../types/solar';

interface GoogleSolarApiConfig {
  apiKey: string;
  baseUrl: string;
}

interface BuildingInsights {
  name: string;
  center: {
    latitude: number;
    longitude: number;
  };
  boundingBox: {
    sw: { latitude: number; longitude: number };
    ne: { latitude: number; longitude: number };
  };
  imageryDate: {
    year: number;
    month: number;
    day: number;
  };
  imageryProcessedDate: {
    year: number;
    month: number;
    day: number;
  };
  postalCode: string;
  administrativeArea: string;
  statisticalArea: string;
  regionCode: string;
  solarPotential: {
    maxArrayPanelsCount: number;
    maxArrayAreaMeters2: number;
    maxSunshineHoursPerYear: number;
    carbonOffsetFactorKgPerMwh: number;
    wholeRoofStats: {
      areaMeters2: number;
      sunshineQuantiles: number[];
      groundAreaMeters2: number;
    };
    roofSegmentStats: Array<{
      pitchDegrees: number;
      azimuthDegrees: number;
      stats: {
        areaMeters2: number;
        sunshineQuantiles: number[];
        groundAreaMeters2: number;
      };
      center: {
        latitude: number;
        longitude: number;
      };
      boundingBox: {
        sw: { latitude: number; longitude: number };
        ne: { latitude: number; longitude: number };
      };
    }>;
    solarPanelConfigs: Array<{
      panelsCount: number;
      yearlyEnergyDcKwh: number;
      roofSegmentSummaries: Array<{
        pitchDegrees: number;
        azimuthDegrees: number;
        panelsCount: number;
        yearlyEnergyDcKwh: number;
        segmentIndex: number;
      }>;
    }>;
    financialAnalyses: Array<{
      monthlyBill: {
        currencyCode: string;
        units: string;
      };
      defaultBill: boolean;
      averageKwhPerMonth: number;
      panelConfigIndex: number;
    }>;
  };
}

interface DataLayers {
  imageryDate: {
    year: number;
    month: number;
    day: number;
  };
  imageryProcessedDate: {
    year: number;
    month: number;
    day: number;
  };
  dsmUrl: string;
  rgbUrl: string;
  maskUrl: string;
  annualFluxUrl: string;
  monthlyFluxUrl: string;
  hourlyShadeUrls: string[];
}

interface DetectedRoofSection {
  id: string;
  name: string;
  position: Position;
  size: Size;
  rotation: number;
  confidence: number;
  roofType: 'main' | 'secondary' | 'garage' | 'extension';
  realData: {
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

class GoogleSolarApiService {
  private config: GoogleSolarApiConfig;
  private cache: Map<string, { buildingInsights: BuildingInsights | null; dataLayers: DataLayers | null; timestamp: number }>;
  private cacheDuration: number = 5 * 60 * 1000; // 5 minutes

  constructor() {
    this.config = {
      apiKey: import.meta.env.VITE_GOOGLE_SOLAR_API_KEY || '',
      baseUrl: 'https://solar.googleapis.com/v1'
    };
    this.cache = new Map();
  }

  private getCacheKey(address: string): string {
    return address.toLowerCase().trim();
  }

  private isCacheValid(timestamp: number): boolean {
    return Date.now() - timestamp < this.cacheDuration;
  }

  private isApiAvailable(): boolean {
    return !!this.config.apiKey;
  }

  private validateApiKey(): { isValid: boolean; error?: string } {
    if (!this.config.apiKey) {
      return { 
        isValid: false, 
        error: 'VITE_GOOGLE_SOLAR_API_KEY is not set in environment variables' 
      };
    }

    // Check for common API key format issues
    const apiKey = this.config.apiKey.trim();
    
    if (apiKey.length < 20) {
      return { 
        isValid: false, 
        error: 'API key appears to be too short. Please verify your VITE_GOOGLE_SOLAR_API_KEY' 
      };
    }

    if (apiKey.includes(' ')) {
      return { 
        isValid: false, 
        error: 'API key contains spaces. Please check your VITE_GOOGLE_SOLAR_API_KEY for extra whitespace' 
      };
    }

    if (!apiKey.startsWith('AIza')) {
      return { 
        isValid: false, 
        error: 'API key format appears incorrect. Google API keys typically start with "AIza"' 
      };
    }

    return { isValid: true };
  }

  private roundCoordinates(lat: number, lng: number): { lat: number; lng: number } {
    // Format to exactly 5 decimal places and convert back to number to ensure consistent precision
    return {
      lat: parseFloat(lat.toFixed(5)),
      lng: parseFloat(lng.toFixed(5))
    };
  }

  private async geocodeAddress(address: string): Promise<{ lat: number; lng: number } | null> {
    try {
      // Check if the address is already in "latitude, longitude" format
      const coordinatePattern = /^(-?\d+\.?\d*),\s*(-?\d+\.?\d*)$/;
      const coordinateMatch = address.trim().match(coordinatePattern);
      
      if (coordinateMatch) {
        const lat = parseFloat(coordinateMatch[1]);
        const lng = parseFloat(coordinateMatch[2]);
        
        // Validate that the coordinates are within valid ranges
        if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
          console.log(`Parsed coordinates directly from address: ${lat}, ${lng}`);
          // Round coordinates to avoid precision issues
          return this.roundCoordinates(lat, lng);
        } else {
          console.warn(`Invalid coordinate ranges: lat=${lat}, lng=${lng}`);
          return null;
        }
      }

      const mapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
      if (!mapsApiKey) {
        console.warn('Google Maps API key not available for geocoding');
        return null;
      }

      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${mapsApiKey}`,
        {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          },
        }
      );

      if (!response.ok) {
        console.error(`Geocoding HTTP error: ${response.status} ${response.statusText}`);
        return null;
      }

      const data = await response.json();
      
      if (data.status === 'OK' && data.results.length > 0) {
        const location = data.results[0].geometry.location;
        // Round coordinates to avoid precision issues
        return this.roundCoordinates(location.lat, location.lng);
      }

      console.warn(`Geocoding failed with status: ${data.status}`);
      return null;
    } catch (error) {
      console.error('Error geocoding address:', error);
      return null;
    }
  }

  private calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lng2 - lng1) * Math.PI / 180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c; // Distance in meters
  }

  private filterTargetBuildingRoofs(
    roofSegments: any[], 
    buildingCenter: { latitude: number; longitude: number },
    maxDistanceMeters: number = 25 // Only include roofs within 25 meters of building center
  ): any[] {
    return roofSegments.filter(segment => {
      const distance = this.calculateDistance(
        buildingCenter.latitude,
        buildingCenter.longitude,
        segment.center.latitude,
        segment.center.longitude
      );
      
      console.log(`Roof segment at distance: ${distance.toFixed(1)}m from building center`);
      return distance <= maxDistanceMeters;
    });
  }

  private classifyRoofSegments(segments: any[]): any[] {
    // Sort by area to identify main vs secondary roofs
    const sortedByArea = [...segments].sort((a, b) => b.stats.areaMeters2 - a.stats.areaMeters2);
    
    return sortedByArea.map((segment, index) => {
      let roofType: 'main' | 'secondary' | 'garage' | 'extension' = 'secondary';
      
      // Classify based on size and characteristics
      const area = segment.stats.areaMeters2;
      const pitch = segment.pitchDegrees;
      
      if (index === 0 && area > 80) {
        roofType = 'main'; // Largest roof section
      } else if (area > 40) {
        roofType = 'secondary'; // Medium-sized sections
      } else if (pitch < 15 && area > 20) {
        roofType = 'garage'; // Low-pitch, medium size
      } else {
        roofType = 'extension'; // Smaller sections
      }
      
      return {
        ...segment,
        classifiedType: roofType
      };
    });
  }

  async getBuildingInsights(address: string): Promise<BuildingInsights | null> {
    try {
      const cacheKey = this.getCacheKey(address);
      const cached = this.cache.get(cacheKey);

      if (cached && this.isCacheValid(cached.timestamp)) {
        console.log('✅ Using cached building insights');
        return cached.buildingInsights;
      }

      const { creditService } = await import('./creditService');

      console.log(`Fetching building insights through credit gateway for: ${address}`);

      const coordinates = await this.geocodeAddress(address);

      const result = await creditService.callSolarApiGateway(
        address,
        this.config.apiKey,
        {
          fetchDataLayers: !!coordinates,
          coordinates: coordinates || undefined
        }
      );

      if (result.success && result.buildingInsights) {
        console.log('✅ Successfully fetched building insights from Solar API via gateway');

        this.cache.set(cacheKey, {
          buildingInsights: result.buildingInsights,
          dataLayers: result.dataLayers || null,
          timestamp: Date.now()
        });

        return result.buildingInsights;
      } else {
        throw new Error('Failed to fetch building insights');
      }
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'INSUFFICIENT_CREDITS') {
          throw new Error('INSUFFICIENT_CREDITS');
        } else {
          console.error('Error fetching building insights:', error);
          throw error;
        }
      } else {
        console.error('Unknown error fetching building insights:', error);
        throw new Error('Unknown error occurred while fetching building insights');
      }
    }
  }

  async getDataLayers(address: string): Promise<DataLayers | null> {
    // Validate API key first
    const validation = this.validateApiKey();
    if (!validation.isValid) {
      console.error('❌ Solar API Key Validation Failed:', validation.error);
      throw new Error(`Solar API Configuration Error: ${validation.error}`);
    }

    try {
      const cacheKey = this.getCacheKey(address);
      const cached = this.cache.get(cacheKey);

      if (cached && this.isCacheValid(cached.timestamp)) {
        console.log('✅ Using cached data layers');
        return cached.dataLayers;
      }

      // First geocode the address to get coordinates
      const coordinates = await this.geocodeAddress(address);
      if (!coordinates) {
        console.warn('Could not geocode address, falling back to simulated data');
        return null;
      }

      console.log(`Fetching data layers through credit gateway for: ${address}`);

      const { creditService } = await import('./creditService');

      // Use the gateway to fetch data layers with coordinates
      const result = await creditService.callSolarApiGateway(
        address,
        this.config.apiKey,
        {
          fetchDataLayers: true,
          coordinates: coordinates
        }
      );

      if (result.success) {
        console.log('✅ Successfully fetched data from Solar API via gateway');

        this.cache.set(cacheKey, {
          buildingInsights: result.buildingInsights || null,
          dataLayers: result.dataLayers || null,
          timestamp: Date.now()
        });

        return result.dataLayers || null;
      } else {
        console.warn('No data returned from gateway');
        return null;
      }
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'INSUFFICIENT_CREDITS') {
          throw new Error('INSUFFICIENT_CREDITS');
        } else {
          console.error('Error fetching data layers:', error);
          throw error;
        }
      } else {
        console.error('Unknown error fetching data layers:', error);
        throw new Error('Unknown error occurred while fetching data layers');
      }
    }
  }

  async detectRoofSections(
    address: string,
    containerWidth: number,
    containerHeight: number,
    roofAnalysisPosition: Position,
    roofAnalysisSize: Size
  ): Promise<DetectedRoofSection[]> {
    try {
      const buildingInsights = await this.getBuildingInsights(address);
      
      if (!buildingInsights || !buildingInsights.solarPotential.roofSegmentStats) {
        console.log('No real roof segment data available, using simulated detection');
        return this.generateSimulatedRoofSections(roofAnalysisPosition, roofAnalysisSize);
      }

      console.log(`Total roof segments from API: ${buildingInsights.solarPotential.roofSegmentStats.length}`);
      
      // Filter to only include roof segments that belong to the target building
      const targetBuildingRoofs = this.filterTargetBuildingRoofs(
        buildingInsights.solarPotential.roofSegmentStats,
        buildingInsights.center,
        30 // 30 meter radius - adjust based on typical building size
      );
      
      console.log(`Filtered to target building roofs: ${targetBuildingRoofs.length}`);
      
      // Classify the filtered roof segments
      const classifiedRoofs = this.classifyRoofSegments(targetBuildingRoofs);
      
      // Limit to reasonable number of roof sections (max 6 for typical residential)
      const limitedRoofs = classifiedRoofs.slice(0, 6);
      
      console.log(`Final roof sections to display: ${limitedRoofs.length}`);
      
      // Convert real roof segments to our format
      const detectedSections: DetectedRoofSection[] = limitedRoofs.map((segment, index) => {
        // Calculate position relative to the container based on the segment's geographic bounds
        const centerLat = segment.center.latitude;
        const centerLng = segment.center.longitude;
        const buildingCenterLat = buildingInsights.center.latitude;
        const buildingCenterLng = buildingInsights.center.longitude;
        
        // Calculate relative position (simplified coordinate transformation)
        const latOffset = (centerLat - buildingCenterLat) * 111000; // rough meters per degree
        const lngOffset = (centerLng - buildingCenterLng) * 111000 * Math.cos(centerLat * Math.PI / 180);
        
        // Convert to pixel coordinates relative to roof analysis position
        // Scale factor to fit within reasonable bounds
        const scaleFactor = 0.5;
        const pixelX = roofAnalysisPosition.x + (lngOffset * scaleFactor);
        const pixelY = roofAnalysisPosition.y - (latOffset * scaleFactor); // Negative because screen Y is inverted
        
        // Calculate size based on area with more realistic scaling
        const areaMeters = segment.stats.areaMeters2;
        const estimatedWidth = Math.sqrt(areaMeters) * 2.5; // More conservative scaling
        const estimatedHeight = Math.sqrt(areaMeters) * 2;
        
        // Use the classified roof type
        const roofType = segment.classifiedType;
        
        // Generate confidence based on area and sunshine data
        const avgSunshine = segment.stats.sunshineQuantiles.reduce((a: number, b: number) => a + b, 0) / segment.stats.sunshineQuantiles.length;
        const confidence = Math.min(0.95, Math.max(0.75, (avgSunshine / 1000) + (areaMeters / 200)));
        
        return {
          id: `real-roof-segment-${index}`,
          name: `${roofType.charAt(0).toUpperCase() + roofType.slice(1)} Roof Section`,
          position: {
            x: Math.max(15, Math.min(85, pixelX)),
            y: Math.max(15, Math.min(85, pixelY))
          },
          size: {
            width: Math.max(50, Math.min(120, estimatedWidth)),
            height: Math.max(40, Math.min(100, estimatedHeight))
          },
          rotation: segment.azimuthDegrees - 180, // Convert to our rotation system
          confidence,
          roofType,
          realData: {
            pitchDegrees: segment.pitchDegrees,
            azimuthDegrees: segment.azimuthDegrees,
            areaMeters2: segment.stats.areaMeters2,
            sunshineQuantiles: segment.stats.sunshineQuantiles,
            groundAreaMeters2: segment.stats.groundAreaMeters2,
            center: segment.center,
            boundingBox: segment.boundingBox
          }
        };
      });

      return detectedSections;
    } catch (error) {
      console.error('Error in detectRoofSections:', error);
      return this.generateSimulatedRoofSections(roofAnalysisPosition, roofAnalysisSize);
    }
  }

  private generateSimulatedRoofSections(
    roofAnalysisPosition: Position,
    roofAnalysisSize: Size
  ): DetectedRoofSection[] {
    // Fallback simulated data when API is not available
    return [
      {
        id: 'simulated-main-roof',
        name: 'Main Roof Structure',
        position: { x: roofAnalysisPosition.x, y: roofAnalysisPosition.y },
        size: { 
          width: roofAnalysisSize.width * 1.2,
          height: roofAnalysisSize.height * 1.1 
        },
        rotation: 0,
        confidence: 0.85,
        roofType: 'main',
        realData: {
          pitchDegrees: 30,
          azimuthDegrees: 180,
          areaMeters2: 120,
          sunshineQuantiles: [800, 900, 1000, 1100, 1200],
          groundAreaMeters2: 120,
          center: { latitude: 0, longitude: 0 },
          boundingBox: {
            sw: { latitude: 0, longitude: 0 },
            ne: { latitude: 0, longitude: 0 }
          }
        }
      },
      {
        id: 'simulated-secondary-roof',
        name: 'Secondary Roof Section',
        position: { 
          x: roofAnalysisPosition.x + 12, 
          y: roofAnalysisPosition.y - 8 
        },
        size: { width: 80, height: 60 },
        rotation: 45,
        confidence: 0.78,
        roofType: 'secondary',
        realData: {
          pitchDegrees: 25,
          azimuthDegrees: 225,
          areaMeters2: 65,
          sunshineQuantiles: [700, 800, 900, 1000, 1100],
          groundAreaMeters2: 65,
          center: { latitude: 0, longitude: 0 },
          boundingBox: {
            sw: { latitude: 0, longitude: 0 },
            ne: { latitude: 0, longitude: 0 }
          }
        }
      }
    ];
  }

  async getRealSolarPanelConfigurations(address: string): Promise<any[]> {
    try {
      const buildingInsights = await this.getBuildingInsights(address);
      
      if (!buildingInsights || !buildingInsights.solarPotential.solarPanelConfigs) {
        return [];
      }

      return buildingInsights.solarPotential.solarPanelConfigs;
    } catch (error) {
      console.error('Error getting solar panel configurations:', error);
      return [];
    }
  }

  async getRealFinancialAnalysis(address: string): Promise<any[]> {
    try {
      const buildingInsights = await this.getBuildingInsights(address);
      
      if (!buildingInsights || !buildingInsights.solarPotential.financialAnalyses) {
        return [];
      }

      return buildingInsights.solarPotential.financialAnalyses;
    } catch (error) {
      console.error('Error getting financial analysis:', error);
      return [];
    }
  }
}

export const solarApiService = new GoogleSolarApiService();
export type { DetectedRoofSection, BuildingInsights, DataLayers };