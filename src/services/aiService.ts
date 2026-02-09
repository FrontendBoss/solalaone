export interface AIRecommendationRequest {
  totalLoad: number;
  dailyEnergy: number;
  numberOfPanels: number;
  panelCapacity: number;
  backupHours?: number;
  backupDays?: number;
}

export interface AIBudgetRequest {
  budget: number;
  currency?: string;
  currencySymbol?: string;
  prices?: {
    solarPanel: number;
    battery: number;
    inverterPerKw: number;
    chargeController: number;
    installation: number;
  };
}

export const getSystemRecommendations = async (data: AIRecommendationRequest): Promise<string> => {
  const prompt = `You are a solar system design expert. Based on the following system requirements, provide recommendations:

Total Connected Load: ${data.totalLoad}W (${(data.totalLoad / 1000).toFixed(2)}kW)
Daily Energy Consumption: ${data.dailyEnergy.toFixed(2)}kWh
Number of Panels: ${data.numberOfPanels}
Panel Capacity: ${data.panelCapacity}W
Backup Required: ${data.backupHours ? `${data.backupHours} hours` : `${data.backupDays} days`}

Please provide:
1. Recommended inverter size and why
2. Recommended charge controller type (MPPT/PWM) and rating
3. Battery recommendations (type, capacity, configuration)
4. Panel wiring configuration recommendations
5. Any important considerations or warnings

Keep the response concise and professional, suitable for presentation to installers.`;

  try {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('Gemini API key not configured');
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `You are a professional solar system design consultant with expertise in photovoltaic systems, inverters, batteries, and charge controllers.\n\n${prompt}`,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 500,
          },
        }),
      }
    );

    if (!response.ok) {
      throw new Error('AI service unavailable');
    }

    const result = await response.json();
    return result.candidates?.[0]?.content?.parts?.[0]?.text || 'Unable to generate recommendations.';
  } catch (error) {
    return `Based on standard solar engineering practices:

• Inverter: A ${Math.ceil(data.totalLoad * 1.25 / 1000)}kW pure sine wave inverter is recommended (125% of total load for surge capacity)

• Charge Controller: MPPT controller rated at ${Math.ceil((data.numberOfPanels * data.panelCapacity * 1.25) / 48)}A is recommended for 48V system (includes 25% safety margin)

• Batteries: Deep cycle batteries (AGM or Lithium) in 48V configuration. For ${data.backupHours || (data.backupDays || 1) * 24} hours backup, ensure sufficient amp-hour capacity with 50% depth of discharge

• Panel Configuration: Series-parallel connection to achieve 48V system voltage with maximum power output

• Important: Always verify local electrical codes and hire certified installers for safety compliance`;
  }
};

export const getBudgetBasedRecommendation = async (data: AIBudgetRequest): Promise<string> => {
  const currencySymbol = data.currencySymbol || '$';
  const currency = data.currency || 'USD';
  const prices = data.prices || {
    solarPanel: 180,
    battery: 250,
    inverterPerKw: 250,
    chargeController: 350,
    installation: 0.2,
  };

  const prompt = `You are a solar system design expert. A customer has a budget of ${currencySymbol}${data.budget.toLocaleString()} ${currency} for a complete solar installation.

Please provide a detailed recommendation including:
1. Recommended system size (kW)
2. Number and wattage of solar panels
3. Inverter specifications
4. Battery specifications (type, quantity, capacity)
5. Charge controller specifications
6. Estimated supported loads (what appliances can run)
7. Estimated backup duration
8. Brief cost breakdown

Use these actual market prices for calculations:
- Solar panels (400W): ${currencySymbol}${prices.solarPanel.toLocaleString()} each
- Inverter: ${currencySymbol}${prices.inverterPerKw.toLocaleString()} per kW
- Batteries (200Ah, 12V): ${currencySymbol}${prices.battery.toLocaleString()} each
- MPPT Charge Controller: ${currencySymbol}${prices.chargeController.toLocaleString()}
- Installation & BOS: ${(prices.installation * 100).toFixed(0)}% of component cost

Keep the response professional and suitable for presentation to customers.`;

  try {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('Gemini API key not configured');
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `You are a professional solar system design consultant specializing in budget-appropriate system sizing and component selection.\n\n${prompt}`,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 800,
          },
        }),
      }
    );

    if (!response.ok) {
      throw new Error('AI service unavailable');
    }

    const result = await response.json();
    return result.candidates?.[0]?.content?.parts?.[0]?.text || 'Unable to generate recommendations.';
  } catch (error) {
    const currencySymbol = data.currencySymbol || '$';
    const currency = data.currency || 'USD';
    const prices = data.prices || {
      solarPanel: 180,
      battery: 250,
      inverterPerKw: 250,
      chargeController: 350,
      installation: 0.2,
    };

    const availableForComponents = data.budget * (1 - prices.installation);
    const avgCostPerKw = prices.solarPanel * 2.5 + prices.inverterPerKw + prices.battery * 1.5 + prices.chargeController / 3;
    const systemSize = Math.max(1, Math.floor(availableForComponents / avgCostPerKw));
    const panels = Math.ceil(systemSize * 1000 / 400);
    const inverterKw = Math.ceil(systemSize * 1.2);
    const batteries = Math.max(4, Math.floor((availableForComponents * 0.3) / prices.battery));

    const panelsCost = panels * prices.solarPanel;
    const inverterCost = inverterKw * prices.inverterPerKw;
    const batteriesCost = batteries * prices.battery;
    const installationCost = data.budget * prices.installation;

    return `Budget-Based Solar System Recommendation (${currencySymbol}${data.budget.toLocaleString()} ${currency}):

System Size: ${systemSize}kW
Solar Panels: ${panels} × 400W panels
Inverter: ${inverterKw}kW Pure Sine Wave
Batteries: ${batteries} × 200Ah 12V batteries (48V configuration)
Charge Controller: ${Math.ceil(panels * 400 / 48)}A MPPT controller

Supported Loads: Suitable for typical household needs including lights, fans, TV, refrigerator, and small appliances
Backup Duration: Approximately ${Math.floor((batteries * 200 * 48) / (systemSize * 800 * 2))} hours for full load

Cost Breakdown:
- Solar Panels: ${currencySymbol}${panelsCost.toLocaleString()}
- Inverter: ${currencySymbol}${inverterCost.toLocaleString()}
- Batteries: ${currencySymbol}${batteriesCost.toLocaleString()}
- Charge Controller: ${currencySymbol}${prices.chargeController.toLocaleString()}
- Installation & BOS: ${currencySymbol}${installationCost.toLocaleString()}

Note: This is a baseline estimate. Actual costs may vary based on location, component brands, and installation complexity.`;
  }
};
