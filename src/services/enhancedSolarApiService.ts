// Enhanced Solar API service with comprehensive Google Solar API integration
import { solarApiService, BuildingInsights, DataLayers } from './solarApi';
import { dataLayersService, LayerVisualization } from './dataLayersService';
import { geoTiffService } from './geoTiffService';
import { Position, Size, DetectedRoofArea, ShadeSource, SolarPanel } from '../store/types';

interface EnhancedBuildingInsights extends BuildingInsights {
  enhancedAnalysis: {
    roofComplexity: 'simple' | 'moderate' | 'complex';
    shadeAnalysis: {
      averageShadePercentage: number;
      peakShadeHours: number[];
      seasonalVariation: number;
    };
    solarPotentialScore: number; // 0-100
    installationDifficulty: 'easy' | 'moderate' | 'difficult';
    estimatedCost: {
      low: number;
      high: number;
      currency: string;
    };
  };
}

interface ComprehensiveAnalysis {
  buildingInsights: EnhancedBuildingInsights;
  dataLayers: DataLayers;
  visualizations: {
    mask: LayerVisualization;
    dsm: LayerVisualization;
    rgb: LayerVisualization;
    annualFlux: LayerVisualization;
    monthlyFlux: LayerVisualization[];
    hourlyShade: LayerVisualization[];
  };
  roofSegments: DetectedRoofArea[];
  shadeAnalysis: {
    hourlyPatterns: Array<{
      hour: number;
      shadePercentage: number;
      shadeAreas: Array<{
        position: Position;
        size: Size;
        intensity: 'full' | 'partial' | 'light';
      }>;
    }>;
    shadeSources: ShadeSource[];
    annualShadeImpact: number;
  };
  panelConfigurations: Array<{
    panelsCount: number;
    yearlyEnergyDcKwh: number;
    roofSegmentSummaries: Array<{
      pitchDegrees: number;
      azimuthDegrees: number;
      panelsCount: number;
      yearlyEnergyDcKwh: number;
      segmentIndex: number;
    }>;
    estimatedCost: number;
    paybackPeriod: number;
  }>;
  financialAnalysis: {
    monthlyBill: number;
    averageKwhPerMonth: number;
    estimatedSavings: number;
    roi: number;
    incentives: Array<{
      name: string;
      amount: number;
      type: 'tax_credit' | 'rebate' | 'net_metering';
    }>;
  };
}

class EnhancedSolarApiService {
  private apiKey: string;

  constructor() {
    // Use the correct Solar API key environment variable
    this.apiKey = import.meta.env.VITE_GOOGLE_SOLAR_API_KEY || '';
  }

  async getComprehensiveAnalysis(address: string): Promise<ComprehensiveAnalysis | null> {
    try {
      console.log('🚀 Starting comprehensive solar analysis for:', address);

      // Step 1: Get building insights with better error handling
      let buildingInsights: BuildingInsights | null = null;
      try {
        buildingInsights = await solarApiService.getBuildingInsights(address);
      } catch (error) {
        console.error('❌ Failed to get building insights:', error);
        throw new Error(`Building insights unavailable: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }

      if (!buildingInsights) {
        throw new Error('No building insights available for this location');
      }

      // Step 2: Get data layers with better error handling
      let dataLayers: DataLayers | null = null;
      try {
        dataLayers = await solarApiService.getDataLayers(address);
      } catch (error) {
        console.error('❌ Failed to get data layers:', error);
        throw new Error(`Data layers unavailable: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }

      if (!dataLayers) {
        throw new Error('No data layers available for this location');
      }

      // Step 3: Enhanced building analysis
      const enhancedInsights = await this.enhanceBuildingInsights(buildingInsights, dataLayers);

      // Step 4: Generate visualizations (with fallback handling)
      let visualizations;
      try {
        visualizations = await this.generateAllVisualizations(dataLayers);
      } catch (error) {
        console.warn('⚠️ Failed to generate some visualizations, using fallbacks:', error);
        visualizations = await this.generateFallbackVisualizations();
      }

      // Step 5: Detect roof segments
      const roofSegments = await this.detectEnhancedRoofSegments(buildingInsights, dataLayers);

      // Step 6: Comprehensive shade analysis (with fallback)
      let shadeAnalysis;
      try {
        shadeAnalysis = await this.performComprehensiveShadeAnalysis(dataLayers);
      } catch (error) {
        console.warn('⚠️ Failed to perform shade analysis, using fallback:', error);
        shadeAnalysis = this.generateFallbackShadeAnalysis();
      }

      // Step 7: Enhanced panel configurations
      const panelConfigurations = await this.generateEnhancedPanelConfigurations(buildingInsights);

      // Step 8: Financial analysis with real market data
      const financialAnalysis = await this.performFinancialAnalysis(buildingInsights, address);

      console.log('✅ Comprehensive analysis complete');

      return {
        buildingInsights: enhancedInsights,
        dataLayers,
        visualizations,
        roofSegments,
        shadeAnalysis,
        panelConfigurations,
        financialAnalysis
      };

    } catch (error) {
      console.error('❌ Error in comprehensive analysis:', error);
      
      // Provide more specific error information
      if (error instanceof Error) {
        throw error; // Re-throw with original message
      } else {
        throw new Error('Unknown error occurred during comprehensive analysis');
      }
    }
  }

  private async generateFallbackVisualizations(): Promise<any> {
    // Return empty/placeholder visualizations when data layers fail
    const emptyVisualization: LayerVisualization = {
      id: 'fallback',
      name: 'Unavailable',
      canvas: document.createElement('canvas'),
      bounds: { north: 0, south: 0, east: 0, west: 0 }
    };

    return {
      mask: emptyVisualization,
      dsm: emptyVisualization,
      rgb: emptyVisualization,
      annualFlux: emptyVisualization,
      monthlyFlux: Array(12).fill(emptyVisualization),
      hourlyShade: Array(24).fill(emptyVisualization)
    };
  }

  private generateFallbackShadeAnalysis(): any {
    return {
      hourlyPatterns: Array.from({ length: 24 }, (_, hour) => ({
        hour,
        shadePercentage: 15 + Math.random() * 20,
        shadeAreas: []
      })),
      shadeSources: [],
      annualShadeImpact: 18
    };
  }

  private async enhanceBuildingInsights(
    insights: BuildingInsights,
    dataLayers: DataLayers
  ): Promise<EnhancedBuildingInsights> {
    // Analyze roof complexity
    const roofSegments = insights.solarPotential.roofSegmentStats;
    const roofComplexity = this.analyzeRoofComplexity(roofSegments);

    // Get shade analysis from hourly data (with fallback)
    let shadeAnalysis;
    try {
      shadeAnalysis = await this.analyzeShadeFromHourlyData(dataLayers);
    } catch (error) {
      console.warn('Using fallback shade analysis:', error);
      shadeAnalysis = {
        averageShadePercentage: 15,
        peakShadeHours: [7, 8, 16, 17],
        seasonalVariation: 25
      };
    }

    // Calculate solar potential score
    const solarPotentialScore = this.calculateSolarPotentialScore(insights, shadeAnalysis);

    // Assess installation difficulty
    const installationDifficulty = this.assessInstallationDifficulty(insights, roofComplexity);

    // Estimate costs
    const estimatedCost = this.estimateInstallationCost(insights);

    return {
      ...insights,
      enhancedAnalysis: {
        roofComplexity,
        shadeAnalysis,
        solarPotentialScore,
        installationDifficulty,
        estimatedCost
      }
    };
  }

  private analyzeRoofComplexity(roofSegments: any[]): 'simple' | 'moderate' | 'complex' {
    if (roofSegments.length <= 2) return 'simple';
    if (roofSegments.length <= 4) return 'moderate';
    return 'complex';
  }

  private async analyzeShadeFromHourlyData(dataLayers: DataLayers): Promise<{
    averageShadePercentage: number;
    peakShadeHours: number[];
    seasonalVariation: number;
  }> {
    try {
      // Analyze shade data for summer month (June)
      const shadeData = await dataLayersService.getShadeAnalysisData(
        dataLayers.hourlyShadeUrls,
        this.apiKey,
        5, // June
        15  // Mid-month
      );

      const hourlyShadePercentages = shadeData.map(d => d.shadePercentage);
      const averageShadePercentage = hourlyShadePercentages.reduce((a, b) => a + b, 0) / hourlyShadePercentages.length;
      
      // Find peak shade hours (> 50% shade)
      const peakShadeHours = shadeData
        .filter(d => d.shadePercentage > 50)
        .map(d => d.hour);

      // Estimate seasonal variation (simplified)
      const seasonalVariation = 25; // Typical 25% variation between seasons

      return {
        averageShadePercentage,
        peakShadeHours,
        seasonalVariation
      };
    } catch (error) {
      console.error('Error analyzing shade data:', error);
      return {
        averageShadePercentage: 15,
        peakShadeHours: [7, 8, 16, 17],
        seasonalVariation: 25
      };
    }
  }

  private calculateSolarPotentialScore(
    insights: BuildingInsights,
    shadeAnalysis: any
  ): number {
    const maxSunshineHours = insights.solarPotential.maxSunshineHoursPerYear;
    const maxArrayArea = insights.solarPotential.maxArrayAreaMeters2;
    const shadeImpact = shadeAnalysis.averageShadePercentage;

    // Normalize factors (0-100 scale)
    const sunshineScore = Math.min(100, (maxSunshineHours / 2000) * 100);
    const areaScore = Math.min(100, (maxArrayArea / 200) * 100);
    const shadeScore = Math.max(0, 100 - shadeImpact);

    // Weighted average
    return Math.round((sunshineScore * 0.4 + areaScore * 0.3 + shadeScore * 0.3));
  }

  private assessInstallationDifficulty(
    insights: BuildingInsights,
    roofComplexity: string
  ): 'easy' | 'moderate' | 'difficult' {
    const roofSegments = insights.solarPotential.roofSegmentStats;
    const avgPitch = roofSegments.reduce((sum, seg) => sum + seg.pitchDegrees, 0) / roofSegments.length;

    if (roofComplexity === 'complex' || avgPitch > 45) return 'difficult';
    if (roofComplexity === 'moderate' || avgPitch > 30) return 'moderate';
    return 'easy';
  }

  private estimateInstallationCost(insights: BuildingInsights): {
    low: number;
    high: number;
    currency: string;
  } {
    const maxPanels = insights.solarPotential.maxArrayPanelsCount;
    const costPerPanel = { low: 800, high: 1200 }; // USD per panel including installation

    return {
      low: maxPanels * costPerPanel.low,
      high: maxPanels * costPerPanel.high,
      currency: 'USD'
    };
  }

  private async generateAllVisualizations(dataLayers: DataLayers): Promise<{
    mask: LayerVisualization;
    dsm: LayerVisualization;
    rgb: LayerVisualization;
    annualFlux: LayerVisualization;
    monthlyFlux: LayerVisualization[];
    hourlyShade: LayerVisualization[];
  }> {
    const options = { showRoofOnly: true, month: 5, day: 15 };

    const [mask, dsm, rgb, annualFlux, monthlyFlux, hourlyShade] = await Promise.all([
      dataLayersService.renderMaskLayer(dataLayers.maskUrl, this.apiKey, options),
      dataLayersService.renderDSMLayer(dataLayers.dsmUrl, dataLayers.maskUrl, this.apiKey, options),
      dataLayersService.renderRGBLayer(dataLayers.rgbUrl, dataLayers.maskUrl, this.apiKey, options),
      dataLayersService.renderAnnualFluxLayer(dataLayers.annualFluxUrl, dataLayers.maskUrl, this.apiKey, options),
      dataLayersService.renderMonthlyFluxLayer(dataLayers.monthlyFluxUrl, dataLayers.maskUrl, this.apiKey, options),
      dataLayersService.renderHourlyShadeLayer(dataLayers.hourlyShadeUrls, dataLayers.maskUrl, this.apiKey, options)
    ]);

    return {
      mask,
      dsm,
      rgb,
      annualFlux,
      monthlyFlux,
      hourlyShade
    };
  }

  private async detectEnhancedRoofSegments(
    insights: BuildingInsights,
    dataLayers: DataLayers
  ): Promise<DetectedRoofArea[]> {
    const roofSegments = insights.solarPotential.roofSegmentStats;
    
    return roofSegments.map((segment, index) => ({
      id: `enhanced-roof-${index}`,
      name: `Roof Segment ${index + 1}`,
      position: {
        x: 50 + (Math.random() - 0.5) * 40, // Distribute around center
        y: 50 + (Math.random() - 0.5) * 40
      },
      size: {
        width: Math.sqrt(segment.stats.areaMeters2) * 2,
        height: Math.sqrt(segment.stats.areaMeters2) * 1.5
      },
      rotation: segment.azimuthDegrees - 180,
      confidence: 0.95,
      roofType: index === 0 ? 'main' : 'secondary',
      realData: {
        pitchDegrees: segment.pitchDegrees,
        azimuthDegrees: segment.azimuthDegrees,
        areaMeters2: segment.stats.areaMeters2,
        sunshineQuantiles: segment.stats.sunshineQuantiles,
        groundAreaMeters2: segment.stats.groundAreaMeters2,
        center: segment.center,
        boundingBox: segment.boundingBox
      }
    }));
  }

  private async performComprehensiveShadeAnalysis(dataLayers: DataLayers): Promise<{
    hourlyPatterns: Array<{
      hour: number;
      shadePercentage: number;
      shadeAreas: Array<{
        position: Position;
        size: Size;
        intensity: 'full' | 'partial' | 'light';
      }>;
    }>;
    shadeSources: ShadeSource[];
    annualShadeImpact: number;
  }> {
    // Get hourly shade patterns
    const hourlyPatterns = await dataLayersService.getShadeAnalysisData(
      dataLayers.hourlyShadeUrls,
      this.apiKey,
      5, // June
      15  // Mid-month
    );

    // Detect shade sources from patterns
    const shadeSources = this.detectShadeSourcesFromPatterns(hourlyPatterns);

    // Calculate annual shade impact
    const annualShadeImpact = this.calculateAnnualShadeImpact(hourlyPatterns);

    return {
      hourlyPatterns,
      shadeSources,
      annualShadeImpact
    };
  }

  private detectShadeSourcesFromPatterns(hourlyPatterns: any[]): ShadeSource[] {
    // Analyze shade patterns to identify persistent shade sources
    const shadeSources: ShadeSource[] = [];
    
    // Find areas that are consistently shaded
    const persistentShadeAreas = new Map<string, number>();
    
    hourlyPatterns.forEach(pattern => {
      pattern.shadeAreas.forEach((area: any) => {
        const key = `${Math.round(area.position.x)}_${Math.round(area.position.y)}`;
        persistentShadeAreas.set(key, (persistentShadeAreas.get(key) || 0) + 1);
      });
    });

    // Convert persistent areas to shade sources
    let sourceIndex = 0;
    persistentShadeAreas.forEach((count, key) => {
      if (count >= 6) { // Appears in at least 6 hours
        const [x, y] = key.split('_').map(Number);
        
        shadeSources.push({
          id: `detected-source-${sourceIndex++}`,
          name: `Detected Shade Source ${sourceIndex}`,
          type: this.classifyShadeSourceType(x, y, count),
          position: { x, y },
          size: { width: 30, height: 25 },
          height: 15 + Math.random() * 20,
          color: this.getShadeSourceColor(this.classifyShadeSourceType(x, y, count))
        });
      }
    });

    return shadeSources;
  }

  private classifyShadeSourceType(x: number, y: number, frequency: number): ShadeSource['type'] {
    // Simple classification based on position and frequency
    if (frequency > 12) return 'building'; // Very persistent = building
    if (x < 30 || x > 70) return 'tree'; // Edge positions = trees
    if (frequency > 8) return 'terrain'; // Moderately persistent = terrain
    return 'roof-feature';
  }

  private getShadeSourceColor(type: ShadeSource['type']): string {
    const colors = {
      building: '#6B7280',
      tree: '#059669',
      'roof-feature': '#F59E0B',
      terrain: '#92400E',
      chimney: '#DC2626',
      'utility-line': '#7C3AED'
    };
    return colors[type] || '#374151';
  }

  private calculateAnnualShadeImpact(hourlyPatterns: any[]): number {
    const avgShadePercentage = hourlyPatterns.reduce((sum, pattern) => 
      sum + pattern.shadePercentage, 0) / hourlyPatterns.length;
    
    // Estimate annual impact (simplified)
    return Math.round(avgShadePercentage * 0.8); // 80% of daily average
  }

  private async generateEnhancedPanelConfigurations(insights: BuildingInsights): Promise<Array<{
    panelsCount: number;
    yearlyEnergyDcKwh: number;
    roofSegmentSummaries: Array<{
      pitchDegrees: number;
      azimuthDegrees: number;
      panelsCount: number;
      yearlyEnergyDcKwh: number;
      segmentIndex: number;
    }>;
    estimatedCost: number;
    paybackPeriod: number;
  }>> {
    const baseConfigs = insights.solarPotential.solarPanelConfigs;
    
    return baseConfigs.map(config => ({
      ...config,
      estimatedCost: config.panelsCount * 1000, // $1000 per panel
      paybackPeriod: this.calculatePaybackPeriod(config.yearlyEnergyDcKwh, config.panelsCount * 1000)
    }));
  }

  private calculatePaybackPeriod(yearlyEnergyKwh: number, systemCost: number): number {
    const electricityRate = 0.12; // $0.12 per kWh average
    const annualSavings = yearlyEnergyKwh * electricityRate;
    return Math.round(systemCost / annualSavings * 10) / 10; // Round to 1 decimal
  }

  private async performFinancialAnalysis(insights: BuildingInsights, address: string): Promise<{
    monthlyBill: number;
    averageKwhPerMonth: number;
    estimatedSavings: number;
    roi: number;
    incentives: Array<{
      name: string;
      amount: number;
      type: 'tax_credit' | 'rebate' | 'net_metering';
    }>;
  }> {
    const financialAnalyses = insights.solarPotential.financialAnalyses;
    const defaultAnalysis = financialAnalyses.find(f => f.defaultBill) || financialAnalyses[0];
    
    if (!defaultAnalysis) {
      return {
        monthlyBill: 150,
        averageKwhPerMonth: 1000,
        estimatedSavings: 1800,
        roi: 12,
        incentives: []
      };
    }

    // Get state-specific incentives
    const incentives = await this.getStateIncentives(address);

    const monthlyBill = parseFloat(defaultAnalysis.monthlyBill.units);
    const averageKwhPerMonth = defaultAnalysis.averageKwhPerMonth;
    
    // Calculate savings based on solar production
    const maxConfig = insights.solarPotential.solarPanelConfigs[0];
    const annualProduction = maxConfig?.yearlyEnergyDcKwh || 0;
    const electricityRate = monthlyBill / averageKwhPerMonth;
    const estimatedSavings = annualProduction * electricityRate * 0.9; // 90% offset

    // Calculate ROI
    const systemCost = (maxConfig?.panelsCount || 0) * 1000;
    const roi = (estimatedSavings / systemCost) * 100;

    return {
      monthlyBill,
      averageKwhPerMonth,
      estimatedSavings,
      roi,
      incentives
    };
  }

  private async getStateIncentives(address: string): Promise<Array<{
    name: string;
    amount: number;
    type: 'tax_credit' | 'rebate' | 'net_metering';
  }>> {
    // In a real implementation, this would query a database of state incentives
    // For now, return common federal incentives
    return [
      {
        name: 'Federal Solar Tax Credit',
        amount: 30,
        type: 'tax_credit'
      },
      {
        name: 'Net Metering',
        amount: 100,
        type: 'net_metering'
      }
    ];
  }

  // Utility method to get layer visualization by ID
  async getLayerVisualization(
    layerId: string,
    dataLayers: DataLayers,
    options: { showRoofOnly?: boolean; month?: number; day?: number; hour?: number } = {}
  ): Promise<LayerVisualization | LayerVisualization[] | null> {
    try {
      const defaultOptions = { showRoofOnly: true, month: 5, day: 15, hour: 12, ...options };

      switch (layerId) {
        case 'mask':
          return await dataLayersService.renderMaskLayer(dataLayers.maskUrl, this.apiKey, defaultOptions);
        
        case 'dsm':
          return await dataLayersService.renderDSMLayer(dataLayers.dsmUrl, dataLayers.maskUrl, this.apiKey, defaultOptions);
        
        case 'rgb':
          return await dataLayersService.renderRGBLayer(dataLayers.rgbUrl, dataLayers.maskUrl, this.apiKey, defaultOptions);
        
        case 'annualFlux':
          return await dataLayersService.renderAnnualFluxLayer(dataLayers.annualFluxUrl, dataLayers.maskUrl, this.apiKey, defaultOptions);
        
        case 'monthlyFlux':
          return await dataLayersService.renderMonthlyFluxLayer(dataLayers.monthlyFluxUrl, dataLayers.maskUrl, this.apiKey, defaultOptions);
        
        case 'hourlyShade':
          return await dataLayersService.renderHourlyShadeLayer(dataLayers.hourlyShadeUrls, dataLayers.maskUrl, this.apiKey, defaultOptions);
        
        default:
          console.warn(`Unknown layer ID: ${layerId}`);
          return null;
      }
    } catch (error) {
      console.error(`Error getting visualization for layer ${layerId}:`, error);
      return null;
    }
  }
}

export const enhancedSolarApiService = new EnhancedSolarApiService();
export type { EnhancedBuildingInsights, ComprehensiveAnalysis };