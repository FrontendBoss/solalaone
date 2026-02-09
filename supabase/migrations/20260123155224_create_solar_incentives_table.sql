/*
  # Create Solar Incentives Table

  1. New Tables
    - `solar_incentives`
      - `id` (uuid, primary key)
      - `country` (text) - Country name
      - `state` (text) - State/province name
      - `federal_tax_credit` (numeric) - Federal tax credit percentage (e.g., 30 for 30%)
      - `state_tax_credit` (numeric) - State tax credit percentage
      - `state_rebate` (numeric) - State rebate amount in dollars
      - `srec_value` (numeric) - Solar Renewable Energy Certificate value per MWh
      - `net_metering` (boolean) - Whether net metering is available
      - `property_tax_exemption` (boolean) - Property tax exemption available
      - `sales_tax_exemption` (boolean) - Sales tax exemption available
      - `additional_incentives` (text) - Description of additional incentives
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `solar_incentives` table
    - Add policy for anyone to read incentive data (public data)
*/

CREATE TABLE IF NOT EXISTS solar_incentives (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  country text NOT NULL DEFAULT 'USA',
  state text NOT NULL,
  federal_tax_credit numeric DEFAULT 30,
  state_tax_credit numeric DEFAULT 0,
  state_rebate numeric DEFAULT 0,
  srec_value numeric DEFAULT 0,
  net_metering boolean DEFAULT true,
  property_tax_exemption boolean DEFAULT false,
  sales_tax_exemption boolean DEFAULT false,
  additional_incentives text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE solar_incentives ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read solar incentives"
  ON solar_incentives
  FOR SELECT
  TO public
  USING (true);

-- Insert sample data for US states
INSERT INTO solar_incentives (country, state, federal_tax_credit, state_tax_credit, state_rebate, srec_value, net_metering, property_tax_exemption, sales_tax_exemption, additional_incentives)
VALUES
  ('USA', 'California', 30, 0, 0, 0, true, true, true, 'SGIP battery rebate program, local utility rebates available'),
  ('USA', 'Texas', 30, 0, 0, 0, true, true, false, 'Local utility rebates may be available'),
  ('USA', 'Florida', 30, 0, 0, 0, true, true, true, 'Property tax exemption for residential renewable energy'),
  ('USA', 'New York', 30, 25, 0, 150, true, true, true, 'NY-Sun incentive program, Con Edison rebates'),
  ('USA', 'Massachusetts', 30, 15, 1000, 285, true, true, false, 'SMART program, MassSave rebates'),
  ('USA', 'New Jersey', 30, 0, 0, 220, true, true, true, 'SREC II program, local utility incentives'),
  ('USA', 'Arizona', 30, 25, 0, 0, true, true, false, 'APS and SRP solar incentive programs'),
  ('USA', 'Nevada', 30, 0, 0, 0, true, true, true, 'NV Energy Solar Rebate Program'),
  ('USA', 'Colorado', 30, 0, 0, 0, true, true, false, 'Xcel Energy Solar Rewards program'),
  ('USA', 'North Carolina', 30, 0, 0, 0, true, true, false, 'Duke Energy rebate programs available')
ON CONFLICT DO NOTHING;