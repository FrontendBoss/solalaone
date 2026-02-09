import { useState, useEffect } from 'react';
import { FileText, Trash2, Eye, Calendar, DollarSign, FolderOpen } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getProposals, deleteProposal } from '../services/proposalService';
import { Proposal } from '../lib/supabase';

interface ProposalsListProps {
  onLoadProposal: (proposal: Proposal) => void;
}

export default function ProposalsList({ onLoadProposal }: ProposalsListProps) {
  const { user } = useAuth();
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProposals = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setError(null);
      const data = await getProposals(user.id);
      setProposals(data);
    } catch (error) {
      console.error('Error loading proposals:', error);
      setError('Failed to load proposals. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProposals();
  }, [user?.id]);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this proposal?')) return;

    try {
      await deleteProposal(id);
      setProposals(proposals.filter(p => p.id !== id));
    } catch (error) {
      console.error('Error deleting proposal:', error);
      alert('Failed to delete proposal');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent':
        return 'bg-blue-100 text-blue-800';
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Saved Proposals</h2>
          <span className="text-sm text-gray-600">{proposals.length} proposals</span>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
            <p>{error}</p>
            <button
              onClick={loadProposals}
              className="mt-2 text-sm underline hover:no-underline"
            >
              Try again
            </button>
          </div>
        )}

        {proposals.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="mx-auto text-gray-400 mb-4" size={48} />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No proposals yet</h3>
            <p className="text-gray-600">
              Create and save proposals from the calculator, cost, or budget tabs
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {proposals.map(proposal => (
              <div
                key={proposal.id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">{proposal.client_name}</h3>
                    <span
                      className={`inline-block px-2 py-1 rounded text-xs font-medium ${getStatusColor(
                        proposal.status
                      )}`}
                    >
                      {proposal.status}
                    </span>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => onLoadProposal(proposal)}
                      className="text-blue-600 hover:text-blue-700 p-1"
                      title="Load proposal"
                    >
                      <FolderOpen size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(proposal.id)}
                      className="text-red-600 hover:text-red-700 p-1"
                      title="Delete proposal"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <div className="space-y-2 text-sm text-gray-600">
                  {proposal.client_email && (
                    <div className="truncate">{proposal.client_email}</div>
                  )}
                  {proposal.client_phone && <div>{proposal.client_phone}</div>}

                  <div className="flex items-center gap-4 pt-2 border-t">
                    {proposal.system_size && (
                      <div className="flex items-center gap-1">
                        <Eye size={14} />
                        <span>{proposal.system_size} kW</span>
                      </div>
                    )}
                    {proposal.total_cost && (
                      <div className="flex items-center gap-1">
                        <DollarSign size={14} />
                        <span>${proposal.total_cost.toLocaleString()}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-1 text-xs text-gray-500 pt-2">
                    <Calendar size={12} />
                    <span>{new Date(proposal.created_at).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t">
                  <span className="inline-block px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium">
                    {proposal.proposal_type}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
