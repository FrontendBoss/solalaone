import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import {
  Sun,
  DollarSign,
  TrendingDown,
  TrendingUp,
  Leaf,
  Zap,
  Shield,
  Download,
  Eye,
  MapPin,
  Home,
  Award,
  BarChart3,
  Battery
} from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import MarketingCharts from './MarketingCharts';

interface SolarIncentive {
  id: string;
  country: string;
  state: string;
  federal_tax_credit: number;
  state_tax_credit: number;
  state_rebate: number;
  srec_value: number;
  net_metering: boolean;
  property_tax_exemption: boolean;
  sales_tax_exemption: boolean;
  additional_incentives: string;
}

interface FormData {
  monthlyBill: number;
  country: string;
  state: string;
  installationCost: number;
  systemSize: number;
}

const US_STATES = [
  'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut',
  'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa',
  'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan',
  'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire',
  'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio',
  'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota',
  'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia',
  'Wisconsin', 'Wyoming'
];

export default function MarketingSales() {
  const [formData, setFormData] = useState<FormData>({
    monthlyBill: 150,
    country: 'USA',
    state: 'California',
    installationCost: 15000,
    systemSize: 6
  });

  const [incentive, setIncentive] = useState<SolarIncentive | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    fetchIncentives();
  }, [formData.country, formData.state]);

  const fetchIncentives = async () => {
    try {
      const { data, error } = await supabase
        .from('solar_incentives')
        .select('*')
        .eq('country', formData.country)
        .eq('state', formData.state)
        .maybeSingle();

      if (data && !error) {
        setIncentive(data);
      }
    } catch (error) {
      console.error('Error fetching incentives:', error);
    }
  };

  const calculateSavings = () => {
    const annualBill = formData.monthlyBill * 12;
    const solarProduction = formData.systemSize * 1200;
    const electricityRate = formData.monthlyBill / (formData.monthlyBill * 10);
    const annualSavings = solarProduction * electricityRate;

    const federalCredit = incentive ? (formData.installationCost * incentive.federal_tax_credit / 100) : 0;
    const stateCredit = incentive ? (formData.installationCost * (incentive.state_tax_credit || 0) / 100) : 0;
    const stateRebate = incentive?.state_rebate || 0;

    const netCost = formData.installationCost - federalCredit - stateCredit - stateRebate;
    const paybackYears = netCost / annualSavings;

    const twentyFiveYearSavings = (annualSavings * 25) - formData.installationCost + federalCredit + stateCredit + stateRebate;

    const co2Offset = formData.systemSize * 1200 * 0.0007;
    const treesEquivalent = co2Offset * 16.5;

    return {
      annualSavings: Math.round(annualSavings),
      monthlySavings: Math.round(annualSavings / 12),
      federalCredit: Math.round(federalCredit),
      stateCredit: Math.round(stateCredit),
      stateRebate: Math.round(stateRebate),
      totalIncentives: Math.round(federalCredit + stateCredit + stateRebate),
      netCost: Math.round(netCost),
      paybackYears: paybackYears.toFixed(1),
      twentyFiveYearSavings: Math.round(twentyFiveYearSavings),
      co2Offset: co2Offset.toFixed(1),
      treesEquivalent: Math.round(treesEquivalent),
      solarProduction: Math.round(solarProduction)
    };
  };

  const savings = calculateSavings();

  const handleDownloadPDF = async () => {
    setIsGenerating(true);
    try {
      const element = document.getElementById('proposal-preview');
      if (!element) return;

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      const margin = 10;
      const availableWidth = pdfWidth - (margin * 2);

      const imgWidthMM = availableWidth;
      const imgHeightMM = (canvas.height * availableWidth) / canvas.width;

      let heightLeft = imgHeightMM;
      let position = margin;

      pdf.addImage(imgData, 'PNG', margin, position, imgWidthMM, imgHeightMM);
      heightLeft -= (pdfHeight - margin * 2);

      while (heightLeft > 0) {
        position = heightLeft - imgHeightMM + margin;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', margin, position, imgWidthMM, imgHeightMM);
        heightLeft -= (pdfHeight - margin * 2);
      }

      pdf.save('solar-proposal.pdf');
    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-blue-600 to-cyan-500 rounded-2xl p-8 text-white">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
            <Sun className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-3xl font-bold">Marketing & Sales Proposal</h2>
            <p className="text-blue-100">Create compelling solar proposals for your customers</p>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-md p-6 space-y-6">
          <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
            <Home className="w-5 h-5 text-blue-600" />
            Customer Information
          </h3>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Monthly Electric Bill ($)
            </label>
            <input
              type="number"
              value={formData.monthlyBill}
              onChange={(e) => setFormData({ ...formData, monthlyBill: Number(e.target.value) })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Country
            </label>
            <select
              value={formData.country}
              onChange={(e) => setFormData({ ...formData, country: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="USA">United States</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              State
            </label>
            <select
              value={formData.state}
              onChange={(e) => setFormData({ ...formData, state: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {US_STATES.map(state => (
                <option key={state} value={state}>{state}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Solar Installation Cost ($)
            </label>
            <input
              type="number"
              value={formData.installationCost}
              onChange={(e) => setFormData({ ...formData, installationCost: Number(e.target.value) })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              System Size (kW)
            </label>
            <input
              type="number"
              step="0.1"
              value={formData.systemSize}
              onChange={(e) => setFormData({ ...formData, systemSize: Number(e.target.value) })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl shadow-md p-6 text-white">
            <div className="flex items-center gap-2 mb-4">
              <DollarSign className="w-6 h-6" />
              <h3 className="text-xl font-semibold">Financial Benefits</h3>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-emerald-100">Annual Savings</span>
                <span className="text-2xl font-bold">${savings.annualSavings.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-emerald-100">Monthly Savings</span>
                <span className="text-xl font-bold">${savings.monthlySavings.toLocaleString()}</span>
              </div>
              <div className="h-px bg-white/30 my-2" />
              <div className="flex justify-between items-center">
                <span className="text-emerald-100">25-Year Savings</span>
                <span className="text-2xl font-bold">${savings.twentyFiveYearSavings.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl shadow-md p-6 text-white">
            <div className="flex items-center gap-2 mb-4">
              <Award className="w-6 h-6" />
              <h3 className="text-xl font-semibold">Incentives & Tax Credits</h3>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-blue-100">Federal Tax Credit ({incentive?.federal_tax_credit}%)</span>
                <span className="text-xl font-bold">${savings.federalCredit.toLocaleString()}</span>
              </div>
              {savings.stateCredit > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-blue-100">State Tax Credit</span>
                  <span className="text-xl font-bold">${savings.stateCredit.toLocaleString()}</span>
                </div>
              )}
              {savings.stateRebate > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-blue-100">State Rebate</span>
                  <span className="text-xl font-bold">${savings.stateRebate.toLocaleString()}</span>
                </div>
              )}
              <div className="h-px bg-white/30 my-2" />
              <div className="flex justify-between items-center">
                <span className="text-blue-100">Total Incentives</span>
                <span className="text-2xl font-bold">${savings.totalIncentives.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-blue-100">Net System Cost</span>
                <span className="text-xl font-bold">${savings.netCost.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-blue-100">Payback Period</span>
                <span className="text-xl font-bold">{savings.paybackYears} years</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-md p-6 text-white">
            <div className="flex items-center gap-2 mb-4">
              <Leaf className="w-6 h-6" />
              <h3 className="text-xl font-semibold">Environmental Impact</h3>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-green-100">Annual CO₂ Offset</span>
                <span className="text-2xl font-bold">{savings.co2Offset} tons</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-green-100">Equivalent Trees Planted</span>
                <span className="text-2xl font-bold">{savings.treesEquivalent} trees</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-4">
        <button
          onClick={() => setShowPreview(!showPreview)}
          className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-500 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-cyan-600 transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
        >
          <Eye className="w-5 h-5" />
          {showPreview ? 'Hide Preview' : 'Preview Proposal'}
        </button>
        <button
          onClick={handleDownloadPDF}
          disabled={isGenerating}
          className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-500 text-white px-6 py-3 rounded-lg font-semibold hover:from-emerald-700 hover:to-teal-600 transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl disabled:opacity-50"
        >
          <Download className="w-5 h-5" />
          {isGenerating ? 'Generating...' : 'Download PDF'}
        </button>
      </div>

      {showPreview && (
        <div id="proposal-preview" className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="relative h-96 bg-gradient-to-br from-blue-600 via-cyan-500 to-teal-400 overflow-hidden">
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-20 left-20 w-64 h-64 bg-white rounded-full blur-3xl" />
              <div className="absolute bottom-20 right-20 w-96 h-96 bg-yellow-300 rounded-full blur-3xl" />
            </div>
            <div className="relative h-full flex flex-col items-center justify-center text-white px-8 py-6 text-center">
              <Sun className="w-24 h-24 mb-6 animate-pulse" />
              <h1 className="text-6xl font-bold mb-4">Your Solar Future</h1>
              <p className="text-2xl text-cyan-100 mb-8">Save Money. Save the Planet. Secure Your Energy.</p>
              <div className="bg-white/20 backdrop-blur-md rounded-2xl px-8 py-4 border border-white/30">
                <p className="text-4xl font-bold">${savings.twentyFiveYearSavings.toLocaleString()}</p>
                <p className="text-lg text-cyan-100">Projected 25-Year Savings</p>
              </div>
            </div>
          </div>

          <div className="p-8">
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-6 border-2 border-blue-200">
                <TrendingUp className="w-10 h-10 text-blue-600 mx-auto mb-3" />
                <p className="font-bold text-3xl text-blue-600 text-center">${savings.monthlySavings}</p>
                <p className="text-gray-600 text-center mt-2">Monthly Savings</p>
              </div>
              <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl p-6 border-2 border-emerald-200">
                <DollarSign className="w-10 h-10 text-emerald-600 mx-auto mb-3" />
                <p className="font-bold text-3xl text-emerald-600 text-center">${savings.totalIncentives.toLocaleString()}</p>
                <p className="text-gray-600 text-center mt-2">Total Incentives</p>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border-2 border-green-200">
                <Leaf className="w-10 h-10 text-green-600 mx-auto mb-3" />
                <p className="font-bold text-3xl text-green-600 text-center">{savings.co2Offset} tons</p>
                <p className="text-gray-600 text-center mt-2">CO₂ Offset Annually</p>
              </div>
            </div>
          </div>

          <div className="p-8 space-y-12">
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl p-8 border-2 border-emerald-200">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-emerald-500 rounded-xl">
                    <Leaf className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800">Environmental Impact</h3>
                </div>
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Leaf className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <p className="text-3xl font-bold text-emerald-600">{savings.co2Offset} tons</p>
                      <p className="text-gray-600">CO₂ offset per year</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Sun className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <p className="text-3xl font-bold text-emerald-600">{savings.treesEquivalent}</p>
                      <p className="text-gray-600">Trees planted equivalent</p>
                    </div>
                  </div>
                  <div className="bg-white rounded-lg p-4 mt-4">
                    <p className="text-gray-700">
                      By going solar, you're making a significant positive impact on the environment.
                      Over 25 years, your system will offset{' '}
                      <span className="font-bold text-emerald-600">{(Number(savings.co2Offset) * 25).toFixed(1)} tons</span> of CO₂.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-8 border-2 border-orange-200">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-orange-500 rounded-xl">
                    <Shield className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800">Energy Security</h3>
                </div>
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-orange-100 rounded-lg">
                      <Battery className="w-6 h-6 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-orange-600">Power During Outages</p>
                      <p className="text-gray-600 mt-1">With battery backup, maintain electricity during grid failures</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-orange-100 rounded-lg">
                      <Zap className="w-6 h-6 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-orange-600">Protection from Rate Hikes</p>
                      <p className="text-gray-600 mt-1">Lock in your energy costs and avoid utility rate increases</p>
                    </div>
                  </div>
                  <div className="bg-white rounded-lg p-4 mt-4">
                    <p className="text-gray-700">
                      In the event of severe weather, natural disasters, or grid failures,
                      your solar system with battery storage ensures your home stays powered and your family stays safe.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {incentive && (
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-8 border-2 border-blue-200">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-blue-500 rounded-xl">
                    <Award className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800">Available Incentives in {formData.state}</h3>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full" />
                      <span className="font-semibold">Federal Tax Credit:</span>
                      <span className="text-blue-600 font-bold">{incentive.federal_tax_credit}%</span>
                    </div>
                    {incentive.state_tax_credit > 0 && (
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full" />
                        <span className="font-semibold">State Tax Credit:</span>
                        <span className="text-blue-600 font-bold">{incentive.state_tax_credit}%</span>
                      </div>
                    )}
                    {incentive.net_metering && (
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                        <span className="font-semibold">Net Metering Available</span>
                      </div>
                    )}
                    {incentive.property_tax_exemption && (
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                        <span className="font-semibold">Property Tax Exemption</span>
                      </div>
                    )}
                  </div>
                  <div className="space-y-3">
                    {incentive.sales_tax_exemption && (
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                        <span className="font-semibold">Sales Tax Exemption</span>
                      </div>
                    )}
                    {incentive.srec_value > 0 && (
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full" />
                        <span className="font-semibold">SREC Value:</span>
                        <span className="text-blue-600 font-bold">${incentive.srec_value}/MWh</span>
                      </div>
                    )}
                  </div>
                </div>
                {incentive.additional_incentives && (
                  <div className="mt-4 bg-white rounded-lg p-4">
                    <p className="text-sm font-semibold text-gray-700 mb-2">Additional Incentives:</p>
                    <p className="text-gray-600">{incentive.additional_incentives}</p>
                  </div>
                )}
              </div>
            )}

            <div className="my-12">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-gray-100 rounded-xl">
                  <BarChart3 className="w-8 h-8 text-gray-800" />
                </div>
                <h2 className="text-3xl font-bold text-gray-800">Financial Analysis & Projections</h2>
              </div>
              <MarketingCharts savings={savings} formData={formData} />
            </div>

            <div className="bg-gradient-to-r from-blue-600 to-cyan-500 rounded-xl p-6 text-white text-center">
              <h2 className="text-4xl font-bold mb-4">Ready to Start Saving?</h2>
              <p className="text-xl text-cyan-100 mb-8">
                Join thousands of homeowners who have already made the switch to clean, affordable solar energy.
              </p>
              <div className="grid md:grid-cols-3 gap-6 mt-8">
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-6 border border-white/30">
                  <TrendingUp className="w-12 h-12 mx-auto mb-3" />
                  <p className="font-bold text-2xl">${savings.monthlySavings}</p>
                  <p className="text-cyan-100">Monthly Savings</p>
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-6 border border-white/30">
                  <DollarSign className="w-12 h-12 mx-auto mb-3" />
                  <p className="font-bold text-2xl">${savings.totalIncentives.toLocaleString()}</p>
                  <p className="text-cyan-100">Total Incentives</p>
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-6 border border-white/30">
                  <Leaf className="w-12 h-12 mx-auto mb-3" />
                  <p className="font-bold text-2xl">{savings.co2Offset} tons</p>
                  <p className="text-cyan-100">CO₂ Offset Annually</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
