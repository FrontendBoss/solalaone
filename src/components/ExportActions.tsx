import { useState } from 'react';
import { FileDown, MessageCircle, Mail, Save, Check, Eye } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import {
  generateWhatsAppSummary,
  generateEmailQuotation,
  shareViaWhatsApp,
  copyToClipboard,
  ProposalData,
} from '../services/exportService';
import { saveProposal } from '../services/proposalService';
import { ProposalPreview } from './ProposalPreview';

interface ExportActionsProps {
  proposalData: ProposalData;
  proposalType: 'calculator' | 'cost' | 'budget';
}

export default function ExportActions({ proposalData, proposalType }: ExportActionsProps) {
  const { user, installer, branding, userSettings } = useAuth();
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showPreviewForm, setShowPreviewForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [clientInfo, setClientInfo] = useState({
    name: '',
    email: '',
    phone: '',
  });

  const handleSaveProposal = async () => {
    if (!user || !installer || !clientInfo.name) return;

    setSaving(true);
    try {
      await saveProposal(
        user.id,
        clientInfo.name,
        proposalType,
        proposalData,
        proposalData.systemSize,
        proposalData.totalCost,
        clientInfo.email,
        clientInfo.phone
      );
      setSaveSuccess(true);
      setTimeout(() => {
        setShowSaveModal(false);
        setSaveSuccess(false);
        setClientInfo({ name: '', email: '', phone: '' });
      }, 2000);
    } catch (error) {
      console.error('Error saving proposal:', error);
      alert('Failed to save proposal. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleWhatsAppShare = () => {
    const companyName = userSettings?.company_name || installer?.company_name || 'Solar Company';
    const summary = generateWhatsAppSummary(proposalData, companyName, userSettings?.company_tagline);
    shareViaWhatsApp(summary, clientInfo.phone);
  };

  const handleCopyWhatsApp = async () => {
    const companyName = userSettings?.company_name || installer?.company_name || 'Solar Company';
    const summary = generateWhatsAppSummary(proposalData, companyName, userSettings?.company_tagline);
    await copyToClipboard(summary);
    alert('WhatsApp summary copied to clipboard!');
  };

  const handleEmailQuote = () => {
    const companyName = userSettings?.company_name || installer?.company_name || 'Solar Company';
    const emailBody = generateEmailQuotation(
      proposalData,
      companyName,
      branding || undefined,
      userSettings?.company_logo_url,
      userSettings?.company_tagline
    );

    const blob = new Blob([emailBody], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `solar-proposal-${proposalData.clientName.replace(/\s+/g, '-')}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleShowPreview = () => {
    if (!clientInfo.name) {
      setShowPreviewForm(true);
    } else {
      setShowPreview(true);
    }
  };

  const handlePreviewWithClientInfo = () => {
    setShowPreviewForm(false);
    setShowPreview(true);
  };

  const normalizedProposalType = proposalType === 'cost' ? 'cost-estimation' : proposalType === 'budget' ? 'budget-recommendation' : 'calculator';
  const companyName = userSettings?.company_name || installer?.company_name || 'Solar Company';

  const enrichedProposalData: ProposalData = {
    ...proposalData,
    clientName: clientInfo.name || 'Draft Proposal',
    clientEmail: clientInfo.email,
    clientPhone: clientInfo.phone,
  };

  return (
    <>
      <div className="no-print bg-white rounded-lg shadow-sm p-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">Export & Share</h3>
        <div className="space-y-2">
          <button
            onClick={handleShowPreview}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 text-sm font-semibold shadow-md"
          >
            <Eye size={18} />
            Preview & Download PDF
          </button>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setShowSaveModal(true)}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium"
            >
              <Save size={16} />
              Save Proposal
            </button>
            <button
              onClick={handleCopyWhatsApp}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm font-medium"
            >
              <MessageCircle size={16} />
              WhatsApp
            </button>
            <button
              onClick={handleEmailQuote}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 text-sm font-medium"
            >
              <Mail size={16} />
              Email Quote
            </button>
            <button
              onClick={() => window.print()}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 text-sm font-medium"
            >
              <FileDown size={16} />
              Print/PDF
            </button>
          </div>
        </div>
      </div>

      {showSaveModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            {saveSuccess ? (
              <div className="text-center py-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                  <Check className="text-green-600" size={32} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Proposal Saved!</h3>
                <p className="text-gray-600">Your proposal has been saved successfully.</p>
              </div>
            ) : (
              <>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Save Proposal</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Client Name *
                    </label>
                    <input
                      type="text"
                      value={clientInfo.name}
                      onChange={e => setClientInfo({ ...clientInfo, name: e.target.value })}
                      className="w-full px-3 py-2 border rounded-md"
                      placeholder="John Doe"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Client Email
                    </label>
                    <input
                      type="email"
                      value={clientInfo.email}
                      onChange={e => setClientInfo({ ...clientInfo, email: e.target.value })}
                      className="w-full px-3 py-2 border rounded-md"
                      placeholder="john@example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Client Phone
                    </label>
                    <input
                      type="tel"
                      value={clientInfo.phone}
                      onChange={e => setClientInfo({ ...clientInfo, phone: e.target.value })}
                      className="w-full px-3 py-2 border rounded-md"
                      placeholder="+1234567890"
                    />
                  </div>
                </div>
                <div className="flex gap-2 mt-6">
                  <button
                    onClick={() => setShowSaveModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                    disabled={saving}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveProposal}
                    disabled={saving || !clientInfo.name}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? 'Saving...' : 'Save'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {showPreviewForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Client Information</h3>
            <p className="text-sm text-gray-600 mb-4">
              Enter client details to personalize the proposal (optional). You can preview without entering information.
            </p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Client Name
                </label>
                <input
                  type="text"
                  value={clientInfo.name}
                  onChange={e => setClientInfo({ ...clientInfo, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Client Email
                </label>
                <input
                  type="email"
                  value={clientInfo.email}
                  onChange={e => setClientInfo({ ...clientInfo, email: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder="john@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Client Phone
                </label>
                <input
                  type="tel"
                  value={clientInfo.phone}
                  onChange={e => setClientInfo({ ...clientInfo, phone: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder="+1234567890"
                />
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <button
                onClick={() => setShowPreviewForm(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handlePreviewWithClientInfo}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Continue to Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {showPreview && (
        <ProposalPreview
          proposalData={enrichedProposalData}
          proposalType={normalizedProposalType}
          onClose={() => setShowPreview(false)}
          branding={branding || undefined}
          companyLogoUrl={userSettings?.company_logo_url}
          companyName={companyName}
          companyTagline={userSettings?.company_tagline}
          userName={userSettings?.user_name}
          companyAddress={userSettings?.company_address}
        />
      )}
    </>
  );
}
