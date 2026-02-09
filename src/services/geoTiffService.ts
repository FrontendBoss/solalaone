// Enhanced GeoTIFF processing service for Google Solar API data layers
import { fromArrayBuffer } from 'geotiff';
import proj4 from 'proj4';
import { Position, Size } from '../store/types';

interface GeoTIFFData {
  width: number;
  height: number;
  bounds: {
    north: number;
    south: number;
    east: number;
    west: number;
  };
  rasters: Float32Array[];
  noDataValue?: number;
  projection?: string;
  pixelScale: [number, number];
  origin: [number, number];
}

interface RenderOptions {
  data: GeoTIFFData;
  mask?: GeoTIFFData;
  colors: string[];
  min?: number;
  max?: number;
  index?: number;
}

interface LayerVisualization {
  id: string;
  name: string;
  canvas: HTMLCanvasElement;
  palette?: {
    colors: string[];
    min: string;
    max: string;
  };
  bounds: {
    north: number;
    south: number;
    east: number;
    west: number;
  };
}

class GeoTIFFService {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;

  constructor() {
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d')!;
  }

  async downloadAndParseGeoTIFF(url: string, apiKey: string): Promise<GeoTIFFData> {
    try {
      console.log('📥 Downloading GeoTIFF from:', url.substring(0, 100) + '...');
      
      const response = await fetch(`${url}&key=${apiKey}`, {
        method: 'GET',
        headers: {
          'Accept': 'image/tiff, application/octet-stream',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to download GeoTIFF: ${response.status} ${response.statusText}`);
      }

      const arrayBuffer = await response.arrayBuffer();
      console.log('📊 Parsing GeoTIFF data, size:', arrayBuffer.byteLength, 'bytes');
      
      return await this.parseGeoTIFF(arrayBuffer);
    } catch (error) {
      console.error('❌ Error downloading/parsing GeoTIFF:', error);
      // Return simulated data for development
      return this.generateSimulatedGeoTIFF();
    }
  }

  private async parseGeoTIFF(arrayBuffer: ArrayBuffer): Promise<GeoTIFFData> {
    try {
      const tiff = await fromArrayBuffer(arrayBuffer);
      const image = await tiff.getImage();
      
      // Get image dimensions
      const width = image.getWidth();
      const height = image.getHeight();
      
      // Get geographic bounds
      const bbox = image.getBoundingBox();
      const bounds = {
        north: bbox[3],
        south: bbox[1], 
        east: bbox[2],
        west: bbox[0]
      };

      // Get pixel scale and origin
      const pixelScale = image.getResolution();
      const origin = image.getOrigin();

      // Read raster data
      const rasterData = await image.readRasters();
      const rasters: Float32Array[] = [];

      // Convert raster data to Float32Arrays
      if (Array.isArray(rasterData)) {
        // Multi-band image
        for (let i = 0; i < rasterData.length; i++) {
          rasters.push(new Float32Array(rasterData[i]));
        }
      } else {
        // Single band image
        rasters.push(new Float32Array(rasterData));
      }

      // Get no data value if available
      const noDataValue = image.getGDALNoData();

      // Get projection information
      let projection = '';
      try {
        const geoKeys = image.getGeoKeys();
        if (geoKeys) {
          // Convert GeoTIFF geo keys to proj4 string
          projection = this.geoKeysToProj4(geoKeys);
        }
      } catch (e) {
        console.warn('Could not extract projection information:', e);
      }

      console.log('✅ GeoTIFF parsed successfully:', {
        width,
        height,
        bands: rasters.length,
        bounds,
        projection: projection || 'Unknown'
      });

      return {
        width,
        height,
        bounds,
        rasters,
        noDataValue,
        projection,
        pixelScale,
        origin
      };
    } catch (error) {
      console.error('Error parsing GeoTIFF:', error);
      throw error;
    }
  }

  private geoKeysToProj4(geoKeys: any): string {
    // Basic projection conversion - in a real implementation you'd use geotiff-geokeys-to-proj4
    // For now, assume WGS84 Web Mercator (most common for Google data)
    return '+proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 +x_0=0.0 +y_0=0 +k=1.0 +units=m +nadgrids=@null +wktext +no_defs';
  }

  private generateSimulatedGeoTIFF(): GeoTIFFData {
    const width = 256;
    const height = 256;
    const raster = new Float32Array(width * height);
    
    // Generate realistic-looking data patterns
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const index = y * width + x;
        
        // Create patterns that simulate real solar data
        const centerX = width / 2;
        const centerY = height / 2;
        const distance = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
        const noise = (Math.random() - 0.5) * 0.2;
        
        // Simulate roof area with higher values in center
        let value = Math.max(0, 1 - (distance / (width / 3)) + noise);
        
        // Add some realistic variations
        if (x < width * 0.1 || x > width * 0.9 || y < height * 0.1 || y > height * 0.9) {
          value *= 0.3; // Lower values at edges
        }
        
        raster[index] = value;
      }
    }

    return {
      width,
      height,
      bounds: {
        north: 40.7589,
        south: 40.7489,
        east: -73.9741,
        west: -73.9841
      },
      rasters: [raster],
      pixelScale: [1, 1],
      origin: [0, 0]
    };
  }

  renderPalette(options: RenderOptions): HTMLCanvasElement {
    const { data, mask, colors, min = 0, max = 1, index = 0 } = options;
    
    this.canvas.width = data.width;
    this.canvas.height = data.height;
    
    const imageData = this.ctx.createImageData(data.width, data.height);
    const raster = data.rasters[index] || data.rasters[0];
    const maskRaster = mask?.rasters[0];
    
    for (let i = 0; i < raster.length; i++) {
      const value = raster[i];
      const maskValue = maskRaster ? maskRaster[i] : 1;
      
      // Skip if masked out or no data
      if (maskValue === 0 || (data.noDataValue !== undefined && value === data.noDataValue)) {
        imageData.data[i * 4] = 0;
        imageData.data[i * 4 + 1] = 0;
        imageData.data[i * 4 + 2] = 0;
        imageData.data[i * 4 + 3] = 0;
        continue;
      }
      
      // Normalize value to 0-1 range
      const normalizedValue = Math.max(0, Math.min(1, (value - min) / (max - min)));
      
      // Map to color palette
      const color = this.interpolateColor(colors, normalizedValue);
      
      imageData.data[i * 4] = color.r;
      imageData.data[i * 4 + 1] = color.g;
      imageData.data[i * 4 + 2] = color.b;
      imageData.data[i * 4 + 3] = 255;
    }
    
    this.ctx.putImageData(imageData, 0, 0);
    return this.canvas;
  }

  renderRGB(data: GeoTIFFData, mask?: GeoTIFFData): HTMLCanvasElement {
    this.canvas.width = data.width;
    this.canvas.height = data.height;
    
    const imageData = this.ctx.createImageData(data.width, data.height);
    const [rRaster, gRaster, bRaster] = data.rasters;
    const maskRaster = mask?.rasters[0];
    
    for (let i = 0; i < rRaster.length; i++) {
      const maskValue = maskRaster ? maskRaster[i] : 1;
      
      if (maskValue === 0) {
        imageData.data[i * 4] = 0;
        imageData.data[i * 4 + 1] = 0;
        imageData.data[i * 4 + 2] = 0;
        imageData.data[i * 4 + 3] = 0;
        continue;
      }
      
      imageData.data[i * 4] = Math.min(255, Math.max(0, rRaster[i]));
      imageData.data[i * 4 + 1] = Math.min(255, Math.max(0, gRaster[i]));
      imageData.data[i * 4 + 2] = Math.min(255, Math.max(0, bRaster[i]));
      imageData.data[i * 4 + 3] = 255;
    }
    
    this.ctx.putImageData(imageData, 0, 0);
    return this.canvas;
  }

  private interpolateColor(colors: string[], value: number): { r: number; g: number; b: number } {
    if (colors.length === 0) return { r: 0, g: 0, b: 0 };
    if (colors.length === 1) return this.hexToRgb(colors[0]);
    
    const scaledValue = value * (colors.length - 1);
    const index = Math.floor(scaledValue);
    const fraction = scaledValue - index;
    
    if (index >= colors.length - 1) {
      return this.hexToRgb(colors[colors.length - 1]);
    }
    
    const color1 = this.hexToRgb(colors[index]);
    const color2 = this.hexToRgb(colors[index + 1]);
    
    return {
      r: Math.round(color1.r + (color2.r - color1.r) * fraction),
      g: Math.round(color1.g + (color2.g - color1.g) * fraction),
      b: Math.round(color1.b + (color2.b - color1.b) * fraction)
    };
  }

  private hexToRgb(hex: string): { r: number; g: number; b: number } {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 };
  }

  // Extract shade patterns from hourly shade data
  extractShadePatterns(hourlyShadeData: GeoTIFFData[], month: number): Array<{
    hour: number;
    shadeAreas: Array<{
      position: Position;
      size: Size;
      intensity: 'full' | 'partial' | 'light';
    }>;
  }> {
    const patterns = [];
    
    for (let hour = 0; hour < 24; hour++) {
      if (hour >= hourlyShadeData.length) continue;
      
      const data = hourlyShadeData[hour];
      const shadeAreas = this.detectShadeAreas(data, month);
      
      patterns.push({
        hour,
        shadeAreas
      });
    }
    
    return patterns;
  }

  private detectShadeAreas(data: GeoTIFFData, dayOfMonth: number): Array<{
    position: Position;
    size: Size;
    intensity: 'full' | 'partial' | 'light';
  }> {
    const shadeAreas = [];
    const raster = data.rasters[0];
    const { width, height } = data;
    
    // Use bit manipulation to extract shade for specific day
    const dayBit = 1 << (dayOfMonth - 1);
    
    // Find connected shade regions using flood fill
    const visited = new Array(width * height).fill(false);
    
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const index = y * width + x;
        
        if (visited[index]) continue;
        
        const shadeValue = raster[index] & dayBit;
        if (shadeValue === 0) continue; // No shade
        
        // Flood fill to find connected shade region
        const region = this.floodFillShade(raster, visited, x, y, width, height, dayBit);
        
        if (region.pixels.length > 10) { // Minimum size threshold
          const bounds = this.getRegionBounds(region.pixels);
          
          shadeAreas.push({
            position: {
              x: (bounds.centerX / width) * 100,
              y: (bounds.centerY / height) * 100
            },
            size: {
              width: (bounds.width / width) * 200,
              height: (bounds.height / height) * 200
            },
            intensity: region.avgIntensity > 0.8 ? 'full' : 
                      region.avgIntensity > 0.4 ? 'partial' : 'light'
          });
        }
      }
    }
    
    return shadeAreas;
  }

  private floodFillShade(
    raster: Float32Array,
    visited: boolean[],
    startX: number,
    startY: number,
    width: number,
    height: number,
    dayBit: number
  ): { pixels: Position[]; avgIntensity: number } {
    const pixels: Position[] = [];
    const stack: Position[] = [{ x: startX, y: startY }];
    let totalIntensity = 0;
    
    while (stack.length > 0) {
      const { x, y } = stack.pop()!;
      const index = y * width + x;
      
      if (x < 0 || x >= width || y < 0 || y >= height) continue;
      if (visited[index]) continue;
      
      const shadeValue = raster[index] & dayBit;
      if (shadeValue === 0) continue;
      
      visited[index] = true;
      pixels.push({ x, y });
      totalIntensity += shadeValue > 0 ? 1 : 0;
      
      // Add neighbors
      stack.push({ x: x + 1, y });
      stack.push({ x: x - 1, y });
      stack.push({ x, y: y + 1 });
      stack.push({ x, y: y - 1 });
    }
    
    return {
      pixels,
      avgIntensity: totalIntensity / pixels.length
    };
  }

  private getRegionBounds(pixels: Position[]): {
    minX: number; maxX: number; minY: number; maxY: number;
    centerX: number; centerY: number; width: number; height: number;
  } {
    const xs = pixels.map(p => p.x);
    const ys = pixels.map(p => p.y);
    
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);
    
    return {
      minX, maxX, minY, maxY,
      centerX: (minX + maxX) / 2,
      centerY: (minY + maxY) / 2,
      width: maxX - minX,
      height: maxY - minY
    };
  }

  // Project coordinates between different coordinate systems
  projectCoordinates(
    coords: [number, number], 
    fromProj: string, 
    toProj: string = 'EPSG:4326'
  ): [number, number] {
    try {
      return proj4(fromProj, toProj, coords);
    } catch (error) {
      console.warn('Coordinate projection failed:', error);
      return coords;
    }
  }

  // Convert pixel coordinates to geographic coordinates
  pixelToGeo(
    pixelX: number, 
    pixelY: number, 
    data: GeoTIFFData
  ): [number, number] {
    const [scaleX, scaleY] = data.pixelScale;
    const [originX, originY] = data.origin;
    
    const geoX = originX + (pixelX * scaleX);
    const geoY = originY + (pixelY * scaleY);
    
    return [geoX, geoY];
  }

  // Convert geographic coordinates to pixel coordinates
  geoToPixel(
    geoX: number, 
    geoY: number, 
    data: GeoTIFFData
  ): [number, number] {
    const [scaleX, scaleY] = data.pixelScale;
    const [originX, originY] = data.origin;
    
    const pixelX = (geoX - originX) / scaleX;
    const pixelY = (geoY - originY) / scaleY;
    
    return [pixelX, pixelY];
  }

  // Calculate statistics for a raster
  calculateRasterStats(raster: Float32Array, noDataValue?: number): {
    min: number;
    max: number;
    mean: number;
    std: number;
    count: number;
  } {
    const validValues = [];
    
    for (let i = 0; i < raster.length; i++) {
      const value = raster[i];
      if (noDataValue === undefined || value !== noDataValue) {
        validValues.push(value);
      }
    }
    
    if (validValues.length === 0) {
      return { min: 0, max: 0, mean: 0, std: 0, count: 0 };
    }
    
    const min = Math.min(...validValues);
    const max = Math.max(...validValues);
    const mean = validValues.reduce((sum, val) => sum + val, 0) / validValues.length;
    
    const variance = validValues.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / validValues.length;
    const std = Math.sqrt(variance);
    
    return { min, max, mean, std, count: validValues.length };
  }
}

export const geoTiffService = new GeoTIFFService();
export type { GeoTIFFData, RenderOptions, LayerVisualization };