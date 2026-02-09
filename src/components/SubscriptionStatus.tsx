import React, { useEffect, useState } from 'react';
import { Crown, Settings } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';

interface SubscriptionInfo {
  planName: string;
  status: string;
  nextBilling?: string;
}

export function SubscriptionStatus() {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<SubscriptionInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchSubscription = async () => {
      try {
        // Check profiles table for subscription info
        const { data: profile } = await supabase
          .from('profiles')
          .select('subscription_tier')
          .eq('id', user.id)
          .single();

        if (profile?.subscription_tier) {
          setSubscription({
            planName: profile.subscription_tier,
            status: 'active'
          });
        } else {
          setSubscription({
            planName: 'Free',
            status: 'inactive'
          });
        }
      } catch (error) {
        console.error('Error fetching subscription:', error);
        setSubscription({
          planName: 'Free',
          status: 'inactive'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSubscription();
  }, [user]);

  if (loading || !subscription) {
    return null;
  }

  const isPaid = subscription.status === 'active' && subscription.planName !== 'Free';

  return (
    <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
      isPaid 
        ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' 
        : 'bg-gray-100 text-gray-600 border border-gray-200'
    }`}>
      {isPaid && <Crown className="w-4 h-4 mr-1" />}
      <span className="capitalize">{subscription.planName}</span>
      {subscription.planName === 'Free' && (
        <Settings className="w-4 h-4 ml-1" />
      )}
    </div>
  );
}