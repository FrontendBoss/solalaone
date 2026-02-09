import { solarApiService } from './solarApi';
import { ShadeSource, Position } from '../store/types';

interface HourlyShadeData {
  hour: number;
  shadeUrl: string;
  shadeIntensity: number[][];
}

interface DetectedShadeObject {
  type: 'building' | 'tree' | 'terrain' | 'structure';
  position: Position;
  size: { width: number; height: number };
  height: number;
  confidence: number;
  shadowLength: number;
  shadowDirection: number;
}

class ShadeDetectionService {
  private async analyzeShadeImageData(imageUrl: string): Promise<number[][]> {
    try {
      // In a real implementation, this would:
      // 1. Fetch the shade image from Google Solar API
      // 2. Convert to canvas/image data
      // 3. Analyze pixel values to determine shade intensity
      // 4. Return 2D array of shade values (0-1, where 1 = full shade)
      
      // For now, simulate the analysis
      const width = 100;
      const height = 100;
      const shadeData: number[][] = [];
      
      for (let y = 0; y < height; y++) {
        const row: number[] = [];
        for (let x = 0; x < width; x++) {
          // Simulate shade patterns - in reality this would come from image analysis
          const distance = Math.sqrt((x - 50) ** 2 + (y - 50) ** 2);
          const shadeIntensity = Math.max(0, 1 - distance / 30);
          row.push(shadeIntensity);
        }
        shadeData.push(row);
      }
      
      return shadeData;
    } catch (error) {
      console.error('Error analyzing shade image:', error);
      return [];
    }
  }

  private detectShadeObjects(shadeData: number[][]): DetectedShadeObject[] {
    const objects: DetectedShadeObject[] = [];
    const visited: boolean[][] = shadeData.map(row => row.map(() => false));
    
    // Simple blob detection algorithm
    for (let y = 0; y < shadeData.length; y++) {
      for (let x = 0; x < shadeData[y].length; x++) {
        if (shadeData[y][x] > 0.3 && !visited[y][x]) {
          const blob = this.floodFill(shadeData, visited, x, y, 0.3);
          
          if (blob.pixels.length > 10) { // Minimum size threshold
            const bounds = this.getBlobBounds(blob.pixels);
            const shadeObject = this.classifyShadeObject(bounds, blob);
            objects.push(shadeObject);
          }
        }
      }
    }
    
    return objects;
  }

  private floodFill(
    shadeData: number[][], 
    visited: boolean[][], 
    startX: number, 
    startY: number, 
    threshold: number
  ): { pixels: Position[]; avgIntensity: number } {
    const pixels: Position[] = [];
    const stack: Position[] = [{ x: startX, y: startY }];
    let totalIntensity = 0;
    
    while (stack.length > 0) {
      const { x, y } = stack.pop()!;
      
      if (x < 0 || x >= shadeData[0].length || y < 0 || y >= shadeData.length) continue;
      if (visited[y][x] || shadeData[y][x] < threshold) continue;
      
      visited[y][x] = true;
      pixels.push({ x, y });
      totalIntensity += shadeData[y][x];
      
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

  private getBlobBounds(pixels: Position[]): { 
    minX: number; maxX: number; minY: number; maxY: number; 
    centerX: number; centerY: number; width: number; height: number;
  } {
    const minX = Math.min(...pixels.map(p => p.x));
    const maxX = Math.max(...pixels.map(p => p.x));
    const minY = Math.min(...pixels.map(p => p.y));
    const maxY = Math.max(...pixels.map(p => p.y));
    
    return {
      minX, maxX, minY, maxY,
      centerX: (minX + maxX) / 2,
      centerY: (minY + maxY) / 2,
      width: maxX - minX,
      height: maxY - minY
    };
  }

  private classifyShadeObject(
    bounds: ReturnType<typeof this.getBlobBounds>,
    blob: { pixels: Position[]; avgIntensity: number }
  ): DetectedShadeObject {
    const { width, height, centerX, centerY } = bounds;
    const aspectRatio = width / height;
    const area = blob.pixels.length;
    const density = area / (width * height);
    
    let type: DetectedShadeObject['type'] = 'structure';
    let estimatedHeight = 10; // Default height in feet
    let confidence = 0.7;
    
    // Classification logic based on shape characteristics
    if (aspectRatio > 0.7 && aspectRatio < 1.3 && density > 0.8) {
      // Square/rectangular, dense shade = building
      type = 'building';
      estimatedHeight = 15 + (area / 100) * 10; // Height based on shadow size
      confidence = 0.9;
    } else if (density < 0.6 && area > 50) {
      // Irregular, less dense = tree
      type = 'tree';
      estimatedHeight = 20 + Math.random() * 30;
      confidence = 0.8;
    } else if (width > height * 2) {
      // Long and thin = terrain feature or structure
      type = 'terrain';
      estimatedHeight = 5 + Math.random() * 10;
      confidence = 0.6;
    }
    
    // Calculate shadow direction and length
    const shadowDirection = Math.atan2(centerY - 50, centerX - 50) * (180 / Math.PI);
    const shadowLength = Math.sqrt((centerX - 50) ** 2 + (centerY - 50) ** 2);
    
    return {
      type,
      position: {
        x: (centerX / 100) * 100, // Convert to percentage
        y: (centerY / 100) * 100
      },
      size: {
        width: (width / 100) * 200, // Convert to pixels (approximate)
        height: (height / 100) * 200
      },
      height: estimatedHeight,
      confidence,
      shadowLength,
      shadowDirection
    };
  }

  async detectShadeSources(address: string): Promise<ShadeSource[]> {
    try {
      console.log('🔍 Starting shade detection for:', address);
      
      // Get hourly shade data from Google Solar API
      const dataLayers = await solarApiService.getDataLayers(address);
      
      if (!dataLayers || !dataLayers.hourlyShadeUrls || dataLayers.hourlyShadeUrls.length === 0) {
        console.log('⚠️ No shade data available from Google Solar API, using simulated detection');
        return this.generateSimulatedShadeSources();
      }
      
      console.log(`📊 Analyzing ${dataLayers.hourlyShadeUrls.length} hourly shade images`);
      
      // Analyze multiple hours to get comprehensive shade source detection
      const hourlyAnalyses: HourlyShadeData[] = [];
      const sampleHours = [9, 12, 15]; // Analyze morning, noon, and afternoon
      
      for (const hour of sampleHours) {
        if (hour < dataLayers.hourlyShadeUrls.length) {
          const shadeUrl = dataLayers.hourlyShadeUrls[hour];
          const shadeData = await this.analyzeShadeImageData(shadeUrl);
          
          hourlyAnalyses.push({
            hour,
            shadeUrl,
            shadeIntensity: shadeData
          });
        }
      }
      
      // Combine analyses to detect persistent shade sources
      const allDetectedObjects: DetectedShadeObject[] = [];
      
      for (const analysis of hourlyAnalyses) {
        const objects = this.detectShadeObjects(analysis.shadeIntensity);
        allDetectedObjects.push(...objects);
      }
      
      // Merge similar objects and filter by confidence
      const mergedObjects = this.mergeNearbyObjects(allDetectedObjects);
      const highConfidenceObjects = mergedObjects.filter(obj => obj.confidence > 0.6);
      
      console.log(`✅ Detected ${highConfidenceObjects.length} shade sources`);
      
      // Convert to ShadeSource format
      const shadeSources: ShadeSource[] = highConfidenceObjects.map((obj, index) => ({
        id: `detected-shade-${index}`,
        name: this.getShadeSourceName(obj.type, obj.confidence),
        type: obj.type,
        position: obj.position,
        size: obj.size,
        height: obj.height,
        color: this.getShadeSourceColor(obj.type)
      }));
      
      return shadeSources;
      
    } catch (error) {
      console.error('❌ Error in shade detection:', error);
      console.log('🔄 Falling back to simulated shade sources');
      return this.generateSimulatedShadeSources();
    }
  }

  private mergeNearbyObjects(objects: DetectedShadeObject[]): DetectedShadeObject[] {
    const merged: DetectedShadeObject[] = [];
    const used: boolean[] = new Array(objects.length).fill(false);
    
    for (let i = 0; i < objects.length; i++) {
      if (used[i]) continue;
      
      const group = [objects[i]];
      used[i] = true;
      
      // Find nearby objects of the same type
      for (let j = i + 1; j < objects.length; j++) {
        if (used[j] || objects[j].type !== objects[i].type) continue;
        
        const distance = Math.sqrt(
          (objects[i].position.x - objects[j].position.x) ** 2 +
          (objects[i].position.y - objects[j].position.y) ** 2
        );
        
        if (distance < 20) { // Merge if within 20% of container
          group.push(objects[j]);
          used[j] = true;
        }
      }
      
      // Create merged object
      const avgX = group.reduce((sum, obj) => sum + obj.position.x, 0) / group.length;
      const avgY = group.reduce((sum, obj) => sum + obj.position.y, 0) / group.length;
      const maxWidth = Math.max(...group.map(obj => obj.size.width));
      const maxHeight = Math.max(...group.map(obj => obj.size.height));
      const avgHeight = group.reduce((sum, obj) => sum + obj.height, 0) / group.length;
      const avgConfidence = group.reduce((sum, obj) => sum + obj.confidence, 0) / group.length;
      
      merged.push({
        type: objects[i].type,
        position: { x: avgX, y: avgY },
        size: { width: maxWidth, height: maxHeight },
        height: avgHeight,
        confidence: avgConfidence,
        shadowLength: group[0].shadowLength,
        shadowDirection: group[0].shadowDirection
      });
    }
    
    return merged;
  }

  private getShadeSourceName(type: string, confidence: number): string {
    const confidenceText = confidence > 0.8 ? 'Detected' : 'Possible';
    
    switch (type) {
      case 'building': return `${confidenceText} Building`;
      case 'tree': return `${confidenceText} Tree`;
      case 'terrain': return `${confidenceText} Terrain Feature`;
      case 'structure': return `${confidenceText} Structure`;
      default: return `${confidenceText} Shade Source`;
    }
  }

  private getShadeSourceColor(type: string): string {
    switch (type) {
      case 'building': return '#6B7280'; // Gray
      case 'tree': return '#059669'; // Green
      case 'terrain': return '#92400E'; // Brown
      case 'structure': return '#7C3AED'; // Purple
      default: return '#374151';
    }
  }

  private generateSimulatedShadeSources(): ShadeSource[] {
    // Fallback simulated data when API is not available
    console.log('🎭 Generating simulated shade sources for demonstration');
    
    return [
      {
        id: 'sim-building-1',
        name: 'Neighboring Building (Simulated)',
        type: 'building',
        position: { x: 25, y: 30 },
        size: { width: 60, height: 40 },
        height: 25,
        color: '#6B7280'
      },
      {
        id: 'sim-tree-1',
        name: 'Large Tree (Simulated)',
        type: 'tree',
        position: { x: 70, y: 60 },
        size: { width: 35, height: 35 },
        height: 30,
        color: '#059669'
      },
      {
        id: 'sim-structure-1',
        name: 'Utility Structure (Simulated)',
        type: 'structure',
        position: { x: 15, y: 75 },
        size: { width: 25, height: 15 },
        height: 12,
        color: '#7C3AED'
      }
    ];
  }
}

export const shadeDetectionService = new ShadeDetectionService();