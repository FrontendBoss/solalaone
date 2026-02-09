// Enhanced data layers service for Google Solar API integration with real GeoTIFF processing
import { geoTiffService, GeoTIFFData, LayerVisualization } from './geoTiffService';
import { solarApiService, DataLayers } from './solarApi';

interface LayerRenderOptions {
  showRoofOnly: boolean;
  month?: number;
  day?: number;
  hour?: number;
}

class DataLayersService {
  private layerCache = new Map<string, GeoTIFFData>();
  private visualizationCache = new Map<string, LayerVisualization>();

  async getAvailableLayers(address: string): Promise<DataLayers | null> {
    try {
      return await solarApiService.getDataLayers(address);
    } catch (error) {
      console.error('Error getting available layers:', error);
      return null;
    }
  }

  async loadLayer(
    layerId: string,
    url: string,
    apiKey: string
  ): Promise<GeoTIFFData> {
    const cacheKey = `${layerId}_${url}`;
    
    if (this.layerCache.has(cacheKey)) {
      console.log('📋 Using cached layer:', layerId);
      return this.layerCache.get(cacheKey)!;
    }

    try {
      console.log('📥 Loading layer:', layerId);
      const data = await geoTiffService.downloadAndParseGeoTIFF(url, apiKey);
      this.layerCache.set(cacheKey, data);
      console.log('✅ Layer loaded and cached:', layerId);
      return data;
    } catch (error) {
      console.error(`❌ Error loading layer ${layerId}:`, error);
      throw error;
    }
  }

  async renderMaskLayer(
    maskUrl: string,
    apiKey: string,
    options: LayerRenderOptions
  ): Promise<LayerVisualization> {
    const mask = await this.loadLayer('mask', maskUrl, apiKey);
    const colors = ['#212121', '#B3E5FC']; // Binary palette: dark for no roof, light blue for roof
    
    const canvas = geoTiffService.renderPalette({
      data: mask,
      mask: options.showRoofOnly ? mask : undefined,
      colors,
      min: 0,
      max: 1
    });

    return {
      id: 'mask',
      name: 'Roof Mask',
      canvas,
      palette: {
        colors,
        min: 'No roof',
        max: 'Roof area'
      },
      bounds: mask.bounds
    };
  }

  async renderDSMLayer(
    dsmUrl: string,
    maskUrl: string,
    apiKey: string,
    options: LayerRenderOptions
  ): Promise<LayerVisualization> {
    const [mask, dsm] = await Promise.all([
      this.loadLayer('mask', maskUrl, apiKey),
      this.loadLayer('dsm', dsmUrl, apiKey)
    ]);

    // Calculate statistics for better color mapping
    const stats = geoTiffService.calculateRasterStats(dsm.rasters[0], dsm.noDataValue);
    const colors = ['#3949AB', '#81D4FA', '#66BB6A', '#FFE082', '#E53935']; // Height gradient

    const canvas = geoTiffService.renderPalette({
      data: dsm,
      mask: options.showRoofOnly ? mask : undefined,
      colors,
      min: stats.min,
      max: stats.max
    });

    return {
      id: 'dsm',
      name: 'Digital Surface Model',
      canvas,
      palette: {
        colors,
        min: `${stats.min.toFixed(1)} m`,
        max: `${stats.max.toFixed(1)} m`
      },
      bounds: dsm.bounds
    };
  }

  async renderRGBLayer(
    rgbUrl: string,
    maskUrl: string,
    apiKey: string,
    options: LayerRenderOptions
  ): Promise<LayerVisualization> {
    const [mask, rgb] = await Promise.all([
      this.loadLayer('mask', maskUrl, apiKey),
      this.loadLayer('rgb', rgbUrl, apiKey)
    ]);

    const canvas = geoTiffService.renderRGB(
      rgb,
      options.showRoofOnly ? mask : undefined
    );

    return {
      id: 'rgb',
      name: 'RGB Satellite Imagery',
      canvas,
      bounds: rgb.bounds
    };
  }

  async renderAnnualFluxLayer(
    annualFluxUrl: string,
    maskUrl: string,
    apiKey: string,
    options: LayerRenderOptions
  ): Promise<LayerVisualization> {
    const [mask, flux] = await Promise.all([
      this.loadLayer('mask', maskUrl, apiKey),
      this.loadLayer('annualFlux', annualFluxUrl, apiKey)
    ]);

    const colors = ['#00000A', '#91009C', '#E64616', '#FEB400', '#FFFFF6']; // Iron palette for solar flux
    const stats = geoTiffService.calculateRasterStats(flux.rasters[0], flux.noDataValue);

    const canvas = geoTiffService.renderPalette({
      data: flux,
      mask: options.showRoofOnly ? mask : undefined,
      colors,
      min: stats.min,
      max: stats.max
    });

    return {
      id: 'annualFlux',
      name: 'Annual Solar Flux',
      canvas,
      palette: {
        colors,
        min: 'Low irradiance',
        max: 'High irradiance'
      },
      bounds: flux.bounds
    };
  }

  async renderMonthlyFluxLayer(
    monthlyFluxUrl: string,
    maskUrl: string,
    apiKey: string,
    options: LayerRenderOptions
  ): Promise<LayerVisualization[]> {
    const [mask, flux] = await Promise.all([
      this.loadLayer('mask', maskUrl, apiKey),
      this.loadLayer('monthlyFlux', monthlyFluxUrl, apiKey)
    ]);

    const colors = ['#00000A', '#91009C', '#E64616', '#FEB400', '#FFFFF6']; // Iron palette
    const visualizations: LayerVisualization[] = [];

    // Render all 12 months (assuming 12 bands in the GeoTIFF)
    const numMonths = Math.min(12, flux.rasters.length);
    
    for (let month = 0; month < numMonths; month++) {
      const monthlyRaster = flux.rasters[month];
      const stats = geoTiffService.calculateRasterStats(monthlyRaster, flux.noDataValue);
      
      const canvas = geoTiffService.renderPalette({
        data: { ...flux, rasters: [monthlyRaster] },
        mask: options.showRoofOnly ? mask : undefined,
        colors,
        min: stats.min,
        max: stats.max
      });

      visualizations.push({
        id: `monthlyFlux_${month}`,
        name: `Monthly Flux - ${this.getMonthName(month)}`,
        canvas,
        palette: {
          colors,
          min: 'Low irradiance',
          max: 'High irradiance'
        },
        bounds: flux.bounds
      });
    }

    return visualizations;
  }

  async renderHourlyShadeLayer(
    hourlyShadeUrls: string[],
    maskUrl: string,
    apiKey: string,
    options: LayerRenderOptions
  ): Promise<LayerVisualization[]> {
    const mask = await this.loadLayer('mask', maskUrl, apiKey);
    
    // Load shade data for the selected month (or first available)
    const monthIndex = Math.min(options.month || 0, hourlyShadeUrls.length - 1);
    const shadeUrl = hourlyShadeUrls[monthIndex];
    
    if (!shadeUrl) {
      console.warn('No hourly shade data available for month:', monthIndex);
      return [];
    }

    const shadeData = await this.loadLayer(`hourlyShade_${monthIndex}`, shadeUrl, apiKey);
    
    const colors = ['#212121', '#FFCA28']; // Dark for shade, bright for sun
    const visualizations: LayerVisualization[] = [];
    const day = options.day || 15; // Middle of month

    // Process hourly data (assuming bit-packed format)
    for (let hour = 0; hour < 24; hour++) {
      // Extract shade data for specific day and hour using bit manipulation
      const dayBit = 1 << (day - 1);
      const hourBit = 1 << hour;
      
      // Create processed raster for this specific hour
      const hourlyRaster = new Float32Array(shadeData.rasters[0].length);
      
      for (let i = 0; i < shadeData.rasters[0].length; i++) {
        const value = shadeData.rasters[0][i];
        // Check if this pixel is shaded at this specific day and hour
        const isShaded = (value & dayBit & hourBit) > 0;
        hourlyRaster[i] = isShaded ? 0 : 1; // 0 = shade, 1 = sun
      }

      const canvas = geoTiffService.renderPalette({
        data: { ...shadeData, rasters: [hourlyRaster] },
        mask: options.showRoofOnly ? mask : undefined,
        colors,
        min: 0,
        max: 1
      });

      visualizations.push({
        id: `hourlyShade_${monthIndex}_${day}_${hour}`,
        name: `Shade Pattern - ${hour}:00`,
        canvas,
        palette: {
          colors,
          min: 'Shade',
          max: 'Sunlight'
        },
        bounds: shadeData.bounds
      });
    }

    return visualizations;
  }

  async getShadeAnalysisData(
    hourlyShadeUrls: string[],
    apiKey: string,
    month: number = 5, // June (0-indexed)
    day: number = 15
  ): Promise<Array<{
    hour: number;
    shadePercentage: number;
    shadeAreas: Array<{
      position: { x: number; y: number };
      size: { width: number; height: number };
      intensity: 'full' | 'partial' | 'light';
    }>;
  }>> {
    try {
      if (month >= hourlyShadeUrls.length) {
        console.warn(`Month ${month} not available in shade data`);
        return [];
      }

      const shadeData = await this.loadLayer(
        `hourlyShade_${month}`,
        hourlyShadeUrls[month],
        apiKey
      );

      const hourlyAnalysis = [];
      const dayBit = 1 << (day - 1);

      for (let hour = 0; hour < 24; hour++) {
        const raster = shadeData.rasters[0];
        let shadedPixels = 0;
        let totalPixels = 0;

        // Count shaded pixels for this hour and day
        for (let i = 0; i < raster.length; i++) {
          const hourBit = 1 << hour;
          const isShaded = (raster[i] & dayBit & hourBit) > 0;
          
          if (isShaded) shadedPixels++;
          totalPixels++;
        }

        const shadePercentage = (shadedPixels / totalPixels) * 100;
        
        // Extract shade areas using the geoTiffService
        const shadeAreas = geoTiffService.extractShadePatterns([shadeData], month)[0]?.shadeAreas || [];

        hourlyAnalysis.push({
          hour,
          shadePercentage,
          shadeAreas
        });
      }

      return hourlyAnalysis;
    } catch (error) {
      console.error('Error analyzing shade data:', error);
      return [];
    }
  }

  private getMonthName(monthIndex: number): string {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[monthIndex] || 'Unknown';
  }

  // Clear caches to free memory
  clearCache(): void {
    this.layerCache.clear();
    this.visualizationCache.clear();
    console.log('🧹 Data layers cache cleared');
  }

  // Get cache statistics
  getCacheStats(): { layers: number; visualizations: number } {
    return {
      layers: this.layerCache.size,
      visualizations: this.visualizationCache.size
    };
  }

  // Batch load multiple layers for efficiency
  async batchLoadLayers(
    layers: Array<{ id: string; url: string }>,
    apiKey: string
  ): Promise<Map<string, GeoTIFFData>> {
    console.log('📦 Batch loading', layers.length, 'layers...');
    
    const results = new Map<string, GeoTIFFData>();
    const promises = layers.map(async ({ id, url }) => {
      try {
        const data = await this.loadLayer(id, url, apiKey);
        results.set(id, data);
        return { id, success: true };
      } catch (error) {
        console.error(`Failed to load layer ${id}:`, error);
        return { id, success: false, error };
      }
    });

    const loadResults = await Promise.allSettled(promises);
    const successful = loadResults.filter(r => r.status === 'fulfilled').length;
    
    console.log(`✅ Batch load complete: ${successful}/${layers.length} layers loaded successfully`);
    
    return results;
  }
}

export const dataLayersService = new DataLayersService();
export type { LayerVisualization, LayerRenderOptions };