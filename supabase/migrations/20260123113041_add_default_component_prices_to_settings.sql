/*
  # Add Default Component Prices to User Settings

  1. Changes
    - Add component price columns to `user_settings` table
    - These prices are currency-specific and adjust based on user's selected currency
    - Default values are in USD, users can customize for their currency

  2. New Columns
    - `default_solar_panel_price` (numeric) - Price per 400W solar panel
    - `default_battery_price` (numeric) - Price per 200Ah 12V battery
    - `default_inverter_per_kw_price` (numeric) - Price per kW of inverter
    - `default_charge_controller_price` (numeric) - Price per charge controller
    - `default_dc_breaker_price` (numeric) - Price per DC breaker
    - `default_ac_breaker_price` (numeric) - Price per AC breaker
    - `default_installation_percentage` (numeric) - Installation cost as percentage (0.2 = 20%)
*/

-- Add default component price columns
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_settings' AND column_name = 'default_solar_panel_price'
  ) THEN
    ALTER TABLE user_settings ADD COLUMN default_solar_panel_price numeric DEFAULT 180;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_settings' AND column_name = 'default_battery_price'
  ) THEN
    ALTER TABLE user_settings ADD COLUMN default_battery_price numeric DEFAULT 250;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_settings' AND column_name = 'default_inverter_per_kw_price'
  ) THEN
    ALTER TABLE user_settings ADD COLUMN default_inverter_per_kw_price numeric DEFAULT 250;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_settings' AND column_name = 'default_charge_controller_price'
  ) THEN
    ALTER TABLE user_settings ADD COLUMN default_charge_controller_price numeric DEFAULT 350;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_settings' AND column_name = 'default_dc_breaker_price'
  ) THEN
    ALTER TABLE user_settings ADD COLUMN default_dc_breaker_price numeric DEFAULT 25;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_settings' AND column_name = 'default_ac_breaker_price'
  ) THEN
    ALTER TABLE user_settings ADD COLUMN default_ac_breaker_price numeric DEFAULT 30;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_settings' AND column_name = 'default_installation_percentage'
  ) THEN
    ALTER TABLE user_settings ADD COLUMN default_installation_percentage numeric DEFAULT 0.2;
  END IF;
END $$;