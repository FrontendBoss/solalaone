import { useState, useEffect, useRef } from 'react';
import { Upload, Save, X, ChevronDown, Search } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

const CURRENCIES = [
  { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham' },
  { code: 'AFN', symbol: '؋', name: 'Afghan Afghani' },
  { code: 'ALL', symbol: 'L', name: 'Albanian Lek' },
  { code: 'AMD', symbol: '֏', name: 'Armenian Dram' },
  { code: 'ANG', symbol: 'ƒ', name: 'Netherlands Antillean Guilder' },
  { code: 'AOA', symbol: 'Kz', name: 'Angolan Kwanza' },
  { code: 'ARS', symbol: '$', name: 'Argentine Peso' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'AWG', symbol: 'ƒ', name: 'Aruban Florin' },
  { code: 'AZN', symbol: '₼', name: 'Azerbaijani Manat' },
  { code: 'BAM', symbol: 'KM', name: 'Bosnia-Herzegovina Convertible Mark' },
  { code: 'BBD', symbol: '$', name: 'Barbadian Dollar' },
  { code: 'BDT', symbol: '৳', name: 'Bangladeshi Taka' },
  { code: 'BGN', symbol: 'лв', name: 'Bulgarian Lev' },
  { code: 'BHD', symbol: '.د.ب', name: 'Bahraini Dinar' },
  { code: 'BIF', symbol: 'FBu', name: 'Burundian Franc' },
  { code: 'BMD', symbol: '$', name: 'Bermudan Dollar' },
  { code: 'BND', symbol: '$', name: 'Brunei Dollar' },
  { code: 'BOB', symbol: 'Bs.', name: 'Bolivian Boliviano' },
  { code: 'BRL', symbol: 'R$', name: 'Brazilian Real' },
  { code: 'BSD', symbol: '$', name: 'Bahamian Dollar' },
  { code: 'BTN', symbol: 'Nu.', name: 'Bhutanese Ngultrum' },
  { code: 'BWP', symbol: 'P', name: 'Botswanan Pula' },
  { code: 'BYN', symbol: 'Br', name: 'Belarusian Ruble' },
  { code: 'BZD', symbol: 'BZ$', name: 'Belize Dollar' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  { code: 'CDF', symbol: 'FC', name: 'Congolese Franc' },
  { code: 'CHF', symbol: 'CHF', name: 'Swiss Franc' },
  { code: 'CLP', symbol: '$', name: 'Chilean Peso' },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan' },
  { code: 'COP', symbol: '$', name: 'Colombian Peso' },
  { code: 'CRC', symbol: '₡', name: 'Costa Rican Colón' },
  { code: 'CUP', symbol: '₱', name: 'Cuban Peso' },
  { code: 'CVE', symbol: '$', name: 'Cape Verdean Escudo' },
  { code: 'CZK', symbol: 'Kč', name: 'Czech Republic Koruna' },
  { code: 'DJF', symbol: 'Fdj', name: 'Djiboutian Franc' },
  { code: 'DKK', symbol: 'kr', name: 'Danish Krone' },
  { code: 'DOP', symbol: 'RD$', name: 'Dominican Peso' },
  { code: 'DZD', symbol: 'دج', name: 'Algerian Dinar' },
  { code: 'EGP', symbol: '£', name: 'Egyptian Pound' },
  { code: 'ERN', symbol: 'Nfk', name: 'Eritrean Nakfa' },
  { code: 'ETB', symbol: 'Br', name: 'Ethiopian Birr' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'FJD', symbol: '$', name: 'Fijian Dollar' },
  { code: 'FKP', symbol: '£', name: 'Falkland Islands Pound' },
  { code: 'GBP', symbol: '£', name: 'British Pound Sterling' },
  { code: 'GEL', symbol: '₾', name: 'Georgian Lari' },
  { code: 'GHS', symbol: '₵', name: 'Ghanaian Cedi' },
  { code: 'GIP', symbol: '£', name: 'Gibraltar Pound' },
  { code: 'GMD', symbol: 'D', name: 'Gambian Dalasi' },
  { code: 'GNF', symbol: 'FG', name: 'Guinean Franc' },
  { code: 'GTQ', symbol: 'Q', name: 'Guatemalan Quetzal' },
  { code: 'GYD', symbol: '$', name: 'Guyanaese Dollar' },
  { code: 'HKD', symbol: 'HK$', name: 'Hong Kong Dollar' },
  { code: 'HNL', symbol: 'L', name: 'Honduran Lempira' },
  { code: 'HRK', symbol: 'kn', name: 'Croatian Kuna' },
  { code: 'HTG', symbol: 'G', name: 'Haitian Gourde' },
  { code: 'HUF', symbol: 'Ft', name: 'Hungarian Forint' },
  { code: 'IDR', symbol: 'Rp', name: 'Indonesian Rupiah' },
  { code: 'ILS', symbol: '₪', name: 'Israeli New Sheqel' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'IQD', symbol: 'ع.د', name: 'Iraqi Dinar' },
  { code: 'IRR', symbol: '﷼', name: 'Iranian Rial' },
  { code: 'ISK', symbol: 'kr', name: 'Icelandic Króna' },
  { code: 'JMD', symbol: 'J$', name: 'Jamaican Dollar' },
  { code: 'JOD', symbol: 'JD', name: 'Jordanian Dinar' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'KES', symbol: 'KSh', name: 'Kenyan Shilling' },
  { code: 'KGS', symbol: 'лв', name: 'Kyrgystani Som' },
  { code: 'KHR', symbol: '៛', name: 'Cambodian Riel' },
  { code: 'KMF', symbol: 'CF', name: 'Comorian Franc' },
  { code: 'KPW', symbol: '₩', name: 'North Korean Won' },
  { code: 'KRW', symbol: '₩', name: 'South Korean Won' },
  { code: 'KWD', symbol: 'KD', name: 'Kuwaiti Dinar' },
  { code: 'KYD', symbol: '$', name: 'Cayman Islands Dollar' },
  { code: 'KZT', symbol: '₸', name: 'Kazakhstani Tenge' },
  { code: 'LAK', symbol: '₭', name: 'Laotian Kip' },
  { code: 'LBP', symbol: '£', name: 'Lebanese Pound' },
  { code: 'LKR', symbol: '₨', name: 'Sri Lankan Rupee' },
  { code: 'LRD', symbol: '$', name: 'Liberian Dollar' },
  { code: 'LSL', symbol: 'M', name: 'Lesotho Loti' },
  { code: 'LYD', symbol: 'LD', name: 'Libyan Dinar' },
  { code: 'MAD', symbol: 'MAD', name: 'Moroccan Dirham' },
  { code: 'MDL', symbol: 'lei', name: 'Moldovan Leu' },
  { code: 'MGA', symbol: 'Ar', name: 'Malagasy Ariary' },
  { code: 'MKD', symbol: 'ден', name: 'Macedonian Denar' },
  { code: 'MMK', symbol: 'K', name: 'Myanma Kyat' },
  { code: 'MNT', symbol: '₮', name: 'Mongolian Tugrik' },
  { code: 'MOP', symbol: 'MOP$', name: 'Macanese Pataca' },
  { code: 'MRU', symbol: 'UM', name: 'Mauritanian Ouguiya' },
  { code: 'MUR', symbol: '₨', name: 'Mauritian Rupee' },
  { code: 'MVR', symbol: 'Rf', name: 'Maldivian Rufiyaa' },
  { code: 'MWK', symbol: 'MK', name: 'Malawian Kwacha' },
  { code: 'MXN', symbol: '$', name: 'Mexican Peso' },
  { code: 'MYR', symbol: 'RM', name: 'Malaysian Ringgit' },
  { code: 'MZN', symbol: 'MT', name: 'Mozambican Metical' },
  { code: 'NAD', symbol: '$', name: 'Namibian Dollar' },
  { code: 'NGN', symbol: '₦', name: 'Nigerian Naira' },
  { code: 'NIO', symbol: 'C$', name: 'Nicaraguan Córdoba' },
  { code: 'NOK', symbol: 'kr', name: 'Norwegian Krone' },
  { code: 'NPR', symbol: '₨', name: 'Nepalese Rupee' },
  { code: 'NZD', symbol: 'NZ$', name: 'New Zealand Dollar' },
  { code: 'OMR', symbol: '﷼', name: 'Omani Rial' },
  { code: 'PAB', symbol: 'B/.', name: 'Panamanian Balboa' },
  { code: 'PEN', symbol: 'S/.', name: 'Peruvian Nuevo Sol' },
  { code: 'PGK', symbol: 'K', name: 'Papua New Guinean Kina' },
  { code: 'PHP', symbol: '₱', name: 'Philippine Peso' },
  { code: 'PKR', symbol: '₨', name: 'Pakistani Rupee' },
  { code: 'PLN', symbol: 'zł', name: 'Polish Zloty' },
  { code: 'PYG', symbol: 'Gs', name: 'Paraguayan Guarani' },
  { code: 'QAR', symbol: '﷼', name: 'Qatari Rial' },
  { code: 'RON', symbol: 'lei', name: 'Romanian Leu' },
  { code: 'RSD', symbol: 'Дин.', name: 'Serbian Dinar' },
  { code: 'RUB', symbol: '₽', name: 'Russian Ruble' },
  { code: 'RWF', symbol: 'R₣', name: 'Rwandan Franc' },
  { code: 'SAR', symbol: '﷼', name: 'Saudi Riyal' },
  { code: 'SBD', symbol: '$', name: 'Solomon Islands Dollar' },
  { code: 'SCR', symbol: '₨', name: 'Seychellois Rupee' },
  { code: 'SDG', symbol: 'ج.س.', name: 'Sudanese Pound' },
  { code: 'SEK', symbol: 'kr', name: 'Swedish Krona' },
  { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar' },
  { code: 'SHP', symbol: '£', name: 'Saint Helena Pound' },
  { code: 'SLL', symbol: 'Le', name: 'Sierra Leonean Leone' },
  { code: 'SOS', symbol: 'S', name: 'Somali Shilling' },
  { code: 'SRD', symbol: '$', name: 'Surinamese Dollar' },
  { code: 'SSP', symbol: '£', name: 'South Sudanese Pound' },
  { code: 'STN', symbol: 'Db', name: 'São Tomé and Príncipe Dobra' },
  { code: 'SYP', symbol: '£', name: 'Syrian Pound' },
  { code: 'SZL', symbol: 'E', name: 'Swazi Lilangeni' },
  { code: 'THB', symbol: '฿', name: 'Thai Baht' },
  { code: 'TJS', symbol: 'SM', name: 'Tajikistani Somoni' },
  { code: 'TMT', symbol: 'T', name: 'Turkmenistani Manat' },
  { code: 'TND', symbol: 'د.ت', name: 'Tunisian Dinar' },
  { code: 'TOP', symbol: 'T$', name: 'Tongan Paʻanga' },
  { code: 'TRY', symbol: '₺', name: 'Turkish Lira' },
  { code: 'TTD', symbol: 'TT$', name: 'Trinidad and Tobago Dollar' },
  { code: 'TWD', symbol: 'NT$', name: 'New Taiwan Dollar' },
  { code: 'TZS', symbol: 'TSh', name: 'Tanzanian Shilling' },
  { code: 'UAH', symbol: '₴', name: 'Ukrainian Hryvnia' },
  { code: 'UGX', symbol: 'USh', name: 'Ugandan Shilling' },
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'UYU', symbol: '$U', name: 'Uruguayan Peso' },
  { code: 'UZS', symbol: 'лв', name: 'Uzbekistan Som' },
  { code: 'VES', symbol: 'Bs.', name: 'Venezuelan Bolívar' },
  { code: 'VND', symbol: '₫', name: 'Vietnamese Dong' },
  { code: 'VUV', symbol: 'VT', name: 'Vanuatu Vatu' },
  { code: 'WST', symbol: 'WS$', name: 'Samoan Tala' },
  { code: 'XAF', symbol: 'FCFA', name: 'CFA Franc BEAC' },
  { code: 'XCD', symbol: '$', name: 'East Caribbean Dollar' },
  { code: 'XOF', symbol: 'CFA', name: 'CFA Franc BCEAO' },
  { code: 'XPF', symbol: '₣', name: 'CFP Franc' },
  { code: 'YER', symbol: '﷼', name: 'Yemeni Rial' },
  { code: 'ZAR', symbol: 'R', name: 'South African Rand' },
  { code: 'ZMW', symbol: 'ZK', name: 'Zambian Kwacha' },
  { code: 'ZWL', symbol: '$', name: 'Zimbabwean Dollar' },
];

interface UserSettings {
  currency: string;
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

interface SettingsProps {
  onClose: () => void;
}

export default function Settings({ onClose }: SettingsProps) {
  const { user, refreshInstaller } = useAuth();
  const [settings, setSettings] = useState<UserSettings>({
    currency: 'USD',
    company_logo_url: null,
    company_name: null,
    user_name: null,
    company_address: null,
    company_tagline: null,
    default_solar_panel_price: 180,
    default_battery_price: 250,
    default_inverter_per_kw_price: 250,
    default_charge_controller_price: 350,
    default_dc_breaker_price: 25,
    default_ac_breaker_price: 30,
    default_installation_percentage: 0.2,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [currencySearch, setCurrencySearch] = useState('');
  const [currencyDropdownOpen, setCurrencyDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setCurrencyDropdownOpen(false);
        setCurrencySearch('');
      }
    };

    if (currencyDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [currencyDropdownOpen]);

  const loadSettings = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_settings')
        .select('currency, company_logo_url, company_name, user_name, company_address, company_tagline, default_solar_panel_price, default_battery_price, default_inverter_per_kw_price, default_charge_controller_price, default_dc_breaker_price, default_ac_breaker_price, default_installation_percentage')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setSettings(data);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      setMessage({ type: 'error', text: 'Failed to load settings' });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    if (!user) return;

    setSaving(true);
    setMessage(null);

    try {
      const { error } = await supabase
        .from('user_settings')
        .upsert({
          user_id: user.id,
          currency: settings.currency,
          company_logo_url: settings.company_logo_url,
          company_name: settings.company_name,
          user_name: settings.user_name,
          company_address: settings.company_address,
          company_tagline: settings.company_tagline,
          default_solar_panel_price: settings.default_solar_panel_price,
          default_battery_price: settings.default_battery_price,
          default_inverter_per_kw_price: settings.default_inverter_per_kw_price,
          default_charge_controller_price: settings.default_charge_controller_price,
          default_dc_breaker_price: settings.default_dc_breaker_price,
          default_ac_breaker_price: settings.default_ac_breaker_price,
          default_installation_percentage: settings.default_installation_percentage,
        }, {
          onConflict: 'user_id',
        });

      if (error) throw error;

      await refreshInstaller();
      setMessage({ type: 'success', text: 'Settings saved successfully!' });
    } catch (error) {
      console.error('Error saving settings:', error);
      setMessage({ type: 'error', text: 'Failed to save settings' });
    } finally {
      setSaving(false);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (!file.type.startsWith('image/')) {
      setMessage({ type: 'error', text: 'Please upload an image file' });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'File size must be less than 5MB' });
      return;
    }

    setUploading(true);
    setMessage(null);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/logo.${fileExt}`;

      if (settings.company_logo_url) {
        const oldPath = settings.company_logo_url.split('/').pop();
        if (oldPath) {
          await supabase.storage
            .from('company-logos')
            .remove([`${user.id}/${oldPath}`]);
        }
      }

      const { error: uploadError } = await supabase.storage
        .from('company-logos')
        .upload(fileName, file, {
          upsert: true,
          contentType: file.type,
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('company-logos')
        .getPublicUrl(fileName);

      const { error: updateError } = await supabase
        .from('user_settings')
        .upsert({
          user_id: user.id,
          company_logo_url: publicUrl,
        }, {
          onConflict: 'user_id',
        });

      if (updateError) throw updateError;

      setSettings(prev => ({ ...prev, company_logo_url: publicUrl }));
      await refreshInstaller();
      setMessage({ type: 'success', text: 'Logo uploaded successfully!' });
    } catch (error) {
      console.error('Error uploading logo:', error);
      setMessage({ type: 'error', text: 'Failed to upload logo' });
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveLogo = async () => {
    if (!user || !settings.company_logo_url) return;

    setUploading(true);
    setMessage(null);

    try {
      const path = settings.company_logo_url.split('/').slice(-2).join('/');
      const { error } = await supabase.storage
        .from('company-logos')
        .remove([path]);

      if (error) throw error;

      const { error: updateError } = await supabase
        .from('user_settings')
        .upsert({
          user_id: user.id,
          company_logo_url: null,
        }, {
          onConflict: 'user_id',
        });

      if (updateError) throw updateError;

      setSettings(prev => ({ ...prev, company_logo_url: null }));
      await refreshInstaller();
      setMessage({ type: 'success', text: 'Logo removed successfully!' });
    } catch (error) {
      console.error('Error removing logo:', error);
      setMessage({ type: 'error', text: 'Failed to remove logo' });
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Settings</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {message && (
            <div
              className={`p-4 rounded-md ${
                message.type === 'success'
                  ? 'bg-green-50 text-green-800 border border-green-200'
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}
            >
              {message.text}
            </div>
          )}

          <div className="relative" ref={dropdownRef}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Default Currency
            </label>

            <button
              type="button"
              onClick={() => setCurrencyDropdownOpen(!currencyDropdownOpen)}
              className="w-full px-4 py-3 border border-gray-300 rounded-md bg-white hover:bg-gray-50 transition-colors focus:ring-2 focus:ring-blue-500 focus:border-transparent flex items-center justify-between"
            >
              <span className="flex items-center gap-2">
                <span className="text-lg font-semibold">
                  {CURRENCIES.find(c => c.code === settings.currency)?.symbol}
                </span>
                <span className="font-medium">
                  {settings.currency}
                </span>
                <span className="text-gray-600">
                  - {CURRENCIES.find(c => c.code === settings.currency)?.name}
                </span>
              </span>
              <ChevronDown
                size={20}
                className={`text-gray-400 transition-transform ${currencyDropdownOpen ? 'rotate-180' : ''}`}
              />
            </button>

            {currencyDropdownOpen && (
              <div className="absolute z-10 mt-2 w-full bg-white border border-gray-300 rounded-md shadow-lg">
                <div className="p-3 border-b border-gray-200">
                  <div className="relative">
                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search currencies..."
                      value={currencySearch}
                      onChange={e => setCurrencySearch(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      autoFocus
                    />
                  </div>
                </div>

                <div className="max-h-80 overflow-y-auto">
                  {CURRENCIES.filter(currency =>
                    currencySearch === '' ||
                    currency.code.toLowerCase().includes(currencySearch.toLowerCase()) ||
                    currency.name.toLowerCase().includes(currencySearch.toLowerCase()) ||
                    currency.symbol.includes(currencySearch)
                  ).map(currency => (
                    <button
                      key={currency.code}
                      type="button"
                      onClick={() => {
                        setSettings(prev => ({ ...prev, currency: currency.code }));
                        setCurrencyDropdownOpen(false);
                        setCurrencySearch('');
                      }}
                      className={`w-full px-4 py-3 text-left hover:bg-blue-50 transition-colors flex items-center gap-3 ${
                        settings.currency === currency.code ? 'bg-blue-100' : ''
                      }`}
                    >
                      <span className="text-lg font-semibold w-8">{currency.symbol}</span>
                      <span className="font-medium w-12">{currency.code}</span>
                      <span className="text-gray-600 flex-1">{currency.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <p className="mt-2 text-sm text-gray-500">
              This currency will be used for all cost calculations and estimates
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Company Logo
            </label>

            {settings.company_logo_url ? (
              <div className="space-y-4">
                <div className="border border-gray-300 rounded-md p-4 flex items-center justify-center bg-gray-50">
                  <img
                    src={settings.company_logo_url}
                    alt="Company logo"
                    className="max-h-32 max-w-full object-contain"
                  />
                </div>
                <button
                  onClick={handleRemoveLogo}
                  disabled={uploading}
                  className="w-full px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <X size={18} />
                  Remove Logo
                </button>
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-300 rounded-md p-8 text-center hover:border-gray-400 transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  disabled={uploading}
                  className="hidden"
                  id="logo-upload"
                />
                <label
                  htmlFor="logo-upload"
                  className="cursor-pointer flex flex-col items-center gap-2"
                >
                  <Upload size={40} className="text-gray-400" />
                  <span className="text-sm font-medium text-gray-700">
                    {uploading ? 'Uploading...' : 'Click to upload logo'}
                  </span>
                  <span className="text-xs text-gray-500">
                    PNG, JPG, GIF up to 5MB
                  </span>
                </label>
              </div>
            )}
            <p className="mt-2 text-sm text-gray-500">
              Your company logo will appear on exported proposals and reports
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Company Name
            </label>
            <input
              type="text"
              value={settings.company_name || ''}
              onChange={e => setSettings(prev => ({ ...prev, company_name: e.target.value || null }))}
              placeholder="Enter your company name"
              className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Name
            </label>
            <input
              type="text"
              value={settings.user_name || ''}
              onChange={e => setSettings(prev => ({ ...prev, user_name: e.target.value || null }))}
              placeholder="Enter your name"
              className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Company Address
            </label>
            <textarea
              value={settings.company_address || ''}
              onChange={e => setSettings(prev => ({ ...prev, company_address: e.target.value || null }))}
              placeholder="Enter your company address"
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Company Motto or Tagline
            </label>
            <input
              type="text"
              value={settings.company_tagline || ''}
              onChange={e => setSettings(prev => ({ ...prev, company_tagline: e.target.value || null }))}
              placeholder="Enter your company motto or tagline"
              className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="mt-2 text-sm text-gray-500">
              This information will appear on exported proposals and reports
            </p>
          </div>

          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Default Component Prices</h3>
            <p className="text-sm text-gray-600 mb-4">
              Set your default prices for each component in your selected currency ({CURRENCIES.find(c => c.code === settings.currency)?.symbol}). These will be used as starting values in cost calculations.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Solar Panel (400W)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                    {CURRENCIES.find(c => c.code === settings.currency)?.symbol}
                  </span>
                  <input
                    type="number"
                    value={settings.default_solar_panel_price}
                    onChange={e => setSettings(prev => ({ ...prev, default_solar_panel_price: parseFloat(e.target.value) || 0 }))}
                    className="w-full pl-12 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    step="0.01"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Battery (200Ah, 12V)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                    {CURRENCIES.find(c => c.code === settings.currency)?.symbol}
                  </span>
                  <input
                    type="number"
                    value={settings.default_battery_price}
                    onChange={e => setSettings(prev => ({ ...prev, default_battery_price: parseFloat(e.target.value) || 0 }))}
                    className="w-full pl-12 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    step="0.01"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Inverter (per kW)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                    {CURRENCIES.find(c => c.code === settings.currency)?.symbol}
                  </span>
                  <input
                    type="number"
                    value={settings.default_inverter_per_kw_price}
                    onChange={e => setSettings(prev => ({ ...prev, default_inverter_per_kw_price: parseFloat(e.target.value) || 0 }))}
                    className="w-full pl-12 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    step="0.01"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Charge Controller</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                    {CURRENCIES.find(c => c.code === settings.currency)?.symbol}
                  </span>
                  <input
                    type="number"
                    value={settings.default_charge_controller_price}
                    onChange={e => setSettings(prev => ({ ...prev, default_charge_controller_price: parseFloat(e.target.value) || 0 }))}
                    className="w-full pl-12 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    step="0.01"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">DC Breaker</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                    {CURRENCIES.find(c => c.code === settings.currency)?.symbol}
                  </span>
                  <input
                    type="number"
                    value={settings.default_dc_breaker_price}
                    onChange={e => setSettings(prev => ({ ...prev, default_dc_breaker_price: parseFloat(e.target.value) || 0 }))}
                    className="w-full pl-12 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    step="0.01"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">AC Breaker</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                    {CURRENCIES.find(c => c.code === settings.currency)?.symbol}
                  </span>
                  <input
                    type="number"
                    value={settings.default_ac_breaker_price}
                    onChange={e => setSettings(prev => ({ ...prev, default_ac_breaker_price: parseFloat(e.target.value) || 0 }))}
                    className="w-full pl-12 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    step="0.01"
                  />
                </div>
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Installation & BOS (%)</label>
                <div className="relative">
                  <input
                    type="number"
                    value={settings.default_installation_percentage * 100}
                    onChange={e => setSettings(prev => ({ ...prev, default_installation_percentage: (parseFloat(e.target.value) || 0) / 100 }))}
                    className="w-full pr-12 pl-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    step="0.1"
                    min="0"
                    max="100"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">%</span>
                </div>
                <p className="mt-1 text-xs text-gray-500">Default: 20% (0.2)</p>
              </div>
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 bg-gray-50 px-6 py-4 flex gap-3 justify-end border-t">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSaveSettings}
            disabled={saving}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Save size={18} />
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>
    </div>
  );
}
