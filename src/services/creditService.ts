import { supabase } from '../lib/supabase';

export interface CreditBalance {
  monthly_allowance: number;
  purchased_credits: number;
  total: number;
  subscription_tier: string | null;
}

export interface CheckoutRequest {
  type: 'subscription' | 'topup';
  tier?: 'basic' | 'professional' | 'premier';
  credits?: number;
}

export const creditService = {
  async getBalance(): Promise<CreditBalance | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('profiles')
        .select('monthly_allowance, purchased_credits, subscription_tier')
        .eq('id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching credit balance:', error);
        return null;
      }

      if (!data) {
        return {
          monthly_allowance: 0,
          purchased_credits: 0,
          total: 0,
          subscription_tier: null,
        };
      }

      return {
        ...data,
        total: data.monthly_allowance + data.purchased_credits,
      };
    } catch (error) {
      console.error('Error in getBalance:', error);
      return null;
    }
  },

  async createCheckoutSession(request: CheckoutRequest): Promise<{ url: string } | null> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('No active session');
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/stripe-checkout`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
            'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
          },
          body: JSON.stringify(request),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create checkout session');
      }

      const data = await response.json();
      return { url: data.url };
    } catch (error) {
      console.error('Error creating checkout session:', error);
      throw error;
    }
  },

  async callSolarApiGateway(
    address: string,
    apiKey: string,
    options?: {
      fetchDataLayers?: boolean;
      coordinates?: { lat: number; lng: number }
    }
  ) {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('No active session');
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/solar-api-gateway`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
            'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
          },
          body: JSON.stringify({
            address,
            apiKey,
            fetchDataLayers: options?.fetchDataLayers,
            coordinates: options?.coordinates
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 402) {
          throw new Error('INSUFFICIENT_CREDITS');
        }
        throw new Error(data.error || 'Failed to fetch solar data');
      }

      // Dispatch custom event to notify components that credits were used
      window.dispatchEvent(new CustomEvent('creditsUpdated'));

      return data;
    } catch (error) {
      console.error('Error calling solar API gateway:', error);
      throw error;
    }
  },
};
