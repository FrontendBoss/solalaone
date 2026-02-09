import { createContext, useContext, useEffect, useState } from 'react';
import { supabase, Installer, InstallerBranding } from '../lib/supabase';
import type { User } from '@supabase/supabase-js';

interface UserSettings {
  company_logo_url: string | null;
  company_name: string | null;
  user_name: string | null;
  company_address: string | null;
  company_tagline: string | null;
  default_solar_panel_price: number;
  default_battery_price: number;
  default_inverter_per_kw_price: number;
  default_charge_controller_price: number;
  default_dc_breaker_price: number;
  default_ac_breaker_price: number;
  default_installation_percentage: number;
}

interface AuthContextType {
  user: User | null;
  installer: Installer | null;
  branding: InstallerBranding | null;
  userSettings: UserSettings | null;
  loading: boolean;
  signUp: (email: string, password: string, companyName: string, fullName: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateBranding: (branding: Partial<InstallerBranding>) => Promise<void>;
  refreshInstaller: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [installer, setInstaller] = useState<Installer | null>(null);
  const [branding, setBranding] = useState<InstallerBranding | null>(null);
  const [userSettings, setUserSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchInstaller = async (userId: string) => {
    const { data: installerData } = await supabase
      .from('installers')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (installerData) {
      setInstaller(installerData);

      const { data: brandingData } = await supabase
        .from('installer_branding')
        .select('*')
        .eq('installer_id', userId)
        .maybeSingle();

      setBranding(brandingData);

      const { data: settingsData } = await supabase
        .from('user_settings')
        .select('company_logo_url, company_name, user_name, company_address, company_tagline, default_solar_panel_price, default_battery_price, default_inverter_per_kw_price, default_charge_controller_price, default_dc_breaker_price, default_ac_breaker_price, default_installation_percentage')
        .eq('user_id', userId)
        .maybeSingle();

      setUserSettings(settingsData);
    }
  };

  const refreshInstaller = async () => {
    if (user) {
      await fetchInstaller(user.id);
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchInstaller(session.user.id).finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchInstaller(session.user.id);
      } else {
        setInstaller(null);
        setBranding(null);
        setUserSettings(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, companyName: string, fullName: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) throw error;

    if (data.user) {
      const { error: installerError } = await supabase.from('installers').insert({
        id: data.user.id,
        email,
        company_name: companyName,
        full_name: fullName,
      });

      if (installerError) throw installerError;

      const { error: brandingError } = await supabase.from('installer_branding').insert({
        installer_id: data.user.id,
      });

      if (brandingError) throw brandingError;

      await fetchInstaller(data.user.id);
    }
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setInstaller(null);
    setBranding(null);
    setUserSettings(null);
  };

  const updateBranding = async (updates: Partial<InstallerBranding>) => {
    if (!user) throw new Error('Not authenticated');

    const { error } = await supabase
      .from('installer_branding')
      .update(updates)
      .eq('installer_id', user.id);

    if (error) throw error;

    await fetchInstaller(user.id);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        installer,
        branding,
        userSettings,
        loading,
        signUp,
        signIn,
        signOut,
        updateBranding,
        refreshInstaller,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
