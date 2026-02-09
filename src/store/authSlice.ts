import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { User, Session } from '@supabase/supabase-js';
import { Profile } from '../lib/supabase';

interface AuthState {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  loading: boolean;
  error: string | null;
  initialized: boolean; // Track if auth has been initialized
}

const initialState: AuthState = {
  user: null,
  profile: null,
  session: null,
  loading: true,
  error: null,
  initialized: false
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    
    setInitialized: (state, action: PayloadAction<boolean>) => {
      state.initialized = action.payload;
    },
    
    setAuthData: (state, action: PayloadAction<{
      user: User | null;
      session: Session | null;
      profile?: Profile | null;
    }>) => {
      state.user = action.payload.user;
      state.session = action.payload.session;
      if (action.payload.profile !== undefined) {
        state.profile = action.payload.profile;
      }
      state.loading = false;
      state.error = null;
      state.initialized = true;
    },
    
    setProfile: (state, action: PayloadAction<Profile | null>) => {
      state.profile = action.payload;
    },
    
    clearAuth: (state) => {
      state.user = null;
      state.profile = null;
      state.session = null;
      state.loading = false;
      state.error = null;
      state.initialized = true;
    },
    
    updateProfile: (state, action: PayloadAction<Partial<Profile>>) => {
      if (state.profile) {
        state.profile = { ...state.profile, ...action.payload };
      }
    }
  }
});

export const {
  setLoading,
  setError,
  setInitialized,
  setAuthData,
  setProfile,
  clearAuth,
  updateProfile
} = authSlice.actions;

export default authSlice.reducer;