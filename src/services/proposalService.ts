import { supabase, Proposal } from '../lib/supabase';

export const saveProposal = async (
  installerId: string,
  clientName: string,
  proposalType: 'calculator' | 'cost' | 'budget',
  proposalData: any,
  systemSize?: number,
  totalCost?: number,
  clientEmail?: string,
  clientPhone?: string
): Promise<Proposal> => {
  const { data, error } = await supabase
    .from('proposals')
    .insert({
      installer_id: installerId,
      client_name: clientName,
      client_email: clientEmail,
      client_phone: clientPhone,
      proposal_type: proposalType,
      proposal_data: proposalData,
      system_size: systemSize,
      total_cost: totalCost,
      status: 'draft',
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateProposal = async (
  proposalId: string,
  updates: Partial<Proposal>
): Promise<Proposal> => {
  const { data, error } = await supabase
    .from('proposals')
    .update(updates)
    .eq('id', proposalId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deleteProposal = async (proposalId: string): Promise<void> => {
  const { error } = await supabase.from('proposals').delete().eq('id', proposalId);

  if (error) throw error;
};

export const getProposals = async (installerId: string): Promise<Proposal[]> => {
  const { data, error } = await supabase
    .from('proposals')
    .select('*')
    .eq('installer_id', installerId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
};

export const getProposal = async (proposalId: string): Promise<Proposal | null> => {
  const { data, error } = await supabase
    .from('proposals')
    .select('*')
    .eq('id', proposalId)
    .maybeSingle();

  if (error) throw error;
  return data;
};
