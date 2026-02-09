import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';

export default function Success() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/');
    }, 5000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center px-4">
      <div className="bg-white rounded-3xl shadow-2xl p-12 max-w-md w-full text-center">
        <div className="mb-6 flex justify-center">
          <CheckCircle className="w-24 h-24 text-green-500" />
        </div>
        <h1 className="text-3xl font-bold text-slate-800 mb-4">
          Payment Successful!
        </h1>
        <p className="text-slate-600 mb-8">
          Your payment has been processed successfully. Your credits have been added to your account.
        </p>
        {sessionId && (
          <p className="text-xs text-slate-400 mb-6">
            Session ID: {sessionId.substring(0, 20)}...
          </p>
        )}
        <button
          onClick={() => navigate('/')}
          className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all"
        >
          Design View
        </button>
        <p className="text-sm text-slate-500 mt-4">
          Redirecting automatically in 5 seconds...
        </p>
      </div>
    </div>
  );
}
