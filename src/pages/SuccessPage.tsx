import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, Loader2, ArrowRight } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export function SuccessPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [subscriptionDetails, setSubscriptionDetails] = useState<any>(null);

  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    
    if (!sessionId || !user) {
      navigate('/');
      return;
    }

    // Simulate loading time for subscription activation
    const timer = setTimeout(() => {
      setIsLoading(false);
      setSubscriptionDetails({
        planName: 'Professional', // This would come from the webhook/session
        nextBilling: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()
      });
    }, 2000);

    return () => clearTimeout(timer);
  }, [searchParams, user, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Activating your subscription...
          </h2>
          <p className="text-gray-600">
            Please wait while we set up your account.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-6" />
        
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Welcome to SolalaSolar!
        </h1>
        
        <p className="text-gray-600 mb-6">
          Your subscription has been successfully activated. You now have access to all the features of your plan.
        </p>

        {subscriptionDetails && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-gray-900 mb-2">Subscription Details</h3>
            <p className="text-sm text-gray-600">
              Plan: <span className="font-medium">{subscriptionDetails.planName}</span>
            </p>
            <p className="text-sm text-gray-600">
              Next billing: <span className="font-medium">{subscriptionDetails.nextBilling}</span>
            </p>
          </div>
        )}

        <div className="space-y-3">
          <button
            onClick={() => navigate('/dashboard')}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center"
          >
            Design View
            <ArrowRight className="w-4 h-4 ml-2" />
          </button>
          
          <button
            onClick={() => navigate('/calculator')}
            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
          >
            Start Creating Proposals
          </button>
        </div>

        <p className="text-xs text-gray-500 mt-6">
          Need help getting started? Check out our{' '}
          <a href="#" className="text-blue-600 hover:underline">
            quick start guide
          </a>
        </p>
      </div>
    </div>
  );
}