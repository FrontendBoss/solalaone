import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Installer {
  id: string;
  email: string;
  company_name: string;
  full_name: string;
  phone?: string;
  address?: string;
  created_at: string;
  updated_at: string;
}

export interface InstallerBranding {
  id: string;
  installer_id: string;
  logo_url?: string;
  primary_color: string;
  secondary_color: string;
  company_tagline?: string;
  website?: string;
  created_at: string;
  updated_at: string;
}

export interface Proposal {
  id: string;
  installer_id: string;
  client_name: string;
  client_email?: string;
  client_phone?: string;
  proposal_type: 'calculator' | 'cost' | 'budget';
  proposal_data: any;
  system_size?: number;
  total_cost?: number;
  status: 'draft' | 'sent' | 'accepted' | 'rejected';
  created_at: string;
  updated_at: string;
}
