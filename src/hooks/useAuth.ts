import { useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, Profile } from '../lib/supabase';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { 
  setLoading, 
  setError, 
  setAuthData, 
  setProfile, 
  clearAuth,
  updateProfile as updateProfileAction,
  setInitialized
} from '../store/authSlice';

export const useAuth = () => {
  const dispatch = useAppDispatch();
  const authState = useAppSelector(state => state.auth);

  useEffect(() => {
    let mounted = true;

    // Initialize auth state from Supabase
    const initializeAuth = async () => {
      try {
        dispatch(setLoading(false));
        dispatch(setError(null));

        // Get the current session (this checks localStorage automatically)
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Session error:', sessionError);
          if (mounted) {
            dispatch(setError(sessionError.message));
            dispatch(setLoading(false));
            dispatch(setInitialized(true));
          }
          return;
        }

        if (session?.user && mounted) {
          // User is authenticated, fetch their profile
          const profile = await fetchProfile(session.user.id);
          dispatch(setAuthData({
            user: session.user,
            session,
            profile
          }));
        } else if (mounted) {
          // No active session
          dispatch(clearAuth());
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        if (mounted) {
          dispatch(setError(error instanceof Error ? error.message : 'Authentication error'));
          dispatch(setLoading(false));
          dispatch(setInitialized(true));
        }
      }
    };

    // Only initialize if not already initialized
    if (!authState.initialized) {
      initializeAuth();
    }

    // Listen for auth changes (sign in, sign out, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change:', event, session?.user?.email);
        
        if (!mounted) return;

        if (event === 'SIGNED_IN' && session?.user) {
          const profile = await fetchProfile(session.user.id);
          dispatch(setAuthData({
            user: session.user,
            session,
            profile
          }));
        } else if (event === 'SIGNED_OUT' || event === 'USER_DELETED') {
          dispatch(clearAuth());
        } else if (event === 'TOKEN_REFRESHED' && session?.user) {
          // Update session but keep existing profile
          dispatch(setAuthData({
            user: session.user,
            session,
            profile: authState.profile
          }));
        } else if (event === 'PASSWORD_RECOVERY') {
          // Handle password recovery if needed
          dispatch(setLoading(false));
        }
      }
    );

    // Cleanup function
    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [dispatch, authState.initialized, authState.profile]);

  const fetchProfile = async (userId: string): Promise<Profile | null> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
  };

  const signUp = async (email: string, password: string, fullName?: string) => {
    try {
      dispatch(setError(null));
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName || email
          }
        }
      });

      if (error) {
        dispatch(setError(error.message));
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      dispatch(setError(errorMessage));
      return { success: false, error: errorMessage };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      dispatch(setError(null));
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        dispatch(setError(error.message));
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      dispatch(setError(errorMessage));
      return { success: false, error: errorMessage };
    }
  };

  const signOut = async () => {
    try {
      dispatch(setError(null));
      
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        dispatch(setError(error.message));
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      dispatch(setError(errorMessage));
      return { success: false, error: errorMessage };
    }
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    try {
      if (!authState.user) {
        throw new Error('No user logged in');
      }

      dispatch(setError(null));

      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', authState.user.id)
        .select()
        .single();

      if (error) {
        dispatch(setError(error.message));
        return { success: false, error: error.message };
      }

      dispatch(updateProfileAction(data));
      return { success: true, data };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      dispatch(setError(errorMessage));
      return { success: false, error: errorMessage };
    }
  };

  return {
    ...authState,
    signUp,
    signIn,
    signOut,
    updateProfile,
    isAuthenticated: !!authState.user && !!authState.session && authState.initialized
  };
};