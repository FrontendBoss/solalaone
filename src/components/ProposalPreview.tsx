import { X, Download, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { ProposalData, generatePDF } from '../services/exportService';
import { InstallerBranding } from '../lib/supabase';
import { formatCurrency } from '../utils/calculations';
import LoadChart from './LoadChart';

interface ProposalPreviewProps {
  proposalData: ProposalData;
  proposalType: 'calculator' | 'cost-estimation' | 'budget-recommendation';
  onClose: () => void;
  branding?: InstallerBranding;
  companyLogoUrl?: string | null;
  companyName: string;
  companyTagline?: string | null;
  userName?: string | null;
  companyAddress?: string | null;
}

export function ProposalPreview({
  proposalData,
  proposalType,
  onClose,
  branding,
  companyLogoUrl,
  companyName,
  companyTagline,
  userName,
  companyAddress,
}: ProposalPreviewProps) {
  const [downloading, setDownloading] = useState(false);

  const primaryColor = branding?.primary_color || '#2563eb';
  const secondaryColor = branding?.secondary_color || '#1e40af';

  const handleDownloadPDF = async () => {
    setDownloading(true);
    try {
      await generatePDF(
        'proposal-preview-content',
        `${proposalData.clientName.replace(/\s+/g, '_')}_Solar_Proposal.pdf`,
        branding
      );
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  const getProposalTitle = () => {
    switch (proposalType) {
      case 'calculator':
        return 'Solar System Design';
      case 'cost-estimation':
        return 'Solar System Cost Estimation';
      case 'budget-recommendation':
        return 'Budget-Based Solar System Recommendation';
      default:
        return 'Solar System Proposal';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex flex-col">
      <div className="bg-white w-full max-w-4xl mx-auto flex flex-col h-full my-4 rounded-lg shadow-2xl">
        <div className="flex-shrink-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-lg">
          <h2 className="text-2xl font-bold text-gray-800">Proposal Preview</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Close preview"
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 bg-gray-50">
          <div id="proposal-preview-content" className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div
              className="text-white p-8"
              style={{
                background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
              }}
            >
              {companyLogoUrl && (
                <div className="text-center mb-6">
                  <img
                    src={companyLogoUrl}
                    alt={companyName}
                    className="max-h-20 max-w-xs mx-auto object-contain"
                  />
                </div>
              )}
              <h1 className="text-4xl font-bold mb-2">{companyName}</h1>
              {companyTagline && (
                <p className="text-lg opacity-90 mb-6">{companyTagline}</p>
              )}
              <div className="border-t border-white/30 pt-4">
                <h2 className="text-2xl font-semibold">{getProposalTitle()}</h2>
              </div>
            </div>

            <div className="p-8 space-y-6">
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4" style={{ color: primaryColor }}>
                  Proposal Information
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <div className="text-sm text-gray-600">Client Name</div>
                    <div className="font-semibold text-gray-800">{proposalData.clientName}</div>
                  </div>
                  {proposalData.clientEmail && (
                    <div>
                      <div className="text-sm text-gray-600">Email</div>
                      <div className="font-semibold text-gray-800">{proposalData.clientEmail}</div>
                    </div>
                  )}
                  {proposalData.clientPhone && (
                    <div>
                      <div className="text-sm text-gray-600">Phone</div>
                      <div className="font-semibold text-gray-800">{proposalData.clientPhone}</div>
                    </div>
                  )}
                  {userName && (
                    <div>
                      <div className="text-sm text-gray-600">Prepared By</div>
                      <div className="font-semibold text-gray-800">{userName}</div>
                    </div>
                  )}
                  <div>
                    <div className="text-sm text-gray-600">Proposal Date</div>
                    <div className="font-semibold text-gray-800">
                      {new Date().toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Valid Until</div>
                    <div className="font-semibold text-gray-800">
                      {new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-2 border-gray-200 rounded-lg p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4" style={{ color: primaryColor }}>
                  System Specifications
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between py-2 border-b border-gray-200">
                    <span className="font-medium text-gray-700">System Size</span>
                    <span className="font-bold text-gray-900">{proposalData.systemSize} kW</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-200">
                    <span className="font-medium text-gray-700">Total Load Capacity</span>
                    <span className="font-bold text-gray-900">
                      {(proposalData.totalLoad / 1000).toFixed(2)} kW
                    </span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-200">
                    <span className="font-medium text-gray-700">Solar Panels</span>
                    <span className="font-bold text-gray-900">
                      {proposalData.numberOfPanels} × {proposalData.panelCapacity}W
                    </span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-200">
                    <span className="font-medium text-gray-700">Inverter</span>
                    <span className="font-bold text-gray-900">
                      {(proposalData.inverterSize / 1000).toFixed(1)} kW Pure Sine Wave
                    </span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-200">
                    <span className="font-medium text-gray-700">Battery Bank</span>
                    <span className="font-bold text-gray-900">
                      {proposalData.batteries} × 200Ah (12V)
                    </span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-200">
                    <span className="font-medium text-gray-700">Charge Controller</span>
                    <span className="font-bold text-gray-900">
                      {proposalData.chargeController}A MPPT
                    </span>
                  </div>
                  {proposalData.backupHours && (
                    <div className="flex justify-between py-2 border-b border-gray-200">
                      <span className="font-medium text-gray-700">Backup Duration</span>
                      <span className="font-bold text-gray-900">{proposalData.backupHours} hours</span>
                    </div>
                  )}
                  {proposalData.dailyEnergy && (
                    <div className="flex justify-between py-2 border-b border-gray-200">
                      <span className="font-medium text-gray-700">Daily Energy Production</span>
                      <span className="font-bold text-gray-900">
                        {proposalData.dailyEnergy.toFixed(2)} kWh
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {proposalType === 'calculator' && proposalData.loads && (
                <div className="space-y-6" style={{ pageBreakBefore: 'always' }}>
                  <LoadChart loads={proposalData.loads} />
                </div>
              )}

              {proposalData.totalCost && (
                <div
                  className="rounded-lg p-6 text-white text-center"
                  style={{
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  }}
                >
                  <h3 className="text-xl font-bold mb-2">Total Investment</h3>
                  <p className="text-4xl font-bold">
                    ${proposalData.totalCost.toLocaleString()}
                  </p>
                </div>
              )}

              {proposalType === 'budget-recommendation' && proposalData.costBreakdown && (
                <div className="bg-white rounded-lg p-6 border-2 border-gray-200">
                  <h3 className="text-xl font-bold text-gray-800 mb-4" style={{ color: primaryColor }}>
                    Detailed Cost Breakdown
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-2 border-b border-gray-200">
                      <span className="text-gray-700">Solar Panels ({proposalData.numberOfPanels} × {proposalData.panelCapacity}W)</span>
                      <span className="font-semibold text-gray-900">
                        {formatCurrency(proposalData.costBreakdown.panels, proposalData.currency || 'USD')}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-200">
                      <span className="text-gray-700">Inverter ({(proposalData.inverterSize / 1000).toFixed(1)} kW)</span>
                      <span className="font-semibold text-gray-900">
                        {formatCurrency(proposalData.costBreakdown.inverter, proposalData.currency || 'USD')}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-200">
                      <span className="text-gray-700">Batteries ({proposalData.batteries} × 200Ah)</span>
                      <span className="font-semibold text-gray-900">
                        {formatCurrency(proposalData.costBreakdown.batteries, proposalData.currency || 'USD')}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-200">
                      <span className="text-gray-700">Charge Controller ({proposalData.chargeController}A MPPT)</span>
                      <span className="font-semibold text-gray-900">
                        {formatCurrency(proposalData.costBreakdown.chargeController, proposalData.currency || 'USD')}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-200">
                      <span className="text-gray-700">Installation & Balance of System</span>
                      <span className="font-semibold text-gray-900">
                        {formatCurrency(proposalData.costBreakdown.installation, proposalData.currency || 'USD')}
                      </span>
                    </div>
                    <div className="flex justify-between items-center pt-3 border-t-2 border-gray-300">
                      <span className="text-lg font-bold text-gray-800">Total Cost</span>
                      <span className="text-lg font-bold" style={{ color: primaryColor }}>
                        {formatCurrency(proposalData.totalCost || 0, proposalData.currency || 'USD')}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {proposalType === 'budget-recommendation' && proposalData.sampleLoads && proposalData.sampleLoads.length > 0 && (
                <div className="bg-white rounded-lg p-6 border-2 border-gray-200">
                  <h3 className="text-xl font-bold text-gray-800 mb-4" style={{ color: primaryColor }}>
                    Sample Load Breakdown
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    This system can support the following appliances simultaneously:
                  </p>
                  <div className="space-y-2">
                    {proposalData.sampleLoads.map((load, index) => (
                      <div key={index} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
                        <span className="text-gray-700">
                          {load.quantity}× {load.name}
                        </span>
                        <span className="font-semibold text-gray-900">
                          {load.quantity * load.wattage}W
                        </span>
                      </div>
                    ))}
                    <div className="flex justify-between items-center bg-blue-50 p-3 rounded-lg border-2 border-blue-200 mt-3">
                      <span className="font-bold text-gray-800">Total Supported Load</span>
                      <span className="font-bold text-blue-600">
                        {proposalData.totalLoad.toLocaleString()}W ({(proposalData.totalLoad / 1000).toFixed(2)} kW)
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {proposalType === 'cost-estimation' && proposalData.defaultPrices && (
                <div className="bg-white rounded-lg p-6 border-2 border-gray-200">
                  <h3 className="text-xl font-bold text-gray-800 mb-4" style={{ color: primaryColor }}>
                    Default Component Prices
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="text-xs text-gray-600 mb-1">Solar Panel (400W)</div>
                      <div className="font-semibold text-gray-900">
                        {formatCurrency(proposalData.defaultPrices.solarPanel, proposalData.currency || 'USD')}
                      </div>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="text-xs text-gray-600 mb-1">Battery (200Ah, 12V)</div>
                      <div className="font-semibold text-gray-900">
                        {formatCurrency(proposalData.defaultPrices.battery, proposalData.currency || 'USD')}
                      </div>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="text-xs text-gray-600 mb-1">Inverter</div>
                      <div className="font-semibold text-gray-900">
                        {formatCurrency(proposalData.defaultPrices.inverter, proposalData.currency || 'USD')}
                      </div>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="text-xs text-gray-600 mb-1">Charge Controller</div>
                      <div className="font-semibold text-gray-900">
                        {formatCurrency(proposalData.defaultPrices.chargeController, proposalData.currency || 'USD')}
                      </div>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="text-xs text-gray-600 mb-1">DC Breaker</div>
                      <div className="font-semibold text-gray-900">
                        {formatCurrency(proposalData.defaultPrices.dcBreaker, proposalData.currency || 'USD')}
                      </div>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="text-xs text-gray-600 mb-1">AC Breaker</div>
                      <div className="font-semibold text-gray-900">
                        {formatCurrency(proposalData.defaultPrices.acBreaker, proposalData.currency || 'USD')}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {proposalType === 'cost-estimation' && proposalData.componentCosts && (
                <div className="bg-white rounded-lg p-6 border-2 border-gray-200">
                  <h3 className="text-xl font-bold text-gray-800 mb-4" style={{ color: primaryColor }}>
                    Detailed Cost Breakdown
                  </h3>
                  <div className="space-y-3">
                    <div className="mb-4">
                      <h4 className="font-semibold text-gray-700 mb-3">Standard Components</h4>
                      {proposalData.componentCosts.map((item, index) => (
                        <div key={index} className="flex justify-between items-center py-2 border-b border-gray-200">
                          <span className="text-gray-700">
                            {item.name} ({item.quantity} × {formatCurrency(item.pricePerUnit, proposalData.currency || 'USD')})
                          </span>
                          <span className="font-semibold text-gray-900">
                            {formatCurrency(item.subtotal, proposalData.currency || 'USD')}
                          </span>
                        </div>
                      ))}
                    </div>

                    {proposalData.customItems && proposalData.customItems.length > 0 && (
                      <div className="mb-4">
                        <h4 className="font-semibold text-gray-700 mb-3">Custom Items</h4>
                        {proposalData.customItems.map((item, index) => (
                          <div key={index} className="flex justify-between items-center py-2 border-b border-gray-200">
                            <span className="text-gray-700">
                              {item.name} ({item.quantity} × {formatCurrency(item.pricePerUnit, proposalData.currency || 'USD')})
                            </span>
                            <span className="font-semibold text-gray-900">
                              {formatCurrency(item.subtotal, proposalData.currency || 'USD')}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex justify-between items-center py-2 border-b border-gray-200">
                      <span className="text-gray-700">Installation & Balance of System (20%)</span>
                      <span className="font-semibold text-gray-900">
                        {formatCurrency(proposalData.installationFees || 0, proposalData.currency || 'USD')}
                      </span>
                    </div>

                    <div className="flex justify-between items-center pt-3 border-t-2 border-gray-300">
                      <span className="text-lg font-bold text-gray-800">Total Cost</span>
                      <span className="text-lg font-bold" style={{ color: primaryColor }}>
                        {formatCurrency(proposalData.totalCost || 0, proposalData.currency || 'USD')}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-gray-50 rounded-lg p-6" style={{ pageBreakBefore: 'always' }}>
                <h3 className="text-xl font-bold text-gray-800 mb-4" style={{ color: primaryColor }}>
                  System Components Breakdown
                </h3>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-white p-3 rounded-lg border border-gray-200">
                    <div className="text-xs text-gray-600 mb-1">Solar Array</div>
                    <div className="font-semibold text-gray-900">
                      {proposalData.numberOfPanels} × {proposalData.panelCapacity}W Panels
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Total Capacity: {(proposalData.numberOfPanels * proposalData.panelCapacity / 1000).toFixed(2)} kW
                    </div>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-gray-200">
                    <div className="text-xs text-gray-600 mb-1">Inverter System</div>
                    <div className="font-semibold text-gray-900">
                      {(proposalData.inverterSize / 1000).toFixed(1)} kW Pure Sine Wave
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Handles {(proposalData.totalLoad / 1000).toFixed(2)} kW Load
                    </div>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-gray-200">
                    <div className="text-xs text-gray-600 mb-1">Battery Storage</div>
                    <div className="font-semibold text-gray-900">
                      {proposalData.batteries} × 200Ah Batteries
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {proposalData.backupHours ? `${proposalData.backupHours}h Backup` : 'Deep Cycle Technology'}
                    </div>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-gray-200">
                    <div className="text-xs text-gray-600 mb-1">Charge Controller</div>
                    <div className="font-semibold text-gray-900">
                      {proposalData.chargeController}A MPPT
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Maximum Power Point Tracking
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4" style={{ color: primaryColor }}>
                  What's Included in This Package
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="flex items-start gap-2">
                    <span className="text-green-600 mt-1 text-lg">✓</span>
                    <span className="text-sm text-gray-700">Professional system design and engineering</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-green-600 mt-1 text-lg">✓</span>
                    <span className="text-sm text-gray-700">High-quality solar panels with warranty</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-green-600 mt-1 text-lg">✓</span>
                    <span className="text-sm text-gray-700">Pure sine wave inverter for sensitive electronics</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-green-600 mt-1 text-lg">✓</span>
                    <span className="text-sm text-gray-700">Deep cycle battery bank for reliable backup</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-green-600 mt-1 text-lg">✓</span>
                    <span className="text-sm text-gray-700">MPPT charge controller for maximum efficiency</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-green-600 mt-1 text-lg">✓</span>
                    <span className="text-sm text-gray-700">Complete wiring, breakers, and protection</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-green-600 mt-1 text-lg">✓</span>
                    <span className="text-sm text-gray-700">Mounting hardware and installation materials</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-green-600 mt-1 text-lg">✓</span>
                    <span className="text-sm text-gray-700">Professional installation by certified technicians</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-green-600 mt-1 text-lg">✓</span>
                    <span className="text-sm text-gray-700">System testing and commissioning</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-green-600 mt-1 text-lg">✓</span>
                    <span className="text-sm text-gray-700">Comprehensive warranty and after-sales support</span>
                  </div>
                </div>
              </div>

              <div className="bg-white border-2 border-gray-200 rounded-lg p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4" style={{ color: primaryColor }}>
                  System Performance & Specifications
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <div className="text-gray-600 font-medium">System Type</div>
                    <div className="text-gray-900">Off-Grid Solar Power System</div>
                  </div>
                  <div>
                    <div className="text-gray-600 font-medium">Inverter Type</div>
                    <div className="text-gray-900">Pure Sine Wave</div>
                  </div>
                  <div>
                    <div className="text-gray-600 font-medium">Battery Type</div>
                    <div className="text-gray-900">Deep Cycle Lead Acid</div>
                  </div>
                  <div>
                    <div className="text-gray-600 font-medium">System Voltage</div>
                    <div className="text-gray-900">48V DC</div>
                  </div>
                  <div>
                    <div className="text-gray-600 font-medium">Controller Type</div>
                    <div className="text-gray-900">MPPT (Maximum Power Point Tracking)</div>
                  </div>
                  <div>
                    <div className="text-gray-600 font-medium">Expected Lifespan</div>
                    <div className="text-gray-900">25+ Years (Panels)</div>
                  </div>
                </div>
              </div>

              {(companyAddress || branding?.website) && (
                <div className="text-center text-gray-600 text-sm space-y-1 pt-4 border-t border-gray-200">
                  {companyAddress && <p>{companyAddress}</p>}
                  {branding?.website && (
                    <p>
                      <a
                        href={branding.website}
                        className="hover:underline"
                        style={{ color: primaryColor }}
                      >
                        {branding.website}
                      </a>
                    </p>
                  )}
                  <p className="text-gray-500 mt-4">
                    This proposal is valid for 30 days from the date of issue.
                  </p>
                </div>
              )}

              <div className="text-center text-gray-400 text-xs pt-4 border-t border-gray-200">
                <p>Generated by SolalaSolar</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-shrink-0 bg-white border-t border-gray-200 px-6 py-4 flex justify-end gap-3 rounded-b-lg">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Close
          </button>
          <button
            onClick={handleDownloadPDF}
            disabled={downloading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {downloading ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                Generating PDF...
              </>
            ) : (
              <>
                <Download size={20} />
                Download PDF
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
